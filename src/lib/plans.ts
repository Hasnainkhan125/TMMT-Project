// src/lib/plans.ts
// Single source of truth — used by both pricing page and checkout

export interface Plan {
  id: string;
  lookupKey: string;
  label: string;
  amount: number;
  interval: 'month' | 'year' | '2year';
  intervalLabel: string;
  popular?: boolean;
  headline: string;
  bullets: string[];
  eidOffer?: {
    lookupKey: string;
    amount: number;
    savings: number;
  };
  // Membership details
  serviceLimits: string;
  questionLimits: string;
  aiCapabilities: string;
  responsePriority: string; // Now "Priority Service"
  discounts: string;
  additionalBenefits: string[];
  planDetails: {
    serviceLimit: string;
    questionsPerMonth: string;
    aiLevel: string;
    priority: string; // Now "Priority Service"
    discountRate: string;
    bestFor: string;
  };
  // Service Request Note
  serviceRequestNote: string;
}

// ─── Service Request Note (English & Arabic) ──────────────────────────────
export const SERVICE_REQUEST_NOTE = {
  en: 'A Personal Case Review includes one complete TMMT service, such as Emirates ID, Visa, Passport, Driving License, Family Services, Business Services, Vehicle Services, or any supported UAE government service.',
  ar: 'مراجعة حالة شخصية واحدة تشمل خدمة TMMT كاملة، مثل الهوية الإماراتية، التأشيرة، جواز السفر، رخصة القيادة، الخدمات العائلية، الخدمات التجارية، خدمات المركبات، أو أي خدمة حكومية إماراتية مدعومة.'
};

// ─── Arabic translations for all plan data ──────────────────────────────────
export const ARABIC_PLANS = {
  monthly: {
    label: 'شهري',
    headline: 'عضوية TMMT الأساسية',
    bullets: [
      '3 مراجعات حالة شخصية شهرياً (كل مراجعة يمكن أن تكون لأي خدمة TMMT)',
      '3 فحوصات حالة حكومية مجانية شهرياً',
      'مساعد ذكاء اصطناعي',
      'دعم خبراء (استخدام عادل)',
      'تذكيرات تجديد ذكية',
      'تتبع الطلبات',
      'خصم 30% على رسوم خدمات TMMT الإضافية'
    ],
    serviceLimits: '3 مراجعات حالة شخصية شهرياً',
    questionLimits: '3 فحوصات حالة حكومية مجانية شهرياً',
    aiCapabilities: 'مساعد ذكاء اصطناعي أساسي للإرشاد',
    responsePriority: 'خدمة ذات أولوية',
    discounts: 'خصم 30% على رسوم خدمات TMMT الإضافية',
    additionalBenefits: [
      'تذكيرات تجديد ذكية',
      'تتبع الطلبات',
      'دعم عبر البريد الإلكتروني',
      'الوصول إلى قاعدة المعرفة'
    ],
    planDetails: {
      serviceLimit: '3 مراجعات / شهر',
      questionsPerMonth: '3 فحوصات / شهر',
      aiLevel: 'مساعد ذكاء اصطناعي أساسي',
      priority: 'خدمة ذات أولوية',
      discountRate: '30%',
      bestFor: 'الأفراد ذوي الاحتياجات الحكومية المتفرقة'
    }
  },
  yearly: {
    label: 'سنة واحدة',
    headline: 'عضوية TMMT المتقدمة',
    bullets: [
      'كل ما في الشهري، بالإضافة إلى:',
      '4 مراجعات حالة شخصية شهرياً',
      '4 فحوصات حالة حكومية مجانية شهرياً',
      'مساعد ذكاء اصطناعي متقدم',
      'دعم خبراء (استخدام عادل)',
      'مراجعة المستندات',
      'خصم 40% على رسوم خدمات TMMT الإضافية'
    ],
    serviceLimits: '4 مراجعات حالة شخصية شهرياً',
    questionLimits: '4 فحوصات حالة حكومية مجانية شهرياً',
    aiCapabilities: 'مساعد ذكاء اصطناعي متقدم مع تحليل الحالات',
    responsePriority: 'خدمة ذات أولوية عالية',
    discounts: 'خصم 40% على رسوم خدمات TMMT الإضافية',
    additionalBenefits: [
      'مراجعة المستندات',
      'تذكيرات تجديد ذكية مع توصيات مخصصة',
      'دعم عبر البريد الإلكتروني والهاتف بأولوية',
      'الوصول إلى قاعدة المعرفة المميزة'
    ],
    eidOffer: {
      lookupKey: 'tammat_yearly_eid',
      amount: 99,
      savings: 50,
    },
    planDetails: {
      serviceLimit: '4 مراجعات / شهر',
      questionsPerMonth: '4 فحوصات / شهر',
      aiLevel: 'مساعد ذكاء اصطناعي متقدم',
      priority: 'خدمة ذات أولوية عالية',
      discountRate: '40%',
      bestFor: 'المستخدمون المتكررون الذين يحتاجون إلى دعم حكومي موثوق'
    }
  },
  twoyear: {
    label: 'سنتين',
    headline: 'عضوية TMMT المميزة',
    bullets: [
      'كل ما في السنوي، بالإضافة إلى:',
      '5 مراجعات حالة شخصية شهرياً',
      '5 فحوصات حالة حكومية مجانية شهرياً',
      'مساعد ذكاء اصطناعي ممتاز',
      'دعم خبراء (استخدام عادل)',
      'مساعدة في تقديم الطلبات بأولوية',
      'خصم 50% على رسوم خدمات TMMT الإضافية'
    ],
    serviceLimits: '5 مراجعات حالة شخصية شهرياً',
    questionLimits: '5 فحوصات حالة حكومية مجانية شهرياً',
    aiCapabilities: 'مساعد ذكاء اصطناعي ممتاز مع تحليل شامل',
    responsePriority: 'خدمة ذات أولوية قصوى',
    discounts: 'خصم 50% على رسوم خدمات TMMT الإضافية',
    additionalBenefits: [
      'مساعدة في تقديم الطلبات بأولوية',
      'مراجعة شاملة للمستندات',
      'دعم على مدار الساعة طوال أيام الأسبوع',
      'الوصول إلى قاعدة المعرفة المميزة',
      'مساعدة في تخطيط الأعمال والعائلة'
    ],
    eidOffer: {
      lookupKey: 'tammat_2year_eid',
      amount: 149,
      savings: 50,
    },
    planDetails: {
      serviceLimit: '5 مراجعات / شهر',
      questionsPerMonth: '5 فحوصات / شهر',
      aiLevel: 'مساعد ذكاء اصطناعي ممتاز',
      priority: 'خدمة ذات أولوية قصوى',
      discountRate: '50%',
      bestFor: 'الشركات والمستخدمون المتكررون الذين يحتاجون إلى دعم ممتاز'
    }
  }
};

