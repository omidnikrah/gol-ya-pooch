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
import { StartGameDto } from './dto/start-game.dto';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsValidationExceptionFilter } from 'src/common/filters/ws-exception.filter';

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

  @SubscribeMessage('startGame')
  handleStartGame(
    @MessageBody() data: StartGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    const gameId = data.gameId;
    const gameState = this.gameService.createGame(gameId);
    client.join(gameId);
    client.emit('gameStarted', gameState);
  }
}
