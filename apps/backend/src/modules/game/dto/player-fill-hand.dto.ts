import type { GameState, HandPosition, Player } from '@gol-ya-pooch/shared';
import { IsString } from 'class-validator';

export class PlayerFillHandDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  fromPlayerId: Player['id'];

  @IsString()
  toPlayerId: Player['id'];

  @IsString()
  direction: HandPosition;
}
