import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { PapagoService } from 'src/api/papago/papago.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatRoomRepository } from './chat_rooms/chat_rooms.repository';
import { ChatMessageRepository } from './chat_messages/chat_messages.repository';
import { ChatRoom } from './chat_rooms/chat_rooms.entity';
import { ChatMessage } from './chat_messages/chat_messages.entity';
import { RemoveOptions, SaveOptions } from 'typeorm';
import { AxiosModule } from 'src/config/axios/axios.module';
import { ConfigService } from '@nestjs/config';
import { FindMessageDto } from './chat_messages/dto/find_message.dto';
import { Socket } from 'socket.io';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
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
    { message_id: 1, room_id: 1, user_name: 'tester01', send_at: new Date('2023-01-01'), language: 'en', ip: '123.456', message_text: 'hello ww'},
    { message_id: 2, room_id: 1, user_name: 'tester02', send_at: new Date('2023-02-01'), language: 'ko', ip: '123.456', message_text: 'ㅎㅇ' }
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

    const module: TestingModule = await Test.createTestingModule({
      imports: [AxiosModule],
      providers: [
        {
          provide: getRepositoryToken(ChatRoomRepository),
          useValue: mockRoomRepository,
        },
        {
          provide: getRepositoryToken(ChatMessageRepository),
          useValue: mockMessageRepository,
        },
        ChatGateway, ChatService, PapagoService, ConfigService],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  // SocketMock 생성이라는 벽에 막혀서 우선 인섬니아로 테스트하기로 함,,
  // describe('joinRoom', () => {
  //   it('채팅방 생성', async () => {
  //     const findMessageDto: FindMessageDto = { room_id: 1 };

  //     const result = await gateway.handleJoinRoom(socketMock, findMessageDto);
  //     expect(mockRoomRepository.findOneRoom).toBeCalledWith(findMessageDto.room_id);
  //     expect(result).toEqual({
  //       room_data: mockRoomEntities[0],
  //       message_data: mockMessageEntities,
  //     });
  //   })
  // });
});
