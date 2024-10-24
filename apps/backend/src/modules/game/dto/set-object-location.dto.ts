import { IsString } from 'class-validator';
import {
  GameState,
  HandPosition,
  Player,
} from 'src/modules/game/game.interface';

export class SetObjectLocationDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  playerId: Player['playerId'];

  @IsString()
  hand: HandPosition;
}
