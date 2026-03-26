import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  Megaphone,
  CheckCircle,
  ArrowRight,
  Plus,
  Clock,
  Send,
  Zap,
  BarChart3,
  Mail,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, campaignsAPI, messagesAPI } from '../services/api';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import StatsCard from '../components/ui/StatsCard';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, campaignsRes, messagesRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        campaignsAPI.getAll({ limit: 5 }),
        messagesAPI.getRecent(5),
      ]);

      setStats(statsRes.data);
      setRecentCampaigns(campaignsRes.data.campaigns || []);
      setRecentMessages(messagesRes.data.messages || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats?.daily_stats?.map((d) => ({
    date: format(new Date(d.date), 'MMM d'),
    sent: d.sent || 0,
    delivered: d.delivered || 0,
  })) || [];

  const pieData = [
    { name: 'Delivered', value: stats?.overview?.delivered || 0, color: '#6d9a8a' },
    { name: 'Failed', value: stats?.overview?.failed || 0, color: '#c85c4d' },
    { name: 'Pending', value: stats?.overview?.pending || 0, color: '#f3a76a' },
  ].filter((d) => d.value > 0);

  const hasData = stats?.overview?.total_messages > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#f3a76a]/30 border-t-[#f3a76a] rounded-full animate-spin mx-auto" />
          <p className="text-[#6f677b] mt-4 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        description="A calmer view of your campaign activity, reply flow, and delivery performance."
        actions={
          <Link to="/campaigns/new">
            <Button icon={Plus}>New Campaign</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Messages"
          value={stats?.overview?.total_messages?.toLocaleString() || '0'}
          icon={MessageSquare}
          trend={hasData ? 'up' : undefined}
          trendValue={hasData ? '+12%' : undefined}
          subtitle="Across all sends"
        />
        <StatsCard
          title="Active Contacts"
          value={stats?.overview?.active_contacts?.toLocaleString() || '0'}
          icon={Users}
          trend={hasData ? 'up' : undefined}
          trendValue={hasData ? '+5%' : undefined}
          subtitle="Audience available to message"
        />
        <StatsCard
          title="Total Campaigns"
          value={stats?.overview?.total_campaigns?.toLocaleString() || '0'}
          icon={Megaphone}
          subtitle="Drafted, scheduled, and sent"
        />
        <StatsCard
          title="Delivery Rate"
          value={`${stats?.overview?.delivery_rate || 0}%`}
          icon={CheckCircle}
          trend={hasData ? 'up' : undefined}
          trendValue={hasData ? '+2%' : undefined}
          subtitle="Average performance"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Message Activity</CardTitle>
              <CardDescription>Your message performance over time</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f3a76a]" />
                <span className="text-sm text-[#6f677b]">Sent</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#6d9a8a]" />
                  <span className="text-sm text-[#6f677b]">Delivered</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-72">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f3a76a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f3a76a" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6d9a8a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6d9a8a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f172f08" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#6f677b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#6f677b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(31, 23, 47, 0.12)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sent"
                      stroke="#f3a76a"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorSent)"
                      name="Sent"
                    />
                    <Area
                      type="monotone"
                      dataKey="delivered"
                      stroke="#6d9a8a"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorDelivered)"
                      name="Delivered"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f6efe6]">
                    <BarChart3 className="w-10 h-10 text-[#f3a76a]/60" />
                  </div>
                  <p className="text-[#1f172f] font-medium">No activity yet</p>
                  <p className="text-sm text-[#6f677b] mt-1 text-center max-w-xs">
                    Start sending campaigns to see your message analytics here
                  </p>
                  <Link to="/campaigns/new" className="mt-4">
                    <Button variant="outline" size="sm" icon={Plus}>
                      Create Campaign
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart / Quick Actions */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{pieData.length > 0 ? 'Delivery Status' : 'Quick Actions'}</CardTitle>
            <CardDescription>
              {pieData.length > 0 ? 'Message delivery breakdown' : 'Get started quickly'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {pieData.length > 0 ? (
              <>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px rgba(31, 23, 47, 0.12)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-[#6f677b]">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <Link to="/campaigns/new" className="block">
                  <div className="group cursor-pointer rounded-xl border border-[#ece3d9] bg-[#fbf8f4] p-4 transition-colors hover:bg-white">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6efe6]">
                        <Megaphone className="w-5 h-5 text-[#1f172f]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#1f172f]">Create Campaign</p>
                        <p className="text-sm text-[#6f677b]">Send SMS to your contacts</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#6f677b]" />
                    </div>
                  </div>
                </Link>

                <Link to="/contacts" className="block">
                  <div className="group cursor-pointer rounded-xl border border-[#ece3d9] bg-[#fbf8f4] p-4 transition-colors hover:bg-white">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6efe6]">
                        <Users className="w-5 h-5 text-[#1f172f]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#1f172f]">Add Contacts</p>
                        <p className="text-sm text-[#6f677b]">Import or add contacts</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#6f677b]" />
                    </div>
                  </div>
                </Link>

                <Link to="/settings" className="block">
                  <div className="group cursor-pointer rounded-xl border border-[#ece3d9] bg-[#fbf8f4] p-4 transition-colors hover:bg-white">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6efe6]">
                        <Zap className="w-5 h-5 text-[#1f172f]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#1f172f]">Setup Twilio</p>
                        <p className="text-sm text-[#6f677b]">Connect your account</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#6f677b]" />
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <Card className="overflow-hidden">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Your latest campaign activity</CardDescription>
            </div>
            <Link to="/campaigns">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                View all
              </Button>
            </Link>
          </CardHeader>
          <div>
            {recentCampaigns.length > 0 ? (
              <div className="divide-y divide-[#1f172f]/5">
                {recentCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    to={`/campaigns/${campaign.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-[#f6f0e8]/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6efe6]">
                        <Megaphone className="w-5 h-5 text-[#1f172f]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1f172f]">{campaign.name}</p>
                        <p className="text-sm text-[#6f677b]">
                          {campaign.totalRecipients || 0} recipients
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={campaign.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f6efe6]">
                  <Megaphone className="w-8 h-8 text-[#f3a76a]/50" />
                </div>
                <p className="text-[#1f172f] font-medium">No campaigns yet</p>
                <p className="text-sm text-[#6f677b] mt-1">Create your first campaign to get started</p>
                <Link to="/campaigns/new">
                  <Button variant="outline" size="sm" className="mt-4" icon={Plus}>
                    Create Campaign
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Messages */}
        <Card className="overflow-hidden">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Latest message activity</CardDescription>
            </div>
            <Link to="/inbox">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                View all
              </Button>
            </Link>
          </CardHeader>
          <div>
            {recentMessages.length > 0 ? (
              <div className="divide-y divide-[#1f172f]/5">
                {recentMessages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-[#f6f0e8]/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        message.direction === 'inbound'
                          ? 'bg-[#edf5f1]'
                          : 'bg-[#eef2fb]'
                      }`}>
                        {message.direction === 'inbound' ? (
                          <Mail className="w-5 h-5 text-[#6d9a8a]" />
                        ) : (
                          <Send className="w-5 h-5 text-[#5b75b8]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1f172f]">
                          {message.contact_name || message.to_number}
                        </p>
                        <p className="text-sm text-[#6f677b] truncate max-w-[200px]">
                          {message.body || message.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6f677b]">
                      <Clock className="w-4 h-4" />
                      {format(new Date(message.created_at || message.createdAt), 'h:mm a')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f6efe6]">
                  <MessageSquare className="w-8 h-8 text-[#1f172f]/40" />
                </div>
                <p className="text-[#1f172f] font-medium">No messages yet</p>
                <p className="text-sm text-[#6f677b] mt-1">Messages will appear here once you start sending</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
