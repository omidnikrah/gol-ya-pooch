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
import { GameService } from './game.service';
import { CreateGameRoomDTO } from './dto/create-game-room.dto';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsValidationExceptionFilter } from 'src/common/filters/ws-exception.filter';
import { v4 as uuidV4 } from 'uuid';
import { JoinGameRoomDTO } from 'src/modules/game/dto/join-game-room.dto';

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

  @SubscribeMessage('createGameRoom')
  handleCreateGameRoom(
    @MessageBody() data: CreateGameRoomDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const gameId = uuidV4();
    const gameState = this.gameService.createGameRoom(gameId);
    client.join(gameId);
    client.emit('gameRoomCreated', gameState);
  }

  @SubscribeMessage('joinGameRoom')
  handleJoinGameRoom(
    @MessageBody() data: JoinGameRoomDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId, team, player } = data;
    const gameState = this.gameService.joinGameRoom(gameId, team, player);
    client.join(gameId);
    client.emit('gameRoomJoined', gameState);
  }
}
