const pool = require('../config/db');

const Campaign = {
  async findAllByUserId(userId) {
    const result = await pool.query(
      `SELECT id, name, subject, message, status, scheduled_at, sent_at, created_at, updated_at
       FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows.map(this.formatResponse);
  },

  async findById(id, userId) {
    const result = await pool.query(
      `SELECT id, name, subject, message, status, scheduled_at, sent_at, created_at, updated_at
       FROM campaigns WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (result.rows.length === 0) return null;
    return this.formatResponse(result.rows[0]);
  },

  async findByIdWithContacts(id, userId) {
    const campaignResult = await pool.query(
      `SELECT id, name, subject, message, status, scheduled_at, sent_at, created_at, updated_at
       FROM campaigns WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (campaignResult.rows.length === 0) return null;

    const contactsResult = await pool.query(
      `SELECT c.id, c.first_name, c.last_name, c.email, cc.added_at
       FROM contacts c
       JOIN campaign_contacts cc ON c.id = cc.contact_id
       WHERE cc.campaign_id = $1`,
      [id]
    );

    const campaign = this.formatResponse(campaignResult.rows[0]);
    campaign.contacts = contactsResult.rows.map(contact => ({
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      addedAt: contact.added_at
    }));
    return campaign;
  },

  async create(userId, { name, subject, message, status, scheduledAt }) {
    const result = await pool.query(
      `INSERT INTO campaigns (user_id, name, subject, message, status, scheduled_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, subject, message, status, scheduled_at, sent_at, created_at, updated_at`,
      [userId, name, subject, message, status || 'draft', scheduledAt || null]
    );
    return this.formatResponse(result.rows[0]);
  },

  async update(id, userId, { name, subject, message, status, scheduledAt }) {
    const checkResult = await pool.query(
      'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (checkResult.rows.length === 0) return null;

    let sentAt = null;
    if (status === 'sent') {
      sentAt = new Date();
    }

    const result = await pool.query(
      `UPDATE campaigns
       SET name = COALESCE($1, name),
           subject = COALESCE($2, subject),
           message = COALESCE($3, message),
           status = COALESCE($4, status),
           scheduled_at = COALESCE($5, scheduled_at),
           sent_at = COALESCE($6, sent_at),
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING id, name, subject, message, status, scheduled_at, sent_at, created_at, updated_at`,
      [name, subject, message, status, scheduledAt, sentAt, id, userId]
    );
    return this.formatResponse(result.rows[0]);
  },

  async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rows.length > 0;
  },

  async getContacts(campaignId, userId) {
    const campaignCheck = await pool.query(
      'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
      [campaignId, userId]
    );
    if (campaignCheck.rows.length === 0) return null;

    const result = await pool.query(
      `SELECT c.id, c.first_name, c.last_name, c.email, c.phone, c.company, cc.added_at
       FROM contacts c
       JOIN campaign_contacts cc ON c.id = cc.contact_id
       WHERE cc.campaign_id = $1 ORDER BY cc.added_at DESC`,
      [campaignId]
    );

    return result.rows.map(contact => ({
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      addedAt: contact.added_at
    }));
  },

  async addContacts(campaignId, contactIds) {
    const values = contactIds.map(contactId => `(${campaignId}, ${contactId})`).join(',');
    await pool.query(
      `INSERT INTO campaign_contacts (campaign_id, contact_id)
       VALUES ${values}
       ON CONFLICT (campaign_id, contact_id) DO NOTHING`
    );
  },

  async removeContact(campaignId, contactId) {
    const result = await pool.query(
      'DELETE FROM campaign_contacts WHERE campaign_id = $1 AND contact_id = $2 RETURNING id',
      [campaignId, contactId]
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

  formatResponse(campaign) {
    return {
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      message: campaign.message,
      status: campaign.status,
      scheduledAt: campaign.scheduled_at,
      sentAt: campaign.sent_at,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at
    };
  }
};

module.exports = Campaign;
