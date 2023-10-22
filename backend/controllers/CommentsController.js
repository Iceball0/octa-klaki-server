const Comments = require('../models/comments');

module.exports = {

    post: async(req, res) => {
        try {
            const comment = await Comments.create({
                userId: req.token.userId,
                postId: req.body.postId,
                text: req.body.text
            });

            return res.status(200).send({ res: 'success', comment: comment  });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ msg: 'Ошибка на стороне сервера', error: err });
        }
    }, 
    delete: async(req, res) => {
        try {
            await req.comment.destroy();
    
            return res.status(200).send({ res: 'success' });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ msg: 'Ошибка на стороне сервера', error: err });
        }
    }

}