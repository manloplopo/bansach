const { Order, User, Product, Category, Brand } = require('../models');

module.exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ include: [User] });
    res.json(orders);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

module.exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    order.status = req.body.status;
    await order.save();
    res.json(order);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

module.exports.dashboardStats = async (req, res) => {
  try {
    const userCount = await User.count();
    const productCount = await Product.count();
    const orderCount = await Order.count();
    const categoryCount = await Category.count();
    const brandCount = await Brand.count();
    res.json({ userCount, productCount, orderCount, categoryCount, brandCount });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};
