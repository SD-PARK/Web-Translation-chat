import { CustomRepository } from "src/config/typeorm_ex/typeorm-ex.decorator";
import { ChatMessage } from "./chat_messages.entity";
import { DeleteResult, LessThan, Repository, UpdateResult } from "typeorm";
import { UpdateMessageDto } from "./dto/update_message.dto";

@CustomRepository(ChatMessage)
export class ChatMessageRepository extends Repository<ChatMessage> {
    /**
     * 메시지를 조회합니다. 특정 방에서 특정 일시 이전에 전송된 메시지를 가져옵니다.
     * @param roomId 조회하고자 하는 채팅방의 고유 식별자(ID)입니다.
     * @param sendAt 특정 일시 이전에 전송된 메시지를 조회하기 위한 기준 시간입니다.
     * @param take 가져올 메시지의 최대 개수입니다.
     * @returns 메시지 데이터를 담은 배열을 반환합니다.
     */
    async findRoomMessages(roomId: number, sendAt: Date, take: number): Promise<ChatMessage[]> {
        const messages: ChatMessage[] = await this.find({
            where: {
                room_id: roomId,
                send_at: LessThan(sendAt),
            },
            take: take,
            order: {
                send_at: 'DESC',
            },
        });
        return messages;
    }

    /**
     * ID를 통해 메시지를 조회합니다.
     * @param messageId 조회하고자 하는 메시지의 고유 식별자(ID)입니다.
     * @returns 메시지 데이터를 반환합니다.
     */
    async findOneMessage(messageId: number): Promise<ChatMessage> {
        const message: ChatMessage = await this.findOne({ where: { message_id: messageId } });
        return message;
    }

    /**
     * 새 메시지를 생성합니다.
     * @param roomId 메시지가 전송된 채팅방의 고유 식별자(ID)입니다.
     * @param userName 메시지를 전송한 사람의 이름입니다.
     * @param language 원본 메시지의 언어입니다.
     * @param messageText 전송한 메시지의 문자열 데이터입니다.
     * @returns 생성한 메시지 데이터를 반환합니다.
     */
    async createMessage(roomId: number, userName: string, language: string, messageText: string): Promise<ChatMessage> {
        const newEntity: ChatMessage = this.create({
            room_id: roomId,
            user_name: userName,
            language: language,
            message_text: messageText,
        });
        await this.save(newEntity);
        return newEntity;
    }

    /**
     * 메시지의 데이터를 변경합니다.
     * @param messageId 변경할 메시지의 고유 식별자(ID)입니다.
     * @param updateData 변경할 데이터가 담긴 객체입니다.
     * @returns 결과를 반환합니다.
     */
    async updateMessage(messageId: number, updateData: UpdateMessageDto): Promise<UpdateResult> {
        const result:UpdateResult = await this.update(messageId, updateData);
        return result;
    }

    /**
     * 특정 Room의 메시지를 삭제합니다.
     * @param roomId 메시지를 삭제할 채팅방의 고유 식별자(ID) 입니다.
     * @returns 결과를 반환합니다.
     */
    async deleteRoomMessage(roomId: number): Promise<DeleteResult> {
        const deletedEntities: DeleteResult = await this.delete({ room_id: roomId });
        return deletedEntities;
    }
}