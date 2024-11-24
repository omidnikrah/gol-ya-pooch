import type { GameState, Player } from '@gol-ya-pooch/shared';
import { IsString } from 'class-validator';

export class PlayerPlayingDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  playerId: Player['id'];
}
