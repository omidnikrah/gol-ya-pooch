import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { GameState, Player } from 'src/modules/game/game.interface';
import GameConfig from 'src/config/game.config';

@Injectable()
export class GameService {
  constructor(private readonly redisClient: Redis) {}

  async createGameRoom(gameId: string): Promise<GameState> {
    const initialState: GameState = {
      gameId,
      teams: {
        teamA: { members: [] },
        teamB: { members: [] },
      },
    };

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(initialState));

    await this.redisClient.sadd('gameRooms', gameId);

    console.log(JSON.stringify(await this.getAllGameRooms(), null, 2));

    return initialState;
  }

  async joinGameRoom(
    gameId: string,
    teamName: 'teamA' | 'teamB',
    player: Player,
  ): Promise<GameState | null> {
    const gameData = await this.redisClient.get(`game:${gameId}`);
    if (!gameData) {
      throw new Error('Game not found');
    }

    const gameState: GameState = JSON.parse(gameData);
    const team = gameState.teams[teamName];

    if (team.members.length >= GameConfig.maxTeamMembers) {
      throw new Error(
        `${teamName} already has the maximum of ${GameConfig.maxTeamMembers} members`,
      );
    }

    team.members.push(player);
    await this.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));

    console.log(JSON.stringify(await this.getAllGameRooms(), null, 2));

    return gameState;
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

  async getGame(gameId: string) {
    const game = await this.redisClient.get(`game:${gameId}`);
    return game ? JSON.parse(game) : null;
  }
}
