module.exports = (server, session) => {
    const io = require('socket.io')(server, {path: '/socket.io'});
    const ios = require('express-socket.io-session');
    io.use(ios(session, {autoSave:true}));
    
    const db = require('./db');
    //Namespace
    //const friendsList = require('../src/friendsListSocket')(io, db);
    io.on('connection', (socket) => {
        socket.on('login', (callback) => {
            let userId = socket.handshake.session.USER_ID;
            console.log('Client Login!: ' + userId);
            db.query(`CALL PRINT_USER_INFO(${userId})`, (err, info) => {
                callback(info[0][0]);
            });
        });
    });

    return io;
}