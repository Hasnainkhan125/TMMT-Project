"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import {
  ArrowLeft,
  Crown,
  Link,
  CreditCard,
  AlertCircle,
  Shield,
  Info,
  CheckCircle,
  Star,
  BadgeCheck,
  Zap,
  Lock,
  Users,
  FileText,
  Clock,
  Headphones,
  Sparkles,
  Award,
  Rocket,
  Briefcase,
  Heart,
  Car,
  IdCard,
  Building2,
  Globe,
  MessageSquare
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import {
  PLANS,
  getEffectivePlan,
  getPerMonthAmount,
  isEidOfferActive,
  EID_OFFER_END,
  getTranslatedPlans,
  getServiceRequestNote,
  type Plan,
} from '@/lib/plans';
import { useTranslation } from 'react-i18next';

const PAYMENT_MODE: 'checkout' | 'elements' = 'checkout';

const stripePromise: Promise<Stripe | null> = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

import {
  Check, Loader2, ArrowRight, Gift,
  Lock as LockIcon, ExternalLink, ShieldCheck, Clock as ClockIcon, Zap as ZapIcon, Gem,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SealWatermark = () => (
  <svg
    className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 -z-10 opacity-[0.05] dark:opacity-[0.06]"
    width="360"
    height="360"
    viewBox="0 0 360 360"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="180" cy="180" r="176" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 7" className="text-[#14235E]" />
    <circle cx="180" cy="180" r="150" stroke="currentColor" strokeWidth="1" className="text-[#14235E]" />
    <circle cx="180" cy="180" r="4" fill="currentColor" className="text-[#14235E]" />
  </svg>
);

const SealBadge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-[10px] font-light uppercase tracking-wider border-[#14235E]/40 text-[#14235E]',
      className
    )}
  >
    {children}
  </span>
);

// ─── Value-anchored feature data ────────────────────────────────────────────
const featuresFor = (plan: Plan) => {
  const getIcon = (id: string) => {
    if (id === 'monthly') return ZapIcon;
    if (id === 'yearly') return Crown;
    if (id === 'twoyear') return Gem;
    return ZapIcon;
  };

  return {
    tagline: plan.headline || '',
    highlight: plan.bullets?.[0] || '',
    highlightSub: 'included',
    Icon: getIcon(plan.id),
    bullets: plan.bullets?.map((bullet: string) => ({ 
      label: bullet 
    })) || [],
    badge: plan.popular ? 'Best value' : undefined,
  };
};

// ─── Section: Why Subscribe? ─────────────────────────────────────────────────
const WhySubscribeSection = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const isArabic = language === 'ar';

  const benefits = [
    { icon: ClockIcon, title: isArabic ? 'وفّر وقتك' : 'Save Time', desc: isArabic ? 'تجاوز الطوابير والارتباك' : 'Skip the queues and confusion' },
    { icon: Shield, title: isArabic ? 'تجنب الأخطاء' : 'Avoid Mistakes', desc: isArabic ? 'منع الأخطاء المكلفة والغرامات' : 'Prevent costly errors and fines' },
    { icon: Headphones, title: isArabic ? 'دعم خبراء' : 'Expert Support', desc: isArabic ? 'إرشاد من محترفين ذوي خبرة' : 'Guidance from experienced professionals' },
    { icon: Award, title: isArabic ? 'خدمة مضمونة' : 'Guaranteed Service', desc: isArabic ? 'نصحح الأخطاء دون رسوم إضافية' : 'We correct errors at no extra fee' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8 sm:mb-10 lg:mb-12"
    >
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black dark:text-white leading-[1.05] tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
          {isArabic ? 'لماذا تشترك مع' : 'Why Subscribe to'}
          <br />
          <span className="text-[#14235E] font-normal">
            {isArabic ? 'TMMT؟' : 'TMMT?'}
          </span>
        </h2>
      </div>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-5xl mx-auto">
  {benefits.map((benefit, idx) => (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-xl sm:rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0c] p-3 sm:p-4 md:p-5 text-center hover:border-[#14235E]/40 hover:shadow-xl hover:shadow-[#14235E]/8 transition-all duration-300"
   
   >
      
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#14235E] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="p-2 sm:p-3 rounded-xl bg-[#14235E] w-fit mx-auto mb-2 sm:mb-3 group-hover:bg-[#14235E]/80 transition-all duration-300">
        <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white group-hover:text-white transition-colors duration-300" strokeWidth={1.75} />
      </div>
      <p className="font-normal text-black dark:text-white text-sm sm:text-base md:text-lg group-hover:text-[#14235E] transition-colors duration-300">
        {benefit.title}
      </p>
      <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-white/50 mt-1 leading-relaxed font-light">
        {benefit.desc}
      </p>
    </motion.div>
  ))}
</div>
    </motion.div>
  );
};

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
              <SealBadge className="border-amber-500/40 text-amber-400 text-[7px] sm:text-[8px] px-1.5 sm:px-2">
                ✓ Trusted
              </SealBadge>
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

