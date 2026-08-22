import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download, 
  FileText,
  Image,
  AlertTriangle,
  Shield,
  Clock,
  UserCheck,
  FileCheck,
  ChevronRight,
  Sparkles,
  ChevronLeft,
  X,
  Loader2,
  Zap,
  Award,
  Crown,
  FolderOpen,
  Lock
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DocumentAttachment {
  _id?: string
  type: string
  path: string
  url?: string
  fileUrl?: string
  secure_url?: string
  downloadUrl?: string
  previewUrl?: string
  originalName?: string
  fileSize?: number
  mimeType?: string
  status: 'pending' | 'approved' | 'rejected' | 'requested'
  uploadedAt: string
  rejectionReason?: string
  extractedData?: any
  isRequested?: boolean
  filename?: string
}

interface DocumentReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documents: DocumentAttachment[]
  applicationId: string
  onReview: (attachmentId: string, status: 'approved' | 'rejected', rejectionReason?: string) => Promise<void>
}

export const DocumentReviewDialog: React.FC<DocumentReviewDialogProps> = ({
  open,
  onOpenChange,
  documents,
  applicationId,
  onReview
}) => {
  const { t } = useTranslation()
  const [selectedDoc, setSelectedDoc] = useState<DocumentAttachment | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileList, setShowMobileList] = useState(true)
  const [imageError, setImageError] = useState(false)

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ─── Reset image error when document changes ──────────────────────
  useEffect(() => {
    setImageError(false)
  }, [selectedDoc?._id])

  // ─── Get the correct file URL ──────────────────────────────────────
  const getFileUrl = (doc: DocumentAttachment): string => {
    if (!doc) return ''
    
    if (doc.url) return doc.url
    if (doc.fileUrl) return doc.fileUrl
    if (doc.secure_url) return doc.secure_url
    if (doc.downloadUrl) return doc.downloadUrl
    if (doc.previewUrl) return doc.previewUrl
    
    if (doc.path) {
      const path = doc.path
      
      if (path.includes('http://') || path.includes('https://')) {
        const urlMatches = path.match(/(https?:\/\/[^\s]+)/g)
        if (urlMatches && urlMatches.length > 0) {
          return urlMatches[urlMatches.length - 1]
        }
        return path
      } else if (path.startsWith('/uploads/')) {
        return `${apiBase}${path}`
      } else if (path.includes(applicationId)) {
        return `${apiBase}/${path}`
      } else {
        const possiblePaths = [
          `${apiBase}/uploads/visa-documents/${applicationId}/${path}`,
          `${apiBase}/uploads/applications/${applicationId}/${path}`,
          `${apiBase}/uploads/documents/${applicationId}/${path}`,
        ]
        return possiblePaths[0]
      }
    }
    
    if (doc.filename) {
      return `${apiBase}/uploads/visa-documents/${applicationId}/${doc.filename}`
    }
    
    return ''
  }

  const getDocumentIcon = (mimeType?: string) => {
    if (mimeType?.startsWith('image/')) {
      return <Image className="w-4 h-4 sm:w-5 sm:h-5" />
    }
    return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      approved: { 
        bg: 'bg-emerald-50 dark:bg-emerald-950/30', 
        text: 'text-emerald-700 dark:text-emerald-400', 
        border: 'border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle,
        label: 'Approved'
      },
      rejected: { 
        bg: 'bg-red-50 dark:bg-red-950/30', 
        text: 'text-red-700 dark:text-red-400', 
        border: 'border-red-200 dark:border-red-800',
        icon: XCircle,
        label: 'Rejected'
      },
      requested: { 
        bg: 'bg-amber-50 dark:bg-amber-950/30', 
        text: 'text-amber-700 dark:text-amber-400', 
        border: 'border-amber-200 dark:border-amber-800',
        icon: AlertTriangle,
        label: 'Requested'
      },
      pending: { 
        bg: 'bg-blue-50 dark:bg-blue-950/30', 
        text: 'text-blue-700 dark:text-blue-400', 
        border: 'border-blue-200 dark:border-blue-800',
        icon: Clock,
        label: 'Pending'
      }
    }
    const config = configs[status as keyof typeof configs] || configs.pending
    const Icon = config.icon
    
    return (
      <Badge className={`${config.bg} ${config.text} border ${config.border} flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-medium rounded-full`}>
        <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  const handleReview = async (attachmentId: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      toast.error(t('documents.provideRejectionReason'))
      return
    }

    setLoading(true)
    try {
      await onReview(attachmentId, status, status === 'rejected' ? rejectionReason : undefined)
      setRejectionReason('')
      setSelectedDoc(null)
      toast.success(t(`documents.${status === 'approved' ? 'approved' : 'rejected'}`))
    } catch (error) {
      toast.error(t('errors.general'))
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDocumentType = (type: string): string => {
    if (!type) return 'Document'
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const handleSelectDoc = (doc: DocumentAttachment) => {
    setSelectedDoc(doc)
    if (isMobile) {
      setShowMobileList(false)
    }
  }

  const handleBackToList = () => {
    setShowMobileList(true)
    setSelectedDoc(null)
  }

  const handleView = (doc: DocumentAttachment) => {
    const url = getFileUrl(doc)
    if (url) {
      window.open(url, '_blank')
    } else {
      toast.error('No URL available to view')
    }
  }

  const handleDownload = (doc: DocumentAttachment) => {
    const url = getFileUrl(doc)
    
    if (!url) {
      toast.error('No URL available to download')
      return
    }

    const fileName = doc.originalName || url.split('/').pop() || 'document'
    
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok')
        return response.blob()
      })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
        toast.success('Download started!')
      })
      .catch(() => {
        toast.info('Opening in new tab. Right-click to save.')
        window.open(url, '_blank')
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[95vh] overflow-hidden bg-white dark:bg-gray-900 border-0 rounded-2xl p-0">
        {/* ─── Premium Header ───────────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-[#14235E] via-[#14235E] to-[#14235E] dark:from-[#14235E]px-4 sm:px-8 py-4 sm:py-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 backdrop-blur-sm ">
                <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Document Review
                  <Badge className="bg-white/20 text-white border-white/30 text-[9px] sm:text-[10px] px-2 sm:px-3 py-0.5">
                    {documents.length}
                  </Badge>
                </h2>
                <p className="text-[10px] sm:text-xs text-white/60 hidden sm:block">
                  Application #{applicationId.slice(-8)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-white transition-all duration-300"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        {/* ─── Mobile Back Button ────────────────────────────────────── */}
        {isMobile && !showMobileList && selectedDoc && (
          <div className="sticky top-[72px] z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="h-8 px-2 text-xs flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        )}

        {/* ─── Content ───────────────────────────────────────────────── */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-0 h-[calc(95vh-130px)] overflow-hidden">
          {/* ─── Document List ──────────────────────────────────────── */}
          <div className={cn(
            "overflow-y-auto p-3 sm:p-6 border-r border-gray-200/60 dark:border-gray-800/60 bg-gray-50/30 dark:bg-gray-900/30",
            isMobile && !showMobileList ? "hidden" : "block",
            isMobile ? "max-h-[calc(95vh-200px)]" : ""
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#14235E]" />
                Documents
                <span className="text-[10px] sm:text-xs font-normal text-gray-400 dark:text-gray-500">
                  ({documents.length})
                </span>
              </h3>
              <Badge className="bg-[#14235E]/10 text-[#14235E] dark:bg-[#14235E]/20 dark:text-[#4A8ABF] border-0 text-[8px] sm:text-[9px] px-2 py-0.5 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span className="hidden xs:inline">Encrypted</span>
              </Badge>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {documents.map((doc, index) => (
                  <motion.div
                    key={doc._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => handleSelectDoc(doc)}
                    className={cn(
                      'group p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
                      selectedDoc?._id === doc._id && !isMobile
                        ? 'border-[#14235E] bg-[#14235E]/5 dark:bg-[#14235E]/10'
                        : 'border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900/80 hover:border-[#14235E]/30 dark:hover:bg-[#14235E]/10'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-2 rounded-xl transition-all duration-300 flex-shrink-0',
                        selectedDoc?._id === doc._id && !isMobile
                          ? 'bg-[#14235E]/15 text-[#14235E]'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-[#14235E]/10 group-hover:text-[#14235E]'
                      )}>
                        {getDocumentIcon(doc.mimeType)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                        
                          {doc.isRequested && (
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[7px] sm:text-[8px] px-1.5 py-0.5">
                              <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                              Re-upload
                            </Badge>
                          )}
                        </div>
                        <p className="text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {doc.originalName || doc.path}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[7px] sm:text-[9px] text-gray-400 dark:text-gray-500">
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span className="w-0.5 h-2 bg-gray-300 dark:bg-gray-600" />
                          <span className="hidden xs:inline">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {getStatusBadge(doc.status)}
                      </div>
                    </div>

                    {doc.rejectionReason && (
                      <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-[8px] sm:text-xs">
                        <span className="font-medium text-red-700 dark:text-red-400">Rejected:</span>
                        <span className="text-red-600 dark:text-red-300 ml-1 truncate block">{doc.rejectionReason}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {documents.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
                </div>
              )}
            </div>
          </div>

          {/* ─── Document Preview ────────────────────────────────────── */}
          <div className={cn(
            "overflow-y-auto p-4 sm:p-8 bg-white dark:bg-gray-900",
            isMobile && showMobileList ? "hidden" : "block",
            isMobile ? "max-h-[calc(95vh-200px)]" : ""
          )}>
            {selectedDoc ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDoc._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* ─── Preview Header ─────────────────────────────── */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#14235E]/10 dark:bg-[#14235E]/20">
                        {getDocumentIcon(selectedDoc.mimeType)}
                      </div>
                      <div>
                    
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {selectedDoc.originalName || 'Document'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleView(selectedDoc)}
                        className="h-8 sm:h-9 px-3 sm:px-4 text-[10px] sm:text-xs rounded-xl border-gray-300 dark:border-gray-700 hover:border-[#14235E] hover:text-[#14235E] hover:bg-[#14235E]/5 transition-all duration-300"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownload(selectedDoc)}
                        className="h-8 sm:h-9 px-3 sm:px-4 text-[10px] sm:text-xs rounded-xl border-gray-300 dark:border-gray-700 hover:border-[#14235E] hover:text-[#14235E] hover:bg-[#14235E]/5 transition-all duration-300"
                      >
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* ─── Preview Area ────────────────────────────────── */}
                  <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/40 p-4 sm:p-6 min-h-[200px] sm:min-h-[280px] flex items-center justify-center relative">
                    {(() => {
                      const fileUrl = getFileUrl(selectedDoc)
                      const isImage = selectedDoc.mimeType?.includes('image/') ||
                                      fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif)$/i)
                      const isPDF = selectedDoc.mimeType?.includes('application/pdf') ||
                                    fileUrl?.match(/\.pdf$/i)
                      
                      // ─── Show loading only for images ──────────────
                      if (!fileUrl) {
                        return (
                          <div className="text-center text-gray-500 dark:text-gray-400 p-6">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Document URL not found
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              The document may not be uploaded or the URL is missing
                            </p>
                          </div>
                        )
                      }
                      
                      if (isImage) {
                        return (
                          <div className="relative w-full h-full flex items-center justify-center">
                            {!imageError ? (
                              <img 
                                src={fileUrl}
                                alt={selectedDoc.originalName || 'Document'}
                                className="max-w-full max-h-[250px] sm:max-h-[350px] object-contain rounded-xl"
                                onError={() => setImageError(true)}
                                onLoad={() => setImageError(false)}
                              />
                            ) : (
                              <div className="text-center text-gray-500 dark:text-gray-400 p-6">
                                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Failed to load image
                                </p>
                                <Button 
                                  onClick={() => handleView(selectedDoc)}
                                  className="mt-3 bg-[#14235E] hover:bg-[#1a4a7a] text-white rounded-xl text-xs h-9"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                                  Open in new tab
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      }
                      
                      if (isPDF) {
                        return (
                          <iframe 
                            src={fileUrl}
                            className="w-full h-[250px] sm:h-[350px] border-0 rounded-xl"
                            title={selectedDoc.originalName || 'PDF Document'}
                          />
                        )
                      }
                      
                      return (
                        <div className="text-center text-gray-500 dark:text-gray-400 p-6">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center">
                            <FileText className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {selectedDoc.originalName || 'Document'}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Preview not available
                          </p>
                          <Button 
                            onClick={() => handleDownload(selectedDoc)}
                            className="mt-4 bg-[#14235E] hover:bg-[#1a4a7a] text-white rounded-xl text-xs h-9"
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            Download
                          </Button>
                        </div>
                      )
                    })()}
                  </div>

                  {/* ─── Document Details ────────────────────────────── */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</p>
                      <p className="text-[10px] sm:text-sm font-medium text-gray-900 dark:text-white truncate mt-0.5">
                        {selectedDoc.originalName?.slice(0, 15) || selectedDoc.path?.slice(0, 15) || 'Document'}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Size</p>
                      <p className="text-[10px] sm:text-sm font-medium text-gray-900 dark:text-white mt-0.5">{formatFileSize(selectedDoc.fileSize)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 col-span-2">
                      <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Uploaded</p>
                      <p className="text-[10px] sm:text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                        {new Date(selectedDoc.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* ─── Extracted Data ──────────────────────────────── */}
                  {selectedDoc.extractedData && (
                    <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#14235E]" />
                        Extracted Info
                      </p>
                      <pre className="mt-1 text-[8px] sm:text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto max-h-[80px]">
                        {JSON.stringify(selectedDoc.extractedData, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* ─── Review Actions ──────────────────────────────── */}
                  {selectedDoc.status === 'pending' ? (
                    <div className="bg-gradient-to-br from-[#14235E]/5 to-transparent dark:from-[#14235E]/10 rounded-2xl border border-[#14235E]/10 dark:border-[#14235E]/20 p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <UserCheck className="w-4 h-4 text-[#14235E]" />
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Review Document</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Provide reason for rejection (if rejecting)..."
                          className="text-xs sm:text-sm border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#14235E]/20 focus:border-[#14235E] rounded-xl resize-none h-16 sm:h-20 bg-white dark:bg-gray-900"
                        />

                        <div className="flex gap-2">
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleReview(selectedDoc._id!, 'approved')}
                            disabled={loading}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all duration-300',
                              'bg-gradient-to-r from-emerald-500 to-emerald-600  hover:scale-[1.02] active:scale-[0.98]'
                            )}
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </>
                            )}
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleReview(selectedDoc._id!, 'rejected')}
                            disabled={loading || !rejectionReason.trim()}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all duration-300',
                              'bg-gradient-to-r from-red-500 to-red-600  hover:scale-[1.02] active:scale-[0.98]',
                              (loading || !rejectionReason.trim()) && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-4 sm:p-5 text-center border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {getStatusBadge(selectedDoc.status)}
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Already reviewed
                        </p>
                      </div>
                      {selectedDoc.rejectionReason && (
                        <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-left">
                          <p className="text-[9px] sm:text-xs font-medium text-red-800 dark:text-red-400">Rejection Reason:</p>
                          <p className="text-[9px] sm:text-xs text-red-700 dark:text-red-300 break-words mt-0.5">{selectedDoc.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Select a document</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click on any document from the list</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Footer ────────────────────────────────────────────────── */}
        <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 px-4 sm:px-8 py-2.5 sm:py-3 rounded-b-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                <span className="hidden xs:inline">Secure</span>
              </span>
              <span className="w-px h-4 bg-gray-300 dark:bg-gray-600 hidden xs:block" />
              <span className="flex items-center gap-1.5 hidden xs:flex">
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
                Encrypted
              </span>
              <span className="w-px h-4 bg-gray-300 dark:bg-gray-600 hidden xs:block" />
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500" />
                {documents.filter(d => d.status === 'pending').length} pending
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-7 sm:h-8 px-3 sm:px-4 text-[9px] sm:text-xs rounded-xl hover:bg-[#14235E]/5 hover:text-[#14235E] transition-all duration-300"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}