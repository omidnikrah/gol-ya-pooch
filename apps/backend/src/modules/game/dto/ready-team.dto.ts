import { IsString } from 'class-validator';
import { GameState, TeamNames } from 'src/modules/game/game.interface';

export class ReadyTeamDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  team: TeamNames;
}
