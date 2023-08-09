import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ChatMessageRepository } from './chat_messages/chat_messages.repository';
import { ChatRoomRepository } from './chat_rooms/chat_rooms.repository';
import { TypeOrmExModule } from 'src/config/typeorm_ex/typeorm_ex.module';
import { ConfigModule } from '@nestjs/config';
import { DBModule } from 'src/config/db/db.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatRoom } from './chat_rooms/chat_rooms.entity';
import { CreateRoomDto } from './chat_rooms/dto/create_room.dto';
import { ReadRoomDto } from './chat_rooms/dto/read_room.dto';
import { ChatMessage } from './chat_messages/chat_messages.entity';
import { BaseEntity, RemoveOptions, SaveOptions } from 'typeorm';

describe('ChatService', () => {
  let service: ChatService;
  let module: TestingModule;
  let mockMessageRepository: ChatMessageRepository;
  let mockRoomRepository: ChatRoomRepository;
  const baseEntity = {
    chatMessages: new ChatRoom,
    hasId: function (): boolean {
      throw new Error('Function not implemented.');
    },
    save: function (options?: SaveOptions): Promise<ChatRoom> {
      throw new Error('Function not implemented.');
    },
    remove: function (options?: RemoveOptions): Promise<ChatRoom> {
      throw new Error('Function not implemented.');
    },
    softRemove: function (options?: SaveOptions): Promise<ChatRoom> {
      throw new Error('Function not implemented.');
    },
    recover: function (options?: SaveOptions): Promise<ChatRoom> {
      throw new Error('Function not implemented.');
    },
    reload: function (): Promise<void> {
      throw new Error('Function not implemented.');
    }
  }

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        ChatService, ChatMessageRepository, ChatRoomRepository,
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    mockMessageRepository = module.get<ChatMessageRepository>(ChatMessageRepository);
    mockRoomRepository = module.get<ChatRoomRepository>(ChatRoomRepository);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Validate', () => {
    it('Room ID', async () => {
      const mockEntities: ChatRoom[] = [
        { room_id: 1, room_name: 'test1', created_at: new Date('2023-01-01'), ...baseEntity},
        { room_id: 2, room_name: 'test2', created_at: new Date('2023-02-01'), ...baseEntity},
        { room_id: 3, room_name: 'test3', created_at: new Date('2023-03-01'), ...baseEntity},
      ];

      mockRoomRepository.findOne = jest.fn().mockImplementation((options) => {
        return mockEntities.find((entity) => entity.room_id === options.where.room_id);
      });

      await expect(service.validateRoomID(0)).rejects.toThrow('Room ID를 찾을 수 없습니다');
    });
  });

  describe('Create Room', () => {
    // Room 생성, 생성 결과 확인
    it('채팅방 생성', async () => {
      const createRoomDto: CreateRoomDto = { room_name: 'test' };
      const mockCreatedEntity: ChatRoom = {
        room_id: 1,
        ...createRoomDto,
        created_at: new Date(Date.now()),
        chatMessages: new ChatRoom,
        ...baseEntity
      };

      jest.spyOn(mockRoomRepository, 'createRoom').mockResolvedValue(mockCreatedEntity);

      const result = await service.createRoom(createRoomDto);

      expect(result).toEqual(mockCreatedEntity);
    })
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
