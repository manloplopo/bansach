const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryController');
const { authRequired, adminRequired } = require('../middleware/auth');

router.get('/', ctrl.list);
router.post('/', authRequired, adminRequired, ctrl.create);
router.put('/:id', authRequired, adminRequired, ctrl.update);
router.delete('/:id', authRequired, adminRequired, ctrl.remove);

module.exports = router;
