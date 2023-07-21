import { CustomRepository } from "src/config/typeorm_ex/typeorm-ex.decorator";
import { Repository } from "typeorm";
import { ChatRoom } from "./chat_rooms.entity";

@CustomRepository(ChatRoom)
export class ChatRoomRepository extends Repository<ChatRoom> {
    /**
     * ID를 통해 채팅방을 조회합니다.
     * @param room_id 조회할 채팅방의 고유 식별자(ID)입니다.
     * @returns 채팅방 데이터를 반환합니다.
     */
    async findOneRoom(room_id: number): Promise<ChatRoom> {
        return await this.findOne({ where: { room_id: room_id } });
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
        const obsoleteRoom: ChatRoom[] = await this
            .createQueryBuilder('chatRoom')
            .leftJoin('chatRoom.chatMessages', 'chatMessage', 'chatMessage.send_at >= :sevenDaysAgo', {
                sevenDaysAgo: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000))
            })
            .where('chatMessage.send_at IS NULL')
            .getMany();
        return obsoleteRoom;
    }

    /**
     * 채팅방을 생성합니다.
     * @param room_name 생성할 채팅방의 이름입니다.
     * @returns 생성한 채팅방 데이터를 반환합니다.
     */
    async createRoom(room_name: string): Promise<ChatRoom> {
        const newEntity: ChatRoom = this.create({ room_name: room_name });
        await this.save(newEntity);
        return newEntity;
    }

    /**
     * 채팅방을 삭제합니다.
     * @param room_id 삭제할 채팅방의 고유 식별자(ID)입니다.
     */
    async deleteRoom(room_id: number) {
        await this.delete(room_id);
    }

    /**
     * 채팅방의 이름을 변경합니다.
     * @param room_id 이름을 변경할 채팅방의 고유 식별자(ID)입니다.
     * @param room_name 변경할 이름입니다.
     * @returns 변경한 채팅방 데이터를 반환합니다.
     */
    async updateRoomName(room_id: number, room_name: string): Promise<ChatRoom> {
        const updateEntity: ChatRoom = await this.findOneRoom(room_id);
        updateEntity.room_name = room_name;
        await this.save(updateEntity);
        return updateEntity;
    }
}