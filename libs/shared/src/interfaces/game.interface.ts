import { gameSize } from '../constants';

export type HandPosition = 'left' | 'right';
export type TeamNames = 'teamA' | 'teamB';
export type CoinSide = 'Head' | 'Tail';

export interface Player {
  id: string;
  name?: string;
  isReady: boolean;
}

export interface PrivatePlayerData extends Player {
  team: TeamNames;
  objectLocation?: IObjectLocation;
}

export interface Team {
  members: Player[];
}

type Teams = Record<TeamNames, Team>;
type Scores = Record<TeamNames, number>;
export type GameSize = (typeof gameSize)[number];

export interface IObjectLocation {
  hand: HandPosition;
  playerId: Player['id'];
}

export interface GameState {
  gameId: string;
  gameSize: GameSize;
  gameMaster: Player['id'];
  currentTurn: TeamNames;
  objectLocation: IObjectLocation;
  round: number;
  emptyPlays: number;
  scores: Scores;
  teams: Teams;
}

export type PublicGameState = Omit<GameState, 'objectLocation'>;

export interface FinishGamePayload {
  winnerTeam: TeamNames;
  finalScores: Scores;
  roundsPlayed: number;
}

export interface PlayerFillHand {
  fromPlayerId: Player['id'];
  toPlayerId: Player['id'];
  direction: HandPosition;
}
