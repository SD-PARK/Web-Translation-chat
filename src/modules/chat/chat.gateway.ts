import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:3000'],
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  // namespace를 설정하지 않으면 @WebSocketServer는 서버 인스턴스를 반환함; @WebSocketServer() server: Socket
  @WebSocketServer() nsp: Namespace;

  // 초기화 이후
  afterInit() {
    this.nsp.adapter.on('create-room', (room) => {
      this.logger.log(`[Room: ${room}]이 생성되었습니다.`);
    });

    this.nsp.adapter.on('join-room', (room, id) => {
      this.logger.log(`[Socket: ${id}]가 [Room: ${room}]에 참여하였습니다.`);
    });

    this.nsp.adapter.on('leave-room', (room, id) => {
      this.logger.log(`[Socket: ${id}]가 [Room: ${room}]에서 나갔습니다.`);
    });

    this.nsp.adapter.on('delete-room', (room) => {
      this.logger.log(`[Room: ${room}]이 삭제되었습니다.`);
    });

    this.logger.log('웹 소켓 서버 초기화 ✅');
  }

  // 소켓 연결 시
  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓 연결`);

    // socket.broadcast.emit('message', {
    //   message: `${socket.id}가 참여하였습니다.`,
    // });
  }

  // 소켓 연결 종료 시
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓 연결 ❌`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: string,
  ) {
    socket.broadcast.emit('message', { username: socket.id, message });
    return { username: socket.id, message };
  }
}
