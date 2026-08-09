import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock, Shield, Star, Users, Zap, ArrowRight, Lock, Sparkles, Award, TrendingUp, Crown, Mail, Phone, MapPin, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'  // 👈 new import
import { Separator } from '@/components/ui/separator'
import type { FlowData } from '../ApplicationFlow'

interface ReviewStepProps {
  data:           FlowData
  applicationFee: number
  onNext:         () => void
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}
const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28 } },
}

export default function ReviewStep({ data, applicationFee, onNext }: ReviewStepProps) {
  const { t } = useTranslation()

  const BENEFITS = [
    { text: t('review.benefit1', 'Expert document verification by licensed professionals'), icon: Shield },
    { text: t('review.benefit2', 'Government submission handled entirely for you'), icon: Zap },
    { text: t('review.benefit3', 'Dedicated visa officer assigned to your case'), icon: Crown },
    { text: t('review.benefit4', 'Real-time WhatsApp updates at every stage'), icon: Clock },
    { text: t('review.benefit5', 'Zero confusion, zero mistakes guaranteed'), icon: Award },
  ]

  const TRUST_BADGES = [
    { icon: Star,   value: '4.9',   label: t('review.rating', 'Rating'),              sub: t('review.fromReviews', 'from 2,400+ reviews'), gradient: 'from-amber-400 to-amber-500' },
{ 
  icon: Shield, 
  value: '100%', 
  label: 'TMMT Golden', 
  sub: 'Trusted service  Guarantee',
  gradient: 'from-amber-400 to-yellow-500',
  badge: '⭐ Guaranteed',
},
    { icon: Zap,    value: '2.3d',  label: t('review.avgApproval', 'Avg approval'),    sub: t('review.businessDays', 'business days'), gradient: 'from-emerald-400 to-emerald-500' },
    { icon: Shield, value: '97%',   label: t('review.approvalRate', 'Approval rate'),  sub: t('review.withOurProcess', 'with our process'), gradient: 'from-purple-400 to-purple-500' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ duration: 0.26 }}
      className="w-full flex flex-col gap-4 sm:gap-5 md:gap-6"
    >
      {/* Header with gradient accent */}
      <div className="space-y-1.5 sm:space-y-2 relative">
        <div className="flex items-center gap-2">
          <div className="h-5 sm:h-6 w-1 rounded-full bg-gradient-to-b from-[#0A3269] to-[#1A4A8A]" />
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-[#64748B] dark:text-white/40">
            {t('review.step', 'Review your application')}
          </p>
   
        </div>
        <h2
          className="font-bold leading-tight text-[#0F2A44] dark:text-white"
          style={{ fontSize: 'clamp(1.4rem, 4.5vw, 2.2rem)' }}
        >
          {t('review.title', "You're all set")}
          <span className="block text-[#64748B] dark:text-white/60 text-base sm:text-lg font-normal mt-0.5 sm:mt-1">
            {t('review.subtitle', "Let's finalize your application")}
          </span>
        </h2>
      </div>

      {/* Service summary - Premium Card */}
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gradient-to-br dark:from-[#0A0A0F] dark:to-[#1A1A1F] p-4 sm:p-5 md:p-6 border border-[#F1F5F9] dark:border-white/10">
        {/* Decorative elements - Dark blue accent */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#0A3269]/5 dark:bg-[#0A3269]/8 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#0A3269]/3 dark:bg-[#0A3269]/5 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#0A3269]/2 dark:bg-[#0A3269]/3 blur-3xl" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          {/* Left side - Service info */}
          <div className="space-y-1 flex-1">
            <p className="text-[9px] sm:text-[10px] text-[#94A3B8] dark:text-white/40 uppercase tracking-[0.15em] font-semibold">
              {t('review.applyingFor', 'Applying for')}
            </p>
            <p className="text-base sm:text-lg md:text-xl font-bold text-[#0F2A44] dark:text-white leading-tight">
              {data.service?.name || 'Visa Service'}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
              <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#F8FAFC] dark:bg-white/10 border border-[#F1F5F9] dark:border-white/5">
                <Clock className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#64748B] dark:text-white/60" />
                <span className="text-[9px] sm:text-[10px] md:text-[11px] text-[#64748B] dark:text-white/60 whitespace-nowrap">
                  {data.service?.processingTime || '3-5 business days'}
                </span>
              </div>
              <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#0A3269]/20 dark:bg-[#0A3269]/30 border border-[#0A3269]/30 dark:border-[#0A3269]/40">
                <TrendingUp className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#0A3269] dark:text-[#4A8ABF]" />
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-[#0A3269] dark:text-[#4A8ABF] font-medium">High success</span>
              </div>
            </div>
          </div>

          {/* Right side - Price */}
          <div className="shrink-0 w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs sm:text-sm font-semibold text-gray-400 dark:text-gray-500 tracking-wider">
                  AED
                </span>
                <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tabular-nums tracking-tight leading-none">
                  {applicationFee.toLocaleString()}
                </span>
              </div>
            </div>
            <p className="text-[7px] sm:text-[8px] md:text-[9px] text-[#94A3B8] dark:text-white/30 mt-0.5 text-left sm:text-right">
              Government fees billed separately
            </p>
          </div>
        </div>
      </div>

      {/* Benefits - Premium Grid */}
      <div className="space-y-2.5 sm:space-y-3">
        <p className="text-[9px] sm:text-[10px] text-[#94A3B8] dark:text-white/40 uppercase tracking-[0.12em] font-semibold flex items-center gap-2">
          <span className="h-px flex-1 bg-[#F1F5F9] dark:bg-white/10" />
          {t('review.whatWeHandle', "What we'll handle for you")}
          <span className="h-px flex-1 bg-[#F1F5F9] dark:bg-white/10" />
        </p>
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5"
        >
          {BENEFITS.map((benefit) => (
            <motion.div
              key={benefit.text}
              variants={fadeUp}
              className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-[#FAFBFC] dark:bg-[#1A1A1F] border border-[#F1F5F9] dark:border-white/10 hover:border-[#0A3269]/40 dark:hover:border-[#0A3269]/40 transition-all duration-300 hover:shadow-sm hover:shadow-[#0A3269]/10 dark:hover:shadow-[#0A3269]/10 group"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#0A3269]/20 to-[#0A3269]/5 dark:from-[#0A3269]/30 dark:to-[#0A3269]/10 flex items-center justify-center shrink-0 group-hover:from-[#0A3269]/30 group-hover:to-[#0A3269]/10 transition-all duration-300">
                <benefit.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A3269] dark:text-[#4A8ABF]" />
              </div>
              <span className="text-[11px] sm:text-[12px] md:text-[13px] text-[#475569] dark:text-white/70 leading-snug group-hover:text-[#0F2A44] dark:group-hover:text-white transition-colors duration-300">
                {benefit.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Trust badges - Premium with gradients */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {TRUST_BADGES.map(({ icon: Icon, value, label, sub, gradient }) => (
          <motion.div
            key={label}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="relative rounded-xl overflow-hidden bg-[#FAFBFC] dark:bg-[#1A1A1F] border border-[#F1F5F9] dark:border-white/10 p-3 sm:p-4 text-center group hover:shadow-md hover:shadow-[#0A3269]/10 dark:hover:shadow-[#0A3269]/20 transition-all duration-300"
          >
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] dark:from-[#2A2A2F] dark:to-[#1A1A1F] flex items-center justify-center mx-auto mb-1.5 sm:mb-2 border border-[#F1F5F9] dark:border-white/5">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A3269] dark:text-[#4A8ABF]" />
              </div>
              <p className="text-base sm:text-lg md:text-xl font-bold text-[#0A3269] dark:text-white tabular-nums leading-none">
                {value}
              </p>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] font-medium text-[#475569] dark:text-white/60 mt-1">
                {label}
              </p>
              <p className="text-[7px] sm:text-[8px] text-[#94A3B8] dark:text-white/30 mt-0.5">
                {sub}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Urgency signal - Premium */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl overflow-hidden bg-white dark:bg-[#0A0A0F] border border-[#E2E8F0] dark:border-white/10">
        <div className="relative flex items-center gap-3 w-full sm:w-auto">
          <div className="relative shrink-0">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#0A3269] animate-pulse" />
            <div className="absolute inset-0 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#0A3269] animate-ping opacity-40" />
          </div>
          <p className="text-[11px] sm:text-[12px] md:text-[13px] text-[#475569] dark:text-white/70 leading-snug font-medium flex-1">
            {t('review.urgencyMsg', '92% of applications submitted today are processed within 3 days')}
          </p>
        </div>
      </div>

      {/* Price + CTA - Premium Card */}
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-[#1A1A1F] border border-[#F1F5F9] dark:border-white/10 p-4 sm:p-5 md:p-6">
        {/* Premium accent glow - Dark blue */}
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#0A3269]/5 dark:bg-[#0A3269]/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-[#0A3269]/5 dark:bg-[#0A3269]/8 blur-3xl pointer-events-none" />
        
        <div className="relative space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-[10px] sm:text-[11px] text-[#94A3B8] dark:text-white/40 font-medium">
                {t('review.serviceFee', 'Service fee')}
              </p>
              <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap mt-1">
                <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tabular-nums tracking-tight leading-none">
                  AED {applicationFee.toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 line-through font-medium">
                  AED {(applicationFee * 1.2).toLocaleString()}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#0A3269]/20 dark:bg-[#0A3269]/30 border border-[#0A3269]/30 dark:border-[#0A3269]/40">
                  <span className="text-[7px] sm:text-[8px] font-bold text-[#0A3269] dark:text-[#4A8ABF]">
                    Save {Math.round(((applicationFee * 1.2 - applicationFee) / (applicationFee * 1.2)) * 100)}%
                  </span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A3269]/10 dark:bg-[#0A3269]/20 border border-[#0A3269]/20 dark:border-[#0A3269]/30 shrink-0 w-fit">
              <Sparkles className="w-3 h-3 text-[#0A3269] dark:text-[#4A8ABF]" />
              <span className="text-[7px] sm:text-[8px] md:text-[9px] font-bold text-[#0A3269] dark:text-[#4A8ABF] uppercase tracking-wider">Best value</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] text-[#94A3B8] dark:text-white/40">
            <Lock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#0A3269] dark:text-[#4A8ABF]" />
            <span>{t('review.securedByStripe', 'Secured by Stripe · 256-bit SSL')}</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-[#E2E8F0] dark:bg-white/10" />
            <span className="hidden sm:flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#0A3269] dark:text-[#4A8ABF]" />
              Money-back guarantee
            </span>
          </div>

          <Button
            onClick={onNext}
            className="
              w-full h-12 sm:h-13 md:h-14 rounded-2xl font-bold text-[14px] sm:text-[15px] md:text-[16px]
              bg-gradient-to-r from-[#0A3269] to-[#1A4A8A] hover:from-[#1A4A8A] hover:to-[#2A5A9A]
              dark:from-white dark:to-[#F0F0F0] dark:hover:from-[#F0F0F0] dark:hover:to-white
              text-white dark:text-[#0A3269]
              shadow-lg shadow-[#0A3269]/25 dark:shadow-white/10
              hover:shadow-xl hover:shadow-[#0A3269]/35 dark:hover:shadow-white/20
              active:scale-[0.97] transition-all duration-300
              flex items-center justify-center gap-2 sm:gap-3
              relative overflow-hidden group
            "
          >
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <span className="relative z-10">{t('review.secureBtn', 'Secure my application')}</span>
            <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>

          <p className="text-[8px] sm:text-[9px] text-center text-[#94A3B8] dark:text-white/20">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </motion.div>
  )
}