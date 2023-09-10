const chatLogs = $('#chat-logs');
const chatPersons = $('#room-persons');
let roomList = new Map();

/**
 * 채팅 로그를 추가합니다.
 * @param {boolean} me - 유저가 보냈는 지에 대한 여부
 * @param {object} data - 송신자의 이름과 텍스트가 포함된 객체
 */
function addLog(data) {
    chatLogs.append(`<div class="log ${data?.message_id}"><img class="flag" src="../img/flag/${data?.language}.png" title="${data?.language}"></img><div class="name">${data?.user_name}</div><p>${data?.message_text}</p></div>`);
    
    if (data.user_name === user_name) $('.log:last-child > .name').css('color', 'green');

    chatLogs.scrollTop(chatLogs.prop('scrollHeight'));
}

/**
 * 채팅 로그를 변경합니다.
 * @param {number} id - 메시지 ID
 * @param {string} text - 변경할 텍스트
 */
function replaceLog(id, text) {
    const messageTextDiv = $(`.${id} > p`);
    messageTextDiv.text(text);
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

function updatePerson(persons) {
    chatPersons.empty();
    for (person of persons) {
        chatPersons.append(`<div class="person">${person}</div>`);
        if (person === user_name) $('.person:last-child').css({
            'color': 'green',
            'font-weight': 'bold',
        });
    }
}