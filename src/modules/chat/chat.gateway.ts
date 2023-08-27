import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { CreateMessageDto } from './chat_messages/dto/create_message.dto';
import { ChatService } from './chat.service';
import { FindMessageDto } from './chat_messages/dto/find_message.dto';
import { ChatMessage } from './chat_messages/chat_messages.entity';
import { PapagoService } from 'src/api/papago/papago.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatService: ChatService,
    private readonly papagoService: PapagoService,
  ) {}

  private readonly logger = new Logger(ChatGateway.name);

  // namespace를 설정하지 않으면 @WebSocketServer는 서버 인스턴스를 반환함; @WebSocketServer() server: Socket
  @WebSocketServer() nsp: Namespace;

  // 접속 시 room에 join 시키고 해당 room의 메시지 불러와서 돌려줌.
  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() joinData: FindMessageDto,
  ) {
    const roomIdString = joinData.room_id.toString();
    socket.join(roomIdString);
    this.nsp.to(roomIdString).emit('person-update', [ ...this.nsp.adapter.rooms.get(roomIdString) ]);
    return {
      room_data: await this.chatService.findOneRoom(joinData.room_id),
      message_data: await this.chatService.findMessage(joinData),
    };
  }

  // room 나가면 leave 처리
  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomId: number,
  ) {
    const roomIdString = roomId.toString();
    socket.leave(roomIdString);
  }

  // 메시지 송신 시 DB에 더하고 같은 room의 사람들에게 전송 (미번역 상태)
  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: CreateMessageDto,
  ) {
    const roomIdString = data.room_id.toString();
    const message: ChatMessage = await this.chatService.createMessage(data);
    this.nsp.to(roomIdString).emit('message', message);
  }

  // 번역 요청 시 번역 상태 확인 및(이미 번역되어 있으면 그대로 반환) 번역 후 DB 저장, 반환
  @SubscribeMessage('reqTranslate')
  async handleReqTranslate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: {
      message_id: number,
      language: string,
    }
  ) {
    const message: ChatMessage = await this.chatService.findOneMessage(data.message_id);
    if (message[`${data.language}_text`]) return message;

    const tMessage: string = await this.papagoService.translate(message.language, data.language, message.message_text);
    await this.chatService.updateMessage(data.message_id, {
      [`${data.language}_text`]: tMessage,
    });
    message[`${data.language}_text`] = tMessage;

    return message;
  }

  // 초기화 이후
  afterInit() {
    this.nsp.adapter.on('create-room', (room) => {
      this.logger.log(`[Room: ${room}]이 생성되었습니다.`);
    });

    this.nsp.adapter.on('join-room', (room, id) => {
      this.logger.log(`[Socket: ${id}]가 [Room: ${room}]에 참여하였습니다.`);
    });

    this.nsp.adapter.on('leave-room', (room, id) => {
      this.nsp.to(room).emit('person-update', [ ...this.nsp.adapter.rooms.get(room) ]);
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
  }

  // 소켓 연결 종료 시
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓 연결 ❌`);
  }
}