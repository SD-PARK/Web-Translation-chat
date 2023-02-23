const path = require('path');
const db = require('../config/db');

exports.loginGetMid = (req, res) => {
    res.sendFile('login.html', {root: path.join('client/html/')});
}

exports.loginPostMid = (req, res) => {
    const {email, password} = req.body;

    db.query(`SELECT USER_ID FROM USERS
                WHERE EMAIL='${email}' AND PASSWORD='${password}'`, (err, check) => {
                    if (check[0])
                        res.redirect('/main');
                    else
                        res.redirect('/login?failed=1');
                });
}

// try {
//     db.beginTransaction();
// } catch (err) {
//     db.rollback();
// } finally {
//     db.release();
// }