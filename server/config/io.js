module.exports = (server, session) => {
    const io = require('socket.io')(server, {path: '/socket.io'});
    const ios = require('express-socket.io-session');
    io.use(ios(session, {autoSave:true}));
    
    const db = require('./db');
    //Namespace
    //const friendsList = require('../src/friendsListSocket')(io, db);
    io.on('connection', (socket) => {
        let userId;

        // Main Page 접속
        socket.on('login', (callback) => {
            userId = socket.handshake.session.USER_ID;
            console.log('Client Login!: ' + userId);
            db.query(`CALL PRINT_USER_INFO(${userId})`, (err, info) => { callback(info[0][0]); });
        });

        // 친구 목록 호출
        socket.on('friendList', (callback) => {
            db.query(`CALL PRINT_FRIENDS_INFO(${userId})`, (err, friends) => { callback(friends[0]); });
        });

        // 친구 추가(와 동시에 채팅방 생성)
        socket.on('addFriend', (info, callback) => {
            db.query(`CALL SEARCH_USER(${userId}, '${info.NAME}', '${info.TAG}')`, (err, targetId) => {
                if(targetId[0][0]) {
                    console.log(targetId[0][0]);
                    let roomId = makeRoom('ONE');
                    try {
                        db.beginTransaction();
                        db.query(`CALL ADD_FRIEND(${userId}, ${targetId[0][0].USER_ID}, '${roomId}')`, () => { callback(1); });
                        console.log('Add Relation: ', userId, '=>', targetId[0][0].USER_ID);
                        db.commit();
                    } catch (err) {
                        db.rollback();
                    }
                } else {
                    callback(0);
                }
            });
        });

        /** ONE, MANY ; RoomID 반환 */
        function makeRoom(status) {
            let roomId = randomChars(9);
            try {
                db.beginTransaction();
                db.promise().query(`CALL CREATE_ROOM('${roomId}', '${status}')`);
                console.log('Create Room:', roomId);
                db.commit();
            } catch (err) {
                db.rollback();
            }
            return roomId;
        }

        function randomChars(length) {
            const chars = '0123456789abcdefghijkmnopqrstuvwxyzABCDEFGHIJKMNOPQRSTUVWXYZ';
            let str = '';
            for(let i=0; i<length; i++) {
                str += chars.charAt(Math.floor(Math.random() * 60));
            }
            return str;
        }
    });

    return io;
}