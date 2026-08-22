import { useState, useMemo, useRef, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Search,
  X as XIcon,
  Users,
  Briefcase,
  Baby,
  RefreshCw,
  Building2,
  FileText,
  Star,
  Briefcase as BriefcaseIcon,
  Crown,
  RefreshCw as RefreshIcon,
  XCircle as XCircleIcon,
  Building,
  Rocket,
  Timer,
  Command,
  Globe,
  Shield,
  Users2,
  CalendarCheck,
  Handshake,
  FileCheck,
  Stamp,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Zap,
  Award,
  Heart,
  Sparkles,
  LayoutGrid,
  FileSearch,
  WifiOff,
  AlertTriangle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { FlowService } from '../ApplicationFlow'
import { ThemeContext } from '@/contexts/ThemeContext'

// ─── Safe Theme hook (never throws) ──────────────────────────────────────
const useSafeTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    return {
      background: '#ffffff',
      text: '#0a0a0a',
      primary: '#14235E',
      border: '#e2e8f0',
      surface: '#f8fafc',
      textSecondary: '#64748b',
      buttonText: '#ffffff',
      isDark: false,
    }
  }
  return context
}

interface ServiceStepProps {
  services: FlowService[]
  loading: boolean
  onSelect: (service: FlowService) => void
  onRetry?: () => void
}

// ─── Mock Data (fallback) ────────────────────────────────────────────────
const MOCK_SERVICES: FlowService[] = [
  {
    id: '1',
    name: 'Spouse Residence Visa',
    description: 'Apply for UAE residence visa',
    category: 'family',
    processingTime: '3-5 days',
    requiredDocuments: ['Passport Copy', 'Photo', 'Medical Report'],
    fee: 1089,
    prices: [{ priceType: 'inside', priceAmount: 1089 }],
  },
  {
    id: '2',
    name: 'Golden Visa',
    description: '10-year residency for investors & talent',
    category: 'golden',
    processingTime: '5-7 days',
    requiredDocuments: ['Passport', 'Photo', 'Bank Statement', 'Investment Proof'],
    fee: 5000,
    prices: [{ priceType: 'inside', priceAmount: 2710 }],
  },
  {
    id: '3',
    name: 'Employment Visa',
    description: 'Work visa for employees',
    category: 'employ',
    processingTime: '2-4 days',
    requiredDocuments: ['Passport', 'Photo', 'Job Offer', 'Contract'],
    fee: 1200,
    prices: [{ priceType: 'inside', priceAmount: 548 }],
  },
  {
    id: '4',
    name: 'Family Sponsorship',
    description: 'Sponsor your spouse, children, or parents',
    category: 'family',
    processingTime: '4-6 days',
    requiredDocuments: ['Passport', 'Photo', 'Marriage Certificate', 'Birth Certificates'],
    fee: 2000,
    prices: [{ priceType: 'inside', priceAmount: 189 }],
  },
  {
    id: '5',
    name: 'Visa Renewal',
    description: 'Renew your existing residence visa',
    category: 'renew',
    processingTime: '2-3 days',
    requiredDocuments: ['Passport', 'Photo', 'Old Visa Copy'],
    fee: 800,
    prices: [{ priceType: 'inside', priceAmount: 576 }],
  },
  {
    id: '6',
    name: 'Visa Cancellation',
    description: 'Cancel your current visa properly',
    category: 'cancel',
    processingTime: '1-2 days',
    requiredDocuments: ['Passport', 'Old Visa', 'Labour Card'],
    fee: 600,
    prices: [{ priceType: 'inside', priceAmount: 639 }],
  },
  {
    id: '7',
    name: 'Change Status Employee',
    description: 'Change your visa status without leaving the UAE',
    category: 'change',
    processingTime: '2-3 days',
    requiredDocuments: ['Passport', 'Photo', 'Current Visa'],
    fee: 900,
    prices: [{ priceType: 'inside', priceAmount: 676 }],
  },
  {
    id: '8',
    name: 'Travel Visa',
    description: 'Tourist or visit visa for the UAE',
    category: 'travel',
    processingTime: '1-2 days',
    requiredDocuments: ['Passport', 'Photo', 'Flight Booking'],
    fee: 500,
    prices: [{ priceType: 'inside', priceAmount: 275 }],
  },
  {
    id: '9',
    name: 'Establishment Card',
    description: 'Manage company immigration cards',
    category: 'establish',
    processingTime: '3-5 days',
    requiredDocuments: ['Trade License', 'Passport', 'Photo'],
    fee: 1000,
    prices: [{ priceType: 'inside', priceAmount: 2736 }],
  },
  {
    id: '10',
    name: 'Investor Visa',
    description: 'Visa for investors in the UAE',
    category: 'investor',
    processingTime: '5-7 days',
    requiredDocuments: ['Passport', 'Photo', 'Investment Certificate'],
    fee: 3000,
    prices: [{ priceType: 'inside', priceAmount: 5479 }],
  },
  {
    id: '11',
    name: 'Partner Visa',
    description: 'Visa for business partners',
    category: 'partner',
    processingTime: '3-5 days',
    requiredDocuments: ['Passport', 'Photo', 'Partnership Agreement'],
    fee: 2500,
    prices: [{ priceType: 'inside', priceAmount: 1126 }],
  },
  {
    id: '12',
    name: 'Parent Visa',
    description: 'Sponsor your parents',
    category: 'parent',
    processingTime: '5-7 days',
    requiredDocuments: ['Passport', 'Photo', 'Birth Certificate', 'Sponsor Letter'],
    fee: 1800,
    prices: [{ priceType: 'inside', priceAmount: 510 }],
  },
]

