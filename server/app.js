/**
 * EduBook Server - Main Application Entry Point
 * Express.js backend với PostgreSQL support
 * @author EduBook Team
 * @version 1.2.0
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const eLayout = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { syncDb, seedDatabase } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================
// PARSING MIDDLEWARE
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// RATE LIMITING
// ============================================

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts.' }
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ============================================
// VIEW ENGINE (EJS)
// ============================================

app.use(eLayout);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', './layout/layout.ejs');

// ============================================
// STATIC FILES
// ============================================

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/search', require('./routes/search'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/wishlist', require('./routes/wishlist'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: process.env.DB_DIALECT || 'sqlite'
  });
});

// ============================================
// PAGE ROUTES
// ============================================

app.get('/', (req, res) => res.render('index'));
app.get('/index.html', (req, res) => {
  res.cookie('session_id', Date.now().toString(36));
  res.render('index');
});
app.get('/category.html', (req, res) => res.render('category', { layout: './layout/layout-danhMuc.ejs' }));
app.get('/cart.html', (req, res) => res.render('cart'));
app.get('/product.html', (req, res) => res.render('product'));
app.get('/contact.html', (req, res) => res.render('contact'));
app.get('/post.html', (req, res) => res.render('post'));

// Admin routes
app.get('/admin-product.html', (req, res) => res.render('admin/product', { layout: './layout/admin-layout.ejs' }));
app.get('/admin-category.html', (req, res) => res.render('admin/category', { layout: './layout/admin-layout.ejs' }));
app.get('/add_product.html', (req, res) => res.render('admin/add_product', { layout: './layout/admin-layout.ejs' }));
app.get('/edit_product.html', (req, res) => res.render('admin/edit_product', { layout: './layout/admin-layout.ejs' }));
app.get('/add_category.html', (req, res) => res.render('admin/add_category', { layout: './layout/admin-layout.ejs' }));
app.get('/edit_category.html', (req, res) => res.render('admin/edit_category', { layout: './layout/admin-layout.ejs' }));

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;
  
  res.status(statusCode).json({ 
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// SERVER STARTUP
// ============================================

async function startServer() {
  try {
    // Sync database
    await syncDb({ alter: process.env.NODE_ENV === 'development' });
    
    // Seed data in development
    if (process.env.NODE_ENV === 'development') {
      await seedDatabase();
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 EduBook Server is running!`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`📦 Database: ${process.env.DB_DIALECT || 'sqlite'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;