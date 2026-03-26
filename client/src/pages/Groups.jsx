import { useEffect, useState } from 'react';
import {
  Plus,
  FolderOpen,
  Users,
  Edit,
  Trash2,
  UserPlus,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { groupsAPI, contactsAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
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
import Modal, { ModalFooter } from '../components/ui/Modal';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [groupModal, setGroupModal] = useState({ open: false, group: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, group: null });
  const [contactsModal, setContactsModal] = useState({ open: false, group: null });
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupsResponse, contactsResponse] = await Promise.all([
        groupsAPI.getAll(),
        contactsAPI.getActive(),
      ]);

      setGroups(groupsResponse.data.groups || []);
      setContacts(contactsResponse.data.contacts || []);
    } catch {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      if (groupModal.group) {
        await groupsAPI.update(groupModal.group.id, formData);
        toast.success('Group updated');
      } else {
        await groupsAPI.create(formData);
        toast.success('Group created');
      }

      fetchData();
      setGroupModal({ open: false, group: null });
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save group');
    }
  };

  const handleDelete = async () => {
    try {
      await groupsAPI.delete(deleteModal.group.id);
      toast.success('Group deleted');
      fetchData();
      setDeleteModal({ open: false, group: null });
    } catch {
      toast.error('Failed to delete group');
    }
  };

  const handleAddContacts = async () => {
    if (selectedContacts.length === 0) {
      return;
    }

    try {
      await groupsAPI.addContacts(contactsModal.group.id, selectedContacts);
      toast.success(`Added ${selectedContacts.length} contacts`);
      fetchData();
      setContactsModal({ open: false, group: null });
      setSelectedContacts([]);
    } catch {
      toast.error('Failed to add contacts');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
  };

  const openEditModal = (group) => {
    setFormData({
      name: group.name,
      description: group.description || '',
    });
    setGroupModal({ open: true, group });
  };

  const toggleContact = (contactId) => {
    setSelectedContacts((previous) =>
      previous.includes(contactId)
        ? previous.filter((id) => id !== contactId)
        : [...previous, contactId]
    );
  };

  const filteredGroups = groups.filter((group) =>
    `${group.name} ${group.description || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalAssignments = groups.reduce((sum, group) => sum + (group.contact_count || 0), 0);
  const emptyGroups = groups.filter((group) => !group.contact_count).length;
  const summaryItems = [
    { label: 'Groups', value: groups.length, note: 'Audience collections' },
    { label: 'Assigned Contacts', value: totalAssignments, note: 'Membership across groups' },
    { label: 'Empty Groups', value: emptyGroups, note: 'Need audience assignment' },
    { label: 'Available Contacts', value: contacts.length, note: 'Ready to be added' },
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
        eyebrow="Audience Groups"
        title="Groups"
        description="Organize subscribers into clean audience lists for targeting and follow-up."
        actions={
          <Button
            onClick={() => {
              resetForm();
              setGroupModal({ open: true, group: null });
            }}
            icon={Plus}
          >
            Create Group
          </Button>
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
        <CardContent className="py-5">
          <div className="w-full xl:max-w-xl">
            <Input
              placeholder="Search groups by name or description..."
              icon={Search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Group directory</CardTitle>
            <CardDescription>
              A more traditional list view for audience collections and member counts.
            </CardDescription>
          </div>
          <p className="text-sm text-[#6f677b]">
            {filteredGroups.length} group{filteredGroups.length === 1 ? '' : 's'} visible
          </p>
        </CardHeader>

        {filteredGroups.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => {
                const updatedAt = group.updated_at || group.created_at;

                return (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6efe6] text-[#1f172f]">
                          <FolderOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-[#1f172f]">{group.name}</p>
                          <p className="text-sm text-[#6f677b]">Audience segment</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md text-[#6f677b]">
                      {group.description || 'No description provided yet'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[#1f172f]">
                        <Users className="h-4 w-4 text-[#6f677b]" />
                        <span>{group.contact_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#6f677b]">
                      {updatedAt ? format(new Date(updatedAt), 'MMM d, yyyy') : 'No activity yet'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setContactsModal({ open: true, group })}
                          className="rounded-lg p-2 transition-colors hover:bg-[#fbf8f4]"
                          title="Add contacts"
                        >
                          <UserPlus className="h-4 w-4 text-[#6f677b]" />
                        </button>
                        <button
                          onClick={() => openEditModal(group)}
                          className="rounded-lg p-2 transition-colors hover:bg-[#fbf8f4]"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-[#6f677b]" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, group })}
                          className="rounded-lg p-2 transition-colors hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={FolderOpen}
            title="No groups yet"
            description={
              search
                ? 'Try adjusting your search terms.'
                : 'Create your first group to organize contacts for campaign targeting.'
            }
            action={
              !search ? (
                <Button
                  onClick={() => {
                    resetForm();
                    setGroupModal({ open: true, group: null });
                  }}
                  icon={Plus}
                >
                  Create Group
                </Button>
              ) : null
            }
          />
        )}
      </Card>

      <Modal
        isOpen={groupModal.open}
        onClose={() => {
          setGroupModal({ open: false, group: null });
          resetForm();
        }}
        title={groupModal.group ? 'Edit Group' : 'Create Group'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Group Name"
            placeholder="e.g., VIP Customers"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            required
          />
          <Textarea
            label="Description (optional)"
            placeholder="Add a description for this group"
            rows={3}
            value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
          />
        </div>

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setGroupModal({ open: false, group: null });
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {groupModal.group ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, group: null })}
        title="Delete Group"
        description={`Are you sure you want to delete "${deleteModal.group?.name}"? Contacts in this group will not be deleted.`}
        size="sm"
      >
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ open: false, group: null })}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={contactsModal.open}
        onClose={() => {
          setContactsModal({ open: false, group: null });
          setSelectedContacts([]);
        }}
        title={`Add Contacts to ${contactsModal.group?.name}`}
        size="lg"
      >
        <div className="max-h-80 overflow-y-auto rounded-[1rem] border border-[#e6ddd3]">
          {contacts.map((contact) => (
            <label
              key={contact.id}
              className="flex cursor-pointer items-center gap-3 border-b border-[#ece3d9] px-4 py-3 last:border-0 hover:bg-[#fbf8f4]"
            >
              <input
                type="checkbox"
                checked={selectedContacts.includes(contact.id)}
                onChange={() => toggleContact(contact.id)}
                className="h-4 w-4 rounded border-[#1f172f]/20 text-[#f3a76a] focus:ring-[#f3a76a]"
              />
              <div className="flex-1">
                <p className="font-medium text-[#1f172f]">{contact.name}</p>
                <p className="text-sm text-[#6f677b]">{contact.phone}</p>
              </div>
            </label>
          ))}
        </div>

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setContactsModal({ open: false, group: null });
              setSelectedContacts([]);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddContacts} disabled={selectedContacts.length === 0}>
            Add ({selectedContacts.length})
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
