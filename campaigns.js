const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   GET /api/campaigns
// @desc    Get all campaigns for user
// @access  Protected
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, subject, message, status, scheduled_at, sent_at, created_at, updated_at
       FROM campaigns
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const campaigns = result.rows.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      message: campaign.message,
      status: campaign.status,
      scheduledAt: campaign.scheduled_at,
      sentAt: campaign.sent_at,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
    }));

    res.json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/campaigns/:id
// @desc    Get single campaign with assigned contacts
// @access  Protected
router.get('/:id', async (req, res) => {
  try {
    const campaignResult = await pool.query(
      `SELECT id, name, subject, message, status, scheduled_at, sent_at, created_at, updated_at
       FROM campaigns
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = campaignResult.rows[0];

    // Get assigned contacts
    const contactsResult = await pool.query(
      `SELECT c.id, c.first_name, c.last_name, c.email, cc.added_at
       FROM contacts c
       JOIN campaign_contacts cc ON c.id = cc.contact_id
       WHERE cc.campaign_id = $1`,
      [req.params.id]
    );

    const contacts = contactsResult.rows.map((contact) => ({
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      addedAt: contact.added_at,
    }));

    res.json({
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      message: campaign.message,
      status: campaign.status,
      scheduledAt: campaign.scheduled_at,
      sentAt: campaign.sent_at,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
      contacts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/campaigns
// @desc    Create new campaign
// @access  Protected
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Campaign name is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, subject, message, status, scheduledAt } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO campaigns (user_id, name, subject, message, status, scheduled_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, subject, message, status, scheduled_at, sent_at, created_at, updated_at`,
        [req.user.id, name, subject, message, status || 'draft', scheduledAt || null]
      );

      const campaign = result.rows[0];

      res.status(201).json({
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        message: campaign.message,
        status: campaign.status,
        scheduledAt: campaign.scheduled_at,
        sentAt: campaign.sent_at,
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// @route   PUT /api/campaigns/:id
// @desc    Update campaign
// @access  Protected
router.put('/:id', async (req, res) => {
  const { name, subject, message, status, scheduledAt } = req.body;

  try {
    // Check if campaign exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // If marking as sent, set sent_at timestamp
    let sentAt = null;
    if (status === 'sent') {
      sentAt = new Date();
    }

    const result = await pool.query(
      `UPDATE campaigns
       SET name = COALESCE($1, name),
           subject = COALESCE($2, subject),
           message = COALESCE($3, message),
           status = COALESCE($4, status),
           scheduled_at = COALESCE($5, scheduled_at),
           sent_at = COALESCE($6, sent_at),
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING id, name, subject, message, status, scheduled_at, sent_at, created_at, updated_at`,
      [name, subject, message, status, scheduledAt, sentAt, req.params.id, req.user.id]
    );

    const campaign = result.rows[0];

    res.json({
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      message: campaign.message,
      status: campaign.status,
      scheduledAt: campaign.scheduled_at,
      sentAt: campaign.sent_at,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/campaigns/:id
// @desc    Delete campaign
// @access  Protected
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========================================
// Campaign-Contact Assignment Routes
// ========================================

// @route   GET /api/campaigns/:id/contacts
// @desc    Get contacts for a campaign
// @access  Protected
router.get('/:id/contacts', async (req, res) => {
  try {
    // Verify campaign belongs to user
    const campaignCheck = await pool.query(
      'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (campaignCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const result = await pool.query(
      `SELECT c.id, c.first_name, c.last_name, c.email, c.phone, c.company, cc.added_at
       FROM contacts c
       JOIN campaign_contacts cc ON c.id = cc.contact_id
       WHERE cc.campaign_id = $1
       ORDER BY cc.added_at DESC`,
      [req.params.id]
    );

    const contacts = result.rows.map((contact) => ({
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      addedAt: contact.added_at,
    }));

    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/campaigns/:id/contacts
// @desc    Add contacts to campaign
// @access  Protected
router.post('/:id/contacts', async (req, res) => {
  const { contactIds } = req.body;

  if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
    return res.status(400).json({ error: 'contactIds array is required' });
  }

  try {
    // Verify campaign belongs to user
    const campaignCheck = await pool.query(
      'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (campaignCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Verify all contacts belong to user
    const contactCheck = await pool.query(
      'SELECT id FROM contacts WHERE id = ANY($1) AND user_id = $2',
      [contactIds, req.user.id]
    );

    if (contactCheck.rows.length !== contactIds.length) {
      return res.status(400).json({ error: 'One or more contacts not found' });
    }

    // Insert contacts into campaign (ignore duplicates)
    const values = contactIds.map((contactId) => `(${req.params.id}, ${contactId})`).join(',');

    await pool.query(
      `INSERT INTO campaign_contacts (campaign_id, contact_id)
       VALUES ${values}
       ON CONFLICT (campaign_id, contact_id) DO NOTHING`
    );

    res.status(201).json({ message: 'Contacts added to campaign successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/campaigns/:id/contacts/:contactId
// @desc    Remove contact from campaign
// @access  Protected
router.delete('/:id/contacts/:contactId', async (req, res) => {
  try {
    // Verify campaign belongs to user
    const campaignCheck = await pool.query(
      'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (campaignCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const result = await pool.query(
      'DELETE FROM campaign_contacts WHERE campaign_id = $1 AND contact_id = $2 RETURNING id',
      [req.params.id, req.params.contactId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not assigned to this campaign' });
    }

    res.json({ message: 'Contact removed from campaign successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
