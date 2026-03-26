/**
 * Campaign Controller
 * Handles SMS campaign operations including sending
 */

const { validationResult } = require('express-validator');
const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');
const Message = require('../models/Message');
const OptOut = require('../models/OptOut');
const TwilioSettings = require('../models/TwilioSettings');
const Analytics = require('../models/Analytics');
const twilioService = require('../services/twilioService');

const campaignController = {
  /**
   * GET /api/campaigns
   * Get all campaigns for the user
   */
  async getAll(req, res) {
    try {
      const { status, limit = 50, offset = 0 } = req.query;

      const campaigns = await Campaign.findAllByUserId(req.user.id, {
        status,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const total = await Campaign.countByUserId(req.user.id, status);

      res.json({
        campaigns,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + campaigns.length < total
        }
      });
    } catch (err) {
      console.error('Get campaigns error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * GET /api/campaigns/:id
   * Get a single campaign with contacts
   */
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

  /**
   * POST /api/campaigns
   * Create a new campaign
   */
  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, message, status, campaignType, scheduledAt } = req.body;

    try {
      const campaign = await Campaign.create(req.user.id, {
        name,
        message,
        status,
        campaignType,
        scheduledAt
      });
      res.status(201).json(campaign);
    } catch (err) {
      console.error('Create campaign error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * PUT /api/campaigns/:id
   * Update a campaign
   */
  async update(req, res) {
    const { name, message, status, campaignType, scheduledAt } = req.body;

    try {
      const campaign = await Campaign.update(req.params.id, req.user.id, {
        name,
        message,
        status,
        campaignType,
        scheduledAt
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

  /**
   * DELETE /api/campaigns/:id
   * Delete a campaign
   */
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

  /**
   * GET /api/campaigns/:id/contacts
   * Get contacts assigned to a campaign
   */
  async getContacts(req, res) {
    try {
      const { status, limit = 100, offset = 0 } = req.query;

      const contacts = await Campaign.getContacts(req.params.id, req.user.id, {
        status,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      if (contacts === null) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json(contacts);
    } catch (err) {
      console.error('Get campaign contacts error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * POST /api/campaigns/:id/contacts
   * Add contacts to a campaign
   */
  async addContacts(req, res) {
    const { contactIds } = req.body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({ error: 'contactIds array is required' });
    }

    try {
      const result = await Campaign.addContacts(req.params.id, req.user.id, contactIds);

      if (result === null) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      res.status(201).json({
        message: `${result.added} contacts added to campaign`,
        added: result.added
      });
    } catch (err) {
      console.error('Add contacts to campaign error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * DELETE /api/campaigns/:id/contacts/:contactId
   * Remove a contact from a campaign
   */
  async removeContact(req, res) {
    try {
      const removed = await Campaign.removeContact(
        req.params.id,
        req.user.id,
        req.params.contactId
      );

      if (removed === null) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      if (!removed) {
        return res.status(404).json({ error: 'Contact not assigned to this campaign' });
      }

      res.json({ message: 'Contact removed from campaign successfully' });
    } catch (err) {
      console.error('Remove contact from campaign error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * POST /api/campaigns/:id/send
   * Send the campaign to all assigned contacts
   */
  async send(req, res) {
    try {
      const campaignId = req.params.id;

      // Get campaign
      const campaign = await Campaign.findById(campaignId, req.user.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      // Check if already sent
      if (campaign.status === 'sent' || campaign.status === 'sending') {
        return res.status(400).json({ error: 'Campaign has already been sent or is sending' });
      }

      // Get Twilio settings
      const settings = await TwilioSettings.findByUserId(req.user.id);
      if (!settings || !settings.isVerified) {
        return res.status(400).json({ error: 'Twilio settings not configured or verified' });
      }

      // Get campaign contacts
      const contacts = await Campaign.getContacts(campaignId, req.user.id);
      if (!contacts || contacts.length === 0) {
        return res.status(400).json({ error: 'No contacts assigned to this campaign' });
      }

      // Filter out opted-out contacts
      const activeContacts = [];
      for (const contact of contacts) {
        const isOptedOut = await OptOut.isOptedOut(req.user.id, contact.phone);
        if (!isOptedOut && contact.contactStatus === 'active') {
          activeContacts.push(contact);
        } else {
          await Campaign.updateContactStatus(campaignId, contact.id, 'opted_out');
        }
      }

      if (activeContacts.length === 0) {
        return res.status(400).json({ error: 'No active contacts to send to (all opted out)' });
      }

      // Update campaign status to sending
      await Campaign.update(campaignId, req.user.id, { status: 'sending' });

      // Send messages in background
      const sendResults = {
        total: activeContacts.length,
        sent: 0,
        failed: 0
      };

      const today = new Date().toISOString().split('T')[0];

      for (const contact of activeContacts) {
        // Personalize message
        const personalizedMessage = twilioService.personalizeMessage(campaign.message, contact);

        // Send SMS
        const result = await twilioService.sendSMS(req.user.id, contact.phone, personalizedMessage, {
          statusCallback: `${process.env.BASE_URL || ''}/api/webhooks/sms/status`
        });

        if (result.success) {
          sendResults.sent++;

          // Save message
          await Message.create({
            userId: req.user.id,
            contactId: contact.id,
            campaignId,
            direction: 'outbound',
            fromNumber: settings.phoneNumber,
            toNumber: contact.phone,
            content: personalizedMessage,
            twilioSid: result.sid,
            twilioStatus: result.status,
            segments: twilioService.calculateSegments(personalizedMessage)
          });

          // Update campaign contact status
          await Campaign.updateContactStatus(campaignId, contact.id, 'sent', new Date());

          // Update contact's last contacted
          await Contact.updateLastContacted(contact.id);
        } else {
          sendResults.failed++;

          // Update campaign contact status
          await Campaign.updateContactStatus(campaignId, contact.id, 'failed');
        }
      }

      // Update campaign stats and status
      await Campaign.updateStats(campaignId, {
        messagesSent: sendResults.sent,
        messagesFailed: sendResults.failed
      });

      await Campaign.update(campaignId, req.user.id, { status: 'sent' });

      // Update analytics
      await Analytics.updateDailyAnalytics(req.user.id, today, {
        messagesSent: sendResults.sent
      });

      res.json({
        message: 'Campaign sent successfully',
        results: sendResults
      });
    } catch (err) {
      console.error('Send campaign error:', err);
      res.status(500).json({ error: 'Failed to send campaign' });
    }
  },

  /**
   * POST /api/campaigns/:id/schedule
   * Schedule a campaign for later
   */
  async schedule(req, res) {
    try {
      const { scheduledAt } = req.body;

      if (!scheduledAt) {
        return res.status(400).json({ error: 'scheduledAt is required' });
      }

      const scheduleDate = new Date(scheduledAt);
      if (scheduleDate <= new Date()) {
        return res.status(400).json({ error: 'Scheduled time must be in the future' });
      }

      const campaign = await Campaign.update(req.params.id, req.user.id, {
        status: 'scheduled',
        scheduledAt: scheduleDate
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      res.json({
        message: 'Campaign scheduled successfully',
        campaign
      });
    } catch (err) {
      console.error('Schedule campaign error:', err);
      res.status(500).json({ error: 'Failed to schedule campaign' });
    }
  },

  /**
   * POST /api/campaigns/:id/cancel
   * Cancel a scheduled campaign
   */
  async cancel(req, res) {
    try {
      const campaign = await Campaign.findById(req.params.id, req.user.id);

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      if (campaign.status !== 'scheduled') {
        return res.status(400).json({ error: 'Only scheduled campaigns can be cancelled' });
      }

      const updatedCampaign = await Campaign.update(req.params.id, req.user.id, {
        status: 'cancelled'
      });

      res.json({
        message: 'Campaign cancelled successfully',
        campaign: updatedCampaign
      });
    } catch (err) {
      console.error('Cancel campaign error:', err);
      res.status(500).json({ error: 'Failed to cancel campaign' });
    }
  },

  /**
   * POST /api/campaigns/:id/duplicate
   * Duplicate a campaign
   */
  async duplicate(req, res) {
    try {
      const campaign = await Campaign.findById(req.params.id, req.user.id);

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      const newCampaign = await Campaign.create(req.user.id, {
        name: `${campaign.name} (Copy)`,
        message: campaign.message,
        campaignType: campaign.campaignType,
        status: 'draft'
      });

      res.status(201).json(newCampaign);
    } catch (err) {
      console.error('Duplicate campaign error:', err);
      res.status(500).json({ error: 'Failed to duplicate campaign' });
    }
  }
};

module.exports = campaignController;
