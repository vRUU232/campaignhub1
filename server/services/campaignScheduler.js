/**
 * Campaign Scheduler Service
 * Runs a cron job every minute to check for scheduled campaigns
 * and automatically sends them when their scheduled time arrives.
 */

const cron = require('node-cron');
const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');
const Message = require('../models/Message');
const OptOut = require('../models/OptOut');
const TwilioSettings = require('../models/TwilioSettings');
const Analytics = require('../models/Analytics');
const twilioService = require('./twilioService');

/**
 * Process a single scheduled campaign — sends SMS to all assigned contacts
 */
async function processScheduledCampaign(campaign) {
  const userId = campaign.userId;
  console.log(`[Scheduler] Sending campaign "${campaign.name}" (ID: ${campaign.id})`);

  try {
    // Verify Twilio settings exist for this user
    const settings = await TwilioSettings.findByUserId(userId);
    if (!settings || !settings.isVerified) {
      console.log(`[Scheduler] Skipping campaign ${campaign.id} — Twilio not configured for user ${userId}`);
      return;
    }

    // Get contacts assigned to this campaign
    const contacts = await Campaign.getContacts(campaign.id, userId);
    if (!contacts || contacts.length === 0) {
      console.log(`[Scheduler] Skipping campaign ${campaign.id} — no contacts assigned`);
      await Campaign.update(campaign.id, userId, { status: 'failed' });
      return;
    }

    // Filter out opted-out and inactive contacts
    const activeContacts = [];
    for (const contact of contacts) {
      const isOptedOut = await OptOut.isOptedOut(userId, contact.phone);
      if (!isOptedOut && contact.contactStatus === 'active') {
        activeContacts.push(contact);
      } else {
        await Campaign.updateContactStatus(campaign.id, contact.id, 'opted_out');
      }
    }

    if (activeContacts.length === 0) {
      console.log(`[Scheduler] Skipping campaign ${campaign.id} — all contacts opted out`);
      await Campaign.update(campaign.id, userId, { status: 'failed' });
      return;
    }

    // Mark campaign as sending
    await Campaign.update(campaign.id, userId, { status: 'sending' });

    // Send messages to each active contact
    const sendResults = { sent: 0, failed: 0 };
    const today = new Date().toISOString().split('T')[0];

    for (const contact of activeContacts) {
      const personalizedMessage = twilioService.personalizeMessage(campaign.message, contact);

      const result = await twilioService.sendSMS(userId, contact.phone, personalizedMessage, {
        statusCallback: `${process.env.BASE_URL || ''}/api/webhooks/sms/status`,
      });

      if (result.success) {
        sendResults.sent++;

        await Message.create({
          userId,
          contactId: contact.id,
          campaignId: campaign.id,
          direction: 'outbound',
          fromNumber: settings.phoneNumber,
          toNumber: contact.phone,
          content: personalizedMessage,
          twilioSid: result.sid,
          twilioStatus: result.status,
          segments: twilioService.calculateSegments(personalizedMessage),
        });

        await Campaign.updateContactStatus(campaign.id, contact.id, 'sent', new Date());
        await Contact.updateLastContacted(contact.id);
      } else {
        sendResults.failed++;
        await Campaign.updateContactStatus(campaign.id, contact.id, 'failed');
      }
    }

    // Finalize campaign stats and mark as sent
    await Campaign.updateStats(campaign.id, {
      messagesSent: sendResults.sent,
      messagesFailed: sendResults.failed,
    });

    await Campaign.update(campaign.id, userId, { status: 'sent' });

    await Analytics.updateDailyAnalytics(userId, today, {
      messagesSent: sendResults.sent,
    });

    console.log(`[Scheduler] Campaign "${campaign.name}" sent — ${sendResults.sent} delivered, ${sendResults.failed} failed`);
  } catch (error) {
    console.error(`[Scheduler] Failed to send campaign ${campaign.id}:`, error.message);
    // Mark campaign as failed so it doesn't retry indefinitely
    try {
      await Campaign.update(campaign.id, campaign.userId, { status: 'failed' });
    } catch {
      // Ignore update error
    }
  }
}

/**
 * Start the campaign scheduler — checks every minute for due campaigns
 */
function startScheduler() {
  console.log('[Scheduler] Campaign scheduler started — checking every minute');

  // Run every minute: check for campaigns whose scheduled_at time has passed
  cron.schedule('* * * * *', async () => {
    try {
      const dueCampaigns = await Campaign.getScheduledCampaigns();

      if (dueCampaigns.length > 0) {
        console.log(`[Scheduler] Found ${dueCampaigns.length} campaign(s) ready to send`);
      }

      // Process each due campaign sequentially to avoid overloading Twilio
      for (const campaign of dueCampaigns) {
        await processScheduledCampaign(campaign);
      }
    } catch (error) {
      console.error('[Scheduler] Error checking scheduled campaigns:', error.message);
    }
  });
}

module.exports = { startScheduler };
