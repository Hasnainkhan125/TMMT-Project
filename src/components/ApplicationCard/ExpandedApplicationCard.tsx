'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Save,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Zap,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Edit,
  MessageSquare,
  Bell,
  Rocket,
  DollarSign,
  History,
  X,
  Shield,
  Calendar,
  TrendingUp,
  Award,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Receipt,
  User,
  UserCog,
  Info,
  Send,
  RefreshCw,
  FileWarning,
  BadgeCheck,
  Headphones,
  Gavel,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';
import { getSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';

// ─── Status Configuration ────────────────────────────────────────────────────

const STATUS_CONFIG = {
  approved: {
    label: 'Approved',
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30',
    dotColor: 'bg-emerald-400',
    icon: CheckCircle,
    gradient: 'from-emerald-50/50 to-emerald-100/20 dark:from-emerald-950/10 dark:to-emerald-900/5',
    border: 'border-emerald-200/40 dark:border-emerald-800/20',
    description: 'Your application has been approved successfully',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30',
    dotColor: 'bg-blue-400',
    icon: Clock,
    gradient: 'from-blue-50/50 to-blue-100/20 dark:from-blue-950/10 dark:to-blue-900/5',
    border: 'border-blue-200/40 dark:border-blue-800/20',
    description: 'Our team is reviewing your application',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    textColor: 'text-blue-700 dark:text-blue-400',
  },
  docs_required: {
    label: 'Docs Required',
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30',
    dotColor: 'bg-amber-400',
    icon: AlertCircle,
    gradient: 'from-amber-50/50 to-amber-100/20 dark:from-amber-950/10 dark:to-amber-900/5',
    border: 'border-amber-200/40 dark:border-amber-800/20',
    description: 'Additional documents are required',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    textColor: 'text-amber-700 dark:text-amber-400',
  },
  pending: {
    label: 'Pending',
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30',
    dotColor: 'bg-amber-400',
    icon: Clock,
    description: 'Your check is queued for processing',
    gradient: 'from-amber-50/50 to-amber-100/20 dark:from-amber-950/10 dark:to-amber-900/5',
    border: 'border-amber-200/40 dark:border-amber-800/20',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    textColor: 'text-amber-700 dark:text-amber-400',
  },
};

// ─── Helper Functions ──────────────────────────────────────────────────────

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

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ─── Helper: Check if document is an image ─────────────────────────────────
const isDocumentImage = (doc: any, fileUrl: string): boolean => {
  const mimeType = doc.mimeType || '';
  if (mimeType.startsWith('image/')) return true;
  const ext = doc.originalName?.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif'].includes(ext);
};

const isDocumentPdf = (doc: any, fileUrl: string): boolean => {
  const mimeType = doc.mimeType || '';
  if (mimeType === 'application/pdf') return true;
  const ext = doc.originalName?.split('.').pop()?.toLowerCase() || '';
  return ext === 'pdf';
};

// ─── Helper: Build receipt URL ─────────────────────────────────────────────
const getReceiptUrl = (receipt: any, apiBase: string, appId: string): string | null => {
  if (!receipt) return null;

  if (receipt.fullUrl) return receipt.fullUrl;
  if (receipt.url) return receipt.url;
  if (receipt.fileUrl) return receipt.fileUrl;
  if (receipt.downloadUrl) return receipt.downloadUrl;

  if (receipt.path) {
    if (receipt.path.startsWith('http://') || receipt.path.startsWith('https://')) {
      return receipt.path;
    }
    if (receipt.path.startsWith('/')) {
      return `${apiBase}${receipt.path}`;
    }
    if (receipt.path.includes('uploads/applications')) {
      const cleanPath = receipt.path.startsWith('/') ? receipt.path : `/${receipt.path}`;
      return `${apiBase}${cleanPath}`;
    }
    const pathParts = receipt.path.split('/');
    const fileName = pathParts[pathParts.length - 1];
    if (appId && fileName) {
      return `${apiBase}/uploads/applications/${appId}/receipts/${fileName}`;
    }
    return `${apiBase}/uploads/applications/${appId}/receipts/${receipt.path}`;
  }

  if (receipt.filename || receipt.originalName) {
    const fileName = receipt.filename || receipt.originalName;
    if (appId && fileName) {
      return `${apiBase}/uploads/applications/${appId}/receipts/${fileName}`;
    }
  }

  if (receipt._id) {
    return `${apiBase}/api/v1/receipts/${receipt._id}/file`;
  }

  return null;
};

// ─── Severity Helpers ──────────────────────────────────────────────────────

const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'high':
    case 'critical':
      return 'bg-red-500/20 text-red-600 border-red-500/30 dark:bg-red-500/20 dark:text-red-400';
    case 'medium':
      return 'bg-amber-500/20 text-amber-600 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400';
    case 'low':
      return 'bg-blue-500/20 text-blue-600 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400';
    default:
      return 'bg-gray-500/20 text-gray-600 border-gray-500/30 dark:bg-gray-500/20 dark:text-gray-400';
  }
};

const getSeverityDot = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'high':
    case 'critical':
      return 'bg-red-500';
    case 'medium':
      return 'bg-amber-500';
    case 'low':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

interface ExpandedApplicationCardProps {
  application: any;
  isExpanded: boolean;
  onToggle: () => void;
  onDocumentView: (doc: any) => void;
  onDocumentDownload: (doc: any) => void;
  onDelete?: (appId: string) => void;
  onReceiptUploaded?: (appId: string) => void;
  onDocumentUploaded?: (appId: string) => void;
  refetchApplications?: () => void;
}

