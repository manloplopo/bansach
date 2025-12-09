const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const storage = process.env.DB_STORAGE || path.join(__dirname, '..', 'data', 'edubook.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: process.env.DB_LOGGING === 'true' ? console.log : false
});

// User
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Category
const Category = sequelize.define('Category', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true }
});

// Brand
const Brand = sequelize.define('Brand', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true }
});

// Product
const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.INTEGER, allowNull: false }, // store in smallest currency unit (e.g. VND no decimals)
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  thumbnailUrl: { type: DataTypes.STRING }
});

// ProductImage
const ProductImage = sequelize.define('ProductImage', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  url: { type: DataTypes.STRING, allowNull: false }
});

// CartItem
const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 }
});

// Order
const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  status: { type: DataTypes.ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled'), defaultValue: 'pending' },
  totalAmount: { type: DataTypes.INTEGER, allowNull: false },
  paymentIntentId: { type: DataTypes.STRING },
  paymentStatus: { type: DataTypes.STRING }
});

// OrderItem
const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  price: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false }
});

// Email verification token
const EmailToken = sequelize.define('EmailToken', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  token: { type: DataTypes.STRING, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  used: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Password reset token
const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  token: { type: DataTypes.STRING, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  used: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Associations
Category.hasMany(Product);
Product.belongsTo(Category);

Brand.hasMany(Product);
Product.belongsTo(Brand);

Product.hasMany(ProductImage, { as: 'images' });
ProductImage.belongsTo(Product);

User.hasMany(CartItem);
CartItem.belongsTo(User);
Product.hasMany(CartItem);
CartItem.belongsTo(Product);

User.hasMany(Order);
Order.belongsTo(User);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

User.hasMany(EmailToken);
EmailToken.belongsTo(User);
User.hasMany(PasswordResetToken);
PasswordResetToken.belongsTo(User);

async function syncDb() {
  await sequelize.sync();
}

module.exports = {
  sequelize,
  syncDb,
  User,
  Category,
  Brand,
  Product,
  ProductImage,
  CartItem,
  Order,
  OrderItem,
  EmailToken,
  PasswordResetToken
};
