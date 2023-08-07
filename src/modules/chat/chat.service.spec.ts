import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ChatMessageRepository } from './chat_messages/chat_messages.repository';
import { ChatRoomRepository } from './chat_rooms/chat_rooms.repository';
import { FindMessageDto } from './chat_messages/dto/find_message.dto';
import { TypeOrmExModule } from 'src/config/typeorm_ex/typeorm_ex.module';
import { ConfigModule } from '@nestjs/config';
import { DBModule } from 'src/config/db/db.module';

describe('ChatService', () => {
  let service: ChatService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        DBModule,
        TypeOrmExModule.forCustomRepository([ChatMessageRepository, ChatRoomRepository]),
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true,
        }),
      ],
      providers: [ChatService],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Validate', () => {
    it('Room ID', async () => {
      await expect(service.validateRoomID(0)).rejects.toThrow('Room ID를 찾을 수 없습니다');
    });
  });

  describe('Create Room', () => {
    // Room 생성, 생성 결과 확인
  });

  describe('Find Room', () => {
    // 유효한 Room 조회 (유효하지 않은 경우는 Validate에서 처리함)
  });

  describe('Update Room', () => {
    // Create Room에서 생성한 Room에 대해 Data 변경, 확인
  });

  describe('Create Message', () => {
    // Create Room에서 생성한 Room에 메세지 생성, 확인
  });

  describe('Find Message', () => {
    // Create Room에서 생성한 Room에 메세지 생성, 5초 기다린 뒤 재전송, 5초 전 시간 기준으로 조회, 현재 시간 기준으로 조회, 값이 상이한 지 확인
    // 메세지 10개 생성, take를 통해 5개, 10개 조회 제한 확인
  });

  describe('Delete Room', () => {
    // Create Room에서 생성한 Room 제거, 확인
    // Message도 사라졌는지 확인
  });
});
