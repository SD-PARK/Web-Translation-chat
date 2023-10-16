# Papago-Chat V2

![chat-nomem-ko](https://github.com/SD-PARK/papago-chat/assets/97375357/ddf78f0e-4861-490f-8fca-b69892ef7e5e)
![chat-nomem-en](https://github.com/SD-PARK/papago-chat/assets/97375357/c80c1098-6871-4dbe-8fc5-37b83d3201db)

## 개요

- **프로젝트 명**: Papago Chat V2
- **개발 인원**: 1명
- **개발 기간**: 2023.09 ~ 10
- **주요 기능**:
    - 채팅방
        - 채팅방 목록 및 접속 인원 조회
        - 채팅방 개설
        - 일정 기간(7일) 채팅이 갱신되지 않은 방 주기적 제거
    - 채팅
        - 채팅 로그 조회
        - 실시간 텍스트 송수신 및 번역
        - 사용 언어 변경
- **개발 언어**: Nest.js
- **개발 환경**: VS Code
- **데이터베이스**: MySQL
- **간단 소개**:

  팀 프로젝트로 제작했던 '실시간 번역 메신저 앱'을 개선하기 위해 노력했습니다.

  파파고의 번역 API와 Socket을 활용하여 실시간 번역 채팅 기능을 성공적으로 구현했습니다.

  유저들은 언어 장벽을 극복해 다국어로 대화를 나눌 수 있습니다.
  
- **테스트 링크**: http://papago-chat.site
<!--
## 기능 상세 설명

<details>
<summary>Controller, Gateway - Service</summary>
<div markdown="1">
    - 하나둘셋넷
    
</div>
</details>

<details>
<summary>Validation Pipe - DTO</summary>
<div markdown="1">
</div>
</details>

<details>
<summary>Jest</summary>
<div markdown="1">
</div>
</details>

<details>
<summary>Axios - Papago API</summary>
<div markdown="1">
</div>
</details>

<details>
<summary>Mysql - TypeORM -Entity, Repository</summary>
<div markdown="1">
</div>
</details>

<details>
<summary>Schedule</summary>
<div markdown="1">
</div>
</details>
!-->
## ERD

![chat-nomem](https://github.com/SD-PARK/papago-chat/assets/97375357/6a27704e-1fde-48e8-ab1c-9883ec537258)

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
