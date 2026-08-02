import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Trash2,
  AlertTriangle,
  Info,
  Shield,
  Clock,
  Sparkles,
  Zap,
  Star,
  Building2,
  Globe,
  User,
  FileCheck,
  Brain,
  Camera,
  Scan,
  Loader2,
  X,
  ChevronRight,
  ChevronDown,
  AlertCircle as AlertCircleIcon,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { OpenAI } from 'openai';

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: 'sponsor' | 'applicant' | 'accommodation' | 'financial';
  fileTypes: string[];
  maxSize: number;
  priority: 'high' | 'medium' | 'low';
  fields?: string[]; // Fields to extract from this document
}

interface ExtractedData {
  [key: string]: any;
}

interface UploadedDocument {
  id: string;
  file: File;
  requirementId: string;
  preview?: string;
  status: 'uploading' | 'processing' | 'extracting' | 'completed' | 'error';
  progress: number;
  extractedData?: ExtractedData;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  error?: string;
}

interface AIDocumentUploaderProps {
  serviceName: string;
  serviceType: string;
  onUploadComplete: (documents: UploadedDocument[], extractedData: ExtractedData) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
  className?: string;
}

// UAE Government Document Requirements with AI extraction fields
const getDocumentRequirements = (serviceType: string): DocumentRequirement[] => {
  return [
    // Sponsor Documents (Always Required First)
    {
      id: 'sponsor-emirates-id',
      name: 'Sponsor\'s Emirates ID Copy',
      description: 'Valid Emirates ID of the sponsor - AI will extract ID number, name, and expiry date',
      required: true,
      category: 'sponsor',
      fileTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      priority: 'high',
      fields: ['emiratesIdNumber', 'sponsorName', 'sponsorNationality', 'expiryDate']
    },
    {
      id: 'sponsor-passport',
      name: 'Sponsor\'s Passport Copy',
      description: 'Valid passport copy of the sponsor - AI will extract passport number, name, and nationality',
      required: true,
      category: 'sponsor',
      fileTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      priority: 'high',
      fields: ['passportNumber', 'sponsorName', 'sponsorNationality', 'dateOfBirth', 'expiryDate']
    },
    {
      id: 'sponsor-visa',
      name: 'Sponsor\'s Visa Copy',
      description: 'Current valid visa of the sponsor - AI will extract visa number and expiry date',
      required: true,
      category: 'sponsor',
      fileTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      priority: 'high',
      fields: ['visaNumber', 'visaType', 'expiryDate', 'sponsorName']
    },
    {
      id: 'sponsor-salary',
      name: 'Salary Certificate',
      description: 'Minimum AED 4,000 monthly salary proof - AI will extract salary amount and company details',
      required: true,
      category: 'sponsor',
      fileTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      priority: 'high',
      fields: ['monthlySalary', 'companyName', 'position', 'employmentStartDate']
    },
    {
      id: 'sponsor-bank-statement',
      name: '3-Month Bank Statement',
      description: 'Last 3 months bank statements - AI will extract account balance and transaction history',
      required: true,
      category: 'sponsor',
      fileTypes: ['image/*', 'application/pdf'],
      maxSize: 10 * 1024 * 1024,
      priority: 'high',
      fields: ['accountBalance', 'bankName', 'accountNumber', 'statementPeriod']
    },
    // Applicant Documents
    {
      id: 'applicant-passport',
      name: 'Applicant\'s Passport Copy',
      description: 'Passport with 6+ months validity - AI will extract passport details and expiry',
      required: true,
      category: 'applicant',
      fileTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      priority: 'high',
      fields: ['applicantPassportNumber', 'applicantName', 'applicantNationality', 'dateOfBirth', 'expiryDate']
    },
    {
      id: 'applicant-photo',
      name: 'Passport Photo',
      description: 'Recent passport-size photograph with white background',
      required: true,
      category: 'applicant',
      fileTypes: ['image/*'],
      maxSize: 2 * 1024 * 1024,
      priority: 'high'
    }
  ];
};

