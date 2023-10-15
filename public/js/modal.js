const alertBackground = $('#alert-background');
const alertBox = $('#alert-box');
let isTimerClose = false;

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
alertBackground.mousedown(() => { 
    if (!isTimerClose)
        closeAlert();
});
alertBox.mousedown((e) => { e.stopPropagation(); });

/** 팝업 창을 닫습니다. */
function closeAlert() {
    alertBox.animate({opacity: 0}, 100);
    setTimeout(() => {
        alertBackground.hide();
    }, 100)
}

/** 주어진 시간 뒤 팝업 창을 닫습니다. 
 * @param {number} time - 팝업 창을 닫기까지의 시간(초)
*/
function timerCloseAlert(closeTime) {
    return new Promise((resolve) => {
        isTimerClose = true;
        const modalTimer = $('#modal-timer');
        let elapsedTime = closeTime;
        if (modalTimer) { modalTimer.text(elapsedTime); }
        setInterval(() => {
            elapsedTime -= 1;
            if (modalTimer) { modalTimer.text(elapsedTime); }
        }, 1000);
        setTimeout(() => {
            closeAlert();
            isTimerClose = false;
            resolve();
        }, closeTime * 1000);
    })
}

function createRoomApp() {
    return `<button id="close-alert" onclick="closeAlert()"></button>
            <h3>${text[language]['방 만들기']}</h3><br>
            <input type="text" id="enter-title" placeholder="${text[language]['제목 입력']}" onkeydown="enterTitleEnter(event)" maxlength="30"><br>
            <button id="enter-alert" onclick="createRoom()">${text[language]['생성']}</button>`;
}
function errorApp(err, msg = '') {
    if (msg === '') msg = text[language]['초 뒤 창이 닫힙니다.'];
    return `<div class="center">
                <i class="fa-solid fa-triangle-exclamation fa-2xl" style="color: #ffde38;"></i><br><br>
                <h5>${err}</h5>
                <h6><span id="modal-timer">N</span>${msg}</h6>
            </div><br>`;
}