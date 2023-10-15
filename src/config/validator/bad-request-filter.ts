import { Catch, ArgumentsHost, ExceptionFilter, BadRequestException } from '@nestjs/common';
import { Socket } from 'socket.io';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const response = exception.getResponse();
    const status = exception.getStatus();
    const ctx = host.switchToWs().getClient<Socket>();

    // 클라이언트로 직접 응답을 보냅니다.
    ctx.emit('error', { status, message: response['message'][0] });
  }
}