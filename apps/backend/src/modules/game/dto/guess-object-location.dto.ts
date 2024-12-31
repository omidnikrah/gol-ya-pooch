import type { GameState, HandPosition, Player } from '@gol-ya-pooch/shared';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GuessObjectLocationDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  playerId: Player['id'];

  @IsString()
  hand: HandPosition;

  @IsBoolean()
  @IsOptional()
  isFromEmptyHand?: boolean;
}
