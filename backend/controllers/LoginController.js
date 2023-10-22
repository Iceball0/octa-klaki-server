const bcrypt = require('bcrypt');
const Users = require('../models/users');
const Images = require('../models/images');

module.exports = {

    post: async (req, res, next) => {
        reqLogin = req.body.login;
        const user = await Users.findOne({ where: { login: req.body.login }, include: [Images] });

        if (user) {
            const isValidPassword = await bcrypt.compare(req.body.password, user.hashed_password);

            if (isValidPassword) {
                req.user = user;
                return next();
            }
        }

        return res.status(400).send({ msg: "Неправильный логин или пароль" });
    }

}