"use client"

import React, { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import SEO from '@/components/SEO/SEO'
import { 
  Search,
  ChevronDown,
  HelpCircle,
  FileText,
  Shield,
  Clock,
  CreditCard,
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Award,
  Headphones,
  Lock,
  Calendar,
  Upload,
  Eye,
  Zap,
  Star,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ThemeContext } from '@/contexts/ThemeContext'
import TMMTLogo from '@/assets/TMMTLogo.png'
import { useTranslation } from 'react-i18next'

// Theme hook
const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  helpful?: boolean
}

// ─── Translation Constants ──────────────────────────────────────────
const translations = {
  en: {
    seoTitle: 'FAQs - Tammat Visa Services',
    seoDescription: 'Find answers to common questions about UAE visa services, requirements, processing times, and application procedures. Get expert help for all your visa queries.',
    seoKeywords: 'UAE visa FAQs, visa questions, Dubai visa help, visa application process, visa requirements FAQ',
    seoName: 'UAE Visa Services FAQs',
    heroTitle: 'Frequently Asked',
    heroTitleHighlight: 'Questions',
    heroSubtitle: 'Find answers to common questions about our visa services, application process, and platform features.',
    searchPlaceholder: 'Search FAQs...',
    categoriesTitle: 'Browse by Category',
    categoriesSubtitle: 'Find answers organized by topic',
    categoriesAll: 'All',
    categoriesGeneral: 'General',
    categoriesVisa: 'Visa Services',
    categoriesDocuments: 'Documents',
    categoriesTimeline: 'Processing',
    categoriesPayment: 'Payment',
    categoriesSupport: 'Support',
    featuresTitle: 'Why Choose Tammat?',
    featuresSubtitle: 'Experience the future of visa services with our AI-powered platform',
    smartUploadTitle: 'Smart Document Upload',
    smartUploadDesc: 'Simply upload your documents, and our AI-powered system validates them instantly',
    licensedOfficersTitle: 'Licensed Officers',
    licensedOfficersDesc: 'Our licensed officers handle all government submissions, appointments, and follow-ups',
    realTimeTrackingTitle: 'Real-time Tracking',
    realTimeTrackingDesc: 'Track everything in real-time through your dashboard with live updates',
    allQuestions: 'All Questions',
    questions: 'Questions',
    found: 'question(s) found',
    helpful: 'Was this helpful?',
    helpfulYes: 'Helpful',
    helpfulNo: 'Yes',
    contactSupport: 'Contact Support',
    noResults: 'No FAQs found',
    noResultsSub: 'Try adjusting your search terms or browse different categories',
    clearFilters: 'Clear Filters',
    supportTitle: 'Still have questions?',
    supportSubtitle: 'Our licensed officers and support team are here to help you with any questions or concerns about your visa application.',
    supportCall: 'Call Us',
    supportCallNow: 'Call Now',
    supportEmail: 'Email Us',
    supportSendEmail: 'Send Email',
    supportChat: 'Live Chat',
    supportChatHours: 'Available 24/7',
    supportStartChat: 'Start Chat'
  },
  ar: {
    seoTitle: 'الأسئلة الشائعة - خدمات تأشيرات Tammat',
    seoDescription: 'ابحث عن إجابات للأسئلة الشائعة حول خدمات التأشيرات في الإمارات، المتطلبات، أوقات المعالجة، وإجراءات التقديم. احصل على مساعدة خبراء لجميع استفساراتك حول التأشيرات.',
    seoKeywords: 'الأسئلة الشائعة لتأشيرات الإمارات، أسئلة التأشيرة، مساعدة تأشيرة دبي، عملية التقديم للتأشيرة، متطلبات التأشيرة',
    seoName: 'الأسئلة الشائعة لخدمات التأشيرات في الإمارات',
    heroTitle: 'الأسئلة',
    heroTitleHighlight: 'الشائعة',
    heroSubtitle: 'ابحث عن إجابات للأسئلة الشائعة حول خدمات التأشيرات وعملية التقديم وميزات المنصة.',
    searchPlaceholder: 'ابحث في الأسئلة الشائعة...',
    categoriesTitle: 'تصفح حسب الفئة',
    categoriesSubtitle: 'ابحث عن إجابات منظمة حسب الموضوع',
    categoriesAll: 'الكل',
    categoriesGeneral: 'عام',
    categoriesVisa: 'خدمات التأشيرات',
    categoriesDocuments: 'المستندات',
    categoriesTimeline: 'المعالجة',
    categoriesPayment: 'الدفع',
    categoriesSupport: 'الدعم',
    featuresTitle: 'لماذا تختار Tammat؟',
    featuresSubtitle: 'اختبر مستقبل خدمات التأشيرات مع منصتنا المدعومة بالذكاء الاصطناعي',
    smartUploadTitle: 'رفع المستندات الذكي',
    smartUploadDesc: 'ما عليك سوى رفع مستنداتك، ويقوم نظامنا المدعوم بالذكاء الاصطناعي بالتحقق منها فوراً',
    licensedOfficersTitle: 'موظفون مرخصون',
    licensedOfficersDesc: 'يتولى موظفونا المرخصون جميع التقديمات الحكومية والمواعيد والمتابعات',
    realTimeTrackingTitle: 'تتبع فوري',
    realTimeTrackingDesc: 'تتبع كل شيء في الوقت الفعلي من خلال لوحة التحكم الخاصة بك مع تحديثات حية',
    allQuestions: 'جميع الأسئلة',
    questions: 'أسئلة',
    found: 'سؤال/أسئلة تم العثور عليها',
    helpful: 'هل كان هذا مفيداً؟',
    helpfulYes: 'مفيد',
    helpfulNo: 'نعم',
    contactSupport: 'اتصل بالدعم',
    noResults: 'لم يتم العثور على أسئلة شائعة',
    noResultsSub: 'حاول تعديل مصطلحات البحث أو تصفح فئات مختلفة',
    clearFilters: 'مسح التصفية',
    supportTitle: 'لا تزال لديك أسئلة؟',
    supportSubtitle: 'موظفونا المرخصون وفريق الدعم هنا لمساعدتك في أي أسئلة أو استفسارات حول طلب التأشيرة الخاص بك.',
    supportCall: 'اتصل بنا',
    supportCallNow: 'اتصل الآن',
    supportEmail: 'راسلنا',
    supportSendEmail: 'إرسال بريد إلكتروني',
    supportChat: 'محادثة مباشرة',
    supportChatHours: 'متاحة 24/7',
    supportStartChat: 'ابدأ المحادثة'
  }
};

