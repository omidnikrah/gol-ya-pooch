import GameConfig from '@gol-ya-pooch/backend/config/game.config';
import {
  GameSize,
  GameState,
  HandPosition,
  IObjectLocation,
  Player,
  PublicGameState,
  TeamNames,
} from '@gol-ya-pooch/shared';
import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import Redis from 'ioredis';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class GameService {
  constructor(private readonly redisClient: Redis) {}

  async findRoomWithFewestRemainingPlayers(gameSize: GameSize): Promise<{
    room: GameState;
    teamName: TeamNames;
  }> {
    const gameKeys = await this.redisClient.keys('game:*');

    if (gameKeys.length === 0) return null;

    const pipeline = this.redisClient.multi();
    gameKeys.forEach((key) => pipeline.get(key));
    const gameStates = await pipeline.exec();

    let roomWithFewestRemainingPlayers = null;
    let teamWithSpace = null;
    let minRemainingPlayers = Infinity;

    for (const [error, roomData] of gameStates) {
      if (error) continue;

      const room: GameState = JSON.parse(roomData as string);

      if (room.gameSize !== gameSize) continue;
      if (room.currentTurn) continue; // Which means the game has started

      const teamAPlayers = room.teams.teamA.members.length;
      const teamBPlayers = room.teams.teamB.members.length;
      const currentPlayers = teamAPlayers + teamBPlayers;
      const remainingPlayers = room.gameSize - currentPlayers;
      const maxTeamPlayers = gameSize / 2;

      if (remainingPlayers < minRemainingPlayers) {
        minRemainingPlayers = remainingPlayers;
        roomWithFewestRemainingPlayers = room;

        if (teamAPlayers < maxTeamPlayers) {
          teamWithSpace = 'teamA';
          break;
        } else if (teamBPlayers < maxTeamPlayers) {
          teamWithSpace = 'teamB';
          break;
        }
      }
    }

    if (roomWithFewestRemainingPlayers && teamWithSpace) {
      return {
        room: roomWithFewestRemainingPlayers,
        teamName: teamWithSpace,
      };
    }

    return null;
  }

  async createGameRoom(gameSize: GameSize): Promise<PublicGameState> {
    const gameId = uuidV4();

    const initialState: GameState = {
      gameId,
      gameSize,
      currentTurn: null,
      objectLocation: null,
      round: 1,
      scores: {
        teamA: 0,
        teamB: 0,
      },
      teams: {
        teamA: { members: [] },
        teamB: { members: [] },
      },
    };

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(initialState));

    await this.redisClient.sadd('gameRooms', gameId);

    return this.serializeGameState(initialState);
  }

  async joinGameRoom(
    gameSize: GameSize,
    playerName: Player['name'],
    playerId: Player['id'],
  ): Promise<{
    gameState: PublicGameState;
    playerData: Player & { team: TeamNames };
  }> {
    const gameData = await this.findRoomWithFewestRemainingPlayers(gameSize);
    let gameRoom: PublicGameState;
    let teamName: TeamNames;

    if (gameData) {
      gameRoom = gameData.room;
      teamName = gameData.teamName;
    } else {
      gameRoom = await this.createGameRoom(gameSize);
      teamName = 'teamA';
    }

    const gameState = await this.getGameState(gameRoom.gameId);

    const team = gameState.teams[teamName];
    const maxTeamPlayers = gameSize / 2;

    if (team.members.length >= maxTeamPlayers) {
      throw new WsException(
        `${teamName} already has the maximum of ${maxTeamPlayers} members`,
      );
    }

    const newPlayer = this.generatePlayer(playerName, playerId);
    team.members.push(newPlayer);

    await this.redisClient.set(`player:${playerId}`, gameRoom.gameId);
    await this.redisClient.set(
      `game:${gameRoom.gameId}`,
      JSON.stringify(gameState),
    );

    return {
      gameState: this.serializeGameState(gameState),
      playerData: { ...newPlayer, team: teamName },
    };
  }

  async joinGameRoomWithId(
    gameSize: GameSize,
    gameId: GameState['gameId'],
    teamName: TeamNames,
    playerName: Player['name'],
    playerId: Player['id'],
  ): Promise<{
    gameState: PublicGameState;
    playerData: Player & { team: TeamNames };
  }> {
    const gameState = await this.getGameState(gameId);
    const maxTeamPlayers = gameSize / 2;

    const team = gameState.teams[teamName];

    if (team.members.length >= maxTeamPlayers) {
      throw new WsException(
        `${teamName} already has the maximum of ${maxTeamPlayers} members`,
      );
    }

    const newPlayer = this.generatePlayer(playerName, playerId);
    team.members.push(newPlayer);

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));

    return {
      gameState: this.serializeGameState(gameState),
      playerData: { ...newPlayer, team: teamName },
    };
  }

  async readyPlayer(
    gameId: GameState['gameId'],
    playerId: Player['id'],
    teamName: TeamNames,
  ): Promise<{
    gameState: PublicGameState;
    playerData: Player;
  }> {
    const gameState = await this.getGameState(gameId);

    const player = gameState.teams[teamName].members.find(
      (member) => member.id === playerId,
    );
    if (!player) {
      throw new Error(`Player ${playerId} not found in team ${teamName}`);
    }

    player.isReady = true;

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));

    return {
      gameState: this.serializeGameState(gameState),
      playerData: player,
    };
  }

  async chooseStarterTeam(gameId: GameState['gameId']): Promise<{
    gameState: PublicGameState;
    objectLocation: IObjectLocation;
  }> {
    await this.areTeamsReady(gameId);

    const gameState = await this.getGameState(gameId);

    if (gameState.currentTurn) {
      throw new WsException(
        'The starting turn for this team has already been assigned.',
      );
    }

    gameState.currentTurn = Math.random() < 0.5 ? 'teamA' : 'teamB';

    const teamMembers = gameState.teams[gameState.currentTurn].members;

    gameState.objectLocation = {
      hand: 'left',
      playerId:
        teamMembers[
          Math.round(teamMembers.length === 1 ? 0 : teamMembers.length / 2)
        ].id,
    };

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));

    return {
      gameState: this.serializeGameState(gameState),
      objectLocation: gameState.objectLocation,
    };
  }

  async changeObjectLocation(
    gameId: GameState['gameId'],
    playerId: Player['id'],
    hand: HandPosition,
  ): Promise<{
    gameState: PublicGameState;
    objectLocation: IObjectLocation;
  }> {
    await this.areTeamsReady(gameId);

    const gameState = await this.getGameState(gameId);

    gameState.objectLocation = {
      hand,
      playerId,
    };

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));

    return {
      gameState: this.serializeGameState(gameState),
      objectLocation: gameState.objectLocation,
    };
  }

  async guessObjectLocation(
    gameId: GameState['gameId'],
    playerId: Player['id'],
    hand: HandPosition,
  ): Promise<{
    gameState: PublicGameState;
    isGameFinished: boolean;
    isGuessCorrect: boolean;
    objectLocation: IObjectLocation;
  }> {
    await this.areTeamsReady(gameId);

    const gameState = await this.getGameState(gameId);
    let isGameFinished = false;
    const isGuessCorrect =
      playerId === gameState.objectLocation.playerId &&
      hand === gameState.objectLocation.hand;

    if (isGuessCorrect) {
      gameState.currentTurn =
        gameState.currentTurn === 'teamA' ? 'teamB' : 'teamA';
    }

    gameState.scores[gameState.currentTurn] += 1;

    if (gameState.scores[gameState.currentTurn] >= GameConfig.maxScores) {
      isGameFinished = true;
    }

    const teamMembers = gameState.teams[gameState.currentTurn].members;

    gameState.objectLocation = {
      hand: 'left',
      playerId:
        teamMembers[
          Math.round(teamMembers.length === 1 ? 0 : teamMembers.length / 2)
        ].id,
    };

    gameState.round += 1;

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));

    return {
      gameState: this.serializeGameState(gameState),
      objectLocation: gameState.objectLocation,
      isGameFinished,
      isGuessCorrect,
    };
  }

  async getRoomInfo(gameId: GameState['gameId']): Promise<PublicGameState> {
    const gameState = await this.getGameState(gameId);

    return this.serializeGameState(gameState);
  }

  async removePlayerFromGame(playerId: Player['id']): Promise<PublicGameState> {
    const gameId = await this.redisClient.get(`player:${playerId}`);
    if (!gameId) return null;

    const gameState = await this.getGameState(gameId);

    let isPlayerRemoved = false;

    for (const teamName of Object.keys(gameState.teams)) {
      const team = gameState.teams[teamName];
      const playerIndex = team.members.findIndex(
        (player: Player) => player.id === playerId,
      );

      if (playerIndex !== -1) {
        team.members.splice(playerIndex, 1);
        isPlayerRemoved = true;
        break;
      }
    }

    if (isPlayerRemoved) {
      await this.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));
      await this.redisClient.del(`player:${playerId}`);
    }

    return isPlayerRemoved ? this.serializeGameState(gameState) : null;
  }

  async getAllGameRooms(): Promise<Record<string, GameState>> {
    const gameRoomIds = await this.redisClient.smembers('gameRooms');
    const gameRoomKeys = gameRoomIds.map((id) => `game:${id}`);
    const gameStates = await this.redisClient.mget(...gameRoomKeys);
    const gameRoomsWithValues: Record<string, GameState> = {};

    gameRoomIds.forEach((id, index) => {
      gameRoomsWithValues[id] = JSON.parse(gameStates[index]);
    });

    return gameRoomsWithValues;
  }

  async areTeamsReady(gameId: GameState['gameId']) {
    const gameState = await this.getGameState(gameId);

    const isTeamAReady = gameState.teams.teamA.members.every(
      (player) => player.isReady,
    );
    const isTeamBReady = gameState.teams.teamA.members.every(
      (player) => player.isReady,
    );

    const areReady = isTeamAReady && isTeamBReady;

    if (!areReady) throw new WsException('Teams are not ready!');

    return;
  }

  async getGameState(gameId: GameState['gameId']): Promise<GameState> {
    const gameData = await this.redisClient.get(`game:${gameId}`);
    if (!gameData) {
      throw new WsException({
        type: 'game_not_found',
        message: 'game does not exist',
      });
    }

    return JSON.parse(gameData);
  }

  generatePlayer(playerName: Player['name'], playerId: Player['id']) {
    return {
      id: playerId,
      name: playerName,
      isReady: false,
    };
  }

  private serializeGameState(gameState: GameState): PublicGameState {
    const clonedGameState = { ...gameState };

    delete clonedGameState.objectLocation;

    return clonedGameState;
  }
}
