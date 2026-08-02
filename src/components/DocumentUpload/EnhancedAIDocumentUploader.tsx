import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Brain,
  Camera,
  CheckCircle,
  CheckSquare,
  Clock,
  Eye,
  FileText,
  Loader2,
  Shield,
  Upload,
  X,
  Zap
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import emiratesIdSampleImage from './emirateID_sample.jpg';
import passportSample from './passport_sample.jpg';
import salaryCertificateSample from './Salary-Certificate-UAE.jpg';
interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: 'sponsor' | 'applicant' | 'accommodation' | 'financial';
  fileTypes: string[];
  maxSize: number;
  priority: 'high' | 'medium' | 'low';
  fields?: string[];
  sampleImage?: string; // Sample image URL
  sampleText?: string; // Sample extracted text
  order: number; // Processing order
}

interface ExtractedData {
  [key: string]: any;
}

interface UploadedDocument {
  id: string;
  file: File;
  requirementId: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'processing' | 'extracting' | 'review' | 'confirmed' | 'completed' | 'error';
  progress: number;
  extractedData?: ExtractedData;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  error?: string;
  confirmedByUser?: boolean;
}

interface AIDocumentUploaderProps {
  serviceName: string;
  serviceType: string;
  applicationId?: string;
  onUploadComplete: (documents: UploadedDocument[], extractedData: ExtractedData) => void;
  onDocumentsReady?: (documents: File[]) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
  className?: string;
}

// Sample document requirements with sample data
const getDocumentRequirements = (serviceType: string): DocumentRequirement[] => {
  return [
    {
      id: 'sponsor-emirates-id',
      name: 'Sponsor\'s Emirates ID',
      description: 'Valid Emirates ID of the sponsor - Front and back sides',
      required: true,
      category: 'sponsor',
      fileTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      priority: 'high',
      fields: ['emiratesIdNumber', 'sponsorName', 'sponsorNationality', 'expiryDate', 'dateOfBirth'],
      order: 1,
      sampleImage: emiratesIdSampleImage,
      sampleText: `Emirates ID Number: 784-1990-1234567-8
Sponsor Name: Ahmed Al Mansouri
Nationality: UAE
Date of Birth: 15-03-1985
Expiry Date: 15-03-2030`
    },
    {
      id: 'sponsor-passport',
      name: 'Sponsor\'s Passport',
      description: 'Valid passport copy of the sponsor - Bio data page',
      required: true,
      category: 'sponsor',
      fileTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      priority: 'high',
      fields: ['passportNumber', 'sponsorName', 'sponsorNationality', 'dateOfBirth', 'expiryDate', 'placeOfBirth'],
      order: 2,
      sampleImage: passportSample,
      sampleText: `Passport Number: A12345678
Surname: AL MANSOURI
Given Names: AHMED MOHAMMED
Nationality: UAE
Date of Birth: 15 MAR 1985
Place of Birth: DUBAI
Date of Issue: 10 JAN 2020
Date of Expiry: 09 JAN 2030`
    },
    {
      id: 'sponsor-salary',
      name: 'Salary Certificate',
      description: 'Minimum AED 4,000 monthly salary proof from employer',
      required: true,
      category: 'sponsor',
      fileTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      priority: 'high',
      fields: ['monthlySalary', 'companyName', 'position', 'employmentStartDate', 'employerName'],
      order: 3,
      sampleImage: salaryCertificateSample,
      sampleText: `Company Name: Dubai Technologies LLC
Position: Senior Software Engineer
Monthly Salary: AED 12,000
Employment Start Date: 01-01-2020
Employer Name: Mohammed Al Rashid
Issue Date: 15-01-2024`
    }
  ];
};

