import { IsString } from 'class-validator';

import { GameState, HandPosition, Player } from '../game.interface';

export class GuessObjectLocationDTO {
  @IsString()
  gameId: GameState['gameId'];

  @IsString()
  playerId: Player['playerId'];

  @IsString()
  hand: HandPosition;
}
