/**
 * Settings Controller
 * Handles Twilio settings and user preferences
 */

const TwilioSettings = require('../models/TwilioSettings');
const twilioService = require('../services/twilioService');

const settingsController = {
  /**
   * Get Twilio settings for the current user
   */
  async getTwilioSettings(req, res) {
    try {
      const settings = await TwilioSettings.findByUserId(req.user.id);

      if (!settings) {
        return res.json({
          configured: false,
          settings: null
        });
      }

      // Return safe response (masked credentials)
      res.json({
        configured: true,
        settings: {
          id: settings.id,
          accountSid: settings.accountSid ? `${settings.accountSid.substring(0, 8)}...` : null,
          phoneNumber: settings.phoneNumber,
          messagingServiceSid: settings.messagingServiceSid,
          isVerified: settings.isVerified,
          monthlyLimit: settings.monthlyLimit,
          createdAt: settings.createdAt,
          updatedAt: settings.updatedAt
        }
      });
    } catch (error) {
      console.error('Get Twilio settings error:', error);
      res.status(500).json({ error: 'Failed to get Twilio settings' });
    }
  },

  /**
   * Save or update Twilio settings
   */
  async saveTwilioSettings(req, res) {
    try {
      const { accountSid, authToken, phoneNumber, messagingServiceSid } = req.body;

      // Validate required fields
      if (!accountSid || !authToken || !phoneNumber) {
        return res.status(400).json({
          error: 'Account SID, Auth Token, and Phone Number are required'
        });
      }

      // Verify credentials with Twilio
      const verification = await twilioService.verifyCredentials(accountSid, authToken);

      if (!verification.valid) {
        return res.status(400).json({
          error: 'Invalid Twilio credentials',
          details: verification.error
        });
      }

      // Save settings
      const settings = await TwilioSettings.upsert(req.user.id, {
        accountSid,
        authToken,
        phoneNumber,
        messagingServiceSid
      });

      // Mark as verified
      await TwilioSettings.setVerified(req.user.id, true);

      // Clear cached client
      twilioService.clearClientCache(req.user.id);

      res.json({
        message: 'Twilio settings saved successfully',
        settings: {
          id: settings.id,
          accountSid: `${accountSid.substring(0, 8)}...`,
          phoneNumber: settings.phoneNumber,
          messagingServiceSid: settings.messagingServiceSid,
          isVerified: true,
          accountName: verification.accountName
        }
      });
    } catch (error) {
      console.error('Save Twilio settings error:', error);
      res.status(500).json({ error: 'Failed to save Twilio settings' });
    }
  },

  /**
   * Test Twilio connection by sending a test SMS
   */
  async testTwilioConnection(req, res) {
    try {
      const { testPhoneNumber } = req.body;

      if (!testPhoneNumber) {
        return res.status(400).json({ error: 'Test phone number is required' });
      }

      const settings = await TwilioSettings.findByUserId(req.user.id);

      if (!settings) {
        return res.status(400).json({ error: 'Twilio settings not configured' });
      }

      const result = await twilioService.sendSMS(
        req.user.id,
        testPhoneNumber,
        'This is a test message from CampaignHub. Your Twilio integration is working!'
      );

      if (result.success) {
        res.json({
          success: true,
          message: 'Test message sent successfully',
          messageSid: result.sid
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }
    } catch (error) {
      console.error('Test Twilio connection error:', error);
      res.status(500).json({ error: 'Failed to send test message' });
    }
  },

  /**
   * Delete Twilio settings
   */
  async deleteTwilioSettings(req, res) {
    try {
      const deleted = await TwilioSettings.delete(req.user.id);

      if (!deleted) {
        return res.status(404).json({ error: 'Twilio settings not found' });
      }

      // Clear cached client
      twilioService.clearClientCache(req.user.id);

      res.json({ message: 'Twilio settings deleted successfully' });
    } catch (error) {
      console.error('Delete Twilio settings error:', error);
      res.status(500).json({ error: 'Failed to delete Twilio settings' });
    }
  },

  /**
   * Get available phone numbers from Twilio
   */
  async getAvailableNumbers(req, res) {
    try {
      const settings = await TwilioSettings.findByUserId(req.user.id);

      if (!settings) {
        return res.status(400).json({ error: 'Twilio settings not configured' });
      }

      const { countryCode = 'US', areaCode } = req.query;
      const options = areaCode ? { areaCode } : {};

      const numbers = await twilioService.getAvailableNumbers(
        settings.accountSid,
        settings.authToken,
        countryCode,
        options
      );

      res.json({ numbers });
    } catch (error) {
      console.error('Get available numbers error:', error);
      res.status(500).json({ error: 'Failed to get available numbers' });
    }
  }
};

module.exports = settingsController;
