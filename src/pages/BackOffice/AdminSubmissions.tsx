// AdminSubmissions.tsx – Manage EmailCapture form submissions with real‑time chat (messages only)
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Clock,
  MessageCircle,
  Monitor,
  Smartphone,
  Tablet,
  Chrome,
  User,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  Check,
  X,
  Copy,
  Link,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ──────────────────────────────────────────────────────────
interface Submission {
  _id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  emirate: string;
  service: string;
  urgency: string;
  contact: string;
  message: string;
  device: string;
  os: string;
  browser: string;
  ip: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived' | 'reviewing' | 'contacted' | 'completed';
  notes: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  refCode: string;
  messages?: ChatMessage[];
}

interface ChatMessage {
  _id?: string;
  id?: string;
  content: string;
  sender: 'admin' | 'user';
  senderName: string;
  timestamp: string;
  type?: string;
  metadata?: any;
}

type StatusKey = Submission['status'];

const STATUS_CONFIG: Record<StatusKey, { label: string; icon: any; className: string }> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  },
  reviewing: {
    label: 'Reviewing',
    icon: Clock,
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  },
  contacted: {
    label: 'Contacted',
    icon: MessageCircle,
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  },
  archived: {
    label: 'Archived',
    icon: FileText,
    className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10',
  },
};

// ─── Helper ────────────────────────────────────────────────────────
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
};

const getDeviceIcon = (device: string) => {
  const d = (device || '').toLowerCase();
  if (d.includes('mobile')) return Smartphone;
  if (d.includes('tablet')) return Tablet;
  return Monitor;
};

const getInitials = (name: string) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || '?';

