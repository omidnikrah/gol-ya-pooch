import { Events } from '@gol-ya-pooch/shared';
import { Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(BadRequestException)
export class WsValidationExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient<Socket>();

    const response = exception.getResponse();
    client.emit(Events.GAME_EXCEPTION, response);
  }
}
