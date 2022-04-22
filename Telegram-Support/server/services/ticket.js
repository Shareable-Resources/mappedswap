const Ticket = require('../models/ticket')
const Message = require('../models/message')

exports.getAll = async () => {
    return await Ticket.findAll();        
}

exports.getById = async (id) => {
    return await Ticket.findByPk(id);        
}

exports.getAllMessageByTicketId = async (id) => {
    return await Message.findAll({
        where: {
            ticketId: id
        }
    });        
}

exports.setComplete = async (id) => {
    const ticket = await Ticket.findByPk(id)
    if (ticket) {
        ticket.status = 0
        ticket.save();
    }
    else {
        throw new Error("ticket not found!")
    }
}
exports.replyToCustomer = async (id, content) => {
    const ticket = await Ticket.findByPk(id)
    if (ticket) {
        const cust = await ticket.getCustomer()
        const msg = await global.bot.sendMessage(cust.customerId, content)
        
        return await ticket.createMessage({
            messageId: msg.message_id,
            content: content, 
            date: msg.date,
            userId: 1 // need to get req.userId
        });
    }
    else {
        throw new Error("ticket not found!")
    }
}
