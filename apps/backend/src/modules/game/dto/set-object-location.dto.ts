import type { GameState, HandPosition, Player } from '@gol-ya-pooch/shared';
import { IsString } from 'class-validator';

export class SetObjectLocationDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  playerId: Player['playerId'];

  @IsString()
  hand: HandPosition;
}
