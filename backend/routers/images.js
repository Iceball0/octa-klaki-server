const router = require('express').Router();

const { isLogged } = require('../middlewares/auth');
const controller = require('../controllers/ImagesController');

router.get("/:name", controller.get);
router.delete('/:imageId', isLogged, controller.delete);


module.exports = router;