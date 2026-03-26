/**
 * ContactGroup Model
 * Manages contact groups/lists for organizing contacts
 */

const pool = require('../config/db');

const ContactGroup = {
  async findAllByUserId(userId) {
    const result = await pool.query(
      `SELECT g.id, g.user_id, g.name, g.description, g.color, g.created_at, g.updated_at,
              COUNT(gm.contact_id) as contact_count
       FROM contact_groups g
       LEFT JOIN contact_group_members gm ON g.id = gm.group_id
       WHERE g.user_id = $1
       GROUP BY g.id
       ORDER BY g.name ASC`,
      [userId]
    );
    return result.rows.map(this.formatResponse);
  },

  async findById(id, userId) {
    const result = await pool.query(
      `SELECT g.id, g.user_id, g.name, g.description, g.color, g.created_at, g.updated_at,
              COUNT(gm.contact_id) as contact_count
       FROM contact_groups g
       LEFT JOIN contact_group_members gm ON g.id = gm.group_id
       WHERE g.id = $1 AND g.user_id = $2
       GROUP BY g.id`,
      [id, userId]
    );
    if (result.rows.length === 0) return null;
    return this.formatResponse(result.rows[0]);
  },

  async create(userId, { name, description, color }) {
    const result = await pool.query(
      `INSERT INTO contact_groups (user_id, name, description, color)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, name, description, color, created_at, updated_at`,
      [userId, name, description || null, color || '#4F46E5']
    );
    return { ...this.formatResponse(result.rows[0]), contactCount: 0 };
  },

  async update(id, userId, { name, description, color }) {
    const checkResult = await pool.query(
      'SELECT id FROM contact_groups WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (checkResult.rows.length === 0) return null;

    const result = await pool.query(
      `UPDATE contact_groups
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           color = COALESCE($3, color)
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, name, description, color, created_at, updated_at`,
      [name, description, color, id, userId]
    );
    return this.formatResponse(result.rows[0]);
  },

  async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM contact_groups WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rows.length > 0;
  },

  async getContacts(groupId, userId, limit = 100, offset = 0) {
    // Verify group ownership
    const groupCheck = await pool.query(
      'SELECT id FROM contact_groups WHERE id = $1 AND user_id = $2',
      [groupId, userId]
    );
    if (groupCheck.rows.length === 0) return null;

    const result = await pool.query(
      `SELECT c.id, c.name, c.email, c.phone, c.company, c.status, gm.added_at
       FROM contacts c
       JOIN contact_group_members gm ON c.id = gm.contact_id
       WHERE gm.group_id = $1
       ORDER BY c.name
       LIMIT $2 OFFSET $3`,
      [groupId, limit, offset]
    );

    return result.rows.map(contact => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      status: contact.status,
      addedAt: contact.added_at
    }));
  },

  async addContacts(groupId, userId, contactIds) {
    // Verify group ownership
    const groupCheck = await pool.query(
      'SELECT id FROM contact_groups WHERE id = $1 AND user_id = $2',
      [groupId, userId]
    );
    if (groupCheck.rows.length === 0) return null;

    // Verify contact ownership
    const contactCheck = await pool.query(
      'SELECT id FROM contacts WHERE id = ANY($1) AND user_id = $2',
      [contactIds, userId]
    );
    const validContactIds = contactCheck.rows.map(c => c.id);

    if (validContactIds.length === 0) return { added: 0 };

    // Use parameterized query for safety
    const values = validContactIds.map((_, i) => `($1, $${i + 2})`).join(',');
    const params = [groupId, ...validContactIds];

    await pool.query(
      `INSERT INTO contact_group_members (group_id, contact_id)
       VALUES ${values}
       ON CONFLICT (group_id, contact_id) DO NOTHING`,
      params
    );

    return { added: validContactIds.length };
  },

  async removeContact(groupId, userId, contactId) {
    // Verify group ownership
    const groupCheck = await pool.query(
      'SELECT id FROM contact_groups WHERE id = $1 AND user_id = $2',
      [groupId, userId]
    );
    if (groupCheck.rows.length === 0) return null;

    const result = await pool.query(
      'DELETE FROM contact_group_members WHERE group_id = $1 AND contact_id = $2 RETURNING id',
      [groupId, contactId]
    );
    return result.rows.length > 0;
  },

  async getGroupsForContact(contactId, userId) {
    const result = await pool.query(
      `SELECT g.id, g.name, g.color
       FROM contact_groups g
       JOIN contact_group_members gm ON g.id = gm.group_id
       WHERE gm.contact_id = $1 AND g.user_id = $2
       ORDER BY g.name`,
      [contactId, userId]
    );
    return result.rows;
  },

  formatResponse(group) {
    return {
      id: group.id,
      userId: group.user_id,
      name: group.name,
      description: group.description,
      color: group.color,
      contactCount: parseInt(group.contact_count) || 0,
      createdAt: group.created_at,
      updatedAt: group.updated_at
    };
  }
};

module.exports = ContactGroup;
