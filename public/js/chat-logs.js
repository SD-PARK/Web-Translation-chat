const chatLogs = $('#chat-logs');
const chatPersons = $('#room-persons');
const chatPersonCnt = $('#person-cnt');
let roomList = new Map();
let winIP;

/**
 * 채팅 로그를 추가합니다.
 * @param {boolean} me - 유저가 보냈는 지에 대한 여부
 * @param {object} data - 송신자의 이름과 텍스트가 포함된 객체
 */
function addLog(data) {
    if (data?.message_id) {
        chatLogs.append(`
            <div class="log ${data?.message_id}">
                <img class="flag" src="../img/flag/${data?.language}.png" title="${data?.language}"></img>
                <div class="name">${data?.user_name}<span class="ip">(${data?.ip})</span></div>
                <p>${data?.message_text}</p>
                <span class="send-at">${timeStyle(data?.send_at)}</span>
            </div>`);
    } else {
        const $errLog = $(`
            <div class="log err-msg">
                <img class="flag" src="../img/flag/${data?.language}.png" title="${data?.language}"></img>
                <div class="name">${data?.user_name}<span class="ip">(${data?.ip})</span></div>
                <p>${data?.message_text ?? ''}</p>
                <button class="resend" onclick="resend(this)">
                    <i class="fa-solid fa-circle-exclamation fa-xl" style="color: #f32020;"></i>
                </button>
            </div>`);
        $errLog.data('data', data);
        chatLogs.append($errLog);
    }
    
    if (winIP && data.ip === winIP) $('.log:last-child > .name').css('color', 'green');
    chatLogs.scrollTop(chatLogs.prop('scrollHeight'));
}

function timeStyle(time) {
    if (!time) {
        return '';
    } else if (new Date(time).toLocaleDateString() === new Date().toLocaleDateString()) {
        return new Intl.DateTimeFormat(language, {timeStyle:'short'}).format(new Date(time));
    } else {
        return new Intl.DateTimeFormat(language, {dateStyle:'short', timeStyle:'short'}).format(new Date(time));
    }
}

/**
 * 채팅 로그를 변경합니다.
 * @param {number} id - 메시지 ID
 * @param {string} text - 변경할 텍스트
 */
function replaceLog(id, text) {
    const messageTextDiv = $(`.${id} > p`);
    messageTextDiv.text(text);
    if (text === '[Translation Failed]')
        messageTextDiv.css('color', '#EE0000');
}

/**
 * 메시지에 로딩 애니메이션을 추가합니다.
 * @param {number} id - 메시지 ID
 */
function addLoading(id) {
    const messageDiv = $(`.${id}`);
    messageDiv.append('<div class="loading"></div>');
}

/**
 * 메시지의 로딩 애니메이션을 제거합니다.
 * @param {number} id - 메시지 ID
 */
function removeLoading(id) {
    const messageDiv = $(`.${id} > .loading`);
    messageDiv.remove();
}

/**
 * 로딩 중인 로그의 내용을 변경하거나, 제거합니다.
 * @param {number} status - ajax 요청에 대한 status 값
 * @param {string} content - 로그 안에 들어갈 내용
 */
function replaceLoadingLog(status, content = '') {
    const loadingDiv = $('.loader');
    if (status === 200) {
        loadingDiv.html(content);
    }
    loadingDiv.removeClass('loader');
    chatLogs.scrollTop(chatLogs.prop('scrollHeight'));
}

/**
 * 대화 상대를 추가합니다.
 * @param {*} person
 */
function updatePerson(person) {
    chatPersons.append(`<div class="person">${person.name}<span class='ip'>(${person.ips})</span></div>`);
    if (person.ips === winIP) $('.person:last-child').css({
        'color': 'green',
        'font-weight': 'bold',
    });
}