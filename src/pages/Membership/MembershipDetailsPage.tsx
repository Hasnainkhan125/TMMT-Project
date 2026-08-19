// src/pages/Membership/MembershipDetailsPage.tsx

"use client";

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Crown,
  Check,
  Zap,
  Gem,
  Shield,
  Clock,
  FileText,
  Headphones,
  Info,
  Star,
  Rocket,
  Briefcase,
  Heart,
  Car,
  IdCard,
  Building2,
  Globe,
  MessageSquare,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Layers,
  TrendingUp,
  Zap as ZapIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PLANS, getEffectivePlan, getPerMonthAmount, isEidOfferActive, getTranslatedPlans, type Plan } from '@/lib/plans';
import { cn } from '@/lib/utils';

// ─── Feature Icons Map ──────────────────────────────────────────────────────
const featureIcons: Record<string, any> = {
  'Personal Case Reviews': Layers,
  'Status Checks': Shield,
  'AI Level': Sparkles,
  'Priority': ZapIcon,
  'Discount': TrendingUp,
  'AI Assistant': MessageSquare,
  'Expert Support': Headphones,
  'Document Review': FileText,
  'Smart Renewal Reminders': Clock,
  'Application Tracking': Rocket,
  'Email Support': MessageSquare,
  'Phone Support': Headphones,
  'Knowledge Base': Globe,
  'Priority Application Assistance': Rocket,
  'Comprehensive Document Review': FileText,
  '24/7 Priority Support': Headphones,
  'Business Planning Assistance': Briefcase,
  'Family Planning Assistance': Heart,
};

const planIcons: Record<string, any> = {
  monthly: Zap,
  yearly: Crown,
  twoyear: Gem,
};

// ─── Small building blocks ──────────────────────────────────────────────────

/** Counts up from 0 to `value` once per mount/key change. */
function AnimatedPrice({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 600;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display}</>;
}

