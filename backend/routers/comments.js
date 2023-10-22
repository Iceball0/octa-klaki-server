const router = require('express').Router();

const { isLogged, isCommentator } = require('../middlewares/auth');
const controller = require('../controllers/CommentsController');

router.post('/', isLogged, controller.post);
router.delete('/:id', isLogged, isCommentator, controller.delete);

module.exports = router;