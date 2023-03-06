const socket = io('/chat');

// 세팅
let target;
socket.emit('login', (info) => {
    $('div#myProfile > p#myName').text(info.INFO.NAME);
    $('div#myProfile > p#tag').text(info.INFO.NAME_TAG);
    modeSwap(info.TARGET == '@rm');
    target = info.TARGET;
});


/////////////// 친구 목록 관련 ///////////////

/** 친구 목록 출력 */
function printFriend(info, accent) {
    $('div#list').append(`
        <div class="col" onclick="location.href='/main/@fr/${info.ROOM_ID}'">
            <img src="/client/img/neko1.png" class="profile">
            <img src="/client/img/flag/ko.png" class="flag">
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
            mode = 0;
            modeSwap(0);
        } else {
            addList_input.css('outline','1px solid red');
            addList_p.text('이름과 태그가 정확한지 다시 한 번 확인해주세요.');
            addList_p.css('opacity', '1');
        }
    });
}

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

function exitNowRoom() {
    socket.emit('exitNowRoom', (callback) => {
        location.href="/main/@rm";
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
socket.on('msgReceive', (msgInfo) => {
    msgPrint(msgInfo);
});

/** 과거 메세지 출력 */
socket.on('chatLogs', (logs) => {
    console.log(logs);
    $('div#title').css('background-image', `url('/client/img/${target}.png')`);
    for(let log of logs) {
        msgPrint(log);
    }
});

/** 메세지 출력 관련 함수 */
let beforeInfo;
function msgPrint(info) {
    if(beforeInfo && (beforeInfo.NAME === info.NAME)) {
        let p = $('div#messages > div.message:nth-last-child(1) > p');
        p.text(beforeInfo.CHAT + '\n' + info.CHAT);
        beforeInfo.CHAT = p.text();
        p.html(p.html().replace(/\n/g, '<br/>'));
    } else {
        let time = new Intl.DateTimeFormat('ko', {dateStyle:'medium', timeStyle: 'short'}).format(new Date(info.SEND_TIME));
        $('div#messages').append(`
            <div class="message">
                <img src="/client/img/neko1.png" class="profile">
                <span class="name">${info.NAME}<span class="time">${time}</span></span>
                <p>${info.CHAT}</p>
            </div>`);
        beforeInfo = info;
    }
    
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
}