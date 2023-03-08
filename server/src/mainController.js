const path = require('path');
const db = require('../config/db');

exports.mainGetMid = (req, res) => {
    if(req.session.USER_ID) {
        res.sendFile('main.html', {root: path.join('client/html/')});
    } else {
        res.redirect('/login');
    }
}

exports.mainMPGetMid = (req, res) => {
    if(req.session.USER_ID) {
        res.sendFile('myPage.html', {root: path.join('client/html/')});
    } else {
        res.redirect('/login');
    }
}