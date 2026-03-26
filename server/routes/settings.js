/**
 * Settings Routes
 * Handles Twilio configuration and user settings
 */

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Twilio settings
router.get('/twilio', settingsController.getTwilioSettings);
router.post('/twilio', settingsController.saveTwilioSettings);
router.put('/twilio', settingsController.saveTwilioSettings); // Support both POST and PUT
router.delete('/twilio', settingsController.deleteTwilioSettings);
router.post('/twilio/test', settingsController.testTwilioConnection);
router.get('/twilio/numbers', settingsController.getAvailableNumbers);

module.exports = router;
