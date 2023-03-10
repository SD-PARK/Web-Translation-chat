const multiLanguage = {
    'ko': {
        greeting: '반가워요!',
        email: '이메일 또는 전화번호 <span class="red">*</span>',
        password: '비밀번호 <span class="red">*</span>',
        login: '로그인',
        wantAccount: '계정이 필요하신가요? <a href="javascript:void(0);" onclick="to_register();">가입하기</a>',
        invalid: '- 유효하지 않은 이메일 또는 비밀번호입니다.',
        tryAgain: '- 잠시 후 다시 시도해주세요.',
        already: '- 이미 등록된 이메일입니다.',
        createAccount: '계정 만들기',
        userName: '사용자 명 <span class="red">*</span>',
        language: '언어 <span class="red">*</span>',
        haveAccount: '이미 계정이 있으신가요?',
        signup: '가입하기'
   },
    'en': {
        greeting: 'Good to see you!',
        email: 'Email or phone number <span class="red">*</span>',
        password: 'Password <span class="red">*</span>',
        login: 'Login',
        wantAccount: 'Do you need an account? <a href="javascript:void(0);" onclick="to_register();">Sign up</a>',
        invalid: '- Invalid email or password.',
        tryAgain: '- Please try again later.',
        already: '- This email is already registered.',
        createAccount: 'Create an account',
        userName: 'Username <span class="red">*</span>',
        language: 'Language <span class="red">*</span>',
        haveAccount: 'Do you already have an account?',
        signup: 'Sign up'
    },
    'ja': {
        greeting: 'いらっしゃい！',
        email: 'メールまたは電話番号 <span class="red">*</span>',
        password: 'パスワード <span class="red">*</span>',
        login: 'ログイン',
        wantAccount: 'アカウントがないんですか？ <a href="javascript:void(0);" onclick="to_register();">加入する</a>',
        invalid: '- 無効な電子メールまたはパスワードです。',
        tryAgain: '- しばらくしてから試してください。',
        already: '- 登録済みのメールです。',
        createAccount: 'アカウント作成',
        userName: 'ニックネーム <span class="red">*</span>',
        language: '言語 <span class="red">*</span>',
        haveAccount: 'すでにアカウントをお持ちですか？',
        signup: '加入する'
    },
    'zh-CN': {
        greeting: '歡迎光臨！',
        email: '電子郵件或電話號碼 <span class="red">*</span>',
        password: '密碼 <span class="red">*</span>',
        login: '登錄',
        wantAccount: '需要賬號嗎？ <a href="javascript:void(0);" onclick="to_register();">加入</a>',
        invalid: '- 無效的電子郵件或密碼。',
        tryAgain: '- 請稍後再試。',
        already: '- 已登記的電子郵件。',
        createAccount: '創建賬戶',
        userName: '用戶名 <span class="red">*</span>',
        language: '語言 <span class="red">*</span>',
        haveAccount: '您已經有賬號了嗎？',
        signup: '加入'
    },
    'zh-TW': {
        greeting: '欢迎光临！',
        email: '电子邮件或电话号码 <span class="red">*</span>',
        password: '密码 <span class="red">*</span>',
        login: '登录',
        wantAccount: '需要账号吗？ <a href="javascript:void(0);" onclick="to_register();">加入</a>',
        invalid: '- 无效的电子邮件或密码。',
        tryAgain: '- 请稍后再试。',
        already: '- 已登记的电子邮件。',
        createAccount: '创建账户',
        userName: '用户名 <span class="red">*</span>',
        language: '语言 <span class="red">*</span>',
        haveAccount: '您已经有账号了吗？',
        signup: '加入'
    }
}

function setLanguage(lang) {
    let changeNodeList = Array.prototype.slice.call(document.querySelectorAll('[data-detect]'));
    changeNodeList.map(v => {
        v.innerHTML = multiLanguage[lang][v.dataset.detect]
    });
}

function selectLanguage() {
    let lang = $('div#langForm > select option:selected').val();
    setCookie('setLang', lang);
    console.log(getCookie('setLang'));
    setLanguage(lang);
}

setLanguage(getCookie('setLang')??'ko');
$('div#langForm > select').val(getCookie('setLang')??'ko').prop('selected', true); // 페이지 언어 설정
$('form#register > select').val(getCookie('setLang')??'ko').prop('selected', true); // register 내 회원 정보의 언어 설정