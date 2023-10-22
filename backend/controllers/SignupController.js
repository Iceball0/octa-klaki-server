const bcrypt = require('bcrypt');
const Users = require('../models/users');
const Images = require('../models/images');

module.exports = {

    post: async (req, res, next) => {
        let user = await Users.findOne({ where: { login: req.body.login } });

        if (user) return res.status(400).send({ msg: "Пользователь с таким логином уже существует" });
        if (req.body.password !== req.body.password2) return res.status(400).send({ msg: "Пароли не совпадают" });

        const new_user = {
            login: req.body.login,
            username: req.body.name,
            hashed_password: "",
        }

        try {
            const hashed = await bcrypt.hash(req.body.password, 10);
            new_user.hashed_password = hashed;

            if (req.file) 
                new_user.image = { name: req.file.filename };

            user = await Users.create(new_user, {include: Images});

            req.user = user;

            next();
        } catch (err) {
            console.error(err);
            res.status(500).send({ msg: 'Ошибка на стороне сервера' });
        }
    }

}