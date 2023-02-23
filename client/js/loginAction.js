if (getParameter('failed'))
    loginFailed();

function getParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function loginFailed() {
    $('span.red').eq(0).text('- 유효하지 않은 이메일 또는 비밀번호입니다.');
    $('span.red').eq(1).text('- 유효하지 않은 이메일 또는 비밀번호입니다.');
}

const form = $('form')[0];
form.addEventListener('submit', (e) => {
    e.preventDefault();
    swapPage(1);
    setTimeout(() => {
        form.submit();
    }, 100);
});