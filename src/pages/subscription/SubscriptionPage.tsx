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
          <span className="text-[#0A3269] dark:text-[#4A8ABF] font-normal">
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
            className="group relative rounded-xl sm:rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/50 p-3 sm:p-4 md:p-5 text-center hover:border-[#0A3269]/40 dark:hover:border-[#4A8ABF]/40 hover:shadow-xl hover:shadow-[#0A3269]/8 dark:hover:shadow-[#4A8ABF]/8 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0A3269] dark:bg-[#4A8ABF] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="p-2 sm:p-3 rounded-xl bg-[#0A3269]/10 dark:bg-[#4A8ABF]/10 w-fit mx-auto mb-2 sm:mb-3 group-hover:bg-[#0A3269] dark:group-hover:bg-[#4A8ABF] transition-all duration-300">
              <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#0A3269] dark:text-[#4A8ABF] group-hover:text-white dark:group-hover:text-black transition-colors duration-300" strokeWidth={1.75} />
            </div>
            <h4 className="font-normal text-black dark:text-white text-sm sm:text-base md:text-lg group-hover:text-[#0A3269] dark:group-hover:text-[#4A8ABF] transition-colors duration-300">
              {benefit.title}
            </h4>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-white/40 mt-1 leading-relaxed font-light">
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
  <div className="relative rounded-xl border border-amber-500/30 dark:border-amber-500/20 bg-white/50 dark:bg-black/40 backdrop-blur-sm p-3 sm:p-4 transition-all duration-300 group hover:shadow-sm hover:shadow-amber-500/5">
    <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3">
      {/* Icon */}
      <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/15 border border-amber-500/15 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
        <Award className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-light text-black dark:text-white text-sm sm:text-base flex flex-wrap items-center gap-1.5 sm:gap-2">
          {isArabic ? 'الضمان الذهبي من TMMT' : 'TMMT Golden Guarantee'}
          <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-0 text-[7px] sm:text-[8px] px-1.5 sm:px-2 py-0.5 rounded-full font-light">
            ✓ Trusted
          </Badge>
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
          className="inline-flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-light transition-all duration-300 group/link hover:gap-1.5"
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
            <span className="text-[#0A3269] dark:text-[#4A8ABF] font-normal">بعد اشتراكك</span>
          </>
        ) : (
          <>
            How Works After
            <br />
            <span className="text-[#0A3269] dark:text-[#4A8ABF] font-normal">subscription</span>
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
            className="group relative text-center p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-[#4A8ABF]/5 border border-black/5 dark:border-[#4A8ABF]/20 hover:border-[#0A3269]/30 dark:hover:border-[#4A8ABF]/40 hover:shadow-md transition-all duration-300"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#0A3269] dark:bg-[#4A8ABF] rounded-full group-hover:w-8 transition-all duration-500" />
            
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-[#0A3269]/10 dark:bg-[#4A8ABF]/20 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-[#0A3269] dark:group-hover:bg-[#4A8ABF] transition-all duration-300">
                  <step.icon 
                    className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#0A3269] dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300" 
                    strokeWidth={1.75} 
                  />
                </div>
                
                {/* Connecting Line - Modern */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 left-full w-[calc(100%+0.5rem)] h-px bg-gradient-to-r from-[#0A3269]/20 to-transparent dark:from-[#4A8ABF]/20 -translate-y-1/2" />
                )}
                
                {/* Step Number - Modern */}
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#0A3269] dark:bg-[#4A8ABF] text-white dark:text-black text-[7px] sm:text-[9px] font-medium flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  {idx + 1}
                </div>
              </div>
              
              <span className="text-[9px] sm:text-xs md:text-sm font-light text-black dark:text-white/80 max-w-[70px] sm:max-w-[100px] text-center leading-tight group-hover:text-[#0A3269] dark:group-hover:text-[#4A8ABF] transition-colors duration-300">
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
      className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-5"
    >
      {trustItems.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-white/50">
          <div className="p-1 sm:p-1.5 rounded-lg bg-[#0A3269]/10 dark:bg-[#4A8ABF]/10">
            <item.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-[#0A3269] dark:text-[#4A8ABF]" strokeWidth={1.75} />
          </div>
          <span className="font-light text-[8px] sm:text-[10px] md:text-xs">{item.label}</span>
        </div>
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
          className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto"
        >
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
                <span className="relative text-[#0A3269] dark:text-[#4A8ABF] font-normal" style={{ fontSize: 'clamp(1.2rem, 2.8vw, 2.2rem)' }}>
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
                <span className="relative text-[#0A3269] dark:text-[#4A8ABF] font-normal">
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
            className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#0A3269]/30 dark:border-[#4A8ABF]/20 bg-[#0A3269]/5 dark:bg-[#4A8ABF]/5 max-w-3xl mx-auto"
          >
            <div className="relative p-3 sm:p-4 md:p-5 flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="hidden md:flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-[#0A3269]/20 dark:bg-[#4A8ABF]/20 border border-[#0A3269]/30 dark:border-[#4A8ABF]/30">
                <Gift className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#0A3269] dark:text-[#4A8ABF]" strokeWidth={1.5} />
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
                  'border bg-white dark:bg-black',
                  'h-auto min-h-[520px] md:min-h-[560px]',
                  isPopular
                    ? [
                        'border-[#0A3269]/60 dark:border-[#4A8ABF]/40',
                        'shadow-[0_24px_60px_-16px_rgba(10,50,105,0.12)] dark:shadow-[0_24px_60px_-16px_rgba(0,0,0,0.5)]',
                        'md:-translate-y-3 z-10',
                        'min-h-[540px] md:min-h-[590px]',
                      ]
                    : [
                        'border-black/10 dark:border-white/10',
                        'hover:border-black/20 dark:hover:border-white/20',
                      ],
                  isSelected && !isPopular && 'ring-2 ring-[#0A3269]/60 dark:ring-[#4A8ABF]/50 border-transparent'
                )}
              >
                <div className="flex flex-wrap items-center justify-center gap-1 absolute -top-3.5 left-1/2 -translate-x-1/2">
                  {isPopular && (
                    <span className="flex items-center gap-1 rounded-full bg-[#0A3269] dark:bg-[#4A8ABF] px-3.5 py-1.5 text-[10px] font-light uppercase tracking-wider text-white dark:text-black">
                      <Star className="h-2.5 w-2.5" strokeWidth={3} />
                      Most popular
                    </span>
                  )}
                </div>

                <div className="relative flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                      isPopular
                        ? 'bg-[#0A3269]/15 dark:bg-[#4A8ABF]/15 border-[#0A3269]/30 dark:border-[#4A8ABF]/30'
                        : 'bg-black/[0.04] dark:bg-white/[0.06] border-black/10 dark:border-white/10'
                    )}
                  >
                    <PlanIcon
                      className={cn('h-5 w-5', isPopular ? 'text-[#0A3269] dark:text-[#4A8ABF]' : 'text-black/55 dark:text-white/55')}
                      strokeWidth={1.75}
                    />
                  </div>
                  <h3
                    className="text-xl md:text-[22px] font-light text-black dark:text-white leading-tight"
                    style={{ fontFamily: "'Inter', sans-serif" }}
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
                    <span className="inline-block mt-2 text-[10px] font-light px-1.5 py-0.5 rounded-full bg-[#0A3269]/15 dark:bg-[#4A8ABF]/15 text-[#0A3269] dark:text-[#4A8ABF] border border-[#0A3269]/30 dark:border-[#4A8ABF]/30 tracking-wide">
                      SAVE {eff.savings}
                    </span>
                  )}

                  {plan.interval !== 'month' && (
                    <p className="text-xs mt-2 font-light text-[#0A3269] dark:text-[#4A8ABF]">
                      ≈ AED {perMonth}/month
                      {savingsPercentage && savingsPercentage > 0 && (
                        <span className="ml-1 text-[10px] font-light bg-[#0A3269] dark:bg-[#4A8ABF] px-1.5 py-0.5 rounded-full text-white dark:text-black">
                          Save {savingsPercentage}%
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="relative flex items-center gap-3 my-3">
                  <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                  <span className="text-[10px] font-light uppercase tracking-widest text-black/35 dark:text-white/30">
                    What's included
                  </span>
                  <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                </div>

                <ul className="relative space-y-3 flex-1">
                  <li className="flex items-start gap-2.5 text-[13px]">
                    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-[1px]', isPopular ? 'bg-[#0A3269] dark:bg-[#4A8ABF]' : 'bg-black/[0.06] dark:bg-white/[0.08]')}>
                      <Check className={cn('h-3 w-3', isPopular ? 'text-white dark:text-black' : 'text-black/45 dark:text-white/45')} strokeWidth={3} />
                    </span>
                    <span className="text-black/75 dark:text-white/70 leading-snug pt-[1px] font-light">
                      {plan.planDetails.serviceLimit} Service Requests
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[13px]">
                    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-[1px]', isPopular ? 'bg-[#0A3269] dark:bg-[#4A8ABF]' : 'bg-black/[0.06] dark:bg-white/[0.08]')}>
                      <Check className={cn('h-3 w-3', isPopular ? 'text-white dark:text-black' : 'text-black/45 dark:text-white/45')} strokeWidth={3} />
                    </span>
                    <span className="text-black/75 dark:text-white/70 leading-snug pt-[1px] font-light">
                      {plan.planDetails.questionsPerMonth} Status Checks
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[13px]">
                    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-[1px]', isPopular ? 'bg-[#0A3269] dark:bg-[#4A8ABF]' : 'bg-black/[0.06] dark:bg-white/[0.08]')}>
                      <Check className={cn('h-3 w-3', isPopular ? 'text-white dark:text-black' : 'text-black/45 dark:text-white/45')} strokeWidth={3} />
                    </span>
                    <span className="text-black/75 dark:text-white/70 leading-snug pt-[1px] font-light">
                      {plan.planDetails.aiLevel} AI Level
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[13px]">
                    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-[1px]', isPopular ? 'bg-[#0A3269] dark:bg-[#4A8ABF]' : 'bg-black/[0.06] dark:bg-white/[0.08]')}>
                      <Check className={cn('h-3 w-3', isPopular ? 'text-white dark:text-black' : 'text-black/45 dark:text-white/45')} strokeWidth={3} />
                    </span>
                    <span className="text-black/75 dark:text-white/70 leading-snug pt-[1px] font-light">
                      {plan.planDetails.discountRate} Discount
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[13px]">
                    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-[1px]', isPopular ? 'bg-[#0A3269] dark:bg-[#4A8ABF]' : 'bg-black/[0.06] dark:bg-white/[0.08]')}>
                      <Check className={cn('h-3 w-3', isPopular ? 'text-white dark:text-black' : 'text-black/45 dark:text-white/45')} strokeWidth={3} />
                    </span>
                    <span className="text-black/75 dark:text-white/70 leading-snug pt-[1px] font-light">
                      {plan.planDetails.priority} Priority
                    </span>
                  </li>
                </ul>

                <div className="mt-3 mb-2">
                  <p className="text-[10px] text-gray-400 dark:text-white/30 uppercase tracking-wider mb-1.5 font-light">Services included</p>
                  <div className="flex flex-wrap gap-1">
                    {serviceExamples.slice(0, isMonthly ? 3 : 5).map((service, i) => (
                      <span key={i} className="flex items-center gap-0.5 text-[10px] bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full font-light">
                        <service.icon className="h-2.5 w-2.5 text-[#0A3269] dark:text-[#4A8ABF]" strokeWidth={1.5} />
                        <span className="text-black/70 dark:text-white/60">{service.label}</span>
                      </span>
                    ))}
                    {!isMonthly && (
                      <span className="text-[10px] text-[#0A3269] dark:text-[#4A8ABF] font-light">+ more</span>
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
                  className="mt-2 text-xs font-light text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 self-start group"
                >
                  View Full Details
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>

                <div
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan);
                    handleSubscribe();
                  }}
                  className={cn(
                    'relative mt-5 flex items-center justify-center gap-2 h-12 rounded-full text-sm font-light',
                    'transition-all duration-300 cursor-pointer select-none overflow-hidden group/btn',
                    isPopular
                      ? 'bg-[#0A3269] dark:bg-[#4A8ABF] text-white dark:text-black shadow-[0_8px_25px_-6px_rgba(10,50,105,0.55)] dark:shadow-[0_8px_25px_-6px_rgba(74,138,191,0.55)] hover:shadow-[0_10px_32px_-6px_rgba(10,50,105,0.7)] dark:hover:shadow-[0_10px_32px_-6px_rgba(74,138,191,0.7)] hover:-translate-y-0.5'
                      : 'bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-black/85 dark:hover:bg-white/90'
                  )}
                >
                  <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <span className="relative flex items-center gap-2">
                    {isPopular ? 'Get Started' : isMonthly ? 'Subscribe Now' : 'Start Your Membership'}
                    <ArrowRight className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
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
          <div className="relative rounded-lg sm:rounded-xl border border-[#0A3269]/20 dark:border-[#4A8ABF]/20 bg-[#0A3269]/5 dark:bg-[#4A8ABF]/5 p-2.5 sm:p-3 md:p-4">
            <div className="flex items-start gap-2">
              <div className="p-0.5 sm:p-1 rounded-full bg-[#0A3269]/10 dark:bg-[#4A8ABF]/10 mt-0.5 flex-shrink-0">
                <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#0A3269] dark:text-[#4A8ABF]" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] md:text-xs font-light text-black dark:text-white">
                  {language === 'ar' ? 'ما هي طلبات الخدمة؟' : 'What is a Service Request?'}
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
  className="mt-6 sm:mt-8 relative overflow-hidden rounded-xl bg-white/70 dark:bg-black/40 backdrop-blur-sm p-4 sm:p-6 lg:p-8 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all duration-500 group"
>
  {/* ─── Subtle Background Decorations (reduced size) ────────────────── */}
  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-amber-400/5 dark:bg-amber-500/3 blur-2xl group-hover:bg-amber-400/8 transition-all duration-700" />
  <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-orange-400/5 dark:bg-orange-500/3 blur-2xl group-hover:bg-orange-400/8 transition-all duration-700" />

  <div className="relative">
    {/* ─── Header Row ───────────────────────────────────────────────────── */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
      <div className="flex items-center gap-3">
        <div className="relative p-2 rounded-lg bg-amber-400/10 dark:bg-amber-500/10 border border-amber-200/20 dark:border-amber-400/10">
          <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 dark:text-amber-400" strokeWidth={1.75} />
        </div>
        <div>
          <h4 className="text-base sm:text-xl font-light text-black dark:text-white">
            {isArabic ? 'الأعضاء المؤسسون' : 'Founding Members'}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-light tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/10 px-2 py-0.5 rounded-full">
              <span className="relative flex h-1 w-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-1 w-1 bg-amber-500" />
              </span>
              {isArabic ? 'وقت محدود' : 'Limited Time'}
            </span>
            <span className="text-[8px] sm:text-[10px] font-light text-amber-500/60 dark:text-amber-400/50">
              {isArabic ? '• عرض حصري' : '• Exclusive'}
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={(e) => {
          e.stopPropagation();
          navigate('/subscription');
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        }}
        className="group/btn relative overflow-hidden bg-amber-500 hover:bg-amber-600 dark:bg-amber-500/80 dark:hover:bg-amber-600/80 text-white rounded-full px-4 sm:px-6 py-1.5 sm:py-2.5 text-[10px] sm:text-sm font-light transition-all duration-300 hover:scale-[1.02]"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
        <span className="relative flex items-center gap-1.5">
          {isArabic ? 'اكتشف المزايا' : 'Discover Benefits'}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </span>
      </Button>
    </div>

    {/* ─── Description ──────────────────────────────────────────────────── */}
    <p className="text-[11px] sm:text-sm text-black/60 dark:text-white/50 max-w-3xl leading-relaxed mt-2 sm:mt-3 font-light">
      {isArabic 
        ? 'انضم إلى النخبة الأولى من الأعضاء المؤسسين واستمتع بمزايا حصرية لا تتوفر للآخرين. كن جزءاً من تاريخ TMMT من البداية.'
        : 'Join the founding members and enjoy exclusive benefits. Be part of TMMT\'s history from the start.'
      }
    </p>

    {/* ─── Benefits Grid ────────────────────────────────────────────────── */}
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
          className="group/item relative overflow-hidden rounded-lg bg-white/50 dark:bg-black/30 border border-black/5 dark:border-white/5 p-3 sm:p-4 hover:border-amber-200/30 dark:hover:border-amber-400/10 transition-all duration-300 hover:shadow-sm hover:shadow-amber-500/5"
        >
          <div className="absolute -top-10 -right-10 w-16 h-16 rounded-full bg-amber-400/5 blur-xl group-hover/item:bg-amber-400/10 transition-all duration-500" />
          <div className="relative flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 group-hover/item:bg-amber-500/20 dark:group-hover/item:bg-amber-400/20 transition-colors duration-300">
              <item.icon className="w-4 h-4 text-amber-500 dark:text-amber-400" strokeWidth={1.75} />
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

    {/* ─── Urgency Banner ────────────────────────────────────────────────── */}
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mt-3 sm:mt-4 relative overflow-hidden rounded-lg bg-amber-500/5 dark:bg-amber-400/5 border border-amber-200/20 dark:border-amber-400/10 p-2 sm:p-3"
    >
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 dark:text-amber-400 text-sm font-light">⚡</span>
          <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400/80 font-light text-center sm:text-left">
            {isArabic 
              ? 'عضوية المؤسسين محدودة — انضم الآن قبل إغلاق التسجيل.'
              : 'Founding membership is limited — join now before enrollment closes.'
            }
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-px h-3 bg-black/10 dark:bg-white/10" />
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
    "h-11 sm:h-14",
    "w-full sm:w-auto min-w-[230px] sm:min-w-[340px] px-4 sm:px-10 rounded-full", // ← changed px-6 to px-4 on mobile and w-full
    "text-[12px] sm:text-[15px] font-medium",
    "transition-all duration-300 cursor-pointer select-none",
    "bg-[#0A3269] dark:bg-black",
    "border border-[#0A3269]/20 dark:border-[#4A4A4A]",
    "text-white",
    "hover:shadow-lg hover:shadow-[#0A3269]/25 dark:hover:shadow-black/50",
    "hover:border-[#0A3269]/40 dark:hover:border-[#6A6A6A]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "overflow-hidden"
  )}
>
  {/* Auto Shimmer Effect - Always running */}
  <motion.span 
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
    animate={{ 
      x: ['-100%', '100%'] 
    }}
    transition={{ 
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
      repeatDelay: 1
    }}
  />
  
  {/* Auto Pulse Glow Effect */}
  <motion.span 
    className="absolute inset-0 rounded-full bg-white/5 blur-xl"
    animate={{ 
      opacity: [0.3, 0.6, 0.3]
    }}
    transition={{ 
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />

  {isRedirecting ? (
    <span className="relative z-10 flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin text-white" />
      <span className="text-sm text-white">Loading...</span>
    </span>
  ) : (
    <motion.span 
      className="relative z-10 flex items-center gap-2 sm:gap-2.5"
      animate={{ 
        scale: [1, 1.02, 1]
      }}
      transition={{ 
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
        repeatDelay: 0.5
      }}
    >
      <span className="text-[11px] sm:text-base text-white">
        {language === 'ar' ? 'ابدأ عضويتك' : 'Start Your Membership'}
      </span>
      
      <motion.span 
        className="flex items-center rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] bg-white/20 text-white"
        animate={{ 
          scale: [1, 1.08, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1
        }}
      >
        AED {effectivePlan.amount}
      </motion.span>
      
      {/* Arrow */}
      <motion.div
        className="flex items-center justify-center rounded-full bg-[#0A3269] dark:bg-[#4A8ABF] w-6 h-6 sm:w-7 sm:h-7"
        animate={{ 
          x: [0, 4, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.5
        }}
      >
        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white dark:text-black" />
      </motion.div>
    </motion.span>
  )}
</motion.button>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-2">
            <div className="flex flex-col items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04]">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0A3269] dark:text-[#4A8ABF]" />
              <span className="text-[6px] sm:text-[8px] md:text-[10px] text-center text-black/70 dark:text-white/70 leading-tight font-light">PCI-DSS Secure</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04]">
              <LockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0A3269] dark:text-[#4A8ABF]" />
              <span className="text-[6px] sm:text-[8px] md:text-[10px] text-center text-black/70 dark:text-white/70 leading-tight font-light">256-bit Encryption</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04]">
              <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0A3269] dark:text-[#4A8ABF]" />
              <span className="text-[6px] sm:text-[8px] md:text-[10px] text-center text-black/70 dark:text-white/70 leading-tight font-light">Cancel Anytime</span>
            </div>
          </div>

          <TrustSection />

          <div className="relative mt-2 overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 max-w-2xl mx-auto w-full">
            <div className="relative flex flex-col items-center text-center gap-0.5 sm:gap-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.15em] font-light text-black/40 dark:text-white/40">Powered by</span>
                <span className="text-[10px] sm:text-xs md:text-sm font-light text-black dark:text-white">TMMT</span>
              </div>
              <p className="max-w-lg text-[8px] sm:text-[10px] md:text-[11px] leading-4 sm:leading-5 text-black/50 dark:text-white/45 font-light">
                <span className="font-normal">7-day refund guarantee</span> when no service has been used
                <span className="mx-1.5 sm:mx-2 text-[#0A3269] dark:text-[#4A8ABF]">•</span>
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
        style={{ '--primary': '#0A3269' } as React.CSSProperties}
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
      style={{ '--primary': '#0A3269' } as React.CSSProperties}
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
      <div className="flex items-center justify-center py-24 bg-white dark:bg-black text-black/50 dark:text-white/50 gap-2 transition-colors duration-300">
        <Loader2 className="h-5 w-5 animate-spin text-[#0A3269] dark:text-[#4A8ABF]" />
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
      <Check className="h-4 w-4 text-[#0A3269] dark:text-[#4A8ABF] mt-0.5 shrink-0" />
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
        iconColor: '#0A3269',
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
          <Lock className="h-5 w-5 text-[#0A3269] dark:text-[#4A8ABF]" />
          Complete subscription
        </h2>
        <p className="text-black/50 dark:text-white/50 mt-1 text-sm font-light">
          You'll be charged AED {effectivePlan.amount} now, then every {plan.intervalLabel}.
        </p>
      </div>

      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-light text-black dark:text-white">Tammat {plan.label}</p>
            <p className="text-xs text-black/40 dark:text-white/40 font-light">Billed every {plan.intervalLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-light text-black dark:text-white">AED {effectivePlan.amount}</p>
            {effectivePlan.isOffer && (
              <Badge className="bg-[#0A3269]/15 dark:bg-[#4A8ABF]/15 text-[#0A3269] dark:text-[#4A8ABF] border-[#0A3269]/30 dark:border-[#4A8ABF]/30 text-xs mt-1 font-light">
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
            className="h-11 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus-visible:ring-[#0A3269] dark:focus-visible:ring-[#4A8ABF] font-light"
            autoComplete="cc-name"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-black/70 dark:text-white/70 font-light">Card Number</Label>
          <div className="flex items-center h-11 px-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] focus-within:ring-2 focus-within:ring-[#0A3269] dark:focus-within:ring-[#4A8ABF] transition-shadow">
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
            <div className="flex items-center h-11 px-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] focus-within:ring-2 focus-within:ring-[#0A3269] dark:focus-within:ring-[#4A8ABF] transition-shadow">
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
            <div className="flex items-center h-11 px-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] focus-within:ring-2 focus-within:ring-[#0A3269] dark:focus-within:ring-[#4A8ABF] transition-shadow">
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
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-500 dark:text-red-400 font-light"
          >
            {paymentError}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={handleSubscribe}
        disabled={!stripe || isProcessing || !allFieldsValid}
        size="lg"
        className="w-full gap-2 rounded-2xl bg-[#0A3269] dark:bg-[#4A8ABF] text-white dark:text-black font-light hover:brightness-110 shadow-lg shadow-[#0A3269]/20 dark:shadow-[#4A8ABF]/20 transition-shadow"
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
        <div className="h-3 w-px bg-black/15 dark:bg-white/15" />
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3" />PCI-DSS
        </div>
        <div className="h-3 w-px bg-black/15 dark:bg-white/15" />
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
          <Crown className="h-6 w-6 text-[#0A3269] dark:text-[#4A8ABF]" />
          Your Subscription
        </h2>
        <p className="text-black/50 dark:text-white/50 mt-1 font-light">Manage your Tammat membership</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] p-6 space-y-4">
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm text-black/50 dark:text-white/50 font-light">Current plan</p>
            <p className="text-2xl font-light mt-0.5 text-black dark:text-white">{subscription.productName}</p>
          </div>
          {subscription.cancelAtPeriodEnd ? (
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-light">
              Canceling
            </Badge>
          ) : (
            <Badge className="bg-[#0A3269]/15 dark:bg-[#4A8ABF]/15 text-[#0A3269] dark:text-[#4A8ABF] border-[#0A3269]/30 dark:border-[#4A8ABF]/30 font-light">
              Active
            </Badge>
          )}
        </div>

        <div className="relative pt-4 border-t border-black/10 dark:border-white/10 space-y-2 text-sm">
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
            <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-600 dark:text-amber-300/90 font-light">
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
        className="w-full gap-2 rounded-2xl bg-[#0A3269] dark:bg-[#4A8ABF] text-white dark:text-black font-light hover:brightness-110 shadow-lg shadow-[#0A3269]/20 dark:shadow-[#4A8ABF]/20"
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