/**
 * Database Models Configuration
 * Hỗ trợ PostgreSQL (PgAdmin 4) và SQLite
 * @module models
 */

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// ============================================
// DATABASE CONNECTION CONFIGURATION
// ============================================

let sequelize;

if (process.env.DB_DIALECT === 'postgres') {
  // PostgreSQL Configuration (PgAdmin 4)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'edubook',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true // snake_case cho PostgreSQL
      }
    }
  );
} else {
  // SQLite Configuration (fallback)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './data/edubook.sqlite',
    logging: false
  });
}

// ============================================
// USER MODEL
// ============================================

/**
 * User Model - Quản lý thông tin người dùng
 * @property {string} name - Tên người dùng
 * @property {string} email - Email (unique)
 * @property {string} passwordHash - Mật khẩu đã hash
 * @property {string} role - Vai trò: user/admin
 * @property {boolean} emailVerified - Trạng thái xác thực email
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] }
  ]
});

// ============================================
// CATEGORY MODEL
// ============================================

/**
 * Category Model - Danh mục sản phẩm
 * @property {string} name - Tên danh mục
 * @property {string} slug - URL-friendly name
 * @property {string} description - Mô tả
 * @property {string} image - Ảnh danh mục
 */
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(120),
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'categories',
  indexes: [
    { fields: ['slug'] },
    { fields: ['parent_id'] }
  ]
});

// ============================================
// BRAND MODEL
// ============================================

/**
 * Brand Model - Thương hiệu/Nhà xuất bản
 */
const Brand = sequelize.define('Brand', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(120),
    unique: true
  },
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'brands',
  indexes: [
    { fields: ['slug'] }
  ]
});

// ============================================
// PRODUCT MODEL
// ============================================

/**
 * Product Model - Sản phẩm (Sách)
 * @property {string} name - Tên sách
 * @property {string} sku - Mã sản phẩm
 * @property {decimal} price - Giá bán
 * @property {decimal} originalPrice - Giá gốc
 * @property {integer} stock - Số lượng tồn kho
 * @property {string} author - Tác giả
 */
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(280),
    unique: true
  },
  sku: {
    type: DataTypes.STRING(50),
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  shortDescription: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  originalPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  author: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  publisher: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  publishYear: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  pages: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  language: {
    type: DataTypes.STRING(50),
    defaultValue: 'Tiếng Việt'
  },
  isbn: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  weight: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Trọng lượng (gram)'
  },
  dimensions: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Kích thước: dài x rộng x cao'
  },
  thumbnail: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  soldCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'products',
  indexes: [
    { fields: ['slug'] },
    { fields: ['sku'] },
    { fields: ['category_id'] },
    { fields: ['brand_id'] },
    { fields: ['is_active'] },
    { fields: ['is_featured'] },
    { fields: ['price'] },
    { 
      fields: ['name'],
      type: 'FULLTEXT',
      name: 'products_name_fulltext'
    }
  ]
});

// ============================================
// PRODUCT IMAGE MODEL
// ============================================

/**
 * ProductImage Model - Ảnh sản phẩm
 */
const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  alt: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'product_images'
});

// ============================================
// CART ITEM MODEL
// ============================================

/**
 * CartItem Model - Giỏ hàng
 */
const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Giá tại thời điểm thêm vào giỏ'
  }
}, {
  tableName: 'cart_items',
  indexes: [
    { fields: ['user_id', 'product_id'], unique: true }
  ]
});

// ============================================
// ORDER MODEL
// ============================================

/**
 * Order Model - Đơn hàng
 * @property {string} status - pending/confirmed/shipping/delivered/cancelled
 * @property {string} paymentStatus - unpaid/paid/refunded
 */
const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNumber: {
    type: DataTypes.STRING(50),
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'paid', 'refunded'),
    defaultValue: 'unpaid'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cod', 'bank_transfer', 'stripe', 'momo', 'vnpay'),
    defaultValue: 'cod'
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  shippingFee: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  // Shipping Info
  shippingName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  shippingPhone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  shippingEmail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  shippingCity: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  shippingDistrict: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  shippingWard: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Payment Info
  stripePaymentId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'orders',
  indexes: [
    { fields: ['order_number'] },
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['payment_status'] },
    { fields: ['created_at'] }
  ],
  hooks: {
    beforeCreate: async (order) => {
      // Generate order number: EB + timestamp + random
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      order.orderNumber = `EB${timestamp}${random}`;
    }
  }
});

// ============================================
// ORDER ITEM MODEL
// ============================================

/**
 * OrderItem Model - Chi tiết đơn hàng
 */
const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Giá tại thời điểm đặt hàng'
  },
  productName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Lưu tên sản phẩm để tránh mất khi xóa product'
  },
  productThumbnail: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'order_items'
});

// ============================================
// EMAIL TOKEN MODEL
// ============================================

/**
 * EmailToken Model - Token xác thực email
 */
const EmailToken = sequelize.define('EmailToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'email_tokens',
  indexes: [
    { fields: ['token'] },
    { fields: ['user_id'] }
  ]
});

// ============================================
// PASSWORD RESET TOKEN MODEL
// ============================================

