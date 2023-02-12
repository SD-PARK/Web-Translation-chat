module.exports = (server) => {
    const io = require('socket.io')(server, {path: '/socket.io'});
    
    //Namespace
    //const friendsList = require('../src/friendsListSocket')(io, db);
    io.on('connection', (socket) => {
        socket.on('login', () => {
            console.log('Client Login!');
        });
    });

    return io;
}