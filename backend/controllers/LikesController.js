const sequelize = require('../models/database');

const Posts = require('../models/posts');
const Images = require('../models/images');
const Users = require('../models/users');
const Categories = require('../models/categories');
const Likes = require('../models/likes');

module.exports = {

    get: async(req, res) => {
        let where = {};
        if ('search' in req.query) where.title = { [Op.like]: `%${req.query.search}%` };

        let posts = await Posts.findAll({ 
            attributes: [
                'id', 'title', 'subtitle', 'slug', 'createdAt', 
                [sequelize.literal('(SELECT COUNT(likes.id) FROM likes WHERE likes.postId=posts.id)'), 'likesCount'],
                [sequelize.literal('(SELECT COUNT(comments.id) FROM comments WHERE comments.postId=posts.id)'), 'commentsCount'],
                [sequelize.literal('(SELECT COUNT(subscriptions.id) FROM subscriptions WHERE subscriptions.authorId=posts.userId)'), 'subscriptionsCount'],
                [sequelize.literal('(SELECT COUNT(views.id) FROM views WHERE views.postId=posts.id)'), 'viewsCount'],
                [sequelize.literal('(SELECT COUNT(reposts.id) FROM reposts WHERE reposts.postId=posts.id)'), 'repostsCount'],
                [sequelize.literal(`(EXISTS(SELECT subscriptions.id FROM subscriptions WHERE subscriptions.authorId=posts.userId AND subscriptions.userId=${req.token.userId}))`), 'subscribed']
            ], 
            include: [
                {model: Images, attributes: ['id', 'name'] }, 
                {model: Users, attributes: ['id', 'username'], include: { model: Images, attributes: ['id', 'name'] }  }, 
                {model: Categories, through: {attributes: []} }, 
                {model: Likes, attributes: ['userId']}
            ],
            where: where,
            order: [['createdAt', 'DESC']]
        });

        posts = posts.filter(post => {
            for (let i = 0; i < post.likes.length; i++)
                if (req.token.userId.toString() === post.likes[i].dataValues.userId.toString()) 
                    return true;
            return false;
        });

        res.status(200).send({ posts: posts });
    },
    post: async(req, res) => {
        const like = await Likes.findOne({ where: { userId: req.token.userId, postId: req.body.postId } });
        try {
            if (like) {
                await like.destroy();
                return res.status(200).send({ res: "success", liked: false });
            } else {
                await Likes.create({ userId: req.token.userId, postId: req.body.postId });
                return res.status(200).send({ res: "success", liked: true });
            }
        } catch(err) {
            console.error(err);
            return res.status(500).send({ msg: 'Ошибка на стороне сервера', error: err });
        }
    }

}