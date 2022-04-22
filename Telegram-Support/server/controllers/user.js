const UserService = require('../services/user');
const helper = require('../util/helper');

exports.getAll = async (req, res, next) => {
    try {
        helper.formatRes(res, await UserService.getAll());
    }
    catch(err)
    {
        return next(err);
    }
}   

exports.getById = async (req, res, next) => {
    try {
        helper.formatRes(res, await UserService.getById(req.params.id));
    }
    catch(err)
    {
        return next(err);
    }
};

exports.create = () => {

}

exports.update = () => {

};

exports.delete = () => {

}

