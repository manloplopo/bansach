/**
 * Search Routes - Tìm kiếm sản phẩm
 * @module routes/search
 */

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Product, Category, Brand } = require('../models');

/**
 * GET /api/search
 * Tìm kiếm sản phẩm với filters
 * @query {string} q - Từ khóa tìm kiếm
 * @query {number} category - ID danh mục
 * @query {number} brand - ID thương hiệu
 * @query {number} minPrice - Giá tối thiểu
 * @query {number} maxPrice - Giá tối đa
 * @query {string} sort - Sắp xếp: newest, price_asc, price_desc, popular
 * @query {number} page - Trang hiện tại
 * @query {number} limit - Số items/trang
 */
router.get('/', async (req, res) => {
  try {
    const {
      q = '',
      category,
      brand,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    // Build where clause
    const where = { isActive: true };

    // Search by keyword
    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { author: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } }
      ];
    }

    // Filter by category
    if (category) {
      where.categoryId = parseInt(category);
    }

    // Filter by brand
    if (brand) {
      where.brandId = parseInt(brand);
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    // Build order clause
    let order;
    switch (sort) {
      case 'price_asc':
        order = [['price', 'ASC']];
        break;
      case 'price_desc':
        order = [['price', 'DESC']];
        break;
      case 'popular':
        order = [['soldCount', 'DESC']];
        break;
      case 'rating':
        order = [['rating', 'DESC']];
        break;
      default: // newest
        order = [['createdAt', 'DESC']];
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, attributes: ['id', 'name', 'slug'] },
        { model: Brand, attributes: ['id', 'name', 'slug'] }
      ],
      order,
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    res.json({
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      },
      filters: { q, category, brand, minPrice, maxPrice, sort }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * GET /api/search/suggestions
 * Gợi ý tìm kiếm
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const products = await Product.findAll({
      where: {
        isActive: true,
        name: { [Op.iLike]: `%${q}%` }
      },
      attributes: ['id', 'name', 'thumbnail', 'price'],
      limit: 5
    });

    res.json(products);
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json([]);
  }
});

module.exports = router;