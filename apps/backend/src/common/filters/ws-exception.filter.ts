import { Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch(BadRequestException)
export class WsValidationExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient<Socket>();

    const response = exception.getResponse();
    client.emit('exception', response);
  }
}
