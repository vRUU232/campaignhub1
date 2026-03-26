/**
 * Contact Controller
 * Handles contact management operations
 */

const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const ContactGroup = require('../models/ContactGroup');

const contactController = {
  /**
   * GET /api/contacts
   * Get all contacts for the user
   */
  async getAll(req, res) {
    try {
      const { status, search, groupId, limit = 100, offset = 0, page = 1 } = req.query;
      const actualOffset = page > 1 ? (page - 1) * parseInt(limit) : parseInt(offset);

      const contacts = await Contact.findAllByUserId(req.user.id, {
        status,
        search,
        groupId: groupId ? parseInt(groupId) : null,
        limit: parseInt(limit),
        offset: actualOffset
      });

      const total = await Contact.countByUserId(req.user.id, status);

      res.json({
        contacts,
        total,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: actualOffset,
          page: parseInt(page),
          hasMore: actualOffset + contacts.length < total
        }
      });
    } catch (err) {
      console.error('Get contacts error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * GET /api/contacts/active
   * Get all active contacts (for campaign assignment)
   */
  async getActive(req, res) {
    try {
      const contacts = await Contact.getActiveContacts(req.user.id);
      res.json({ contacts });
    } catch (err) {
      console.error('Get active contacts error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * GET /api/contacts/:id
   * Get a single contact with their campaigns and groups
   */
  async getById(req, res) {
    try {
      const contact = await Contact.findById(req.params.id, req.user.id);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      const campaigns = await Contact.getCampaigns(req.params.id, req.user.id);
      const groups = await ContactGroup.getGroupsForContact(req.params.id, req.user.id);

      res.json({
        contact: {
          ...contact,
          campaigns,
          groups
        }
      });
    } catch (err) {
      console.error('Get contact error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * POST /api/contacts
   * Create a new contact
   */
  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, company, notes, source, status } = req.body;

    try {
      const contact = await Contact.create(req.user.id, {
        name,
        email,
        phone,
        company,
        notes,
        source
      });
      res.status(201).json({ contact });
    } catch (err) {
      console.error('Create contact error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * POST /api/contacts/bulk
   * Create multiple contacts at once
   */
  async bulkCreate(req, res) {
    const { contacts } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: 'Contacts array is required' });
    }

    try {
      const results = await Contact.bulkCreate(req.user.id, contacts);

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      res.status(201).json({
        message: `Created ${successful} contacts, ${failed} failed`,
        successful,
        failed,
        results
      });
    } catch (err) {
      console.error('Create bulk contacts error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * PUT /api/contacts/:id
   * Update a contact
   */
  async update(req, res) {
    const { name, email, phone, company, notes, status } = req.body;

    try {
      const contact = await Contact.update(req.params.id, req.user.id, {
        name,
        email,
        phone,
        company,
        notes,
        status
      });

      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      res.json({ contact });
    } catch (err) {
      console.error('Update contact error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * DELETE /api/contacts/:id
   * Delete a contact
   */
  async delete(req, res) {
    try {
      const deleted = await Contact.delete(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      res.json({ message: 'Contact deleted successfully' });
    } catch (err) {
      console.error('Delete contact error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * DELETE /api/contacts/bulk
   * Delete multiple contacts
   */
  async bulkDelete(req, res) {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'IDs array is required' });
    }

    try {
      const deletedCount = await Contact.bulkDelete(ids, req.user.id);

      res.json({
        message: `Deleted ${deletedCount} contacts`,
        deleted: deletedCount
      });
    } catch (err) {
      console.error('Delete bulk contacts error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = contactController;
