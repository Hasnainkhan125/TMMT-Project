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
<<<<<<< HEAD
  File,
  Calendar,
  User,
  Shield,
  Sparkles,
=======
  Calendar,
  User,
  Shield,
>>>>>>> 0bb91c2 (tmmt update frontend)
  Zap,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  X,
  RefreshCw,
  DollarSign,
<<<<<<< HEAD
  History,
=======
>>>>>>> 0bb91c2 (tmmt update frontend)
  BadgeCheck,
  FileWarning,
  Image,
  FileIcon,
  Upload,
<<<<<<< HEAD
  Plus,
=======
  Send,
  Paperclip,
>>>>>>> 0bb91c2 (tmmt update frontend)
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
=======
import { Textarea } from '@/components/ui/textarea';
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
  text: string;
  author?: string;
  role?: string;
  createdAt: string;
=======
  _id?: string;
  text: string;
  message?: string;
  author?: string;
  authorName?: string;
  role?: string;
  createdAt: string;
  at?: string;
  by?: 'admin' | 'customer' | 'system';
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
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
=======
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30',
    dotColor: 'bg-amber-400',
    icon: Clock,
    description: 'Your check is queued for processing',
    gradient: 'from-amber-50/50 to-amber-100/20 dark:from-amber-950/10 dark:to-amber-900/5',
    border: 'border-amber-200/40 dark:border-amber-800/20',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    textColor: 'text-amber-700 dark:text-amber-400',
  },
  processing: {
    label: 'Processing',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30',
    dotColor: 'bg-blue-400',
    icon: Clock,
    description: 'Our team is reviewing your check',
    gradient: 'from-blue-50/50 to-blue-100/20 dark:from-blue-950/10 dark:to-blue-900/5',
    border: 'border-blue-200/40 dark:border-blue-800/20',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    textColor: 'text-blue-700 dark:text-blue-400',
  },
  reviewing: {
    label: 'Under Review',
    color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/30',
    dotColor: 'bg-purple-400',
    icon: Shield,
    description: 'Your check is under detailed review',
    gradient: 'from-purple-50/50 to-purple-100/20 dark:from-purple-950/10 dark:to-purple-900/5',
    border: 'border-purple-200/40 dark:border-purple-800/20',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    textColor: 'text-purple-700 dark:text-purple-400',
  },
  requires_documents: {
    label: 'Docs Required',
    color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/30',
    dotColor: 'bg-rose-400',
    icon: FileWarning,
    description: 'Additional documents are required',
    gradient: 'from-rose-50/50 to-rose-100/20 dark:from-rose-950/10 dark:to-rose-900/5',
    border: 'border-rose-200/40 dark:border-rose-800/20',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    textColor: 'text-rose-700 dark:text-rose-400',
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30',
    dotColor: 'bg-emerald-400',
    icon: CheckCircle,
    description: 'Check completed successfully',
    gradient: 'from-emerald-50/50 to-emerald-100/20 dark:from-emerald-950/10 dark:to-emerald-900/5',
    border: 'border-emerald-200/40 dark:border-emerald-800/20',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border-red-200/50 dark:border-red-800/30',
    dotColor: 'bg-red-400',
    icon: AlertCircle,
    description: 'Check could not be completed',
    gradient: 'from-red-50/50 to-red-100/20 dark:from-red-950/10 dark:to-red-900/5',
    border: 'border-red-200/40 dark:border-red-800/20',
    bg: 'bg-red-50 dark:bg-red-950/20',
    textColor: 'text-red-700 dark:text-red-400',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-50 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200/50 dark:border-gray-700/30',
    dotColor: 'bg-gray-400',
    icon: X,
    description: 'Check has been cancelled',
    gradient: 'from-gray-50/50 to-gray-100/20 dark:from-gray-800/10 dark:to-gray-700/5',
    border: 'border-gray-200/40 dark:border-gray-700/20',
    bg: 'bg-gray-50 dark:bg-gray-800/20',
    textColor: 'text-gray-600 dark:text-gray-400',
>>>>>>> 0bb91c2 (tmmt update frontend)
  },
};

// ─── Speed Tier Configuration ───────────────────────────────────────────────

