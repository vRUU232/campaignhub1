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

      // Return settings — Account SID is not secret (Twilio shows it openly),
      // only Auth Token is omitted for security
      res.json({
        configured: true,
        settings: {
          id: settings.id,
          account_sid: settings.accountSid,
          phone_number: settings.phoneNumber,
          messaging_service_sid: settings.messagingServiceSid,
          is_verified: settings.isVerified,
          monthly_limit: settings.monthlyLimit,
          created_at: settings.createdAt,
          updated_at: settings.updatedAt
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
      // Support both camelCase and snake_case field names
      const accountSid = req.body.accountSid || req.body.account_sid;
      let authToken = req.body.authToken || req.body.auth_token;
      const phoneNumber = req.body.phoneNumber || req.body.phone_number;
      const messagingServiceSid = req.body.messagingServiceSid || req.body.messaging_service_sid;

      if (!accountSid || !phoneNumber) {
        return res.status(400).json({
          error: 'Account SID and Phone Number are required'
        });
      }

      // If auth token is empty, keep the existing one (user didn't change it)
      const existing = await TwilioSettings.findByUserId(req.user.id);
      if (!authToken && existing) {
        authToken = existing.authToken;
      } else if (!authToken && !existing) {
        return res.status(400).json({
          error: 'Auth Token is required for initial setup'
        });
      }

      // Verify credentials and phone number with Twilio
      const verification = await twilioService.verifyCredentials(accountSid, authToken, phoneNumber);

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
          isVerified: true
        }
      });
    } catch (error) {
      console.error('Save Twilio settings error:', error);
      res.status(500).json({ error: 'Failed to save Twilio settings' });
    }
  },

  /**
   * Test Twilio connection by verifying credentials against the Twilio API
   */
  async testTwilioConnection(req, res) {
    try {
      // Use credentials from the form (what user typed), fall back to DB for unchanged fields
      const accountSid = req.body.account_sid || req.body.accountSid;
      let authToken = req.body.auth_token || req.body.authToken;
      const phoneNumber = req.body.phone_number || req.body.phoneNumber;

      const existing = await TwilioSettings.findByUserId(req.user.id);

      // If no account SID provided in body, use saved settings
      if (!accountSid && !existing) {
        return res.status(400).json({ error: 'Twilio settings not configured. Please enter your credentials.' });
      }

      const sid = accountSid || existing.accountSid;
      const phone = phoneNumber || (existing && existing.phoneNumber);

      // If auth token is empty, use existing from DB
      if (!authToken && existing) {
        authToken = existing.authToken;
      }

      if (!sid || !authToken) {
        return res.status(400).json({ error: 'Account SID and Auth Token are required' });
      }

      // Verify credentials AND phone number ownership
      const verification = await twilioService.verifyCredentials(sid, authToken, phone);

      if (!verification.valid) {
        return res.status(400).json({ success: false, error: verification.error });
      }

      res.json({
        success: true,
        message: 'Twilio credentials are valid',
      });
    } catch (error) {
      console.error('Test Twilio connection error:', error);
      res.status(500).json({ error: 'Failed to verify Twilio credentials' });
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
