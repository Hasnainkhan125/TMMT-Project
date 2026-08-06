// components/PackageApplicationsAdmin.jsx
// Modern, responsive admin panel for package applications
import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Layers, FileText, Download, Check, X, ChevronDown, ChevronUp,
  Send, CreditCard, MessageSquare, Users, TrendingUp, AlertCircle,
  Clock, DollarSign, Eye, Trash2, Filter, RefreshCw,
} from 'lucide-react';
import { Package } from 'lucide-react';
import { usePackageAdmin } from '@/hooks/usePackageAdmin';
import { PACKAGE_CONFIG } from '@/config/packageDocs';
import { cn } from '@/lib/utils';

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
    <div className="space-y-6 p-2 sm:p-4 max-w-7xl mx-auto">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xl font-light tracking-tight text-foreground flex items-center gap-2">
    <Package className="h-10 w-10 sm:h-12 sm:w-14 text-[#0A3269] dark:text-[#0A3269]" strokeWidth={1.5} />
            Package Applications
          </h4>
          <p className="text-sm text-muted-foreground">Manage all package applications from customers</p>
        </div>
        <button
          onClick={() => fetchApplications()}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* ─── Filters ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:min-w-[260px]">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${searchFocused ? 'text-[#0A3269] dark:text-[#4A8ABF]' : 'text-muted-foreground'}`} />
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
                ? "border-[#0A3269]/40 dark:border-[#4A8ABF]/40 ring-2 ring-[#0A3269]/20 dark:ring-[#4A8ABF]/20"
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
          className="rounded-xl border border-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0A3269]/20 dark:focus:ring-[#4A8ABF]/20 transition-all w-full sm:w-auto"
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
                  ? "bg-[#0A3269] dark:bg-[#4A8ABF] text-white shadow-sm"
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
      <div className="absolute inset-0 rounded-full border-2 border-[#0A3269] dark:border-[#4A8ABF] border-t-transparent animate-spin" />
    </div>
    <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">Loading applications…</p>
  </div>
) : applications.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-8 sm:py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20 px-4 sm:px-8">
    <Package className="h-10 w-10 sm:h-12 sm:w-14 text-[#0A3269] dark:text-[#0A3269]" strokeWidth={1.5} />
    <h4 className="mt-2 sm:mt-3 text-base sm:text-lg font-medium text-foreground">No package applications</h4>
<p className="text-xs sm:text-sm text-muted-foreground max-w-[220px] sm:max-w-sm mx-auto">
  Applications submitted by customers will appear here.
</p>  </div>
) : (
  <div className="space-y-2 sm:space-y-3">
    {applications.map((app) => (
      <PackageRow
        key={app._id}
        app={app}
        isOpen={openId === app._id}
        onToggle={() => setOpenId(openId === app._id ? null : app._id)}
        actions={{ updateStatus, requestDocs, addComment, updatePayment, downloadUrl }}
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
          ? "border-[#0A3269]/30 dark:border-[#4A8ABF]/30 shadow-lg shadow-[#0A3269]/5 dark:shadow-[#4A8ABF]/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm"
          : "border-border/70 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm hover:shadow-md hover:border-[#0A3269]/20 dark:hover:border-[#4A8ABF]/20"
      )}
    >
      {/* ─── Header / Toggle ──────────────────────────────────────────── */}
      <div
        onClick={onToggle}
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none transition-colors hover:bg-[#0A3269]/5 dark:hover:bg-[#4A8ABF]/5 rounded-t-2xl"
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

  const handleAction = async (fn, ...args) => {
    setIsSubmitting(true);
    try {
      await fn(...args);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-5 bg-gradient-to-b from-muted/10 to-transparent">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Documents */}
          <Section title={`Documents (${app.documents?.length || 0})`} icon={<FileText className="h-3.5 w-3.5" />}>
            {app.documents?.length ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {app.documents.map((d) => (
                  <div key={d._id} className="flex items-center gap-2 rounded-xl border border-border/50 bg-white/50 dark:bg-gray-800/30 px-3 py-2.5 transition hover:border-[#0A3269]/30 dark:hover:border-[#4A8ABF]/30">
                    <FileText className="h-4 w-4 shrink-0" style={{ color: accent }} />
                    <span className="flex-1 text-xs truncate font-medium">{d.label}</span>
                    <a
                      href={actions.downloadUrl(app._id, d._id)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-lg hover:bg-muted transition-colors"
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </a>
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded-full font-medium",
                      d.status === 'approved' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      d.status === 'rejected' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {d.status || 'pending'}
                    </span>
                  </div>
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

          {/* Conversation */}
          <Section title="Conversation" icon={<MessageSquare className="h-3.5 w-3.5" />}>
            <div className="rounded-xl border border-border/50 bg-white/50 dark:bg-gray-800/30 p-3 max-h-40 overflow-y-auto space-y-2">
              {app.comments?.length ? (
                app.comments.map((c) => (
                  <div key={c._id} className={cn("text-xs", c.by === 'customer' ? '' : 'text-right')}>
                    <span
                      className="inline-block rounded-xl px-3 py-1.5 max-w-[85%] leading-relaxed"
                      style={{ background: c.by === 'customer' ? 'var(--muted)' : `${accent}1a` }}
                    >
                      {c.message}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {c.authorName || c.by} · {new Date(c.at).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <Empty>No messages yet.</Empty>
              )}
            </div>
            <div className="flex gap-1.5 mt-2">
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Message customer…"
                className="flex-1 rounded-xl border border-border/50 bg-white/50 dark:bg-gray-800/30 px-3 py-2 text-xs outline-none focus:border-[#0A3269]/40 dark:focus:border-[#4A8ABF]/40 transition"
              />
              <button
                onClick={async () => {
                  if (msg.trim()) {
                    await handleAction(actions.addComment, app._id, msg);
                    setMsg('');
                  }
                }}
                disabled={isSubmitting}
                className="rounded-xl bg-foreground px-4 text-background disabled:opacity-50 transition hover:bg-foreground/90"
              >
                <Send className="h-3.5 w-3.5" />
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
                className="w-full rounded-xl border border-border/50 bg-white/50 dark:bg-gray-800/30 px-3 py-2.5 text-sm outline-none focus:border-[#0A3269]/40 dark:focus:border-[#4A8ABF]/40 transition"
              >
                {STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                className="w-full rounded-xl border border-border/50 bg-white/50 dark:bg-gray-800/30 px-3 py-2.5 text-sm outline-none focus:border-[#0A3269]/40 dark:focus:border-[#4A8ABF]/40 transition"
              />
              <button
                onClick={() => handleAction(actions.updateStatus, app._id, status, note)}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#0A3269] dark:bg-[#4A8ABF] text-white dark:text-black py-2.5 text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
              >
                Update Status
              </button>
            </div>
          </Section>

          {/* Request Documents */}
          <Section title="Request Documents" icon={<FileText className="h-3.5 w-3.5" />}>
            <div className="space-y-2">
              <input
                value={reqLabel}
                onChange={(e) => setReqLabel(e.target.value)}
                placeholder="e.g. Tenancy contract"
                className="w-full rounded-xl border border-border/50 bg-white/50 dark:bg-gray-800/30 px-3 py-2.5 text-sm outline-none focus:border-[#0A3269]/40 dark:focus:border-[#4A8ABF]/40 transition"
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
                  className="flex-1 rounded-xl border border-border/50 bg-white/50 dark:bg-gray-800/30 px-3 py-2 text-sm outline-none focus:border-[#0A3269]/40 dark:focus:border-[#4A8ABF]/40 transition"
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