import { CustomRepository } from "src/config/typeorm_ex/typeorm-ex.decorator";
import { DeleteResult, Like, Repository, UpdateResult } from "typeorm";
import { ChatRoom } from "./chat_rooms.entity";
import { UpdateRoomDto } from "./dto/update_room.dto";

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
     * 제목을 통해 채팅방을 조회합니다.
     * @param roomName 조회할 채팅방의 제목에 포함된 문자열입니다.
     * @returns 채팅방 데이터를 담은 배열을 반환합니다.
     */
    async findRoom(roomName: string): Promise<ChatRoom[]> {
        const escapeRoomName = roomName.replace(/[%_]/g, '\\$&');
        return await this.find({ where: { room_name: Like(`%${escapeRoomName}%`) }});
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
        const createdEntity: ChatRoom = await this.save(newEntity);
        return createdEntity;
    }

    /**
     * 채팅방을 삭제합니다.
     * @param roomId 삭제할 채팅방의 고유 식별자(ID)입니다.
     */
    async deleteRoom(roomId: number): Promise<DeleteResult> {
        return await this.delete({ room_id: roomId });
    }

    /**
     * 채팅방의 이름을 변경합니다.
     * @param roomId 이름을 변경할 채팅방의 고유 식별자(ID)입니다.
     * @param roomData 변경할 데이터를 포함한 객체입니다.
     * @returns 변경한 채팅방 데이터를 반환합니다.
     */
    async updateRoomName(roomId: number, updateData: UpdateRoomDto): Promise<UpdateResult> {
        const result: UpdateResult = await this.update(roomId, updateData);
        return result;
    }
}