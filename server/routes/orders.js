const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { authRequired } = require('../middleware/auth');

router.post('/', authRequired, ctrl.createOrder);
router.get('/', authRequired, ctrl.listOrders);
router.get('/:id', authRequired, ctrl.getOrder);

module.exports = router;
