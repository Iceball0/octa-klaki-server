const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Posts = require('./posts');
const Categories = require('./categories');

const Posts_has_categories = sequelize.define('posts_has_categories', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    sequelize,
    timestamps: false
});

// Many-to-Many relationship
Posts.belongsToMany(Categories, { through: Posts_has_categories });
Categories.belongsToMany(Posts, { through: Posts_has_categories });


module.exports = Posts_has_categories;