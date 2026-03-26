/**
 * Twilio SMS Service
 * Handles all Twilio API interactions for sending/receiving SMS
 */

const TwilioSettings = require('../models/TwilioSettings');

class TwilioService {
  constructor() {
    this.clients = new Map(); // Cache Twilio clients per user
  }

  /**
   * Get or create Twilio client for a user
   */
  async getClient(userId) {
    if (this.clients.has(userId)) {
      return this.clients.get(userId);
    }

    const settings = await TwilioSettings.findByUserId(userId);
    if (!settings) {
      throw new Error('Twilio settings not configured');
    }

    const twilio = require('twilio');
    const client = twilio(settings.accountSid, settings.authToken);

    this.clients.set(userId, {
      client,
      phoneNumber: settings.phoneNumber,
      messagingServiceSid: settings.messagingServiceSid
    });

    return this.clients.get(userId);
  }

  /**
   * Clear cached client (call after settings update)
   */
  clearClientCache(userId) {
    this.clients.delete(userId);
  }

  /**
   * Send a single SMS message
   */
  async sendSMS(userId, to, message, options = {}) {
    try {
      const { client, phoneNumber, messagingServiceSid } = await this.getClient(userId);

      const messageParams = {
        body: message,
        to: this.formatPhoneNumber(to),
        statusCallback: options.statusCallback
      };

      // Use messaging service if available, otherwise use phone number
      if (messagingServiceSid) {
        messageParams.messagingServiceSid = messagingServiceSid;
      } else {
        messageParams.from = phoneNumber;
      }

      const result = await client.messages.create(messageParams);

      return {
        success: true,
        sid: result.sid,
        status: result.status,
        to: result.to,
        from: result.from,
        dateCreated: result.dateCreated,
        price: result.price,
        priceUnit: result.priceUnit
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code,
        moreInfo: error.moreInfo
      };
    }
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSMS(userId, recipients, message, options = {}) {
    const results = {
      total: recipients.length,
      successful: 0,
      failed: 0,
      messages: []
    };

    // Process in batches to avoid rate limiting
    const batchSize = options.batchSize || 10;
    const delayBetweenBatches = options.delay || 1000;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const batchPromises = batch.map(async (recipient) => {
        const personalizedMessage = this.personalizeMessage(message, recipient);
        const result = await this.sendSMS(userId, recipient.phone, personalizedMessage, options);

        return {
          contactId: recipient.id,
          phone: recipient.phone,
          ...result
        };
      });

      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach(result => {
        results.messages.push(result);
        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
        }
      });

      // Delay between batches (except for the last batch)
      if (i + batchSize < recipients.length) {
        await this.delay(delayBetweenBatches);
      }
    }

    return results;
  }

  /**
   * Personalize message with contact data
   * Supports: {first_name}, {last_name}, {company}, {phone}
   */
  personalizeMessage(template, contact) {
    return template
      .replace(/{first_name}/gi, contact.firstName || '')
      .replace(/{last_name}/gi, contact.lastName || '')
      .replace(/{company}/gi, contact.company || '')
      .replace(/{phone}/gi, contact.phone || '')
      .replace(/{full_name}/gi, `${contact.firstName || ''} ${contact.lastName || ''}`.trim());
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phone) {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // If doesn't start with +, assume US number
    if (!cleaned.startsWith('+')) {
      // Remove leading 1 if present
      if (cleaned.startsWith('1') && cleaned.length === 11) {
        cleaned = '+' + cleaned;
      } else if (cleaned.length === 10) {
        cleaned = '+1' + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }

    return cleaned;
  }

  /**
   * Verify Twilio credentials
   */
  async verifyCredentials(accountSid, authToken) {
    try {
      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);

      // Try to fetch account info to verify credentials
      const account = await client.api.accounts(accountSid).fetch();

      return {
        valid: true,
        accountName: account.friendlyName,
        status: account.status
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Get message status from Twilio
   */
  async getMessageStatus(userId, messageSid) {
    try {
      const { client } = await this.getClient(userId);
      const message = await client.messages(messageSid).fetch();

      return {
        sid: message.sid,
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        price: message.price,
        priceUnit: message.priceUnit,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated
      };
    } catch (error) {
      throw new Error(`Failed to get message status: ${error.message}`);
    }
  }

  /**
   * Get available phone numbers
   */
  async getAvailableNumbers(accountSid, authToken, countryCode = 'US', options = {}) {
    try {
      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);

      const params = {
        smsEnabled: true,
        ...options
      };

      const numbers = await client.availablePhoneNumbers(countryCode)
        .local
        .list(params);

      return numbers.map(n => ({
        phoneNumber: n.phoneNumber,
        friendlyName: n.friendlyName,
        locality: n.locality,
        region: n.region,
        capabilities: n.capabilities
      }));
    } catch (error) {
      throw new Error(`Failed to get available numbers: ${error.message}`);
    }
  }

  /**
   * Check if a number is opted out
   */
  isOptOutKeyword(message) {
    const optOutKeywords = ['stop', 'unsubscribe', 'cancel', 'end', 'quit'];
    return optOutKeywords.includes(message.toLowerCase().trim());
  }

  /**
   * Check if a number is opting back in
   */
  isOptInKeyword(message) {
    const optInKeywords = ['start', 'unstop', 'subscribe', 'yes'];
    return optInKeywords.includes(message.toLowerCase().trim());
  }

  /**
   * Calculate message segments (SMS is 160 chars, with GSM-7 encoding)
   */
  calculateSegments(message) {
    const GSM_CHAR_LIMIT = 160;
    const UNICODE_CHAR_LIMIT = 70;

    // Check if message contains non-GSM characters
    const hasUnicode = /[^\x00-\x7F]/.test(message);
    const charLimit = hasUnicode ? UNICODE_CHAR_LIMIT : GSM_CHAR_LIMIT;

    if (message.length <= charLimit) {
      return 1;
    }

    // Multi-part messages have reduced character limits
    const multiPartLimit = hasUnicode ? 67 : 153;
    return Math.ceil(message.length / multiPartLimit);
  }

  /**
   * Helper delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
module.exports = new TwilioService();
