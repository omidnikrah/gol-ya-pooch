import type { GameState, TeamNames } from '@gol-ya-pooch/shared';
import { IsOptional, IsString } from 'class-validator';

export class JoinGameRoomDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  team: TeamNames;

  @IsString()
  @IsOptional()
  playerName?: string;
}
