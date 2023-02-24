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

module.exports = router;