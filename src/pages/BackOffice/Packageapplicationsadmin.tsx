// components/PackageApplicationsAdmin.jsx
// Modern, responsive admin panel for package applications
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Layers, FileText, Download, Check, X, ChevronDown, ChevronUp,
  Send, CreditCard, MessageSquare, Users, TrendingUp, AlertCircle,
  Clock, DollarSign, Eye, Trash2, Filter, RefreshCw, User, UserCog,
  Image, FileIcon, EyeIcon, ThumbsUp, ThumbsDown, Shield,
} from 'lucide-react';
import { Package } from 'lucide-react';
import { usePackageAdmin } from '@/hooks/usePackageAdmin';
import { PACKAGE_CONFIG } from '@/config/packageDocs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_FLOW = ['submitted', 'contacted', 'docs_required', 'pending_payment', 'paid', 'processing', 'completed', 'rejected', 'cancelled'];
const STATUS_STYLE = {
  submitted: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  contacted: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-500' },
  docs_required: { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  pending_payment: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  paid: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  processing: { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
  completed: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
  rejected: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  cancelled: { bg: 'bg-gray-50 dark:bg-gray-800/30', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
};
const fmtAED = (n) => `AED ${Math.round(n || 0).toLocaleString()}`;
const accentOf = (slug) => PACKAGE_CONFIG[slug]?.accent || '#888780';

// ─── Helper: Get file icon based on mime type ──────────────────────
const getFileIcon = (mimeType, filename) => {
  if (!mimeType && !filename) return FileText;
  const name = filename?.toLowerCase() || '';
  const type = mimeType?.toLowerCase() || '';
  if (type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/)) return Image;
  if (type === 'application/pdf' || name.endsWith('.pdf')) return FileText;
  if (type === 'application/msword' || name.endsWith('.doc')) return FileText;
  if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx')) return FileText;
  return FileIcon;
};

// ─── Helper: Check if file is an image ──────────────────────────────
const isImageFile = (mimeType, filename) => {
  if (!mimeType && !filename) return false;
  const name = filename?.toLowerCase() || '';
  const type = mimeType?.toLowerCase() || '';
  return type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/);
};

// ─── Helper: Format file size ────────────────────────────────────────
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ─── Helper to determine if a comment is from admin ──────────────────
const isAdminComment = (comment) => {
  if (comment.by === 'customer') return false;
  if (comment.by === 'admin' || comment.by === 'system') return true;
  if (comment.role === 'customer') return false;
  if (comment.role === 'admin' || comment.role === 'officer' || comment.role === 'amer') return true;
  if (comment.authorName?.toLowerCase().includes('admin')) return true;
  if (comment.author?.toLowerCase().includes('admin')) return true;
  return false;
};

// ─── Chat Message Component ──────────────────────────────────────────
function ChatMessage({ message, isAdmin }) {
  const time = new Date(message.at || message.createdAt || Date.now()).toLocaleTimeString([], {
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
        <p className="leading-relaxed text-[11px]">{message.message || message.text || message.content || ''}</p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <span className="text-[7px] text-gray-400">{time}</span>
        </div>
      </div>
      {!isAdmin && (
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-[8px] font-bold">Y</div>
        </div>
      )}
    </div>
  );
}

// ─── Document Preview Component with Approve/Reject ──────────────────
function DocumentPreview({ doc, appId, downloadUrl, previewUrl, accent, onApprove, onReject }) {
  const [showPreview, setShowPreview] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  const IconComponent = getFileIcon(doc.mimeType, doc.originalName || doc.filename);
  const isImage = isImageFile(doc.mimeType, doc.originalName || doc.filename);
  const downloadLink = downloadUrl(appId, doc._id || doc.docKey);
  const previewLink = previewUrl ? previewUrl(appId, doc._id || doc.docKey) : null;

  // ─── Handle Download with Auth ──────────────────────────────────────
  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Please login to download');
        return;
      }

      const response = await fetch(downloadLink, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalName || doc.filename || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Document downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(appId, doc._id || doc.docKey);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.warning('Please provide a reason for rejection');
      return;
    }
    setIsProcessing(true);
    try {
      await onReject(appId, doc._id || doc.docKey, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    switch (doc.status) {
      case 'approved':
        return { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
      case 'rejected':
        return { label: 'Rejected', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
      default:
        return { label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <>
      <div className={cn(
        "group relative flex items-center gap-3 rounded-xl border p-3 transition-all hover:shadow-md",
        doc.status === 'approved' ? "border-emerald-300/50 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-950/10" :
        doc.status === 'rejected' ? "border-red-300/50 dark:border-red-700/50 bg-red-50/30 dark:bg-red-950/10" :
        "border-border/50 bg-white/50 dark:bg-gray-800/30 hover:border-[#14235E]/30 dark:hover:border-[#14235E]/30"
      )}>
        {/* Document Preview/Icon */}
        <div className="relative shrink-0">
          {isImage && previewLink && !imageError ? (
            <div 
              className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 dark:border-gray-700"
              onClick={() => setShowPreview(true)}
            >
              <img 
                src={previewLink}
                alt={doc.label || doc.originalName || 'Document'}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            </div>
          ) : (
            <div 
              className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              style={{ background: `${accent}15` }}
            >
              <IconComponent className="h-6 w-6" style={{ color: accent }} />
            </div>
          )}
          {/* Badge for file type */}
          <div className="absolute -bottom-1 -right-1 rounded-full bg-gray-800/80 dark:bg-gray-700/80 px-1.5 py-0.5 text-[6px] font-medium text-white uppercase">
            {doc.mimeType?.split('/')[1]?.slice(0, 4) || 'file'}
          </div>
        </div>

        {/* Document Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {doc.label || doc.originalName || 'Document'}
            </p>
            <span className={cn("text-[8px] px-2 py-0.5 rounded-full font-medium", statusBadge.className)}>
              {statusBadge.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{doc.size ? formatBytes(doc.size) : 'Unknown size'}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
            {doc.rejectionReason && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-red-500 truncate max-w-[150px]">
                  Reason: {doc.rejectionReason}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {isImage && previewLink && !imageError && (
            <button
              onClick={() => setShowPreview(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Preview"
            >
              <EyeIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
          {/* ─── DOWNLOAD BUTTON ──────────────────────────────────────── */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
          
          {doc.status === 'pending' && (
            <>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-emerald-600 dark:text-emerald-400"
                title="Approve Document"
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isProcessing}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                title="Reject Document"
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ─── Image Preview Modal ──────────────────────────────────────── */}
      {showPreview && isImage && previewLink && !imageError && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {doc.label || doc.originalName || 'Document Preview'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {doc.size ? formatBytes(doc.size) : 'Unknown size'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="rounded-lg bg-gray-100 dark:bg-gray-800 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="rounded-lg bg-gray-100 dark:bg-gray-800 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-950 min-h-[200px]">
              <img 
                src={previewLink}
                alt={doc.label || doc.originalName || 'Document'}
                className="max-h-[70vh] w-auto object-contain"
                onError={(e) => {
                  e.target.src = '';
                  e.target.alt = 'Failed to load image';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Reject Modal ──────────────────────────────────────────────── */}
      {showRejectModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowRejectModal(false)}
        >
          <div 
            className="relative max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Reject Document</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Please provide a reason for rejecting "{doc.label || doc.originalName}"
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 focus:outline-none transition-all min-h-[80px] resize-none"
                rows={3}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing || !rejectReason.trim()}
                  className="flex-1 rounded-lg bg-red-600 text-white py-2 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────
export default function PackageApplicationsAdmin() {
  const {
    applications,
    loading,
    filters,
    setFilters,
    updateStatus,
    requestDocs,
    addComment,
    updatePayment,
    downloadUrl,
    previewUrl,
    approveDocument,
    rejectDocument,
    fetchApplications,
  } = usePackageAdmin({ mine: false });

  const [openId, setOpenId] = useState(null);
  const searchRef = useRef(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const counts = useMemo(() => {
    const c = { submitted: 0, docs_required: 0, pending_payment: 0, processing: 0, total: applications.length };
    applications.forEach((a) => {
      if (c[a.status] !== undefined) c[a.status]++;
    });
    return c;
  }, [applications]);

  const clearSearch = () => {
    setFilters((f) => ({ ...f, q: '' }));
    searchRef.current?.focus();
  };

  // ─── Status chips data ──────────────────────────────────────────────
  const statusChips = [
    { label: 'All', value: 'all', count: applications.length },
    { label: 'Submitted', value: 'submitted', count: applications.filter(a => a.status === 'submitted').length },
    { label: 'Review', value: 'processing', count: applications.filter(a => a.status === 'processing').length },
    { label: 'Approved', value: 'completed', count: applications.filter(a => a.status === 'completed').length },
    { label: 'Rejected', value: 'rejected', count: applications.filter(a => a.status === 'rejected').length },
  ];

  return (
    <div className="space-y-2">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-[#0a3269]/20 dark:to-slate-900 p-2 border border-slate-200/50 dark:border-slate-700/30">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  <div>
    <h4 className="text-xl font-light tracking-tight text-foreground flex items-center gap-2">
      <div className="rounded-2xl bg-[#0a3269] p-2.5 sm:p-3 shadow-lg shadow-[#0a3269]/20">
        <Package className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={1.5} />
      </div>
      Package Applications
    </h4>
    <p className="text-[9px] p-2 sm:text-sm text-slate-600 dark:text-slate-300 truncate">
      Manage all package applications from customers
    </p>
  </div>
  
  <button
    onClick={() => fetchApplications()}
    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors whitespace-nowrap"
  >
    <RefreshCw className="h-4 w-4" />
    Refresh
  </button>
</div>
</div>

      {/* ─── Filters ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:min-w-[260px]">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${searchFocused ? 'text-[#14235E] dark:text-[#14235E]' : 'text-muted-foreground'}`} />
          <input
            ref={searchRef}
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search by name, phone, reference…"
            className={cn(
              "w-full rounded-xl border bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm pl-9 pr-10 py-2.5 text-sm outline-none transition-all",
              searchFocused
                ? "border-[#14235E]/40 dark:border-[#14235E]/40 ring-2 ring-[#14235E]/20 dark:ring-[#14235E]/20"
                : "border-border"
            )}
          />
          {filters.q && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="rounded-xl border border-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#14235E]/20 dark:focus:ring-[#14235E]/20 transition-all w-full sm:w-auto"
        >
          <option value="all">All statuses</option>
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* ─── Status Chips ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {statusChips.map((chip) => {
          const isActive = filters.status === chip.value;
          return (
            <motion.button
              key={chip.value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilters(f => ({ ...f, status: chip.value }))}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                isActive
                  ? "bg-[#14235E] dark:bg-[#14235E] text-white shadow-sm"
                  : "bg-gray-100/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-white/10"
              )}
            >
              {chip.label} <span className="opacity-50">({chip.count})</span>
            </motion.button>
          );
        })}
      </div>

      {/* ─── Applications List ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-16">
          <div className="relative h-8 w-8 sm:h-10 sm:w-10">
            <div className="absolute inset-0 rounded-full border-2 border-muted" />
            <div className="absolute inset-0 rounded-full border-2 border-[#14235E] dark:border-[#14235E] border-t-transparent animate-spin" />
          </div>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">Loading applications…</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20 px-4 sm:px-8">
          <Package className="h-10 w-10 sm:h-12 sm:w-14 text-[#14235E] dark:text-[#14235E]" strokeWidth={1.5} />
          <h4 className="mt-2 sm:mt-3 text-base sm:text-lg font-medium text-foreground">No package applications</h4>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-[220px] sm:max-w-sm mx-auto">
            Applications submitted by customers will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {applications.map((app) => (
            <PackageRow
              key={app._id}
              app={app}
              isOpen={openId === app._id}
              onToggle={() => setOpenId(openId === app._id ? null : app._id)}
              actions={{ 
                updateStatus, 
                requestDocs, 
                addComment, 
                updatePayment, 
                downloadUrl,
                previewUrl,
                approveDocument,
                rejectDocument,
              }}
              accent={accentOf(app.packageSlug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Row Component ────────────────────────────────────────────────────
function PackageRow({ app, isOpen, onToggle, actions, accent }) {
  const statusStyle = STATUS_STYLE[app.status] || STATUS_STYLE.submitted;
  const StatusDot = () => (
    <span className={`inline-block h-2 w-2 rounded-full ${statusStyle.dot} ring-1 ring-offset-1 ring-${statusStyle.dot}`} />
  );

  return (
    <motion.div
      initial={false}
      animate={{ scale: 1 }}
      className={cn(
        "rounded-2xl border transition-all duration-200",
        isOpen
          ? "border-[#14235E]/30 dark:border-[#14235E]/30 shadow-lg shadow-[#14235E]/5 dark:shadow-[#14235E]/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm"
          : "border-border/70 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm hover:shadow-md hover:border-[#14235E]/20 dark:hover:border-[#14235E]/20"
      )}
    >
      {/* ─── Header / Toggle ──────────────────────────────────────────── */}
      <div
        onClick={onToggle}
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none transition-colors hover:bg-[#14235E]/5 dark:hover:bg-[#14235E]/5 rounded-t-2xl"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${accent}1a` }}
        >
          <Layers className="h-[18px] w-[18px]" style={{ color: accent }} strokeWidth={1.75} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground truncate max-w-[120px] sm:max-w-[200px]">
              {app.contact?.fullName || 'Unknown'}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">
              {app.referenceId}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
            <span>{app.packageName}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{app.applicantType === 'inside' ? 'Inside UAE' : 'Outside UAE'}</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">{app.contact?.phone}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text}`}>
            <StatusDot />
            {app.status.replace(/_/g, ' ')}
          </span>
          <span className="text-sm font-medium hidden sm:block min-w-[70px] text-right">
            {fmtAED(app.pricing?.baseAmount)}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* ─── Expanded Content ──────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border/50"
          >
            <DetailPanel app={app} actions={actions} accent={accent} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────
function DetailPanel({ app, actions, accent }) {
  const [status, setStatus] = useState(app.status);
  const [note, setNote] = useState('');
  const [reqLabel, setReqLabel] = useState('');
  const [msg, setMsg] = useState('');
  const [payLink, setPayLink] = useState(app.payment?.paymentLink || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatContainerRef = useRef(null);

  // ─── Comments state ──────────────────────────────────────────────────
  const [comments, setComments] = useState(() => {
    if (app.comments && Array.isArray(app.comments)) {
      return app.comments.map((c) => {
        const isAdmin = isAdminComment(c);
        return {
          ...c,
          isAdmin: isAdmin,
          isUser: !isAdmin,
        };
      });
    }
    return [];
  });

  // ─── Update comments when app changes ──────────────────────────────
  useEffect(() => {
    if (app.comments && Array.isArray(app.comments)) {
      setComments(app.comments.map((c) => {
        const isAdmin = isAdminComment(c);
        return {
          ...c,
          isAdmin: isAdmin,
          isUser: !isAdmin,
        };
      }));
    }
  }, [app.comments]);

  // ─── Sort comments ──────────────────────────────────────────────────
  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.at || a.createdAt || 0);
    const dateB = new Date(b.at || b.createdAt || 0);
    return dateA.getTime() - dateB.getTime();
  });

  // ─── Scroll to bottom of chat ──────────────────────────────────────
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [comments]);

  const handleAction = async (fn, ...args) => {
    setIsSubmitting(true);
    try {
      await fn(...args);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Send Message (Admin) ──────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!msg.trim()) {
      toast.warning('Please enter a message');
      return;
    }

    setIsSubmitting(true);
    try {
      await actions.addComment(app._id, msg.trim());
      
      const newComment = {
        _id: `local-${Date.now()}`,
        message: msg.trim(),
        text: msg.trim(),
        content: msg.trim(),
        by: 'admin',
        role: 'admin',
        isAdmin: true,
        isUser: false,
        at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      setComments(prev => [...prev, newComment]);
      setMsg('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-5 bg-gradient-to-b from-muted/10 to-transparent">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Documents with Preview and Approve/Reject */}
          <Section title={`Documents (${app.documents?.length || 0})`} icon={<FileText className="h-3.5 w-3.5" />}>
            {app.documents?.length ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {app.documents.map((d) => (
                  <DocumentPreview
                    key={d._id || d.docKey}
                    doc={d}
                    appId={app._id}
                    downloadUrl={actions.downloadUrl}
                    previewUrl={actions.previewUrl}
                    accent={accent}
                    onApprove={actions.approveDocument}
                    onReject={actions.rejectDocument}
                  />
                ))}
              </div>
            ) : (
              <Empty>No documents uploaded yet.</Empty>
            )}
          </Section>

          {/* Requested Documents */}
          {app.requestedDocuments?.length > 0 && (
            <Section title="Requested from customer" icon={<AlertCircle className="h-3.5 w-3.5" />}>
              <div className="space-y-1.5">
                {app.requestedDocuments.map((r) => (
                  <div key={r._id} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg bg-muted/30">
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", r.status === 'fulfilled' ? 'bg-emerald-500' : 'bg-orange-400')} />
                    <span className="flex-1 font-medium">{r.label}</span>
                    <span className="text-muted-foreground capitalize">{r.status}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Request Documents */}
          <Section title="Request Documents" icon={<FileText className="h-3.5 w-3.5" />}>
            <div className="space-y-2">
              <input
                value={reqLabel}
                onChange={(e) => setReqLabel(e.target.value)}
                placeholder="e.g. Tenancy contract"
                className="w-full rounded-xl border border-border/50 bg-white/50 dark:bg-gray-800/30 px-3 py-2.5 text-sm outline-none focus:border-[#14235E]/40 dark:focus:border-[#14235E]/40 transition"
              />
              <button
                onClick={() => {
                  if (reqLabel.trim()) {
                    handleAction(actions.requestDocs, app._id, [{ label: reqLabel }], '');
                    setReqLabel('');
                  }
                }}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-border/50 py-2.5 text-sm font-medium transition hover:bg-muted/50 disabled:opacity-50"
              >
                Request from Customer
              </button>
            </div>
          </Section>
        </div>

        {/* ─── RIGHT COLUMN ────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Status Update */}
          <Section title="Update Status" icon={<Clock className="h-3.5 w-3.5" />}>
            <div className="space-y-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-white/50 dark:bg-gray-800/30 px-3 py-2.5 text-sm outline-none focus:border-[#14235E]/40 dark:focus:border-[#14235E]/40 transition"
              >
                {STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                className="w-full rounded-xl border border-border/50 bg-white/50 dark:bg-gray-800/30 px-3 py-2.5 text-sm outline-none focus:border-[#14235E]/40 dark:focus:border-[#14235E]/40 transition"
              />
              <button
                onClick={() => handleAction(actions.updateStatus, app._id, status, note)}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#14235E] dark:bg-[#14235E] text-white dark:text-white py-2.5 text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
              >
                Update Status
              </button>
            </div>
          </Section>

          {/* Payment */}
          <Section title="Payment" icon={<CreditCard className="h-3.5 w-3.5" />}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-foreground capitalize">{app.payment?.status || 'unpaid'}</span>
                {app.payment?.paidAt && (
                  <span className="text-muted-foreground">· {new Date(app.payment.paidAt).toLocaleDateString()}</span>
                )}
              </div>
              <div className="flex gap-1.5">
                <input
                  value={payLink}
                  onChange={(e) => setPayLink(e.target.value)}
                  placeholder="Payment link"
                  className="flex-1 rounded-xl border border-border/50 bg-white/50 dark:bg-gray-800/30 px-3 py-2 text-sm outline-none focus:border-[#14235E]/40 dark:focus:border-[#14235E]/40 transition"
                />
                <button
                  onClick={() => handleAction(actions.updatePayment, app._id, { status: 'pending', paymentLink: payLink })}
                  disabled={isSubmitting}
                  className="rounded-xl border border-border/50 px-4 text-sm transition hover:bg-muted/50 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
              <button
                onClick={() => handleAction(actions.updatePayment, app._id, { status: 'paid', provider: 'manual', paidAmount: app.pricing?.baseAmount })}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 py-2.5 text-sm font-medium transition hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50"
              >
                Mark as paid ({fmtAED(app.pricing?.baseAmount)})
              </button>
            </div>
          </Section>

          {/* ─── MODERN CONVERSATION SECTION ──────────────────────────── */}
          <Section title="Conversation" icon={<MessageSquare className="h-3.5 w-3.5" />}>
            <div className="rounded-xl border border-border/50 bg-white/50 dark:bg-gray-800/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100/80 dark:bg-gray-800/80 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</p>
                    <p className="text-[8px] text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </p>
                  </div>
                </div>
                <span className="bg-gray-200/50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300 border-0 text-[10px] px-2.5 py-0.5 rounded-full">
                  {comments.length} messages
                </span>
              </div>

              <div 
                ref={chatContainerRef}
                className="max-h-52 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
              >
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
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Start a conversation with the customer</p>
                  </div>
                )}
              </div>

              <div className="border-t border-border/50 p-2 bg-white dark:bg-gray-900/50">
                <div className="flex items-center gap-1.5">
                  <input
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 min-h-[38px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-full px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                    disabled={isSubmitting}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isSubmitting || !msg.trim()}
                    className="h-9 w-9 p-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 shrink-0 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Empty({ children }) {
  return <p className="text-xs text-muted-foreground py-1">{children}</p>;
}