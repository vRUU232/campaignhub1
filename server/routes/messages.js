/**
 * Messages Routes
 * Handles SMS inbox and messaging
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get recent messages (for dashboard)
router.get('/recent', messageController.getRecent);

// Get all messages
router.get('/', messageController.getAll);

// Get conversations list
router.get('/conversations', messageController.getConversations);

// Get conversation with a specific contact
router.get('/conversations/:contactId', messageController.getConversation);

// Mark conversation as read
router.put('/conversations/:contactId/read', messageController.markAsRead);

// Send a new message
router.post('/',
  [
    body('message').notEmpty().withMessage('Message content is required'),
  ],
  messageController.send
);

// Send a new message (alias for /send)
router.post('/send',
  [
    body('message').notEmpty().withMessage('Message content is required'),
  ],
  messageController.send
);

// Get message by ID
router.get('/:id', messageController.getById);

// Get message status from Twilio
router.get('/:id/status', messageController.getStatus);

module.exports = router;
