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
<summary><h3>채팅방 목록을 조회할 수 있습니다.</h3></summary>
<div markdown="1">
<img src="https://github.com/SD-PARK/papago-chat/assets/97375357/6f454e89-5cbe-44fb-b03b-0cd3237b1e75" width="700"/>

채팅방 목록과 접속 인원을 조회하고, 제목을 통해 특정 채팅방을 검색할 수 있습니다.

관련 코드는 다음과 같습니다.

```ts
/** === ChatGateway === **/
// 방 목록 페이지 접속 시, room 'list' 입장 및 방 목록 반환
@SubscribeMessage('joinList')
async handleJoinList(
    @ConnectedSocket() socket: Socket
) {
    try {
        socket.join('list');
        await this.handleGetRoomList(socket, '');
    } catch (err) {
        socket.emit('getRoomList', { error: 'Failed to get Room List' });
    }
}

/**
* 제목에 검색 인자가 포함된 채팅방 목록과 접속 인원을 반환합니다.
* @param socket - 연결 된 소켓
* @param roomName - 검색 인자
*/
@SubscribeMessage('getRoomList')
async handleGetRoomList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
) {
    try {
        const rooms: ChatRoom[] = await this.chatService.findRoom(roomName);
        
        const cntRooms = rooms.map((room) => {
            const roomIdString: string = room.room_id.toString();
            let cnt: number = 0;
            const getRoom = this.nsp.adapter.rooms.get(roomIdString);
            if(getRoom) cnt = getRoom.size;
            return { ...room, cnt };
        });
        socket.emit('getRoomList', cntRooms);
    } catch (err) {
        socket.emit('getRoomList', { error: 'Failed to get Room List' });
    }
}
```

```ts
/** === ChatService === **/
async findRoom(roomName: string): Promise<ChatRoom[]> {
    try {
        const result: ChatRoom[] = await this.chatRoomRepository.findRoom(roomName);
        return result;
    } catch (err) {
        console.error('findRoom Error:', err);
    }
}
```

```ts
/** === ChatRoomRepository === **/
/**
* 제목을 통해 채팅방을 조회합니다.
* @param roomName 조회할 채팅방의 제목에 포함된 문자열입니다.
* @returns 채팅방 데이터를 담은 배열을 반환합니다.
*/
async findRoom(roomName: string): Promise<ChatRoom[]> {
    const escapeRoomName = roomName.replace(/[%_]/g, '\\$&');
    return await this.find({ where: { room_name: Like(`%${escapeRoomName}%`) }});
}
```

채팅방 목록 페이지에 접속 시, 'list' Room에 입장됩니다.

'list'의 접속자들은 이후 목록 내 채팅방의 접속 인원이 변경되었을 경우 변경사항을 전달받습니다.

`getRoomList` 함수는 검색 인자를 통해 채팅방 목록과 접속 인원을 socket에게 전달하는 함수입니다.

TypeORM을 통해 DB에 저장된 채팅방 목록을 검색합니다.

Room 접속 후 `getRoomList` 함수를 실행해 목록을 불러옵니다.

</div>
</details>

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

<details>
<summary><h3>메시지를 주고 받을 수 있습니다.</h3></summary>
<div markdown="1">
<img src="https://github.com/SD-PARK/papago-chat/assets/97375357/bcaeff4c-1786-4d04-9827-f3d17ca42389" width="700"/>

채팅을 입력해 같은 채팅방의 사람들과 실시간으로 메시지를 주고 받을 수 있습니다.

관련 코드는 다음과 같습니다.

```ts
/** === ChatGateway === **/
// 메시지 수신 시 DB에 추가 후 동일한 채팅방의 유저들에게 전송 (미번역문 전송)
@SubscribeMessage('message')
@UsePipes(ValidationPipe)
@UseFilters(BadRequestExceptionFilter)
async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: CreateMessageDto,
) {
    const roomIdString = data.room_id.toString();
    const socket_ip = this.getIP(socket);
    const includedIpData: CreateMessageDto = { ...data, ip: socket_ip, }
    try {
        const message: ChatMessage = await this.chatService.createMessage(includedIpData);
        this.nsp.to(roomIdString).emit('message', message);
    } catch (err) {
        this.logger.error(err);
        // 메시지 전송 실패 알림
        socket.emit('error', { message: 'Failed to send message', data: includedIpData });
    }
}

// socket의 IP 앞 2자리를 가져옵니다.
getIP(socket: Socket): string {
    try {
        const rawAddress = socket.handshake.address;
        const ipAddress = rawAddress.split(':').pop();
        if (ipAddress && typeof ipAddress === 'string')
            return ipAddress.split('.').slice(0, 2).join('.');
        else
            throw new Error('Invalid IP address');
    } catch (err) {
        this.logger.error('Error getIP:', err.message);
        return null;
    }
}
```

```ts
/** === CreateMessageDto === **/
export class CreateMessageDto {
    @IsNumber()
    @Min(0)
    readonly room_id: number;
    
    @IsString()
    @MaxLength(45)
    readonly user_name: string;
    
    @IsString()
    @IsIn(appConfig.supportedLanguage)
    readonly language: string;
    
    @IsString()
    @IsOptional()
    @MaxLength(7)
    readonly ip?: string;
    
    @IsString()
    @MaxLength(1000)
    readonly message_text: string;
    
    @IsString()
    @IsOptional()
    readonly ko_text?: string;
    
    @IsString()
    @IsOptional()
    readonly en_text?: string;
    
    @IsString()
    @IsOptional()
    readonly ja_text?: string;
}
```

데이터의 실시간 송수신을 위해 Socket.io 패키지를 이용했습니다.

채팅을 송신한 클라이언트로부터 채팅방 ID, 유저 이름, 이용 언어, 텍스트가 포함된 객체를 입력받습니다.

필요한 데이터가 누락된 경우, ValidationPipe를 통해 `BadRequestException`을 반환합니다.

socket에서 송신자 IP를 가져와 DB에 입력한 뒤, DB에 입력된 데이터(수신받은 데이터)를 같은 채팅방의 유저들에게 전송합니다.

**이 과정에서 메시지 번역은 진행하지 않습니다.** 이는 불필요한 번역 요청을 방지하기 위함입니다.

만약 채팅방 내의 인원이 모두 같은 언어를 이용하는 사람들이라면,

다른 언어로의 번역 요청이 불필요한 자원의 낭비로 이어질 수 있기 때문에 미번역 텍스트에 대한 번역은 메시지를 수신한 클라이언트로부터 요청받은 뒤 진행합니다.

</div>
</details>

<details>
<summary><h3>메시지를 실시간으로 번역할 수 있습니다.</h3></summary>
<div markdown="1">
<img src="https://github.com/SD-PARK/papago-chat/assets/97375357/4283e88c-a3f9-4602-9d4b-0babcb10e838" width="410"/>
<img src="https://github.com/SD-PARK/papago-chat/assets/97375357/796f0d3d-d8af-4b9f-9554-24d0f97fe363" width="410"/>

수신한 메시지를 본인이 설정한 언어로 실시간으로 번역할 수 있습니다.

관련 코드는 다음과 같습니다.

```ts
/** === ChatGateway === **/
private readonly MAX_RETRY_LIMIT: number = 5; // 번역 재요청 최대 횟수
private readonly RETRY_INTERVAL: number = 500; // 번역 재요청 간격(ms)
private translateStatus: Set<string> = new Set<string>(); // 번역이 진행 중인 메시지+언어

// 번역 요청 시 번역 상태 확인 및(이미 번역되어 있으면 그대로 반환) 번역 후 DB 저장, 반환
@SubscribeMessage('reqTranslate')
@UsePipes(ValidationPipe)
@UseFilters(BadRequestExceptionFilter)
async handleReqTranslate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: ReqTranslateDto
) {
    try {
        // 번역 완료된 텍스트인지 확인
        const message: ChatMessage = await this.chatService.findOneMessage(data.message_id);
        if (message[`${data.language}_text`]) return message;
        
        // 번역 중인 텍스트인지 확인
        const requestKey = `${data.message_id}_${data.language}`;
        
        if (this.translateStatus.has(requestKey)) {
            const retryCount = data.retryCount ?? 0;
            if (data.retryCount >= this.MAX_RETRY_LIMIT) {
                return { error: 'Translation Failed' };
            } else {
                await this.delay(this.RETRY_INTERVAL);
                return this.handleReqTranslate(socket, { ...data, retryCount: retryCount + 1});
            }
        }
        
        // 번역 중이 아닌 경우, 번역 시작
        this.translateStatus.add(requestKey);
        try {
            const tMessage: string = await this.papagoService.translate(message.language, data.language, message.message_text);
            await this.chatService.updateMessage(data.message_id, {
                [`${data.language}_text`]: tMessage,
            });
            message[`${data.language}_text`] = tMessage;
            return message;
        } catch(err) {
            return { error: 'Translation Failed' };
        } finally {
            this.translateStatus.delete(requestKey);
        }
    } catch (err) {
        return { error: 'Translation Failed' };
    }
}
```

클라이언트로부터 메시지 번역 요청을 받았을 때, 서버는 다음과 같은 절차로 해당 요청을 처리합니다.

**번역 완료된 메시지와 언어인지 확인 >> 번역 중인 메시지와 언어인지 확인 >> 번역 시작**

번역이 이미 완료되었다면 완료된 번역을 반환합니다.

번역 중인 메시지라면 해당 번역이 완료될 때까지 요청을 대기합니다. 번역 중인 메시지는 `메시지 ID_언어 코드`의 형태로 `translateStatus` 변수에 저장됩니다.

메시지가 번역 중일 때 대기시키는 이유는 API에 같은 내용의 번역을 요청하는 경우를 방지하기 위함입니다. 요청 대기시간은 `MAX_RETRY_LIMIT`(번역 재요청 최대 횟수) 변수와 `RETRY_INTERVAL`(번역 재요청 간격) 변수의 값에 따라 달라집니다.

만약 번역이 완료되지 않았고, 번역 중인 메시지도 아니라면 번역을 시작합니다.

번역이 시작되면 `translateStatus' 변수에 번역 내용을 저장하고, 번역이 완료된 뒤 `translateStatus` 변수에서 해당 값을 제거합니다.

번역 기능은 Papago의 번역 API를 `Axios` 패키지를 통해 호출하여 이용합니다. 자세한 코드는 아래를 참고하세요.

```ts
/** === PapagoService === **/
constructor(
        private readonly axiosService: AxiosService,
        private readonly configService: ConfigService,
        private languageCode: string[] = appConfig.supportedLanguage,
) {}

async translate(source: string, target: string, text: string): Promise<string> {
    this.validate(source, target, text);
    
    if (source === target) return text;
    
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
    if (!this.languageCode.includes(source))
        throw new Error('source 속성의 언어 코드가 유효하지 않습니다.');
    if(!this.languageCode.includes(target))
        throw new Error('target 속성의 언어 코드가 유효하지 않습니다.');
    if(text.trim() === "")
        throw new Error('text 속성에 유효한 문자열이 입력되어야 합니다.');
}
```

</div>
</details>
