const sequelize = require('../models/database');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const Posts = require('../models/posts');
const Images = require('../models/images');
const Users = require('../models/users');
const Categories = require('../models/categories');
const Views = require('../models/views');

module.exports = {

    get: async(req, res) => {
        let viewed = await Views.findAll({ attributes: ['postId'], where: { user: req.token.userId, registered: 1 } });

        let where = {};
        if ('search' in req.query) where.title = { [Op.like]: `%${req.query.search}%` };
        where.id = { [Op.in]: viewed.map(sub => sub.dataValues.postId) }

        let posts = await Posts.findAll({ 
            attributes: [
                'id', 'title', 'subtitle', 'slug', 'createdAt', 
                [sequelize.literal('(SELECT COUNT(likes.id) FROM likes WHERE likes.postId=posts.id)'), 'likesCount'],
                [sequelize.literal('(SELECT COUNT(comments.id) FROM comments WHERE comments.postId=posts.id)'), 'commentsCount'],
                [sequelize.literal('(SELECT COUNT(subscriptions.id) FROM subscriptions WHERE subscriptions.authorId=posts.userId)'), 'subscriptionsCount'],
                [sequelize.literal('(SELECT COUNT(views.id) FROM views WHERE views.postId=posts.id)'), 'viewsCount'],
                [sequelize.literal('(SELECT COUNT(reposts.id) FROM reposts WHERE reposts.postId=posts.id)'), 'repostsCount'],
                [sequelize.literal(`(EXISTS(SELECT likes.id FROM likes WHERE likes.postId=posts.id AND likes.userId=${req.token.userId}))`), 'liked'],
                [sequelize.literal(`(EXISTS(SELECT subscriptions.id FROM subscriptions WHERE subscriptions.authorId=posts.userId AND subscriptions.userId=${req.token.userId}))`), 'subscribed']
            ], 
            include: [
                {model: Images, attributes: ['id', 'name'] }, 
                {model: Users, attributes: ['id', 'username'], include: { model: Images, attributes: ['id', 'name'] }  }, 
                {model: Categories, through: {attributes: []} }, 
            ],
            where: where,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).send({ posts: posts });
    },
    post: async(req, res) => {
        try{
            var verify;
            try {
                const accessToken = req.headers.authorization.split(' ')[1];
                verify = jwt.verify(accessToken, process.env.JWT_SECRET);
            } finally {
                if (!verify) {
                    let view = await Views.findOne({ where: { user: req.fingerprint.hash, registered: 0, postId: req.body.postId } });
                    if (!view) await Views.create({ user: req.fingerprint.hash, postId: req.body.postId });
                } else {
                    let view = await Views.findOne({ where: { user: verify.userId, registered: 1, postId: req.body.postId } });
                    if (!view) await Views.create({ user: verify.userId, registered: 1, postId: req.body.postId });
                }
                return res.status(200).send({ res: "success" });
            }
        } catch(err) {
            console.error(err);
            return res.status(500).send({ msg: 'Ошибка на стороне сервера', error: err });
        }
    }

}