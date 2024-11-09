import { WsValidationExceptionFilter } from '@gol-ya-pooch/backend/common/filters/ws-exception.filter';
import { GetRoomInfoDTO } from '@gol-ya-pooch/backend/modules/game/dto/get-room-info.dto';
import { Events, GameState, Player } from '@gol-ya-pooch/shared';
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

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
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

    let gameState: GameState, playerData: Player;

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
  }

  @SubscribeMessage(Events.TEAM_READY)
  async handleReadyTeam(@MessageBody() data: ReadyTeamDTO) {
    const { gameId, team } = data;
    const gameState = await this.gameService.readyTeam(gameId, team);
    this.server.to(gameId).emit(Events.TEAM_READY_CONFIRMED, gameState);
  }

  @SubscribeMessage(Events.GAME_COIN_FLIP)
  async handleChooseStarterTeam(@MessageBody() data: CoinFlipDTO) {
    const { gameId, team, coinSide } = data;
    const gameState = await this.gameService.chooseStarterTeam(
      gameId,
      team,
      coinSide,
    );
    this.server.to(gameId).emit(Events.TEAM_READY_CONFIRMED, gameState);
  }

  @SubscribeMessage(Events.CHANGE_OBJECT_LOCATION)
  async handleChangeObjectLocation(@MessageBody() data: SetObjectLocationDTO) {
    const { gameId, playerId, hand } = data;
    const gameState = await this.gameService.changeObjectLocation(
      gameId,
      playerId,
      hand,
    );
    this.server.to(gameId).emit(Events.OBJECT_LOCATION_CHANGED, gameState);
  }

  @SubscribeMessage(Events.GUESS_OBJECT_LOCATION)
  async handleGuessObjectLocation(@MessageBody() data: GuessObjectLocationDTO) {
    const { gameId, playerId, hand } = data;
    const { gameState, isGameFinished } =
      await this.gameService.guessObjectLocation(gameId, playerId, hand);

    if (isGameFinished) {
      const finishedGamePayload = {
        winnerTeam:
          gameState.scores.teamA > gameState.scores.teamB ? 'teamA' : 'teamB',
        finalScores: gameState.scores,
        roundsPlayed: gameState.round,
      };

      this.server.to(gameId).emit(Events.GAME_FINISHED, finishedGamePayload);
    } else {
      this.server.to(gameId).emit(Events.GUESS_LOCATION_RESULT, gameState);
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
}
