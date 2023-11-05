# Papago-Chat V2

<img src="https://github.com/SD-PARK/papago-chat/assets/97375357/ddf78f0e-4861-490f-8fca-b69892ef7e5e" width="400"/>
<img src="https://github.com/SD-PARK/papago-chat/assets/97375357/c80c1098-6871-4dbe-8fc5-37b83d3201db" width="400"/>

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

## ERD

![chat-nomem](https://github.com/SD-PARK/papago-chat/assets/97375357/6a27704e-1fde-48e8-ab1c-9883ec537258)

## 기능 및 코드

<details>
<summary><h3>방을 생성할 수 있습니다</h3></summary>
<div markdown="1">
<img src="https://github.com/SD-PARK/papago-chat/assets/97375357/9dc98e60-d1e9-481a-bbfd-ed38dc4b4c39" width="700"/>
    
우측 하단의 버튼을 통해 새로운 채팅방을 생성할 수 있습니다.

생성된 채팅방은 7일 간 새로운 채팅이 입력되지 않을 시 자동으로 삭제됩니다.

관련 코드는 다음과 같습니다.

<h4>방 생성 관련</h4>

```ts
/** === ChatService === **/
@SubscribeMessage('postRoom')
@UsePipes(ValidationPipe)
@UseFilters(BadRequestExceptionFilter)
async handlePostRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomData: CreateRoomDto,
) {
    try {
        const createdRoom: ChatRoom = await this.chatService.createRoom(roomData);
        this.nsp.to('list').emit('update', createdRoom);
        return { status: 'success', room_id: createdRoom.room_id };
    } catch (err) {
        socket.emit('error', { message: 'Failed to Create a New Room' });
    }
}
```

ValidationPipe와 DTO를 통해 전달받은 값에 대한 유효성 검사를 진행 후, 방을 생성합니다.

<h4>방 삭제 관련</h4>

```ts
/** === ChatService === **/
@Cron('0 0 * * * *') // 매 시 정각에 실행
async handleCron() {
    try {
        const obsoleteRooms:ChatRoom[] = await this.chatRoomRepository.findObsoleteRoom();
        this.logger.log('이용되지 않는 방을 제거합니다.');
        this.logger.log('제거한 방 목록: ');
        for (let room of obsoleteRooms) {
            await this.deleteRoom(room.room_id);
            this.logger.log(`ID: ${room.room_id} | TITLE: ${room.room_name}`);
        }
    } catch (err) {
        this.logger.error(err);
    }
}

/** === ChatRoomRepository === **/
async findObsoleteRoom(): Promise<ChatRoom[]> {
    const sevenDaysAgo:Date = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    const obsoleteRoom: ChatRoom[] = await this
        .createQueryBuilder('chatRoom')
        .leftJoin('chatRoom.chatMessages', 'chatMessage', 'chatMessage.send_at >= :sevenDaysAgo', { sevenDaysAgo })
        .where('chatMessage.send_at IS NULL')
        .getMany();
    return obsoleteRoom;
}
```

Schedule 패키지를 통해 매 시 정각에 7일 간 채팅 입력이 없었던 방을 탐색, 제거합니다.

</div>
</details>

<details>
<summary><h3>이름과 언어를 변경할 수 있습니다</h3></summary>
<div markdown="1">
<img src="https://github.com/SD-PARK/papago-chat/assets/97375357/0fd97337-5ad0-430f-bb7e-59331931743c" width="700"/>

채팅방 내에서 다른 유저에게 표시될 이름과 사용 언어를 변경할 수 있습니다.

사용 언어를 변경하면 페이지에 출력되는 텍스트 또한 해당 언어로 변경됩니다.

관련 코드는 다음과 같습니다.

```ts
private personMap: Map<string, object> = new Map<string, {name: string, ips: string, language?: string}>();

// 닉네임 변경
@SubscribeMessage('switchName')
@UsePipes(ValidationPipe)
@UseFilters(BadRequestExceptionFilter)
async handleSwitchName(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: SwitchNameDto,
) {
    try {
        const originData = this.personMap.get(socket.id);
        if (originData) {
            const roomIdString = data.room_id.toString();
            this.personMap.set(socket.id, { ...originData, name: data.name });
            this.nsp.to(roomIdString).emit('get-person-data', this.getPersons(roomIdString));
        }
    } catch (err) {
        socket.emit('error', { message: 'Name conversion failed' });
    }
}

// 사용 언어 변경
@SubscribeMessage('switchLanguage')
@UsePipes(ValidationPipe)
@UseFilters(BadRequestExceptionFilter)
async handleSwitchLanguage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: SwitchLanguageDto,
) {
    try {
        const originData = this.personMap.get(socket.id);
        if (originData) {
            const roomIdString = data.room_id.toString();
            this.personMap.set(socket.id, { ...originData, language: data.language });
            this.nsp.to(roomIdString).emit('get-person-data', this.getPersons(roomIdString));
        }
    } catch (err) {
        socket.emit('error', { message: 'Language conversion failed' });
    }
}

// 특정 룸의 접속 인원 정보를 가져옵니다.
getPersons(roomId: string): object[] {
    const roomPerson = this.nsp.adapter.rooms.get(roomId);
    const persons = Array.from(roomPerson).map((socketId) => {
        return this.personMap.get(socketId);
    });
    return persons;
}
```

Socket ID를 Key로 접속 중인 유저의 정보를 저장하는 personMap 변수에 변경된 유저 정보를 저장하고,

같은 방에 접속한 유저들에게 갱신된 대화상대 목록을 전달합니다.

</div>
</details>
