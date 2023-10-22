const Sequelize = require('sequelize');

// Database
const sequelize = new Sequelize("a0690200_hackathon", "a0690200_hackathon", "b5vSOeNa", {
    dialect: "mysql",
    host: "nice-evolution-joke.ru",
    logging: false
});


module.exports = sequelize;