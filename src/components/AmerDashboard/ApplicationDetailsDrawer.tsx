import React, { useState } from 'react';
import { 
  User, 
  FileText, 
  Clock, 
  CheckCircle, 
  Eye, 
  Download,
  Phone,
  Mail,
  Shield,
  Gavel,
  Key,
  Upload,
  Edit,
  AlertCircle,
  Lock,
  Send,
  Ban,
  Image,
  File,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  X,
  Crown,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileDrawer, CollapsibleSection } from '@/components/ui/mobile-drawer';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { VisaApplication } from '@/lib/supabase';
import type { AmerApplication } from '@/hooks/useAmerDashboard';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

type ApplicationUnion = VisaApplication | AmerApplication;

const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001';

interface ApplicationDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationUnion | null;
  onStatusUpdate: (applicationId: string, status: string, note?: string) => void;
  onDocumentUpload: (applicationId: string) => void;
  onRequestDocuments?: (applicationId: string, requested: string[], note?: string) => Promise<any> | void;
}

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  { value: 'submitted', label: 'Submitted', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { value: 'under_review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  { value: 'docs_required', label: 'Documents Required', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  { value: 'approved', label: 'Approved', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  { value: 'fraud_detected', label: 'Fraud Detected', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  { value: 'penalty_issued', label: 'Penalty Issued', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
];

export const ApplicationDetailsDrawer: React.FC<ApplicationDetailsDrawerProps> = ({
  isOpen,
  onClose,
  application,
  onStatusUpdate,
  onDocumentUpload,
  onRequestDocuments,
}) => {
  const { t } = useTranslation();
  const [newStatus, setNewStatus] = useState(application?.status || '');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [docReqOpen, setDocReqOpen] = useState(false);
  const [docReqNote, setDocReqNote] = useState('');
  const [docReq, setDocReq] = useState<Record<string, boolean>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [editSponsor, setEditSponsor] = useState<any>({
    firstName: application?.sponsor?.firstName || '',
    lastName: application?.sponsor?.lastName || '',
    email: (application as any)?.sponsor?.email || '',
    phone: (application as any)?.sponsor?.phone || '',
    emiratesId: (application as any)?.sponsor?.emiratesId || '',
    passportNumber: (application as any)?.sponsor?.passportNumber || ''
  });
  const [editSponsored, setEditSponsored] = useState<any>({
    firstName: (application as any)?.sponsored?.firstName || '',
    lastName: (application as any)?.sponsored?.lastName || '',
    dateOfBirth: (application as any)?.sponsored?.dateOfBirth ? String((application as any).sponsored.dateOfBirth).slice(0,10) : '',
    nationality: (application as any)?.sponsored?.nationality || '',
    passportNumber: (application as any)?.sponsored?.passportNumber || '',
    relationship: (application as any)?.sponsored?.relationship || ''
  });

  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [documentReviewOpen, setDocumentReviewOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [isReviewing, setIsReviewing] = useState(false);

  const [fraudAlertOpen, setFraudAlertOpen] = useState(false);
  const [fraudAlertData, setFraudAlertData] = useState({
    type: 'document_verification',
    severity: 'medium',
    description: ''
  });
  const [penaltyOpen, setPenaltyOpen] = useState(false);
  const [penaltyData, setPenaltyData] = useState({
    type: 'late_submission',
    amount: 0,
    description: ''
  });
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpData, setOtpData] = useState({
    phone: '',
    minutes: 5
  });

  if (!application) return null;

  const receipts = (application as any)?.receipts || [];

  const handleDocumentDownload = async (attachment: any) => {
    try {
      const token = localStorage.getItem('authToken') || '';
      const applicationId = (application as any)?._id || (application as any)?.id;
      const response = await fetch(`${apiBase}/api/v1/visa/${applicationId}/attachments/${attachment._id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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

  const handleDocumentView = (attachment: any) => {
    setSelectedDocument(attachment);
    setDocumentPreviewOpen(true);
  };

  const handleDocumentReview = async () => {
    if (!selectedDocument) return;
    
    setIsReviewing(true);
    try {
      const token = localStorage.getItem('authToken') || '';
      const applicationId = (application as any)?._id || (application as any)?.id;
      
      await fetch(`${apiBase}/api/v1/visa/${applicationId}/attachments/${selectedDocument._id}/review`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          status: reviewStatus,
          comment: reviewComment,
          rejectionReason: reviewStatus === 'rejected' ? reviewComment : undefined
        })
      });
      
      toast.success(`Document ${reviewStatus} successfully`);
      setDocumentReviewOpen(false);
      setReviewComment('');
      setSelectedDocument(null);
    } catch (error) {
      toast.error(`Failed to ${reviewStatus} document`);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleFraudAlert = async () => {
    try {
      const token = localStorage.getItem('authToken') || '';
      const applicationId = (application as any)?._id || (application as any)?.id;
      
      await fetch(`${apiBase}/api/v1/visa/${applicationId}/fraud-alert`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(fraudAlertData)
      });
      
      toast.success(t('success.saved'));
      setFraudAlertOpen(false);
      setFraudAlertData({ type: 'document_verification', severity: 'medium', description: '' });
    } catch (error) {
      toast.error(t('errors.general'));
    }
  };

  const handleIssuePenalty = async () => {
    try {
      const token = localStorage.getItem('authToken') || '';
      const applicationId = (application as any)?._id || (application as any)?.id;
      
      await fetch(`${apiBase}/api/v1/visa/${applicationId}/penalty`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(penaltyData)
      });
      
      toast.success(t('success.sent'));
      setPenaltyOpen(false);
      setPenaltyData({ type: 'late_submission', amount: 0, description: '' });
    } catch (error) {
      toast.error(t('errors.general'));
    }
  };

  const handleRequestOTP = async () => {
    try {
      const token = localStorage.getItem('authToken') || '';
      const applicationId = (application as any)?._id || (application as any)?.id;
      
      await fetch(`${apiBase}/api/v1/visa/${applicationId}/otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(otpData)
      });
      
      toast.success(t('otp.otpSent'));
      setOtpOpen(false);
      setOtpData({ phone: '', minutes: 5 });
    } catch (error) {
      toast.error(t('otp.failedToSend'));
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === application.status) return;
    
    setIsUpdating(true);
    try {
      const id = (application as any)?._id || (application as any)?.id
      await onStatusUpdate(id, newStatus, statusNote);
      setStatusNote('');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusOptions.find(opt => opt.value === status);
    if (!config) return null;

    return (
      <Badge className={cn(config.color, 'border-0 font-medium')}>
        {config.label}
      </Badge>
    );
  };

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) {
      return <Image className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A3269]" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
    } else {
      return <File className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />;
    }
  };

  return (
    <MobileDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t('amerDashboard.viewDetails')}
      size="xl"
      position="right"
      className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950"
    >
      <div className="p-4 space-y-6">
      {/* ─── Premium Header Card ──────────────────────────────────── */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-5  border border-gray-200/60 dark:border-white/10"
>
  {/* ─── Background Accents ──────────────────────────────────── */}
  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#0A3269]/5 dark:bg-white/5 blur-2xl" />
  <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#0A3269]/5 dark:bg-white/5 blur-2xl" />
  
  <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div className="space-y-2">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-gradient-to-br from-[#0A3269] to-[#1A4A8A] dark:from-white dark:to-gray-200 shadow-lg shadow-[#0A3269]/20 dark:shadow-white/10">
          <Crown className="w-4 h-4 text-white dark:text-gray-900" />
        </div>
        <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {application.applicationType.replace('_', ' ').toUpperCase()}
        </h3>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {getStatusBadge(application.status)}
        <span className="text-[10px] text-gray-400 dark:text-white/30 font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
          #{String((application as any)?.id || (application as any)?._id).slice(-8)}
        </span>
      </div>
      
      <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-white/30">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date((application as any).createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
        <span className="w-px h-3 bg-gray-200 dark:bg-white/10" />
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date((application as any).createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
    
    <Button
      variant="outline"
      size="sm"
      onClick={() => setEditOpen(true)}
      className="rounded-xl border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 hover:border-[#0A3269]/30 dark:hover:border-white/30 px-4 h-9 text-xs font-medium transition-all duration-300"
    >
      <Edit className="w-3.5 h-3.5 mr-1.5" />
      Edit Details
    </Button>
  </div>
</motion.div>

        {/* ─── Sponsor Information ──────────────────────────────────── */}
        <CollapsibleSection title="Sponsor Information" defaultOpen={true}>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="p-3 rounded-xl bg-[#0A3269]/10 dark:bg-white/10">
                <User className="w-6 h-6 text-[#0A3269] dark:text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {application.sponsor.firstName} {application.sponsor.lastName}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-white/60">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {application.sponsor.email}
                  </span>
                  <span className="w-px h-3 bg-gray-300 dark:bg-white/10" />
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {application.sponsor.phoneNumber}
                  </span>
                </div>
              </div>
            </div>
            
            {(application.sponsor.emiratesId || (application.sponsor as any).passportNumber) && (
              <div className="grid grid-cols-2 gap-2">
                {application.sponsor.emiratesId && (
                  <div className="p-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10">
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">Emirates ID</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white mt-0.5">{application.sponsor.emiratesId}</p>
                  </div>
                )}
                {(application.sponsor as any).passportNumber && (
                  <div className="p-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10">
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">Passport</p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white mt-0.5">{(application.sponsor as any).passportNumber}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* ─── Sponsored Person ──────────────────────────────────────── */}
        {application.sponsored && (
          <CollapsibleSection title="Sponsored Person" defaultOpen={true}>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {application.sponsored.firstName} {application.sponsored.lastName}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-white/60">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {application.sponsored.email}
                    </span>
                    <span className="w-px h-3 bg-gray-300 dark:bg-white/10" />
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {application.sponsored.phoneNumber}
                    </span>
                  </div>
                </div>
              </div>
              
              {(application.sponsored as any).emiratesId && (
                <div className="p-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10">
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">Emirates ID</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white mt-0.5">{(application.sponsored as any).emiratesId}</p>
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* ─── Documents ────────────────────────────────────────────── */}
        <CollapsibleSection title="Documents" defaultOpen={true}>
          <div className="space-y-3">
            {application.attachments && application.attachments.length > 0 ? (
              application.attachments.map((doc, index) => {
                const fileUrl = (doc as any).url || (doc as any).fileUrl || (doc as any).path || '';
                const fileName = (doc as any).originalName || (doc as any).filename || 'Document';
                const mimeType = (doc as any).mimeType || (doc as any).type || '';
                const isImage = fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) ||
                                mimeType?.startsWith('image/') ||
                                fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
                const docStatus = (doc as any).status || (doc as any).verificationStatus || 'pending';
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-white/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5">
                        {fileUrl && isImage ? (
                          <img 
                            src={fileUrl} 
                            alt={fileName}
                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                            onClick={() => handleDocumentView(doc)}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getDocumentIcon(mimeType || 'application/octet-stream')}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {fileName.length > 25 ? fileName.slice(0, 25) + '...' : fileName}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-white/60 capitalize">
                          {doc.type?.replace(/[_-]/g, ' ')} • {((doc as any).fileSize ? (doc as any).fileSize / 1024 / 1024 : 0).toFixed(1)}MB
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-2 sm:mt-0 ml-0 sm:ml-2">
                      {fileUrl && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDocumentView(doc)}
                            className="h-7 w-7 p-0 rounded-lg hover:bg-[#0A3269]/10 dark:hover:bg-white/10"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-500 dark:text-white/60" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDocumentDownload(doc)}
                            className="h-7 w-7 p-0 rounded-lg hover:bg-[#0A3269]/10 dark:hover:bg-white/10"
                          >
                            <Download className="w-3.5 h-3.5 text-gray-500 dark:text-white/60" />
                          </Button>
                        </>
                      )}
                      <Badge className={cn(
                        'text-[8px] font-medium rounded-full px-2 py-0.5 border-0',
                        docStatus === 'approved' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                        docStatus === 'rejected' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                        docStatus === 'under_review' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                        docStatus === 'pending' && 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      )}>
                        {docStatus}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400 dark:text-white/40">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No documents uploaded yet</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="rounded-xl border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/80 hover:border-[#0A3269]/30 dark:hover:border-white/30 hover:text-[#0A3269] dark:hover:text-white"
                onClick={() => onDocumentUpload((application as any)?._id || (application as any)?.id)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button 
                className="rounded-xl bg-[#0A3269] dark:bg-white hover:bg-[#1A4A8A] dark:hover:bg-gray-100 text-white dark:text-black shadow-lg shadow-[#0A3269]/25 dark:shadow-white/20 hover:shadow-xl transition-all duration-300"
                onClick={() => setDocReqOpen(true)}
              >
                <Send className="w-4 h-4 mr-2" />
                Request
              </Button>
            </div>
          </div>
        </CollapsibleSection>

        {/* ─── Application History ──────────────────────────────────── */}
        <CollapsibleSection title="Application History" defaultOpen={false}>
          <div className="space-y-2">
            {application.history.length === 0 ? (
              <div className="text-center py-6 text-gray-400 dark:text-white/40 text-sm">
                No history entries yet
              </div>
            ) : (
              application.history.map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200"
                >
                  <div className="w-2 h-2 rounded-full bg-[#0A3269] dark:bg-white mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {entry.action?.replace(/_/g, ' ').toUpperCase() || 'Action'}
                    </p>
                    {entry.note && (
                      <p className="text-[10px] text-gray-500 dark:text-white/60 mt-0.5">{entry.note}</p>
                    )}
                    <p className="text-[9px] text-gray-400 dark:text-white/40 mt-1">
                      {new Date(entry.at).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CollapsibleSection>

        {/* ─── Risk Assessment ────────────────────────────────────────── */}
        <CollapsibleSection title="Risk Assessment" defaultOpen={false}>
          <div className="space-y-4 p-4 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              <span className="text-xs font-medium text-gray-700 dark:text-white/70 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Fraud Risk
              </span>
              <Badge className={cn(
                'px-3 py-0.5 text-[10px] font-semibold uppercase rounded-full border-0',
                application.metadata.fraudRisk === 'high' 
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' 
                  : application.metadata.fraudRisk === 'medium' 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' 
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              )}>
                {application.metadata.fraudRisk?.toUpperCase() || 'N/A'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              <span className="text-xs font-medium text-gray-700 dark:text-white/70 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Blacklist Status
              </span>
              <Badge className={cn(
                'px-3 py-0.5 text-[10px] font-semibold uppercase rounded-full border-0',
                application.metadata.blacklistStatus === 'blacklisted' 
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' 
                  : application.metadata.blacklistStatus === 'flagged' 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' 
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              )}>
                {application.metadata.blacklistStatus?.toUpperCase() || 'N/A'}
              </Badge>
            </div>
          </div>
        </CollapsibleSection>

        {/* ─── Quick Actions ──────────────────────────────────────────── */}
        <CollapsibleSection title="Quick Actions" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFraudAlertOpen(true)}
              className="rounded-xl border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/80 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all"
            >
              <Shield className="w-3.5 h-3.5 mr-1.5 text-red-500" />
              Fraud Alert
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPenaltyOpen(true)}
              className="rounded-xl border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/80 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 transition-all"
            >
              <Gavel className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
              Penalty
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setOtpOpen(true)}
              className="rounded-xl border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/80 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all"
            >
              <Key className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
              OTP
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setNewStatus(application.status === 'closed' ? 'draft' : 'closed');
                handleStatusUpdate();
              }}
              className="rounded-xl border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/80 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all"
            >
              <Ban className="w-3.5 h-3.5 mr-1.5 text-red-500" />
              {application.status === 'closed' ? 'Reopen' : 'Close'}
            </Button>
          </div>
        </CollapsibleSection>

        {/* ─── Status Update ────────────────────────────────────────── */}
        <CollapsibleSection title="Update Status" defaultOpen={false}>
          <div className="space-y-4 p-4 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-white/80">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white hover:border-[#0A3269]/40 dark:hover:border-white/40 transition-colors">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-white/10 shadow-lg">
                  {statusOptions.map(option => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-900 dark:text-white"
                    >
                      <span className="flex items-center gap-2 text-xs">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          option.value === 'approved' ? "bg-emerald-500" :
                          option.value === 'rejected' ? "bg-red-500" :
                          option.value === 'submitted' ? "bg-blue-500" :
                          option.value === 'under_review' ? "bg-yellow-500" :
                          option.value === 'docs_required' ? "bg-orange-500" :
                          "bg-gray-400"
                        )} />
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-white/80">Note (Optional)</label>
              <Textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note about this status change..."
                rows={2}
                className="text-xs rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white resize-none focus:border-[#0A3269]/40 dark:focus:border-white/40 transition-colors"
              />
            </div>
            
            <Button 
              onClick={handleStatusUpdate}
              disabled={!newStatus || newStatus === application.status || isUpdating}
              className="w-full rounded-xl bg-[#0A3269] dark:bg-white hover:bg-[#1A4A8A] dark:hover:bg-gray-100 text-white dark:text-black shadow-lg shadow-[#0A3269]/25 dark:shadow-white/20 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </div>
        </CollapsibleSection>
      </div>

      {/* ─── Edit Details Modal ──────────────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center animate-in fade-in duration-200">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-black w-full md:w-[720px] rounded-t-2xl md:rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-black pb-3 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#0A3269]/10 dark:bg-white/10">
                  <Edit className="w-4 h-4 text-[#0A3269] dark:text-white" />
                </div>
                <span className="text-base font-bold text-gray-900 dark:text-white">Edit Application Details</span>
              </div>
              <button 
                onClick={() => setEditOpen(false)} 
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-white/60" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/60 flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Sponsor Details
              </div>
              <Input placeholder="First name" value={editSponsor.firstName} onChange={(e)=> setEditSponsor((p:any)=>({...p, firstName: e.target.value}))} className="rounded-xl text-sm bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" />
              <Input placeholder="Last name" value={editSponsor.lastName} onChange={(e)=> setEditSponsor((p:any)=>({...p, lastName: e.target.value}))} className="rounded-xl text-sm bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" />
              <Input placeholder="Email" value={editSponsor.email} onChange={(e)=> setEditSponsor((p:any)=>({...p, email: e.target.value}))} className="rounded-xl text-sm bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" />
              <Input placeholder="Phone" value={editSponsor.phone} onChange={(e)=> setEditSponsor((p:any)=>({...p, phone: e.target.value}))} className="rounded-xl text-sm bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" />
              <Input placeholder="Emirates ID" value={editSponsor.emiratesId} onChange={(e)=> setEditSponsor((p:any)=>({...p, emiratesId: e.target.value}))} className="rounded-xl text-sm bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" />
              <Input placeholder="Passport Number" value={editSponsor.passportNumber} onChange={(e)=> setEditSponsor((p:any)=>({...p, passportNumber: e.target.value}))} className="rounded-xl text-sm bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" />

              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/60 flex items-center gap-2 mt-2">
                <UserCheck className="w-3.5 h-3.5" />
                Sponsored Details (optional)
              </div>
              <Input placeholder="First name" value={editSponsored.firstName} onChange={(e)=> setEditSponsored((p:any)=>({...p, firstName: e.target.value}))} className="rounded-xl text-sm bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" />
              <Input placeholder="Last name" value={editSponsored.lastName} onChange={(e)=> setEditSponsored((p:any)=>({...p, lastName: e.target.value}))} className="rounded-xl text-sm bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" />
              <Input type="date" placeholder="Date of birth" value={editSponsored.dateOfBirth} onChange={(e)=> setEditSponsored((p:any)=>({...p, dateOfBirth: e.target.value}))} className="rounded-xl text-sm bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" />
              <Input placeholder="Nationality" value={editSponsored.nationality} onChange={(e)=> setEditSponsored((p:any)=>({...p, nationality: e.target.value}))} className="rounded-xl text-sm bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" />
              <Input placeholder="Passport Number" value={editSponsored.passportNumber} onChange={(e)=> setEditSponsored((p:any)=>({...p, passportNumber: e.target.value}))} className="rounded-xl text-sm bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" />
              <Select value={editSponsored.relationship} onValueChange={(v)=> setEditSponsored((p:any)=>({...p, relationship: v}))}>
                <SelectTrigger className="rounded-xl bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Relationship" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-white/10">
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-gray-200 dark:border-white/10">
              <Button variant="outline" onClick={()=> setEditOpen(false)} className="rounded-xl border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/80">Cancel</Button>
              <Button onClick={async ()=>{
                try {
                  const token = localStorage.getItem('authToken') || ''
                  const id = (application as any)?._id || (application as any)?.id
                  const payload: any = { sponsor: editSponsor, sponsored: editSponsored }
                  Object.keys(payload.sponsored).forEach(k=> {
                    if (payload.sponsored[k] === '' || payload.sponsored[k] === undefined) delete payload.sponsored[k]
                  })
                  if (Object.keys(payload.sponsored).length === 0) delete payload.sponsored
                  await fetch(`${apiBase}/api/v1/visa/${id}/details`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload)
                  })
                  toast.success('Details updated successfully')
                  setEditOpen(false)
                } catch {
                  toast.error('Failed to update details')
                }
              }} className="rounded-xl bg-[#0A3269] dark:bg-white hover:bg-[#1A4A8A] dark:hover:bg-gray-100 text-white dark:text-black shadow-lg shadow-[#0A3269]/25 dark:shadow-white/20">Save Changes</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── Request Documents Modal ────────────────────────────────────── */}
      {docReqOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center animate-in fade-in duration-200">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-black w-full md:w-[520px] rounded-t-2xl md:rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-black pb-3 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#0A3269]/10 dark:bg-white/10">
                  <Send className="w-4 h-4 text-[#0A3269] dark:text-white" />
                </div>
                <span className="text-base font-bold text-gray-900 dark:text-white">Request Documents</span>
              </div>
              <button onClick={() => setDocReqOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-gray-500 dark:text-white/60" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-white/60">Select documents to request from the applicant.</p>
            
            <div className="grid grid-cols-2 gap-2">
              {Array.from(new Set(application.attachments.map(a => a.type).concat([
                'sponsor_emirates_id','sponsor_passport','sponsor_visa','sponsor_salary_certificate','sponsor_trade_license','sponsor_establishment_card','sponsored_passport_front','sponsored_photo','marriage_certificate','birth_certificate'
              ]))).map((id) => (
                <label key={id} className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  <input type="checkbox" checked={!!docReq[id]} onChange={(e) => setDocReq(prev => ({ ...prev, [id]: e.target.checked }))} className="rounded border-gray-300 dark:border-white/20" />
                  <span className="capitalize text-gray-700 dark:text-white/80">{id.replace(/[_-]/g,' ')}</span>
                </label>
              ))}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-white/80">Note (optional)</label>
              <Textarea value={docReqNote} onChange={(e)=> setDocReqNote(e.target.value)} rows={2} placeholder="Add details or instructions..." className="text-xs rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white" />
            </div>
            
            <div className="flex gap-2 justify-end pt-3 border-t border-gray-200 dark:border-white/10">
              <Button variant="outline" onClick={() => setDocReqOpen(false)} className="rounded-xl border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/80">Cancel</Button>
              <Button 
                className="rounded-xl bg-[#0A3269] dark:bg-white hover:bg-[#1A4A8A] dark:hover:bg-gray-100 text-white dark:text-black shadow-lg shadow-[#0A3269]/25 dark:shadow-white/20"
                onClick={async ()=>{
                  const id = (application as any)?._id || (application as any)?.id
                  const requested = Object.entries(docReq).filter(([,v])=>v).map(([k])=>k)
                  if (requested.length === 0) return
                  await onRequestDocuments?.(id, requested, docReqNote)
                  setDocReqOpen(false)
                  setDocReq({})
                  setDocReqNote('')
                }}
              >
                Send Request
              </Button>
            </div>
          </motion.div>
        </div>
      )}

    {/* ─── Document Preview Modal ────────────────────────────────────── */}
<Dialog open={documentPreviewOpen} onOpenChange={setDocumentPreviewOpen}>
  <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[95vh] overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl bg-white dark:bg-gray-900 p-0">
    {/* ─── Header ───────────────────────────────────────────────────── */}
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-gray-900/80">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-1.5 sm:p-2 rounded-xl bg-[#0A3269]/10 dark:bg-[#0A3269]/20">
          {selectedDocument && getDocumentIcon(selectedDocument.mimeType)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {selectedDocument?.originalName || selectedDocument?.filename || 'Document'}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
            <span className="capitalize">{selectedDocument?.type?.replace(/[_-]/g, ' ') || 'File'}</span>
            <span>•</span>
            <span>{selectedDocument?.fileSize ? `${(selectedDocument.fileSize / 1024 / 1024).toFixed(1)} MB` : ''}</span>
            {selectedDocument?.status && (
              <span className={cn(
                'px-2 py-0.5 rounded-full text-[9px] font-medium',
                selectedDocument.status === 'approved' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                selectedDocument.status === 'rejected' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                selectedDocument.status === 'pending' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              )}>
                {selectedDocument.status}
              </span>
            )}
          </div>
        </div>
      </div>
  
    </div>

    {/* ─── Content ──────────────────────────────────────────────────── */}
    <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-[300px] sm:min-h-[400px] flex items-center justify-center">
      {selectedDocument && (() => {
        const appId = (application as any)?._id || (application as any)?.id || '';
        let fileUrl = selectedDocument.url || selectedDocument.fileUrl || selectedDocument.path || '';
        const mimeType = selectedDocument.mimeType || '';
        const isImage = mimeType?.startsWith('image/') || fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
        const isPDF = mimeType === 'application/pdf' || fileUrl?.match(/\.pdf$/i);
        
        if (!fileUrl) return (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-sm font-medium">Document URL not found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">The document may not be uploaded or the URL is missing</p>
          </div>
        );
        
        if (isImage) return (
          <div className="relative w-full flex items-center justify-center">
            <img 
              src={fileUrl}
              alt={selectedDocument.originalName || 'Document'}
              className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'text-center text-gray-500 dark:text-gray-400 p-8';
                  fallback.innerHTML = `
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <p class="text-sm font-medium">Unable to load preview</p>
                    <button onclick="window.open('${fileUrl}', '_blank')" class="mt-3 px-4 py-2 bg-[#0A3269] text-white rounded-lg text-sm hover:bg-[#1A4A8A] transition-colors">
                      Open in new tab
                    </button>
                  `;
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
        );
        
        if (isPDF) return (
          <div className="w-full h-[60vh] rounded-xl overflow-hidden shadow-lg">
            <iframe 
              src={fileUrl}
              className="w-full h-full border-0"
              title={selectedDocument.originalName || 'PDF Document'}
            />
          </div>
        );
        
        return (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm font-medium">Preview not available</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This file type cannot be previewed</p>
            <Button 
              onClick={() => handleDocumentDownload(selectedDocument)}
              className="mt-4 bg-[#0A3269] hover:bg-[#1A4A8A] text-white shadow-lg shadow-[#0A3269]/25 rounded-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          </div>
        );
      })()}
    </div>

    {/* ─── Footer ───────────────────────────────────────────────────── */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-gray-900/80">
      <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          Secure
        </span>
        <span className="w-px h-3 bg-gray-300 dark:bg-gray-700" />
        <span className="flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          Encrypted
        </span>
        <span className="w-px h-3 bg-gray-300 dark:bg-gray-700 hidden xs:block" />
        <span className="hidden xs:flex items-center gap-1.5">
          <CheckCircle className="w-3 h-3 text-emerald-500" />
          Verified
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setDocumentPreviewOpen(false)} 
          className="rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
        >
          Close
        </Button>
        {selectedDocument && (
          <Button 
            size="sm" 
            onClick={() => handleDocumentDownload(selectedDocument)} 
            className="bg-[#0A3269] dark:bg-white hover:bg-[#1A4A8A] dark:hover:bg-gray-100 text-white dark:text-[#0A3269] rounded-lg text-xs px-4 shadow-lg shadow-[#0A3269]/20 dark:shadow-white/20"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download
          </Button>
        )}
      </div>
    </div>
  </DialogContent>
</Dialog>
      {/* ─── Document Review Modal ────────────────────────────────────── */}
      <Dialog open={documentReviewOpen} onOpenChange={setDocumentReviewOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">Review Document</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-white/60">
              {selectedDocument?.originalName || selectedDocument?.path}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-white/80">Review Status</label>
              <Select value={reviewStatus} onValueChange={(value: 'approved' | 'rejected') => setReviewStatus(value)}>
                <SelectTrigger className="rounded-xl bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-white/10">
                  <SelectItem value="approved">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-emerald-500" />
                      Approve
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="w-4 h-4 text-red-500" />
                      Reject
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-white/80">
                Comment {reviewStatus === 'rejected' && '(Required)'}
              </label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={reviewStatus === 'rejected' ? 'Please provide reason for rejection...' : 'Add a comment...'}
                rows={3}
                className="text-xs rounded-xl bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDocumentReviewOpen(false)} className="rounded-xl text-xs border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/80">Cancel</Button>
              <Button 
                onClick={handleDocumentReview}
                disabled={isReviewing || (reviewStatus === 'rejected' && !reviewComment.trim())}
                className={cn(
                  "rounded-xl text-xs font-medium shadow-lg transition-all",
                  reviewStatus === 'approved' 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25" 
                    : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/25"
                )}
              >
                {isReviewing ? (
                  <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> Processing...</>
                ) : (
                  `${reviewStatus === 'approved' ? 'Approve' : 'Reject'} Document`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Fraud Alert Modal ────────────────────────────────────────── */}
      <Dialog open={fraudAlertOpen} onOpenChange={setFraudAlertOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <Shield className="w-4 h-4 text-red-500" />
              Add Fraud Alert
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-white/60">Report suspicious activity or document issues</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-white/80">Alert Type</label>
              <Select value={fraudAlertData.type} onValueChange={(value) => setFraudAlertData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="rounded-xl bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-white/10">
                  <SelectItem value="document_verification">Document Verification</SelectItem>
                  <SelectItem value="identity_mismatch">Identity Mismatch</SelectItem>
                  <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-white/80">Severity</label>
              <Select value={fraudAlertData.severity} onValueChange={(value) => setFraudAlertData(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger className="rounded-xl bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-white/10">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-white/80">Description</label>
              <Textarea
                value={fraudAlertData.description}
                onChange={(e) => setFraudAlertData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the fraud concern..."
                rows={3}
                className="text-xs rounded-xl bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setFraudAlertOpen(false)} className="rounded-xl text-xs border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/80">Cancel</Button>
              <Button onClick={handleFraudAlert} disabled={!fraudAlertData.description.trim()} className="rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25 text-xs">
                Add Fraud Alert
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Penalty Modal ────────────────────────────────────────────── */}
      <Dialog open={penaltyOpen} onOpenChange={setPenaltyOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <Gavel className="w-4 h-4 text-orange-500" />
              Issue Penalty
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-white/60">Issue a penalty for violations or non-compliance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-white/80">Penalty Type</label>
              <Select value={penaltyData.type} onValueChange={(value) => setPenaltyData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="rounded-xl bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-white/10">
                  <SelectItem value="late_submission">Late Submission</SelectItem>
                  <SelectItem value="document_forgery">Document Forgery</SelectItem>
                  <SelectItem value="false_information">False Information</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-white/80">Amount (AED)</label>
              <Input
                type="number"
                value={penaltyData.amount}
                onChange={(e) => setPenaltyData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder="0"
                min="0"
                step="0.01"
                className="rounded-xl text-sm bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-white/80">Description</label>
              <Textarea
                value={penaltyData.description}
                onChange={(e) => setPenaltyData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the penalty reason..."
                rows={3}
                className="text-xs rounded-xl bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setPenaltyOpen(false)} className="rounded-xl text-xs border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/80">Cancel</Button>
              <Button onClick={handleIssuePenalty} disabled={!penaltyData.description.trim() || penaltyData.amount <= 0} className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25 text-xs">
                Issue Penalty
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── OTP Request Modal ────────────────────────────────────────── */}
      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <Key className="w-4 h-4 text-blue-500" />
              Request OTP
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-white/60">Send OTP to applicant for verification</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-white/80">Phone Number</label>
              <Input
                value={otpData.phone}
                onChange={(e) => setOtpData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+971 50 123 4567"
                className="rounded-xl text-sm bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-white/80">Valid for (minutes)</label>
              <Select value={otpData.minutes.toString()} onValueChange={(value) => setOtpData(prev => ({ ...prev, minutes: Number(value) }))}>
                <SelectTrigger className="rounded-xl bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-white/10">
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOtpOpen(false)} className="rounded-xl text-xs border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/80">Cancel</Button>
              <Button onClick={handleRequestOTP} disabled={!otpData.phone.trim()} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 text-xs">
                Send OTP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MobileDrawer>
  );
};