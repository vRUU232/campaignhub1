import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  Play,
  Pause,
  Copy,
  Trash2,
  Eye,
  Edit,
  Megaphone,
  Send,
  CalendarDays,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { campaignsAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
} from '../components/ui/Table';
import { StatusBadge } from '../components/ui/Badge';
import Modal, { ModalFooter } from '../components/ui/Modal';

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'sending', label: 'Sending' },
  { value: 'sent', label: 'Sent' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ open: false, campaign: null });
  const [actionMenu, setActionMenu] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignsAPI.getAll();
      setCampaigns(response.data.campaigns || []);
    } catch {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await campaignsAPI.delete(deleteModal.campaign.id);
      setCampaigns(campaigns.filter((campaign) => campaign.id !== deleteModal.campaign.id));
      toast.success('Campaign deleted');
      setDeleteModal({ open: false, campaign: null });
    } catch {
      toast.error('Failed to delete campaign');
    }
  };

  const handleDuplicate = async (campaign) => {
    try {
      await campaignsAPI.duplicate(campaign.id);
      toast.success('Campaign duplicated');
      setActionMenu(null);
      fetchCampaigns();
    } catch {
      toast.error('Failed to duplicate campaign');
    }
  };

  const handleSend = async (campaign) => {
    try {
      await campaignsAPI.send(campaign.id);
      fetchCampaigns();
      toast.success('Campaign sent successfully');
      setActionMenu(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send campaign');
    }
  };

  const handleCancel = async (campaign) => {
    try {
      await campaignsAPI.cancel(campaign.id);
      fetchCampaigns();
      toast.success('Campaign cancelled');
      setActionMenu(null);
    } catch {
      toast.error('Failed to cancel campaign');
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const summaryItems = [
    {
      label: 'Total Campaigns',
      value: campaigns.length,
      icon: FileText,
      note: 'All saved broadcasts',
    },
    {
      label: 'In Draft',
      value: campaigns.filter((campaign) => campaign.status === 'draft').length,
      icon: Edit,
      note: 'Pending review',
    },
    {
      label: 'Scheduled',
      value: campaigns.filter((campaign) => campaign.status === 'scheduled').length,
      icon: CalendarDays,
      note: 'Queued for launch',
    },
    {
      label: 'Sent',
      value: campaigns.filter((campaign) => campaign.status === 'sent').length,
      icon: Send,
      note: 'Completed deliveries',
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Campaign Studio"
        title="Campaigns"
        description="Review drafts, scheduled sends, and completed launches from one calmer registry."
        actions={
          <Link to="/campaigns/new">
            <Button icon={Plus}>New Campaign</Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="grid gap-4 py-5 md:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => {
            const SummaryIcon = item.icon;

            return (
              <div
              key={item.label}
              className="border-b border-[#ece3d9] pb-4 last:border-b-0 md:border-b-0 md:border-r md:pb-0 md:pr-4 md:last:border-r-0"
            >
              <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#8a6270]">
                <SummaryIcon className="h-4 w-4 text-[#6f677b]" />
                <span>{item.label}</span>
              </div>
              <p className="mt-3 font-['Outfit'] text-[2rem] font-semibold tracking-[-0.04em] text-[#1f172f]">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-[#6f677b]">{item.note}</p>
            </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 py-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="w-full xl:max-w-xl">
              <Input
                placeholder="Search campaigns by name..."
                icon={Search}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                    statusFilter === option.value
                      ? 'border-[#d8cec2] bg-[#fffdfa] text-[#1f172f]'
                      : 'border-transparent bg-transparent text-[#6f677b] hover:border-[#ece3d9] hover:bg-[#fbf8f4]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Campaign registry</CardTitle>
            <CardDescription>
              A clean operating view of campaign progress, volume, and launch timing.
            </CardDescription>
          </div>
          <p className="text-sm text-[#6f677b]">
            {filteredCampaigns.length} campaign{filteredCampaigns.length === 1 ? '' : 's'} visible
          </p>
        </CardHeader>

        {filteredCampaigns.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <Link
                      to={`/campaigns/${campaign.id}`}
                      className="flex items-start gap-3 transition-colors hover:text-[#ad5f26]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6efe6] text-[#1f172f]">
                        <Megaphone className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[#1f172f]">{campaign.name}</p>
                        <p className="mt-1 max-w-md truncate text-sm text-[#6f677b]">
                          {campaign.message?.trim()
                            ? campaign.message.substring(0, 72)
                            : 'No message copy added yet'}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={campaign.status} />
                  </TableCell>
                  <TableCell>{campaign.totalRecipients || 0}</TableCell>
                  <TableCell>{campaign.messagesSent || 0}</TableCell>
                  <TableCell>{campaign.messagesDelivered || 0}</TableCell>
                  <TableCell className="text-[#6f677b]">
                    {campaign.createdAt
                      ? format(new Date(campaign.createdAt), 'MMM d, yyyy')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="relative flex justify-end">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setActionMenu(actionMenu === campaign.id ? null : campaign.id);
                        }}
                        className="rounded-lg p-2 transition-colors hover:bg-[#fbf8f4]"
                      >
                        <MoreVertical className="h-4 w-4 text-[#6f677b]" />
                      </button>

                      {actionMenu === campaign.id && (
                        <div className="absolute right-0 top-10 z-10 w-48 rounded-2xl border border-[#e6ddd3] bg-white p-1 shadow-[0_18px_40px_rgba(31,23,47,0.12)]">
                          <div className="space-y-1">
                            <Link
                              to={`/campaigns/${campaign.id}`}
                              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#1f172f] transition-colors hover:bg-[#fbf8f4]"
                            >
                              <Eye className="h-4 w-4" />
                              View details
                            </Link>

                            {campaign.status === 'draft' && (
                              <>
                                <Link
                                  to={`/campaigns/${campaign.id}/edit`}
                                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#1f172f] transition-colors hover:bg-[#fbf8f4]"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleSend(campaign)}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#6d9a8a] transition-colors hover:bg-[#fbf8f4]"
                                >
                                  <Play className="h-4 w-4" />
                                  Send now
                                </button>
                              </>
                            )}

                            {campaign.status === 'scheduled' && (
                              <button
                                onClick={() => handleCancel(campaign)}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-amber-700 transition-colors hover:bg-[#fbf8f4]"
                              >
                                <Pause className="h-4 w-4" />
                                Cancel
                              </button>
                            )}

                            <button
                              onClick={() => handleDuplicate(campaign)}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#1f172f] transition-colors hover:bg-[#fbf8f4]"
                            >
                              <Copy className="h-4 w-4" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => {
                                setDeleteModal({ open: true, campaign });
                                setActionMenu(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={Megaphone}
            title="No campaigns found"
            description={
              search || statusFilter !== 'all'
                ? 'Try adjusting your search or status filters.'
                : 'Create your first SMS campaign to start sending.'
            }
            action={
              !search && statusFilter === 'all' ? (
                <Link to="/campaigns/new">
                  <Button icon={Plus}>Create Campaign</Button>
                </Link>
              ) : null
            }
          />
        )}
      </Card>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, campaign: null })}
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign? This action cannot be undone."
        size="sm"
      >
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ open: false, campaign: null })}
          >
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
