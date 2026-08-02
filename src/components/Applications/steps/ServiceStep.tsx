import { useState, useMemo, useRef, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
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
  BadgeCheck,
  Gem,
  Sparkle,
  Compass,
  Handshake,
  Command,
  Globe,
  Shield,
  Users2,
  CalendarCheck,
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
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { FlowService } from '../ApplicationFlow'
import { ThemeContext } from '@/contexts/ThemeContext'

// Theme hook
const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ServiceStepProps {
  services: FlowService[]
  loading: boolean
  onSelect: (service: FlowService) => void
}

// ─── Premium service meta with modern gradients ──────────────────────────
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
  return {
    sub: 'Full service, expertly handled',
    Icon: FileText,
    gradient: 'from-slate-300 to-gray-400',
    shadow: ''
  }
}

const MOST_CHOSEN_KEYS = ['spouse', 'family', 'golden', 'employ', 'change', 'renew']
const isMostChosen = (name: string) =>
  MOST_CHOSEN_KEYS?.some(k => name?.toLowerCase()?.includes(k))

// ─── Modern categories with unique icons ──────────────────────────────────
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

const stagger = { animate: { transition: { staggerChildren: 0.05 } } }
const cardV = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
}

const getPriceLabel = (svc: FlowService): string | null => {
  const insidePrice = svc.prices?.find(p => p?.priceType?.toLowerCase() === 'inside')
  const anyPrice = insidePrice?.priceAmount ?? svc.prices?.[0]?.priceAmount
  const raw = anyPrice ?? svc.fee
  if (raw === null || raw === undefined) return null
  return Number(raw).toLocaleString()
}

// ─── Golden Guarantee Card ──────────────────────────────────────────────
const GoldenGuaranteeCard = () => {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const isArabic = language === 'ar'

  return (
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.3 }}
  className="mt-6 sm:mt-8 max-w-3xl mx-auto"
>
  <a
    href="/legal#guarantee"
    target="_blank"
    rel="noopener noreferrer"
    className="block"
  >
    <div className="relative rounded-xl sm:rounded-2xl border border-amber-500/30 dark:border-amber-500/20 bg-white/50 dark:bg-black/40 p-3 sm:p-4 md:p-5  transition-all duration-300 group cursor-pointer">
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-4">
        <div className="p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl bg-amber-500/20 border border-amber-500/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
          <Award className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <h4 className="font-normal text-black dark:text-white text-sm sm:text-base md:text-lg flex flex-wrap items-center gap-1.5 sm:gap-2">
            {isArabic ? 'الضمان الذهبي من TMMT' : 'TMMT Golden Guarantee'}
            <Badge className="bg-amber-500 text-white text-[7px] sm:text-[8px] md:text-[10px] px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full font-light">✓ Trusted</Badge>
          </h4>
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-white/60 leading-relaxed mt-0.5 max-w-2xl font-light">
            {isArabic
              ? 'إذا حدث خطأ بسبب TMMT، سنقوم بتصحيحه دون أي رسوم خدمة إضافية وفقاً لسياسة الضمان الخاصة بنا.'
              : 'If an issue is caused by TMMT, we will correct it at no additional service fee according to our guarantee policy.'}
          </p>
          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium group-hover:gap-2 transition-all duration-300">
            <span>{isArabic ? 'اقرأ المزيد عن الضمان' : 'Read more about the guarantee'}</span>
            <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </div>
  </a>
</motion.div>
  )
}

