const socket = io('/chat');

let user_name;
let room_id = 1;
let language = selectedLanguage.val();
let messages = new Map();

socket.on('connect', () => {
    console.log('서버랑 연결 됨ㅎ');
    user_name = socket.io.nsps['/chat'].id;

    // 메시지 수신
    socket.on('message', (response) => {
        messages.set(response.message_id, response);
        checkTranslatedLog(response);
    });

    // 대화상대 갱신
    socket.on('person-update', (response) => {
        updatePerson(response);
    });

    socket.emit('join', { room_id: room_id }, (roomData) => {
        $('#room-name').html(roomData.room_data.room_name);
        chatLogs.empty();
        for (message of roomData.message_data) {
            messages.set(`${message.message_id}`, message);
            checkTranslatedLog(message);
        }
    });
    // socket.emit('leave', room_id);
    
});

// 메시지 전송 이벤트
function emitMessage() {
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
    socket.emit('reqTranslate', { message_id: id, language: language }, (response) => {
        messages.set(id, response);
        replaceLog(id, response[`${language}_text`]);
        removeLoading(id);
    });
}