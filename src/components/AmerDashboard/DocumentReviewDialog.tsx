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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Zap,
  ChevronLeft,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DocumentAttachment {
  _id?: string
  type: string
  path: string
  originalName?: string
  fileSize?: number
  mimeType?: string
  status: 'pending' | 'approved' | 'rejected' | 'requested'
  uploadedAt: string
  rejectionReason?: string
  extractedData?: any
  isRequested?: boolean
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
      <Badge className={`${config.bg} ${config.text} border ${config.border} flex items-center gap-1 px-2 py-0.5 text-[9px] sm:text-[10px] font-medium rounded-full whitespace-nowrap`}>
        <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        <span className="hidden xs:inline">{config.label}</span>
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
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[95vh] overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xl rounded-2xl p-0 sm:p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 px-3 sm:px-6 py-3 sm:py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <DialogHeader className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-[#0A3269] to-[#1a4a7a] shadow-lg shadow-[#0A3269]/25 flex-shrink-0">
                  <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white truncate flex items-center gap-2">
                    Document Review
                    <Badge className="bg-[#0A3269]/10 text-[#0A3269] dark:bg-[#0A3269]/30 dark:text-[#1a4a7a] border-0 text-[8px] sm:text-[10px] flex-shrink-0">
                      {documents.length}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                    Review uploaded documents for application #{applicationId.slice(-8)}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 sm:h-9 sm:w-9 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* Mobile Back Button */}
        {isMobile && !showMobileList && selectedDoc && (
          <div className="sticky top-14 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="h-8 px-2 text-xs flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to documents
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-0 h-[calc(95vh-120px)] overflow-hidden">
          {/* Document List */}
          <div className={cn(
            "overflow-y-auto p-3 sm:p-6 border-r border-gray-200/80 dark:border-gray-800/80 bg-gray-50/30 dark:bg-gray-900/30",
            isMobile && !showMobileList ? "hidden" : "block",
            isMobile ? "max-h-[calc(95vh-160px)]" : ""
          )}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A3269]" />
                Documents
                <span className="text-[10px] sm:text-xs font-normal text-gray-400 dark:text-gray-500">
                  ({documents.length})
                </span>
              </h3>
              <Badge className="bg-[#0A3269]/10 text-[#0A3269] dark:bg-[#0A3269]/20 dark:text-[#1a4a7a] border-0 text-[8px] sm:text-[10px] flex-shrink-0">
                <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                <span className="hidden xs:inline">Encrypted</span>
              </Badge>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <AnimatePresence>
                {documents.map((doc, index) => (
                  <motion.div
                    key={doc._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectDoc(doc)}
                    className={cn(
                      'group p-2.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
                      selectedDoc?._id === doc._id && !isMobile
                        ? 'border-[#0A3269] bg-[#0A3269]/5 dark:bg-[#0A3269]/10 shadow-lg shadow-[#0A3269]/10'
                        : 'border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 hover:border-[#0A3269]/30 hover:shadow-md hover:bg-[#0A3269]/5 dark:hover:bg-[#0A3269]/10'
                    )}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      {/* Icon */}
                      <div className={cn(
                        'p-1.5 sm:p-2 rounded-lg transition-all duration-300 flex-shrink-0',
                        selectedDoc?._id === doc._id && !isMobile
                          ? 'bg-[#0A3269]/10 text-[#0A3269]'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-[#0A3269]/10 group-hover:text-[#0A3269]'
                      )}>
                        {getDocumentIcon(doc.mimeType)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <h4 className="font-medium text-[11px] sm:text-sm text-gray-900 dark:text-white truncate max-w-[100px] sm:max-w-[150px]">
                            {formatDocumentType(doc.type)}
                          </h4>
                          {doc.isRequested && (
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[8px] flex-shrink-0">
                              <AlertTriangle className="w-2 h-2 mr-0.5" />
                              <span className="hidden xs:inline">Re-upload</span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                          {doc.originalName || doc.path}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span className="w-0.5 h-2 bg-gray-300 dark:bg-gray-600" />
                          <span className="hidden xs:inline">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {getStatusBadge(doc.status)}
                        {selectedDoc?._id === doc._id && !isMobile && (
                          <ChevronRight className="w-3.5 h-3.5 text-[#0A3269]" />
                        )}
                      </div>
                    </div>

                    {/* Rejection reason preview */}
                    {doc.rejectionReason && (
                      <div className="mt-1.5 p-1.5 sm:p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-[8px] sm:text-xs">
                        <span className="font-medium text-red-700 dark:text-red-400">Rejected:</span>
                        <span className="text-red-600 dark:text-red-300 ml-1 truncate block">{doc.rejectionReason}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {documents.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Document Preview & Actions */}
          <div className={cn(
            "overflow-y-auto p-3 sm:p-6 bg-white dark:bg-gray-900",
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
                  className="space-y-3 sm:space-y-4"
                >
                  {/* Preview Card */}
                  <div className="border-0 shadow-none bg-transparent">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-[#0A3269]/10">
                          {getDocumentIcon(selectedDoc.mimeType)}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
                          {formatDocumentType(selectedDoc.type)}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            const url = `${apiBase}/uploads/applications/${applicationId}/${selectedDoc.path}`
                            window.open(url, '_blank')
                          }}
                          className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs rounded-lg hover:bg-[#0A3269]/5 hover:text-[#0A3269]"
                        >
                          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                          <span className="hidden xs:inline">View</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            const url = `${apiBase}/uploads/applications/${applicationId}/${selectedDoc.path}`
                            const link = document.createElement('a')
                            link.href = url
                            link.download = selectedDoc.originalName || selectedDoc.path
                            link.click()
                          }}
                          className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs rounded-lg hover:bg-[#0A3269]/5 hover:text-[#0A3269]"
                        >
                          <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                          <span className="hidden xs:inline">Download</span>
                        </Button>
                      </div>
                    </div>

                    {/* Preview Area */}
                    <div className="rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/50 p-2 sm:p-4 min-h-[150px] sm:min-h-[200px] flex items-center justify-center">
                      {selectedDoc.mimeType?.includes('image/') ? (
                        <img 
                          src={`${apiBase}/uploads/applications/${applicationId}/${selectedDoc.path}`}
                          alt={selectedDoc.originalName}
                          className="max-w-full max-h-[200px] sm:max-h-[300px] object-contain rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'block';
                            }
                          }}
                        />
                      ) : selectedDoc.mimeType?.includes('application/pdf') ? (
                        <iframe 
                          src={`${apiBase}/uploads/applications/${applicationId}/${selectedDoc.path}`}
                          className="w-full h-[200px] sm:h-[300px] border-0 rounded-lg"
                          title={selectedDoc.originalName}
                        />
                      ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                          <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                          <p className="text-xs sm:text-sm">Preview not available</p>
                          <Button 
                            onClick={() => {
                              const url = `${apiBase}/uploads/applications/${applicationId}/${selectedDoc.path}`
                              const link = document.createElement('a')
                              link.href = url
                              link.download = selectedDoc.originalName || selectedDoc.path
                              link.click()
                            }}
                            className="mt-2 bg-[#0A3269] hover:bg-[#1a4a7a] text-white rounded-lg text-xs h-8 sm:h-9"
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            Download
                          </Button>
                        </div>
                      )}
                      <div className="hidden text-center text-gray-500 dark:text-gray-400">
                        <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2" />
                        <p className="text-xs sm:text-sm">Unable to load preview</p>
                        <Button 
                          onClick={() => {
                            const url = `${apiBase}/uploads/applications/${applicationId}/${selectedDoc.path}`
                            const link = document.createElement('a')
                            link.href = url
                            link.download = selectedDoc.originalName || selectedDoc.path
                            link.click()
                          }}
                          className="mt-2"
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          Download
                        </Button>
                      </div>
                    </div>

                    {/* Document Details - Mobile Optimized */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-3 mt-3">
                      <div className="p-2 sm:p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                        <Label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</Label>
                        <p className="text-[10px] sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {selectedDoc.originalName?.slice(0, 12) || selectedDoc.path.slice(0, 12)}
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                        <Label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Size</Label>
                        <p className="text-[10px] sm:text-sm font-medium text-gray-900 dark:text-white">{formatFileSize(selectedDoc.fileSize)}</p>
                      </div>
                      <div className="p-2 sm:p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50 col-span-2">
                        <Label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Uploaded</Label>
                        <p className="text-[10px] sm:text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(selectedDoc.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Extracted Data */}
                    {selectedDoc.extractedData && (
                      <div className="p-2 sm:p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50 mt-2">
                        <Label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#0A3269]" />
                          Extracted Info
                        </Label>
                        <pre className="mt-1 text-[8px] sm:text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white dark:bg-gray-900 p-1.5 sm:p-2 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto max-h-[80px] sm:max-h-[120px]">
                          {JSON.stringify(selectedDoc.extractedData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Review Actions */}
                  {selectedDoc.status === 'pending' ? (
                    <div className="bg-gradient-to-br from-[#0A3269]/5 to-transparent dark:from-[#0A3269]/10 rounded-xl border border-[#0A3269]/10 dark:border-[#0A3269]/20 p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A3269]" />
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Review Document</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="rejection-reason" className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400">
                            Rejection Reason (if rejecting)
                          </Label>
                          <Textarea
                            id="rejection-reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Provide reason for rejection..."
                            className="mt-1 text-xs sm:text-sm border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#0A3269]/20 focus:border-[#0A3269] rounded-lg resize-none h-16 sm:h-20"
                          />
                        </div>

                        <div className="flex gap-2">
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleReview(selectedDoc._id!, 'approved')}
                            disabled={loading}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium text-white transition-all duration-200',
                              'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25'
                            )}
                          >
                            {loading ? (
                              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Approve
                              </>
                            )}
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleReview(selectedDoc._id!, 'rejected')}
                            disabled={loading || !rejectionReason.trim()}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium text-white transition-all duration-200',
                              'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25',
                              (loading || !rejectionReason.trim()) && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Reject
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-xl p-3 sm:p-4">
                      <div className="text-center">
                        {getStatusBadge(selectedDoc.status)}
                        <p className="text-[11px] sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                          This document has already been reviewed
                        </p>
                        {selectedDoc.rejectionReason && (
                          <div className="mt-2 p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                            <p className="text-[10px] sm:text-sm font-medium text-red-800 dark:text-red-400">Rejection Reason:</p>
                            <p className="text-[10px] sm:text-sm text-red-700 dark:text-red-300 break-words">{selectedDoc.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center p-4">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-7 h-7 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm sm:text-base font-medium">Select a document</p>
                  <p className="text-[10px] sm:text-sm text-gray-400 dark:text-gray-500 mt-1">Click on any document from the list</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80 px-3 sm:px-6 py-2 sm:py-3 rounded-b-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="hidden xs:inline">Secure</span>
              </span>
              <span className="w-px h-3 bg-gray-300 dark:bg-gray-600 hidden xs:block" />
              <span className="hidden xs:inline">Encrypted</span>
              <span className="w-px h-3 bg-gray-300 dark:bg-gray-600 hidden xs:block" />
              <span>{documents.filter(d => d.status === 'pending').length} pending</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 sm:h-8 px-2 sm:px-3 text-[8px] sm:text-xs rounded-lg hover:bg-[#0A3269]/5 hover:text-[#0A3269]"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}