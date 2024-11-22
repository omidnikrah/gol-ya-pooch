import type { GameState } from '@gol-ya-pooch/shared';
import { IsString } from 'class-validator';

export class CoinFlipDTO {
  @IsString()
  gameId: GameState['gameId'];
}
