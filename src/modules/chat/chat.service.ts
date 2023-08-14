import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessageRepository } from './chat_messages/chat_messages.repository';
import { ChatRoomRepository } from './chat_rooms/chat_rooms.repository';
import { CreateMessageDto } from './chat_messages/dto/create_message.dto';
import { FindMessageDto } from './chat_messages/dto/find_message.dto';
import { CreateRoomDto } from './chat_rooms/dto/create_room.dto';
import { UpdateRoomDto } from './chat_rooms/dto/update_room.dto';
import { DeleteResult } from 'typeorm';
import { ChatRoom } from './chat_rooms/chat_rooms.entity';
import { ChatMessage } from './chat_messages/chat_messages.entity';

@Injectable()
export class ChatService {
    constructor(
        private readonly chatMessageRepository: ChatMessageRepository,
        private readonly chatRoomRepository: ChatRoomRepository,
    ) {}

    async createRoom(roomData: CreateRoomDto): Promise<ChatRoom> {
        try {
            const result: ChatRoom = await this.chatRoomRepository.createRoom(roomData.room_name);
            return result;
        } catch (err) {
            console.error('createRoom Error:', err);
        }
    }
    
    async findRoom(roomName: string): Promise<ChatRoom[]> {
        try {
            const result: ChatRoom[] = await this.chatRoomRepository.findRoom(roomName);
            return result;
        } catch (err) {
            console.error('findRoom Error:', err);
        }
    }

    async updateRoom(roomId: number, roomData: UpdateRoomDto): Promise<ChatRoom> {
        try {
            const result: ChatRoom = await this.chatRoomRepository.updateRoomName(roomId, roomData.room_name);
            return result;
        } catch (err) {
            console.error('updateRoom Error:', err);
        }
    }

    async deleteRoom(roomId: number): Promise<DeleteResult> {
        try {
            await this.chatMessageRepository.deleteRoomMessage(roomId);
            const result: DeleteResult = await this.chatRoomRepository.deleteRoom(roomId);
            return result;
        } catch (err) {
            console.error('deleteRoom Error:', err);
        }
    }

    async createMessage(messageData: CreateMessageDto): Promise<ChatMessage> {
        this.validateRoomID(messageData.room_id);
        try {
            const result: ChatMessage = await this.chatMessageRepository.createMessage(messageData.room_id, messageData.user_name, messageData.language, messageData.message_text);
            return result;
        } catch (err) {
            console.error('createMessage Error:', err);
        }
    }

    async findMessage(messageData: FindMessageDto): Promise<ChatMessage[]> {
        await this.validateRoomID(messageData.room_id);
        try {
            const result: ChatMessage[] = await this.chatMessageRepository.findRoomMessages(messageData.room_id, messageData.send_at, messageData?.take ?? 20);
            return result;
        } catch (err) {
            console.error('findMessage Error:', err);
        }
    }

    async validateRoomID(roomId: number): Promise<void> {
        try {
            const findRoom: ChatRoom = await this.chatRoomRepository.findOneRoom(roomId);
            if (findRoom === null) throw new NotFoundException('Room ID를 찾을 수 없습니다');
        } catch (err) {
            console.error('validateRoomId Error: ', err);
        }
    }
}
