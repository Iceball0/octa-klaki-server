const sequelize = require('../models/database');
const { Op } = require('sequelize');

const Posts = require('../models/posts');
const Images = require('../models/images');
const Users = require('../models/users');
const Categories = require('../models/categories');
const Subscriptions = require('../models/subscriptions');

module.exports = {

    get: async(req, res) => {

        let subscriptions = await Subscriptions.findAll({ attributes: ['authorId'], where: {userId: req.token.userId} });

        let where = {};
        if ('search' in req.query) where.title = { [Op.like]: `%${req.query.search}%` };
        where.userId = { [Op.in]: subscriptions.map(sub => sub.dataValues.authorId) }

        let posts = await Posts.findAll({ 
            attributes: [
                'id', 'title', 'subtitle', 'slug', 'createdAt', 
                [sequelize.literal('(SELECT COUNT(likes.id) FROM likes WHERE likes.postId=posts.id)'), 'likesCount'],
                [sequelize.literal('(SELECT COUNT(comments.id) FROM comments WHERE comments.postId=posts.id)'), 'commentsCount'],
                [sequelize.literal('(SELECT COUNT(subscriptions.id) FROM subscriptions WHERE subscriptions.authorId=posts.userId)'), 'subscriptionsCount'],
                [sequelize.literal('(SELECT COUNT(views.id) FROM views WHERE views.postId=posts.id)'), 'viewsCount'],
                [sequelize.literal('(SELECT COUNT(reposts.id) FROM reposts WHERE reposts.postId=posts.id)'), 'repostsCount'],
                [sequelize.literal(`(EXISTS(SELECT likes.id FROM likes WHERE likes.postId=posts.id AND likes.userId=${req.token.userId}))`), 'liked']
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
        if (req.token.userId.toString() === req.body.authorId.toString()) return res.status(400).send({ msg: 'Нельзя подписываться на самого себя' });
        const subscription = await Subscriptions.findOne({ where: { userId: req.token.userId, authorId: req.body.authorId } });
        try {
            if (subscription) {
                await subscription.destroy();
                return res.status(200).send({ res: "success", subscribed: false });
            } else {
                await Subscriptions.create({ userId: req.token.userId, authorId: req.body.authorId });
                return res.status(200).send({ res: "success", subscribed: true });
            }
        } catch(err) {
            console.error(err);
            return res.status(500).send({ msg: 'Ошибка на стороне сервера', error: err });
        }
    }

}