import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ChatMessageRepository } from './chat_messages/chat_messages.repository';
import { ChatRoomRepository } from './chat_rooms/chat_rooms.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatRoom } from './chat_rooms/chat_rooms.entity';
import { CreateRoomDto } from './chat_rooms/dto/create_room.dto';
import { RemoveOptions, SaveOptions } from 'typeorm';
import { CreateMessageDto } from './chat_messages/dto/create_message.dto';
import { FindMessageDto } from './chat_messages/dto/find_message.dto';
import { ChatMessage } from './chat_messages/chat_messages.entity';
import { UpdateRoomDto } from './chat_rooms/dto/update_room.dto';
import { UpdateMessageDto } from './chat_messages/dto/update_message.dto';

describe('ChatService', () => {
  let service: ChatService;
  let module: TestingModule;
  let mockRoomRepository: Partial<ChatRoomRepository>;
  let mockMessageRepository: Partial<ChatMessageRepository>;
  const baseEntity = {
    chatMessages: [new ChatMessage],
    hasId: function (): boolean { throw new Error('Function not implemented.'); },
    save: function (options?: SaveOptions): Promise<ChatRoom> { throw new Error('Function not implemented.'); },
    remove: function (options?: RemoveOptions): Promise<ChatRoom> { throw new Error('Function not implemented.'); },
    softRemove: function (options?: SaveOptions): Promise<ChatRoom> { throw new Error('Function not implemented.'); },
    recover: function (options?: SaveOptions): Promise<ChatRoom> { throw new Error('Function not implemented.'); },
    reload: function (): Promise<void> { throw new Error('Function not implemented.'); }
  }
  let mockRoomEntities: ChatRoom[] = [
    { room_id: 1, room_name: 'test1', created_at: new Date('2023-01-01'), ...baseEntity},
    { room_id: 2, room_name: 'test2', created_at: new Date('2023-02-01'), ...baseEntity},
    { room_id: 3, room_name: 'test3', created_at: new Date('2023-03-01'), ...baseEntity},
  ];
  let mockMessageEntities = [
    { message_id: 1, room_id: 1, user_name: 'tester01', send_at: new Date('2023-01-01'), language: 'en', message_text: 'hello ww'},
    { message_id: 2, room_id: 1, user_name: 'tester02', send_at: new Date('2023-02-01'), language: 'ko', message_text: 'ㅎㅇ' }
  ];

  beforeAll(async () => {
    mockRoomRepository = {
      findRoom: jest.fn().mockImplementation((roomName) => {
        return mockRoomEntities.filter(entity => entity.room_name.includes(roomName));
      }),

      findOneRoom: jest.fn().mockImplementation((roomId) => {
        return mockRoomEntities.find(entity => entity.room_id === roomId);
      }),

      updateRoomName: jest.fn().mockImplementation((roomId, roomData) => {
        mockRoomEntities = mockRoomEntities.map(entity => {
          if (entity.room_id === roomId)
            return { ...entity, ...roomData };
        });
      }),

      deleteRoom: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    mockMessageRepository = {
      createMessage: jest.fn().mockResolvedValue(mockMessageEntities[0]),

      findRoomMessages: jest.fn().mockResolvedValue(mockMessageEntities),

      findOneMessage: jest.fn().mockImplementation((messageId) => {
        return mockMessageEntities.find(entity => entity.message_id === messageId);
      }),
      
      updateMessage: jest.fn().mockImplementation((messageId, messageData) => {
        mockMessageEntities = mockMessageEntities.map(entity => {
          if (entity.message_id === messageId)
            return { ...entity, ...messageData, };
        });
      }),

      deleteRoomMessage: jest.fn().mockResolvedValue({ affected: 1 }),
    }

    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(ChatRoomRepository),
          useValue: mockRoomRepository,
        },
        {
          provide: getRepositoryToken(ChatMessageRepository),
          useValue: mockMessageRepository,
        },
        ChatService
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Room', () => {
    it('채팅방 생성', async () => {
      const createRoomDto: CreateRoomDto = { room_name: 'test' };
      const mockCreatedEntity: ChatRoom = {
        ...baseEntity,
        ...mockRoomEntities[0],
        ...createRoomDto,
      };

      mockRoomRepository.createRoom = jest.fn().mockResolvedValue(mockCreatedEntity);

      const result = await service.createRoom(createRoomDto);
      expect(result).toEqual(mockCreatedEntity);
      expect(mockRoomRepository.createRoom).toBeCalledWith(createRoomDto.room_name);
    })
  });

  describe('Find Room', () => {
    // 유효한 Room 조회 (유효하지 않은 경우는 Validate에서 처리함)
    it('모든 채팅방 검색', () => {
      expect(service.findRoom('')).resolves.toEqual(mockRoomEntities);
    });
    it('특정 채팅방 검색', () => {
      expect(service.findRoom('test2')).resolves.toEqual([mockRoomEntities[1]]);
    });
    
    it('Room ID로 검색', async () => {
      await expect(service.findOneRoom(0)).rejects.toThrow('Room ID를 찾을 수 없습니다');
      await expect(service.findOneRoom(1)).resolves.toEqual(mockRoomEntities[0]);
      expect(mockRoomRepository.findOneRoom).toBeCalledWith(1);
    });
  });

  describe('Update Room', () => {
    const updateData: UpdateRoomDto = { room_name: 'test11' };
    const mockUpdatedEntity = {
      ...mockRoomEntities[0],
      ...updateData,
    };
    
    it('채팅방 업데이트 확인', async () => {
      await service.updateRoom(1, updateData);
      expect(mockRoomRepository.updateRoomName).toBeCalledWith(1, updateData);
      const updatedRoom = await service.findOneRoom(1);
      expect(updatedRoom).toEqual(mockUpdatedEntity);
    });
  });

  describe('Delete Room', () => {
    const deleteRoomID: number = 1;

    it('채팅방 삭제', async () => {
      const result = await service.deleteRoom(deleteRoomID);
      expect(mockRoomRepository.deleteRoom).toBeCalledWith(deleteRoomID);
      expect(mockMessageRepository.deleteRoomMessage).toBeCalledWith(deleteRoomID);
      expect(result).toMatchObject({
        affected_message: expect.any(Number),
        affected_room: expect.any(Number)
      });
    });
  });

  describe('Create Message', () => {
    // Create Room에서 생성한 Room에 메세지 생성, 확인
    const createMessageEntity: CreateMessageDto = {
      room_id: 1,
      user_name: 'Tester01',
      language: 'en',
      message_text: 'hello, how are you',
    };

    it('메시지 생성', async () => {
      const result = await service.createMessage(createMessageEntity);
      expect(mockMessageRepository.createMessage).toBeCalledWith(createMessageEntity.room_id, createMessageEntity.user_name, createMessageEntity.language, createMessageEntity.message_text);
      expect(result).toEqual(mockMessageEntities[0]);
    });
  });

  describe('Find Message', () => {
    // Create Room에서 생성한 Room에 메세지 생성, 5초 기다린 뒤 재전송, 5초 전 시간 기준으로 조회, 현재 시간 기준으로 조회, 값이 상이한 지 확인
    // 메세지 10개 생성, take를 통해 5개, 10개 조회 제한 확인
    const findMessageData: FindMessageDto = {
      room_id: 1,
      send_at: new Date(Date.now()),
      take: 20,
    }

    it('메시지 조회', async () => {
      const result = await service.findMessage(findMessageData);
      expect(result).toEqual(mockMessageEntities);
      expect(mockMessageRepository.findRoomMessages).toBeCalledWith(findMessageData.room_id, findMessageData.send_at, findMessageData.take);
    });
  });

  describe('Update Message', () => {
    const updateData: UpdateMessageDto = { ko_text: '안녕 ㅋ' };
    const mockUpdatedEntity = {
      ...mockMessageEntities[0],
      ...updateData,
    };
    
    it('채팅방 업데이트 확인', async () => {
      await service.updateMessage(1, updateData);
      expect(mockMessageRepository.updateMessage).toBeCalledWith(1, updateData);
      const updatedMessage = await service.findOneMessage(1);
      expect(updatedMessage).toEqual(mockUpdatedEntity);
    });
  });
});
