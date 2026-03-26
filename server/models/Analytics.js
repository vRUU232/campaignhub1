/**
 * Analytics Model
 * Handles analytics data and dashboard statistics
 */

const pool = require('../config/db');

const Analytics = {
  /**
   * Get dashboard statistics for a user
   */
  async getDashboardStats(userId) {
    const result = await pool.query(
      `SELECT * FROM user_dashboard_stats WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return {
        totalContacts: 0,
        activeContacts: 0,
        optedOutContacts: 0,
        totalCampaigns: 0,
        draftCampaigns: 0,
        sentCampaigns: 0,
        messagesSent: 0,
        messagesReceived: 0
      };
    }

    const stats = result.rows[0];
    return {
      totalContacts: parseInt(stats.total_contacts),
      activeContacts: parseInt(stats.active_contacts),
      optedOutContacts: parseInt(stats.opted_out_contacts),
      totalCampaigns: parseInt(stats.total_campaigns),
      draftCampaigns: parseInt(stats.draft_campaigns),
      sentCampaigns: parseInt(stats.sent_campaigns),
      messagesSent: parseInt(stats.messages_sent),
      messagesReceived: parseInt(stats.messages_received)
    };
  },

  /**
   * Get message analytics for a date range
   */
  async getMessageAnalytics(userId, startDate, endDate) {
    const result = await pool.query(
      `SELECT date, messages_sent, messages_delivered, messages_failed,
              messages_received, opt_outs, total_cost
       FROM message_analytics
       WHERE user_id = $1 AND date >= $2 AND date <= $3
       ORDER BY date ASC`,
      [userId, startDate, endDate]
    );

    return result.rows.map(row => ({
      date: row.date,
      messagesSent: row.messages_sent,
      messagesDelivered: row.messages_delivered,
      messagesFailed: row.messages_failed,
      messagesReceived: row.messages_received,
      optOuts: row.opt_outs,
      totalCost: parseFloat(row.total_cost)
    }));
  },

  /**
   * Get summary analytics for a period
   */
  async getSummaryAnalytics(userId, startDate, endDate) {
    const result = await pool.query(
      `SELECT
         SUM(messages_sent) as total_sent,
         SUM(messages_delivered) as total_delivered,
         SUM(messages_failed) as total_failed,
         SUM(messages_received) as total_received,
         SUM(opt_outs) as total_opt_outs,
         SUM(total_cost) as total_cost
       FROM message_analytics
       WHERE user_id = $1 AND date >= $2 AND date <= $3`,
      [userId, startDate, endDate]
    );

    const summary = result.rows[0];
    const totalSent = parseInt(summary.total_sent) || 0;
    const totalDelivered = parseInt(summary.total_delivered) || 0;

    return {
      totalSent,
      totalDelivered,
      totalFailed: parseInt(summary.total_failed) || 0,
      totalReceived: parseInt(summary.total_received) || 0,
      totalOptOuts: parseInt(summary.total_opt_outs) || 0,
      totalCost: parseFloat(summary.total_cost) || 0,
      deliveryRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100 * 100) / 100 : 0
    };
  },

  /**
   * Update or create daily analytics record
   */
  async updateDailyAnalytics(userId, date, updates) {
    const result = await pool.query(
      `INSERT INTO message_analytics (user_id, date, messages_sent, messages_delivered,
                                      messages_failed, messages_received, opt_outs, total_cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, date)
       DO UPDATE SET
         messages_sent = message_analytics.messages_sent + EXCLUDED.messages_sent,
         messages_delivered = message_analytics.messages_delivered + EXCLUDED.messages_delivered,
         messages_failed = message_analytics.messages_failed + EXCLUDED.messages_failed,
         messages_received = message_analytics.messages_received + EXCLUDED.messages_received,
         opt_outs = message_analytics.opt_outs + EXCLUDED.opt_outs,
         total_cost = message_analytics.total_cost + EXCLUDED.total_cost
       RETURNING *`,
      [
        userId,
        date,
        updates.messagesSent || 0,
        updates.messagesDelivered || 0,
        updates.messagesFailed || 0,
        updates.messagesReceived || 0,
        updates.optOuts || 0,
        updates.totalCost || 0
      ]
    );
    return result.rows[0];
  },

  /**
   * Get campaign performance metrics
   */
  async getCampaignPerformance(userId, limit = 10) {
    const result = await pool.query(
      `SELECT * FROM campaign_performance
       WHERE user_id = $1 AND status = 'sent'
       ORDER BY completed_at DESC NULLS LAST
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map(row => ({
      campaignId: row.campaign_id,
      name: row.name,
      status: row.status,
      totalRecipients: row.total_recipients,
      messagesSent: row.messages_sent,
      messagesDelivered: row.messages_delivered,
      messagesFailed: row.messages_failed,
      responsesCount: row.responses_count,
      optOutsCount: row.opt_outs_count,
      deliveryRate: parseFloat(row.delivery_rate),
      responseRate: parseFloat(row.response_rate),
      createdAt: row.created_at,
      completedAt: row.completed_at
    }));
  },

  /**
   * Get messages per hour for the last 24 hours
   */
  async getHourlyActivity(userId) {
    const result = await pool.query(
      `SELECT
         DATE_TRUNC('hour', created_at) as hour,
         COUNT(*) FILTER (WHERE direction = 'outbound') as sent,
         COUNT(*) FILTER (WHERE direction = 'inbound') as received
       FROM messages
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'
       GROUP BY DATE_TRUNC('hour', created_at)
       ORDER BY hour`,
      [userId]
    );

    return result.rows.map(row => ({
      hour: row.hour,
      sent: parseInt(row.sent),
      received: parseInt(row.received)
    }));
  },

  /**
   * Get recent activity (last messages and campaign updates)
   */
  async getRecentActivity(userId, limit = 10) {
    const messagesResult = await pool.query(
      `SELECT 'message' as type, m.id, m.direction, m.twilio_status as status,
              m.content, m.created_at, c.name, c.phone
       FROM messages m
       LEFT JOIN contacts c ON m.contact_id = c.id
       WHERE m.user_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return messagesResult.rows.map(row => ({
      type: row.type,
      id: row.id,
      direction: row.direction,
      status: row.status,
      content: row.content.substring(0, 50) + (row.content.length > 50 ? '...' : ''),
      createdAt: row.created_at,
      contactName: row.name || row.phone
    }));
  },

  /**
   * Get monthly usage for billing/limits
   */
  async getMonthlyUsage(userId) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await pool.query(
      `SELECT COUNT(*) as message_count
       FROM messages
       WHERE user_id = $1 AND direction = 'outbound' AND created_at >= $2`,
      [userId, startOfMonth]
    );

    return parseInt(result.rows[0].message_count);
  }
};

module.exports = Analytics;
