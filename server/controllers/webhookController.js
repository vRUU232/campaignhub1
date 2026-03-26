/**
 * Webhook Controller
 * Handles incoming Twilio webhooks for message status updates and incoming SMS
 */

const Message = require('../models/Message');
const Contact = require('../models/Contact');
const OptOut = require('../models/OptOut');
const Campaign = require('../models/Campaign');
const Analytics = require('../models/Analytics');
const TwilioSettings = require('../models/TwilioSettings');
const twilioService = require('../services/twilioService');
const pool = require('../config/db');

const webhookController = {
  /**
   * Handle incoming SMS messages from Twilio
   */
  async handleIncomingSMS(req, res) {
    try {
      const {
        MessageSid,
        From,
        To,
        Body,
        NumSegments
      } = req.body;

      console.log(`Incoming SMS from ${From}: ${Body}`);

      // Find user by Twilio phone number
      const settingsResult = await pool.query(
        'SELECT user_id FROM twilio_settings WHERE phone_number = $1',
        [To]
      );

      if (settingsResult.rows.length === 0) {
        console.log('No user found for phone number:', To);
        return res.status(200).send('<Response></Response>');
      }

      const userId = settingsResult.rows[0].user_id;

      // Find or create contact
      let contact = await Contact.findByPhone(From, userId);

      // Check for opt-out keywords
      if (twilioService.isOptOutKeyword(Body)) {
        await OptOut.create({
          userId,
          contactId: contact?.id || null,
          phone: From,
          reason: 'stop_keyword'
        });

        // Update analytics
        const today = new Date().toISOString().split('T')[0];
        await Analytics.updateDailyAnalytics(userId, today, { optOuts: 1 });

        // Send confirmation response
        return res.status(200).send(`
          <Response>
            <Message>You have been unsubscribed and will no longer receive messages from us.</Message>
          </Response>
        `);
      }

      // Check for opt-in keywords
      if (twilioService.isOptInKeyword(Body)) {
        await OptOut.delete(userId, From);

        return res.status(200).send(`
          <Response>
            <Message>You have been resubscribed and will now receive messages from us.</Message>
          </Response>
        `);
      }

      // Save incoming message
      const message = await Message.create({
        userId,
        contactId: contact?.id || null,
        direction: 'inbound',
        fromNumber: From,
        toNumber: To,
        content: Body,
        twilioSid: MessageSid,
        twilioStatus: 'received',
        segments: parseInt(NumSegments) || 1
      });

      // Update analytics
      const today = new Date().toISOString().split('T')[0];
      await Analytics.updateDailyAnalytics(userId, today, { messagesReceived: 1 });

      // Check if this is a response to a campaign
      if (contact) {
        // Find any campaigns this contact is part of
        const campaignResult = await pool.query(
          `SELECT cc.campaign_id FROM campaign_contacts cc
           WHERE cc.contact_id = $1 AND cc.status = 'delivered'
           ORDER BY cc.sent_at DESC LIMIT 1`,
          [contact.id]
        );

        if (campaignResult.rows.length > 0) {
          const campaignId = campaignResult.rows[0].campaign_id;
          await Campaign.incrementStat(campaignId, 'responses_count', 1);
        }
      }

      // Return empty TwiML response
      res.status(200).send('<Response></Response>');
    } catch (error) {
      console.error('Incoming SMS webhook error:', error);
      res.status(500).send('<Response></Response>');
    }
  },

  /**
   * Handle message status updates from Twilio
   */
  async handleStatusCallback(req, res) {
    try {
      const {
        MessageSid,
        MessageStatus,
        ErrorCode,
        ErrorMessage
      } = req.body;

      console.log(`Status update for ${MessageSid}: ${MessageStatus}`);

      // Find the message
      const message = await Message.findByTwilioSid(MessageSid);

      if (!message) {
        console.log('Message not found for SID:', MessageSid);
        return res.status(200).send('OK');
      }

      // Update message status
      const updateData = {
        status: MessageStatus
      };

      if (MessageStatus === 'sent') {
        updateData.sentAt = new Date();
      } else if (MessageStatus === 'delivered') {
        updateData.deliveredAt = new Date();
      } else if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
        updateData.errorCode = ErrorCode;
        updateData.errorMessage = ErrorMessage;
      }

      await Message.updateStatus(MessageSid, updateData);

      // Update analytics
      const today = new Date().toISOString().split('T')[0];
      const analyticsUpdate = {};

      if (MessageStatus === 'delivered') {
        analyticsUpdate.messagesDelivered = 1;
      } else if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
        analyticsUpdate.messagesFailed = 1;
      }

      if (Object.keys(analyticsUpdate).length > 0) {
        await Analytics.updateDailyAnalytics(message.userId, today, analyticsUpdate);
      }

      // Update campaign contact status if this was a campaign message
      if (message.campaignId && message.contactId) {
        let campaignStatus = 'sent';
        if (MessageStatus === 'delivered') {
          campaignStatus = 'delivered';
        } else if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
          campaignStatus = 'failed';
        }

        await Campaign.updateContactStatus(
          message.campaignId,
          message.contactId,
          campaignStatus
        );

        // Update campaign stats
        if (MessageStatus === 'delivered') {
          await Campaign.incrementStat(message.campaignId, 'messages_delivered', 1);
        } else if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
          await Campaign.incrementStat(message.campaignId, 'messages_failed', 1);
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Status callback webhook error:', error);
      res.status(500).send('Error');
    }
  }
};

module.exports = webhookController;
