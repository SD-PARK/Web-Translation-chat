const chatLogs = $('#chat-logs');
const chatPersons = $('#room-persons');

/**
 * 채팅 로그를 추가합니다.
 * @param {boolean} me - 유저가 보냈는 지에 대한 여부
 * @param {object} data - 송신자의 이름과 텍스트가 포함된 객체
 */
function addLog(data = { user_name: 'unknown', message_text: '' }, loader = 0) {
    chatLogs.append(`<div class="log"><div class="name">${data.user_name}</div>${data.message_text}</div>`);
    
    if (data.user_name === user_name) $('.log:last-child > .name').css('color', 'green');
    if (loader) $('.log:last-child').append(`<div class="loader ${data.message_id}"></div>`);

    chatLogs.scrollTop(chatLogs.prop('scrollHeight'));
}

/**
 * 로딩 중인 로그의 내용을 변경하거나, 제거합니다.
 * @param {number} status - ajax 요청에 대한 status 값
 * @param {string} content - 로그 안에 들어갈 내용
 */
function replaceLoadingLog(status, content = '') {
    const loadingDiv = $('.loading');
    if (status === 200) {
        loadingDiv.html(content);
    }
    loadingDiv.removeClass('loading');
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