// ─── Section: How It Works ───────────────────────────────────────────────────
const HowItWorksSection = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const isArabic = language === 'ar';

  const steps = [
    { icon: Users, label: isArabic ? 'أنشئ حسابك' : 'Create your account' },
    { icon: FileText, label: isArabic ? 'اختر خدمتك' : 'Choose your service' },
    { icon: MessageSquare, label: isArabic ? 'قدّم طلبك أو اسأل المساعد الذكي' : 'Submit your request or ask the AI Assistant' },
    { icon: Rocket, label: isArabic ? 'TMMT تتولى الباقي' : 'TMMT takes care of the rest' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-8 sm:mt-10 max-w-5xl mx-auto px-0 sm:px-4"
    >
      <h3 className="text-center text-base sm:text-lg md:text-xl font-light text-black dark:text-white mb-4 sm:mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        {isArabic ? (
          <>
            كيف يعمل
            <br />
            <span className="text-[#14235E] font-normal">بعد اشتراكك</span>
          </>
        ) : (
          <>
            How Works After
            <br />
            <span className="text-[#14235E] font-normal">subscription</span>
          </>
        )}
      </h3>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
  {steps.map((step, idx) => (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + idx * 0.08, duration: 0.5 }}
      className="group relative text-center p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-[#0c0c0c] border border-black/5 dark:border-zinc-800 hover:border-[#14235E]/30 hover:shadow-md transition-all duration-300"
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-[#14235E] flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-[#14235E]/80 transition-all duration-300">
            <step.icon 
              className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white group-hover:text-white transition-colors duration-300" 
              strokeWidth={1.75} 
            />
          </div>
          
          {idx < steps.length - 1 && (
            <div className="hidden md:block absolute top-1/2 left-full w-[calc(100%+0.5rem)] h-px bg-gradient-to-r from-[#14235E]/20 to-transparent -translate-y-1/2" />
          )}
          
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#14235E] text-white text-[7px] sm:text-[9px] font-medium flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
            {idx + 1}
          </div>
        </div>
        
        <span className="text-[9px] sm:text-xs md:text-sm font-light text-black dark:text-white/80 max-w-[70px] sm:max-w-[100px] text-center leading-tight group-hover:text-[#14235E] transition-colors duration-300">
          {step.label}
        </span>
      </div>
    </motion.div>
  ))}
</div>
    </motion.div>
  );
};


// ─── Section: Trust Icons ────────────────────────────────────────────────────
const TrustSection = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const isArabic = language === 'ar';

  const trustItems = [
    { icon: LockIcon, label: isArabic ? 'مدفوعات آمنة' : 'Secure Payments' },
    { icon: Shield, label: isArabic ? 'بيانات محمية' : 'Protected User Data' },
    { icon: Globe, label: isArabic ? 'رسوم حكومية شفافة' : 'Official Government Fees Only' },
    { icon: CheckCircle, label: isArabic ? 'بدون رسوم خفية' : 'No Hidden Charges' },
  ];

  return (
 <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.35 }}
  className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4"
