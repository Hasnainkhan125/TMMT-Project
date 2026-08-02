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
} from 'lucide-react';
import { toast } from 'sonner';
import { getSocket } from '@/lib/socket';

interface ExpandedApplicationCardProps {
  application: any;
  isExpanded: boolean;
  onToggle: () => void;
  onDocumentView: (doc: any) => void;
  onDocumentDownload: (doc: any) => void;
}

const ExpandedApplicationCard: React.FC<ExpandedApplicationCardProps> = ({
  application,
  isExpanded,
  onToggle,
  onDocumentView,
  onDocumentDownload,
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

  const handleViewApplication = (app: any) => {
    try {
      window.open(`${apiBase}/visa/${app._id || app.id}`, '_blank');
    } catch (error) {
      console.error('View error:', error);
      toast.error('Failed to open application');
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { 
          icon: CheckCircle, 
          color: 'text-green-600 dark:text-green-400', 
          bg: 'bg-green-50 dark:bg-green-950/30', 
          border: 'border-green-200 dark:border-green-800/50' 
        };
      case 'under_review':
        return { 
          icon: Clock, 
          color: 'text-blue-600 dark:text-blue-400', 
          bg: 'bg-blue-50 dark:bg-blue-950/30', 
          border: 'border-blue-200 dark:border-blue-800/50' 
        };
      case 'docs_required':
        return { 
          icon: AlertCircle, 
          color: 'text-orange-600 dark:text-orange-400', 
          bg: 'bg-orange-50 dark:bg-orange-950/30', 
          border: 'border-orange-200 dark:border-orange-800/50' 
        };
      default:
        return { 
          icon: FileText, 
          color: 'text-gray-600 dark:text-gray-400', 
          bg: 'bg-gray-50 dark:bg-gray-900/30', 
          border: 'border-gray-200 dark:border-gray-700' 
        };
    }
  };

  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;
  const hasResultDocs = application.resultDocuments && application.resultDocuments.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className={`border-2 ${statusConfig.border} ${statusConfig.bg} overflow-hidden bg-card`}>
        {/* Header - Always Visible */}
        <CardHeader
          className="cursor-pointer hover:bg-accent/10 transition-all p-3 sm:p-4 md:p-6"
          onClick={onToggle}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg ${statusConfig.bg} border ${statusConfig.border} shrink-0`}>
                <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${statusConfig.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base md:text-lg text-foreground break-words">
                  {application.applicationType
                    .replace(/_/g, ' ')
                    .split(' ')
                    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge className={`${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border} text-xs`}>
                    {application.status.replace('_', ' ')}
                  </Badge>
                  {hasResultDocs && (
                    <Badge className="bg-primary/10 dark:bg-primary/20 text-primary border-primary/30 text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Results Ready
                    </Badge>
                  )}
                  {boostCount > 0 && (
                    <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700 text-xs">
                      <Rocket className="w-3 h-3 mr-1" />
                      Boosted {boostCount}x
                    </Badge>
                  )}
                  {notifications.length > 0 && (
                    <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700 text-xs">
                      <Bell className="w-3 h-3 mr-1" />
                      {notifications.length} new
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-accent text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
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
              transition={{ duration: 0.3 }}
            >
              <CardContent className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                {/* Notifications */}
                {notifications.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs flex items-center gap-1.5 text-foreground">
                      <Bell className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      Recent Notifications
                    </h4>
                    {notifications.map((notif: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-md flex items-start gap-2"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-red-900 dark:text-red-300">{notif.message}</p>
                          <p className="text-[10px] text-red-700 dark:text-red-400">{new Date(notif.timestamp).toLocaleString()}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                          onClick={() => setNotifications(prev => prev.filter((_, i) => i !== idx))}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* OTP Requests */}
                {otpRequests.filter((otp: any) => otp.status === 'pending').length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs flex items-center gap-1.5 text-foreground">
                      <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      OTP Verification Requests ({otpRequests.filter((otp: any) => otp.status === 'pending').length})
                    </h4>
                    {otpRequests.filter((otp: any) => otp.status === 'pending').map((otp: any, idx: number) => (
                      <div key={idx} className="p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-blue-900 dark:text-blue-300">
                              Please verify OTP sent to {otp.phone}
                            </p>
                            <p className="text-[10px] text-blue-700 dark:text-blue-400">
                              Expires in {otp.expiresIn} minutes • Requested {new Date(otp.requestedAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-[10px]">Pending</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <div className="flex flex-col items-center text-center">
                      <FileText className="w-5 h-5 text-primary mb-1" />
                      <span className="text-lg sm:text-xl font-bold text-foreground">
                        {application.attachments?.length || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">Documents</span>
                    </div>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <div className="flex flex-col items-center text-center">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
                      <span className="text-lg sm:text-xl font-bold text-foreground">
                        {Math.ceil((Date.now() - new Date(application.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                      </span>
                      <span className="text-xs text-muted-foreground">Days Old</span>
                    </div>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <div className="flex flex-col items-center text-center">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mb-1" />
                      <span className="text-lg sm:text-xl font-bold text-foreground">
                        {hasResultDocs ? application.resultDocuments.length : 0}
                      </span>
                      <span className="text-xs text-muted-foreground">Results</span>
                    </div>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <div className="flex flex-col items-center text-center">
                      <Rocket className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1" />
                      <span className="text-lg sm:text-xl font-bold text-foreground">{boostCount}</span>
                      <span className="text-xs text-muted-foreground">Boosts</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Modern Black & White */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-[10px] h-7 border-black/20 dark:border-white/20 bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
                    onClick={() => setShowBoostDialog(true)}
                  >
                    <Rocket className="w-3 h-3 mr-1" />
                    Priority
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-[10px] h-7 border-black/20 dark:border-white/20 bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
                    onClick={() => setShowLiveChat(true)}
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Chat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-[10px] h-7 border-black/20 dark:border-white/20 bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-[10px] h-7 border-black/20 dark:border-white/20 bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
                    onClick={onToggle}
                  >
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Collapse
                  </Button>
                </div>

                <Separator className="bg-border" />

                {/* Requested Documents */}
                {requestedDocuments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs flex items-center gap-1.5 text-foreground">
                      <AlertCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                      Requested Documents ({requestedDocuments.filter((d: any) => d.status === 'pending').length})
                    </h4>
                    <div className="space-y-1.5">
                      {requestedDocuments.map((doc: any, idx: number) => (
                        <div key={idx} className="p-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 rounded-md">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-orange-900 dark:text-orange-300">{doc.documentType || doc}</p>
                              {doc.description && (
                                <p className="text-[10px] text-orange-700 dark:text-orange-400 mt-0.5">{doc.description}</p>
                              )}
                              <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-0.5">
                                Requested {new Date(doc.requestedAt).toLocaleDateString()}
                                {doc.deadline && ` • Due ${new Date(doc.deadline).toLocaleDateString()}`}
                              </p>
                            </div>
                            {doc.status === 'pending' && (
                              <Button size="sm" className="h-6 text-[10px] px-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300">
                                <Upload className="w-3 h-3 mr-1" />
                                Upload
                              </Button>
                            )}
                            {doc.status !== 'pending' && (
                              <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-[10px]">{doc.status}</Badge>
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
                    <h4 className="font-medium text-xs flex items-center gap-1.5 text-foreground">
                      <CreditCard className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      Payment History ({payments.length})
                    </h4>
                    <div className="space-y-1.5">
                      {payments.map((payment: any, idx: number) => (
                        <div key={idx} className="p-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-xs font-medium text-purple-900 dark:text-purple-300">
                                {payment.type?.replace(/_/g, ' ')} - {payment.currency} {payment.amount}
                              </p>
                              <p className="text-[10px] text-purple-700 dark:text-purple-400">
                                {payment.description || 'No description'}
                              </p>
                              <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">
                                {new Date(payment.paidAt).toLocaleDateString()} • {payment.paymentMethod || 'N/A'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-[10px] ${
                                payment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                                payment.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' :
                                'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                              }`}>
                                {payment.status}
                              </Badge>
                              {payment.receiptUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                                  onClick={() => window.open(payment.receiptUrl, '_blank')}
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document Upload */}
                <div className="space-y-2">
                  <h4 className="font-medium text-xs flex items-center gap-1.5 text-foreground">
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    Upload Additional Document
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-1.5">
                    <Input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="flex-1 text-[10px] h-8 bg-background border-input text-foreground file:text-foreground"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <Button
                      onClick={handleFileUpload}
                      disabled={!uploadFile || uploading}
                      className={`
                        w-full sm:w-auto h-8 text-[10px] font-semibold
                        transition-all duration-300
                        ${!uploadFile || uploading 
                          ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                          : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-md hover:shadow-lg active:scale-95'
                        }
                        relative overflow-hidden
                      `}
                      size="sm"
                    >
                      {uploading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Upload className="w-3 h-3" />
                          <span>Upload</span>
                          {uploadFile && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                            </span>
                          )}
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Submitted Documents */}
                {application.attachments && application.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs flex items-center gap-1.5 text-foreground">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      Submitted Documents ({application.attachments.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-1.5">
                      {application.attachments.map((doc: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-card rounded-md border border-border hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="w-3 h-3 text-primary shrink-0" />
                            <span className="text-[10px] font-medium truncate text-foreground">
                              {doc.filename || doc.originalName || 'Document'}
                            </span>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                              onClick={() => onDocumentView(doc)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                              onClick={() => onDocumentDownload(doc)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Result Documents */}
                {hasResultDocs && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      Result Documents ({application.resultDocuments.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-1.5">
                      {application.resultDocuments.map((doc: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Zap className="w-3 h-3 text-green-600 dark:text-green-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-green-900 dark:text-green-300 truncate">
                                {doc.label || doc.originalName || 'Result'}
                              </p>
                              {doc.uploadedByRole && (
                                <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-[9px] mt-0.5 border-0">
                                  by {doc.uploadedByRole}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-800 dark:hover:text-green-300"
                              onClick={() => onDocumentView(doc)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-800 dark:hover:text-green-300"
                              onClick={() => onDocumentDownload(doc)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application History */}
                {application.history && application.history.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs flex items-center gap-1.5 text-foreground">
                      <History className="w-3.5 h-3.5" />
                      Application History ({application.history.length})
                    </h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                      {application.history.map((event: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 p-1.5 bg-card rounded border border-border hover:border-primary/20 transition-colors">
                          <div className="bg-primary h-1.5 w-1.5 rounded-full mt-1 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium text-foreground">
                              {event.action?.replace('_', ' ').toUpperCase()}
                            </p>
                            {event.note && (
                              <p className="text-[9px] text-muted-foreground truncate">{event.note}</p>
                            )}
                            <p className="text-[9px] text-muted-foreground">
                              {new Date(event.at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Priority Boost Dialog */}
      <Dialog open={showBoostDialog} onOpenChange={setShowBoostDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Rocket className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Priority Boost
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Move your application to the front of the queue for faster processing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-purple-900 dark:text-purple-300">Free Boosts</span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {3 - boostCount}/3
                </span>
              </div>
              <Progress value={((3 - boostCount) / 3) * 100} className="h-2 bg-purple-200 dark:bg-purple-800/50" />
              <p className="text-xs text-purple-700 dark:text-purple-400 mt-2">
                {boostCount >= 3
                  ? 'All free boosts used. Paid boost available.'
                  : `${3 - boostCount} free boost(s) remaining`}
              </p>
            </div>

            {boostCount < 3 ? (
              <Button onClick={handlePriorityBoost} className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300">
                <Zap className="w-4 h-4 mr-2" />
                Activate Free Boost
              </Button>
            ) : (
              <Button
                onClick={() => setShowPaymentDialog(true)}
                className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Pay AED 10 for Instant Boost
              </Button>
            )}

            <div className="text-xs text-muted-foreground text-center">
              Priority boost moves your application up in the processing queue
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm text-foreground">
              <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
              Payment Required
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Pay AED 10 for instant priority boost
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800/50">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-green-900 dark:text-green-300 text-xs">Amount</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">AED 10</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-foreground">Card Number</Label>
              <Input placeholder="1234 5678 9012 3456" className="h-8 text-xs bg-background border-input text-foreground" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-foreground">Expiry</Label>
                <Input placeholder="MM/YY" className="h-8 text-xs bg-background border-input text-foreground" />
              </div>
              <div>
                <Label className="text-xs text-foreground">CVV</Label>
                <Input placeholder="123" type="password" maxLength={3} className="h-8 text-xs bg-background border-input text-foreground" />
              </div>
            </div>

            <Button onClick={handlePaymentBoost} className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 h-8 text-xs">
              <CreditCard className="w-3 h-3 mr-2" />
              Pay & Activate Boost
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Application Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm text-foreground">
              <Edit className="w-4 h-4 text-primary" />
              Edit Application
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update application details (Coming soon)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-md text-center">
              <p className="text-xs text-blue-900 dark:text-blue-300">
                Edit functionality is under development. You can upload additional documents from the expanded view.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Live Chat Dialog */}
      <Dialog open={showLiveChat} onOpenChange={setShowLiveChat}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0 bg-card border-border">
          <DialogHeader className="p-4 pb-3 border-b border-border">
            <DialogTitle className="flex items-center gap-2 text-sm text-foreground">
              <MessageSquare className="w-4 h-4 text-primary" />
              Live Chat Support
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Chat with our support team
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 p-4 overflow-y-auto bg-muted/30">
            <div className="text-center text-xs text-muted-foreground py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p>Live chat will be available soon.</p>
              <p className="mt-2">For now, you can contact us via email or phone.</p>
            </div>
          </div>
          <div className="p-3 border-t border-border bg-card">
            <div className="flex gap-2">
              <Input 
                placeholder="Type your message..." 
                disabled 
                className="flex-1 h-8 text-xs bg-background border-input text-foreground"
              />
              <Button disabled size="sm" className="h-8 text-xs bg-muted-foreground/20 text-muted-foreground">
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