import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  Loader2,
  FileText,
  Shield,
  Sparkles,
  Brain,
  Camera,
  Scan,
  Download,
  Edit,
  X,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Import sample document images
import sampleEmiratesId from '@/assets/sample-emirates-id.jpg';
import samplePassport from '@/assets/sample-passport.jpg';
import sampleVisa from '@/assets/sample-visa.jpg';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  sampleImage: string;
  required: boolean;
  priority: 'high' | 'medium' | 'low';
  extractedFields: string[];
  apiEndpoint: string;
}

interface UploadedDocument {
  id: string;
  file: File;
  documentType: DocumentType;
  preview?: string;
  status: 'uploading' | 'scanning' | 'extracting' | 'completed' | 'error';
  progress: number;
  extractedText?: string;
  extractedData?: Record<string, any>;
  error?: string;
  confidence?: number;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'emirates-id',
    name: 'Emirates ID',
    description: 'Valid UAE Emirates ID (front side)',
    sampleImage: sampleEmiratesId,
    required: true,
    priority: 'high',
    extractedFields: ['ID Number', 'Full Name', 'Nationality', 'Date of Birth', 'Expiry Date'],
    apiEndpoint: '/api/ocr/emirates-id'
  },
  {
    id: 'passport',
    name: 'Passport',
    description: 'Valid passport information page',
    sampleImage: samplePassport,
    required: true,
    priority: 'high',
    extractedFields: ['Passport Number', 'Full Name', 'Nationality', 'Date of Birth', 'Expiry Date', 'Place of Birth'],
    apiEndpoint: '/api/ocr/passport'
  },
  {
    id: 'visa',
    name: 'UAE Visa',
    description: 'Current UAE visa or residence permit',
    sampleImage: sampleVisa,
    required: true,
    priority: 'high',
    extractedFields: ['Visa Number', 'Visa Type', 'Issue Date', 'Expiry Date', 'Sponsor Details'],
    apiEndpoint: '/api/ocr/visa'
  }
];

interface DocumentScannerProps {
  onComplete: (documents: UploadedDocument[]) => void;
  className?: string;
}

