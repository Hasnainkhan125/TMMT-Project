'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  File,
  Calendar,
  User,
  Shield,
  Sparkles,
  Zap,
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
  Upload,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getSocket } from '@/lib/socket';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CheckDocument {
  filename: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
}

export interface Comment {
  text: string;
  author?: string;
  role?: string;
  createdAt: string;
}

export interface RequestedDocument {
  label: string;
  description?: string;
  requestedAt: string;
  status: 'pending' | 'fulfilled' | 'rejected';
  fulfilledAt?: string;
  requestedBy?: string;
}

export interface ResultDocument {
  filename: string;
  originalName?: string;
  size?: number;
  mimeType?: string;
  path?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface HistoryEvent {
  action: string;
  note?: string;
  at: string;
  by?: string;
  byRole?: string;
}

export interface Check {
  id: string;
  serviceId: string;
  serviceType: string;
  status: 'pending' | 'processing' | 'reviewing' | 'requires_documents' | 'completed' | 'failed' | 'cancelled';
  speedTier: 'standard' | 'fast-track';
  documents: CheckDocument[];
  identifiers: Record<string, any>;
  result?: any;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  requestedDocuments?: RequestedDocument[];
  resultDocuments?: ResultDocument[];
  resultSummary?: string;
  resultStatus?: 'clear' | 'flagged' | 'pending';
  history?: HistoryEvent[];
  isFreeService?: boolean;
  amount?: number;
  // Snake case fallback
  requested_documents?: RequestedDocument[];
  history_events?: HistoryEvent[];
  result_documents?: ResultDocument[];
  result_summary?: string;
  result_status?: 'clear' | 'flagged' | 'pending';
  is_free_service?: boolean;
  created_at?: string;
  updated_at?: string;
  service_id?: string;
  service_type?: string;
  speed_tier?: 'standard' | 'fast-track';
  _id?: string;
}

// ─── Status Configuration ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  dotColor: string;
  icon: any;
  description: string;
  gradient: string;
  border: string;
  bg: string;
  textColor: string;
}> = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dotColor: 'bg-amber-500',
    icon: Clock,
    description: 'Your check is queued for processing',
    gradient: 'from-amber-50/80 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10',
    border: 'border-amber-200/50 dark:border-amber-800/30',
    bg: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  processing: {
    label: 'Processing',
    color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    dotColor: 'bg-blue-500',
    icon: Clock,
    description: 'Our team is reviewing your check',
    gradient: 'from-blue-50/80 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10',
    border: 'border-blue-200/50 dark:border-blue-800/30',
    bg: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  reviewing: {
    label: 'Under Review',
    color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    dotColor: 'bg-purple-500',
    icon: Shield,
    description: 'Your check is under detailed review',
    gradient: 'from-purple-50/80 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10',
    border: 'border-purple-200/50 dark:border-purple-800/30',
    bg: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
  requires_documents: {
    label: 'Docs Required',
    color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
    dotColor: 'bg-red-500',
    icon: FileWarning,
    description: 'Additional documents are required',
    gradient: 'from-red-50/80 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10',
    border: 'border-red-200/50 dark:border-red-800/30',
    bg: 'bg-red-100',
    textColor: 'text-red-700',
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    icon: CheckCircle,
    description: 'Check completed successfully',
    gradient: 'from-emerald-50/80 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10',
    border: 'border-emerald-200/50 dark:border-emerald-800/30',
    bg: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
    dotColor: 'bg-red-500',
    icon: AlertCircle,
    description: 'Check could not be completed',
    gradient: 'from-red-50/80 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10',
    border: 'border-red-200/50 dark:border-red-800/30',
    bg: 'bg-red-100',
    textColor: 'text-red-700',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
    dotColor: 'bg-gray-500',
    icon: X,
    description: 'Check has been cancelled',
    gradient: 'from-gray-50/80 to-gray-100/30 dark:from-gray-800/20 dark:to-gray-700/10',
    border: 'border-gray-200/50 dark:border-gray-700/30',
    bg: 'bg-gray-100',
    textColor: 'text-gray-700',
  },
};

// ─── Speed Tier Configuration ───────────────────────────────────────────────

const SPEED_CONFIG = {
  standard: {
    label: 'Standard',
    color: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
    icon: Clock,
    gradient: 'from-gray-50/80 to-gray-100/30 dark:from-gray-800/20 dark:to-gray-700/10',
  },
  'fast-track': {
    label: 'Fast-Track',
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: Zap,
    gradient: 'from-amber-50/80 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10',
  },
};

// ─── Helper Functions ────────────────────────────────────────────────────────

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
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

const getFileIcon = (mimeType?: string, filename?: string) => {
  if (!mimeType && !filename) return FileText;
  const name = filename?.toLowerCase() || '';
  const type = mimeType?.toLowerCase() || '';
  if (type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/)) {
    return Image;
  }
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return FileText;
  }
  if (type.includes('word') || name.match(/\.(doc|docx)$/)) {
    return FileText;
  }
  if (type.includes('excel') || name.match(/\.(xls|xlsx|csv)$/)) {
    return FileText;
  }
  if (type.includes('powerpoint') || name.match(/\.(ppt|pptx)$/)) {
    return FileText;
  }
  if (type.startsWith('text/') || name.match(/\.(txt|md|json|xml|html|css|js)$/)) {
    return FileText;
  }
  return FileIcon;
};

