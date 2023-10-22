const router = require('express').Router();

const { auth } = require('../middlewares/auth');
const controller = require('../controllers/LoginController');

router.post('/', controller.post, auth);


module.exports = router;