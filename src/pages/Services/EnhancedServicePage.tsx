import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, DollarSign, Shield, CheckCircle, FileText,
  Brain, Sparkles, Zap, Star, Users, Rocket, Target, AlertCircle
} from 'lucide-react';
import { getServiceById } from '@/config/services';
import { Service } from '@/types/tammat.types';
import AIDocumentUploader from '@/components/DocumentUpload/AIDocumentUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface ExtractedData {
  [key: string]: any;
}

const EnhancedServicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'process' | 'ai' | 'apply'>('overview');
  const [showSuccess, setShowSuccess] = useState(false);
  const [applicationData, setApplicationData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const serviceData = getServiceById(id);
      setService(serviceData || null);
    }
  }, [id]);

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Service Not Found</h2>
          <Button onClick={() => navigate('/')} size="lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  const handleDocumentUpload = async (documents: any[], extractedData: ExtractedData) => {
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const appData = {
      id: `APP-${Date.now()}`,
      serviceId: service.id,
      serviceName: service.name,
      status: 'submitted',
      submittedAt: new Date(),
      documents: documents.length,
      extractedData,
      estimatedCompletion: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      trackingNumber: `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
    
    setApplicationData(appData);
    setShowSuccess(true);
    
    toast.success('🎉 Application submitted successfully!');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'requirements', label: 'Requirements', icon: CheckCircle },
    { id: 'process', label: 'Process', icon: Clock },
    { id: 'ai', label: 'AI Assistant', icon: Brain },
    { id: 'apply', label: 'Apply Now', icon: Rocket }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="relative bg-background border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-24 h-24 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center gap-6">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="lg"
              className="p-3"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            
            <div className="flex items-center gap-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
              >
                {service.icon}
              </motion.div>
              
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  {service.name}
                </h1>
                <p className="text-xl text-text-secondary flex items-center gap-2">
                  <Badge variant="outline">{service.category} Visa Service</Badge>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Service Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{service.estimatedTime}</div>
                  <div className="text-sm text-text-secondary">Processing Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">AED {service.cost.toLocaleString()}</div>
                  <div className="text-sm text-text-secondary">Total Cost</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">99.8%</div>
                  <div className="text-sm text-text-secondary">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">2,847</div>
                  <div className="text-sm text-text-secondary">Happy Clients</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Features Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 mb-12 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-background rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-background rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-background/20 rounded-2xl flex items-center justify-center"
              >
                <Brain className="w-8 h-8" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Powered by GPT-5 AI Technology</h3>
                <p className="text-purple-100">Advanced document recognition and intelligent form auto-population</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-background/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Smart OCR</div>
                  <div className="text-sm text-purple-100">Extract text from any document</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-background/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Auto-Fill Forms</div>
                  <div className="text-sm text-purple-100">Instant form population</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-background/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Secure Processing</div>
                  <div className="text-sm text-purple-100">Bank-level security</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-background/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 mb-12 overflow-hidden"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-16">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="p-8">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Service Description
                  </h3>
                  <p className="text-text-secondary leading-relaxed text-lg">{service.description}</p>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                    <Star className="w-6 h-6 text-yellow-500" />
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-border/50">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-foreground font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                    <Target className="w-6 h-6 text-red-500" />
                    Eligibility Criteria
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {service.eligibility.minAge && (
                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="text-2xl font-bold text-foreground">{service.eligibility.minAge} years</div>
                          <div className="text-sm text-text-secondary">Minimum Age</div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {service.eligibility.minSalary && (
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0">
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-2xl font-bold text-foreground">AED {service.eligibility.minSalary.toLocaleString()}</div>
                          <div className="text-sm text-text-secondary">Minimum Salary</div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {service.eligibility.minResidencyYears && (
                      <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-0">
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="text-2xl font-bold text-foreground">{service.eligibility.minResidencyYears} year(s)</div>
                          <div className="text-sm text-text-secondary">Minimum Residency</div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Requirements Tab */}
              <TabsContent value="requirements" className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    Required Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {service.requirements.map((req, index) => (
                      <div key={req.id} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-border/50 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-semibold text-foreground text-lg">{req.name}</h4>
                          {req.required && (
                            <Badge variant="destructive" className="text-xs font-medium">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-text-secondary mb-4 leading-relaxed">{req.description}</p>
                        <div className="space-y-2 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Max size:</span>
                            <span>{(req.maxSize / 1024 / 1024).toFixed(1)}MB</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Types:</span>
                            <span>{req.fileTypes.join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Category:</span>
                            <Badge variant="outline" className="text-xs">
                              {req.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Process Tab */}
              <TabsContent value="process" className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-8 flex items-center gap-3">
                    <Clock className="w-6 h-6 text-yellow-600" />
                    Application Process
                  </h3>
                  <div className="space-y-8">
                    {service.process.map((step, index) => (
                      <div key={index} className="flex gap-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-lg">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-foreground mb-3">{step.title}</h4>
                          <p className="text-text-secondary mb-4 text-lg leading-relaxed">{step.description}</p>
                          <div className="flex items-center gap-6 text-sm text-slate-500">
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {step.estimatedTime}
                            </span>
                            {step.requiredDocuments.length > 0 && (
                              <span className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                {step.requiredDocuments.length} documents
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* AI Assistant Tab */}
              <TabsContent value="ai" className="space-y-6">
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center"
                  >
                    <Brain className="w-10 h-10 text-purple-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">AI-Powered Assistant</h3>
                  <p className="text-text-secondary max-w-2xl mx-auto">
                    Get instant help and guidance for your {service.name} application. Our AI assistant is trained on thousands of successful applications.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-foreground">24/7 AI Support</h4>
                      </div>
                      <p className="text-text-secondary mb-4">Get instant answers to your questions about the application process.</p>
                      <Button variant="outline" className="w-full">
                        <Brain className="w-4 h-4 mr-2" />
                        Start AI Chat
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-foreground">Smart Guidance</h4>
                      </div>
                      <p className="text-text-secondary mb-4">AI-powered recommendations for your specific situation.</p>
                      <Button variant="outline" className="w-full">
                        <Zap className="w-4 h-4 mr-2" />
                        Get Guidance
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Apply Tab */}
              <TabsContent value="apply" className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Rocket className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Ready to Apply?</h3>
                  <p className="text-text-secondary max-w-2xl mx-auto">
                    Upload your documents and let our AI do the heavy lifting. We'll extract all the information and populate your application automatically.
                  </p>
                </div>

                <AIDocumentUploader
                  serviceName={service.name}
                  serviceType={service.id}
                  onUploadComplete={handleDocumentUpload}
                  maxFileSize={10 * 1024 * 1024}
                  allowedTypes={['image/*', 'application/pdf']}
                />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && applicationData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-background rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Application Submitted! 🎉</h3>
                  <p className="text-text-secondary">Your {service.name} application has been successfully submitted.</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-sm text-slate-500 mb-1">Application ID</div>
                      <div className="font-mono font-semibold text-foreground">{applicationData.id}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-sm text-slate-500 mb-1">Tracking Number</div>
                      <div className="font-mono font-semibold text-foreground">{applicationData.trackingNumber}</div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-sm text-blue-600 mb-1">Estimated Completion</div>
                    <div className="font-semibold text-blue-900">
                      {applicationData.estimatedCompletion.toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate('/applications')}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    View Application
                  </Button>
                  <Button
                    onClick={() => setShowSuccess(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-10 text-center text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-background rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-background rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4">Need Help with Your Application?</h3>
            <p className="text-blue-100 mb-8 max-w-3xl mx-auto text-lg">
              Our visa experts are available 24/7 to assist you with any questions or concerns about your {service.name} application. 
              Get personalized guidance and ensure your application is perfect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-background text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-all duration-300 hover:scale-105">
                <Brain className="w-5 h-5 mr-2" />
                Chat with AI
              </Button>
              <Button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-background hover:text-blue-600 transition-all duration-300 hover:scale-105">
                <Zap className="w-5 h-5 mr-2" />
                Get Expert Help
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedServicePage;
