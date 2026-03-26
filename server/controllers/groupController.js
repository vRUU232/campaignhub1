/**
 * Group Controller
 * Handles contact group operations
 */

const ContactGroup = require('../models/ContactGroup');

const groupController = {
  /**
   * Get all groups for the user
   */
  async getAll(req, res) {
    try {
      const groups = await ContactGroup.findAllByUserId(req.user.id);
      res.json(groups);
    } catch (error) {
      console.error('Get groups error:', error);
      res.status(500).json({ error: 'Failed to get groups' });
    }
  },

  /**
   * Get a single group by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const group = await ContactGroup.findById(parseInt(id), req.user.id);

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      res.json(group);
    } catch (error) {
      console.error('Get group error:', error);
      res.status(500).json({ error: 'Failed to get group' });
    }
  },

  /**
   * Create a new group
   */
  async create(req, res) {
    try {
      const { name, description, color } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Group name is required' });
      }

      const group = await ContactGroup.create(req.user.id, {
        name,
        description,
        color
      });

      res.status(201).json(group);
    } catch (error) {
      console.error('Create group error:', error);
      res.status(500).json({ error: 'Failed to create group' });
    }
  },

  /**
   * Update a group
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, color } = req.body;

      const group = await ContactGroup.update(parseInt(id), req.user.id, {
        name,
        description,
        color
      });

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      res.json(group);
    } catch (error) {
      console.error('Update group error:', error);
      res.status(500).json({ error: 'Failed to update group' });
    }
  },

  /**
   * Delete a group
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ContactGroup.delete(parseInt(id), req.user.id);

      if (!deleted) {
        return res.status(404).json({ error: 'Group not found' });
      }

      res.json({ message: 'Group deleted successfully' });
    } catch (error) {
      console.error('Delete group error:', error);
      res.status(500).json({ error: 'Failed to delete group' });
    }
  },

  /**
   * Get contacts in a group
   */
  async getContacts(req, res) {
    try {
      const { id } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      const contacts = await ContactGroup.getContacts(
        parseInt(id),
        req.user.id,
        parseInt(limit),
        parseInt(offset)
      );

      if (contacts === null) {
        return res.status(404).json({ error: 'Group not found' });
      }

      res.json(contacts);
    } catch (error) {
      console.error('Get group contacts error:', error);
      res.status(500).json({ error: 'Failed to get group contacts' });
    }
  },

  /**
   * Add contacts to a group
   */
  async addContacts(req, res) {
    try {
      const { id } = req.params;
      const { contactIds } = req.body;

      if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
        return res.status(400).json({ error: 'Contact IDs array is required' });
      }

      const result = await ContactGroup.addContacts(
        parseInt(id),
        req.user.id,
        contactIds
      );

      if (result === null) {
        return res.status(404).json({ error: 'Group not found' });
      }

      res.json({
        message: `Added ${result.added} contacts to group`,
        added: result.added
      });
    } catch (error) {
      console.error('Add contacts to group error:', error);
      res.status(500).json({ error: 'Failed to add contacts to group' });
    }
  },

  /**
   * Remove a contact from a group
   */
  async removeContact(req, res) {
    try {
      const { id, contactId } = req.params;

      const result = await ContactGroup.removeContact(
        parseInt(id),
        req.user.id,
        parseInt(contactId)
      );

      if (result === null) {
        return res.status(404).json({ error: 'Group not found' });
      }

      if (!result) {
        return res.status(404).json({ error: 'Contact not found in group' });
      }

      res.json({ message: 'Contact removed from group' });
    } catch (error) {
      console.error('Remove contact from group error:', error);
      res.status(500).json({ error: 'Failed to remove contact from group' });
    }
  }
};

module.exports = groupController;
