const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Users = require('./users');

const Subscriptions = sequelize.define('subscriptions', {
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
Users.belongsToMany(Users, { through: Subscriptions, as: 'user', foreignKey: 'authorId' });
Users.belongsToMany(Users, { through: Subscriptions, as: 'author', foreignKey: 'userId' });

Users.hasMany(Subscriptions);
Subscriptions.belongsTo(Users);

Users.hasMany(Subscriptions);
Subscriptions.belongsTo(Users);



module.exports = Subscriptions;