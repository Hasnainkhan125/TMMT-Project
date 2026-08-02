"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import { Progress } from "../../../components/ui/progress"
import { Upload, type File, X, Eye, Download, CheckCircle } from "lucide-react"
import { useKYCStore, type UploadedDocument } from "../../../store/kycStore"
import { toast } from "sonner"

interface FileUploadProps {
  documentType: "identity" | "address" | "bank" | "funds"
  title: string
  description: string
  acceptedTypes: string[]
  maxSize: number
}

export const FileUpload: React.FC<FileUploadProps> = ({ documentType, title, description, acceptedTypes, maxSize }) => {
  const { data, addDocument, removeDocument, updateDocument } = useKYCStore()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const existingDocument = data.documents.find((doc) => doc.documentType === documentType)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Validate file
      if (file.size > maxSize) {
        toast.error(`File size must be less than ${formatFileSize(maxSize)}`)
        return
      }

      if (!acceptedTypes.includes(file.type)) {
        toast.error(`File type not supported. Accepted types: ${acceptedTypes.join(", ")}`)
        return
      }

      setIsUploading(true)
      setUploadProgress(0)

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)

        // Here you would upload to your actual storage service
        // const uploadResult = await uploadToStorage(file)

        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        clearInterval(progressInterval)
        setUploadProgress(100)

        const uploadedDocument: UploadedDocument = {
          id: `${documentType}-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file), // In production, use the actual uploaded URL
          uploadedAt: new Date(),
          documentType,
          status: "uploaded",
        }

        if (existingDocument) {
          updateDocument(existingDocument.id, uploadedDocument)
        } else {
          addDocument(uploadedDocument)
        }

        toast.success("Document uploaded successfully")
      } catch (error) {
        toast.error("Upload failed. Please try again.")
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [documentType, maxSize, acceptedTypes, existingDocument, addDocument, updateDocument],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: 1,
    disabled: isUploading,
  })

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleRemove = () => {
    if (existingDocument) {
      URL.revokeObjectURL(existingDocument.url)
      removeDocument(existingDocument.id)
      toast.success("Document removed")
    }
  }

  const handlePreview = () => {
    if (existingDocument) {
      if (existingDocument.type.startsWith("image/")) {
        window.open(existingDocument.url, "_blank")
      } else {
        // For PDFs and other files
        window.open(existingDocument.url, "_blank")
      }
    }
  }

  const handleDownload = () => {
    if (existingDocument) {
      const link = document.createElement("a")
      link.href = existingDocument.url
      link.download = existingDocument.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-foreground">{title}</h4>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>

        {existingDocument ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">{existingDocument.name}</p>
                  <p className="text-xs text-green-700">
                    {formatFileSize(existingDocument.size)} • Uploaded{" "}
                    {existingDocument.uploadedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handlePreview}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:text-red-700 bg-transparent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                isDragActive ? "border-blue-400 bg-blue-50" : "border-border hover:border-gray-400"
              } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-text-secondary">
                {isDragActive ? "Drop the file here..." : "Drag & drop a file here, or click to select"}
              </p>
              <p className="text-xs text-gray-500">
                Max size: {formatFileSize(maxSize)} • Accepted: {acceptedTypes.join(", ")}
              </p>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
