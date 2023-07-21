import { CustomRepository } from "src/config/typeorm_ex/typeorm-ex.decorator";
import { ChatMessage } from "./chat_messsages.entity";
import { LessThan, Repository } from "typeorm";

@CustomRepository(ChatMessage)
export class ChatMessageRepository extends Repository<ChatMessage> {
    /**
     * 메시지를 조회합니다. 특정 방에서 특정 일시 이전에 전송된 메시지를 가져옵니다.
     * @param room_id 조회하고자 하는 채팅방의 고유 식별자(ID)입니다.
     * @param send_at 특정 일시 이전에 전송된 메시지를 조회하기 위한 기준 시간입니다.
     * @param take 가져올 메시지의 최대 개수입니다.
     * @returns 메시지 데이터를 담은 배열을 반환합니다.
     */
    async findRoomMessages(room_id: number, send_at: Date, take: number): Promise<ChatMessage[]> {
        const messages: ChatMessage[] = await this.find({
            where: {
                room_id: room_id,
                send_at: LessThan(send_at),
            },
            take: take,
        });
        return messages;
    }

    /**
     * 새 메시지를 생성합니다.
     * @param room_id 메시지가 전송된 채팅방의 고유 식별자(ID)입니다.
     * @param user_name 메시지를 전송한 사람의 이름입니다.
     * @param language 원본 메시지의 언어입니다.
     * @param message_text 전송한 메시지의 문자열 데이터입니다.
     * @returns 생성한 메시지 데이터를 반환합니다.
     */
    async createMessage(room_id: number, user_name: string, language: string, message_text: string): Promise<ChatMessage> {
        const newEntity: ChatMessage = this.create({
            room_id: room_id,
            user_name: user_name,
            language: language,
            message_text: message_text,
        });
        await this.save(newEntity);
        return newEntity;
    }
}