const path = require('path');
const db = require('../config/db');
const crypto = require('crypto');
const SECRET = require('../config/key').CRYPTO_SECRET;

function hash(password) {
    return crypto.createHmac('SHA256', SECRET).update(password).digest('hex');
}

exports.loginGetMid = (req, res) => {
    if (req.session.user)
        res.redirect('/main');
    else
        res.sendFile('login.html', {root: path.join('client/html/')});
}

exports.loginPostMid = (req, res) => {
    const {email, password} = req.body;
    const crypto_pw = hash(password);
    console.log('login:', email, password);

    db.query(`SELECT USER_ID FROM USERS
                WHERE EMAIL='${email}' AND PASSWORD='${crypto_pw}'`, (err, check) => {
                    if (check[0]) {
                        req.session.user = check[0];
                        res.redirect('/main');
                    }
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
    
    try {
        db.beginTransaction();
        
        db.query(`SELECT USER_ID FROM USERS WHERE EMAIL='${email}'`, (err, check) => {
            if (check[0])
                res.redirect('/register?err=100');
            else {
                let tag;
                db.query(`SELECT NAME_TAG FROM USERS WHERE NAME='${name}'`, (err, used_tag) => {
                    if (used_tag) {
                        do {
                            tag = ('#' + Math.floor(Math.random() * 10000));
                            for(let i of used_tag)
                                if (tag == i.USER_TAG)
                                    tag = -1;
                        } while (tag == -1);
                    }
                    
                    db.query(`INSERT INTO USERS (EMAIL, PASSWORD, NAME, NAME_TAG) VALUE ('${email}', '${crypto_pw}', '${name}', '${tag}')`, (err, r) => {
                        res.redirect('/login');
                        console.log('register:', email, name + tag);
                    });
                });
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