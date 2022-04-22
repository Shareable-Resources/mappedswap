const path = require("path")
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

const createDb = require('./util/createDb');
const createDummyData = require('./util/createDummyData');

const bot = require('./util/telegrambot');

const express = require('express');
const bodyParser = require('body-parser');

const authRoute = require('./routes/auth');
const botRoute = require('./routes/bot');
const customerRoute = require('./routes/customer');
const userRoute = require('./routes/user');
const ticketRoute = require('./routes/ticket');

const isAuth = require('./middleware/is-auth')

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Method', 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
});

//app.use('/bot', botRoute);
app.use('/auth', authRoute)
app.use('/customers', customerRoute);
app.use('/users', userRoute);
app.use('/tickets', ticketRoute);
app.use('/*', (req, res, next) => {
    res.status(404).json({status: 404, message: 'route not found'})
});
app.use(function(err, req, res, next) {
    err.status = err.status || 500;
    res.status(err.status);
    res.json({status: err.status, message: err.message});
});


// // test throw err in regular function
// const a = () => {
//     //throw new Error("eerrrrr");
// }

// const sleep = m => new Promise(r => setTimeout(r, m))

// // test throw err in async function
// const b = async () => {
//     await sleep(1000);
//     throw createError("eerrrrr2");
// };

// app.get('/a', async function(req,res,next) {
//     try {
//         //a();
//         //await b();
//         res.json({
//             status: 200,
//             message: "",
//             data: [
//                 {id: 1, name: 'mike'}
//             ]
//         })
//     }
//     catch(err) {
//         return next(err);
//     }
// });

app.listen(8000);

createDb
    .sync({ force: true })
    .then(result => {
        createDummyData();
    });

const oBot = bot.start();

/*
message_id
from
    id 5082778384
    first_name
    last_name
    username

chat
    id 5082778384

date
text: /start
*/