// ─── Service meta ──────────────────────────────────────────────────────────
const SERVICE_META: [string, string, typeof Users, string, string][] = [
  ['parent', 'Simple process, no paperwork stress', Users, 'from-emerald-400 to-teal-500', ''],
  ['investor', 'Get your residency with ease', Rocket, 'from-violet-400 to-purple-500', ''],
  ['partner', 'Partner visa, done correctly', Handshake, 'from-blue-400 to-indigo-500', ''],
  ['employ', 'Fast, compliant, zero hassle', Briefcase, 'from-amber-400 to-orange-500', ''],
  ['golden', 'Long-term residency for top talent', Crown, 'from-amber-400 to-yellow-500', ''],
  ['child', 'Family residency, all steps covered', Baby, 'from-pink-400 to-rose-500', ''],
  ['family', 'One process for the whole family', Users2, 'from-indigo-400 to-purple-500', ''],
  ['renew', 'No expiry stress, we handle everything', CalendarCheck, 'from-cyan-400 to-blue-500', ''],
  ['cancel', 'Properly handled, no complications', FileCheck, 'from-red-400 to-rose-500', ''],
  ['change', 'Smooth transition, no delays', RefreshCw, 'from-blue-400 to-cyan-500', ''],
  ['travel', 'Issued fast, approved correctly', Globe, 'from-emerald-400 to-cyan-500', ''],
  ['establish', 'Company immigration card sorted', Building2, 'from-slate-500 to-gray-600', ''],
  ['security', 'Handled securely and correctly', Shield, 'from-emerald-400 to-teal-500', ''],
  ['stamp', 'Final step handled for you', Stamp, 'from-amber-400 to-orange-500', ''],
]

const getMeta = (name: string): { sub: string; Icon: typeof Users; gradient: string; shadow: string } => {
  const n = name?.toLowerCase()
  for (const [key, sub, Icon, gradient, shadow] of SERVICE_META) {
    if (n?.includes(key)) return { sub, Icon, gradient, shadow }
  }
  return { sub: 'Full service, expertly handled', Icon: FileText, gradient: 'from-slate-300 to-gray-400', shadow: '' }
}

const MOST_CHOSEN_KEYS = ['spouse', 'family', 'golden', 'employ', 'change', 'renew']
const isMostChosen = (name: string) =>
  MOST_CHOSEN_KEYS?.some(k => name?.toLowerCase()?.includes(k))

