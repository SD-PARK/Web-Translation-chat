const socket = io('/chat');

socket.on('connect', () => {
    socket.emit('joinList');

    // socket.emit('getRoomList', '');
    socket.on('getRoomList', (rooms) => {
        if (rooms?.error) {
            // 방 목록 불러오기 실패 시 알림 띄우기
            console.log(rooms.error);
            loadModal(errorApp('목록을 불러오지 못했습니다.', '초 뒤 새로고침 됩니다.'));
            timerCloseAlert(5).then(() => {
                location.reload();
            });
        } else {
            for (room of rooms) {
                roomsMap.set(room.room_id, room);
                addCol(room);
            }
        }
    });

    socket.on('update', (data) => {
        const updatedRoom = {
            ...roomsMap.get(data.room_id),
            ...data,
        };
        roomsMap.set(data.room_id, updatedRoom);
        updateCol(data);
    });
});

/** 방을 생성합니다. */
function createRoom() {
    const enterTitle = $('#enter-title').val();
    socket.emit('postRoom', { room_name: enterTitle }, (error) => {
        if (error) {
            // 방 생성 실패 시 알림 띄우기
            console.error(error);
            loadModal(errorApp('채팅방을 생성할 수 없습니다.'));
            timerCloseAlert(3);
        } else {
            closeAlert();
        }
    });
}