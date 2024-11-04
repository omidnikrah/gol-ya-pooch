import type { GameState, TeamNames } from '@gol-ya-pooch/shared';
import { IsString } from 'class-validator';

export class ReadyTeamDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  team: TeamNames;
}