const FAQ_CATEGORIES = [
  { id: 'general', name: 'General', icon: HelpCircle, count: 8 },
  { id: 'visa', name: 'Visa Services', icon: FileText, count: 12 },
  { id: 'documents', name: 'Documents', icon: Shield, count: 6 },
  { id: 'timeline', name: 'Processing', icon: Clock, count: 5 },
  { id: 'payment', name: 'Payment', icon: CreditCard, count: 4 },
]

const FAQS: FAQ[] = [
  // General FAQs
  {
    id: 'what-is-tammat',
    question: 'What is Tammat and how does it work?',
    answer: 'Tammat is a modern visa and residency services platform that simplifies the UAE visa application process. Simply upload your documents, and our AI-powered system validates them instantly. Our licensed officers handle all government submissions, appointments, and follow-ups.',
    category: 'general',
    tags: ['platform', 'ai', 'visa', 'uae']
  },
  {
    id: 'success-rate',
    question: 'What is your success rate for visa applications?',
    answer: 'We maintain a 98% success rate for visa applications. Our AI-powered system ensures all documents are properly verified before submission, and our expert team provides guidance throughout the process. Your documents are stored securely and never shared without your consent.',
    category: 'general',
    tags: ['success', 'rate', 'statistics']
  },
  {
    id: 'security',
    question: 'Is my personal information secure?',
    answer: 'Absolutely. We use bank-level encryption and are compliant with UAE data protection regulations. Your documents are stored securely and never shared without your consent. All data is encrypted and only accessible to authorized personnel.',
    category: 'general',
    tags: ['security', 'privacy', 'data']
  },
  {
    id: 'support-hours',
    question: 'What are your customer support hours?',
    answer: 'Our customer support is available 24/7 through our AI assistant and live chat. For complex queries, our human support team is available Monday to Friday, 9 AM to 6 PM UAE time. Our licensed officers are ready to assist you with all government submissions.',
    category: 'general',
    tags: ['support', 'hours', 'contact']
  },
  {
    id: 'mobile-app',
    question: 'Do you have a mobile app?',
    answer: 'Yes, we have a mobile app available for both iOS and Android. You can download it from the App Store or Google Play Store to manage your applications on the go. Track everything in real-time through your dashboard.',
    category: 'general',
    tags: ['mobile', 'app', 'ios', 'android']
  },
  {
    id: 'refund-policy',
    question: 'What is your refund policy?',
    answer: 'We offer a full refund if your application is rejected due to our error. However, government fees are non-refundable. Please refer to our terms and conditions for complete details.',
    category: 'general',
    tags: ['refund', 'policy', 'money']
  },
  {
    id: 'multiple-applications',
    question: 'Can I apply for multiple visas at once?',
    answer: 'Yes, you can apply for multiple visa types simultaneously. Our platform allows you to manage multiple applications from a single dashboard. We offer comprehensive UAE services including Residence Visas, Family Visas, Emirates ID, and more.',
    category: 'general',
    tags: ['multiple', 'applications', 'dashboard']
  },
  {
    id: 'language-support',
    question: 'What languages do you support?',
    answer: 'Our platform supports English and Arabic. Our AI assistant can communicate in both languages, and our support team is fluent in both.',
    category: 'general',
    tags: ['language', 'english', 'arabic']
  },

  // Visa Services FAQs
  {
    id: 'visa-types',
    question: 'What types of visas do you handle?',
    answer: 'We handle all types of UAE visas including: Residence Visas, Family Visas (spouse, children), Emirates ID, Medical Screening, Golden Visa, Business Setup, Trade License Renewals, Employee Visa Management, and PRO Services.',
    category: 'visa',
    tags: ['visa', 'types', 'family', 'residence']
  },
  {
    id: 'processing-time',
    question: 'How long does visa processing take?',
    answer: 'Processing times vary by visa type: Family visas (2-4 weeks), Residence visas (3-6 weeks), Entry permits (1-2 weeks), Emirates ID (1-2 weeks), and Visa renewals (1-2 weeks). Our licensed officers ensure fast and efficient processing.',
    category: 'visa',
    tags: ['processing', 'time', 'duration']
  },
  {
    id: 'visa-requirements',
    question: 'What are the general requirements for visa applications?',
    answer: 'Requirements vary by visa type but generally include: valid passport, recent photographs, medical certificate, salary certificate (for family visas), trade license (for business visas), and Emirates ID. Our AI system verifies all documents automatically.',
    category: 'visa',
    tags: ['requirements', 'documents', 'passport']
  },
  {
    id: 'visa-extension',
    question: 'Can I extend my visa through Tammat?',
    answer: 'Yes, we can help you extend your existing visa. We handle all types of visa extensions and can guide you through the renewal process. Our licensed officers manage all government submissions and follow-ups.',
    category: 'visa',
    tags: ['extension', 'renewal', 'visa']
  },
  {
    id: 'visa-status',
    question: 'How can I check my visa application status?',
    answer: 'You can check your application status through your Tammat dashboard, our mobile app, or by contacting our support team. Track everything in real-time through your dashboard with live updates at every milestone.',
    category: 'visa',
    tags: ['status', 'tracking', 'updates']
  },
  {
    id: 'visa-rejection',
    question: 'What happens if my visa is rejected?',
    answer: 'If your visa is rejected, we will analyze the reason and help you reapply with the necessary corrections. We provide detailed feedback and guidance for successful reapplication with our 98% success rate guarantee.',
    category: 'visa',
    tags: ['rejection', 'reapply', 'feedback']
  },

  // Documents FAQs
  {
    id: 'document-verification',
    question: 'How does document verification work?',
    answer: 'Simply upload your documents, and our AI-powered system validates them instantly. Our system checks for completeness, clarity, and compliance with UAE requirements before submission to government authorities.',
    category: 'documents',
    tags: ['verification', 'ai', 'compliance']
  },
  {
    id: 'document-formats',
    question: 'What document formats do you accept?',
    answer: 'We accept PDF, JPG, JPEG, and PNG formats. Documents should be clear, legible, and in high resolution. Maximum file size is 10MB per document.',
    category: 'documents',
    tags: ['formats', 'pdf', 'image', 'size']
  },
  {
    id: 'translation-required',
    question: 'Do I need to translate my documents?',
    answer: 'Documents in English or Arabic are accepted as-is. Documents in other languages must be translated to English or Arabic by a certified translator.',
    category: 'documents',
    tags: ['translation', 'language', 'certified']
  },
  {
    id: 'document-upload',
    question: 'How do I upload my documents?',
    answer: 'You can upload documents through our web platform or mobile app. Simply drag and drop files or click to browse. Our system will guide you through the required documents for your specific visa type.',
    category: 'documents',
    tags: ['upload', 'drag', 'drop', 'mobile']
  },
  {
    id: 'document-security',
    question: 'Are my documents secure after upload?',
    answer: 'Absolutely. We use bank-level encryption and are compliant with UAE data protection regulations. Your documents are stored securely and never shared without your consent.',
    category: 'documents',
    tags: ['security', 'encryption', 'storage']
  },
  {
    id: 'missing-documents',
    question: 'What if I\'m missing some documents?',
    answer: 'Our system will identify missing documents and provide you with a checklist. You can upload them later, but processing will only begin once all required documents are submitted.',
    category: 'documents',
    tags: ['missing', 'checklist', 'requirements']
  },

  // Timeline & Processing FAQs
  {
    id: 'urgent-processing',
    question: 'Do you offer urgent processing?',
    answer: 'Yes, we offer expedited processing for urgent cases. Additional fees apply, and processing time depends on the visa type and current government processing times. Our licensed officers prioritize urgent submissions.',
    category: 'timeline',
    tags: ['urgent', 'expedited', 'fees']
  },
  {
    id: 'tracking-updates',
    question: 'How often will I receive updates?',
    answer: 'You will receive updates at each major milestone: document verification, submission to authorities, under review, and final decision. Track everything in real-time through your dashboard with live notifications.',
    category: 'timeline',
    tags: ['updates', 'milestones', 'tracking']
  },
  {
    id: 'delays',
    question: 'What causes delays in processing?',
    answer: 'Common causes include incomplete documentation, government processing backlogs, additional verification requirements, or missing information. Our AI verification system minimizes delays by validating documents instantly.',
    category: 'timeline',
    tags: ['delays', 'backlogs', 'verification']
  },
  {
    id: 'holiday-impact',
    question: 'Do holidays affect processing times?',
    answer: 'Yes, UAE public holidays and weekends can extend processing times as government offices are closed. We factor this into our estimated timelines and keep you informed of any delays.',
    category: 'timeline',
    tags: ['holidays', 'weekends', 'government']
  },
  {
    id: 'processing-stages',
    question: 'What are the different processing stages?',
    answer: 'The stages are: Document verification, Application submission, Government review, Additional requirements (if needed), Final decision, and Visa issuance (if approved). Our dashboard provides real-time status updates.',
    category: 'timeline',
    tags: ['stages', 'process', 'government']
  },

  // Payment & Fees FAQs
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), bank transfers, and digital wallets like Apple Pay and Google Pay. All payments are processed securely with bank-level encryption.',
    category: 'payment',
    tags: ['payment', 'cards', 'digital', 'wallets']
  },
  {
    id: 'fee-breakdown',
    question: 'What fees are included in the total cost?',
    answer: 'Our fees include service charges, government fees, and processing costs. We provide a detailed breakdown before you confirm payment, with no hidden charges. Government fees are non-refundable.',
    category: 'payment',
    tags: ['fees', 'breakdown', 'transparent']
  },
  {
    id: 'refund-process',
    question: 'How long does the refund process take?',
    answer: 'Refunds are processed within 5-7 business days after approval. Government fees are non-refundable, but our service fees are fully refundable if the application is rejected due to our error.',
    category: 'payment',
    tags: ['refund', 'process', 'timeline']
  },
  {
    id: 'installment-payment',
    question: 'Do you offer installment payments?',
    answer: 'Yes, we offer flexible payment plans for certain visa types. You can pay in installments with a small processing fee. Contact our support team for more information.',
    category: 'payment',
    tags: ['installments', 'payment', 'plans']
  },

  // Support FAQs
  {
    id: 'contact-support',
    question: 'How can I contact customer support?',
    answer: 'You can contact us through live chat on our website, email at support@tammat.com, phone at +971 4 XXX XXXX, or through our mobile app. Our AI assistant is available 24/7.',
    category: 'support',
    tags: ['contact', 'support', 'chat', 'phone']
  },
  {
    id: 'ai-assistant',
    question: 'How does the AI assistant work?',
    answer: 'Our AI assistant can answer common questions, guide you through the application process, check document requirements, and provide real-time updates. It learns from your interactions to provide better assistance.',
    category: 'support',
    tags: ['ai', 'assistant', 'chatbot', 'help']
  },
  {
    id: 'escalation',
    question: 'When will my query be escalated to a human?',
    answer: 'Complex queries, technical issues, or requests that the AI cannot handle are automatically escalated to our human support team. You can also request human assistance at any time.',
    category: 'support',
    tags: ['escalation', 'human', 'support', 'complex']
  }
]

