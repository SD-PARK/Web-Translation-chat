import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatRoom } from './chat_rooms.entity';
import { IsIn } from 'class-validator';

@Entity('chat_messages')
export class ChatMessage extends BaseEntity {
    @PrimaryGeneratedColumn()
    message_id: number;

    @Column({ nullable: false })
    room_id: number;

    @Column({ length: 45, nullable: false })
    user_name: string;
    
    @Column({ default: () => 'CURRENT_TIMESTAMP'})
    send_at: Date;

    @Column({ length: 5, nullable: false })
    @IsIn(['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'vi', 'id', 'th', 'th', 'de', 'ru', 'es', 'it', 'fr'])
    language: string;
    
    @Column({ length: 7, nullable: false, default: '000.00'})
    ip: string;

    @Column({ type: 'text', nullable: false })
    message_text: string;

    @Column({ type: 'text' })
    ko_text?: string;

    @Column({ type: 'text' })
    en_text?: string;

    @Column({ type: 'text' })
    ja_text?: string;

    @ManyToOne(() => ChatRoom, chatRoom => chatRoom.chatMessages)
    @JoinColumn({ name: 'room_id' })
    chatRoom: ChatRoom;
}