const isImageFile = (mimeType?: string, filename?: string): boolean => {
  const name = filename?.toLowerCase() || '';
  const type = mimeType?.toLowerCase() || '';
  return type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/) !== null;
};

// ─── Normalise requested document ──────────────────────────────────────────

const normalizeRequestedDoc = (doc: any): RequestedDocument => {
  if (typeof doc === 'string') {
    return {
      label: doc,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      description: '',
    };
  }
  return {
    label: doc.label || doc.documentType || doc.type || 'Document',
    description: doc.description || doc.note || doc.comment || '',
    requestedAt: doc.requestedAt || doc.requested_at || new Date().toISOString(),
    status: doc.status || (doc.fulfilledAt ? 'fulfilled' : 'pending'),
    fulfilledAt: doc.fulfilledAt || doc.fulfilled_at,
    requestedBy: doc.requestedBy || doc.requested_by,
  };
};

// ─── Build Document URL ─────────────────────────────────────────────────────

const buildDocumentUrl = (checkId: string, filename: string, path?: string): string => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  if (path) {
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `${apiBase}${path}`;
    return `${apiBase}/${path}`;
  }
  return `${apiBase}/uploads/checks/${checkId}/${filename}`;
};

// ─── Document Preview Modal ─────────────────────────────────────────────────

