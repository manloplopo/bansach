const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cartController');
const { authRequired } = require('../middleware/auth');

router.get('/', authRequired, ctrl.getCart);
router.post('/', authRequired, ctrl.addToCart);
router.put('/:id', authRequired, ctrl.updateCartItem);
router.delete('/:id', authRequired, ctrl.removeCartItem);
router.delete('/', authRequired, ctrl.clearCart);

module.exports = router;
