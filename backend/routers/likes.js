const router = require('express').Router();

const { isLogged } = require('../middlewares/auth');
const controller = require('../controllers/LikesController');

router.get('/', isLogged, controller.get);
router.post('/', isLogged, controller.post);

module.exports = router;