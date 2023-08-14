import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRoom } from './chat_rooms/chat_rooms.entity';
import { CreateRoomDto } from './chat_rooms/dto/create_room.dto';
import { UpdateRoomDto } from './chat_rooms/dto/update_room.dto';
import { DeleteResult } from 'typeorm';
import { FindMessageDto } from './chat_messages/dto/find_message.dto';
import { CreateMessageDto } from './chat_messages/dto/create_message.dto';
import { ChatMessage } from './chat_messages/chat_messages.entity';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('/room')
    async getRoomAll(): Promise<ChatRoom[]> {
        return await this.chatService.findRoom('');
    }

    @Get('/room/:name')
    async getRoom(@Param('name') roomName: string): Promise<ChatRoom[]> {
        return await this.chatService.findRoom(roomName);
    }

    @Post('/room')
    async createRoom(@Body() roomData: CreateRoomDto): Promise<ChatRoom> {
        return await this.chatService.createRoom(roomData);
    }

    @Patch('/room/:id')
    async updateRoom(@Param('id') id: number, @Body() roomData: UpdateRoomDto): Promise<ChatRoom> {
        return await this.chatService.updateRoom(id, roomData);
    }
    
    @Delete('/room/:id')
    async deleteRoom(@Param(':id') id: number): Promise<DeleteResult> {
        return await this.chatService.deleteRoom(id);
    }

    @Get('/message')
    async getMessage(@Query() messageData: FindMessageDto): Promise<ChatMessage[]> {
        return await this.chatService.findMessage(messageData);
    }

    @Post('/message')
    async createMessage(@Body() messageData: CreateMessageDto): Promise<ChatMessage> {
        return await this.chatService.createMessage(messageData);
    }
}