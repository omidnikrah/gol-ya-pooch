import type { GameSize } from '@gol-ya-pooch/shared';
import { IsIn } from 'class-validator';

export class CreateGameRoomDTO {
  @IsIn([2, 4, 6, 8], {
    message: 'gameSize must be one of the following values: 2, 4, 6, or 8',
  })
  gameSize: GameSize;
}
