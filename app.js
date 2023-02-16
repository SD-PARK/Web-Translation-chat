const PORT = 3000;

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('./server/config/io')(server);
const path = require('path');

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/client/html/login.html');
});
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/client/html/register.html');
});
app.get('/main', (req, res) => {
    res.sendFile(__dirname + '/client/html/main.html');
})

app.use('/client', express.static(path.join(__dirname, 'client')));
app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')));
// app.use(express.urlencoded({extended: false}));
// app.set('io', io);

server.listen(PORT, () => {
    console.log('Server Listening on PORT', PORT);
});