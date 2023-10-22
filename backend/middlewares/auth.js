const jwt = require('jsonwebtoken');

const RefreshSessions = require('../models/refreshSessions');
const Posts = require('../models/posts');
const Images = require('../models/images');
const Comments = require('../models/comments');

// auth Users
exports.auth = async (req, res) => {
    const { accessToken, refreshToken, expiresIn } = await RefreshSessions.generateToken(req.user, req.fingerprint.hash, req.useragent.source);

    return res.status(200)
    .cookie('refreshToken', refreshToken, {
        path: "/api/auth",
        expires: new Date(new Date().getTime() + expiresIn * 1000),
        httpOnly: true,
        sameSite: 'none',
        secure: true
    })
    .send({
        accessToken: accessToken,
        role: req.user.role
    });
}

exports.isLogged = async (req, res, next) => {
    try {
        var verify;

        const accessToken = req.headers.authorization.split(' ')[1];
        verify = jwt.verify(accessToken, process.env.JWT_SECRET);

        if (!verify) return res.status(403).send({ msg: "Логин исчерпан" });
        req.token = verify;

        next();
    } catch (err) {
        return res.status(403).send({ msg: "Логин исчерпан" });;
    }
}

exports.isAuthor = async(req, res, next) => {
    try {
        const post = await Posts.findOne({ where: { slug: req.params.slug }, include: [Images]});
        if (!post) return res.status(404).send({ msg: 'Пост не найден' });
        if (req.token.userId !== post.userId) return res.status(400).send({ msg: "Недостаточно прав" });

        req.post = post;

        next();
    } catch (err) {
        return res.status(403).send({ msg: "Логин исчерпан" });;
    }
}

exports.isCommentator = async(req, res, next) => {
    try {
        const comment = await Comments.findOne({ where: { id: req.params.id }});
        if (!comment) return res.status(404).send({ msg: 'Комментарий не найден' });
        if (req.token.userId !== comment.userId) return res.status(400).send({ msg: "Недостаточно прав" });

        req.comment = comment;

        next();
    } catch (err) {
        return res.status(403).send({ msg: "Логин исчерпан" });;
    }
}

exports.isAdmin = async (req, res, next) => {
    try {
        if (req.token.role < 5) return res.status(400).send({ msg: "Недостаточно прав" });

        next();
    } catch (err) {
        return res.status(403).send({ msg: "Логин исчерпан" });;
    }
}