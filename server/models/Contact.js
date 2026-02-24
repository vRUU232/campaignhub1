const pool = require('../config/db');

const Contact = {
  async findAllByUserId(userId) {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone, company, notes, created_at, updated_at
       FROM contacts WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows.map(this.formatResponse);
  },

  async findById(id, userId) {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone, company, notes, created_at, updated_at
       FROM contacts WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (result.rows.length === 0) return null;
    return this.formatResponse(result.rows[0]);
  },

  async create(userId, { firstName, lastName, email, phone, company, notes }) {
    const result = await pool.query(
      `INSERT INTO contacts (user_id, first_name, last_name, email, phone, company, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, first_name, last_name, email, phone, company, notes, created_at, updated_at`,
      [userId, firstName, lastName, email, phone || null, company || null, notes || null]
    );
    return this.formatResponse(result.rows[0]);
  },

  async update(id, userId, { firstName, lastName, email, phone, company, notes }) {
    const checkResult = await pool.query(
      'SELECT id FROM contacts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (checkResult.rows.length === 0) return null;

    const result = await pool.query(
      `UPDATE contacts
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           company = COALESCE($5, company),
           notes = COALESCE($6, notes),
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING id, first_name, last_name, email, phone, company, notes, created_at, updated_at`,
      [firstName, lastName, email, phone, company, notes, id, userId]
    );
    return this.formatResponse(result.rows[0]);
  },

  async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rows.length > 0;
  },

  async verifyOwnership(contactIds, userId) {
    const result = await pool.query(
      'SELECT id FROM contacts WHERE id = ANY($1) AND user_id = $2',
      [contactIds, userId]
    );
    return result.rows.length === contactIds.length;
  },

  formatResponse(contact) {
    return {
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      notes: contact.notes,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at
    };
  }
};

module.exports = Contact;
