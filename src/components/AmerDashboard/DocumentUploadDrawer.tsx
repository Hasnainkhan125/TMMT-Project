import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MobileDrawer, CollapsibleSection, DrawerActionButton } from '@/components/ui/mobile-drawer';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface DocumentFile {
  file: File;
  id: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface DocumentUploadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onDocumentsUploaded: (documents: any[]) => void;
  existingDocuments?: Array<{
    id: string;
    filename: string;
    type: string;
    verificationStatus: string;
  }>;
}

const documentTypes = [
  { value: 'emirates_id', label: 'Emirates ID', required: true },
  { value: 'passport', label: 'Passport', required: true },
  { value: 'residence_visa', label: 'Residence Visa', required: true },
  { value: 'marriage_certificate', label: 'Marriage Certificate', required: true },
  { value: 'salary_certificate', label: 'Salary Certificate', required: true },
  { value: 'bank_statement', label: 'Bank Statement', required: true },
  { value: 'utility_bill', label: 'Utility Bill', required: false },
  { value: 'other', label: 'Other Document', required: false },
];

export const DocumentUploadDrawer: React.FC<DocumentUploadDrawerProps> = ({
  isOpen,
  onClose,
  applicationId,
  onDocumentsUploaded,
  existingDocuments = [],
}) => {
  const { t } = useTranslation()
  const [uploadedFiles, setUploadedFiles] = useState<DocumentFile[]>([]);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: DocumentFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading',
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload progress
    newFiles.forEach((file, index) => {
      const interval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, progress: Math.min(f.progress + 10, 100) }
              : f
          )
        );
        
        if (file.progress >= 100) {
          clearInterval(interval);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { ...f, status: 'success' }
                : f
            )
          );
        }
      }, 100);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUpload = async () => {
    if (!documentType || uploadedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const documents = uploadedFiles.map(file => ({
        filename: file.file.name,
        type: documentType,
        description,
        size: file.file.size,
        uploadedAt: new Date().toISOString(),
      }));

      onDocumentsUploaded(documents);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) {
      return <File className="w-8 h-8 text-red-500" />;
    }
    return <File className="w-8 h-8 text-blue-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <MobileDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t('documents.uploadDocument')}
      size="lg"
      position="right"
    >
      <div className="p-4 space-y-6">
        {/* Document Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="documentType">{t('documents.documentType')} *</Label>
          <select
            id="documentType"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('placeholder.selectDocumentType')}</option>
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label} {type.required && '(Required)'}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">{t('common.description')}</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('placeholder.enterDescription')}
            rows={3}
          />
        </div>

        {/* Existing Documents */}
        {existingDocuments.length > 0 && (
          <CollapsibleSection title={t('documents.title')} defaultOpen={false}>
            <div className="space-y-3">
              {existingDocuments.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.filename}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={doc.verificationStatus === 'verified' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {doc.verificationStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* File Upload Area */}
        <div className="space-y-3">
          <Label>{t('common.upload')}</Label>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-border hover:border-gray-400 hover:bg-surface-light'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-text-secondary mb-1">
              {isDragActive ? t('documents.dragDropFiles') : t('documents.dragDropFiles')}
            </p>
            <p className="text-xs text-gray-500">
              {t('documents.supportedFormats')}
            </p>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <Label>{t('documents.title')}</Label>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-surface-light rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="h-1 mt-1" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(file.status)}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{t('documents.uploading')}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <DrawerActionButton
            onClick={handleUpload}
            disabled={!documentType || uploadedFiles.length === 0 || isUploading}
            variant="primary"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('documents.uploading')}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {t('documents.uploadDocument')}
              </>
            )}
          </DrawerActionButton>
          
          <DrawerActionButton
            onClick={onClose}
            variant="secondary"
            disabled={isUploading}
          >
            {t('common.cancel')}
          </DrawerActionButton>
        </div>
      </div>
    </MobileDrawer>
  );
};
