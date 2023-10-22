const sequelize = require('../models/database');

const Posts = require('../models/posts');
const Images = require('../models/images');
const Users = require('../models/users');
const Categories = require('../models/categories');
const Likes = require('../models/likes');

module.exports = {

    get: async(req, res) => {
        const user = await Users.findOne({ 
            attributes: [
                'id', 'username',
                [sequelize.literal('(SELECT COUNT(subscriptions.id) FROM subscriptions WHERE subscriptions.authorId=users.id)'), 'subscriptionsCount']
            ], 
            include: { model: Images, attributes: ['id', 'name'] },
            where: {id: req.params.id} }
        );

        let posts = await Posts.findAll({ 
            attributes: [
                'id', 'title', 'subtitle', 'slug', 'createdAt', 
                [sequelize.literal('(SELECT COUNT(likes.id) FROM likes WHERE likes.postId=posts.id)'), 'likesCount'],
                [sequelize.literal('(SELECT COUNT(comments.id) FROM comments WHERE comments.postId=posts.id)'), 'commentsCount'],
                [sequelize.literal('(SELECT COUNT(views.id) FROM views WHERE views.postId=posts.id)'), 'viewsCount'],
                [sequelize.literal('(SELECT COUNT(reposts.id) FROM reposts WHERE reposts.postId=posts.id)'), 'repostsCount']
            ], 
            include: [
                {model: Images, attributes: ['id', 'name'] }, 
                {model: Categories, through: {attributes: []} }, 
            ],
            where: {userId: req.params.id},
            order: [['createdAt', 'DESC']]
        });

        res.status(200).send({ user: user, posts: posts });
    },

}