export interface Player {
  playerId: string;
  name?: string;
}

export interface Team {
  members: Player[];
}

export type HandPosition = 'left' | 'right';
export type TeamNames = 'teamA' | 'teamB';

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
