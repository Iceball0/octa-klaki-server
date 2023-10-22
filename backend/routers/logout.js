const router = require('express').Router();

const controller = require('../controllers/LogoutController');

router.post('/', controller.post);


module.exports = router;