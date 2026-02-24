const express = require('express');
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/contacts
router.get('/', contactController.getAll);

// GET /api/contacts/:id
router.get('/:id', contactController.getById);

// POST /api/contacts
router.post(
  '/',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please enter a valid email')
  ],
  contactController.create
);

// PUT /api/contacts/:id
router.put('/:id', contactController.update);

// DELETE /api/contacts/:id
router.delete('/:id', contactController.delete);

module.exports = router;
