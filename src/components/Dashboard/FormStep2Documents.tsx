import React, { useState, useCallback } from 'react'
import type { FileInputConfig } from '@/types'
import { SERVICE_SCHEMAS, getServiceMetadata } from '@/config/services'
import { useForm } from '@/contexts/FormContext'
import { useFileUpload } from '@/hooks/useFileUpload'

/**
 * FormStep2Documents Component
 *
 * Second step of multi-step form wizard
 * - Drag-and-drop file upload with react-dropzone
 * - Accept PDF, JPG, PNG, HEIC (max 10MB)
 * - Show upload progress bar per file
 * - Display uploaded files with size and status
 * - Validate file types and size limits
 * - Support multi-upload for Nawakas service (up to 10 files)
 * - Include Back and Continue buttons (disabled if no files)
 */
const FormStep2Documents: React.FC = () => {
  const { state, setStep, removeDocument } = useForm()
  const { uploadFile } = useFileUpload()
  const [dragActive, setDragActive] = useState(false)
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({})

  if (!state.selectedService) {
    return <div className="text-center text-red-500">No service selected</div>
  }

  const schema = SERVICE_SCHEMAS[state.selectedService]
  const metadata = getServiceMetadata(state.selectedService)

  // Generate a mock application ID (in real app, this would be from API)
  const mockApplicationId = `app_${Date.now()}`

  /**
   * Validate file before upload
   */
  const validateFile = useCallback(
    (file: File, fileInput: FileInputConfig): string | null => {
      // Check file type
      const fileType = file.type
      const isValidType = fileInput.acceptedTypes.some((type) => {
        if (type === 'image/heic') {
          // Accept both .heic and .heif
          return fileType === 'image/heic' || fileType === 'image/heif'
        }
        return fileType === type
      })

      if (!isValidType) {
        const typesDisplay = fileInput.acceptedTypes
          .map((type) => {
            if (type === 'application/pdf') return 'PDF'
            if (type === 'image/jpeg') return 'JPG'
            if (type === 'image/png') return 'PNG'
            if (type === 'image/heic') return 'HEIC'
            return type
          })
          .join(', ')
        return `Invalid file type. Accepted: ${typesDisplay}`
      }

      // Check file size
      if (file.size > fileInput.maxFileSize) {
        const maxMb = (fileInput.maxFileSize / (1024 * 1024)).toFixed(1)
        return `File is too large. Maximum size: ${maxMb}MB`
      }

      return null
    },
    []
  )

  /**
   * Handle file selection from input
   */
  const handleFileSelect = useCallback(
    (files: FileList, fileInputName: string) => {
      const fileInput = schema.fileInputs.find((f) => f.name === fileInputName)
      if (!fileInput) return

      // Check how many files are already uploaded
      const uploadedCount = state.documents.filter(
        (doc) => doc.status !== 'error' && doc.status !== 'pending'
      ).length

      const filesToUpload = Array.from(files)
      const availableSlots = fileInput.maxFiles - uploadedCount

      if (filesToUpload.length > availableSlots) {
        setFileErrors((prev) => ({
          ...prev,
          [fileInputName]: `Can only upload ${availableSlots} more file(s)`,
        }))
        return
      }

      // Clear previous errors for this field
      setFileErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fileInputName]
        return newErrors
      })

      // Validate and upload each file
      filesToUpload.forEach((file) => {
        const error = validateFile(file, fileInput)
        if (error) {
          setFileErrors((prev) => ({
            ...prev,
            [fileInputName]: error,
          }))
          return
        }

        // Upload file
        uploadFile(file, mockApplicationId)
      })
    },
    [schema, state.documents, validateFile, uploadFile]
  )

  /**
   * Handle drag and drop
   */
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, fileInputName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files, fileInputName)
    }
  }

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Get status icon
   */
  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case 'uploading':
        return <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      case 'success':
        return <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      case 'error':
        return <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      default:
        return null
    }
  }

  /**
   * Check if form is complete (all required files uploaded)
   */
  const isFormComplete = (): boolean => {
    return schema.fileInputs.every((fileInput) => {
      if (!fileInput.required) return true
      const uploadedCount = state.documents.filter(
        (doc) => doc.status === 'success'
      ).length
      return uploadedCount >= 1
    })
  }

  /**
   * Handle continue button
   */
  const handleContinue = () => {
    if (isFormComplete()) {
      setStep(3)
    }
  }

  /**
   * Handle back button
   */
  const handleBack = () => {
    setStep(1)
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{metadata.icon}</span>
          <h1 className="text-3xl font-bold text-gray-900">{metadata.title}</h1>
        </div>
        <p className="text-gray-600">Step 2 of 4: Upload Documents</p>
      </div>

      {/* File Upload Areas */}
      <div className="space-y-8 mb-8">
        {schema.fileInputs.map((fileInput) => (
          <div key={fileInput.name}>
            <label className="block mb-3 font-semibold text-gray-900">
              {fileInput.label}
              {fileInput.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Drag and Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, fileInput.name)}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition duration-200
                ${dragActive ? 'border-gold-500 bg-gold-50' : 'border-gray-300 hover:border-gray-400'}
              `}
            >
              <input
                type="file"
                multiple={fileInput.maxFiles > 1}
                accept={fileInput.acceptedTypes.join(',')}
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileSelect(e.target.files, fileInput.name)
                  }
                }}
                className="hidden"
                id={`file-input-${fileInput.name}`}
              />

              <label
                htmlFor={`file-input-${fileInput.name}`}
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <svg
                  className="w-12 h-12 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-gray-700 font-semibold">
                  Drop files here or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supported: PDF, JPG, PNG, HEIC (max 10MB each)
                </p>
                {fileInput.maxFiles > 1 && (
                  <p className="text-sm text-gray-500">
                    Up to {fileInput.maxFiles} files
                  </p>
                )}
              </label>
            </div>

            {/* Help text */}
            {fileInput.helpText && (
              <p className="text-sm text-gray-500 mt-2">{fileInput.helpText}</p>
            )}

            {/* Error message */}
            {fileErrors[fileInput.name] && (
              <p className="text-sm text-red-500 mt-2">{fileErrors[fileInput.name]}</p>
            )}

            {/* Uploaded Files List */}
            {state.documents.length > 0 && (
              <div className="mt-4 space-y-2">
                {state.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-xl">📄</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(doc.size)}
                        </p>
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center gap-3">
                      {doc.status === 'uploading' && (
                        <div className="flex flex-col items-end gap-1">
                          <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold-500 transition-all"
                              style={{ width: `${doc.uploadProgress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{doc.uploadProgress}%</span>
                        </div>
                      )}
                      {doc.status === 'error' && (
                        <div className="flex flex-col items-end gap-1">
                          {getStatusIcon('error')}
                          <span className="text-xs text-red-500">Failed</span>
                        </div>
                      )}
                      {doc.status === 'success' && (
                        <div className="flex flex-col items-center gap-1">
                          {getStatusIcon('success')}
                          <span className="text-xs text-green-500">Done</span>
                        </div>
                      )}

                      {/* Remove button */}
                      {(doc.status === 'success' || doc.status === 'error') && (
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="ml-2 text-red-500 hover:text-red-700 transition"
                          title="Remove file"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!isFormComplete()}
          className={`
            flex-1 px-6 py-3 rounded-lg font-semibold transition
            ${isFormComplete()
              ? 'bg-gold-500 hover:bg-gold-600 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Continue
        </button>
      </div>

      {/* Info message */}
      {!isFormComplete() && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Please upload required documents to continue
        </p>
      )}
    </div>
  )
}

export default FormStep2Documents
