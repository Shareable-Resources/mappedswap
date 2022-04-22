const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Model = sequelize.define('ticket', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    chatId: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    status: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    
});

module.exports = Model;