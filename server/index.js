/**
 * CampaignHub SMS Marketing Platform
 * Main Server Entry Point
 * @author Vruti Mistry
 * @version 2.0.0
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const campaignRoutes = require('./routes/campaigns');
const messageRoutes = require('./routes/messages');
const groupRoutes = require('./routes/groups');
const settingsRoutes = require('./routes/settings');
const analyticsRoutes = require('./routes/analytics');
const webhookRoutes = require('./routes/webhooks');

const { startScheduler } = require('./services/campaignScheduler');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path}`);
  next();
});

// =====================================================
// API Routes
// =====================================================

// Public routes
app.use('/api/auth', authRoutes);

// Webhook routes (public - called by Twilio)
app.use('/api/webhooks', webhookRoutes);

// Protected routes (require authentication)
app.use('/api/contacts', contactRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);

// =====================================================
// Health Check & Info
// =====================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CampaignHub API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'CampaignHub SMS Marketing Platform API',
    version: '2.0.0',
    description: 'SMS marketing campaign management with Twilio integration',
    endpoints: {
      auth: '/api/auth',
      contacts: '/api/contacts',
      campaigns: '/api/campaigns',
      messages: '/api/messages',
      groups: '/api/groups',
      settings: '/api/settings',
      analytics: '/api/analytics',
      webhooks: '/api/webhooks',
      health: '/api/health'
    },
    documentation: 'See Postman collection for detailed API documentation'
  });
});

// =====================================================
// Error Handling
// =====================================================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Don't expose internal errors to clients
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// =====================================================
// Server Startup
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('CampaignHub SMS Marketing Platform');
  console.log('='.repeat(50));
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));

  // Start the background scheduler for scheduled campaigns
  startScheduler();
});

module.exports = app;
