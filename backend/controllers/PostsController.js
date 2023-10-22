const fs = require('fs');
const path = require('path');
const translit = require('transliteration');
const { Op } = require('sequelize');
const sequelize = require('../models/database');
const jwt = require('jsonwebtoken');

const Posts = require('../models/posts');
const Images = require('../models/images');
const Users = require('../models/users');
const Categories = require('../models/categories');
const Comments = require('../models/comments');
const Likes = require('../models/likes');

module.exports = {

    get: async(req, res) => {
        const pageAmount = 10;
        const L = 1, C = 1, R = 1, V = 1;

        let where = {};
        let posts = [];

        if ('search' in req.query) where.title = { [Op.like]: `%${req.query.search}%` };

        let attributes = [
            'id', 'title', 'subtitle', 'slug', 'createdAt', 
            [sequelize.literal('(SELECT COUNT(likes.id) FROM likes WHERE likes.postId=posts.id)'), 'likesCount'],
            [sequelize.literal('(SELECT COUNT(comments.id) FROM comments WHERE comments.postId=posts.id)'), 'commentsCount'],
            [sequelize.literal('(SELECT COUNT(subscriptions.id) FROM subscriptions WHERE subscriptions.authorId=posts.userId)'), 'subscriptionsCount'],
            [sequelize.literal('(SELECT COUNT(views.id) FROM views WHERE views.postId=posts.id)'), 'viewsCount'],
            [sequelize.literal('(SELECT COUNT(reposts.id) FROM reposts WHERE reposts.postId=posts.id)'), 'repostsCount']
        ]

        const accessToken = req.headers.authorization?.split(' ')[1];
        if (accessToken) {
            jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
                if (!err) {
                    attributes.push([sequelize.literal(`(EXISTS(SELECT likes.id FROM likes WHERE likes.postId=posts.id AND likes.userId=${decoded.userId}))`), 'liked']);
                    attributes.push([sequelize.literal(`(EXISTS(SELECT subscriptions.id FROM subscriptions WHERE subscriptions.authorId=posts.userId AND subscriptions.userId=${decoded.userId}))`), 'subscribed']);
                }
            });
        }
        
        posts = await Posts.findAll({ 
            attributes: attributes, 
            include: [
                {model: Images, attributes: ['id', 'name'] }, 
                {model: Users, attributes: ['id', 'username'], include: { model: Images, attributes: ['id', 'name'] }  }, 
                {model: Categories, through: {attributes: []} }
            ],
            where: where
        });
        
        if ('categories' in req.query) {
            posts = posts.filter(post => {
                for (let i = 0; i < post.categories.length; i++)
                    if (req.query.categories.split(',').includes(post.categories[i].dataValues.id.toString())) 
                        return true;
                return false;
            });
        }

        for (let i = 0; i < posts.length; i++) {
            const likesCount = posts[i].dataValues.likesCount;
            const commentsCount = posts[i].dataValues.commentsCount;
            const repostsCount = posts[i].dataValues.commentsCount;
            const viewsCount = posts[i].dataValues.viewsCount;
            let daysCount = Math.round(Math.abs((new Date - new Date(posts[i].dataValues.createdAt)) / (1000 * 60 * 60 * 24)));
            daysCount = daysCount === 0 ? 1 : daysCount;

            posts[i].rating = (L * likesCount + C * commentsCount + R * repostsCount + V * viewsCount) * 10 / daysCount;
        }

        posts.sort((a, b) => b.rating - a.rating || b.createdAt - a.createdAt);

        const amount = posts.length;
        
        if ('page' in req.query) {
            let page = parseInt(req.query.page);
            posts = posts.slice(pageAmount * (page - 1), pageAmount * page);
        }

        res.status(200).send({ posts: posts, totalPages: Math.ceil(amount / pageAmount) });
    },
    getOne: async(req, res) => {

        let attributes = [
            [sequelize.literal('(SELECT COUNT(likes.id) FROM likes WHERE likes.postId=posts.id)'), 'likesCount'],
            [sequelize.literal('(SELECT COUNT(comments.id) FROM comments WHERE comments.postId=posts.id)'), 'commentsCount'],
            [sequelize.literal('(SELECT COUNT(subscriptions.id) FROM subscriptions WHERE subscriptions.authorId=posts.userId)'), 'subscriptionsCount'],
            [sequelize.literal('(SELECT COUNT(views.id) FROM views WHERE views.postId=posts.id)'), 'viewsCount'],
            [sequelize.literal('(SELECT COUNT(reposts.id) FROM reposts WHERE reposts.postId=posts.id)'), 'repostsCount']
        ];

        const accessToken = req.headers.authorization?.split(' ')[1];
        if (accessToken) {
            jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
                if (!err) {
                    attributes.push([sequelize.literal(`(EXISTS(SELECT likes.id FROM likes WHERE likes.postId=posts.id AND likes.userId=${decoded.userId}))`), 'liked']);
                    attributes.push([sequelize.literal(`(EXISTS(SELECT subscriptions.id FROM subscriptions WHERE subscriptions.authorId=posts.userId AND subscriptions.userId=${decoded.userId}))`), 'subscribed']);
                }
            });
        }

        const post = await Posts.findOne({ 
            where: { slug: req.params.slug }, 
            attributes: {
                include: attributes
            },
            include: [
                {model: Images, attributes: ['id', 'name'] }, 
                {model: Users, attributes: ['id', 'username'], include: { model: Images, attributes: ['id', 'name'] } }, 
                {model: Categories, through: {attributes: []} },
                {model: Comments, attributes: ['id', 'text'], include: {model: Users, attributes: ['id', 'username'], include: { model: Images, attributes: ['id', 'name'] }}}
            ], 
        });
    
        if (!post) return res.status(404).send({ msg: 'Пост не найден' });
        return res.status(200).send({ post: post });
    },
    post: async(req, res) => {
        try {
            let postData = {
                userId: req.token.userId, 
                title: req.body.title, 
                subtitle: req.body.subtitle, 
                content: req.body.content, 
                theme: req.body.theme
            };
            let slug = translit.slugify(req.body.title);

            const post_by_slug = await Posts.findOne({ where: { slug: slug } });
            if (post_by_slug) slug += Math.floor(Math.random() * (999 - 100 + 1) + 100);
            postData.slug = slug;

            const post = await Posts.create(postData);
            if (req.files) 
                req.files.forEach(file => {
                    post.createImage({ name: file.filename });
                });
            if (req.body.categories.length > 0) post.setCategories(await Categories.findAll({ where: { id: { [Op.in]: req.body.categories } } }));

            return res.status(200).send({ res: 'success', slug: post.dataValues.slug  });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ msg: 'Ошибка на стороне сервера', error: err });
        }
    },
    patch: async(req, res) => {
        try {
            let slug = req.body.slug;
            if (!slug) slug = translit.slugify(req.body.title);

            req.post.update({ 
                title: req.body.title, 
                subtitle: req.body.subtitle, 
                content: req.body.content, 
                slug: slug,
                theme: req.body.theme,
            });

            if (req.files) {
                req.post.images.forEach(image => {
                    fs.unlink(path.join(__dirname, '..', 'upload/') + image.name, (err) => {
                        if (err) {
                            console.error(err);
                            throw err;
                        }
                        console.log(`File ${image.name} successfully deleted.`);
                    });
                });
                req.post.setImages([]);
                req.files.forEach(file => {
                    req.post.createImage({ name: file.filename });
                });
            }
            
            if (req.body.categories?.length > 0) req.post.setCategories(await Categories.findAll({ where: { id: { [Op.in]: req.body.categories } } }));
            else req.post.setCategories([]);

            return res.status(200).send({ res: 'success', slug: req.post.dataValues.slug });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ msg: 'Ошибка на стороне сервера', error: err });
        }
    }, 
    delete: async(req, res) => {
        try {
            req.post.images.forEach(image => {
                fs.unlink(path.join(__dirname, '..', 'upload/') + image.name, (err) => {
                    if (err) {
                        console.error(err);
                        throw err;
                    }
                    console.log(`File ${image.name} successfully deleted.`);
                });
            });
            await req.post.destroy();
    
            return res.status(200).send({ res: 'success' });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ msg: 'Ошибка на стороне сервера', error: err });
        }
    }

}