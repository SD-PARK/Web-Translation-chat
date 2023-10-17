import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { CreateMessageDto } from './dto/chat_messages/create_message.dto';
import { ChatService } from './chat.service';
import { FindMessageDto } from './dto/chat_messages/find_message.dto';
import { ChatMessage } from './entities/chat_messages.entity';
import { PapagoService } from 'src/api/papago/papago.service';
import { ChatRoom } from './entities/chat_rooms.entity';
import { CreateRoomDto } from './dto/chat_rooms/create_room.dto';
import { SwitchNameDto } from './dto/chat_gateway/switch_name.dto';
import { ReqTranslateDto } from './dto/chat_gateway/req_translate.dto';
import { BadRequestExceptionFilter } from 'src/config/validator/bad-request-filter';
import { SwitchLanguageDto } from './dto/chat_gateway/switch_language.dto';

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

  private readonly logger: Logger = new Logger(ChatGateway.name);
  private readonly MAX_RETRY_LIMIT: number = 5; // 번역 요청 재시도 횟수
  private readonly RETRY_INTERVAL: number = 500; // 번역 요청 재시도 간격(ms)
  private translateStatus: Set<string> = new Set<string>();
  private personMap: Map<string, object> = new Map<string, {name: string, ips: string, language?: string}>();

  // namespace를 설정하지 않으면 @WebSocketServer는 서버 인스턴스를 반환함; @WebSocketServer() server: Socket
  @WebSocketServer() nsp: Namespace;

  // 접속 시 room에 join 시키고 해당 room의 메시지 불러와서 돌려줌.
  @SubscribeMessage('joinRoom')
  @UsePipes(ValidationPipe)
  @UseFilters(BadRequestExceptionFilter)
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() joinData: FindMessageDto,
  ) {
    try {
      socket.leave('list');
      const roomIdString = joinData.room_id.toString();
      socket.join(roomIdString);
      this.personMap.set(socket.id, { name: socket.id, ips: this.getIP(socket) });

      this.nsp.to(roomIdString).emit('get-person-data', this.getPersons(roomIdString));
    
      return {
        room_data: await this.chatService.findOneRoom(joinData.room_id),
        message_data: await this.chatService.findMessage(joinData),
      };
    } catch (err) {
      return { error: 'Join Room Failed'};
    }
  }

  @SubscribeMessage('getMessage')
  @UsePipes(ValidationPipe)
  @UseFilters(BadRequestExceptionFilter)
  async handleGetMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: FindMessageDto,
  ) {
    try {
      const messages: ChatMessage[] = await this.chatService.findMessage(data);
      return messages;
    } catch (err) {
      socket.emit('error', { message: 'Failed to load messages' });
    }
  }

  // 메시지 송신 시 DB에 더하고 같은 room의 사람들에게 전송 (미번역 상태)
  @SubscribeMessage('message')
  @UsePipes(ValidationPipe)
  @UseFilters(BadRequestExceptionFilter)
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: CreateMessageDto,
  ) {
    const roomIdString = data.room_id.toString();
    const socket_ip = this.getIP(socket);
    const includedIpData: CreateMessageDto = { ...data, ip: socket_ip, }
    try {
      const message: ChatMessage = await this.chatService.createMessage(includedIpData);
      this.nsp.to(roomIdString).emit('message', message);
    } catch (err) {
      this.logger.error(err);
      // 메시지 전송 실패 알림
      socket.emit('error', { message: 'Failed to send message', data: includedIpData });
    }
  }

  @SubscribeMessage('switchName')
  @UsePipes(ValidationPipe)
  @UseFilters(BadRequestExceptionFilter)
  async handleSwitchName(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: SwitchNameDto,
  ) {
    try {
      const originData = this.personMap.get(socket.id);
      if (originData) {
        const roomIdString = data.room_id.toString();
        this.personMap.set(socket.id, { ...originData, name: data.name });
        this.nsp.to(roomIdString).emit('get-person-data', this.getPersons(roomIdString));
      }
    } catch (err) {
      socket.emit('error', { message: 'Name conversion failed' });
    }
  }

  @SubscribeMessage('switchLanguage')
  @UsePipes(ValidationPipe)
  @UseFilters(BadRequestExceptionFilter)
  async handleSwitchLanguage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: SwitchLanguageDto,
  ) {
    try {
      const originData = this.personMap.get(socket.id);
      if (originData) {
        const roomIdString = data.room_id.toString();
        this.personMap.set(socket.id, { ...originData, language: data.language });
        this.nsp.to(roomIdString).emit('get-person-data', this.getPersons(roomIdString));
      }
    } catch (err) {
      socket.emit('error', { message: 'Language conversion failed' });
    }
  }

  // 번역 요청 시 번역 상태 확인 및(이미 번역되어 있으면 그대로 반환) 번역 후 DB 저장, 반환
  @SubscribeMessage('reqTranslate')
  @UsePipes(ValidationPipe)
  @UseFilters(BadRequestExceptionFilter)
  async handleReqTranslate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: ReqTranslateDto
  ) {
    try {
      // 번역 완료된 텍스트인지 확인
      const message: ChatMessage = await this.chatService.findOneMessage(data.message_id);
      if (message[`${data.language}_text`]) return message;
      
      // 번역 중인 텍스트인지 확인
      const requestKey = `${data.message_id}_${data.language}`;
  
      if (this.translateStatus.has(requestKey)) {
        const retryCount = data.retryCount ?? 0;
        if (data.retryCount >= this.MAX_RETRY_LIMIT) {
          return { error: 'Translation Failed' };
        } else {
          await this.delay(this.RETRY_INTERVAL);
          return this.handleReqTranslate(socket, { ...data, retryCount: retryCount + 1});
        }
      }
      
      // 번역 중이 아닌 경우, 번역 시작
      this.translateStatus.add(requestKey);
      try {
        const tMessage: string = await this.papagoService.translate(message.language, data.language, message.message_text);
        await this.chatService.updateMessage(data.message_id, {
          [`${data.language}_text`]: tMessage,
        });
        message[`${data.language}_text`] = tMessage;
        return message;
      } catch(err) {
        return { error: 'Translation Failed' };
      } finally {
        this.translateStatus.delete(requestKey);
      }
    } catch (err) {
      return { error: 'Translation Failed' };
    }
  }

  // 방 목록 페이지 접속 시, room 'list' 입장 및 방 목록 반환
  @SubscribeMessage('joinList')
  async handleJoinList(
    @ConnectedSocket() socket: Socket
  ) {
    try {
      socket.join('list');
      await this.handleGetRoomList(socket, '');
    } catch (err) {
      socket.emit('getRoomList', { error: 'Failed to get Room List' });
    }
  }

  // 접속 인원을 포함한 room 목록 반환
  @SubscribeMessage('getRoomList')
  async handleGetRoomList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    try {
      const rooms: ChatRoom[] = await this.chatService.findRoom(roomName);
  
      const cntRooms = rooms.map((room) => {
        const roomIdString: string = room.room_id.toString();
        let cnt: number = 0;
        const getRoom = this.nsp.adapter.rooms.get(roomIdString);
        if(getRoom) cnt = getRoom.size;
        return { ...room, cnt };
      });
      socket.emit('getRoomList', cntRooms);
    } catch (err) {
      socket.emit('getRoomList', { error: 'Failed to get Room List' });
    }
  }

  // 신규 방 생성
  @SubscribeMessage('postRoom')
  @UsePipes(ValidationPipe)
  @UseFilters(BadRequestExceptionFilter)
  async handlePostRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomData: CreateRoomDto,
  ) {
    try {
      const createdRoom: ChatRoom = await this.chatService.createRoom(roomData);
      this.nsp.to('list').emit('update', createdRoom);
      return { status: 'success', room_id: createdRoom.room_id };
    } catch (err) {
      socket.emit('error', { message: 'Failed to Create a New Room' });
    }
  }

  // 초기화 이후
  afterInit() {
    this.nsp.adapter.on('create-room', (room) => {
      this.logger.log(`[Room: ${room}]이 생성되었습니다.`);
    });

    this.nsp.adapter.on('join-room', (room, id) => {
      this.logger.log(`[Socket: ${id}]가 [Room: ${room}]에 참여하였습니다.`);
      if (id !== room && room !== 'list') this.updateRoomCnt(room);
    });

    this.nsp.adapter.on('leave-room', (room, id,) => {
      this.personMap.delete(id);
      this.nsp.to(room).emit('person-update', this.getPersons(room));
      this.logger.log(`[Socket: ${id}]가 [Room: ${room}]에서 나갔습니다.`);
      if (id !== room && room !== 'list') this.updateRoomCnt(room);
    });

    this.nsp.adapter.on('delete-room', (room) => {
      this.logger.log(`[Room: ${room}]이 삭제되었습니다.`);
    });

    this.logger.log('웹 소켓 서버 초기화 ✅');
  }

  // 소켓 연결 시
  handleConnection(@ConnectedSocket() socket: Socket) {
    socket.emit('sendIP', this.getIP(socket))
    this.logger.log(`${socket.id} 소켓 연결`);
  }

  // 소켓 연결 종료 시
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓 연결 ❌`);
  }

  // 해당 room의 인원 갱신 후 방 목록 페이지의 유저들에게 전송
  updateRoomCnt(roomId: string) {
    const roomIdNumber = Number(roomId);
    
    if (!Number.isNaN(roomIdNumber)) {
      this.nsp.to('list').emit('update', {
        room_id: roomIdNumber,
        cnt: this.nsp.adapter.rooms.get(roomId).size,
      });
    }
  }

  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // socket의 IP 앞 2자리를 가져옵니다.
  getIP(socket: Socket) {
    try {
      const rawAddress = socket.handshake.address;
      const ipAddress = rawAddress.split(':').pop();
      if (ipAddress && typeof ipAddress === 'string')
        return ipAddress.split('.').slice(0, 2).join('.');
      else
        throw new Error('Invalid IP address');
    } catch (err) {
      this.logger.error('Error getIP:', err.message);
      return null;
    }
  }

  // 특정 룸의 접속 인원 정보를 가져옵니다.
  getPersons(roomId: string) {
    const roomPerson = this.nsp.adapter.rooms.get(roomId);
    const persons = Array.from(roomPerson).map((socketId) => {
      return this.personMap.get(socketId);
    });
    return persons;
  }
}