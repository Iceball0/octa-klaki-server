const { DataTypes } = require('sequelize');
const sequelize = require('./database');


const Categories = sequelize.define('categories', {
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


module.exports = Categories;