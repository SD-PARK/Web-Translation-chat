const path = require('path');
const db = require('../config/db');
const crypto = require('crypto');
const SECRET = require('../config/key').CRYPTO_SECRET;

function hash(password) {
    return crypto.createHmac('SHA256', SECRET).update(password).digest('hex');
}

exports.loginGetMid = (req, res) => {
    if (req.session.USER_ID)
        res.redirect('/main/@fr');
    else
        res.sendFile('login.html', {root: path.join('client/html/')});
}

exports.loginPostMid = (req, res) => {
    const {email, password} = req.body;
    const crypto_pw = hash(password);
    console.log('login:', email);

    try {
        db.beginTransaction();
        db.query(`SELECT USER_ID FROM USERS
        WHERE EMAIL='${email}' AND PASSWORD='${crypto_pw}'`, (err, check) => {
            if (check[0]) {
                req.session.USER_ID = check[0].USER_ID;
                res.redirect('/main/@mp');
            }
            else
                res.redirect('/login?failed=1');
        });
        db.commit();
    } catch (err) {
        res.redirect('/login?failed=2');
        db.rollback();
    }
}

exports.registerGetMid = (req, res) => {
    res.sendFile('register.html', {root: path.join('client/html/')});
}

exports.registerPostMid = (req, res) => {
    const {email, password, name, language} = req.body;
    console.log(req.body.language);
    const crypto_pw = hash(password);

    try {
        db.beginTransaction();
        db.query(`CALL CHECK_DUPLICATE_EMAIL('${email}')`, (err, check) => {
            if (check[0][0]) {
                res.redirect('/register?err=100');
            }
            else {
                db.query(`CALL CHECK_DUPLICATE_NAMETAG('${name}')`, (err, used_tag) => {
                    let tag;
                    if (used_tag[0][0]) {
                        if (used_tag[0].length >= 9999) {
                            // 모든 네임태그 사용 중일 때
                        } else {
                            do {
                                tag = ('#' + Math.floor(Math.random() * 10000));
                                for(let i of used_tag[0])
                                    if (tag == i.NAME_TAG) {
                                        tag = -1;
                                    }
                            } while (tag == -1);
                        }
                    } else {
                        tag = ('#' + Math.floor(Math.random() * 10000));
                    }
                    
                    db.query(`CALL SIGNUP('${email}', '${crypto_pw}', '${name}', '${tag}', '${language}')`, () => {
                        res.redirect('/login');
                        console.log('Register:\n    Email:', email,'    Name:', name + tag);
                    });
                });
            }
        });
        db.commit();
    } catch (err) {
        res.redirect('/register?err=101');
        db.rollback();
    }
}

exports.logoutGetMid = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
}