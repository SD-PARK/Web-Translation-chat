const PORT = 3000;

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const session = require('./server/config/session');
const io = require('./server/config/io')(server, session);
const path = require('path');

// Body-parser
app.use(express.json());
app.use(express.urlencoded({extended: false}));
// Static
app.use('/client', express.static(path.join(__dirname, 'client')));
app.use('/config', express.static(path.join(__dirname, 'server/config')));
app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')));
// Session
app.use(session);
// Method-Override
app.use(require('method-override'));
// app.set('io', io);

const router = require('./server/src/router');
app.use('/', router);

server.listen(PORT, () => {
    console.log('Server Listening on PORT', PORT);
});