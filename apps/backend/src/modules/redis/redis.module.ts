import {
  Module,
  Global,
  DynamicModule,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

@Global()
@Module({})
export class RedisModule implements OnApplicationShutdown {
  private static redisClient: Redis;

  static forRoot(options: RedisOptions): DynamicModule {
    const redisProvider = {
      provide: Redis,
      useFactory: () => {
        const client = new Redis(options);
        this.handleClientEvents(client);
        this.redisClient = client;
        return client;
      },
    };

    return {
      module: RedisModule,
      providers: [redisProvider],
      exports: [Redis],
    };
  }

  private static handleClientEvents(client: Redis) {
    client.on('error', (err) => console.error('Redis error:', err));
    client.on('connect', () => console.log('Connected to Redis'));
    client.on('close', () => console.log('Redis connection closed'));
  }

  async onApplicationShutdown() {
    if (RedisModule.redisClient) {
      await RedisModule.redisClient.quit();
      console.log('Redis client disconnected on application shutdown');
    }
  }
}
