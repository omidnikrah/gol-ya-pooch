import { WsValidationExceptionFilter } from '@gol-ya-pooch/backend/common/filters/ws-exception.filter';
import { GetRoomInfoDTO } from '@gol-ya-pooch/backend/modules/game/dto/get-room-info.dto';
import { PlayerEmptyHandDTO } from '@gol-ya-pooch/backend/modules/game/dto/player-empty-hand.dto';
import { PlayerFillHandDTO } from '@gol-ya-pooch/backend/modules/game/dto/player-fill-hand.dto';
import { PlayerPlayingDTO } from '@gol-ya-pooch/backend/modules/game/dto/player-playing.dto';
import { RequestEmptyPlayDTO } from '@gol-ya-pooch/backend/modules/game/dto/request-empty-play.dto';
import {
  Events,
  FinishGamePayload,
  Player,
  PublicGameState,
} from '@gol-ya-pooch/shared';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { CoinFlipDTO } from './dto/coin-flip.dto';
import { CreateGameRoomDTO } from './dto/create-game-room.dto';
import { GuessObjectLocationDTO } from './dto/guess-object-location.dto';
import { JoinGameRoomDTO } from './dto/join-game-room.dto';
import { ReadyTeamDTO } from './dto/ready-team.dto';
import { SetObjectLocationDTO } from './dto/set-object-location.dto';
import { GameService } from './game.service';

