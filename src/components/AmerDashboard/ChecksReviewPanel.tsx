import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  FileText,
  Upload,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Send,
  Download,
  Plus,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken') || ''
  return { Authorization: `Bearer ${token}` }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface RequestedDoc {
  label: string
  description: string
}

interface CheckDoc {
  label?: string
  description?: string
  fulfilledAt?: string
  filename?: string
  originalName?: string
}

interface CheckAttachment {
  originalName?: string
  filename?: string
  path?: string
}

interface Check {
  _id: string
  serviceType: string
  status: string
  createdAt: string
  isFreeService: boolean
  amount?: number
  identifiers?: Record<string, string>
  attachments?: CheckAttachment[]
  requestedDocuments?: CheckDoc[]
  resultDocuments?: Array<{ filename: string; originalName?: string }>
  resultSummary?: string
  resultStatus?: string
  userId?: { email?: string; _id?: string } | string
  comments?: Array<{ text: string; author?: string; createdAt: string; role?: string }>
}

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending_payment: { label: 'Pending Payment', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: Clock },
  submitted:        { label: 'Submitted',       color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',   icon: Clock },
  processing:       { label: 'Processing',      color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Clock },
  reviewing:        { label: 'Under Review',    color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: AlertCircle },
  completed:        { label: 'Completed',       color: 'text-green-700',  bg: 'bg-green-50 border-green-200',  icon: CheckCircle },
  requires_documents: { label: 'Docs Required', color: 'text-red-700',  bg: 'bg-red-50 border-red-200',      icon: AlertCircle },
  cancelled:        { label: 'Cancelled',       color: 'text-gray-700',  bg: 'bg-gray-50 border-gray-200',   icon: X },
}

function getStatus(key: string) {
  return STATUS_MAP[key] ?? STATUS_MAP.submitted
}

// ─── Main Component ────────────────────────────────────────────────────────────

