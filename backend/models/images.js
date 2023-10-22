const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Images = sequelize.define('images', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    timestamps: false
});


module.exports = Images;