/**
 * PasswordResetToken Model - Token đặt lại mật khẩu
 */
const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'password_reset_tokens',
  indexes: [
    { fields: ['token'] }
  ]
});

// ============================================
// REVIEW MODEL (Tính năng nâng cao)
// ============================================

/**
 * Review Model - Đánh giá sản phẩm
 */
const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'reviews',
  indexes: [
    { fields: ['product_id'] },
    { fields: ['user_id'] },
    { fields: ['is_approved'] }
  ]
});

// ============================================
// COUPON MODEL (Tính năng nâng cao)
// ============================================

/**
 * Coupon Model - Mã giảm giá
 */
const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    defaultValue: 'percentage'
  },
  value: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  minOrderValue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  maxDiscount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'coupons',
  indexes: [
    { fields: ['code'] },
    { fields: ['is_active'] }
  ]
});

// ============================================
// WISHLIST MODEL (Tính năng nâng cao)
// ============================================

/**
 * Wishlist Model - Danh sách yêu thích
 */
const Wishlist = sequelize.define('Wishlist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
}, {
  tableName: 'wishlists',
  indexes: [
    { fields: ['user_id', 'product_id'], unique: true }
  ]
});

// ============================================
// MODEL ASSOCIATIONS (Quan hệ)
// ============================================

// Category self-reference (danh mục cha-con)
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

// Category - Product
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// Brand - Product
Brand.hasMany(Product, { foreignKey: 'brandId' });
Product.belongsTo(Brand, { foreignKey: 'brandId' });

// Product - ProductImage
Product.hasMany(ProductImage, { as: 'images', foreignKey: 'productId', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

// User - CartItem
User.hasMany(CartItem, { foreignKey: 'userId', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

// Product - CartItem
Product.hasMany(CartItem, { foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// User - Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Order - OrderItem
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Product - OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// User - EmailToken
User.hasMany(EmailToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
EmailToken.belongsTo(User, { foreignKey: 'userId' });

// User - PasswordResetToken
User.hasMany(PasswordResetToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
PasswordResetToken.belongsTo(User, { foreignKey: 'userId' });

// User - Review
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

// Product - Review
Product.hasMany(Review, { as: 'reviews', foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// User - Wishlist - Product
User.hasMany(Wishlist, { foreignKey: 'userId', onDelete: 'CASCADE' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Wishlist, { foreignKey: 'productId' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });

// ============================================
// DATABASE SYNC FUNCTION
// ============================================

/**
 * Đồng bộ database với options
 * @param {Object} options - Sequelize sync options
 * @param {boolean} options.force - Xóa và tạo lại tables (CẢNH BÁO: mất dữ liệu)
 * @param {boolean} options.alter - Tự động thay đổi schema
 */
async function syncDb(options = {}) {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync models
    await sequelize.sync(options);
    console.log('✅ All models synchronized.');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

/**
 * Seed dữ liệu mẫu cho development
 */
async function seedDatabase() {
  const bcrypt = require('bcrypt');
  
  try {
    // Tạo admin user
    const adminExists = await User.findOne({ where: { email: 'admin@edubook.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@edubook.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'admin',
        emailVerified: true
      });
      console.log('✅ Admin user created: admin@edubook.com / admin123');
    }

    // Tạo categories mẫu
    const categories = [
      { name: 'Sách trong nước', slug: 'sach-trong-nuoc', description: 'Sách xuất bản trong nước' },
      { name: 'Sách nước ngoài', slug: 'sach-nuoc-ngoai', description: 'Sách dịch từ nước ngoài' },
      { name: 'Manga - Comics', slug: 'manga-comics', description: 'Truyện tranh Nhật Bản và phương Tây' },
      { name: 'Văn học', slug: 'van-hoc', description: 'Tiểu thuyết, truyện ngắn, thơ' },
      { name: 'Kinh tế', slug: 'kinh-te', description: 'Sách kinh doanh, tài chính' },
      { name: 'Kỹ năng sống', slug: 'ky-nang-song', description: 'Self-help, phát triển bản thân' }
    ];

    for (const cat of categories) {
      await Category.findOrCreate({ where: { slug: cat.slug }, defaults: cat });
    }
    console.log('✅ Sample categories created');

    // Tạo brands mẫu
    const brands = [
      { name: 'NXB Kim Đồng', slug: 'nxb-kim-dong' },
      { name: 'NXB Trẻ', slug: 'nxb-tre' },
      { name: 'NXB Nhã Nam', slug: 'nxb-nha-nam' },
      { name: 'Alpha Books', slug: 'alpha-books' },
      { name: 'First News', slug: 'first-news' }
    ];

    for (const brand of brands) {
      await Brand.findOrCreate({ where: { slug: brand.slug }, defaults: brand });
    }
    console.log('✅ Sample brands created');

    console.log('✅ Database seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  sequelize,
  syncDb,
  seedDatabase,
  // Models
  User,
  Category,
  Brand,
  Product,
  ProductImage,
  CartItem,
  Order,
  OrderItem,
  EmailToken,
  PasswordResetToken,
  Review,
  Coupon,
  Wishlist
};
