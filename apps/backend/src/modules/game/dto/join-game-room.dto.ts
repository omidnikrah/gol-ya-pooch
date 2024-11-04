import { GameSize, gameSize, GameState, TeamNames } from '@gol-ya-pooch/shared';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class JoinGameRoomDTO {
  @IsIn(gameSize, {
    message: `gameSize must be one of the following values: ${gameSize.join(',')}`,
  })
  gameSize: GameSize;

  @IsString()
  @IsOptional()
  gameId?: GameState['gameId'];

  @IsString()
  @IsOptional()
  team?: TeamNames;

  @IsString()
  @IsOptional()
  playerName?: string;
}
