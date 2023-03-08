const socket = io('/chat');

// 세팅
socket.emit('login', (info) => {
    // 좌측 하단 미니 프로필
    $('div#myProfile > p#myName').text(info.INFO.NAME);
    $('div#myProfile > p#tag').text(info.INFO.NAME_TAG);
    $('div#myProfile > img.flag').attr('src', `/client/img/flag/${info.INFO.LANGUAGE}.png`);
    // 내 계정 내 메인 프로필
    console.log(info.TARGET);
    if(info.TARGET == '@mp') {
        $('div#userInfo > div > h2.name').text(info.INFO.NAME);
        $('div#userInfo > div > span.tag').text(info.INFO.NAME_TAG);
        $('div#userInfo > div > span.email').text(info.INFO.EMAIL);
        const fullLanguage = {
            ko: '한국어',
            en: 'English',
            ja: '日本語',
            'zh-CH': '简体字',
            'zh-TW': '正體字'
        }
        $('div#userInfo > div > span.language').text(fullLanguage[info.INFO.LANGUAGE] || []);
    }
    modeSwap(info.TARGET == '@rm');
    $('div#title').css('background-image', `url('/client/img/${info.TARGET}.png')`);
});


/////////////// 친구 목록 관련 ///////////////

/** 친구 목록 출력 */
function printFriend(info, accent) {
    $('div#list').append(`
        <div class="col" onclick="location.href='/main/@fr/${info.ROOM_ID}'">
            <img src="/client/img/neko1.png" class="profile">
            <img src="/client/img/flag/${info.LANGUAGE}.png" class="flag">
            <p>${info.NAME}</p>
            <button onclick="deleteFriend('${info.ROOM_ID}')"></button>
        </div>
    `);
    if(accent) {
        $('div#title').text(info.NAME);
        $('div#list > div.col').last().addClass('accent');
    }
}

/** 친구 검색 */
function searchFriend() {
    let val = addList_input.val();
    let searchInfo = {
        NAME: val.slice(0, -5),
        TAG: val.slice(-5)
    }
    socket.emit('addFriend', (searchInfo), (callback) => {
        if (callback == -1) {
            addList_input.css('outline','1px solid red');
            addList_p.text('이미 친구로 등록된 사용자예요!');
            addList_p.css('opacity', '1');
        } else if (callback) {
            addList_input.val('');
            modeSwap(0);
        } else {
            addList_input.css('outline','1px solid red');
            addList_p.text('이름과 태그가 정확한지 다시 한 번 확인해주세요.');
            addList_p.css('opacity', '1');
        }
    });
}

/** 친구 삭제 */
function deleteFriend(roomId) {
    socket.emit('deleteFriend', (roomId), (callback) => {
        modeSwap(0);
    });
}

/////////////// 채팅방 관련 ///////////////


/** 채팅방 목록 출력 */
function printRoom(info, accent) {
    $('div#list').append(`
        <div class="col" onclick="location.href='/main/@rm/${info.ROOM_ID}'">
            <img src="/client/img/neko1.png" class="profile">
            <p>${info.TITLE}</p>
        </div>
    `);
    if(accent) {
        $('div#title').text(info.TITLE);
        $('div#title').append(`<button id="exit" onclick="exitRoom()"></button><button id="invite" onclick="inviteRoom()"></button>`);
        $('div#list > div.col').last().addClass('accent');
    }
}

/** 현재 채팅방 나가기 */
function exitNowRoom() {
    socket.emit('exitNowRoom', (callback) => {
        location.href="/main/@mp";
    });
}

/////////////// 채팅 관련 ///////////////

/** 메세지 송신 */
function sendChat() {
    let data = {
        MSG: $('input#send').val(),
        TIME: new Date()
    };
    $('input#send').val('');
    socket.emit('sendMessage', (data));
}


/** 메세지 수신 */
socket.on('msgAlert', (MSG_ID) => {
    console.log(MSG_ID);
    socket.emit('msgReceive', (MSG_ID), (msgInfo) => {
        msgPrint(msgInfo);
    });
});

/** 과거 메세지 출력 */
socket.on('chatLogs', (logs) => {
    console.log(logs);
    for(let log of logs)
        msgPrint(log);
});

/** 메세지 출력 관련 */
let beforeInfo;
function msgPrint(info) {
    if(beforeInfo && (beforeInfo.NAME === info.NAME)) {
        let p = $('div#messages > div.message:nth-last-child(1) > p');
        p.text(beforeInfo.CHAT + '\n' + info?.LANG_CHAT??info.eMsg);
        beforeInfo.CHAT = p.text();
        p.html(p.html().replace(/\n/g, '<br/>'));
    } else {
        let time = new Intl.DateTimeFormat('ko', {dateStyle:'medium', timeStyle: 'short'}).format(new Date(info.SEND_TIME));
        $('div#messages').append(`
            <div class="message">
                <img src="/client/img/neko1.png" class="profile">
                <img src="/client/img/flag/${info.LANGUAGE}.png" class="flag">
                <span class="name">${info.NAME}<span class="time">${time}</span></span>
                <p>${info?.LANG_CHAT??info.eMsg}</p>
            </div>`);
        beforeInfo = {
            NAME: info.NAME,
            CHAT: info?.LANG_CHAT??info.eMsg
        };
    }
    
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
}

/////////////// 계정 관련 ///////////////
function deleteAccount() {
    socket.emit('deleteAccount', (callback) => {
        location.href = '/logout';
    });
}