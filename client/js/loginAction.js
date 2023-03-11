const urlParams = new URL(location.href).searchParams;

setLanguage(getCookie('setLang')??'ko');
$('div#langForm > select').val(getCookie('setLang')??'ko').prop('selected', true); // 페이지 언어 설정
$('form#register > select').val(getCookie('setLang')??'ko').prop('selected', true); // register 내 회원 정보의 언어 설정

if (urlParams.get('failed') == 1)
    $('span.red').text(multiLanguage[getCookie('setLang')??'ko'].invalid);
else if (urlParams.get('failed') == 2)
    $('span.red').eq(0).text(multiLanguage[getCookie('setLang')??'ko'].tryAgain);
else if (urlParams.get('err') == '100')
    $('span.red').eq(0).text(multiLanguage[getCookie('setLang')??'ko'].already)
else if (urlParams.get('err') == '101')
    $('span.red').eq(0).text(multiLanguage[getCookie('setLang')??'ko'].tryAgain);

const form = $('form')[0];
form.addEventListener('submit', (e) => {
    e.preventDefault();
    swapPage(1);
    setTimeout(() => {
        form.submit();
    }, 100);
});