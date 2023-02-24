if (getParameter('failed'))
    $('span.red').text('- 유효하지 않은 이메일 또는 비밀번호입니다.');
else if (getParameter('err') == '100')
    $('span.red').eq(0).text('- 이미 등록된 이메일입니다.')

const form = $('form')[0];
form.addEventListener('submit', (e) => {
    e.preventDefault();
    swapPage(1);
    setTimeout(() => {
        form.submit();
    }, 100);
});