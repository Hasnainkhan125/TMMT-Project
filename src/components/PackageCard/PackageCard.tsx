// src/components/PackageCard/PackageCard.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Shield,
  Sparkles,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  X,
  RefreshCw,
  DollarSign,
  History,
  BadgeCheck,
  FileWarning,
  Image,
  FileIcon,
  CreditCard,
  ArrowUpRight,
  Send,
  ArrowLeft,
  Upload,
  Paperclip,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PackageDocument {
  docKey: string;
  label: string;
  filename?: string;
  originalName?: string;
  path?: string;
  url?: string;
  previewUrl?: string;
  downloadUrl?: string;
  size?: number;
  mimeType?: string;
  uploadedAt?: Date;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface PackageComment {
  _id: string;
  message: string;
  text?: string;
  content?: string;
  by: 'admin' | 'customer' | 'system';
  authorName?: string;
  at: Date;
  isAdmin?: boolean;
  isUser?: boolean;
  type?: 'user' | 'admin' | 'system';
  role?: string;
}

export interface RequestedDoc {
  _id: string;
  label: string;
  description?: string;
  requestedAt: Date;
  status: 'pending' | 'fulfilled' | 'rejected';
  fulfilledAt?: Date;
  documentId?: string;
}

export interface PackagePayment {
  status: 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
  provider?: string;
  paymentLink?: string;
  paidAmount?: number;
  paidAt?: Date;
  transactionId?: string;
}

export interface PackageHistory {
  action: string;
  note?: string;
  by?: string;
  at: Date;
}

export interface PackageApplication {
  _id: string;
  packageSlug: string;
  packageName: string;
  applicantType: 'outside' | 'inside';
  contact: {
    fullName: string;
    email?: string;
    phone: string;
    nationality?: string;
    preferredLanguage?: string;
  };
  pricing?: {
    baseAmount: number;
    currency: string;
    priceType: string;
  };
  user_id?: string;
  referenceId: string;
  status: 'submitted' | 'contacted' | 'docs_required' | 'pending_payment' | 'paid' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  documents?: PackageDocument[];
  requestedDocuments?: RequestedDoc[];
  comments?: PackageComment[];
  payment?: PackagePayment;
  history?: PackageHistory[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Status Configuration ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  dotColor: string;
  icon: any;
  description: string;
  bg: string;
}> = {
  submitted: {
    label: 'Submitted',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30',
    dotColor: 'bg-blue-400',
    icon: Clock,
    description: 'Package application submitted, awaiting review',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
  },
  contacted: {
    label: 'Contacted',
    color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/30',
    dotColor: 'bg-indigo-400',
    icon: MessageSquare,
    description: 'We have reached out to the applicant',
    bg: 'bg-indigo-50 dark:bg-indigo-950/20',
  },
  docs_required: {
    label: 'Docs Required',
    color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/30',
    dotColor: 'bg-orange-400',
    icon: FileWarning,
    description: 'Additional documents are required',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
  },
  pending_payment: {
    label: 'Pending Payment',
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30',
    dotColor: 'bg-amber-400',
    icon: DollarSign,
    description: 'Waiting for payment confirmation',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
  },
  paid: {
    label: 'Paid',
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30',
    dotColor: 'bg-emerald-400',
    icon: CheckCircle,
    description: 'Payment received',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  processing: {
    label: 'Processing',
    color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/30',
    dotColor: 'bg-purple-400',
    icon: Clock,
    description: 'Package is being processed',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30',
    dotColor: 'bg-emerald-400',
    icon: CheckCircle,
    description: 'Package process completed successfully',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border-red-200/50 dark:border-red-800/30',
    dotColor: 'bg-red-400',
    icon: X,
    description: 'Application was rejected',
    bg: 'bg-red-50 dark:bg-red-950/20',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-50 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200/50 dark:border-gray-700/30',
    dotColor: 'bg-gray-400',
    icon: X,
    description: 'Application was cancelled',
    bg: 'bg-gray-50 dark:bg-gray-800/20',
  },
};

// ─── Helper Functions ────────────────────────────────────────────────────────

const formatDate = (date: Date | string): string => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-GB', {
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

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (mimeType?: string, filename?: string) => {
  if (!mimeType && !filename) return FileText;
  const name = filename?.toLowerCase() || '';
  const type = mimeType?.toLowerCase() || '';
  if (type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/)) return Image;
  if (type === 'application/pdf' || name.endsWith('.pdf')) return FileText;
  return FileIcon;
};

const isImageDocument = (mimeType?: string, filename?: string): boolean => {
  const type = mimeType?.toLowerCase() || '';
  const name = filename?.toLowerCase() || '';
  return type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(name);
};

const getDocumentUrl = (doc: PackageDocument, applicationId?: string): string | undefined => {
  if (doc.url) {
    let url = doc.url;
    if (url.includes('/api/package-applications/') && !url.includes('/api/v1/')) {
      url = url.replace('/api/package-applications/', '/api/v1/package-applications/');
    }
    return url;
  }
  
  if (doc.previewUrl) {
    let url = doc.previewUrl;
    if (url.includes('/api/package-applications/') && !url.includes('/api/v1/')) {
      url = url.replace('/api/package-applications/', '/api/v1/package-applications/');
    }
    return url;
  }
  
  if (!doc.path) return undefined;
  
  if (doc.path.startsWith('http://') || doc.path.startsWith('https://')) {
    return doc.path;
  }
  
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  
  if (applicationId && doc.docKey) {
    return `${apiBase}/api/v1/package-applications/${applicationId}/documents/${encodeURIComponent(doc.docKey)}/preview`;
  }
  
  if (doc.path.startsWith('/')) {
    return `${apiBase}${doc.path}`;
  }
  
  if (doc.path.includes('\\') || doc.path.match(/^[A-Za-z]:/)) {
    const filename = doc.path.split('\\').pop() || doc.path.split('/').pop() || doc.path;
    if (doc.docKey && applicationId) {
      return `${apiBase}/api/v1/package-applications/${applicationId}/documents/${encodeURIComponent(doc.docKey)}/preview`;
    }
    return `${apiBase}/api/v1/uploads/${encodeURIComponent(filename)}`;
  }
  
  return `${apiBase}/${doc.path}`;
};

const isAdminComment = (comment: PackageComment): boolean => {
  if (comment.by === 'customer') return false;
  if (comment.by === 'admin' || comment.by === 'system') return true;
  if (comment.role === 'customer') return false;
  if (comment.role === 'admin' || comment.role === 'officer') return true;
  if (comment.type === 'user') return false;
  if (comment.type === 'admin' || comment.type === 'system') return true;
  if (comment.isAdmin === true) return true;
  if (comment.isUser === true) return false;
  if (comment.authorName?.toLowerCase().includes('admin')) return true;
  return false;
};

// ─── Chat Message Component ──────────────────────────────────────────────────

interface ChatMessageProps {
  message: PackageComment;
  isAdmin: boolean;
}

function ChatMessage({ message, isAdmin }: ChatMessageProps) {
  const time = new Date(message.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const displayText = message.message || message.text || message.content || '';

  return (
    <div className={cn("flex items-start gap-2 mb-2", isAdmin ? "justify-start" : "justify-end")}>
      {isAdmin ? (
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[8px] font-bold shadow-md">A</div>
        </div>
      ) : (
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-[8px] font-bold">Y</div>
        </div>
      )}
      <div className={cn(
        "max-w-[75%] rounded-2xl px-3 py-2 text-xs",
        isAdmin
          ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
          : "bg-blue-500 text-white"
      )}>
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-[7px] text-gray-400">
            {time}
          </span>
        </div>
        <p className="leading-relaxed text-[11px]">{displayText}</p>
      </div>
    </div>
  );
}

// ─── Document Grid Item Component ─────────────────────────────────────────────

interface DocumentGridItemProps {
  doc: PackageDocument;
  applicationId: string;
  onViewFullImage: (doc: PackageDocument) => void;
}

function DocumentGridItem({ doc, applicationId, onViewFullImage }: DocumentGridItemProps) {
  const filename = doc.originalName || doc.filename || '';
  const IconComponent = getFileIcon(doc.mimeType, filename);
  const isImage = isImageDocument(doc.mimeType, filename);
  const imageUrl = isImage ? getDocumentUrl(doc, applicationId) : undefined;

  return (
    <div
      className="group relative cursor-pointer"
      onClick={() => isImage && imageUrl && onViewFullImage(doc)}
    >
      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/40 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
        {isImage && imageUrl ? (
          <img
            src={imageUrl}
            alt={doc.label || filename || "Document"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'h-full w-full flex items-center justify-center';
                fallback.innerHTML = `
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                `;
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-0.5">
            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
            {filename && (
              <span className="text-[4px] sm:text-[5px] text-gray-400 dark:text-gray-500 truncate w-full text-center mt-0.5">
                {filename.split('.').pop()?.toUpperCase() || 'FILE'}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="absolute -top-0.5 -right-0.5">
        <Badge
          className={cn(
            "text-[6px] sm:text-[7px] border-0 px-1 py-0 h-4 flex items-center justify-center",
            doc.status === "approved" ? "bg-emerald-500 text-white" :
            doc.status === "rejected" ? "bg-red-500 text-white" :
            "bg-amber-500 text-white"
          )}
        >
          {doc.status === "approved" ? "✓" : doc.status === "rejected" ? "✗" : "⏳"}
        </Badge>
      </div>

      {isImage && imageUrl && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
          <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
        </div>
      )}
    </div>
  );
}

// ─── Full Image Modal Component ──────────────────────────────────────────────

interface FullImageModalProps {
  doc: PackageDocument | null;
  imageUrl: string | null;
  onClose: () => void;
}

function FullImageModal({ doc, imageUrl, onClose }: FullImageModalProps) {
  if (!doc || !imageUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={doc.label || doc.originalName || "Document"}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm max-w-[80%] text-center">
          {doc.label || doc.originalName || 'Document'}
          {doc.size && (
            <span className="ml-2 text-xs text-gray-300">
              ({formatBytes(doc.size)})
            </span>
          )}
        </div>

        {doc.url && (
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 p-2 rounded-full bg-blue-500/80 text-white hover:bg-blue-600 transition-colors"
          >
            <Download className="h-5 w-5" />
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── PackageCard Component ──────────────────────────────────────────────────

interface PackageCardProps {
  package: PackageApplication;
  onDelete?: (packageId: string) => void;
  onRefresh?: () => void;
  onViewDetails?: (pkg: PackageApplication) => void;
  onSendMessage?: (packageId: string, message: string) => Promise<void>;
  onUploadDocument?: (packageId: string, requestedDocId: string, file: File) => Promise<void>;
  isAdminView?: boolean;
}

export function PackageCard({ 
  package: pkg, 
  onDelete, 
  onRefresh, 
  onViewDetails,
  onSendMessage,
  onUploadDocument,
  isAdminView = false,
}: PackageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLabel, setUploadLabel] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PackageDocument | null>(null);
  
  // ── NEW: Delete confirmation modal state ──────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const generalFileInputRef = useRef<HTMLInputElement | null>(null);

  const statusConfig = STATUS_CONFIG[pkg.status] || STATUS_CONFIG.submitted;
  const StatusIcon = statusConfig.icon;

  const [comments, setComments] = useState<PackageComment[]>(() => {
    if (pkg.comments && Array.isArray(pkg.comments)) {
      return pkg.comments.map(c => ({
        ...c,
        isAdmin: isAdminComment(c),
        isUser: !isAdminComment(c),
      }));
    }
    return [];
  });

  const [requestedDocs, setRequestedDocs] = useState<RequestedDoc[]>(() => {
    return pkg.requestedDocuments || [];
  });

  useEffect(() => {
    return () => {
      Object.values(imagePreviews).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviews]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (showConversation) {
      setTimeout(scrollToBottom, 100);
    }
  }, [showConversation, comments]);

  useEffect(() => {
    if (pkg.comments && Array.isArray(pkg.comments)) {
      setComments(pkg.comments.map(c => ({
        ...c,
        isAdmin: isAdminComment(c),
        isUser: !isAdminComment(c),
      })));
    }
  }, [pkg.comments]);

  useEffect(() => {
    if (pkg.requestedDocuments) {
      setRequestedDocs(pkg.requestedDocuments);
    }
  }, [pkg.requestedDocuments]);

  const getProgress = () => {
    const flow = ['submitted', 'contacted', 'docs_required', 'pending_payment', 'paid', 'processing', 'completed'];
    const idx = flow.indexOf(pkg.status);
    if (idx === -1) return 0;
    return Math.min(Math.round((idx / (flow.length - 1)) * 100), 100);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(pkg.referenceId);
    setCopied(true);
    toast.success('Package ID copied');
    setTimeout(() => setCopied(false), 2000);
  };

  // ── NEW: Open delete confirmation modal ──────────────────────────────────
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  // ── NEW: Actual delete function (renamed) ──────────────────────────────
  const handleDeleteConfirmed = async () => {
    setDeleting(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${apiBase}/api/v1/package-applications/${pkg._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Delete failed');
      }

      toast.success(data.message || 'Package deleted');
      onDelete?.(pkg._id);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete package');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${apiBase}/api/v1/package-applications/${pkg._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          toast.success('Package refreshed');
          onRefresh?.();
        }
      } else {
        toast.error('Failed to refresh');
      }
    } catch {
      toast.error('Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  // ─── Send Message ──────────────────────────────────────────────────────────

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;
    
    setSendingMessage(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${apiBase}/api/v1/package-applications/${pkg._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          by: 'customer',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send message');
      }

      const data = await res.json();
      
      if (data.status === 'success') {
        toast.success('Message sent');
        
        const newComment: PackageComment = {
          _id: data.data?._id || `local-${Date.now()}`,
          message: newMessage.trim(),
          text: newMessage.trim(),
          content: newMessage.trim(),
          by: 'customer',
          role: 'customer',
          type: 'user',
          authorName: 'You',
          at: new Date(),
          isAdmin: false,
          isUser: true,
        };
        
        setComments(prev => [...prev, newComment]);
        setNewMessage('');
        setTimeout(scrollToBottom, 100);
        onRefresh?.();
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // ─── Upload Document for Requested Doc ──────────────────────────────────

  const handleUploadDocument = async (requestedDocId: string, file: File) => {
    if (!file) return;

    setUploadingDocs(prev => ({ ...prev, [requestedDocId]: true }));
    
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('document', file);
      formData.append('requestedDocId', requestedDocId);
      formData.append('packageId', pkg._id);

      const res = await fetch(`${apiBase}/api/v1/package-applications/${pkg._id}/upload-requested/${requestedDocId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      toast.success('Document uploaded successfully! ');
      
      setRequestedDocs(prev => 
        prev.map(doc => 
          doc._id === requestedDocId 
            ? { ...doc, status: 'fulfilled', fulfilledAt: new Date() }
            : doc
        )
      );
      
      setImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[requestedDocId];
        return newPreviews;
      });
      
      onRefresh?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploadingDocs(prev => ({ ...prev, [requestedDocId]: false }));
      if (fileInputRefs.current[requestedDocId]) {
        fileInputRefs.current[requestedDocId]!.value = '';
      }
    }
  };

  const handleFileSelect = (requestedDocId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews(prev => {
        if (prev[requestedDocId]?.startsWith('blob:')) {
          URL.revokeObjectURL(prev[requestedDocId]);
        }
        return { ...prev, [requestedDocId]: previewUrl };
      });
    }

    handleUploadDocument(requestedDocId, file);
  };

  // ─── General Upload (Anytime) ────────────────────────────────────────────

  const handleGeneralFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadLabel(file.name);
  };

  const handleGeneralUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setUploadingFile(true);
    
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('packageId', pkg._id);
      formData.append('label', uploadLabel || selectedFile.name);

      const res = await fetch(`${apiBase}/api/v1/package-applications/${pkg._id}/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      toast.success('Document uploaded successfully!');
      
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadLabel('');
      
      onRefresh?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploadingFile(false);
      if (generalFileInputRef.current) {
        generalFileInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {  
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const sortedComments = [...comments].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );

  const pendingDocsCount = requestedDocs.filter(d => d.status === 'pending').length;
  const hasPendingDocs = pendingDocsCount > 0;

  const selectedImageUrl = selectedImage ? getDocumentUrl(selectedImage, pkg._id) : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="group"
      >
        <Card
          className={cn(
            "border transition-all duration-300 bg-white dark:bg-slate-900/80",
            "border-gray-200/50 dark:border-gray-800/50",
            hasPendingDocs && "border-orange-300/50 dark:border-orange-800/40 shadow-lg shadow-orange-500/5"
          )}
        >
          {/* ─── ALERT BANNER FOR PENDING DOCS ──────────────────────────────── */}
          {hasPendingDocs && (
            <div className="relative overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-orange-950/30 border-b border-orange-200/50 dark:border-orange-800/30 px-3 py-2 sm:px-4 sm:py-2.5">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex-shrink-0 animate-pulse">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-orange-700 dark:text-orange-300">
                      {pendingDocsCount} document{pendingDocsCount > 1 ? 's' : ''} required
                    </p>
                    <p className="text-[10px] sm:text-xs text-orange-600/70 dark:text-orange-400/70">
                      Please upload the requested document{pendingDocsCount > 1 ? 's' : ''} to continue
                    </p>
                  </div>
               
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-200 dark:bg-orange-800/50">
                <div className="h-full bg-gradient-to-r from-orange-400 to-amber-400 animate-[pulse_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {/* Header */}
          <CardHeader
            className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all duration-300 rounded-t-xl p-3 sm:p-4"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <div className={cn(
                    "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border",
                    statusConfig.color,
                    "transition-all duration-300 group-hover:scale-110"
                  )}>
                    <StatusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  {pkg.status === 'processing' && (
                    <div className="absolute -top-0.5 -right-0.5">
                      <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-purple-500" />
                      </span>
                    </div>
                  )}
                  {pkg.status === 'completed' && (
                    <div className="absolute -top-0.5 -right-0.5">
                      <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                        <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500" />
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <p className="font-medium text-xs sm:text-sm truncate text-gray-800 dark:text-gray-200">
                      {pkg.packageName}
                    </p>
                    <Badge className={cn(
                      "text-[8px] sm:text-[10px] font-medium border-0",
                      statusConfig.color
                    )}>
                      <StatusIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                      {statusConfig.label}
                    </Badge>
                    {hasPendingDocs && (
                      <Badge className="bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 border-0 text-[8px] sm:text-[10px] animate-pulse">
                        <AlertCircle className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5" />
                        {pendingDocsCount} pending
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span>{formatDate(pkg.createdAt)}</span>
                    <span className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
                    <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="truncate max-w-[60px] sm:max-w-[100px]">{pkg.contact.fullName}</span>
                    {pkg.documents && pkg.documents.length > 0 && (
                      <>
                        <span className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
                        <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span>{pkg.documents.length}</span>
                      </>
                    )}
                    {comments.length > 0 && (
                      <>
                        <span className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
                        <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400" />
                        <span>{comments.length}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                >
                  {expanded ? (
                    <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* ─── UPLOAD MODAL ────────────────────────────────────────────────── */}
          <AnimatePresence>
            {showUploadModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={() => setShowUploadModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Document</h3>
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Document Label
                      </label>
                      <input
                        type="text"
                        value={uploadLabel}
                        onChange={(e) => setUploadLabel(e.target.value)}
                        placeholder="e.g., Passport Copy"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select File
                      </label>
                      <div className="relative">
                        <input
                          ref={generalFileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                          onChange={handleGeneralFileSelect}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                        />
                      </div>
                      {selectedFile && (
                        <p className="mt-1 text-xs text-gray-500">
                          Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
                        </p>
                      )}
                    </div>

                    {selectedFile && selectedFile.type.startsWith('image/') && (
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Preview"
                          className="w-full h-40 object-cover"
                          onLoad={(e) => {
                            URL.revokeObjectURL((e.target as HTMLImageElement).src);
                          }}
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowUploadModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                        onClick={handleGeneralUpload}
                        disabled={!selectedFile || uploadingFile}
                      >
                        {uploadingFile ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── EXPANDED CONTENT ─────────────────────────────────────────────── */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <CardContent className="pt-0 pb-3 sm:pb-4 px-3 sm:px-4">
                  <div className="border-t border-gray-200/50 dark:border-white/10 pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                    {/* Status Description */}
                    <div className={cn(
                      "flex items-center gap-2 sm:gap-3 text-xs sm:text-sm p-2 sm:p-2.5 rounded-xl border flex-wrap",
                      hasPendingDocs
                        ? "bg-orange-50/50 dark:bg-orange-950/10 border-orange-200/50 dark:border-orange-800/30"
                        : pkg.status === 'docs_required' || pkg.status === 'pending_payment'
                        ? "bg-orange-50/50 dark:bg-orange-950/10 border-orange-200/50 dark:border-orange-800/30"
                        : "bg-gray-50/50 dark:bg-white/5 border-gray-200/50 dark:border-white/5"
                    )}>
                      <div className={cn(
                        "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full shrink-0",
                        hasPendingDocs ? "bg-orange-400 animate-pulse" : statusConfig.dotColor
                      )} />
                      <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300">
                        {hasPendingDocs 
                          ? `📄 ${pendingDocsCount} document${pendingDocsCount > 1 ? 's' : ''} pending upload`
                          : statusConfig.description}
                      </span>
                      <div className="flex items-center gap-1 ml-auto shrink-0">
                        <Badge variant="outline" className="text-[8px] font-mono text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700">
                          {pkg.referenceId}
                        </Badge>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyId();
                          }}
                          className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          title="Copy ID"
                        >
                          {copied ? (
                            <Check className="h-2.5 w-2.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-2.5 w-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex justify-between text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                        <span className="font-medium">Progress</span>
                        <span className="font-medium">{getProgress()}%</span>
                      </div>
                      <div className="relative h-1.5 rounded-full overflow-hidden bg-gray-200/50 dark:bg-gray-700/50">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgress()}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className={cn(
                            "h-full rounded-full",
                            hasPendingDocs ? "bg-orange-400" :
                            pkg.status === 'completed' ? "bg-emerald-400" :
                            pkg.status === 'rejected' || pkg.status === 'cancelled' ? "bg-red-400" :
                            pkg.status === 'processing' ? "bg-purple-400" :
                            pkg.status === 'pending_payment' ? "bg-amber-400" :
                            "bg-blue-400"
                          )}
                        />
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Package Details
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex justify-between text-[10px] sm:text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Package</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{pkg.packageName}</span>
                          </div>
                          <div className="flex justify-between text-[10px] sm:text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Applicant Type</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {pkg.applicantType === 'inside' ? 'Inside UAE' : 'Outside UAE'}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] sm:text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Price</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              AED {Math.round(pkg.pricing?.baseAmount || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Applicant Info
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex justify-between text-[10px] sm:text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Name</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{pkg.contact.fullName}</span>
                          </div>
                          <div className="flex justify-between text-[10px] sm:text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Email</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{pkg.contact.email || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between text-[10px] sm:text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Phone</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{pkg.contact.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ─── REQUESTED DOCUMENTS ─────────────────────────────────────── */}
                    <div id="requested-docs-section" className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileWarning className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-400" />
                          Required Documents ({requestedDocs.filter(d => d.status === 'pending').length} pending)
                        </p>
                        {requestedDocs.filter(d => d.status === 'pending').length > 0 && (
                          <Badge className="bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 border-0 text-[8px] animate-pulse">
                            <Upload className="h-2.5 w-2.5 mr-0.5" />
                            Upload Required
                          </Badge>
                        )}
                      </div>
                      
                      {requestedDocs.length > 0 ? (
                        <div className="space-y-2">
                          {requestedDocs.map((req) => (
                            <div 
                              key={req._id} 
                              className={cn(
                                "flex items-center justify-between p-2 sm:p-3 rounded-xl border transition-all duration-300",
                                req.status === 'pending' 
                                  ? "bg-orange-50/70 dark:bg-orange-950/15 border-orange-300/60 dark:border-orange-800/40 shadow-sm shadow-orange-500/5 hover:shadow-orange-500/10"
                                  : req.status === 'fulfilled' 
                                    ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-800/30"
                                    : "bg-gray-50/50 dark:bg-gray-800/20 border-gray-200/50 dark:border-gray-700/30",
                                req.status === 'pending' && "animate-[pulse_3s_ease-in-out_infinite]"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "p-1 rounded-lg",
                                    req.status === 'pending' ? "bg-orange-100 dark:bg-orange-900/30" :
                                    req.status === 'fulfilled' ? "bg-emerald-100 dark:bg-emerald-900/30" :
                                    "bg-gray-100 dark:bg-gray-800/30"
                                  )}>
                                    <FileText className={cn(
                                      "h-3 w-3 sm:h-3.5 sm:w-3.5",
                                      req.status === 'pending' ? "text-orange-500" : 
                                      req.status === 'fulfilled' ? "text-emerald-500" : 
                                      "text-gray-400"
                                    )} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300">
                                      {req.label}
                                    </p>
                                    {req.description && (
                                      <p className="text-[8px] sm:text-[9px] text-gray-400 dark:text-gray-500">
                                        {req.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                {req.status === 'pending' ? (
                                  <div className="flex items-center gap-1.5">
                                    {imagePreviews[req._id] && (
                                      <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden border border-orange-200 dark:border-orange-800 shrink-0 shadow-sm">
                                        <img
                                          src={imagePreviews[req._id]}
                                          alt="Selected document preview"
                                          className="h-full w-full object-cover"
                                        />
                                        {uploadingDocs[req._id] && (
                                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <RefreshCw className="h-3.5 w-3.5 text-white animate-spin" />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    <input
                                      ref={el => fileInputRefs.current[req._id] = el}
                                      type="file"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                                      className="hidden"
                                      onChange={(e) => handleFileSelect(req._id, e)}
                                      disabled={uploadingDocs[req._id]}
                                    />
                                    <Button
                                      type="button"
                                      variant={uploadingDocs[req._id] ? "outline" : "default"}
                                      size="sm"
                                      disabled={uploadingDocs[req._id]}
                                      className={cn(
                                        "h-7 sm:h-8 text-[10px] sm:text-xs transition-all duration-300",
                                        uploadingDocs[req._id]
                                          ? "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                                          : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-sm hover:shadow-md"
                                      )}
                                      onClick={() => fileInputRefs.current[req._id]?.click()}
                                    >
                                      {uploadingDocs[req._id] ? (
                                        <>
                                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                          Uploading...
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="h-3 w-3 mr-1" />
                                          Upload
                                        </>
                                      )}
                                    </Button>
                                    <Badge className="bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 border-0 text-[8px]">
                                      Pending
                                    </Badge>
                                  </div>
                                ) : req.status === 'fulfilled' ? (
                                  <>
                                    <Badge className="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-0 text-[8px]">
                                      <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                                      Uploaded 
                                    </Badge>
                                    {req.fulfilledAt && (
                                      <span className="text-[7px] text-gray-400 dark:text-gray-500 hidden sm:inline">
                                        {formatDate(req.fulfilledAt)}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <Badge className="bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 border-0 text-[8px]">
                                    Rejected
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 sm:p-3 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-center">
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">No documents required for this package.</p>
                        </div>
                      )}
                    </div>

                    {/* ─── UPLOADED DOCUMENTS - SMALL ICON-LIKE GRID ─────────────── */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Uploaded Documents ({pkg.documents?.length || 0})
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-[8px] gap-1 bg-white dark:bg-white hover:bg-gray-50 dark:hover:bg-gray-100 border-gray-200 dark:border-gray-300 text-gray-700 dark:text-gray-700"
                          onClick={() => setShowUploadModal(true)}
                        >
                          <Plus className="h-3 w-3" />
                          Add Document
                        </Button>
                      </div>
                      {pkg.documents && pkg.documents.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {pkg.documents.map((doc) => (
                            <DocumentGridItem
                              key={doc.docKey}
                              doc={doc}
                              applicationId={pkg._id}
                              onViewFullImage={setSelectedImage}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 sm:p-3 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-center">
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">No documents uploaded yet.</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2 text-[10px] bg-white dark:bg-white hover:bg-gray-50 dark:hover:bg-gray-100 border-gray-200 dark:border-gray-300 text-gray-700 dark:text-gray-700"
                            onClick={() => setShowUploadModal(true)}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Upload First Document
                          </Button>
                        </div>
                      )}
                    </div>

                  {/* ─── CONVERSATION SECTION ─────────────────────────────────────── */}
<div className="space-y-1.5 sm:space-y-2">
  <div 
    className="flex items-center justify-between cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20 transition-all duration-300 rounded-xl p-2 sm:p-2.5 group border border-transparent hover:border-blue-200/50 dark:hover:border-blue-800/30"
    onClick={() => setShowConversation(!showConversation)}
  >
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20">
          <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        {comments.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center shadow-lg shadow-red-500/30">
            {comments.length}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
          Conversation
        </p>
        <p className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">
          {comments.length} message{comments.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
    <motion.div
      animate={{ rotate: showConversation ? 180 : 0 }}
      transition={{ duration: 0.3 }}
      className="p-1 rounded-lg bg-white/50 dark:bg-slate-800/50 group-hover:bg-white/70 dark:group-hover:bg-slate-700/50"
    >
      <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500 dark:text-slate-400" />
    </motion.div>
  </div>

  <AnimatePresence>
    {showConversation && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200/50 dark:border-white/5 shadow-lg shadow-gray-200/20 dark:shadow-gray-800/20 overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-gray-50 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 border-b border-gray-200/50 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs shadow-md shadow-blue-500/30">
                T
              </div>
              <div>
                <p className="text-[11px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  TMMT Support
                </p>
                <p className="text-[8px] text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-gray-600 dark:text-gray-300 border-0 text-[8px] sm:text-[10px] px-2 py-0.5">
              {comments.length} messages
            </Badge>
          </div>

          {/* Messages */}
          <div className="max-h-48 sm:max-h-64 overflow-y-auto p-2 sm:p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent bg-gradient-to-b from-gray-50/30 to-white/50 dark:from-gray-900/20 dark:to-gray-900/30">
            {sortedComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 mb-2">
                  <MessageSquare className="h-6 w-6 text-blue-400 dark:text-blue-500" />
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">No messages yet</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Start the conversation by sending a message</p>
              </div>
            ) : (
              sortedComments.map((comment) => {
                const isFromUser = comment.by === 'customer' || comment.role === 'customer' || comment.sender === 'user';
                return (
                  <ChatMessage
                    key={comment._id || comment.id}
                    message={comment}
                    isFromUser={isFromUser}
                    userName={isFromUser ? 'You' : 'TMMT Support'}
                  />
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input - SMALLER HEIGHT */}
          <div className="border-t border-gray-200/50 dark:border-white/5 p-1.5 sm:p-2 bg-white dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className={cn(
                  "flex-1 h-7 sm:h-8 rounded-full px-3 sm:px-3.5 py-1 text-xs sm:text-sm",
                  "border-gray-200 dark:border-gray-700",
                  "bg-gray-50 dark:bg-gray-800",
                  "text-gray-900 dark:text-white",
                  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                  "focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                disabled={sendingMessage}
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className={cn(
                  "h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full shrink-0",
                  "bg-gradient-to-r from-blue-500 to-indigo-500 text-white",
                  "shadow-md hover:shadow-lg hover:scale-105 active:scale-95",
                  "transition-all duration-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                )}
              >
                {sendingMessage ? (
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
                    {/* ─── PAYMENT ──────────────────────────────────────────────────── */}
                    {pkg.payment && (
                      <div className="space-y-1.5 sm:space-y-2">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Payment
                        </p>
                        <div className="p-2 sm:p-2.5 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 space-y-1">
                          <div className="flex justify-between text-[10px] sm:text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Status</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {pkg.payment.status || 'unpaid'}
                            </span>
                          </div>
                          {pkg.payment.paidAmount && (
                            <div className="flex justify-between text-[10px] sm:text-xs">
                              <span className="text-gray-500 dark:text-gray-400">Amount</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                AED {pkg.payment.paidAmount.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {pkg.payment.paidAt && (
                            <div className="flex justify-between text-[10px] sm:text-xs">
                              <span className="text-gray-500 dark:text-gray-400">Paid On</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300">{formatDate(pkg.payment.paidAt)}</span>
                            </div>
                          )}
                          {pkg.payment.paymentLink && (
                            <a
                              href={pkg.payment.paymentLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] text-blue-500 hover:underline"
                            >
                              View payment link <ArrowUpRight className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ─── HISTORY ──────────────────────────────────────────────────── */}
                    {pkg.history && pkg.history.length > 0 && (
                      <div className="space-y-1.5 sm:space-y-2">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <History className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          History ({pkg.history.length})
                        </p>
                        <div className="space-y-0.5 max-h-24 sm:max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                          {pkg.history.slice().reverse().slice(0, 3).map((h, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 p-1 sm:p-1.5 rounded bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                              <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 mt-1.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-[8px] sm:text-[9px] font-medium text-gray-600 dark:text-gray-300">
                                    {h.action?.replace(/_/g, ' ').toUpperCase() || 'Update'}
                                  </p>
                                  <span className="text-[7px] text-gray-400 dark:text-gray-500">
                                    {formatDate(h.at)}
                                  </span>
                                </div>
                                {h.note && (
                                  <p className="text-[7px] sm:text-[8px] text-gray-400 dark:text-gray-500 line-clamp-1">
                                    {h.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                          {pkg.history.length > 3 && (
                            <p className="text-[7px] text-gray-400 text-center">+{pkg.history.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ─── ACTIONS ──────────────────────────────────────────────────── */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-gray-200/50 dark:border-white/5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[7px] font-mono text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700">
                          {pkg.referenceId}
                        </Badge>
                        <Badge variant="outline" className="text-[7px] text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700">
                          {formatDate(pkg.createdAt)}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 text-[7px] sm:text-[8px] text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 px-1.5"
                          onClick={handleRefresh}
                          disabled={refreshing}
                        >
                          {refreshing ? (
                            <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                          ) : (
                            'Refresh'
                          )}
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 text-[7px] sm:text-[8px] text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 px-1.5"
                        onClick={handleDeleteClick}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <div className="h-2 w-2 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <X className="h-2.5 w-2.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* ─── FULL IMAGE MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedImage && selectedImageUrl && (
          <FullImageModal
            doc={selectedImage}
            imageUrl={selectedImageUrl}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── NEW: Delete Confirmation Modal ────────────────────────────────── */}
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
              className="relative max-w-sm w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-red-200/30 dark:border-red-800/20 p-5 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-3">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" strokeWidth={2} />
              </div>

              <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white">
                Delete Package?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                This action <strong>cannot be undone</strong>. All associated data and documents will be permanently removed.
              </p>
              <p className="text-xs text-red-500 dark:text-red-400 text-center mt-1 font-medium">
                High risk operation
              </p>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-5">
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 rounded-xl border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 h-10 text-sm"
                  onClick={handleCancelDelete}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="w-full sm:flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white h-10 text-sm font-semibold shadow-lg shadow-red-500/25"
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
}

// ─── PackageCard Skeleton ──────────────────────────────────────────────────

export function PackageCardSkeleton() {
  return (
    <div className="animate-pulse">
      <Card className="border border-gray-200/50 dark:border-white/10 bg-gray-50/30 dark:bg-white/5">
        <CardHeader className="p-2.5 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-24 sm:h-3.5 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-2 w-20 sm:h-2.5 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

// ─── PackageCard Empty State ──────────────────────────────────────────────

export function PackageCardEmptyState({ onBrowsePackages }: { onBrowsePackages?: () => void }) {
  return (
    <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-200/60 dark:border-gray-700/40 rounded-xl bg-gray-50/30 dark:bg-gray-800/20">
      <div className="mx-auto mb-2 sm:mb-3 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gray-100/50 dark:bg-white/5">
        <Package className="h-7 w-7 sm:h-8 sm:w-8 text-gray-300 dark:text-gray-600" />
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">No packages yet</h3>
      <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5">Explore our packages and start your journey</p>
      {onBrowsePackages && (
        <Button
          type="button"
          onClick={onBrowsePackages}
          className="mt-3 sm:mt-4 bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 rounded-xl px-4 sm:px-5 text-xs sm:text-sm h-8 sm:h-9"
        >
          <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
          Browse Packages
        </Button>
      )}
    </div>
  );
}

export default PackageCard;