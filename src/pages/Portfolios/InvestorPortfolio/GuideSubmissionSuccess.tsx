import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  ChevronDown,
  RefreshCw,
  Calendar,
  Search,
  Filter,
  ChevronUp,
  Inbox,
  Eye,
  PhoneCall,
  CheckCheck,
  Archive,
  AlertTriangle,
  X,
  Trash2,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Send,
  Copy,
  MessageSquare,
  User as UserIcon,
  ShieldCheck,
  ArrowLeft,
  MoreVertical,
  Phone as PhoneIcon,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ──────────────────────────────────────────────────────────
export interface Submission {
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
  status: 'pending' | 'reviewing' | 'contacted' | 'completed' | 'archived' | 'approved' | 'rejected';
  notes: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  refCode: string;
}

type StatusKey = Submission['status'];

// ─── Message type ──────────────────────────────────────────────────
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

// ─── Status config (extended with approved & rejected) ──────────
const STATUS_CONFIG: Record<StatusKey, { label: string; icon: any; className: string; dot: string }> = {
  pending: {
    label: 'Pending',
    icon: Inbox,
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    dot: 'bg-amber-500',
  },
  reviewing: {
    label: 'Reviewing',
    icon: Eye,
    className: 'bg-[#14235E]/[0.07] text-[#14235E] border-[#14235E]/20 dark:bg-[#8FB3EE]/10 dark:text-[#8FB3EE] dark:border-[#8FB3EE]/20',
    dot: 'bg-[#14235E] dark:bg-[#8FB3EE]',
  },
  contacted: {
    label: 'Contacted',
    icon: PhoneCall,
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
    dot: 'bg-indigo-500',
  },
  completed: {
    label: 'Completed',
    icon: CheckCheck,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10',
    dot: 'bg-slate-400',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
    dot: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    dot: 'bg-red-500',
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

const relativeTime = (dateString: string): string => {
  if (!dateString) return '';
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
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

// ─── Detail Row ────────────────────────────────────────────────────
const DetailItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 py-1.5 border-b border-[#14235E]/[0.06] dark:border-white/[0.05] last:border-0">
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#14235E]/[0.06] dark:bg-white/[0.04]">
      <Icon className="w-3 h-3 text-[#14235E] dark:text-[#8FB3EE]" strokeWidth={1.9} />
    </div>
    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 min-w-[60px]">
      {label}
    </span>
    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate flex-1 text-right sm:text-left">
      {value}
    </span>
  </div>
);

// ─── Status Pill ───────────────────────────────────────────────────
const StatusPill = ({ status }: { status: StatusKey }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <Badge className={cn('text-[10px] font-medium border gap-1 pl-1.5 pr-2 py-0.5', cfg.className)}>
      <Icon className="h-2.5 w-2.5" />
      {cfg.label}
    </Badge>
  );
};

// ─── Chat Dialog Component ──────────────────────────────────────────
const ChatDialog = ({
  submission,
  messages = [],
  onSendMessage,
  onFetchMessages,
  isOpen,
  onOpenChange,
}: {
  submission: Submission;
  messages: ChatMessage[];
  onSendMessage: (submissionId: string, content: string) => void;
  onFetchMessages: (submissionId: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch messages when dialog opens
  useEffect(() => {
    if (isOpen) {
      onFetchMessages(submission._id);
    }
  }, [isOpen, submission._id]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    setSendingMessage(true);
    try {
      await onSendMessage(submission._id, messageContent);
      setMessageContent('');
      // Re-fetch to get the updated messages
      onFetchMessages(submission._id);
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && messageContent.trim()) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get status color for online indicator
  const getStatusColor = () => {
    const status = submission.status;
    if (status === 'pending' || status === 'reviewing') return 'bg-emerald-400';
    if (status === 'contacted' || status === 'approved') return 'bg-emerald-400';
    if (status === 'completed') return 'bg-emerald-400';
    return 'bg-slate-400';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0 bg-[#ECE5DD] dark:bg-[#0B0F1A] border-[#14235E]/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* ─── WhatsApp-style Header ─── */}
        <div className="bg-[#075E54] dark:bg-[#14235E]/10 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="lg:hidden text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="relative">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B0F1A] text-white text-sm font-semibold">
                {getInitials(submission.name)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-sm font-semibold text-white truncate">
                TMMT
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/70 truncate max-w-[100px]">
                SUPPORT TEAM
                </span>
              </div>
            </div>
          </div>
         
        </div>

        {/* ─── Messages Area ─── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#ECE5DD] dark:bg-[#0B0F1A] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] dark:bg-none">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-20 w-20 rounded-full bg-[#25D366]/10 dark:bg-white/5 flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 text-[#25D366] dark:text-[#8FB3EE] opacity-60" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No messages yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                Start the conversation with {submission.name}
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isAdmin = msg.sender === 'admin';
              return (
                <motion.div
                  key={msg._id || msg.id || idx}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn('flex gap-2', isAdmin ? 'justify-end' : 'justify-start')}
                >
                  {/* Message Bubble - WhatsApp Style */}
                  <div
                    className={cn(
                      'relative max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed',
                      isAdmin
                        ? 'bg-[#DCF8C6] dark:bg-[#075E54] text-slate-800 dark:text-white rounded-br-none'
                        : 'bg-white dark:bg-[#1A2D3A] text-slate-800 dark:text-slate-200 rounded-bl-none'
                    )}
                  >
                    {/* Sender name for user messages */}
                    {!isAdmin && (
                      <div className="text-[10px] font-semibold text-[#075E54] dark:text-[#25D366] mb-0.5">
                        {msg.senderName || submission.name}
                      </div>
                    )}
                    {msg.content}
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">
                        {relativeTime(msg.timestamp)}
                      </span>
                      {isAdmin && (
                        <CheckCheck className="h-3 w-3 text-[#34B7F1] dark:text-[#25D366]" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ─── WhatsApp-style Input ─── */}
        <div className="bg-[#F0F0F0] dark:bg-[#1A2D3A] px-4 py-3 flex items-center gap-2 flex-shrink-0 border-t border-white/10">
          
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-white dark:bg-[#0B0F1A] border-0 rounded-full h-10 px-4 pr-12 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-[#25D366] dark:focus-visible:ring-[#25D366] placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || sendingMessage}
            >
              {sendingMessage ? (
                <div className="h-4 w-4 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4 text-[#25D366] dark:text-[#25D366]" />
              )}
            </button>
          </div>
      
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Single Submission Card (with status update & messages) ──────
const SubmissionCard = ({
  submission,
  forceExpanded,
  index,
  onDeleteClick,
  onStatusChange,
  messages = [],
  onSendMessage,
  onFetchMessages,
}: {
  submission: Submission;
  forceExpanded: boolean;
  index: number;
  onDeleteClick: (id: string, name: string) => void;
  onStatusChange: (id: string, newStatus: StatusKey) => void;
  messages?: ChatMessage[];
  onSendMessage: (submissionId: string, content: string) => void;
  onFetchMessages: (submissionId: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [messageExpanded, setMessageExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messagesVisible, setMessagesVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const DeviceIcon = getDeviceIcon(submission.device);
  const isOpen = forceExpanded || expanded;
  const cfg = STATUS_CONFIG[submission.status] || STATUS_CONFIG.pending;
  const { user } = useAuth();

  const handleStatusClick = (newStatus: StatusKey) => {
    onStatusChange(submission._id, newStatus);
    setShowStatusMenu(false);
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    setSendingMessage(true);
    try {
      await onSendMessage(submission._id, messageContent);
      setMessageContent('');
      setShowMessageDialog(false);
      // Refresh messages
      onFetchMessages(submission._id);
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Fetch messages when messages section is opened
  useEffect(() => {
    if (messagesVisible) {
      onFetchMessages(submission._id);
    }
  }, [messagesVisible, submission._id]);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      >
        <Card
          className={cn(
            'group overflow-hidden border bg-white dark:bg-[#0B0F1A] transition-all duration-300',
            'border-[#14235E]/10 dark:border-white/10 hover:border-[#14235E]/25 dark:hover:border-white/20',
            'shadow-[0_1px_2px_rgba(10,50,105,0.04)] hover:shadow-[0_8px_24px_-10px_rgba(10,50,105,0.25)]'
          )}
        >
          <div className="flex">
            <div className={cn('w-1 shrink-0', cfg.dot)} />
            <div className="flex-1 min-w-0">
              {/* Card Header */}
              <div className="px-4 py-3 sm:px-5 sm:py-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#14235E] text-white text-xs font-semibold shadow-sm">
                    {getInitials(submission.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {submission.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                      <span className="truncate max-w-[160px]">{submission.email}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                      <span>{submission.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusPill status={submission.status} />
                  {/* ─── Message count badge ─── */}
                  {messages.length > 0 && (
                    <Badge className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                      {messages.length}
                    </Badge>
                  )}
                  {/* ─── Message Button ─── */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-8 w-8 p-0 rounded-full hover:bg-[#14235E]/10 dark:hover:bg-white/10 transition-colors"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4 text-[#14235E] dark:text-[#8FB3EE]" />
                  </Button>
                  {/* ─── Status Dropdown ─── */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStatusMenu(!showStatusMenu);
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:text-[#14235E] dark:hover:text-[#8FB3EE] hover:bg-[#14235E]/5 dark:hover:bg-white/5 transition-colors"
                      aria-label="Change status"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {showStatusMenu && (
                      <div className="absolute right-0 top-8 z-20 min-w-[150px] bg-white dark:bg-[#0B0F1A] rounded-xl shadow-lg border border-[#14235E]/10 dark:border-white/10 py-1">
                        {(['approved', 'rejected', 'contacted', 'archived'] as StatusKey[]).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusClick(status)}
                            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-[#14235E]/5 dark:hover:bg-white/5 flex items-center gap-2"
                          >
                            {STATUS_CONFIG[status]?.icon && (
                              <status.icon className="h-3.5 w-3.5" />
                            )}
                            {STATUS_CONFIG[status]?.label || status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* ─── Delete button ─── */}
                  <button
                    onClick={() => onDeleteClick(submission._id, submission.name)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    aria-label="Delete submission"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="px-4 sm:px-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pb-3">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3 text-[#14235E]/60 dark:text-[#8FB3EE]/60" />
                  {submission.service}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-[#14235E]/60 dark:text-[#8FB3EE]/60" />
                  {submission.urgency}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-[#14235E]/60 dark:text-[#8FB3EE]/60" />
                  {relativeTime(submission.createdAt)}
                </span>
                <span className="text-[10px] font-mono text-[#14235E] dark:text-[#8FB3EE] ml-auto bg-[#14235E]/[0.06] dark:bg-white/5 px-1.5 py-0.5 rounded">
                  #{submission.refCode || submission._id.slice(-6)}
                </span>
              </div>

              {/* Toggle Details */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-2 sm:px-5 bg-[#14235E]/[0.03] dark:bg-white/[0.02] hover:bg-[#14235E]/[0.06] transition-colors text-xs text-slate-600 dark:text-slate-400 border-t border-[#14235E]/[0.06] dark:border-white/5"
              >
                <span>{isOpen ? 'Hide details' : 'View details'}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>

              {/* Expanded Details */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-3 sm:px-5 space-y-3 border-t border-[#14235E]/10 dark:border-white/10">
                      {/* Personal & Technical Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                          <p className="text-[10px] font-semibold text-[#14235E] dark:text-[#8FB3EE] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            <User className="h-3 w-3" />
                            Personal Details
                          </p>
                          <DetailItem icon={Mail} label="Email" value={submission.email} />
                          <DetailItem icon={Phone} label="Phone" value={submission.phone} />
                          <DetailItem icon={Globe} label="Nationality" value={submission.nationality} />
                          <DetailItem icon={MapPin} label="Emirate" value={submission.emirate} />
                          <DetailItem icon={Clock} label="Urgency" value={submission.urgency} />
                          <DetailItem icon={MessageCircle} label="Contact" value={submission.contact} />
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                          <p className="text-[10px] font-semibold text-[#14235E] dark:text-[#8FB3EE] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            <Monitor className="h-3 w-3" />
                            Technical Info
                          </p>
                          <div className="flex items-center gap-3 py-1.5 border-b border-[#14235E]/[0.06] dark:border-white/[0.05]">
                            <div className="w-7 h-7 rounded-lg bg-[#14235E]/[0.06] dark:bg-white/[0.04] flex items-center justify-center shrink-0">
                              <DeviceIcon className="w-3.5 h-3.5 text-[#14235E] dark:text-[#8FB3EE]" strokeWidth={1.9} />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400">Device</p>
                              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{submission.device}</p>
                            </div>
                          </div>
                          <DetailItem icon={Monitor} label="OS" value={submission.os} />
                          <DetailItem icon={Chrome} label="Browser" value={submission.browser} />
                          {submission.location && submission.location !== 'Unknown' && (
                            <DetailItem icon={Globe} label="Location" value={submission.location} />
                          )}
                          
                          {/* ─── Initial Message in Technical Info ─── */}
                          {submission.message && submission.message !== 'No message provided' && (
                            <div className="mt-2 pt-2 border-t border-[#14235E]/[0.06] dark:border-white/[0.05]">
                              <div className="flex items-start gap-2">
                                <MessageCircle className="h-3.5 w-3.5 text-[#14235E] dark:text-[#8FB3EE] shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Initial Message</p>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                                    {submission.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ─── Chat Messages Section ─────────────────── */}
                      <div className="space-y-2">
                        <AnimatePresence>
                          {messagesVisible && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              {/* Quick reply input */}
                              <div className="flex gap-2 mt-2">
                                <Input
                                  placeholder="Reply..."
                                  value={messageContent}
                                  onChange={(e) => setMessageContent(e.target.value)}
                                  className="text-xs h-8"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && messageContent.trim()) {
                                      handleSendMessage();
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  className="h-8 px-2 bg-[#14235E] hover:bg-[#14235E]/90 text-white"
                                  onClick={handleSendMessage}
                                  disabled={!messageContent.trim() || sendingMessage}
                                >
                                  {sendingMessage ? (
                                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Send className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ─── Chat Dialog ────────────────────────────────────────── */}
      <ChatDialog
        submission={submission}
        messages={messages}
        onSendMessage={onSendMessage}
        onFetchMessages={onFetchMessages}
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </>
  );
};

// ─── Skeleton loader ──────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-xl border border-[#14235E]/10 dark:border-white/10 bg-white dark:bg-[#0B0F1A] p-4 sm:p-5 overflow-hidden relative">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-[#14235E]/10 dark:bg-white/10 animate-pulse" />
      <div className="space-y-2 flex-1">
        <div className="h-3 w-32 rounded bg-[#14235E]/10 dark:bg-white/10 animate-pulse" />
        <div className="h-2.5 w-48 rounded bg-[#14235E]/[0.07] dark:bg-white/5 animate-pulse" />
      </div>
      <div className="h-5 w-16 rounded-full bg-[#14235E]/10 dark:bg-white/10 animate-pulse" />
    </div>
    <div className="mt-4 h-2.5 w-3/4 rounded bg-[#14235E]/[0.07] dark:bg-white/5 animate-pulse" />
  </div>
);

// ─── Stat Tile ────────────────────────────────────────────────────
const StatTile = ({
  label,
  value,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: any;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex-1 min-w-[110px] text-left p-3 rounded-xl border transition-all duration-200',
      active
        ? 'bg-[#14235E] border-[#14235E] shadow-[0_6px_16px_-6px_rgba(10,50,105,0.5)]'
        : 'bg-white dark:bg-[#0B0F1A] border-[#14235E]/10 dark:border-white/10 hover:border-[#14235E]/25'
    )}
  >
    <div className="flex items-center justify-between">
      <Icon className={cn('h-3.5 w-3.5', active ? 'text-white/70' : 'text-[#14235E] dark:text-[#8FB3EE]')} />
      <span className={cn('text-lg font-semibold', active ? 'text-white' : 'text-slate-900 dark:text-white')}>
        {value}
      </span>
    </div>
    <p className={cn('text-[10.5px] font-medium mt-1', active ? 'text-white/70' : 'text-slate-500 dark:text-slate-400')}>
      {label}
    </p>
  </button>
);

// ─── Main Component ──────────────────────────────────────────────
export const GuideSubmissionSuccess = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedAll, setExpandedAll] = useState(false);
  const { user } = useAuth();

  // ─── Messages state ──────────────────────────────────────────────
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});

  // ─── Delete modal state ──────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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

  // ─── Send a message ──────────────────────────────────────────────
  const sendMessage = async (submissionId: string, content: string) => {
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
      };
      
      setMessagesMap((prev) => ({
        ...prev,
        [submissionId]: [...(prev[submissionId] || []), newMessage],
      }));

      toast.success('Message sent');
    } catch (err) {
      console.error('Send message error:', err);
      toast.error('Failed to send message');
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filterStatus]);

  useEffect(() => {
    const timer = setTimeout(fetchSubmissions, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── Delete handlers ─────────────────────────────────────────────
  const handleDeleteClick = (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/submissions/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success(`Submission from ${deleteTarget.name} deleted`);
      setSubmissions((prev) => prev.filter((s) => s._id !== deleteTarget.id));
      handleCancelDelete();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete submission');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Status change handler ─────────────────────────────────────
  const handleStatusChange = async (id: string, newStatus: StatusKey) => {
    try {
      const res = await fetch(`${apiBase}/api/v1/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const data = await res.json();
      setSubmissions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: data.data.status } : s))
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const stats = useMemo(() => {
    const counts: Record<string, number> = { all: submissions.length };
    (Object.keys(STATUS_CONFIG) as StatusKey[]).forEach((key) => {
      counts[key] = submissions.filter((s) => s.status === key).length;
    });
    return counts;
  }, [submissions]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container space-y-6"
      >
        {/* ─── Page header banner ────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden bg-[radial-gradient(circle_at_15%_-20%,#0B0F1A_0%,#0B0F1A_45%,#0B0F1A_100%)] px-5 py-6 sm:px-7 sm:py-7">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-[8px] font-semibold tracking-wide text-white/60 uppercase">Dashboard</span>
              <h3 className="text-xl sm:text-2xl font-semibold text-white mt-0.5">Guide Submissions</h3>
              <p className="text-[9px] text-white/60 mt-1">
                {submissions.length} request{submissions.length !== 1 ? 's' : ''} on record
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSubmissions}
              disabled={loading}
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm w-fit"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>


        {/* ─── Toolbar ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 sticky top-2 z-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 bg-white dark:bg-[#0B0F1A] border-[#14235E]/15 dark:border-white/10 focus-visible:ring-[#14235E]/30"
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
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          {submissions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedAll(!expandedAll)}
              className="gap-1 text-sm text-[#14235E] dark:text-[#8FB3EE] hover:bg-[#14235E]/10 shrink-0"
            >
              {expandedAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {expandedAll ? 'Collapse all' : 'Expand all'}
            </Button>
          )}
        </div>

        {/* ─── Content ─────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center border-red-200 dark:border-red-500/20">
            <AlertTriangle className="h-8 w-8 mx-auto text-red-400 mb-2" />
            <p className="text-red-500 text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchSubmissions} className="mt-4">
              Try again
            </Button>
          </Card>
        ) : submissions.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-[#14235E]/20 dark:border-white/10 bg-transparent">
            <div className="h-14 w-14 mx-auto rounded-full bg-[#14235E]/[0.06] dark:bg-white/5 flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#14235E] dark:text-[#8FB3EE]" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">No submissions yet</h3>
            <p className="text-sm text-slate-400">Submit a guide form and it will appear here.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {submissions.map((sub, i) => (
                <SubmissionCard
                  key={sub._id}
                  submission={sub}
                  forceExpanded={expandedAll}
                  index={i}
                  onDeleteClick={handleDeleteClick}
                  onStatusChange={handleStatusChange}
                  messages={messagesMap[sub._id] || []}
                  onSendMessage={sendMessage}
                  onFetchMessages={fetchMessages}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* ─── Delete Confirmation Modal ───────────────────────────── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={handleCancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-sm w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-red-200/30 dark:border-red-800/20 p-5 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-3">
                <X className="h-6 w-6 text-red-600 dark:text-red-400" strokeWidth={2} />
              </div>

              <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white">
                Delete Submission?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                This action <strong>cannot be undone</strong>. The submission from{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">{deleteTarget?.name}</span> will be permanently removed.
              </p>
              <p className="text-xs text-red-500 dark:text-red-400 text-center mt-1 font-medium">
                High risk operation
              </p>

              <div className="flex gap-3 mt-5">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 h-10 text-sm"
                  onClick={handleCancelDelete}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white h-10 text-sm font-semibold shadow-lg shadow-red-500/25"
                  onClick={handleDeleteConfirmed}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Permanently'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GuideSubmissionSuccess;