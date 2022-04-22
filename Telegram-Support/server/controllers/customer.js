const CustomerService = require('../services/customer');
const helper = require('../util/helper');

exports.getAll = async (req, res, next) => {
    try {
        helper.formatRes(res, await CustomerService.getAll());
    }
    catch(err)
    {
        return next(err);
    }
}   

exports.getById = async (req, res, next) => {
    try {
        helper.formatRes(res, await CustomerService.getById(req.params.id));
    }
    catch(err)
    {
        return next(err);
    }
};
