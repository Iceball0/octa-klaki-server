const RefreshSessions = require('../models/refreshSessions');

module.exports = {

    post: async (req, res) => {
        try {
            let old_token = req.cookies.refreshToken;
            RefreshSessions.destroyToken(old_token);
    
            return res
                .clearCookie('refreshToken', {
                    path: "/api/auth"
                })
                .send({ res: "success" });
        } catch (err) {
            console.error(err);
        }
    }

}