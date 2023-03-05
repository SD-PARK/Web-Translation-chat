const router = require('express').Router();
const loginController = require('./loginController');
const mainController = require('./mainController');

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/login', loginController.loginGetMid);

router.post('/login', loginController.loginPostMid);

router.get('/register', loginController.registerGetMid);

router.post('/register', loginController.registerPostMid);

router.get('/main', mainController.mainGetMid);

router.get('/main/:target', (req, res, next) => {
    req.session.ROOM_TARGET = req.params.target;
    req.session.ROOM_ID = 0;
    next();
}, mainController.mainGetMid);

router.get('/main/:target/:id', (req, res, next) => {
    req.session.ROOM_TARGET = req.params.target;
    req.session.ROOM_ID = req.params.id;
    next();
}, mainController.mainGetMid);

module.exports = router;