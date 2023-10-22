const jwt = require('jsonwebtoken');

const Reposts = require('../models/reposts');

module.exports = {

    post: async(req, res) => {
        try{
            var verify;
            try {
                const accessToken = req.headers.authorization.split(' ')[1];
                verify = jwt.verify(accessToken, process.env.JWT_SECRET);
            } finally {
                if (!verify) {
                    let repost = await Reposts.findOne({ where: { user: req.fingerprint.hash, registered: 0, postId: req.body.postId } });
                    if (!repost) await Reposts.create({ user: req.fingerprint.hash, postId: req.body.postId });
                } else {
                    let repost = await Reposts.findOne({ where: { user: verify.userId, registered: 1, postId: req.body.postId } });
                    if (!repost) await Reposts.create({ user: verify.userId, registered: 1, postId: req.body.postId });
                }
                return res.status(200).send({ res: "success" });
            }
        } catch(err) {
            console.error(err);
            return res.status(500).send({ msg: 'Ошибка на стороне сервера', error: err });
        }
    }

}