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
import { Cron } from '@nestjs/schedule';
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
      gameMaster: null,
      currentTurn: null,
      objectLocation: null,
      round: 1,
      emptyPlays: gameSize / 2,
      scores: {
        teamA: 0,
        teamB: 0,
      },
      teams: {
        teamA: { members: [] },
        teamB: { members: [] },
      },
      lastActivity: Date.now(),
    };

    await this.updateGameStateOnRedis(gameId, initialState);

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
    await this.updateGameStateOnRedis(gameRoom.gameId, gameState);

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

    await this.redisClient.set(`player:${playerId}`, gameId);
    await this.updateGameStateOnRedis(gameId, gameState);

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

    await this.updateGameStateOnRedis(gameId, gameState);

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
    const objectHolderId =
      teamMembers[teamMembers.length === 1 ? 0 : teamMembers.length % 2].id;

    gameState.gameMaster = objectHolderId;

    gameState.objectLocation = {
      hand: this.getHandPosition(),
      playerId: objectHolderId,
    };

    await this.updateGameStateOnRedis(gameId, gameState);

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

    await this.updateGameStateOnRedis(gameId, gameState);

    return {
      gameState: this.serializeGameState(gameState),
      objectLocation: gameState.objectLocation,
    };
  }

  async emptyPlayerHand(
    gameId: GameState['gameId'],
    playerId: Player['id'],
    hand: HandPosition | 'both',
  ): Promise<{
    hasObjectInHand: boolean;
    objectLocation: IObjectLocation;
  }> {
    const gameState = await this.getGameState(gameId);

    const hasObjectInHand =
      gameState.objectLocation.playerId === playerId &&
      (hand === 'both' || gameState.objectLocation.hand === hand);

    if (hasObjectInHand) {
      return {
        objectLocation: gameState.objectLocation,
        hasObjectInHand: true,
      };
    }

    return {
      objectLocation: null,
      hasObjectInHand: false,
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
    oldObjectLocation: IObjectLocation;
    newObjectLocation: IObjectLocation;
  }> {
    await this.areTeamsReady(gameId);

    const gameState = await this.getGameState(gameId);
    const isGuessCorrect =
      playerId === gameState.objectLocation.playerId &&
      hand === gameState.objectLocation.hand;
    let isGameFinished = false;
    const oldObjectLocation = gameState.objectLocation;

    if (isGuessCorrect) {
      gameState.currentTurn =
        gameState.currentTurn === 'teamA' ? 'teamB' : 'teamA';
    }

    gameState.scores[gameState.currentTurn] += 1;

    if (gameState.scores[gameState.currentTurn] >= GameConfig.maxScores) {
      isGameFinished = true;
    }

    const teamMembers = gameState.teams[gameState.currentTurn].members;
    const objectHolderId =
      teamMembers[teamMembers.length === 1 ? 0 : teamMembers.length % 2].id;

    gameState.objectLocation = {
      hand: this.getHandPosition(),
      playerId: objectHolderId,
    };

    gameState.gameMaster = objectHolderId;

    gameState.round += 1;

    gameState.emptyPlays = gameState.gameSize / 2;

    await this.updateGameStateOnRedis(gameId, gameState);

    return {
      gameState: this.serializeGameState(gameState),
      newObjectLocation: gameState.objectLocation,
      oldObjectLocation,
      isGameFinished,
      isGuessCorrect,
    };
  }

  async validateEmptyPlay(gameId: GameState['gameId']): Promise<boolean> {
    const gameState = await this.getGameState(gameId);

    if (gameState.emptyPlays === 0) return false;

    gameState.emptyPlays--;

    await this.updateGameStateOnRedis(gameId, gameState);

    return true;
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
      await this.updateGameStateOnRedis(gameId, gameState);
      await this.redisClient.del(`player:${playerId}`);
    }

    return isPlayerRemoved ? this.serializeGameState(gameState) : null;
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

  private generatePlayer(playerName: Player['name'], playerId: Player['id']) {
    return {
      id: playerId,
      name: playerName,
      isReady: false,
    };
  }

  @Cron('0 */4 * * *')
  async removeInActiveRooms() {
    const now = Date.now();
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

    const gameKeys = await this.redisClient.keys('game:*');

    if (gameKeys.length === 0) return;

    const pipeline = this.redisClient.multi();
    gameKeys.forEach((key) => pipeline.get(key));
    const gameStates = await pipeline.exec();

    const inactiveRoomKeys = [];
    const inactivePlayerKeys = [];

    for (const [err, roomData] of gameStates) {
      if (err || !roomData) continue;

      const gameState: GameState = JSON.parse(roomData as string);
      if (now - gameState.lastActivity > INACTIVITY_LIMIT) {
        inactiveRoomKeys.push(`game:${gameState.gameId}`);

        const teamAPlayerKeys = gameState.teams.teamA.members.map(
          (player) => `player:${player.id}`,
        );
        const teamBPlayerKeys = gameState.teams.teamB.members.map(
          (player) => `player:${player.id}`,
        );

        inactivePlayerKeys.push(...teamAPlayerKeys, ...teamBPlayerKeys);
      }
    }

    if (inactiveRoomKeys.length > 0) {
      const deletePipeline = this.redisClient.pipeline();
      deletePipeline.del(...inactiveRoomKeys);
      if (inactivePlayerKeys.length > 0) {
        deletePipeline.del(...inactivePlayerKeys);
      }
      await deletePipeline.exec();

      inactiveRoomKeys.forEach((key) =>
        console.log(`Deleted inactive game room: ${key}`),
      );
    }
  }

  private async updateGameStateOnRedis(
    gameId: GameState['gameId'],
    gameState: GameState,
  ) {
    gameState.lastActivity = Date.now();

    await this.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));
  }

  private serializeGameState(gameState: GameState): PublicGameState {
    const clonedGameState = { ...gameState };

    delete clonedGameState.objectLocation;

    return clonedGameState;
  }

  private getHandPosition(): HandPosition {
    return Math.random() < 0.5 ? 'left' : 'right';
  }
}
