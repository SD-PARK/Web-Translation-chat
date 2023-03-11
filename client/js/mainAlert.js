
const bgBox = $('div#bgBox');
const alertBox = $('div#alert');
function createRoomApp() {
    return `<button id="closeAlert" onclick="closeAlert()"></button>
            <h3>${multiLanguage[lang].createRoom}</h3><br>
            <button id="createRoomBtn" onclick="nextAlert(customizeRoomApp)">${multiLanguage[lang].createNewRoom}</button>
            <p>${multiLanguage[lang].orJoin}</p>
            <p id="explan">${multiLanguage[lang].inviteCode}</p>
            <input type="text" id="enterRoomId" placeholder="${multiLanguage[lang].inputInviteCode}">
            <button id="enterRoomBtn" onclick="enterRoom()">${multiLanguage[lang].join}</button>`;
}
function customizeRoomApp() {
    return `<button id="closeAlert" onclick="closeAlert()"></button>
            <h3>${multiLanguage[lang].settingRoom}</h3>
            <p id="explan">${multiLanguage[lang].roomName}</p>
            <input type="text" placeholder="${multiLanguage[lang].inputRoomName}" id="roomTitle">
            <button id="backBtn" onclick="nextAlert(createRoomApp())">${multiLanguage[lang].back}</button>
            <button id="createBtn" onclick="createRoom()">${multiLanguage[lang].create}</button>`;
}
function inviteRoomApp() {
    return `<button id="closeAlert" onclick="closeAlert()"></button>
            <h3>${multiLanguage[lang].inviteFriend}</h3>
            <p>${multiLanguage[lang].sendCode}</p>
            <div id="inviteCode"><button id="inviteCopy" onclick="inviteCopy()">${multiLanguage[lang].copy}</button></div>`;
}
function exitRoomApp() {
    return `<button id="closeAlert" onclick="closeAlert()"></button>
            <h3>${multiLanguage[lang].exitRoom}</h3>
            <p>${multiLanguage[lang].exitRoomSure}</p>
            <button class="yorn" onclick="closeAlert()">${multiLanguage[lang].cancle}</button><button class="yorn" onclick="exitNowRoom()">${multiLanguage[lang].exit}</button>`;
}
function logoutApp() {
    return `<button id="closeAlert" onclick="closeAlert()"></button>
            <h3>${multiLanguage[lang].logout}</h3>
            <p>${multiLanguage[lang].logoutSure}</p>
            <button class="yorn" onclick="closeAlert()">${multiLanguage[lang].cancle}</button><button class="yorn" onclick="location.href='/logout'">${multiLanguage[lang].logout}</button>`;
}
function dropAccountApp() {
    return `<button id="closeAlert" onclick="closeAlert()"></button>
            <h3>${multiLanguage[lang].deleteAccount}</h3>
            <p>${multiLanguage[lang].deleteAccountSure}</p>
            <button class="yorn" onclick="closeAlert()">${multiLanguage[lang].cancle}</button><button class="yorn" onclick="deleteAccount()">${multiLanguage[lang].delete}</button>`;
}
function getOutApp() {
    return `<h3>${multiLanguage[lang].accessDenied}</h3>
            <p>${multiLanguage[lang].doNotHavePermission}</p>`;
}

/** 지정된 알림 띄우기 */
function loadAlert(app) {
    bgBox.show();
    bgBox.animate({opacity: 1}, 200);
    alertBox.empty();
    alertBox.append(app);
    setLanguage(lang??'ko'); // 언어 별 텍스트 다시 불러옴
}
/** 알림 닫기 */
function closeAlert() {
    bgBox.animate({opacity: 0}, 200);
    setTimeout(() => {
        bgBox.hide();
    }, 200);
}
/** 알림창 넘어가기 */
function nextAlert(next) {
    alertBox.animate({opacity: 0}, 200);
    setTimeout(() => {
        alertBox.empty();
        alertBox.append(next);
    }, 200);
    alertBox.animate({opacity: 1}, 200);
    setLanguage(lang??'ko'); // 언어 별 텍스트 다시 불러옴
}

bgBox.on('click', (e) => {
    closeAlert();
});

alertBox.on('click', (e) => {
    return false;
});

/** alert - 방 입장 버튼 클릭 시 */
function enterRoom() {
    const id = $('input#enterRoomId').val();
    socket.emit('checkRoomId', (id), (callback) => {
        if (callback) {
            closeAlert();
            modeSwap(1);
        } else {
            $('p#explan').css({color: 'red'});
            $('p#explan').text(multiLanguage[lang].invalidInviteCode);
        }
    });
}

/** alert - 방 생성 팝업 띄우기 */
function createRoom() {
    const title = $('input#roomTitle').val();
    socket.emit('createRoom', (title));
    closeAlert();
    modeSwap(1);
}

/** alert - 채팅방 나가기 팝업 띄우기 */
function exitRoom() {
    loadAlert(exitRoomApp);
}

/** alert - 채팅방 초대 팝업 띄우기 */
function inviteRoom() {
    loadAlert(inviteRoomApp);
    $('div#inviteCode').append(nowRoomId);
}

/** alert - 입장 코드 복사 */
function inviteCopy() {
    const copyBtn = $('button#inviteCopy');
    window.navigator.clipboard.writeText(nowRoomId);
    copyBtn.css({
        'background-color':'#303825',
        border:'1px solid white'
    });
    copyBtn.text(multiLanguage[lang].copyComplete);
    setTimeout(() => {
        copyBtn.removeAttr('style');
        copyBtn.text(multiLanguage[lang].copy);
    }, 2000);
}