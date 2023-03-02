module.exports = (chat, db) => {
    chat.on('connection', (socket) => {
        let userId, roomId, name;

        // Main Page 접속
        socket.on('login', (callback) => {
            userId = socket.handshake.session.USER_ID;
            roomId = socket.handshake.session.ROOM_ID;

            console.log('Client Login!: ' + userId);
            try {
                db.beginTransaction();
                db.query(`CALL PRINT_USER_INFO(${userId})`, (err, info) => {
                    try { callback(info[0][0]); name = info[0][0].NAME; }
                    catch (err) {}
                });
                db.commit();
            } catch (err) {
                db.rollback();
            }

            if(roomId) {
                db.query(`CALL PRINT_MESSAGES('${roomId}')`, (err, logs) => {
                    socket.emit('chatLogs', (logs[0]));
                });
                socket.join(roomId);
            }
        });

        socket.on('disconnect', () => {
            socket.leave(roomId);
            roomId = 0;
        });

        socket.on('sendMessage', (data) => {
            msgInfo = {
                NAME: name,
                CHAT: data.MSG,
                SEND_TIME: data.TIME
            }

            try {
                db.query(`CALL SEND_MESSAGE('${roomId}', ${userId}, '${data.MSG}')`);
                console.log('MSG DB Save: ', roomId, userId, data.MSG, data.TIME);
                chat.to(roomId).emit('msgReceive', msgInfo);
            } catch (err) {}
        });

        // 친구 목록 호출
        socket.on('friendChatList', (callback) => {
            try {
                db.beginTransaction();
                db.query(`CALL PRINT_FRIENDS_CHAT(${userId})`, (err, friends) => { try{ callback({ LIST: friends[0], ACCENT: roomId}); } catch (err){} });
                db.commit();
            } catch (err) {
                db.rollback();
            }
        });

        // 친구 추가(와 동시에 채팅방 생성)
        socket.on('addFriend', (info, callback) => {
            try {
                db.beginTransaction();
                db.query(`CALL SEARCH_USER_RELATION(${userId}, '${info.NAME}', '${info.TAG}')`, (err, rel) => { // 검색인자와 일치하는 유저 불러옴
                    if(rel[0][0]) { // 일치하는 유저가 있다면?
                        if(rel[0][0].ME_REL) { // 나의 친구로 등록된 사용자라면?: '친구로 등록된 사용자예요!'
                            console.log(-1);
                            callback(-1);
                        } else {
                            try {
                                db.beginTransaction();
                                db.query(`CALL ADD_FRIEND(${userId}, ${rel[0][0].USER_ID})`);
                                if(!rel[0][0].TARGET_REL) // 상대방이 나를 친구로 등록하지 않았다면?: 개인 방 생성, 초대
                                    inviteRoom([userId, rel[0][0].USER_ID], makeRoom('ONE'));
                                console.log('Add Relation: ', userId, '=>', rel[0][0].USER_ID);
                                db.commit();
                                callback(1);
                            } catch (err) {
                                db.rollback();
                            }
                        }
                    } else { // 일치하는 유저가 없다면?: '이름과 태그가 정확한지 다시 한 번 확인해주세요.'
                        console.log(0);
                        callback(0);
                    }
                });
                db.commit();
            } catch (err) {
                callback(0);
                db.rollback();
            }
        });

        /** ONE, MANY ; RoomID 반환 */
        function makeRoom(status) {
            let id = randomChars(9);
            db.query(`CALL CREATE_ROOM('${id}', '${status}')`);
            console.log('Create Room: [' + status + '] ', id);
            return id;
        }

        /** 랜덤 문자열 생성 */
        function randomChars(length) {
            const chars = '0123456789abcdefghijkmnopqrstuvwxyzABCDEFGHIJKMNOPQRSTUVWXYZ';
            let str = '';
            for(let i=0; i<length; i++) {
                str += chars.charAt(Math.floor(Math.random() * 60));
            }
            return str;
        }

        /** 대화방에 사용자 초대 */
        function inviteRoom(person, room) {
            for(let p of person) {
                db.query(`CALL INVITE_ROOM (${p}, '${room}')`);
                console.log('Invite Room:', p, '=>', room);
            }
        }
    });
}