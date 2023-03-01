
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

        socket.emit('friendChatList', (friends) => {
            for(let i of friends.LIST) {
                printFriend(i, (i.ROOM_ID === friends.ACCENT));
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

let addButtonStatus = 0;
const addList_p = $('#addList > p');
const addList_input = $('#addList > input');
const addList_btn = $('#addList > button');
/** 애니메이션: 친구 추가 버튼 클릭 시 */
function addList() {
    if (addButtonStatus) {
        addList_input.animate({
            opacity: 0,
            'margin-left': '260px',
            width: '0px'
        }, 500);
        addList_btn.animate({
            opacity: 0.7,
            rotate: '0deg'
        }, 500);
        addList_input.css('outline', '1px solid white');
        addList_p.css('opacity', '0');
        addList_input.val('');
    } else {
        addList_input.animate({
            opacity: 1,
            margin: 0,
            width: '260px'
        }, 500);
        addList_btn.animate({
            opacity: 1,
            rotate: '45deg'
        }, 500);
    }
    addButtonStatus = !addButtonStatus;
}
addList_input.keyup(() => {
    addList_input.css('outline', '1px solid white');
    addList_p.css('opacity', '0');
});