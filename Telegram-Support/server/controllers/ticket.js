const ticketService = require('../services/ticket');
const helper = require('../util/helper');

exports.getAll = async (req, res, next) => {
    try {       
        const data = await ticketService.getAll();
        helper.formatRes(res, data);
    }
    catch(err) {
        return next(err);
    }
};

exports.getById = async (req, res, next) => {
    try {   
        //validate req.params.id    
        helper.formatRes(res, await ticketService.getById(req.params.id));
    }
    catch(err) {
        return next(err);
    }
};

exports.complete = async (req, res, next) => {
    try {       
        helper.formatRes(res, await ticketService.setComplete(req.params.id));
    }
    catch(err) {
        return next(err);
    }
};

exports.getAllMessageByTicketId = async (req, res, next) => {
    try {      
        //validate req.params.id   
        helper.formatRes(res, await ticketService.getAllMessageByTicketId(req.params.id));
    }
    catch(err) {
        return next(err);
    }
};

exports.replyToCustomer = async (req, res, next) => {
    try {       
        helper.formatRes(res, await ticketService.replyToCustomer(req.params.id, req.body.content));
    }
    catch(err) {
        return next(err);
    }
};
