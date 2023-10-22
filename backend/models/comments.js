const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Users = require('./users');
const Posts = require('./posts');

const Comments = sequelize.define('comments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    sequelize,
    timestamps: false
});


// Super Many-to-Many relationship
Users.belongsToMany(Posts, { through: {model: Comments, unique: false} });
Posts.belongsToMany(Users, { through: {model: Comments, unique: false} });

Posts.hasMany(Comments);
Comments.belongsTo(Posts);

Users.hasMany(Comments);
Comments.belongsTo(Users);


module.exports = Comments;