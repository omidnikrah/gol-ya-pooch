import { gameSize } from '../constants';

export type HandPosition = 'left' | 'right';
export type TeamNames = 'teamA' | 'teamB';
export type CoinSide = 'Head' | 'Tail';

export interface Player {
  id: string;
  name?: string;
}

export interface Team {
  isReady: boolean;
  members: Player[];
}

type Teams = Record<TeamNames, Team>;
type Scores = Record<TeamNames, number>;
export type GameSize = (typeof gameSize)[number];

export interface GameState {
  gameId: string;
  gameSize: GameSize;
  currentTurn: TeamNames;
  objectLocation: {
    hand: HandPosition;
    playerId: Player['id'];
  };
  round: number;
  scores: Scores;
  teams: Teams;
}
