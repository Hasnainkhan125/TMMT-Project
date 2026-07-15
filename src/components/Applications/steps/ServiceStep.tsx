import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  ArrowRight,
  Check,
  TrendingUp,
  Search,
  X as XIcon,
  Users,
  Heart,
  Briefcase,
  Award,
  Baby,
  RefreshCw,
  XCircle,
  Building2,
  Plane,
  IdCard,
  FileEdit,
  ShieldCheck,
  Stamp,
  FileText,
  Star,
  Sparkles,
  Grid,
  Home,
  Briefcase as BriefcaseIcon,
  Crown,
  RefreshCw as RefreshIcon,
  XCircle as XCircleIcon,
  Building,
  Zap,
  Rocket,
  Timer,
  BadgeCheck,
  Gem,
  Sparkle,
  Compass,
  UserCheck,
  Handshake,
  Globe,
  Shield,
  CheckCircle2,
  ThumbsUp,
  Users2,
  UserRound,
  GraduationCap,
  HeartHandshake,
  CalendarCheck,
  FileCheck,
  Eye,
  Plus,
  ArrowUpRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { FlowService } from '../ApplicationFlow'

interface ServiceStepProps {
  services: FlowService[]
  loading:  boolean
  onSelect: (service: FlowService) => void
}

// ─── Premium service meta with gradients ────────────────────────────────────
const SERVICE_META: [string, string, typeof Users, string, string][] = [
  ['spouse',    'Fast-track approval, handled for you', Heart, 'from-rose-500 to-pink-500', 'shadow-rose-500/30'],
  ['parent',    'Simple process, no paperwork stress',  Users, 'from-emerald-500 to-teal-500', 'shadow-emerald-500/30'],
  ['investor',  'Get your residency with ease',         Rocket, 'from-violet-500 to-purple-500', 'shadow-violet-500/30'],
  ['partner',   'Partner visa, done correctly',          Handshake, 'from-blue-500 to-indigo-500', 'shadow-blue-500/30'],
  ['employ',    'Fast, compliant, zero hassle',          Briefcase, 'from-amber-500 to-orange-500', 'shadow-amber-500/30'],
  ['golden',    'Long-term residency for top talent',    Crown, 'from-yellow-500 to-amber-500', 'shadow-yellow-500/30'],
  ['child',     'Family residency, all steps covered',   Baby, 'from-pink-500 to-rose-500', 'shadow-pink-500/30'],
  ['family',    'One process for the whole family',      Users2, 'from-indigo-500 to-purple-500', 'shadow-indigo-500/30'],
  ['renew',     'No expiry stress, we handle everything', CalendarCheck, 'from-cyan-500 to-blue-500', 'shadow-cyan-500/30'],
  ['cancel',    'Properly handled, no complications',     FileCheck, 'from-red-500 to-rose-500', 'shadow-red-500/30'],
  ['change',    'Smooth transition, no delays',           RefreshCw, 'from-blue-500 to-cyan-500', 'shadow-blue-500/30'],
  ['travel',    'Issued fast, approved correctly',        Globe, 'from-emerald-500 to-cyan-500', 'shadow-emerald-500/30'],
  ['establish', 'Company immigration card sorted',        Building2, 'from-slate-700 to-gray-700', 'shadow-slate-700/30'],
  ['security',  'Handled securely and correctly',         Shield, 'from-emerald-500 to-teal-500', 'shadow-emerald-500/30'],
  ['stamp',     'Final step handled for you',             Stamp, 'from-amber-500 to-orange-500', 'shadow-amber-500/30'],
]

const getMeta = (name: string): { sub: string; Icon: typeof Users; gradient: string; shadow: string } => {
  const n = name?.toLowerCase()
  for (const [key, sub, Icon, gradient, shadow] of SERVICE_META) {
    if (n?.includes(key)) return { sub, Icon, gradient, shadow }
  }
  return { 
    sub: 'Full service, expertly handled', 
    Icon: FileText, 
    gradient: 'from-slate-400 to-gray-400',
    shadow: 'shadow-slate-400/30'
  }
}

