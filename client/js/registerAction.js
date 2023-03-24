const urlParams = new URL(location.href).searchParams;

setLanguage(getCookie('setLang')??'ko');
$('div#langForm > select').val(getCookie('setLang')??'ko').prop('selected', true); // 페이지 언어 설정
$('form#register > select').val(getCookie('setLang')??'ko').prop('selected', true); // register 내 회원 정보의 언어 설정

if (urlParams.get('err') == '100')
    $('span.red').eq(0).text(multiLanguage[getCookie('setLang')??'ko'].already)
else if (urlParams.get('err') == '101')
    $('span.red').eq(0).text(multiLanguage[getCookie('setLang')??'ko'].tryAgain);

const form = $('form')[0];
form.addEventListener('submit', (e) => {
    const email = $('input[name=email]').val();
    const name = $('input[name=name]').val();
    const password = $('input[name=password]').val();

    e.preventDefault();
    if(email && name && password) {
        swapPage(1);
        setTimeout(() => {
            form.submit();
        }, 100);
    } else {
        // location.href='register';
    }
});