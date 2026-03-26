/**
 * TwilioSettings Model
 * Manages Twilio credentials and settings per user
 */

const pool = require('../config/db');

const TwilioSettings = {
  async findByUserId(userId) {
    const result = await pool.query(
      `SELECT id, user_id, account_sid, auth_token, phone_number,
              messaging_service_sid, is_verified, monthly_limit, created_at, updated_at
       FROM twilio_settings WHERE user_id = $1`,
      [userId]
    );
    if (result.rows.length === 0) return null;
    return this.formatResponse(result.rows[0]);
  },

  async create(userId, { accountSid, authToken, phoneNumber, messagingServiceSid }) {
    const result = await pool.query(
      `INSERT INTO twilio_settings (user_id, account_sid, auth_token, phone_number, messaging_service_sid)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, account_sid, auth_token, phone_number, messaging_service_sid,
                 is_verified, monthly_limit, created_at, updated_at`,
      [userId, accountSid, authToken, phoneNumber, messagingServiceSid || null]
    );
    return this.formatResponse(result.rows[0]);
  },

  async update(userId, { accountSid, authToken, phoneNumber, messagingServiceSid, isVerified, monthlyLimit }) {
    const result = await pool.query(
      `UPDATE twilio_settings
       SET account_sid = COALESCE($1, account_sid),
           auth_token = COALESCE($2, auth_token),
           phone_number = COALESCE($3, phone_number),
           messaging_service_sid = COALESCE($4, messaging_service_sid),
           is_verified = COALESCE($5, is_verified),
           monthly_limit = COALESCE($6, monthly_limit)
       WHERE user_id = $7
       RETURNING id, user_id, account_sid, auth_token, phone_number, messaging_service_sid,
                 is_verified, monthly_limit, created_at, updated_at`,
      [accountSid, authToken, phoneNumber, messagingServiceSid, isVerified, monthlyLimit, userId]
    );
    if (result.rows.length === 0) return null;
    return this.formatResponse(result.rows[0]);
  },

  async upsert(userId, { accountSid, authToken, phoneNumber, messagingServiceSid }) {
    const existing = await this.findByUserId(userId);
    if (existing) {
      return this.update(userId, { accountSid, authToken, phoneNumber, messagingServiceSid });
    }
    return this.create(userId, { accountSid, authToken, phoneNumber, messagingServiceSid });
  },

  async setVerified(userId, isVerified) {
    const result = await pool.query(
      `UPDATE twilio_settings SET is_verified = $1 WHERE user_id = $2
       RETURNING id, user_id, account_sid, phone_number, is_verified`,
      [isVerified, userId]
    );
    if (result.rows.length === 0) return null;
    return result.rows[0];
  },

  async delete(userId) {
    const result = await pool.query(
      'DELETE FROM twilio_settings WHERE user_id = $1 RETURNING id',
      [userId]
    );
    return result.rows.length > 0;
  },

  async getPhoneNumber(userId) {
    const result = await pool.query(
      'SELECT phone_number FROM twilio_settings WHERE user_id = $1',
      [userId]
    );
    return result.rows[0]?.phone_number || null;
  },

  formatResponse(settings) {
    return {
      id: settings.id,
      userId: settings.user_id,
      accountSid: settings.account_sid,
      authToken: settings.auth_token,
      phoneNumber: settings.phone_number,
      messagingServiceSid: settings.messaging_service_sid,
      isVerified: settings.is_verified,
      monthlyLimit: settings.monthly_limit,
      createdAt: settings.created_at,
      updatedAt: settings.updated_at
    };
  },

  // Return safe response (without sensitive data)
  formatSafeResponse(settings) {
    return {
      id: settings.id,
      userId: settings.user_id,
      accountSid: settings.account_sid ? `${settings.account_sid.substring(0, 8)}...` : null,
      phoneNumber: settings.phone_number,
      messagingServiceSid: settings.messaging_service_sid,
      isVerified: settings.is_verified,
      monthlyLimit: settings.monthly_limit,
      createdAt: settings.created_at,
      updatedAt: settings.updated_at
    };
  }
};

module.exports = TwilioSettings;
