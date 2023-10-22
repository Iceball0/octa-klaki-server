const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Users = require('./users');
const Images = require('./images');

const Posts = sequelize.define('posts', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subtitle: {
        type: DataTypes.TEXT
    },
    content: {
        type: DataTypes.TEXT('long')
    },
    slug: {
        type: DataTypes.TEXT
    },
    theme: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize,
    timestamps: true
});


// Many-to-One relationship
Users.hasMany(Posts);
Posts.belongsTo(Users);

Posts.hasMany(Images);
Images.belongsTo(Posts, {
    onDelete: 'CASCADE'
});


module.exports = Posts;