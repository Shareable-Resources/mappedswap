const Customer = require('../models/customer');

exports.getAll = async () => {
    return await Customer.findAll();
}

exports.getById = async (id) => {
    return await Customer.findByPk(id);
}
