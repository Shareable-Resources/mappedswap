const express = require("express");
const router = express.Router();

const ticketController = require('../controllers/ticket');

router.get('/', ticketController.getAll);
router.get('/:id', ticketController.getById);
router.get('/:id/complete', ticketController.complete);
router.get('/:id/messages', ticketController.getAllMessageByTicketId);
router.post('/:id/messages', ticketController.replyToCustomer);

module.exports = router;