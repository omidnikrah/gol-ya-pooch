import { IsOptional, IsString } from 'class-validator';

import { GameState, TeamNames } from '../game.interface';

export class JoinGameRoomDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  team: TeamNames;

  @IsString()
  @IsOptional()
  playerName?: string;
}
