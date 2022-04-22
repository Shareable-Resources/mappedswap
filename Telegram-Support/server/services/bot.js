const Ticket = require('../models/ticket');
const Customer = require('../models/customer');


async function createNewCustomer(msg) {
    return await Customer.create({
        customerId: msg.from.id,
        name: msg.from.username ? msg.from.username : msg.from.first_name + " " + msg.from.last_name,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name
    });
}

async function createNewTicket(cust, msg) {
    return await cust.createTicket({
        chatId: msg.chat.id,
        status: 1
    });
}

async function createNewMessage(cust, ticket, msg) {
    return await ticket.createMessage({
        messageId: msg.message_id,
        content: msg.text, 
        date: msg.date,
        customerId: cust.id
    });
}

exports.createMessage = async (msg) => {
    try {
        const result = {}
        let ticket = null, message;

        let cust = await Customer.findOne({ 
            where: {
                customerId: msg.from.id 
            }
        });

        // new customer
        if (cust === null) {
            cust = await createNewCustomer(msg)
        }
        else {
            // find active ticket
            const arrTicket = await cust.getTickets({
                where: { status : 1 }
            })

            if (arrTicket.length) {
                ticket = arrTicket[0]
            }
        }
        
        // create ticket
        if (ticket === null) {
            ticket = await createNewTicket(cust, msg);
            result.ticketId = ticket.id
        }

        // create message
        const newMessage = await createNewMessage(cust, ticket, msg)
            
        return result
    }
    catch(err) {
        throw new Error(err.message)
    }
}

