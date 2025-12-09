app.use('/api/admin', require('./routes/admin'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/brands', require('./routes/brands'));
require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const eLayout = require('express-ejs-layouts')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const { syncDb } = require('./models')

const PORT = process.env.PORT || 3000

// basic security & parsing middleware
app.use(helmet())
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// rate limiting (general)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
})
app.use('/api', apiLimiter)


// sử dụng cookie
app.use(cookieParser())

//view engine (ejs)
app.use(eLayout)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('layout', './layout/layout.ejs')
app.use(express.static(path.join(__dirname, 'public')))

// homepage
app.get('/', (req, res, next) => {

    res.render('index')
})

app.get('/post.html', (req, res, next) => {

    res.render('post')

})

app.get('/cart.html', (req, res, next) => {
    res.render('cart')
})

app.get('/category.html', (req, res, next) => {
    res.render('category',

        {
            layout: './layout/layout-danhMuc.ejs'
        })
})

app.get('/contact.html', (req, res, next) => {
    res.render('contact')
})

app.get('/product.html', (req, res, next) => {

    res.render('product')

})

app.get('/admin-product.html', (req, res, next) => {
    res.render('admin/product', {
        layout: './layout/admin-layout.ejs'
    })
})

app.get('/edit_product.html', (req, res, next) => {
    res.render('admin/edit_product', {
        layout: './layout/admin-layout.ejs'
    })
})

app.get('/add_product.html', (req, res, next) => {
    res.render('admin/add_product', {
        layout: './layout/admin-layout.ejs'
    })
})

app.use(cookieParser())


app.get('/index.html', (req, res, next) => {
    console.log(req.cookies);
    res.cookie('session_id', '12345')
    res.cookie('cartInfo', '0')
    res.render('index')
})


//chay app
syncDb().then(() => {
    app.listen(PORT, function () {
        console.log(`Đang chạy app tại: http://localhost:${PORT}`)
    })
}).catch(err => {
    console.error('Database sync failed', err)
})