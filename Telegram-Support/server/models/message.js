const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Model = sequelize.define('message', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    messageId: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    content: {
        type: Sequelize.STRING,
        allowNull: false
    },
    date: {
        type: Sequelize.BIGINT,
        allowNull: false
    }
    // userId: {
    //     type: Sequelize.INTEGER
    // },
    // customerId: {
    //     type: Sequelize.INTEGER
    // },
});

module.exports = Model;