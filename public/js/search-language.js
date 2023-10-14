const langList = ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'vi', 'id', 'th', 'de', 'ru', 'es', 'it', 'fr'];
let language;

/** 브라우저 언어 탐색 후 초기 언어 설정 */
function Searchlanguage() {
    const cookieLanguage = getCookie('language');
    if (cookieLanguage && langList.includes(cookieLanguage)) {
        language = cookieLanguage;
    } else {
        console.log(2);
        const winLanguage = window.navigator.language;
        const langSlice = winLanguage.slice(0, 2);
        const langIndex = langList.findIndex((element) => element === langSlice);
        if (langIndex !== undefined) {
            language = langList[langIndex];
        // } else if (winLanguage === 'zh-Hant-TW') {
        //     language = 'zh-TW';
        // } else if (langSlice === 'zh') {
        //     language = 'zh-CN';
        } else {
            langauge = 'en';
        }
        setCookie('language', language, 1);
    }
    console.log(language);
}
Searchlanguage();

function setCookie(name, value, exp) {
    var date = new Date();
    date.setTime(date.getTime() + exp*24*60*60*1000);
    document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
};

function getCookie(name) {
    var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value? value[2] : null;
}