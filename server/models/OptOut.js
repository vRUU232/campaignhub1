/**
 * OptOut Model
 * Tracks contacts who opted out of receiving SMS
 */

const pool = require('../config/db');

const OptOut = {
  async findAllByUserId(userId, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT o.id, o.user_id, o.contact_id, o.phone, o.reason, o.message_id,
              o.opted_out_at, o.created_at,
              c.name, c.email
       FROM opt_outs o
       LEFT JOIN contacts c ON o.contact_id = c.id
       WHERE o.user_id = $1
       ORDER BY o.opted_out_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows.map(this.formatResponse);
  },

  async findByPhone(userId, phone) {
    const result = await pool.query(
      'SELECT * FROM opt_outs WHERE user_id = $1 AND phone = $2',
      [userId, phone]
    );
    if (result.rows.length === 0) return null;
    return this.formatResponse(result.rows[0]);
  },

  async isOptedOut(userId, phone) {
    const result = await pool.query(
      'SELECT id FROM opt_outs WHERE user_id = $1 AND phone = $2',
      [userId, phone]
    );
    return result.rows.length > 0;
  },

  async create({ userId, contactId, phone, reason, messageId }) {
    // First check if already opted out
    const existing = await this.isOptedOut(userId, phone);
    if (existing) {
      return { alreadyOptedOut: true };
    }

    const result = await pool.query(
      `INSERT INTO opt_outs (user_id, contact_id, phone, reason, message_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, contactId || null, phone, reason || 'user_request', messageId || null]
    );

    // Update contact status if contactId provided
    if (contactId) {
      await pool.query(
        "UPDATE contacts SET status = 'opted_out' WHERE id = $1",
        [contactId]
      );
    }

    return this.formatResponse(result.rows[0]);
  },

  async delete(userId, phone) {
    // Get contact info before deleting
    const optOut = await this.findByPhone(userId, phone);
    if (!optOut) return false;

    const result = await pool.query(
      'DELETE FROM opt_outs WHERE user_id = $1 AND phone = $2 RETURNING contact_id',
      [userId, phone]
    );

    // Update contact status back to active
    if (result.rows[0]?.contact_id) {
      await pool.query(
        "UPDATE contacts SET status = 'active' WHERE id = $1",
        [result.rows[0].contact_id]
      );
    }

    return result.rows.length > 0;
  },

  async countByUserId(userId) {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM opt_outs WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  },

  async getOptOutsByDateRange(userId, startDate, endDate) {
    const result = await pool.query(
      `SELECT DATE(opted_out_at) as date, COUNT(*) as count
       FROM opt_outs
       WHERE user_id = $1 AND opted_out_at >= $2 AND opted_out_at <= $3
       GROUP BY DATE(opted_out_at)
       ORDER BY date`,
      [userId, startDate, endDate]
    );
    return result.rows;
  },

  formatResponse(optOut) {
    return {
      id: optOut.id,
      userId: optOut.user_id,
      contactId: optOut.contact_id,
      phone: optOut.phone,
      reason: optOut.reason,
      messageId: optOut.message_id,
      optedOutAt: optOut.opted_out_at,
      createdAt: optOut.created_at,
      name: optOut.name,
      email: optOut.email
    };
  }
};

module.exports = OptOut;