const DocumentScanner: React.FC<DocumentScannerProps> = ({ onComplete, className = '' }) => {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null);
  const [editingText, setEditingText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentDocumentType = DOCUMENT_TYPES[currentStep];
  const completionPercentage = (uploadedDocuments.filter(doc => doc.status === 'completed').length / DOCUMENT_TYPES.length) * 100;

  // OCR API simulation
  const performOCR = async (file: File, documentType: DocumentType): Promise<{ text: string; data: Record<string, any>; confidence: number }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Mock OCR results based on document type
    const mockResults = {
      'emirates-id': {
        text: `UNITED ARAB EMIRATES
        IDENTITY CARD
        
        Name: Ahmed Al Mansouri
        ID Number: 784-1995-1234567-89
        Nationality: United Arab Emirates
        Date of Birth: 15/08/1990
        Issue Date: 10/01/2020
        Expiry Date: 09/01/2030`,
        data: {
          fullName: 'Ahmed Al Mansouri',
          idNumber: '784-1995-1234567-89',
          nationality: 'United Arab Emirates',
          dateOfBirth: '15/08/1990',
          issueDate: '10/01/2020',
          expiryDate: '09/01/2030'
        },
        confidence: 0.95
      },
      'passport': {
        text: `PAKISTAN PASSPORT
        
        Type: P
        Country Code: PAK
        Passport No.: AB1234567
        Surname: KHAN
        Given Names: HASSAN
        Nationality: PAKISTAN
        Date of Birth: 12/03/1995
        Place of Birth: KARACHI
        Date of Issue: 15/06/2020
        Date of Expiry: 14/06/2030`,
        data: {
          passportNumber: 'AB1234567',
          fullName: 'Hassan Khan',
          nationality: 'Pakistan',
          dateOfBirth: '12/03/1995',
          placeOfBirth: 'Karachi',
          issueDate: '15/06/2020',
          expiryDate: '14/06/2030'
        },
        confidence: 0.92
      },
      'visa': {
        text: `UNITED ARAB EMIRATES
        ENTRY PERMIT / RESIDENCE VISA
        
        Permit No: 12345678901234
        Name: Sarah Johnson
        Nationality: United Kingdom
        Passport No: 987654321
        Visa Type: Employment Visa
        Issue Date: 20/03/2023
        Expiry Date: 19/03/2026
        Sponsor: Dubai Technologies LLC`,
        data: {
          visaNumber: '12345678901234',
          fullName: 'Sarah Johnson',
          nationality: 'United Kingdom',
          passportNumber: '987654321',
          visaType: 'Employment Visa',
          issueDate: '20/03/2023',
          expiryDate: '19/03/2026',
          sponsor: 'Dubai Technologies LLC'
        },
        confidence: 0.89
      }
    };

    return mockResults[documentType.id as keyof typeof mockResults] || {
      text: 'Could not extract text from document',
      data: {},
      confidence: 0.5
    };
  };

  const processDocument = async (file: File, documentType: DocumentType) => {
    const documentId = `${Date.now()}-${Math.random()}`;
    const newDocument: UploadedDocument = {
      id: documentId,
      file,
      documentType,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'uploading',
      progress: 0
    };

    setUploadedDocuments(prev => [...prev, newDocument]);
    setIsProcessing(true);

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadedDocuments(prev =>
          prev.map(doc =>
            doc.id === documentId ? { ...doc, progress } : doc
          )
        );
      }

      // Start OCR scanning
      setUploadedDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId ? { ...doc, status: 'scanning' } : doc
        )
      );

      // Perform OCR
      const ocrResult = await performOCR(file, documentType);

      // Update document with results
      setUploadedDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId ? {
            ...doc,
            status: 'completed',
            extractedText: ocrResult.text,
            extractedData: ocrResult.data,
            confidence: ocrResult.confidence
          } : doc
        )
      );

      toast.success(`✅ ${documentType.name} processed successfully!`);

      // Auto-advance to next document if available
      if (currentStep < DOCUMENT_TYPES.length - 1) {
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, 1500);
      } else {
        // All documents completed
        setTimeout(() => {
          const completedDocuments = uploadedDocuments.filter(doc => doc.status === 'completed');
          onComplete([...completedDocuments, newDocument]);
        }, 1500);
      }

    } catch (error) {
      setUploadedDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId ? { ...doc, status: 'error', error: 'OCR processing failed' } : doc
        )
      );
      toast.error(`❌ Failed to process ${documentType.name}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && currentDocumentType) {
      processDocument(acceptedFiles[0], currentDocumentType);
    }
  }, [currentDocumentType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  const handleFileSelect = (documentType: DocumentType) => {
    setCurrentStep(DOCUMENT_TYPES.findIndex(dt => dt.id === documentType.id));
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentDocumentType) {
      processDocument(file, currentDocumentType);
    }
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

  const handleEditText = (document: UploadedDocument) => {
    setSelectedDocument(document);
    setEditingText(document.extractedText || '');
  };

  const saveEditedText = () => {
    if (selectedDocument) {
      setUploadedDocuments(prev =>
        prev.map(doc =>
          doc.id === selectedDocument.id 
            ? { ...doc, extractedText: editingText }
            : doc
        )
      );
      setSelectedDocument(null);
      toast.success('Text updated successfully!');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return <Upload className="w-4 h-4 text-primary animate-pulse" />;
      case 'scanning': return <Scan className="w-4 h-4 text-warning animate-scan" />;
      case 'extracting': return <Brain className="w-4 h-4 text-primary animate-glow" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-government flex items-center justify-center shadow-elegant">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            UAE Government Document Scanner
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered OCR extraction for official documents
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Document Verification Progress</span>
            <span>{Math.round(completionPercentage)}% Complete</span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </div>
      </div>

      {/* Document Type Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {DOCUMENT_TYPES.map((docType, index) => {
          const isCompleted = uploadedDocuments.some(doc => 
            doc.documentType.id === docType.id && doc.status === 'completed'
          );
          const isProcessing = uploadedDocuments.some(doc => 
            doc.documentType.id === docType.id && ['uploading', 'scanning', 'extracting'].includes(doc.status)
          );
          const isCurrent = currentStep === index;

          return (
            <motion.div
              key={docType.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-glow ${
                  isCurrent ? 'ring-2 ring-primary shadow-glow' : ''
                } ${isCompleted ? 'bg-success/5 border-success/30' : ''}`}
                onClick={() => !isProcessing && handleFileSelect(docType)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : isProcessing ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      ) : (
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      )}
                      {docType.name}
                    </CardTitle>
                    <Badge className={getPriorityColor(docType.priority)}>
                      {docType.priority}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Sample Image */}
                  <div className="relative mb-4 group">
                    <img 
                      src={docType.sampleImage} 
                      alt={`Sample ${docType.name}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-dashed border-muted"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <span className="text-white text-sm font-medium">Sample Document</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{docType.description}</p>

                  {/* Extracted Fields Preview */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">AI will extract:</span>
                    <div className="flex flex-wrap gap-1">
                      {docType.extractedFields.slice(0, 3).map((field, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                      {docType.extractedFields.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{docType.extractedFields.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className={`w-full mt-4 ${isCompleted ? 'bg-success hover:bg-success/90' : 'bg-gradient-primary hover:shadow-glow'}`}
                    disabled={isProcessing}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </CardContent>

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-primary animate-glow" />
                      </div>
                      <p className="font-medium text-primary">AI Processing</p>
                      <p className="text-sm text-muted-foreground">Extracting document data...</p>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Current Upload Area (Alternative Method) */}
      {currentStep < DOCUMENT_TYPES.length && (
        <Card className="border-2 border-dashed border-primary/30 hover:border-primary transition-colors">
          <CardContent className="p-8">
            <div {...getRootProps()} className="text-center">
              <input {...getInputProps()} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="space-y-4"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant">
                  {isDragActive ? (
                    <Download className="w-10 h-10 text-white animate-bounce" />
                  ) : (
                    <Camera className="w-10 h-10 text-white" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {isDragActive 
                      ? `Drop your ${currentDocumentType?.name} here` 
                      : `Upload ${currentDocumentType?.name}`
                    }
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop or click to select your document
                  </p>
                  
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Brain className="w-4 h-4 text-primary" />
                      <span>AI Powered</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-success" />
                      <span>Secure</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-warning" />
                      <span>Instant</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Documents */}
      <AnimatePresence>
        {uploadedDocuments.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Document Preview */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {doc.preview ? (
                      <img 
                        src={doc.preview} 
                        alt="Document preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>

                  {/* Document Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{doc.documentType.name}</h3>
                      {getStatusIcon(doc.status)}
                      <Badge variant="outline" className={getPriorityColor(doc.documentType.priority)}>
                        {doc.documentType.priority}
                      </Badge>
                      {doc.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(doc.confidence * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {doc.file.name} • {(doc.file.size / 1024 / 1024).toFixed(1)}MB
                    </p>

                    {/* Progress Bar */}
                    {['uploading', 'scanning'].includes(doc.status) && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{doc.status === 'uploading' ? 'Uploading...' : 'AI Scanning...'}</span>
                          <span>{doc.progress}%</span>
                        </div>
                        <Progress value={doc.progress} className="h-2" />
                      </div>
                    )}

                    {/* Extracted Data Preview */}
                    {doc.status === 'completed' && doc.extractedData && (
                      <div className="mt-3 p-3 bg-success/5 border border-success/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm font-medium text-success-foreground">Data Extracted Successfully</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(doc.extractedData).slice(0, 4).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-muted-foreground">{key}:</span>
                              <span className="ml-1 font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error Display */}
                    {doc.status === 'error' && (
                      <Alert variant="destructive" className="mt-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{doc.error}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {doc.status === 'completed' && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View Text
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Extracted Text - {doc.documentType.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-muted rounded-lg">
                                <pre className="text-sm whitespace-pre-wrap">{doc.extractedText}</pre>
                              </div>
                              <Button onClick={() => handleEditText(doc)} className="w-full">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Extracted Text
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Rescan
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => removeDocument(doc.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Edit Text Dialog */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Extracted Text - {selectedDocument.documentType.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                rows={15}
                className="font-mono text-sm"
                placeholder="Edit the extracted text here..."
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDocument(null)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={saveEditedText} className="bg-gradient-primary">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Completion Status */}
      {completionPercentage === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-success flex items-center justify-center shadow-glow animate-float">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-success mb-2">All Documents Processed!</h2>
          <p className="text-muted-foreground mb-6">
            Your documents have been successfully scanned and data extracted.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-government hover:shadow-glow"
            onClick={() => onComplete(uploadedDocuments.filter(doc => doc.status === 'completed'))}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Continue to Application
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default DocumentScanner;