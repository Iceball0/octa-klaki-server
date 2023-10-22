const router = require('express').Router();

const { isLogged } = require('../middlewares/auth');
const controller = require('../controllers/ViewsController');

router.get('/', isLogged, controller.get);
router.post('/', controller.post);

module.exports = router;