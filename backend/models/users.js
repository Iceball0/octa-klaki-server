const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Images = require('./images');

const Users = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    login: {
        type: DataTypes.STRING,
        allowNull: false
    },
    hashed_password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.INTEGER,
        defaultValue: '0'
    },
}, {
    sequelize,
    timestamps: false
});

Images.hasOne(Users, {
    foreignKey: 'avatar',
    onDelete: 'CASCADE'
});
Users.belongsTo(Images, {
    foreignKey: 'avatar',
});


module.exports = Users;