module.exports = (chat, db) => {
    chat.on('connection', (socket) => {
        let userId, roomId, name, lang;
        const escapeMap = require('../config/escapeMap');
        const papago = require('../config/translate');

        // Main Page 접속
        socket.on('login', (callback) => {
            userId = socket.handshake.session.USER_ID;
            roomId = socket.handshake.session.ROOM_ID;
            roomTarget = socket.handshake.session.ROOM_TARGET;

            console.log('Client Login!: ' + userId);
            try {
                db.beginTransaction();
                db.query(`CALL PRINT_USER_INFO(${userId})`, (err, info) => {
                    try { 
                        callback({TARGET:roomTarget, INFO:info[0][0]}); name = info[0][0].NAME; lang = info[0][0].LANGUAGE;
                    } catch (err) {}

                    if(roomId) {
                        db.query(`CALL PRINT_MESSAGES('${roomId}', '${lang}')`, async (err, logs) => {
                            try {
                                for(let i=0; i<logs[0].length; i++) {
                                    let eMsg = await translate(logs[0][i]);
                                    logs[0][i].eMsg = eMsg;
                                }
                                socket.emit('chatLogs', (logs[0]));
                            } catch (err) {}
                        });
                        socket.join(roomId);
                    }
                });
                db.commit();
            } catch (err) {
                db.rollback();
            }
        });

        // 페이지 벗어남
        socket.on('disconnect', () => {
            roomId, roomTarget = 0;
            socket.leave(roomId);
        });

        // 메세지 송신
        socket.on('sendMessage', (data) => {
            let eMsg = escapeMap(data.MSG);

            try {
                db.query(`CALL SEND_MESSAGE('${roomId}', ${userId}, '${eMsg}', '${lang}')`, (err, msgId) => {
                    console.log('MSG DB Save: ', roomId, userId, data.MSG, data.TIME);
                    chat.to(roomId).emit('msgAlert', (msgId[0][0].MSG_ID));
                });
            } catch (err) {console.log('>> MSG SEND ERROR:', roomId, userId, eMsg);}
        });

        socket.on('msgReceive', (MSG_ID, callback) => {
            db.query(`CALL PRINT_ONE_MESSAGE('${roomId}', ${MSG_ID}, '${lang}')`, async (err, msgData) => {
                let eMsg = await translate(msgData[0][0]);
                msgData[0][0].eMsg = eMsg;
                callback(msgData[0][0]);
            });
        });

        // 친구 목록 호출
        socket.on('friendChatList', (callback) => {
            try {
                db.beginTransaction();
                db.query(`CALL PRINT_FRIENDS_CHAT(${userId})`, (err, friends) => { try{ callback({ LIST: friends[0], ACCENT: roomId});} catch (err){} });
                db.commit();
            } catch (err) {
                db.rollback();
            }
        });

        // 친구 추가(와 동시에 채팅방 생성)
        socket.on('addFriend', (info, callback) => {
            try {
                db.beginTransaction();
                db.query(`CALL SEARCH_USER_RELATION(${userId}, '${info.NAME}', '${info.TAG}')`, (err, rel) => { // 검색인자와 일치하는 유저의 ID, 해당 유저와의 관계 불러옴
                    if(rel[0][0]?.USER_ID) { // 일치하는 유저가 있다면?
                        if(rel[0][0]?.ME_REL) { // 나의 친구로 등록된 사용자라면?: '친구로 등록된 사용자예요!'
                            callback(-1);
                        } else {
                            try {
                                db.query(`CALL ADD_FRIEND(${userId}, ${rel[0][0].USER_ID})`);
                                db.query(`CALL CHECK_EXIST_ROOM(${userId}, ${rel[0][0].USER_ID});`, (err, room) => { // 이미 생성된 방이 있는지 체크
                                    console.log(room[0]);
                                    if (room[0][0]?.STATUS == undefined) { // 상대방과의 기존 방이 없다면, 생성 후 초대
                                        inviteRoom([userId, rel[0][0].USER_ID], makeRoom({STATUS:'ONE'}));
                                    } else if (room[0][0]?.STATUS == 'EXIT') { // 상대방과의 기존 방이 있으며, 나왔다면, 기존 방 입장
                                        inviteRoom([userId], room[0][0].ROOM_ID);
                                    }
                                    callback(1);
                                    console.log('Add Relation: ', userId, '=>', rel[0][0].USER_ID);
                                });
                            } catch (err) {
                            }
                        }
                    } else { // 일치하는 유저가 없다면?: '이름과 태그가 정확한지 다시 한 번 확인해주세요.'
                        callback(0);
                    }
                });
                db.commit();
            } catch (err) {
                callback(0);
                db.rollback();
            }
        });

        // 친구 삭제
        socket.on('deleteFriend', (roomId, callback) => {
            db.query(`CALL DELETE_FRIEND(${userId}, '${roomId}')`, (err, res) => {
                db.query(`CALL CHECK_REMOVED_ROOM('${roomId}')`); // 채팅방에 남은 인원이 없을 경우 관련 데이터 제거
            });
            console.log('Delete Relation!');
            callback();
        });

        // 채팅방 목록 호출
        socket.on('roomChatList', (callback) => {
            try {
                db.beginTransaction();
                db.query(`CALL PRINT_ROOM_CHAT(${userId})`, (err, rooms) => { try{ callback({ LIST: rooms[0], ACCENT: roomId});} catch (err){} });
                db.commit();
            } catch (err) {
                db.rollback();
            }
        });

        // 채팅방 참가
        socket.on('checkRoomId', (checkId, callback) => {
            db.query(`CALL CHECK_ROOM_ID('${checkId}')`, (err, res) => {
                if(res[0][0]?.ROOM_ID) {
                    callback(1);
                    inviteRoom([userId], checkId);
                }
                else callback(0);
            });
        });

        // 채팅방 생성
        socket.on('createRoom', (title) => {
            inviteRoom([userId], makeRoom({STATUS:'MANY', TITLE:title}));
        });

        // 채팅방 나가기
        socket.on('exitNowRoom', (callback) => {
            try{
                db.beginTransaction();
                db.query(`CALL EXIT_ROOM(${userId}, '${roomId}')`, (err, r) => {
                    callback();
                });
                db.commit();
            } catch(err) {db.rollback();}
        });
        
        // 계정 삭제
        socket.on('deleteAccount', (callback) => {
            try {
                db.beginTransaction();
                db.query(`CALL DELETE_USER(${userId})`, (err, res) => {callback();});
                db.commit();
            } catch(err) {db.rollback();}
        });

        /** ONE, MANY ; RoomID 반환 */
        function makeRoom(info) {
            let id = randomChars(9); // 같은 이름의 채팅방이 있을 경우
            db.query(`CALL CREATE_ROOM('${id}', '${info.STATUS}', '${info?.TITLE ?? '채팅방'}')`);
            console.log('Create Room: [' + info.STATUS + '] ', id);
            return id;
        }

        /** 랜덤 문자열 생성 */
        function randomChars(length) {
            const chars = '0123456789abcdefghijkmnopqrstuvwxyz';
            let str = '';
            for(let i=0; i<length; i++) {
                str += chars.charAt(Math.floor(Math.random() * 35));
            }
            return str;
        }

        /** 채팅방에 사용자 초대 */
        function inviteRoom(person, room) {
            for(let p of person) {
                db.query(`CALL INVITE_ROOM (${p}, '${room}')`, (err, res) => {
                    console.log('Invite Room:', p, '=>', room);
                });
            }
        }

        /** 번역된 메시지가 없다면 번역 후 DB에 저장 */
        async function translate(data) {
            let eMsg = '';
            if(!data?.LANG_CHAT) {
                return await new Promise(async (resolve, reject) => {
                    eMsg = await papago.lookup(data.SEND_LANGUAGE, lang, data.CHAT);
                    try {
                        db.query(`CALL UPDATE_LANG_MESSAGE('${roomId}', ${data.MSG_ID}, '${lang}', '${eMsg}')`);
                    } catch(err) {}
                    resolve(eMsg);
                });
            }
        }
    });
}