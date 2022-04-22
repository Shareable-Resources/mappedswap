const sequelize = require('./database');
//const association = require('./util/association');

const Customer = require('../models/customer');
const Message = require('../models/message');
const Product = require('../models/product');
const Ticket = require('../models/ticket');
const User = require('../models/user');
const UserTicket = require('../models/userTicket');

// Customer
Customer.hasMany(Ticket);
Ticket.belongsTo(Customer);

// Message
Ticket.hasMany(Message);
Message.belongsTo(Ticket);

User.hasMany(Message);
Customer.hasMany(Message);

//User many to many Ticket
//Ticket.belongsTo(User);
User.belongsToMany(Ticket, {through: UserTicket});
// Ticket.belongsToMany(User, {through: UserTicket});

module.exports = sequelize;
 