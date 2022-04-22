const botService = require('../services/bot');
const helper = require('../util/helper');

// exports.createMessage = async (req, res, next) => {
//     try {
//         const ticketId = req.body.ticketId;
//         const customerId = req.body.customerId;
//         const message = req.body.message;

//         const obj = {
//             ticketId,
//             customerId,
//             message
//         };
   
//         helper.formatRes(res, await botService.createMessage(obj));
//     }
//     catch(err) {
//         return next(err);
//     }
// }
