
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

function loadAlert() {
    bgBox.show();
    bgBox.animate({opacity: 1}, 200);
    alertBox.empty();
    alertBox.append(createRoomApp);
}
function closeAlert() {
    bgBox.animate({opacity: 0}, 200);
    setTimeout(() => {
        bgBox.hide();
    }, 200);
}
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

function createRoom() {
    const title = $('input#roomTitle').val();
    socket.emit('createRoom', (title));
    closeAlert();
    modeSwap(1);
}