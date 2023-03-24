const path = require('path');
const db = require('../config/db');
// const sharp = require('sharp');
// const fs = require('fs');

exports.mainGetMid = (req, res) => {
    if(req.session.USER_ID) {
        res.sendFile('main.html', {root: path.join('client/html/')});
    } else {
        res.redirect('/login');
    }
}

exports.mainMPGetMid = (req, res) => {
    if(req.session.USER_ID) {
        req.session.ROOM_TARGET = '@mp';
        req.session.ROOM_ID = 0;
        res.sendFile('myPage.html', {root: path.join('client/html/')});
    } else {
        res.redirect('/login');
    }
}

exports.mainUploadPostMid = (req, res) => {
    const userId = req.session.USER_ID;
    
    if(req.file) {
        const imgName = req.file.filename;
        try {
            // sharp(req.file.path).resize({width:500}).withMetadata().toBuffer((err, buffer) => { // 이미지 리사이징
            //     if (err) throw err;
            //     fs.writeFile(req.file.path, buffer, (err) => {if (err) throw err});
            // });
            db.beginTransaction();
            db.query(`CALL UPDATE_IMAGE(${userId}, '${imgName}')`);
            db.commit();
        } catch (err) {
            console.log(err);
            db.rollback();
        }
    }
    res.redirect('/main/@mp');
}