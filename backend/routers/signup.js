const router = require('express').Router();
const upload = require("../upload");

const { auth } = require('../middlewares/auth');
const controller = require('../controllers/SignupController');

router.post('/', upload.single("avatar"), controller.post, auth);


module.exports = router;