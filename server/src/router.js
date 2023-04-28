const router = require('express').Router();
const loginController = require('./loginController');
const mainController = require('./mainController');
const { upload } = require('../config/multer');

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/login', loginController.loginGetMid);

router.post('/login', loginController.loginPostMid);

router.get('/register', loginController.registerGetMid);

router.post('/register', loginController.registerPostMid);

router.get('/logout', loginController.logoutGetMid);

router.get('/main', mainController.mainMPGetMid);

router.put('/main/upload', upload.single('upload_image'), mainController.mainUploadPutMid);

router.get('/main/:target', mainController.mainMPGetMid);

router.get('/main/:target/:id', (req, res, next) => {
    req.session.ROOM_TARGET = req.params.target;
    req.session.ROOM_ID = req.params.id;
    next();
}, mainController.mainGetMid);

module.exports = router;