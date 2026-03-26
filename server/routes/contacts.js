/**
 * Contact Routes
 * Handles contact management endpoints
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get active contacts (for campaign assignment) - must be before /:id
router.get('/active', contactController.getActive);

// Get all contacts
router.get('/', contactController.getAll);

// Get a single contact
router.get('/:id', contactController.getById);

// Create a new contact
router.post('/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone number is required')
  ],
  contactController.create
);

// Bulk create contacts
router.post('/bulk', contactController.bulkCreate);

// Bulk delete contacts
router.delete('/bulk', contactController.bulkDelete);

// Update a contact
router.put('/:id', contactController.update);

// Delete a contact
router.delete('/:id', contactController.delete);

module.exports = router;
