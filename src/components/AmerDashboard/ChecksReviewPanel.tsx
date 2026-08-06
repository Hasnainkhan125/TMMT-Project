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
  RefreshCw,
  Filter,
  Search,
  User,
  Calendar,
  DollarSign,
  Paperclip,
  Check,
  AlertTriangle,
  FileCheck,
  Clock as ClockIcon,
  Eye,
  Image as ImageIcon,
  FileWarning,
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
import { cn } from '@/lib/utils'

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

interface Check {
  _id: string
  serviceType: string
  status: string
  createdAt: string
  isFreeService: boolean
  amount?: number
  identifiers?: Record<string, string>
  attachments?: Array<{ originalName?: string; filename?: string; path?: string }>
  requestedDocuments?: Array<{ label: string; description: string; fulfilledAt?: string }>
  resultDocuments?: Array<{ filename: string; originalName?: string }>
  resultSummary?: string
  resultStatus?: string
  userId?: { email?: string; _id?: string } | string
  comments?: Array<{ text: string; author?: string; createdAt: string; role?: string }>
}

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-300', icon: Clock },
  submitted: { label: 'Submitted', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-300', icon: Clock },
  processing: { label: 'Processing', color: 'text-indigo-700', bg: 'bg-indigo-100 border-indigo-300', icon: Clock },
  reviewing: { label: 'Under Review', color: 'text-orange-700', bg: 'bg-orange-100 border-orange-300', icon: AlertCircle },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300', icon: CheckCircle },
  requires_documents: { label: 'Docs Required', color: 'text-rose-700', bg: 'bg-rose-100 border-rose-300', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'text-gray-600', bg: 'bg-gray-100 border-gray-300', icon: X },
  failed: { label: 'Failed', color: 'text-red-700', bg: 'bg-red-100 border-red-300', icon: AlertCircle },
  draft: { label: 'Draft', color: 'text-slate-500', bg: 'bg-slate-100 border-slate-300', icon: FileText },
}

function getStatus(key: string) {
  return STATUS_MAP[key] ?? STATUS_MAP.submitted
}

// ─── Document Preview Modal ──────────────────────────────────────────────────

interface DocumentPreviewModalProps {
  url: string
  filename: string
  isOpen: boolean
  onClose: () => void
}

