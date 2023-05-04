module.exports = (server, session) => {
    const io = require('socket.io')(server, {path: '/socket.io'});
    const ios = require('express-socket.io-session');
    const db = require('./db');

    // Namespace
    const chat = io.of('/chat');
    chat.use(ios(session, {autoSave:true})); // Session 사용 설정
    const chatSocket = require('../src/chatSocket')(chat, db);

    return io;
}