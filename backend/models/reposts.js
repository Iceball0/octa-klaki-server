const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Posts = require('./posts');

const Reposts = sequelize.define('reposts', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    registered: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    sequelize,
    timestamps: false
});


// Many-to-Many relationship
Posts.hasMany(Reposts);
Reposts.belongsTo(Posts);


module.exports = Reposts;