const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Model = sequelize.define('userTicket', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = Model;