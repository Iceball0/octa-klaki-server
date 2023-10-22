const Users = require('../models/users');
const Images = require('../models/images');
const RefreshSessions = require('../models/refreshSessions');

module.exports = {

    post: async (req, res, next) => {
        try {
            let old_refreshToken = req.cookies.refreshToken;
            console.log(old_refreshToken);
            
            var session = await RefreshSessions.findOne({ where: {refreshToken: old_refreshToken} });
            if (session) await session.destroy();
    
            res.clearCookie('refreshToken');
    
            if (!RefreshSessions.verifyExpiration(session)) return res.status(401).send({ msg: "Токен закончился" });
            if (!RefreshSessions.verifyFingerprint(session, req.fingerprint.hash)) return res.status(401).send({ msg: "Неверная сессия" });
    
            var user = await Users.findOne({ where: { id: session.userId }, include: [Images] });
    
            if (!user) return res.status(401).send({ msg: "Неверная сессия" });
            
            req.user = user;
    
            next();
        } catch (err) {
            console.error(err);
            res.status(401).send({ msg: "Неавторизован" });
        }
    }

}