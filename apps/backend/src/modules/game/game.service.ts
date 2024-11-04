import GameConfig from '@gol-ya-pooch/backend/config/game.config';
import type {
  CoinSide,
  GameSize,
  GameState,
  HandPosition,
  Player,
  TeamNames,
} from '@gol-ya-pooch/shared';
import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import Redis from 'ioredis';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class GameService {
  constructor(private readonly redisClient: Redis) {}

  async findRoomWithFewestRemainingPlayers(gameSize: GameSize): Promise<{
    room: GameState;
    teamName: TeamNames;
  }> {
    const gameKeys = await this.redisClient.keys('game:*');

    if (gameKeys.length === 0) return null;

    const pipeline = this.redisClient.multi();
    gameKeys.forEach((key) => pipeline.get(key));
    const gameStates = await pipeline.exec();

    let roomWithFewestRemainingPlayers = null;
    let teamWithSpace = null;
    let minRemainingPlayers = Infinity;

    gameStates.forEach(([error, roomData]: [never, string]) => {
      if (error) return;
      const room: GameState = JSON.parse(roomData);

      if (room.gameSize !== gameSize) return;

      const teamAPlayers = room.teams.teamA.members.length;
      const teamBPlayers = room.teams.teamB.members.length;
      const currentPlayers = teamAPlayers + teamBPlayers;
      const remainingPlayers = room.gameSize - currentPlayers;
      const maxTeamPlayers = gameSize / 2;

      if (remainingPlayers < minRemainingPlayers) {
        minRemainingPlayers = remainingPlayers;
        roomWithFewestRemainingPlayers = room;

        if (teamAPlayers < maxTeamPlayers) {
          teamWithSpace = 'teamA';
        } else if (teamBPlayers < maxTeamPlayers) {
          teamWithSpace = 'teamB';
        }
      }
    });

    if (roomWithFewestRemainingPlayers && teamWithSpace) {
      return {
        room: roomWithFewestRemainingPlayers,
        teamName: teamWithSpace,
      };
    }

    return null;
  }

  async createGameRoom(gameSize: GameSize): Promise<GameState> {
    const gameId = uuidV4();

    const initialState: GameState = {
      gameId,
      gameSize,
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
    gameSize: GameSize,
    playerName: Player['name'],
  ): Promise<{ gameState: GameState; playerData: Player }> {
    const gameData = await this.findRoomWithFewestRemainingPlayers(gameSize);
    let gameRoom: GameState;
    let teamName: TeamNames;

    if (gameData) {
      gameRoom = gameData.room;
      teamName = gameData.teamName;
    } else {
      gameRoom = await this.createGameRoom(gameSize);
      teamName = 'teamA';
    }

    const gameState = await this.getGameState(gameRoom.gameId);

    const team = gameState.teams[teamName];
    const maxTeamPlayers = gameSize / 2;

    if (team.members.length >= maxTeamPlayers) {
      throw new WsException(
        `${teamName} already has the maximum of ${maxTeamPlayers} members`,
      );
    }

    const newPlayer = this.generatePlayer(playerName);
    team.members.push(newPlayer);

    await this.redisClient.set(
      `game:${gameRoom.gameId}`,
      JSON.stringify(gameState),
    );

    return { gameState: gameState, playerData: newPlayer };
  }

  async joinGameRoomWithId(
    gameSize: GameSize,
    gameId: GameState['gameId'],
    teamName: TeamNames,
    playerName: Player['name'],
  ): Promise<{ gameState: GameState; playerData: Player }> {
    const gameState = await this.getGameState(gameId);
    const maxTeamPlayers = gameSize / 2;

    const team = gameState.teams[teamName];

    if (team.members.length >= maxTeamPlayers) {
      throw new WsException(
        `${teamName} already has the maximum of ${maxTeamPlayers} members`,
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