// ─── Main Component ──────────────────────────────────────────────
export const AdminSubmissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  // ─── Fetch all submissions with their messages ──────────────────
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (search) params.append('search', search);
      const res = await fetch(`${apiBase}/api/v1/submissions?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load');
      
      const submissionsData = data.data || [];
      setSubmissions(submissionsData);

      // ─── Fetch messages for all submissions ───────────────────
      const token = localStorage.getItem('authToken') || '';
      const messagesPromises = submissionsData.map(async (sub: Submission) => {
        try {
          const msgRes = await fetch(`${apiBase}/api/v1/submissions/${sub._id}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (msgRes.ok) {
            const msgData = await msgRes.json();
            return { submissionId: sub._id, messages: msgData.data || [] };
          }
          return { submissionId: sub._id, messages: [] };
        } catch {
          return { submissionId: sub._id, messages: [] };
        }
      });

      const messagesResults = await Promise.all(messagesPromises);
      const newMessagesMap: Record<string, ChatMessage[]> = {};
      messagesResults.forEach(({ submissionId, messages }) => {
        newMessagesMap[submissionId] = messages;
      });
      setMessagesMap(newMessagesMap);

    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch messages for a single submission ─────────────────────
  const fetchMessages = async (submissionId: string) => {
    try {
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`${apiBase}/api/v1/submissions/${submissionId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessagesMap((prev) => ({
        ...prev,
        [submissionId]: data.data || [],
      }));
      return data.data || [];
    } catch (err) {
      console.error('Fetch messages error:', err);
      return [];
    }
  };

  // ─── Send real‑time chat message ──────────────────────────────
  const sendChatMessage = async (submissionId: string, content: string) => {
    if (!content.trim()) return;
    setSendingMessage(true);
    try {
      // First, save to database
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`${apiBase}/api/v1/submissions/${submissionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          sender: 'admin',
          senderName: user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin',
          type: 'text',
          metadata: {},
        }),
      });
      if (!res.ok) throw new Error('Failed to save message');
      const data = await res.json();

      // Then send via socket for real-time delivery
      const socket = getSocket();
      const roomId = `submission_${submissionId}`;
      
      socket.emit('join_chat_room', { 
        roomId, 
        userId: user?.id || 'admin',
        officerId: user?.id || 'admin',
        userName: user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin'
      });

      socket.emit('chat_message', {
        message: content.trim(),
        chatId: roomId,
        type: 'text',
        metadata: {
          submissionId,
          senderRole: 'admin',
        },
      });

      // Update local state
      const newMessage = data.data || {
        content: content.trim(),
        sender: 'admin',
        senderName: user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin',
        timestamp: new Date().toISOString(),
        type: 'text',
        metadata: {},
      };
      
      setMessagesMap((prev) => ({
        ...prev,
        [submissionId]: [...(prev[submissionId] || []), newMessage],
      }));

      toast.success('Message sent');
      setMessageContent('');
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // ─── Handle opening messages modal ──────────────────────────────
  const openMessagesModal = async (sub: Submission) => {
    setSelectedSubmission(sub);
    setShowMessagesModal(true);
    // Fetch messages if not already loaded
    if (!messagesMap[sub._id] || messagesMap[sub._id].length === 0) {
      await fetchMessages(sub._id);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filterStatus]);

  useEffect(() => {
    const timer = setTimeout(fetchSubmissions, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusUpdate = async (id: string, status: StatusKey) => {
    try {
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`${apiBase}/api/v1/submissions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Update failed');
      const data = await res.json();
      setSubmissions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: data.data.status } : s))
      );
      toast.success(`Status updated to ${status}`);
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter((s) => s.status === 'pending').length;
    const approved = submissions.filter((s) => s.status === 'approved' || s.status === 'completed').length;
    const rejected = submissions.filter((s) => s.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [submissions]);

  return (
    <div className="space-y-6">
      {/* ─── Stats Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: FileText, color: 'bg-slate-500' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-500' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'bg-emerald-500' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'bg-red-500' },
        ].map((stat) => (
          <Card key={stat.label} className="border border-[#14235E]/10 dark:border-white/10 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={cn('p-2 rounded-xl', stat.color, 'bg-opacity-10')}>
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Search & Filter ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 bg-white dark:bg-[#0B0F1A] border-[#14235E]/15 dark:border-white/10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-44 bg-white dark:bg-[#0B0F1A]/20 border-[#14235E]/15 dark:border-white/10">
            <Filter className="h-4 w-4 mr-2 text-[#14235E] dark:text-[#8FB3EE]" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSubmissions}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* ─── Table ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#14235E] border-r-transparent" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center text-red-500 border-red-200">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchSubmissions} className="mt-4">
            Try again
          </Button>
        </Card>
      ) : submissions.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-[#14235E]/20 dark:border-white/10">
          <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">No submissions yet</h3>
          <p className="text-sm text-slate-400">Submissions from the EmailCapture form will appear here.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border border-[#14235E]/10 dark:border-white/10">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#14235E]/5 dark:bg-white/5">
                  <TableHead className="font-semibold text-[#14235E] dark:text-[#8FB3EE]">#</TableHead>
                  <TableHead className="font-semibold text-[#14235E] dark:text-[#8FB3EE]">Name</TableHead>
                  <TableHead className="font-semibold text-[#14235E] dark:text-[#8FB3EE]">Email</TableHead>
                  <TableHead className="font-semibold text-[#14235E] dark:text-[#8FB3EE]">Phone</TableHead>
                  <TableHead className="font-semibold text-[#14235E] dark:text-[#8FB3EE]">Service</TableHead>
                  <TableHead className="font-semibold text-[#14235E] dark:text-[#8FB3EE]">Status</TableHead>
                  <TableHead className="font-semibold text-[#14235E] dark:text-[#8FB3EE]">Messages</TableHead>
                  <TableHead className="font-semibold text-[#14235E] dark:text-[#8FB3EE] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub, idx) => {
                  const StatusIcon = STATUS_CONFIG[sub.status]?.icon || FileText;
                  const statusClass = STATUS_CONFIG[sub.status]?.className || '';
                  const messageCount = messagesMap[sub._id]?.length || 0;
                  return (
                    <TableRow key={sub._id} className="hover:bg-[#14235E]/5 dark:hover:bg-white/5 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-400">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#14235E] text-white text-xs font-medium">
                            {getInitials(sub.name)}
                          </div>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{sub.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-300">{sub.email}</TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-300">{sub.phone}</TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-300">{sub.service}</TableCell>
                      <TableCell>
                        <Badge className={cn('text-[10px] font-medium border gap-1 px-2 py-0.5', statusClass)}>
                          <StatusIcon className="h-2.5 w-2.5" />
                          {STATUS_CONFIG[sub.status]?.label || sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => openMessagesModal(sub)}
                          className="flex items-center gap-1.5 text-sm text-[#14235E] dark:text-[#8FB3EE] hover:underline"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-medium">{messageCount}</span>
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {sub.status !== 'approved' && sub.status !== 'completed' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(sub._id, 'approved')}>
                                <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {sub.status !== 'rejected' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(sub._id, 'rejected')}>
                                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                Reject
                              </DropdownMenuItem>
                            )}
                            {sub.status !== 'archived' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(sub._id, 'archived')}>
                                <FileText className="h-4 w-4 mr-2 text-slate-500" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setShowMessageDialog(true);
                              }}
                            >
                              <MessageCircle className="h-4 w-4 mr-2 text-purple-500" />
                              Send Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ─── Send Message Dialog ────────────────────────────────── */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#14235E]" />
              Send Message
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>To</Label>
              <Input 
                value={selectedSubmission ? `${selectedSubmission.name} (${selectedSubmission.email})` : ''} 
                readOnly 
                className="bg-slate-50 dark:bg-slate-800/50" 
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={5}
                className="resize-none"
                placeholder="Type your message here..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-[#14235E] hover:bg-[#14235E]/90 text-white"
                onClick={() => {
                  if (selectedSubmission) {
                    sendChatMessage(selectedSubmission._id, messageContent);
                    setShowMessageDialog(false);
                  }
                }}
                disabled={!messageContent.trim() || sendingMessage}
              >
                {sendingMessage ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send via Chat
                  </>
                )}
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              The message will be sent via real‑time chat. The user will see it instantly if online.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Messages Modal ────────────────────────────────────────── */}
      <Dialog open={showMessagesModal} onOpenChange={setShowMessagesModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#14235E]" />
              Messages
              <span className="text-sm font-normal text-slate-500">
                with {selectedSubmission?.name}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-3 py-4 max-h-[400px]">
            {selectedSubmission && (messagesMap[selectedSubmission._id] || []).length === 0 ? (
              <p className="text-center text-slate-400 py-8">No messages yet. Start a conversation!</p>
            ) : (
              (messagesMap[selectedSubmission?._id || ''] || []).map((msg, idx) => (
                <div
                  key={msg._id || msg.id || idx}
                  className={cn(
                    'flex flex-col p-3 rounded-lg text-sm max-w-[80%]',
                    msg.sender === 'admin'
                      ? 'bg-[#14235E] text-white self-end ml-auto'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 self-start'
                  )}
                >
                  <div className="flex items-center gap-2 text-xs">
                  
                    <span className="opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1">{msg.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Reply input */}
          <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <Input
              placeholder="Type a reply..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && messageContent.trim() && selectedSubmission) {
                  sendChatMessage(selectedSubmission._id, messageContent);
                }
              }}
            />
            <Button
              size="sm"
              className="bg-[#14235E] hover:bg-[#14235E]/90 text-white"
              onClick={() => {
                if (selectedSubmission && messageContent.trim()) {
                  sendChatMessage(selectedSubmission._id, messageContent);
                }
              }}
              disabled={!messageContent.trim() || sendingMessage}
            >
              {sendingMessage ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubmissions;