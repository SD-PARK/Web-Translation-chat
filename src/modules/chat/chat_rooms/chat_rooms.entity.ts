import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from "typeorm";
import { ChatMessage } from "../chat_messages/chat_messages.entity";

@Entity('chat_rooms')
export class ChatRoom extends BaseEntity {
    @PrimaryGeneratedColumn()
    room_id: number;

    @Column({ length: 30, nullable: false })
    room_name: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @OneToMany(() => ChatMessage, chatMessage => chatMessage.chatRoom)
    @JoinColumn({ name: 'room_id' })
    chatMessages: ChatMessage[];
}