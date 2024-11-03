import { IsIn } from 'class-validator';

import { GameState } from '../game.interface';

export class CreateGameRoomDTO {
  @IsIn([2, 4, 6, 8], {
    message: 'gameSize must be one of the following values: 2, 4, 6, or 8',
  })
  gameSize: GameState['gameSize'];
}
