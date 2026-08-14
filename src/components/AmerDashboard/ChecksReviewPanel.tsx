import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  MoreVertical,
  ExternalLink,
  Copy,
  Sparkles,
  Layers,
  MessageCircle,
  Hash,
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

interface Comment {
  _id?: string
  text: string
  author?: string
  createdAt: string
  role?: string
  by?: 'admin' | 'customer' | 'system'
  authorName?: string
  isAdmin?: boolean
  isUser?: boolean
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
  documents?: Array<{
    filename: string
    originalName?: string
    path?: string
    mimeType?: string
    size?: number
  }>
  requestedDocuments?: Array<{ 
    _id?: string
    label: string
    description: string
    fulfilledAt?: string
    status?: string
  }>
  resultDocuments?: Array<{ filename: string; originalName?: string; path?: string }>
  resultSummary?: string
  resultStatus?: string
  userId?: { email?: string; _id?: string } | string
  comments?: Comment[]
}

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ElementType; glow: string }> = {
  pending: { 
    label: 'Pending', 
    color: 'text-amber-600', 
    bg: 'bg-amber-50 border-amber-200', 
    icon: Clock,
    glow: 'shadow-amber-500/20'
  },
  submitted: { 
    label: 'Submitted', 
    color: 'text-blue-600', 
    bg: 'bg-blue-50 border-blue-200', 
    icon: Clock,
    glow: 'shadow-blue-500/20'
  },
  processing: { 
    label: 'Processing', 
    color: 'text-indigo-600', 
    bg: 'bg-indigo-50 border-indigo-200', 
    icon: Clock,
    glow: 'shadow-indigo-500/20'
  },
  reviewing: { 
    label: 'Under Review', 
    color: 'text-orange-600', 
    bg: 'bg-orange-50 border-orange-200', 
    icon: AlertCircle,
    glow: 'shadow-orange-500/20'
  },
  completed: { 
    label: 'Completed', 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50 border-emerald-200', 
    icon: CheckCircle,
    glow: 'shadow-emerald-500/20'
  },
  requires_documents: { 
    label: 'Docs Required', 
    color: 'text-rose-600', 
    bg: 'bg-rose-50 border-rose-200', 
    icon: AlertCircle,
    glow: 'shadow-rose-500/20'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'text-slate-600', 
    bg: 'bg-slate-50 border-slate-200', 
    icon: X,
    glow: 'shadow-slate-500/20'
  },
  failed: { 
    label: 'Failed', 
    color: 'text-red-600', 
    bg: 'bg-red-50 border-red-200', 
    icon: AlertCircle,
    glow: 'shadow-red-500/20'
  },
  draft: { 
    label: 'Draft', 
    color: 'text-slate-500', 
    bg: 'bg-slate-50 border-slate-200', 
    icon: FileText,
    glow: 'shadow-slate-500/20'
  },
}

function getStatus(key: string) {
  return STATUS_MAP[key] ?? STATUS_MAP.submitted
}

// ─── Helper: Get document URL ──────────────────────────────────────────────
function getDocumentUrl(checkId: string, doc: { filename: string; path?: string }): string {
  const apiBaseLocal = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'
  
  if (doc.path) {
    if (doc.path.startsWith('http')) return doc.path
    if (doc.path.startsWith('/')) {
      if (doc.path.startsWith('/api/v1/')) {
        return `${apiBaseLocal}${doc.path}`
      }
      if (doc.path.startsWith('/uploads/')) {
        return `${apiBaseLocal}/api/v1${doc.path}`
      }
      return `${apiBaseLocal}${doc.path}`
    }
    if (doc.path.includes('uploads')) {
      return `${apiBaseLocal}/${doc.path}`
    }
    return `${apiBaseLocal}/uploads/checks/${doc.filename}`
  }
  return `${apiBaseLocal}/uploads/checks/${doc.filename}`
}

// ─── Helper: Get result document URL ──────────────────────────────────────
function getResultDocumentUrl(filename: string): string {
  const apiBaseLocal = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'
  return `${apiBaseLocal}/uploads/checks/${filename}`
}

// ─── Helper: Check if image ────────────────────────────────────────────────
function isImageFile(filename: string): boolean {
  if (!filename) return false
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(filename)
}

// ─── Document Thumbnail Component - SMALL ──────────────────────────────────

interface DocumentThumbnailProps {
  doc: { filename: string; originalName?: string; path?: string; mimeType?: string; size?: number }
  checkId: string
  onPreview: (url: string, filename: string) => void
  onDownload: (url: string, filename: string) => void
}

