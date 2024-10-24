import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import Redis from 'ioredis';
import GameConfig from 'src/config/game.config';
import {
  GameState,
  HandPosition,
  Player,
  TeamNames,
} from 'src/modules/game/game.interface';

@Injectable()
export class GameService {
  constructor(private readonly redisClient: Redis) {}

  async createGameRoom(gameId: GameState['gameId']): Promise<GameState> {
    const initialState: GameState = {
      gameId,
      currentTurn: 'teamA',
      objectLocation: null,
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
    player: Player,
  ): Promise<GameState | null> {
    const gameData = await this.redisClient.get(`game:${gameId}`);
    if (!gameData) {
      throw new WsException('Game not found');
    }

    const gameState: GameState = JSON.parse(gameData);
    const team = gameState.teams[teamName];

    if (team.members.length >= GameConfig.maxTeamMembers) {
      throw new WsException(
        `${teamName} already has the maximum of ${GameConfig.maxTeamMembers} members`,
      );
    }

    if (team.members.length === 0 && teamName === gameState.currentTurn) {
      gameState.objectLocation = {
        hand: 'left',
        playerId: player.playerId,
      };
    }

    team.members.push(player);

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));

    return gameState;
  }

  async readyTeam(
    gameId: GameState['gameId'],
    teamName: TeamNames,
  ): Promise<GameState> {
    const gameData = await this.redisClient.get(`game:${gameId}`);
    if (!gameData) {
      throw new WsException('Game not found');
    }

    const gameState: GameState = JSON.parse(gameData);

    gameState.teams[teamName].isReady = true;

    return gameState;
  }

  async setObjectLocation(
    gameId: GameState['gameId'],
    playerId: Player['playerId'],
    hand: HandPosition,
  ): Promise<GameState> {
    const gameData = await this.redisClient.get(`game:${gameId}`);
    if (!gameData) {
      throw new WsException('Game not found');
    }

    const gameState: GameState = JSON.parse(gameData);

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
  ): Promise<boolean> {
    const gameData = await this.redisClient.get(`game:${gameId}`);
    if (!gameData) {
      throw new WsException('Game not found');
    }

    const gameState: GameState = JSON.parse(gameData);

    return (
      playerId === gameState.objectLocation.playerId &&
      hand === gameState.objectLocation.hand
    );
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

  async getGame(gameId: GameState['gameId']) {
    const game = await this.redisClient.get(`game:${gameId}`);
    return game ? JSON.parse(game) : null;
  }
}
