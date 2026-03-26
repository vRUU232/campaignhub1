import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Upload,
  Trash2,
  Edit,
  Users,
  Phone,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { contactsAPI, groupsAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';
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

const statusOptions = ['all', 'active', 'inactive', 'unsubscribed'];

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contactModal, setContactModal] = useState({ open: false, contact: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, contact: null });
  const [importModal, setImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'active',
  });

  useEffect(() => {
    fetchData();
  }, [pagination.page, search, statusFilter]);

  const fetchData = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      const [contactsResponse, groupsResponse] = await Promise.all([
        contactsAPI.getAll(params),
        groupsAPI.getAll(),
      ]);

      setContacts(contactsResponse.data.contacts || []);
      setPagination((previous) => ({ ...previous, total: contactsResponse.data.total || 0 }));
      setGroups(groupsResponse.data.groups || []);
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }

    try {
      if (contactModal.contact) {
        await contactsAPI.update(contactModal.contact.id, formData);
        toast.success('Contact updated');
      } else {
        await contactsAPI.create(formData);
        toast.success('Contact created');
      }

      fetchData();
      setContactModal({ open: false, contact: null });
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save contact');
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteModal.contact) {
        await contactsAPI.delete(deleteModal.contact.id);
        toast.success('Contact deleted');
      }

      fetchData();
      setDeleteModal({ open: false, contact: null });
    } catch {
      toast.error('Failed to delete contact');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) {
      return;
    }

    try {
      await contactsAPI.bulkDelete(selectedContacts);
      toast.success(`${selectedContacts.length} contacts deleted`);
      setSelectedContacts([]);
      fetchData();
    } catch {
      toast.error('Failed to delete contacts');
    }
  };

  const handleImport = async () => {
    try {
      const lines = importData.trim().split('\n');
      const importedContacts = lines.map((line) => {
        const [name, phone, email] = line.split(',').map((item) => item.trim());
        return { name, phone, email };
      });

      await contactsAPI.bulkCreate(importedContacts);
      toast.success(`${importedContacts.length} contacts imported`);
      setImportModal(false);
      setImportData('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to import contacts');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', status: 'active' });
  };

  const openEditModal = (contact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      status: contact.status,
    });
    setContactModal({ open: true, contact });
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
      return;
    }

    setSelectedContacts(contacts.map((contact) => contact.id));
  };

  const toggleSelect = (id) => {
    setSelectedContacts((previous) =>
      previous.includes(id)
        ? previous.filter((contactId) => contactId !== id)
        : [...previous, id]
    );
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const activeCount = contacts.filter((contact) => contact.status === 'active').length;
  const unsubscribedCount = contacts.filter((contact) => contact.status === 'unsubscribed').length;
  const summaryItems = [
    { label: 'Directory Size', value: pagination.total, note: 'Contacts in the system' },
    { label: 'Active on Page', value: activeCount, note: 'Ready to receive messages' },
    { label: 'Unsubscribed', value: unsubscribedCount, note: 'Excluded from sends' },
    { label: 'Saved Groups', value: groups.length, note: 'Audience collections available' },
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
        eyebrow="Contact Directory"
        title="Contacts"
        description="Keep your list clean, searchable, and ready for campaign segmentation."
        actions={
          <>
            <Button variant="secondary" onClick={() => setImportModal(true)} icon={Upload}>
              Import
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setContactModal({ open: true, contact: null });
              }}
              icon={Plus}
            >
              Add Contact
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="grid gap-4 py-5 md:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="border-b border-[#ece3d9] pb-4 last:border-b-0 md:border-b-0 md:border-r md:pb-0 md:pr-4 md:last:border-r-0"
            >
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#8a6270]">
                {item.label}
              </p>
              <p className="mt-3 font-['Outfit'] text-[2rem] font-semibold tracking-[-0.04em] text-[#1f172f]">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-[#6f677b]">{item.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 py-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="w-full xl:max-w-xl">
              <Input
                placeholder="Search by name, phone, or email..."
                icon={Search}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full border px-3.5 py-2 text-sm font-medium capitalize transition-colors ${
                    statusFilter === status
                      ? 'border-[#d8cec2] bg-[#fffdfa] text-[#1f172f]'
                      : 'border-transparent bg-transparent text-[#6f677b] hover:border-[#ece3d9] hover:bg-[#fbf8f4]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Contact registry</CardTitle>
            <CardDescription>
              A simple operating view for list health, status, and recent additions.
            </CardDescription>
          </div>
          {selectedContacts.length > 0 ? (
            <Button variant="danger" size="sm" onClick={handleBulkDelete} icon={Trash2}>
              Delete {selectedContacts.length}
            </Button>
          ) : (
            <p className="text-sm text-[#6f677b]">
              {pagination.total} total contact{pagination.total === 1 ? '' : 's'}
            </p>
          )}
        </CardHeader>

        {contacts.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedContacts.length === contacts.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-[#1f172f]/20 text-[#f3a76a] focus:ring-[#f3a76a]"
                    />
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                        className="h-4 w-4 rounded border-[#1f172f]/20 text-[#f3a76a] focus:ring-[#f3a76a]"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1e6d8] font-semibold text-[#1f172f]">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[#1f172f]">{contact.name}</p>
                          <p className="text-sm text-[#6f677b]">Manual contact record</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[#6f677b]">
                        <Phone className="h-4 w-4" />
                        <span>{contact.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.email ? (
                        <div className="flex items-center gap-2 text-[#6f677b]">
                          <Mail className="h-4 w-4" />
                          <span>{contact.email}</span>
                        </div>
                      ) : (
                        <span className="text-[#6f677b]/50">No email on file</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={contact.status} />
                    </TableCell>
                    <TableCell className="text-[#6f677b]">
                      {format(new Date(contact.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditModal(contact)}
                          className="rounded-lg p-2 transition-colors hover:bg-[#fbf8f4]"
                        >
                          <Edit className="h-4 w-4 text-[#6f677b]" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, contact })}
                          className="rounded-lg p-2 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex flex-col gap-3 border-t border-[#ece3d9] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#6f677b]">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} contacts
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination((previous) => ({ ...previous, page: previous.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= totalPages}
                    onClick={() => setPagination((previous) => ({ ...previous, page: previous.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={Users}
            title="No contacts found"
            description={
              search || statusFilter !== 'all'
                ? 'Try adjusting your search or status filters.'
                : 'Add your first contact to start building audiences.'
            }
            action={
              !search && statusFilter === 'all' ? (
                <Button
                  icon={Plus}
                  onClick={() => {
                    resetForm();
                    setContactModal({ open: true, contact: null });
                  }}
                >
                  Add Contact
                </Button>
              ) : null
            }
          />
        )}
      </Card>

      <Modal
        isOpen={contactModal.open}
        onClose={() => {
          setContactModal({ open: false, contact: null });
          resetForm();
        }}
        title={contactModal.contact ? 'Edit Contact' : 'Add Contact'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            required
          />
          <Input
            label="Phone Number"
            placeholder="+1234567890"
            value={formData.phone}
            onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
            required
          />
          <Input
            label="Email (optional)"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(event) => setFormData({ ...formData, status: event.target.value })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'unsubscribed', label: 'Unsubscribed' },
            ]}
          />
        </div>

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setContactModal({ open: false, contact: null });
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {contactModal.contact ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, contact: null })}
        title="Delete Contact"
        description={`Are you sure you want to delete ${deleteModal.contact?.name}? This action cannot be undone.`}
        size="sm"
      >
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ open: false, contact: null })}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={importModal}
        onClose={() => {
          setImportModal(false);
          setImportData('');
        }}
        title="Import Contacts"
        description="Paste contacts in CSV format: name, phone, email."
        size="lg"
      >
        <textarea
          className="h-48 w-full resize-none rounded-[0.95rem] border border-[#d8cec2] bg-[#fffdfa] px-4 py-3 font-mono text-sm text-[#1f172f] placeholder:text-[#6f677b]/60 focus:border-[#f3a76a] focus:outline-none focus:ring-2 focus:ring-[#f3a76a]/30"
          placeholder="John Doe, +1234567890, john@example.com
Jane Smith, +0987654321, jane@example.com"
          value={importData}
          onChange={(event) => setImportData(event.target.value)}
        />

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setImportModal(false);
              setImportData('');
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleImport} icon={Upload}>
            Import
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
