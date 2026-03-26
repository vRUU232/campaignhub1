/**
 * Analytics Routes
 * Handles dashboard and analytics data
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get dashboard data
router.get('/dashboard', analyticsController.getDashboard);

// Get message analytics
router.get('/messages', analyticsController.getMessageAnalytics);

// Get campaign performance
router.get('/campaigns', analyticsController.getCampaignPerformance);

// Get hourly activity
router.get('/hourly', analyticsController.getHourlyActivity);

// Get summary statistics
router.get('/summary', analyticsController.getSummary);

// Get daily analytics
router.get('/daily', analyticsController.getDaily);

module.exports = router;
