module.exports = (server, session) => {
    const io = require('socket.io')(server, {path: '/socket.io'});
    const ios = require('express-socket.io-session');
    io.use(ios(session, {autoSave:true}));
    
    const db = require('./db');
    //Namespace
    //const friendsList = require('../src/friendsListSocket')(io, db);
    io.on('connection', (socket) => {
        let userId;
        socket.on('login', (callback) => {
            userId = socket.handshake.session.USER_ID;
            console.log('Client Login!: ' + userId);
            db.query(`CALL PRINT_USER_INFO(${userId})`, (err, info) => {
                callback(info[0][0]);
            });
        });

        socket.on('friendList', (callback) => {
            db.query(`CALL PRINT_FRIENDS_INFO(${userId})`, (err, friends) => {
                callback(friends[0]);
            });
        });

        socket.on('addFriend', (info, callback) => {
            db.query(`CALL SEARCH_USER(${userId}, '${info.NAME}', '${info.TAG}')`, (err, targetId) => {
                console.log(targetId[0]);
                if(targetId[0][0]) {
                    db.query(`CALL ADD_FRIEND(${userId}, ${targetId[0][0].USER_ID})`, (err, res) => {
                        callback(1);
                    });
                } else {
                    callback(0);
                }
            });
        });
    });

    return io;
}