export interface Player {
  playerId: string;
  name?: string;
}

export interface Team {
  members: Player[];
}

export interface GameState {
  gameId: string;
  teams: {
    teamA: Team;
    teamB: Team;
  };
}
