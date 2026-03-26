/**
 * Analytics Controller
 * Handles dashboard and analytics data
 */

const Analytics = require('../models/Analytics');
const Message = require('../models/Message');
const TwilioSettings = require('../models/TwilioSettings');

const analyticsController = {
  /**
   * Get dashboard statistics
   */
  async getDashboard(req, res) {
    try {
      const stats = await Analytics.getDashboardStats(req.user.id);
      const recentActivity = await Analytics.getRecentActivity(req.user.id, 10);
      const monthlyUsage = await Analytics.getMonthlyUsage(req.user.id);

      // Get Twilio settings for limit
      const twilioSettings = await TwilioSettings.findByUserId(req.user.id);
      const monthlyLimit = twilioSettings?.monthlyLimit || 1000;

      // Get daily stats for the last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const dailyData = await Analytics.getMessageAnalytics(req.user.id, startDate, endDate);

      // Calculate delivery rate
      const totalSent = stats.messagesSent || 0;
      const totalDelivered = dailyData.reduce((acc, d) => acc + (d.messagesDelivered || 0), 0);
      const totalFailed = dailyData.reduce((acc, d) => acc + (d.messagesFailed || 0), 0);
      const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

      res.json({
        overview: {
          total_messages: stats.messagesSent + stats.messagesReceived,
          active_contacts: stats.activeContacts,
          total_campaigns: stats.totalCampaigns,
          delivery_rate: deliveryRate,
          delivered: totalDelivered,
          failed: totalFailed,
          pending: totalSent - totalDelivered - totalFailed
        },
        daily_stats: dailyData.map(d => ({
          date: d.date,
          sent: d.messagesSent || 0,
          delivered: d.messagesDelivered || 0
        })),
        recentActivity,
        usage: {
          current: monthlyUsage,
          limit: monthlyLimit,
          percentage: Math.round((monthlyUsage / monthlyLimit) * 100)
        }
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({ error: 'Failed to get dashboard data' });
    }
  },

  /**
   * Get message analytics for a date range
   */
  async getMessageAnalytics(req, res) {
    try {
      const { startDate, endDate, period = '30d' } = req.query;

      let start, end;
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        // Default periods
        end = new Date();
        start = new Date();
        switch (period) {
          case '7d':
            start.setDate(start.getDate() - 7);
            break;
          case '30d':
            start.setDate(start.getDate() - 30);
            break;
          case '90d':
            start.setDate(start.getDate() - 90);
            break;
          default:
            start.setDate(start.getDate() - 30);
        }
      }

      const [dailyData, summary] = await Promise.all([
        Analytics.getMessageAnalytics(req.user.id, start, end),
        Analytics.getSummaryAnalytics(req.user.id, start, end)
      ]);

      res.json({
        period: { start, end },
        summary,
        daily: dailyData
      });
    } catch (error) {
      console.error('Get message analytics error:', error);
      res.status(500).json({ error: 'Failed to get message analytics' });
    }
  },

  /**
   * Get campaign performance
   */
  async getCampaignPerformance(req, res) {
    try {
      const { limit = 10 } = req.query;

      const campaigns = await Analytics.getCampaignPerformance(
        req.user.id,
        parseInt(limit)
      );

      res.json({ campaigns });
    } catch (error) {
      console.error('Get campaign performance error:', error);
      res.status(500).json({ error: 'Failed to get campaign performance' });
    }
  },

  /**
   * Get hourly activity for last 24 hours
   */
  async getHourlyActivity(req, res) {
    try {
      const activity = await Analytics.getHourlyActivity(req.user.id);
      res.json({ activity });
    } catch (error) {
      console.error('Get hourly activity error:', error);
      res.status(500).json({ error: 'Failed to get hourly activity' });
    }
  },

  /**
   * Get summary statistics
   */
  async getSummary(req, res) {
    try {
      const { period = '30d' } = req.query;

      const end = new Date();
      const start = new Date();

      switch (period) {
        case '7d':
          start.setDate(start.getDate() - 7);
          break;
        case '30d':
          start.setDate(start.getDate() - 30);
          break;
        case '90d':
          start.setDate(start.getDate() - 90);
          break;
        case 'year':
          start.setFullYear(start.getFullYear() - 1);
          break;
        default:
          start.setDate(start.getDate() - 30);
      }

      const summary = await Analytics.getSummaryAnalytics(req.user.id, start, end);

      // Get previous period for comparison
      const prevEnd = new Date(start);
      const prevStart = new Date(start);
      prevStart.setTime(prevStart.getTime() - (end.getTime() - start.getTime()));

      const prevSummary = await Analytics.getSummaryAnalytics(req.user.id, prevStart, prevEnd);

      // Calculate percentage changes
      const changes = {
        sentChange: prevSummary.totalSent > 0
          ? Math.round(((summary.totalSent - prevSummary.totalSent) / prevSummary.totalSent) * 100)
          : 0,
        deliveredChange: prevSummary.totalDelivered > 0
          ? Math.round(((summary.totalDelivered - prevSummary.totalDelivered) / prevSummary.totalDelivered) * 100)
          : 0,
        responseChange: prevSummary.totalReceived > 0
          ? Math.round(((summary.totalReceived - prevSummary.totalReceived) / prevSummary.totalReceived) * 100)
          : 0
      };

      res.json({
        current: summary,
        previous: prevSummary,
        changes,
        period: { start, end }
      });
    } catch (error) {
      console.error('Get summary error:', error);
      res.status(500).json({ error: 'Failed to get summary' });
    }
  },

  /**
   * Get daily analytics for a date range
   */
  async getDaily(req, res) {
    try {
      const { startDate, endDate, days = 30 } = req.query;

      let start, end;
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        end = new Date();
        start = new Date();
        start.setDate(start.getDate() - parseInt(days));
      }

      const dailyData = await Analytics.getMessageAnalytics(req.user.id, start, end);

      res.json({
        period: { start, end },
        data: dailyData.map(d => ({
          date: d.date,
          sent: d.messagesSent || 0,
          delivered: d.messagesDelivered || 0,
          failed: d.messagesFailed || 0,
          received: d.messagesReceived || 0
        }))
      });
    } catch (error) {
      console.error('Get daily analytics error:', error);
      res.status(500).json({ error: 'Failed to get daily analytics' });
    }
  }
};

module.exports = analyticsController;
