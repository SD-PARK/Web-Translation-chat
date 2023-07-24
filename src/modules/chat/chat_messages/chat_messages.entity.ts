import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatRoom } from '../chat_rooms/chat_rooms.entity';

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
    language: string;

    @Column({ type: 'text', nullable: false })
    message_text: string;

    @ManyToOne(() => ChatRoom, chatRoom => chatRoom.chatMessages)
    @JoinColumn({ name: 'room_id' })
    chatRoom: ChatRoom;
}