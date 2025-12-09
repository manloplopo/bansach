const { CartItem, Product } = require('../models');

module.exports.getCart = async (req, res) => {
  try {
    const items = await CartItem.findAll({ where: { UserId: req.user.id }, include: [Product] });
    res.json(items);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

module.exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let item = await CartItem.findOne({ where: { UserId: req.user.id, ProductId: productId } });
    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = await CartItem.create({ UserId: req.user.id, ProductId: productId, quantity });
    }
    res.status(201).json(item);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

module.exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await CartItem.findByPk(req.params.id);
    if (!item || item.UserId !== req.user.id) return res.status(404).json({ message: 'Not found' });
    item.quantity = quantity;
    await item.save();
    res.json(item);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

module.exports.removeCartItem = async (req, res) => {
  try {
    const item = await CartItem.findByPk(req.params.id);
    if (!item || item.UserId !== req.user.id) return res.status(404).json({ message: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted' });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

module.exports.clearCart = async (req, res) => {
  try {
    await CartItem.destroy({ where: { UserId: req.user.id } });
    res.json({ message: 'Cart cleared' });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};
