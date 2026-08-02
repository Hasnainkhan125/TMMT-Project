import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Image, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Trash2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DocumentRequirement } from '@/types/tammat.types';

interface UploadedDocument {
  id: string;
  file: File;
  requirementId: string;
  requirementName: string;
  category: 'sponsor' | 'sponsored';
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  preview?: string;
}

interface EnhancedDocumentUploaderProps {
  requiredDocuments: DocumentRequirement[];
  onUploadComplete: (documents: UploadedDocument[]) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
  className?: string;
}

const EnhancedDocumentUploader: React.FC<EnhancedDocumentUploaderProps> = ({
  requiredDocuments,
  onUploadComplete,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['image/*', 'application/pdf'],
  className = ''
}) => {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Group requirements by category
  const requirementsByCategory = useMemo(() => {
    const grouped = {
      sponsor: requiredDocuments.filter(doc => doc.category === 'sponsor'),
      sponsored: requiredDocuments.filter(doc => doc.category === 'sponsored')
    };
    return grouped;
  }, [requiredDocuments]);

  // Check if all required documents are uploaded
  const requiredDocumentsUploaded = useMemo(() => {
    const requiredDocs = requiredDocuments.filter(doc => doc.required);
    return requiredDocs.every(req => 
      uploadedDocuments.some(uploaded => 
        uploaded.requirementId === req.id && uploaded.status === 'completed'
      )
    );
  }, [requiredDocuments, uploadedDocuments]);

  // Check if sponsor documents are complete (required for sponsored documents)
  const sponsorDocumentsComplete = useMemo(() => {
    const requiredSponsorDocs = requirementsByCategory.sponsor.filter(doc => doc.required);
    return requiredSponsorDocs.every(req => 
      uploadedDocuments.some(uploaded => 
        uploaded.requirementId === req.id && uploaded.status === 'completed'
      )
    );
  }, [requirementsByCategory.sponsor, uploadedDocuments]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(rejection => {
        if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
          return `File "${rejection.file.name}" is too large. Maximum size is ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
        }
        if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
          return `File "${rejection.file.name}" has an invalid type. Allowed types: ${allowedTypes.join(', ')}`;
        }
        return `File "${rejection.file.name}" was rejected`;
      });
      setErrors(prev => [...prev, ...newErrors]);
      return;
    }

    // Process accepted files
    const newDocuments: UploadedDocument[] = acceptedFiles.map(file => {
      const requirement = requiredDocuments.find(req => 
        req.fileTypes.some(type => {
          if (type === 'image/*') return file.type.startsWith('image/');
          if (type === 'application/pdf') return file.type === 'application/pdf';
          return file.type === type;
        })
      );

      return {
        id: `${file.name}-${Date.now()}`,
        file,
        requirementId: requirement?.id || 'unknown',
        requirementName: requirement?.name || 'Unknown Requirement',
        category: requirement?.category || 'sponsor',
        progress: 0,
        status: 'uploading' as const,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      };
    });

    setUploadedDocuments(prev => [...prev, ...newDocuments]);
    simulateUpload(newDocuments);
  }, [requiredDocuments, maxFileSize, allowedTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple: true
  });

  const simulateUpload = (documents: UploadedDocument[]) => {
    setUploading(true);
    
    documents.forEach((doc, index) => {
      const interval = setInterval(() => {
        setUploadedDocuments(prev => prev.map(d => {
          if (d.id === doc.id) {
            const newProgress = Math.min(d.progress + Math.random() * 20, 100);
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...d, progress: 100, status: 'completed' as const };
            }
            return { ...d, progress: newProgress };
          }
          return d;
        }));
      }, 200 + index * 100);
    });

    // Complete upload after simulation
    setTimeout(() => {
      setUploading(false);
      onUploadComplete(uploadedDocuments.filter(doc => doc.status === 'completed'));
    }, 3000);
  };

  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => {
      const doc = prev.find(d => d.id === documentId);
      if (doc?.preview) {
        URL.revokeObjectURL(doc.preview);
      }
      return prev.filter(d => d.id !== documentId);
    });
  };

  const clearErrors = () => setErrors([]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'uploading':
        return <Upload className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'uploading':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-surface text-foreground border-border';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-border hover:border-gray-400 hover:bg-surface-light'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-foreground mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-text-secondary mb-4">
              or click to select files
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Maximum file size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB</p>
              <p>Allowed types: {allowedTypes.join(', ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sponsor Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Sponsor Documents
              {sponsorDocumentsComplete && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Complete
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requirementsByCategory.sponsor.map((req) => {
                const isUploaded = uploadedDocuments.some(
                  doc => doc.requirementId === req.id && doc.status === 'completed'
                );
                return (
                  <div
                    key={req.id}
                    className={`p-3 rounded-lg border-2 ${
                      isUploaded
                        ? 'border-green-200 bg-green-50'
                        : 'border-border bg-surface-light'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isUploaded ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="font-medium">{req.name}</span>
                        {req.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{req.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sponsored Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Sponsored Documents
              {sponsorDocumentsComplete && (
                <Badge variant="outline" className="text-blue-600">
                  Available
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requirementsByCategory.sponsored.map((req) => {
                const isUploaded = uploadedDocuments.some(
                  doc => doc.requirementId === req.id && doc.status === 'completed'
                );
                const canUpload = sponsorDocumentsComplete;
                
                return (
                  <div
                    key={req.id}
                    className={`p-3 rounded-lg border-2 ${
                      !canUpload
                        ? 'border-border bg-surface opacity-50'
                        : isUploaded
                        ? 'border-green-200 bg-green-50'
                        : 'border-border bg-surface-light'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!canUpload ? (
                          <Info className="w-4 h-4 text-gray-500" />
                        ) : isUploaded ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="font-medium">{req.name}</span>
                        {req.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{req.description}</p>
                    {!canUpload && (
                      <p className="text-xs text-gray-500 mt-2">
                        Complete sponsor documents first
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Documents */}
      {uploadedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Uploaded Documents ({uploadedDocuments.filter(d => d.status === 'completed').length}/{uploadedDocuments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedDocuments.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(doc.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{doc.file.name}</span>
                      <Badge variant="outline" className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                      <Badge variant="outline">
                        {doc.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{doc.requirementName}</p>
                    
                    {doc.status === 'uploading' && (
                      <div className="space-y-1">
                        <Progress value={doc.progress} className="h-2" />
                        <p className="text-xs text-gray-500">{Math.round(doc.progress)}% uploaded</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.preview && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.preview, '_blank')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Preview document</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              {errors.map((error, index) => (
                <p key={index} className="text-sm">{error}</p>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={clearErrors}
                className="mt-2"
              >
                Clear Errors
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Status */}
      {uploading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-blue-600 animate-pulse" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">Uploading documents...</p>
                <p className="text-sm text-blue-700">
                  Please wait while we process your files
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Status */}
      {requiredDocumentsUploaded && !uploading && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">All required documents uploaded!</p>
                <p className="text-sm text-green-700">
                  You can now proceed with your application
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedDocumentUploader;
