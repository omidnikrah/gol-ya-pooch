import { IsString } from 'class-validator';
import {
  CoinSide,
  GameState,
  TeamNames,
} from 'src/modules/game/game.interface';

export class CoinFlipDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  team: TeamNames;

  @IsString()
  coinSide: CoinSide;
}