const AIDocumentUploader: React.FC<AIDocumentUploaderProps> = ({
  serviceName,
  serviceType,
  onUploadComplete,
  maxFileSize = 10 * 1024 * 1024,
  allowedTypes = ['image/*', 'application/pdf'],
  className = ''
}) => {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [processingDocument, setProcessingDocument] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ExtractedData>({});

  const requiredDocuments = useMemo(() => getDocumentRequirements(serviceType), [serviceType]);

  // Group requirements by category
  const requirementsByCategory = useMemo(() => {
    const grouped = {
      sponsor: requiredDocuments.filter(doc => doc.category === 'sponsor'),
      applicant: requiredDocuments.filter(doc => doc.category === 'applicant'),
      accommodation: requiredDocuments.filter(doc => doc.category === 'accommodation'),
      financial: requiredDocuments.filter(doc => doc.category === 'financial')
    };
    return grouped;
  }, [requiredDocuments]);

  // Check completion status
  const completionStatus = useMemo(() => {
    const totalRequired = requiredDocuments.filter(doc => doc.required).length;
    const completed = uploadedDocuments.filter(doc => doc.status === 'completed').length;
    const percentage = Math.round((completed / totalRequired) * 100);
    
    return {
      totalRequired,
      completed,
      percentage,
      isComplete: completed === totalRequired
    };
  }, [requiredDocuments, uploadedDocuments]);

  // Check if sponsor documents are complete
  const sponsorDocumentsComplete = useMemo(() => {
    const requiredSponsorDocs = requirementsByCategory.sponsor.filter(doc => doc.required);
    return requiredSponsorDocs.every(req =>
      uploadedDocuments.some(uploaded =>
        uploaded.requirementId === req.id && uploaded.status === 'completed'
      )
    );
  }, [requirementsByCategory.sponsor, uploadedDocuments]);

  // AI Document Analysis using OpenAI
  const analyzeDocumentWithAI = async (file: File, requirement: DocumentRequirement): Promise<ExtractedData> => {
    try {
      setProcessingDocument(requirement.id);
      
      // Convert file to base64 for API
      const base64 = await fileToBase64(file);
      
      // Prepare the prompt for OpenAI
      const prompt = `Analyze this ${requirement.name.toLowerCase()} document and extract the following information in JSON format:
      
      Document Type: ${requirement.name}
      Required Fields: ${requirement.fields?.join(', ') || 'general information'}
      
      Please extract all relevant information and return it as a valid JSON object. Focus on:
      - Personal identification details
      - Dates and expiry information
      - Numbers and codes
      - Names and addresses
      - Any other relevant information visible in the document
      
      Return only the JSON object, no additional text.`;

      // Simulate AI processing (replace with actual OpenAI API call)

      //openai api call to gpt-5 that will check the document and extract the data

      

      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
      
      // Mock extracted data based on document type
      const mockData = generateMockExtractedData(requirement, file.name);
      
      toast.success(`✅ AI analysis completed for ${requirement.name}`);
      return mockData;
      
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error(`❌ AI analysis failed for ${requirement.name}`);
      return {};
    } finally {
      setProcessingDocument(null);
    }
  };

  // Generate mock extracted data for demonstration
  const generateMockExtractedData = (requirement: DocumentRequirement, fileName: string): ExtractedData => {
    const mockData: ExtractedData = {};
    
    if (requirement.fields) {
      requirement.fields.forEach(field => {
        switch (field) {
          case 'emiratesIdNumber':
            mockData[field] = `784-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 90) + 10}`;
            break;
          case 'sponsorName':
            mockData[field] = 'Ahmed Al Mansouri';
            break;
          case 'sponsorNationality':
            mockData[field] = 'UAE';
            break;
          case 'expiryDate':
            mockData[field] = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case 'passportNumber':
            mockData[field] = `A${Math.floor(Math.random() * 900000) + 100000}`;
            break;
          case 'monthlySalary':
            mockData[field] = Math.floor(Math.random() * 5000) + 8000;
            break;
          case 'companyName':
            mockData[field] = 'Dubai Technologies LLC';
            break;
          case 'position':
            mockData[field] = 'Senior Software Engineer';
            break;
          default:
            mockData[field] = `Sample ${field}`;
        }
      });
    }
    
    return mockData;
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => file.errors.map((e: any) => e.message).join(', '));
      setErrors(prev => [...prev, ...errors]);
      return;
    }

    const newDocuments: UploadedDocument[] = acceptedFiles.map(file => {
      const requirement = requiredDocuments.find(req => 
        req.fileTypes.some(type => {
          if (type === 'image/*') return file.type.startsWith('image/');
          if (type === 'application/pdf') return file.type === 'application/pdf';
          return file.type === type;
        })
      );

      return {
        id: `${Date.now()}-${Math.random()}`,
        file,
        requirementId: requirement?.id || 'unknown',
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        status: 'uploading',
        progress: 0
      };
    });

    setUploadedDocuments(prev => [...prev, ...newDocuments]);
    await processDocuments(newDocuments);
  },[requiredDocuments, maxFileSize, allowedTypes]);

  const processDocuments = async (documents: UploadedDocument[]) => {
    setUploading(true);
    
    for (const doc of documents) {
      // Simulate upload progress
      await simulateUploadProgress(doc.id);
      
      // Start AI analysis
      const requirement = requiredDocuments.find(req => req.id === doc.requirementId);
      if (requirement && requirement.fields) {
        doc.status = 'extracting';
        setUploadedDocuments(prev => prev.map(d => 
          d.id === doc.id ? { ...d, status: 'extracting' } : d
        ));
        
        const extracted = await analyzeDocumentWithAI(doc.file, requirement);
        doc.extractedData = extracted;
        doc.status = 'completed';
        
        // Merge extracted data
        setExtractedData(prev => ({ ...prev, ...extracted }));
        setFormData(prev => ({ ...prev, ...extracted }));
        
        setUploadedDocuments(prev => prev.map(d => 
          d.id === doc.id ? { ...d, status: 'completed', extractedData: extracted } : d
        ));
      } else {
        doc.status = 'completed';
        setUploadedDocuments(prev => prev.map(d => 
          d.id === doc.id ? { ...d, status: 'completed' } : d
        ));
      }
    }
    
    setUploading(false);
    
    // Check if all required documents are complete
    if (completionStatus.isComplete) {
      setShowForm(true);
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
    multiple: true,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

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
      case 'uploading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'extracting':
        return <Brain className="w-5 h-5 text-purple-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
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

  const handleFormSubmit = () => {
    const allDocuments = uploadedDocuments.filter(doc => doc.status === 'completed');
    onUploadComplete(allDocuments, { ...extractedData, ...formData });
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <TooltipProvider>
        {/* AI Processing Status */}
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
                  Analyzing {requiredDocuments.find(r => r.id === processingDocument)?.name} with GPT-5...
                </p>
              </div>
              <div className="w-4 h-4 bg-purple-600 rounded-full animate-ping" />
            </div>
          </motion.div>
        )}

        {/* Completion Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background rounded-2xl p-6 shadow-lg border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Document Completion</h3>
            <Badge variant={completionStatus.isComplete ? 'default' : 'secondary'}>
              {completionStatus.completed}/{completionStatus.totalRequired}
            </Badge>
          </div>
          
          <Progress value={completionStatus.percentage} className="mb-3" />
          
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>Progress: {completionStatus.percentage}%</span>
            <span>{completionStatus.completed} of {completionStatus.totalRequired} documents</span>
          </div>
        </motion.div>

        {/* Document Upload Area */}
        <Card className="border-2 border-dashed border-border hover:border-blue-400 transition-colors">
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
                    <Upload className="w-10 h-10 text-blue-600 animate-bounce" />
                  ) : (
                    <Sparkles className="w-10 h-10 text-blue-600" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {isDragActive ? 'Drop your documents here' : 'AI-Powered Document Upload'}
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Upload your documents and our AI will automatically extract all the information
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span>GPT-5 powered extraction</span>
                    <span>•</span>
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Secure processing</span>
                    <span>•</span>
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>Instant form filling</span>
                  </div>
                </div>
                
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Upload className="w-5 h-5 mr-2" />
                  Choose Documents
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Document Requirements */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">📤 Upload</TabsTrigger>
            <TabsTrigger value="requirements">📋 Requirements</TabsTrigger>
            <TabsTrigger value="form">✍️ Form</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* Uploaded Documents */}
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
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                          <Badge className={`text-xs ${getPriorityColor(requirement?.priority || 'medium')}`}>
                            {requirement?.priority || 'medium'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-text-secondary mb-2">{requirement?.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500">
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
                        
                        {doc.status === 'completed' && doc.extractedData && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Eye className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md">
                              <div className="space-y-2">
                                <h4 className="font-semibold">Extracted Data:</h4>
                                {Object.entries(doc.extractedData).map(([key, value]) => (
                                  <div key={key} className="text-sm">
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(doc.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4">
            {/* Document Requirements by Category */}
            {Object.entries(requirementsByCategory).map(([category, docs]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category === 'sponsor' && <Building2 className="w-5 h-5" />}
                    {category === 'applicant' && <User className="w-5 h-5" />}
                    {category === 'accommodation' && <Globe className="w-5 h-5" />}
                    {category === 'financial' && <DollarSign className="w-5 h-5" />}
                    {category.charAt(0).toUpperCase() + category.slice(1)} Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {docs.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground">{req.name}</h4>
                            {req.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                            <Badge className={`text-xs ${getPriorityColor(req.priority)}`}>
                              {req.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary">{req.description}</p>
                          {req.fields && (
                            <div className="mt-2">
                              <span className="text-xs text-slate-500">AI will extract: </span>
                              <span className="text-xs text-blue-600 font-medium">
                                {req.fields.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="form" className="space-y-4">
            {/* Auto-populated Form */}
            {showForm ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900">Form Auto-Populated! 🎉</h4>
                      <p className="text-sm text-green-700">
                        Our AI has extracted information from your documents. Please review and confirm the details below.
                      </p>
                    </div>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sponsorName">Sponsor Name</Label>
                        <Input
                          id="sponsorName"
                          value={formData.sponsorName || ''}
                          onChange={(e) => updateFormData('sponsorName', e.target.value)}
                          placeholder="Enter sponsor name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emiratesIdNumber">Emirates ID Number</Label>
                        <Input
                          id="emiratesIdNumber"
                          value={formData.emiratesIdNumber || ''}
                          onChange={(e) => updateFormData('emiratesIdNumber', e.target.value)}
                          placeholder="Enter Emirates ID number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="passportNumber">Passport Number</Label>
                        <Input
                          id="passportNumber"
                          value={formData.passportNumber || ''}
                          onChange={(e) => updateFormData('passportNumber', e.target.value)}
                          placeholder="Enter passport number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="monthlySalary">Monthly Salary (AED)</Label>
                        <Input
                          id="monthlySalary"
                          type="number"
                          value={formData.monthlySalary || ''}
                          onChange={(e) => updateFormData('monthlySalary', e.target.value)}
                          placeholder="Enter monthly salary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    onClick={handleFormSubmit}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    size="lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Application
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Form Not Ready Yet</h3>
                <p className="text-text-secondary">
                  Please upload all required documents first. Our AI will then extract the information and populate the form automatically.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{error}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearErrors}
                      className="h-auto p-1 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </TooltipProvider>
    </div>
  );
};

export default AIDocumentUploader;