const MOST_CHOSEN_KEYS = ['spouse', 'family', 'golden', 'employ', 'change', 'renew']
const isMostChosen = (name: string) =>
  MOST_CHOSEN_KEYS?.some(k => name?.toLowerCase()?.includes(k))

// ─── Premium categories ──────────────────────────────────────────────────────
const ALL_CATEGORIES = [
  { key: '',          label: 'All', icon: Compass },
  { key: 'family',    label: 'Family', icon: Users2 },
  { key: 'employ',    label: 'Employment', icon: BriefcaseIcon },
  { key: 'golden',    label: 'Golden Visa', icon: Crown },
  { key: 'renew',     label: 'Renewal', icon: RefreshIcon },
  { key: 'cancel',    label: 'Cancellation', icon: XCircleIcon },
  { key: 'establish', label: 'Business', icon: Building },
]

const MOBILE_CATEGORIES = [
  { key: '',          label: 'All', icon: Compass },
  { key: 'golden',    label: 'Golden Visa', icon: Crown },
  { key: 'family',    label: 'Family', icon: Users2 },
  { key: 'renew',     label: 'Renewal', icon: RefreshIcon },
]

const stagger = { animate: { transition: { staggerChildren: 0.04 } } }
const cardV = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const getPriceLabel = (svc: FlowService): string | null => {
  const insidePrice = svc.prices?.find(p => p?.priceType?.toLowerCase() === 'inside')
  const anyPrice = insidePrice?.priceAmount ?? svc.prices?.[0]?.priceAmount
  const raw = anyPrice ?? svc.fee
  if (raw === null || raw === undefined) return null
  return Number(raw).toLocaleString()
}

export default function ServiceStep({ services, loading, onSelect }: ServiceStepProps) {
  const { t } = useTranslation()
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

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header - Premium */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2 sm:space-y-3 mt-1 sm:mt-2 mb-1 sm:mb-2"
      >
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-gradient-to-b from-[var(--primary)] to-[var(--primary)]/30" />
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--primary)] dark:text-[var(--primary)]">
            {t('upload.step', 'Choose your service')}
          </p>
          <Badge className="bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 text-[9px] font-bold uppercase tracking-wider">
            <Gem className="w-2.5 h-2.5 mr-1" />
            Premium
          </Badge>
        </div>
        <h1
          className="
            w-full max-w-4xl
            font-bold leading-[1.15] tracking-tight
            break-words whitespace-normal
            text-slate-900 dark:text-white
            text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-[3.8rem] xl:text-[4.4rem]
          "
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {t("service.title", "What do you want to get done today?")}
     
        </h1>
        <p className="text-[#64748B] dark:text-zinc-400 text-[13px] sm:text-[14px] leading-relaxed max-w-[95%] sm:max-w-none">
          {t('service.subtitle', 'Choose a service — we handle everything for you')}
        </p>
      </motion.div>

      {/* Search - Premium Glass */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.08 }}
        className="relative"
      >
        <div
          className={`
            relative flex items-center gap-3 h-12 rounded-2xl px-4 sm:px-5
            bg-white/90 dark:bg-white/[0.06]
            backdrop-blur-2xl
            border border-slate-200/60 dark:border-white/10
            transition-all duration-300
            ${inputFocused 
              ? 'bg-white dark:bg-white/[0.09] shadow-[0_8px_30px_-8px_rgba(10,50,105,0.15)] dark:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.3)] border-[var(--primary)]/40 dark:border-[var(--primary)]/30' 
              : 'hover:border-slate-300 dark:hover:border-white/20'
            }
          `}
        >
          <Search
            className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
              inputFocused ? 'text-[var(--primary)]' : 'text-[#94A3B8] dark:text-zinc-500'
            }`}
          />
          <input
            ref={searchRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder={t('service.search', 'Search services...')}
            style={{ fontSize: '16px', outline: 'none', boxShadow: 'none' }}
            className="
              flex-1 min-w-0 bg-transparent border-0
              text-slate-900 dark:text-white
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              [appearance:none] focus:outline-none focus:ring-0 focus:shadow-none
              focus-visible:outline-none focus-visible:ring-0
            "
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setQuery('')}
                className="shrink-0 text-[#94A3B8] hover:text-[var(--primary)] dark:hover:text-white transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-r from-[var(--primary)]/5 via-transparent to-[var(--primary)]/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          
          <motion.div
            initial={false}
            animate={{ width: inputFocused ? '100%' : '0%' }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute left-0 right-0 bottom-0 h-[2.5px] bg-gradient-to-r from-[var(--primary)] via-[var(--primary)]/70 to-[var(--primary)]/30 rounded-full"
          />
        </div>
      </motion.div>

  {/* Category Chips - Premium with Light/Dark backgrounds */}
<div 
  ref={scrollContainerRef}
  className="w-full overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
  style={{ WebkitOverflowScrolling: 'touch' }}
>
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.12 }}
    className="flex gap-2.5"
    style={{ minWidth: 'max-content' }}
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
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.94 }}
            className={`
              shrink-0 
              px-3 sm:px-5
              py-2 sm:py-3 
              rounded-full 
              text-[10px] sm:text-[12px] 
              font-medium 
              border transition-all duration-300 whitespace-nowrap 
              flex items-center gap-1.5 sm:gap-2
              ${isActive
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-md'
                : 'bg-white dark:bg-black text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/5'
              }
            `}
          >
            <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isActive ? 'text-white dark:text-black' : 'text-gray-500 dark:text-gray-400'}`} />
            <span className="tracking-wide">{t(`service.cat.${cat.key || 'all'}`, cat.label)}</span>
          </motion.button>
        )
      })
    })()}
  </motion.div>
