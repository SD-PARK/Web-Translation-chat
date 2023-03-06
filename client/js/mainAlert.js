
const bgBox = $('div#bgBox');
const alertBox = $('div#alert');
const createRoomApp = `<button id="closeAlert" onclick="closeAlert()"></button>
                    <h3>채팅방 만들기</h3><br>
                    <button id="createRoomBtn" onclick="nextAlert(customizeRoomApp)">새 채팅방 개설하기</button>
                    <p>또는 참가하기</p>
                    <p id="explan">초대 코드</p>
                    <input type="text" id="enterRoomId" placeholder="초대 코드를 입력하세요.">
                    <button id="enterRoomBtn" onclick="enterRoom()">참가하기</button>`;
const customizeRoomApp = `<button id="closeAlert" onclick="closeAlert()"></button>
                        <h3>채팅방 꾸미기</h3>
                        <p id="explan">채팅방 이름</p>
                        <input type="text" placeholder="채팅방 이름을 적어주세요." id="roomTitle">
                        <button id="backBtn" onclick="nextAlert(createRoomApp)">돌아가기</button>
                        <button id="createBtn" onclick="createRoom()">만들기</button>`;
const exitRoomApp = `<button id="closeAlert" onclick="closeAlert()"></button>
                    <h3>채팅방 나가기</h3>
                    <p>재입장하려면 다시 초대를 받아야 합니다. 정말 나가시겠어요?</p>
                    <button class="yorn" onclick="closeAlert()">취소</button><button class="yorn" onclick="exitNowRoom()">나가기</button>`;
const inviteRoomApp = `<button id="closeAlert" onclick="closeAlert()"></button>
                    <h3>친구 초대하기</h3>
                    <p>친구에게 입장 코드를 전송하세요!</p>
                    <div id="inviteCode"><button id="inviteCopy" onclick="inviteCopy()">복사</button></div>`;

/** 지정된 알림 띄우기 */
function loadAlert(app) {
    bgBox.show();
    bgBox.animate({opacity: 1}, 200);
    alertBox.empty();
    alertBox.append(app);
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
            $('p#explan').text('초대 코드 - 유효한 초대 코드를 입력하세요.');
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
        width:'90px',
        'background-color':'#303825',
        border:'1px solid white'
    });
    copyBtn.text('복사 완료!');
    setTimeout(() => {
        copyBtn.removeAttr('style');
        copyBtn.text('복사');
    }, 2000);
}