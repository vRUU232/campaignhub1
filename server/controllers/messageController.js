/**
 * Message Controller
 * Handles SMS message operations and inbox functionality
 */

const Message = require('../models/Message');
const Contact = require('../models/Contact');
const OptOut = require('../models/OptOut');
const TwilioSettings = require('../models/TwilioSettings');
const twilioService = require('../services/twilioService');

const messageController = {
  /**
   * Get recent messages (for dashboard)
   */
  async getRecent(req, res) {
    try {
      const { limit = 5 } = req.query;

      const messages = await Message.findAllByUserId(req.user.id, {
        limit: parseInt(limit),
        offset: 0
      });

      res.json({ messages });
    } catch (error) {
      console.error('Get recent messages error:', error);
      res.status(500).json({ error: 'Failed to get recent messages' });
    }
  },

  /**
   * Get all messages (inbox)
   */
  async getAll(req, res) {
    try {
      const { limit = 50, offset = 0, direction, contactId } = req.query;

      const messages = await Message.findAllByUserId(req.user.id, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        direction,
        contactId: contactId ? parseInt(contactId) : null
      });

      const total = await Message.countByUserId(req.user.id, { direction });

      res.json({
        messages,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + messages.length < total
        }
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  },

  /**
   * Get conversations list
   */
  async getConversations(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;

      const conversations = await Message.getConversations(
        req.user.id,
        parseInt(limit),
        parseInt(offset)
      );

      res.json({ conversations });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: 'Failed to get conversations' });
    }
  },

  /**
   * Get conversation with a specific contact
   */
  async getConversation(req, res) {
    try {
      const { contactId } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      // Verify contact ownership
      const contact = await Contact.findById(parseInt(contactId), req.user.id);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      const messages = await Message.getConversation(
        req.user.id,
        parseInt(contactId),
        parseInt(limit),
        parseInt(offset)
      );

      // Mark messages as read
      await Message.markAsRead(req.user.id, parseInt(contactId));

      res.json({
        contact,
        messages
      });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ error: 'Failed to get conversation' });
    }
  },

  /**
   * Send a new SMS message
   */
  async send(req, res) {
    try {
      // Support both naming conventions (camelCase and snake_case)
      const contactId = req.body.contactId || req.body.contact_id;
      const phone = req.body.phone || req.body.to_number;
      const message = req.body.message || req.body.body;

      if (!message) {
        return res.status(400).json({ error: 'Message content is required' });
      }

      if (!contactId && !phone) {
        return res.status(400).json({ error: 'Contact ID or phone number is required' });
      }

      // Get Twilio settings
      const settings = await TwilioSettings.findByUserId(req.user.id);
      if (!settings || !settings.isVerified) {
        return res.status(400).json({ error: 'Twilio settings not configured or verified' });
      }

      let toPhone = phone;
      let contact = null;

      // Get contact if contactId provided
      if (contactId) {
        contact = await Contact.findById(parseInt(contactId), req.user.id);
        if (!contact) {
          return res.status(404).json({ error: 'Contact not found' });
        }
        toPhone = contact.phone;

        // Check if contact has opted out
        const isOptedOut = await OptOut.isOptedOut(req.user.id, toPhone);
        if (isOptedOut) {
          return res.status(400).json({ error: 'Contact has opted out of receiving messages' });
        }
      }

      // Send SMS via Twilio
      const result = await twilioService.sendSMS(req.user.id, toPhone, message);

      if (!result.success) {
        return res.status(400).json({
          error: 'Failed to send message',
          details: result.error,
          code: result.code
        });
      }

      // Save message to database
      const savedMessage = await Message.create({
        userId: req.user.id,
        contactId: contact?.id || null,
        direction: 'outbound',
        fromNumber: settings.phoneNumber,
        toNumber: toPhone,
        content: message,
        twilioSid: result.sid,
        twilioStatus: result.status,
        segments: twilioService.calculateSegments(message)
      });

      // Update contact's last contacted timestamp
      if (contact) {
        await Contact.updateLastContacted(contact.id);
      }

      res.status(201).json({
        message: 'Message sent successfully',
        data: savedMessage
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  },

  /**
   * Get message by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const message = await Message.findById(parseInt(id), req.user.id);

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      res.json(message);
    } catch (error) {
      console.error('Get message error:', error);
      res.status(500).json({ error: 'Failed to get message' });
    }
  },

  /**
   * Get message status from Twilio
   */
  async getStatus(req, res) {
    try {
      const { id } = req.params;
      const message = await Message.findById(parseInt(id), req.user.id);

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (!message.twilioSid) {
        return res.status(400).json({ error: 'Message has no Twilio SID' });
      }

      // Get status from Twilio
      const status = await twilioService.getMessageStatus(req.user.id, message.twilioSid);

      // Update local status if changed
      if (status.status !== message.twilioStatus) {
        await Message.updateStatus(message.twilioSid, {
          status: status.status,
          errorCode: status.errorCode,
          errorMessage: status.errorMessage,
          price: status.price,
          priceUnit: status.priceUnit,
          sentAt: status.dateSent,
          deliveredAt: status.status === 'delivered' ? new Date() : null
        });
      }

      res.json(status);
    } catch (error) {
      console.error('Get message status error:', error);
      res.status(500).json({ error: 'Failed to get message status' });
    }
  },

  /**
   * Mark conversation as read
   */
  async markAsRead(req, res) {
    try {
      const { contactId } = req.params;

      await Message.markAsRead(req.user.id, parseInt(contactId));

      res.json({ message: 'Conversation marked as read' });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Failed to mark conversation as read' });
    }
  }
};

module.exports = messageController;