// ─── Helper to get Arabic plan data ──────────────────────────────────────────
export const getArabicPlan = (planId: string) => {
  const arabicData: Record<string, any> = {
    monthly: ARABIC_PLANS.monthly,
    yearly: ARABIC_PLANS.yearly,
    twoyear: ARABIC_PLANS.twoyear
  };
  return arabicData[planId] || ARABIC_PLANS.monthly;
};

// ─── Helper to get translated plan data based on language ────────────────────
export const getTranslatedPlanData = (plan: Plan, language: string = 'en') => {
  if (language === 'ar') {
    const arabicData = getArabicPlan(plan.id);
    return {
      ...plan,
      label: arabicData.label,
      headline: arabicData.headline,
      bullets: arabicData.bullets,
      serviceLimits: arabicData.serviceLimits,
      questionLimits: arabicData.questionLimits,
      aiCapabilities: arabicData.aiCapabilities,
      responsePriority: arabicData.responsePriority,
      discounts: arabicData.discounts,
      additionalBenefits: arabicData.additionalBenefits,
      planDetails: arabicData.planDetails
    };
  }
  return plan;
};

// ─── Helper to translate all plans ──────────────────────────────────────────
export const getTranslatedPlans = (language: string = 'en'): Plan[] => {
  return PLANS.map(plan => getTranslatedPlanData(plan, language));
};

// ─── Helper to get translated Service Request Note ──────────────────────────
export const getServiceRequestNote = (language: string = 'en'): string => {
  return language === 'ar' ? SERVICE_REQUEST_NOTE.ar : SERVICE_REQUEST_NOTE.en;
};

// Eid offer cutoff
export const EID_OFFER_END = new Date('2026-05-29T23:59:59+04:00');
export const isEidOfferActive = () => new Date() < EID_OFFER_END;