</div>

      {/* Skeleton */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-[160px] rounded-[28px] bg-[#F1F5F9] dark:bg-white/5 animate-pulse"
              style={{ animationDelay: `${i * 0.06}s` }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-[#94A3B8] dark:text-zinc-500 text-[14px]"
        >
          {t('service.noResults', 'No services found. Try a different search.')}
        </motion.div>
      ) : (
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
        >
          {filtered?.map((svc) => {
            const { sub, Icon, gradient, shadow } = getMeta(svc?.name)
            const active = tapped === String(svc?.id)
            const chosen = isMostChosen(svc?.name)
            const priceLabel = getPriceLabel(svc)

            return (
              <motion.button
                key={svc?.id}
                variants={cardV}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleSelect(svc)}
                disabled={tapped !== null}
                className={`
                  group relative w-full text-left rounded-[28px] cursor-pointer
                  overflow-hidden transition-all duration-400
                  border
                  ${active
                    ? 'border-[var(--primary)]/30 dark:border-[var(--primary)]/20 bg-[var(--primary)]/[0.04] dark:bg-[var(--primary)]/10 shadow-[0_20px_60px_-12px_rgba(10,50,105,0.2)] dark:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.4)]'
                    : 'border-slate-200/60 dark:border-white/10 bg-white/95 dark:bg-black/40 backdrop-blur-sm hover:border-[var(--primary)]/30 dark:hover:border-[var(--primary)]/20 hover:shadow-[0_20px_40px_-12px_rgba(10,50,105,0.12)] dark:hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)]'
                  }
                `}
              >
                {/* Premium Glass Shimmer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                </div>

                {/* Premium Accent Edge */}
                <div
                  className={`
                    absolute left-0 top-0 h-full w-[4px] transition-all duration-500
                    ${active 
                      ? `bg-gradient-to-b from-[var(--primary)] to-[var(--primary)]/30` 
                      : 'bg-transparent group-hover:bg-gradient-to-b group-hover:from-[var(--primary)]/40 group-hover:to-transparent'
                    }
                  `}
                />

                {/* Premium Most Chosen Ribbon */}
                {chosen && !active && (
                  <div className="absolute top-0 right-4 z-10">
                    <Badge className="h-[22px] px-2.5 text-[9px] font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white border-0 rounded-full gap-1 leading-none shadow-lg shadow-[var(--primary)]/25">
                      <TrendingUp className="w-2.5 h-2.5" />
                      {t('service.mostChosen', 'Popular')}
                    </Badge>
                  </div>
                )}

                <div className="relative flex items-start gap-3.5 sm:gap-5 px-4 sm:px-6 pt-4 sm:pt-6">
                  {/* Premium Icon Chip with Gradient */}
                  <div
                    className={`
                      relative shrink-0 w-12 h-12 sm:w-15 sm:h-15 rounded-2xl sm:rounded-[20px] flex items-center justify-center
                      transition-all duration-400
                      ${active
                        ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 text-white shadow-lg shadow-[var(--primary)]/25'
                        : `bg-gradient-to-br ${gradient} text-white shadow-lg ${shadow} group-hover:scale-105 group-hover:shadow-xl`
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
                    
                    {/* Premium Verified Badge */}
                    <span className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white dark:bg-black border-2 border-white dark:border-black flex items-center justify-center shadow-md transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                      <BadgeCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--primary)]" strokeWidth={2.5} />
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <span className="block font-bold text-slate-900 dark:text-white leading-snug text-[15px] sm:text-[18px] tracking-tight">
                      {svc.name}
                    </span>
                    <p className="text-[11px] sm:text-[12px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                      {sub}
                    </p>

                    <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-2.5 flex-wrap">
                      {svc.processingTime && (
                        <span className="flex items-center gap-1 text-[9px] sm:text-[11px] font-medium text-[var(--primary)] bg-[var(--primary)]/10 dark:bg-[var(--primary)]/15 rounded-full px-2 sm:px-2.5 py-0.5 border border-[var(--primary)]/20">
                          <Timer className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                          {svc.processingTime}
                        </span>
                      )}
                      {(svc.requiredDocuments?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-1 text-[9px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-white/5 rounded-full px-2 sm:px-2.5 py-0.5">
                          <FileText className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                          {svc.requiredDocuments!.length} docs
                        </span>
                      )}
                      <span className="flex items-center gap-0.5 text-[9px] sm:text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 rounded-full px-2 sm:px-2.5 py-0.5 border border-amber-200/30 dark:border-amber-800/30">
                        <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-current" />
                        4.9
                      </span>
                    </div>
                  </div>
                </div>

                {/* Premium Price Footer */}
                <div className="relative flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-3.5 mt-3 sm:mt-4 border-t border-slate-200/50 dark:border-white/10 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-white/[0.02]">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="flex items-center gap-1 text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-zinc-500">
                      <Sparkle className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                      {t('service.startingFrom', 'From')}
                    </span>
                    {priceLabel ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-[18px] sm:text-[22px] font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-[var(--primary)] transition-colors duration-300">
                          AED {priceLabel}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-zinc-600 italic">
                        Price on request
                      </span>
                    )}
                  </div>

                  {/* Premium CTA Button */}
                  <span
                    className={`
                      relative shrink-0 flex items-center overflow-hidden
                      text-[10px] sm:text-[12px] font-bold rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2
                      transition-all duration-400
                      ${active
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white shadow-lg shadow-[var(--primary)]/25'
                        : `
                          bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white
                          group-hover:bg-[var(--primary)] group-hover:text-white
                          group-hover:shadow-lg group-hover:shadow-[var(--primary)]/25
                          dark:group-hover:bg-[var(--primary)]
                        `
                      }
                    `}
                  >
                    {/* Shimmer on hover */}
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    
                    <span className="relative flex items-center gap-1.5">
                      <Rocket className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">{t('service.getStarted', 'Get started')}</span>
                      <span className="sm:hidden">Start</span>
                    </span>
                  </span>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      )}

      {/* Premium Trust Footer */}
      <AnimatePresence>
        {!loading && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 pb-1 pt-2 border-t border-slate-200/50 dark:border-white/5"
          >
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/60 animate-pulse" />
              10,000+ applications processed
            </span>
            <span className="h-3 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse" />
              97% approval rate
            </span>
            <span className="h-3 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse" />
              ⚡ 4-hour fast-track
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}