/**
 * User Model
 * Handles user account operations
 */

const pool = require('../config/db');

const User = {
  async create({ email, password_hash, name, phone, company_name, timezone }) {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, phone, company_name, timezone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, phone, company_name, timezone,
                 is_active, email_verified, created_at`,
      [email, password_hash, name, phone || null, company_name || null, timezone || 'UTC']
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT id, email, name, phone, company_name, timezone,
              is_active, email_verified, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async existsByEmail(email) {
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    return result.rows.length > 0;
  },

  async update(id, { name, email, phone, company_name, timezone }) {
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           company_name = COALESCE($4, company_name),
           timezone = COALESCE($5, timezone),
           updated_at = NOW()
       WHERE id = $6
       RETURNING id, email, name, phone, company_name, timezone,
                 is_active, email_verified, created_at, updated_at`,
      [name, email, phone, company_name, timezone, id]
    );
    return result.rows[0] || null;
  },

  async updatePassword(id, passwordHash) {
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [passwordHash, id]
    );
    return result.rows.length > 0;
  },

  async setEmailVerified(id, verified = true) {
    const result = await pool.query(
      'UPDATE users SET email_verified = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [verified, id]
    );
    return result.rows.length > 0;
  },

  async setActive(id, isActive) {
    const result = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [isActive, id]
    );
    return result.rows.length > 0;
  }
};

module.exports = User;
