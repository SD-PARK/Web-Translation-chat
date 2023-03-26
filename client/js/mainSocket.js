const socket = io('/chat');

// 세팅
let lang;
let targetUser;
socket.emit('login', (info) => {
    // 좌측 하단 미니 프로필
    $('div#myProfile > img.profile').attr('src', `/client/img/profiles/${info.INFO.IMG}`);
    $('div#myProfile > p#myName').text(info.INFO.NAME);
    $('div#myProfile > p#tag').text(info.INFO.NAME_TAG);
    $('div#myProfile > img.flag').attr('src', `/client/img/flag/${info.INFO.LANGUAGE}.png`);
    lang = info.INFO.LANGUAGE;
    setLanguage(lang??'ko');
    // 내 계정 내 메인 프로필
    console.log(info.TARGET);
    if(info.TARGET == '@mp') {
        $('div.upload').css('background-image', `url(/client/img/profiles/${info.INFO.IMG})`);
        $('div#userInfo > div > h2.name').text(info.INFO.NAME);
        $('div#userInfo > div > span.tag').text(info.INFO.NAME_TAG);
        $('div#userInfo > div > span.email').text(info.INFO.EMAIL);
        const fullLanguage = {
            ko: '한국어',
            en: 'English',
            ja: '日本語',
            'zh-CN': '简体字',
            'zh-TW': '正體字'
        }
        $('div#userInfo > div > span.language').text(fullLanguage[info.INFO.LANGUAGE] || []);
    }
    modeSwap(info.TARGET == '@rm');
    // 채팅방 제목 옆 아이콘
    $('div#title').css('background-image', `url('/client/img/${info.TARGET}.png')`);
    // 언어 별 친구 추가(검색) placeholder 변경
    $('div#addList > input').attr('placeholder', multiLanguage[lang].searchUser);
});

/////////////// 실시간 갱신 ///////////////
socket.on('alert', () => {
    console.log('renewal');
    loadList(mode);
    if(userListStatus)
        userListLoad();
});

/////////////// 친구 목록 관련 ///////////////

/** 친구 목록 출력 */
function printFriend(info, accent) {
    $('div#list').append(`
        <div class="col ${info.ROOM_ID}" onclick="location.href='/main/@fr/${info.ROOM_ID}'">
            <img src="/client/img/profiles/${info.IMG}" class="profile">
            <img src="/client/img/flag/${info.LANGUAGE}.png" class="flag">
            <p>${info.NAME}</p>
            <button onclick="deleteFriend('${info.ROOM_ID}')"></button>
        </div>
    `);
    if(accent) {
        $('div#title').text(info.NAME);
        $('div#list > div.col').last().addClass('accent');
        targetUser = info;
        if(info.RELATION != 'FRIEND') // 친구 추가 여부 확인
            $('div#stranger').show();
        else
            $('div#stranger').removeAttr('style');
    } else if(info.UNREAD_CNT > 0) {
        $('div#list > div.col').append(`<div id="unReadCnt">${info.UNREAD_CNT}</div>`);
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
            addList_p.text(multiLanguage[lang].alreadyFriend);
            addList_p.css('opacity', '1');
        } else if (callback) {
            addList_input.val('');
        } else {
            addList_input.css('outline','1px solid red');
            addList_p.text(multiLanguage[lang].invalidUser);
            addList_p.css('opacity', '1');
        }
    });
}

/** 버튼을 통한 친구 추가 */
function AddFriend() {
    let info = {
        NAME: targetUser.NAME,
        TAG: targetUser.NAME_TAG
    }
    socket.emit('addFriend', (info), (callback) => {
        $('div#stranger').animate({
            height:0
        }, 700);
        setTimeout(() => {
            $('div#stranger').removeAttr('style');
        }, 700);
    });
}
let n=1;
/** 친구 삭제 */
function deleteFriend(roomId) {
    $(`div.${roomId}`).removeAttr('onclick');
    $(`div.${roomId}`).attr('onclick', 'location.href="/main/@mp"');
    socket.emit('deleteFriend', (roomId), (callback) => {
        loadList(1);
    });
}

/////////////// 채팅방 관련 ///////////////

/** 채팅방 권한이 없을 경우 */
socket.on('getout', () => {
    loadAlert(getOutApp());
    setTimeout(() => {
        location.href = "/main/@mp";
    }, 2000);
});

