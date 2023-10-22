const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Users = require('./users');
const Posts = require('./posts');

const Likes = sequelize.define('likes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    sequelize,
    timestamps: false
});


// Super Many-to-Many relationship
Posts.belongsToMany(Users, { through: Likes });
Users.belongsToMany(Posts, { through: Likes });

Posts.hasMany(Likes);
Likes.belongsTo(Posts);

Users.hasMany(Likes);
Likes.belongsTo(Users);



module.exports = Likes;