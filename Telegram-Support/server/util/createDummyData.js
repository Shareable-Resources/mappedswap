const bcrypt = require('bcryptjs');

const Product = require('../models/product');
const User = require('../models/user');
const Customer = require('../models/customer');
const Message = require('../models/message');

module.exports = async () => {
    await Product.create({
        name: "MappedWrap",
        description: "..."
    });

    const hashStr = await bcrypt.hash("abc123", 12);

    const user1 = await User.create({
        name: "support 1",
        email: "support1@gmail.com",
        password: hashStr,
        admin: false
    });

    const user2 = await User.create({
        name: "support 2",
        email: "support2@gmail.com",
        password: hashStr,
        admin: false
    });
    
    const admin = await User.create({
        name: "admin",
        email: "admin@gmail.com",
        password: hashStr,
        admin: true
    });

    const customer1 = await Customer.create({
        customerId: 1,
        name: "Customer 1",
    });

    const ticket1 = await customer1.createTicket({ticketId: 1, chatId: 1, status:1});
    const ticket2 = await customer1.createTicket({ticketId: 2, chatId: 2, status:1});
    const ticket3 = await customer1.createTicket({ticketId: 3, chatId: 3, status:0});
    const ticket4 = await customer1.createTicket({ticketId: 4, chatId: 4, status:0});
    //console.log(ticket1);


    const messsage1 = await ticket1.createMessage({messageId: 1, content: "Hi you", date: 1000, userId: 1});
    const messsage2 = await ticket1.createMessage({messageId: 2, content: "I am fine", date: 1000, customerId: 1});
    //messsage1.addUser(user1);

    //user1.addTicket(ticket1);
    //ticket1.addUsers([user1, user2]);

    const authService = require('../services/auth')
    console.log(await authService.login("support1@gmail.com", "abc123"))
}