// ─── Categories ────────────────────────────────────────────────────────────
const ALL_CATEGORIES = [
  { key: '', label: 'All', icon: LayoutGrid },
  { key: 'family', label: 'Family', icon: Heart },
  { key: 'employ', label: 'Employment', icon: BriefcaseIcon },
  { key: 'golden', label: 'Golden Visa', icon: Crown },
  { key: 'renew', label: 'Renewal', icon: RefreshIcon },
  { key: 'cancel', label: 'Cancellation', icon: XCircleIcon },
  { key: 'establish', label: 'Business', icon: Building },
]

const MOBILE_CATEGORIES = [
  { key: '', label: 'All', icon: LayoutGrid },
  { key: 'golden', label: 'Golden Visa', icon: Crown },
  { key: 'family', label: 'Family', icon: Heart },
  { key: 'renew', label: 'Renewal', icon: RefreshIcon },
]

const getPriceLabel = (svc: FlowService): string | null => {
  const insidePrice = svc.prices?.find(p => p?.priceType?.toLowerCase() === 'inside')
  const anyPrice = insidePrice?.priceAmount ?? svc.prices?.[0]?.priceAmount
  const raw = anyPrice ?? svc.fee
  if (raw === null || raw === undefined) return null
  return Number(raw).toLocaleString()
}

// ─── Image URLs ────────────────────────────────────────────────────────────
const SERVICE_IMAGE_URLS: Record<string, string> = {
  parent: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4CD1MRHv--VAlYSoiuxE0v0yPzGZa3jm1qsUCNAmeUg&s=10',
  investor: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTqtJC1t71dwVKLlrHjYorc_kjxOS74tDAWzeTY0aEPQ&s=10',
  partner: 'https://images.unsplash.com/photo-1655722724447-2d2a3071e7f8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHZpc2F8ZW58MHx8MHx8fDA%3D',
  employ: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkBsST78TJ_zl4Z3bm9S56ki-reF1u0So0PbC59sZ9zQ&s=10',
  golden: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwPDoE3q62P7DjWQw4UB0uWwnj2eElwJ2Tw77QWIpUpA&s=10',
  child: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP8j8CG-920tn5JFruorsoRQsh_UMwqsIG44P7oeArQA&s=10',
  family: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzRO-w2_dwN5yfbxkCkLiBr2U0vjpiF9sgAX104_2iiQ&s=10',
  renew: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMjtASkWFoGkjtJysd18tHGS3X-NJC7QydKg82dqCbVw&s=10',
  cancel: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHof57a83HwDNqsRAT1NziNHcNAfpPp2JYf2-HX3pbRg&s=10',
  change: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHof57a83HwDNqsRAT1NziNHcNAfpPp2JYf2-HX3pbRg&s=10',
  travel: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoCQg3sX5E3WlQT3pN5AxhaXlmpztstPOfjFdxQH11YQ&s=10',
  establish: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGSP_OKgf_ZMFLS23JR6hekWaPQavW6U8J-BqTw2tA1Q&s=10',
  security: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXnCPgrora5h_PqnCXZ6aJd95Bp0rPyoA11eWE-iUPGA&s=10',
  stamp: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1EGGMYD-j0wOFQxFXIU92lKwxku8LtilFHGjz9fv9kw&s=10',
  default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT83TWsRxDTqVNsx0MnP4MB_OcfjizrBHI2lHB_DvRKuA&s=10',
}

const getImageUrl = (name: string): string => {
  const n = name?.toLowerCase()
  for (const key of Object.keys(SERVICE_IMAGE_URLS)) {
    if (n?.includes(key)) return SERVICE_IMAGE_URLS[key]
  }
  return SERVICE_IMAGE_URLS.default
}


