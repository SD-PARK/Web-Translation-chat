const alertBackground = $('#alert-background');
const alertBox = $('#alert-box');
const enterTitle = $('#enter-title');

function createRoomApp() {
    return `<button id="close-alert" onclick="closeAlert()"></button>
            <h3>방 만들기</h3><br>
            <input type="text" id="enter-title" placeholder="제목 입력" onkeydown="enterTitleEnter(event)"><br>
            <button id="enter-alert" onclick="createRoom()">생성</button>`;
}

/** 
 * 팝업 창을 불러옵니다.
 * @param {string} app - 팝업 창의 내용에 들어갈 html 입니다.
*/
function loadModal(app) {
    alertBox.html(app);

    alertBackground.show();
    alertBox.animate({opacity: 1}, 200);
}

/** 팝업 창 외부를 클릭했을 경우 팝업 창을 닫습니다. */
alertBackground.mousedown(() => { closeAlert(); });
alertBox.mousedown((e) => { e.stopPropagation(); });

/** 팝업 창을 닫습니다. */
function closeAlert() {
    alertBox.animate({opacity: 0}, 100);
    setTimeout(() => {
        alertBackground.hide();
    }, 100)
}

/** 방을 생성합니다. */
function createRoom() {
    console.log($('#enter-title').val());
}

// input에서 엔터 키 입력 시 버튼 클릭 이벤트 실행
function enterTitleEnter(e) {
  if (e.which === 13) {
    $("#enter-alert").click();
  } else if (e.keyCode === 27) {
    closeAlert();
  }
}