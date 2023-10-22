const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Posts = require('./posts');

const Views = sequelize.define('views', {
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
Posts.hasMany(Views);
Views.belongsTo(Posts);


module.exports = Views;