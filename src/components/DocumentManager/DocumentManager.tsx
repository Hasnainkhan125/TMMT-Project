import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DocumentUploadCard } from './DocumentUploadCard'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { FileCheck, CheckCircle } from 'lucide-react'

interface DocumentType {
  id: string
  label: string
  required: boolean
  category: 'sponsor' | 'sponsored' | 'establishment' | 'other'
  accepted?: string[]
  description?: string
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

interface DocumentManagerProps {
  documents: DocumentType[]
  uploadedDocuments: Record<string, UploadedDocument>
  onUpload: (docId: string, file: File) => Promise<void>
  onDelete: (docId: string) => void
  onContinue?: () => void
  className?: string
  disabled?: boolean
  requestedDocuments?: string[]
}

const DOCUMENT_DEFINITIONS: DocumentType[] = [
  // Sponsor Documents
  { id: 'sponsor_emirates_id', label: 'Emirates ID Copy', required: true, category: 'sponsor', accepted: ['image/*', 'application/pdf'] },
  { id: 'sponsor_passport', label: 'Passport Copy', required: true, category: 'sponsor', accepted: ['image/*', 'application/pdf'] },
  { id: 'sponsor_visa', label: 'Visa Copy', required: true, category: 'sponsor', accepted: ['image/*', 'application/pdf'] },
  { id: 'sponsor_salary_certificate', label: 'Salary Certificate', required: true, category: 'sponsor', accepted: ['image/*', 'application/pdf'] },
  { id: 'sponsor_bank', label: 'Bank Statement', required: false, category: 'sponsor', accepted: ['image/*', 'application/pdf'] },
  
  // Sponsored Person Documents
  { id: 'sponsored_passport_front', label: 'Passport Front Page', required: true, category: 'sponsored', accepted: ['image/*', 'application/pdf'] },
  { id: 'sponsored_passport_back', label: 'Passport Back Page', required: true, category: 'sponsored', accepted: ['image/*', 'application/pdf'] },
  { id: 'sponsored_photo', label: 'Personal Photo', required: true, category: 'sponsored', accepted: ['image/*'] },
  { id: 'birth_certificate', label: 'Birth Certificate', required: false, category: 'sponsored', accepted: ['image/*', 'application/pdf'] },
  { id: 'medical_certificate', label: 'Medical Certificate', required: false, category: 'sponsored', accepted: ['image/*', 'application/pdf'] },
  
  // Establishment Documents
  { id: 'trade_license', label: 'Trade License', required: true, category: 'establishment', accepted: ['image/*', 'application/pdf'] },
  { id: 'establishment_card', label: 'Establishment Card', required: true, category: 'establishment', accepted: ['image/*', 'application/pdf'] },
  { id: 'mol_card', label: 'MOL Card', required: false, category: 'establishment', accepted: ['image/*', 'application/pdf'] },
  { id: 'company_contract', label: 'Company Contract', required: false, category: 'establishment', accepted: ['image/*', 'application/pdf'] },
  { id: 'tenancy_contract', label: 'Tenancy Contract', required: false, category: 'establishment', accepted: ['image/*', 'application/pdf'] },
  
  // Other Documents
  { id: 'marriage_certificate', label: 'Marriage Certificate', required: false, category: 'other', accepted: ['image/*', 'application/pdf'] },
  { id: 'police_clearance', label: 'Police Clearance', required: false, category: 'other', accepted: ['image/*', 'application/pdf'] },
  { id: 'educational_certificate', label: 'Educational Certificates', required: false, category: 'other', accepted: ['image/*', 'application/pdf'] }
]

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents = DOCUMENT_DEFINITIONS,
  uploadedDocuments,
  onUpload,
  onDelete,
  onContinue,
  className = '',
  disabled = false,
  requestedDocuments = []
}) => {
  const [completionScore, setCompletionScore] = useState(0)
  const [categorizedDocs, setCategorizedDocs] = useState<Record<string, DocumentType[]>>({})

  // Calculate completion score
  useEffect(() => {
    const requiredDocs = documents.filter(doc => doc.required)
    const uploadedRequired = requiredDocs.filter(doc => 
      uploadedDocuments[doc.id]?.status === 'uploaded'
    )
    const score = requiredDocs.length > 0 ? Math.round((uploadedRequired.length / requiredDocs.length) * 100) : 0
    setCompletionScore(score)
  }, [documents, uploadedDocuments])

  // Categorize documents
  useEffect(() => {
    const categorized = documents.reduce((acc, doc) => {
      if (!acc[doc.category]) acc[doc.category] = []
      acc[doc.category].push(doc)
      return acc
    }, {} as Record<string, DocumentType[]>)
    
    setCategorizedDocs(categorized)
  }, [documents])

  const handleUpload = useCallback(async (docId: string, file: File) => {
    try {
      await onUpload(docId, file)
      toast.success('Document uploaded successfully')
    } catch (error) {
      toast.error('Upload failed. Please try again.')
      throw error
    }
  }, [onUpload])

  const handleView = useCallback((docId: string) => {
    const doc = uploadedDocuments[docId]
    if (doc?.preview) {
      // Open in new tab or download
      const link = document.createElement('a')
      link.href = doc.preview
      link.download = doc.file.name
      link.click()
    }
  }, [uploadedDocuments])

  const handleDelete = useCallback((docId: string) => {
    onDelete(docId)
    toast.success('Document deleted')
  }, [onDelete])


  const canContinue = () => {
    const requiredDocs = documents.filter(doc => doc.required)
    return requiredDocs.every(doc => uploadedDocuments[doc.id]?.status === 'uploaded')
  }

  const hasRequestedDocs = requestedDocuments.length > 0

  return (
    <div className={`flex flex-col h-full ${className} `}>
      {/* Enhanced Progress Header - Mobile Optimized */}
      <div className="bg-background border border-primary/30 rounded-lg shadow-sm flex-shrink-0 mb-2 sm:mb-3 lg:mb-4">
        <div className="p-2 sm:p-3 lg:p-4">
          <div className="space-y-1 sm:space-y-2">
            <Progress 
              value={completionScore} 
              className="h-2 sm:h-3 bg-surface" 
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary text-xs sm:text-sm">
                {Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length} of {documents.filter(doc => doc.required).length} required uploaded
              </span>
              <span className="text-primary font-medium text-xs sm:text-sm">
                {documents.length - Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length} remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Categories - Mobile Optimized */}
      <div className="flex-1 space-y-2 sm:space-y-3 lg:space-y-4 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-[#e7b555]/30 scrollbar-track-gray-100 min-h-0">
        <AnimatePresence>
          {Object.entries(categorizedDocs).map(([category, categoryDocs]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2 sm:space-y-3 lg:space-y-4"
            >
              {/* <div className="bg-background border border-primary/20 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <div className="text-primary">
                        {getCategoryIcon(category)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-primary font-semibold text-sm sm:text-base">
                        {getCategoryTitle(category)}
                      </h3>
                      <p className="text-text-secondary text-xs">
                        {getCategoryDescription(category)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        categoryDocs.filter(doc => uploadedDocuments[doc.id]?.status === 'uploaded').length === categoryDocs.filter(doc => doc.required).length
                          ? 'border-accent text-accent bg-accent/5'
                          : 'border-primary/30 text-text-secondary'
                      }`}
                    >
                      {categoryDocs.filter(doc => uploadedDocuments[doc.id]?.status === 'uploaded').length} / {categoryDocs.filter(doc => doc.required).length} required
                    </Badge>
                    {categoryDocs.some(doc => !doc.required) && (
                      <Badge variant="outline" className="text-xs border-border text-gray-500">
                        +{categoryDocs.filter(doc => !doc.required).length} optional
                      </Badge>
                    )}
                  </div>
                </div>
              </div> */}

              <div className="space-y-3">
                {categoryDocs.map((document) => {
                  const uploadedDoc = uploadedDocuments[document.id]
                  const isRequested = requestedDocuments.includes(document.id)
                  
                  return (
                    <div key={document.id} className="space-y-2">
                      {/* Document Info Card */}
                      <Card className={`transition-all duration-200 hidden md:block ${
                        uploadedDoc?.status === 'uploaded' 
                          ? 'border-green-200 bg-green-50/50' 
                          : uploadedDoc?.status === 'error'
                          ? 'border-red-200 bg-red-50/50'
                          : 'border-border hover:border-primary/50'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm">{document.label}</h3>
                                {document.required && (
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                                {!document.required && (
                                  <Badge variant="outline" className="text-xs">Optional</Badge>
                                )}
                              </div>
                              {document.description && (
                                <p className="text-xs text-muted-foreground">{document.description}</p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Accepted: {document.accepted?.join(', ') || 'Images, PDF'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {uploadedDoc?.status === 'uploaded' && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                              {uploadedDoc?.status === 'error' && (
                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                                  <span className="text-red-600 text-xs">!</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Upload Card */}
                      <DocumentUploadCard
                        document={document}
                        uploadedDoc={uploadedDoc ? {
                          ...uploadedDoc,
                          isRequested
                        } : undefined}
                        onUpload={handleUpload}
                        onDelete={handleDelete}
                        onView={handleView}
                        disabled={disabled}
                        className="w-full"
                      />
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Enhanced Continue Section */}
      {onContinue && (
        <div className="bg-background border border-primary/20 rounded-lg p-4 flex-shrink-0 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              {/* <h3 className="text-primary font-medium">Ready to Continue?</h3> */}
              <p className="text-text-secondary text-sm">
                {canContinue() 
                  ? hasRequestedDocs 
                    ? 'All requested documents have been uploaded successfully'
                    : 'All required documents are ready for review'
                  : `Upload ${documents.filter(doc => doc.required && !uploadedDocuments[doc.id]?.status).length} more required document${documents.filter(doc => doc.required && !uploadedDocuments[doc.id]?.status).length > 1 ? 's' : ''} to continue`
                }
              </p>
            </div>
            {canContinue() && (
              <CheckCircle className="w-8 h-8 text-accent" />
            )}
          </div>
          <Button
            onClick={onContinue}
            disabled={!canContinue() || disabled}
            size="lg"
            className="w-full bg-primary text-black hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
          >
            {hasRequestedDocs ? 'Submit ' : 'Continue to Review'}
            <FileCheck className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