/** 채팅방 목록 출력 */
function printRoom(info, accent) {
    $('div#list').append(`
        <div class="col" onclick="location.href='/main/@rm/${info.ROOM_ID}'">
            <img src="/client/img/@rm.png" class="profile">
            <p id="roomTitle">${info.TITLE}</p>
            <span id="roomLastChat">${info.LAST_MESSAGE}</span>
        </div>
    `);
    if(accent) {
        $('div#title').text(info.TITLE);
        $('div#title').append(`<button id="exit" onclick="exitRoom()"></button><button id="invite" onclick="inviteRoom()"></button><button id="userList" onclick="userList()"></button>`);
        $('div#list > div.col').last().addClass('accent');
    } else if(info.UNREAD_CNT > 0) {
        $('div#list > div.col').append(`<div id="unReadCnt">${info.UNREAD_CNT}</div>`);
    }
}

/** 현재 채팅방 나가기 */
function exitNowRoom() {
    socket.emit('exitNowRoom', (callback) => {
        location.href="/main/@mp";
    });
}

/** 채팅방 유저 목록 출력 */
function userListLoad() {
    socket.emit('userListLoad', (list) => {
        $('#chatUsers').empty();
        for(i of list) {
            $('#chatUsers').append(`<div class="col">
                                        <img src="/client/img/profiles/${i.IMG}" class="profile">
                                        <img src="/client/img/flag/${i.LANGUAGE}.png" class="flag">
                                        <p>${i.NAME + i.NAME_TAG}</p>
                                    </div>`);
        }
    });
}

/////////////// 채팅 관련 ///////////////

/** 메세지 송신 */
function sendChat() {
    const msg = $('input#send').val();
    if(msg.trim()) {
        let data = {
            MSG: msg,
            TIME: new Date()
        };
        $('input#send').val('');
        socket.emit('sendMessage', (data));
    }
}

/** 메세지 수신 */
socket.on('msgAlert', (MSG_ID) => {
    console.log(MSG_ID);
    socket.emit('msgReceive', (MSG_ID), (msgInfo) => {
        msgPrint(msgInfo);
    });
    loadList(mode);
});

/** 과거 메세지 출력 */
socket.on('chatLogs', (logs) => {
    $('.loading-container').hide();
    console.log(logs);
    for(let log of logs)
        msgPrint(log);
});

/** 대화 기록이 없을 때 */
socket.on('logsNothing', () => {
    $('.loading-container').hide();
    const lnBox = $('div#logsNothing');
    lnBox.show();
    lnBox.animate({opacity: 1}, 1000);
    setTimeout(() => {
        if(lnBox.css('display') == 'block') {
            lnBox.animate({opacity: 0}, 1000);
            setTimeout(() => {
                lnBox.animate({'margin-top':0}, 1000);
                setTimeout(() => {
                    lnBox.removeAttr('style');
                }, 1000);
            }, 1000);
        }
    }, 1500);
});

/** 메세지 출력 관련 */
let beforeInfo;
function msgPrint(info) {
    info.LANG_CHAT = (info.LANG_CHAT == null) ? info.eMsg : info.LANG_CHAT;
    if(beforeInfo && (beforeInfo.NAME === info.NAME)) {
        // let p = $('div#messages > div.message:nth-last-child(1) > p');
        // beforeInfo.CHAT = (beforeInfo.CHAT + '\n' + info.LANG_CHAT);
        // let str = descapeMap(beforeInfo.CHAT);
        // p.text(str);
        // p.html(p.html().replace(/\n/g, '<br/>'));
        $('div#messages > div.message:last-child() > div.chat').append(`<p data-text="{'org':'${info.CHAT}', 'trs':'${info.LANG_CHAT}'}'}">${info.LANG_CHAT}</p>`);
    } else {
        let time = new Intl.DateTimeFormat(lang, {dateStyle:'medium', timeStyle: 'short'}).format(new Date(info.SEND_TIME));
        $('div#messages').append(`
            <div class="message">
                <img src="/client/img/profiles/${info.IMG}" class="profile">
                <img src="/client/img/flag/${info.LANGUAGE}.png" class="flag">
                <div class="chat">
                    <span class="name">${info.NAME}<span class="time">${time}</span></span>
                    <p data-text="{'org':'${info.CHAT}', 'trs':'${info.LANG_CHAT}'}'}">${info.LANG_CHAT}</p>
                </div>
            </div>`);
        beforeInfo = {
            NAME: info.NAME,
            CHAT: info.LANG_CHAT
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