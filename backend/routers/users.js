const router = require('express').Router();

const controller = require('../controllers/UsersController');

router.get('/:id', controller.get);

module.exports = router;