const SPEED_CONFIG = {
  standard: {
    label: 'Standard',
<<<<<<< HEAD
    color: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
    icon: Clock,
    gradient: 'from-gray-50/80 to-gray-100/30 dark:from-gray-800/20 dark:to-gray-700/10',
  },
  'fast-track': {
    label: 'Fast-Track',
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: Zap,
    gradient: 'from-amber-50/80 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10',
=======
    color: 'bg-gray-50 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200/50 dark:border-gray-700/30',
    icon: Clock,
    gradient: 'from-gray-50/50 to-gray-100/20 dark:from-gray-800/10 dark:to-gray-700/5',
  },
  'fast-track': {
    label: 'Fast-Track',
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30',
    icon: Zap,
    gradient: 'from-amber-50/50 to-amber-100/20 dark:from-amber-950/10 dark:to-amber-900/5',
>>>>>>> 0bb91c2 (tmmt update frontend)
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

<<<<<<< HEAD
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

=======
>>>>>>> 0bb91c2 (tmmt update frontend)
const isImageFile = (mimeType?: string, filename?: string): boolean => {
  const name = filename?.toLowerCase() || '';
  const type = mimeType?.toLowerCase() || '';
  return type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/) !== null;
};
<<<<<<< HEAD

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

=======
// ─── Build Document URL ─────────────────────────────────────────────────────
>>>>>>> 0bb91c2 (tmmt update frontend)
// ─── Build Document URL ─────────────────────────────────────────────────────

const buildDocumentUrl = (checkId: string, filename: string, path?: string): string => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
<<<<<<< HEAD
  if (path) {
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `${apiBase}${path}`;
    return `${apiBase}/${path}`;
  }
  return `${apiBase}/uploads/checks/${checkId}/${filename}`;
};

=======
  
  console.log('🔍 Building document URL:', { checkId, filename, path });
  
  // If we have a path
  if (path) {
    // If it's already a full URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
      console.log('✅ Using full URL:', path);
      return path;
    }
    
    // If it starts with /api/v1/
    if (path.startsWith('/api/v1/')) {
      const url = `${apiBase}${path}`;
      console.log('✅ Using API v1 path:', url);
      return url;
    }
    
    // If it starts with /uploads/ - serve directly without /api/v1
    if (path.startsWith('/uploads/')) {
      const url = `${apiBase}${path}`;
      console.log('✅ Using uploads path:', url);
      return url;
    }
    
    // If it starts with just /
    if (path.startsWith('/')) {
      const url = `${apiBase}${path}`;
      console.log('✅ Using absolute path:', url);
      return url;
    }
    
    // If it contains 'uploads' but doesn't start with /
    if (path.includes('uploads')) {
      const url = `${apiBase}/${path}`;
      console.log('✅ Using path with uploads:', url);
      return url;
    }
  }
  
  // Just filename - try multiple possible locations
  if (filename) {
    // Try different URL patterns - prioritize /uploads/ over /api/v1/uploads/
    const urls = [
      `${apiBase}/uploads/checks/${filename}`,  // Direct uploads (most likely)
      `${apiBase}/uploads/checks/${checkId}/${filename}`,
      `${apiBase}/uploads/${filename}`,
      `${apiBase}/api/v1/uploads/checks/${filename}`,  // API endpoint (least likely)
      `${apiBase}/api/v1/uploads/checks/${checkId}/${filename}`,
    ];
    
    console.log('📁 Trying URLs:', urls);
    return urls[0]; // Return the most likely one first
  }
  
  console.warn('⚠️ No valid path found for document');
  return `${apiBase}/uploads/checks/${filename}`;
};
// ─── Document Thumbnail Component ────────────────────────────────────────────

interface DocumentThumbnailProps {
  document: CheckDocument | ResultDocument;
  checkId: string;
  onPreview: (url: string, filename: string, mimeType?: string) => void;
  onDownload: (url: string, filename: string) => void;
}
// ─── Document Thumbnail Component - SMALL VERSION ────────────────────────────

