export type HandPosition = 'left' | 'right';
export type TeamNames = 'teamA' | 'teamB';
export type CoinSide = 'Head' | 'Tail';

export interface Player {
  playerId: string;
  name?: string;
}

export interface Team {
  isReady: boolean;
  members: Player[];
}

type Teams = Record<TeamNames, Team>;
type Scores = Record<TeamNames, number>;

export interface GameState {
  gameId: string;
  gameSize: 2 | 4 | 6 | 8;
  currentTurn: TeamNames;
  objectLocation: {
    hand: HandPosition;
    playerId: Player['playerId'];
  };
  round: number;
  scores: Scores;
  teams: Teams;
}
