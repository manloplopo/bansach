/**
 * Wishlist Routes - Danh sách yêu thích
 * @module routes/wishlist
 */

const express = require('express');
const router = express.Router();
const { Wishlist, Product } = require('../models');
const { authRequired } = require('../middleware/auth');

/**
 * GET /api/wishlist
 * Lấy wishlist của user
 */
router.get('/', authRequired, async (req, res) => {
  try {
    const wishlist = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'slug', 'price', 'originalPrice', 'thumbnail', 'stock']
      }]
    });

    res.json(wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to get wishlist' });
  }
});

/**
 * POST /api/wishlist
 * Thêm sản phẩm vào wishlist
 */
router.post('/', authRequired, async (req, res) => {
  try {
    const { productId } = req.body;

    const [item, created] = await Wishlist.findOrCreate({
      where: { userId: req.user.id, productId },
      defaults: { userId: req.user.id, productId }
    });

    res.status(created ? 201 : 200).json({ 
      message: created ? 'Added to wishlist' : 'Already in wishlist',
      item
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

/**
 * DELETE /api/wishlist/:productId
 * Xóa sản phẩm khỏi wishlist
 */
router.delete('/:productId', authRequired, async (req, res) => {
  try {
    const deleted = await Wishlist.destroy({
      where: { 
        userId: req.user.id, 
        productId: req.params.productId 
      }
    });

    if (deleted) {
      res.json({ message: 'Removed from wishlist' });
    } else {
      res.status(404).json({ error: 'Item not in wishlist' });
    }
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

module.exports = router;