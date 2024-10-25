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

export interface GameState {
  gameId: string;
  currentTurn: TeamNames;
  objectLocation: {
    hand: HandPosition;
    playerId: Player['playerId'];
  };
  teams: Teams;
}
