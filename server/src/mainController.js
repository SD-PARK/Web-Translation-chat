const path = require('path');
const db = require('../config/db');

exports.mainGetMid = (req, res) => {
    res.sendFile('main.html', {root: path.join('client/html/')});
}