export function MembershipDetailsPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const isArabic = language === 'ar';

  const translatedPlans = getTranslatedPlans(language);
  const selectedPlan = translatedPlans.find((p) => p.id === planId) || translatedPlans[1];
  const eidActive = isEidOfferActive();

  // Sticky mobile subscribe bar — appears once the hero has scrolled past,
  // so the primary action stays reachable on long comparison pages.
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ─── All benefits for comparison - FIXED ──────────────────────────────────
  const allBenefits = [
    {
      id: 'personalCaseReviews',
      label: isArabic ? 'مراجعات الحالة الشخصية' : 'Personal Case Reviews',
      getValue: (plan: Plan) => {
        if (plan.id === 'monthly') return '3 / month';
        if (plan.id === 'yearly') return '4 / month';
        if (plan.id === 'twoyear') return '5 / month';
        return '—';
      }
    },
    {
      id: 'statusChecks',
      label: isArabic ? 'فحوصات الحالة شهرياً' : 'Status Checks / month',
      getValue: (plan: Plan) => plan.planDetails?.questionsPerMonth || '—'
    },
    {
      id: 'aiLevel',
      label: isArabic ? 'مستوى الذكاء الاصطناعي' : 'AI Level',
      getValue: (plan: Plan) => plan.planDetails?.aiLevel || '—'
    },
    {
      id: 'priority',
      label: isArabic ? 'أولوية الخدمة' : 'Service Priority',
      getValue: (plan: Plan) => {
        if (plan.id === 'twoyear') return isArabic ? 'أولوية قصوى' : 'Highest Priority';
        if (plan.id === 'yearly') return isArabic ? 'أولوية عالية' : 'High Priority';
        return isArabic ? 'أولوية قياسية' : 'Standard Priority';
      }
    },
    {
      id: 'discount',
      label: isArabic ? 'خصم إضافي' : 'Additional Discount',
      getValue: (plan: Plan) => plan.planDetails?.discountRate || '—'
    },
    {
      id: 'aiAssistant',
      label: isArabic ? 'مساعد ذكاء اصطناعي' : 'AI Assistant',
      getValue: (plan: Plan) => plan.aiCapabilities || '—'
    },
    {
      id: 'expertSupport',
      label: isArabic ? 'دعم خبراء' : 'Expert Support',
      getValue: (plan: Plan) => {
        if (plan.id === 'twoyear') return isArabic ? 'دعم ممتاز (استخدام عادل)' : 'Premium Support (Fair Usage)';
        if (plan.id === 'yearly') return isArabic ? 'دعم متقدم (استخدام عادل)' : 'Advanced Support (Fair Usage)';
        return isArabic ? 'دعم أساسي (استخدام عادل)' : 'Basic Support (Fair Usage)';
      }
    },
    {
      id: 'documentReview',
      label: isArabic ? 'مراجعة المستندات' : 'Document Review',
      getValue: (plan: Plan) => {
        if (plan.id === 'twoyear') return isArabic ? 'مراجعة شاملة' : 'Comprehensive Review';
        if (plan.id === 'yearly') return isArabic ? 'مراجعة المستندات' : 'Document Review';
        return '—';
      }
    },
    {
      id: 'renewalReminders',
      label: isArabic ? 'تذكيرات التجديد' : 'Renewal Reminders',
      getValue: (plan: Plan) => {
        if (plan.id === 'twoyear') return isArabic ? 'تذكيرات ذكية + توصيات مخصصة' : 'Smart Alerts + Personalized Recommendations';
        if (plan.id === 'yearly') return isArabic ? 'تذكيرات ذكية + توصيات مخصصة' : 'Smart Alerts + Personalized Recommendations';
        return isArabic ? 'تذكيرات ذكية' : 'Smart Reminders';
      }
    },
    {
      id: 'appTracking',
      label: isArabic ? 'تتبع الطلبات' : 'Application Tracking',
      getValue: (plan: Plan) => '✅'
    },
  ];

  // ─── Included services per plan ─────────────────────────────────────────────
  const allServices = [
    { icon: IdCard, label: 'Emirates ID' },
    { icon: FileText, label: 'Visa' },
    { icon: Globe, label: 'Passport' },
    { icon: Car, label: 'Driving License' },
    { icon: Heart, label: 'Family Services' },
    { icon: Building2, label: 'Business Services' },
    { icon: Briefcase, label: 'Work Permits' },
    { icon: Shield, label: 'Government Checks' },
  ];

  const handleSubscribe = (plan: Plan) => {
    navigate('/subscription');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const PlanIcon = planIcons[selectedPlan.id] || Crown;
  const selectedEffective = getEffectivePlan(selectedPlan);

  return (
    <div className="min-h-screen bg-[#FFF] dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-6 md:py-8 lg:py-10 pb-24 lg:pb-10">

        {/* ─── Back Button ──────────────────────────────────────────────────── */}
        <button
          onClick={() => navigate('/subscription')}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors mb-4 sm:mb-6 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-light">{isArabic ? 'العودة إلى الاشتراكات' : 'Back to Subscriptions'}</span>
        </button>

        {/* ─── Hero Header — dossier cover: solid border, seal icon, mono eyebrow ──── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8 sm:mb-10 md:mb-12 overflow-hidden rounded-3xl sm:rounded-4xl border-2 border-solid border-[#0A3269]/20 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-5 sm:p-8 md:p-10 lg:p-12"
        >

          <div
            className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(10,50,105,0.5) 1px, transparent 0)',
              backgroundSize: '26px 26px',
            }}
          />


          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-5 lg:gap-6">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 w-full lg:w-auto">
              <div className={cn(
                'flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full border-2 border-solid transition-all duration-300 hover:scale-105',
                selectedPlan.popular
                  ? 'border-[#0A3269] bg-[#0A3269]/8'
                  : 'border-black/15 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.02]'
              )}>
                <PlanIcon className={cn(
                  'h-7 w-7 sm:h-9 sm:w-9 transition-all duration-300',
                  selectedPlan.popular ? 'text-[#0A3269]' : 'text-black/60 dark:text-white/60'
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <span className=" text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A3269]/60 dark:text-white/40">
                  {isArabic ? 'خطة العضوية' : 'Membership Plan'}
                </span>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-black dark:text-white tracking-tight">
                    {selectedPlan.label}
                  </h1>
                  {selectedPlan.popular && (
                    <Badge className="bg-[#0A3269] text-white border-0 px-3 sm:px-4 py-1 text-[10px] sm:text-xs rounded-full">
                      <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 fill-current" />
                      {isArabic ? 'الأكثر شعبية' : 'Most Popular'}
                    </Badge>
                  )}
                </div>
                <p className="text-sm sm:text-base text-black/60 dark:text-white/60 font-light mt-1 max-w-2xl">
                  {selectedPlan.headline}
                </p>
              </div>
            </div>

            {/* Right: Subscribe Button */}
            <Button
              onClick={() => handleSubscribe(selectedPlan)}
              className={cn(
                'w-full sm:w-auto rounded-full px-6 sm:px-8 md:px-10 py-5 sm:py-6 text-sm sm:text-base font-light gap-2 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] relative overflow-hidden group/hero',
                'bg-[#0A3269] text-white hover:bg-[#0A3269] shadow-lg hover:shadow-xl shadow-[#0A3269]/20'
              )}
            >
              <span className="absolute inset-0 -translate-x-full group-hover/hero:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative z-10 flex items-center gap-2">
                {isArabic ? 'اشترك الآن' : 'Subscribe Now'}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/hero:translate-x-1" />
              </span>
            </Button>
          </div>
        </motion.div>

        {/* ─── Price Summary — ticket stub ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8 sm:mb-10 md:mb-12 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#0A3269]/12 dark:border-white/10 bg-white dark:bg-white/[0.02]"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
              <span className=" text-[10px] sm:text-xs uppercase tracking-wider text-black/40 dark:text-white/40">
                {isArabic ? 'السعر' : 'Price'}
              </span>
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black dark:text-white tracking-tight tabular-nums">
                AED <AnimatedPrice value={selectedEffective.amount} />
              </span>
              <span className="text-xs sm:text-sm text-black/40 dark:text-white/40 font-light">
                /{selectedPlan.intervalLabel}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {selectedEffective.isOffer && (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-light">
                  {isArabic ? 'عرض العيد - وفر' : 'Eid Offer - Save'} AED {selectedEffective.savings}
                </Badge>
              )}
              {selectedPlan.interval !== 'month' && (
                <span className=" text-xs sm:text-sm text-[#0A3269]">
                  ≈ AED {getPerMonthAmount(selectedPlan)}/month
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─── Key Features Grid — stamp cards ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-8 sm:mb-10 md:mb-12"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
            <h2 className="text-lg sm:text-xl font-light text-black dark:text-white flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-[#0A3269]/10">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A3269]" />
              </div>
              {isArabic ? 'الميزات الرئيسية' : 'Key Features'}
            </h2>
            <Badge variant="outline" className="text-[9px] sm:text-[10px] font-medium border-solid border-[#0A3269]/40 text-[#0A3269] rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 bg-[#0A3269]/5">
              {selectedPlan.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {allBenefits.slice(0, 5).map((benefit, idx) => {
              const value = benefit.getValue(selectedPlan);
              const Icon = featureIcons[benefit.id] || FileText;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className={cn(
                    'group relative p-3 sm:p-4 rounded-xl border-2 border-solid text-center transition-all duration-300',
                    selectedPlan.popular
                      ? 'border-[#0A3269]/30 bg-[#0A3269]/[0.04] dark:bg-[#0A3269]/10'
                      : 'border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/30 hover:border-black/25 dark:hover:border-white/25'
                  )}
                >
                  <div className="relative z-10">
                    <div className={cn(
                      'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full mx-auto mb-1.5 sm:mb-2 transition-all duration-300',
                      selectedPlan.popular
                        ? 'bg-[#0A3269]/10 group-hover:bg-[#0A3269]'
                        : 'bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10'
                    )}>
                      <Icon className={cn(
                        'h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300',
                        selectedPlan.popular
                          ? 'text-[#0A3269] group-hover:text-white'
                          : 'text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white'
                      )} />
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-black/50 dark:text-white/50 font-light truncate">
                      {benefit.label}
                    </p>
                    <p className=" text-xs sm:text-sm text-black dark:text-white mt-0.5 sm:mt-1">
                      {value}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-4 sm:mt-5 border-t border-solid border-[#0A3269]/20"
          />
        </motion.div>

        {/* ─── Full Comparison Table — ledger styling ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 sm:mb-10 md:mb-12"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-5 md:mb-6 gap-2">
            <h2 className="text-lg sm:text-xl font-light text-black dark:text-white flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-[#0A3269]/10">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A3269]" />
              </div>
              {isArabic ? 'مقارنة الخطط' : 'Plan Comparison'}
            </h2>
            <Badge variant="outline" className=" text-[9px] sm:text-[10px] font-medium border-solid border-[#0A3269]/40 text-[#0A3269] rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 bg-[#0A3269]/5">
              {isArabic ? 'جميع الميزات مضمنة' : 'All features included'}
            </Badge>
          </div>

          <div className="w-full overflow-x-auto rounded-xl sm:rounded-2xl border border-[#0A3269]/10 dark:border-white/5 bg-white/60 dark:bg-black/30 backdrop-blur-sm">
            <table className="w-full sm:min-w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-solid border-[#0A3269]/15 dark:border-white/10 bg-[#0A3269]/5">
                  <th className="p-2 sm:p-3 md:p-4 text-left font-medium text-black/50 dark:text-white/50 text-[8px] sm:text-[10px] uppercase tracking-wider sticky left-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-10 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]">
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <span className="w-1 h-4 rounded-full bg-[#0A3269]" />
                      {isArabic ? 'الميزة' : 'Feature'}
                    </span>
                  </th>
                  {translatedPlans.map((plan) => (
                    <th
                      key={plan.id}
                      className={cn(
                        'p-2 sm:p-3 md:p-4 text-center font-light text-[8px] sm:text-xs transition-all duration-300 min-w-[60px] sm:min-w-[80px] md:min-w-[100px] relative',
                        plan.id === selectedPlan.id
                          ? 'bg-[#0A3269]/8 text-[#0A3269]'
                          : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                      )}
                    >
                      {plan.id === selectedPlan.id && (
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-[#0A3269]" />
                      )}
                      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                        <span className="font-light text-[9px] sm:text-xs md:text-sm text-black dark:text-white">
                          {plan.label}
                        </span>
                        {plan.popular && (
                          <Badge className="bg-[#0A3269] text-white text-[6px] sm:text-[8px] px-1.5 sm:px-2 py-0.5 rounded-full font-light">
                            ★ {isArabic ? 'الأفضل' : 'Best'}
                          </Badge>
                        )}
                        <span className=" text-[7px] sm:text-[10px] text-black/40 dark:text-white/40">
                          AED {getEffectivePlan(plan).amount}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allBenefits.map((benefit, idx) => {
                  const Icon = featureIcons[benefit.id] || FileText;
                  return (
                    <motion.tr
                      key={benefit.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * idx, duration: 0.3 }}
                      className={cn(
                        'border-b border-solid border-[#0A3269]/10 dark:border-white/10 last:border-0 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5',
                        idx % 2 === 0 ? 'bg-black/[0.015] dark:bg-white/[0.02]' : '',
                        (benefit.id === 'personalCaseReviews' || benefit.id === 'statusChecks') &&
                          'bg-[#0A3269]/5'
                      )}
                    >
                      <td className="p-2 sm:p-3 md:p-4 text-black/70 dark:text-white/70 font-light text-[8px] sm:text-[11px] md:text-xs flex items-center gap-1.5 sm:gap-2 sticky left-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-10">
                        <div className="p-1 rounded-md bg-[#0A3269]/10">
                          <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#0A3269]" />
                        </div>
                        <span className="font-light whitespace-nowrap">{benefit.label}</span>
                      </td>
                      {translatedPlans.map((plan) => {
                        const value = benefit.getValue(plan);
                        const isSelected = plan.id === selectedPlan.id;
                        return (
                          <td
                            key={plan.id}
                            className={cn(
                              'p-2 sm:p-3 md:p-4 text-center text-[8px] sm:text-[11px] md:text-xs transition-all duration-300 ',
                              isSelected
                                ? 'text-[#0A3269] font-medium bg-[#0A3269]/5'
                                : 'text-black/60 dark:text-white/60 font-light'
                            )}
                          >
                            {value === '✅' ? (
                              <div className="flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-emerald-500" strokeWidth={2.5} />
                              </div>
                            ) : value === '—' ? (
                              <span className="text-black/20 dark:text-white/20">—</span>
                            ) : (
                              <span className="text-[7px] sm:text-[11px] md:text-xs">{value}</span>
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-3 border-t border-solid border-[#0A3269]/20"
          />
        </motion.div>

        {/* ─── Included Services ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8 sm:mb-10 md:mb-12"
        >
          <h2 className="text-lg sm:text-xl font-light text-black dark:text-white mb-4 sm:mb-5 md:mb-6 flex items-center gap-2">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A3269]" />
            {isArabic ? 'الخدمات المشمولة' : 'Included Services'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {allServices.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * idx }}
                className={cn(
                  'flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-solid transition-all hover:shadow-sm',
                  selectedPlan.popular
                    ? 'border-[#0A3269]/30 bg-[#0A3269]/5'
                    : 'border-black/10 dark:border-white/10 bg-white dark:bg-black/30'
                )}
              >
                <service.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0A3269]" />
                <span className="text-[10px] sm:text-xs text-black/70 dark:text-white/70 font-light">{service.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── Service Request Note ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mb-8 sm:mb-10 md:mb-12 p-4 sm:p-5 rounded-xl border border-solid border-[#0A3269]/25 bg-[#0A3269]/5"
        >
          <div className="flex items-start gap-2.5 sm:gap-3">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A3269] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-light text-black dark:text-white">
                {isArabic ? 'ما هي مراجعات الحالة الشخصية؟' : 'What are Personal Case Reviews?'}
              </p>
              <p className="text-[10px] sm:text-xs text-black/60 dark:text-white/60 mt-0.5 leading-relaxed max-w-3xl font-light">
                {isArabic
                  ? 'مراجعة الحالة الشخصية تتضمن خدمة TMMT كاملة، مثل الهوية الإماراتية، التأشيرة، جواز السفر، رخصة القيادة، الخدمات العائلية، الخدمات التجارية، خدمات المركبات، أو أي خدمة حكومية إماراتية مدعومة.'
                  : 'A Personal Case Review includes one complete TMMT service, such as Emirates ID, Visa, Passport, Driving License, Family Services, Business Services, Vehicle Services, or any supported UAE government service.'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── Plan Cards — popular plan sealed solid, others solid ───────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
            <h2 className="text-lg sm:text-xl font-light text-black dark:text-white flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-xl bg-[#0A3269]/10">
                <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-[#0A3269]" />
              </div>
              {isArabic ? 'اختر خطتك' : 'Choose Your Plan'}
            </h2>
            <Badge
              variant="outline"
              className=" text-[8px] sm:text-[10px] font-medium border-solid border-[#0A3269]/40 text-[#0A3269] rounded-full px-2 sm:px-3 py-0.5 bg-[#0A3269]/5"
            >
              {translatedPlans.length} {isArabic ? 'خطط' : 'Plans'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {translatedPlans.map((plan) => {
              const eff = getEffectivePlan(plan);
              const isSelected = plan.id === selectedPlan.id;
              const isPopular = plan.popular;
              const PlanIcon = planIcons[plan.id] || Crown;

              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    'group relative flex flex-col rounded-3xl border-2 p-6 transition-all duration-300 bg-white dark:bg-black/40 backdrop-blur-sm',
                    isPopular
                      ? 'border-[#0A3269] shadow-[0_8px_30px_-8px_rgba(10,50,105,0.15)]'
                      : 'border-solid border-black/15 dark:border-white/15 hover:border-black/30 dark:hover:border-white/30',
                    isSelected && !isPopular && 'ring-2 ring-[#0A3269]/60 border-transparent'
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-[#0A3269] text-white px-4 py-1.5 rounded-full text-[10px] font-semibold shadow-lg shadow-[#0A3269]/20">
                        <Star className="h-3 w-3 mr-1.5 fill-current" />
                        {isArabic ? 'الأكثر شعبية' : 'Most Popular'}
                      </Badge>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-solid transition-all duration-300 group-hover:scale-105',
                      isPopular
                        ? 'border-[#0A3269] bg-[#0A3269]/8'
                        : 'border-black/15 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.02] group-hover:bg-black/5 dark:group-hover:bg-white/5'
                    )}>
                      <PlanIcon className={cn(
                        'h-5 w-5 transition-all duration-300',
                        isPopular
                          ? 'text-[#0A3269]'
                          : 'text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white'
                      )} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black dark:text-white">{plan.label}</h3>
                      {plan.popular && (
                        <p className=" text-[10px] text-[#0A3269]">
                          {isArabic ? 'الأفضل قيمة' : 'Best Value'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-4xl font-bold text-black dark:text-white tracking-tight tabular-nums"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        AED <AnimatedPrice value={eff.amount} />
                      </span>
                      <span className="text-sm font-light text-black/40 dark:text-white/40">
                        /{plan.intervalLabel}
                      </span>
                    </div>
                    {eff.isOffer && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] mt-1 rounded-full px-3 py-0.5 font-medium">
                        {isArabic ? 'وفر' : 'Save'} AED {eff.savings}
                      </Badge>
                    )}
                    {plan.interval !== 'month' && (
                      <p className=" text-xs text-[#0A3269] mt-1">
                        ≈ AED {getPerMonthAmount(plan)}/month
                      </p>
                    )}
                  </div>

                  {/* Dashed divider before feature list */}
                  <div className="border-t border-solid border-black/10 dark:border-white/10 mb-4" />

                  {/* Features List */}
                  <ul className="space-y-3 flex-1 mb-6">
                    {plan.bullets?.map((bullet: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-black/80 dark:text-white/80 group/item transition-all duration-200 hover:translate-x-1">
                        <div className={cn(
                          'p-0.5 rounded-full mt-0.5 shrink-0 transition-all duration-300',
                          isPopular
                            ? 'bg-[#0A3269] group-hover/item:scale-110'
                            : 'bg-black/30 dark:bg-white/30 group-hover/item:bg-black/50 dark:group-hover/item:bg-white/50'
                        )}>
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                        <span className="font-light leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Subscribe Button */}
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    className={cn(
                      'w-full rounded-full text-sm font-medium py-5 sm:py-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group/btn',
                      isPopular
                        ? 'bg-[#0A3269] text-white hover:bg-[#1A4A8A] shadow-lg shadow-[#0A3269]/20'
                        : 'bg-white text-[#0A3269] border border-[#0A3269]/20 hover:border-[#0A3269]/40'
                    )}
                  >
                    <span className={cn(
                      'absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent to-transparent',
                      isPopular ? 'via-white/20' : 'via-[#0A3269]/10'
                    )} />
                    <span className="relative flex items-center gap-2">
                      {isArabic ? 'اشترك الآن' : 'Subscribe Now'}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </span>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-6 sm:mt-8 border-t border-solid border-[#0A3269]/20"
          />
        </motion.div>
      </div>

      {/* ─── Sticky Mobile Subscribe Bar ──────────────────────────────────── */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden fixed bottom-0 inset-x-0 z-50 p-3 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t-2 border-solid border-[#0A3269]/20 dark:border-white/10"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className=" text-[10px] text-black/50 dark:text-white/50 truncate">{selectedPlan.label}</p>
                <p className="text-base font-medium text-black dark:text-white tabular-nums">
                  AED {selectedEffective.amount}
                  <span className="text-black/40 dark:text-white/40 font-light text-xs"> /{selectedPlan.intervalLabel}</span>
                </p>
              </div>
              <Button
                onClick={() => handleSubscribe(selectedPlan)}
                className="rounded-full px-6 py-5 text-sm font-medium bg-[#0A3269] text-white hover:bg-[#0A3269]/90 shrink-0"
              >
                {isArabic ? 'اشترك' : 'Subscribe'}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MembershipDetailsPage;