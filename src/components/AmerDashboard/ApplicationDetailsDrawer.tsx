import React, { useState } from 'react';
import { 
  User, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Download,
  Phone,
  Mail,
  Shield,
  Gavel,
  Key,
  Upload,
  Edit,
  Send,
  Ban,
  Image,
  File,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  RefreshCw
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
  { value: 'draft', label: 'Draft', color: 'bg-surface text-foreground' },
  { value: 'submitted', label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  { value: 'under_review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'docs_required', label: 'Documents Required', color: 'bg-orange-100 text-orange-800' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'closed', label: 'Closed', color: 'bg-surface text-foreground' },
  { value: 'fraud_detected', label: 'Fraud Detected', color: 'bg-red-100 text-red-800' },
  { value: 'penalty_issued', label: 'Penalty Issued', color: 'bg-orange-100 text-orange-800' },
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

  // Document viewing and review states
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [documentReviewOpen, setDocumentReviewOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [isReviewing, setIsReviewing] = useState(false);

  // Amer officer action states
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

  // API functions for Amer officer actions
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
      <Badge className={cn(config.color, 'border-0')}>
        {config.label}
      </Badge>
    );
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-error" />;
      case 'requested':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-text-muted" />;
    }
  };

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-primary" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-error" />;
    } else {
      return <File className="w-5 h-5 text-text-muted" />;
    }
  };

  return (
    <MobileDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t('amerDashboard.viewDetails')}
      size="xl"
      position="right"
      className="h-full overflow-y-auto"
    >
      <div className="p-4 space-y-6 ">
        {/* Application Header */}
        <div className="bg-surface-light rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">
              {application.applicationType.replace('_', ' ').toUpperCase()}
            </h3>
            {getStatusBadge(application.status)}
          </div>
          <p className="text-sm text-text-secondary">
            ID: {(application as any)?.id || (application as any)?._id} • Created: {new Date((application as any).createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Sponsor Information */}
        <CollapsibleSection title={t('documents.sponsorDocuments')} defaultOpen={true}>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {application.sponsor.firstName} {application.sponsor.lastName}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {application.sponsor.email}
                  </span>
                  <span className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {application.sponsor.phoneNumber}
                  </span>
                </div>
              </div>
            </div>
            
            {application.sponsor.emiratesId && (
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Shield className="w-4 h-4" />
                <span>Emirates ID: {application.sponsor.emiratesId}</span>
              </div>
            )}
            
            {(application.sponsor as any).passportNumber && (
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <FileText className="w-4 h-4" />
                <span>Passport: {(application.sponsor as any).passportNumber}</span>
              </div>
            )}
          </div>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={()=> setEditOpen(true)}>
              <Edit className="w-4 h-4 mr-2" /> Edit Details
            </Button>
          </div>
        </CollapsibleSection>

        {/* Sponsored Person */}
        {application.sponsored && (
          <CollapsibleSection title="Sponsored Person" defaultOpen={true}>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 tesxt-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {application.sponsored.firstName} {application.sponsored.lastName}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {application.sponsored.email}
                    </span>
                    <span className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {application.sponsored.phoneNumber}
                    </span>
                  </div>
                </div>
              </div>
              
              {(application.sponsored as any).emiratesId && (
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                  <Shield className="w-4 h-4" />
                  <span>Emirates ID: {(application.sponsored as any).emiratesId}</span>
                </div>
              )}
              
              {(application.sponsored as any).passportNumber && (
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                  <FileText className="w-4 h-4" />
                  <span>Passport: {(application.sponsored as any).passportNumber}</span>
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Documents */}
        <CollapsibleSection title="Documents" defaultOpen={true}>
          <div className="space-y-3">
            {application.attachments && application.attachments.length > 0 ? (
              application.attachments.map((doc, index) => (
                <div key={index} className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 bg-surface-light rounded-lg">
                  <div className="flex flex-col md:flex-row items-start md:items-center space-x-3">
                    {getDocumentIcon((doc as any).mimeType || 'application/octet-stream')}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {(doc as any).originalName.slice(0, 20) + '...' || doc.path}
                      </p>
                      <p className="text-xs text-text-secondary capitalize">
                        {doc.type?.replace(/[_-]/g, ' ')} • {((doc as any).fileSize ? (doc as any).fileSize / 1024 / 1024 : 0).toFixed(1)}MB
                      </p>
                      {(doc as any).uploadedAt && (
                        <p className="text-xs text-text-muted">
                          {new Date((doc as any).uploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getDocumentStatusIcon((doc as any).status || doc.verificationStatus || 'pending')}
                    <Badge 
                      variant={(doc as any).status === 'approved' ? 'default' : (doc as any).status === 'rejected' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {(doc as any).status || doc.verificationStatus || 'pending'}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDocumentView(doc)}
                      title="View document"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDocumentDownload(doc)}
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedDocument(doc);
                        setDocumentReviewOpen(true);
                      }}
                      title="Review document"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-muted">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No documents uploaded yet</p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onDocumentUpload((application as any)?._id || (application as any)?.id)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Additional Documents
            </Button>
            <div className="pt-2">
       <Button 
    variant="default" 
    className="w-full bg-[#0A3269] hover:bg-[#1A4A8A] text-white shadow-lg shadow-[#0A3269]/25 hover:shadow-xl hover:shadow-[#0A3269]/30 transition-all duration-300"
    onClick={() => setDocReqOpen(true)}
  >
    <Send className="w-4 h-4 mr-2" />
    Request More Documents
  </Button>
            </div>
          </div>
        </CollapsibleSection>

 {/* Application History */}
<CollapsibleSection title="Application History" defaultOpen={false}>
  <div className="space-y-2">
    {application.history.length === 0 ? (
      <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
        No history entries yet
      </div>
    ) : (
      application.history.map((entry, index) => (
        <div 
          key={index} 
          className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all duration-200"
        >
          <div className="w-2 h-2 rounded-full bg-[#0A3269] mt-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {entry.action?.replace(/_/g, ' ').toUpperCase() || 'Action'}
            </p>
            {entry.note && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{entry.note}</p>
            )}
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              {new Date(entry.at).toLocaleString()}
            </p>
          </div>
        </div>
      ))
    )}
  </div>
</CollapsibleSection>
{/* Risk Assessment — Modern UI */}
<CollapsibleSection title="Risk Assessment" defaultOpen={false}>
  <div className="space-y-4 pt-5 rounded-xl bg-gray-50/80 dark:bg-white/5 p-4 backdrop-blur-sm border border-gray-200/50 dark:border-white/10">
    {/* Fraud Risk */}
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700 dark:text-white/70 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400/60" />
        Fraud Risk
      </span>
      <Badge
        variant="outline"
        className={`
          px-3 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full border-0
          ${application.metadata.fraudRisk === 'high' 
            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30' 
            : application.metadata.fraudRisk === 'medium' 
            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30' 
            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30'
          }
        `}
      >
        {application.metadata.fraudRisk?.toUpperCase() || 'N/A'}
      </Badge>
    </div>

    {/* Blacklist Status */}
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700 dark:text-white/70 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/60" />
        Blacklist Status
      </span>
      <Badge
        variant="outline"
        className={`
          px-3 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full border-0
          ${application.metadata.blacklistStatus === 'blacklisted' 
            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30' 
            : application.metadata.blacklistStatus === 'flagged' 
            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30' 
            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30'
          }
        `}
      >
        {application.metadata.blacklistStatus?.toUpperCase() || 'N/A'}
      </Badge>
    </div>
  </div>
</CollapsibleSection>

        {/* Quick Actions */}
        <CollapsibleSection title="Quick Actions" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFraudAlertOpen(true)}
            >
              <Shield className="w-4 h-4 mr-2" />
              Fraud Alert
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPenaltyOpen(true)}
            >
              <Gavel className="w-4 h-4 mr-2" />
              Issue Penalty
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setOtpOpen(true)}
            >
              <Key className="w-4 h-4 mr-2" />
              Request OTP
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setNewStatus(application.status === 'closed' ? 'draft' : 'closed');
                handleStatusUpdate();
              }}
              className="text-error hover:text-error"
            >
              <Ban className="w-4 h-4 mr-2" />
              {application.status === 'closed' ? 'Reopen' : 'Close'}
            </Button>
          </div>
        </CollapsibleSection>

    {/* Status Update */}
<CollapsibleSection title="Update Status" defaultOpen={false}>
  <div className="space-y-4">
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">New Status</label>
      <Select value={newStatus} onValueChange={setNewStatus}>
        <SelectTrigger className="bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 hover:border-[#0A3269]/40 dark:hover:border-[#4A8ABF]/40 transition-colors">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          {statusOptions.map(option => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:bg-gray-50 dark:focus:bg-gray-700/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  option.value === 'approved' ? "bg-green-500" :
                  option.value === 'rejected' ? "bg-red-500" :
                  option.value === 'submitted' ? "bg-blue-500" :
                  option.value === 'under_review' ? "bg-yellow-500" :
                  option.value === 'docs_required' ? "bg-orange-500" :
                  option.value === 'fraud_detected' ? "bg-red-600" :
                  option.value === 'penalty_issued' ? "bg-orange-600" :
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
      <label className="text-sm font-medium text-foreground">Note (Optional)</label>
      <Textarea
        value={statusNote}
        onChange={(e) => setStatusNote(e.target.value)}
        placeholder="Add a note about this status change..."
        rows={3}
        className="bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 resize-none focus:border-[#0A3269]/40 dark:focus:border-[#4A8ABF]/40 transition-colors"
      />
    </div>
    
    <Button 
      onClick={handleStatusUpdate}
      disabled={!newStatus || newStatus === application.status || isUpdating}
      className="w-full bg-[#0A3269] hover:bg-[#1A4A8A] text-white shadow-lg shadow-[#0A3269]/25 hover:shadow-xl hover:shadow-[#0A3269]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isUpdating ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Updating...
        </>
      ) : (
        'Update Status'
      )}
    </Button>
  </div>
</CollapsibleSection>


     </div>
      {/* Edit Details Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center">
          <div className="bg-background w-full md:w-[720px] rounded-t-2xl md:rounded-2xl p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Edit Application Details</div>
              <button onClick={() => setEditOpen(false)} className="text-gray-500 hover:text-foreground">Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="col-span-2 text-sm text-foreground font-medium">Sponsor</div>
              <Input placeholder="First name" value={editSponsor.firstName} onChange={(e)=> setEditSponsor((p:any)=>({...p, firstName: e.target.value}))} />
              <Input placeholder="Last name" value={editSponsor.lastName} onChange={(e)=> setEditSponsor((p:any)=>({...p, lastName: e.target.value}))} />
              <Input placeholder="Email" value={editSponsor.email} onChange={(e)=> setEditSponsor((p:any)=>({...p, email: e.target.value}))} />
              <Input placeholder="Phone" value={editSponsor.phone} onChange={(e)=> setEditSponsor((p:any)=>({...p, phone: e.target.value}))} />
              <Input placeholder="Emirates ID" value={editSponsor.emiratesId} onChange={(e)=> setEditSponsor((p:any)=>({...p, emiratesId: e.target.value}))} />
              <Input placeholder="Passport Number" value={editSponsor.passportNumber} onChange={(e)=> setEditSponsor((p:any)=>({...p, passportNumber: e.target.value}))} />

              <div className="col-span-2 text-sm text-foreground font-medium mt-2">Sponsored (optional)</div>
              <Input placeholder="First name" value={editSponsored.firstName} onChange={(e)=> setEditSponsored((p:any)=>({...p, firstName: e.target.value}))} />
              <Input placeholder="Last name" value={editSponsored.lastName} onChange={(e)=> setEditSponsored((p:any)=>({...p, lastName: e.target.value}))} />
              <Input type="date" placeholder="Date of birth" value={editSponsored.dateOfBirth} onChange={(e)=> setEditSponsored((p:any)=>({...p, dateOfBirth: e.target.value}))} />
              <Input placeholder="Nationality" value={editSponsored.nationality} onChange={(e)=> setEditSponsored((p:any)=>({...p, nationality: e.target.value}))} />
              <Input placeholder="Passport Number" value={editSponsored.passportNumber} onChange={(e)=> setEditSponsored((p:any)=>({...p, passportNumber: e.target.value}))} />
              <Select value={editSponsored.relationship} onValueChange={(v)=> setEditSponsored((p:any)=>({...p, relationship: v}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={()=> setEditOpen(false)}>Cancel</Button>
              <Button onClick={async ()=>{
                try {
                  const token = localStorage.getItem('authToken') || ''
                  const id = (application as any)?._id || (application as any)?.id
                  const payload: any = { sponsor: editSponsor, sponsored: editSponsored }
                  // Remove empty sponsored fields
                  Object.keys(payload.sponsored).forEach(k=> {
                    if (payload.sponsored[k] === '' || payload.sponsored[k] === undefined) delete payload.sponsored[k]
                  })
                  if (Object.keys(payload.sponsored).length === 0) delete payload.sponsored
                  await fetch(`${location.origin.replace(/:\\d+$/, '') || import.meta.env.VITE_API_BASE_URL}/api/v1/visa/${id}/details`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload)
                  })
                  setEditOpen(false)
                } catch {}
              }}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
      {docReqOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center">
          <div className="bg-background w-full md:w-[520px] rounded-t-2xl md:rounded-2xl p-4 md:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Request Documents</div>
              <button onClick={() => setDocReqOpen(false)} className="text-gray-500 hover:text-foreground">Close</button>
            </div>
            <div className="text-sm text-text-secondary">Select documents to request from the applicant. A message will be sent and the application will move to "Documents Required".</div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from(new Set(application.attachments.map(a => a.type).concat([
                'sponsor_emirates_id','sponsor_passport','sponsor_visa','sponsor_salary_certificate','sponsor_trade_license','sponsor_establishment_card','sponsored_passport_front','sponsored_photo','marriage_certificate','birth_certificate'
              ]))).map((id) => (
                <label key={id} className="flex items-center gap-2 text-sm bg-surface-light px-2 py-1.5 rounded-md">
                  <input type="checkbox" checked={!!docReq[id]} onChange={(e) => setDocReq(prev => ({ ...prev, [id]: e.target.checked }))} />
                  <span className="capitalize">{id.replace(/[_-]/g,' ')}</span>
                </label>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Note (optional)</label>
              <Textarea value={docReqNote} onChange={(e)=> setDocReqNote(e.target.value)} rows={3} placeholder="Add details or instructions" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDocReqOpen(false)}>Cancel</Button>
          <Button 
  style={{ color: 'white' }}
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
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      <Dialog open={documentPreviewOpen} onOpenChange={setDocumentPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getDocumentIcon(selectedDocument.mimeType)}
              {selectedDocument?.originalName || selectedDocument?.path}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.type?.replace(/[_-]/g, ' ')} • {(selectedDocument?.fileSize / 1024 / 1024).toFixed(1)}MB
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedDocument && (
              <div className="w-full h-full flex items-center justify-center bg-surface-light rounded-lg">
                {selectedDocument.mimeType.startsWith('image/') ? (
                  <img 
                    src={`${apiBase}/uploads/applications/${(application as any)?._id || (application as any)?.id}/${selectedDocument.path}`}
                    alt={selectedDocument.originalName}
                    className="max-w-full max-h-[60vh] object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'block';
                      }
                    }}
                  />
                ) : selectedDocument.mimeType === 'application/pdf' ? (
                  <iframe 
                    src={`${apiBase}/uploads/applications/${(application as any)?._id || (application as any)?.id}/${selectedDocument.path}`}
                    className="w-full h-[60vh] border-0"
                    title={selectedDocument.originalName}
                  />
                ) : (
                  <div className="text-center text-text-muted">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <p>Preview not available for this file type</p>
                    <Button 
                      onClick={() => handleDocumentDownload(selectedDocument)}
                      className="mt-4"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download to view
                    </Button>
                  </div>
                )}
                <div className="hidden text-center text-text-muted">
                  <FileText className="w-16 h-16 mx-auto mb-4" />
                  <p>Unable to load preview</p>
             <Button 
  onClick={() => handleDocumentDownload(selectedDocument)}
  className="mt-4 bg-[#0A3269] hover:bg-[#1A4A8A] text-white shadow-lg shadow-[#0A3269]/25 hover:shadow-xl hover:shadow-[#0A3269]/30 transition-all duration-300"
>
  <Download className="w-4 h-4 mr-2" />
  Download file
</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Review Modal */}
      <Dialog open={documentReviewOpen} onOpenChange={setDocumentReviewOpen}>
        <DialogContent className="max-w-md ">
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
            <DialogDescription>
              {selectedDocument?.originalName || selectedDocument?.path}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Review Status</label>
              <Select value={reviewStatus} onValueChange={(value: 'approved' | 'rejected') => setReviewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-success" />
                      Approve
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="w-4 h-4 text-error" />
                      Reject
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Comment {reviewStatus === 'rejected' && '(Required for rejection)'}
              </label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={reviewStatus === 'rejected' ? 'Please provide reason for rejection...' : 'Add a comment...'}
                rows={3}
                required={reviewStatus === 'rejected'}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDocumentReviewOpen(false)}>
                Cancel
              </Button>
          <Button 
  onClick={handleDocumentReview}
  disabled={isReviewing || (reviewStatus === 'rejected' && !reviewComment.trim())}
  className={cn(
    "text-white font-medium",
    reviewStatus === 'approved' 
      ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30" 
      : "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/30",
    "transition-all duration-300 active:scale-95"
  )}
>
  {isReviewing ? (
    <>
      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      Processing...
    </>
  ) : (
    `${reviewStatus === 'approved' ? 'Approve' : 'Reject'} Document`
  )}
</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fraud Alert Modal */}
      <Dialog open={fraudAlertOpen} onOpenChange={setFraudAlertOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Fraud Alert</DialogTitle>
            <DialogDescription>
              Report suspicious activity or document issues
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Alert Type</label>
              <Select value={fraudAlertData.type} onValueChange={(value) => setFraudAlertData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document_verification">Document Verification</SelectItem>
                  <SelectItem value="identity_mismatch">Identity Mismatch</SelectItem>
                  <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Severity</label>
              <Select value={fraudAlertData.severity} onValueChange={(value) => setFraudAlertData(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                value={fraudAlertData.description}
                onChange={(e) => setFraudAlertData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the fraud concern..."
                rows={3}
                required
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setFraudAlertOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleFraudAlert}
                disabled={!fraudAlertData.description.trim()}
              >
                Add Fraud Alert
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Penalty Modal */}
      <Dialog open={penaltyOpen} onOpenChange={setPenaltyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Penalty</DialogTitle>
            <DialogDescription>
              Issue a penalty for violations or non-compliance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Penalty Type</label>
              <Select value={penaltyData.type} onValueChange={(value) => setPenaltyData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="late_submission">Late Submission</SelectItem>
                  <SelectItem value="document_forgery">Document Forgery</SelectItem>
                  <SelectItem value="false_information">False Information</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount (AED)</label>
              <Input
                type="number"
                value={penaltyData.amount}
                onChange={(e) => setPenaltyData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                value={penaltyData.description}
                onChange={(e) => setPenaltyData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the penalty reason..."
                rows={3}
                required
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setPenaltyOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleIssuePenalty}
                disabled={!penaltyData.description.trim() || penaltyData.amount <= 0}
              >
                Issue Penalty
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* OTP Request Modal */}
      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request OTP</DialogTitle>
            <DialogDescription>
              Send OTP to applicant for verification
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <Input
                value={otpData.phone}
                onChange={(e) => setOtpData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+971 50 123 4567"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Valid for (minutes)</label>
              <Select value={otpData.minutes.toString()} onValueChange={(value) => setOtpData(prev => ({ ...prev, minutes: Number(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOtpOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRequestOTP}
                disabled={!otpData.phone.trim()}
              >
                Send OTP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MobileDrawer>
  );
};
