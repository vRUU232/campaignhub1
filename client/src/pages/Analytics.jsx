// Analytics page — performance reports with charts for messages, campaigns, and hourly activity
import { useEffect, useState } from 'react';
import {
  MessageSquare,
  Users,
  Megaphone,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Download,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { analyticsAPI } from '../services/api';
import StatsCard from '../components/ui/StatsCard';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Select } from '../components/ui/Input';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [campaignStats, setCampaignStats] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  // Fetch all analytics data in parallel based on the selected date range
  const fetchAnalytics = async () => {
    setLoading(true);

    try {
      const startDate = format(subDays(new Date(), parseInt(dateRange, 10)), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');

      const [dashboardResponse, dailyResponse, campaignsResponse, hourlyResponse] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getDaily({ start_date: startDate, end_date: endDate }),
        analyticsAPI.getCampaignStats({ start_date: startDate, end_date: endDate }),
        analyticsAPI.getHourly(),
      ]);

      setStats(dashboardResponse.data);
      setDailyData(dailyResponse.data.daily || []);
      setCampaignStats(campaignsResponse.data.campaigns || []);
      setHourlyData(hourlyResponse.data.hourly || []);
    } catch {
      // Analytics fetch failed — charts will show empty state
    } finally {
      setLoading(false);
    }
  };

  // Transform raw API data into chart-ready formats
  const chartData = dailyData.map((day) => ({
    date: format(new Date(day.date), 'MMM d'),
    sent: day.sent || 0,
    delivered: day.delivered || 0,
    failed: day.failed || 0,
  }));

  const pieData = [
    { name: 'Delivered', value: stats?.overview?.delivered || 0, color: '#6d9a8a' },
    { name: 'Failed', value: stats?.overview?.failed || 0, color: '#c85c4d' },
    { name: 'Pending', value: stats?.overview?.pending || 0, color: '#f3a76a' },
  ].filter((item) => item.value > 0);

  const campaignPerformance = campaignStats
    .map((campaign) => ({
      name: campaign.name?.substring(0, 18) || 'Unknown',
      sent: campaign.messagesSent || 0,
      delivered: campaign.messagesDelivered || 0,
      rate: campaign.messagesSent
        ? Math.round((campaign.messagesDelivered / campaign.messagesSent) * 100)
        : 0,
    }))
    .slice(0, 5);

  // Compute quick insight metrics from the data
  const bestDay = dailyData.reduce((current, day) => {
    if (!current || (day.delivered || 0) > (current.delivered || 0)) {
      return day;
    }

    return current;
  }, null);

  const topCampaign = campaignPerformance.reduce((current, campaign) => {
    if (!current || campaign.rate > current.rate) {
      return campaign;
    }

    return current;
  }, null);

  const peakHour = hourlyData.reduce((current, hour) => {
    if (!current || hour.messages > current.messages) {
      return hour;
    }

    return current;
  }, null);

  const insightRows = [
    {
      label: 'Best Delivery Day',
      value: bestDay ? format(new Date(bestDay.date), 'EEEE') : 'Not enough data',
      detail: bestDay ? `${bestDay.delivered || 0} delivered messages` : 'Send more campaigns to calculate trends',
      icon: TrendingUp,
      tone: 'text-[#6d9a8a]',
    },
    {
      label: 'Peak Send Window',
      value: peakHour ? peakHour.hour : 'Not enough data',
      detail: peakHour ? `${peakHour.messages} projected actions` : 'Waiting for enough activity',
      icon: TrendingUp,
      tone: 'text-[#6d9a8a]',
    },
    {
      label: 'Top Campaign Rate',
      value: topCampaign ? `${topCampaign.rate}%` : 'No campaign data',
      detail: topCampaign ? topCampaign.name : 'Campaign performance will appear here',
      icon: TrendingDown,
      tone: 'text-[#6f677b]',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#f3a76a]/30 border-t-[#f3a76a]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Performance"
        title="Analytics"
        description="Track delivery, campaign efficiency, and send timing with a calmer reporting layout."
        actions={
          <>
            <div className="min-w-[11rem]">
              <Select
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value)}
                options={[
                  { value: '7', label: 'Last 7 days' },
                  { value: '30', label: 'Last 30 days' },
                  { value: '90', label: 'Last 90 days' },
                ]}
              />
            </div>
            <Button variant="outline" icon={Download}>
              Export
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Messages"
          value={stats?.overview?.total_messages?.toLocaleString() || '0'}
          icon={MessageSquare}
          trend="up"
          trendValue="+12%"
          subtitle="Across the selected window"
        />
        <StatsCard
          title="Delivery Rate"
          value={`${stats?.overview?.delivery_rate || 0}%`}
          icon={CheckCircle}
          trend="up"
          trendValue="+2%"
          subtitle="Average delivery performance"
        />
        <StatsCard
          title="Active Contacts"
          value={stats?.overview?.active_contacts?.toLocaleString() || '0'}
          icon={Users}
          trend="up"
          trendValue="+5%"
          subtitle="Subscribers available to message"
        />
        <StatsCard
          title="Campaigns Sent"
          value={stats?.overview?.sent_campaigns?.toLocaleString() || '0'}
          icon={Megaphone}
          subtitle="Completed sends"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message trends</CardTitle>
            <CardDescription>
              Daily sent and delivered volume for the selected reporting period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSentAnalytics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f3a76a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f3a76a" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDeliveredAnalytics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6d9a8a" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#6d9a8a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f172f10" vertical={false} />
                    <XAxis dataKey="date" stroke="#6f677b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6f677b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ece3d9',
                        borderRadius: '14px',
                        boxShadow: '0 10px 30px rgba(31, 23, 47, 0.08)',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="sent"
                      stroke="#f3a76a"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSentAnalytics)"
                      name="Sent"
                    />
                    <Area
                      type="monotone"
                      dataKey="delivered"
                      stroke="#6d9a8a"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDeliveredAnalytics)"
                      name="Delivered"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-center text-[#6f677b]">
                  <div>
                    <TrendingUp className="mx-auto mb-3 h-12 w-12 opacity-30" />
                    <p>No data available yet</p>
                    <p className="mt-1 text-sm">Start sending campaigns to unlock reporting.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery mix</CardTitle>
            <CardDescription>
              Current distribution of delivered, failed, and pending messages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[#6f677b]">
                  No delivery data available
                </div>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {pieData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border border-[#ece3d9] bg-[#fbf8f4] px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-[#1f172f]">{item.name}</span>
                  </div>
                  <span className="text-sm text-[#6f677b]">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top campaign performance</CardTitle>
            <CardDescription>
              A quick view of sent volume versus delivered volume.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {campaignPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f172f10" horizontal={false} />
                    <XAxis type="number" stroke="#6f677b" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#6f677b"
                      fontSize={12}
                      width={112}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ece3d9',
                        borderRadius: '14px',
                      }}
                    />
                    <Bar dataKey="sent" fill="#f3a76a" name="Sent" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="delivered" fill="#6d9a8a" name="Delivered" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-center text-[#6f677b]">
                  <div>
                    <Megaphone className="mx-auto mb-3 h-12 w-12 opacity-30" />
                    <p>No campaign data available yet</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity by hour</CardTitle>
            <CardDescription>
              A planning view for when sending activity tends to cluster.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f172f10" />
                  <XAxis dataKey="hour" stroke="#6f677b" fontSize={10} tickLine={false} interval={1} />
                  <YAxis stroke="#6f677b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ece3d9',
                      borderRadius: '14px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    stroke="#1f172f"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#1f172f' }}
                    name="Messages"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick insights</CardTitle>
          <CardDescription>
            A summary of the strongest signals in your current reporting window.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insightRows.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex flex-col gap-3 rounded-2xl border border-[#ece3d9] bg-[#fbf8f4] px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className={`rounded-xl bg-white p-2.5 ${item.tone}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1f172f]">{item.label}</p>
                    <p className="mt-1 text-sm text-[#6f677b]">{item.detail}</p>
                  </div>
                </div>
                <p className="font-['Outfit'] text-[1.6rem] font-semibold tracking-[-0.04em] text-[#1f172f]">
                  {item.value}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
