// components/PackageApplicationsAdmin.jsx
// Drop into the Amer dashboard as a tab: <PackageApplicationsAdmin />
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Heart, FileText, Download, Check, X, ChevronDown, ChevronUp,
  Send, CreditCard, MessageSquare, Layers, Clock,
} from 'lucide-react';
import { usePackageAdmin } from '@/hooks/usePackageAdmin';
import { PACKAGE_CONFIG } from '@/config/packageDocs';

const STATUS_FLOW = ['submitted', 'contacted', 'docs_required', 'pending_payment', 'paid', 'processing', 'completed', 'rejected', 'cancelled'];
const STATUS_STYLE = {
  submitted: 'bg-blue-100 text-blue-700',
  contacted: 'bg-indigo-100 text-indigo-700',
  docs_required: 'bg-orange-100 text-orange-700',
  pending_payment: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  processing: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
};
const fmtAED = (n) => `AED ${Math.round(n || 0).toLocaleString()}`;
const accentOf = (slug) => PACKAGE_CONFIG[slug]?.accent || '#888780';

export default function PackageApplicationsAdmin() {
  const { applications, loading, filters, setFilters, updateStatus, requestDocs, addComment, updatePayment, downloadUrl } = usePackageAdmin();
  const [openId, setOpenId] = useState(null);

  console.log(applications,"applications");
  const counts = useMemo(() => {
    const c = { submitted: 0, docs_required: 0, pending_payment: 0, processing: 0 };
    applications.forEach((a) => { if (c[a.status] !== undefined) c[a.status]++; });
    return c;
  }, [applications]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="Search name, phone, reference…"
            className="w-full rounded-xl border border-border bg-transparent pl-9 pr-3 py-2 text-sm outline-none focus:border-foreground" />
        </div>
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none">
          <option value="all">All statuses</option>
          {STATUS_FLOW.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[['New leads', counts.submitted], ['Docs required', counts.docs_required], ['Awaiting payment', counts.pending_payment], ['Processing', counts.processing]].map(([label, n]) => (
          <div key={label} className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-medium mt-0.5">{n}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : applications.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">No package applications yet.</div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border">
          {applications.map((app) => (
            <Row key={app._id} app={app} open={openId === app._id}
              onToggle={() => setOpenId(openId === app._id ? null : app._id)}
              actions={{ updateStatus, requestDocs, addComment, updatePayment, downloadUrl }} />
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ app, open, onToggle, actions }) {
  const accent = accentOf(app.packageSlug);
  return (
    <div>
      <div onClick={onToggle} className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-muted/40 transition-colors">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] shrink-0" style={{ background: `${accent}1a` }}>
          <Layers className="h-[18px] w-[18px]" style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{app.contact?.fullName}</span>
            <span className="text-[11px] text-muted-foreground">{app.referenceId}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {app.packageName} · {app.applicantType === 'inside' ? 'Inside UAE' : 'Outside UAE'} · {app.contact?.phone}
          </p>
        </div>
        <span className={`text-[11px] px-2.5 py-1 rounded-full ${STATUS_STYLE[app.status] || 'bg-gray-100 text-gray-600'}`}>
          {app.status.replace(/_/g, ' ')}
        </span>
        <span className="text-sm font-medium hidden sm:block">{fmtAED(app.pricing?.baseAmount)}</span>
        {open ? <ChevronUp className="h-[18px] w-[18px] text-muted-foreground" /> : <ChevronDown className="h-[18px] w-[18px] text-muted-foreground" />}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden bg-muted/30">
            <Detail app={app} actions={actions} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Detail({ app, actions }) {
  const [status, setStatus] = useState(app.status);
  const [note, setNote] = useState('');
  const [reqLabel, setReqLabel] = useState('');
  const [msg, setMsg] = useState('');
  const [payLink, setPayLink] = useState(app.payment?.paymentLink || '');

  return (
    <div className="grid md:grid-cols-2 gap-5 p-4">
      {/* LEFT: docs + thread */}
      <div className="space-y-4">
        <Section title={`Documents (${app.documents?.length || 0})`}>
          {app.documents?.length ? (
            <div className="flex flex-col gap-1.5">
              {app.documents.map((d) => (
                <div key={d._id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2">
                  <FileText className="h-4 w-4 shrink-0" style={{ color: accentOf(app.packageSlug) }} />
                  <span className="flex-1 text-xs truncate">{d.label}</span>
                  <a href={actions.downloadUrl(app._id, d._id)} target="_blank" rel="noreferrer"
                    className="text-blue-600" title="Download"><Download className="h-4 w-4" /></a>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${d.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'}`}>{d.status}</span>
                </div>
              ))}
            </div>
          ) : <Empty>No documents uploaded.</Empty>}
        </Section>

        {app.requestedDocuments?.length > 0 && (
          <Section title="Requested from customer">
            <div className="flex flex-col gap-1.5">
              {app.requestedDocuments.map((r) => (
                <div key={r._id} className="flex items-center gap-2 text-xs">
                  <span className={`h-1.5 w-1.5 rounded-full ${r.status === 'fulfilled' ? 'bg-emerald-500' : 'bg-orange-400'}`} />
                  <span className="flex-1">{r.label}</span>
                  <span className="text-muted-foreground">{r.status}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section title="Conversation" icon={<MessageSquare className="h-3.5 w-3.5" />}>
          <div className="rounded-lg border border-border bg-background p-2.5 max-h-40 overflow-y-auto space-y-2">
            {app.comments?.length ? app.comments.map((c) => (
              <div key={c._id} className={`text-xs ${c.by === 'customer' ? '' : 'text-right'}`}>
                <span className="inline-block rounded-lg px-2.5 py-1.5 max-w-[85%]"
                  style={{ background: c.by === 'customer' ? 'var(--muted)' : `${accentOf(app.packageSlug)}1a` }}>
                  {c.message}
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{c.authorName || c.by} · {new Date(c.at).toLocaleString()}</p>
              </div>
            )) : <Empty>No messages yet.</Empty>}
          </div>
          <div className="flex gap-1.5 mt-1.5">
            <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Message customer…"
              className="flex-1 rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-xs outline-none focus:border-foreground" />
            <button onClick={async () => { if (msg.trim() && await actions.addComment(app._id, msg)) setMsg(''); }}
              className="rounded-lg bg-foreground px-3 text-background"><Send className="h-3.5 w-3.5" /></button>
          </div>
        </Section>
      </div>

      {/* RIGHT: actions */}
      <div className="space-y-4">
        <Section title="Update status">
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-border bg-transparent px-2.5 py-2 text-sm outline-none mb-1.5">
            {STATUS_FLOW.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)"
            className="w-full rounded-lg border border-border bg-transparent px-2.5 py-2 text-sm outline-none mb-1.5" />
          <button onClick={() => actions.updateStatus(app._id, status, note)}
            className="w-full rounded-lg bg-foreground py-2 text-sm font-medium text-background">Save status</button>
        </Section>

        <Section title="Request documents">
          <input value={reqLabel} onChange={(e) => setReqLabel(e.target.value)} placeholder="e.g. Tenancy contract"
            className="w-full rounded-lg border border-border bg-transparent px-2.5 py-2 text-sm outline-none mb-1.5" />
          <button onClick={async () => { if (reqLabel.trim() && await actions.requestDocs(app._id, [{ label: reqLabel }], '')) setReqLabel(''); }}
            className="w-full rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted">Request from customer</button>
        </Section>

        <Section title="Payment" icon={<CreditCard className="h-3.5 w-3.5" />}>
          <div className="text-xs text-muted-foreground mb-1.5">
            Status: <span className="font-medium text-foreground">{app.payment?.status || 'unpaid'}</span>
            {app.payment?.paidAt && ` · ${new Date(app.payment.paidAt).toLocaleDateString()}`}
          </div>
          <div className="flex gap-1.5 mb-1.5">
            <input value={payLink} onChange={(e) => setPayLink(e.target.value)} placeholder="Payment link"
              className="flex-1 rounded-lg border border-border bg-transparent px-2.5 py-2 text-sm outline-none" />
            <button onClick={() => actions.updatePayment(app._id, { status: 'pending', paymentLink: payLink })}
              className="rounded-lg border border-border px-3 text-sm hover:bg-muted">Send</button>
          </div>
          <button onClick={() => actions.updatePayment(app._id, { status: 'paid', provider: 'manual', paidAmount: app.pricing?.baseAmount })}
            className="w-full rounded-lg border border-emerald-300 text-emerald-700 py-2 text-sm font-medium hover:bg-emerald-50">
            Mark as paid ({fmtAED(app.pricing?.baseAmount)})
          </button>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">{icon}{title}</p>
      {children}
    </div>
  );
}
function Empty({ children }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}