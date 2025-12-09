const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { authRequired, adminRequired } = require('../middleware/auth');

router.get('/orders', authRequired, adminRequired, ctrl.listOrders);
router.put('/orders/:id', authRequired, adminRequired, ctrl.updateOrderStatus);
router.get('/stats', authRequired, adminRequired, ctrl.dashboardStats);

module.exports = router;
