import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Search,
  Send,
  MessageSquare,
  Phone,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  MessageCircle,
  Mail,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isToday, isYesterday } from 'date-fns';
import { messagesAPI, contactsAPI } from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';

// Generate consistent color from string
const getAvatarColor = (name) => {
  const colors = [
    { bg: 'bg-[#f3a76a]/20', text: 'text-[#c4793a]' },
    { bg: 'bg-[#6d9a8a]/20', text: 'text-[#4a7a6a]' },
    { bg: 'bg-[#8a6270]/20', text: 'text-[#6a4250]' },
    { bg: 'bg-[#7c6faa]/20', text: 'text-[#5c4f8a]' },
    { bg: 'bg-[#5a9aaa]/20', text: 'text-[#3a7a8a]' },
    { bg: 'bg-[#aa8a5a]/20', text: 'text-[#8a6a3a]' },
  ];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
};

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('conversations');
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchData = async () => {
    try {
      const [conversationsRes, contactsRes] = await Promise.all([
        messagesAPI.getConversations(),
        contactsAPI.getAll(),
      ]);
      setConversations(conversationsRes.data.conversations || []);
      setContacts(contactsRes.data.contacts || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    if (selectedContact) {
      await fetchMessages(selectedContact.id);
    }
    setRefreshing(false);
    toast.success('Refreshed');
  };

  const fetchMessages = async (contactId) => {
    setLoadingMessages(true);
    try {
      const response = await messagesAPI.getConversation(contactId);
      setMessages(response.data.messages || []);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    setSending(true);
    try {
      await messagesAPI.send({
        to_number: selectedContact.phone,
        body: newMessage,
        contact_id: selectedContact.id,
      });
      setNewMessage('');
      fetchMessages(selectedContact.id);
      fetchData();
      toast.success('Message sent');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact({
      id: contact.id || contact.contact_id,
      name: contact.name || contact.contact_name,
      phone: contact.phone,
      email: contact.email,
      created_at: contact.created_at,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (date) => {
    const parsedDate = new Date(date);
    if (isToday(parsedDate)) return format(parsedDate, 'h:mm a');
    if (isYesterday(parsedDate)) return `Yesterday ${format(parsedDate, 'h:mm a')}`;
    return format(parsedDate, 'MMM d, h:mm a');
  };

  const formatConversationTime = (date) => {
    if (!date) return '';
    const parsedDate = new Date(date);
    if (isToday(parsedDate)) return format(parsedDate, 'h:mm a');
    if (isYesterday(parsedDate)) return 'Yesterday';
    return format(parsedDate, 'MMM d');
  };

  // Memoized filtered lists
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) =>
      conv.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      conv.phone?.includes(search)
    );
  }, [conversations, search]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) =>
      contact.name?.toLowerCase().includes(search.toLowerCase()) ||
      contact.phone?.includes(search) ||
      contact.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [contacts, search]);

  // Get conversation data for a contact
  const getConversationForContact = (contactId) => {
    return conversations.find((c) => c.contact_id === contactId);
  };

  // Stats
  const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

  const summaryItems = [
    { label: 'Total Contacts', value: contacts.length, icon: Users },
    { label: 'Active Threads', value: conversations.length, icon: MessageCircle },
    { label: 'Unread', value: unreadCount, icon: MessageSquare },
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
        eyebrow="Messaging"
        title="Inbox"
        description="Message your contacts directly. View all contacts or filter by active conversations."
        actions={
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {summaryItems.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6efe6]">
                <item.icon className="h-6 w-6 text-[#1f172f]" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#1f172f]">{item.value}</p>
                <p className="text-sm text-[#6f677b]">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Chat Interface */}
      <Card className="overflow-hidden">
        <div className="grid min-h-[600px] grid-cols-1 lg:grid-cols-[340px_1fr]">
          {/* Left Panel - Contact List */}
          <div className={`flex flex-col border-r border-[#ece3d9] ${selectedContact ? 'hidden lg:flex' : 'flex'}`}>
            {/* Tabs */}
            <div className="flex border-b border-[#ece3d9]">
              <button
                onClick={() => setActiveTab('conversations')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'conversations'
                    ? 'border-b-2 border-[#f3a76a] text-[#1f172f]'
                    : 'text-[#6f677b] hover:text-[#1f172f]'
                }`}
              >
                <MessageCircle className="mr-2 inline-block h-4 w-4" />
                Conversations
                {conversations.length > 0 && (
                  <span className="ml-2 rounded-full bg-[#f6efe6] px-2 py-0.5 text-xs">
                    {conversations.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'contacts'
                    ? 'border-b-2 border-[#f3a76a] text-[#1f172f]'
                    : 'text-[#6f677b] hover:text-[#1f172f]'
                }`}
              >
                <Users className="mr-2 inline-block h-4 w-4" />
                All Contacts
                {contacts.length > 0 && (
                  <span className="ml-2 rounded-full bg-[#f6efe6] px-2 py-0.5 text-xs">
                    {contacts.length}
                  </span>
                )}
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-[#ece3d9] p-3">
              <Input
                placeholder={activeTab === 'conversations' ? 'Search conversations...' : 'Search contacts...'}
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'conversations' ? (
                filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => {
                    const avatarColor = getAvatarColor(conv.contact_name);
                    return (
                      <button
                        key={conv.contact_id}
                        onClick={() => handleSelectContact(conv)}
                        className={`w-full border-b border-[#ece3d9] p-4 text-left transition-all hover:bg-[#fbf8f4] ${
                          selectedContact?.id === conv.contact_id ? 'bg-[#f6efe6]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${avatarColor.bg} ${avatarColor.text} font-semibold`}>
                            {conv.contact_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate font-medium text-[#1f172f]">
                                {conv.contact_name || conv.phone}
                              </p>
                              <span className="shrink-0 text-xs text-[#6f677b]">
                                {formatConversationTime(conv.last_message_at)}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-sm text-[#6f677b]">
                              {conv.last_message || 'No messages yet'}
                            </p>
                          </div>
                          {conv.unread_count > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f3a76a] px-1.5 text-xs font-medium text-white">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f6efe6]">
                      <MessageSquare className="h-8 w-8 text-[#6f677b]" />
                    </div>
                    <p className="font-medium text-[#1f172f]">No conversations yet</p>
                    <p className="mt-1 text-sm text-[#6f677b]">
                      Switch to "All Contacts" to start messaging
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={() => setActiveTab('contacts')}
                    >
                      View All Contacts
                    </Button>
                  </div>
                )
              ) : (
                filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => {
                    const avatarColor = getAvatarColor(contact.name);
                    const conversation = getConversationForContact(contact.id);
                    const hasMessages = !!conversation;

                    return (
                      <button
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                        className={`w-full border-b border-[#ece3d9] p-4 text-left transition-all hover:bg-[#fbf8f4] ${
                          selectedContact?.id === contact.id ? 'bg-[#f6efe6]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${avatarColor.bg} ${avatarColor.text} font-semibold`}>
                            {contact.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-medium text-[#1f172f]">
                                {contact.name}
                              </p>
                              {hasMessages && (
                                <span className="shrink-0 rounded bg-[#6d9a8a]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#4a7a6a]">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-[#6f677b]">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </p>
                          </div>
                          <MessageCircle className="h-5 w-5 shrink-0 text-[#6f677b]/50" />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f6efe6]">
                      <Users className="h-8 w-8 text-[#6f677b]" />
                    </div>
                    <p className="font-medium text-[#1f172f]">No contacts found</p>
                    <p className="mt-1 text-sm text-[#6f677b]">
                      Add contacts from the Contacts page
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right Panel - Chat Area */}
          <div className={`flex flex-col bg-[#faf8f5] ${!selectedContact ? 'hidden lg:flex' : 'flex'}`}>
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 border-b border-[#ece3d9] bg-white px-4 py-3">
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="rounded-lg p-2 transition-colors hover:bg-[#f6efe6] lg:hidden"
                    aria-label="Back to list"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getAvatarColor(selectedContact.name).bg} ${getAvatarColor(selectedContact.name).text} font-semibold`}>
                    {selectedContact.name?.charAt(0).toUpperCase() || '?'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[#1f172f]">{selectedContact.name}</p>
                    <p className="flex items-center gap-1 text-sm text-[#6f677b]">
                      <Phone className="h-3 w-3" />
                      {selectedContact.phone}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="hidden items-center gap-2 sm:flex">
                    {selectedContact.email && (
                      <div className="flex items-center gap-1 rounded-lg bg-[#f6efe6] px-2 py-1 text-xs text-[#6f677b]">
                        <Mail className="h-3 w-3" />
                        {selectedContact.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {loadingMessages ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#f3a76a]/30 border-t-[#f3a76a]" />
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              message.direction === 'outbound'
                                ? 'rounded-br-md bg-[#1f172f] text-white'
                                : 'rounded-bl-md border border-[#e6ddd3] bg-white text-[#1f172f]'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                              {message.body}
                            </p>
                            <div
                              className={`mt-1.5 flex items-center gap-1.5 text-[11px] ${
                                message.direction === 'outbound' ? 'justify-end text-white/60' : 'text-[#6f677b]'
                              }`}
                            >
                              <span>{formatMessageTime(message.created_at)}</span>
                              {message.direction === 'outbound' && (
                                message.status === 'delivered' ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : message.status === 'failed' ? (
                                  <XCircle className="h-3 w-3 text-red-400" />
                                ) : (
                                  <Clock className="h-3 w-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f6efe6]">
                        <MessageSquare className="h-10 w-10 text-[#6f677b]" />
                      </div>
                      <p className="font-medium text-[#1f172f]">Start a conversation</p>
                      <p className="mt-1 max-w-xs text-sm text-[#6f677b]">
                        Send your first message to {selectedContact.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="border-t border-[#ece3d9] bg-white p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 rounded-xl border border-[#d8cec2] bg-[#faf8f5] px-4 py-2.5 text-[#1f172f] placeholder:text-[#6f677b]/50 focus:border-[#f3a76a] focus:outline-none focus:ring-2 focus:ring-[#f3a76a]/20"
                    />
                    <Button
                      type="submit"
                      loading={sending}
                      disabled={!newMessage.trim()}
                      icon={Send}
                    >
                      <span className="hidden sm:inline">Send</span>
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-[#6f677b]">
                    {newMessage.length}/160 characters
                    {newMessage.length > 160 && (
                      <span className="ml-1 text-[#c4793a]">
                        ({Math.ceil(newMessage.length / 160)} SMS segments)
                      </span>
                    )}
                  </p>
                </form>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-[#f6efe6]">
                  <MessageSquare className="h-12 w-12 text-[#1f172f]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1f172f]">
                  Select a contact to message
                </h3>
                <p className="mt-2 max-w-sm text-[#6f677b]">
                  Choose from your conversations or browse all contacts to start a new chat.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button variant="secondary" onClick={() => setActiveTab('conversations')}>
                    View Conversations
                  </Button>
                  <Button onClick={() => setActiveTab('contacts')}>
                    Browse Contacts
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
