const PORT = 3000;

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('./server/config/io')(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/html/index.html');
});

app.use(express.static('client'));
// app.use(express.urlencoded({extended: false}));
// app.set('io', io);

server.listen(PORT, () => {
    console.log('Server Listening on PORT', PORT);
});