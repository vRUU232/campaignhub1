import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Send,
  Calendar,
  Copy,
  Trash2,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { campaignsAPI } from '../services/api';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/Table';
import Modal, { ModalFooter } from '../components/ui/Modal';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const campaignRes = await campaignsAPI.getById(id);
      setCampaign(campaignRes.data.campaign);
    } catch {
      toast.error('Failed to load campaign');
      navigate('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await campaignsAPI.send(id);
      toast.success('Campaign sent successfully!');
      fetchCampaign();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async () => {
    try {
      await campaignsAPI.cancel(id);
      toast.success('Campaign cancelled');
      fetchCampaign();
    } catch {
      toast.error('Failed to cancel campaign');
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await campaignsAPI.duplicate(id);
      toast.success('Campaign duplicated');
      navigate(`/campaigns/${res.data.campaign.id}/edit`);
    } catch {
      toast.error('Failed to duplicate campaign');
    }
  };

  const handleDelete = async () => {
    try {
      await campaignsAPI.delete(id);
      toast.success('Campaign deleted');
      navigate('/campaigns');
    } catch {
      toast.error('Failed to delete campaign');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-[#f3a76a]/30 border-t-[#f3a76a] rounded-full animate-spin" />
      </div>
    );
  }

  // Show error state if campaign could not be loaded
  if (!campaign) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <p className="text-lg font-medium text-[#1f172f]">Campaign not found</p>
        <p className="mt-1 text-sm text-[#6f677b]">This campaign may have been deleted or is unavailable.</p>
        <Link to="/campaigns" className="mt-4">
          <Button variant="outline" icon={ArrowLeft}>Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  const pieData = [
    { name: 'Delivered', value: campaign.delivered_count || 0, color: '#7aa998' },
    { name: 'Failed', value: campaign.failed_count || 0, color: '#e74c3c' },
    { name: 'Pending', value: (campaign.sent_count || 0) - (campaign.delivered_count || 0) - (campaign.failed_count || 0), color: '#f3a76a' },
  ].filter((d) => d.value > 0);

  const deliveryRate = campaign.sent_count
    ? Math.round((campaign.delivered_count / campaign.sent_count) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/campaigns')}
            className="p-2 rounded-lg hover:bg-[#1f172f]/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#6f677b]" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-['Outfit'] text-2xl font-bold text-[#1f172f]">
                {campaign.name}
              </h1>
              <StatusBadge status={campaign.status} />
            </div>
            <p className="text-[#6f677b]">
              Created on {format(new Date(campaign.created_at), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {campaign.status === 'draft' && (
            <>
              <Link to={`/campaigns/${id}/edit`}>
                <Button variant="secondary" icon={Edit}>
                  Edit
                </Button>
              </Link>
              <Button onClick={handleSend} loading={sending} icon={Send}>
                Send Now
              </Button>
            </>
          )}
          {campaign.status === 'scheduled' && (
            <Button variant="warning" onClick={handleCancel}>
              Cancel Schedule
            </Button>
          )}
          <Button variant="outline" onClick={handleDuplicate} icon={Copy}>
            Duplicate
          </Button>
          <Button variant="ghost" onClick={() => setDeleteModal(true)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#f3a76a]/10">
              <Users className="w-5 h-5 text-[#f3a76a]" />
            </div>
            <div>
              <p className="text-sm text-[#6f677b]">Recipients</p>
              <p className="font-['Outfit'] text-2xl font-bold text-[#1f172f]">
                {campaign.recipient_count || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[#6f677b]">Sent</p>
              <p className="font-['Outfit'] text-2xl font-bold text-[#1f172f]">
                {campaign.sent_count || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#7aa998]/10">
              <CheckCircle className="w-5 h-5 text-[#7aa998]" />
            </div>
            <div>
              <p className="text-sm text-[#6f677b]">Delivered</p>
              <p className="font-['Outfit'] text-2xl font-bold text-[#1f172f]">
                {campaign.delivered_count || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-100">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[#6f677b]">Delivery Rate</p>
              <p className="font-['Outfit'] text-2xl font-bold text-[#1f172f]">
                {deliveryRate}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[#f6f0e8] rounded-xl p-6">
              <p className="text-[#1f172f] whitespace-pre-wrap">{campaign.message}</p>
            </div>
            {campaign.scheduled_at && (
              <div className="mt-4 flex items-center gap-2 text-[#6f677b]">
                <Calendar className="w-4 h-4" />
                <span>
                  Scheduled for {format(new Date(campaign.scheduled_at), 'MMMM d, yyyy h:mm a')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Status</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
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
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-[#6f677b]">
                        {item.name} ({item.value})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-[#6f677b]">
                <p>No delivery data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recipients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recipients</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {campaign.contacts && campaign.contacts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Delivered At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaign.contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell className="text-[#6f677b]">{contact.phone}</TableCell>
                    <TableCell>
                      <StatusBadge status={contact.message_status || 'pending'} />
                    </TableCell>
                    <TableCell className="text-[#6f677b]">
                      {contact.sent_at
                        ? format(new Date(contact.sent_at), 'MMM d, h:mm a')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-[#6f677b]">
                      {contact.delivered_at
                        ? format(new Date(contact.delivered_at), 'MMM d, h:mm a')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-[#6f677b]">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No recipients added</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign? This action cannot be undone."
        size="sm"
      >
        <ModalFooter>
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
