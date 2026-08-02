import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Progress } from './progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  HelpCircle,
  Lightbulb,
  Star,
  CheckCircle,
  ArrowRight,
  Home,
  MessageCircle,
  Upload,
  FileText,
  Users,
  Shield
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'scroll' | 'highlight';
  tips?: string[];
  videoUrl?: string;
  imageUrl?: string;
}

interface TourGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  className?: string;
}

const TourGuide: React.FC<TourGuideProps> = ({
  isOpen,
  onClose,
  onComplete,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to TAMMAT! 🎉',
      description: 'Your AI-powered visa sponsorship platform. Let me show you around and help you get started with sponsoring your family to the UAE.',
      target: 'hero-section',
      position: 'center',
      tips: [
        'TAMMAT uses advanced AI to guide you through the visa process',
        'Our platform has a 99.8% success rate',
        'You can chat with real immigration officers 24/7'
      ]
    },
    {
      id: 'hero-chat',
      title: 'AI Chat Interface 💬',
      description: 'Start here! Use our ChatGPT-like interface to ask questions about visa sponsorship. You can ask about requirements, costs, or start an application.',
      target: 'chat-interface',
      position: 'bottom',
      action: 'click',
      tips: [
        'Try asking: "What documents do I need for spouse visa?"',
        'Use predefined prompts for quick access',
        'AI will guide you through the entire process'
      ]
    },
    {
      id: 'services',
      title: 'Choose Your Service 🎯',
      description: 'Browse our family visa services. Each service is designed for specific family relationships with tailored requirements and processing times.',
      target: 'services-section',
      position: 'top',
      tips: [
        'Spouse Visa: Most popular, 15-20 days processing',
        'Parents Visa: Premium service, 20-25 days processing',
        'Children Visa: Fast track, 15-20 days processing'
      ]
    },
    {
      id: 'document-upload',
      title: 'Smart Document Upload 📄',
      description: 'Our advanced upload system supports drag & drop, scanning, and OCR processing. Upload your documents securely and get instant verification.',
      target: 'document-upload',
      position: 'left',
      action: 'highlight',
      tips: [
        'Drag & drop files directly from your computer',
        'Use your phone camera to scan documents',
        'OCR automatically extracts text from images',
        'Real-time progress tracking and verification'
      ]
    },
    {
      id: 'chat-with-officer',
      title: 'Chat with Immigration Officers 👨‍💼',
      description: 'Connect with real immigration specialists in real-time. Get expert guidance, ask questions, and even have voice or video calls.',
      target: 'officer-chat',
      position: 'right',
      action: 'click',
      tips: [
        '24/7 availability with certified officers',
        'Voice and video call options available',
        'File sharing and document review',
        'Real-time application status updates'
      ]
    },
    {
      id: 'application-tracking',
      title: 'Track Your Application 📊',
      description: 'Monitor your application progress in real-time. Get updates on document verification, government processing, and final approval.',
      target: 'application-tracking',
      position: 'center',
      tips: [
        'Real-time status updates',
        'Document verification progress',
        'Government processing timeline',
        'SMS and email notifications'
      ]
    },
    {
      id: 'support',
      title: '24/7 Support & Resources 🆘',
      description: 'Access comprehensive support resources, FAQs, and live chat. Our team is always here to help you succeed.',
      target: 'support-section',
      position: 'bottom',
      tips: [
        'Live chat with support agents',
        'Comprehensive FAQ database',
        'Video tutorials and guides',
        'Community forum for users'
      ]
    },
    {
      id: 'completion',
      title: "You're All Set! 🚀",
      description: 'Congratulations! You now know how to use TAMMAT effectively. Start your visa sponsorship journey today and bring your family to the UAE.',
      target: 'get-started',
      position: 'center',
      tips: [
        'Ready to start your application?',
        'Have questions? Chat with our AI or officers',
        'Need help? Our support team is available 24/7'
      ]
    }
  ];

  useEffect(() => {
    if (autoPlay && isPlaying) {
      const timer = setTimeout(() => {
        if (currentStep < tourSteps.length - 1) {
          nextStep();
        } else {
          completeTour();
        }
      }, 5000); // 5 seconds per step

      return () => clearTimeout(timer);
    }
  }, [currentStep, isPlaying, autoPlay]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCompletedSteps(prev => new Set([...prev, tourSteps[currentStep].id]));
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const completeTour = () => {
    setCompletedSteps(prev => new Set([...prev, tourSteps[currentStep].id]));
    onComplete();
  };

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
    setIsPlaying(!autoPlay);
  };

  const currentStepData = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-background/20 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">TAMMAT Tour Guide</DialogTitle>
                  <p className="text-blue-100 text-sm">Learn how to use our platform effectively</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-background/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Step {currentStep + 1} of {tourSteps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2 bg-background/20" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Step Content */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {currentStepData.title}
                  </h3>
                  <p className="text-text-secondary text-lg leading-relaxed max-w-2xl mx-auto">
                    {currentStepData.description}
                  </p>
                </div>

                {/* Tips Section */}
                {currentStepData.tips && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
                        <Lightbulb className="w-5 h-5" />
                        Pro Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {currentStepData.tips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-blue-800 text-sm">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={previousStep}
                      disabled={currentStep === 0}
                      className="gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={toggleAutoPlay}
                      className="gap-2"
                    >
                      {autoPlay && isPlaying ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Auto-play
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentStep < tourSteps.length - 1 ? (
                      <Button
                        onClick={nextStep}
                        className="bg-blue-600 hover:bg-blue-700 gap-2"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={completeTour}
                        className="bg-green-600 hover:bg-green-700 gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete Tour
                      </Button>
                    )}
                  </div>
                </div>

                {/* Step Indicators */}
                <div className="flex items-center justify-center gap-2">
                  {tourSteps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => skipToStep(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentStep
                          ? 'bg-blue-600 scale-125'
                          : completedSteps.has(step.id)
                          ? 'bg-green-500'
                          : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                      title={`Step ${index + 1}: ${step.title}`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-border p-4 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go to Top
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Scroll to chat interface
                    document.getElementById('chat-interface')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Try Chat
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                >
                  Skip Tour
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Open help documentation
                    window.open('/help', '_blank');
                  }}
                  className="gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help Docs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TourGuide; 