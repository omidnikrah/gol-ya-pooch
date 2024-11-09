import { GameState } from '@gol-ya-pooch/shared';
import { IsOptional, IsString } from 'class-validator';

export class GetRoomInfoDTO {
  @IsString()
  @IsOptional()
  gameId?: GameState['gameId'];
}
