const socket = io('/chat');

let user_name;
let room_id = 1;
let language = selectedLanguage.val();

socket.on('connect', () => {
    console.log('서버랑 연결 됨ㅎ');
    user_name = socket.io.nsps['/chat'].id;

    // 메시지 수신
    socket.on('message', (response) => {
        checkTranslatedLog(response);
    });

    // 대화상대 갱신
    socket.on('person-update', (response) => {
        updatePerson(response);
    });

    socket.emit('join', { room_id: room_id }, (roomData) => {
        $('#room-name').html(roomData.room_data.room_name);
        for (message of roomData.message_data) { checkTranslatedLog(message); }
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
        console.log(translatedData);
        addLog(translatedData);
    } else if (message.language !== language) {
        const reqData = {
            message_id: message.message_id,
            language: language,
        }
        socket.emit('reqTranslate', reqData);
        addLog(message, message.message_id);
    } else {
        addLog(message);
    }
}