@UsePipes(new ValidationPipe())
@UseFilters(new WsValidationExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly gameService: GameService) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const gameState = await this.gameService.removePlayerFromGame(client.id);

    if (gameState) {
      this.server.to(gameState.gameId).emit(Events.PLAYER_LEFT, {
        playerId: client.id,
        gameState,
      });
      this.server
        .to(gameState.gameId)
        .emit(Events.GAME_STATE_UPDATED, gameState);
    }
  }

  @SubscribeMessage(Events.CREATE_GAME_ROOM)
  async handleCreateGameRoom(
    @MessageBody() data: CreateGameRoomDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const { gameSize } = data;
    const gameState = await this.gameService.createGameRoom(gameSize);
    client.join(gameState.gameId);
    client.emit(Events.GAME_ROOM_CREATED, gameState);
  }

  @SubscribeMessage(Events.JOIN_GAME_ROOM)
  async handleJoinGameRoom(
    @MessageBody() data: JoinGameRoomDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const { gameSize, gameId, team, playerName } = data;

    let gameState: PublicGameState, playerData: Player;

    if (gameId && team) {
      ({ gameState, playerData } = await this.gameService.joinGameRoomWithId(
        gameSize,
        gameId,
        team,
        playerName,
        client.id,
      ));
    } else {
      ({ gameState, playerData } = await this.gameService.joinGameRoom(
        gameSize,
        playerName,
        client.id,
      ));
    }

    client.join(gameState.gameId);
    client.emit(Events.PLAYER_JOINED, playerData);
    this.server.to(gameState.gameId).emit(Events.GAME_ROOM_JOINED, gameState);
    this.server.to(gameState.gameId).emit(Events.GAME_STATE_UPDATED, gameState);
  }

  @SubscribeMessage(Events.PLAYER_READY)
  async handleReadyPlayer(
    @MessageBody() data: ReadyTeamDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId, playerId, team } = data;
    const { gameState, playerData } = await this.gameService.readyPlayer(
      gameId,
      playerId,
      team,
    );

    client.emit(Events.PLAYER_READY_CONFIRMED, { ...playerData, team });

    this.server.to(gameId).emit(Events.GAME_STATE_UPDATED, gameState);
  }

  @SubscribeMessage(Events.GAME_COIN_FLIP)
  async handleChooseStarterTeam(
    @MessageBody() data: CoinFlipDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId } = data;
    const { gameState, objectLocation } =
      await this.gameService.chooseStarterTeam(gameId);

    if (objectLocation.playerId === client.id) {
      client.emit(Events.PLAYER_RECEIVE_OBJECT, objectLocation);
    }

    this.server.to(gameId).emit(Events.GAME_COIN_FLIP_RESULT, gameState);
  }

  @SubscribeMessage(Events.CHANGE_OBJECT_LOCATION)
  async handleChangeObjectLocation(@MessageBody() data: SetObjectLocationDTO) {
    const { gameId, playerId, hand } = data;
    const { objectLocation } = await this.gameService.changeObjectLocation(
      gameId,
      playerId,
      hand,
    );

    this.server
      .to(objectLocation.playerId)
      .emit(Events.PLAYER_RECEIVE_OBJECT, objectLocation);
  }

  @SubscribeMessage(Events.PLAYER_PLAYING)
  async handlePlayerPlaying(@MessageBody() data: PlayerPlayingDTO) {
    const { gameId, playerId } = data;
    this.server.to(gameId).emit(Events.PLAYER_PLAYING, playerId);
  }

  @SubscribeMessage(Events.GUESS_OBJECT_LOCATION)
  async handleGuessObjectLocation(@MessageBody() data: GuessObjectLocationDTO) {
    const { gameId, playerId, hand, isFromEmptyHand } = data;
    const {
      gameState,
      isGameFinished,
      isGuessCorrect,
      oldObjectLocation,
      newObjectLocation,
    } = await this.gameService.guessObjectLocation(gameId, playerId, hand);

    if (isGameFinished) {
      const finishedGamePayload: FinishGamePayload = {
        winnerTeam:
          gameState.scores.teamA > gameState.scores.teamB ? 'teamA' : 'teamB',
        finalScores: gameState.scores,
        roundsPlayed: gameState.round,
      };

      this.server.to(gameId).emit(Events.GAME_FINISHED, {
        data: finishedGamePayload,
        isGuessCorrect,
      });
    } else {
      this.server.to(gameId).emit(Events.GUESS_LOCATION_RESULT, {
        gameState,
        isGuessCorrect,
        isFromEmptyHand,
        oldObjectLocation,
      });

      this.server
        .to(newObjectLocation.playerId)
        .emit(Events.PLAYER_RECEIVE_OBJECT, newObjectLocation);
    }
  }

  @SubscribeMessage(Events.GET_ROOM_INFO)
  async handleGetRoomInfo(
    @MessageBody() data: GetRoomInfoDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId } = data;
    const gameState = await this.gameService.getRoomInfo(gameId);

    client.emit(Events.ROOM_INFO_FETCHED, gameState);
  }

  @SubscribeMessage(Events.REQUEST_EMPTY_PLAY)
  async handleRequestEmptyPlay(@MessageBody() data: RequestEmptyPlayDTO) {
    const { gameId, playerId } = data;

    const canEmptyPlay = await this.gameService.validateEmptyPlay(gameId);

    if (canEmptyPlay) {
      this.server.to(gameId).emit(Events.REQUEST_EMPTY_PLAY, playerId);
    } else {
      this.server.to(gameId).emit(Events.REACH_EMPTY_PLAYS_LIMIT, {
        message: 'خالی بازی‌هاتون تموم شده.',
      });
    }
  }

  @SubscribeMessage(Events.PLAYER_FILL_HAND)
  async handlePlayerFillHand(@MessageBody() data: PlayerFillHandDTO) {
    const { gameId, fromPlayerId, toPlayerId, direction, filledHands } = data;
    this.server.to(gameId).emit(Events.PLAYER_FILL_HAND, {
      fromPlayerId,
      toPlayerId,
      direction,
      filledHands,
    });
  }

  @SubscribeMessage(Events.REQUEST_EMPTY_HAND)
  async handlePlayerEmptyHand(@MessageBody() data: PlayerEmptyHandDTO) {
    const { gameId, playerId, hand } = data;

    const { hasObjectInHand, objectLocation } =
      await this.gameService.emptyPlayerHand(gameId, playerId, hand);

    if (hasObjectInHand) {
      await this.handleGuessObjectLocation({
        gameId,
        playerId,
        hand: objectLocation.hand === 'left' ? 'right' : 'left',
        isFromEmptyHand: true,
      });
      return;
    }

    this.server.to(gameId).emit(Events.PLAYER_EMPTY_HAND, {
      playerId,
      hand,
    });
  }
}
