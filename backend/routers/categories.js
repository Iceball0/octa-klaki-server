const router = require('express').Router();

const controller = require('../controllers/CategoriesController');

router.get('/', controller.get);

module.exports = router;