function DocumentThumbnail({ doc, checkId, onPreview, onDownload }: DocumentThumbnailProps) {
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0)
  
  const filename = doc.originalName || doc.filename || 'file'
  const isImage = isImageFile(filename)
  
  // Build multiple URL options
  const apiBaseLocal = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'
  const possibleUrls: string[] = []
  
  if (doc.path) {
    if (doc.path.startsWith('http://') || doc.path.startsWith('https://')) {
      possibleUrls.push(doc.path)
    } else if (doc.path.startsWith('/uploads/')) {
      possibleUrls.push(`${apiBaseLocal}${doc.path}`)
      possibleUrls.push(`${apiBaseLocal}/api/v1${doc.path}`)
    } else if (doc.path.startsWith('/')) {
      possibleUrls.push(`${apiBaseLocal}${doc.path}`)
    } else {
      possibleUrls.push(`${apiBaseLocal}/${doc.path}`)
    }
  }
  
  // Add fallback URLs
  if (doc.filename) {
    possibleUrls.push(`${apiBaseLocal}/uploads/checks/${doc.filename}`)
    possibleUrls.push(`${apiBaseLocal}/uploads/${doc.filename}`)
    possibleUrls.push(`${apiBaseLocal}/uploads/checks/${checkId}/${doc.filename}`)
    possibleUrls.push(`${apiBaseLocal}/api/v1/uploads/checks/${doc.filename}`)
  }
  
  // Remove duplicates
  const uniqueUrls = [...new Set(possibleUrls)]
  const currentUrl = uniqueUrls[currentUrlIndex] || uniqueUrls[0] || ''
  
  const handleClick = () => {
    if (currentUrl) {
      onPreview(currentUrl, filename)
    }
  }
  
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentUrl) {
      onDownload(currentUrl, filename)
    }
  }

  const handleImageError = () => {
    console.error('❌ Image failed to load:', currentUrl)
    // Try next URL if available
    if (currentUrlIndex < uniqueUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1)
      setLoading(true)
      console.log('🔄 Trying next URL:', uniqueUrls[currentUrlIndex + 1])
    } else {
      setImageError(true)
      setLoading(false)
    }
  }

  return (
    <div 
      className="relative rounded border border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 overflow-hidden cursor-pointer hover:border-[#0a3269] dark:hover:border-[#0a3269]/50 transition-colors"
      onClick={handleClick}
      title={`Click to preview: ${filename}`}
    >
      {/* Thumbnail Area - SMALL */}
      <div className="relative aspect-square w-full bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
        {isImage && !imageError && currentUrl ? (
          <>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#0a3269] border-t-transparent" />
              </div>
            )}
            <img
              src={currentUrl}
              alt={filename}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                loading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => {
                console.log('✅ Image loaded:', currentUrl)
                setLoading(false)
              }}
              onError={handleImageError}
              loading="lazy"
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <FileText className="h-5 w-5 text-slate-300 dark:text-slate-600" />
            {!isImage && filename && (
              <p className="text-[5px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-full px-0.5">
                {filename.split('.').pop()?.toUpperCase() || 'FILE'}
              </p>
            )}
            {imageError && (
              <p className="text-[5px] text-red-400 mt-0.5">Failed to load</p>
            )}
          </div>
        )}
        
        {/* Download button - small, always visible */}
        <button
          onClick={handleDownloadClick}
          className="absolute bottom-0.5 right-0.5 p-0.5 rounded bg-black/50 text-white hover:bg-black/70 transition-colors"
          title="Download"
        >
          <Download className="h-2.5 w-2.5" />
        </button>
      </div>
      
      {/* Filename - EXTRA SMALL */}
      <div className="p-0.5 truncate text-center">
        <p className="text-[6px] font-medium text-slate-600 dark:text-slate-400 truncate" title={filename}>
          {filename.length > 12 ? filename.slice(0, 10) + '…' : filename}
        </p>
        {doc.size && (
          <p className="text-[5px] text-slate-400 dark:text-slate-500">
            {(doc.size / 1024).toFixed(0)}KB
          </p>
        )}
      </div>
    </div>
  )
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
  const isImage = isImageFile(filename)
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0)

  useEffect(() => {
    if (!isOpen || !isImage) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setCurrentUrlIndex(0)

    const token = localStorage.getItem('authToken') || ''
    const apiBaseLocal = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'
    
    // Extract filename from URL for fallback
    const urlParts = url.split('/')
    const filenameFromUrl = urlParts[urlParts.length - 1]
    
    // Build multiple URL options
    const urlsToTry = [
      url,
      `${apiBaseLocal}/uploads/checks/${filenameFromUrl}`,
      `${apiBaseLocal}/uploads/${filenameFromUrl}`,
      `${apiBaseLocal}/uploads/checks/${filenameFromUrl}`,
      `${apiBaseLocal}/api/v1/uploads/checks/${filenameFromUrl}`,
    ]
    
    console.log('🔍 Preview - Trying URLs:', urlsToTry)
    
    let currentTry = 0
    
    const tryFetch = (urlIndex: number) => {
      if (urlIndex >= urlsToTry.length) {
        console.error('❌ All URLs failed for preview')
        setError('Failed to load image after multiple attempts')
        setLoading(false)
        setImageUrl(url)
        return
      }
      
      const currentUrl = urlsToTry[urlIndex]
      console.log(`📥 Preview attempt ${urlIndex + 1}: ${currentUrl}`)
      
      fetch(currentUrl, {
        headers: token ? {
          Authorization: `Bearer ${token}`,
        } : {},
      })
        .then(response => {
          console.log(`📥 Preview response ${urlIndex + 1}:`, { 
            url: currentUrl, 
            status: response.status, 
            ok: response.ok 
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          return response.blob()
        })
        .then(blob => {
          console.log(`📦 Preview blob received:`, { type: blob.type, size: blob.size })
          
          if (!blob.type.startsWith('image/')) {
            setImageUrl(currentUrl)
            setLoading(false)
            return
          }
          
          const blobUrl = URL.createObjectURL(blob)
          setImageUrl(blobUrl)
          setLoading(false)
        })
        .catch(err => {
          console.warn(`❌ Preview attempt ${urlIndex + 1} failed:`, err.message)
          tryFetch(urlIndex + 1)
        })
    }
    
    tryFetch(0)
    
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-700/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-r from-slate-50/50 to-white dark:from-slate-900 dark:to-slate-800/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-[#0a3269] text-white shadow-lg shadow-[#0a3269]/25">
                {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-900 dark:text-white truncate">{filename}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isImage ? 'Image file' : 'Document file'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] bg-slate-50/50 dark:bg-slate-900/50">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#0a3269] animate-spin"></div>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-6 rounded-full bg-rose-100 dark:bg-rose-900/30 mb-4">
                  <AlertCircle className="h-12 w-12 text-rose-500" />
                </div>
                <p className="text-rose-600 dark:text-rose-400 font-medium">Failed to load preview</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{error}</p>
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(url, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    className="gap-2 bg-[#0a3269] text-white shadow-lg shadow-[#0a3269]/25 hover:shadow-[#0a3269]/40"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            {isImage && imageUrl && !loading && !error && (
              <div className="flex items-center justify-center min-h-[200px]">
                <img
                  src={imageUrl}
                  alt={filename}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
                  onError={() => {
                    setError('Failed to render image')
                    setLoading(false)
                  }}
                />
              </div>
            )}

            {!isImage && !loading && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 mb-4 shadow-inner">
                  <FileText className="h-20 w-20 text-slate-400 dark:text-slate-600" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  This file type cannot be previewed directly.
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                  Please download to view the file.
                </p>
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(url, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    className="gap-2 bg-[#0a3269] text-white shadow-lg shadow-[#0a3269]/25 hover:shadow-[#0a3269]/40"
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

// ─── Modern Chat Message Component ──────────────────────────────────────────

interface ChatMessageProps {
  message: Comment
  isAdmin: boolean
}

function ChatMessage({ message, isAdmin }: ChatMessageProps) {
  const senderName = isAdmin ? 'Admin' : (message.authorName || 'User')
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  
  return (
    <div
      className={cn(
        "flex items-start gap-3 mb-3",
        isAdmin ? "justify-start" : "justify-end"
      )}
    >
      {isAdmin && (
        <div className="flex-shrink-0 mt-1">
          <div className="h-8 w-8 rounded-full bg-[#0a3269] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-[#0a3269]/20">
            A
          </div>
        </div>
      )}

      <div
        className={cn(
          "max-w-[75%] sm:max-w-[70%] rounded-2xl px-4 py-3 break-words relative",
          isAdmin
            ? "bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm rounded-tl-none"
            : "bg-[#DCF8C6] dark:bg-[#1E7B4D] rounded-tr-none"
        )}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <p className={cn(
            "text-xs font-semibold",
            isAdmin ? "text-slate-700 dark:text-slate-300" : "text-slate-700 dark:text-white"
          )}>
            {senderName}
          </p>
          {isAdmin ? (
            <span className="text-[8px] bg-[#0a3269] text-white px-2 py-0.5 rounded-full font-medium">
              Admin
            </span>
          ) : (
            <span className="text-[8px] bg-gradient-to-r from-gray-400 to-gray-500 text-white px-2 py-0.5 rounded-full font-medium">
              User
            </span>
          )}
        </div>

        <p className={cn(
          "text-sm leading-relaxed",
          isAdmin ? "text-slate-800 dark:text-slate-200" : "text-slate-800 dark:text-white"
        )}>
          {message.text}
        </p>

        <div className={cn(
          "flex items-center justify-end gap-1 mt-1.5",
          "text-[9px] text-slate-400 dark:text-slate-500"
        )}>
          <span>{time}</span>
          {!isAdmin && (
            <Check className="h-3 w-3 text-blue-500 dark:text-blue-400" />
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="flex-shrink-0 mt-1">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-gray-400/20">
            U
          </div>
        </div>
      )}
    </div>
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

  // ─── Chat states ──────────────────────────────────────────────────────────
  const [showChat, setShowChat] = useState<Record<string, boolean>>({})
  const [chatMessage, setChatMessage] = useState<Record<string, string>>({})
  const [sendingMessage, setSendingMessage] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<Record<string, HTMLDivElement | null>>({})

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

  const handleDownload = async (url: string, filename: string) => {
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
    } catch {
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

  // ─── Handle Add Comment ──────────────────────────────────────────────────
  async function handleAddComment(check: Check) {
    const id = check._id
    const text = commentText[id]?.trim()
    if (!text) { toast.warning('Enter a comment first'); return }
    
    setLoading1(id, true)
    try {
      const res = await fetch(`${apiBase}/api/v1/checks/${id}/comments`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text,
          by: 'admin',
          role: 'admin'
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Comment failed: ${res.status}`)
      }

      toast.success('Comment added successfully')
      setCommentText(prev => ({ ...prev, [id]: '' }))
      fetchChecks()
    } catch (err: any) {
      console.error('❌ Add comment error:', err)
      toast.error('Failed to add comment. Please try again.')
    } finally {
      setLoading1(id, false)
    }
  }

  // ─── Handle Send Chat Message ────────────────────────────────────────────
  async function handleSendChatMessage(check: Check) {
    const id = check._id
    const text = chatMessage[id]?.trim()
    if (!text) { toast.warning('Enter a message first'); return }
    
    setSendingMessage(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch(`${apiBase}/api/v1/checks/${id}/comments`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text,
          by: 'admin',
          role: 'admin',
          authorName: 'Admin'
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Comment failed: ${res.status}`)
      }

      toast.success('Message sent successfully')
      setChatMessage(prev => ({ ...prev, [id]: '' }))
      fetchChecks()
    } catch (err: any) {
      console.error('❌ Send message error:', err)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSendingMessage(prev => ({ ...prev, [id]: false }))
    }
  }

  // ─── Handle Status Update ──────────────────────────────────────────────────
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

      let data
      const responseText = await res.text()
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse response:', responseText)
        throw new Error(`Server returned: ${responseText}`)
      }

      if (!res.ok) {
        throw new Error(data?.message || data?.error || `Status update failed: ${res.status}`)
      }

      toast.success(data?.message || 'Status updated successfully')
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

  // ─── Handle Request Docs ──────────────────────────────────────────────────
  async function handleRequestDocs(check: Check) {
    const id = check._id
    const docs = requestedDocs[id] || []
    if (docs.length === 0) { toast.warning('Add at least one document request'); return }
    
    setLoading1(id, true)
    try {
      const formattedDocs = docs.map(doc => ({
        label: doc.label.trim(),
        description: doc.description?.trim() || ''
      }))

      console.log('📤 Sending document request:', { checkId: id, documents: formattedDocs })

      const res = await fetch(`${apiBase}/api/v1/checks/${id}/request-docs`, {
        method: 'POST',
        headers: { 
          ...authHeaders(), 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ documents: formattedDocs }),
      })

      let data
      const responseText = await res.text()
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse response:', responseText)
        throw new Error(`Server returned: ${responseText}`)
      }

      if (!res.ok) {
        throw new Error(data?.message || data?.error || `Request failed: ${res.status}`)
      }

      toast.success(data?.message || 'Document request sent successfully')
      setRequestedDocs(prev => ({ ...prev, [id]: [] }))
      fetchChecks()
    } catch (err: any) {
      console.error('❌ Request docs error:', err)
      toast.error(err?.message || 'Failed to send document request. Please try again.')
    } finally {
      setLoading1(id, false)
    }
  }

  // ─── Handle Upload Result ──────────────────────────────────────────────────
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

      console.log('📤 Uploading result:', { 
        checkId: id, 
        fileName: file.name,
        resultSummary: resultSummary[id],
        resultStatus: resultStatus[id]
      })

      const res = await fetch(`${apiBase}/api/v1/checks/${id}/result`, {
        method: 'POST',
        headers: {
          ...authHeaders(),
        },
        body: formData,
      })

      let data
      const responseText = await res.text()
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse response:', responseText)
        throw new Error(`Server returned: ${responseText}`)
      }

      if (!res.ok) {
        throw new Error(data?.message || data?.error || `Upload failed: ${res.status}`)
      }

      toast.success(data?.message || 'Result uploaded successfully')
      setResultFile(prev => ({ ...prev, [id]: null }))
      setResultSummary(prev => ({ ...prev, [id]: '' }))
      fetchChecks()
    } catch (err: any) {
      console.error('❌ Upload result error:', err)
      toast.error(err?.message || 'Failed to upload result. Please try again.')
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

  // ─── Get chat messages ──────────────────────────────────────────────────
  const getChatMessages = (check: Check): Comment[] => {
    return check.comments || []
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

  // Stats
  const totalChecks = checks.length
  const pendingChecks = checks.filter(c => c.status === 'pending').length
  const completedChecks = checks.filter(c => c.status === 'completed').length
  const requiresDocsChecks = checks.filter(c => c.status === 'requires_documents').length

  return (
    <div className="space-y-6">
      {/* ─── Modern Header with Stats ──────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-[#0a3269]/20 dark:to-slate-900 p-4 sm:p-6 md:p-8 border border-slate-200/50 dark:border-slate-700/30">
        <div className="relative z-10 flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="rounded-2xl bg-[#0a3269] p-2.5 sm:p-3 shadow-lg shadow-[#0a3269]/20">
              <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div className="min-w-0">
              <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 sm:gap-2">
                <span className="truncate">Immigration Status Checks</span>
              </h4>
              <p className="text-[9px] sm:text-sm text-slate-600 dark:text-slate-300 truncate">
                Review and process submitted status check inquiries
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-4 bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-200/50 dark:border-white/10 shadow-sm dark:shadow-none overflow-x-auto">
              <div className="text-center shrink-0">
                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{totalChecks}</p>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Total</p>
              </div>
              <div className="w-px h-6 sm:h-8 bg-slate-200/50 dark:bg-white/10 shrink-0"></div>
              <div className="text-center shrink-0">
                <p className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">{pendingChecks}</p>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending</p>
              </div>
              <div className="w-px h-6 sm:h-8 bg-slate-200/50 dark:bg-white/10 shrink-0"></div>
              <div className="text-center shrink-0">
                <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedChecks}</p>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Complete</p>
              </div>
              <div className="w-px h-6 sm:h-8 bg-slate-200/50 dark:bg-white/10 shrink-0"></div>
              <div className="text-center shrink-0">
                <p className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400">{requiresDocsChecks}</p>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Docs Needed</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchChecks}
              disabled={loading}
              className="border-slate-200 dark:border-white/20 bg-white/70 dark:bg-white/5 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white backdrop-blur-sm shrink-0 h-9 sm:h-10 px-3 sm:px-4"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-xs sm:text-sm">{loading ? 'Loading...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="relative z-10 mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search by ID, service, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm bg-white/70 dark:bg-white/10 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:border-[#0a3269] focus:ring-[#0a3269]/20 backdrop-blur-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44 md:w-48 h-9 sm:h-10 bg-white/70 dark:bg-white/10 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:border-[#0a3269] focus:ring-[#0a3269]/20 backdrop-blur-sm text-sm">
              <Filter className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 dark:text-slate-500" />
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
        </div>
      </div>

      {/* ─── Error State ───────────────────────────────────────────────────── */}
      {error && (
        <Card className="border-rose-200 bg-rose-50/80 backdrop-blur-sm dark:border-rose-800 dark:bg-rose-950/50">
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
        <Card className="border-amber-200 bg-amber-50/80 backdrop-blur-sm dark:border-amber-800 dark:bg-amber-950/50">
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
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
            <div className="absolute inset-0 rounded-full animate-spin border-4 border-t-[#0a3269]"></div>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Loading checks…</p>
        </div>
      ) : filteredChecks.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/50">
          <CardContent className="py-20 text-center">
            <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
              <ShieldCheck className="h-10 w-10 text-slate-400 dark:text-slate-600" />
            </div>
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
            const docCount = check.documents?.length || 0
            const totalFiles = attachCount + docCount

            const checkRequestedDocs = check.requestedDocuments || []
            const pendingDocs = checkRequestedDocs.filter(d => !d.fulfilledAt).length || 0
            const fulfilledDocs = checkRequestedDocs.filter(d => d.fulfilledAt).length || 0
            const checkComments = check.comments || []
            const availableStatuses = getAvailableStatuses(check.status)
            
            // Chat messages
            const chatMessages = getChatMessages(check)
            const showChatForCheck = showChat[check._id] || false

            return (
              <motion.div
                key={check._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className={cn(
                    "border transition-all duration-300 bg-white/90 backdrop-blur-sm dark:bg-slate-900/90",
                    isExpanded
                      ? "border-[#0a3269] shadow-xl shadow-[#0a3269]/10 dark:border-[#0a3269]"
                      : "border-slate-200/70 hover:border-slate-300 dark:border-slate-700/70 dark:hover:border-slate-600"
                  )}
                >
                  <CardContent className="p-4 sm:p-6">
                    {/* ─── Header ──────────────────────────────────────────── */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                        <div className={cn("mt-0.5 rounded-xl p-2.5 shadow-sm", s.bg)}>
                          <StatusIcon className={cn("h-5 w-5 sm:h-5 sm:w-5", s.color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold text-slate-900 dark:text-white">
                              {check?.serviceType || 'Check'}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              <Hash className="h-3 w-3" />
                              {check?._id?.slice(-6)?.toUpperCase()}
                            </div>
                            <Badge className={cn("border text-xs font-medium px-3 py-1", s.color, s.bg)}>
                              {s.label}
                            </Badge>
                            {pendingDocs > 0 && (
                              <Badge className="border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400 gap-1.5 px-3 py-1">
                                <FileWarning className="h-3 w-3" />
                                {pendingDocs} pending
                              </Badge>
                            )}
                            {fulfilledDocs > 0 && (
                              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 gap-1.5 px-3 py-1">
                                <Check className="h-3 w-3" />
                                {fulfilledDocs} fulfilled
                              </Badge>
                            )}
                            {check.resultDocuments && check.resultDocuments.length > 0 && (
                              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 gap-1.5 px-3 py-1">
                                <FileCheck className="h-3 w-3" />
                                Result uploaded
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                              <User className="h-3 w-3 text-slate-400" />
                              {userEmail(check)}
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              {new Date(check?.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                              <DollarSign className="h-3 w-3 text-slate-400" />
                              {check?.isFreeService ? 'Free' : `AED ${check?.amount ?? 0}`}
                            </span>
                            {totalFiles > 0 && (
                              <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                <Paperclip className="h-3 w-3 text-slate-400" />
                                {totalFiles} attachment{totalFiles > 1 ? 's' : ''}
                              </span>
                            )}
                            {chatMessages.length > 0 && (
                              <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full text-emerald-600 dark:text-emerald-400">
                                <MessageCircle className="h-3 w-3" />
                                {chatMessages.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 shrink-0 rounded-xl p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
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
                          <div className="mt-5 space-y-6 border-t border-slate-200/60 dark:border-slate-700/60 pt-5">
                            {/* Identifiers */}
                            {check?.identifiers && Object.keys(check?.identifiers).length > 0 && (
                              <section>
                                <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <FileText className="h-3.5 w-3.5" />
                                  </div>
                                  Identifiers
                                </h4>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                  {Object.entries(check?.identifiers).map(([k, v]) => {
                                    if (typeof v === 'object') {
                                      return (
                                        <div key={k} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                                          <p className="font-medium break-all">{JSON.stringify(v) || '—'}</p>
                                        </div>
                                      )
                                    }
                                    return (
                                      <div key={k} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                                        <p className="font-medium break-all">{v?.toString() || '—'}</p>
                                      </div>
                                    )
                                  })}
                                </div>
                              </section>
                            )}

                            {/* ─── REQUESTED DOCUMENTS ─────────────────────────────── */}
                            <section>
                              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <div className="p-1 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                                  <FileWarning className="h-3.5 w-3.5 text-rose-500" />
                                </div>
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
                                          "flex flex-col gap-2 rounded-xl border p-3.5 transition-all group",
                                          isFulfilled
                                            ? "bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                                            : "bg-rose-50/70 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800"
                                        )}
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2.5">
                                              <FileText className={cn(
                                                "h-4 w-4",
                                                isFulfilled ? "text-emerald-500" : "text-rose-500"
                                              )} />
                                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {doc.label}
                                              </p>
                                            </div>
                                            {doc.description && (
                                              <p className="text-xs text-slate-500 dark:text-slate-400 ml-7">
                                                {doc.description}
                                              </p>
                                            )}
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-7 mt-1">
                                              {isFulfilled ? '✅ Fulfilled' : '⏳ Pending'}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <Badge className={cn(
                                              "text-xs shrink-0",
                                              isFulfilled
                                                ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-400"
                                            )}>
                                              {isFulfilled ? 'Fulfilled' : 'Pending'}
                                            </Badge>
                                            {!isFulfilled && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={async () => {
                                                  try {
                                                    const updatedRequestedDocs = [...checkRequestedDocs];
                                                    updatedRequestedDocs.splice(idx, 1);
                                                    
                                                    const res = await fetch(`${apiBase}/api/v1/checks/${check._id}`, {
                                                      method: 'PUT',
                                                      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
                                                      body: JSON.stringify({
                                                        requestedDocuments: updatedRequestedDocs
                                                      }),
                                                    });
                                                    
                                                    if (!res.ok) throw new Error('Failed to delete document request');
                                                    
                                                    toast.success('Document request removed');
                                                    fetchChecks();
                                                  } catch (err: any) {
                                                    console.error('❌ Delete error:', err);
                                                    toast.error(err?.message || 'Failed to delete document request');
                                                  }
                                                }}
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className="mb-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/50 dark:bg-slate-800/50 dark:border-slate-700/50 text-center">
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    No documents have been requested yet.
                                  </p>
                                </div>
                              )}

                              {/* New document request form */}
                              {(requestedDocs[check?._id] || []).length > 0 && (
                                <div className="mb-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 dark:bg-amber-950/20 dark:border-amber-800/50">
                                  <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" /> Pending requests to send:
                                  </p>
                                  {requestedDocs[check?._id]?.map((doc, idx) => (
                                    <div key={idx} className="mb-1.5 flex items-center gap-2 rounded-lg border border-amber-200/70 bg-amber-100/50 dark:border-amber-800/50 dark:bg-amber-900/30 px-3 py-2 text-xs">
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
                                <div className="flex-1 relative">
                                  <Input
                                    placeholder="Document label *"
                                    className="h-10 flex-1 border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0a3269] focus:ring-[#0a3269]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    value={docLabel[check._id] || ''}
                                    onChange={e => setDocLabel(prev => ({ ...prev, [check._id]: e.target.value }))}
                                  />
                                </div>
                                <div className="flex-1 relative">
                                  <Input
                                    placeholder="Description (optional)"
                                    className="h-10 flex-1 border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0a3269] focus:ring-[#0a3269]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    value={docDesc[check._id] || ''}
                                    onChange={e => setDocDesc(prev => ({ ...prev, [check._id]: e.target.value }))}
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-10 shrink-0 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                  onClick={() => addDocRow(check._id)}
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Add
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                className="mt-3 w-full gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 dark:from-amber-600 dark:to-rose-600 sm:w-auto"
                                disabled={isActing || (requestedDocs[check._id] || []).length === 0}
                                onClick={() => handleRequestDocs(check)}
                              >
                                <Send className="h-4 w-4" /> Send Request
                              </Button>
                            </section>

                            {/* ─── MODERN CHAT SECTION ──────────────────────────────────── */}
                            <section>
                              <button
                                type="button"
                                onClick={() => setShowChat(prev => ({ ...prev, [check._id]: !prev[check._id] }))}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-all duration-300 group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-[#0a3269] text-white shadow-lg shadow-[#0a3269]/20">
                                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                                      Conversation
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                                      <span>{chatMessages.length} messages</span>
                                      {chatMessages.length > 0 && (
                                        <span className="flex items-center gap-1">
                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                          Last: {new Date(chatMessages[chatMessages.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <motion.div
                                  animate={{ rotate: showChatForCheck ? 180 : 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="p-1.5 rounded-lg bg-white/50 dark:bg-slate-800/50 group-hover:bg-white/70 dark:group-hover:bg-slate-700/50"
                                >
                                  <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                </motion.div>
                              </button>

                              <AnimatePresence>
                                {showChatForCheck && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="overflow-hidden mt-3"
                                  >
                                    <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/50 dark:border-white/5 overflow-hidden">
                                      {/* ─── Chat Header ───────────────────────────────────── */}
                                      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-800/50 border-b border-slate-200/50 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                          <div className="h-9 w-9 rounded-full bg-[#0a3269] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#0a3269]/20">
                                            A
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">Admin</p>
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                              Online
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Badge className="bg-slate-200/50 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300 border-0 text-[10px]">
                                            {chatMessages.length} messages
                                          </Badge>
                                        </div>
                                      </div>

                                      {/* ─── Messages ──────────────────────────────────────── */}
                                      <div className="h-64 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50">
                                        {chatMessages.length > 0 ? (
                                          [...chatMessages]
                                            .sort((a, b) => 
                                              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                                            )
                                            .map((msg, idx) => {
                                              const isAdmin = msg.by === 'admin' || msg.role === 'admin' || msg.role === 'officer'
                                              return (
                                                <ChatMessage
                                                  key={idx}
                                                  message={msg}
                                                  isAdmin={isAdmin}
                                                />
                                              )
                                            })
                                        ) : (
                                          <div className="flex flex-col items-center justify-center h-full text-center">
                                            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                                              <MessageCircle className="h-10 w-10 text-slate-400 dark:text-slate-600" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No messages yet</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Start a conversation with the applicant</p>
                                          </div>
                                        )}
                                        <div ref={el => messagesEndRef.current[check._id] = el} />
                                      </div>

                                      {/* ─── Message Input ────────────────────────────────── */}
                                      <div className="border-t border-slate-200/50 dark:border-white/5 p-3 bg-white dark:bg-slate-900">
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={chatMessage[check._id] || ''}
                                            onChange={(e) => setChatMessage(prev => ({ ...prev, [check._id]: e.target.value }))}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendChatMessage(check);
                                              }
                                            }}
                                            className="flex-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#0a3269] focus:ring-2 focus:ring-[#0a3269]/20 focus:outline-none transition-all"
                                            disabled={sendingMessage[check._id]}
                                          />
                                          <Button
                                            onClick={() => handleSendChatMessage(check)}
                                            disabled={sendingMessage[check._id] || !chatMessage[check._id]?.trim()}
                                            className="h-10 w-10 p-0 rounded-full bg-[#0a3269] text-white shadow-lg shadow-[#0a3269]/25 hover:shadow-[#0a3269]/40 transition-all disabled:opacity-50"
                                          >
                                            {sendingMessage[check._id] ? (
                                              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                              <Send className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </section>

                            {/* ─── OLD ATTACHMENTS ────────────────────────── */}
                            {attachCount > 0 && (
                              <section>
                                <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <Upload className="h-3.5 w-3.5" />
                                  </div>
                                  Attachments ({attachCount})
                                </h4>
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5">
                                  {check?.attachments?.map((att, idx) => (
                                    <DocumentThumbnail
                                      key={idx}
                                      doc={att}
                                      checkId={check._id}
                                      onPreview={openPreview}
                                      onDownload={handleDownload}
                                    />
                                  ))}
                                </div>
                              </section>
                            )}

                            {/* ─── UPLOADED DOCUMENTS ────────────────── */}
                            {docCount > 0 && (
                              <section>
                                <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <Upload className="h-3.5 w-3.5" />
                                  </div>
                                  Uploaded Documents ({docCount})
                                </h4>
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5">
                                  {check?.documents?.map((doc, idx) => (
                                    <DocumentThumbnail
                                      key={idx}
                                      doc={doc}
                                      checkId={check._id}
                                      onPreview={openPreview}
                                      onDownload={handleDownload}
                                    />
                                  ))}
                                </div>
                              </section>
                            )}

                            <div className="border-t border-slate-200/60 dark:border-slate-700/60" />

                            {/* ─── Status Update ───────────────────────────────────── */}
                            <section className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm transition dark:border-slate-700/70 dark:from-slate-800/80 dark:to-slate-900/50 dark:shadow-slate-700/20">
                              <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                  <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                                </div>
                                Update Status
                              </h4>

                              <div className="space-y-4">
                                <div>
                                  <Select
                                    value={newStatus[check._id] || ''}
                                    onValueChange={(val) =>
                                      setNewStatus((prev) => ({ ...prev, [check._id]: val }))
                                    }
                                  >
                                    <SelectTrigger className="h-11 w-full border-slate-200 bg-white text-sm font-medium text-slate-900 transition hover:border-[#0a3269] focus:ring-2 focus:ring-[#0a3269]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-[#0a3269]">
                                      <SelectValue placeholder="Choose a new status…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableStatuses.map((status) => {
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

                                <div>
                                  <Textarea
                                    placeholder="Add a note (optional)…"
                                    className="min-h-[72px] resize-none border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#0a3269] focus:ring-2 focus:ring-[#0a3269]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
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

                                <Button
                                  size="sm"
                                  disabled={isActing || !newStatus[check._id]}
                                  onClick={() => handleStatusUpdate(check)}
                                  className="relative w-full gap-2 bg-[#0a3269] text-white shadow-lg shadow-[#0a3269]/25 transition-all hover:scale-[1.01] hover:shadow-[#0a3269]/40 disabled:opacity-60 disabled:hover:scale-100 sm:w-auto"
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
                            <section className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm dark:border-slate-700/70 dark:from-slate-800/80 dark:to-slate-900/50">
                              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <div className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                  <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                                </div>
                                Add Comment
                              </h4>
                              <div className="space-y-3">
                                <Textarea
                                  placeholder="Write a comment visible to the applicant…"
                                  className="min-h-[60px] resize-none border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0a3269] focus:ring-[#0a3269]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                  value={commentText[check._id] || ''}
                                  onChange={e => setCommentText(prev => ({ ...prev, [check._id]: e.target.value }))}
                                />
                                <Button
                                  size="sm"
                                  disabled={isActing || !commentText[check._id]?.trim()}
                                  onClick={() => handleAddComment(check)}
                                  className="w-full gap-2 bg-[#0a3269] text-white shadow-lg shadow-[#0a3269]/25 hover:shadow-[#0a3269]/40 sm:w-auto"
                                >
                                  <Send className="h-4 w-4" /> Send Comment
                                </Button>
                              </div>
                            </section>

                            {/* ─── Upload Result ───────────────────────────────────── */}
                            <section className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm dark:border-slate-700/70 dark:from-slate-800/80 dark:to-slate-900/50">
                              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                  <Upload className="h-3.5 w-3.5 text-emerald-500" />
                                </div>
                                Upload Result
                              </h4>
                              {check?.resultDocuments && check?.resultDocuments?.length > 0 && (
                                <div className="mb-3 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5">
                                  {check?.resultDocuments?.map((rd, idx) => {
                                    const fileUrl = getResultDocumentUrl(rd.filename)
                                    return (
                                      <DocumentThumbnail
                                        key={idx}
                                        doc={rd}
                                        checkId={check._id}
                                        onPreview={openPreview}
                                        onDownload={handleDownload}
                                      />
                                    )
                                  })}
                                </div>
                              )}
                              <div className="space-y-3">
                                <Input
                                  type="file"
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  className="h-10 w-full cursor-pointer border-slate-200 bg-white text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:file:bg-slate-700 dark:file:text-slate-300"
                                  onChange={e => {
                                    const file = e.target.files?.[0] ?? null
                                    setResultFile(prev => ({ ...prev, [check._id]: file }))
                                  }}
                                />
                                <Textarea
                                  placeholder="Result summary (visible to applicant)…"
                                  className="min-h-[60px] resize-none border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                  value={resultSummary[check._id] || ''}
                                  onChange={e => setResultSummary(prev => ({ ...prev, [check._id]: e.target.value }))}
                                />
                                <Select
                                  value={resultStatus[check._id] || 'pending'}
                                  onValueChange={val =>
                                    setResultStatus(prev => ({ ...prev, [check._id]: val as 'clear' | 'flagged' | 'pending' }))
                                  }
                                >
                                  <SelectTrigger className="h-10 w-full border-slate-200 bg-white text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
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
                                  className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 dark:from-emerald-500 dark:to-teal-500 sm:w-auto"
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