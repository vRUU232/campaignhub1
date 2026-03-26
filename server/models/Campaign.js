/**
 * Campaign Model
 * Handles SMS campaign operations
 */

const pool = require('../config/db');

const Campaign = {
  async findAllByUserId(userId, options = {}) {
    const { limit = 50, offset = 0, status } = options;

    let query = `
      SELECT id, name, message, status, campaign_type, scheduled_at, started_at, completed_at,
             total_recipients, messages_sent, messages_delivered, messages_failed,
             responses_count, opt_outs_count, created_at, updated_at
      FROM campaigns WHERE user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows.map(this.formatResponse);
  },

  async findById(id, userId) {
    const result = await pool.query(
      `SELECT id, name, message, status, campaign_type, scheduled_at, started_at, completed_at,
              total_recipients, messages_sent, messages_delivered, messages_failed,
              responses_count, opt_outs_count, created_at, updated_at
       FROM campaigns WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (result.rows.length === 0) return null;
    return this.formatResponse(result.rows[0]);
  },

  async findByIdWithContacts(id, userId) {
    const campaignResult = await pool.query(
      `SELECT id, name, message, status, campaign_type, scheduled_at, started_at, completed_at,
              total_recipients, messages_sent, messages_delivered, messages_failed,
              responses_count, opt_outs_count, created_at, updated_at
       FROM campaigns WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (campaignResult.rows.length === 0) return null;

    const contactsResult = await pool.query(
      `SELECT c.id, c.name, c.phone, c.email, c.status as contact_status,
              cc.status as campaign_status, cc.added_at, cc.sent_at
       FROM contacts c
       JOIN campaign_contacts cc ON c.id = cc.contact_id
       WHERE cc.campaign_id = $1
       ORDER BY cc.added_at DESC`,
      [id]
    );

    const campaign = this.formatResponse(campaignResult.rows[0]);
    campaign.contacts = contactsResult.rows.map(contact => ({
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      contactStatus: contact.contact_status,
      campaignStatus: contact.campaign_status,
      addedAt: contact.added_at,
      sentAt: contact.sent_at
    }));
    return campaign;
  },

  async create(userId, { name, message, status, campaignType, scheduledAt }) {
    const result = await pool.query(
      `INSERT INTO campaigns (user_id, name, message, status, campaign_type, scheduled_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, message, status, campaign_type, scheduled_at, started_at, completed_at,
                 total_recipients, messages_sent, messages_delivered, messages_failed,
                 responses_count, opt_outs_count, created_at, updated_at`,
      [userId, name, message, status || 'draft', campaignType || 'broadcast', scheduledAt || null]
    );
    return this.formatResponse(result.rows[0]);
  },

  async update(id, userId, { name, message, status, campaignType, scheduledAt }) {
    const checkResult = await pool.query(
      'SELECT id, status FROM campaigns WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (checkResult.rows.length === 0) return null;

    // Set timestamps based on status changes
    let startedAt = null;
    let completedAt = null;
    if (status === 'sending' && checkResult.rows[0].status !== 'sending') {
      startedAt = new Date();
    }
    if (status === 'sent' && checkResult.rows[0].status !== 'sent') {
      completedAt = new Date();
    }

    const result = await pool.query(
      `UPDATE campaigns
       SET name = COALESCE($1, name),
           message = COALESCE($2, message),
           status = COALESCE($3, status),
           campaign_type = COALESCE($4, campaign_type),
           scheduled_at = COALESCE($5, scheduled_at),
           started_at = COALESCE($6, started_at),
           completed_at = COALESCE($7, completed_at)
       WHERE id = $8 AND user_id = $9
       RETURNING id, name, message, status, campaign_type, scheduled_at, started_at, completed_at,
                 total_recipients, messages_sent, messages_delivered, messages_failed,
                 responses_count, opt_outs_count, created_at, updated_at`,
      [name, message, status, campaignType, scheduledAt, startedAt, completedAt, id, userId]
    );
    return this.formatResponse(result.rows[0]);
  },

  async updateStats(id, stats) {
    const result = await pool.query(
      `UPDATE campaigns
       SET total_recipients = COALESCE($1, total_recipients),
           messages_sent = COALESCE($2, messages_sent),
           messages_delivered = COALESCE($3, messages_delivered),
           messages_failed = COALESCE($4, messages_failed),
           responses_count = COALESCE($5, responses_count),
           opt_outs_count = COALESCE($6, opt_outs_count)
       WHERE id = $7
       RETURNING id`,
      [stats.totalRecipients, stats.messagesSent, stats.messagesDelivered,
       stats.messagesFailed, stats.responsesCount, stats.optOutsCount, id]
    );
    return result.rows.length > 0;
  },

  async incrementStat(id, field, amount = 1) {
    const validFields = ['messages_sent', 'messages_delivered', 'messages_failed', 'responses_count', 'opt_outs_count'];
    if (!validFields.includes(field)) {
      throw new Error('Invalid stat field');
    }

    await pool.query(
      `UPDATE campaigns SET ${field} = ${field} + $1 WHERE id = $2`,
      [amount, id]
    );
  },

  async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rows.length > 0;
  },

  async getContacts(campaignId, userId, options = {}) {
    const { limit = 100, offset = 0, status } = options;

    const campaignCheck = await pool.query(
      'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
      [campaignId, userId]
    );
    if (campaignCheck.rows.length === 0) return null;

    let query = `
      SELECT c.id, c.name, c.email, c.phone, c.company, c.status as contact_status,
             cc.status as campaign_status, cc.added_at, cc.sent_at
      FROM contacts c
      JOIN campaign_contacts cc ON c.id = cc.contact_id
      WHERE cc.campaign_id = $1
    `;
    const params = [campaignId];
    let paramIndex = 2;

    if (status) {
      query += ` AND cc.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY cc.added_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return result.rows.map(contact => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      contactStatus: contact.contact_status,
      campaignStatus: contact.campaign_status,
      addedAt: contact.added_at,
      sentAt: contact.sent_at
    }));
  },

  async addContacts(campaignId, userId, contactIds) {
    // Verify campaign ownership
    const campaignCheck = await pool.query(
      'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
      [campaignId, userId]
    );
    if (campaignCheck.rows.length === 0) return null;

    // Verify contact ownership and get only active contacts
    const contactCheck = await pool.query(
      "SELECT id FROM contacts WHERE id = ANY($1) AND user_id = $2 AND status = 'active'",
      [contactIds, userId]
    );
    const validContactIds = contactCheck.rows.map(c => c.id);

    if (validContactIds.length === 0) return { added: 0 };

    // Use parameterized query to prevent SQL injection
    const values = validContactIds.map((_, i) => `($1, $${i + 2})`).join(',');
    const params = [campaignId, ...validContactIds];

    const result = await pool.query(
      `INSERT INTO campaign_contacts (campaign_id, contact_id)
       VALUES ${values}
       ON CONFLICT (campaign_id, contact_id) DO NOTHING
       RETURNING id`,
      params
    );

    // Update total recipients count
    await pool.query(
      `UPDATE campaigns
       SET total_recipients = (SELECT COUNT(*) FROM campaign_contacts WHERE campaign_id = $1)
       WHERE id = $1`,
      [campaignId]
    );

    return { added: result.rows.length };
  },

  async removeContact(campaignId, userId, contactId) {
    // Verify campaign ownership
    const campaignCheck = await pool.query(
      'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
      [campaignId, userId]
    );
    if (campaignCheck.rows.length === 0) return null;

    const result = await pool.query(
      'DELETE FROM campaign_contacts WHERE campaign_id = $1 AND contact_id = $2 RETURNING id',
      [campaignId, contactId]
    );

    // Update total recipients count
    await pool.query(
      `UPDATE campaigns
       SET total_recipients = (SELECT COUNT(*) FROM campaign_contacts WHERE campaign_id = $1)
       WHERE id = $1`,
      [campaignId]
    );

    return result.rows.length > 0;
  },

  async updateContactStatus(campaignId, contactId, status, sentAt = null) {
    const result = await pool.query(
      `UPDATE campaign_contacts
       SET status = $1, sent_at = COALESCE($2, sent_at)
       WHERE campaign_id = $3 AND contact_id = $4
       RETURNING id`,
      [status, sentAt, campaignId, contactId]
    );
    return result.rows.length > 0;
  },

  async verifyOwnership(campaignId, userId) {
    const result = await pool.query(
      'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
      [campaignId, userId]
    );
    return result.rows.length > 0;
  },

  async countByUserId(userId, status = null) {
    let query = 'SELECT COUNT(*) as count FROM campaigns WHERE user_id = $1';
    const params = [userId];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  },

  async getScheduledCampaigns() {
    const result = await pool.query(
      `SELECT c.*, u.email as user_email
       FROM campaigns c
       JOIN users u ON c.user_id = u.id
       WHERE c.status = 'scheduled' AND c.scheduled_at <= NOW()
       ORDER BY c.scheduled_at ASC`
    );
    return result.rows.map(this.formatResponse);
  },

  formatResponse(campaign) {
    return {
      id: campaign.id,
      name: campaign.name,
      message: campaign.message,
      status: campaign.status,
      campaignType: campaign.campaign_type,
      scheduledAt: campaign.scheduled_at,
      startedAt: campaign.started_at,
      completedAt: campaign.completed_at,
      totalRecipients: campaign.total_recipients,
      messagesSent: campaign.messages_sent,
      messagesDelivered: campaign.messages_delivered,
      messagesFailed: campaign.messages_failed,
      responsesCount: campaign.responses_count,
      optOutsCount: campaign.opt_outs_count,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at
    };
  }
};

module.exports = Campaign;
