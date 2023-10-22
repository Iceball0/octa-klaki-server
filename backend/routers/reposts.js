const router = require('express').Router();

const controller = require('../controllers/RepostsController');

router.post('/', controller.post);

module.exports = router;