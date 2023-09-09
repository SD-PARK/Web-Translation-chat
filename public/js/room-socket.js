const socket = io('/chat');

socket.on('connect', () => {
    socket.emit('joinList');

    // socket.emit('getRoomList', '');
    socket.on('getRoomList', (rooms) => {
        for (room of rooms) {
            addCol(room);
        }
    });

    socket.on('update', (data) => {
        const col = $(`.${data?.room_id}`);
        if (col) {
            if (data?.cnt !== undefined) {
            }
            for (const key in data) {
                const div = col.find(`.${key}`);
                div.text(`${data[key]}`);
                if (key === 'cnt') div.append('/∞');
            }
        }
    });
});

function filterSearch() {
    const filterTitle = $('#filter-title').val();
    logClear();
    socket.emit('getRoomList', filterTitle);
}