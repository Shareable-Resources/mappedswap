const Sequelize = require('sequelize');

const sequelize = new Sequelize('telegram-support', 'root', 'mypassword',
    {
        dialect: 'mysql',
        host: 'localhost',
        port: 3406
    }
);

module.exports = sequelize;