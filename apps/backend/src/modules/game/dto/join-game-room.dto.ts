import { IsObject, IsString } from 'class-validator';
import { GameState, Player, TeamNames } from 'src/modules/game/game.interface';

export class JoinGameRoomDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  team: TeamNames;

  @IsObject()
  player: Player;
}
