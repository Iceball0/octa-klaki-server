const router = require('express').Router();

const { auth } = require('../middlewares/auth');
const controller = require('../controllers/RefreshController');

router.post('/', controller.post, auth);


module.exports = router;