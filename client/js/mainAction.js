
modeSwap(0);

$('#messages').scrollTop($('#messages')[0].scrollHeight);

/** 친구 <-> 채팅방 창 전환 애니메이션 */
function modeSwap(mode) {
    let select_css = {
        'color': 'white',
        'font-weight': 'bold'};
    if (!mode) {
        $('button#friends').css(select_css);
        $('button#rooms').removeAttr('style');
    } else {
        $('button#rooms').css(select_css);
        $('button#friends').removeAttr('style');
    }
    
    let left = 32.5 + (mode * 172.5);
    $('#underline').animate({
        left: left
    }, 200);
}

$(() => {
    const socket = io();
    socket.emit('login', (info) => {
        $('div#myProfile > p#myName').text(info.NAME);
        $('div#myProfile > p#tag').text(info.NAME_TAG);
    });
});