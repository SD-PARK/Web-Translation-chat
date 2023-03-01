const urlParams = new URL(location.href).searchParams;

if (urlParams.get('failed') == 1)
    $('span.red').text('- 유효하지 않은 이메일 또는 비밀번호입니다.');
else if (urlParams.get('failed') == 2)
    $('span.red').eq(0).text('- 잠시 후 다시 시도해주세요.');
else if (urlParams.get('err') == '100')
    $('span.red').eq(0).text('- 이미 등록된 이메일입니다.')
else if (urlParams.get('err') == '101')
    $('span.red').eq(0).text('- 이런! 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');

const form = $('form')[0];
form.addEventListener('submit', (e) => {
    e.preventDefault();
    swapPage(1);
    setTimeout(() => {
        form.submit();
    }, 100);
});