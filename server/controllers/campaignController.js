const { validationResult } = require('express-validator');
const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');

const campaignController = {
  // GET /api/campaigns
  async getAll(req, res) {
    try {
      const campaigns = await Campaign.findAllByUserId(req.user.id);
      res.json(campaigns);
    } catch (err) {
      console.error('Get campaigns error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // GET /api/campaigns/:id
  async getById(req, res) {
    try {
      const campaign = await Campaign.findByIdWithContacts(req.params.id, req.user.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (err) {
      console.error('Get campaign error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // POST /api/campaigns
  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, subject, message, status, scheduledAt } = req.body;

    try {
      const campaign = await Campaign.create(req.user.id, {
        name, subject, message, status, scheduledAt
      });
      res.status(201).json(campaign);
    } catch (err) {
      console.error('Create campaign error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // PUT /api/campaigns/:id
  async update(req, res) {
    const { name, subject, message, status, scheduledAt } = req.body;

    try {
      const campaign = await Campaign.update(req.params.id, req.user.id, {
        name, subject, message, status, scheduledAt
      });
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (err) {
      console.error('Update campaign error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // DELETE /api/campaigns/:id
  async delete(req, res) {
    try {
      const deleted = await Campaign.delete(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json({ message: 'Campaign deleted successfully' });
    } catch (err) {
      console.error('Delete campaign error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // GET /api/campaigns/:id/contacts
  async getContacts(req, res) {
    try {
      const contacts = await Campaign.getContacts(req.params.id, req.user.id);
      if (contacts === null) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json(contacts);
    } catch (err) {
      console.error('Get campaign contacts error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // POST /api/campaigns/:id/contacts
  async addContacts(req, res) {
    const { contactIds } = req.body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({ error: 'contactIds array is required' });
    }

    try {
      const campaignExists = await Campaign.verifyOwnership(req.params.id, req.user.id);
      if (!campaignExists) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      const contactsValid = await Contact.verifyOwnership(contactIds, req.user.id);
      if (!contactsValid) {
        return res.status(400).json({ error: 'One or more contacts not found' });
      }

      await Campaign.addContacts(req.params.id, contactIds);
      res.status(201).json({ message: 'Contacts added to campaign successfully' });
    } catch (err) {
      console.error('Add contacts to campaign error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // DELETE /api/campaigns/:id/contacts/:contactId
  async removeContact(req, res) {
    try {
      const campaignExists = await Campaign.verifyOwnership(req.params.id, req.user.id);
      if (!campaignExists) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      const removed = await Campaign.removeContact(req.params.id, req.params.contactId);
      if (!removed) {
        return res.status(404).json({ error: 'Contact not assigned to this campaign' });
      }
      res.json({ message: 'Contact removed from campaign successfully' });
    } catch (err) {
      console.error('Remove contact from campaign error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = campaignController;
