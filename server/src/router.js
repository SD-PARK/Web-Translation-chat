const router = require('express').Router();
const loginController = require('./loginController');

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/login', loginController.loginGetMid);

router.post('/login', loginController.loginPostMid);

module.exports = router;