/**
 * Message Model
 * Handles SMS message storage and retrieval
 */

const pool = require('../config/db');

const Message = {
  async findAllByUserId(userId, options = {}) {
    const { limit = 50, offset = 0, direction, contactId } = options;

    let query = `
      SELECT m.id, m.user_id, m.contact_id, m.campaign_id, m.direction,
             m.from_number, m.to_number, m.content, m.twilio_sid, m.twilio_status,
             m.error_code, m.error_message, m.segments, m.price, m.price_unit,
             m.queued_at, m.sent_at, m.delivered_at, m.created_at,
             c.name as contact_name
      FROM messages m
      LEFT JOIN contacts c ON m.contact_id = c.id
      WHERE m.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (direction) {
      query += ` AND m.direction = $${paramIndex}`;
      params.push(direction);
      paramIndex++;
    }

    if (contactId) {
      query += ` AND m.contact_id = $${paramIndex}`;
      params.push(contactId);
      paramIndex++;
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows.map(this.formatResponse);
  },

  async findById(id, userId) {
    const result = await pool.query(
      `SELECT m.*, c.name as contact_name
       FROM messages m
       LEFT JOIN contacts c ON m.contact_id = c.id
       WHERE m.id = $1 AND m.user_id = $2`,
      [id, userId]
    );
    if (result.rows.length === 0) return null;
    return this.formatResponse(result.rows[0]);
  },

  async findByTwilioSid(twilioSid) {
    const result = await pool.query(
      'SELECT * FROM messages WHERE twilio_sid = $1',
      [twilioSid]
    );
    if (result.rows.length === 0) return null;
    return this.formatResponse(result.rows[0]);
  },

  async create({ userId, contactId, campaignId, direction, fromNumber, toNumber, content, twilioSid, twilioStatus, segments }) {
    const result = await pool.query(
      `INSERT INTO messages (user_id, contact_id, campaign_id, direction, from_number, to_number,
                            content, twilio_sid, twilio_status, segments)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, contactId || null, campaignId || null, direction, fromNumber, toNumber,
       content, twilioSid || null, twilioStatus || 'queued', segments || 1]
    );
    return this.formatResponse(result.rows[0]);
  },

  async updateStatus(twilioSid, { status, errorCode, errorMessage, price, priceUnit, sentAt, deliveredAt }) {
    const result = await pool.query(
      `UPDATE messages
       SET twilio_status = COALESCE($1, twilio_status),
           error_code = COALESCE($2, error_code),
           error_message = COALESCE($3, error_message),
           price = COALESCE($4, price),
           price_unit = COALESCE($5, price_unit),
           sent_at = COALESCE($6, sent_at),
           delivered_at = COALESCE($7, delivered_at)
       WHERE twilio_sid = $8
       RETURNING *`,
      [status, errorCode, errorMessage, price, priceUnit, sentAt, deliveredAt, twilioSid]
    );
    if (result.rows.length === 0) return null;
    return this.formatResponse(result.rows[0]);
  },

  async getConversations(userId, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT DISTINCT ON (m.contact_id)
              m.contact_id, m.content as last_message, m.direction as last_direction,
              m.created_at as last_message_at, m.twilio_status,
              c.name, c.phone
       FROM messages m
       JOIN contacts c ON m.contact_id = c.id
       WHERE m.user_id = $1 AND m.contact_id IS NOT NULL
       ORDER BY m.contact_id, m.created_at DESC`,
      [userId]
    );

    // Get unread counts
    const conversationsWithUnread = await Promise.all(
      result.rows.map(async (conv) => {
        const unreadResult = await pool.query(
          `SELECT COUNT(*) as unread_count
           FROM messages
           WHERE user_id = $1 AND contact_id = $2 AND direction = 'inbound' AND read_at IS NULL`,
          [userId, conv.contact_id]
        );
        return {
          ...this.formatConversation(conv),
          unreadCount: parseInt(unreadResult.rows[0].unread_count)
        };
      })
    );

    return conversationsWithUnread;
  },

  async getConversation(userId, contactId, limit = 100, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM messages
       WHERE user_id = $1 AND contact_id = $2
       ORDER BY created_at ASC
       LIMIT $3 OFFSET $4`,
      [userId, contactId, limit, offset]
    );
    return result.rows.map(this.formatResponse);
  },

  async markAsRead(userId, contactId) {
    await pool.query(
      `UPDATE messages
       SET read_at = NOW()
       WHERE user_id = $1 AND contact_id = $2 AND direction = 'inbound' AND read_at IS NULL`,
      [userId, contactId]
    );
  },

  async countByUserId(userId, options = {}) {
    const { direction, status, startDate, endDate } = options;

    let query = 'SELECT COUNT(*) as count FROM messages WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (direction) {
      query += ` AND direction = $${paramIndex}`;
      params.push(direction);
      paramIndex++;
    }

    if (status) {
      query += ` AND twilio_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  },

  async getStatsByUserId(userId, startDate, endDate) {
    const result = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE direction = 'outbound') as sent,
         COUNT(*) FILTER (WHERE direction = 'outbound' AND twilio_status = 'delivered') as delivered,
         COUNT(*) FILTER (WHERE direction = 'outbound' AND twilio_status = 'failed') as failed,
         COUNT(*) FILTER (WHERE direction = 'inbound') as received,
         SUM(CASE WHEN price IS NOT NULL THEN price ELSE 0 END) as total_cost
       FROM messages
       WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3`,
      [userId, startDate, endDate]
    );
    return result.rows[0];
  },

  formatResponse(message) {
    return {
      id: message.id,
      userId: message.user_id,
      contactId: message.contact_id,
      campaignId: message.campaign_id,
      direction: message.direction,
      fromNumber: message.from_number,
      toNumber: message.to_number,
      content: message.content,
      body: message.content, // Alias for frontend compatibility
      twilioSid: message.twilio_sid,
      twilioStatus: message.twilio_status,
      errorCode: message.error_code,
      errorMessage: message.error_message,
      segments: message.segments,
      price: message.price,
      priceUnit: message.price_unit,
      queuedAt: message.queued_at,
      sentAt: message.sent_at,
      deliveredAt: message.delivered_at,
      readAt: message.read_at,
      createdAt: message.created_at,
      created_at: message.created_at, // Alias for frontend compatibility
      contactName: message.contact_name,
      contact_name: message.contact_name, // Alias for frontend compatibility
      to_number: message.to_number // Alias for frontend compatibility
    };
  },

  formatConversation(conv) {
    return {
      contactId: conv.contact_id,
      name: conv.name,
      phone: conv.phone,
      lastMessage: conv.last_message,
      lastDirection: conv.last_direction,
      lastMessageAt: conv.last_message_at,
      lastStatus: conv.twilio_status
    };
  }
};

module.exports = Message;
