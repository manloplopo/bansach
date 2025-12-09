/**
 * Review Routes - Đánh giá sản phẩm
 * @module routes/reviews
 */

const express = require('express');
const router = express.Router();
const { Review, Product, User } = require('../models');
const { authRequired } = require('../middleware/auth');

/**
 * GET /api/reviews/product/:productId
 * Lấy reviews của sản phẩm
 */
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: {
        productId: req.params.productId,
        isApproved: true
      },
      include: [
        { model: User, attributes: ['id', 'name', 'avatar'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

/**
 * POST /api/reviews
 * Tạo review mới
 */
router.post('/', authRequired, async (req, res) => {
  try {
    const { productId, rating, title, content } = req.body;

    // Validate
    if (!productId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user already reviewed
    const existing = await Review.findOne({
      where: { productId, userId: req.user.id }
    });
    if (existing) {
      return res.status(400).json({ error: 'You already reviewed this product' });
    }

    const review = await Review.create({
      productId,
      userId: req.user.id,
      rating,
      title,
      content,
      isApproved: false // Cần admin duyệt
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

module.exports = router;