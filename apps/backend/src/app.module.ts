import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './modules/game/game.module';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    GameModule,
    RedisModule.forRoot({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
      password: process.env.REDIS_PASSWORD,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