const ChecksReviewPanel: React.FC = () => {
  const { t } = useTranslation()

  // List state
  const [checks, setChecks] = useState<Check[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  // Per-check UI state
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  // Per-check form state
  const [newStatus, setNewStatus] = useState<Record<string, string>>({})
  const [statusNote, setStatusNote] = useState<Record<string, string>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [requestedDocs, setRequestedDocs] = useState<Record<string, RequestedDoc[]>>({})
  const [docLabel, setDocLabel] = useState<Record<string, string>>({})
  const [docDesc, setDocDesc] = useState<Record<string, string>>({})

  // Result upload state
  const [resultFile, setResultFile] = useState<Record<string, File | null>>({})
  const [resultSummary, setResultSummary] = useState<Record<string, string>>({})
  const [resultStatus, setResultStatus] = useState<Record<string, 'clear' | 'flagged' | 'pending'>>({})

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchChecks = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}&limit=50` : '?limit=50'
      const res = await fetch(`${apiBase}/api/v1/checks/officer/all${params}`, {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to load checks')
      const data = await res.json()
      setChecks(data.data?.checks || [])
    } catch (err: any) {
      toast.error(err?.message || t('errors.general'))
    } finally {
      setLoading(false)
    }
  }, [statusFilter, t])

  useEffect(() => {
    fetchChecks()
  }, [fetchChecks])

  // ─── Actions ────────────────────────────────────────────────────────────────

  function setLoading1(id: string, val: boolean) {
    setActionLoading(prev => ({ ...prev, [id]: val }))
  }

  async function handleStatusUpdate(check: Check) {
    const id = check._id
    const status = newStatus[id]
    if (!status) { toast.warning('Select a status first'); return }
    setLoading1(id, true)
    try {
      const res = await fetch(`${apiBase}/api/v1/checks/${id}/status`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: statusNote[id] || '' }),
      })
      if (!res.ok) throw new Error('Status update failed')
      toast.success('Status updated')
      fetchChecks()
    } catch (err: any) {
      toast.error(err?.message || t('errors.general'))
    } finally {
      setLoading1(id, false)
    }
  }

  async function handleAddComment(check: Check) {
    const id = check._id
    const text = commentText[id]?.trim()
    if (!text) { toast.warning('Enter a comment first'); return }
    setLoading1(id, true)
    try {
      const res = await fetch(`${apiBase}/api/v1/checks/${id}/comment`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('Comment failed')
      toast.success('Comment added')
      setCommentText(prev => ({ ...prev, [id]: '' }))
      fetchChecks()
    } catch (err: any) {
      toast.error(err?.message || t('errors.general'))
    } finally {
      setLoading1(id, false)
    }
  }

  async function handleRequestDocs(check: Check) {
    const id = check._id
    const docs = requestedDocs[id] || []
    if (docs.length === 0) { toast.warning('Add at least one document request'); return }
    setLoading1(id, true)
    try {
      const res = await fetch(`${apiBase}/api/v1/checks/${id}/request-docs`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: docs }),
      })
      if (!res.ok) throw new Error('Document request failed')
      toast.success('Document request sent')
      setRequestedDocs(prev => ({ ...prev, [id]: [] }))
      fetchChecks()
    } catch (err: any) {
      toast.error(err?.message || t('errors.general'))
    } finally {
      setLoading1(id, false)
    }
  }

  async function handleUploadResult(check: Check) {
    const id = check._id
    const file = resultFile[id]
    if (!file) { toast.warning('Select a result file first'); return }
    setLoading1(id, true)
    try {
      const form = new FormData()
      // form.append('file', file)
      form.append('resultSummary', resultSummary[id] || '')
      form.append('resultStatus', resultStatus[id] || 'pending')
      form.append('resultFiles', file)
      const res = await fetch(`${apiBase}/api/v1/checks/${id}/result`, {
        method: 'POST',
        headers: authHeaders(),
        body: form,
      })
      if (!res.ok) throw new Error('Upload failed')
      toast.success('Result uploaded')
      setResultFile(prev => ({ ...prev, [id]: null }))
      setResultSummary(prev => ({ ...prev, [id]: '' }))
      fetchChecks()
    } catch (err: any) {
      toast.error(err?.message || t('errors.general'))
    } finally {
      setLoading1(id, false)
    }
  }

  function addDocRow(id: string) {
    const label = docLabel[id]?.trim()
    const desc = docDesc[id]?.trim()
    if (!label) { toast.warning('Document label is required'); return }
    setRequestedDocs(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), { label, description: desc || '' }],
    }))
    setDocLabel(prev => ({ ...prev, [id]: '' }))
    setDocDesc(prev => ({ ...prev, [id]: '' }))
  }

  function removeDocRow(id: string, idx: number) {
    setRequestedDocs(prev => ({
      ...prev,
      [id]: (prev[id] || []).filter((_, i) => i !== idx),
    }))
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  const userEmail = (check: Check): string => {
    if (!check.userId) return 'Unknown'
    if (typeof check.userId === 'string') return check.userId
    return check.userId.email || check.userId._id || 'Unknown'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="text-primary h-5 w-5" />
              Immigration Status Checks
            </CardTitle>
            <CardDescription>Review and process submitted status check inquiries</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="reviewing">Under Review</SelectItem>
                <SelectItem value="requires_documents">Docs Required</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchChecks} disabled={loading}>
              {loading ? (
                <span className="border-primary h-4 w-4 animate-spin rounded-full border-b-2 inline-block" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Checks List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="border-primary mx-auto h-10 w-10 animate-spin rounded-full border-b-2" />
          <p className="text-muted-foreground mt-3 text-sm">Loading checks…</p>
        </div>
      ) : checks.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShieldCheck className="text-primary mx-auto mb-4 h-12 w-12 opacity-30" />
            <p className="text-muted-foreground font-medium">No checks found</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {statusFilter !== 'all' ? 'Try changing the status filter.' : 'No submissions yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {checks.map(check => {
            const s = getStatus(check.status)
            const StatusIcon = s.icon
            const isExpanded = expandedId === check._id
            const isActing = actionLoading[check._id] || false
            const attachCount = check.attachments?.length || 0
            const pendingDocs = check.requestedDocuments?.filter(d => !d.fulfilledAt).length || 0

            return (
              <Card key={check._id} className={`border transition-shadow ${isExpanded ? 'shadow-md' : 'hover:shadow-sm'}`}>
                {/* Card Header row */}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`mt-0.5 rounded-full p-2 ${s.bg}`}>
                        <StatusIcon className={`h-4 w-4 ${s.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-sm">{check?.serviceType}</p>
                          <Badge variant="outline" className="font-mono text-xs">
                            #{check?._id?.slice(-6)?.toUpperCase()}
                          </Badge>
                          <Badge className={`text-xs ${s.color} border ${s.bg}`}>{s.label}</Badge>
                          {pendingDocs > 0 && (
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                              {pendingDocs} doc{pendingDocs > 1 ? 's' : ''} pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {userEmail(check)} · {new Date(check?.createdAt).toLocaleDateString()} ·{' '}
                          {check?.isFreeService ? 'Free' : `AED ${check?.amount ?? 0}`}
                          {attachCount > 0 && ` · ${attachCount} attachment${attachCount > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>

                    {/* Expand button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setExpandedId(isExpanded ? null : check?._id)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Expanded panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        key="expanded"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-5 border-t pt-4">

                          {/* 1. Identifiers */}
                          {check?.identifiers && Object.keys(check?.identifiers).length > 0 && (
                            <section>
                              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <FileText className="h-3.5 w-3.5" /> Identifiers
                              </h4>
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {Object.entries(check?.identifiers).map(([k, v]) => {
                                  if(typeof v === 'object') {
                                    return(
                                      <div key={k} className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                                        <p className="font-medium break-all">{JSON.stringify(v) || '—'}</p>
                                      </div>
                                    )
                                  }
                                  return(
                                  <div key={k} className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                                    {/* <p className="text-muted-foreground capitalize">{k?.replace(/_/g, ' ')}</p> */}
                                    <p className="font-medium break-all">{v?.toString() || '—'}</p>
                                  </div>
                                )})}
                              </div>
                            </section>
                          )}

                          {/* 2. Attachments */}
                          {attachCount > 0 && (
                            <section>
                              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <Upload className="h-3.5 w-3.5" /> Attachments ({attachCount})
                              </h4>
                              <div className="space-y-1.5">
                                {check?.attachments?.map((att, idx) => (
                                  <div key={idx} className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-xs">
                                    <span className="truncate">{att.originalName || att.filename || `File ${idx + 1}`}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs"
                                      onClick={() =>
                                        window.open(
                                          `${apiBase}/uploads/checks/${check._id}/${att.filename || att.path}`,
                                          '_blank'
                                        )
                                      }
                                    >
                                      <Download className="mr-1 h-3 w-3" /> View
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {/* 3. Comments */}
                          {check?.comments && check?.comments?.length > 0 && (
                            <section>
                              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <MessageSquare className="h-3.5 w-3.5" /> Comments
                              </h4>
                              <div className="space-y-2">
                                {check?.comments?.map((c, idx) => (
                                  <div key={idx} className="rounded-md border bg-muted/30 px-3 py-2 text-xs">
                                    <p className="text-muted-foreground mb-0.5">
                                      {c?.role || c?.author || 'Officer'} · {new Date(c?.createdAt).toLocaleString()}
                                    </p>
                                    <p>{c.text}</p>
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {/* Divider */}
                          <div className="border-t" />

                          {/* 4. Status Update */}
                          <section>
                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <CheckCircle className="h-3.5 w-3.5" /> Update Status
                            </h4>
                            <div className="space-y-2">
                              <Select
                                value={newStatus[check._id] || ''}
                                onValueChange={val => setNewStatus(prev => ({ ...prev, [check._id]: val }))}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Select new status…" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="submitted">Submitted</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="reviewing">Under Review</SelectItem>
                                  <SelectItem value="requires_documents">Requires Documents</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <Textarea
                                placeholder="Optional note…"
                                className="min-h-[60px] text-sm"
                                value={statusNote[check._id] || ''}
                                onChange={e => setStatusNote(prev => ({ ...prev, [check._id]: e.target.value }))}
                              />
                              <Button
                                size="sm"
                                disabled={isActing || !newStatus[check._id]}
                                onClick={() => handleStatusUpdate(check)}
                              >
                                {isActing ? (
                                  <span className="border-white h-3 w-3 animate-spin rounded-full border-b-2 inline-block mr-1" />
                                ) : (
                                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                )}
                                Update Status
                              </Button>
                            </div>
                          </section>

                          {/* 5. Add Comment */}
                          <section>
                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <MessageSquare className="h-3.5 w-3.5" /> Add Comment
                            </h4>
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="Write a comment visible to the applicant…"
                                className="min-h-[60px] flex-1 text-sm"
                                value={commentText[check._id] || ''}
                                onChange={e => setCommentText(prev => ({ ...prev, [check._id]: e.target.value }))}
                              />
                            </div>
                            <Button
                              size="sm"
                              className="mt-2"
                              disabled={isActing || !commentText[check._id]?.trim()}
                              onClick={() => handleAddComment(check)}
                            >
                              <Send className="mr-1.5 h-3.5 w-3.5" /> Send Comment
                            </Button>
                          </section>

                          {/* 6. Request Documents */}
                          <section>
                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <AlertCircle className="h-3.5 w-3.5" /> Request Documents
                            </h4>
                            {/* Existing pending requests */}
                            {pendingDocs > 0 && (
                              <div className="mb-2 space-y-1">
                                {check?.requestedDocuments?.filter(d => !d.fulfilledAt).map((d, idx) => (
                                  <div key={idx} className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs">
                                    <p className="font-medium text-red-700">{d?.label}</p>
                                    {d?.description && <p className="text-red-600 mt-0.5">{d?.description}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Staged new requests */}
                            {(requestedDocs[check?._id] || []).map((doc, idx) => (
                              <div key={idx} className="mb-1 flex items-center gap-2 rounded-md border bg-orange-50 px-3 py-1.5 text-xs">
                                <span className="flex-1"><strong>{doc.label}</strong>{doc.description && ` — ${doc.description}`}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-red-500"
                                  onClick={() => removeDocRow(check._id, idx)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            {/* New row input */}
                            <div className="mt-2 flex gap-2">
                              <Input
                                placeholder="Document label *"
                                className="h-8 flex-1 text-sm"
                                value={docLabel[check._id] || ''}
                                onChange={e => setDocLabel(prev => ({ ...prev, [check._id]: e.target.value }))}
                              />
                              <Input
                                placeholder="Description (optional)"
                                className="h-8 flex-1 text-sm"
                                value={docDesc[check._id] || ''}
                                onChange={e => setDocDesc(prev => ({ ...prev, [check._id]: e.target.value }))}
                              />
                              <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={() => addDocRow(check._id)}>
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              className="mt-2"
                              disabled={isActing || (requestedDocs[check._id] || []).length === 0}
                              onClick={() => handleRequestDocs(check)}
                            >
                              <Send className="mr-1.5 h-3.5 w-3.5" /> Send Request
                            </Button>
                          </section>

                          {/* 7. Upload Result */}
                          <section>
                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <Upload className="h-3.5 w-3.5" /> Upload Result
                            </h4>
                            {/* Existing result documents */}
                            {check?.resultDocuments && check?.resultDocuments?.length > 0 && (
                              <div className="mb-2 space-y-1">
                                {check?.resultDocuments?.map((rd, idx) => (
                                  <div key={idx} className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs">
                                    <span className="truncate text-green-800">{rd.originalName || rd.filename}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs text-green-700"
                                      onClick={() =>
                                        window.open(
                                          `${apiBase}/uploads/checks/${check?._id}/results/${rd?.filename}`,
                                          '_blank'
                                        )
                                      }
                                    >
                                      <Download className="mr-1 h-3 w-3" /> View
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="space-y-2">
                              <Input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                className="h-8 cursor-pointer text-sm"
                                onChange={e => {
                                  const file = e.target.files?.[0] ?? null
                                  setResultFile(prev => ({ ...prev, [check._id]: file }))
                                }}
                              />
                              <Textarea
                                placeholder="Result summary (visible to applicant)…"
                                className="min-h-[60px] text-sm"
                                value={resultSummary[check._id] || ''}
                                onChange={e => setResultSummary(prev => ({ ...prev, [check._id]: e.target.value }))}
                              />
                              <Select
                                value={resultStatus[check._id] || 'pending'}
                                onValueChange={val =>
                                  setResultStatus(prev => ({ ...prev, [check._id]: val as 'clear' | 'flagged' | 'pending' }))
                                }
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Result status…" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="clear">Clear</SelectItem>
                                  <SelectItem value="flagged">Flagged</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                disabled={isActing || !resultFile[check._id]}
                                onClick={() => handleUploadResult(check)}
                              >
                                {isActing ? (
                                  <span className="border-white h-3 w-3 animate-spin rounded-full border-b-2 inline-block mr-1" />
                                ) : (
                                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                                )}
                                Upload Result
                              </Button>
                            </div>
                          </section>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ChecksReviewPanel