function DocumentPreviewModal({ url, filename, isOpen, onClose }: DocumentPreviewModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(filename)

  useEffect(() => {
    if (!isOpen || !isImage) return

    setLoading(true)
    setError(null)

    const token = localStorage.getItem('authToken') || ''

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.blob()
      })
      .then(blob => {
        if (!blob.type.startsWith('image/')) {
          setImageUrl(url)
          setLoading(false)
          return
        }
        const blobUrl = URL.createObjectURL(blob)
        setImageUrl(blobUrl)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load image:', err)
        setError(err.message || 'Failed to load image')
        setLoading(false)
        setImageUrl(url)
      })

    return () => {
      if (imageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [url, isImage, isOpen])

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('authToken') || ''
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
      toast.success('Download started')
    } catch (error) {
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Download started')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{filename}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="relative h-12 w-12">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-6 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <p className="text-red-600 dark:text-red-400 font-medium">Failed to load preview</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{error}</p>
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(url, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                    Open in New Tab
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    className="gap-2 bg-primary text-white hover:bg-primary/90"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            {isImage && imageUrl && !loading && !error && (
              <img
                src={imageUrl}
                alt={filename}
                className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"
                onError={() => {
                  setError('Failed to render image')
                  setLoading(false)
                }}
              />
            )}

            {!isImage && !loading && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <FileText className="h-16 w-16 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  This file type cannot be previewed directly.
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Please download to view the file.
                </p>
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(url, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                    Open in New Tab
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    className="gap-2 bg-primary text-white hover:bg-primary/90"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function ExternalLinkIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

const ChecksReviewPanel: React.FC = () => {
  const { t } = useTranslation()

  const [checks, setChecks] = useState<Check[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewFilename, setPreviewFilename] = useState<string>('')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const [newStatus, setNewStatus] = useState<Record<string, string>>({})
  const [statusNote, setStatusNote] = useState<Record<string, string>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [requestedDocs, setRequestedDocs] = useState<Record<string, RequestedDoc[]>>({})
  const [docLabel, setDocLabel] = useState<Record<string, string>>({})
  const [docDesc, setDocDesc] = useState<Record<string, string>>({})

  const [resultFile, setResultFile] = useState<Record<string, File | null>>({})
  const [resultSummary, setResultSummary] = useState<Record<string, string>>({})
  const [resultStatus, setResultStatus] = useState<Record<string, 'clear' | 'flagged' | 'pending'>>({})

  const checkServerHealth = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      })
      setServerAvailable(res.ok)
      return res.ok
    } catch {
      setServerAvailable(false)
      return false
    }
  }, [])

  const fetchChecks = useCallback(async () => {
    setLoading(true)
    setError(null)

    const isServerUp = await checkServerHealth()
    if (!isServerUp) {
      setError('Server is not available. Please make sure the backend is running.')
      setLoading(false)
      return
    }

    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      const url = `${apiBase}/api/v1/checks${params}`

      const res = await fetch(url, {
        headers: authHeaders(),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Failed to load checks: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()

      let checksData = []
      if (data.data?.checks) {
        checksData = data.data.checks
      } else if (data.checks) {
        checksData = data.checks
      } else if (Array.isArray(data)) {
        checksData = data
      } else if (data.data && Array.isArray(data.data)) {
        checksData = data.data
      } else {
        checksData = []
      }

      setChecks(checksData)
    } catch (err: any) {
      console.error('❌ Fetch error:', err)
      setError(err?.message || 'Failed to load checks')
      toast.error(err?.message || t('errors.general'))
    } finally {
      setLoading(false)
    }
  }, [statusFilter, t, checkServerHealth])

  useEffect(() => {
    fetchChecks()
  }, [fetchChecks])

  function setLoading1(id: string, val: boolean) {
    setActionLoading(prev => ({ ...prev, [id]: val }))
  }

  const openPreview = (url: string, filename: string) => {
    setPreviewUrl(url)
    setPreviewFilename(filename)
    setIsPreviewOpen(true)
  }

  const closePreview = () => {
    setIsPreviewOpen(false)
    setPreviewUrl(null)
    setPreviewFilename('')
  }

  async function handleStatusUpdate(check: Check) {
    const id = check._id
    const status = newStatus[id]
    if (!status) { toast.warning('Select a status first'); return }
    setLoading1(id, true)
    try {
      const statusMap: Record<string, string> = {
        'pending': 'pending',
        'processing': 'processing',
        'completed': 'completed',
        'failed': 'failed',
        'reviewing': 'reviewing',
        'requires_documents': 'requires_documents',
        'cancelled': 'cancelled',
        'submitted': 'submitted',
        'draft': 'draft',
      }

      const backendStatus = statusMap[status] || status

      const res = await fetch(`${apiBase}/api/v1/checks/${id}/status`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: backendStatus,
          note: statusNote[id] || ''
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Status update failed: ${res.status} - ${errorText}`)
      }

      toast.success('Status updated successfully')
      setNewStatus(prev => ({ ...prev, [id]: '' }))
      setStatusNote(prev => ({ ...prev, [id]: '' }))
      fetchChecks()
    } catch (err: any) {
      console.error('❌ Status update error:', err)
      toast.error(err?.message || 'Failed to update status')
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

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Comment failed: ${res.status}`)
      }

      toast.success('Comment added successfully')
      setCommentText(prev => ({ ...prev, [id]: '' }))
      fetchChecks()
    } catch (err: any) {
      console.error('❌ Comment error:', err)
      toast.error('Failed to add comment. Please try again.')
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

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Request failed: ${res.status}`)
      }

      toast.success('Document request sent successfully')
      setRequestedDocs(prev => ({ ...prev, [id]: [] }))
      fetchChecks()
    } catch (err: any) {
      console.error('❌ Request docs error:', err)
      toast.error('Failed to send document request. Please try again.')
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
      const formData = new FormData()
      formData.append('resultFiles', file)
      if (resultSummary[id]) {
        formData.append('resultSummary', resultSummary[id])
      }
      if (resultStatus[id]) {
        formData.append('resultStatus', resultStatus[id])
      }

      const res = await fetch(`${apiBase}/api/v1/checks/${id}/result`, {
        method: 'POST',
        headers: {
          ...authHeaders(),
        },
        body: formData,
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Upload failed: ${res.status}`)
      }

      toast.success('Result uploaded successfully')
      setResultFile(prev => ({ ...prev, [id]: null }))
      setResultSummary(prev => ({ ...prev, [id]: '' }))
      fetchChecks()
    } catch (err: any) {
      console.error('❌ Upload result error:', err)
      toast.error('Failed to upload result. Please try again.')
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

  const userEmail = (check: Check): string => {
    if (!check.userId) return 'Unknown'
    if (typeof check.userId === 'string') return check.userId
    return check.userId.email || check.userId._id || 'Unknown'
  }

  const getAvailableStatuses = (currentStatus: string) => {
    const allStatuses = [
      { value: 'pending', label: 'Pending' },
      { value: 'processing', label: 'Processing' },
      { value: 'reviewing', label: 'Under Review' },
      { value: 'requires_documents', label: 'Requires Documents' },
      { value: 'completed', label: 'Completed' },
      { value: 'failed', label: 'Failed' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'draft', label: 'Draft' },
    ]
    return allStatuses.filter(s => s.value !== currentStatus)
  }

  const filteredChecks = checks.filter(check => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      check.serviceType?.toLowerCase().includes(searchLower) ||
      check._id?.toLowerCase().includes(searchLower) ||
      userEmail(check).toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="">
{/* ─── Modern Header ──────────────────────────────────────────────── */}
<Card className="border-0 bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-800/80 shadow-sm backdrop-blur-sm">
  <CardContent className="p-4 sm:p-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Left side – Icon + Title + Description */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-2 text-white ">
          <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-5" />
        </div>
        <div>
               <h4 className="text-base sm:text-lg md:text-2xl">Immigration Status Checks</h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Review and process submitted status check inquiries
          </p>
        </div>
      </div>

      {/* Right side – Search + Filter + Refresh */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-[180px] sm:flex-none">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search checks..."
            className="h-9 w-full pl-9 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:w-48 md:w-60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-full border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:w-44">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="reviewing">Under Review</SelectItem>
            <SelectItem value="requires_documents">Docs Required</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchChecks}
          disabled={loading}
          className="h-9 gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
      {/* ─── Error State ───────────────────────────────────────────────────── */}
      {error && (
        <Card className="border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/50">
          <CardContent className="py-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-rose-500" />
            <p className="text-lg font-semibold text-rose-700 dark:text-rose-400">Failed to load checks</p>
            <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchChecks}
              className="mt-4 border-rose-300 bg-white text-rose-700 hover:bg-rose-100 hover:text-rose-900 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-400 dark:hover:bg-rose-900/30"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ─── Server Unavailable ────────────────────────────────────────────── */}
      {serverAvailable === false && !error && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
          <CardContent className="py-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
            <p className="text-lg font-semibold text-amber-700 dark:text-amber-400">Server Unavailable</p>
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-300">
              Please make sure the backend server is running on port 5001
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchChecks}
              className="mt-4 border-amber-300 bg-white text-amber-700 hover:bg-amber-100 hover:text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400 dark:hover:bg-amber-900/30"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ─── Checks List ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
            <div className="absolute inset-0 rounded-full animate-spin border-4 border-t-blue-600"></div>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Loading checks…</p>
        </div>
      ) : filteredChecks.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <CardContent className="py-16 text-center">
            <ShieldCheck className="mx-auto mb-4 h-14 w-14 text-slate-300 dark:text-slate-600" />
            <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">No checks found</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
              {statusFilter !== 'all' ? 'Try changing the status filter.' : 'No submissions yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredChecks.map(check => {
            const s = getStatus(check.status)
            const StatusIcon = s.icon
            const isExpanded = expandedId === check._id
            const isActing = actionLoading[check._id] || false
            const attachCount = check.attachments?.length || 0
            const checkRequestedDocs = check.requestedDocuments || []
            const pendingDocs = checkRequestedDocs.filter(d => !d.fulfilledAt).length || 0
            const fulfilledDocs = checkRequestedDocs.filter(d => d.fulfilledAt).length || 0
            const checkComments = check.comments || []
            const availableStatuses = getAvailableStatuses(check.status)

            return (
              <motion.div
                key={check._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={cn(
                    "border bg-white transition-all duration-300 dark:bg-slate-900",
                    isExpanded 
                      ? "border-blue-300 shadow-md dark:border-blue-700" 
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  )}
                >
                  <CardContent className="p-3 sm:p-5">
                    {/* ─── Header ──────────────────────────────────────────── */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                        <div className={cn("mt-0.5 rounded-xl border p-2", s.bg)}>
                          <StatusIcon className={cn("h-4 w-4 sm:h-5 sm:w-5", s.color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                              {check?.serviceType || 'Check'}
                            </p>
                            <Badge variant="outline" className="bg-slate-50 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              #{check?._id?.slice(-6)?.toUpperCase()}
                            </Badge>
                            <Badge className={cn("border text-xs font-medium", s.color, s.bg)}>
                              {s.label}
                            </Badge>
                            {pendingDocs > 0 && (
                              <Badge className="border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">
                                <FileWarning className="mr-1 h-3 w-3" />
                                {pendingDocs} pending
                              </Badge>
                            )}
                            {fulfilledDocs > 0 && (
                              <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <Check className="mr-1 h-3 w-3" />
                                {fulfilledDocs} fulfilled
                              </Badge>
                            )}
                            {check.resultDocuments && check.resultDocuments.length > 0 && (
                              <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <FileCheck className="mr-1 h-3 w-3" />
                                Result uploaded
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 sm:gap-3">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {userEmail(check)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(check?.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {check?.isFreeService ? 'Free' : `AED ${check?.amount ?? 0}`}
                            </span>
                            {attachCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                {attachCount} attachment{attachCount > 1 ? 's' : ''}
                              </span>
                            )}
                            {checkComments.length > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3 text-blue-500" />
                                {checkComments.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 shrink-0 rounded-full p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => setExpandedId(isExpanded ? null : check?._id)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* ─── Expanded Content ────────────────────────────────── */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          key="expanded"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-6 border-t border-slate-200 pt-4 dark:border-slate-700 sm:mt-5 sm:pt-5">
                            {/* Identifiers */}
                            {check?.identifiers && Object.keys(check?.identifiers).length > 0 && (
                              <section>
                                <h4 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  <FileText className="h-4 w-4" /> Identifiers
                                </h4>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                  {Object.entries(check?.identifiers).map(([k, v]) => {
                                    if (typeof v === 'object') {
                                      return (
                                        <div key={k} className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                          <p className="font-medium break-all">{JSON.stringify(v) || '—'}</p>
                                        </div>
                                      )
                                    }
                                    return (
                                      <div key={k} className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                        <p className="font-medium break-all">{v?.toString() || '—'}</p>
                                      </div>
                                    )
                                  })}
                                </div>
                              </section>
                            )}

                            {/* ─── REQUESTED DOCUMENTS ─────────────────────────────── */}
                            <section>
                              <h4 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <FileWarning className="h-4 w-4 text-rose-500" /> 
                                Requested Documents
                                {checkRequestedDocs.length > 0 && (
                                  <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                                    ({pendingDocs} pending, {fulfilledDocs} fulfilled)
                                  </span>
                                )}
                              </h4>
                              
                              {checkRequestedDocs.length > 0 ? (
                                <div className="mb-3 space-y-2">
                                  {checkRequestedDocs.map((doc, idx) => {
                                    const isFulfilled = !!doc.fulfilledAt
                                    return (
                                      <div 
                                        key={idx} 
                                        className={cn(
                                          "flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between",
                                          isFulfilled 
                                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800" 
                                            : "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800"
                                        )}
                                      >
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <FileText className={cn(
                                              "h-4 w-4",
                                              isFulfilled ? "text-emerald-500" : "text-rose-500"
                                            )} />
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                              {doc.label}
                                            </p>
                                          </div>
                                          {doc.description && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 ml-6">
                                              {doc.description}
                                            </p>
                                          )}
                                          <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-6 mt-0.5">
                                            {isFulfilled ? `✅ Fulfilled` : `⏳ Pending`}
                                          </p>
                                        </div>
                                        <Badge className={cn(
                                          "text-xs shrink-0",
                                          isFulfilled 
                                            ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400" 
                                            : "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-400"
                                        )}>
                                          {isFulfilled ? 'Fulfilled' : 'Pending'}
                                        </Badge>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className="mb-3 p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 text-center">
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    No documents have been requested yet.
                                  </p>
                                </div>
                              )}

                              {/* New document request form */}
                              {(requestedDocs[check?._id] || []).length > 0 && (
                                <div className="mb-2">
                                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Pending requests to send:</p>
                                  {requestedDocs[check?._id]?.map((doc, idx) => (
                                    <div key={idx} className="mb-1.5 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs dark:border-orange-800 dark:bg-orange-950/50">
                                      <span className="flex-1 text-slate-700 dark:text-slate-300">
                                        <strong>{doc.label}</strong>{doc.description && ` — ${doc.description}`}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-rose-500 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900/30"
                                        onClick={() => removeDocRow(check._id, idx)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                <Input
                                  placeholder="Document label *"
                                  className="h-9 flex-1 border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                  value={docLabel[check._id] || ''}
                                  onChange={e => setDocLabel(prev => ({ ...prev, [check._id]: e.target.value }))}
                                />
                                <Input
                                  placeholder="Description (optional)"
                                  className="h-9 flex-1 border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                  value={docDesc[check._id] || ''}
                                  onChange={e => setDocDesc(prev => ({ ...prev, [check._id]: e.target.value }))}
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-9 shrink-0 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                  onClick={() => addDocRow(check._id)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                className="mt-2 w-full gap-2 bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 sm:w-auto"
                                disabled={isActing || (requestedDocs[check._id] || []).length === 0}
                                onClick={() => handleRequestDocs(check)}
                              >
                                <Send className="h-4 w-4" /> Send Request
                              </Button>
                            </section>

                            {/* ─── COMMENTS ─────────────────────────────────────────── */}
                            {checkComments.length > 0 && (
                              <section>
                                <h4 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  <MessageSquare className="h-4 w-4 text-blue-500" /> 
                                  Comments ({checkComments.length})
                                </h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                  {checkComments.map((comment, idx) => (
                                    <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs font-medium text-slate-900 dark:text-white">
                                          {comment.role || comment.author || 'Officer'}
                                        </p>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                          {new Date(comment.createdAt).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                                        {comment.text}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </section>
                            )}

                            {/* ─── Attachments ───────────────────────────────────────── */}
                            {attachCount > 0 && (
                              <section>
                                <h4 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  <Upload className="h-4 w-4" /> Attachments ({attachCount})
                                </h4>
                                <div className="space-y-1.5">
                                  {check?.attachments?.map((att, idx) => {
                                    const fileUrl = `${apiBase}/uploads/checks/${check._id}/${att.filename || att.path}`
                                    
                                    return (
                                      <div key={idx} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between">
                                        <span className="truncate text-slate-700 dark:text-slate-300">
                                          {att.originalName || att.filename || `File ${idx + 1}`}
                                        </span>
                                        <div className="flex gap-1">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 border-slate-300 text-xs hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                                            onClick={() => openPreview(fileUrl, att.originalName || att.filename || `File ${idx + 1}`)}
                                          >
                                            <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 border-slate-300 text-xs hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                                            onClick={async () => {
                                              try {
                                                const token = localStorage.getItem('authToken') || ''
                                                const response = await fetch(fileUrl, {
                                                  headers: { Authorization: `Bearer ${token}` },
                                                })
                                                if (!response.ok) throw new Error('Download failed')
                                                const blob = await response.blob()
                                                const blobUrl = URL.createObjectURL(blob)
                                                const link = document.createElement('a')
                                                link.href = blobUrl
                                                link.download = att.originalName || att.filename || 'file'
                                                document.body.appendChild(link)
                                                link.click()
                                                document.body.removeChild(link)
                                                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
                                                toast.success('Download started')
                                              } catch {
                                                const link = document.createElement('a')
                                                link.href = fileUrl
                                                link.download = att.originalName || att.filename || 'file'
                                                link.target = '_blank'
                                                document.body.appendChild(link)
                                                link.click()
                                                document.body.removeChild(link)
                                                toast.success('Download started')
                                              }
                                            }}
                                          >
                                            <Download className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </section>
                            )}

                            <div className="border-t border-slate-200 dark:border-slate-700 " />

                   {/* ─── Status Update ───────────────────────────────────── */}
<section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition dark:border-slate-700/80 dark:bg-slate-800/90 dark:shadow-slate-700/20">
  <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
    <CheckCircle className="h-4 w-4 text-blue-500" />
    Update Status
  </h4>

  <div className="space-y-4">
    {/* Status selector with coloured dots */}
    <div>
      <Select
        value={newStatus[check._id] || ''}
        onValueChange={(val) =>
          setNewStatus((prev) => ({ ...prev, [check._id]: val }))
        }
      >
        <SelectTrigger className="h-11 w-full border-slate-200 bg-white text-sm font-medium text-slate-900 transition hover:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-blue-500">
          <SelectValue placeholder="Choose a new status…" />
        </SelectTrigger>
        <SelectContent>
          {availableStatuses.map((status) => {
            // Map each status to a dot colour (Tailwind bg classes)
            const dotColorClass =
              {
                pending: 'bg-amber-500',
                processing: 'bg-blue-500',
                reviewing: 'bg-orange-500',
                completed: 'bg-emerald-500',
                requires_documents: 'bg-rose-500',
                cancelled: 'bg-slate-400',
                failed: 'bg-red-500',
                submitted: 'bg-indigo-500',
                draft: 'bg-slate-300',
              }[status.value] || 'bg-slate-400'

            return (
              <SelectItem
                key={status.value}
                value={status.value}
                className="flex items-center gap-2"
              >
                <span
                  className={cn(
                    'inline-block h-2.5 w-2.5 rounded-full ring-1 ring-black/10 dark:ring-white/20',
                    dotColorClass
                  )}
                />
                {status.label}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {/* Show current selection with a dot preview */}
      {newStatus[check._id] && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <span
            className={cn(
              'inline-block h-2 w-2 rounded-full',
              {
                'bg-amber-500': newStatus[check._id] === 'pending',
                'bg-blue-500': newStatus[check._id] === 'processing',
                'bg-orange-500': newStatus[check._id] === 'reviewing',
                'bg-emerald-500': newStatus[check._id] === 'completed',
                'bg-rose-500': newStatus[check._id] === 'requires_documents',
                'bg-slate-400': newStatus[check._id] === 'cancelled',
                'bg-red-500': newStatus[check._id] === 'failed',
                'bg-indigo-500': newStatus[check._id] === 'submitted',
                'bg-slate-300': newStatus[check._id] === 'draft',
              }[newStatus[check._id]] || 'bg-slate-400'
            )}
          />
          Selected: <span className="font-medium text-slate-700 dark:text-slate-300">
            {availableStatuses.find((s) => s.value === newStatus[check._id])?.label}
          </span>
        </p>
      )}
    </div>

    {/* Note input with character counter */}
    <div>
      <Textarea
        placeholder="Add a note (optional)…"
        className="min-h-[72px] resize-none border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
        value={statusNote[check._id] || ''}
        onChange={(e) =>
          setStatusNote((prev) => ({ ...prev, [check._id]: e.target.value }))
        }
        maxLength={200}
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>Optional</span>
        <span>{(statusNote[check._id] || '').length}/200</span>
      </div>
    </div>

    {/* Action button with gradient & hover scale */}
    <Button
      size="sm"
      disabled={isActing || !newStatus[check._id]}
      onClick={() => handleStatusUpdate(check)}
      className="relative w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-60 disabled:hover:scale-100 dark:from-blue-500 dark:to-indigo-500 sm:w-auto"
    >
      {isActing ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Updating…
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4" />
          Update Status
        </>
      )}
    </Button>
  </div>
</section>
                            {/* ─── Add Comment ────────────────────────────────────── */}
                            <section>
                              <h4 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <MessageSquare className="h-4 w-4" /> Add Comment
                              </h4>
                              <div className="space-y-2">
                                <Textarea
                                  placeholder="Write a comment visible to the applicant…"
                                  className="min-h-[60px] resize-none border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                  value={commentText[check._id] || ''}
                                  onChange={e => setCommentText(prev => ({ ...prev, [check._id]: e.target.value }))}
                                />
                                <Button
                                  size="sm"
                                  disabled={isActing || !commentText[check._id]?.trim()}
                                  onClick={() => handleAddComment(check)}
                                  className="w-full gap-2 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 sm:w-auto"
                                >
                                  <Send className="h-4 w-4" /> Send Comment
                                </Button>
                              </div>
                            </section>

                            {/* ─── Upload Result ───────────────────────────────────── */}
                            <section>
                              <h4 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <Upload className="h-4 w-4" /> Upload Result
                              </h4>
                              {check?.resultDocuments && check?.resultDocuments?.length > 0 && (
                                <div className="mb-3 space-y-1.5">
                                  {check?.resultDocuments?.map((rd, idx) => {
                                    const fileUrl = `${apiBase}/uploads/checks/${check._id}/results/${rd.filename}`
                                    
                                    return (
                                      <div key={idx} className="flex flex-col gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs dark:border-emerald-800 dark:bg-emerald-950/50 sm:flex-row sm:items-center sm:justify-between">
                                        <span className="truncate text-emerald-700 dark:text-emerald-400">
                                          {rd.originalName || rd.filename}
                                        </span>
                                        <div className="flex gap-1">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 border-emerald-300 text-xs text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                                            onClick={() => openPreview(fileUrl, rd.originalName || rd.filename)}
                                          >
                                            <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 border-emerald-300 text-xs text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                                            onClick={async () => {
                                              try {
                                                const token = localStorage.getItem('authToken') || ''
                                                const response = await fetch(fileUrl, {
                                                  headers: { Authorization: `Bearer ${token}` },
                                                })
                                                if (!response.ok) throw new Error('Download failed')
                                                const blob = await response.blob()
                                                const blobUrl = URL.createObjectURL(blob)
                                                const link = document.createElement('a')
                                                link.href = blobUrl
                                                link.download = rd.originalName || rd.filename
                                                document.body.appendChild(link)
                                                link.click()
                                                document.body.removeChild(link)
                                                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
                                                toast.success('Download started')
                                              } catch {
                                                const link = document.createElement('a')
                                                link.href = fileUrl
                                                link.download = rd.originalName || rd.filename
                                                link.target = '_blank'
                                                document.body.appendChild(link)
                                                link.click()
                                                document.body.removeChild(link)
                                                toast.success('Download started')
                                              }
                                            }}
                                          >
                                            <Download className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                              <div className="space-y-3">
                                <Input
                                  type="file"
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  className="h-9 w-full cursor-pointer border-slate-200 bg-white text-sm text-slate-900 file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:file:bg-slate-700 dark:file:text-slate-300"
                                  onChange={e => {
                                    const file = e.target.files?.[0] ?? null
                                    setResultFile(prev => ({ ...prev, [check._id]: file }))
                                  }}
                                />
                                <Textarea
                                  placeholder="Result summary (visible to applicant)…"
                                  className="min-h-[60px] resize-none border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                  value={resultSummary[check._id] || ''}
                                  onChange={e => setResultSummary(prev => ({ ...prev, [check._id]: e.target.value }))}
                                />
                                <Select
                                  value={resultStatus[check._id] || 'pending'}
                                  onValueChange={val =>
                                    setResultStatus(prev => ({ ...prev, [check._id]: val as 'clear' | 'flagged' | 'pending' }))
                                  }
                                >
                                  <SelectTrigger className="h-9 w-full border-slate-200 bg-white text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                    <SelectValue placeholder="Result status…" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="clear">
                                      <span className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-500" /> Clear
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="flagged">
                                      <span className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" /> Flagged
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="pending">
                                      <span className="flex items-center gap-2">
                                        <ClockIcon className="h-4 w-4 text-slate-400" /> Pending
                                      </span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  disabled={isActing || !resultFile[check._id]}
                                  onClick={() => handleUploadResult(check)}
                                  className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 sm:w-auto"
                                >
                                  {isActing ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  ) : (
                                    <Upload className="h-4 w-4" />
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
              </motion.div>
            )
          })}
        </div>
      )}

      <DocumentPreviewModal
        url={previewUrl || ''}
        filename={previewFilename}
        isOpen={isPreviewOpen}
        onClose={closePreview}
      />
    </div>
  )
}

export default ChecksReviewPanel