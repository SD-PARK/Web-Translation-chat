const inputText = $('#input-text');
const sendButton = document.getElementById('send-button');
const progress = document.getElementById('progress-step');
const selectedLanguage = $('#selected-language');

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
 * @param {textarea} textarea
 */
function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = (textarea.scrollHeight) + "px";
    chatLogs.css('margin-bottom', (textarea.scrollHeight + 58) + "px");
}

/**
 * Textarea 안의 Text를 지우고, 버튼을 비활성화합니다.
 */
function emptyTextarea() {
    $('#input-text').val('');
    autoResize(inputText);
    buttonDisabled();
}

/**
 * 언어를 변경합니다.
 */
selectedLanguage.change(() => {
    if (!isTranslating) {
        language = selectedLanguage.val();
        chatLogs.empty();
        for (message of messages.values()) {
            checkTranslatedLog(message);
        }
    }
});