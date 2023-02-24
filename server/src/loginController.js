const path = require('path');
const db = require('../config/db');
const crypto = require('crypto');
const SECRET = require('../config/key').CRYPTO_SECRET;

function hash(password) {
    return crypto.createHmac('SHA256', SECRET).update(password).digest('hex');
}

exports.loginGetMid = (req, res) => {
    res.sendFile('login.html', {root: path.join('client/html/')});
}

exports.loginPostMid = (req, res) => {
    const {email, password} = req.body;
    const crypto_pw = hash(password);
    console.log('login:', email, password);

    db.query(`SELECT USER_ID FROM USERS
                WHERE EMAIL='${email}' AND PASSWORD='${crypto_pw}'`, (err, check) => {
                    console.log(check[0]);
                    if (check[0])
                        res.redirect('/main');
                    else
                        res.redirect('/login?failed=1');
                });
}

exports.registerGetMid = (req, res) => {
    res.sendFile('register.html', {root: path.join('client/html/')});
}

exports.registerPostMid = (req, res) => {
    const {email, password, name} = req.body;
    const crypto_pw = hash(password);
    console.log('register:', email, password, name);
    
    try {
        db.beginTransaction();
        
        db.query(`SELECT USER_ID FROM USERS WHERE EMAIL='${email}'`, (err, check) => {
            if (check[0])
                res.redirect('/register?err=100');
            else {
                db.query(`INSERT INTO USERS (EMAIL, PASSWORD, NAME)
                            VALUE ('${email}', '${crypto_pw}', '${name}')`, (err, res) => {});
                res.redirect('/login');
            }
        });
    } catch (err) {
        console.log(err);
        res.redirect('/register?err=101');
        db.rollback();
    } finally {
        db.commit();
    }
}