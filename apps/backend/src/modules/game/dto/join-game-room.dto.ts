import { IsObject, IsString } from 'class-validator';
import { Player } from 'src/modules/game/game.interface';

export class JoinGameRoomDTO {
  @IsString()
  gameId: string;

  @IsString()
  team: 'teamA' | 'teamB';

  @IsObject()
  player: Player;
}
