const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');

const contactController = {
  // GET /api/contacts
  async getAll(req, res) {
    try {
      const contacts = await Contact.findAllByUserId(req.user.id);
      res.json(contacts);
    } catch (err) {
      console.error('Get contacts error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // GET /api/contacts/:id
  async getById(req, res) {
    try {
      const contact = await Contact.findById(req.params.id, req.user.id);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      res.json(contact);
    } catch (err) {
      console.error('Get contact error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // POST /api/contacts
  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone, company, notes } = req.body;

    try {
      const contact = await Contact.create(req.user.id, {
        firstName, lastName, email, phone, company, notes
      });
      res.status(201).json(contact);
    } catch (err) {
      console.error('Create contact error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // PUT /api/contacts/:id
  async update(req, res) {
    const { firstName, lastName, email, phone, company, notes } = req.body;

    try {
      const contact = await Contact.update(req.params.id, req.user.id, {
        firstName, lastName, email, phone, company, notes
      });
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      res.json(contact);
    } catch (err) {
      console.error('Update contact error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // DELETE /api/contacts/:id
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
  }
};

module.exports = contactController;
