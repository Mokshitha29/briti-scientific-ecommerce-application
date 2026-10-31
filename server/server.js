
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Middleware imports
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ========================================
// Database Connection
// ========================================
connectDB();

// ========================================
// CORS Configuration
// ========================================

const clientEnvUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'https://briti-scientific-ecommerce-applicat.vercel.app',
  ...clientEnvUrls
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (such as server-to-server requests and curl)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, '');

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.warn(`CORS blocked for origin: ${origin}`);

      return callback(null, false);
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ]
  })
);

// ========================================
// Body Parser Middleware
// ========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// Health Check
// ========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Briti Chemical Store API',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// API Routes
// ========================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// ========================================
// Centralized Error Handling
// ========================================

app.use(notFound);
app.use(errorHandler);

// ========================================
// Server Configuration
// ========================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Briti Chemical Store API Server listening on port ${PORT}`
  );
});

module.exports = { app, server };
