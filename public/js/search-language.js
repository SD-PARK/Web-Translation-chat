const langList = ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'vi', 'id', 'th', 'de', 'ru', 'es', 'it', 'fr'];
let language;

/** 브라우저 언어 탐색 후 초기 언어 설정 */
function Searchlanguage() {
    const cookieLanguage = getCookie('language');
    if (cookieLanguage && langList.includes(cookieLanguage)) {
        language = cookieLanguage;
    } else {
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
}
Searchlanguage();

function setLanguage() {
    let changeNodeList = Array.prototype.slice.call(document.querySelectorAll('[data-detect]'));
    let changeNodeList2 = Array.prototype.slice.call(document.querySelectorAll('[data-detect-placeholder]'));
    changeNodeList.map(v => {
        v.innerHTML = text[language][v.dataset.detect];
    });
    changeNodeList2.map(v => {
        v.placeholder = text[language][v.dataset.detectPlaceholder];
    });
}
setLanguage();

function setCookie(name, value, exp) {
    var date = new Date();
    date.setTime(date.getTime() + exp*24*60*60*1000);
    document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
    console.log(`setCookie: ${name}, ${value}`);
};

function getCookie(name) {
    var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value? value[2] : null;
}