export const PLANS: Plan[] = [
  {
    id: 'monthly',
    lookupKey: 'tammat_monthly',
    label: 'Monthly',
    amount: 30,
    interval: 'month',
    intervalLabel: 'month',
    headline: 'Essential TMMT Membership',
    bullets: [
      '3 Personal Case Reviews per month (Any TMMT service)',
      '3 Free Government Status Checks per month',
      'AI Assistant',
      'Expert Support (Fair Usage)',
      'Smart Renewal Reminders',
      'Application Tracking',
      '30% off TMMT fee'
    ],
    serviceLimits: '3 Personal Case Reviews per month',
    questionLimits: '3 Free Government Status Checks per month',
    aiCapabilities: 'Basic AI Assistant for guidance',
    responsePriority: 'Priority Service',
    discounts: '30% off TMMT fee',
    additionalBenefits: [
      'Smart renewal reminders',
      'Application tracking',
      'Email support',
      'Access to knowledge base'
    ],
    planDetails: {
      serviceLimit: '3 reviews / month',
      questionsPerMonth: '3 checks / month',
      aiLevel: 'Basic AI Assistant',
      priority: 'Priority Service',
      discountRate: '30%',
      bestFor: 'Individuals with occasional government needs'
    },
    serviceRequestNote: SERVICE_REQUEST_NOTE.en
  },
  {
    id: 'yearly',
    lookupKey: 'tammat_yearly',
    label: '1 Year',
    amount: 149,
    interval: 'year',
    intervalLabel: 'year',
    popular: true,
    headline: 'Advanced TMMT Membership',
    bullets: [
      'Everything in Monthly, plus:',
      '4 Personal Case Reviews per month',
      '4 Free Government Status Checks per month',
      'Advanced AI Assistant',
      'Expert Support (Fair Usage)',
      'Document Review',
      '40% off TMMT fee'
    ],
    serviceLimits: '4 Personal Case Reviews per month',
    questionLimits: '4 Free Government Status Checks per month',
    aiCapabilities: 'Advanced AI Assistant with case analysis',
    responsePriority: 'High Priority Service',
    discounts: '40% off TMMT fee',
    additionalBenefits: [
      'Document review',
      'Smart renewal alerts with personalized recommendations',
      'Priority email & phone support',
      'Access to premium knowledge base'
    ],
    eidOffer: {
      lookupKey: 'tammat_yearly_eid',
      amount: 99,
      savings: 50,
    },
    planDetails: {
      serviceLimit: '4 reviews / month',
      questionsPerMonth: '4 checks / month',
      aiLevel: 'Advanced AI Assistant',
      priority: 'High Priority Service',
      discountRate: '40%',
      bestFor: 'Frequent users needing reliable government support'
    },
    serviceRequestNote: SERVICE_REQUEST_NOTE.en
  },
  {
    id: 'twoyear',
    lookupKey: 'tammat_2year',
    label: '2 Years',
    amount: 199,
    interval: '2year',
    intervalLabel: '2 years',
    headline: 'Premium TMMT Membership',
    bullets: [
      'Everything in the 1-Year plan, plus:',
      '5 Personal Case Reviews per month',
      '5 Free Government Status Checks per month',
      'Premium AI Assistant',
      'Expert Support (Fair Usage)',
      'Priority Application Assistance',
      '50% off TMMT fee'
    ],
    serviceLimits: '5 Personal Case Reviews per month',
    questionLimits: '5 Free Government Status Checks per month',
    aiCapabilities: 'Premium AI Assistant with comprehensive analysis',
    responsePriority: 'Highest Priority Service',
    discounts: '50% off TMMT fee',
    additionalBenefits: [
      'Priority application assistance',
      'Comprehensive document review',
      '24/7 priority support',
      'Premium knowledge base access',
      'Business and family planning assistance'
    ],
    eidOffer: {
      lookupKey: 'tammat_2year_eid',
      amount: 149,
      savings: 50,
    },
    planDetails: {
      serviceLimit: '5 reviews / month',
      questionsPerMonth: '5 checks / month',
      aiLevel: 'Premium AI Assistant',
      priority: 'Highest Priority Service',
      discountRate: '50%',
      bestFor: 'Businesses and frequent users needing premium support'
    },
    serviceRequestNote: SERVICE_REQUEST_NOTE.en
  }
];

// Effective price for a plan (Eid price if offer active, else regular)
export function getEffectivePlan(plan: Plan) {
  if (plan.eidOffer && isEidOfferActive()) {
    return {
      lookupKey: plan.eidOffer.lookupKey,
      amount: plan.eidOffer.amount,
      regularAmount: plan.amount,
      savings: plan.eidOffer.savings,
      isOffer: true,
    };
  }
  return {
    lookupKey: plan.lookupKey,
    amount: plan.amount,
    regularAmount: plan.amount,
    savings: 0,
    isOffer: false,
  };
}

// Per-month equivalent
export function getPerMonthAmount(plan: Plan): number {
  const eff = getEffectivePlan(plan);
  if (plan.interval === 'month') return eff.amount;
  if (plan.interval === 'year') return Math.round((eff.amount / 12) * 10) / 10;
  if (plan.interval === '2year') return Math.round((eff.amount / 24) * 10) / 10;
  return eff.amount;
}