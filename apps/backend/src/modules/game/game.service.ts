import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import Redis from 'ioredis';
import GameConfig from 'src/config/game.config';
import { v4 as uuidV4 } from 'uuid';

import {
  CoinSide,
  GameState,
  HandPosition,
  Player,
  TeamNames,
} from './game.interface';

@Injectable()
export class GameService {
  constructor(private readonly redisClient: Redis) {}

  async createGameRoom(gameId: GameState['gameId']): Promise<GameState> {
    const initialState: GameState = {
      gameId,
      currentTurn: null,
      objectLocation: null,
      round: 1,
      scores: {
        teamA: 0,
        teamB: 0,
      },
      teams: {
        teamA: { isReady: false, members: [] },
        teamB: { isReady: false, members: [] },
      },
    };

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(initialState));

    await this.redisClient.sadd('gameRooms', gameId);

    return initialState;
  }

  async joinGameRoom(
    gameId: GameState['gameId'],
    teamName: TeamNames,
    playerName: Player['name'],
  ): Promise<{ gameState: GameState; playerData: Player }> {
    const gameState = await this.getGameState(gameId);

    const team = gameState.teams[teamName];

    if (team.members.length >= GameConfig.maxTeamMembers) {
      throw new WsException(
        `${teamName} already has the maximum of ${GameConfig.maxTeamMembers} members`,
      );
    }

    const newPlayer = this.generatePlayer(playerName);
    team.members.push(newPlayer);

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));

    return { gameState: gameState, playerData: newPlayer };
  }

  async readyTeam(
    gameId: GameState['gameId'],
    teamName: TeamNames,
  ): Promise<GameState> {
    const gameState = await this.getGameState(gameId);

    gameState.teams[teamName].isReady = true;

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));

    return gameState;
  }

  async chooseStarterTeam(
    gameId: GameState['gameId'],
    teamName: TeamNames,
    coinSide: CoinSide,
  ): Promise<GameState> {
    await this.areTeamsReady(gameId);

    const gameState = await this.getGameState(gameId);

    if (gameState.currentTurn) {
      throw new WsException(
        'The starting turn for this team has already been assigned.',
      );
    }

    const coinResult = Math.random() < 0.5 ? 'Head' : 'Tail';

    if (coinResult === coinSide) {
      gameState.currentTurn = teamName;
    } else {
      gameState.currentTurn = teamName === 'teamA' ? 'teamB' : 'teamA';
    }

    const teamMembers = gameState.teams[gameState.currentTurn].members;

    gameState.objectLocation = {
      hand: 'left',
      playerId:
        teamMembers[
          Math.round(teamMembers.length === 1 ? 0 : teamMembers.length / 2)
        ].playerId,
    };

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));

    return gameState;
  }

  async changeObjectLocation(
    gameId: GameState['gameId'],
    playerId: Player['playerId'],
    hand: HandPosition,
  ): Promise<GameState> {
    await this.areTeamsReady(gameId);

    const gameState = await this.getGameState(gameId);

    gameState.objectLocation = {
      hand,
      playerId,
    };

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));

    return gameState;
  }

  async guessObjectLocation(
    gameId: GameState['gameId'],
    playerId: Player['playerId'],
    hand: HandPosition,
  ): Promise<{ gameState: GameState; isGameFinished: boolean }> {
    await this.areTeamsReady(gameId);

    const gameState = await this.getGameState(gameId);
    let isGameFinished = false;
    const isGuessCorrect =
      playerId === gameState.objectLocation.playerId &&
      hand === gameState.objectLocation.hand;

    if (!isGuessCorrect) {
      gameState.scores[gameState.currentTurn] += 1;
      if (gameState.scores[gameState.currentTurn] >= GameConfig.maxScores) {
        isGameFinished = true;
      }
    } else {
      gameState.currentTurn =
        gameState.currentTurn === 'teamA' ? 'teamB' : 'teamA';

      const teamMembers = gameState.teams[gameState.currentTurn].members;

      gameState.objectLocation = {
        hand: 'left',
        playerId:
          teamMembers[
            Math.round(teamMembers.length === 1 ? 0 : teamMembers.length / 2)
          ].playerId,
      };
    }

    gameState.round += 1;

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));

    return { gameState, isGameFinished };
  }

  async getAllGameRooms(): Promise<Record<string, GameState>> {
    const gameRoomIds = await this.redisClient.smembers('gameRooms');
    const gameRoomKeys = gameRoomIds.map((id) => `game:${id}`);
    const gameStates = await this.redisClient.mget(...gameRoomKeys);
    const gameRoomsWithValues: Record<string, GameState> = {};

    gameRoomIds.forEach((id, index) => {
      gameRoomsWithValues[id] = JSON.parse(gameStates[index]);
    });

    return gameRoomsWithValues;
  }

  async areTeamsReady(gameId: GameState['gameId']) {
    const gameState = await this.getGameState(gameId);

    const areReady =
      gameState.teams.teamA.isReady && gameState.teams.teamB.isReady;

    if (!areReady) throw new WsException('Teams are not ready!');

    return;
  }

  async getGameState(gameId: GameState['gameId']): Promise<GameState> {
    const gameData = await this.redisClient.get(`game:${gameId}`);
    if (!gameData) {
      throw new WsException('Game not found');
    }

    return JSON.parse(gameData);
  }

  generatePlayer(playerName: Player['name']) {
    return {
      playerId: uuidV4(),
      name: playerName,
    };
  }
}
