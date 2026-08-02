import React, { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  CheckCircle, 
  X, 
  Eye, 
  Crop, 
  Download, 
  AlertCircle,
  MoreHorizontal,
  Trash2,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface DocumentType {
  id: string
  label: string
  required: boolean
  category: 'sponsor' | 'sponsored' | 'establishment' | 'other'
  accepted?: string[]
}

interface UploadedDocument {
  id: string
  file: File
  preview: string
  status: 'uploading' | 'uploaded' | 'error'
  progress: number
  extractedData?: any
  rejectionReason?: string
  isRequested?: boolean
}

interface DocumentUploadCardProps {
  document: DocumentType
  uploadedDoc?: UploadedDocument
  onUpload: (docId: string, file: File) => Promise<void>
  onDelete: (docId: string) => void
  onView: (docId: string) => void
  onCrop?: (docId: string) => void
  className?: string
  disabled?: boolean
  isAmerOfficer?: boolean
  isResultDocument?: boolean
  applicationId?: string
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  document,
  uploadedDoc,
  onUpload,
  onDelete,
  onView,
  onCrop,
  className = '',
  disabled = false,
  isAmerOfficer = false,
  isResultDocument = false,
  applicationId
}) => {
  const { t } = useTranslation()
  const [isDragOver, setIsDragOver] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (!file) return

    // Enhanced validation for Amer officer result documents
    const acceptedTypes = document.accepted || ['image/*', 'application/pdf']
    const isValidType = acceptedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/')
      if (type === 'application/pdf') return file.type === 'application/pdf'
      return file.type === type
    })

    if (!isValidType) {
      toast.error(t('errors.fileTypeError'))
      return
    }

    // Enhanced file size validation (20MB for result documents)
    const maxSize = isResultDocument ? 20 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(t('errors.fileSizeError'))
      return
    }

    try {
      if (isAmerOfficer && isResultDocument && applicationId) {
        // Special handling for Amer officer result document uploads
        await uploadResultDocument(applicationId, document.id, file)
      } else {
        await onUpload(document.id, file)
      }
    } catch (error) {
      toast.error(t('documents.uploadError'))
    }
  }, [document, onUpload, disabled, isAmerOfficer, isResultDocument, applicationId, t])

  const uploadResultDocument = async (appId: string, docId: string, file: File) => {
    const token = localStorage.getItem('authToken') || ''
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', docId)
    formData.append('applicationId', appId)
    formData.append('isResultDocument', 'true')

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/visa/${appId}/result-documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload result document')
    }

    const result = await response.json()
    toast.success(t('documents.uploadSuccess'))
    return result
  }

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Same validation as drag & drop
    const acceptedTypes = document.accepted || ['image/*', 'application/pdf']
    const isValidType = acceptedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/')
      if (type === 'application/pdf') return file.type === 'application/pdf'
      return file.type === type
    })

    if (!isValidType) {
      toast.error(t('errors.fileTypeError'))
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('errors.fileSizeError'))
      return
    }

    try {
      await onUpload(document.id, file)
    } catch (error) {
      toast.error(t('documents.uploadError'))
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [document, onUpload, t])

  const handleClick = useCallback(() => {
    if (disabled) return
    fileInputRef.current?.click()
  }, [disabled])

  const getStatusColor = () => {
    if (uploadedDoc?.isRequested) return 'border-orange-400 bg-orange-50 shadow-sm'
    if (uploadedDoc?.status === 'error') return 'border-red-400 bg-red-50 shadow-sm'
    if (uploadedDoc?.status === 'uploaded') return 'border-accent bg-accent/5 shadow-md'
    if (uploadedDoc?.status === 'uploading') return 'border-primary bg-primary/5 shadow-sm'
    if (isDragOver) return 'border-primary bg-primary/10 shadow-lg'
    return 'border-primary/30 hover:border-primary hover:bg-primary/5 hover:shadow-md'
  }

  const getStatusIcon = () => {
    if (uploadedDoc?.isRequested) return <AlertCircle className="h-6 w-6 text-orange-500" />
    if (uploadedDoc?.status === 'error') return <X className="h-6 w-6 text-red-500" />
    if (uploadedDoc?.status === 'uploaded') return <CheckCircle className="h-6 w-6 text-accent" />
    if (uploadedDoc?.status === 'uploading') return <Upload className="h-6 w-6 text-primary animate-pulse" />
    return <Upload className="h-6 w-6 text-primary" />
  }

  const getStatusText = () => {
    if (uploadedDoc?.isRequested) return t('documents.reuploadRequired')
    if (uploadedDoc?.status === 'error') return t('documents.uploadError')
    if (uploadedDoc?.status === 'uploaded') return t('documents.verified')
    if (uploadedDoc?.status === 'uploading') return t('documents.uploading')
    return t('documents.dragDropFiles')
  }

  return (
    <>
      <div className={`${className}`}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`
            relative rounded-xl border-2 border-dashed p-4 transition-all duration-200 cursor-pointer
            ${getStatusColor()}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={uploadedDoc ? undefined : handleClick}
        >
          {/* Document Preview Overlay */}
          {uploadedDoc && uploadedDoc.preview && (
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <img 
                src={uploadedDoc.preview} 
                alt="Document preview"
                className="w-full h-full object-cover opacity-20"
              />
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center gap-3 text-center min-h-[120px] justify-center">
            {/* Status Icon */}
            <div className="flex items-center justify-center">
              {getStatusIcon()}
            </div>

            {/* Document Label */}
            <div className="space-y-1">
                <h5 className="text-xs font-medium text-secondary flex items-center justify-center gap-1">
                {document.label}
                {document.required && <span className="text-red-500">*</span>}
                {uploadedDoc?.isRequested && (
                  <Badge variant="outline" className="text-orange-600 border-orange-400 ml-1 text-xs">
                    {t('documents.requested')}
                  </Badge>
                )}
              </h5>
              <p className="text-xs text-gray-500">{getStatusText()}</p>
            </div>

            {/* Upload Progress */}
            {uploadedDoc?.status === 'uploading' && (
              <div className="w-full">
                <Progress value={uploadedDoc.progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{uploadedDoc.progress}%</p>
              </div>
            )}

            {/* Rejection Reason */}
            {uploadedDoc?.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 w-full">
                <p className="text-xs text-red-700 font-medium">{t('documents.rejected')}:</p>
                <p className="text-xs text-red-600">{uploadedDoc.rejectionReason}</p>
              </div>
            )}

            {/* Action Buttons for Uploaded Documents */}
            {uploadedDoc && uploadedDoc.status === 'uploaded' && (
              <div className="flex items-center gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowPreview(true)
                  }}
                  className="h-8 px-2 text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  {t('common.view')}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 px-2"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onCrop && uploadedDoc.file.type.startsWith('image/') && (
                      <DropdownMenuItem onClick={() => onCrop(document.id)}>
                        <Crop className="w-4 h-4 mr-2" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onView(document.id)}>
                      <Download className="w-4 h-4 mr-2" />
                      {t('common.download')}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleClick}
                      className="text-orange-600"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {t('common.update')}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(document.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('common.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={document.accepted?.join(',') || 'image/*,application/pdf'}
            onChange={handleFileSelect}
          />
        </motion.div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{document.label}</DialogTitle>
            <DialogDescription>
              {t('documents.extractedInformation')}
            </DialogDescription>
          </DialogHeader>
          
          {uploadedDoc && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="flex justify-center">
                {uploadedDoc.file.type.startsWith('image/') ? (
                  <img 
                    src={uploadedDoc.preview} 
                    alt="Document preview"
                    className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-64 bg-surface rounded-lg">
                    <div className="text-center">
                      <Download className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-text-secondary">{t('documents.type')}</p>
                      <p className="text-sm text-gray-500">{uploadedDoc.file.name}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Document Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t('documents.fileName')}:</span>
                  <p className="text-text-secondary">{uploadedDoc.file.name}</p>
                </div>
                <div>
                  <span className="font-medium">{t('documents.fileSize')}:</span>
                  <p className="text-text-secondary">{(uploadedDoc.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div>
                  <span className="font-medium">{t('documents.type')}:</span>
                  <p className="text-text-secondary">{uploadedDoc.file.type}</p>
                </div>
                <div>
                  <span className="font-medium">{t('common.status')}:</span>
                  <Badge className={
                    uploadedDoc.status === 'uploaded' ? 'bg-green-100 text-green-800' :
                    uploadedDoc.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {t(`documents.${uploadedDoc.status}`)}
                  </Badge>
                </div>
              </div>

              {/* Extracted Data */}
              {uploadedDoc.extractedData && (
                <div>
                  <h4 className="font-medium mb-2">{t('documents.extractedInformation')}:</h4>
                  <div className="bg-surface-light p-3 rounded-lg">
                    <pre className="text-xs text-foreground whitespace-pre-wrap">
                      {JSON.stringify(uploadedDoc.extractedData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
