import { IsString } from 'class-validator';

import { CoinSide, GameState, TeamNames } from '../game.interface';

export class CoinFlipDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  team: TeamNames;

  @IsString()
  coinSide: CoinSide;
}
