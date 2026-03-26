/**
 * Webhook Routes
 * Handles incoming webhooks from Twilio
 * Note: These routes are public (no auth) as they're called by Twilio
 */

const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Twilio sends webhooks as POST with form-urlencoded data
router.use(express.urlencoded({ extended: false }));

// Incoming SMS webhook
router.post('/sms/incoming', webhookController.handleIncomingSMS);

// Message status callback
router.post('/sms/status', webhookController.handleStatusCallback);

module.exports = router;
