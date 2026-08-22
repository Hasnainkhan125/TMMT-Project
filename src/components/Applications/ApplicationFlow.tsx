import { useState, useEffect, useCallback, useRef, memo, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft, X, MessageCircle, Send, LogIn, UserPlus, Bot, XCircle,
  User, Mail, Phone, Sparkles, Check,
} from 'lucide-react'
import {
 Shield, Lock, Loader2, RefreshCw, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { getAllServices as getLocalServices } from '@/config/services'
import { ThemeContext } from '@/contexts/ThemeContext'

import ServiceStep from './steps/ServiceStep'
import InputStep   from './steps/InputStep'
import UploadStep  from './steps/UploadStep'
import ReviewStep  from './steps/ReviewStep'
import PaymentStep from './steps/PaymentStep'
import SuccessStep from './steps/SuccessStep'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
export interface ServicePrice {
  priceType:   'Inside' | 'Outside' | string
  priceAmount: number
  currency:    string
}

export interface FlowService {
  id: string
  name: string
  description: string
  category?: string
  categorySlug?: string
  subcategoryName?: string
  requirements?: string[]
  requiredDocuments?: string[]
  formDescription?: string
  processingTime?: string
  process?: any[]
  fee?: number
  prices?: ServicePrice[]
  image?: string
  noOfApplications?: string
}

type StepId =
  | 'service' | 'sponsorType' | 'location' | 'userInfo' | 'upload' | 'review' | 'payment' | 'success'

export interface FlowData {
  service?:       FlowService
  sponsorType?:   'employee' | 'investor' | 'partner'
  location?:      'inside' | 'outside'
  files?:         Record<string, File[]>
  applicationId?: string
}

interface ApplicationFlowProps {
  open?:           boolean
  onOpenChange?:   (v: boolean) => void
  queryParams?:    string
  initialService?: string
}

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const STEPS: StepId[] = [
  'service', 'sponsorType', 'location', 'userInfo',
  'upload', 'review', 'payment', 'success',
]

const STEP_GROUP: Record<StepId, string> = {
  service:     'flow.group.choose',
  sponsorType: 'flow.group.info',
  location:    'flow.group.info',
  userInfo:    'flow.group.info',
  upload:      'flow.group.upload',
  review:      'flow.group.review',
  payment:     'flow.group.payment',
  success:     'flow.group.done',
}

const LS_KEY = 'tammat_flow_data'

// ─────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────
const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'
const apiUrl  = `${apiBase}/api/v1`

// Maps every numeric Recordid → backend enum string
const SERVICE_ID_TO_ENUM: Record<string, string> = {
  '4':   'spouse_residence_visa',
  '9':   'parents_residence_visa',
  '12':  'investor_partner_visa',
  '13':  'entry_permit_short_term_visit_parents_siblings_inlaws',
  '14':  'entry_permit_short_term_visit_spouse_kids',
  '15':  'entry_permit_long_term_visit_parents_siblings_inlaws',
  '243': 'entry_permit_long_term_visit_spouse_kids',
  '50':  'change_status_family',
  '51':  'change_status_employee',
  '52':  'change_status_visit_visa',
  '23':  'spouse_children_visa_stamping',
  '26':  'parents_visa_stamping',
  '22':  'employee_visa_stamping',
  '32':  'son_daughter_visa_stamping',
  '35':  'partner_investor_visa_stamping_2_years',
  '227': 'spouse_children_visa_renewal',
  '229': 'son_above_18_visa_renewal',
  '236': 'partner_investor_visa_renewal_2_years',
  '239': 'parents_visa_renewal_1_year',
  '38':  'family_residence_visa_cancellation',
  '40':  'employment_visa_cancellation',
  '42':  'partner_investor_visa_cancellation',
  '293': 'cancellation_entry_permit_before_entry_company',
  '36':  'cancellation_entry_permit_after_entry_family',
  '37':  'cancellation_entry_permit_after_entry_company',
  '17':  'new_born_residence_visa',
  '16':  'employment_visa',
  '54':  'golden_visa_commercial_investor',
  '55':  'golden_visa_director_manager',
  '56':  'golden_visa_doctors',
  '57':  'golden_visa_engineers',
  '58':  'golden_visa_new_born_baby',
  '59':  'golden_visa_phd_holder',
  '60':  'golden_visa_scientists',
  '61':  'golden_visa_family_members',
  '63':  'golden_visa_commercial_investor_2m_deposit',
  '64':  'golden_visa_outstanding_student_highschool',
  '65':  'golden_visa_outstanding_student_university',
  '66':  'golden_visa_creative_people_culture_art',
  '44':  'new_establishment_card_with_online',
  '45':  'new_establishment_card_without_online',
  '46':  'renewal_establishment_card_with_online',
  '47':  'renewal_establishment_card_without_online',
  '218': 'immigration_employee_list',
  '220': 'modification_immigration_card',
  '53':  'holding_visa_family',
  '67':  'data_modification_family',
  '68':  'data_modification_company',
  '219': 'new_pro_card',
  '221': 'renewal_pro_card',
  '222': 'modify_pro_card',
  '223': 'reconsideration_rejected_visa_application',
  '20':  'family_visit_visa_extend',
  '48':  'travel_report_family',
  '49':  'travel_report_company',
  '69':  'security_deposit',
  // legacy slugs
  'family-visa-spouse':  'family_visa_spouse',
  'family-visa-child':   'family_visa_child',
  'residence-visa':      'residence_visa',
  'entry-permit':        'entry_permit',
  'emirates-id':         'emirates_id',
  'visa-renewal':        'visa_renewal',
  'medical':             'medical',
  'change-status':       'change_status',
  'visa-stamping':       'visa_stamping',
}

const toApplicationType = (id?: string): string => {
  if (!id) return 'residence_visa'
  const key = String(id)
  if (SERVICE_ID_TO_ENUM[key]) return SERVICE_ID_TO_ENUM[key]
  return key?.replace(/-/g, '_')?.toLowerCase() || 'residence_visa'
}

const DOC_FIELD_MAP: Record<string, string> = {
  'emirates-id':         'sponsor_emirates_id',
  'residency-visa':      'sponsor_visa',
  'passport':            'sponsor_passport',
  'salary-certificate':  'sponsor_salary_certificate',
  'trade-license':       'sponsor_trade_license',
  'establishment-card':  'sponsor_establishment_card',
  'spouse-passport':     'sponsored_passport_front',
  'spouse-photos':       'sponsored_photo',
  'marriage-certificate':'marriage_certificate',
  'birth-certificate':   'birth_certificate',
  'child-passport':      'sponsored_passport_front',
  'parents-passports':   'sponsored_passport_front',
  'parents-photos':      'sponsored_photo',
}
const mapDocField = (id: string) => DOC_FIELD_MAP[id] || id

// ─────────────────────────────────────────
// Slide animation
// ─────────────────────────────────────────
const slide = {
  enter:  (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
}

// ─────────────────────────────────────────
// localStorage helpers (Files not persisted — can't JSON-serialize)
// ─────────────────────────────────────────
function persistData(d: FlowData) {
  try {
    const { files: _files, ...rest } = d   // exclude File objects
    localStorage.setItem(LS_KEY, JSON.stringify(rest))
  } catch { /* quota exceeded — silently ignore */ }
}

function loadPersistedData(): Partial<FlowData> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

// ─────────────────────────────────────────
// AI Chat panel (memoised — never remounts)
// ─────────────────────────────────────────
interface ChatMessage { role: 'user' | 'assistant'; text: string }

const AIChatPanel = memo(function AIChatPanel({
  open,
  onClose,
  service,
  stepIndex,
}: {
  open: boolean
  onClose: () => void
  service?: FlowService
  stepIndex?: number
}) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { theme } = useContext(ThemeContext)
  const [msgs, setMsgs]     = useState<ChatMessage[]>([
    { role: 'assistant', text: isArabic ? 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك في طلبك؟' : t('flow.chat.welcome') },
  ])
  const [input, setInput]   = useState('')
  const [busy, setBusy]     = useState(false)
  const bottomRef           = useRef<HTMLDivElement>(null)
  const API_CHAT = `${apiUrl}/chat/process`

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    setMsgs(prev => [...prev, { role: 'user', text }])
    setBusy(true)
    try {
      const token = localStorage.getItem('authToken') || ''
      const chatHistory = msgs.map(m => ({
        type: m.role === 'user' ? 'user' : 'bot',
        content: m.text,
      }))
      const res = await fetch(API_CHAT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: text,
          context: {
            step: stepIndex ?? 0,
            service: service ? { id: service.id, name: service.name } : undefined,
            chatHistory,
          },
        }),
      })
      const d = await res.json()
      const reply = d?.response || d?.data?.response || d?.data?.reply || (isArabic ? 'جاري التفكير...' : t('flow.chat.thinking'))
      setMsgs(prev => [...prev, { role: 'assistant', text: reply }])
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', text: isArabic ? 'جاري التفكير...' : t('flow.chat.thinking') }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="chat-panel"
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed bottom-20 right-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
          style={{
            backgroundColor: theme.background,
            borderColor: theme.border,
            maxHeight: 'min(520px, calc(100dvh - 8rem))',
          }}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: theme.border, backgroundColor: theme.primary }}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white text-[14px] flex-1">{isArabic ? 'المساعد الذكي' : t('flow.chat.title')}</span>
            <button
              onClick={onClose}
              aria-label={isArabic ? 'إغلاق المحادثة' : t('flow.chat.close')}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ backgroundColor: theme.background }}>
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? (isArabic ? 'justify-start' : 'justify-end') : (isArabic ? 'justify-end' : 'justify-start')}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? isArabic ? 'rounded-bl-sm' : 'rounded-br-sm'
                      : isArabic ? 'rounded-br-sm' : 'rounded-bl-sm border'
                  }`}
                  style={{
                    backgroundColor: m.role === 'user' ? theme.primary : theme.surface,
                    color: m.role === 'user' ? theme.buttonText : theme.text,
                    borderColor: m.role === 'user' ? 'transparent' : theme.border,
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 border"
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                >
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: theme.textSecondary, animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 flex items-center gap-2 px-3 py-3 border-t" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder={isArabic ? 'اسألني أي شيء...' : t('flow.chat.placeholder')}
              className="flex-1 text-[14px] border rounded-xl px-3 py-2 outline-none transition-colors placeholder:text-[#94A3B8]"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || busy}
              className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 transition-colors shrink-0"
              style={{ backgroundColor: theme.primary, color: theme.buttonText }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ─────────────────────────────────────────
// Login Gate (shown inline when not authed)
// ─────────────────────────────────────────
const LoginGate = memo(function LoginGate({ onDismiss }: { onDismiss: () => void }) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigate   = useNavigate()
  const { theme }  = useContext(ThemeContext)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm px-4 pb-6 sm:pb-0"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <motion.div
        initial={{ y: 32 }}
        animate={{ y: 0 }}
        className="w-full max-w-sm rounded-3xl p-7 shadow-2xl space-y-5"
        style={{ backgroundColor: theme.background, color: theme.text }}
      >
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: theme.primary + '20', border: `1px solid ${theme.primary}30` }}>
            <LogIn className="w-5 h-5" style={{ color: theme.primary }} />
          </div>
          <h3 className="font-bold text-[20px]" style={{ color: theme.text }}>{isArabic ? 'تسجيل الدخول مطلوب' : t('flow.loginRequired')}</h3>
          <p className="text-[14px] leading-relaxed" style={{ color: theme.textSecondary }}>{isArabic ? 'يرجى تسجيل الدخول للمتابعة مع طلبك.' : t('flow.loginDesc')}</p>
        </div>

        <div className="space-y-2.5">
          <Button
            onClick={() => navigate('/auth?redirect=/apply')}
            className="w-full h-12 rounded-2xl font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: theme.primary, color: theme.buttonText }}
          >
            <LogIn className="w-4 h-4" />
            {isArabic ? 'تسجيل الدخول' : t('flow.loginBtn')}
          </Button>
          <Button
            onClick={() => navigate('/auth?mode=signup&redirect=/apply')}
            variant="outline"
            className="w-full h-12 rounded-2xl font-semibold flex items-center justify-center gap-2"
            style={{ borderColor: theme.border, color: theme.text }}
          >
            <UserPlus className="w-4 h-4" />
            {isArabic ? 'إنشاء حساب' : t('flow.signUpBtn')}
          </Button>
          <button
            onClick={onDismiss}
            className="w-full text-[13px] py-1 transition-colors"
            style={{ color: theme.textSecondary }}
          >
            {isArabic ? 'إلغاء' : t('common.cancel')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
})

// ─────────────────────────────────────────
// UserInfo Step - Shows user's email and phone from profile
// ─────────────────────────────────────────
function UserInfoStep({ onNext }: { onNext: () => void }) {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { theme } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Get user data from multiple sources
  const getUserData = () => {
    try {
      const stored = localStorage.getItem('userData')
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          name: user?.name || parsed?.name || parsed?.fullName || parsed?.full_name || '',
          email: user?.email || parsed?.email || '',
          phone: user?.phone || parsed?.phone || parsed?.phoneNumber || parsed?.phone_number || parsed?.mobile || parsed?.mobileNumber || '',
        }
      }
    } catch (e) {
      console.warn('Failed to parse user data', e)
    }
    return {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }
  }

  const userData = getUserData()

  // Check for phone in localStorage
  const getPhoneFromStorage = () => {
    try {
      const keys = ['phone', 'phoneNumber', 'phone_number', 'mobile', 'mobileNumber', 'userPhone', 'user_phone']
      for (const key of keys) {
        const value = localStorage.getItem(key)
        if (value) return value
      }
    } catch (e) {
      console.warn('Failed to get phone from localStorage', e)
    }
    return null
  }

  const storedPhone = getPhoneFromStorage()
  const phoneValue = userData.phone || storedPhone || ''

  const infoItems = [
    { 
      icon: User, 
      label: isArabic ? 'الاسم الكامل' : t('userInfo.fullName', 'Full Name'), 
      value: userData.name || (isArabic ? 'غير متوفر' : t('userInfo.notProvided', 'Not provided')),
      key: 'name'
    },
    { 
      icon: Mail, 
      label: isArabic ? 'البريد الإلكتروني' : t('userInfo.email', 'Email Address'), 
      value: userData.email || (isArabic ? 'غير متوفر' : t('userInfo.notProvided', 'Not provided')),
      key: 'email'
    },
    { 
      icon: Phone, 
      label: isArabic ? 'رقم الهاتف' : t('userInfo.phone', 'Phone Number'), 
      value: phoneValue || (isArabic ? 'غير متوفر' : t('userInfo.notProvided', 'Not provided')),
      key: 'phone'
    },
  ]

  const hasAllInfo = infoItems.every(item => item.value !== (isArabic ? 'غير متوفر' : t('userInfo.notProvided', 'Not provided')))
  const missingFields = infoItems.filter(item => item.value === (isArabic ? 'غير متوفر' : t('userInfo.notProvided', 'Not provided')))

  const fetchUserProfile = async () => {
    setIsFetching(true)
    setFetchError(null)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${apiBase}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      
      if (data.success && data.user) {
        const phone = data.user.phone || data.user.phoneNumber || data.user.mobile || ''
        if (phone) {
          localStorage.setItem('userPhone', phone)
          localStorage.setItem('userData', JSON.stringify({
            ...JSON.parse(localStorage.getItem('userData') || '{}'),
            phone: phone,
          }))
          setRefreshing(true)
          setTimeout(() => {
            window.location.reload()
          }, 500)
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      setFetchError(isArabic ? 'تعذر الحصول على رقم الهاتف' : t('userInfo.fetchError', 'Could not fetch phone number'))
    } finally {
      setIsFetching(false)
    }
  }

  const goToProfile = () => {
    navigate('/profile')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-lg mx-auto w-full"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex items-center justify-center mx-auto border border-[var(--primary)]/20 shadow-lg shadow-[var(--primary)]/10"
          >
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--primary)]" strokeWidth={1.5} />
          </motion.div>
          <h2 
            className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight"
            style={{ color: theme.text, fontFamily: "'Fraunces', serif" }}
          >
            {isArabic ? 'معلوماتك' : t('userInfo.title', 'Your Information')}
          </h2>
          <p className="text-sm md:text-base" style={{ color: theme.textSecondary }}>
            {isArabic ? 'سنستخدم هذه المعلومات من حسابك' : t('userInfo.subtitle', "We'll use this information from your account")}
          </p>
        </div>

        {/* Info Cards */}
        <div className="space-y-2.5 sm:space-y-3">
          {infoItems.map((item, index) => {
            const hasValue = item.value !== (isArabic ? 'غير متوفر' : t('userInfo.notProvided', 'Not provided'))
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
                className={`
                  group relative flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl
                  transition-all duration-300
                  hover:scale-[1.01] hover:shadow-lg hover:shadow-[var(--primary)]/5
                `}
                style={{
                  backgroundColor: hasValue 
                    ? (theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)')
                    : (theme.isDark ? 'rgba(251, 191, 36, 0.08)' : 'rgba(251, 191, 36, 0.06)'),
                  border: hasValue 
                    ? `1px solid ${theme.border}`
                    : '1px solid rgba(251, 191, 36, 0.25)',
                }}
              >
                {/* Accent Line */}
                <div 
                  className={`
                    absolute ${isArabic ? 'right-0 rounded-l-full' : 'left-0 rounded-r-full'} top-1/2 -translate-y-1/2 w-1 h-8
                    transition-all duration-300 group-hover:h-10
                    ${hasValue ? 'bg-[var(--primary)]' : 'bg-amber-500'}
                    opacity-0 group-hover:opacity-100
                  `}
                />

                {/* Icon */}
                <div 
                  className={`
                    w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0
                    transition-all duration-300 group-hover:scale-105
                  `}
                  style={{ 
                    backgroundColor: hasValue 
                      ? 'var(--primary)' + '15' 
                      : 'rgba(251, 191, 36, 0.15)',
                  }}
                >
                  <item.icon 
                    className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${hasValue ? 'text-[var(--primary)]' : 'text-amber-500'}`} 
                    strokeWidth={1.75} 
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                    {item.label}
                  </p>
                  <p 
                    className={`text-sm sm:text-base font-medium truncate mt-0.5 ${hasValue ? '' : 'text-amber-500'}`}
                    style={{ color: hasValue ? theme.text : '#D97706' }}
                  >
                    {item.value}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {hasValue ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <span className="text-[9px] sm:text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      {isArabic ? 'مفقود' : t('userInfo.missing', 'Missing')}
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Missing Info Alert */}
        {!hasAllInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-4 sm:p-5 space-y-3"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(251, 191, 36, 0.02))',
              border: '1px solid rgba(251, 191, 36, 0.15)',
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)' }}
              >
                <span className="text-amber-500 text-sm font-bold">!</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: theme.text }}>
                  {isArabic ? 'معلومات مفقودة' : t('userInfo.missingInfoTitle', 'Missing Information')}
                </p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: theme.textSecondary }}>
                  {missingFields.map(f => f.label).join(', ')} {missingFields.length === 1 ? (isArabic ? 'مفقود' : t('userInfo.isMissing', 'is')) : (isArabic ? 'مفقودة' : t('userInfo.areMissing', 'are'))} {isArabic ? 'من ملفك الشخصي.' : t('userInfo.missingFromProfile', 'missing from your profile.')}
                  {phoneValue ? '' : (isArabic ? ' يرجى إضافة رقم هاتفك للمتابعة.' : t('userInfo.phoneRequired', ' Please add your phone number to continue.'))}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={goToProfile}
                variant="outline"
                className="flex-1 h-10 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: 'transparent',
                }}
              >
                <User className="w-4 h-4 mr-2" />
                {isArabic ? 'تحديث الملف الشخصي' : t('userInfo.updateProfile', 'Update Profile')}
              </Button>
              {!phoneValue && (
                <Button
                  onClick={fetchUserProfile}
                  disabled={isFetching}
                  className="flex-1 h-10 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] bg-[var(--primary)] text-white dark:text-white hover:bg-[var(--primary)]/90"
                >
                  {isFetching ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {isFetching ? (isArabic ? 'جاري التحميل...' : t('userInfo.fetching', 'Fetching...')) : (isArabic ? 'تحديث' : t('userInfo.refresh', 'Refresh'))}
                </Button>
              )}
            </div>
            {fetchError && (
              <p className="text-xs text-red-500 text-center">{fetchError}</p>
            )}
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={onNext}
            className="w-full h-12 sm:h-13 md:h-14 rounded-2xl font-semibold text-sm sm:text-base transition-all hover:scale-[1.02] active:scale-[0.98]  relative overflow-hidden group"
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'white',
            }}
          >
            {/* Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <span className="relative z-10">{isArabic ? 'متابعة' : t('common.continue', 'Continue')}</span>
            {isArabic ? (
              <ArrowRight className="w-4 h-4 mr-2 relative z-10 group-hover:-translate-x-1 transition-transform duration-300 rotate-180" strokeWidth={2} />
            ) : (
              <ArrowRight className="w-4 h-4 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
            )}
          </Button>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" style={{ color: theme.textSecondary }} />
            <span className="text-[9px] sm:text-[10px]" style={{ color: theme.textSecondary }}>
              {isArabic ? 'آمن ومشفر' : t('userInfo.secure', 'Secure & Encrypted')}
            </span>
          </div>
          <span className="w-px h-4" style={{ backgroundColor: theme.border }} />
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" style={{ color: theme.textSecondary }} />
            <span className="text-[9px] sm:text-[10px]" style={{ color: theme.textSecondary }}>
              {isArabic ? 'خصوصية محمية' : t('userInfo.privacy', 'Privacy Protected')}
            </span>
          </div>
          <span className="w-px h-4" style={{ backgroundColor: theme.border }} />
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" style={{ color: theme.textSecondary }} />
            <span className="text-[9px] sm:text-[10px]" style={{ color: theme.textSecondary }}>
              {isArabic ? 'حساب موثق' : t('userInfo.verified', 'Verified Account')}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}


// ─────────────────────────────────────────
// Main component
// ─────────────────────────────────────────
export default function ApplicationFlow({
  open,
  onOpenChange,
  queryParams,
  initialService,
}: ApplicationFlowProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { user } = useAuth()
  const { theme } = useContext(ThemeContext)
  const navigate = useNavigate()
  const token    = typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''
  const isModal  = open !== undefined

  // ── Step state ──────────────────────────
  const [stepIndex, setStepIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  // ── Form data — hydrated from localStorage on mount ──
  const [data, setData] = useState<FlowData>(() => {
    const saved = loadPersistedData()
    return saved as FlowData
  })

  // ── Other state ─────────────────────────
  const [services, setServices] = useState<FlowService[]>([])
  const [loading,  setLoading]  = useState(true)
  const [creating, setCreating] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const step   = STEPS[stepIndex]
  const isDone = step === 'success'
  const progress = Math.round((stepIndex / (STEPS.length - 1)) * 100)

  // ── Persist data whenever it changes ────
  useEffect(() => {
    persistData(data)
  }, [data])

  // ── Load services ────────────────────────
  useEffect(() => {
    setLoading(true)
    const q = queryParams || initialService || 'visa'
    fetch(`${apiUrl}/services/search?q=${encodeURIComponent(q)}&limit=60`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        console.log(d,"the fact stuff")
        const list: FlowService[] = (d?.data?.services || []).map((s: any) => {
          const rawPrices: any[] = Array.isArray(s.prices) ? s.prices : []
          const prices: ServicePrice[] = rawPrices.map((p: any) => ({
            priceType:   p.PriceType   || p.priceType   || 'Inside',
            priceAmount: Number(p.PriceAmount || p.priceAmount || 0),
            currency:    p.PriceCurrency || p.currency || 'AED',
          }))
          return {
            id:                s.id || s.serviceId || s.slug || String(s.name),
            name:              s.serviceName || s.name,
            description:       s.outsideDescription || s.description || '',
            category:          s.categoryName || s.category || '',
            categorySlug:      s.categorySlug || '',
            subcategoryName:   s.subcategoryName || '',
            requirements:      Array.isArray(s.requirements) ? s.requirements : [],
            requiredDocuments: Array.isArray(s.requiredDocuments) ? s.requiredDocuments : [],
            formDescription:   s.formDescription || '',
            processingTime:    s.processingTime || '',
            process:           s.process || [],
            prices,
            fee:               prices[0]?.priceAmount || s.fee || s.cost || 1500,
            image:             s.image || s.imageSrc || '',
            noOfApplications:  s.noOfApplications || s.noOfApplication || '',
          }
        })
        setServices(list.length ? list : fallback())
      })
      .catch(() => setServices(fallback()))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams, initialService])

  const fallback = (): FlowService[] =>
    getLocalServices().map((ls: any) => ({
      id:           ls.id,
      name:         ls.name,
      description:  ls.description,
      category:     ls.category,
      requirements: (ls.requirements || []).map((r: any) => (typeof r === 'string' ? r : r.id)),
      process:      ls.process || [],
      fee:          ls.cost || 1500,
    }))

  // ── Reset when modal closes ──────────────
  useEffect(() => {
    if (isModal && !open) {
      const t = setTimeout(() => { setStepIndex(0); setData({}); setDirection(1) }, 350)
      return () => clearTimeout(t)
    }
  }, [open, isModal])

  // ── Navigation ───────────────────────────
  const advance = useCallback((patch?: Partial<FlowData>) => {
    setDirection(1)
    setData(prev => {
      const next = { ...prev, ...patch }
      return next
    })
    setStepIndex(i => Math.min(i + 1, STEPS.length - 1))
  }, [])

  const back = useCallback(() => {
    if (stepIndex === 0) {
      isModal ? onOpenChange?.(false) : navigate(-1)
      return
    }
    setDirection(-1)
    setStepIndex(i => Math.max(i - 1, 0))
  }, [stepIndex, isModal, navigate, onOpenChange])

  const close = useCallback(() => {
    // Clear persisted data when user explicitly closes the flow
    localStorage.removeItem(LS_KEY)
    isModal ? onOpenChange?.(false) : navigate('/')
  }, [isModal, navigate, onOpenChange])

  // ── 🔄 Reset flow (refresh index) ──
  const resetFlow = useCallback(() => {
    // Reset to first step (service selection)
    setStepIndex(0)
    setDirection(1)
    // Clear all form data
    setData({})
    // Remove persisted data from localStorage
    localStorage.removeItem(LS_KEY)
    // Close any open overlays
    setChatOpen(false)
    setShowLogin(false)
    // Optional: show a toast notification
    toast.info(isArabic ? 'تم إعادة تعيين التدفق بنجاح' : t('flow.reset', 'Flow reset successfully'))
  }, [t, isArabic])

  // ── Create application ───────────────────
  const createApplication = useCallback(async (merged: FlowData): Promise<string | undefined> => {
    if (!token) {
      setShowLogin(true)
      return undefined
    }
    if (!merged.service) return undefined
    setCreating(true)
    try {
      const res = await fetch(`${apiUrl}/visa`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          applicationType: toApplicationType(String(merged.service.id)),
          serviceData: {
            id:           merged.service.id,
            name:         merged.service.name,
            description:  merged.service.description,
            requirements: merged.service.requirements || [],
          },
          sponsor: {
            email:     user?.email || '',
            phone:     user?.phone || '',
            firstName: user?.name?.split(' ')[0] || '',
            lastName:  user?.name?.split(' ').slice(1).join(' ') || '',
          },
          metadata: {
            sponsorType: merged.sponsorType || '',
            location:    merged.location || '',
          },
        }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d?.message || (isArabic ? 'فشل إنشاء الطلب' : 'Failed to create application')); return undefined }

      const appId: string = d?.data?.application?._id
      if (!appId) return undefined

      // Upload staged documents
      if (merged.files) {
        const form = new FormData()
        Object.entries(merged.files).forEach(([docId, files]) =>
          files.forEach(f => form.append(mapDocField(docId), f))
        )
        if ([...form.keys()].length) {
          await fetch(`${apiUrl}/visa/${appId}/documents`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${token}` },
            body:    form,
          })
        }
      }
      return appId
    } catch {
      toast.error(isArabic ? 'خطأ في الشبكة — يرجى المحاولة مرة أخرى' : 'Network error — please try again')
      return undefined
    } finally {
      setCreating(false)
    }
  }, [token, user, isArabic])

  // ── Doc defs from selected service ───────
  const docDefs = (() => {
    const svc = data.service
    if (!svc) return []
    const humanDocs = svc.requiredDocuments || []
    if (humanDocs.length) {
      return humanDocs.map((label: string, i: number) => ({
        id:          `doc_${i}`,
        label,
        required:    true,
        description: '',
        fileTypes:   ['image/*', 'application/pdf'],
        maxSize:     10 * 1024 * 1024,
        category:    'personal' as const,
        priority:    'high' as const,
      }))
    }
    return (svc.requirements || []).map((id: string) => ({
      id,
      label:       id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      required:    true,
      description: '',
      fileTypes:   ['image/*', 'application/pdf'],
      maxSize:     10 * 1024 * 1024,
      category:    'personal' as const,
      priority:    'high' as const,
    }))
  })()

  // ── Derive fee from location ─────────────
  const applicationFee = (() => {
    const svc = data.service
    if (!svc) return 1500
    const loc    = data.location || 'inside'
    const prices = svc.prices || []
    const match  = prices?.find(p => p?.priceType?.toLowerCase() === (loc === 'inside' ? 'inside' : 'outside')) || {priceAmount: 1500, priceType: 'Inside'}
    if (match?.priceAmount) return match.priceAmount
    return prices[0]?.priceAmount || svc.fee || 1500
  })()

  // ── Render step ──────────────────────────
  const renderStep = () => {
    if (creating) {
      return (
        <div className="flex flex-col items-center justify-center gap-5 h-64">
          <div className="w-14 h-14 rounded-full border-4 border-[#BBF451] border-t-transparent animate-spin" />
          <p className="text-[#64748B] text-sm">{isArabic ? 'جاري إنشاء طلبك...' : t('flow.creating')}</p>
        </div>
      )
    }

    switch (step) {
      case 'service':
        return <ServiceStep services={services} loading={loading} onSelect={svc => advance({ service: svc })} />

      case 'sponsorType':
        return (
          <InputStep
            label={isArabic ? 'من سيرعى هذه التأشيرة؟' : t('flow.sponsorLabel', 'Who will sponsor this visa?')}
            fieldKey="sponsorType"
            type="options"
            options={[
              { value: 'employee', label: isArabic ? 'أعمل في شركة' : t('flow.sponsor.employee', 'I work for a company'),      description: isArabic ? 'جهة عملك هي الراعي' : t('flow.sponsor.employeeDesc', 'Your employer is sponsoring you') },
              { value: 'investor', label: isArabic ? 'أمتلك شركة' : t('flow.sponsor.investor', 'I own a business'),          description: isArabic ? 'أنت مستثمر أو مالك' : t('flow.sponsor.investorDesc', 'You are an investor or owner') },
              { value: 'partner',  label: isArabic ? 'أنا شريك في شركة' : t('flow.sponsor.partner',  'I am a business partner'),   description: isArabic ? 'أنت شريك في الشركة' : t('flow.sponsor.partnerDesc',  'You co-own a business') },
            ]}
            onNext={d => advance(d)}
          />
        )

      case 'location':
        return (
          <InputStep
            label={isArabic ? 'من أين تتقدم بالطلب؟' : t('flow.locationLabel', 'Where are you applying from?')}
            fieldKey="location"
            type="options"
            options={[
              { value: 'inside',  label: isArabic ? 'داخل الإمارات' : t('flow.location.inside',  'Inside UAE'),  description: isArabic ? 'أنت بالفعل في الدولة' : t('flow.location.insideDesc',  'Already in the country') },
              { value: 'outside', label: isArabic ? 'خارج الإمارات' : t('flow.location.outside', 'Outside UAE'), description: isArabic ? 'تتقدم من الخارج' : t('flow.location.outsideDesc', 'Applying from abroad') },
            ]}
            onNext={d => advance(d)}
          />
        )

      case 'userInfo':
        return <UserInfoStep onNext={() => advance()} />

      case 'upload':
        return <UploadStep docDefs={docDefs} onNext={files => advance({ files })} />

      case 'review':
        return (
          <ReviewStep
            data={data}
            applicationFee={applicationFee}
            onNext={async () => {
              // Login gate — block submission if not authenticated
              if (!token && !user) {
                setShowLogin(true)
                return
              }
              const appId = await createApplication(data)
              if (appId !== undefined) advance({ applicationId: appId })
            }}
          />
        )

      case 'payment':
        return (
          <PaymentStep
            amount={applicationFee}
            applicationId={data.applicationId}
            service={data.service}
            location={data.location}
            onSuccess={() => {
              // Clear localStorage on successful payment
              localStorage.removeItem(LS_KEY)
              toast.success(isArabic ? 'تم الدفع بنجاح!' : t('payment.success', 'Payment successful!'))
              advance()
            }}
            onError={err => toast.error(`${isArabic ? 'فشل الدفع' : t('payment.failed', 'Payment failed')}: ${err}`)}
          />
        )

      case 'success':
        return (
          <SuccessStep
            serviceName={data.service?.name || (isArabic ? 'خدمة التأشيرة' : 'Visa Service')}
            applicationId={data.applicationId}
            onClose={() => {
              localStorage.removeItem(LS_KEY)
              close()
            }}
          />
        )

      default:
        return null
    }
  }

  // ── Debug: log current step ─────────────
  console.log('📍 Current step:', step, 'index:', stepIndex)

  // ── Shell ────────────────────────────────
  return (
    <div 
      className="flex flex-col transition-colors duration-300"
      style={{ 
        minHeight: '100dvh',
        backgroundColor: theme.background,
        color: theme.text,
      }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >

      {/* ── Top bar ── */}
      <div 
        className="shrink-0 flex items-center gap-3 px-4 pt-4 pb-3 border-b transition-colors"
        style={{ borderColor: theme.border }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={back}
          disabled={isDone}
          aria-label={isArabic ? 'رجوع' : t('flow.back')}
          className="w-9 h-9 rounded-full disabled:opacity-0 disabled:pointer-events-none shrink-0"
          style={{ color: theme.textSecondary }}
        >
          {isArabic ? (
            <ChevronLeft className="w-5 h-5 rotate-180" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </Button>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
              {isArabic ? (
                step === 'service' ? 'اختيار الخدمة' :
                step === 'sponsorType' || step === 'location' || step === 'userInfo' ? 'معلوماتك' :
                step === 'upload' ? 'رفع المستندات' :
                step === 'review' ? 'مراجعة وتقديم' :
                step === 'payment' ? 'الدفع' :
                step === 'success' ? 'اكتمل!' :
                STEP_GROUP[step]
              ) : (
                t(STEP_GROUP[step], STEP_GROUP[step])
              )}
            </span>
            <span className="tabular-nums" style={{ color: theme.textSecondary }}>
              {isArabic ? `${stepIndex + 1} من ${STEPS.length}` : t('flow.step', '{{current}} of {{total}}', { current: stepIndex + 1, total: STEPS.length })}
            </span>
          </div>
          <Progress
            value={progress}
            className="h-1 [&>[data-slot=progress-indicator]]:bg-[#BBF451] [&>[data-slot=progress-indicator]]:transition-all [&>[data-slot=progress-indicator]]:duration-500"
            style={{ backgroundColor: theme.surface }}
          />
        </div>

        {/* 🔄 Refresh & Close buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={resetFlow}
            aria-label={isArabic ? 'إعادة تعيين التدفق' : t('flow.reset', 'Reset flow')}
            className="w-9 h-9 rounded-full shrink-0"
            style={{ color: theme.textSecondary }}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          {!isDone && (
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label={isArabic ? 'إغلاق' : t('flow.close')}
              className="w-9 h-9 rounded-full shrink-0"
              style={{ color: theme.textSecondary }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Step content ── */}
      <ScrollArea className="flex-1" style={{ backgroundColor: theme.background }}>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`min-h-[calc(100dvh-72px)] flex flex-col justify-center px-5 py-8 mx-auto w-full ${
              step === 'upload' || step === 'payment' || step === 'service'
                ? 'max-w-4xl'
                : step === 'review'
                ? 'max-w-2xl'
                : 'max-w-lg'
            }`}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>

      {/* ── AI Chat panel (always mounted, toggled open) ── */}
      <AIChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        service={data.service ?? undefined}
        stepIndex={stepIndex}
      />

      {/* ── Floating help bubble ── */}
      {!isDone && (
        <motion.button
          onClick={() => setChatOpen(v => !v)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, type: 'spring', stiffness: 260, damping: 22 }}
          className="fixed bottom-6 right-4 z-50 flex items-center gap-2 pl-4 pr-5 h-12 rounded-full text-[13px] font-medium shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all text-white dark:text-white"
          style={{ backgroundColor: theme.primary }}
          aria-label={isArabic ? 'هل تحتاج مساعدة؟' : t('flow.chat.helpBtn')}
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          {isArabic ? 'هل تحتاج مساعدة؟' : t('flow.chat.helpBtn', 'Need help?')}
        </motion.button>
      )}

      {/* ── Login gate overlay ── */}
      <AnimatePresence>
        {showLogin && <LoginGate onDismiss={() => setShowLogin(false)} />}
      </AnimatePresence>
    </div>
  )
}