import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Calendar,
  Users,
  MessageSquare,
  CheckCircle,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { campaignsAPI, contactsAPI, groupsAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Modal, { ModalFooter } from '../components/ui/Modal';

export default function CampaignForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contactModal, setContactModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    sender_id: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [contactsResponse, groupsResponse] = await Promise.all([
        contactsAPI.getActive(),
        groupsAPI.getAll(),
      ]);

      setContacts(contactsResponse.data.contacts || []);
      setGroups(groupsResponse.data.groups || []);

      if (isEdit) {
        const campaignResponse = await campaignsAPI.getById(id);
        const campaign = campaignResponse.data;

        setFormData({
          name: campaign.name,
          message: campaign.message,
          sender_id: campaign.sender_id || '',
        });
        setSelectedContacts(campaign.contacts?.map((contact) => contact.id) || []);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [id, isEdit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSave = async (status = 'draft') => {
    if (!formData.name.trim()) {
      toast.error('Please enter a campaign name');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSaving(true);

    try {
      let campaign;

      if (isEdit) {
        const response = await campaignsAPI.update(id, { ...formData, status });
        campaign = response.data;
      } else {
        const response = await campaignsAPI.create({ ...formData, status });
        campaign = response.data;
      }

      if (selectedContacts.length > 0) {
        await campaignsAPI.addContacts(campaign.id, selectedContacts);
      }

      toast.success(isEdit ? 'Campaign updated' : 'Campaign created');
      navigate(`/campaigns/${campaign.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (selectedContacts.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    setSending(true);

    try {
      let campaign;

      if (isEdit) {
        const response = await campaignsAPI.update(id, formData);
        campaign = response.data;
      } else {
        const response = await campaignsAPI.create(formData);
        campaign = response.data;
      }

      await campaignsAPI.addContacts(campaign.id, selectedContacts);
      await campaignsAPI.send(campaign.id);
      toast.success('Campaign sent successfully!');
      navigate(`/campaigns/${campaign.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledDate) {
      toast.error('Please select a date and time');
      return;
    }

    if (selectedContacts.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    setSending(true);

    try {
      let campaign;

      if (isEdit) {
        const response = await campaignsAPI.update(id, formData);
        campaign = response.data;
      } else {
        const response = await campaignsAPI.create(formData);
        campaign = response.data;
      }

      await campaignsAPI.addContacts(campaign.id, selectedContacts);
      await campaignsAPI.schedule(campaign.id, scheduledDate);
      toast.success('Campaign scheduled!');
      navigate(`/campaigns/${campaign.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to schedule campaign');
    } finally {
      setSending(false);
      setScheduleModal(false);
    }
  };

  const toggleContact = (contactId) => {
    setSelectedContacts((previous) =>
      previous.includes(contactId)
        ? previous.filter((id) => id !== contactId)
        : [...previous, contactId]
    );
  };

  const selectGroup = (groupId) => {
    const group = groups.find((item) => item.id === groupId);

    if (group && group.contacts) {
      const groupContactIds = group.contacts.map((contact) => contact.id);
      setSelectedContacts((previous) => [...new Set([...previous, ...groupContactIds])]);
    }
  };

  const messageLength = formData.message.length;
  const segments = Math.ceil(messageLength / 160) || 1;
  const estimatedSegments = selectedContacts.length * segments;
  const selectedContactRecords = contacts.filter((contact) => selectedContacts.includes(contact.id));
  const previewContacts = selectedContactRecords.slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#c98a57]/30 border-t-[#c98a57]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/campaigns')}
            className="mt-1 flex h-11 w-11 items-center justify-center rounded-full border border-[#d8cbb8] bg-[#fffdf9] transition-colors hover:bg-[#fbf6ef]"
          >
            <ArrowLeft className="h-5 w-5 text-[#756c7b]" />
          </button>
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#8a6270]">
              Campaign Composer
            </p>
            <h1 className="mt-2 font-['Outfit'] text-[2.25rem] font-semibold tracking-[-0.05em] text-[#2b2338]">
              {isEdit ? 'Edit Campaign' : 'New Campaign'}
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-[#756c7b]">
              Write the message, choose the audience, and confirm send details in one warm, focused workspace.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => handleSave('draft')}
            loading={saving}
            icon={Save}
          >
            Save Draft
          </Button>
          <Button variant="outline" onClick={() => setScheduleModal(true)} icon={Calendar}>
            Schedule
          </Button>
          <Button onClick={handleSend} loading={sending} icon={Send}>
            Send Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.85fr)_23rem]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Campaign brief</CardTitle>
            <CardDescription>
              Keep the core message, sender details, and preview inside one continuous composition surface.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <section className="space-y-5 px-6 py-6">
              <Input
                name="name"
                label="Campaign Name"
                placeholder="e.g., Summer Sale Announcement"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <Input
                name="sender_id"
                label="Sender ID (optional)"
                placeholder="Your business name or number"
                value={formData.sender_id}
                onChange={handleChange}
              />

              <div>
                <Textarea
                  name="message"
                  label="Message"
                  placeholder="Type your SMS here. Use {{name}} for personalization."
                  rows={8}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
                <div className="mt-3 flex flex-col gap-2 text-sm text-[#756c7b] sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Characters: {messageLength} | Segments: {segments}
                  </span>
                  <span>
                    Variables: {'{{name}}'}, {'{{phone}}'}
                  </span>
                </div>
              </div>
            </section>

            <section className="border-t border-[#e8dccb] px-6 py-6">
              <div className="mb-4">
                <h3 className="font-['Outfit'] text-[1.15rem] font-semibold text-[#2b2338]">
                  Message preview
                </h3>
                <p className="mt-1 text-sm text-[#756c7b]">
                  See how the SMS will read once variables are replaced.
                </p>
              </div>

              <div className="rounded-[1.6rem] border border-[#e6dac8] bg-[#f7efe4] p-5 sm:p-6">
                <div className="mx-auto max-w-sm">
                  <div className="rounded-[1.6rem] border border-[#e3d7c6] bg-[#fffdf9] p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-3 border-b border-[#eee4d6] pb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2e5d7]">
                        <MessageSquare className="h-4 w-4 text-[#9c6540]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#2b2338]">
                          {formData.sender_id || 'CampaignHub'}
                        </p>
                        <p className="text-sm text-[#756c7b]">SMS preview</p>
                      </div>
                    </div>

                    <div className="rounded-[1.35rem] bg-[#f8f2ea] px-4 py-3.5 text-sm leading-7 text-[#2b2338]">
                      {formData.message
                        ? formData.message
                            .replaceAll('{{name}}', 'Aryan')
                            .replaceAll('{{phone}}', '+91 97237 38044')
                        : 'Your message preview will appear here once you start writing.'}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>

        <Card className="overflow-hidden xl:sticky xl:top-8 xl:self-start">
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Audience & summary</CardTitle>
              <CardDescription>
                Select recipients, review the list, and confirm message volume.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setContactModal(true)} icon={Users}>
              Select
            </Button>
          </CardHeader>

          <CardContent className="space-y-5">
            {selectedContacts.length > 0 ? (
              <>
                <div className="flex items-center justify-between rounded-[1.25rem] border border-[#d9e4dc] bg-[#eef5f0] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-[#7ca592]" />
                    <div>
                      <p className="font-medium text-[#2b2338]">
                        {selectedContacts.length} contacts selected
                      </p>
                      <p className="text-sm text-[#756c7b]">
                        Audience is ready for this campaign.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedContacts([])}
                    className="rounded-full p-1 text-[#756c7b] transition-colors hover:bg-white hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {previewContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between rounded-[1.2rem] border border-[#eadfce] bg-[#fbf6ef] px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-[#2b2338]">{contact.name}</p>
                        <p className="truncate text-sm text-[#756c7b]">{contact.phone}</p>
                      </div>
                      <button
                        onClick={() => toggleContact(contact.id)}
                        className="rounded-full p-1 text-[#756c7b] transition-colors hover:bg-white hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {selectedContacts.length > 5 && (
                    <p className="pt-1 text-center text-sm text-[#756c7b]">
                      +{selectedContacts.length - 5} more contacts selected
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-[1.35rem] border border-dashed border-[#dccfbc] bg-[#fbf6ef] px-5 py-8 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-[#756c7b]/35" />
                <p className="font-medium text-[#2b2338]">No recipients selected</p>
                <p className="mt-1 text-sm text-[#756c7b]">
                  Choose contacts or add a group before sending.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={() => setContactModal(true)}
                >
                  Select contacts
                </Button>
              </div>
            )}

            <div className="border-t border-[#e8dccb] pt-5">
              <div className="rounded-[1.35rem] border border-[#eadfce] bg-[#fbf6ef] px-4 py-4">
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#756c7b]">Recipients</span>
                  <span className="font-medium text-[#2b2338]">{selectedContacts.length}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#756c7b]">Message Segments</span>
                  <span className="font-medium text-[#2b2338]">{segments}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#756c7b]">Est. Total Segments</span>
                  <span className="font-medium text-[#2b2338]">{estimatedSegments}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#756c7b]">Sender</span>
                  <span className="font-medium text-[#2b2338]">
                    {formData.sender_id || 'Default'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={contactModal}
        onClose={() => setContactModal(false)}
        title="Select Recipients"
        size="lg"
      >
        <div className="space-y-4">
          {groups.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-[#756c7b]">Groups</p>
              <div className="flex flex-wrap gap-2">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => selectGroup(group.id)}
                    className="rounded-full border border-[#dccfbc] bg-[#fbf6ef] px-3.5 py-2 text-sm font-medium text-[#2b2338] transition-colors hover:bg-[#f2e7d9]"
                  >
                    {group.name} ({group.contact_count})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-[#756c7b]">Contacts</p>
            <div className="max-h-80 overflow-y-auto rounded-[1rem] border border-[#dccfbc]">
              {contacts.map((contact) => (
                <label
                  key={contact.id}
                  className="flex cursor-pointer items-center gap-3 border-b border-[#eee4d6] px-4 py-3 last:border-0 hover:bg-[#fbf6ef]"
                >
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => toggleContact(contact.id)}
                    className="h-4 w-4 rounded border-[#cdbfae] text-[#c98a57] focus:ring-[#c98a57]"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-[#2b2338]">{contact.name}</p>
                    <p className="text-sm text-[#756c7b]">{contact.phone}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setContactModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => setContactModal(false)}>
            Confirm ({selectedContacts.length})
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={scheduleModal}
        onClose={() => setScheduleModal(false)}
        title="Schedule Campaign"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            type="datetime-local"
            label="Send Date & Time"
            value={scheduledDate}
            onChange={(event) => setScheduledDate(event.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setScheduleModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} loading={sending} icon={Calendar}>
            Schedule
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
