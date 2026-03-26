/**
 * Contact Model
 * Handles contact management operations
 */

const pool = require('../config/db');

const Contact = {
  async findAllByUserId(userId, options = {}) {
    const { limit = 100, offset = 0, status, search, groupId } = options;

    let query = `
      SELECT DISTINCT c.id, c.name, c.email, c.phone, c.company, c.notes,
             c.status, c.source, c.custom_fields, c.last_contacted_at,
             c.created_at, c.updated_at
      FROM contacts c
    `;
    const params = [userId];
    let paramIndex = 2;

    if (groupId) {
      query += ` JOIN contact_group_members gm ON c.id = gm.contact_id AND gm.group_id = $${paramIndex}`;
      params.push(groupId);
      paramIndex++;
    }

    query += ` WHERE c.user_id = $1`;

    if (status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (c.name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex}
                 OR c.phone ILIKE $${paramIndex} OR c.company ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  },

  async findById(id, userId) {
    const result = await pool.query(
      `SELECT id, name, email, phone, company, notes, status, source,
              custom_fields, last_contacted_at, created_at, updated_at
       FROM contacts WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return result.rows[0] || null;
  },

  async findByPhone(phone, userId) {
    const result = await pool.query(
      `SELECT id, name, email, phone, status
       FROM contacts WHERE phone = $1 AND user_id = $2`,
      [phone, userId]
    );
    return result.rows[0] || null;
  },

  async create(userId, { name, email, phone, company, notes, source, custom_fields }) {
    const result = await pool.query(
      `INSERT INTO contacts (user_id, name, email, phone, company, notes, source, custom_fields)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, phone, company, notes, status, source,
                 custom_fields, last_contacted_at, created_at, updated_at`,
      [userId, name, email || null, phone, company || null, notes || null,
       source || 'manual', custom_fields || {}]
    );
    return result.rows[0];
  },

  async bulkCreate(userId, contacts) {
    const results = [];
    for (const contact of contacts) {
      try {
        const result = await this.create(userId, contact);
        results.push({ success: true, contact: result });
      } catch (error) {
        results.push({ success: false, error: error.message, data: contact });
      }
    }
    return results;
  },

  async update(id, userId, { name, email, phone, company, notes, status }) {
    const checkResult = await pool.query(
      'SELECT id FROM contacts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (checkResult.rows.length === 0) return null;

    const result = await pool.query(
      `UPDATE contacts
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           company = COALESCE($4, company),
           notes = COALESCE($5, notes),
           status = COALESCE($6, status),
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING id, name, email, phone, company, notes, status, source,
                 custom_fields, last_contacted_at, created_at, updated_at`,
      [name, email, phone, company, notes, status, id, userId]
    );
    return result.rows[0];
  },

  async updateLastContacted(id) {
    await pool.query(
      'UPDATE contacts SET last_contacted_at = NOW() WHERE id = $1',
      [id]
    );
  },

  async setStatus(id, userId, status) {
    const result = await pool.query(
      'UPDATE contacts SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING id',
      [status, id, userId]
    );
    return result.rows.length > 0;
  },

  async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rows.length > 0;
  },

  async bulkDelete(ids, userId) {
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = ANY($1) AND user_id = $2 RETURNING id',
      [ids, userId]
    );
    return result.rows.length;
  },

  async verifyOwnership(contactIds, userId) {
    const result = await pool.query(
      'SELECT id FROM contacts WHERE id = ANY($1) AND user_id = $2',
      [contactIds, userId]
    );
    return result.rows.length === contactIds.length;
  },

  async countByUserId(userId, status = null) {
    let query = 'SELECT COUNT(*) as count FROM contacts WHERE user_id = $1';
    const params = [userId];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  },

  async getActiveContacts(userId, limit = 1000) {
    const result = await pool.query(
      `SELECT id, name, phone, email, company
       FROM contacts
       WHERE user_id = $1 AND status = 'active'
       ORDER BY name
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  async getCampaigns(contactId, userId) {
    const result = await pool.query(
      `SELECT c.id, c.name, c.status, cc.added_at, cc.sent_at
       FROM campaigns c
       JOIN campaign_contacts cc ON c.id = cc.campaign_id
       WHERE cc.contact_id = $1 AND c.user_id = $2
       ORDER BY cc.added_at DESC`,
      [contactId, userId]
    );
    return result.rows;
  }
};

module.exports = Contact;
