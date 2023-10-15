## ERD

![chat-nomem](https://github.com/SD-PARK/papago-chat/assets/97375357/5e56a34e-dbcd-4bd9-b28a-dccb09836dd9)

<details>
<summary>Entity</summary>
<div markdown="1">

    @PrimaryGeneratedColumn()
    room_id: number;

    @Column({ length: 30, nullable: false })
    room_name: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @OneToMany(() => ChatMessage, chatMessage => chatMessage.chatRoom)
    @JoinColumn({ name: 'room_id' })
    chatMessages: ChatRoom;
    
</div>
<div markdown="2">
  
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
    
</div>
</details>

## CODE
```ts
const languageCode: string[] = ['ko', 'en', 'ja', 'zh-CN', 'zh-TW'];

async translate(source: string, target: string, text: string): Promise<string> {
    this.validate(source, target, text);

    const url = 'https://openapi.naver.com/v1/papago/n2mt';
    try {
        const result = await this.axiosService.post(url, {
            source: source,
            target: target,
            text: text,
        },
        { headers:
            {
                'X-Naver-Client-Id': this.configService.get<string>('NAVER_CLIENT_ID'),
                'X-Naver-Client-Secret': this.configService.get<string>('NAVER_CLIENT_SECRET'),
            }
        });
        return result.data.message.result.translatedText;
    } catch (err) {
        throw new Error('번역 요청 중 오류가 발생했습니다.');
    }
}

validate(source: string, target: string, text: string) {
    if (!languageCode.includes(source))
        throw 'source 속성의 언어 코드가 유효하지 않습니다.';
    if(!languageCode.includes(target))
        throw 'target 속성의 언어 코드가 유효하지 않습니다.';
    if(text.trim() === "")
        throw 'text 속성에 유효한 문자열이 입력되어야 합니다.';
}
```

```ts
@CustomRepository(ChatRoom)
export class ChatRoomRepository extends Repository<ChatRoom> {
    /**
     * ID를 통해 채팅방을 조회합니다.
     * @param roomId 조회할 채팅방의 고유 식별자(ID)입니다.
     * @returns 채팅방 데이터를 반환합니다.
     */
    async findOneRoom(roomId: number): Promise<ChatRoom> {
        return await this.findOne({ where: { room_id: roomId } });
    }

    /**
     * 모든 채팅방을 조회합니다.
     * @returns 채팅방 데이터를 담은 배열을 반환합니다.
     */
    async findAllRoom(): Promise<ChatRoom[]> {
        return await this.find();
    }

    /**
     * 7일 이상 채팅 입력이 없는 채팅방을 조회합니다.
     * @returns 7일 이상 채팅 입력이 없는 채팅방 데이터를 담은 배열입니다.
     */
    async findObsoleteRoom(): Promise<ChatRoom[]> {
        const sevenDaysAgo:Date = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
        const obsoleteRoom: ChatRoom[] = await this
            .createQueryBuilder('chatRoom')
            .leftJoin('chatRoom.chatMessages', 'chatMessage', 'chatMessage.send_at >= :sevenDaysAgo', { sevenDaysAgo })
            .where('chatMessage.send_at IS NULL')
            .getMany();
        return obsoleteRoom;
    }

    /**
     * 채팅방을 생성합니다.
     * @param roomName 생성할 채팅방의 이름입니다.
     * @returns 생성한 채팅방 데이터를 반환합니다.
     */
    async createRoom(roomName: string): Promise<ChatRoom> {
        const newEntity: ChatRoom = this.create({ room_name: roomName });
        await this.save(newEntity);
        return newEntity;
    }

    /**
     * 채팅방을 삭제합니다.
     * @param roomId 삭제할 채팅방의 고유 식별자(ID)입니다.
     */
    async deleteRoom(roomId: number) {
        await this.delete(roomId);
    }

    /**
     * 채팅방의 이름을 변경합니다.
     * @param roomId 이름을 변경할 채팅방의 고유 식별자(ID)입니다.
     * @param roomName 변경할 이름입니다.
     * @returns 변경한 채팅방 데이터를 반환합니다.
     */
    async updateRoomName(roomId: number, roomName: string): Promise<ChatRoom> {
        const updateEntity: ChatRoom = await this.findOneRoom(roomId);
        updateEntity.room_name = roomName;
        await this.save(updateEntity);
        return updateEntity;
    }
}
```