// ─── Section: Golden Guarantee ──────────────────────────────────────────────
const GoldenGuaranteeCard = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const isArabic = language === 'ar';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-6 sm:mt-8 max-w-3xl mx-auto"
    >
      <div className="relative rounded-xl border border-amber-500/30 bg-white/50 dark:bg-black/70 backdrop-blur-sm p-3 sm:p-4 transition-all duration-300 group hover:shadow-sm hover:shadow-amber-500/5">
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/15 border border-amber-500/15 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Award className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" strokeWidth={1.5} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-light text-black dark:text-white text-sm sm:text-base flex flex-wrap items-center gap-1.5 sm:gap-2">
              {isArabic ? 'الضمان الذهبي من TMMT' : 'TMMT Golden Guarantee'}
              <span className="border-amber-500/40 text-amber-400 text-[7px] sm:text-[8px] px-1.5 sm:px-2">
                ✓ Trusted
              </span>
            </h4>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-white/50 leading-relaxed mt-0.5 max-w-2xl font-light">
              {isArabic 
                ? 'إذا حدث خطأ بسبب TMMT، سنقوم بتصحيحه دون أي رسوم خدمة إضافية وفقاً لسياسة الضمان الخاصة بنا.'
                : 'If an issue is caused by TMMT, we will correct it at no additional service fee according to our guarantee policy.'}
            </p>
            <a
              href="/legal#guarantee"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-amber-400 hover:text-amber-700 font-light transition-all duration-300 group/link hover:gap-1.5"
            >
              {isArabic ? 'اقرأ المزيد' : 'Read more'}
              <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover/link:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


