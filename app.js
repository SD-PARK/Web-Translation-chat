const PORT = 3000;

const app = require('express')();
const server = require('http').createServer(app);
const io = require('./server/config/io')(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

// app.set('io', io);

server.listen(PORT, () => {
    console.log('Server Listening on PORT', PORT);
});