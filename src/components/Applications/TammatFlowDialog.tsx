'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, ChevronRight, ChevronLeft, Sparkles, Upload, 
  Check, FileText, User, Send, Clock, Shield,
  Building2, Users, CreditCard, RefreshCw, Star, Briefcase
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import confetti from 'canvas-confetti'

// Types
interface Category {
  id: string
  icon: React.ReactNode
  emoji: string
  title: string
  description: string
  services: ServiceItem[]
}

interface ServiceItem {
  id: string
  name: string
  description: string
  processingTime: string
  price: string
  documents: string[]
}

interface Document {
  id: string
  name: string
  required: boolean
  file?: File
  uploaded: boolean
}

interface AssistantMessage {
  id: string
  text: string
  type: 'greeting' | 'category' | 'service' | 'document' | 'info' | 'celebration' | 'ready'
}

interface TammatFlowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Animation variants
const fadeSlide = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08 }
  }
}

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

// Confetti celebration
const celebrate = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#C6FF3A', '#FFD700', '#00D4FF', '#FF6B6B']
  })
}

const miniCelebrate = () => {
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.7 },
    colors: ['#C6FF3A', '#00D4FF']
  })
}

export default function TammatFlowDialog({ open, onOpenChange }: TammatFlowDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar' || i18n.language === 'ur'
  
  // Flow state
  const [step, setStep] = useState<'categories' | 'services' | 'documents' | 'info' | 'review'>('categories')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    passportNumber: '',
    nationality: ''
  })
  
  // Assistant state
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const assistantRef = useRef<HTMLDivElement>(null)

  // Progress calculation
  const progressSteps = {
    categories: 10,
    services: 30,
    documents: 60,
    info: 85,
    review: 100
  }
  const progress = progressSteps[step]

  // Categories data
  const categories: Category[] = [
    {
      id: 'family',
      icon: <Users className="w-6 h-6" />,
      emoji: '👨‍👩‍👧‍👦',
      title: t('tammatFlow.categories.family.title', 'Family Visa'),
      description: t('tammatFlow.categories.family.desc', 'Bring your loved ones to the UAE'),
      services: [
        {
          id: 'spouse-visa',
          name: t('tammatFlow.services.spouseVisa.name', 'Spouse Residence Visa'),
          description: t('tammatFlow.services.spouseVisa.desc', 'Sponsor your spouse for UAE residence'),
          processingTime: '5-7 days',
          price: 'AED 1,089',
          documents: ['Marriage Certificate', 'Passport Copy', 'Salary Certificate', 'Tenancy Contract']
        },
        {
          id: 'child-visa',
          name: t('tammatFlow.services.childVisa.name', 'Child Dependent Visa'),
          description: t('tammatFlow.services.childVisa.desc', 'Sponsor your children under 18'),
          processingTime: '5-7 days',
          price: 'AED 889',
          documents: ['Birth Certificate', 'Passport Copy', 'School Certificate']
        },
        {
          id: 'parent-visa',
          name: t('tammatFlow.services.parentVisa.name', 'Parent Sponsorship Visa'),
          description: t('tammatFlow.services.parentVisa.desc', 'Bring your parents to live with you'),
          processingTime: '7-10 days',
          price: 'AED 1,289',
          documents: ['Passport Copy', 'Bank Statements', 'Salary Certificate', 'Tenancy Contract']
        }
      ]
    },
    {
      id: 'residence',
      icon: <Building2 className="w-6 h-6" />,
      emoji: '🏠',
      title: t('tammatFlow.categories.residence.title', 'Residence Visa'),
      description: t('tammatFlow.categories.residence.desc', 'Live and work in the UAE'),
      services: [
        {
          id: 'employment-visa',
          name: t('tammatFlow.services.employmentVisa.name', 'Employment Residence Visa'),
          description: t('tammatFlow.services.employmentVisa.desc', 'Work visa sponsored by employer'),
          processingTime: '3-5 days',
          price: 'AED 1,126',
          documents: ['Passport Copy', 'Employment Contract', 'Medical Fitness', 'Photo']
        },
        {
          id: 'investor-visa',
          name: t('tammatFlow.services.investorVisa.name', 'Investor Residence Visa'),
          description: t('tammatFlow.services.investorVisa.desc', 'For business owners and investors'),
          processingTime: '5-7 days',
          price: 'AED 2,500',
          documents: ['Trade License', 'Memorandum', 'Bank Statements', 'Passport Copy']
        }
      ]
    },
    {
      id: 'identity',
      icon: <CreditCard className="w-6 h-6" />,
      emoji: '🪪',
      title: t('tammatFlow.categories.identity.title', 'Emirates ID'),
      description: t('tammatFlow.categories.identity.desc', 'National identity card'),
      services: [
        {
          id: 'new-eid',
          name: t('tammatFlow.services.newEid.name', 'New Emirates ID'),
          description: t('tammatFlow.services.newEid.desc', 'First-time ID application'),
          processingTime: '2-3 days',
          price: 'AED 370',
          documents: ['Passport Copy', 'Visa Copy', 'Photo']
        },
        {
          id: 'renew-eid',
          name: t('tammatFlow.services.renewEid.name', 'Renew Emirates ID'),
          description: t('tammatFlow.services.renewEid.desc', 'Extend your existing ID'),
          processingTime: '2-3 days',
          price: 'AED 370',
          documents: ['Current Emirates ID', 'Passport Copy']
        }
      ]
    },
    {
      id: 'golden',
      icon: <Star className="w-6 h-6" />,
      emoji: '⭐',
      title: t('tammatFlow.categories.golden.title', 'Golden Visa'),
      description: t('tammatFlow.categories.golden.desc', '10-year residence program'),
      services: [
        {
          id: 'golden-investor',
          name: t('tammatFlow.services.goldenInvestor.name', 'Investor Golden Visa'),
          description: t('tammatFlow.services.goldenInvestor.desc', 'For property/business investors'),
          processingTime: '10-15 days',
          price: 'AED 4,500',
          documents: ['Property Documents', 'Bank Statements', 'Passport Copy', 'Photo']
        },
        {
          id: 'golden-talent',
          name: t('tammatFlow.services.goldenTalent.name', 'Talent Golden Visa'),
          description: t('tammatFlow.services.goldenTalent.desc', 'For skilled professionals'),
          processingTime: '10-15 days',
          price: 'AED 4,500',
          documents: ['Qualification Certificates', 'Employment Contract', 'Passport Copy']
        }
      ]
    },
    {
      id: 'business',
      icon: <Briefcase className="w-6 h-6" />,
      emoji: '💼',
      title: t('tammatFlow.categories.business.title', 'Business Setup'),
      description: t('tammatFlow.categories.business.desc', 'Start or invest in UAE'),
      services: [
        {
          id: 'freelance-visa',
          name: t('tammatFlow.services.freelanceVisa.name', 'Freelance Permit'),
          description: t('tammatFlow.services.freelanceVisa.desc', 'Work independently in UAE'),
          processingTime: '7-10 days',
          price: 'AED 7,500',
          documents: ['Passport Copy', 'Portfolio', 'Bank Statements', 'Photo']
        }
      ]
    },
    {
      id: 'renewal',
      icon: <RefreshCw className="w-6 h-6" />,
      emoji: '🔄',
      title: t('tammatFlow.categories.renewal.title', 'Renewals'),
      description: t('tammatFlow.categories.renewal.desc', 'Extend or modify status'),
      services: [
        {
          id: 'visa-renewal',
          name: t('tammatFlow.services.visaRenewal.name', 'Visa Renewal'),
          description: t('tammatFlow.services.visaRenewal.desc', 'Extend your current visa'),
          processingTime: '3-5 days',
          price: 'AED 850',
          documents: ['Current Visa Copy', 'Passport Copy', 'Emirates ID']
        },
        {
          id: 'status-change',
          name: t('tammatFlow.services.statusChange.name', 'Status Change'),
          description: t('tammatFlow.services.statusChange.desc', 'Change your visa type'),
          processingTime: '5-7 days',
          price: 'AED 1,200',
          documents: ['Current Visa Copy', 'New Sponsor Letter', 'Passport Copy']
        }
      ]
    }
  ]

  // Add assistant message with typing effect
  const addAssistantMessage = useCallback((text: string, type: AssistantMessage['type']) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setAssistantMessages(prev => [...prev, {
        id: Date.now().toString(),
        text,
        type
      }])
      // Scroll to bottom
      if (assistantRef.current) {
        assistantRef.current.scrollTop = assistantRef.current.scrollHeight
      }
    }, 800)
  }, [])

  // Initialize with greeting
  useEffect(() => {
    if (open && assistantMessages.length === 0) {
      addAssistantMessage(
        t('tammatFlow.assistant.greeting', "Welcome! 👋 I'm here to guide you through your UAE journey. What would you like to achieve today?"),
        'greeting'
      )
    }
  }, [open, addAssistantMessage, t, assistantMessages.length])

  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
    setStep('services')
    miniCelebrate()
    addAssistantMessage(
      t('tammatFlow.assistant.categorySelected', `Great choice! ${category.emoji} ${category.title} has several options. Let me show you what's available.`),
      'category'
    )
  }

  // Handle service selection
  const handleServiceSelect = (service: ServiceItem) => {
    setSelectedService(service)
    // Initialize documents
    const docs: Document[] = service.documents.map((doc, i) => ({
      id: `doc-${i}`,
      name: doc,
      required: true,
      uploaded: false
    }))
    setDocuments(docs)
    setStep('documents')
    celebrate()
    addAssistantMessage(
      t('tammatFlow.assistant.serviceSelected', `Excellent! ${service.name} selected. ✨ Now let's gather your documents. I'll guide you through each one.`),
      'service'
    )
  }

  // Handle document upload
  const handleDocumentUpload = (docId: string, file: File) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, file, uploaded: true } : doc
    ))
    miniCelebrate()
    const uploadedCount = documents.filter(d => d.uploaded).length + 1
    if (uploadedCount === documents.length) {
      addAssistantMessage(
        t('tammatFlow.assistant.allDocsUploaded', "All documents uploaded! 🎉 You're doing amazing. Just a few details and we're done."),
        'celebration'
      )
    } else {
      addAssistantMessage(
        t('tammatFlow.assistant.docUploaded', `Document uploaded! ${uploadedCount}/${documents.length} complete. Keep going! 📄`),
        'document'
      )
    }
  }

  // Handle continue to info
  const handleContinueToInfo = () => {
    setStep('info')
    addAssistantMessage(
      t('tammatFlow.assistant.infoStep', "Almost there! 🏁 Just need a few personal details to complete your application."),
      'info'
    )
  }

  // Handle continue to review
  const handleContinueToReview = () => {
    setStep('review')
    celebrate()
    addAssistantMessage(
      t('tammatFlow.assistant.reviewStep', "You're ready! 🌟 Review everything below and submit when you're confident. I'm with you all the way."),
      'ready'
    )
  }

  // Handle submit
  const handleSubmit = () => {
    celebrate()
    celebrate()
    addAssistantMessage(
      t('tammatFlow.assistant.submitted', "Congratulations! 🎊 Your application has been submitted. We'll keep you updated on every step."),
      'celebration'
    )
    setTimeout(() => {
      onOpenChange(false)
    }, 3000)
  }

  // Handle back navigation
  const handleBack = () => {
    switch (step) {
      case 'services':
        setStep('categories')
        setSelectedCategory(null)
        break
      case 'documents':
        setStep('services')
        setSelectedService(null)
        setDocuments([])
        break
      case 'info':
        setStep('documents')
        break
      case 'review':
        setStep('info')
        break
    }
  }

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep('categories')
      setSelectedCategory(null)
      setSelectedService(null)
      setDocuments([])
      setAssistantMessages([])
      setFormData({ fullName: '', email: '', phone: '', passportNumber: '', nationality: '' })
    }
  }, [open])

  const allDocsUploaded = documents.every(d => d.uploaded)
  const formComplete = formData.fullName && formData.email && formData.phone

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-background border-border/50 rounded-3xl"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Top Bar - Minimal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-poppins text-lg font-semibold text-foreground">TAMMAT</h1>
              <p className="font-tajawal text-xs text-muted-foreground">
                {t('tammatFlow.subtitle', 'Smart UAE Setup')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Progress */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="font-poppins text-xs text-muted-foreground">
                {t('tammatFlow.progress', 'Progress')}
              </span>
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="font-poppins text-sm font-medium text-foreground">{progress}%</span>
            </div>

            {/* Save & Exit */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onOpenChange(false)}
              className="font-poppins text-muted-foreground hover:text-foreground"
            >
              {t('tammatFlow.saveExit', 'Save & Exit')}
            </Button>

            {/* Close */}
            <button 
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(90vh-73px)]">
          {/* Left: Flow Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-10">
              <AnimatePresence mode="wait">
                {/* Step 1: Categories */}
                {step === 'categories' && (
                  <motion.div
                    key="categories"
                    variants={fadeSlide}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="text-center mb-12">
                      <motion.h2 
                        className="font-poppins text-2xl sm:text-3xl font-semibold text-foreground mb-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {t('tammatFlow.categoryTitle', 'What would you like to do today?')}
                      </motion.h2>
                      <motion.p 
                        className="font-tajawal text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {t('tammatFlow.categorySubtitle', 'Select a category to get started')}
                      </motion.p>
                    </div>

                    <motion.div 
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {categories.map((category) => (
                        <motion.button
                          key={category.id}
                          variants={staggerItem}
                          onClick={() => handleCategorySelect(category)}
                          className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 text-left"
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                              {category.emoji}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-poppins text-lg font-medium text-foreground mb-1">
                                {category.title}
                              </h3>
                              <p className="font-tajawal text-sm text-muted-foreground">
                                {category.description}
                              </p>
                              <div className="mt-2 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>{category.services.length} {t('tammatFlow.services', 'services')}</span>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Hover glow */}
                          <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 2: Services */}
                {step === 'services' && selectedCategory && (
                  <motion.div
                    key="services"
                    variants={fadeSlide}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Back button */}
                    <motion.button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 font-poppins text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ x: -4 }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t('tammatFlow.back', 'Back')}
                    </motion.button>

                    <div className="text-center mb-12">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
                        <span className="text-xl">{selectedCategory.emoji}</span>
                        <span className="font-poppins text-sm font-medium text-primary">
                          {selectedCategory.title}
                        </span>
                      </div>
                      <h2 className="font-poppins text-2xl sm:text-3xl font-semibold text-foreground mb-3">
                        {t('tammatFlow.selectService', 'Select your service')}
                      </h2>
                      <p className="font-tajawal text-muted-foreground">
                        {t('tammatFlow.serviceSubtitle', 'Choose the option that fits your needs')}
                      </p>
                    </div>

                    <motion.div 
                      className="space-y-4"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {selectedCategory.services.map((service) => (
                        <motion.button
                          key={service.id}
                          variants={staggerItem}
                          onClick={() => handleServiceSelect(service)}
                          className="group w-full p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 text-left"
                          whileHover={{ scale: 1.01, x: 8 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-poppins text-lg font-medium text-foreground mb-1">
                                {service.name}
                              </h3>
                              <p className="font-tajawal text-sm text-muted-foreground mb-3">
                                {service.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="w-3.5 h-3.5" />
                                  {service.processingTime}
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <FileText className="w-3.5 h-3.5" />
                                  {service.documents.length} {t('tammatFlow.documents', 'documents')}
                                </span>
                                <span className="font-poppins font-semibold text-primary">
                                  {service.price}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4 p-3 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 3: Documents */}
                {step === 'documents' && selectedService && (
                  <motion.div
                    key="documents"
                    variants={fadeSlide}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 font-poppins text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ x: -4 }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t('tammatFlow.back', 'Back')}
                    </motion.button>

                    <div className="text-center mb-12">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 mb-4">
                        <Check className="w-4 h-4 text-success" />
                        <span className="font-poppins text-sm font-medium text-success">
                          {selectedService.name}
                        </span>
                      </div>
                      <h2 className="font-poppins text-2xl sm:text-3xl font-semibold text-foreground mb-3">
                        {t('tammatFlow.documentsTitle', 'Upload your documents')}
                      </h2>
                      <p className="font-tajawal text-muted-foreground">
                        {t('tammatFlow.documentsSubtitle', 'We need these documents to process your application')}
                      </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="mb-8 p-4 rounded-2xl bg-card border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-poppins text-sm text-muted-foreground">
                          {documents.filter(d => d.uploaded).length} {t('tammatFlow.of', 'of')} {documents.length} {t('tammatFlow.uploaded', 'uploaded')}
                        </span>
                        <span className="font-poppins text-sm font-medium text-primary">
                          {allDocsUploaded ? t('tammatFlow.complete', 'Complete!') : t('tammatFlow.remaining', `${documents.filter(d => !d.uploaded).length} remaining`)}
                        </span>
                      </div>
                      <Progress 
                        value={(documents.filter(d => d.uploaded).length / documents.length) * 100} 
                        className="h-2"
                      />
                    </div>

                    <motion.div 
                      className="space-y-4"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {documents.map((doc) => (
                        <motion.div
                          key={doc.id}
                          variants={staggerItem}
                          className={`relative p-5 rounded-2xl border transition-all duration-300 ${
                            doc.uploaded 
                              ? 'bg-success/5 border-success/30' 
                              : 'bg-card border-border/50 hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                doc.uploaded ? 'bg-success/10' : 'bg-muted'
                              }`}>
                                {doc.uploaded ? (
                                  <Check className="w-5 h-5 text-success" />
                                ) : (
                                  <FileText className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-poppins font-medium text-foreground">
                                  {doc.name}
                                </h4>
                                <p className="font-tajawal text-sm text-muted-foreground">
                                  {doc.uploaded 
                                    ? doc.file?.name 
                                    : t('tammatFlow.dragDrop', 'Drag and drop or click to upload')
                                  }
                                </p>
                              </div>
                            </div>

                            {!doc.uploaded && (
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleDocumentUpload(doc.id, file)
                                  }}
                                />
                                <div className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-poppins text-sm font-medium hover:bg-primary/90 transition-colors">
                                  <Upload className="w-4 h-4 inline mr-2" />
                                  {t('tammatFlow.upload', 'Upload')}
                                </div>
                              </label>
                            )}

                            {doc.uploaded && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-success font-poppins text-sm font-medium flex items-center gap-1"
                              >
                                <Check className="w-4 h-4" />
                                {t('tammatFlow.uploaded', 'Uploaded')}
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Continue button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-10"
                    >
                      <Button
                        onClick={handleContinueToInfo}
                        disabled={!allDocsUploaded}
                        className="w-full py-6 rounded-2xl bg-primary text-primary-foreground font-poppins font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('tammatFlow.continue', 'Continue')}
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 4: Personal Information */}
                {step === 'info' && (
                  <motion.div
                    key="info"
                    variants={fadeSlide}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 font-poppins text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ x: -4 }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t('tammatFlow.back', 'Back')}
                    </motion.button>

                    <div className="text-center mb-12">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-poppins text-sm font-medium text-primary">
                          {t('tammatFlow.almostDone', 'Almost done!')}
                        </span>
                      </div>
                      <h2 className="font-poppins text-2xl sm:text-3xl font-semibold text-foreground mb-3">
                        {t('tammatFlow.infoTitle', 'Your information')}
                      </h2>
                      <p className="font-tajawal text-muted-foreground">
                        {t('tammatFlow.infoSubtitle', 'Fill in your details to complete the application')}
                      </p>
                    </div>

                    <motion.div 
                      className="space-y-6"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      <motion.div variants={staggerItem}>
                        <Label className="font-poppins text-sm font-medium text-foreground mb-2 block">
                          {t('tammatFlow.fullName', 'Full Name')} *
                        </Label>
                        <Input
                          value={formData.fullName}
                          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder={t('tammatFlow.fullNamePlaceholder', 'Enter your full name')}
                          className="h-14 rounded-xl bg-card border-border/50 font-tajawal text-base"
                        />
                      </motion.div>

                      <motion.div variants={staggerItem}>
                        <Label className="font-poppins text-sm font-medium text-foreground mb-2 block">
                          {t('tammatFlow.email', 'Email')} *
                        </Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder={t('tammatFlow.emailPlaceholder', 'your@email.com')}
                          className="h-14 rounded-xl bg-card border-border/50 font-tajawal text-base"
                        />
                      </motion.div>

                      <motion.div variants={staggerItem}>
                        <Label className="font-poppins text-sm font-medium text-foreground mb-2 block">
                          {t('tammatFlow.phone', 'Phone Number')} *
                        </Label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+971 50 123 4567"
                          className="h-14 rounded-xl bg-card border-border/50 font-tajawal text-base"
                        />
                      </motion.div>

                      <motion.div variants={staggerItem}>
                        <Label className="font-poppins text-sm font-medium text-foreground mb-2 block">
                          {t('tammatFlow.passport', 'Passport Number')}
                        </Label>
                        <Input
                          value={formData.passportNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, passportNumber: e.target.value }))}
                          placeholder={t('tammatFlow.passportPlaceholder', 'Enter passport number')}
                          className="h-14 rounded-xl bg-card border-border/50 font-tajawal text-base"
                        />
                      </motion.div>

                      <motion.div variants={staggerItem}>
                        <Label className="font-poppins text-sm font-medium text-foreground mb-2 block">
                          {t('tammatFlow.nationality', 'Nationality')}
                        </Label>
                        <Input
                          value={formData.nationality}
                          onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                          placeholder={t('tammatFlow.nationalityPlaceholder', 'Enter nationality')}
                          className="h-14 rounded-xl bg-card border-border/50 font-tajawal text-base"
                        />
                      </motion.div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-10"
                    >
                      <Button
                        onClick={handleContinueToReview}
                        disabled={!formComplete}
                        className="w-full py-6 rounded-2xl bg-primary text-primary-foreground font-poppins font-medium text-lg disabled:opacity-50"
                      >
                        {t('tammatFlow.reviewApplication', 'Review Application')}
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 5: Review */}
                {step === 'review' && selectedService && (
                  <motion.div
                    key="review"
                    variants={fadeSlide}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 font-poppins text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ x: -4 }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t('tammatFlow.back', 'Back')}
                    </motion.button>

                    <div className="text-center mb-12">
                      <motion.div 
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <Shield className="w-8 h-8 text-success" />
                      </motion.div>
                      <h2 className="font-poppins text-2xl sm:text-3xl font-semibold text-foreground mb-3">
                        {t('tammatFlow.reviewTitle', "You're all set!")}
                      </h2>
                      <p className="font-tajawal text-muted-foreground">
                        {t('tammatFlow.reviewSubtitle', 'Review your application before submitting')}
                      </p>
                    </div>

                    {/* Summary cards */}
                    <motion.div 
                      className="space-y-4"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {/* Service */}
                      <motion.div variants={staggerItem} className="p-5 rounded-2xl bg-card border border-border/50">
                        <div className="flex items-center gap-3 mb-3">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <h4 className="font-poppins font-medium text-foreground">
                            {t('tammatFlow.selectedService', 'Selected Service')}
                          </h4>
                        </div>
                        <p className="font-tajawal text-muted-foreground">{selectedService.name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-primary font-poppins font-semibold">{selectedService.price}</span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {selectedService.processingTime}
                          </span>
                        </div>
                      </motion.div>

                      {/* Documents */}
                      <motion.div variants={staggerItem} className="p-5 rounded-2xl bg-card border border-border/50">
                        <div className="flex items-center gap-3 mb-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <h4 className="font-poppins font-medium text-foreground">
                            {t('tammatFlow.documents', 'Documents')} ({documents.length})
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {documents.map(doc => (
                            <span key={doc.id} className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-tajawal flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              {doc.name}
                            </span>
                          ))}
                        </div>
                      </motion.div>

                      {/* Personal Info */}
                      <motion.div variants={staggerItem} className="p-5 rounded-2xl bg-card border border-border/50">
                        <div className="flex items-center gap-3 mb-3">
                          <User className="w-5 h-5 text-primary" />
                          <h4 className="font-poppins font-medium text-foreground">
                            {t('tammatFlow.personalInfo', 'Personal Information')}
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm font-tajawal">
                          <div>
                            <span className="text-muted-foreground">{t('tammatFlow.name', 'Name')}:</span>
                            <span className="ml-2 text-foreground">{formData.fullName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('tammatFlow.email', 'Email')}:</span>
                            <span className="ml-2 text-foreground">{formData.email}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('tammatFlow.phone', 'Phone')}:</span>
                            <span className="ml-2 text-foreground">{formData.phone}</span>
                          </div>
                          {formData.nationality && (
                            <div>
                              <span className="text-muted-foreground">{t('tammatFlow.nationality', 'Nationality')}:</span>
                              <span className="ml-2 text-foreground">{formData.nationality}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-10"
                    >
                      <Button
                        onClick={handleSubmit}
                        className="w-full py-6 rounded-2xl bg-primary text-primary-foreground font-poppins font-medium text-lg hover:bg-primary/90 transition-colors group"
                      >
                        <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                        {t('tammatFlow.submit', 'Submit Application')}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: AI Assistant */}
          <div className="hidden lg:flex w-[360px] flex-col border-l border-border/30 bg-card/30">
            {/* Assistant Header */}
            <div className="p-5 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success border-2 border-card" />
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-foreground">
                    {t('tammatFlow.assistantName', 'Tammat Assistant')}
                  </h3>
                  <p className="font-tajawal text-xs text-success">
                    {t('tammatFlow.assistantStatus', 'Here to help')}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={assistantRef}
              className="flex-1 overflow-y-auto p-5 space-y-4"
            >
              <AnimatePresence>
                {assistantMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    variants={scaleIn}
                    initial="initial"
                    animate="animate"
                    className="p-4 rounded-2xl bg-background border border-border/30"
                  >
                    <p className="font-tajawal text-sm text-foreground leading-relaxed">
                      {message.text}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4"
                >
                  <div className="flex gap-1">
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    />
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    />
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    />
                  </div>
                  <span className="font-tajawal text-xs text-muted-foreground">
                    {t('tammatFlow.typing', 'Typing...')}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Quick suggestions */}
            <div className="p-5 border-t border-border/30">
              <p className="font-poppins text-xs text-muted-foreground mb-3">
                {t('tammatFlow.quickHelp', 'Quick help')}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  t('tammatFlow.helpDocs', 'What docs do I need?'),
                  t('tammatFlow.helpTime', 'How long will this take?'),
                ].map((question, i) => (
                  <button
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-muted text-xs font-tajawal text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

