import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessageRepository } from './chat_messages/chat_messages.repository';
import { ChatRoomRepository } from './chat_rooms/chat_rooms.repository';
import { ReadRoomDto } from './chat_rooms/dto/read_room.dto';
import { ReadMessageDto } from './chat_messages/dto/read_message.dto';
import { CreateMessageDto } from './chat_messages/dto/create_message.dto';
import { FindMessageDto } from './chat_messages/dto/find_message.dto';
import { CreateRoomDto } from './chat_rooms/dto/create_room.dto';
import { UpdateRoomDto } from './chat_rooms/dto/update_room.dto';

@Injectable()
export class ChatService {
    constructor(
        private readonly chatMessageRepository: ChatMessageRepository,
        private readonly chatRoomRepository: ChatRoomRepository,
    ) {}

    async createRoom(roomData: CreateRoomDto): Promise<ReadRoomDto> {
        const result: ReadRoomDto = await this.chatRoomRepository.createRoom(roomData.room_name);
        return result;
    }

    async updateRoom(roomData: UpdateRoomDto): Promise<ReadRoomDto> {
        return;
    }

    async deleteRoom(roomId: number): Promise<void> {
    }

    async findMessage(messageData: FindMessageDto): Promise<ReadMessageDto[]> {
        this.validateRoomID(messageData.room_id);
        const result: ReadMessageDto[] = await this.chatMessageRepository.findRoomMessages(messageData.room_id, messageData.send_at, messageData.take);
        return result;
    }

    async createMessage(messageData: CreateMessageDto): Promise<ReadMessageDto> {
        this.validateRoomID(messageData.room_id);
        const result: ReadMessageDto = await this.chatMessageRepository.createMessage(messageData.room_id, messageData.user_name, messageData.language, messageData.message_text);
        return result;
    }

    async validateRoomID(roomId: number): Promise<void> {
        const findRoom: ReadRoomDto = await this.chatRoomRepository.findOneRoom(roomId);
        if (!findRoom) throw new NotFoundException('Room ID를 찾을 수 없습니다');
    }
}
