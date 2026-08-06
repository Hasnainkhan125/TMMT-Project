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

interface ExpandedApplicationCardProps {
  application: any;
  isExpanded: boolean;
  onToggle: () => void;
  onDocumentView: (doc: any) => void;
  onDocumentDownload: (doc: any) => void;
  onDelete?: (appId: string) => void; // optional callback to refresh parent
}

const ExpandedApplicationCard: React.FC<ExpandedApplicationCardProps> = ({
  application,
  isExpanded,
  onToggle,
  onDocumentView,
  onDocumentDownload,
  onDelete,
}) => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
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
  const [payments] = useState<any[]>(application.payments || []);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusConfig = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const hasResultDocs = application.resultDocuments && application.resultDocuments.length > 0;

  const handleDocumentDownload = async (attachment: any, app: any) => {
    try {
      const token = localStorage.getItem('authToken') || '';
      const applicationId = app?._id || app?.id;
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

  const handleViewResultDocument = (doc: any, app: any) => {
    try {
      const fileUrl = `${apiBase}/uploads/applications/${app?._id || app?.id}/${doc.path}`;
      if (!fileUrl) {
        toast.error('Document URL not available');
        return;
      }
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('View error:', error);
      toast.error('Failed to open document');
    }
  };

  const handleCopyId = () => {
    const id = application._id || application.id;
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success('Application ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── DELETE HANDLER (always visible, error handled) ─────────────────────
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
        // Try to parse error message from backend
        let errorMessage = `Delete failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (_) {
          // Fallback to status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      toast.success('Application deleted successfully');

      // If parent provided callback, call it
      if (onDelete) {
        await onDelete(appId);
      } else {
        // Optionally reload the list via custom event or refresh
        console.log('Delete successful, but no onDelete callback provided.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete application');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── WebSocket listeners ──────────────────────────────────────────────────
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

  // ─── File Upload ───────────────────────────────────────────────────────────
  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('type', 'additional_document');

      const response = await fetch(
        `${apiBase}/api/v1/visa/${application._id || application.id}/attachments/upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (response.ok) {
        toast.success('Document uploaded successfully');
        setUploadFile(null);
        window.location.reload();
      } else {
        toast.error('Failed to upload document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // ─── Priority Boost ──────────────────────────────────────────────────────
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

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
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
        {/* Header */}
        <CardHeader 
          className="cursor-pointer p-4 hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-300 rounded-t-xl"
          onClick={onToggle}
        >
          <div className="flex items-center justify-between gap-3">
            {/* Left Section */}
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

        {/* Expanded Content */}
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
                  {/* Status Description */}
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

                  {/* Progress Bar */}
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

                  {/* Quick Stats */}
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

                  {/* Notifications */}
                  {notifications.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Bell className="h-3 w-3 text-red-500" />
                        Recent Notifications ({notifications.length})
                      </p>
                      {notifications.map((notif: any, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-red-50/80 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30"
                        >
                          <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-red-900 dark:text-red-300">{notif.message}</p>
                            <p className="text-[10px] text-red-600/70 dark:text-red-400/70">{new Date(notif.timestamp).toLocaleString()}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 shrink-0"
                            onClick={() => setNotifications(prev => prev.filter((_, i) => i !== idx))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* OTP Requests */}
                  {otpRequests.filter((otp: any) => otp.status === 'pending').length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="h-3 w-3 text-blue-500" />
                        OTP Verification Requests ({otpRequests.filter((otp: any) => otp.status === 'pending').length})
                      </p>
                      {otpRequests.filter((otp: any) => otp.status === 'pending').map((otp: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-xs font-medium text-blue-900 dark:text-blue-300">
                                Please verify OTP sent to {otp.phone}
                              </p>
                              <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70">
                                Expires in {otp.expiresIn} min • {new Date(otp.requestedAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] rounded-full shrink-0">Pending</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Requested Documents */}
                  {requestedDocuments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        Requested Documents ({requestedDocuments.filter((d: any) => d.status === 'pending').length})
                      </p>
                      <div className="space-y-1.5">
                        {requestedDocuments.map((doc: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-amber-900 dark:text-amber-300">{doc.documentType || doc}</p>
                                {doc.description && (
                                  <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-0.5">{doc.description}</p>
                                )}
                                <p className="text-[10px] text-amber-500/70 dark:text-amber-400/50 mt-0.5">
                                  {new Date(doc.requestedAt).toLocaleDateString()}
                                  {doc.deadline && ` • Due ${new Date(doc.deadline).toLocaleDateString()}`}
                                </p>
                              </div>
                              {doc.status === 'pending' && (
                                <Button size="sm" className="h-7 text-[10px] px-3 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 gap-1.5 shadow-lg hover:shadow-xl active:scale-95 shrink-0">
                                  <Upload className="h-3 w-3" />
                                  Upload
                                </Button>
                              )}
                              {doc.status !== 'pending' && (
                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] rounded-full shrink-0">
                                  {doc.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payments */}
                  {payments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <CreditCard className="h-3 w-3 text-purple-500" />
                        Payment History ({payments.length})
                      </p>
                      <div className="space-y-1.5">
                        {payments.map((payment: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30">
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-purple-900 dark:text-purple-300">
                                  {payment.type?.replace(/_/g, ' ')} - {payment.currency} {payment.amount}
                                </p>
                                <p className="text-[10px] text-purple-600/70 dark:text-purple-400/70 truncate">
                                  {payment.description || 'No description'}
                                </p>
                                <p className="text-[10px] text-purple-500/70 dark:text-purple-400/50 mt-0.5">
                                  {new Date(payment.paidAt).toLocaleDateString()} • {payment.paymentMethod || 'N/A'}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                <Badge className={cn(
                                  "text-[10px] rounded-full",
                                  payment.status === 'completed' ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
                                  payment.status === 'pending' ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" :
                                  "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                                )}>
                                  {payment.status}
                                </Badge>
                                {payment.receiptUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                                    onClick={() => window.open(payment.receiptUrl, '_blank')}
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submitted Documents */}
                  {application.attachments && application.attachments.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          Submitted Documents ({application.attachments.length})
                        </p>
                        <Badge variant="outline" className="text-[9px] text-gray-500 dark:text-gray-400">
                          {application.attachments.filter((d: any) => d.size > 0).length} files
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {application.attachments.map((doc: any, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 group/doc"
                          >
                            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0">
                              <FileText className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs truncate font-medium text-gray-700 dark:text-gray-300">
                                {doc.originalName || doc.filename || 'Document'}
                              </p>
                              {doc.size && (
                                <p className="text-[10px] text-gray-400 dark:text-gray-500">{formatBytes(doc.size)}</p>
                              )}
                            </div>
                            <div className="flex gap-0.5 opacity-0 group-hover/doc:opacity-100 transition-all duration-300">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20"
                                onClick={() => onDocumentView(doc)}
                                title="View document"
                              >
                                <Eye className="h-3.5 w-3.5 text-gray-500 hover:text-primary transition-colors" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20"
                                onClick={() => onDocumentDownload(doc)}
                                title="Download document"
                              >
                                <Download className="h-3.5 w-3.5 text-gray-500 hover:text-primary transition-colors" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Result Documents */}
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
                        {application.resultDocuments.map((doc: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-white/50 dark:bg-black/20 border border-emerald-200/50 dark:border-emerald-800/30"
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                                <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
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
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Document Upload */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Upload className="h-3 w-3" />
                      Upload Additional Document
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <Input
                          type="file"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          className="h-10 text-xs rounded-xl bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white file:text-gray-700 dark:file:text-gray-300 file:bg-gray-100/50 dark:file:bg-white/10 file:border-0 file:rounded-lg file:text-xs file:font-medium hover:file:bg-gray-200/50 dark:hover:file:bg-white/20 transition-all duration-300"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                      <Button
                        onClick={handleFileUpload}
                        disabled={!uploadFile || uploading}
                        className={cn(
                          "h-10 text-xs font-semibold rounded-xl transition-all duration-300 gap-2 shrink-0",
                          !uploadFile || uploading 
                            ? "bg-gray-200/50 dark:bg-white/10 text-gray-500 dark:text-gray-400 cursor-not-allowed" 
                            : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-lg hover:shadow-xl active:scale-95"
                        )}
                      >
                        {uploading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload</span>
                            {uploadFile && (
                              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                            )}
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-gray-200/50 dark:bg-white/10" />

                  {/* Action Buttons */}
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
                    {/* ─── DELETE BUTTON ────────────────────────────────────── always visible */}
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

                  {/* Application History */}
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

      {/* ─── Dialogs ────────────────────────────────────────────────────────── */}

      {/* Priority Boost Dialog */}
      <Dialog open={showBoostDialog} onOpenChange={setShowBoostDialog}>
        <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-black/95 border border-gray-200/50 dark:border-white/10 shadow-xl p-6 overflow-hidden">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A3269] shadow-lg shadow-[#0A3269]/25">
                <Rocket className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-light">Priority Boost</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 font-light pl-12">
              Move your application to the front of the queue for faster processing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/30 border border-gray-200/50 dark:border-gray-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 dark:text-gray-300 font-light">Free Boosts</span>
                <span className="text-2xl font-light text-[#0A3269] dark:text-white">
                  {3 - boostCount}<span className="text-base text-gray-400 dark:text-gray-500">/3</span>
                </span>
              </div>
              <div className="relative h-1.5 rounded-full overflow-hidden bg-gray-200/50 dark:bg-gray-700/50">
                <div 
                  className="h-full rounded-full bg-[#0A3269] transition-all duration-500"
                  style={{ width: `${((3 - boostCount) / 3) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-light">
                {boostCount >= 3
                  ? 'All free boosts used. Paid boost available.'
                  : `${3 - boostCount} free boost${3 - boostCount > 1 ? 's' : ''} remaining`}
              </p>
            </div>

            {boostCount < 3 ? (
              <Button 
                onClick={handlePriorityBoost} 
                className="w-full rounded-xl bg-[#0A3269] hover:bg-[#1A4A8A] text-white transition-all duration-300 gap-2.5 h-11 text-sm font-light shadow-md hover:shadow-lg active:scale-[0.98] group"
              >
                <Zap className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                <span>Activate Free Boost</span>
              </Button>
            ) : (
              <Button
                onClick={() => setShowPaymentDialog(true)}
                className="w-full rounded-xl bg-[#0A3269] hover:bg-[#1A4A8A] text-white transition-all duration-300 gap-2.5 h-11 text-sm font-light shadow-md hover:shadow-lg active:scale-[0.98] group"
              >
                <DollarSign className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                <span>Pay AED 10 for Instant Boost</span>
              </Button>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-light">
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span>Priority boost moves your application up in the processing queue</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-black/95 border border-gray-200/50 dark:border-white/10 shadow-2xl p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2.5 text-base text-gray-900 dark:text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              Payment Required
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              Pay AED 10 for instant priority boost
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">Amount</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">AED 10</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-700 dark:text-gray-300">Card Number</Label>
              <Input placeholder="1234 5678 9012 3456" className="h-10 text-sm rounded-xl bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-700 dark:text-gray-300">Expiry</Label>
                <Input placeholder="MM/YY" className="h-10 text-sm rounded-xl bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white" />
              </div>
              <div>
                <Label className="text-xs text-gray-700 dark:text-gray-300">CVV</Label>
                <Input placeholder="123" type="password" maxLength={3} className="h-10 text-sm rounded-xl bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white" />
              </div>
            </div>

            <Button onClick={handlePaymentBoost} className="w-full rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 h-10 text-sm shadow-lg hover:shadow-xl gap-2">
              <CreditCard className="h-4 w-4" />
              Pay & Activate Boost
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Application Dialog ────────────────────────────────── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl p-0">
          {/* Header – Glass Gradient */}
          <div className="relative p-6 pb-4 border-b border-gray-200/20 dark:border-white/5 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    Edit Application
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    Update your application details
                    <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] font-medium rounded-full px-2.5 py-0.5">
                      Coming Soon
                    </Badge>
                  </DialogDescription>
                </div>
              </div>
              <button
                onClick={() => setShowEditDialog(false)}
                className="p-1.5 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Body – Modern placeholder with shimmer fields */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/30 dark:border-blue-800/30 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 shrink-0">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Edit functionality is under development
                  </p>
                  <p className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-0.5">
                    You can upload additional documents from the expanded view of your application card.
                  </p>
                </div>
              </div>

              {/* Skeleton Fields – shows what will be available */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">First Name</Label>
                    <div className="h-9 rounded-lg bg-gray-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Last Name</Label>
                    <div className="h-9 rounded-lg bg-gray-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 animate-pulse" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</Label>
                    <div className="h-9 rounded-lg bg-gray-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone</Label>
                    <div className="h-9 rounded-lg bg-gray-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Application Type</Label>
                  <div className="h-9 rounded-lg bg-gray-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 animate-pulse" />
                </div>
              </div>

              {/* Coming Soon Note with icon */}
              <div className="flex items-center justify-center gap-2 pt-2 text-xs text-gray-400 dark:text-gray-500">
                <Rocket className="h-3.5 w-3.5" />
                <span>Full edit experience will be available in the next update</span>
              </div>
            </div>
          </div>

          {/* Footer – modern action buttons */}
          <div className="p-4 border-t border-gray-200/20 dark:border-white/5 bg-gray-50/30 dark:bg-white/5 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditDialog(false)}
              className="rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-white/10"
            >
              Close
            </Button>
            <Button
              size="sm"
              disabled
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 text-sm font-medium px-5 opacity-60 cursor-not-allowed"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Live Chat Dialog */}
      <Dialog open={showLiveChat} onOpenChange={setShowLiveChat}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0 rounded-2xl bg-white dark:bg-black/95 border border-gray-200/50 dark:border-white/10 shadow-2xl overflow-hidden">
          <DialogHeader className="p-4 pb-3 border-b border-gray-200/50 dark:border-white/10">
            <DialogTitle className="flex items-center gap-2.5 text-base text-gray-900 dark:text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              Live Chat Support
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              Chat with our support team
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30 dark:bg-black/20">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100/50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p>Live chat will be available soon.</p>
              <p className="mt-2">For now, you can contact us via email or phone.</p>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-black/20">
            <div className="flex gap-2">
              <Input 
                placeholder="Type your message..." 
                disabled 
                className="flex-1 h-10 text-sm rounded-xl bg-gray-50/50 dark:bg-white/5 border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white"
              />
              <Button disabled size="sm" className="h-10 rounded-xl bg-gray-300/50 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-sm px-4">
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ExpandedApplicationCard;