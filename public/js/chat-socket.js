const socket = io('/chat');

let user_name;
let room_id = window.location.href.split('/')[4];
let peoples = new Map();
let messages = [];
let isTranslating = false;

socket.on('connect', () => {
    console.log('Server Connnected');
    inputName.val(socket.io.nsps['/chat'].id);
    inputLanguage.css('background-image', `url('../img/flag/${language}.png')`);

    // 메시지 수신
    socket.on('message', (response) => {
        messages.unshift(response);
        checkTranslatedLog(response);
    });

    // 대화상대 갱신
    socket.on('person-update', (response) => {
        chatPersons.empty();
        for (const person of response) {
            updatePerson(person);
        }
        chatPersonCnt.text(response.length);
    });

    // 서버로부터 IP 전달받아 저장
    socket.on('sendIP', (ip) => {
        winIP = ip;
    });

    // ValidationPipe Error
    socket.on('error', (err) => {
        console.log(err);
        switch (err.message) {
            case 'name must be longer than or equal to 1 characters': // 이름 1글자 미만
                loadModal(errorApp(text[language]['이름을 1글자 이상 입력하세요.']));
                timerCloseAlert(3);
                break;
            case 'name must be shorter than or equal to 45 characters': case 'user_name must be shorter than or equal to 45 characters': // 이름 45자 초과
                loadModal(errorApp(text[language]['이름은 45자 이내로 작성해주세요.']));
                timerCloseAlert(3);
                break;
            case 'Name conversion failed': // 이름 변경 실패
                loadModal(errorApp(text[language]['이름을 변경하지 못했습니다.']));
                timerCloseAlert(3);
                break;
            case 'message_text must be shorter than or equal to 1000 characters': // 메시지 1000자 초과
                loadModal(errorApp(text[language]['메시지는 1000자 이내로 작성해주세요.']));
                timerCloseAlert(3);
                break;
            case 'Failed to send message': // 메시지 송신 실패
                addLog(err.data);
                break;
            case 'Failed to load messages': // 이전 메시지 수신 실패
                loadModal(errorApp(text[language]['메시지를 불러올 수 없습니다.']));
                timerCloseAlert(3);
                break;
        }
    });

    // 방 입장
    socket.emit('joinRoom', { room_id: room_id }, (roomData) => {
        if (roomData.error) {
            // 서버에서 오류 응답이 돌아온 경우
            // 입장 불가 알림 표시 후 방 목록 페이지로 돌아가기
            console.error('오류 발생', roomData.error);
            loadModal(errorApp(text[language]['방 정보 불러오기 실패'], text[language]['초 뒤 목록 페이지로 돌아갑니다.']));
            timerCloseAlert(5).then(() => {
                location.href = '/';
            });
        } else {
            // 정상적인 응답을 받은 경우
            $('#room-name').html(roomData?.room_data?.room_name ?? '');
            chatLogs.empty();
            messageOrganize(roomData?.message_data);
            printMessage();
            chatLogs.scrollTop(chatLogs.prop('scrollHeight'));
        }
    });
});

// 수신받은 메시지를 messages 변수에 저장합니다.
function messageOrganize(getMessages) {
    for(let message of getMessages) {
        messages.push(message);
    }
}

// 메시지 전송 이벤트
function emitMessage() {
    user_name = inputName.val();
    const messageData = {
        room_id: parseInt(room_id),
        user_name: user_name,
        language: language,
        message_text: $('#input-text').val(),
    };
    emptyTextarea();
    socket.emit('message', messageData);
}

// 닉네임 변경 이벤트
function switchName() {
    const data = {
        room_id: parseInt(room_id),
        name: inputName.val(),
    }
    socket.emit('switchName', data);
}

// 메시지 번역 여부 체크 후 로그 출력
function checkTranslatedLog(message) {
    const translatedMessage = message[`${language}_text`];
    if (translatedMessage) {
        const translatedData = { ...message, message_text: translatedMessage };
        addLog(translatedData);
    } else if (message.language !== language) {
        addLog(message);
        translate(message.message_id);
    } else {
        addLog(message);
    }
}

/**
 * 메시지를 번역합니다.
 * @param {number} id - 메시지 ID
 */
function translate(id) {
    addLoading(id);
    isTranslating = true;
    socket.emit('reqTranslate', { message_id: id, language: language }, (response) => {
        if (response.error) {
            // 서버에서 오류 응답이 돌아온 경우
            replaceLog(id, '[Translation Failed]');
            removeLoading(id);
            isTranslating = false;
        } else {
            // 정상적인 응답을 받은 경우
            const foundIndex = messages.findIndex(msg => msg.message_id === id);
            if (foundIndex !== -1)
                messages[foundIndex] = response;
            replaceLog(id, response[`${language}_text`]);
            removeLoading(id);
            isTranslating = false;
        }
    });
}

/** 
 * 이전 메시지를 불러옵니다.
 */
async function getMessage() {
    const data = {
        room_id: room_id,
        send_at: messages[messages.length-1].send_at,
    }
    await socket.emit('getMessage', data, async (response) => {
        messageOrganize(response);
        printMessage();
    });
}