const socket = io('/chat');

// 세팅
socket.emit('login', (info) => {
    $('div#myProfile > p#myName').text(info.NAME);
    $('div#myProfile > p#tag').text(info.NAME_TAG);
});

/** 친구 목록 출력 */
function printFriend(info, accent) {
    $('div#list').append(`
        <div class="friendCol" onclick="location.href='/main/@fr/${info.ROOM_ID}'">
            <img src="/client/img/neko1.png" class="profile">
            <img src="/client/img/flag/ko.png" class="flag">
            <p>${info.NAME}</p>
        </div>
    `);
    if(accent) {
        $('div#title').text(info.NAME);
        $('div#list > div.friendCol').last().addClass('accent');
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

/////////////// 채팅 관련 ///////////////

function sendChat() {
    let data = {
        MSG: $('input#send').val(),
        TIME: new Date()
    };
    $('input#send').val('');
    socket.emit('sendMessage', (data));
}

socket.on('msgReceive', (msgInfo) => {
    console.log(msgInfo);

    let time = new Intl.DateTimeFormat('ko', {dateStyle:'medium', timeStyle: 'short'}).format(new Date(msgInfo.TIME));
    $('div#messages').append(`
        <div class="message">
            <img src="/client/img/neko1.png" class="profile">
            <span class="name">${msgInfo.NAME}<span class="time">${time}</span></span>
            <p>${msgInfo.MSG}</p>
        </div>`);
});