export default function ServiceStep({ services, loading, onSelect }: ServiceStepProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [tapped, setTapped] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 300)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    let list = services
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
  }, [services, query, catFilter])

  const handleSelect = (svc: FlowService) => {
    setTapped(svc.id)
    setTimeout(() => onSelect(svc), 180)
  }

  const isDark = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark')

  // Check if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  return (
    <div className="w-full flex flex-col gap-5 sm:gap-7 transition-colors duration-300 relative">
      {/* Premium Background Glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -right-48 w-80 sm:w-[400px] h-80 sm:h-[400px] rounded-full bg-[var(--primary)]/10 dark:bg-[var(--primary)]/15 blur-[120px]" />
        <div className="absolute -bottom-48 -left-48 w-80 sm:w-[400px] h-80 sm:h-[400px] rounded-full bg-violet-500/8 dark:bg-violet-500/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full bg-[var(--primary)]/5 dark:bg-[var(--primary)]/8 blur-[150px]" />
      </div>

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3 sm:space-y-4 relative"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-7 sm:h-9 w-1 rounded-full bg-gradient-to-b from-[var(--primary)] via-[var(--primary)]/60 to-transparent" />
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
            {t('upload.step', 'Choose your service')}
          </p>
          <Badge className="bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/25 text-[8px] sm:text-[9px] font-semibold rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 backdrop-blur-sm">
            <Sparkles className="w-2.5 sm:w-3 h-2.5 sm:h-3 mr-1" />
            {filtered.length} services
          </Badge>
        </div>
        
        <h1
          className="w-full max-w-4xl font-bold leading-[1.05] tracking-tight break-words whitespace-normal text-[2rem] sm:text-[3.2rem] md:text-[4rem] lg:text-[4.5rem]"
          style={{
            fontFamily: "'Fraunces', serif",
            color: isDark ? '#ffffff' : '#0a0a0a',
            letterSpacing: '-0.02em',
          }}
        >
          {t("service.title", "What do you want to get done today?")}
        </h1>
        
        <p className="text-sm sm:text-base leading-relaxed max-w-[95%] sm:max-w-none font-light" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
          {t('service.subtitle', 'Choose a service — we handle everything for you')}
        </p>
      </motion.div>

      {/* ─── Premium Search Bar ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="relative"
      >
      <div
  className={`
    relative flex items-center gap-2 sm:gap-3 h-12 sm:h-14 rounded-2xl sm:rounded-3xl px-4 sm:px-6
    backdrop-blur-xl border-2 transition-all duration-300
    ${inputFocused
      ? 'border-[var(--primary)]'
      : 'border-slate-200/60 dark:border-slate-700/50 hover:border-slate-300/80 dark:hover:border-slate-600/80'
    }
  `}
  style={{
    backgroundColor: inputFocused
      ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.95)')
      : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)'),
  }}
>
  <Search
    className={`w-4 sm:w-5 h-4 sm:h-5 shrink-0 transition-colors duration-200 ${inputFocused ? 'text-[var(--primary)]' : 'text-slate-400 dark:text-slate-500'}`}
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
        className="shrink-0 text-slate-400 hover:text-[var(--primary)] transition-colors p-1 rounded-full hover:bg-[var(--primary)]/10"
      >
        <XIcon className="w-4 h-4" />
      </motion.button>
    )}
  </AnimatePresence>
  {!query && (
    <div className="shrink-0 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[9px] sm:text-[10px] font-medium border border-[var(--primary)]/20 hidden sm:flex items-center gap-1">
      <Command className="w-3 h-3" />
      K
    </div>
  )}
</div>
      </motion.div>

      {/* ─── Category Chips ──────────────────────────────────────────────── */}
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
      const isMobile = window.innerWidth < 640
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
            className={`
              shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-medium 
              border-2 transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 sm:gap-2
              ${isActive ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'}
            `}
            style={{
              backgroundColor: isActive
                ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)')
                : 'transparent',
              color: isActive
                ? (isDark ? '#ffffff' : 'var(--primary)')
                : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'),
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

{/* Skeleton - Mobile Responsive */}
{loading ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div
        key={i}
        className="h-[160px] sm:h-[180px] rounded-xl sm:rounded-2xl animate-pulse"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
          animationDelay: `${i * 0.06}s`
        }}
      />
    ))}
  </div>
) : filtered.length === 0 ? (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 sm:py-12 text-sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
    <Search className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" strokeWidth={1.2} />
    {t('service.noResults', 'No services found. Try a different search.')}
  </motion.div>
) : (
  <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
    {filtered.map((svc) => {
      const { sub, Icon, gradient } = getMeta(svc?.name)
      const active = tapped === String(svc?.id)
      const chosen = isMostChosen(svc?.name)
      const priceLabel = getPriceLabel(svc)

      return (
        <motion.button
          key={svc?.id}
          variants={cardV}
          whileHover={!isMobile ? { y: -4 } : {}}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect(svc)}
          disabled={tapped !== null}
          className={`
            group relative w-full text-left rounded-xl sm:rounded-2xl cursor-pointer
            border-2 transition-all duration-300 overflow-hidden
            ${active ? 'border-[var(--primary)]' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'}
          `}
          style={{
            backgroundColor: active
              ? (isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.03)')
              : (isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'),
          }}
        >
          {/* Top accent bar */}
          <div className={`h-0.5 w-full transition-all duration-300 ${active ? 'bg-[var(--primary)]' : 'bg-transparent group-hover:bg-[var(--primary)]/20'}`} />

          <div className="p-3.5 sm:p-5">
            {/* Header with Icon and Badge */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className={`
                  relative shrink-0 w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center
                  transition-all duration-300
                  ${active
                    ? 'bg-[var(--primary)] text-white'
                    : `bg-gradient-to-br ${gradient} text-white ${!isMobile ? 'group-hover:scale-105' : ''}`
                  }
                `}
              >
                <Icon className="w-5 sm:w-6 h-5 sm:h-6" strokeWidth={1.8} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1 sm:gap-2">
                  <span className="text-sm sm:text-lg font-bold leading-snug" style={{ color: isDark ? '#ffffff' : '#000000' }}>
                    {svc.name}
                  </span>
                  {chosen && (
                    <Badge className="bg-[var(--primary)] text-white border-0 gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-bold rounded-full">
                      <TrendingUp className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm mt-0.5 line-clamp-1" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  {sub}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
              {svc.processingTime && (
                <span className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs font-medium text-[var(--primary)] border border-[var(--primary)]/20 rounded-full px-2.5 sm:px-3.5 py-0.5 sm:py-1">
                  <Timer className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  {svc.processingTime}
                </span>
              )}
              {(svc.requiredDocuments?.length ?? 0) > 0 && (
                <span className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs font-medium rounded-full px-2.5 sm:px-3.5 py-0.5 sm:py-1 border border-slate-200 dark:border-slate-700" style={{
                  color: isDark ? '#94a3b8' : '#64748b',
                }}>
                  <FileText className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  {svc.requiredDocuments!.length} docs
                </span>
              )}
              <span className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs font-semibold rounded-full px-2.5 sm:px-3.5 py-0.5 sm:py-1 border border-amber-300/50 dark:border-amber-700/50" style={{
                color: isDark ? '#fbbf24' : '#d97706',
              }}>
                <Star className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-current" />
                4.9
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200/40 dark:border-slate-700/40">
              <div>
                <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  From
                </span>
                {priceLabel ? (
                  <div className="flex items-baseline gap-0.5 sm:gap-1">
                    <span className="text-base sm:text-xl font-extrabold" style={{ color: isDark ? '#ffffff' : '#0a0a0a' }}>
                      AED {priceLabel}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs sm:text-sm font-medium italic text-slate-400 dark:text-slate-500">
                    Price on request
                  </span>
                )}
              </div>

              <span
                className={`
                  flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm
                  transition-all duration-300 border-2
                  ${active
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : isDark
                      ? 'bg-white text-black border-white/20 hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-white/90'
                      : 'bg-white text-black border-slate-200 hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-slate-50'
                  }
                `}
              >
                <span>{active ? 'Selected' : 'Select'}</span>
                <ArrowRight className={`w-3.5 sm:w-4 h-3.5 sm:h-4 transition-transform duration-300 ${active ? '' : 'group-hover:translate-x-1'}`} />
              </span>
            </div>
          </div>

          {/* Selection Indicator */}
          {active && (
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
              <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center">
                <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4" strokeWidth={2.5} />
              </div>
            </div>
          )}
        </motion.button>
      )
    })}
  </motion.div>
)}

{/* ✅ Golden Guarantee Card - Bottom */}
<GoldenGuaranteeCard />

{/* Trust Footer */}
<AnimatePresence>
  {!loading && filtered.length > 0 && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[10px] sm:text-xs pb-1 pt-3 sm:pt-4 border-t border-slate-200/40 dark:border-slate-700/40"
      style={{ color: isDark ? '#94a3b8' : '#64748b' }}
    >
      <span className="flex items-center gap-2">
        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[var(--primary)]" />
        10,000+ applications
      </span>
      <span className="h-4 w-px bg-slate-200/60 dark:bg-slate-700/60" />
      <span className="flex items-center gap-2">
        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-500" />
        97% approval rate
      </span>
      <span className="h-4 w-px bg-slate-200/60 dark:bg-slate-700/60" />
      <span className="flex items-center gap-2 text-amber-500">
        <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
        4-hour fast-track
      </span>
      <span className="h-4 w-px bg-slate-200/60 dark:bg-slate-700/60" />
      <span className="flex items-center gap-2 text-emerald-500">
        <Shield className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
        Licensed
      </span>
    </motion.div>
  )}
</AnimatePresence>

</div>
  )
}