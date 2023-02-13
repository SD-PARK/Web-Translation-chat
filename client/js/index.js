$(() => {
    console.log('1');
    const socket = io();
    console.log('2');
    socket.emit('login');
});