const ExpandedApplicationCard: React.FC<ExpandedApplicationCardProps> = ({
  application,
  isExpanded,
  onToggle,
  onDocumentView,
  onDocumentDownload,
  onDelete,
  onReceiptUploaded,
  onDocumentUploaded,
  refetchApplications,
}) => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  if (!application || !application.metadata) {
    return (
      <div className="w-full p-6 text-center text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-center gap-3">
          <div className="h-5 w-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          <span>Loading application details...</span>
        </div>
      </div>
    );
  }

  // ─── State ──────────────────────────────────────────────────────────────────
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showBoostDialog, setShowBoostDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [boostCount, setBoostCount] = useState(application.metadata?.boostCount || 0);
  const [requestedDocuments, setRequestedDocuments] = useState<any[]>(application.requestedDocuments || []);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [otpRequests, setOtpRequests] = useState<any[]>(application.otpRequests || []);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

  // ─── New state for inline image preview ────────────────────────────────
  const [previewImage, setPreviewImage] = useState<{ doc: any; url: string } | null>(null);

  // ─── History expand state ──────────────────────────────────────────────────
  const [showHistory, setShowHistory] = useState(false);

  // ─── Alert States ──────────────────────────────────────────────────────────
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [penaltyAlerts, setPenaltyAlerts] = useState<any[]>([]);
  const [otpAlerts, setOtpAlerts] = useState<any[]>([]);
  const [showFraudDetails, setShowFraudDetails] = useState(false);
  const [showPenaltyDetails, setShowPenaltyDetails] = useState(false);
  const [showOtpDetails, setShowOtpDetails] = useState(false);

  const statusConfig = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const hasResultDocs = application.resultDocuments && application.resultDocuments.length > 0;

  const receipts = application.receipts || [];

  const appId = application._id || application.id;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleDocumentDownload = async (attachment: any) => {
    try {
      const token = localStorage.getItem('authToken') || '';
      const applicationId = application._id || application.id;
      const response = await fetch(
        `${apiBase}/api/v1/visa/${applicationId}/attachments/${attachment._id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.originalName || attachment.path;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleCopyId = () => {
    const id = application._id || application.id;
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success('Application ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenReceiptPreview = (receipt: any) => {
    setSelectedReceipt(receipt);
    setShowReceiptPreview(true);
  };

  const handleCloseReceiptPreview = () => {
    setShowReceiptPreview(false);
    setSelectedReceipt(null);
  };

  const handleReceiptUpload = async () => {
    if (!receiptFile) {
      toast.error('Please select a receipt file to upload');
      return;
    }

    setUploadingReceipt(true);
    try {
      const token = localStorage.getItem('authToken') || '';
      const appId = application._id || application.id;
      if (!appId) {
        toast.error('Application ID missing');
        return;
      }

      const formData = new FormData();
      formData.append('receipt', receiptFile);

      const response = await fetch(`${apiBase}/api/v1/visa/${appId}/receipt`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = `Upload failed (${response.status})`;
        try {
          const data = await response.json();
          errorMsg = data.message || data.error || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      toast.success('Receipt uploaded successfully', {
        description: 'Your payment receipt is now under verification.',
      });

      setReceiptFile(null);
      if (onReceiptUploaded) {
        onReceiptUploaded(appId);
      }
    } catch (error: any) {
      console.error('Receipt upload error:', error);
      toast.error('Receipt upload failed', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('authToken') || '';
      const appId = application._id || application.id;
      const response = await fetch(`${apiBase}/api/v1/visa/${appId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        let errorMessage = `Delete failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (_) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      toast.success('Application deleted successfully');
      if (onDelete) {
        await onDelete(appId);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete application');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Document Upload Handler ─────────────────────────────────────────────
  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file first');
      return;
    }

    if (!application?._id) {
      toast.error('Application ID not found');
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('authToken') || '';
      if (!token) {
        toast.error('Please login first');
        setUploading(false);
        setUploadStatus('error');
        return;
      }

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('documentName', uploadFile.name);
      formData.append('documentType', 'additional_document');
      formData.append('uploadedByRole', 'amer');

      const endpoint = `${apiBase}/api/v1/visa/${application._id}/documents`;

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);

      let responseData;
      const responseText = await response.text();
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error('Authentication failed. Please login again.');
          setTimeout(() => {
            window.location.href = '/auth';
          }, 1500);
          setUploading(false);
          setUploadStatus('error');
          return;
        }
        throw new Error(responseData.message || responseData.error || 'Upload failed');
      }

      setUploadProgress(100);
      setUploadStatus('done');

      toast.success('Document uploaded successfully!');
      setUploadFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      if (onDocumentUploaded) {
        onDocumentUploaded(application._id);
      }
      if (refetchApplications) {
        await refetchApplications();
      }

      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 2000);

    } catch (error: any) {
      console.error('❌ Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setUploadFile(null);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setUploadStatus('idle');
    setUploadProgress(0);
  };

  const handlePriorityBoost = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (boostCount >= 3) {
        setShowPaymentDialog(true);
        return;
      }

      const response = await fetch(
        `${apiBase}/api/v1/visa/${application._id || application.id}/boost`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: 'free' }),
        }
      );

      if (response.ok) {
        setBoostCount((prev: number) => prev + 1);
        toast.success('Priority boost activated!', {
          description: 'Your application has been moved up in the queue',
        });
        setShowBoostDialog(false);
      } else {
        toast.error('Failed to boost application');
      }
    } catch (error) {
      console.error('Boost error:', error);
      toast.error('Failed to boost application');
    }
  };

  const handlePaymentBoost = async () => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `${apiBase}/api/v1/visa/${application._id || application.id}/boost`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: 'paid', amount: 10 }),
        }
      );

      if (response.ok) {
        toast.success('Payment processed! Priority boost activated', {
          description: 'AED 10 charged. Your application is now priority',
        });
        setShowPaymentDialog(false);
        setShowBoostDialog(false);
      } else {
        toast.error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed');
    }
  };

  const getProgress = () => {
    switch (application.status) {
      case 'pending': return 25;
      case 'docs_required': return 40;
      case 'under_review': return 65;
      case 'approved': return 100;
      default: return 0;
    }
  };

  // ─── Split documents by uploader role ─────────────────────────────────
  const userDocuments = (application.attachments || []).filter(
    (doc: any) => doc.uploadedByRole === 'user' || doc.uploadedByRole === 'sponsor' || !doc.uploadedByRole
  );
  
  const amerDocuments = (application.attachments || []).filter(
    (doc: any) => doc.uploadedByRole === 'amer' || doc.uploadedByRole === 'admin'
  );

  // ─── Receipts ──────────────────────────────────────────────────────────
  const receiptDocuments = (application.receipts || []).map((receipt: any) => ({
    ...receipt,
    __type: 'receipt',
    originalName: receipt.originalName || receipt.filename || 'Receipt',
    size: receipt.size || receipt.fileSize,
    mimeType: receipt.mimeType || receipt.type || '',
    status: receipt.status || 'pending',
    uploadedByRole: receipt.uploadedByRole || 'user',
  }));

  // ─── Document render helper ──────────────────────────────────────────────
  const renderDocumentItem = (doc: any, idx: number, isReceipt: boolean = false) => {
    let fileUrl = '';
    if (isReceipt) {
      fileUrl = getReceiptUrl(doc, apiBase, appId) || '';
      if (!fileUrl && doc.path) {
        const cleanPath = doc.path.startsWith('/') ? doc.path : `/${doc.path}`;
        fileUrl = `${apiBase}${cleanPath}`;
      }
      if (!fileUrl && doc.filename) {
        fileUrl = `${apiBase}/uploads/applications/${appId}/receipts/${doc.filename}`;
      }
      if (!fileUrl && doc.originalName) {
        fileUrl = `${apiBase}/uploads/applications/${appId}/receipts/${doc.originalName}`;
      }
    } else {
      fileUrl = doc.url || doc.fileUrl || doc.path || '';
    }

    const isImage = isDocumentImage(doc, fileUrl);
    const isPdf = isDocumentPdf(doc, fileUrl);
    const isAmer = doc.uploadedByRole === 'amer' || doc.uploadedByRole === 'admin';

    const handleImageClick = () => {
      if (isImage && fileUrl) {
        setPreviewImage({ doc, url: fileUrl });
      } else if (isReceipt) {
        handleOpenReceiptPreview(doc);
      } else {
        onDocumentView(doc);
      }
    };

    return (
      <motion.div
        key={idx}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: idx * 0.05 }}
        className={cn(
          "flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-white/60 dark:bg-white/5 border transition-all duration-300 group/doc",
          isReceipt 
            ? "border-emerald-200/50 dark:border-emerald-800/30 hover:border-emerald-400/50 dark:hover:border-emerald-700/50" 
            : isAmer
              ? "border-blue-200/50 dark:border-blue-800/30 hover:border-blue-400/50 dark:hover:border-blue-700/50 hover:shadow-md hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5"
              : "border-gray-200/50 dark:border-white/5 hover:border-primary/30 dark:hover:border-primary/30"
        )}
      >
        <div className="relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {fileUrl && isImage ? (
            <img
              src={fileUrl}
              alt={doc.originalName || 'Document'}
              className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
              onClick={handleImageClick}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800';
                  fallback.innerHTML = `<svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : fileUrl && isPdf ? (
            <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20">
              <FileText className="w-5 h-5 text-red-500" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 dark:bg-primary/20">
              {isReceipt ? (
                <Receipt className="w-5 h-5 text-emerald-500" />
              ) : isAmer ? (
                <UserCog className="w-5 h-5 text-blue-500" />
              ) : (
                <FileText className="w-5 h-5 text-primary" />
              )}
            </div>
          )}
          {doc.status && (
            <div className="absolute -top-1 -right-1">
              <Badge className={cn(
                "text-[6px] sm:text-[7px] rounded-full px-1.5 py-0.5 border-0 shadow-sm",
                doc.status === 'approved' && "bg-emerald-500 text-white",
                doc.status === 'verified' && "bg-emerald-500 text-white",
                doc.status === 'pending_verification' && "bg-amber-500 text-white",
                doc.status === 'pending' && "bg-amber-500 text-white",
                doc.status === 'rejected' && "bg-red-500 text-white",
                doc.status === 'under_review' && "bg-blue-500 text-white"
              )}>
                {doc.status === 'approved' || doc.status === 'verified' ? '✓' :
                 doc.status === 'pending_verification' || doc.status === 'pending' ? '⏳' :
                 doc.status === 'rejected' ? '✕' :
                 doc.status === 'under_review' ? '⟳' :
                 doc.status?.slice(0, 1).toUpperCase()}
              </Badge>
            </div>
          )}
          {isReceipt && (
            <div className="absolute -bottom-1 -left-1">
              <Badge className="text-[6px] sm:text-[7px] bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                Receipt
              </Badge>
            </div>
          )}
          {isAmer && (
            <div className="absolute -bottom-1 -left-1">
              <Badge className="text-[6px] sm:text-[7px] bg-blue-500/20 text-blue-600 border-blue-500/30">
                Amer
              </Badge>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
            {doc.originalName || doc.filename || (isReceipt ? 'Receipt' : 'Document')}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
            {doc.size && (
              <span className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                {formatBytes(doc.size)}
              </span>
            )}
            {doc.uploadedByRole && (
              <Badge className={cn(
                "text-[7px] sm:text-[8px] border-0",
                doc.uploadedByRole === 'amer' || doc.uploadedByRole === 'admin' 
                  ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" 
                  : "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400"
              )}>
                {doc.uploadedByRole === 'amer' || doc.uploadedByRole === 'admin' ? 'Amer' : 'User'}
              </Badge>
            )}
            {isReceipt && doc.status && (
              <Badge className={cn(
                "text-[7px] sm:text-[8px] font-normal border-0",
                doc.status === 'approved' && "bg-emerald-500/20 text-emerald-600",
                doc.status === 'verified' && "bg-emerald-500/20 text-emerald-600",
                doc.status === 'pending_verification' && "bg-yellow-500/20 text-yellow-600",
                doc.status === 'pending' && "bg-yellow-500/20 text-yellow-600",
                doc.status === 'rejected' && "bg-red-500/20 text-red-600"
              )}>
                {doc.status.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover/doc:opacity-100 transition-all duration-300">
          {fileUrl && !isImage && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20"
              onClick={() => {
                if (isReceipt) {
                  handleOpenReceiptPreview(doc);
                } else {
                  onDocumentView(doc);
                }
              }}
              title="View document"
            >
              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 hover:text-primary transition-colors" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20"
            onClick={() => {
              if (isReceipt) {
                const url = getReceiptUrl(doc, apiBase, appId);
                if (url) {
                  fetch(url)
                    .then(response => {
                      if (!response.ok) throw new Error('Download failed');
                      return response.blob();
                    })
                    .then(blob => {
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = doc.originalName || doc.filename || 'receipt';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(link.href);
                      toast.success('Download started!');
                    })
                    .catch(() => {
                      window.open(url, '_blank');
                    });
                } else {
                  toast.error('Receipt URL not available');
                }
              } else {
                onDocumentDownload(doc);
              }
            }}
            title="Download document"
          >
            <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 hover:text-primary transition-colors" />
          </Button>
        </div>
      </motion.div>
    );
  };

  // ─── Main Socket Effect ────────────────────────────────────────────────────
  useEffect(() => {
    if (!application) return;

    const socket = getSocket();
    const appId = application._id || application.id;

    // ─── Document Request Listener ──────────────────────────────────────────
    const handleDocumentRequest = (data: any) => {
      if (data.applicationId === appId) {
        const newDocs = data.requestedDocuments || [];
        setRequestedDocuments(prev => [...prev, ...newDocs.map((doc: any) => ({
          documentType: doc,
          description: data.note,
          requestedAt: new Date(),
          status: 'pending'
        }))]);
        setNotifications(prev => [...prev, {
          type: 'document_request',
          message: `${newDocs.length} document(s) requested: ${newDocs.join(', ')}`,
          timestamp: new Date(),
          data: data
        }]);
        toast.warning(`Documents requested for your application`, {
          description: `${newDocs.length} document(s) needed: ${newDocs.join(', ')}`,
        });
      }
    };

    // ─── OTP Request Listener ──────────────────────────────────────────────
    const handleOtpRequest = (data: any) => {
      if (data.applicationId === appId) {
        setOtpRequests(prev => [...prev, {
          phone: data.phone,
          expiresIn: data.expiresIn,
          requestedAt: new Date(),
          status: 'pending'
        }]);
        setNotifications(prev => [...prev, {
          type: 'otp_request',
          message: `OTP verification requested for ${data.phone}`,
          timestamp: new Date(),
          data: data
        }]);
        toast.info('OTP verification requested', {
          description: `Please check ${data.phone} for the verification code`,
        });
      }
    };

    // ─── Status Update Listener ─────────────────────────────────────────────
    const handleStatusUpdate = (data: any) => {
      if (data.applicationId === appId) {
        toast.success('Application status updated', {
          description: `New status: ${data.status}`,
        });
        if (refetchApplications) {
          refetchApplications();
        }
      }
    };

    // ─── Fraud Alert Listener ──────────────────────────────────────────────
    const handleFraudAlert = (data: any) => {
      if (data.applicationId === appId) {
        setFraudAlerts(prev => [{
          id: data.id || Date.now().toString(),
          type: data.type || 'Suspicious Activity',
          severity: data.severity || 'medium',
          description: data.description || 'Potential fraud detected',
          timestamp: data.timestamp || new Date().toISOString(),
          status: data.status || 'open',
          applicationId: data.applicationId,
        }, ...prev]);
        
        toast.error(`🚨 Fraud Alert: ${data.type || 'Suspicious Activity'}`, {
          description: data.description || 'Please review this application immediately',
          duration: 5000,
        });
        
        setNotifications(prev => [...prev, {
          type: 'fraud_alert',
          message: `Fraud alert: ${data.type || 'Suspicious Activity'}`,
          timestamp: new Date(),
          data: data
        }]);
      }
    };

    // ─── Penalty Issued Listener ───────────────────────────────────────────
    const handlePenaltyIssued = (data: any) => {
      if (data.applicationId === appId) {
        setPenaltyAlerts(prev => [{
          id: data.id || Date.now().toString(),
          type: data.type || 'Penalty Issued',
          amount: data.amount || 0,
          currency: data.currency || 'AED',
          reason: data.reason || 'Regulatory violation',
          dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: data.timestamp || new Date().toISOString(),
          status: data.status || 'pending',
          applicationId: data.applicationId,
        }, ...prev]);
        
        toast.warning(`⚖️ Penalty Issued: ${data.type || 'Penalty'}`, {
          description: `Amount: ${data.amount || 0} ${data.currency || 'AED'} - ${data.reason || 'Regulatory violation'}`,
          duration: 5000,
        });
        
        setNotifications(prev => [...prev, {
          type: 'penalty_issued',
          message: `Penalty issued: ${data.type || 'Penalty'}`,
          timestamp: new Date(),
          data: data
        }]);
      }
    };

    // ─── OTP Alert Listener ─────────────────────────────────────────────────
    const handleOtpAlert = (data: any) => {
      if (data.applicationId === appId) {
        setOtpAlerts(prev => [{
          id: data.id || Date.now().toString(),
          phone: data.phone || 'Unknown',
          code: data.code || '******',
          expiresIn: data.expiresIn || 2,
          timestamp: data.timestamp || new Date().toISOString(),
          status: data.status || 'pending',
          applicationId: data.applicationId,
        }, ...prev]);
        
        toast.info(`🔑 OTP Requested for ${data.phone || 'applicant'}`, {
          description: `Code expires in ${data.expiresIn || 2} minutes`,
          duration: 4000,
        });
        
        setNotifications(prev => [...prev, {
          type: 'otp_alert',
          message: `OTP requested for ${data.phone || 'applicant'}`,
          timestamp: new Date(),
          data: data
        }]);
      }
    };

    // ─── Register All Socket Listeners ──────────────────────────────────────
    socket.on('document_requested', handleDocumentRequest);
    socket.on('otp_requested', handleOtpRequest);
    socket.on('application_status_updated', handleStatusUpdate);
    socket.on('fraud_alert', handleFraudAlert);
    socket.on('penalty_issued', handlePenaltyIssued);
    socket.on('otp_requested_alert', handleOtpAlert);

    // ─── Fetch Existing Alerts ─────────────────────────────────────────────
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('authToken') || '';
        
        // Fetch fraud alerts
        const fraudRes = await fetch(`${apiBase}/api/v1/fraud/alerts?applicationId=${appId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (fraudRes.ok) {
          const data = await fraudRes.json();
          if (data.data) setFraudAlerts(data.data);
        }

        // Fetch penalties
        const penaltyRes = await fetch(`${apiBase}/api/v1/penalties?applicationId=${appId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (penaltyRes.ok) {
          const data = await penaltyRes.json();
          if (data.data) setPenaltyAlerts(data.data);
        }

        // Fetch OTP requests
        const otpRes = await fetch(`${apiBase}/api/v1/auth/otp/requests?applicationId=${appId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (otpRes.ok) {
          const data = await otpRes.json();
          if (data.data) setOtpAlerts(data.data);
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchAlerts();

    return () => {
      socket.off('document_requested', handleDocumentRequest);
      socket.off('otp_requested', handleOtpRequest);
      socket.off('application_status_updated', handleStatusUpdate);
      socket.off('fraud_alert', handleFraudAlert);
      socket.off('penalty_issued', handlePenaltyIssued);
      socket.off('otp_requested_alert', handleOtpAlert);
    };
  }, [application, refetchApplications, apiBase]);

  // ─── Total Notifications ──────────────────────────────────────────────────
  const totalNotifications = notifications.length + fraudAlerts.length + penaltyAlerts.length + otpAlerts.length;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full group"
      >
        <Card
          className={cn(
            "border transition-all duration-300 bg-white dark:bg-slate-900/80",
            statusConfig.border
          )}
        >
          <CardHeader
            className="cursor-pointer p-3 sm:p-4 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all duration-300 rounded-t-xl"
            onClick={onToggle}
          >
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative">
                  <div className={cn(
                    "flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border-2",
                    statusConfig.color,
                    "transition-all duration-300 group-hover:scale-110"
                  )}>
                    <StatusIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </div>
                  {application.status === 'under_review' && (
                    <div className="absolute -top-0.5 -right-0.5">
                      <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-blue-500"></span>
                      </span>
                    </div>
                  )}
                  {application.status === 'approved' && (
                    <div className="absolute -top-0.5 -right-0.5">
                      <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                        <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
                      </span>
                    </div>
                  )}
                  {boostCount > 0 && (
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <span className="flex h-3 w-3 sm:h-3.5 sm:w-3.5 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-[6px] font-bold text-white">
                        {boostCount}
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <p className="font-semibold text-xs sm:text-sm truncate text-gray-900 dark:text-white">
                      {application.applicationType
                        .replace(/_/g, ' ')
                        .split(' ')
                        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </p>
                    <Badge className={cn("text-[8px] sm:text-[10px] font-medium", statusConfig.color)}>
                      <StatusIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                      {statusConfig.label}
                    </Badge>
                    {hasResultDocs && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[8px] sm:text-[10px] font-medium">
                        <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                        Results Ready
                      </Badge>
                    )}
                    {boostCount > 0 && (
                      <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[8px] sm:text-[10px] font-medium">
                        <Rocket className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                        Boosted
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden xs:inline">{formatDate(application.createdAt)}</span>
                    <span className="xs:hidden">{new Date(application.createdAt).toLocaleDateString()}</span>
                    <span className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
                    <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span>{application.attachments?.length || 0}</span>
                    {totalNotifications > 0 && (
                      <>
                        <span className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
                        <Bell className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500" />
                        <span className="text-red-500 font-medium text-[9px] sm:text-[10px]">{totalNotifications}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <CardContent className="pt-0 pb-3 sm:pb-4 px-3 sm:px-4">
                  <div className="border-t border-gray-200/50 dark:border-white/10 pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                    {/* ─── Status Description ───────────────────────────────── */}
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm p-2 sm:p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                      <div className={cn("h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full", statusConfig.dotColor)} />
                      <span className="text-gray-600 dark:text-gray-300">{statusConfig.description}</span>
                      <div className="flex items-center gap-1 ml-auto shrink-0">
                        <Badge variant="outline" className="text-[8px] sm:text-[9px] font-mono text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                          {appId.slice(0, 6).toUpperCase()}
                        </Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyId();
                          }}
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

                    {/* ─── Progress Bar ────────────────────────────────────── */}
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Application Progress</span>
                        <span className="font-medium">{getProgress()}%</span>
                      </div>
                      <div className="relative h-1.5 sm:h-2 rounded-full overflow-hidden bg-gray-200/50 dark:bg-gray-700/50">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgress()}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className={cn(
                            "h-full rounded-full",
                            application.status === 'approved' ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                            application.status === 'under_review' ? "bg-gradient-to-r from-blue-500 to-blue-400" :
                            application.status === 'docs_required' ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                            "bg-gradient-to-r from-gray-500 to-gray-400"
                          )}
                        />
                      </div>
                    </div>

                    {/* ─── Quick Stats ────────────────────────────────────── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      <div className="p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-center transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/30">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1 sm:mb-1.5">
                          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                        </div>
                        <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white block">
                          {application.attachments?.length || 0}
                        </span>
                        <span className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400">Documents</span>
                      </div>
                      <div className="p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-center transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/30">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-1 sm:mb-1.5">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                        </div>
                        <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white block">
                          {Math.ceil((Date.now() - new Date(application.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                        </span>
                        <span className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400">Days Old</span>
                      </div>
                      <div className="p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-center transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/30">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-1 sm:mb-1.5">
                          <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                        </div>
                        <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white block">
                          {hasResultDocs ? application.resultDocuments.length : 0}
                        </span>
                        <span className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400">Results</span>
                      </div>
                      <div className="p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-center transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/30">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mx-auto mb-1 sm:mb-1.5">
                          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                        </div>
                        <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white block">{boostCount}</span>
                        <span className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400">Boosts</span>
                      </div>
                    </div>

                    {/* ─── Alerts Section ───────────────────────────────────── */}
                    {(fraudAlerts.length > 0 || penaltyAlerts.length > 0 || otpAlerts.length > 0) && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-amber-500" />
                          <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            Alerts ({fraudAlerts.length + penaltyAlerts.length + otpAlerts.length})
                          </p>
                        </div>

                        {/* ─── Fraud Alerts ────────────────────────────────── */}
                        {fraudAlerts.length > 0 && (
                          <div className="space-y-2">
                            <button
                              onClick={() => setShowFraudDetails(!showFraudDetails)}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-medium text-red-700 dark:text-red-400">
                                  Fraud Alerts ({fraudAlerts.length})
                                </span>
                                <Badge className="bg-red-500/20 text-red-600 border-red-500/30 text-[8px]">
                                  {fraudAlerts.filter(a => a.status === 'open').length} open
                                </Badge>
                              </div>
                              <ChevronDown className={cn(
                                "w-4 h-4 text-red-400 transition-transform duration-300",
                                showFraudDetails && "rotate-180"
                              )} />
                            </button>

                            <AnimatePresence>
                              {showFraudDetails && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-2">
                                    {fraudAlerts.map((alert, idx) => (
                                      <div
                                        key={alert.id || idx}
                                        className="p-3 rounded-xl bg-white/80 dark:bg-white/5 border border-red-200/50 dark:border-red-800/30 hover:shadow-md transition-all"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                            getSeverityColor(alert.severity)
                                          )}>
                                            <AlertCircle className="w-4 h-4" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                                {alert.type || 'Fraud Alert'}
                                              </span>
                                              <Badge className={cn(
                                                "text-[8px] border-0",
                                                getSeverityColor(alert.severity)
                                              )}>
                                                <span className={cn(
                                                  "w-1.5 h-1.5 rounded-full inline-block mr-1",
                                                  getSeverityDot(alert.severity)
                                                )} />
                                                {alert.severity || 'medium'}
                                              </Badge>
                                              <Badge className={cn(
                                                "text-[8px] border-0",
                                                alert.status === 'open' ? "bg-red-500/20 text-red-600" :
                                                alert.status === 'investigating' ? "bg-amber-500/20 text-amber-600" :
                                                "bg-emerald-500/20 text-emerald-600"
                                              )}>
                                                {alert.status || 'open'}
                                              </Badge>
                                            </div>
                                            <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                                              {alert.description || 'Suspicious activity detected'}
                                            </p>
                                            <p className="text-[8px] text-gray-400 dark:text-gray-500 mt-1">
                                              {formatDate(alert.timestamp || alert.createdAt)}
                                            </p>
                                          </div>
                                          {alert.status === 'open' && (
                                            <Button
                                              size="sm"
                                              className="h-7 text-[8px] bg-red-500 hover:bg-red-600 text-white rounded-lg px-2.5 flex-shrink-0"
                                              onClick={() => {
                                                toast.success('Fraud alert marked as investigating');
                                                setFraudAlerts(prev => prev.map(a => 
                                                  a.id === alert.id ? { ...a, status: 'investigating' } : a
                                                ));
                                              }}
                                            >
                                              Investigate
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* ─── Penalty Alerts ───────────────────────────────── */}
                        {penaltyAlerts.length > 0 && (
                          <div className="space-y-2">
                            <button
                              onClick={() => setShowPenaltyDetails(!showPenaltyDetails)}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <Gavel className="w-4 h-4 text-purple-500" />
                                <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
                                  Penalties ({penaltyAlerts.length})
                                </span>
                                <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30 text-[8px]">
                                  {penaltyAlerts.filter(a => a.status === 'pending').length} pending
                                </Badge>
                              </div>
                              <ChevronDown className={cn(
                                "w-4 h-4 text-purple-400 transition-transform duration-300",
                                showPenaltyDetails && "rotate-180"
                              )} />
                            </button>

                            <AnimatePresence>
                              {showPenaltyDetails && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-2">
                                    {penaltyAlerts.map((penalty, idx) => (
                                      <div
                                        key={penalty.id || idx}
                                        className="p-3 rounded-xl bg-white/80 dark:bg-white/5 border border-purple-200/50 dark:border-purple-800/30 hover:shadow-md transition-all"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                            <DollarSign className="w-4 h-4 text-purple-600" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                                {penalty.type || 'Penalty Issued'}
                                              </span>
                                              <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30 text-[8px]">
                                                {penalty.amount} {penalty.currency || 'AED'}
                                              </Badge>
                                              <Badge className={cn(
                                                "text-[8px] border-0",
                                                penalty.status === 'pending' ? "bg-amber-500/20 text-amber-600" :
                                                penalty.status === 'paid' ? "bg-emerald-500/20 text-emerald-600" :
                                                "bg-purple-500/20 text-purple-600"
                                              )}>
                                                {penalty.status || 'pending'}
                                              </Badge>
                                            </div>
                                            <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                                              {penalty.reason || 'Regulatory violation'}
                                            </p>
                                            <p className="text-[8px] text-gray-400 dark:text-gray-500 mt-1">
                                              Due: {formatDate(penalty.dueDate)} • Issued: {formatDate(penalty.timestamp || penalty.issuedAt)}
                                            </p>
                                          </div>
                                          {penalty.status === 'pending' && (
                                            <Button
                                              size="sm"
                                              className="h-7 text-[8px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-2.5 flex-shrink-0"
                                              onClick={() => {
                                                toast.success('Penalty marked as paid');
                                                setPenaltyAlerts(prev => prev.map(p => 
                                                  p.id === penalty.id ? { ...p, status: 'paid' } : p
                                                ));
                                              }}
                                            >
                                              <CheckCircle className="w-3 h-3 mr-1" />
                                              Pay
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* ─── OTP Alerts ───────────────────────────────────── */}
                        {otpAlerts.length > 0 && (
                          <div className="space-y-2">
                            <button
                              onClick={() => setShowOtpDetails(!showOtpDetails)}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <Key className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                  OTP Requests ({otpAlerts.length})
                                </span>
                                <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 text-[8px]">
                                  {otpAlerts.filter(a => a.status === 'pending').length} pending
                                </Badge>
                              </div>
                              <ChevronDown className={cn(
                                "w-4 h-4 text-blue-400 transition-transform duration-300",
                                showOtpDetails && "rotate-180"
                              )} />
                            </button>

                            <AnimatePresence>
                              {showOtpDetails && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-2">
                                    {otpAlerts.map((otp, idx) => (
                                      <div
                                        key={otp.id || idx}
                                        className="p-3 rounded-xl bg-white/80 dark:bg-white/5 border border-blue-200/50 dark:border-blue-800/30 hover:shadow-md transition-all"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <Key className="w-4 h-4 text-blue-600" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                                {otp.phone || 'Unknown'}
                                              </span>
                                              <Badge className="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0">
                                                {otp.code || '******'}
                                              </Badge>
                                              <Badge className={cn(
                                                "text-[8px] border-0",
                                                otp.status === 'pending' ? "bg-amber-500/20 text-amber-600" :
                                                otp.status === 'verified' ? "bg-emerald-500/20 text-emerald-600" :
                                                "bg-red-500/20 text-red-600"
                                              )}>
                                                {otp.status || 'pending'}
                                              </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5">
                                              <p className="text-[10px] text-gray-600 dark:text-gray-400">
                                                Expires in: <span className="font-mono font-medium">{otp.expiresIn || 2}m</span>
                                              </p>
                                              <p className="text-[8px] text-gray-400 dark:text-gray-500">
                                                {formatDate(otp.timestamp || otp.requestedAt)}
                                              </p>
                                            </div>
                                          </div>
                                          {otp.status === 'pending' && (
                                            <Button
                                              size="sm"
                                              className="h-7 text-[8px] bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-2.5 flex-shrink-0"
                                              onClick={() => {
                                                toast.success('OTP verified successfully');
                                                setOtpAlerts(prev => prev.map(o => 
                                                  o.id === otp.id ? { ...o, status: 'verified' } : o
                                                ));
                                              }}
                                            >
                                              <CheckCircle className="w-3 h-3 mr-1" />
                                              Verify
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─── User Uploaded Documents ────────────────────────── */}
                    {userDocuments.length > 0 && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
                          <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Documents ({userDocuments.length})
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                          {userDocuments.map((doc: any, idx: number) => renderDocumentItem(doc, idx, false))}
                        </div>
                      </div>
                    )}

                    {/* ─── Amer Uploaded Documents ────────────────────────── */}
                    {amerDocuments.length > 0 && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <UserCog className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 dark:text-blue-400" />
                          <p className="text-[8px] sm:text-[10px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
                            Amer Uploaded Documents ({amerDocuments.length})
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                          {amerDocuments.map((doc: any, idx: number) => renderDocumentItem(doc, idx, false))}
                        </div>
                      </div>
                    )}

                    {/* ─── Payment Receipts ────────────────────────────────── */}
                    {receiptDocuments.length > 0 && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 dark:text-emerald-400" />
                          <p className="text-[8px] sm:text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">
                            Payment Receipts ({receiptDocuments.length})
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                          {receiptDocuments.map((doc: any, idx: number) => renderDocumentItem(doc, idx, true))}
                        </div>
                      </div>
                    )}

                    {/* ─── Result Documents ────────────────────────────────── */}
                    {hasResultDocs && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl bg-gradient-to-br from-emerald-50/50 to-emerald-100/20 dark:from-emerald-950/10 dark:to-emerald-900/5 border border-emerald-200/40 dark:border-emerald-800/20 p-3 sm:p-4 space-y-2 sm:space-y-3"
                      >
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-500/20 dark:bg-emerald-500/30">
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">Results Ready</p>
                            <p className="text-[10px] sm:text-xs text-emerald-600/70 dark:text-emerald-400/70">
                              {application.resultDocuments.length} document(s) available
                            </p>
                          </div>
                          <Badge className="ml-auto bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[8px] sm:text-[10px]">
                            <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                            Verified
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                          {application.resultDocuments.map((doc: any, idx: number) => {
                            const fileUrl = doc.url || doc.fileUrl || doc.path || '';
                            const isImage = isDocumentImage(doc, fileUrl);
                            const isPdf = isDocumentPdf(doc, fileUrl);
                            
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-white/50 dark:bg-black/20 border border-emerald-200/50 dark:border-emerald-800/30"
                              >
                                <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                                  <div className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    {fileUrl && isImage ? (
                                      <img
                                        src={fileUrl}
                                        alt={doc.originalName || 'Result'}
                                        className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                                        onClick={() => onDocumentView(doc)}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          const parent = e.currentTarget.parentElement;
                                          if (parent) {
                                            const fallback = document.createElement('div');
                                            fallback.className = 'w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800';
                                            fallback.innerHTML = `<svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
                                            parent.appendChild(fallback);
                                          }
                                        }}
                                      />
                                    ) : fileUrl && isPdf ? (
                                      <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20">
                                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                                      </div>
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-emerald-500/10">
                                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] sm:text-xs font-medium text-emerald-900 dark:text-emerald-300 truncate">
                                      {doc.label || doc.originalName || 'Result'}
                                    </p>
                                    {doc.uploadedByRole && (
                                      <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[8px] sm:text-[9px] mt-0.5 border-0 rounded-full">
                                        by {doc.uploadedByRole}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-0.5 ml-1.5 sm:ml-2 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                                    onClick={() => onDocumentView(doc)}
                                    title="View document"
                                  >
                                    <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                                    onClick={() => onDocumentDownload(doc)}
                                    title="Download document"
                                  >
                                    <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* ─── Document Upload ────────────────────────────────── */}
                    <div className="space-y-2 sm:space-y-3">
                      <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                        <Upload className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        Upload Document
                      </p>

                      {uploadFile && (
                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                              {uploadFile.name}
                            </p>
                            <p className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                              {formatBytes(uploadFile.size)}
                            </p>
                          </div>
                          <button
                            onClick={clearSelectedFile}
                            className="p-1 sm:p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-700 transition-colors"
                            title="Remove file"
                          >
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                        <div className="flex-1">
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setUploadFile(file);
                              setUploadStatus('idle');
                              setUploadProgress(0);
                            }}
                            className="h-9 sm:h-10 text-[10px] sm:text-xs rounded-xl bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white file:text-gray-700 dark:file:text-gray-300 file:bg-gray-100/50 dark:file:bg-white/10 file:border-0 file:rounded-lg file:text-[10px] sm:file:text-xs file:font-medium hover:file:bg-gray-200/50 dark:hover:file:bg-white/20 transition-all duration-300"
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </div>
                        <Button
                          onClick={handleFileUpload}
                          disabled={!uploadFile || uploading || uploadStatus === 'uploading'}
                          className={cn(
                            "h-9 sm:h-10 text-[10px] sm:text-xs font-semibold rounded-xl transition-all duration-300 gap-1.5 sm:gap-2 shrink-0 relative overflow-hidden px-3 sm:px-4",
                            !uploadFile || uploading || uploadStatus === 'uploading'
                              ? "bg-gray-100/70 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-white/5"
                              : "bg-gradient-to-r from-[#14235E] to-[#1A4A8A] dark:from-white dark:to-gray-200 text-white dark:text-[#14235E] hover:shadow-lg hover:shadow-[#14235E]/25 dark:hover:shadow-white/20 hover:scale-[1.02] active:scale-95 shadow-md"
                          )}
                        >
                          {uploading || uploadStatus === 'uploading' ? (
                            <div className="flex items-center gap-1.5 sm:gap-2.5">
                              <div className="h-3 w-3 sm:h-3.5 sm:w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              <span className="font-medium">Uploading {uploadProgress}%</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 sm:gap-2.5 relative z-10">
                              <Upload className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:scale-110" />
                              <span className="font-medium">
                                {uploadFile ? 'Upload Document' : 'Select a file'}
                              </span>
                            </div>
                          )}
                        </Button>
                      </div>

                      {uploadStatus === 'uploading' && (
                        <div className="w-full">
                          <Progress value={uploadProgress} className="h-1" />
                          <p className="text-[8px] sm:text-[10px] text-gray-400 dark:text-white/30 mt-0.5 text-right">
                            {uploadProgress}%
                          </p>
                        </div>
                      )}

                      {uploadStatus === 'done' && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs">
                          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>Upload complete!</span>
                        </div>
                      )}

                      {uploadStatus === 'error' && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-red-600 dark:text-red-400 text-[10px] sm:text-xs">
                          <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>Upload failed. Please try again.</span>
                        </div>
                      )}
                    </div>

                    <Separator className="bg-gray-200/50 dark:bg-white/10" />

                    {/* ─── Action Buttons ────────────────────────────────── */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[8px] sm:text-[10px] h-8 sm:h-9 rounded-xl border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 gap-1.5 sm:gap-2"
                        onClick={() => setShowBoostDialog(true)}
                      >
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Rocket className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600 dark:text-purple-400" />
                        </div>
                        Priority
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[8px] sm:text-[10px] h-8 sm:h-9 rounded-xl border-blue-200/50 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 gap-1.5 sm:gap-2"
                        onClick={() => {
                          toast.info('Chat feature coming soon!', {
                            description: 'We are working on this feature and it will be available shortly.',
                            duration: 3000,
                          });
                        }}
                      >
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        Chat
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[8px] sm:text-[10px] h-8 sm:h-9 rounded-xl border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 gap-1.5 sm:gap-2"
                        onClick={() => setShowEditDialog(true)}
                      >
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[8px] sm:text-[10px] h-8 sm:h-9 rounded-xl border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 gap-1.5 sm:gap-2"
                        onClick={onToggle}
                      >
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <ChevronUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-600 dark:text-gray-400" />
                        </div>
                        Collapse
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[8px] sm:text-[10px] h-8 sm:h-9 rounded-xl border-red-200/50 dark:border-red-800/30 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 gap-1.5 sm:gap-2"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          {isDeleting ? (
                            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>

                    {/* ─── Application History with Toggle ────────────────── */}
                    {application.history && application.history.length > 0 && (
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowHistory(!showHistory)}
                          className="w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 hover:bg-gray-100/50 dark:hover:bg-white/10 transition-all duration-300 group"
                        >
                          <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300">
                              Application History ({application.history.length})
                            </span>
                          </div>
                          <motion.div
                            animate={{ rotate: showHistory ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-1 rounded-lg bg-white/50 dark:bg-slate-800/50 group-hover:bg-white/70 dark:group-hover:bg-slate-700/50"
                          >
                            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {showHistory && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1 sm:space-y-1.5 max-h-48 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                {application.history.map((event: any, idx: number) => (
                                  <div key={idx} className="flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-1.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">
                                        {event.action?.replace(/_/g, ' ').toUpperCase()}
                                      </p>
                                      {event.note && (
                                        <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 truncate">{event.note}</p>
                                      )}
                                      <p className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                                        {new Date(event.at).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* ─── Receipt Preview Dialog ──────────────────────────────────────── */}
      <Dialog open={showReceiptPreview} onOpenChange={setShowReceiptPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/10 p-0 overflow-hidden rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200/50 dark:border-white/10">
            <DialogTitle className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
              {selectedReceipt?.originalName || 'Receipt'}
            </DialogTitle>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const url = getReceiptUrl(selectedReceipt, apiBase, appId);
                  if (url) {
                    window.open(url, '_blank');
                  } else {
                    toast.error('Receipt URL not available');
                  }
                }}
                className="h-7 sm:h-8 gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg"
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseReceiptPreview}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          <div className="p-3 sm:p-4 overflow-auto max-h-[calc(90vh-80px)] flex items-center justify-center bg-gray-100/50 dark:bg-black/30">
            {selectedReceipt && (() => {
              const url = getReceiptUrl(selectedReceipt, apiBase, appId);
              
              if (!url) {
                return (
                  <div className="text-center text-red-500">
                    <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2" />
                    <p>Receipt file not found.</p>
                  </div>
                );
              }
              const mimeType = selectedReceipt.mimeType || '';
              const ext = selectedReceipt.originalName?.split('.').pop()?.toLowerCase();
              const isImage = mimeType.startsWith('image/') || ['jpg','jpeg','png','gif','webp'].includes(ext || '');
              const isPdf = mimeType === 'application/pdf' || ext === 'pdf';

              if (isImage) {
                return (
                  <img
                    src={url}
                    alt={selectedReceipt.originalName || 'Receipt'}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      console.error('Image load error for:', url);
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                );
              } else if (isPdf) {
                return (
                  <iframe
                    src={url}
                    className="w-full h-[70vh] rounded-lg border-0"
                    title="Receipt PDF"
                  />
                );
              } else {
                return (
                  <div className="text-center text-text-muted">
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" />
                    <p>Preview not available for this file type</p>
                    <Button
                      onClick={() => window.open(url, '_blank')}
                      className="mt-3 sm:mt-4"
                    >
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Open file
                    </Button>
                  </div>
                );
              }
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Inline Image Preview Dialog ────────────────────────────────── */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] w-[90vw] sm:w-[50vw] border border-gray-200/50 dark:border-white/10 p-0 overflow-hidden rounded-2xl shadow-2xl">
          <div className="relative flex items-center justify-center w-full h-full min-h-[200px] sm:min-h-[300px] p-3 sm:p-4">
            {previewImage && (
              <img
                src={previewImage.url}
                alt={previewImage.doc.originalName || 'Preview'}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  toast.error('Failed to load image');
                  setPreviewImage(null);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Boost Dialog ────────────────────────────────────────────────── */}
      <Dialog open={showBoostDialog} onOpenChange={setShowBoostDialog}>
        <DialogContent className="max-w-md bg-white/95 dark:bg-[#0A1628] backdrop-blur-sm border border-[#14235E]/20 dark:border-[#14235E]/30 rounded-2xl p-0 shadow-2xl shadow-[#14235E]/10 dark:shadow-[#14235E]/20 overflow-hidden">
          <div className="relative px-6 pt-6 pb-4 border-b border-[#14235E]/10 dark:border-[#14235E]/20 bg-gradient-to-br from-[#14235E]/5 to-[#1A4A8A]/5 dark:from-[#14235E]/10 dark:to-[#1A4A8A]/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#14235E]/10 rounded-full blur-3xl -translate-y-12 translate-x-12" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#1A4A8A]/10 rounded-full blur-2xl translate-y-8 -translate-x-8" />
            
            <DialogHeader className="relative">
              <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                <div className="p-2 rounded-xl bg-[#14235E] shadow-lg shadow-[#14235E]/25">
                  <Rocket className="h-5 w-5 text-white" strokeWidth={1.8} />
                </div>
                <span>Priority Boost</span>
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#14235E]/10 dark:bg-[#14235E]/20 text-[#14235E] dark:text-[#4A8ABF] text-[10px] font-medium">
                  <Sparkles className="h-3 w-3" />
                  {boostCount < 3 
                    ? `${3 - boostCount} free boost${3 - boostCount > 1 ? 's' : ''} remaining` 
                    : 'All boosts used'}
                </span>
                <span className="w-px h-4 bg-gray-300/50 dark:bg-white/10" />
                <span className="text-[11px] text-gray-400 dark:text-gray-500">Get priority processing</span>
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Free boosts used</span>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">{boostCount}/3</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200/60 dark:bg-white/10 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    boostCount >= 3 ? "bg-red-500" : "bg-[#14235E]"
                  )}
                  style={{ width: `${Math.min((boostCount / 3) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              {boostCount < 3 ? (
                <Button
                  onClick={handlePriorityBoost}
                  className="w-full group relative overflow-hidden rounded-xl bg-[#14235E] hover:bg-[#1A4A8A] text-white font-semibold h-12 px-4 shadow-lg shadow-[#14235E]/25 hover:shadow-xl hover:shadow-[#14235E]/30 transition-all duration-300 border-0"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <div className="flex items-center justify-center gap-2.5 relative z-10">
                    <Sparkles className="h-4 w-4" />
                    <span>Activate Free Boost</span>
                    <Badge className="bg-white/20 text-white border-0 text-[9px] px-2 py-0.5">
                      {3 - boostCount} left
                    </Badge>
                  </div>
                </Button>
              ) : (
                <Button
                  onClick={() => { setShowPaymentDialog(true); setShowBoostDialog(false); }}
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold h-12 px-4 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 border-0"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <div className="flex items-center justify-center gap-2.5 relative z-10">
                    <DollarSign className="h-4 w-4" />
                    <span>Pay AED 10 for Boost</span>
                    <Badge className="bg-white/20 text-white border-0 text-[9px] px-2 py-0.5">
                      Premium
                    </Badge>
                  </div>
                </Button>
              )}
            </div>

            <div className="bg-gray-50/80 dark:bg-white/5 rounded-xl p-3.5 border border-gray-200/50 dark:border-white/5">
              <p className="text-[10px] font-semibold text-[#14235E] dark:text-[#4A8ABF] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5" />
                Boost Benefits
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  <span>Priority queue</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span>Faster review</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <span>24/7 support</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <TrendingUp className="h-3 w-3 text-[#14235E]" />
                  <span>Higher visibility</span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowBoostDialog(false)}
              className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-[#14235E]/5 dark:hover:bg-[#14235E]/10 rounded-xl h-10 text-sm font-medium transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Payment Dialog ────────────────────────────────────────────────── */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-white/10 rounded-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              Payment for Boost
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Pay AED 10 to get priority processing for your application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <Button
              onClick={handlePaymentBoost}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl h-10 sm:h-12"
            >
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Pay AED 10
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              className="w-full border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-xl h-9 sm:h-10"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 rounded-3xl p-0 shadow-2xl overflow-hidden">
          <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-gray-200/50 dark:border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                  <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={1.8} />
                </div>
                <span>Edit Application</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-gray-500 dark:text-white/60 mt-0.5 sm:mt-1">
                Update the sponsor and applicant details below.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            {/* Sponsor Information */}
            <div className="space-y-2 sm:space-y-3">
              <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40 flex items-center gap-1.5 sm:gap-2">
                <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Sponsor Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="editFirstName" className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-white/80">First Name</Label>
                  <Input
                    id="editFirstName"
                    defaultValue={application.sponsor?.firstName || ''}
                    className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#14235E] focus:ring-[#14235E]/20 transition-all duration-200 h-9 sm:h-10 text-xs sm:text-sm"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="editLastName" className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-white/80">Last Name</Label>
                  <Input
                    id="editLastName"
                    defaultValue={application.sponsor?.lastName || ''}
                    className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#14235E] focus:ring-[#14235E]/20 transition-all duration-200 h-9 sm:h-10 text-xs sm:text-sm"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="editEmail" className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-white/80">Email Address</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    defaultValue={application.sponsor?.email || ''}
                    className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#14235E] focus:ring-[#14235E]/20 transition-all duration-200 h-9 sm:h-10 text-xs sm:text-sm"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="editPhone" className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-white/80">Phone Number</Label>
                  <Input
                    id="editPhone"
                    type="tel"
                    defaultValue={application.sponsor?.phone || ''}
                    className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#14235E] focus:ring-[#14235E]/20 transition-all duration-200 h-9 sm:h-10 text-xs sm:text-sm"
                    placeholder="+971 50 123 4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="editEmiratesId" className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-white/80">Emirates ID</Label>
                  <Input
                    id="editEmiratesId"
                    defaultValue={application.sponsor?.emiratesId || ''}
                    className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#14235E] focus:ring-[#14235E]/20 transition-all duration-200 h-9 sm:h-10 text-xs sm:text-sm"
                    placeholder="784-1234-5678900-1"
                  />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="editPassport" className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-white/80">Passport Number</Label>
                  <Input
                    id="editPassport"
                    defaultValue={application.sponsor?.passportNumber || ''}
                    className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#14235E] focus:ring-[#14235E]/20 transition-all duration-200 h-9 sm:h-10 text-xs sm:text-sm"
                    placeholder="A1234567"
                  />
                </div>
              </div>
            </div>

            {application.sponsored && (
              <>
                <Separator className="bg-gray-200/50 dark:bg-white/10" />
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40 flex items-center gap-1.5 sm:gap-2">
                    <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Sponsored Person Details
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="space-y-1 sm:space-y-1.5">
                      <Label htmlFor="editSponsoredFirstName" className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-white/80">First Name</Label>
                      <Input
                        id="editSponsoredFirstName"
                        defaultValue={application.sponsored?.firstName || ''}
                        className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#14235E] focus:ring-[#14235E]/20 transition-all duration-200 h-9 sm:h-10 text-xs sm:text-sm"
                        placeholder="Jane"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-1.5">
                      <Label htmlFor="editSponsoredLastName" className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-white/80">Last Name</Label>
                      <Input
                        id="editSponsoredLastName"
                        defaultValue={application.sponsored?.lastName || ''}
                        className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#14235E] focus:ring-[#14235E]/20 transition-all duration-200 h-9 sm:h-10 text-xs sm:text-sm"
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="space-y-1 sm:space-y-1.5">
                      <Label htmlFor="editSponsoredNationality" className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-white/80">Nationality</Label>
                      <Input
                        id="editSponsoredNationality"
                        defaultValue={application.sponsored?.nationality || ''}
                        className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#14235E] focus:ring-[#14235E]/20 transition-all duration-200 h-9 sm:h-10 text-xs sm:text-sm"
                        placeholder="British"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-1.5">
                      <Label htmlFor="editSponsoredPassport" className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-white/80">Passport Number</Label>
                      <Input
                        id="editSponsoredPassport"
                        defaultValue={application.sponsored?.passportNumber || ''}
                        className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#14235E] focus:ring-[#14235E]/20 transition-all duration-200 h-9 sm:h-10 text-xs sm:text-sm"
                        placeholder="B7654321"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="rounded-xl border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-200 order-2 sm:order-1 h-9 sm:h-10 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success('Application updated successfully');
                setShowEditDialog(false);
              }}
              className="rounded-xl bg-gradient-to-r from-[#14235E] to-[#1A4A8A] dark:from-white dark:to-gray-200 text-white dark:text-[#14235E] font-semibold shadow-lg shadow-[#14235E]/25 dark:shadow-white/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 order-1 sm:order-2 h-9 sm:h-10 text-xs sm:text-sm px-4 sm:px-6"
            >
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpandedApplicationCard;