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

function filterSearch() {
    const filterTitle = $('#filter-title').val();
    logClear();
    roomsMap.forEach((value, key) => {
        if (value?.room_name.includes(filterTitle)) {
            addCol(value);
        };
    });
}