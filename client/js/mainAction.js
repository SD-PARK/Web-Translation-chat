const socket = io();

// 세팅
socket.emit('login', (info) => {
    $('div#myProfile > p#myName').text(info.NAME);
    $('div#myProfile > p#tag').text(info.NAME_TAG);
});
modeSwap(0);
$('#messages').scrollTop($('#messages')[0].scrollHeight);

/** 친구 <-> 채팅방 탭 전환 애니메이션 */
function modeSwap(mode) {
    // 탭 강조, 목록 출력
    let select_css = {
        'color': 'white',
        'font-weight': 'bold'};

    $('div#list').empty();
    if (!mode) {
        $('button#friends').css(select_css);
        $('button#rooms').removeAttr('style');

        socket.emit('friendList', (friends) => {
            for(let i of friends) {
                printFriend(i);
            }
        });
    } else {
        $('button#rooms').css(select_css);
        $('button#friends').removeAttr('style');
    }
    
    // 밑줄 애니메이션
    let left = 32.5 + (mode * 172.5);
    $('#underline').animate({
        left: left
    }, 200);
}

/** 친구 목록 출력 */
function printFriend(info) {
    $('div#list').append(`
        <div class="friendCol">
            <img src="client/img/neko1.png" class="profile">
            <img src="client/img/flag/ko.png" class="flag">
            <p>${info.NAME}</p>
        </div>
    `);
}

function searchFriend() {
    let val = $('#addList > input').val();
    let searchInfo = {
        NAME: val.slice(0, -5),
        TAG: val.slice(-5)
    }
    socket.emit('addFriend', (searchInfo), (callback) => {
        if (callback) {
            $('#addList > input').val('');
            modeSwap(0);
        } else {
            // 찾지 못했어요.
        }
    });
}