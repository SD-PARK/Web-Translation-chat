const socket = io('/chat');

let user_name;
let room_id = window.location.href.split('/')[4];
let language = selectedLanguage.val();
let messages = new Map();
let isTranslating = false;

socket.on('connect', () => {
    console.log('서버랑 연결 됨ㅎ');

    // 메시지 수신
    socket.on('message', (response) => {
        checkTranslatedLog(response);
    });

    // 대화상대 갱신
    socket.on('person-update', (response) => {
        updatePerson(response);
    });

    // 서버로부터 IP 전달받아 저장
    socket.on('sendIP', (ip) => {
        winIP = ip;
    });

    // 방 입장
    socket.emit('joinRoom', { room_id: room_id }, (roomData) => {
        if (roomData.error) {
            // 서버에서 오류 응답이 돌아온 경우
            console.error('오류 발생', roomData.error);
        } else {
            // 정상적인 응답을 받은 경우
            $('#room-name').html(roomData?.room_data?.room_name ?? '');
            chatLogs.empty();
            for (let i = roomData?.message_data?.length-1 ?? 0; i >= 0; i--) {
                let message = roomData.message_data[i];
                checkTranslatedLog(message);
            }
        }
    });

    // socket.emit('leave', room_id);
});

// 메시지 전송 이벤트
function emitMessage() {
    user_name = inputName.val();
    const messageData = {
        room_id: 1,
        user_name: user_name,
        language: language,
        message_text: $('#input-text').val(),
    };
    emptyTextarea();
    socket.emit('message', messageData);
}

// 메시지 번역 여부 체크 후 로그 출력
function checkTranslatedLog(message) {
    messages.set(message.message_id, message);
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
            messages.set(id, response);
            replaceLog(id, response[`${language}_text`]);
            removeLoading(id);
            isTranslating = false;
        }
    });
}