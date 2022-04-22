const express = require("express");
const router = express.Router();

const customerController = require('../controllers/customer');

router.get('/', customerController.getAll);
router.get('/:id', customerController.getById);
// router.put('/:id', customerController.update);

module.exports = router;