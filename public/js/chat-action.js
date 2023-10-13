const inputText = $('#input-text');
const inputName = $('#input-name');
const inputLanguage = $('#input-language');
const sendButton = document.getElementById('send-button');
const progress = document.getElementById('progress-step');
const languageBox = $('#language-box');
const langList = ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'vi', 'id', 'th', 'de', 'ru', 'es', 'it', 'fr'];

/** 메시지 전송 시: Enter or Send Button Click */
$('#send-button').click(() => {
    emitMessage();
});
inputText.keydown((e) => {
    if (e.keyCode === 13 && !e.shiftKey && inputText.val().trim() !== '') {
        emitMessage();
        e.preventDefault();
    }
});

/** Textarea에 Text가 입력되어있을 때 Send Button을 활성화합니다. */
inputText.keyup(checkSendPossible);
function checkSendPossible() {
    if (inputText.val().trim() !== '') buttonEnabled();
    else buttonDisabled();
}

/** Send Button을 활성화합니다. */
function buttonEnabled() {
    sendButton.classList.add("active");
    sendButton.disabled = false;
}

/** Send Button을 비활성화합니다. */
function buttonDisabled() {
    sendButton.classList.remove("active");
    sendButton.disabled = true;
}

/**
 * Textarea의 text가 변경될 때마다, Textarea와 채팅 로그의 높이를 자동으로 조정합니다.
 */
function autoResize() {
    inputText.height = (inputText.scrollHeight) + "px";
    chatLogs.css('margin-bottom', (inputText.scrollHeight + 57) + "px");
}

/**
 * Textarea 안의 Text를 지우고, 버튼을 비활성화합니다.
 */
function emptyTextarea() {
    $('#input-text').val('');
    autoResize();
    buttonDisabled();
}

/**
 * 언어를 변경합니다.
 */
function switchLanguage(lang) {
    if (langList.includes(lang)) {
        language = lang;
        chatLogs.empty();
        for (message of messages.values()) {
            checkTranslatedLog(message);
        }
        languageBoxOnOff();
        inputLanguage.css('background-image', `url('../img/flag/${lang}.png')`)
    }
}

/**
 * Language Box를 열거나, 닫습니다.
 */
function languageBoxOnOff() {
    if (languageBox.is(':visible')) {
        languageBox.fadeOut(250);
    } else {
        languageBox.fadeIn(250);
    }
}

/**
 * 전송에 실패한 메시지를 재전송하고, 로그를 제거합니다.
 */
function resend(object) {
    const thisLog = $(object).closest('.err-msg');
    const data = thisLog.data('data');
    thisLog.remove();
    setTimeout(() => { // 로그 삭제 후 1초 뒤 전송합니다.
        socket.emit('message', data);
    }, 1000);
}