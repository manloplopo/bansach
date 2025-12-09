const { Product, Category, Brand } = require('../models');
const { Op } = require('sequelize');

module.exports.list = async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, q } = req.query;
    const where = {};
    if (category) {
      const cat = await Category.findOne({ where: { slug: category } });
      where.CategoryId = cat ? cat.id : null;
    }
    if (brand) {
      const b = await Brand.findOne({ where: { slug: brand } });
      where.BrandId = b ? b.id : null;
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseInt(minPrice, 10);
      if (maxPrice) where.price[Op.lte] = parseInt(maxPrice, 10);
    }
    if (q) {
      where.name = { [Op.like]: `%${q}%` };
    }
    const products = await Product.findAll({ where, include: [Category, Brand] });
    res.json(products);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

module.exports.get = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: [Category, Brand] });
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

module.exports.create = async (req, res) => {
  try {
    const { name, slug, description, price, stock, categoryId, brandId } = req.body;
    const product = await Product.create({ name, slug, description, price, stock, CategoryId: categoryId, BrandId: brandId });
    res.status(201).json(product);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

module.exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    const { name, slug, description, price, stock, categoryId, brandId } = req.body;
    Object.assign(product, { name, slug, description, price, stock, CategoryId: categoryId, BrandId: brandId });
    await product.save();
    res.json(product);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

module.exports.remove = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    await product.destroy();
    res.json({ message: 'Deleted' });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};