const FAQsPage: React.FC = () => {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const lang = isArabic ? translations.ar : translations.en
  
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({})

  // Check if dark mode
  const isDark = document.documentElement.classList.contains('dark')
  const primaryColor = '#0A3269' // Use #0A3269 in both modes
  const primaryColorLight = '#0A3269' + '30'
  const primaryColorLighter = '#0A3269' + '15'

  const filteredFAQs = FAQS.filter(faq => {
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId)
  }

  const toggleHelpful = (faqId: string) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [faqId]: !prev[faqId]
    }))
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = FAQ_CATEGORIES.find(cat => cat.id === categoryId)
    return category?.icon || HelpCircle
  }

  const getCategoryName = (id: string) => {
    const names: Record<string, string> = {
      general: lang.categoriesGeneral,
      visa: lang.categoriesVisa,
      documents: lang.categoriesDocuments,
      timeline: lang.categoriesTimeline,
      payment: lang.categoriesPayment,
      support: lang.categoriesSupport
    }
    return names[id] || id
  }

  const translatedCategories = FAQ_CATEGORIES.map(cat => ({
    ...cat,
    name: getCategoryName(cat.id)
  }))

  return (
    <>
      <SEO
        title={lang.seoTitle}
        description={lang.seoDescription}
        keywords={lang.seoKeywords}
        canonicalUrl="/faqs"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "name": lang.seoName
        }}
      />
      <div className="min-h-screen" style={{ backgroundColor: theme.background, color: theme.text }}>
        {/* Hero Section - No Shadows */}
        <div className="relative py-16 md:py-24 overflow-hidden" style={{ backgroundColor: theme.background }}>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="flex justify-center mb-2"
              >
                <img 
                  src={TMMTLogo} 
                  alt="Tammat logo" 
                  width={35}
                  height={35} 
                  className="h-25 w-19 dark:brightness-0 dark:invert" 
                />
              </motion.div>

              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight"
                style={{ color: theme.text }}
              >
                {lang.heroTitle}
                <br />
                <span style={{ color: primaryColor }}>{lang.heroTitleHighlight}</span>
              </h1>
              
              <p 
                className="text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed"
                style={{ color: theme.textSecondary }}
              >
                {lang.heroSubtitle}
              </p>

              {/* Search Bar - No Shadow */}
              <motion.div 
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative">
                  <Search 
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 z-10"
                    style={{ color: primaryColor }}
                  />
                  <Input
                    type="text"
                    placeholder={lang.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-4 text-lg rounded-2xl focus-visible:ring-2 transition-all"
                    style={{ 
                      backgroundColor: theme.inputBackground || 'rgba(255,255,255,0.05)',
                      border: `2px solid ${theme.inputBorder || 'rgba(255,255,255,0.1)'}`,
                      color: theme.text,
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Categories - No Shadows */}
        <div className="py-12" style={{ backgroundColor: theme.surface }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-10"
            >
              <h2 
                className="text-2xl md:text-3xl font-bold mb-2 tracking-tight"
                style={{ color: theme.text }}
              >
                {lang.categoriesTitle}
              </h2>
              <p 
                className="text-base"
                style={{ color: theme.textSecondary }}
              >
                {lang.categoriesSubtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <motion.button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  "relative p-4 rounded-xl text-center transition-all duration-300 overflow-hidden",
                  selectedCategory === 'all' && "ring-2"
                )}
                style={{
                  backgroundColor: selectedCategory === 'all' ? primaryColor : theme.surface,
                  color: selectedCategory === 'all' ? 'white' : theme.text,
                  border: `1px solid ${selectedCategory === 'all' ? primaryColor : theme.border}`,
                  ringColor: primaryColor,
                }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <HelpCircle className="w-5 h-5 mx-auto mb-1.5" />
                <div className="text-xs font-semibold">{lang.categoriesAll}</div>
                <div className="text-[10px] opacity-75 tabular-nums">{FAQS.length}</div>
              </motion.button>

              {translatedCategories.map((category, index) => {
                const Icon = category.icon
                const isSelected = selectedCategory === category.id
                
                return (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "relative p-4 rounded-xl text-center transition-all duration-300 overflow-hidden",
                      isSelected && "ring-2"
                    )}
                    style={{
                      backgroundColor: isSelected ? primaryColor : theme.surface,
                      color: isSelected ? 'white' : theme.text,
                      border: `1px solid ${isSelected ? primaryColor : theme.border}`,
                      ringColor: primaryColor,
                    }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1.5" />
                    <div className="text-xs font-semibold">{category.name}</div>
                    <div className="text-[10px] opacity-75 tabular-nums">{category.count}</div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Features Section - No Shadows */}
        <div className="py-12" style={{ backgroundColor: theme.background }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-10"
            >
              <h2 
                className="text-2xl md:text-3xl font-bold mb-2 tracking-tight"
                style={{ color: theme.text }}
              >
                {lang.featuresTitle}
              </h2>
              <p 
                className="text-base"
                style={{ color: theme.textSecondary }}
              >
                {lang.featuresSubtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl text-center"
                style={{ 
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: primaryColorLight }}
                >
                  <Upload className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <h3 
                  className="text-base font-semibold mb-1.5"
                  style={{ color: theme.text }}
                >
                  {lang.smartUploadTitle}
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: theme.textSecondary }}
                >
                  {lang.smartUploadDesc}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-2xl text-center"
                style={{ 
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: primaryColorLight }}
                >
                  <User className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <h3 
                  className="text-base font-semibold mb-1.5"
                  style={{ color: theme.text }}
                >
                  {lang.licensedOfficersTitle}
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: theme.textSecondary }}
                >
                  {lang.licensedOfficersDesc}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ delay: 0.6 }}
                className="p-6 rounded-2xl text-center"
                style={{ 
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: primaryColorLight }}
                >
                  <Eye className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <h3 
                  className="text-base font-semibold mb-1.5"
                  style={{ color: theme.text }}
                >
                  {lang.realTimeTrackingTitle}
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: theme.textSecondary }}
                >
                  {lang.realTimeTrackingDesc}
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* FAQs List - No Shadows */}
        <div className="py-12" style={{ backgroundColor: theme.surface }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <h2 
                className="text-xl font-bold mb-1 tracking-tight"
                style={{ color: theme.text }}
              >
                {selectedCategory === 'all' 
                  ? lang.allQuestions 
                  : getCategoryName(selectedCategory) + ' ' + lang.questions}
              </h2>
              <p 
                className="text-base"
                style={{ color: theme.textSecondary }}
              >
                {filteredFAQs.length} {lang.found}
              </p>
            </motion.div>

            <div className="space-y-3">
              <AnimatePresence>
                {filteredFAQs.map((faq, index) => {
                  const isExpanded = expandedFAQ === faq.id
                  const isHelpful = helpfulVotes[faq.id]
                  const Icon = getCategoryIcon(faq.category)
                  
                  return (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="overflow-hidden"
                    >
                      <Card 
                        className={cn(
                          "transition-all duration-300 rounded-2xl",
                          isExpanded && "ring-1"
                        )}
                        style={{ 
                          backgroundColor: theme.background,
                          border: `1px solid ${theme.border}`,
                          ringColor: primaryColor + '50',
                        }}
                      >
                        <CardHeader 
                          className="cursor-pointer py-4 px-5"
                          onClick={() => toggleFAQ(faq.id)}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300"
                                style={{
                                  backgroundColor: isExpanded ? primaryColorLight : primaryColorLighter,
                                }}
                              >
                                <Icon className="w-4 h-4" style={{ color: primaryColor }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle 
                                  className="text-base font-semibold leading-snug"
                                  style={{ color: theme.text }}
                                >
                                  {faq.question}
                                </CardTitle>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  <Badge 
                                    variant="outline"
                                    className="text-[10px] font-medium rounded-full px-2 py-0.5"
                                    style={{ 
                                      backgroundColor: primaryColorLighter,
                                      border: `1px solid ${primaryColor}30`,
                                      color: primaryColor
                                    }}
                                  >
                                    {getCategoryName(faq.category)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: isExpanded ? primaryColorLight : 'transparent' }}
                            >
                              <ChevronDown 
                                className="w-4 h-4"
                                style={{ color: isExpanded ? primaryColor : theme.textSecondary }}
                              />
                            </motion.div>
                          </div>
                        </CardHeader>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <CardContent 
                                className="pt-0 px-5 pb-4"
                                style={{ borderTop: `1px solid ${theme.border}` }}
                              >
                                <p 
                                  className="text-sm leading-relaxed mb-4 pt-4"
                                  style={{ color: theme.textSecondary }}
                                >
                                  {faq.answer}
                                </p>
                                
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-3">
                                    <span 
                                      className="text-xs font-medium"
                                      style={{ color: theme.textSecondary }}
                                    >
                                      {lang.helpful}
                                    </span>
                                    <motion.button
                                      onClick={() => toggleHelpful(faq.id)}
                                      className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 text-xs",
                                        isHelpful && "ring-1 ring-green-500"
                                      )}
                                      style={{
                                        backgroundColor: isHelpful ? '#10b981' + '15' : theme.surface,
                                        border: `1px solid ${isHelpful ? '#10b981' : theme.border}`,
                                        color: isHelpful ? '#10b981' : theme.textSecondary
                                      }}
                                      whileHover={{ scale: 1.03 }}
                                      whileTap={{ scale: 0.97 }}
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span className="font-medium">
                                        {isHelpful ? lang.helpfulYes : lang.helpfulNo}
                                      </span>
                                    </motion.button>
                                  </div>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs rounded-full px-3 py-1.5 h-auto"
                                    style={{
                                      backgroundColor: theme.surface,
                                      border: `1px solid ${theme.border}`,
                                      color: theme.textSecondary
                                    }}
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                                    {lang.contactSupport}
                                  </Button>
                                </div>
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {filteredFAQs.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
                  style={{ backgroundColor: primaryColorLighter }}
                >
                  <AlertCircle 
                    className="w-7 h-7"
                    style={{ color: primaryColor }}
                  />
                </div>
                <h3 
                  className="text-lg font-semibold mb-1.5"
                  style={{ color: theme.text }}
                >
                  {lang.noResults}
                </h3>
                <p 
                  className="text-base mb-4"
                  style={{ color: theme.textSecondary }}
                >
                  {lang.noResultsSub}
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="rounded-full px-6"
                  style={{
                    backgroundColor: primaryColor,
                    color: 'white',
                  }}
                >
                  {lang.clearFilters}
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Contact Support Section - No Shadows */}
        <div className="py-16" style={{ backgroundColor: theme.background }}>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div 
                className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center relative"
                style={{ backgroundColor: primaryColorLight }}
              >
                <MessageCircle className="w-8 h-8 relative" style={{ color: primaryColor }} />
              </div>
              
              <h2 
                className="text-2xl md:text-3xl font-bold mb-3 tracking-tight"
                style={{ color: theme.text }}
              >
                {lang.supportTitle}
              </h2>
              
              <p 
                className="text-base mb-8 max-w-2xl mx-auto leading-relaxed"
                style={{ color: theme.textSecondary }}
              >
                {lang.supportSubtitle}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="p-5 rounded-2xl text-center"
                  style={{ 
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-3"
                    style={{ backgroundColor: primaryColorLighter }}
                  >
                    <Phone 
                      className="w-5 h-5"
                      style={{ color: primaryColor }}
                    />
                  </div>
                  <h3 
                    className="text-base font-semibold mb-1"
                    style={{ color: theme.text }}
                  >
                    {lang.supportCall}
                  </h3>
                  <p 
                    className="text-xs mb-3"
                    style={{ color: theme.textSecondary }}
                  >
                    +971 50 167 6916
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full w-full text-xs h-auto py-2"
                    style={{
                      backgroundColor: primaryColorLighter,
                      border: `1px solid ${primaryColor}`,
                      color: primaryColor
                    }}
                  >
                    {lang.supportCallNow}
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="p-5 rounded-2xl text-center"
                  style={{ 
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-3"
                    style={{ backgroundColor: primaryColorLighter }}
                  >
                    <Mail 
                      className="w-5 h-5"
                      style={{ color: primaryColor }}
                    />
                  </div>
                  <h3 
                    className="text-base font-semibold mb-1"
                    style={{ color: theme.text }}
                  >
                    {lang.supportEmail}
                  </h3>
                  <p 
                    className="text-xs mb-3"
                    style={{ color: theme.textSecondary }}
                  >
                    Tmmt.aecontact@gmail.com
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full w-full text-xs h-auto py-2"
                    style={{
                      backgroundColor: primaryColorLighter,
                      border: `1px solid ${primaryColor}`,
                      color: primaryColor
                    }}
                  >
                    {lang.supportSendEmail}
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="p-5 rounded-2xl text-center"
                  style={{ 
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-3"
                    style={{ backgroundColor: primaryColorLighter }}
                  >
                    <MessageCircle 
                      className="w-5 h-5"
                      style={{ color: primaryColor }}
                    />
                  </div>
                  <h3 
                    className="text-base font-semibold mb-1"
                    style={{ color: theme.text }}
                  >
                    {lang.supportChat}
                  </h3>
                  <p 
                    className="text-xs mb-3"
                    style={{ color: theme.textSecondary }}
                  >
                    {lang.supportChatHours}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full w-full text-xs h-auto py-2"
                    style={{
                      backgroundColor: primaryColorLighter,
                      border: `1px solid ${primaryColor}`,
                      color: primaryColor
                    }}
                  >
                    {lang.supportStartChat}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}

export default FAQsPage