>
  {trustItems.map((item, idx) => (
    <motion.div
      key={idx}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 + idx * 0.08, duration: 0.3 }}
      whileHover={{ 
        scale: 1.03,
        y: -3,
        transition: { duration: 0.2 }
      }}
      className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 
        rounded-xl 
        bg-white/40 dark:bg-white/5 
        backdrop-blur-md 
        transition-all duration-300"
    >
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 
        bg-gradient-to-r from-[#14235E]/5 to-transparent dark:from-[#14235E]/10" />
      
      <item.icon 
        className="relative h-3.5 w-3.5 sm:h-4 sm:w-4 
          text-[#14235E] dark:text-[#14235E] 
          group-hover:scale-110 
          transition-all duration-300" 
        strokeWidth={1.75} 
      />
      <span className="relative text-[9px] sm:text-[11px] md:text-xs font-medium 
        text-zinc-700 dark:text-zinc-300 
        group-hover:text-[#14235E] dark:group-hover:text-[#14235E] 
        transition-colors duration-300 whitespace-nowrap">
        {item.label}
      </span>
    </motion.div>
  ))}
</motion.div>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// PLAN SELECTION BLOCK
// ═══════════════════════════════════════════════════════════════════════════

export function PlanSelectionSection({
  PLANS,
  selectedPlan,
  setSelectedPlan,
  getEffectivePlan,
  getPerMonthAmount,
  isEidOfferActive,
  EID_OFFER_END,
  handleSubscribe,
  isRedirecting,
  effectivePlan,
  PAYMENT_MODE,
  navigate,
}: any) {
  const { i18n } = useTranslation();
  const language = i18n.language;
    const isArabic = language === 'ar';

  const translatedPlans = getTranslatedPlans(language);
  const eidActive = isEidOfferActive();

  const getSavings = (plan: Plan) => {
    if (plan.id === 'monthly') return null;
    const monthlyPrice = 30;
    const monthlyTotal = plan.interval === 'year' ? monthlyPrice * 12 : monthlyPrice * 24;
    const savings = Math.round(((monthlyTotal - plan.amount) / monthlyTotal) * 100);
    return savings;
  };

  return (
    <div
      className="relative bg-white dark:bg-black transition-colors duration-300 overflow-x-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12 md:py-16 space-y-6 sm:space-y-8 max-w-6xl">

        <WhySubscribeSection />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto"
        >
          <SealWatermark />
          <h1
            className="font-light text-black dark:text-white leading-[1.05]"
            style={{ 
              fontFamily: "'Inter', sans-serif", 
              fontSize: 'clamp(1.5rem, 4.5vw, 3rem)'
            }}
          >
            {language === 'ar' ? (
              <>
                الخدمات الحكومية،
                <br />
                <span className="relative text-[#14235E] font-normal" style={{ fontSize: 'clamp(1.2rem, 2.8vw, 2.2rem)' }}>
                  بدون عناء.
                  <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 300 6" preserveAspectRatio="none">
                    <path d="M0,4 Q75,1 150,3 T300,2.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </>
            ) : (
              <>
                Government Services,
                <br />
                <span className="relative text-[#14235E] font-normal">
                  Without the Hassle.
                  <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 300 6" preserveAspectRatio="none">
                    <path d="M0,4 Q75,1 150,3 T300,2.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-black/55 dark:text-white/50 leading-relaxed max-w-2xl mx-auto font-light">
            {language === 'ar' ? (
              <>
                وفر وقتك، وتجنب الأخطاء المكلفة، واحصل على دعم موثوق لكل خدمة حكومية في الإمارات
                <br className="hidden md:block" />
                — كل ذلك في مكان واحد.
              </>
            ) : (
              <>
                Save time, avoid costly mistakes, and get trusted support for every UAE government service
                <br className="hidden md:block" />
                —all in one place.
              </>
            )}
          </p>
        </motion.div>

        {eidActive && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#14235E]/30 bg-[#14235E]/5 dark:bg-black max-w-3xl mx-auto"
          >
            <div className="relative p-3 sm:p-4 md:p-5 flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="hidden md:flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-[#14235E]/20 dark:bg-zinc-800 border border-[#14235E]/30">
                <Gift className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#14235E]" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-light text-xs sm:text-sm md:text-[15px] text-black dark:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Eid Special — Save up to AED 50
                </p>
                <p className="text-[10px] sm:text-xs text-black/50 dark:text-white/50 mt-0.5 flex items-center gap-1.5 font-light">
                  <ClockIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Offer ends {EID_OFFER_END.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Badge className="bg-black text-white dark:bg-white dark:text-black border-0 px-2 sm:px-2.5 md:px-3 py-0.5 text-[7px] sm:text-[8px] md:text-[10px] tracking-widest uppercase font-light">
                Limited time
              </Badge>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6 md:gap-6 pt-6 items-stretch">
          {translatedPlans.map((plan: Plan, idx: number) => {
            const eff = getEffectivePlan(plan);
            const perMonth = getPerMonthAmount(plan);
            const isSelected = selectedPlan.id === plan.id;
            const f = featuresFor(plan);
            const isPopular = plan.popular;
            const PlanIcon = f.Icon;
            const savingsPercentage = getSavings(plan);
            const isMonthly = plan.id === 'monthly';

            const serviceExamples = [
              { icon: IdCard, label: 'Emirates ID' },
              { icon: FileText, label: 'Visa' },
              { icon: Globe, label: 'Passport' },
              { icon: Car, label: 'Driving License' },
              { icon: Heart, label: 'Family Services' },
              { icon: Building2, label: 'Business Services' },
            ];

            return (
         <motion.button
  key={plan.id}
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: false, amount: 0.1 }}
  transition={{ delay: 0.1 + idx * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
  onClick={() => setSelectedPlan(plan)}
  whileHover={{ y: -4 }}
  whileTap={{ scale: 0.985 }}
  className={cn(
    'relative flex flex-col text-left rounded-[26px] p-7 md:p-7 transition-all duration-300',
    'border bg-white dark:bg-[#0c0c0c]',
    'h-auto min-h-[520px] md:min-h-[560px]',
    isPopular
      ? [
          'border-[#14235E]/60',
          'shadow-[0_24px_60px_-16px_rgba(10,50,105,0.12)] dark:shadow-[0_24px_60px_-16px_rgba(0,0,0,0.5)]',
          'md:-translate-y-3 z-10',
          'min-h-[540px] md:min-h-[590px]',
        ]
      : [
          'border-zinc-200 dark:border-zinc-800',
          'hover:border-zinc-300 dark:hover:border-zinc-700',
        ],
    isSelected && !isPopular && 'ring-2 ring-[#14235E]/60 border-transparent'
  )}
>
  {/* Popular plan: an official-seal badge overlapping the corner */}
  {isPopular && (
    <div className="absolute -top-4 -right-3 flex h-[60px] w-[60px] rotate-[10deg] items-center justify-center rounded-full border-[1.5px] border-solid border-[#14235E] bg-white dark:bg-black">
      <div className="flex flex-col items-center leading-none text-[#14235E] dark:text-white">
        <Star className="h-3 w-3 mb-0.5" strokeWidth={2.5} fill="currentColor" />
        <span className="text-[7px] font-semibold uppercase tracking-wide">Most</span>
        <span className="text-[7px] font-semibold uppercase tracking-wide">Popular</span>
      </div>
    </div>
  )}

  <div className="relative flex items-center gap-3">
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300',
        isPopular
          ? 'bg-[#14235E]/15 border-[#14235E]/30'
          : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
      )}
    >
      <PlanIcon
        className={cn('h-5 w-5', isPopular ? 'text-[#14235E]' : 'text-zinc-600 dark:text-white/60')}
        strokeWidth={1.75}
      />
    </div>
    <h3
      className="text-xl md:text-[22px] font-semibold text-black dark:text-white leading-tight"
      style={{ fontFamily: "'Fraunces', serif", letterSpacing: '-0.01em' }}
    >
      {plan.label}
    </h3>
  </div>

  <p className="relative mt-3 text-sm italic text-black/50 dark:text-white/40 font-light">
    {plan.headline}
  </p>

  <div className="relative mt-6 mb-1">
    {eff.isOffer && (
      <span className="block text-sm line-through text-black/30 dark:text-white/30 font-light">
        AED {eff.regularAmount}
      </span>
    )}
    <div className="flex items-baseline gap-2">
      <span
        className="text-4xl md:text-[42px] font-bold text-black dark:text-white tracking-tight [font-variant-numeric:tabular-nums]"
        style={{ 
          fontFamily: "'Fraunces', serif",
          fontWeight: 700,
          fontVariationSettings: "'opsz' 144",
          letterSpacing: '-0.02em'
        }}
      >
        AED {eff.amount}
      </span>
      <span className="text-sm font-light text-black/40 dark:text-white/40">
        /{plan.intervalLabel}
      </span>
    </div>

    {eff.isOffer && (
      <SealBadge className="mt-2">
        Save {eff.savings}
      </SealBadge>
    )}

    {plan.interval !== 'month' && (
      <p className="text-xs mt-2 font-light text-[#14235E] flex items-center gap-1.5">
        ≈ AED {perMonth}/month
        {savingsPercentage && savingsPercentage > 0 && (
          <SealBadge className="py-0">
            Save {savingsPercentage}%
          </SealBadge>
        )}
      </p>
    )}
  </div>

  <div className="relative flex items-center gap-3 my-3">
    <span className="h-px flex-1 bg-black/10 dark:bg-zinc-800" />
    <span className="text-[10px] font-light uppercase tracking-widest text-black/35 dark:text-white/30">
      What's included
    </span>
    <span className="h-px flex-1 bg-black/10 dark:bg-zinc-800" />
  </div>

  <ul className="relative space-y-3 flex-1">
    <li className="flex items-start gap-2.5 text-[13px] group/item transition-all duration-200">
      <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-[1px] transition-all duration-300', isPopular ? 'bg-[#14235E]' : 'bg-zinc-200 dark:bg-zinc-800 group-hover/item:scale-110')}>
        <Check className={cn('h-3 w-3 transition-all duration-300', isPopular ? 'text-white' : 'text-zinc-500 dark:text-white/50')} strokeWidth={3} />
      </span>
      <span className="text-black/75 dark:text-white/70 leading-snug pt-[1px] font-light">
        {plan.serviceLimits}
      </span>
    </li>
    <li className="flex items-start gap-2.5 text-[13px] group/item transition-all duration-200">
      <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-[1px] transition-all duration-300', isPopular ? 'bg-[#14235E]' : 'bg-zinc-200 dark:bg-zinc-800 group-hover/item:scale-110')}>
        <Check className={cn('h-3 w-3 transition-all duration-300', isPopular ? 'text-white' : 'text-zinc-500 dark:text-white/50')} strokeWidth={3} />
      </span>
      <span className="text-black/75 dark:text-white/70 leading-snug pt-[1px] font-light">
        {plan.planDetails.questionsPerMonth} Status Checks
      </span>
    </li>
    <li className="flex items-start gap-2.5 text-[13px] group/item transition-all duration-200">
      <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-[1px] transition-all duration-300', isPopular ? 'bg-[#14235E]' : 'bg-zinc-200 dark:bg-zinc-800 group-hover/item:scale-110')}>
        <Check className={cn('h-3 w-3 transition-all duration-300', isPopular ? 'text-white' : 'text-zinc-500 dark:text-white/50')} strokeWidth={3} />
      </span>
      <span className="text-black/75 dark:text-white/70 leading-snug pt-[1px] font-light">
        {plan.planDetails.aiLevel} AI Level
      </span>
    </li>
    <li className="flex items-start gap-2.5 text-[13px] group/item transition-all duration-200">
      <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-[1px] transition-all duration-300', isPopular ? 'bg-[#14235E]' : 'bg-zinc-200 dark:bg-zinc-800 group-hover/item:scale-110')}>
        <Check className={cn('h-3 w-3 transition-all duration-300', isPopular ? 'text-white' : 'text-zinc-500 dark:text-white/50')} strokeWidth={3} />
      </span>
      <span className="text-black/75 dark:text-white/70 leading-snug pt-[1px] font-light">
        {plan.planDetails.discountRate}off TMMT Fee
      </span>
    </li>
    <li className="flex items-start gap-2.5 text-[13px] group/item transition-all duration-200">
      <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-[1px] transition-all duration-300', isPopular ? 'bg-[#14235E]' : 'bg-zinc-200 dark:bg-zinc-800 group-hover/item:scale-110')}>
        <Check className={cn('h-3 w-3 transition-all duration-300', isPopular ? 'text-white' : 'text-zinc-500 dark:text-white/50')} strokeWidth={3} />
      </span>
      <span className="text-black/75 dark:text-white/70 leading-snug pt-[1px] font-light">
        {plan.planDetails.priority} Priority      </span>
    </li>
  </ul>

  <div className="mt-3 mb-2">
    <p className="text-[10px] text-gray-400 dark:text-white/30 uppercase tracking-wider mb-1.5 font-light">Services included</p>
    <div className="flex flex-wrap gap-1">
      {serviceExamples.slice(0, isMonthly ? 3 : 5).map((service, i) => (
        <span key={i} className="flex items-center gap-0.5 text-[10px] bg-gray-100 dark:bg-zinc-900 px-3 py-0.5 rounded-full font-light transition-all duration-200 hover:scale-105 hover:shadow-sm">
          <service.icon className="h-2.5 w-2.5 text-[#ffffffcc]" strokeWidth={1.5} />
          <span className="text-black/70 dark:text-white/60">{service.label}</span>
        </span>
      ))}
      {!isMonthly && (
        <span className="text-[10px] text-[#14235E] font-light">+ more</span>
      )}
    </div>
  </div>

  <button
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/membership-details/${plan.id}`);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }}
    className="mt-2 text-xs font-light text-gray-600 dark:text-white/50 hover:text-[#14235E] transition-colors flex items-center gap-1 self-start group"
  >
    View Full Details
    <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
  </button>

  {/* Subscribe Button - Effects Only */}
  <div
    role="button"
    onClick={(e) => {
      e.stopPropagation();
      setSelectedPlan(plan);
      handleSubscribe();
    }}
    className={cn(
      'relative mt-5 flex items-center justify-center gap-2.5 h-12 rounded-full text-sm font-medium',
      'transition-all duration-300 cursor-pointer select-none overflow-hidden group/btn',
      isPopular
        ? 'bg-[#14235E] text-white shadow-[0_8px_25px_-6px_rgba(10,50,105,0.55)]'
        : 'bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white'
    )}
  >
    {/* Shimmer Effect - only on hover */}
    <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    
    <span className="relative z-10 flex items-center gap-2">
      <span>{isPopular ? 'Get Started' : isMonthly ? 'Subscribe Now' : 'Start Your Membership'}</span>
      <motion.span
        className="flex items-center justify-center rounded-full bg-white/20 dark:bg-black/20 w-7 h-7"
        whileHover={{ x: 4 }}
        transition={{ duration: 0.3 }}
      >
        <ArrowRight className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
      </motion.span>
    </span>
  </div>
</motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-4 max-w-3xl mx-auto"
        >
          <div className="relative rounded-lg sm:rounded-xl border border-[#14235E]/900 bg-[#14235E]/5 dark:bg-black p-2.5 sm:p-3 md:p-4">
            <div className="flex items-start gap-2">
              <div className="p-0.5 sm:p-1 rounded-full bg-[#14235E]/10 dark:bg-zinc-900 mt-0.5 flex-shrink-0">
                <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#14235E]" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] md:text-xs font-light text-black dark:text-white">
                  {language === 'ar' ? 'ما هي مراجعات الحالة الشخصية؟' : 'What is a Personal Case Review?'}
                </p>
                <p className="text-[8px] sm:text-[9px] md:text-xs text-gray-500 dark:text-white/50 mt-0.5 leading-relaxed font-light">
                  {getServiceRequestNote(language)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        <GoldenGuaranteeCard />
        <HowItWorksSection />

{/* ─── Founding Members Section - Compact & Responsive ──────────────────── */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: 0.55, duration: 0.5 }}
  className="mt-6 sm:mt-8 relative overflow-hidden rounded-2xl bg-white dark:bg-black/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-500 group cursor-pointer"
  onClick={() => {
    navigate('/subscription');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  }}
>

  <div className="relative">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
      <div className="flex items-center gap-3">
        <div className="relative p-2 rounded-lg bg-amber-400/10 border border-amber-200/20">
          <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" strokeWidth={1.75} />
        </div>
        <div>
          <h4 className="text-base sm:text-xl font-semibold text-black dark:text-white" style={{ fontFamily: "'Fraunces', serif" }}>
            {isArabic ? 'الأعضاء المؤسسون' : 'Founding Members'}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-light tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              <span className="relative flex h-1 w-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-1 w-1 bg-amber-400" />
              </span>
              {isArabic ? 'وقت محدود' : 'Limited Time'}
            </span>
            <span className="text-[8px] sm:text-[10px] font-light text-amber-500/60">
              {isArabic ? '• عرض حصري' : '• Exclusive'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Arrow Link ────────────────────────────────────────────────────── */}
      <div 
        className="group/arrow inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-all duration-300"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/subscription');
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        }}
      >
        <span className="  text-black/40 dark:text-white/60 group-hover/arrow:text-amber-500 dark:group-hover/arrow:text-amber-400 transition-colors duration-300">
          {isArabic ? 'عرض التفاصيل' : 'View Details'}
        </span>
        <ArrowRight className="h-5 w-5 transition-all duration-300 group-hover/arrow:translate-x-1 group-hover/arrow:scale-110" strokeWidth={2.5} />
      </div>
    </div>

    <p className="text-[11px] sm:text-sm text-black/60 dark:text-white/50 max-w-3xl leading-relaxed mt-2 sm:mt-3 font-light">
      {isArabic 
        ? 'انضم إلى النخبة الأولى من الأعضاء المؤسسين واستمتع بمزايا حصرية لا تتوفر للآخرين. كن جزءاً من تاريخ TMMT من البداية.'
        : 'Join the founding members and enjoy exclusive benefits. Be part of TMMT\'s history from the start.'
      }
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-5">
      {[
        { icon: BadgeCheck, title: isArabic ? 'شارة العضو المؤسس' : 'Founding Badge', desc: isArabic ? 'شارة حصرية على حسابك تظهر وضعك كعضو مؤسس.' : 'Exclusive badge on your account showing your founding status.' },
        { icon: Gem, title: isArabic ? 'امتياز المؤسس مدى الحياة' : 'Lifetime Privilege', desc: isArabic ? 'هوية مؤسس دائمة ومزايا حصرية بما في ذلك أسعار خاصة وخصومات على رسوم الخدمات.' : 'Permanent Founder identity with exclusive advantages and special pricing.' },
        { icon: Sparkles, title: isArabic ? 'مزايا حصرية' : 'Exclusive Benefits', desc: isArabic ? 'الوصول إلى الميزات المميزة عند إضافتها إلى المنصة.' : 'Access to premium features as they are added.' }
      ].map((item, idx) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + idx * 0.1, duration: 0.4 }}
          className="group/item relative overflow-hidden rounded-lg bg-white/50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 hover:border-amber-200/30 transition-all duration-300 hover:shadow-sm hover:shadow-amber-500/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -top-10 -right-10 w-16 h-16 rounded-full bg-amber-400/5 blur-xl group-hover/item:bg-amber-400/10 transition-all duration-500" />
          <div className="relative flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 group-hover/item:bg-amber-500/20 transition-colors duration-300">
              <item.icon className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
            </div>
            <div>
              <h5 className="font-light text-black dark:text-white text-xs sm:text-sm">
                {item.title}
              </h5>
              <p className="text-[10px] sm:text-xs text-black/50 dark:text-white/50 mt-0.5 leading-relaxed font-light">
                {item.desc}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mt-3 sm:mt-4 relative overflow-hidden rounded-lg bg-amber-500/5 border border-amber-200/20 p-2 sm:p-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-[10px] sm:text-xs text-amber-400 font-light text-center sm:text-left">
            {isArabic 
              ? 'عضوية المؤسسين محدودة — انضم الآن قبل إغلاق التسجيل.'
              : 'Founding membership is limited — join now before enrollment closes.'
            }
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-px h-3 bg-black/10 dark:bg-zinc-800" />
          <span className="text-[8px] sm:text-[10px] font-light text-black/40 dark:text-white/40">
            {isArabic ? 'عرض حصري' : 'Exclusive'}
          </span>
        </div>
      </div>
    </motion.div>
  </div>
</motion.div>



        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col items-center gap-3 sm:gap-4 pt-4"
        >
<motion.button
  onClick={handleSubscribe}
  disabled={isRedirecting}
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  className={cn(
    "group relative flex items-center justify-center gap-2 sm:gap-3",
    "h-13 sm:h-14 md:h-15",
    "w-full sm:w-auto min-w-[200px] sm:min-w-[280px] px-5 sm:px-10 rounded-4xl",
    "text-[13px] sm:text-[15px] md:text-[16px] font-semibold",
    "transition-all duration-300 cursor-pointer select-none",
    // ─── Light & Dark mode: both use #14235E ────────────────────────────
    "bg-[#14235E] text-white",
    "hover:border-[#14235E]/50 dark:hover:border-white/40",
    "active:scale-95",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "overflow-hidden"
  )}
>
  {/* ─── Shimmer Effect ──────────────────────────────────────────────────── */}
  <motion.span 
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10"
    animate={{ 
      x: ['-100%', '100%'] 
    }}
    transition={{ 
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
      repeatDelay: 1.5
    }}
  />

  {isRedirecting ? (
    <span className="relative z-10 flex items-center gap-2">
      <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
      <span className="text-sm sm:text-base text-white font-medium">Loading...</span>
    </span>
  ) : (
    <span className="relative z-10 flex items-center gap-2 sm:gap-2.5">
      {/* ─── Text ────────────────────────────────────────────────────────── */}
      <span className="text-[12px] sm:text-[14px] md:text-[15px] text-white font-semibold">
        {language === 'ar' ? 'ابدأ عضويتك' : 'Start Your Membership'}
      </span>

      {/* ─── Price Badge ──────────────────────────────────────────────────── */}
      <span className="flex items-center rounded-full px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] bg-white/25 text-white font-medium">
        AED {effectivePlan.amount}
      </span>

      {/* ─── Arrow Circle ────────────────────────────────────────────────── */}
      <span className="flex items-center justify-center rounded-full bg-white w-7 h-7 sm:w-8 sm:h-8 md:w-8 md:h-8 transition-all duration-300 group-hover:translate-x-0.5 group-hover:scale-105">
        <ArrowRight 
          className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#14235E]" 
          strokeWidth={2.5} 
        />
      </span>
    </span>
  )}
</motion.button>
<div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-3 sm:mt-4">
  {/* PCI-DSS Secure */}
  <div className="group relative flex flex-col items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-zinc-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm hover:border-[#14235E]/30 dark:hover:border-[#14235E]/30  transition-all duration-300 hover:-translate-y-0.5">
    <div className="p-1.5 sm:p-2 rounded-lg bg-[#14235E]/10 dark:bg-[#14235E]/10 group-hover:bg-[#14235E] dark:group-hover:bg-[#14235E] transition-all duration-300 group-hover:scale-110">
      <ShieldCheck className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#14235E] dark:text-[#14235E] group-hover:text-white dark:group-hover:text-white transition-all duration-300" strokeWidth={1.75} />
    </div>
    <span className="text-[8px] sm:text-[10px] md:text-[11px] text-center text-black/60 dark:text-white/60 leading-tight font-light group-hover:text-[#14235E] dark:group-hover:text-[#14235E] transition-colors duration-300">
      PCI-DSS Secure
    </span>
    {/* Hover indicator line */}
    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#14235E] dark:bg-[#14235E] transition-all duration-300 group-hover:w-8 rounded-full" />
  </div>

  {/* 256-bit Encryption */}
  <div className="group relative flex flex-col items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-zinc-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm hover:border-[#14235E]/30 dark:hover:border-[#14235E]/30 transition-all duration-300 hover:-translate-y-0.5">
    <div className="p-1.5 sm:p-2 rounded-lg bg-[#14235E]/10 dark:bg-[#14235E]/10 group-hover:bg-[#14235E] dark:group-hover:bg-[#14235E] transition-all duration-300 group-hover:scale-110">
      <LockIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#14235E] dark:text-[#14235E] group-hover:text-white dark:group-hover:text-white transition-all duration-300" strokeWidth={1.75} />
    </div>
    <span className="text-[8px] sm:text-[10px] md:text-[11px] text-center text-black/60 dark:text-white/60 leading-tight font-light group-hover:text-[#14235E] dark:group-hover:text-[#14235E] transition-colors duration-300">
      256-bit Encryption
    </span>
    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#14235E] dark:bg-[#14235E] transition-all duration-300 group-hover:w-8 rounded-full" />
  </div>

  {/* Cancel Anytime */}
  <div className="group relative flex flex-col items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-zinc-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm hover:border-[#14235E]/30 dark:hover:border-[#14235E]/30  transition-all duration-300 hover:-translate-y-0.5">
    <div className="p-1.5 sm:p-2 rounded-lg bg-[#14235E]/10 dark:bg-[#14235E]/10 group-hover:bg-[#14235E] dark:group-hover:bg-[#14235E] transition-all duration-300 group-hover:scale-110">
      <ExternalLink className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#14235E] dark:text-[#14235E] group-hover:text-white dark:group-hover:text-white transition-all duration-300" strokeWidth={1.75} />
    </div>
    <span className="text-[8px] sm:text-[10px] md:text-[11px] text-center text-black/60 dark:text-white/60 leading-tight font-light group-hover:text-[#14235E] dark:group-hover:text-[#14235E] transition-colors duration-300">
      Cancel Anytime
    </span>
    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#14235E] dark:bg-[#14235E] transition-all duration-300 group-hover:w-8 rounded-full" />
  </div>
</div>

          <TrustSection />

          <div className="relative mt-2 overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-black/70 backdrop-blur-2xl px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 max-w-2xl mx-auto w-full">
            <div className="relative flex flex-col items-center text-center gap-0.5 sm:gap-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.15em] font-light text-black/40 dark:text-white/40">Powered by</span>
                <span className="text-[10px] sm:text-xs md:text-sm font-light text-black dark:text-white">TMMT</span>
              </div>
              <p className="max-w-lg text-[8px] sm:text-[10px] md:text-[11px] leading-4 sm:leading-5 text-black/50 dark:text-white/50 font-light">
                <span className="font-normal">7-day refund guarantee</span> when no service has been used
                <span className="mx-1.5 sm:mx-2 text-[#14235E]">•</span>
                End-to-end encrypted payments
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function SubscriptionPage() {
  if (PAYMENT_MODE === 'elements') {
    return (
      <div
        className="relative z-10 rounded-t-[2rem] bg-white dark:bg-black transition-colors duration-300 overflow-x-hidden"
        style={{ '--primary': '#14235E' } as React.CSSProperties}
      >
        <Elements stripe={stripePromise}>
          <SubscriptionPageInner />
        </Elements>
      </div>
    );
  }
  return (
    <div
      className="relative rounded-t-[2rem] bg-white dark:bg-black transition-colors duration-300 overflow-x-hidden"
      style={{ '--primary': '#14235E' } as React.CSSProperties}
    >
      <SubscriptionPageInner />
    </div>
  );
}

export function SubscriptionPageInner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[1]);
  const [step, setStep] = useState<'select' | 'payment'>('select');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [loadingCurrent, setLoadingCurrent] = useState(true);

  const checkoutStatus = searchParams.get('status');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (PAYMENT_MODE !== 'checkout') return;

    if (checkoutStatus === 'cancelled') {
      toast.info('Checkout cancelled — no charges made.');
      setSearchParams({}, { replace: true });
      return;
    }

    if (checkoutStatus === 'success' && sessionId) {
      (async () => {
        try {
          const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
          const token = localStorage.getItem('authToken');
          const res = await fetch(
            `${apiBase}/api/v1/services/payments/checkout-session/${sessionId}/verify`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();

          if (data.success && data.paid) {
            toast.success('Subscription activated! Welcome to Tammat.');
            await fetchCurrentSub();
          } else {
            toast.error('Payment verification failed. Please contact support.');
          }
        } catch (err) {
          console.error('Verify session failed:', err);
          toast.error('Could not verify payment.');
        } finally {
          setSearchParams({}, { replace: true });
        }
      })();
    }
  }, [checkoutStatus, sessionId]);

  const fetchCurrentSub = async () => {
    if (!user) {
      setLoadingCurrent(false);
      return;
    }
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${apiBase}/api/v1/services/payments/subscriptions/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCurrentSub(data.subscription);
    } finally {
      setLoadingCurrent(false);
    }
  };

  useEffect(() => {
    fetchCurrentSub();
  }, [user]);

  const effectivePlan = getEffectivePlan(selectedPlan);

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/auth?redirect=/subscribe');
      return;
    }

    if (PAYMENT_MODE === 'checkout') {
      setIsRedirecting(true);
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${apiBase}/api/v1/services/payments/checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ lookupKey: effectivePlan.lookupKey }),
        });
        const data = await res.json();
        if (!data.success || !data.url) {
          toast.error(data.message || 'Failed to start checkout');
          setIsRedirecting(false);
          return;
        }
        window.location.href = data.url;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Something went wrong');
        setIsRedirecting(false);
      }
    } else {
      setStep('payment');
    }
  };

  const handleManageBilling = async () => {
    setIsRedirecting(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${apiBase}/api/v1/services/payments/portal-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const data = await res.json();
      if (!data.success || !data.url) {
        toast.error(data.message || 'Failed to open billing portal');
        setIsRedirecting(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      setIsRedirecting(false);
    }
  };

  if (loadingCurrent) {
    return (
      <div className="flex items-center justify-center py-24 bg-white dark:bg-black text-zinc-500 dark:text-white/50 gap-2 transition-colors duration-300">
        <Loader2 className="h-5 w-5 animate-spin text-[#14235E]" />
        <span>Loading…</span>
      </div>
    );
  }

  if (currentSub && (currentSub.status === 'active' || currentSub.status === 'trialing')) {
    return (
      <ManageSubscriptionView
        subscription={currentSub}
        onManageBilling={handleManageBilling}
        isRedirecting={isRedirecting}
      />
    );
  }

  if (PAYMENT_MODE === 'elements' && step === 'payment') {
    return (
      <ElementsPaymentForm
        plan={selectedPlan}
        effectivePlan={effectivePlan}
        onBack={() => setStep('select')}
        onSuccess={() => {
          fetchCurrentSub();
        }}
      />
    );
  }

  return (
    <div className="mx-auto space-y-8 relative z-10 overflow-x-hidden">
      <div className="flex justify-center items-center">
        <PlanSelectionSection
          PLANS={PLANS}
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          getEffectivePlan={getEffectivePlan}
          getPerMonthAmount={getPerMonthAmount}
          isEidOfferActive={isEidOfferActive}
          EID_OFFER_END={EID_OFFER_END}
          handleSubscribe={handleSubscribe}
          isRedirecting={isRedirecting}
          effectivePlan={effectivePlan}
          PAYMENT_MODE={PAYMENT_MODE}
          navigate={navigate}
        />
      </div>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Check className="h-4 w-4 text-[#14235E] mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function ElementsPaymentForm({
  plan,
  effectivePlan,
  onBack,
  onSuccess,
}: {
  plan: Plan;
  effectivePlan: ReturnType<typeof getEffectivePlan>;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();

  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState({ number: false, expiry: false, cvc: false });

  const handleSubscribe = async () => {
    if (!stripe || !elements) return;
    if (!cardholderName.trim()) {
      setPaymentError('Please enter cardholder name');
      return;
    }
    const cardNumberEl = elements.getElement(CardNumberElement);
    if (!cardNumberEl) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberEl,
        billing_details: { name: cardholderName, email: user?.email },
      });
      if (pmError) {
        setPaymentError(pmError.message || 'Card error');
        setIsProcessing(false);
        return;
      }

      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${apiBase}/api/v1/services/payments/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          lookupKey: effectivePlan.lookupKey,
          paymentMethodId: paymentMethod.id,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setPaymentError(data.message || 'Subscription failed');
        setIsProcessing(false);
        return;
      }

      if (data.clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);
        if (confirmError) {
          setPaymentError(confirmError.message || 'Payment confirmation failed');
          setIsProcessing(false);
          return;
        }
      }

      try {
        await fetch(
          `${apiBase}/api/v1/services/payments/subscriptions/${data.subscriptionId}/sync`,
          { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        console.warn('Sync failed (webhook should still handle it):', e);
      }

      toast.success('You are now subscribed!');
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setPaymentError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '15px',
        color: isDark ? '#ffffff' : '#000000',
        fontFamily: 'inherit',
        '::placeholder': { color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' },
        iconColor: '#14235E',
      },
      invalid: { color: '#ff6b6b', iconColor: '#ff6b6b' },
    },
  };

  const allFieldsValid =
    cardComplete.number && cardComplete.expiry && cardComplete.cvc && cardholderName.trim().length > 0;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 bg-white dark:bg-black transition-colors duration-300 overflow-x-hidden">
      <button
        onClick={onBack}
        className="text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Change plan
      </button>

      <div>
        <h2 className="text-2xl font-light flex items-center gap-2 text-black dark:text-white">
          <Lock className="h-5 w-5 text-[#14235E]" />
          Complete subscription
        </h2>
        <p className="text-black/50 dark:text-white/50 mt-1 text-sm font-light">
          You'll be charged AED {effectivePlan.amount} now, then every {plan.intervalLabel}.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-[#0c0c0c] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-light text-black dark:text-white">Tammat {plan.label}</p>
            <p className="text-xs text-black/40 dark:text-white/40 font-light">Billed every {plan.intervalLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-light text-black dark:text-white">AED {effectivePlan.amount}</p>
            {effectivePlan.isOffer && (
              <Badge className="bg-[#14235E]/15 text-[#14235E] border-[#14235E]/30 text-xs mt-1 font-light">
                Eid offer
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="card-name" className="text-black/70 dark:text-white/70 font-light">Cardholder Name</Label>
          <Input
            id="card-name"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Name on card"
            className="h-11 rounded-xl bg-zinc-100/50 dark:bg-black border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/30 focus-visible:ring-[#14235E] font-light"
            autoComplete="cc-name"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-black/70 dark:text-white/70 font-light">Card Number</Label>
          <div className="flex items-center h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-black focus-within:ring-2 focus-within:ring-[#14235E] transition-shadow">
            <CreditCard className="h-4 w-4 text-black/40 dark:text-white/40 mr-2 shrink-0" />
            <div className="flex-1">
              <CardNumberElement
                options={{ ...cardElementOptions, showIcon: false, placeholder: '1234 1234 1234 1234' }}
                onChange={(e) => setCardComplete((p) => ({ ...p, number: e.complete }))}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-black/70 dark:text-white/70 font-light">Expiry</Label>
            <div className="flex items-center h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-black focus-within:ring-2 focus-within:ring-[#14235E] transition-shadow">
              <div className="flex-1">
                <CardExpiryElement
                  options={{ ...cardElementOptions, placeholder: 'MM / YY' }}
                  onChange={(e) => setCardComplete((p) => ({ ...p, expiry: e.complete }))}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-black/70 dark:text-white/70 font-light">CVC</Label>
            <div className="flex items-center h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-black focus-within:ring-2 focus-within:ring-[#14235E] transition-shadow">
              <div className="flex-1">
                <CardCvcElement
                  options={{ ...cardElementOptions, placeholder: 'CVC' }}
                  onChange={(e) => setCardComplete((p) => ({ ...p, cvc: e.complete }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {paymentError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-500 font-light"
          >
            {paymentError}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={handleSubscribe}
        disabled={!stripe || isProcessing || !allFieldsValid}
        size="lg"
        className="w-full gap-2 rounded-2xl bg-[#14235E] text-white font-light hover:brightness-110 shadow-lg shadow-[#14235E]/20 transition-shadow"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Subscribe — AED {effectivePlan.amount}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-3 pt-2 text-xs text-black/40 dark:text-white/40 font-light">
        <div className="flex items-center gap-1.5">
          <Lock className="h-3 w-3" />SSL
        </div>
        <div className="h-3 w-px bg-black/15 dark:bg-zinc-800" />
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3" />PCI-DSS
        </div>
        <div className="h-3 w-px bg-black/15 dark:bg-zinc-800" />
        <span>Powered by Stripe</span>
      </div>
    </div>
  );
}

function ManageSubscriptionView({
  subscription,
  onManageBilling,
  isRedirecting,
}: {
  subscription: any;
  onManageBilling: () => void;
  isRedirecting: boolean;
}) {
  const intervalLabel =
    subscription.intervalCount === 2 && subscription.interval === 'year'
      ? '2 years'
      : subscription.interval;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-white dark:bg-black transition-colors duration-300 overflow-x-hidden">
      <div>
        <h2 className="text-2xl font-light flex items-center gap-2 text-black dark:text-white">
          <Crown className="h-6 w-6 text-[#14235E]" />
          Your Subscription
        </h2>
        <p className="text-black/50 dark:text-white/50 mt-1 font-light">Manage your Tammat membership</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-[#0c0c0c] p-6 space-y-4">
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm text-black/50 dark:text-white/50 font-light">Current plan</p>
            <p className="text-2xl font-light mt-0.5 text-black dark:text-white">{subscription.productName}</p>
          </div>
          {subscription.cancelAtPeriodEnd ? (
            <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 font-light">
              Canceling
            </Badge>
          ) : (
            <Badge className="bg-[#14235E]/15 text-[#14235E] border-[#14235E]/30 font-light">
              Active
            </Badge>
          )}
        </div>

        <div className="relative pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-black/50 dark:text-white/50 font-light">Amount</span>
            <span className="font-light text-black dark:text-white">
              AED {(subscription.amount / 100).toFixed(0)} / {intervalLabel}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/50 dark:text-white/50 font-light">
              {subscription.cancelAtPeriodEnd ? 'Ends on' : 'Renews on'}
            </span>
            <span className="font-light text-black dark:text-white">
              {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {subscription.cancelAtPeriodEnd && (
          <div className="relative flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-600 font-light">
              Your subscription will remain active until{' '}
              {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString('en-GB')}, after
              which it will not renew.
            </p>
          </div>
        )}
      </div>

      <Button
        size="lg"
        onClick={onManageBilling}
        disabled={isRedirecting}
        className="w-full gap-2 rounded-2xl bg-[#14235E] text-white font-light hover:brightness-110 shadow-lg shadow-[#14235E]/20"
      >
        {isRedirecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening billing portal…
          </>
        ) : (
          <>
            Manage Billing & Payment Methods
            <ExternalLink className="h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-xs text-black/35 dark:text-white/30 text-center font-light">
        Update payment method, change plan, download invoices, cancel — all in Stripe.
      </p>
    </div>
  );
}

export default SubscriptionPage;