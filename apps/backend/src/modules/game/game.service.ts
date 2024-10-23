import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class GameService {
  constructor(private readonly redisClient: Redis) {}

  async createGame(gameId: string) {
    const initialState = {};

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(initialState));

    return initialState;
  }

  async getGame(gameId: string) {
    const game = await this.redisClient.get(`game:${gameId}`);
    return game ? JSON.parse(game) : null;
  }
}
