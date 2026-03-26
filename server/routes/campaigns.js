/**
 * Campaign Routes
 * Handles SMS campaign endpoints
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const campaignController = require('../controllers/campaignController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all campaigns
router.get('/', campaignController.getAll);

// Get a single campaign
router.get('/:id', campaignController.getById);

// Create a new campaign
router.post('/',
  [
    body('name').notEmpty().withMessage('Campaign name is required'),
    body('message').notEmpty().withMessage('Message content is required')
  ],
  campaignController.create
);

// Update a campaign
router.put('/:id', campaignController.update);

// Delete a campaign
router.delete('/:id', campaignController.delete);

// Get campaign contacts
router.get('/:id/contacts', campaignController.getContacts);

// Add contacts to campaign
router.post('/:id/contacts', campaignController.addContacts);

// Remove contact from campaign
router.delete('/:id/contacts/:contactId', campaignController.removeContact);

// Send campaign
router.post('/:id/send', campaignController.send);

// Schedule campaign
router.post('/:id/schedule', campaignController.schedule);

// Cancel scheduled campaign
router.post('/:id/cancel', campaignController.cancel);

// Duplicate campaign
router.post('/:id/duplicate', campaignController.duplicate);

module.exports = router;
