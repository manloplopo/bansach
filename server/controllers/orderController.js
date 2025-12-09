const { Order, OrderItem, CartItem, Product, User } = require('../models');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports.createOrder = async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({ where: { UserId: req.user.id }, include: [Product] });
    if (!cartItems.length) return res.status(400).json({ message: 'Cart empty' });
    const totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * item.Product.price, 0);
    const order = await Order.create({ UserId: req.user.id, totalAmount });
    for (const item of cartItems) {
      await OrderItem.create({ OrderId: order.id, ProductId: item.ProductId, price: item.Product.price, quantity: item.quantity });
    }
    // Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'vnd',
      metadata: { orderId: order.id }
    });
    order.paymentIntentId = paymentIntent.id;
    await order.save();
    await CartItem.destroy({ where: { UserId: req.user.id } });
    res.json({ order, clientSecret: paymentIntent.client_secret });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

module.exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { UserId: req.user.id }, include: [OrderItem] });
    res.json(orders);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

module.exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: [OrderItem] });
    if (!order || order.UserId !== req.user.id) return res.status(404).json({ message: 'Not found' });
    res.json(order);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};
