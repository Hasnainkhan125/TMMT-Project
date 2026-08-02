import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Progress } from './progress';
import { Badge } from './badge';
import { Separator } from './separator';
import { ScrollArea } from './scroll-area';
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Download,
  Trash2,
  Camera,
  Scan,
  FolderOpen,
  Cloud,
  Shield,
  Clock
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  fileTypes: string[];
  maxSize: number;
  category: 'personal' | 'sponsor' | 'sponsored';
  priority: 'high' | 'medium' | 'low';
}

interface UploadedDocument {
  id: string;
  originalName: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  status: 'uploading' | 'completed' | 'failed' | 'verifying';
  progress?: number;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  errorMessage?: string;
}

interface EnhancedDocumentUploaderProps {
  requiredDocuments: DocumentRequirement[];
  onUploadComplete: (documents: UploadedDocument[]) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
  showPreview?: boolean;
  enableScanning?: boolean;
  enableOCR?: boolean;
  className?: string;
}

const EnhancedDocumentUploader: React.FC<EnhancedDocumentUploaderProps> = ({
  requiredDocuments,
  onUploadComplete,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/*', 'application/pdf'],
  showPreview = true,
  enableScanning = true,
  enableOCR = true,
  className = ''
}) => {
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDocument>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scanning, setScanning] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (fileType === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-foreground border-border';
    }
  };

  const validateFile = (file: File, requirement: DocumentRequirement): string | null => {
    if (file.size > requirement.maxSize) {
      return `File size must be less than ${formatFileSize(requirement.maxSize)}`;
    }

    const isValidType = requirement.fileTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/');
      if (type === 'application/pdf') return file.type === 'application/pdf';
      return file.type === type;
    });

    if (!isValidType) {
      return `File type must be one of: ${requirement.fileTypes.join(', ')}`;
    }

    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[], event: any) => {
    const { name } = event.target.dataset;
    const requirement = requiredDocuments.find(doc => doc.id === name);
    
    if (!requirement || acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const validationError = validateFile(file, requirement);

    if (validationError) {
      setErrors(prev => ({ ...prev, [name]: validationError }));
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });

    const uploadedDoc: UploadedDocument = {
      id: `${name}-${Date.now()}`,
      originalName: file.name,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date(),
      status: 'uploading',
      progress: 0,
      verificationStatus: 'pending'
    };

    setUploadedDocs(prev => ({ ...prev, [name]: uploadedDoc }));
    setUploading(prev => ({ ...prev, [name]: true }));

    // Simulate upload progress with verification
    const uploadInterval = setInterval(() => {
      setUploadedDocs(prev => {
        const doc = prev[name];
        if (!doc) return prev;

        const newProgress = Math.min(doc.progress! + Math.random() * 30, 100);
        
        if (newProgress >= 100) {
          clearInterval(uploadInterval);
          setUploading(prev => ({ ...prev, [name]: false }));
          
          // Start verification process
          setTimeout(() => {
            setUploadedDocs(prev => ({
              ...prev,
              [name]: { ...prev[name], status: 'verifying' as const }
            }));
            
            // Simulate verification
            setTimeout(() => {
              setUploadedDocs(prev => ({
                ...prev,
                [name]: { 
                  ...prev[name], 
                  status: 'completed' as const,
                  verificationStatus: 'verified' as const
                }
              }));
            }, 2000);
          }, 500);
          
          return {
            ...prev,
            [name]: { ...doc, status: 'completed', progress: 100 }
          };
        }

        return {
          ...prev,
          [name]: { ...doc, progress: newProgress }
        };
      });
    }, 200);
  }, [requiredDocuments]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    multiple: false
  });

  const removeDocument = (docId: string) => {
    setUploadedDocs(prev => {
      const newDocs = { ...prev };
      delete newDocs[docId];
      return newDocs;
    });
  };

  const handleScanDocument = async (requirementId: string) => {
    setScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setScanning(false);
      // Here you would integrate with actual scanning API
    }, 3000);
  };

  const handleOCRProcessing = async (requirementId: string) => {
    setOcrProcessing(true);
    // Simulate OCR process
    setTimeout(() => {
      setOcrProcessing(false);
      // Here you would integrate with actual OCR API
    }, 2000);
  };

  const handleContinue = () => {
    const completedDocs = Object.values(uploadedDocs).filter(doc => doc.status === 'completed');
    onUploadComplete(completedDocs);
  };

  const getRequiredCount = () => requiredDocuments.filter(doc => doc.required).length;
  const getUploadedCount = () => Object.values(uploadedDocs).filter(doc => doc.status === 'completed').length;
  const canContinue = getUploadedCount() >= getRequiredCount();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Shield className="w-5 h-5" />
            Document Upload Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">
                {getUploadedCount()} of {getRequiredCount()} required documents uploaded
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {Math.round((getUploadedCount() / getRequiredCount()) * 100)}% Complete
              </Badge>
            </div>
            <Progress 
              value={(getUploadedCount() / getRequiredCount()) * 100} 
              className="h-3"
            />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-background rounded-lg p-3 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{getUploadedCount()}</div>
                <div className="text-xs text-blue-600">Uploaded</div>
              </div>
              <div className="bg-background rounded-lg p-3 border border-blue-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {Object.values(uploadedDocs).filter(doc => doc.status === 'verifying').length}
                </div>
                <div className="text-xs text-yellow-600">Verifying</div>
              </div>
              <div className="bg-background rounded-lg p-3 border border-blue-200">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(uploadedDocs).filter(doc => doc.verificationStatus === 'verified').length}
                </div>
                <div className="text-xs text-green-600">Verified</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Requirements */}
      <div className="space-y-4">
        {requiredDocuments.map((doc) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <Card className="border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-foreground text-lg">{doc.name}</h4>
                      <Badge variant={doc.required ? "destructive" : "secondary"}>
                        {doc.required ? 'Required' : 'Optional'}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(doc.priority)}>
                        {doc.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">{doc.description}</p>
                  </div>
                </div>

                {/* File Requirements */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-3">
                  <span>📏 Max size: {formatFileSize(doc.maxSize)}</span>
                  <span>📄 Types: {doc.fileTypes.join(', ')}</span>
                  <span>🏷️ Category: {doc.category}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {uploadedDocs[doc.id] ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div className="flex items-center gap-2">
                            {getFileIcon(uploadedDocs[doc.id].fileType)}
                            <span className="font-medium text-green-800">
                              {uploadedDocs[doc.id].originalName}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {showPreview && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-100">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Preview Document</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-100">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove this document? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeDocument(doc.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      {/* Upload Progress */}
                      {uploading[doc.id] && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm text-green-700 mb-2">
                            <span>Uploading...</span>
                            <span>{Math.round(uploadedDocs[doc.id].progress || 0)}%</span>
                          </div>
                          <Progress 
                            value={uploadedDocs[doc.id].progress || 0} 
                            className="h-2"
                          />
                        </div>
                      )}

                      {/* Verification Status */}
                      {uploadedDocs[doc.id].status === 'verifying' && (
                        <div className="mt-3 flex items-center gap-2 text-yellow-700">
                          <Clock className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Verifying document...</span>
                        </div>
                      )}

                      {/* File Info */}
                      <div className="mt-3 text-xs text-green-600">
                        Size: {formatFileSize(uploadedDocs[doc.id].fileSize)} • 
                        Uploaded: {uploadedDocs[doc.id].uploadedAt.toLocaleTimeString()} •
                        Status: {uploadedDocs[doc.id].verificationStatus === 'verified' ? '✅ Verified' : '⏳ Pending'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Error Message */}
                    {errors[doc.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{errors[doc.id]}</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Upload Zone */}
                    <div
                      {...getRootProps()}
                      data-name={doc.id}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                        isDragActive ? 'border-blue-400 bg-blue-50' : 'border-border hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <input {...getInputProps()} data-name={doc.id} />
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                        <div>
                          <p className="text-text-secondary font-medium mb-2">
                            {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to select'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {doc.fileTypes.join(', ')} • Max {formatFileSize(doc.maxSize)}
                          </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-2">
                          <Button size="sm" variant="outline" className="gap-2">
                            <FolderOpen className="w-4 h-4" />
                            Browse Files
                          </Button>
                          
                          {enableScanning && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleScanDocument(doc.id);
                              }}
                              className="gap-2"
                              disabled={scanning}
                            >
                              <Camera className="w-4 h-4" />
                              {scanning ? 'Scanning...' : 'Scan Document'}
                            </Button>
                          )}
                          
                          {enableOCR && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOCRProcessing(doc.id);
                              }}
                              className="gap-2"
                              disabled={ocrProcessing}
                            >
                              <Scan className="w-4 h-4" />
                              {ocrProcessing ? 'Processing...' : 'OCR Extract'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!canContinue}
          className={`px-8 py-4 text-lg font-semibold ${
            canContinue
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          {canContinue ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Continue with Application
            </div>
          ) : (
            `Upload ${getRequiredCount() - getUploadedCount()} more required documents`
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default EnhancedDocumentUploader; 