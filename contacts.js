const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   GET /api/contacts
// @desc    Get all contacts for user
// @access  Protected
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone, company, notes, created_at, updated_at
       FROM contacts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const contacts = result.rows.map((contact) => ({
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      notes: contact.notes,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at,
    }));

    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/contacts/:id
// @desc    Get single contact
// @access  Protected
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone, company, notes, created_at, updated_at
       FROM contacts
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contact = result.rows[0];

    res.json({
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      notes: contact.notes,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/contacts
// @desc    Create new contact
// @access  Protected
router.post(
  '/',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone, company, notes } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO contacts (user_id, first_name, last_name, email, phone, company, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, first_name, last_name, email, phone, company, notes, created_at, updated_at`,
        [req.user.id, firstName, lastName, email, phone || null, company || null, notes || null]
      );

      const contact = result.rows[0];

      res.status(201).json({
        id: contact.id,
        firstName: contact.first_name,
        lastName: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        notes: contact.notes,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// @route   PUT /api/contacts/:id
// @desc    Update contact
// @access  Protected
router.put('/:id', async (req, res) => {
  const { firstName, lastName, email, phone, company, notes } = req.body;

  try {
    // Check if contact exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM contacts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const result = await pool.query(
      `UPDATE contacts
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           company = COALESCE($5, company),
           notes = COALESCE($6, notes),
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING id, first_name, last_name, email, phone, company, notes, created_at, updated_at`,
      [firstName, lastName, email, phone, company, notes, req.params.id, req.user.id]
    );

    const contact = result.rows[0];

    res.json({
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      notes: contact.notes,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete contact
// @access  Protected
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
