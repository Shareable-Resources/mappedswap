const authService = require('../services/auth');
const helper = require('../util/helper');

exports.login = async (req, res, next) => {
    try {       
        const data = await authService.login(req.body.email, req.body.password);
        helper.formatRes(res, data);
    }
    catch(err) {
        return next(err);
    }
};

exports.logout = async (req, res, next) => {
    try {   
    }
    catch(err) {
        return next(err);
    }
};

