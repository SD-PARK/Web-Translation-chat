import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessageRepository } from './chat_messages/chat_messages.repository';
import { ChatRoomRepository } from './chat_rooms/chat_rooms.repository';
import { CreateMessageDto } from './chat_messages/dto/create_message.dto';
import { FindMessageDto } from './chat_messages/dto/find_message.dto';
import { CreateRoomDto } from './chat_rooms/dto/create_room.dto';
import { UpdateRoomDto } from './chat_rooms/dto/update_room.dto';
import { ChatRoom } from './chat_rooms/chat_rooms.entity';
import { ChatMessage } from './chat_messages/chat_messages.entity';
import { UpdateMessageDto } from './chat_messages/dto/update_message.dto';
import { UpdateResult } from 'typeorm';

@Injectable()
export class ChatService {
    constructor(
        private readonly chatMessageRepository: ChatMessageRepository,
        private readonly chatRoomRepository: ChatRoomRepository,
    ) {}

    // ================================================
    // ===================== Room =====================
    // ================================================

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

    async findOneRoom(roomId: number): Promise<ChatRoom> {
        let findRoom: ChatRoom;
        try {
            findRoom = await this.chatRoomRepository.findOneRoom(roomId);
        } catch (err) {
            console.error('findOneRoom Error: ', err);
        }
        if (!findRoom) throw new NotFoundException('Room ID를 찾을 수 없습니다');
        return findRoom;
    }

    async updateRoom(roomId: number, roomData: UpdateRoomDto): Promise<UpdateResult> {
        await this.findOneRoom(roomId);
        try {
            const result: UpdateResult = await this.chatRoomRepository.updateRoomName(roomId, roomData);
            return result;
        } catch (err) {
            console.error('updateRoom Error:', err);
        }
    }

    async deleteRoom(roomId: number): Promise<Object> {
        await this.findOneRoom(roomId);
        try {
            const result: Object = {
                affected_message: (await this.chatMessageRepository.deleteRoomMessage(roomId)).affected,
                affected_room: (await this.chatRoomRepository.deleteRoom(roomId)).affected
            }
            return result;
        } catch (err) {
            console.error('deleteRoom Error:', err);
        }
    }

    async createMessage(messageData: CreateMessageDto): Promise<ChatMessage> {
        await this.findOneRoom(messageData.room_id);
        try {
            const result: ChatMessage = await this.chatMessageRepository.createMessage(messageData.room_id, messageData.user_name, messageData.language, messageData.message_text);
            return result;
        } catch (err) {
            console.error('createMessage Error:', err);
        }
    }

    // =================================================
    // ==================== Message ====================
    // =================================================

    async findMessage(messageData: FindMessageDto): Promise<ChatMessage[]> {
        await this.findOneRoom(messageData.room_id);
        try {
            const result: ChatMessage[] = await this.chatMessageRepository.findRoomMessages(messageData.room_id, messageData?.send_at ?? new Date(Date.now()), messageData?.take ?? 20);
            return result;
        } catch (err) {
            console.error('findMessage Error:', err);
        }
    }

    async findOneMessage(messageId: number): Promise<ChatMessage> {
        let message: ChatMessage;
        try {
            message = await this.chatMessageRepository.findOneMessage(messageId);
            // console.log(message);
        } catch (err) {
            console.error('findOneMessage Error: ', err);
        }
        if (!message) throw new NotFoundException('Message ID를 찾을 수 없습니다');
        return message;
    }

    async updateMessage(messageId: number, messageData: UpdateMessageDto): Promise<UpdateResult> {
        await this.findOneMessage(messageId);
        try {
            const result = await this.chatMessageRepository.updateMessage(messageId, messageData);
            return result;
        } catch (err) {
            console.error('updateMessage Error:', err);
        }
    }
}