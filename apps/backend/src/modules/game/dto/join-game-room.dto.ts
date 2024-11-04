import type { GameState, TeamNames } from '@gol-ya-pooch/shared';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class JoinGameRoomDTO {
  @IsIn([2, 4, 6, 8], {
    message: 'gameSize must be one of the following values: 2, 4, 6, or 8',
  })
  gameSize: GameState['gameSize'];

  @IsString()
  @IsOptional()
  gameId?: GameState['gameId'];

  @IsString()
  @IsOptional()
  team?: TeamNames;

  @IsString()
  @IsOptional()
  playerName?: string;
}
