const router = require('express').Router();
const upload = require("../upload");

const { isLogged, isAuthor } = require('../middlewares/auth');
const controller = require('../controllers/PostsController');

router.get('/', controller.get);
router.get('/:slug', controller.getOne);
router.post('/', isLogged, upload.any("preview"), controller.post);
router.patch('/:slug', isLogged, isAuthor, upload.any("preview"), controller.patch);
router.delete('/:slug', isLogged, isAuthor, controller.delete);

module.exports = router;