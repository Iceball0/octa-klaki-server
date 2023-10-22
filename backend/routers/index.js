const router = require('express').Router();

router.use('/auth/login', require('./login'));
router.use('/auth/signup', require('./signup'));
router.use('/auth/refresh', require('./refresh'));
router.use('/auth/logout', require('./logout'));

router.use('/users', require('./users'));
router.use('/posts', require('./posts'));
router.use('/categories', require('./categories'));
router.use('/comments', require('./comments'));
router.use('/likes', require('./likes'));
router.use('/subscriptions', require('./subscriptions'));
router.use('/views', require('./views'));
router.use('/reposts', require('./reposts'));

router.use('/images', require('./images'));


module.exports = router;