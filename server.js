const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const { connectDB, createSessionMiddleware } = require('./config');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render.com (TLS termination at load balancer)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS with explicit origin for session cookies
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Stripe webhook needs raw body BEFORE json parsing
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Body parsing with size limit
app.use(express.json({ limit: '100kb' }));

// Session middleware
app.use(createSessionMiddleware());

// API routes
app.use('/api', apiRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message =
    err.isOperational || statusCode < 500
      ? err.message
      : 'Internal server error';

  res.status(statusCode).json({ error: message });
});

// Database connection and server start
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
