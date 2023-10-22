const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const Users = require('./users');

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const ms = require('ms');

const RefreshSessions = sequelize.define('refreshSessions', {
    refreshToken: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fingerprint: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    expiresIn: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    timestamps: false
});

// Many-to-One relationship
Users.hasMany(RefreshSessions);
RefreshSessions.belongsTo(Users);

// generate Access and Refresh Tokens
RefreshSessions.generateToken = async (user, fingerprint, userAgent) => {
    const payload = { userId: user.id, role: user.role, username: user.username, login: user.login, avatar: user.image?.dataValues?.name };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

    // remove first session if too many
    user_tokens = await RefreshSessions.findAll({ where: { userId: user.id } });
    if (user_tokens.length >= 5) {
        await user_tokens[0].destroy();
    }

    const session = await RefreshSessions.create({
        userId: user.id,
        refreshToken: uuidv4(),
        userAgent: userAgent,
        fingerprint: fingerprint,
        expiresIn: ms('30d') / 1000
    });

    const refreshToken = session.refreshToken;
    const expiresIn = session.expiresIn;
    return { accessToken, refreshToken, expiresIn };
}

// destory session
RefreshSessions.destroyToken = async (token) => {
    await RefreshSessions.destroy({ where: { refreshToken: token } });
}

// check if Refresh token is expired
RefreshSessions.verifyExpiration = (token) => {
    return new Date(token.createdAt + token.expiresIn * 1000) < Date.now();
}

// check if Refresh token fingerprint is the same
RefreshSessions.verifyFingerprint = (token, fingerprint) => {
    console.log(token.fingerprint, fingerprint);
    return token.fingerprint === fingerprint;
}


module.exports = RefreshSessions;