export default function ServiceStep({ services, loading, onSelect, onRetry }: ServiceStepProps) {
  const { t } = useTranslation()
  const { theme } = useSafeTheme()
  const [tapped, setTapped] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 300)
    return () => clearTimeout(t)
  }, [])

  const effectiveServices = useMemo(() => {
    if (services && services.length > 0 && services.some(s => s && s.name)) {
      return services
    }
    return MOCK_SERVICES
  }, [services])

  const filtered = useMemo(() => {
    let list = effectiveServices || []
    if (catFilter) {
      list = list?.filter(s => s?.name?.toLowerCase()?.includes(catFilter))
    }
    if (query?.trim()) {
      const q = query.toLowerCase()
      list = list.filter(s =>
        s?.name?.toLowerCase()?.includes(q) ||
        s?.description?.toLowerCase()?.includes(q) ||
        s?.category?.toLowerCase()?.includes(q)
      )
    }
    return list
  }, [effectiveServices, query, catFilter])

  const handleSelect = (svc: FlowService) => {
    setTapped(svc.id)
    setTimeout(() => onSelect(svc), 180)
  }

  const isDark = theme.isDark ?? (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))

  // Use #14235E for both light and dark mode
  const accent = '#14235E'

  const hasNoServices = !loading && (!effectiveServices || effectiveServices.length === 0)

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: -6, transition: { duration: 0.3 } },
  }

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  }

  return (
    <div className="w-full flex flex-col gap-5 sm:gap-7 transition-colors duration-300 relative">
      {/* ─── Background ──────────────────────────────────────────────────── */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-48 -right-48 w-80 sm:w-[480px] h-80 sm:h-[480px] rounded-full blur-[130px]"
          style={{ backgroundColor: accent, opacity: isDark ? 0.08 : 0.06 }}
        />
      </div>

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3 sm:space-y-4 relative"
      >
        <div className="flex items-center gap-2.5">
          <span
            className="text-[11px] font-semibold tracking-[0.2em] uppercase"
            style={{ color: accent }}
          >
            {t('upload.step', 'Choose your service')}
          </span>
          {!hasNoServices && !loading && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2.5 py-1 text-white"
              style={{ backgroundColor: accent }}
            >
              <Sparkles className="w-2.5 h-2.5" />
              {filtered.length}
            </span>
          )}
        </div>
        <h1
          className="w-full max-w-4xl font-bold leading-[1.05] tracking-tight break-words whitespace-normal text-[2rem] sm:text-[3.2rem] md:text-[4rem] lg:text-[4.5rem]"
          style={{
            fontFamily: "'Fraunces', serif",
            color: isDark ? '#ffffff' : '#0a0a0a',
            letterSpacing: '-0.02em',
          }}
        >
          {hasNoServices
            ? t('service.noDataTitle', 'We\'re having trouble loading services')
            : t('service.title', 'What do you want to get done today?')}
        </h1>
        <p className="text-sm sm:text-base leading-relaxed max-w-[95%] sm:max-w-none" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
          {hasNoServices
            ? t('service.noDataSubtitle', 'Please check your connection or try again later.')
            : t('service.subtitle', 'Choose a service — we handle everything for you')}
        </p>
      </motion.div>

      {/* ─── Search Bar ──────────────────────────────────────────────────── */}
      {!hasNoServices && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="relative"
        >
          <div
            className="relative flex items-center gap-2 sm:gap-3 h-12 sm:h-14 rounded-2xl px-4 sm:px-5 border transition-all duration-300"
            style={{
              borderColor: inputFocused ? accent : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
            }}
          >
            <Search
              className="w-4 sm:w-5 h-4 sm:h-5 shrink-0 transition-colors duration-200"
              style={{ color: inputFocused ? accent : (isDark ? '#64748b' : '#94a3b8') }}
            />
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder={t('service.search', 'Search services...')}
              className="flex-1 min-w-0 bg-transparent border-0 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 text-sm sm:text-base"
              style={{
                fontSize: '16px',
                outline: 'none',
                boxShadow: 'none',
                color: isDark ? '#ffffff' : '#0a0a0a',
                backgroundColor: 'transparent',
              }}
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setQuery('')}
                  className="shrink-0 text-slate-400 p-1 rounded-full transition-colors"
                  style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                >
                  <XIcon className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
            {!query && (
              <div
                className="shrink-0 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-medium hidden sm:flex items-center gap-1"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: isDark ? '#94a3b8' : '#64748b' }}
              >
                <Command className="w-3 h-3" /> K
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ─── Category Chips ──────────────────────────────────────────────── */}
      {!hasNoServices && (
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide -mx-3 sm:-mx-4 px-1 sm:px-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="flex gap-2 sm:gap-2.5" style={{ minWidth: 'max-content' }}
          >
            {(() => {
              const categories = isMobile ? MOBILE_CATEGORIES : ALL_CATEGORIES
              return categories.map(cat => {
                const Icon = cat.icon
                const isActive = catFilter === cat.key
                return (
                  <motion.button
                    key={cat.key}
                    onClick={() => setCatFilter(cat.key)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    className="shrink-0 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 sm:gap-2"
                    style={{
                      backgroundColor: isActive ? accent : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                      color: isActive ? '#ffffff' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)'),
                    }}
                  >
                    <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    <span>{t(`service.cat.${cat.key || 'all'}`, cat.label)}</span>
                    {isActive && <CheckCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5" />}
                  </motion.button>
                )
              })
            })()}
          </motion.div>
        </div>
      )}

      {/* ─── Content Area ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="h-[200px] sm:h-[240px] rounded-2xl animate-pulse"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                animationDelay: `${i * 0.06}s`
              }}
            />
          ))}
        </div>
      ) : hasNoServices ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center py-12 sm:py-16"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-5 border border-amber-200/50 dark:border-amber-800/30">
            <WifiOff className="w-10 h-10 text-amber-500 dark:text-amber-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-black dark:text-white mb-2">
            {t('service.noDataTitle', 'No services available at the moment')}
          </h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {t('service.noDataDesc', 'We\'re having trouble connecting to our service catalog. Please check your internet connection or try again later.')}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              <RefreshCw className="w-4 h-4" />
              {t('service.retry', 'Retry')}
            </button>
            <button
              onClick={() => window.open('mailto:support@tammat.ae?subject=Service%20Catalog%20Issue')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              {t('service.contactSupport', 'Contact Support')}
            </button>
          </div>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 sm:py-16"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-400 dark:text-slate-600" strokeWidth={1.2} />
          </div>
          <h3 className="text-lg font-semibold text-black dark:text-white mb-1">
            {t('service.noResults', 'No results found')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('service.tryAdjusting', 'Try adjusting your search or filter.')}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {filtered.map((svc, index) => {
            const { sub, Icon } = getMeta(svc?.name || '')
            const active = tapped === String(svc?.id)
            const priceLabel = getPriceLabel(svc)
            const imageUrl = getImageUrl(svc?.name || '')

            return (
              <motion.button
                key={svc?.id || index}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(svc)}
                disabled={tapped !== null}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-zinc-950 border transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 text-left w-full"
                style={{
                  borderColor: active ? accent : (isDark ? '#27272a' : 'rgba(0,0,0,0.06)'),
                  boxShadow: isDark
                    ? '0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 48px -28px rgba(0,0,0,0.7)'
                    : '0 1px 0 rgba(0,0,0,0.02) inset, 0 24px 48px -28px rgba(10,50,105,0.25)',
                }}
              >
                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900">
                  <img
                    src={imageUrl}
                    alt={svc.name || 'Service'}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        variants={iconVariants}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg"
                        style={{ backgroundColor: accent }}
                      >
                        <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                      </motion.div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">
                          {svc.category || 'Service'}
                        </span>
                        <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                          <Shield className="h-3 w-3 text-emerald-400" />
                          Verified Service
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="relative flex flex-col flex-1 p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground dark:text-white leading-snug mb-2 transition-colors duration-300">
                    {svc.name || 'Service'}
                  </h3>

                  <p className="text-sm text-muted-foreground dark:text-zinc-400 mb-4 line-clamp-2 flex-1 leading-relaxed">
                    {sub}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {svc.processingTime && (
                      <span
                        className="flex items-center gap-1.5 text-[10px] font-medium rounded-full px-2.5 py-1"
                        style={{ color: accent, backgroundColor: isDark ? 'rgba(10,50,105,0.2)' : 'rgba(10,50,105,0.08)' }}
                      >
                        <Timer className="h-3 w-3" />
                        {svc.processingTime}
                      </span>
                    )}
                    {(svc.requiredDocuments?.length ?? 0) > 0 && (
                      <span className="flex items-center gap-1.5 text-[10px] font-medium rounded-full px-2.5 py-1 bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400">
                        <FileSearch className="h-3 w-3" />
                        {svc.requiredDocuments!.length} docs
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-[10px] font-medium rounded-full px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                      <Star className="h-3 w-3 fill-current" />
                      4.9
                    </span>
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between pt-4 border-t"
                    style={{ borderColor: isDark ? '#27272a' : 'rgba(0,0,0,0.06)' }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground/60 dark:text-zinc-500">
                        Starting from
                      </span>
                      {priceLabel ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-muted-foreground/60 dark:text-zinc-500">AED</span>
                          <p className="text-2xl font-extrabold tracking-tight tabular-nums text-foreground dark:text-white">
                            {priceLabel}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm font-medium italic text-slate-400 dark:text-zinc-500">
                          Price on request
                        </span>
                      )}
                    </div>

                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm text-white transition-transform duration-300"
                      style={{ backgroundColor: accent }}
                    >
                      <span>{active ? 'Selected' : 'Get Start'}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.75} />
                    </motion.div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {active && (
                  <div className="absolute top-4 left-4 z-20">
                    <div
                      className="w-6 h-6 rounded-full text-white flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: accent }}
                    >
                      <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Golden Guarantee Card */}
      <GoldenGuaranteeCard />

      {/* Trust Footer */}
      {!hasNoServices && !loading && filtered.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[10px] sm:text-xs pb-1 pt-3 sm:pt-4 border-t border-slate-200/40 dark:border-zinc-700/40"
            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
          >
            <span className="flex items-center gap-2">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full" style={{ backgroundColor: accent }} />
              10,000+ applications
            </span>
            <span className="h-4 w-px bg-slate-200/60 dark:bg-zinc-700/60" />
            <span className="flex items-center gap-2">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-500" />
              97% approval rate
            </span>
            <span className="h-4 w-px bg-slate-200/60 dark:bg-zinc-700/60" />
            <span className="flex items-center gap-2 text-amber-500">
              <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              4-hour fast-track
            </span>
            <span className="h-4 w-px bg-slate-200/60 dark:bg-zinc-700/60" />
            <span className="flex items-center gap-2 text-emerald-500">
              <Shield className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              Licensed
            </span>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}