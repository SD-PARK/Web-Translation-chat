import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessageRepository } from './chat_messages/chat_messages.repository';
import { ChatRoomRepository } from './chat_rooms/chat_rooms.repository';
import { ReadRoomDto } from './chat_rooms/dto/read_chat.dto';
import { ReadMessageDto } from './chat_messages/dto/read_message.dto';
import { CreateMessageDto } from './chat_messages/dto/create_message.dto';
import { FindMessageDto } from './chat_messages/dto/find_message.dto';

@Injectable()
export class ChatService {
    constructor(
        private readonly chatMessageRepository: ChatMessageRepository,
        private readonly chatRoomRepository: ChatRoomRepository,
    ) {}

    async findMessage(findMessageData: FindMessageDto): Promise<ReadMessageDto[]> {
        const findRoom: ReadRoomDto = await this.chatRoomRepository.findOneRoom(findMessageData.room_id);
        if (!findRoom) throw new NotFoundException('Room ID를 찾을 수 없습니다');

        const result: ReadMessageDto[] = await this.chatMessageRepository.findRoomMessages(findMessageData.room_id, findMessageData.send_at, findMessageData.take);
        return result;
    }

    async createMessage(messageData: CreateMessageDto): Promise<ReadMessageDto> {
        const result: ReadMessageDto = await this.chatMessageRepository.createMessage(messageData.room_id, messageData.user_name, messageData.language, messageData.message_text);
        return result;
    }
}
