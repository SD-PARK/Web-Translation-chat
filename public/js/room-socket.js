const socket = io('/chat');

socket.on('connect', () => {
    socket.emit('joinList');

    // socket.emit('getRoomList', '');
    socket.on('getRoomList', (rooms) => {
        for (room of rooms) {
            roomsMap.set(room.room_id, room);
            addCol(room);
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
    socket.emit('postRoom', {
        room_name: enterTitle,
    });
    closeAlert();
}