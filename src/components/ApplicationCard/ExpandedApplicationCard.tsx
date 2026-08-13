'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { getSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';

// ─── Status Configuration ────────────────────────────────────────────────────

const STATUS_CONFIG = {
  approved: {
    label: 'Approved',
    color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    icon: CheckCircle,
    gradient: 'from-emerald-50/80 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10',
    border: 'border-emerald-200/50 dark:border-emerald-800/30',
    description: 'Your application has been approved successfully',
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    dotColor: 'bg-blue-500',
    icon: Clock,
    gradient: 'from-blue-50/80 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10',
    border: 'border-blue-200/50 dark:border-blue-800/30',
    description: 'Our team is reviewing your application',
  },
  docs_required: {
    label: 'Docs Required',
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dotColor: 'bg-amber-500',
    icon: AlertCircle,
    gradient: 'from-amber-50/80 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10',
    border: 'border-amber-200/50 dark:border-amber-800/30',
    description: 'Additional documents are required',
  },
  pending: {
    label: 'Pending',
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dotColor: 'bg-amber-500',
    icon: Clock,
    description: 'Your check is queued for processing',
    gradient: 'from-amber-50/80 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10',
    border: 'border-amber-200/50 dark:border-amber-800/30',
  },
};

// ─── Helper Functions ──────────────────────────────────────────────────────

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showBoostDialog, setShowBoostDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
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

  const statusConfig = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const hasResultDocs = application.resultDocuments && application.resultDocuments.length > 0;

  const receipts = application.receipts || [];

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

  useEffect(() => {
    if (!application) return;

    const socket = getSocket();

    socket.on('document_requested', (data: any) => {
      if (data.applicationId === application.id || data.applicationId === application._id) {
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
    });

    socket.on('otp_requested', (data: any) => {
      if (data.applicationId === application.id || data.applicationId === application._id) {
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
    });

    socket.on('application_status_updated', (data: any) => {
      if (data.applicationId === application.id || data.applicationId === application._id) {
        toast.success('Application status updated', {
          description: `New status: ${data.status}`,
        });
      }
    });

    return () => {
      socket.off('document_requested');
      socket.off('otp_requested');
      socket.off('application_status_updated');
    };
  }, [application]);

  // ─── Document Upload Handler (with progress) ────────────────────────────
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

      // ─── Simulate progress ─────────────────────────────────────────────
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

      // Reset status after a short delay
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

  // ─── Clear selected file ──────────────────────────────────────────────────
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

  const appId = application._id || application.id;

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

  // ─── Document render helper (modified to show inline image preview) ──
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

    // ─── Handle image click: show inline preview ──────────────────────
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
          "flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-white/5 border transition-all duration-300 group/doc",
          isReceipt 
            ? "border-emerald-200/50 dark:border-emerald-800/30 hover:border-emerald-400/50 dark:hover:border-emerald-700/50" 
            : isAmer
              ? "border-blue-200/50 dark:border-blue-800/30 hover:border-blue-400/50 dark:hover:border-blue-700/50 hover:shadow-md hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5"
              : "border-gray-200/50 dark:border-white/5 hover:border-primary/30 dark:hover:border-primary/30"
        )}
      >
        <div className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
                  fallback.innerHTML = `<svg class="w-6 h-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : fileUrl && isPdf ? (
            <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20">
              <FileText className="w-6 h-6 text-red-500" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 dark:bg-primary/20">
              {isReceipt ? (
                <Receipt className="w-6 h-6 text-emerald-500" />
              ) : isAmer ? (
                <UserCog className="w-6 h-6 text-blue-500" />
              ) : (
                <FileText className="w-6 h-6 text-primary" />
              )}
            </div>
          )}
          {doc.status && (
            <div className="absolute -top-1 -right-1">
              <Badge className={cn(
                "text-[7px] rounded-full px-1.5 py-0.5 border-0 shadow-sm",
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
              <Badge className="text-[7px] bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                Receipt
              </Badge>
            </div>
          )}
          {isAmer && (
            <div className="absolute -bottom-1 -left-1">
              <Badge className="text-[7px] bg-blue-500/20 text-blue-600 border-blue-500/30">
                Amer
              </Badge>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
            {doc.originalName || doc.filename || (isReceipt ? 'Receipt' : 'Document')}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {doc.size && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {formatBytes(doc.size)}
              </span>
            )}
            {doc.uploadedByRole && (
              <Badge className={cn(
                "text-[8px] border-0",
                doc.uploadedByRole === 'amer' || doc.uploadedByRole === 'admin' 
                  ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" 
                  : "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400"
              )}>
                {doc.uploadedByRole === 'amer' || doc.uploadedByRole === 'admin' ? 'Amer' : 'User'}
              </Badge>
            )}
            {isReceipt && doc.status && (
              <Badge className={cn(
                "text-[8px] font-normal border-0",
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
        <div className="flex items-center gap-1 opacity-0 group-hover/doc:opacity-100 transition-all duration-300">
          {fileUrl && !isImage && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20"
              onClick={() => {
                if (isReceipt) {
                  handleOpenReceiptPreview(doc);
                } else {
                  onDocumentView(doc);
                }
              }}
              title="View document"
            >
              <Eye className="h-3.5 w-3.5 text-gray-500 hover:text-primary transition-colors" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20"
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
            <Download className="h-3.5 w-3.5 text-gray-500 hover:text-primary transition-colors" />
          </Button>
        </div>
      </motion.div>
    );
  };

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
            "border transition-all duration-300",
            "bg-gradient-to-br",
            statusConfig.gradient,
            statusConfig.border,
            "backdrop-blur-sm"
          )}
        >
          <CardHeader
            className="cursor-pointer p-4 hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-300 rounded-t-xl"
            onClick={onToggle}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                    statusConfig.color,
                    "transition-all duration-300 group-hover:scale-110"
                  )}>
                    <StatusIcon className="h-4.5 w-4.5" />
                  </div>
                  {application.status === 'under_review' && (
                    <div className="absolute -top-0.5 -right-0.5">
                      <span className="flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                      </span>
                    </div>
                  )}
                  {application.status === 'approved' && (
                    <div className="absolute -top-0.5 -right-0.5">
                      <span className="flex h-2.5 w-2.5">
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    </div>
                  )}
                  {boostCount > 0 && (
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-[6px] font-bold text-white">
                        {boostCount}
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate text-gray-900 dark:text-white">
                      {application.applicationType
                        .replace(/_/g, ' ')
                        .split(' ')
                        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </p>
                    <Badge className={cn("text-[10px] font-medium", statusConfig.color)}>
                      <StatusIcon className="h-2.5 w-2.5 mr-1" />
                      {statusConfig.label}
                    </Badge>
                    {hasResultDocs && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-medium">
                        <Sparkles className="h-2.5 w-2.5 mr-1" />
                        Results Ready
                      </Badge>
                    )}
                    {boostCount > 0 && (
                      <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] font-medium">
                        <Rocket className="h-2.5 w-2.5 mr-1" />
                        Boosted
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(application.createdAt)}</span>
                    <span className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
                    <FileText className="h-3 w-3" />
                    <span>{application.attachments?.length || 0}</span>
                    {notifications.length > 0 && (
                      <>
                        <span className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
                        <Bell className="h-3 w-3 text-red-500" />
                        <span className="text-red-500 font-medium text-xs">{notifications.length}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:block w-20" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
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
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="border-t border-gray-200/50 dark:border-white/10 pt-4 space-y-4">
                    {/* ─── Status Description ───────────────────────────────── */}
                    <div className="flex items-center gap-3 text-sm p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                      <div className={cn("h-2.5 w-2.5 rounded-full", statusConfig.dotColor)} />
                      <span className="text-gray-600 dark:text-gray-300">{statusConfig.description}</span>
                      <div className="flex items-center gap-1 ml-auto shrink-0">
                        <Badge variant="outline" className="text-[9px] font-mono text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                          {appId.slice(0, 6).toUpperCase()}
                        </Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyId();
                          }}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          title="Copy ID"
                        >
                          {copied ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* ─── Progress Bar ────────────────────────────────────── */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Application Progress</span>
                        <span className="font-medium">{getProgress()}%</span>
                      </div>
                      <div className="relative h-2 rounded-full overflow-hidden bg-gray-200/50 dark:bg-gray-700/50">
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-center transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/30">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-base lg:text-lg font-bold text-gray-900 dark:text-white block">
                          {application.attachments?.length || 0}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">Documents</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-center transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/30">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-1.5">
                          <Calendar className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-base lg:text-lg font-bold text-gray-900 dark:text-white block">
                          {Math.ceil((Date.now() - new Date(application.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">Days Old</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-center transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/30">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-1.5">
                          <Award className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-base lg:text-lg font-bold text-gray-900 dark:text-white block">
                          {hasResultDocs ? application.resultDocuments.length : 0}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">Results</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-center transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/30">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mx-auto mb-1.5">
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                        </div>
                        <span className="text-base lg:text-lg font-bold text-gray-900 dark:text-white block">{boostCount}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">Boosts</span>
                      </div>
                    </div>

                    {/* ─── User Uploaded Documents ────────────────────────── */}
                    {userDocuments.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Documents ({userDocuments.length})
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {userDocuments.map((doc: any, idx: number) => renderDocumentItem(doc, idx, false))}
                        </div>
                      </div>
                    )}

                    {/* ─── Amer Uploaded Documents ────────────────────────── */}
                    {amerDocuments.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <UserCog className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          <p className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
                            Amer Uploaded Documents ({amerDocuments.length})
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {amerDocuments.map((doc: any, idx: number) => renderDocumentItem(doc, idx, false))}
                        </div>
                      </div>
                    )}

                    {/* ─── Payment Receipts ────────────────────────────────── */}
                    {receiptDocuments.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                          <p className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">
                            Payment Receipts ({receiptDocuments.length})
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {receiptDocuments.map((doc: any, idx: number) => renderDocumentItem(doc, idx, true))}
                        </div>
                      </div>
                    )}

                    {/* ─── Result Documents ────────────────────────────────── */}
                    {hasResultDocs && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30 p-4 space-y-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 dark:bg-emerald-500/30">
                            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">Results Ready</p>
                            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                              {application.resultDocuments.length} document(s) available
                            </p>
                          </div>
                          <Badge className="ml-auto bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                            <Sparkles className="h-2.5 w-2.5 mr-1" />
                            Verified
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {application.resultDocuments.map((doc: any, idx: number) => {
                            const fileUrl = doc.url || doc.fileUrl || doc.path || '';
                            const isImage = isDocumentImage(doc, fileUrl);
                            const isPdf = isDocumentPdf(doc, fileUrl);
                            
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 rounded-lg bg-white/50 dark:bg-black/20 border border-emerald-200/50 dark:border-emerald-800/30"
                              >
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                  <div className="relative flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
                                      <div className="w-full h-full flex items-center justify-center bg-emerald-500/10">
                                        <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-emerald-900 dark:text-emerald-300 truncate">
                                      {doc.label || doc.originalName || 'Result'}
                                    </p>
                                    {doc.uploadedByRole && (
                                      <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[9px] mt-0.5 border-0 rounded-full">
                                        by {doc.uploadedByRole}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-0.5 ml-2 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                                    onClick={() => onDocumentView(doc)}
                                    title="View document"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                                    onClick={() => onDocumentDownload(doc)}
                                    title="Download document"
                                  >
                                    <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* ─── Document Upload (with clear button and progress) ── */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Upload className="h-3 w-3" />
                        Upload Document
                      </p>

                      {uploadFile && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                              {uploadFile.name}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                              {formatBytes(uploadFile.size)}
                            </p>
                          </div>
                          <button
                            onClick={clearSelectedFile}
                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-700 transition-colors"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setUploadFile(file);
                              setUploadStatus('idle');
                              setUploadProgress(0);
                            }}
                            className="h-10 text-xs rounded-xl bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white file:text-gray-700 dark:file:text-gray-300 file:bg-gray-100/50 dark:file:bg-white/10 file:border-0 file:rounded-lg file:text-xs file:font-medium hover:file:bg-gray-200/50 dark:hover:file:bg-white/20 transition-all duration-300"
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </div>
                        <Button
                          onClick={handleFileUpload}
                          disabled={!uploadFile || uploading || uploadStatus === 'uploading'}
                          className={cn(
                            "h-10 text-xs font-semibold rounded-xl transition-all duration-300 gap-2 shrink-0 relative overflow-hidden",
                            !uploadFile || uploading || uploadStatus === 'uploading'
                              ? "bg-gray-100/70 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-white/5"
                              : "bg-gradient-to-r from-[#0A3269] to-[#1A4A8A] dark:from-white dark:to-gray-200 text-white dark:text-[#0A3269] hover:shadow-lg hover:shadow-[#0A3269]/25 dark:hover:shadow-white/20 hover:scale-[1.02] active:scale-95 shadow-md"
                          )}
                        >
                          {uploading || uploadStatus === 'uploading' ? (
                            <div className="flex items-center gap-2.5">
                              <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              <span className="font-medium">Uploading {uploadProgress}%</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5 relative z-10">
                              <Upload className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
                              <span className="font-medium">
                                {uploadFile ? 'Upload Document' : 'Select a file'}
                              </span>
                            </div>
                          )}
                        </Button>
                      </div>

                      {/* Progress bar for upload */}
                      {uploadStatus === 'uploading' && (
                        <div className="w-full">
                          <Progress value={uploadProgress} className="h-1.5" />
                          <p className="text-[10px] text-gray-400 dark:text-white/30 mt-1 text-right">
                            {uploadProgress}%
                          </p>
                        </div>
                      )}

                      {uploadStatus === 'done' && (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Upload complete!</span>
                        </div>
                      )}

                      {uploadStatus === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Upload failed. Please try again.</span>
                        </div>
                      )}
                    </div>

                    <Separator className="bg-gray-200/50 dark:bg-white/10" />

                    {/* ─── Action Buttons ────────────────────────────────── */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[10px] h-9 rounded-xl border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 gap-2"
                        onClick={() => setShowBoostDialog(true)}
                      >
                        <div className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Rocket className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        </div>
                        Priority
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[10px] h-9 rounded-xl border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 gap-2"
                        onClick={() => setShowLiveChat(true)}
                      >
                        <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <MessageSquare className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        Chat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[10px] h-9 rounded-xl border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 gap-2"
                        onClick={() => setShowEditDialog(true)}
                      >
                        <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Edit className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[10px] h-9 rounded-xl border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 gap-2"
                        onClick={onToggle}
                      >
                        <div className="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <ChevronUp className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                        </div>
                        Collapse
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[10px] h-9 rounded-xl border-red-200/50 dark:border-red-800/30 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 gap-2"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        <div className="w-5 h-5 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          {isDeleting ? (
                            <div className="h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>

                    {/* ─── Application History ────────────────────────────── */}
                    {application.history && application.history.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <History className="h-3 w-3" />
                          Application History ({application.history.length})
                        </p>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                          {application.history.map((event: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-1.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                  {event.action?.replace(/_/g, ' ').toUpperCase()}
                                </p>
                                {event.note && (
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{event.note}</p>
                                )}
                                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                  {new Date(event.at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
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
        <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] bg-white dark:bg-black/95 border border-gray-200/50 dark:border-white/10 p-0 overflow-hidden rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-white/10">
            <DialogTitle className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
              <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              {selectedReceipt?.originalName || 'Receipt'}
            </DialogTitle>
            <div className="flex items-center gap-2">
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
                className="h-8 gap-1.5 text-xs rounded-lg"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseReceiptPreview}
                className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] flex items-center justify-center bg-gray-100/50 dark:bg-black/30">
            {selectedReceipt && (() => {
              const url = getReceiptUrl(selectedReceipt, apiBase, appId);
              
              if (!url) {
                return (
                  <div className="text-center text-red-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2" />
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
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <p>Preview not available for this file type</p>
                    <Button
                      onClick={() => window.open(url, '_blank')}
                      className="mt-4"
                    >
                      <Download className="w-4 h-4 mr-2" />
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
        <DialogContent className="max-w-4xl max-h-[90vh] w-[50vw]  border border-gray-200/50 dark:border-white/10 p-0 overflow-hidden rounded-2xl shadow-2xl">
          <div className="relative flex items-center justify-center w-full h-full min-h-[300px] p-4">
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

      {/* ─── Existing Dialogs ────────────────────────────────────────────── */}
      <Dialog open={showBoostDialog} onOpenChange={setShowBoostDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-black/95 border border-gray-200/50 dark:border-white/10 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Rocket className="h-5 w-5 text-purple-500" />
              Priority Boost
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              {boostCount < 3
                ? `You have ${3 - boostCount} free boost${3 - boostCount > 1 ? 's' : ''} remaining.`
                : 'You have used all free boosts. Upgrade to paid boost.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {boostCount < 3 ? (
              <Button
                onClick={handlePriorityBoost}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl h-12"
              >
                Activate Free Boost
              </Button>
            ) : (
              <Button
                onClick={() => { setShowPaymentDialog(true); setShowBoostDialog(false); }}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl h-12"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Pay AED 10 for Boost
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowBoostDialog(false)}
              className="w-full border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-xl h-10"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-black/95 border border-gray-200/50 dark:border-white/10 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              Payment for Boost
            </DialogTitle>
            <DialogDescription>
              Pay AED 10 to get priority processing for your application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={handlePaymentBoost}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl h-12"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Pay AED 10
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              className="w-full border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-xl h-10"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 rounded-3xl p-0 shadow-2xl overflow-hidden">
          {/* ─── Header ────────────────────────────────────── */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200/50 dark:border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                  <Edit className="h-5 w-5 text-white" strokeWidth={1.8} />
                </div>
                <span>Edit Application</span>
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-white/60 mt-1">
                Update the sponsor and applicant details below.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* ─── Body ──────────────────────────────────────── */}
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            {/* Sponsor Information */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40 flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                Sponsor Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editFirstName" className="text-xs font-medium text-gray-700 dark:text-white/80">First Name</Label>
                  <Input
                    id="editFirstName"
                    defaultValue={application.sponsor?.firstName || ''}
                    className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#0A3269] focus:ring-[#0A3269]/20 transition-all duration-200"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editLastName" className="text-xs font-medium text-gray-700 dark:text-white/80">Last Name</Label>
                  <Input
                    id="editLastName"
                    defaultValue={application.sponsor?.lastName || ''}
                    className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#0A3269] focus:ring-[#0A3269]/20 transition-all duration-200"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editEmail" className="text-xs font-medium text-gray-700 dark:text-white/80">Email Address</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    defaultValue={application.sponsor?.email || ''}
                    className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#0A3269] focus:ring-[#0A3269]/20 transition-all duration-200"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editPhone" className="text-xs font-medium text-gray-700 dark:text-white/80">Phone Number</Label>
                  <Input
                    id="editPhone"
                    type="tel"
                    defaultValue={application.sponsor?.phone || ''}
                    className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#0A3269] focus:ring-[#0A3269]/20 transition-all duration-200"
                    placeholder="+971 50 123 4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editEmiratesId" className="text-xs font-medium text-gray-700 dark:text-white/80">Emirates ID</Label>
                  <Input
                    id="editEmiratesId"
                    defaultValue={application.sponsor?.emiratesId || ''}
                    className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#0A3269] focus:ring-[#0A3269]/20 transition-all duration-200"
                    placeholder="784-1234-5678900-1"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editPassport" className="text-xs font-medium text-gray-700 dark:text-white/80">Passport Number</Label>
                  <Input
                    id="editPassport"
                    defaultValue={application.sponsor?.passportNumber || ''}
                    className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#0A3269] focus:ring-[#0A3269]/20 transition-all duration-200"
                    placeholder="A1234567"
                  />
                </div>
              </div>
            </div>

            {application.sponsored && (
              <>
                <Separator className="bg-gray-200/50 dark:bg-white/10" />
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40 flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5" />
                    Sponsored Person Details
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="editSponsoredFirstName" className="text-xs font-medium text-gray-700 dark:text-white/80">First Name</Label>
                      <Input
                        id="editSponsoredFirstName"
                        defaultValue={application.sponsored?.firstName || ''}
                        className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#0A3269] focus:ring-[#0A3269]/20 transition-all duration-200"
                        placeholder="Jane"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="editSponsoredLastName" className="text-xs font-medium text-gray-700 dark:text-white/80">Last Name</Label>
                      <Input
                        id="editSponsoredLastName"
                        defaultValue={application.sponsored?.lastName || ''}
                        className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#0A3269] focus:ring-[#0A3269]/20 transition-all duration-200"
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="editSponsoredNationality" className="text-xs font-medium text-gray-700 dark:text-white/80">Nationality</Label>
                      <Input
                        id="editSponsoredNationality"
                        defaultValue={application.sponsored?.nationality || ''}
                        className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#0A3269] focus:ring-[#0A3269]/20 transition-all duration-200"
                        placeholder="British"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="editSponsoredPassport" className="text-xs font-medium text-gray-700 dark:text-white/80">Passport Number</Label>
                      <Input
                        id="editSponsoredPassport"
                        defaultValue={application.sponsored?.passportNumber || ''}
                        className="rounded-xl border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-[#0A3269] focus:ring-[#0A3269]/20 transition-all duration-200"
                        placeholder="B7654321"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ─── Footer ──────────────────────────────────────── */}
          <div className="px-6 py-4 border-t border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="rounded-xl border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-200 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Here you would collect the values and call an API to update
                toast.success('Application updated successfully');
                setShowEditDialog(false);
              }}
              className="rounded-xl bg-gradient-to-r from-[#0A3269] to-[#1A4A8A] dark:from-white dark:to-gray-200 text-white dark:text-[#0A3269] font-semibold shadow-lg shadow-[#0A3269]/25 dark:shadow-white/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 order-1 sm:order-2"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLiveChat} onOpenChange={setShowLiveChat}>
        <DialogContent className="max-w-md bg-white dark:bg-black/95 border border-gray-200/50 dark:border-white/10 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-emerald-500" />
              Live Chat Support
            </DialogTitle>
            <DialogDescription>
              Chat with our support team about your application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Our support team is online and ready to help.</p>
              <p className="text-xs mt-1">Click below to start a chat.</p>
            </div>
            <Button
              onClick={() => {
                toast.success('Chat started');
                setShowLiveChat(false);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-12"
            >
              Start Chat
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLiveChat(false)}
              className="w-full border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-xl h-10"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpandedApplicationCard;