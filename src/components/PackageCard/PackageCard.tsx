// src/components/PackageCard/PackageCard.tsx
"use client";

import { useState } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PackageDocument {
  docKey: string;
  label: string;
  filename?: string;
  originalName?: string;
  path?: string;
  size?: number;
  mimeType?: string;
  uploadedAt?: Date;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface PackageComment {
  _id: string;
  message: string;
  by: 'admin' | 'customer' | 'system';
  authorName?: string;
  at: Date;
}

export interface RequestedDoc {
  _id: string;
  label: string;
  description?: string;
  requestedAt: Date;
  status: 'pending' | 'fulfilled' | 'rejected';
  fulfilledAt?: Date;
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
  gradient: string;
  border: string;
  bg: string;
  textColor: string;
}> = {
  submitted: {
    label: 'Submitted',
    color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    dotColor: 'bg-blue-500',
    icon: Clock,
    description: 'Package application submitted, awaiting review',
    gradient: 'from-blue-50/80 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10',
    border: 'border-blue-200/50 dark:border-blue-800/30',
    bg: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  contacted: {
    label: 'Contacted',
    color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    dotColor: 'bg-indigo-500',
    icon: MessageSquare,
    description: 'We have reached out to the applicant',
    gradient: 'from-indigo-50/80 to-indigo-100/30 dark:from-indigo-950/20 dark:to-indigo-900/10',
    border: 'border-indigo-200/50 dark:border-indigo-800/30',
    bg: 'bg-indigo-100',
    textColor: 'text-indigo-700',
  },
  docs_required: {
    label: 'Docs Required',
    color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
    dotColor: 'bg-orange-500',
    icon: FileWarning,
    description: 'Additional documents are required',
    gradient: 'from-orange-50/80 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10',
    border: 'border-orange-200/50 dark:border-orange-800/30',
    bg: 'bg-orange-100',
    textColor: 'text-orange-700',
  },
  pending_payment: {
    label: 'Pending Payment',
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dotColor: 'bg-amber-500',
    icon: DollarSign,
    description: 'Waiting for payment confirmation',
    gradient: 'from-amber-50/80 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10',
    border: 'border-amber-200/50 dark:border-amber-800/30',
    bg: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  paid: {
    label: 'Paid',
    color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    icon: CheckCircle,
    description: 'Payment received',
    gradient: 'from-emerald-50/80 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10',
    border: 'border-emerald-200/50 dark:border-emerald-800/30',
    bg: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  processing: {
    label: 'Processing',
    color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    dotColor: 'bg-purple-500',
    icon: Clock,
    description: 'Package is being processed',
    gradient: 'from-purple-50/80 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10',
    border: 'border-purple-200/50 dark:border-purple-800/30',
    bg: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
    dotColor: 'bg-green-500',
    icon: CheckCircle,
    description: 'Package process completed successfully',
    gradient: 'from-green-50/80 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10',
    border: 'border-green-200/50 dark:border-green-800/30',
    bg: 'bg-green-100',
    textColor: 'text-green-700',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
    dotColor: 'bg-red-500',
    icon: X,
    description: 'Application was rejected',
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
    description: 'Application was cancelled',
    gradient: 'from-gray-50/80 to-gray-100/30 dark:from-gray-800/20 dark:to-gray-700/10',
    border: 'border-gray-200/50 dark:border-gray-700/30',
    bg: 'bg-gray-100',
    textColor: 'text-gray-700',
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

// ─── PackageCard Component ──────────────────────────────────────────────────

interface PackageCardProps {
  package: PackageApplication;
  onDelete?: (packageId: string) => void;
  onRefresh?: () => void;
  onViewDetails?: (pkg: PackageApplication) => void;
}

export function PackageCard({ package: pkg, onDelete, onRefresh, onViewDetails }: PackageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const statusConfig = STATUS_CONFIG[pkg.status] || STATUS_CONFIG.submitted;
  const StatusIcon = statusConfig.icon;
  const accent = '#0A3269'; // or use PACKAGE_CONFIG[pkg.packageSlug]?.accent

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
const handleDelete = async () => {
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

    const data = await res.json(); // always parse JSON

    if (!res.ok) {
      // Use the server's message if available, otherwise fallback
      throw new Error(data.message || data.error || 'Delete failed');
    }

    toast.success(data.message || 'Package deleted');
    onDelete?.(pkg._id);
  } catch (error: any) {
    console.error('Delete error:', error);
    toast.error(error.message || 'Failed to delete package');
  } finally {
    setDeleting(false);
  }
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
                        <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-green-500" />
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <p className="font-semibold text-xs sm:text-sm truncate text-gray-900 dark:text-white">
                      {pkg.packageName}
                    </p>
                    <Badge className={cn(
                      "text-[8px] sm:text-[10px] font-medium border",
                      statusConfig.color
                    )}>
                      <StatusIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span>{formatDate(pkg.createdAt)}</span>
                    <span className="h-2.5 w-px sm:h-3 bg-gray-200 dark:bg-gray-700" />
                    <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span>{pkg.contact.fullName}</span>
                    {pkg.documents && pkg.documents.length > 0 && (
                      <>
                        <span className="h-2.5 w-px sm:h-3 bg-gray-200 dark:bg-gray-700" />
                        <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span>{pkg.documents.length}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="hidden sm:block w-16 md:w-20" />
                <Button
                  type="button"
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
                      pkg.status === 'docs_required' || pkg.status === 'pending_payment'
                        ? "bg-orange-50/80 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/30"
                        : "bg-white/50 dark:bg-white/5 border-gray-200/50 dark:border-white/5"
                    )}>
                      <div className={cn(
                        "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0",
                        pkg.status === 'docs_required' || pkg.status === 'pending_payment' ? "bg-orange-500" : statusConfig.dotColor
                      )} />
                      <span className={cn(
                        "text-[11px] sm:text-sm",
                        pkg.status === 'docs_required' || pkg.status === 'pending_payment' ? "text-orange-700 dark:text-orange-400" : "text-gray-600 dark:text-gray-300"
                      )}>
                        {statusConfig.description}
                      </span>
                      <div className="flex items-center gap-1 ml-auto shrink-0">
                        <Badge variant="outline" className="text-[9px] font-mono text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                          {pkg.referenceId}
                        </Badge>
                        <button
                          type="button"
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
                            pkg.status === 'completed' ? "bg-gradient-to-r from-green-500 to-green-400" :
                            pkg.status === 'rejected' || pkg.status === 'cancelled' ? "bg-gradient-to-r from-red-500 to-red-400" :
                            pkg.status === 'processing' ? "bg-gradient-to-r from-purple-500 to-purple-400" :
                            pkg.status === 'pending_payment' ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                            "bg-gradient-to-r from-blue-500 to-blue-400"
                          )}
                        />
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="space-y-2 sm:space-y-3 p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                          <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Package Details
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex justify-between text-[11px] sm:text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Package</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{pkg.packageName}</span>
                          </div>
                          <div className="flex justify-between text-[11px] sm:text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Applicant Type</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {pkg.applicantType === 'inside' ? 'Inside UAE' : 'Outside UAE'}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] sm:text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Price</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              AED {Math.round(pkg.pricing?.baseAmount || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3 p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                          <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Applicant Info
                        </p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex justify-between text-[11px] sm:text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Name</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{pkg.contact.fullName}</span>
                          </div>
                          <div className="flex justify-between text-[11px] sm:text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Email</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{pkg.contact.email || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between text-[11px] sm:text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Phone</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{pkg.contact.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ─── DOCUMENTS ──────────────────────────────────────────────── */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                          <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Documents ({pkg.documents?.length || 0})
                        </p>
                      </div>
                      {pkg.documents && pkg.documents.length > 0 ? (
                        <div className="space-y-1.5 sm:space-y-2">
                          {pkg.documents.map((doc) => (
                            <div key={doc.docKey} className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                              <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                                <div className="p-1 sm:p-1.5 rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0">
                                  {getFileIcon(doc.mimeType, doc.originalName || doc.filename)({ className: "h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" })}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] sm:text-xs truncate font-medium text-gray-700 dark:text-gray-300">
                                    {doc.label || doc.originalName || 'Document'}
                                  </p>
                                  {doc.size && (
                                    <p className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                                      {formatBytes(doc.size)} • {doc.mimeType || 'Unknown type'}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Badge className={cn(
                                  "text-[8px] sm:text-[10px]",
                                  doc.status === 'approved' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                  doc.status === 'rejected' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                  "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400"
                                )}>
                                  {doc.status || 'pending'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">No documents uploaded yet.</p>
                        </div>
                      )}
                    </div>

                    {/* ─── REQUESTED DOCUMENTS ─────────────────────────────────────── */}
                    {pkg.requestedDocuments && pkg.requestedDocuments.length > 0 && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                            <FileWarning className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-500" />
                            Requested Documents ({pkg.requestedDocuments.filter(d => d.status === 'pending').length} pending)
                          </p>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          {pkg.requestedDocuments.map((req) => (
                            <div key={req._id} className={cn(
                              "flex items-center justify-between p-2 sm:p-2.5 rounded-xl border",
                              req.status === 'pending' ? "bg-orange-50/80 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/30" :
                              req.status === 'fulfilled' ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30" :
                              "bg-gray-50/80 dark:bg-gray-800/20 border-gray-200/50 dark:border-gray-700/30"
                            )}>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <FileText className={cn(
                                    "h-3 w-3",
                                    req.status === 'pending' ? "text-orange-500 dark:text-orange-400" : "text-emerald-500 dark:text-emerald-400"
                                  )} />
                                  <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">
                                    {req.label}
                                  </p>
                                </div>
                                {req.description && (
                                  <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 ml-5">
                                    {req.description}
                                  </p>
                                )}
                                <p className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 ml-5">
                                  {req.status === 'pending' ? '⏳ Pending' : req.status === 'fulfilled' ? '✅ Fulfilled' : '❌ Rejected'}
                                </p>
                              </div>
                              <Badge className={cn(
                                "text-[8px] sm:text-[10px] shrink-0 ml-2",
                                req.status === 'pending' ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30" :
                                req.status === 'fulfilled' ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
                                "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                              )}>
                                {req.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ─── COMMENTS ────────────────────────────────────────────────── */}
                    {pkg.comments && pkg.comments.length > 0 && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                            <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />
                            Messages ({pkg.comments.length})
                          </p>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-48 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                          {pkg.comments.slice().reverse().map((c) => (
                            <div key={c._id} className="p-2 sm:p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">
                                  {c.authorName || c.by}
                                </p>
                                <span className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                                  {formatDate(c.at)}
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                                {c.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ─── PAYMENT ──────────────────────────────────────────────────── */}
                    {pkg.payment && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                            <CreditCard className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            Payment
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 space-y-1.5">
                          <div className="flex justify-between text-[11px] sm:text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Status</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {pkg.payment.status || 'unpaid'}
                            </span>
                          </div>
                          {pkg.payment.paidAmount && (
                            <div className="flex justify-between text-[11px] sm:text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Amount</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                AED {pkg.payment.paidAmount.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {pkg.payment.paidAt && (
                            <div className="flex justify-between text-[11px] sm:text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Paid On</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300">{formatDate(pkg.payment.paidAt)}</span>
                            </div>
                          )}
                          {pkg.payment.paymentLink && (
                            <a
                              href={pkg.payment.paymentLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                            >
                              View payment link <ArrowUpRight className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ─── HISTORY ──────────────────────────────────────────────────── */}
                    {pkg.history && pkg.history.length > 0 && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                            <History className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            History ({pkg.history.length})
                          </p>
                        </div>
                        <div className="space-y-1 sm:space-y-1.5 max-h-32 sm:max-h-48 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                          {pkg.history.slice().reverse().map((h, idx) => (
                            <div key={idx} className="flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-1.5 sm:mt-2 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">
                                    {h.action?.replace(/_/g, ' ').toUpperCase() || 'Update'}
                                  </p>
                                  <span className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                                    {formatDate(h.at)}
                                  </span>
                                </div>
                                {h.note && (
                                  <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {h.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ─── Actions ──────────────────────────────────────────────────── */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 pt-2 border-t border-gray-200/50 dark:border-white/5">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[7px] sm:text-[9px] font-mono text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                          ID: {pkg.referenceId}
                        </Badge>
                        <Badge variant="outline" className="text-[7px] sm:text-[9px] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                          {formatDate(pkg.createdAt)}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 sm:h-7 text-[8px] sm:text-[10px] text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-300 px-2 sm:px-3"
                          onClick={handleRefresh}
                          disabled={refreshing}
                        >
                          {refreshing ? (
                            <RefreshCw className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
                          ) : (
                            'Refresh'
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <Button
                          type="button"
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

// ─── PackageCard Empty State ──────────────────────────────────────────────

export function PackageCardEmptyState({ onBrowsePackages }: { onBrowsePackages?: () => void }) {
  return (
    <div className="text-center py-12 sm:py-16 border-2 border-dashed border-gray-200/60 dark:border-white/10 rounded-2xl bg-gray-50/30 dark:bg-white/5">
      <div className="mx-auto mb-3 sm:mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gray-100/50 dark:bg-white/5">
        <Package className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 dark:text-gray-600" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">No packages yet</h3>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto px-4">
        Explore our packages and start your journey
      </p>
      {onBrowsePackages && (
        <Button
          type="button"
          onClick={onBrowsePackages}
          className="mt-4 sm:mt-6 bg-gradient-to-r from-[#0D1F3C] to-[#1a2a4a] text-white rounded-xl px-4 sm:px-6 transition-all duration-300 text-sm sm:text-base h-9 sm:h-10"
        >
          <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          Browse Packages
        </Button>
      )}
    </div>
  );
}

export default PackageCard;