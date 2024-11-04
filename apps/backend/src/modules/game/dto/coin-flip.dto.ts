import type { CoinSide, GameState, TeamNames } from '@gol-ya-pooch/shared';
import { IsString } from 'class-validator';

export class CoinFlipDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  team: TeamNames;

  @IsString()
  coinSide: CoinSide;
}
