import { IsOptional, IsString } from 'class-validator';
import { GameState, TeamNames } from 'src/modules/game/game.interface';

export class JoinGameRoomDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  team: TeamNames;

  @IsString()
  @IsOptional()
  playerName?: string;
}