function DocumentPreviewModal({
  url,
  filename,
  mimeType,
  onClose,
}: {
  url: string;
  filename: string;
  mimeType?: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const isImage = isImageFile(mimeType, filename);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (!isImage) return;
    setLoading(true);
    setError(null);
    fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.blob();
      })
      .then(blob => {
        if (!blob.type.startsWith('image/')) {
          setImageUrl(url);
          setLoading(false);
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        setImageUrl(blobUrl);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load image:', err);
        setError(err.message || 'Failed to load image');
        setLoading(false);
        setImageUrl(url);
      });
  }, [url, isImage]);

  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleDownload = async () => {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });
      if (!response.ok) {
        throw new Error('Download failed');
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      toast.success('Download started');
    } catch (error) {
      console.warn('Blob download failed, using fallback:', error);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              {isImage ? <Image className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{filename}</p>
              {mimeType && <p className="text-xs text-gray-500 dark:text-gray-400">{mimeType}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
              </div>
            </div>
          )}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-6 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <p className="text-red-600 dark:text-red-400 font-medium">Failed to load preview</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{error}</p>
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(url, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2 bg-primary text-white hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
          {isImage && imageUrl && !loading && !error && (
            <img
              src={imageUrl}
              alt={filename}
              className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"
              onError={() => {
                setError('Failed to render image');
                setLoading(false);
              }}
            />
          )}
          {!isImage && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <FileText className="h-16 w-16 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This file type cannot be previewed directly.
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Please download to view the file.
              </p>
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(url, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2 bg-primary text-white hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── CheckCard Component ─────────────────────────────────────────────────────

interface CheckCardProps {
  check: Check;
  onViewResult?: (check: Check) => void;
  onDownloadDocument?: (doc: CheckDocument) => void;
  onDelete?: (checkId: string) => void;
  onRefresh?: () => void;
}

export function CheckCard({ check, onViewResult, onDownloadDocument, onDelete, onRefresh }: CheckCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string; filename: string; mimeType?: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const initialRefreshDone = useRef(false);

  // ── Upload states ────────────────────────────────────────────────────────
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ── General upload (for Uploaded Documents section) ────────────────────
  const [uploadingGeneral, setUploadingGeneral] = useState(false);
  const generalFileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Normalise base data ──────────────────────────────────────────────────
  const id = check.id || check._id || '';
  const serviceType = check.serviceType || check.service_type || 'Check';
  const speedTier = check.speedTier || check.speed_tier || 'standard';
  const createdAt = check.createdAt || check.created_at || new Date().toISOString();
  const documents = check.documents || [];
  const identifiers = check.identifiers || {};
  const result = check.result || null;
  const isFreeService = check.isFreeService ?? check.is_free_service ?? false;
  const amount = check.amount ?? 0;

  // ── Dynamic state (updated via WebSocket and refresh) ──────────────────
  const [status, setStatus] = useState(check.status || 'pending');
  const [requestedDocuments, setRequestedDocuments] = useState<RequestedDocument[]>(() => {
    const raw = check.requestedDocuments || check.requested_documents || [];
    return raw.map(normalizeRequestedDoc);
  });
  const [comments, setComments] = useState<Comment[]>(check.comments || []);
  const [history, setHistory] = useState<HistoryEvent[]>(check.history || check.history_events || []);
  const [resultDocuments, setResultDocuments] = useState<ResultDocument[]>(
    check.resultDocuments || check.result_documents || []
  );
  const [resultSummary, setResultSummary] = useState(check.resultSummary || check.result_summary || '');
  const [resultStatus, setResultStatus] = useState(check.resultStatus || check.result_status || '');

  // ── Computed values ──────────────────────────────────────────────────────
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const speed = SPEED_CONFIG[speedTier as keyof typeof SPEED_CONFIG] || SPEED_CONFIG.standard;
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  const hasResult = isCompleted && result;
  const pendingDocs = requestedDocuments.filter(d => d.status === 'pending').length;
  const hasComments = comments.length > 0;
  const hasHistory = history.length > 0;
  const hasResultDocs = resultDocuments.length > 0;

  const getProgress = () => {
    switch (status) {
      case 'pending': return 25;
      case 'processing': return 50;
      case 'reviewing': return 65;
      case 'requires_documents': return 40;
      case 'completed': return 100;
      case 'failed': return 100;
      case 'cancelled': return 100;
      default: return 0;
    }
  };

  // ── Manual refresh ──────────────────────────────────────────────────────
  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${apiBase}/api/v1/checks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const refreshedCheck = data.data?.check || data.check;
        if (refreshedCheck) {
          setStatus(refreshedCheck.status || 'pending');
          setComments(refreshedCheck.comments || []);
          setHistory(refreshedCheck.history || refreshedCheck.history_events || []);
          setRequestedDocuments(
            (refreshedCheck.requestedDocuments || refreshedCheck.requested_documents || []).map(normalizeRequestedDoc)
          );
          setResultDocuments(refreshedCheck.resultDocuments || refreshedCheck.result_documents || []);
          setResultSummary(refreshedCheck.resultSummary || refreshedCheck.result_summary || '');
          setResultStatus(refreshedCheck.resultStatus || refreshedCheck.result_status || '');
          toast.success('Check refreshed successfully');
          onRefresh?.();
        }
      } else {
        toast.error('Failed to refresh check');
      }
    } catch (error) {
      console.error('Error refreshing check:', error);
      toast.error('Failed to refresh check');
    } finally {
      setRefreshing(false);
    }
  };

  // ── Upload handler for requested documents ──────────────────────────────
  const handleUploadDocument = async (docLabel: string, file: File) => {
    const uploadKey = docLabel;
    if (uploading[uploadKey]) return;

    setUploading(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentLabel', docLabel);

      const res = await fetch(`${apiBase}/api/v1/checks/${id}/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
      }

      toast.success(`Document "${docLabel}" uploaded successfully`);
      await handleRefresh();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(prev => ({ ...prev, [uploadKey]: false }));
      const input = fileInputRefs.current[docLabel];
      if (input) input.value = '';
    }
  };

  // ── General upload handler ──────────────────────────────────────────────
  const handleUploadGeneral = async (file: File) => {
    if (uploadingGeneral) return;
    setUploadingGeneral(true);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${apiBase}/api/v1/checks/${id}/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
      }

      toast.success('Document uploaded successfully');
      await handleRefresh();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploadingGeneral(false);
      if (generalFileInputRef.current) generalFileInputRef.current.value = '';
    }
  };

  // ── Auto-refresh on expand ──────────────────────────────────────────────
  useEffect(() => {
    if (expanded && !initialRefreshDone.current) {
      initialRefreshDone.current = true;
      handleRefresh();
    }
    if (!expanded) {
      initialRefreshDone.current = false;
    }
  }, [expanded]);

  // ── WebSocket listeners ──────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();

    const handleDocumentRequest = (data: any) => {
      if (data.checkId !== id) return;
      const docs = data.requestedDocuments || [];
      const newDocs = docs.map((d: any) => normalizeRequestedDoc(d));
      setRequestedDocuments(prev => [...prev, ...newDocs]);
      toast.warning('New documents requested', {
        description: newDocs.map(d => d.label).join(', '),
      });
    };

    const handleCommentAdded = (data: any) => {
      if (data.checkId !== id) return;
      const newComment = data.comment;
      if (newComment) {
        setComments(prev => [...prev, newComment]);
        toast.info('New comment added');
      }
    };

    const handleStatusUpdate = (data: any) => {
      if (data.checkId !== id) return;
      setStatus(data.status);
      toast.success(`Status updated to ${data.status}`);
    };

    const handleResultUpload = (data: any) => {
      if (data.checkId !== id) return;
      if (data.resultDocuments) {
        setResultDocuments(prev => [...prev, ...data.resultDocuments]);
      }
      if (data.resultSummary) setResultSummary(data.resultSummary);
      if (data.resultStatus) setResultStatus(data.resultStatus);
      toast.success('New results available');
    };

    const handleCheckUpdated = (data: any) => {
      if (data.checkId !== id && data._id !== id) return;
      if (data.check) {
        const updated = data.check;
        setStatus(updated.status || 'pending');
        setComments(updated.comments || []);
        setHistory(updated.history || updated.history_events || []);
        setRequestedDocuments(
          (updated.requestedDocuments || updated.requested_documents || []).map(normalizeRequestedDoc)
        );
        setResultDocuments(updated.resultDocuments || updated.result_documents || []);
        setResultSummary(updated.resultSummary || updated.result_summary || '');
        setResultStatus(updated.resultStatus || updated.result_status || '');
        toast.info('Check updated');
      } else {
        handleRefresh();
      }
    };

    socket.on('document_requested', handleDocumentRequest);
    socket.on('comment_added', handleCommentAdded);
    socket.on('status_updated', handleStatusUpdate);
    socket.on('result_uploaded', handleResultUpload);
    socket.on('check_updated', handleCheckUpdated);

    return () => {
      socket.off('document_requested', handleDocumentRequest);
      socket.off('comment_added', handleCommentAdded);
      socket.off('status_updated', handleStatusUpdate);
      socket.off('result_uploaded', handleResultUpload);
      socket.off('check_updated', handleCheckUpdated);
    };
  }, [id]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success('Check ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${apiBase}/api/v1/checks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Check deleted successfully');
      onDelete?.(id);
    } catch (error) {
      toast.error('Failed to delete check');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDocument = (url: string, filename: string, mimeType?: string) => {
    setPreviewFile({ url, filename, mimeType });
  };

  const handleDownloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });
      if (!response.ok) {
        throw new Error('Download failed');
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      toast.success('Download started');
    } catch (error) {
      console.warn('Blob download failed, using fallback:', error);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

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
            "border transition-all duration-300",
            "bg-gradient-to-br",
            statusConfig.gradient,
            statusConfig.border,
            "backdrop-blur-sm"
          )}
        >
          {/* Header */}
          <CardHeader
            className="cursor-pointer hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-300 rounded-t-xl p-2.5 sm:p-4"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className={cn(
                    "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border-2",
                    statusConfig.color,
                    "transition-all duration-300 group-hover:scale-110"
                  )}>
                    <StatusIcon className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
                  </div>
                  {status === 'processing' && (
                    <div className="absolute -top-0.5 -right-0.5">
                      <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-blue-500"></span>
                      </span>
                    </div>
                  )}
                  {status === 'completed' && (
                    <div className="absolute -top-0.5 -right-0.5">
                      <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                        <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <p className="font-semibold text-xs sm:text-sm truncate text-gray-900 dark:text-white">
                      {serviceType}
                    </p>
                    <Badge className={cn(
                      "text-[8px] sm:text-[10px] font-medium border",
                      status === 'requires_documents'
                        ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700"
                        : statusConfig.color
                    )}>
                      <StatusIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                      {statusConfig.label}
                    </Badge>
                    <Badge className={cn("text-[8px] sm:text-[10px] font-medium", speed.color)}>
                      <speed.icon className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                      {speed.label}
                    </Badge>
                    {pendingDocs > 0 && (
                      <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 text-[8px] sm:text-[10px] font-medium">
                        <FileWarning className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                        {pendingDocs} pending
                      </Badge>
                    )}
                    {isFreeService && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[8px] sm:text-[10px] font-medium">
                        Free
                      </Badge>
                    )}
                    {amount > 0 && !isFreeService && (
                      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[8px] sm:text-[10px] font-medium">
                        <DollarSign className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                        AED {amount}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden xs:inline">{formatDate(createdAt)}</span>
                    <span className="xs:hidden">{new Date(createdAt).toLocaleDateString()}</span>
                    <span className="h-2.5 w-px sm:h-3 bg-gray-200 dark:bg-gray-700" />
                    <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span>{documents.length}</span>
                    {hasComments && (
                      <>
                        <span className="h-2.5 w-px sm:h-3 bg-gray-200 dark:bg-gray-700" />
                        <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />
                        <span>{comments.length}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="hidden sm:block w-16 md:w-20">
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300"
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

          {/* Expanded Content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <CardContent className="pt-0 pb-3 sm:pb-4 px-2.5 sm:px-4">
                  <div className="border-t border-gray-200/50 dark:border-white/10 pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                    {/* Status Description */}
                    <div className={cn(
                      "flex items-center gap-2 sm:gap-3 text-xs sm:text-sm p-2 sm:p-3 rounded-xl border flex-wrap",
                      status === 'requires_documents'
                        ? "bg-red-50/80 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30"
                        : "bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/5"
                    )}>
                      <div className={cn(
                        "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0",
                        status === 'requires_documents' ? "bg-red-500" : statusConfig.dotColor
                      )} />
                      <span className={cn(
                        "text-[11px] sm:text-sm",
                        status === 'requires_documents' ? "text-red-700 dark:text-red-400" : "text-gray-600 dark:text-gray-300"
                      )}>
                        {statusConfig.description}
                      </span>
                      {status === 'requires_documents' && (
                        <Badge className="ml-auto bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30 text-[8px] sm:text-[10px] shrink-0">
                          <FileWarning className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                          Action Required
                        </Badge>
                      )}
                      {speedTier === 'fast-track' && (
                        <Badge className="ml-auto bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[8px] sm:text-[10px] shrink-0">
                          <Zap className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                          Priority
                        </Badge>
                      )}
                      {resultStatus && (
                        <Badge className={cn(
                          "text-[8px] sm:text-[10px] shrink-0",
                          resultStatus === 'clear' ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
                          resultStatus === 'flagged' ? "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30" :
                          "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        )}>
                          <BadgeCheck className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                          {resultStatus}
                        </Badge>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Progress</span>
                        <span className="font-medium">{getProgress()}%</span>
                      </div>
                      <div className="relative h-1.5 sm:h-2 rounded-full overflow-hidden bg-gray-200/50 dark:bg-gray-700/50">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgress()}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className={cn(
                            "h-full rounded-full",
                            status === 'completed' ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                            status === 'failed' || status === 'cancelled' ? "bg-gradient-to-r from-red-500 to-red-400" :
                            status === 'processing' ? "bg-gradient-to-r from-blue-500 to-blue-400" :
                            status === 'reviewing' ? "bg-gradient-to-r from-purple-500 to-purple-400" :
                            status === 'requires_documents' ? "bg-gradient-to-r from-red-500 to-red-400" :
                            "bg-gradient-to-r from-amber-500 to-amber-400"
                          )}
                        />
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="space-y-2 sm:space-y-3 p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                          <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Check Details
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center justify-between text-[11px] sm:text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Check ID</span>
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <span className="font-mono text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">{id.slice(0, 8)}...</span>
                              <button
                                onClick={handleCopyId}
                                className="p-0.5 sm:p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Copy ID"
                              >
                                {copied ? (
                                  <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between text-[11px] sm:text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Service</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300 text-[10px] sm:text-sm">{serviceType}</span>
                          </div>
                          <div className="flex justify-between text-[11px] sm:text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Speed</span>
                            <Badge className={cn("text-[8px] sm:text-[10px]", speed.color)}>
                              {speed.label}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-[11px] sm:text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Type</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300 text-[10px] sm:text-sm">
                              {isFreeService ? 'Free Service' : `AED ${amount || 0}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Identifiers */}
                      {identifiers && Object.keys(identifiers).length > 0 && (
                        <div className="space-y-2 sm:space-y-3 p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                          <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                            <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            Submitted Data
                          </p>
                          <div className="space-y-1.5 sm:space-y-2">
                            {Object.entries(identifiers).slice(0, 3).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-[11px] sm:text-sm">
                                <span className="text-gray-500 dark:text-gray-400 capitalize text-[10px] sm:text-sm">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px] sm:max-w-[140px] text-[10px] sm:text-sm">
                                  {typeof value === 'string' ? value : JSON.stringify(value)}
                                </span>
                              </div>
                            ))}
                            {Object.keys(identifiers).length > 3 && (
                              <div className="text-[8px] sm:text-xs text-gray-400 dark:text-gray-500 text-center pt-0.5 sm:pt-1">
                                +{Object.keys(identifiers).length - 3} more fields
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ─── REQUESTED DOCUMENTS ─────────────────────────────────────── */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                          <FileWarning className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500" />
                          Requested Documents ({pendingDocs} pending)
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/20 transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRefresh();
                          }}
                          disabled={refreshing}
                        >
                          {refreshing ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 mr-1" />
                              Refresh
                            </>
                          )}
                        </Button>
                      </div>

                      {requestedDocuments.length > 0 ? (
                        <div className="space-y-1.5 sm:space-y-2">
                          {requestedDocuments.map((doc, idx) => {
                            const isPending = doc.status === 'pending';
                            const isFulfilled = doc.status === 'fulfilled' || doc.fulfilledAt;
                            const isUploading = uploading[doc.label] || false;

                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "flex items-center justify-between p-2 sm:p-2.5 rounded-xl border",
                                  isPending ? "bg-red-50/80 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30" :
                                  isFulfilled ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30" :
                                  "bg-gray-50/80 dark:bg-gray-800/20 border-gray-200/50 dark:border-gray-700/30"
                                )}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <FileText className={cn(
                                      "h-3 w-3",
                                      isPending ? "text-red-500 dark:text-red-400" : "text-emerald-500 dark:text-emerald-400"
                                    )} />
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">
                                      {doc.label || 'Document'}
                                    </p>
                                  </div>
                                  {doc.description && (
                                    <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 ml-5">
                                      {doc.description}
                                    </p>
                                  )}
                                  <p className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 ml-5">
                                    {isPending ? '⏳ Pending' : '✅ Fulfilled'}
                                  </p>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {isPending && (
                                    <>
                                      <input
                                        type="file"
                                        ref={(el) => {
                                          fileInputRefs.current[doc.label] = el;
                                        }}
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            handleUploadDocument(doc.label, file);
                                          }
                                        }}
                                        disabled={isUploading}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                          "h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-lg",
                                          isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                        )}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          fileInputRefs.current[doc.label]?.click();
                                        }}
                                        disabled={isUploading}
                                        title="Upload document"
                                      >
                                        {isUploading ? (
                                          <div className="h-3 w-3 sm:h-3.5 sm:w-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <Upload className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500 dark:text-blue-400" />
                                        )}
                                      </Button>
                                    </>
                                  )}

                                  <Badge className={cn(
                                    "text-[8px] sm:text-[10px]",
                                    isPending ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" :
                                    isFulfilled ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
                                    "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30"
                                  )}>
                                    {isPending ? 'Pending' : 'Fulfilled'}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            No documents have been requested yet.
                          </p>
                          {status === 'requires_documents' && (
                            <p className="text-[10px] text-amber-500 dark:text-amber-400 mt-1">
                              This check is marked as "Docs Required" - try refreshing.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ─── COMMENTS ────────────────────────────────────────────────── */}
                    {comments.length > 0 && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                            <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />
                            Comments ({comments.length})
                          </p>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-48 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                          {comments.slice().reverse().map((comment, idx) => (
                            <div key={idx} className="p-2 sm:p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">
                                  {comment.role || comment.author || 'Officer'}
                                </p>
                                <span className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                                {comment.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ─── Result Documents ────────────────────────────────────────── */}
                    {resultDocuments.length > 0 && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                            <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-500" />
                            Result Documents ({resultDocuments.length})
                          </p>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          {resultDocuments.map((doc, idx) => {
                            const fileUrl = buildDocumentUrl(id, doc.filename, doc.path);
                            const isImage = isImageFile(doc.mimeType, doc.originalName || doc.filename);
                            const FileIconComp = getFileIcon(doc.mimeType, doc.originalName || doc.filename);
                            return (
                              <div key={idx} className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                                <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                                  <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                                    <FileIconComp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] sm:text-xs font-medium text-emerald-900 dark:text-emerald-300 truncate">
                                      {doc.originalName || doc.filename || 'Result Document'}
                                    </p>
                                    {doc.size && (
                                      <p className="text-[8px] sm:text-[10px] text-emerald-600/70 dark:text-emerald-400/70">
                                        {formatBytes(doc.size)} • {formatDate(doc.uploadedAt)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                                    onClick={() => handleViewDocument(fileUrl, doc.originalName || doc.filename || 'document', doc.mimeType)}
                                    title="View document"
                                  >
                                    <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                                    onClick={() => handleDownloadFile(fileUrl, doc.originalName || doc.filename || 'document')}
                                    title="Download document"
                                  >
                                    <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ─── Result Summary ──────────────────────────────────────────── */}
                    {resultSummary && (
                      <div className="p-2 sm:p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                          <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Result Summary
                        </p>
                        <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                          {resultSummary}
                        </p>
                      </div>
                    )}

                    {/* ─── HISTORY ──────────────────────────────────────────────────── */}
                    {history.length > 0 && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                            <History className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            History ({history.length})
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/20 transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRefresh();
                            }}
                            disabled={refreshing}
                          >
                            {refreshing ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                Refresh
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="space-y-1 sm:space-y-1.5 max-h-32 sm:max-h-48 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                          {history.slice().reverse().map((event, idx) => (
                            <div key={idx} className="flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-1.5 sm:mt-2 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">
                                    {event.action?.replace(/_/g, ' ').toUpperCase() || 'Update'}
                                  </p>
                                  <span className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                                    {formatDate(event.at)}
                                  </span>
                                </div>
                                {event.note && (
                                  <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {event.note}
                                  </p>
                                )}
                                {event.byRole && (
                                  <p className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                    by {event.byRole}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ─── UPLOADED DOCUMENTS (always visible) ────────────────────── */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                          <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Uploaded Documents ({documents.length})
                        </p>
                        {/* Add Document button always visible */}
                        <>
                          <input
                            type="file"
                            ref={generalFileInputRef}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadGeneral(file);
                              }
                            }}
                            disabled={uploadingGeneral}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/20 transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              generalFileInputRef.current?.click();
                            }}
                            disabled={uploadingGeneral}
                          >
                            {uploadingGeneral ? (
                              <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-1" />
                            ) : (
                              <Plus className="h-3 w-3 mr-1" />
                            )}
                            Add Document
                          </Button>
                        </>
                      </div>

                      {documents.length > 0 ? (
                        <div className="space-y-1.5 sm:space-y-2">
                          {documents.map((doc, index) => {
                            const fileUrl = buildDocumentUrl(id, doc.filename, doc.path);
                            const isImage = isImageFile(doc.mimeType, doc.originalName || doc.filename);
                            const FileIconComp = getFileIcon(doc.mimeType, doc.originalName || doc.filename);
                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5"
                              >
                                <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                                  <div className="p-1 sm:p-1.5 rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0">
                                    <FileIconComp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] sm:text-xs truncate font-medium text-gray-700 dark:text-gray-300">
                                      {doc.originalName || doc.filename || 'Document'}
                                    </p>
                                    {doc.size && (
                                      <p className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                                        {formatBytes(doc.size)} • {doc.mimeType || 'Unknown type'}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20"
                                    onClick={() => handleViewDocument(fileUrl, doc.originalName || doc.filename || 'document', doc.mimeType)}
                                    title="View document"
                                  >
                                    <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 hover:text-primary transition-colors" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20"
                                    onClick={() => handleDownloadFile(fileUrl, doc.originalName || doc.filename || 'document')}
                                    title="Download document"
                                  >
                                    <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 hover:text-primary transition-colors" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            No documents uploaded yet. Click "Add Document" to upload.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ─── Result ──────────────────────────────────────────────────── */}
                    {isCompleted && hasResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30 p-3 sm:p-4 space-y-2 sm:space-y-3"
                      >
                        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-500/20 dark:bg-emerald-500/30">
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm sm:text-base">Result Ready</p>
                            <p className="text-[10px] sm:text-xs text-emerald-600/70 dark:text-emerald-400/70">
                              Check completed successfully
                            </p>
                          </div>
                          <Badge className="ml-auto bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[8px] sm:text-[10px]">
                            <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                            Verified
                          </Badge>
                        </div>

                        {typeof result === 'object' && result !== null ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-sm bg-white/50 dark:bg-black/20 rounded-lg p-2 sm:p-3">
                            {Object.entries(result).slice(0, 4).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center py-0.5 sm:py-1">
                                <span className="text-gray-500 dark:text-gray-400 capitalize text-[9px] sm:text-xs">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="font-medium text-gray-700 dark:text-gray-300 text-[9px] sm:text-xs">
                                  {String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] sm:text-sm text-emerald-700 dark:text-emerald-400 bg-white/50 dark:bg-black/20 rounded-lg p-2 sm:p-3">
                            {String(result)}
                          </p>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30 transition-all duration-300 text-[10px] sm:text-sm h-8 sm:h-9"
                          onClick={() => onViewResult?.(check)}
                        >
                          <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                          View Full Result
                          <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-1 sm:ml-1.5 opacity-50" />
                        </Button>
                      </motion.div>
                    )}

                    {/* ─── Failed State ─────────────────────────────────────────────── */}
                    {isFailed && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl bg-gradient-to-br from-red-50/80 to-red-100/30 dark:from-red-950/30 dark:to-red-900/20 border border-red-200/50 dark:border-red-800/30 p-3 sm:p-4 space-y-2 sm:space-y-3"
                      >
                        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-red-500/20 dark:bg-red-500/30">
                            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-red-700 dark:text-red-400 text-sm sm:text-base">Check Failed</p>
                            <p className="text-[10px] sm:text-xs text-red-600/70 dark:text-red-400/70">
                              Please review the error below
                            </p>
                          </div>
                        </div>
                        <p className="text-[11px] sm:text-sm text-red-600 dark:text-red-400 bg-white/50 dark:bg-black/20 rounded-lg p-2 sm:p-3">
                          {result?.message || 'Please contact support for assistance.'}
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 transition-all duration-300 text-[10px] sm:text-sm h-8 sm:h-9"
                            onClick={() => window.location.href = '/contact'}
                          >
                            <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                            Contact Support
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-[10px] sm:text-sm h-8 sm:h-9"
                            onClick={() => {
                              toast.info('Retrying check...');
                            }}
                          >
                            <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                            Retry
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* ─── Actions ──────────────────────────────────────────────────── */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 pt-2 border-t border-gray-200/50 dark:border-white/5">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[7px] sm:text-[9px] font-mono text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                          ID: {id.slice(0, 6).toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-[7px] sm:text-[9px] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                          {formatDate(createdAt)}
                        </Badge>
                        {amount > 0 && !isFreeService && (
                          <Badge variant="outline" className="text-[7px] sm:text-[9px] text-amber-600 dark:text-amber-400 border-amber-500/30">
                            AED {amount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 sm:h-7 text-[8px] sm:text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 px-2 sm:px-3"
                          onClick={handleDelete}
                          disabled={deleting}
                        >
                          {deleting ? (
                            <>
                              <div className="h-2 w-2 sm:h-3 sm:w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-1 sm:mr-1.5" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <DocumentPreviewModal
            url={previewFile.url}
            filename={previewFile.filename}
            mimeType={previewFile.mimeType}
            onClose={() => setPreviewFile(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── CheckCard Skeleton ─────────────────────────────────────────────────────

export function CheckCardSkeleton() {
  return (
    <div className="animate-pulse">
      <Card className="border border-gray-200/50 dark:border-white/10 bg-gray-50/30 dark:bg-white/5">
        <CardHeader className="p-2.5 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-1.5 sm:space-y-2">
              <div className="h-3.5 w-24 sm:h-4 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-2.5 w-20 sm:h-3 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

// ─── CheckCard Empty State ──────────────────────────────────────────────────

export function CheckCardEmptyState({ onStartCheck }: { onStartCheck?: () => void }) {
  return (
    <div className="text-center py-12 sm:py-16 border-2 border-dashed border-gray-200/60 dark:border-white/10 rounded-2xl bg-gray-50/30 dark:bg-white/5">
      <div className="mx-auto mb-3 sm:mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gray-100/50 dark:bg-white/5">
        <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 dark:text-gray-600" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">No checks yet</h3>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto px-4">
        Start your first check to verify your UAE status
      </p>
      {onStartCheck && (
        <Button
          onClick={onStartCheck}
          className="mt-4 sm:mt-6 bg-gradient-to-r from-[#0D1F3C] to-[#1a2a4a] text-white rounded-xl px-4 sm:px-6 transition-all duration-300 text-sm sm:text-base h-9 sm:h-10"
        >
          <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          Start a Check
        </Button>
      )}
    </div>
  );
}

export default CheckCard;