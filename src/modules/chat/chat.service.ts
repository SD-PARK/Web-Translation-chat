import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ChatMessageRepository } from './repositories/chat_messages.repository';
import { ChatRoomRepository } from './repositories/chat_rooms.repository';
import { CreateMessageDto } from './dto/chat_messages/create_message.dto';
import { FindMessageDto } from './dto/chat_messages/find_message.dto';
import { CreateRoomDto } from './dto/chat_rooms/create_room.dto';
import { UpdateRoomDto } from './dto/chat_rooms/update_room.dto';
import { ChatRoom } from './entities/chat_rooms.entity';
import { ChatMessage } from './entities/chat_messages.entity';
import { UpdateMessageDto } from './dto/chat_messages/update_message.dto';
import { UpdateResult } from 'typeorm';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ChatService {
    constructor(
        private readonly chatMessageRepository: ChatMessageRepository,
        private readonly chatRoomRepository: ChatRoomRepository,
    ) {}

    private readonly logger = new Logger(ChatService.name);

    // ================================================
    // =================== Schedule ===================
    // ================================================

    @Cron('* 0 * * * *') // 매 시 정각에 실행
    async handleCron() {
        try {
            const obsoleteRooms:ChatRoom[] = await this.chatRoomRepository.findObsoleteRoom();
            this.logger.log('이용되지 않는 방을 제거합니다.');
            this.logger.log('제거한 방 목록: ');
            for (let room of obsoleteRooms) {
                await this.deleteRoom(room.room_id);
                this.logger.log(`ID: ${room.room_id} | TITLE: ${room.room_name}`);
            }
        } catch (err) {
            this.logger.error(err);
        }
    }

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

    // =================================================
    // ==================== Message ====================
    // =================================================

    async createMessage(messageData: CreateMessageDto): Promise<ChatMessage> {
        await this.findOneRoom(messageData.room_id);
        try {
            const result: ChatMessage = await this.chatMessageRepository.createMessage(messageData.room_id, messageData.user_name, messageData.language, messageData.message_text, messageData.ip);
            return result;
        } catch (err) {
            console.error('createMessage Error:', err);
        }
    }

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