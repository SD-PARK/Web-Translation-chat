swapPage(0);

function to_register() {
    swapPage(1);
    setTimeout(() => {
        location.href='/register';
    }, 100);
}
function to_login() {
    swapPage(1);
    setTimeout(() => {
        location.href='/login';
    }, 100);
}

function swapPage(status) { // 0: 현재 페이지에 머뭄, 1: 다른 페이지로 이동
    if (status == 0){
        $('#form').animate({
            top: '50%',
            opacity: 0.9
        }, 100);
    } else {
        $('#form').animate({
            top: '45%',
            opacity: 0
        }, 100);
    }
}

$(() => {
    // const socket = io();
    // socket.emit('login');
});