const EnhancedAIDocumentUploader: React.FC<AIDocumentUploaderProps> = ({
  serviceName,
  serviceType,
  applicationId,
  onUploadComplete,
  onDocumentsReady,
  maxFileSize = 10 * 1024 * 1024,
  allowedTypes = ['image/*', 'application/pdf'],
  className = ''
}) => {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [processingDocument, setProcessingDocument] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [confirmedData, setConfirmedData] = useState<ExtractedData>({});
  const [showExtractionReview, setShowExtractionReview] = useState(false);
  const [currentReviewDoc, setCurrentReviewDoc] = useState<UploadedDocument | null>(null);

  const requiredDocuments = useMemo(() => getDocumentRequirements(serviceType), [serviceType]);
  const currentRequirement = useMemo(() => 
    requiredDocuments.find(req => req.order === currentStep), 
    [requiredDocuments, currentStep]
  );

  // Real OCR API call to your microservice
  const extractTextWithOCR = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/extract-text', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`OCR failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error('OCR API error:', error);
      throw error;
    }
  };

  // AI Document Analysis using extracted text
  const analyzeDocumentWithAI = async (file: File, requirement: DocumentRequirement): Promise<ExtractedData> => {
    try {
      setProcessingDocument(requirement.id);
      
      // Extract text using OCR
      const extractedText = await extractTextWithOCR(file);
      
      // Parse extracted text and map to fields
      const parsedData = parseExtractedText(extractedText, requirement);
      
      toast.success(`✅ AI analysis completed for ${requirement.name}`);
      return parsedData;
      
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error(`❌ AI analysis failed for ${requirement.name}`);
      return {};
    } finally {
      setProcessingDocument(null);
    }
  };

  // Parse extracted text and map to form fields
  const parseExtractedText = (text: string, requirement: DocumentRequirement): ExtractedData => {
    const data: ExtractedData = {};
    
    if (!requirement.fields) return data;
    
    // Simple parsing logic - you can enhance this with more sophisticated NLP
    requirement.fields.forEach(field => {
      switch (field) {
        case 'emiratesIdNumber':
          const emiratesIdMatch = text.match(/(\d{3}-\d{4}-\d{7}-\d)/);
          if (emiratesIdMatch) data[field] = emiratesIdMatch[1];
          break;
        case 'passportNumber':
          const passportMatch = text.match(/([A-Z]\d{8})/);
          if (passportMatch) data[field] = passportMatch[1];
          break;
        case 'sponsorName':
        case 'applicantName':
          const nameMatch = text.match(/(?:Name|Surname|Given Names?):\s*([A-Z\s]+)/i);
          if (nameMatch) data[field] = nameMatch[1].trim();
          break;
        case 'monthlySalary':
          const salaryMatch = text.match(/AED\s*([\d,]+)/i);
          if (salaryMatch) data[field] = parseInt(salaryMatch[1].replace(/,/g, ''));
          break;
        case 'expiryDate':
          const expiryMatch = text.match(/(?:Expiry|Expiry Date):\s*(\d{2}[-\/]\d{2}[-\/]\d{4})/i);
          if (expiryMatch) data[field] = expiryMatch[1];
          break;
        case 'dateOfBirth':
          const dobMatch = text.match(/(?:Date of Birth|DOB):\s*(\d{2}[-\/]\d{2}[-\/]\d{4})/i);
          if (dobMatch) data[field] = dobMatch[1];
          break;
        default:
          // Try to find any relevant information
          const fieldMatch = text.match(new RegExp(`${field.replace(/([A-Z])/g, ' $1')}:\\s*([^\\n]+)`, 'i'));
          if (fieldMatch) data[field] = fieldMatch[1].trim();
      }
    });
    
    return data;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!currentRequirement) return;
    
    const file = acceptedFiles[0]; // Process one file at a time
    if (!file) return;

    // Create document object
    const newDocument: UploadedDocument = {
      id: `${Date.now()}-${Math.random()}`,
      file,
      requirementId: currentRequirement.id,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'uploading',
      progress: 0
    };

    setUploadedDocuments(prev => [...prev, newDocument]);
    
    // Process the document
    await processDocument(newDocument);
  }, [currentRequirement]);

  const processDocument = async (document: UploadedDocument) => {
    try {
      // Simulate upload progress
      await simulateUploadProgress(document.id);
      
      // Start AI analysis
      const requirement = requiredDocuments.find(req => req.id === document.requirementId);
      if (requirement && requirement.fields) {
        document.status = 'extracting';
        setUploadedDocuments(prev => prev.map(d => 
          d.id === document.id ? { ...d, status: 'extracting' } : d
        ));
        
        const extracted = await analyzeDocumentWithAI(document.file, requirement);
        document.extractedData = extracted;
        document.status = 'review';
        
        // Show extraction review
        setCurrentReviewDoc(document);
        setShowExtractionReview(true);
        
        setUploadedDocuments(prev => prev.map(d => 
          d.id === document.id ? { ...d, status: 'review', extractedData: extracted } : d
        ));
      } else {
        document.status = 'completed';
        setUploadedDocuments(prev => prev.map(d => 
          d.id === document.id ? { ...d, status: 'completed' } : d
        ));
      }
    } catch (error) {
      document.status = 'error';
      document.error = error instanceof Error ? error.message : 'Unknown error';
      setUploadedDocuments(prev => prev.map(d => 
        d.id === document.id ? { ...d, status: 'error', error: document.error } : d
      ));
    }
  };

  const simulateUploadProgress = async (docId: string) => {
    return new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        
        setUploadedDocuments(prev => prev.map(d => 
          d.id === docId ? { ...d, progress } : d
        ));
      }, 200);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple: false, // One file at a time for step-by-step flow
    onDragEnter: () => {},
    onDragLeave: () => {},
  });

  const confirmExtraction = (document: UploadedDocument) => {
    if (document.extractedData) {
      document.status = 'confirmed';
      document.confirmedByUser = true;
      
      // Merge confirmed data
      setConfirmedData(prev => ({ ...prev, ...document.extractedData }));
      setExtractedData(prev => ({ ...prev, ...document.extractedData }));
      
      setUploadedDocuments(prev => prev.map(d => 
        d.id === document.id ? { ...d, status: 'confirmed', confirmedByUser: true } : d
      ));
      
      // Move to next step
      if (currentStep < requiredDocuments.length) {
        setCurrentStep(currentStep + 1);
      }
      
      setShowExtractionReview(false);
      setCurrentReviewDoc(null);
      
      toast.success(`✅ ${currentRequirement?.name} confirmed and processed!`);
    }
  };

  const rejectExtraction = (document: UploadedDocument) => {
    document.status = 'error';
    document.error = 'User rejected extracted data';
    
    setUploadedDocuments(prev => prev.map(d => 
      d.id === document.id ? { ...d, status: 'error', error: 'User rejected extracted data' } : d
    ));
    
    setShowExtractionReview(false);
    setCurrentReviewDoc(null);
    
    toast.error(`❌ ${currentRequirement?.name} rejected. Please try again.`);
  };

  const skipToNextStep = () => {
    if (currentStep < requiredDocuments.length) {
      setCurrentStep(currentStep + 1);
      toast.info(`⏭️  Skipped to ${requiredDocuments.find(req => req.order === currentStep + 1)?.name}`);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = () => {
    const allDocuments = uploadedDocuments.filter(doc => doc.status === 'completed' || doc.status === 'confirmed');
    onUploadComplete(allDocuments, { ...extractedData, ...confirmedData });
    
    // If we have an application ID and documents are ready, notify parent
    // if (applicationId && onDocumentsReady) {
      const readyFiles = allDocuments.map(doc => doc.file);
      onDocumentsReady?.(readyFiles);
      console.log('readyFiles', readyFiles,allDocuments);
    // }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-text-secondary" />;
      case 'uploading':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'extracting':
        return <Brain className="w-5 h-5 text-purple-500 animate-pulse" />;
      case 'review':
        return <Eye className="w-5 h-5 text-warning" />;
      case 'confirmed':
        return <CheckSquare className="w-5 h-5 text-accent" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-accent" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-error" />;
      default:
        return <FileText className="w-5 h-5 text-text-secondary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error/20 text-red-700 border-error/30';
      case 'medium':
        return 'bg-warning/20 text-yellow-700 border-warning/30';
      case 'low':
        return 'bg-accent/20 text-green-700 border-accent/30';
      default:
        return 'bg-slate-100 text-foreground border-border';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <TooltipProvider>
        {/* Step-by-Step Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background rounded-2xl p-6 shadow-lg border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground">Document Processing Flow</h3>
            <Badge variant="outline" className="text-sm">
              Step {currentStep} of {requiredDocuments.length}
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <Progress value={(currentStep / requiredDocuments.length) * 100} className="mb-4" />
          
          {/* Current Step Display */}
          <div className="text-center">
            <h4 className="text-lg font-medium text-foreground mb-2">
              {currentRequirement?.name}
            </h4>
            <p className="text-text-secondary mb-4">
              {currentRequirement?.description}
            </p>
            
            {/* Sample Preview */}
            {currentRequirement?.sampleImage && (
              <div className="mb-4">
                <div className="inline-block p-2 bg-slate-100 rounded-lg">
                  <img 
                    src={currentRequirement.sampleImage} 
                    alt="Sample" 
                    className="w-[32rem] h-[20rem] object-contain rounded border"
                  />
                </div>
                <p className="text-xs text-text-secondary mt-2">Sample document</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Current Document Upload Area */}
        <Card className="border-2 border-dashed border-primary/40 hover:border-blue-400 transition-colors">
          <CardContent className="p-8">
            <div
              {...getRootProps()}
              className={`text-center cursor-pointer transition-all ${
                isDragActive ? 'scale-105' : ''
              }`}
            >
              <input {...getInputProps()} />
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="space-y-4"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto flex items-center justify-center">
                  {isDragActive ? (
                    <Upload className="w-10 h-10 text-primary animate-bounce" />
                  ) : (
                    <Camera className="w-10 h-10 text-primary" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {isDragActive ? 'Drop your document here' : `Upload ${currentRequirement?.name}`}
                  </h3>
                  <p className="text-text-secondary mb-4">
                    {currentRequirement?.description}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-text-secondary mb-4">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span>AI-powered extraction</span>
                    <span>•</span>
                    <Shield className="w-4 h-4 text-accent" />
                    <span>Secure processing</span>
                    <span>•</span>
                    <Zap className="w-4 h-4 text-warning" />
                    <span>Instant verification</span>
                  </div>
                  
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Upload className="w-5 h-5 mr-2" />
                    Choose Document
                  </Button>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep <= 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={skipToNextStep}
              disabled={currentStep >= requiredDocuments.length}
              className="flex items-center gap-2"
            >
              Skip
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            {currentStep < requiredDocuments.length && (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Next Document
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Processing Status */}
        {processingDocument && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900">AI Processing Document</h4>
                <p className="text-sm text-purple-700">
                  Analyzing {currentRequirement?.name} with OCR and AI...
                </p>
              </div>
              <div className="w-4 h-4 bg-purple-600 rounded-full animate-ping" />
            </div>
          </motion.div>
        )}

        {/* Uploaded Documents Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Document Status</h3>
          
          <AnimatePresence>
            {uploadedDocuments.map((doc, index) => {
              const requirement = requiredDocuments.find(req => req.id === doc.requirementId);
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background rounded-xl p-4 border border-border shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      {doc.preview ? (
                        <img src={doc.preview} alt="Preview" className="w-8 h-8 object-cover rounded" />
                      ) : (
                        <FileText className="w-6 h-6 text-text-secondary" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{requirement?.name || 'Unknown Document'}</h4>
                        {requirement?.required && (
                          <Badge variant="destructive" className="text-xs bg-error/20 text-red-700">Required</Badge>
                        )}
                        <Badge className={`text-xs ${getPriorityColor(requirement?.priority || 'medium')}`}>
                          {requirement?.priority || 'medium'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Step {requirement?.order}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-text-secondary mb-2">{requirement?.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span>{doc.file.name}</span>
                        <span>{(doc.file.size / 1024 / 1024).toFixed(1)}MB</span>
                        <span>{doc.file.type}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      
                      {doc.status === 'uploading' && (
                        <div className="w-20">
                          <Progress value={doc.progress} className="h-2" />
                        </div>
                      )}
                      
                      {doc.status === 'review' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setCurrentReviewDoc(doc);
                            setShowExtractionReview(true);
                          }}
                          className="bg-warning/100 hover:bg-warning"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      )}
                      
                      {doc.status === 'confirmed' && (
                        <Badge variant="default" className="bg-accent/20 text-green-700">
                          Confirmed
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Extraction Review Modal */}
        <AnimatePresence>
          {showExtractionReview && currentReviewDoc && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground">Review Extracted Data</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExtractionReview(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">Document: {currentReviewDoc.file.name}</h4>
                    <p className="text-sm text-text-secondary">
                      {requiredDocuments.find(req => req.id === currentReviewDoc.requirementId)?.description}
                    </p>
                  </div>
                  
                  <div className="bg-primary/10 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Extracted Information</h4>
                    <div className="space-y-2">
                      {currentReviewDoc.extractedData && Object.entries(currentReviewDoc.extractedData).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-sm text-blue-900">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => rejectExtraction(currentReviewDoc)}
                      className="border-error/40 text-error hover:bg-error/10"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject & Retry
                    </Button>
                    
                    <Button
                      onClick={() => confirmExtraction(currentReviewDoc)}
                      className="bg-accent hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Data
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final Submit Button */}
        {uploadedDocuments.some(doc => doc.status === 'confirmed') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Button
              onClick={handleFormSubmit}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Submit Application
            </Button>
          </motion.div>
        )}
      </TooltipProvider>
    </div>
  );
};

export default EnhancedAIDocumentUploader;
