/**
 * Groups Routes
 * Handles contact group operations
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const groupController = require('../controllers/groupController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all groups
router.get('/', groupController.getAll);

// Get a single group
router.get('/:id', groupController.getById);

// Create a new group
router.post('/',
  [
    body('name').notEmpty().withMessage('Group name is required')
  ],
  groupController.create
);

// Update a group
router.put('/:id', groupController.update);

// Delete a group
router.delete('/:id', groupController.delete);

// Get contacts in a group
router.get('/:id/contacts', groupController.getContacts);

// Add contacts to a group
router.post('/:id/contacts',
  [
    body('contactIds').isArray().withMessage('Contact IDs must be an array')
  ],
  groupController.addContacts
);

// Remove a contact from a group
router.delete('/:id/contacts/:contactId', groupController.removeContact);

module.exports = router;