function DocumentThumbnail({ document, checkId, onPreview, onDownload }: DocumentThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  const filename = document.originalName || document.filename || 'file';
  const fileUrl = buildDocumentUrl(checkId, document.filename, document.path);
  const isImage = isImageFile(document.mimeType, filename);
  
  const handlePreview = () => {
    onPreview(fileUrl, filename, document.mimeType);
  };
  
  const handleDownload = () => {
    onDownload(fileUrl, filename);
  };

  const handleImageError = () => {
    console.error('❌ Image failed to load:', fileUrl);
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      const img = document.querySelector(`img[src="${fileUrl}"]`) as HTMLImageElement;
      if (img) {
        img.src = `${fileUrl}?t=${Date.now()}`;
      }
    } else {
      setImageError(true);
      setLoading(false);
    }
  };

  return (
    <div className="group relative rounded-lg border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600">
      {/* Thumbnail Area - SMALLER */}
      <div className="relative aspect-square w-full bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
        {isImage && !imageError ? (
          <>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            )}
            <img
              src={fileUrl}
              alt={filename}
              className={`h-full w-full object-cover transition-opacity duration-300 group-hover:scale-105 ${
                loading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => {
                console.log('✅ Image loaded successfully:', fileUrl);
                setLoading(false);
              }}
              onError={handleImageError}
              loading="lazy"
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <FileText className="h-5 w-5 text-gray-300 dark:text-gray-600" />
            <p className="text-[6px] text-gray-400 mt-0.5">
              {imageError ? 'Failed' : document.mimeType?.split('/').pop()?.toUpperCase() || 'FILE'}
            </p>
          </div>
        )}
        
        {/* Hover Overlay - SMALLER BUTTONS */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full bg-white/20 text-white hover:bg-white/40 hover:text-white transition-all"
            onClick={handlePreview}
            title="Preview"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full bg-white/20 text-white hover:bg-white/40 hover:text-white transition-all"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Filename - SMALLER TEXT */}
      <div className="p-1.5 truncate">
        <p className="text-[8px] font-medium text-gray-700 dark:text-gray-300 truncate" title={filename}>
          {filename}
        </p>
        {document.size && (
          <p className="text-[6px] text-gray-400 dark:text-gray-500">
            {formatBytes(document.size)}
          </p>
        )}
      </div>
    </div>
  );
}
>>>>>>> 0bb91c2 (tmmt update frontend)
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

<<<<<<< HEAD
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
=======
  // Load image for preview
  useEffect(() => {
    if (!isImage) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('authToken') || '';
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    
    // Extract filename from URL for fallback
    const urlParts = url.split('/');
    const filenameFromUrl = urlParts[urlParts.length - 1];
    
    // Try multiple URL patterns
    const urlsToTry = [
      url, // Original URL
      `${apiBase}/uploads/checks/${filenameFromUrl}`, // Without /api/v1
      `${apiBase}/uploads/${filenameFromUrl}`, // Direct uploads
    ];
    
    console.log('🔍 Trying URLs for preview:', urlsToTry);
    
    let currentTry = 0;
    
    const tryFetch = (urlIndex: number) => {
      if (urlIndex >= urlsToTry.length) {
        console.error('❌ All URLs failed');
        setError('Failed to load image after multiple attempts');
        setLoading(false);
        // Try direct URL as last resort
        setImageUrl(url);
        return;
      }
      
      const currentUrl = urlsToTry[urlIndex];
      console.log(`📥 Attempt ${urlIndex + 1}: Fetching ${currentUrl}`);
      
      fetch(currentUrl, {
        headers: token ? {
          Authorization: `Bearer ${token}`,
        } : {},
      })
        .then(response => {
          console.log(`📥 Response ${urlIndex + 1}:`, { 
            url: currentUrl, 
            status: response.status, 
            ok: response.ok,
            contentType: response.headers.get('content-type')
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          console.log(`📦 Blob received from ${currentUrl}:`, { 
            type: blob.type, 
            size: blob.size 
          });
          
          if (!blob.type.startsWith('image/')) {
            // Not an image, but we can still show it
            setImageUrl(currentUrl);
            setLoading(false);
            return;
          }
          
          const blobUrl = URL.createObjectURL(blob);
          setImageUrl(blobUrl);
          setLoading(false);
        })
        .catch(err => {
          console.warn(`❌ Attempt ${urlIndex + 1} failed:`, err.message);
          // Try next URL
          tryFetch(urlIndex + 1);
        });
    };
    
    // Start trying URLs
    tryFetch(0);
    
>>>>>>> 0bb91c2 (tmmt update frontend)
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
<<<<<<< HEAD
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
=======
  }, [url, isImage]);

  // ─── FIXED DOWNLOAD FUNCTION ──────────────────────────────────────────────
  const handleDownload = () => {
    try {
      // Create a temporary anchor element
>>>>>>> 0bb91c2 (tmmt update frontend)
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
<<<<<<< HEAD
=======
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
=======
          
>>>>>>> 0bb91c2 (tmmt update frontend)
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-6 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <p className="text-red-600 dark:text-red-400 font-medium">Failed to load preview</p>
<<<<<<< HEAD
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{error}</p>
              <div className="flex gap-3 mt-4">
=======
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-md">
                {error}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 break-all">
                URL: {url}
              </p>
              <div className="flex gap-3 mt-4 flex-wrap justify-center">
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
=======
          
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
=======
          
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
=======
// ─── Helper to determine if a comment is from admin ──────────────────────

const isAdminComment = (comment: Comment): boolean => {
  if (comment.by === 'customer') return false;
  if (comment.by === 'admin' || comment.by === 'system') return true;
  if (comment.role === 'customer') return false;
  if (comment.role === 'admin' || comment.role === 'officer' || comment.role === 'amer') return true;
  if (comment.authorName?.toLowerCase().includes('admin')) return true;
  if (comment.author?.toLowerCase().includes('admin')) return true;
  return false;
};

// ─── Chat Message Component ──────────────────────────────────────────────────

interface ChatMessageProps {
  message: Comment;
  isAdmin: boolean;
}

function ChatMessage({ message, isAdmin }: ChatMessageProps) {
  const senderName = isAdmin ? 'Admin' : 'You';
  const time = new Date(message.createdAt || message.at || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={cn("flex items-start gap-2 mb-1.5", isAdmin ? "justify-start" : "justify-end")}>
      {isAdmin && (
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 text-[8px] font-bold">A</div>
        </div>
      )}
      <div className={cn(
        "max-w-[80%] rounded-xl px-2.5 py-1.5 text-xs",
        isAdmin
          ? "bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700"
          : "bg-blue-50 dark:bg-blue-950/40 text-gray-800 dark:text-gray-200"
      )}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-medium text-[9px]">{senderName}</span>
          <span className="text-[7px] text-gray-400">{time}</span>
        </div>
        <p className="leading-relaxed text-[11px]">{message.text || message.message}</p>
      </div>
      {!isAdmin && (
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-[8px] font-bold">Y</div>
        </div>
      )}
    </div>
  );
}
>>>>>>> 0bb91c2 (tmmt update frontend)

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

<<<<<<< HEAD
=======
  // ── Toggle states for collapsible sections ──────────────────────────────
  const [showComments, setShowComments] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);

>>>>>>> 0bb91c2 (tmmt update frontend)
  // ── Upload states ────────────────────────────────────────────────────────
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

<<<<<<< HEAD
  // ── General upload (for Uploaded Documents section) ────────────────────
=======
  // ── General upload ──────────────────────────────────────────────────────
>>>>>>> 0bb91c2 (tmmt update frontend)
  const [uploadingGeneral, setUploadingGeneral] = useState(false);
  const generalFileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Normalise base data ──────────────────────────────────────────────────
  const id = check.id || check._id || '';
  const serviceType = check.serviceType || check.service_type || 'Check';
  const speedTier = check.speedTier || check.speed_tier || 'standard';
  const createdAt = check.createdAt || check.created_at || new Date().toISOString();
  const documents = check.documents || [];
  const identifiers = check.identifiers || {};
<<<<<<< HEAD
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
=======
  const isFreeService = check.isFreeService ?? check.is_free_service ?? false;
  const amount = check.amount ?? 0;

  // ── Dynamic state ────────────────────────────────────────────────────────
  const [status, setStatus] = useState(check.status || 'pending');
  const [requestedDocuments, setRequestedDocuments] = useState<RequestedDocument[]>(() => {
    const raw = check.requestedDocuments || check.requested_documents || [];
    return raw.map((doc: any) => ({
      label: doc.label || doc.documentType || doc.type || 'Document',
      description: doc.description || doc.note || '',
      requestedAt: doc.requestedAt || doc.requested_at || new Date().toISOString(),
      status: doc.status || (doc.fulfilledAt ? 'fulfilled' : 'pending'),
      fulfilledAt: doc.fulfilledAt || doc.fulfilled_at,
      requestedBy: doc.requestedBy || doc.requested_by,
    }));
  });
  const [comments, setComments] = useState<Comment[]>(check.comments || []);
>>>>>>> 0bb91c2 (tmmt update frontend)
  const [resultDocuments, setResultDocuments] = useState<ResultDocument[]>(
    check.resultDocuments || check.result_documents || []
  );
  const [resultSummary, setResultSummary] = useState(check.resultSummary || check.result_summary || '');
  const [resultStatus, setResultStatus] = useState(check.resultStatus || check.result_status || '');

  // ── Computed values ──────────────────────────────────────────────────────
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const speed = SPEED_CONFIG[speedTier as keyof typeof SPEED_CONFIG] || SPEED_CONFIG.standard;
<<<<<<< HEAD
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  const hasResult = isCompleted && result;
  const pendingDocs = requestedDocuments.filter(d => d.status === 'pending').length;
  const hasComments = comments.length > 0;
  const hasHistory = history.length > 0;
  const hasResultDocs = resultDocuments.length > 0;
=======
  const pendingDocs = requestedDocuments.filter(d => d.status === 'pending').length;
  const hasComments = comments.length > 0;
  const hasResultDocs = resultDocuments.length > 0;
  const hasDocuments = documents.length > 0;
>>>>>>> 0bb91c2 (tmmt update frontend)

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

<<<<<<< HEAD
=======
  // ── Send Comment ─────────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.warning('Please enter a message');
      return;
    }

    setSendingMessage(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${apiBase}/api/v1/checks/${id}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: messageText.trim(),
          by: 'customer',
          role: 'customer',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to send message');
      }

      toast.success('Message sent successfully');
      setMessageText('');
      setShowMessageInput(false);
      
      const newComment: Comment = {
        text: messageText.trim(),
        by: 'customer',
        role: 'customer',
        authorName: 'You',
        createdAt: new Date().toISOString(),
        at: new Date().toISOString(),
      };
      
      setComments(prev => [...prev, newComment]);
      await handleRefresh();
    } catch (error: any) {
      console.error('Send message error:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
          setHistory(refreshedCheck.history || refreshedCheck.history_events || []);
          setRequestedDocuments(
            (refreshedCheck.requestedDocuments || refreshedCheck.requested_documents || []).map(normalizeRequestedDoc)
=======
          setRequestedDocuments(
            (refreshedCheck.requestedDocuments || refreshedCheck.requested_documents || []).map((doc: any) => ({
              label: doc.label || doc.documentType || doc.type || 'Document',
              description: doc.description || doc.note || '',
              requestedAt: doc.requestedAt || doc.requested_at || new Date().toISOString(),
              status: doc.status || (doc.fulfilledAt ? 'fulfilled' : 'pending'),
              fulfilledAt: doc.fulfilledAt || doc.fulfilled_at,
              requestedBy: doc.requestedBy || doc.requested_by,
            }))
>>>>>>> 0bb91c2 (tmmt update frontend)
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

<<<<<<< HEAD
  // ── Upload handler for requested documents ──────────────────────────────
=======
  // ── Upload handler for requested documents ─────────────────────────────
>>>>>>> 0bb91c2 (tmmt update frontend)
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

<<<<<<< HEAD
  // ── General upload handler ──────────────────────────────────────────────
=======
  // ── General upload handler ─────────────────────────────────────────────
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
      const newDocs = docs.map((d: any) => normalizeRequestedDoc(d));
=======
      const newDocs = docs.map((d: any) => ({
        label: d.label || d.documentType || d.type || 'Document',
        description: d.description || d.note || '',
        requestedAt: d.requestedAt || d.requested_at || new Date().toISOString(),
        status: d.status || (d.fulfilledAt ? 'fulfilled' : 'pending'),
        fulfilledAt: d.fulfilledAt || d.fulfilled_at,
        requestedBy: d.requestedBy || d.requested_by,
      }));
>>>>>>> 0bb91c2 (tmmt update frontend)
      setRequestedDocuments(prev => [...prev, ...newDocs]);
      toast.warning('New documents requested', {
        description: newDocs.map(d => d.label).join(', '),
      });
    };

    const handleCommentAdded = (data: any) => {
      if (data.checkId !== id) return;
      const newComment = data.comment;
      if (newComment) {
<<<<<<< HEAD
        setComments(prev => [...prev, newComment]);
=======
        setComments(prev => [newComment, ...prev]);
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
        setHistory(updated.history || updated.history_events || []);
        setRequestedDocuments(
          (updated.requestedDocuments || updated.requested_documents || []).map(normalizeRequestedDoc)
=======
        setRequestedDocuments(
          (updated.requestedDocuments || updated.requested_documents || []).map((doc: any) => ({
            label: doc.label || doc.documentType || doc.type || 'Document',
            description: doc.description || doc.note || '',
            requestedAt: doc.requestedAt || doc.requested_at || new Date().toISOString(),
            status: doc.status || (doc.fulfilledAt ? 'fulfilled' : 'pending'),
            fulfilledAt: doc.fulfilledAt || doc.fulfilled_at,
            requestedBy: doc.requestedBy || doc.requested_by,
          }))
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD

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

=======
// ─── Handlers ──────────────────────────────────────────────────────────────
const handleDownloadFile = (url: string, filename: string) => {
  try {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download file');
  }
};
  // ── Render ────────────────────────────────────────────────────────────────

  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.at || 0);
    const dateB = new Date(b.createdAt || b.at || 0);
    return dateA.getTime() - dateB.getTime();
  });

>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
            "border transition-all duration-300",
            "bg-gradient-to-br",
            statusConfig.gradient,
            statusConfig.border,
            "backdrop-blur-sm"
=======
            "border transition-all duration-300 bg-white dark:bg-slate-900/80",
            statusConfig.border,
            "backdrop-blur-sm "
>>>>>>> 0bb91c2 (tmmt update frontend)
          )}
        >
          {/* Header */}
          <CardHeader
<<<<<<< HEAD
            className="cursor-pointer hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-300 rounded-t-xl p-2.5 sm:p-4"
=======
            className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all duration-300 rounded-t-xl p-2.5 sm:p-3.5"
>>>>>>> 0bb91c2 (tmmt update frontend)
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className={cn(
<<<<<<< HEAD
                    "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border-2",
                    statusConfig.color,
                    "transition-all duration-300 group-hover:scale-110"
                  )}>
                    <StatusIcon className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
=======
                    "flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border",
                    statusConfig.color,
                    "transition-all duration-300 group-hover:scale-110"
                  )}>
                    <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
                    <p className="font-semibold text-xs sm:text-sm truncate text-gray-900 dark:text-white">
                      {serviceType}
                    </p>
                    <Badge className={cn(
                      "text-[8px] sm:text-[10px] font-medium border",
                      status === 'requires_documents'
                        ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700"
                        : statusConfig.color
=======
                    <p className="font-medium text-xs sm:text-sm truncate text-gray-800 dark:text-gray-200">
                      {serviceType}
                    </p>
                    <Badge className={cn(
                      "text-[8px] sm:text-[10px] font-medium border-0",
                      statusConfig.color
>>>>>>> 0bb91c2 (tmmt update frontend)
                    )}>
                      <StatusIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                      {statusConfig.label}
                    </Badge>
<<<<<<< HEAD
                    <Badge className={cn("text-[8px] sm:text-[10px] font-medium", speed.color)}>
=======
                    <Badge className={cn("text-[8px] sm:text-[10px] font-medium border-0", speed.color)}>
>>>>>>> 0bb91c2 (tmmt update frontend)
                      <speed.icon className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                      {speed.label}
                    </Badge>
                    {pendingDocs > 0 && (
<<<<<<< HEAD
                      <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 text-[8px] sm:text-[10px] font-medium">
=======
                      <Badge className="bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 text-[8px] sm:text-[10px] font-medium border-0">
>>>>>>> 0bb91c2 (tmmt update frontend)
                        <FileWarning className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                        {pendingDocs} pending
                      </Badge>
                    )}
<<<<<<< HEAD
                    {isFreeService && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[8px] sm:text-[10px] font-medium">
=======
                    {hasDocuments && (
                      <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 text-[8px] sm:text-[10px] font-medium border-0">
                        <Paperclip className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                        {documents.length} docs
                      </Badge>
                    )}
                    {isFreeService && (
                      <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 text-[8px] sm:text-[10px] font-medium border-0">
>>>>>>> 0bb91c2 (tmmt update frontend)
                        Free
                      </Badge>
                    )}
                    {amount > 0 && !isFreeService && (
<<<<<<< HEAD
                      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[8px] sm:text-[10px] font-medium">
=======
                      <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 text-[8px] sm:text-[10px] font-medium border-0">
>>>>>>> 0bb91c2 (tmmt update frontend)
                        <DollarSign className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                        AED {amount}
                      </Badge>
                    )}
                  </div>
<<<<<<< HEAD
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden xs:inline">{formatDate(createdAt)}</span>
                    <span className="xs:hidden">{new Date(createdAt).toLocaleDateString()}</span>
                    <span className="h-2.5 w-px sm:h-3 bg-gray-200 dark:bg-gray-700" />
=======
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden xs:inline">{formatDate(createdAt)}</span>
                    <span className="xs:hidden">{new Date(createdAt).toLocaleDateString()}</span>
                    <span className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
>>>>>>> 0bb91c2 (tmmt update frontend)
                    <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span>{documents.length}</span>
                    {hasComments && (
                      <>
<<<<<<< HEAD
                        <span className="h-2.5 w-px sm:h-3 bg-gray-200 dark:bg-gray-700" />
                        <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />
=======
                        <span className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
                        <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400" />
>>>>>>> 0bb91c2 (tmmt update frontend)
                        <span>{comments.length}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
<<<<<<< HEAD
                <div className="hidden sm:block w-16 md:w-20">
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300"
=======
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300"
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
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
=======
                        ? "bg-rose-50/50 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-800/30"
                        : "bg-gray-50/50 dark:bg-white/5 border-gray-200/50 dark:border-white/5"
                    )}>
                      <div className={cn(
                        "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0",
                        statusConfig.dotColor
                      )} />
                      <span className={cn(
                        "text-[11px] sm:text-sm text-gray-600 dark:text-gray-300"
>>>>>>> 0bb91c2 (tmmt update frontend)
                      )}>
                        {statusConfig.description}
                      </span>
                      {status === 'requires_documents' && (
<<<<<<< HEAD
                        <Badge className="ml-auto bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30 text-[8px] sm:text-[10px] shrink-0">
=======
                        <Badge className="ml-auto bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border-0 text-[8px] sm:text-[10px] shrink-0">
>>>>>>> 0bb91c2 (tmmt update frontend)
                          <FileWarning className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                          Action Required
                        </Badge>
                      )}
                      {speedTier === 'fast-track' && (
<<<<<<< HEAD
                        <Badge className="ml-auto bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[8px] sm:text-[10px] shrink-0">
=======
                        <Badge className="ml-auto bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-0 text-[8px] sm:text-[10px] shrink-0">
>>>>>>> 0bb91c2 (tmmt update frontend)
                          <Zap className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                          Priority
                        </Badge>
                      )}
                      {resultStatus && (
                        <Badge className={cn(
<<<<<<< HEAD
                          "text-[8px] sm:text-[10px] shrink-0",
                          resultStatus === 'clear' ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
                          resultStatus === 'flagged' ? "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30" :
                          "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
=======
                          "text-[8px] sm:text-[10px] shrink-0 border-0",
                          resultStatus === 'clear' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" :
                          resultStatus === 'flagged' ? "bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400" :
                          "bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
                            status === 'completed' ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                            status === 'failed' || status === 'cancelled' ? "bg-gradient-to-r from-red-500 to-red-400" :
                            status === 'processing' ? "bg-gradient-to-r from-blue-500 to-blue-400" :
                            status === 'reviewing' ? "bg-gradient-to-r from-purple-500 to-purple-400" :
                            status === 'requires_documents' ? "bg-gradient-to-r from-red-500 to-red-400" :
                            "bg-gradient-to-r from-amber-500 to-amber-400"
=======
                            status === 'completed' ? "bg-emerald-400" :
                            status === 'failed' || status === 'cancelled' ? "bg-red-400" :
                            status === 'processing' ? "bg-blue-400" :
                            status === 'reviewing' ? "bg-purple-400" :
                            status === 'requires_documents' ? "bg-rose-400" :
                            "bg-amber-400"
>>>>>>> 0bb91c2 (tmmt update frontend)
                          )}
                        />
                      </div>
                    </div>

                    {/* Details Grid */}
<<<<<<< HEAD
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="space-y-2 sm:space-y-3 p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
=======
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
                            <Badge className={cn("text-[8px] sm:text-[10px]", speed.color)}>
=======
                            <Badge className={cn("text-[8px] sm:text-[10px] border-0", speed.color)}>
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
                        <div className="space-y-2 sm:space-y-3 p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
=======
                        <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
                                +{Object.keys(identifiers).length - 3} more fields
=======
                                +{Object.keys(identifiers).length - 3} more
>>>>>>> 0bb91c2 (tmmt update frontend)
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

<<<<<<< HEAD
                    {/* ─── REQUESTED DOCUMENTS ─────────────────────────────────────── */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                          <FileWarning className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500" />
=======
{/* ─── UPLOADED DOCUMENTS ──────────────────────────────────────── */}
{hasDocuments && (
  <div className="space-y-1.5 sm:space-y-2">
    <div className="flex items-center justify-between">
      <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
        <Paperclip className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400" />
        Uploaded Documents ({documents.length})
      </p>
    </div>
    {/* EXTRA SMALL THUMBNAILS - MORE COLUMNS */}
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1">
      {documents.map((doc, idx) => (
        <DocumentThumbnail
          key={idx}
          document={doc}
          checkId={id}
          onPreview={handleViewDocument}
          onDownload={handleDownloadFile}
        />
      ))}
    </div>
  </div>
)}

{/* ─── RESULT DOCUMENTS ────────────────────────────────────────── */}
{hasResultDocs && (
  <div className="space-y-1.5 sm:space-y-2">
    <div className="flex items-center justify-between">
      <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
        <BadgeCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400" />
        Result Documents ({resultDocuments.length})
      </p>
    </div>
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1">
      {resultDocuments.map((doc, idx) => (
        <DocumentThumbnail
          key={idx}
          document={doc}
          checkId={id}
          onPreview={handleViewDocument}
          onDownload={handleDownloadFile}
        />
      ))}
    </div>
  </div>
)}                {/* ─── REQUESTED DOCUMENTS ─────────────────────────────────────── */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                          <FileWarning className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-rose-400" />
>>>>>>> 0bb91c2 (tmmt update frontend)
                          Requested Documents ({pendingDocs} pending)
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
<<<<<<< HEAD
                          className="h-7 text-[10px] text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/20 transition-all duration-300"
=======
                          className="h-6 sm:h-7 text-[9px] sm:text-[10px] text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/20 transition-all duration-300 px-2 sm:px-3"
>>>>>>> 0bb91c2 (tmmt update frontend)
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRefresh();
                          }}
                          disabled={refreshing}
                        >
                          {refreshing ? (
<<<<<<< HEAD
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 mr-1" />
=======
                            <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" />
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
                                  isPending ? "bg-red-50/80 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30" :
                                  isFulfilled ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30" :
                                  "bg-gray-50/80 dark:bg-gray-800/20 border-gray-200/50 dark:border-gray-700/30"
=======
                                  isPending ? "bg-rose-50/50 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-800/30" :
                                  isFulfilled ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-800/30" :
                                  "bg-gray-50/50 dark:bg-gray-800/20 border-gray-200/50 dark:border-gray-700/30"
>>>>>>> 0bb91c2 (tmmt update frontend)
                                )}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <FileText className={cn(
                                      "h-3 w-3",
<<<<<<< HEAD
                                      isPending ? "text-red-500 dark:text-red-400" : "text-emerald-500 dark:text-emerald-400"
                                    )} />
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">
=======
                                      isPending ? "text-rose-400" : "text-emerald-400"
                                    )} />
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300">
>>>>>>> 0bb91c2 (tmmt update frontend)
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
<<<<<<< HEAD
                                          <div className="h-3 w-3 sm:h-3.5 sm:w-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
=======
                                          <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
>>>>>>> 0bb91c2 (tmmt update frontend)
                                        ) : (
                                          <Upload className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500 dark:text-blue-400" />
                                        )}
                                      </Button>
                                    </>
                                  )}

                                  <Badge className={cn(
<<<<<<< HEAD
                                    "text-[8px] sm:text-[10px]",
                                    isPending ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" :
                                    isFulfilled ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
                                    "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30"
=======
                                    "text-[8px] sm:text-[10px] border-0",
                                    isPending ? "bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400" :
                                    isFulfilled ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" :
                                    "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400"
>>>>>>> 0bb91c2 (tmmt update frontend)
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

<<<<<<< HEAD
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
=======
                    {/* ─── MODERN CHAT SECTION ──────────────────────────────────────── */}
                    <div className="space-y-2 sm:space-y-3">
                      <button
                        type="button"
                        onClick={() => setShowComments(!showComments)}
                        className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] sm:text-xs font-medium text-slate-700 dark:text-slate-300">
                              Conversation
                            </p>
                            <p className="text-[8px] sm:text-[10px] text-slate-400 dark:text-slate-500">
                              {comments.length} messages
                            </p>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: showComments ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="p-1 rounded-lg bg-white/50 dark:bg-slate-800/50 group-hover:bg-white/70 dark:group-hover:bg-slate-700/50"
                        >
                          <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500 dark:text-slate-400" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {showComments && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2 sm:space-y-3 pt-1">
                              <div className="rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-200/50 dark:border-white/5 overflow-hidden">
                                {/* ─── Chat Header ───────────────────────────────────── */}
                                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100/80 dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-white/5">
                                  <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs shadow-md">
                                      A
                                    </div>
                                    <div>
                                      <p className="text-[11px] sm:text-sm font-medium text-gray-700 dark:text-gray-300">Admin</p>
                                      <p className="text-[8px] text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Online
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className="bg-gray-200/50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300 border-0 text-[8px] sm:text-[10px]">
                                    {comments.length} messages
                                  </Badge>
                                </div>

                                {/* ─── Messages ──────────────────────────────────────── */}
                                <div className="max-h-48 sm:max-h-64 overflow-y-auto p-2 sm:p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                  {sortedComments.length > 0 ? (
                                    sortedComments.map((c, idx) => {
                                      const isAdmin = isAdminComment(c);
                                      return (
                                        <ChatMessage
                                          key={c._id || idx}
                                          message={c}
                                          isAdmin={isAdmin}
                                        />
                                      );
                                    })
                                  ) : (
                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                      <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-2">
                                        <MessageSquare className="h-6 w-6 text-gray-400 dark:text-gray-600" />
                                      </div>
                                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">No messages yet</p>
                                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Start a conversation with the admin</p>
                                    </div>
                                  )}
                                </div>

                                {/* ─── Message Input ────────────────────────────────── */}
                                <div className="border-t border-gray-200/50 dark:border-white/5 p-2 bg-white dark:bg-gray-900/50">
                                  {showMessageInput ? (
                                    <div className="flex items-center gap-1.5">
                                      <Textarea
                                        placeholder="Type a message..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        className="flex-1 min-h-[32px] sm:min-h-[36px] max-h-[60px] resize-none border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                                        disabled={sendingMessage}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                          }
                                        }}
                                      />
                                      <button
                                        onClick={handleSendMessage}
                                        disabled={sendingMessage || !messageText.trim()}
                                        className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 shrink-0 flex items-center justify-center"
                                      >
                                        {sendingMessage ? (
                                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setShowMessageInput(true)}
                                      className="w-full flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1.5"
                                    >
                                      <Send className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                      <span>Type a message...</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
>>>>>>> 0bb91c2 (tmmt update frontend)

                    {/* ─── Actions ──────────────────────────────────────────────────── */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 pt-2 border-t border-gray-200/50 dark:border-white/5">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
<<<<<<< HEAD
                        <Badge variant="outline" className="text-[7px] sm:text-[9px] font-mono text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                          ID: {id.slice(0, 6).toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-[7px] sm:text-[9px] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                          {formatDate(createdAt)}
                        </Badge>
                        {amount > 0 && !isFreeService && (
                          <Badge variant="outline" className="text-[7px] sm:text-[9px] text-amber-600 dark:text-amber-400 border-amber-500/30">
=======
                        <Badge variant="outline" className="text-[7px] sm:text-[9px] font-mono text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700">
                          ID: {id.slice(0, 6).toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-[7px] sm:text-[9px] text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700">
                          {formatDate(createdAt)}
                        </Badge>
                        {amount > 0 && !isFreeService && (
                          <Badge variant="outline" className="text-[7px] sm:text-[9px] text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/30">
>>>>>>> 0bb91c2 (tmmt update frontend)
                            AED {amount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
<<<<<<< HEAD
                          className="h-6 sm:h-7 text-[8px] sm:text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 px-2 sm:px-3"
=======
                          className="h-5 sm:h-6 text-[8px] sm:text-[10px] text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 px-1.5 sm:px-2"
>>>>>>> 0bb91c2 (tmmt update frontend)
                          onClick={handleDelete}
                          disabled={deleting}
                        >
                          {deleting ? (
                            <>
<<<<<<< HEAD
                              <div className="h-2 w-2 sm:h-3 sm:w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-1 sm:mr-1.5" />
=======
                              <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-0.5 sm:mr-1" />
>>>>>>> 0bb91c2 (tmmt update frontend)
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