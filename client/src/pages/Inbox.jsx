import { useEffect, useRef, useState } from 'react';
import {
  Search,
  Send,
  MessageSquare,
  Phone,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isToday, isYesterday } from 'date-fns';
import { messagesAPI } from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data.conversations || []);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
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

    if (!newMessage.trim() || !selectedContact) {
      return;
    }

    setSending(true);

    try {
      await messagesAPI.send({
        to_number: selectedContact.phone,
        body: newMessage,
        contact_id: selectedContact.id,
      });

      setNewMessage('');
      fetchMessages(selectedContact.id);
      fetchConversations();
      toast.success('Message sent');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (date) => {
    const parsedDate = new Date(date);

    if (isToday(parsedDate)) {
      return format(parsedDate, 'h:mm a');
    }

    if (isYesterday(parsedDate)) {
      return `Yesterday ${format(parsedDate, 'h:mm a')}`;
    }

    return format(parsedDate, 'MMM d, h:mm a');
  };

  const formatConversationTime = (date) => {
    const parsedDate = new Date(date);

    if (isToday(parsedDate)) {
      return format(parsedDate, 'h:mm a');
    }

    if (isYesterday(parsedDate)) {
      return 'Yesterday';
    }

    return format(parsedDate, 'MMM d');
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    conversation.phone?.includes(search)
  );

  const unreadCount = conversations.reduce((sum, conversation) => sum + (conversation.unread_count || 0), 0);
  const activeTodayCount = conversations.filter((conversation) => {
    if (!conversation.last_message_at) {
      return false;
    }

    return isToday(new Date(conversation.last_message_at));
  }).length;
  const summaryItems = [
    { label: 'Open Threads', value: conversations.length, note: 'Conversations in the inbox' },
    { label: 'Unread Replies', value: unreadCount, note: 'Need attention' },
    { label: 'Active Today', value: activeTodayCount, note: 'Threads updated today' },
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
        eyebrow="Shared Inbox"
        title="Inbox"
        description="Keep replies in context, respond quickly, and review conversation history without leaving the workspace."
      />

      <Card>
        <CardContent className="grid gap-4 py-5 md:grid-cols-3">
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

      <Card className="overflow-hidden">
        <div className="grid min-h-[42rem] grid-cols-1 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <div className={`border-b border-[#ece3d9] xl:border-b-0 xl:border-r ${selectedContact ? 'hidden xl:flex xl:flex-col' : 'flex flex-col'}`}>
            <CardHeader className="border-b border-[#ece3d9]">
              <div>
                <CardTitle>Conversations</CardTitle>
                <CardDescription>
                  Search and open recent SMS threads.
                </CardDescription>
              </div>
            </CardHeader>

            <div className="border-b border-[#ece3d9] p-4">
              <Input
                placeholder="Search conversations..."
                icon={Search}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto bg-[#fcfaf7]">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.contact_id}
                    onClick={() =>
                      setSelectedContact({
                        id: conversation.contact_id,
                        name: conversation.contact_name,
                        phone: conversation.phone,
                      })
                    }
                    className={`w-full border-b border-[#ece3d9] px-4 py-4 text-left transition-colors hover:bg-white ${
                      selectedContact?.id === conversation.contact_id ? 'bg-white' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1e6d8] font-semibold text-[#1f172f]">
                        {conversation.contact_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate font-medium text-[#1f172f]">
                            {conversation.contact_name || conversation.phone}
                          </p>
                          <span className="text-xs text-[#6f677b]">
                            {formatConversationTime(conversation.last_message_at)}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-[#6f677b]">
                          {conversation.last_message}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <div className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#1f172f] px-2 text-xs font-medium text-white">
                          {conversation.unread_count}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
                  <MessageSquare className="mb-4 h-12 w-12 text-[#6f677b]/30" />
                  <p className="font-medium text-[#1f172f]">No conversations yet</p>
                  <p className="mt-1 text-sm text-[#6f677b]">
                    Once replies start arriving, they will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className={`${!selectedContact ? 'hidden xl:flex' : 'flex'} min-h-[42rem] flex-col`}>
            {selectedContact ? (
              <>
                <div className="border-b border-[#ece3d9] bg-white px-5 py-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedContact(null)}
                      className="rounded-lg p-2 transition-colors hover:bg-[#fbf8f4] xl:hidden"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1e6d8] font-semibold text-[#1f172f]">
                      {selectedContact.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1f172f]">{selectedContact.name}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-[#6f677b]">
                        <Phone className="h-3.5 w-3.5" />
                        {selectedContact.phone}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto bg-[#fcfaf7] px-5 py-5">
                  {loadingMessages ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#f3a76a]/30 border-t-[#f3a76a]" />
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[42rem] rounded-2xl px-4 py-3 shadow-[0_1px_0_rgba(31,23,47,0.04)] ${
                            message.direction === 'outbound'
                              ? 'rounded-br-sm bg-[#1f172f] text-white'
                              : 'rounded-bl-sm border border-[#e6ddd3] bg-white text-[#1f172f]'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words leading-7">{message.body}</p>
                          <div
                            className={`mt-2 flex items-center gap-1 text-xs ${
                              message.direction === 'outbound'
                                ? 'justify-end text-white/70'
                                : 'text-[#6f677b]'
                            }`}
                          >
                            <span>{formatMessageTime(message.created_at)}</span>
                            {message.direction === 'outbound' &&
                              (message.status === 'delivered' ? (
                                <CheckCircle className="h-3.5 w-3.5" />
                              ) : message.status === 'failed' ? (
                                <XCircle className="h-3.5 w-3.5" />
                              ) : (
                                <Clock className="h-3.5 w-3.5" />
                              ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <MessageSquare className="mb-3 h-10 w-10 text-[#6f677b]/30" />
                      <p className="font-medium text-[#1f172f]">No messages yet</p>
                      <p className="mt-1 text-sm text-[#6f677b]">
                        Start the conversation from the composer below.
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-[#ece3d9] bg-white px-5 py-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={newMessage}
                      onChange={(event) => setNewMessage(event.target.value)}
                      className="w-full rounded-[0.95rem] border border-[#d8cec2] bg-[#fffdfa] px-4 py-3 text-[#1f172f] placeholder:text-[#6f677b]/60 focus:border-[#f3a76a] focus:outline-none focus:ring-2 focus:ring-[#f3a76a]/30"
                    />
                    <Button
                      type="submit"
                      loading={sending}
                      disabled={!newMessage.trim()}
                      icon={Send}
                    >
                      Send
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center bg-[#fcfaf7] px-6 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f6efe6]">
                  <MessageSquare className="h-10 w-10 text-[#1f172f]" />
                </div>
                <h3 className="font-['Outfit'] text-xl font-semibold text-[#1f172f]">
                  Select a conversation
                </h3>
                <p className="mt-2 max-w-sm text-[#6f677b]">
                  Choose a contact from the inbox list to review history and send a reply.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
