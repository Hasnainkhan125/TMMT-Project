'use client'

import { useCallback, useRef } from 'react'
import { useForm } from '@/contexts/FormContext'
import { useAuth } from '@/contexts/AuthContext'
import type { UploadedFile } from '@/types'

/**
 * Upload progress tracking
 */
interface UploadProgress {
  [documentId: string]: number
}

/**
 * Retry configuration for failed uploads
 */
interface RetryConfig {
  maxAttempts: number
  delayMs: number
  backoffMultiplier: number
}

/**
 * useFileUpload Hook
 *
 * Provides drag-drop file upload functionality with progress tracking:
 * - Uses XMLHttpRequest for granular upload progress tracking
 * - Uploads to POST {apiBase}/api/v1/visa/{applicationId}/attachments
 * - Dispatches form actions for upload state management
 * - Supports automatic retry on failure
 * - Returns uploadFile and retryUpload functions
 *
 * @returns Object with uploadFile and retryUpload functions
 */
export const useFileUpload = () => {
  const { state, addDocument, updateDocumentProgress, completeDocumentUpload, failDocumentUpload } = useForm()
  const { user } = useAuth()

  const uploadProgressRef = useRef<UploadProgress>({})
  const xhrRequestsRef = useRef<{ [documentId: string]: XMLHttpRequest }>({})
  const retryCountRef = useRef<{ [documentId: string]: number }>({})

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  const retryConfig: RetryConfig = {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  }

  /**
   * Get authorization header
   */
  const getAuthorizationHeader = useCallback(async (): Promise<string> => {
    // In a real app, get token from auth context or session
    // For now, return a placeholder that can be replaced with actual token logic
    if (user?.id) {
      // This would typically be a JWT token from your auth provider
      return `Bearer ${user.id}`
    }
    return ''
  }, [user])

  /**
   * Upload a single file
   */
  const uploadFile = useCallback(
    async (file: File, applicationId: string) => {
      if (!file) {
        console.error('No file provided for upload')
        return
      }

      // Create document entry with pending status
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const uploadedFile: UploadedFile = {
        id: documentId,
        name: file.name,
        size: file.size,
        status: 'uploading',
        uploadProgress: 0,
      }

      // Add document to form state
      addDocument(uploadedFile)

      // Initialize retry count
      retryCountRef.current[documentId] = 0

      try {
        await performUpload(file, applicationId, documentId)
      } catch (error) {
        console.error(`Upload failed for document ${documentId}:`, error)
        failDocumentUpload(documentId, `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    },
    [addDocument, updateDocumentProgress, completeDocumentUpload, failDocumentUpload]
  )

  /**
   * Perform the actual file upload using XMLHttpRequest
   */
  const performUpload = useCallback(
    async (file: File, applicationId: string, documentId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhrRequestsRef.current[documentId] = xhr

        // Upload progress tracking
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            uploadProgressRef.current[documentId] = progress
            updateDocumentProgress(documentId, progress)
          }
        })

        // Success handler
        xhr.addEventListener('load', async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              const uploadedUrl = response.uploadedUrl || response.fileUrl || response.url
              const uploadedAt = new Date()

              completeDocumentUpload(documentId, uploadedUrl, uploadedAt)
              resolve()
            } catch (error) {
              reject(new Error('Failed to parse upload response'))
            }
          } else {
            const errorMessage = `Upload failed with status ${xhr.status}`
            reject(new Error(errorMessage))
          }
        })

        // Error handler
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'))
        })

        // Timeout handler
        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload timeout'))
        })

        // Set timeout (30 seconds)
        xhr.timeout = 30000

        // Build upload URL
        const uploadUrl = `${apiBaseUrl}/api/v1/visa/${applicationId}/attachments`

        // Prepare form data
        const formData = new FormData()
        formData.append('file', file)
        formData.append('documentId', documentId)

        // Open request
        xhr.open('POST', uploadUrl, true)

        // Set authorization header if available
        getAuthorizationHeader().then((authHeader) => {
          if (authHeader) {
            xhr.setRequestHeader('Authorization', authHeader)
          }

          // Note: Don't set Content-Type header when using FormData
          // The browser will automatically set it with the correct boundary

          // Send request
          xhr.send(formData)
        })
      })
    },
    [updateDocumentProgress, completeDocumentUpload, failDocumentUpload, getAuthorizationHeader]
  )

  /**
   * Retry a failed upload with exponential backoff
   */
  const retryUpload = useCallback(
    async (documentId: string, applicationId: string, file: File) => {
      const currentAttempt = retryCountRef.current[documentId] || 0

      if (currentAttempt >= retryConfig.maxAttempts) {
        failDocumentUpload(
          documentId,
          `Upload failed after ${retryConfig.maxAttempts} attempts. Please try again.`
        )
        return
      }

      // Cancel any in-progress upload for this document
      if (xhrRequestsRef.current[documentId]) {
        xhrRequestsRef.current[documentId].abort()
        delete xhrRequestsRef.current[documentId]
      }

      // Calculate delay with exponential backoff
      const delay = retryConfig.delayMs * Math.pow(retryConfig.backoffMultiplier, currentAttempt)

      // Increment retry count
      retryCountRef.current[documentId] = currentAttempt + 1

      // Reset progress
      uploadProgressRef.current[documentId] = 0
      updateDocumentProgress(documentId, 0)

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))

      try {
        await performUpload(file, applicationId, documentId)
      } catch (error) {
        console.error(`Retry attempt ${retryCountRef.current[documentId]} failed for document ${documentId}:`, error)
        failDocumentUpload(documentId, `Retry failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    },
    [updateDocumentProgress, failDocumentUpload, performUpload, retryConfig]
  )

  /**
   * Cancel an in-progress upload
   */
  const cancelUpload = useCallback((documentId: string) => {
    if (xhrRequestsRef.current[documentId]) {
      xhrRequestsRef.current[documentId].abort()
      delete xhrRequestsRef.current[documentId]
    }

    // Reset progress
    if (uploadProgressRef.current[documentId] !== undefined) {
      delete uploadProgressRef.current[documentId]
    }
  }, [])

  return {
    uploadFile,
    retryUpload,
    cancelUpload,
  }
}
