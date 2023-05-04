const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const SESSION_KEY = require('./key').SESSION_KEY;
const sessionObj = session({
    httpOnly: true, // true - js로 쿠키 조회 불가
    secret: SESSION_KEY, // cookie의 임의 변경을 방지, 이 값을 토대로 session을 암호화하여 저장
    resave: false, // session에 변경사항이 없을 때 저장 여부
    saveUninitialized: true, // session이 최초 생성 뒤 수정이 안 된다면, 저장되기 전 uninitialized 상태로 미리 만들어 저장한다. 일반적으로 false.
    store: new MemoryStore(),
    // store: new MemoryStore({ checkPeriod: 1000 * 60 * 10 }),
    // cookie: {
    //     maxAge: 1000 * 60 * 60,
    // },
});

module.exports = sessionObj;