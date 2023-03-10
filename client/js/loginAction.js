const urlParams = new URL(location.href).searchParams;

if (urlParams.get('failed') == 1)
    $('span.red').text(multiLanguage[getCookie('setLang')].invalid);
else if (urlParams.get('failed') == 2)
    $('span.red').eq(0).text(multiLanguage[getCookie('setLang')].tryAgain);
else if (urlParams.get('err') == '100')
    $('span.red').eq(0).text(multiLanguage[getCookie('setLang')].already)
else if (urlParams.get('err') == '101')
    $('span.red').eq(0).text(multiLanguage[getCookie('setLang')].tryAgain);

const form = $('form')[0];
form.addEventListener('submit', (e) => {
    e.preventDefault();
    swapPage(1);
    setTimeout(() => {
        form.submit();
    }, 100);
});