const express = require('express');
const { body } = require('express-validator');
const campaignController = require('../controllers/campaignController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/campaigns
router.get('/',campaignController.getAll);

// GET /api/campaigns/:id 
router.get('/:id', campaignController.getById);

// POST /api/campaigns
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Campaign name is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message is required')
  ],
  campaignController.create
);

// PUT /api/campaigns/:id
router.put('/:id', campaignController.update);

// DELETE /api/campaigns/:id
router.delete('/:id', campaignController.delete);

// GET /api/campaigns/:id/contacts
router.get('/:id/contacts', campaignController.getContacts);

// POST /api/campaigns/:id/contacts
router.post('/:id/contacts', campaignController.addContacts);

// DELETE /api/campaigns/:id/contacts/:contactId
router.delete('/:id/contacts/:contactId', campaignController.removeContact);

module.exports = router;
