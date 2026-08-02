const express = require('express');

const router = express.Router();

const controller = require('../controllers/order.controller');

router.get('/', controller.getOrders);

router.get('/:id', controller.getOrder);

router.post('/', controller.createOrder);

router.put('/:id', controller.updateOrder);

router.delete('/:id', controller.deleteOrder);

module.exports = router;