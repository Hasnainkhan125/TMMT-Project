// src/pages/LegalPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  FileText, 
  Lock, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Users,
  Clock,
  Globe,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Smartphone,
  Eye,
  FileCheck,
  Headphones,
  Server,
  Database,
  ShieldCheck,
  UserCheck,
  LogOut,
  Edit,
  Trash2,
  Bell,
  Cookie,
  MessageSquare,
  Info,
  BookOpen,
  Scale,
  Gavel,
  PenTool,
  Calendar,
  FileText as FileTextIcon,
  Home,
  ChevronRight,
  BadgeCheck,
  Verified,
  Trophy,
  Zap
} from 'lucide-react';

// ─── LIMITED TIME BADGE ──────────────────────────────────────────────────────
const LimitedTimeBadge = () => (
  <span className="inline-flex items-center gap-1.5 bg-[#0A3269] text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap">
    <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
    Limited Time
  </span>
);

const LegalPage = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const location = useLocation();
  
  // Determine which section to show based on URL hash
  const getInitialSection = () => {
    const hash = location.hash.replace('#', '');
    if (hash === 'privacy' || hash === 'privacy-policy') return 'privacy';
    if (hash === 'terms' || hash === 't&c') return 'terms';
    if (hash === 'refund') return 'refund';
    if (hash === 'disclaimer') return 'disclaimer';
    if (hash === 'guarantee') return 'guarantee';
    if (hash === 'ai') return 'ai';
    if (hash === 'cookie' || hash === 'cookies') return 'cookie';
    if (hash === 'complaints') return 'complaints';
    const path = location.pathname;
    if (path.includes('privacy')) return 'privacy';
    if (path.includes('terms') || path.includes('t&c')) return 'terms';
    if (path.includes('refund')) return 'refund';
    if (path.includes('disclaimer')) return 'disclaimer';
    if (path.includes('guarantee')) return 'guarantee';
    if (path.includes('ai')) return 'ai';
    if (path.includes('cookie')) return 'cookie';
    if (path.includes('complaints')) return 'complaints';
    return 'about';
  };

  const [activeSection, setActiveSection] = useState(getInitialSection);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      setActiveSection(getInitialSection());
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      setActiveSection('about');
    }
  }, [location]);

  const sections = [
    { id: 'about', label: isArabic ? 'عن TMMT' : 'About TMMT', icon: Shield },
    { id: 'terms', label: isArabic ? 'الشروط' : 'Terms', icon: FileText },
    { id: 'privacy', label: isArabic ? 'الخصوصية' : 'Privacy', icon: Lock },
    { id: 'refund', label: isArabic ? 'الاسترداد' : 'Refund', icon: RefreshCw },
    { id: 'guarantee', label: isArabic ? 'الضمان' : 'Guarantee', icon: Award },
    { id: 'ai', label: isArabic ? 'الذكاء الاصطناعي' : 'AI Policy', icon: MessageSquare },
    { id: 'cookie', label: isArabic ? 'الكوكيز' : 'Cookies', icon: Cookie },
    { id: 'complaints', label: isArabic ? 'الشكاوى' : 'Complaints', icon: Headphones },
    { id: 'disclaimer', label: isArabic ? 'إخلاء المسؤولية' : 'Disclaimer', icon: AlertCircle },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-black dark:via-[#0A0A0F] dark:to-black">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#0A3269]/5 dark:bg-[#0A3269]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#0A3269]/3 dark:bg-[#0A3269]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#0A3269]/3 dark:bg-[#0A3269]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-5xl">
        {/* Back Button */}
        <Link 
          to="/" 
          className="group inline-flex items-center gap-2.5 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-all duration-300 mb-8 sm:mb-10"
        >
          <div className="p-2 rounded-full bg-black/5 dark:bg-white/10 group-hover:bg-[#0A3269]/10 dark:group-hover:bg-[#0A3269]/20 transition-all duration-300">
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </div>
          <span className="text-sm font-medium">
            {isArabic ? 'العودة للرئيسية' : 'Back to Home'}
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="mb-10 sm:mb-12">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
          
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black dark:text-white leading-tight" style={{ fontWeight: 600 }}>
              {isArabic ? 'السياسات القانونية' : 'Legal Policies'}
            </h1>
            <p className="mt-3 text-black/50 dark:text-white/40 text-sm sm:text-base max-w-2xl">
              {isArabic 
                ? 'تعرف على سياساتنا القانونية وشروط الاستخدام وسياسة الخصوصية'
                : 'Learn about our legal policies, terms of use, and privacy practices'
              }
            </p>
          </div>

          {/* ─── MODERN NAVIGATION TABS ────────────────────────────────── */}
          <div className="relative mb-10 sm:mb-12">
            {/* Gradient fade on edges for scroll hint */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/80 to-transparent dark:from-black/80 pointer-events-none z-10 sm:hidden" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent dark:from-black/80 pointer-events-none z-10 sm:hidden" />
            
            <div className="overflow-x-auto scrollbar-hide pb-2">
              <div className="flex gap-1.5 sm:gap-2 min-w-max">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`
                        group relative flex items-center gap-2
                        px-4 sm:px-5 md:px-6
                        py-2.5 sm:py-3 md:py-3.5
                        rounded-xl sm:rounded-2xl
                        text-[12px] sm:text-sm font-medium
                        whitespace-nowrap
                        transition-all duration-300
                        ${isActive 
                          ? 'bg-[#0A3269] dark:bg-[#4A8ABF] text-white shadow-lg shadow-[#0A3269]/25 dark:shadow-[#4A8ABF]/30' 
                          : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                        }
                      `}
                    >
              
                      
                      <Icon 
                        className={`h-4 w-4 sm:h-4.5 sm:w-4.5 transition-colors duration-300 ${
                          isActive 
                            ? 'text-white' 
                            : 'text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white'
                        }`} 
                        strokeWidth={1.75} 
                      />
                      <span className={`transition-colors duration-300 ${
                        isActive 
                          ? 'text-white font-semibold' 
                          : 'text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white'
                      }`}>
                        {section.label}
                      </span>
                      
                      {/* Hover Underline */}
                      {!isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#0A3269] dark:bg-[#4A8ABF] rounded-full transition-all duration-300 group-hover:w-1/2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Bottom Border Line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-black/5 dark:bg-white/5 rounded-full" />
          </div>

          {/* ─── SECTION 1: ABOUT TMMT ────────────────────────────────── */}
          <section id="about" className="mb-12 sm:mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-[#0A3269]/10 dark:bg-[#0A3269]/20">
                <Shield className="h-5 w-5 text-[#0A3269]" strokeWidth={1.75} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white" style={{ fontWeight: 600 }}>
                {isArabic ? 'عن TMMT' : 'About TMMT'}
              </h2>
            </div>

            {/* License Badge - Government of Dubai */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/20 border-2 border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-black dark:text-white" style={{ fontWeight: 600 }}>
                      {isArabic ? 'حكومة دبي' : 'Government of Dubai'}
                    </h3>
                    <p className="text-sm text-black/60 dark:text-white/40">
                      {isArabic ? 'رخصة تاجر (مهنية)' : 'E Trader (Professional) License'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
                  <div>
                    <p className="text-xs text-black/40 dark:text-white/40">{isArabic ? 'رقم الرخصة' : 'License No.'}</p>
                    <p className="text-sm font-bold text-black dark:text-white">1356846</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Info Card */}
            <div className="bg-white/80 dark:bg-black/40 rounded-2xl p-6 sm:p-8 border border-black/10 dark:border-white/10 backdrop-blur-sm mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-black/40 dark:text-white/40">{isArabic ? 'الاسم الرسمي للشركة' : 'Official Company Name'}</p>
                  <p className="text-sm font-medium text-black dark:text-white">E.A.O FOR MARKETING SERVICES VIA SOCIAL MEDIA</p>
                </div>
                <div>
                  <p className="text-xs text-black/40 dark:text-white/40">{isArabic ? 'الاسم التجاري' : 'Trade Name'}</p>
                  <p className="text-sm font-medium text-black dark:text-white">TMMT</p>
                </div>
                <div>
                  <p className="text-xs text-black/40 dark:text-white/40">{isArabic ? 'رقم الرخصة التجارية' : 'Trade License Number'}</p>
                  <p className="text-sm font-medium text-black dark:text-white">1356846</p>
                </div>
                <div>
                  <p className="text-xs text-black/40 dark:text-white/40">{isArabic ? 'جهة الترخيص' : 'Licensing Authority'}</p>
                  <p className="text-sm font-medium text-black dark:text-white">{isArabic ? 'حكومة دبي' : 'Government of Dubai'}</p>
                </div>
                <div>
                  <p className="text-xs text-black/40 dark:text-white/40">{isArabic ? 'نوع الرخصة' : 'License Type'}</p>
                  <p className="text-sm font-medium text-black dark:text-white">E Trader (Professional) License</p>
                </div>
                <div>
                  <p className="text-xs text-black/40 dark:text-white/40">{isArabic ? 'البريد الإلكتروني للدعم' : 'Support Email'}</p>
                  <p className="text-sm font-medium text-[#0A3269] dark:text-[#4A8ABF]">support@tmmt.ae</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-black/70 dark:text-white/60">
              <p className="leading-relaxed text-sm sm:text-base bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                {isArabic 
                  ? 'TMMT هي منصة خاصة مستقلة تساعد المستخدمين في التنقل في الإجراءات الحكومية في الإمارات، بما في ذلك التأشيرات، بطاقة الهوية، الغرامات، تأسيس الأعمال، والإجراءات الرسمية الأخرى. نقدم إرشادات مدعومة بالذكاء الاصطناعي، ودعم الخبراء، وخدمات إعداد المستندات لجعل التعاملات الحكومية أكثر سلاسة وكفاءة.'
                  : 'TMMT is an independent private platform that helps users navigate UAE government procedures, including visas, Emirates ID, fines, business setup, and other official processes. We provide AI-powered guidance, expert support, and document preparation services to make government interactions smoother and more efficient.'
                }
              </p>
              <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <div>
                    <p className="font-semibold text-black dark:text-white text-sm sm:text-base">
                      {isArabic ? 'هام: TMMT ليست سلطة حكومية.' : 'Important: TMMT is not a government authority.'}
                    </p>
                    <p className="text-black/70 dark:text-white/60 text-sm sm:text-base leading-relaxed mt-1">
                      {isArabic 
                        ? 'نحن لا نمثل أو نتصرف نيابة عن أي جهة حكومية، وليس لدينا أي ارتباط بها. نحن مزود خدمة خاص يساعد المستخدمين في فهم وإكمال الإجراءات الحكومية. يتم تمرير جميع الرسوم الحكومية بتكلفتها، ونحن لا نؤثر على قرارات الحكومة ولا نضمنها.'
                        : 'We do not represent, act on behalf of, or have any affiliation with any government entity. We are a private service provider that assists users in understanding and completing government procedures. All government fees are passed through at cost, and we do not influence or guarantee government decisions.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── SECTION 2: TERMS & CONDITIONS ────────────────────────── */}
          <section id="terms" className="mb-12 sm:mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-[#0A3269]/10 dark:bg-[#0A3269]/20">
                <FileText className="h-5 w-5 text-[#0A3269]" strokeWidth={1.75} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white" style={{ fontWeight: 600 }}>
                {isArabic ? 'الشروط والأحكام' : 'Terms & Conditions'}
              </h2>
            </div>
            
            <div className="space-y-4 text-black/70 dark:text-white/60">
              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-2">
                  {isArabic ? 'قبول الشروط' : 'Acceptance of Terms'}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed">
                  {isArabic 
                    ? 'باستخدام خدمات TMMT، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق، يرجى عدم استخدام خدماتنا.'
                    : 'By using TMMT services, you agree to these Terms & Conditions. If you do not agree, please do not use our services.'
                  }
                </p>
              </div>

              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-2">
                  {isArabic ? 'وصف الخدمات' : 'Services Description'}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed">
                  {isArabic 
                    ? 'توفر TMMT مساعدة مدعومة بالذكاء الاصطناعي وخدمات كتابة للإجراءات الحكومية في الإمارات بما في ذلك طلبات التأشيرة، خدمات بطاقة الهوية، خدمات بطاقة العمل، إدارة الغرامات، خدمات النواكاس، وتقديم النماذج الحكومية.'
                    : 'TMMT provides AI-powered assistance and typing services for UAE government procedures including visa applications, Emirates ID services, labor card services, fines management, Nawakas services, and government form submission.'
                  }
                </p>
              </div>

              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-2">
                  {isArabic ? 'أهلية العميل' : 'Customer Eligibility'}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed">
                  {isArabic 
                    ? 'يجب أن يكون العملاء بعمر 18 سنة على الأقل وأن يكونوا قادرين قانونيًا على الدخول في اتفاقية. أي شخص يقدم معلومات عن شخص آخر يؤكد أن لديه السلطة القانونية للقيام بذلك.'
                    : 'Customers must be at least 18 years old and legally capable of entering into an agreement. Anyone submitting information for another person confirms they have the lawful authority to do so.'
                  }
                </p>
              </div>

              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-2">
                  {isArabic ? 'مسؤوليات العميل' : 'Customer Responsibilities'}
                </h3>
                <ul className="space-y-2 text-sm sm:text-base">
                  {[
                    isArabic ? 'تقديم معلومات دقيقة وكاملة' : 'Provide accurate and complete information',
                    isArabic ? 'تقديم مستندات أصلية وصالحة وقابلة للقراءة' : 'Submit genuine, valid, and readable documents',
                    isArabic ? 'مراجعة تفاصيل الطلب قبل التقديم' : 'Review application details before submission',
                    isArabic ? 'الرد على TMMT في وقت معقول' : 'Respond to TMMT within a reasonable time',
                    isArabic ? 'حضور المواعيد المطلوبة عند الاقتضاء' : 'Attend required appointments when applicable',
                    isArabic ? 'دفع جميع الرسوم الحكومية ورسوم الطرف الثالث' : 'Pay all government and third-party fees',
                    isArabic ? 'حماية تفاصيل حساب الدخول' : 'Protect account login details',
                    isArabic ? 'الامتثال لجميع قوانين ولوائح الإمارات' : 'Comply with all UAE laws and regulations'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-[#0A3269] shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-2">
                  {isArabic ? 'لا يوجد ضمان للموافقة الحكومية' : 'No Guarantee of Government Approval'}
                </h3>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-sm sm:text-base leading-relaxed">
                    {isArabic 
                      ? 'لا تصدر TMMT تأشيرات أو بطاقات هوية أو تراخيص أو تصاريح أو شهادات أو وثائق حكومية رسمية. لا تضمن TMMT قبول أي طلب حكومي. أي وقت معالجة مقدر هو تقدير فقط.'
                      : 'TMMT does not issue visas, Emirates IDs, licenses, permits, certificates, or official government documents. TMMT does not guarantee that any government request will be accepted. Any estimated processing time is an estimate only.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ─── SECTION 3: PRIVACY POLICY ────────────────────────────── */}
          <section id="privacy" className="mb-12 sm:mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-[#0A3269]/10 dark:bg-[#0A3269]/20">
                <Lock className="h-5 w-5 text-[#0A3269]" strokeWidth={1.75} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white" style={{ fontWeight: 600 }}>
                {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </h2>
            </div>
            
            <div className="space-y-4 text-black/70 dark:text-white/60">
              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-3">
                  {isArabic ? 'المعلومات التي نجمعها' : 'Information We Collect'}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed">
                  <strong>{isArabic ? 'المعلومات الشخصية:' : 'Personal Information:'}</strong>
                  {' '}
                  {isArabic 
                    ? 'الاسم، البريد الإلكتروني، رقم الهاتف، أرقام الهوية الحكومية، ومعلومات الدفع.'
                    : 'Name, email address, phone number, government ID numbers, and payment information.'
                  }
                </p>
                <p className="text-sm sm:text-base leading-relaxed mt-2">
                  <strong>{isArabic ? 'بيانات الاستخدام:' : 'Usage Data:'}</strong>
                  {' '}
                  {isArabic 
                    ? 'عنوان IP، معلومات الجهاز، نوع المتصفح، الصفحات التي تمت زيارتها، والتفاعل مع خدمات الذكاء الاصطناعي الخاصة بنا.'
                    : 'IP address, device information, browser type, pages visited, and interaction with our AI services.'
                  }
                </p>
                <p className="text-sm sm:text-base leading-relaxed mt-2">
                  <strong>{isArabic ? 'معلومات المستندات:' : 'Document Information:'}</strong>
                  {' '}
                  {isArabic 
                    ? 'جوازات السفر، بطاقة الهوية، التأشيرات، وثائق التوظيف، والمستندات الرسمية الأخرى التي تم تحميلها لطلبات الخدمة.'
                    : 'Passports, Emirates ID, visas, employment documents, and other official documents uploaded for service requests.'
                  }
                </p>
              </div>

              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-3">
                  {isArabic ? 'كيف نستخدم معلوماتك' : 'How We Use Your Information'}
                </h3>
                <ul className="space-y-2 text-sm sm:text-base">
                  {[
                    isArabic ? 'لتقديم خدماتنا الحكومية' : 'To provide our government services',
                    isArabic ? 'لمعالجة الطلبات والمستندات' : 'To process applications and documents',
                    isArabic ? 'للتواصل معك بشأن طلباتك' : 'To communicate with you about your requests',
                    isArabic ? 'لتحسين الذكاء الاصطناعي والخدمات' : 'To improve our AI and services',
                    isArabic ? 'للامتثال للمتطلبات القانونية والتنظيمية' : 'To comply with legal and regulatory requirements',
                    isArabic ? 'لمنع الاحتيال والحفاظ على الأمان' : 'To prevent fraud and maintain security'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-[#0A3269] shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-3">
                  {isArabic ? 'مشاركة المعلومات' : 'Information Sharing'}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed">
                  {isArabic 
                    ? 'TMMT لا تبيع أو تؤجر المعلومات الشخصية. قد تتم مشاركة المعلومات فقط عند الضرورة المعقولة مع:'
                    : 'TMMT does not sell or rent personal information. Information may be shared only where reasonably necessary with:'
                  }
                </p>
                <ul className="space-y-2 text-sm sm:text-base mt-3">
                  {[
                    isArabic ? 'السلطات الحكومية ذات الصلة' : 'Relevant government authorities',
                    isArabic ? 'مراكز الخدمة المعتمدة' : 'Authorized service centers',
                    isArabic ? 'مقدمي الدفع والبنوك' : 'Payment providers and banks',
                    isArabic ? 'مقدمي التكنولوجيا والاستضافة' : 'Technology and hosting providers',
                    isArabic ? 'موظفي TMMT المعتمدين' : 'Authorized TMMT employees',
                    isArabic ? 'المستشارين المهنيين' : 'Professional advisers',
                    isArabic ? 'المحاكم أو الجهات التنظيمية أو السلطات عند الاقتضاء القانوني' : 'Courts, regulators, or authorities where legally required'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-[#0A3269] shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-3">
                  {isArabic ? 'أمان البيانات' : 'Data Security'}
                </h3>
                <ul className="space-y-2 text-sm sm:text-base">
                  {[
                    isArabic ? 'تشفير 256 بت لجميع البيانات' : '256-bit encryption for all data',
                    isArabic ? 'امتثال PCI-DSS لمعالجة المدفوعات' : 'PCI-DSS compliant payment processing',
                    isArabic ? 'تدقيق أمني منتظم' : 'Regular security audits',
                    isArabic ? 'ضوابط الوصول والمصادقة' : 'Access controls and authentication',
                    isArabic ? 'المصادقة متعددة العوامل للمسؤولين' : 'Multi-factor authentication for administrators',
                    isArabic ? 'تخزين آمن للمستندات مع نسخ احتياطية' : 'Secure document storage with backups',
                    isArabic ? 'تسجيل خروج تلقائي لعدم النشاط' : 'Automated logout for inactivity'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <ShieldCheck className="h-4 w-4 text-[#0A3269] shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-3">
                  {isArabic ? 'حقوق الخصوصية الخاصة بك' : 'Your Privacy Rights'}
                </h3>
                <ul className="space-y-2 text-sm sm:text-base">
                  {[
                    isArabic ? 'طلب الوصول إلى معلوماتك الشخصية' : 'Request access to your personal information',
                    isArabic ? 'تصحيح المعلومات غير الدقيقة' : 'Correct inaccurate information',
                    isArabic ? 'طلب الحذف حيثما يسمح القانون' : 'Request deletion where legally permitted',
                    isArabic ? 'سحب موافقة التسويق' : 'Withdraw marketing consent',
                    isArabic ? 'الإبلاغ عن وصول غير مصرح به للحساب' : 'Report unauthorized account access',
                    isArabic ? 'تقديم شكوى' : 'Submit a complaint'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <UserCheck className="h-4 w-4 text-[#0A3269] shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ─── SECTION 4: REFUND POLICY ────────────────────────────── */}
          <section id="refund" className="mb-12 sm:mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-[#0A3269]/10 dark:bg-[#0A3269]/20">
                <RefreshCw className="h-5 w-5 text-[#0A3269]" strokeWidth={1.75} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white" style={{ fontWeight: 600 }}>
                {isArabic ? 'سياسة الاسترداد' : 'Refund Policy'}
              </h2>
            </div>
            
            <div className="space-y-4 text-black/70 dark:text-white/60">
              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-4">
                  {isArabic ? 'شروط الاسترداد' : 'Eligibility for Refunds'}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/10 dark:border-white/10">
                        <th className="text-left py-3 px-4 font-semibold text-xs sm:text-sm text-black dark:text-white">
                          {isArabic ? 'حالة الخدمة' : 'Service Status'}
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-xs sm:text-sm text-black dark:text-white">
                          {isArabic ? 'مؤهل للاسترداد' : 'Refund Eligible'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-xs sm:text-sm">{isArabic ? 'الخدمة لم تبدأ بعد' : 'Service not yet started'}</td>
                        <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4" strokeWidth={2} />
                          {isArabic ? 'نعم (استرداد كامل)' : 'Yes (full refund)'}
                        </td>
                      </tr>
                      <tr className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-xs sm:text-sm">{isArabic ? 'الخدمة قيد التنفيذ' : 'Service in progress'}</td>
                        <td className="py-3 px-4 text-amber-600 dark:text-amber-400 text-xs sm:text-sm flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4" strokeWidth={2} />
                          {isArabic ? 'استرداد جزئي' : 'Partial refund'}
                        </td>
                      </tr>
                      <tr className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-xs sm:text-sm">{isArabic ? 'الخدمة مكتملة بنجاح' : 'Service completed successfully'}</td>
                        <td className="py-3 px-4 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-center gap-1.5">
                          <XCircle className="h-4 w-4" strokeWidth={2} />
                          {isArabic ? 'لا' : 'No'}
                        </td>
                      </tr>
                      <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-xs sm:text-sm">{isArabic ? 'خطأ من TMMT تسبب في الفشل' : 'TMMT error caused failure'}</td>
                        <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4" strokeWidth={2} />
                          {isArabic ? 'نعم (استرداد كامل)' : 'Yes (full refund)'}
                        </td>
                      </tr>
                      <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-xs sm:text-sm">{isArabic ? 'رفض حكومي' : 'Government rejection'}</td>
                        <td className="py-3 px-4 text-amber-600 dark:text-amber-400 text-xs sm:text-sm flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4" strokeWidth={2} />
                          {isArabic ? 'مراجعة مطلوبة' : 'Review required'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-3">
                  {isArabic ? 'تفصيل الرسوم' : 'Fee Breakdown'}
                </h3>
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between py-2 border-b border-black/5 dark:border-white/5">
                    <span>{isArabic ? 'رسوم خدمة TMMT' : 'TMMT Service Fee'}</span>
                    <span className="font-medium">AED 0</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-black/5 dark:border-white/5">
                    <span>{isArabic ? 'الرسوم الحكومية' : 'Government Fee'}</span>
                    <span className="font-medium">{isArabic ? 'تختلف حسب الخدمة المطلوبة' : 'Varies depending on the requested service'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-black/5 dark:border-white/5">
                    <span>{isArabic ? 'ضريبة القيمة المضافة والرسوم البنكية' : 'VAT & Bank Charges'}</span>
                    <span className="font-medium">{isArabic ? 'تُطبق عند الاقتضاء' : 'Applied where applicable'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-black/5 dark:border-white/5">
                    <span>{isArabic ? 'رسوم توصيل الهوية الإماراتية' : 'Emirates ID Delivery Fee'}</span>
                    <span className="font-medium">{isArabic ? 'تختلف حسب موقع التوصيل' : 'Varies depending on the selected delivery location'}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-black dark:text-white">
                    <span>{isArabic ? 'المبلغ الإجمالي' : 'Total Amount'}</span>
                    <span>{isArabic ? 'يتم حسابه قبل الدفع' : 'Calculated before payment'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── SECTION 5: GOLDEN GUARANTEE ───────────────────────────── */}
          <section id="guarantee" className="mb-12 sm:mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-amber-500/20 dark:bg-amber-500/30">
                <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white" style={{ fontWeight: 600 }}>
                {isArabic ? 'الضمان الذهبي' : 'TMMT Golden Guarantee'}
              </h2>
            </div>

            <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border-2 border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-amber-500/20">
                  <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white" style={{ fontWeight: 600 }}>
                  {isArabic ? 'الضمان الذهبي من TMMT' : 'TMMT Golden Guarantee'}
                </h3>
              </div>
              
              <p className="text-black/70 dark:text-white/60 text-sm sm:text-base leading-relaxed mb-4">
                {isArabic 
                  ? 'ثقتك وخصوصيتك ورضاك هي أولويتنا. تعد TMMT بالتعامل مع طلبك باحترافية وأمان وشفافية.'
                  : 'Your trust, privacy, and satisfaction are our priority. TMMT promises to handle your request professionally, securely, and transparently.'
                }
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/50 dark:bg-black/30 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <h4 className="font-semibold text-black dark:text-white">
                      {isArabic ? 'ما نضمنه' : 'What We Guarantee'}
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-sm text-black/70 dark:text-white/60">
                    <li>• {isArabic ? 'تصحيح الأخطاء دون رسوم إضافية' : 'Correct errors without additional fee'}</li>
                    <li>• {isArabic ? 'استرداد رسوم خدمة TMMT المؤهلة' : 'Refund eligible TMMT service fees'}</li>
                    <li>• {isArabic ? 'معالجة احترافية وآمنة' : 'Professional and secure handling'}</li>
                    <li>• {isArabic ? 'تواصل شفاف' : 'Transparent communication'}</li>
                  </ul>
                </div>
                <div className="bg-white/50 dark:bg-black/30 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                    <h4 className="font-semibold text-black dark:text-white">
                      {isArabic ? 'ما لا يشمله الضمان' : "What's Not Covered"}
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-sm text-black/70 dark:text-white/60">
                    <li>• {isArabic ? 'رفض أو تأخير حكومي' : 'Government rejection or delay'}</li>
                    <li>• {isArabic ? 'أخطاء العميل أو عدم الأهلية' : 'Customer errors or ineligibility'}</li>
                    <li>• {isArabic ? 'تغيير المتطلبات الحكومية' : 'Changed government requirements'}</li>
                    <li>• {isArabic ? 'أحداث خارجة عن سيطرة TMMT' : 'Events outside TMMT\'s control'}</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-black/30 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                <h4 className="font-semibold text-black dark:text-white text-sm mb-2">
                  {isArabic ? 'للتأهل للضمان:' : 'To qualify for the guarantee:'}
                </h4>
                <ul className="space-y-1.5 text-sm text-black/70 dark:text-white/60">
                  <li>• {isArabic ? 'يجب على العميل تقديم معلومات دقيقة ومستندات صالحة' : 'Customer must provide accurate information and valid documents'}</li>
                  <li>• {isArabic ? 'يجب على العميل التعاون والرد في الوقت المناسب' : 'Customer must cooperate and respond in a timely manner'}</li>
                  <li>• {isArabic ? 'يجب الإبلاغ عن المشكلة في غضون 30 يومًا من معرفتها' : 'Issue must be reported within [30] days of becoming aware of it'}</li>
                  <li>• {isArabic ? 'ينطبق الضمان فقط على أخطاء TMMT المؤكدة' : 'The guarantee applies only to confirmed TMMT errors'}</li>
                </ul>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
                <p className="text-sm text-black/60 dark:text-white/50">
                  <strong className="text-black dark:text-white">{isArabic ? 'ملاحظة:' : 'Note:'}</strong>
                  {' '}
                  {isArabic 
                    ? 'الرسوم الحكومية ورسوم الطرف الثالث منفصلة وتظل خاضعة لسياسات الاسترداد الخاصة بالجهة المستقبلة أو المزود. ستواصل TMMT دعم العميل حتى يتم إكمال الخدمة المتفق عليها، أو تصحيحها، أو استردادها حيثما يكون ذلك مؤهلاً، أو تقديم سبب رسمي يوضح سبب عدم إمكانية متابعة الطلب الحكومي.'
                    : 'Government fees and third-party fees are separate and remain subject to the refund policies of the receiving authority or provider. TMMT will continue supporting the customer until the agreed service is completed, corrected, refunded where eligible, or an official reason is provided explaining why the government request cannot proceed.'
                  }
                </p>
              </div>
            </div>
          </section>

          {/* ─── SECTION 6: AI POLICY ──────────────────────────────────── */}
          <section id="ai" className="mb-12 sm:mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-purple-500/10 dark:bg-purple-500/20">
                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" strokeWidth={1.75} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white" style={{ fontWeight: 600 }}>
                {isArabic ? 'سياسة الذكاء الاصطناعي' : 'AI Policy'}
              </h2>
            </div>

            <div className="space-y-4 text-black/70 dark:text-white/60">
              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-2">
                  {isArabic ? 'الغرض من الذكاء الاصطناعي' : 'Purpose of AI'}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed">
                  {isArabic 
                    ? 'يقدم مساعد الذكاء الاصطناعي من TMMT إرشادات عامة حول الإجراءات الحكومية المعروفة. تم تصميمه لمساعدة المستخدمين في فهم العمليات والنماذج والمتطلبات.'
                    : 'The TMMT AI assistant provides general guidance about commonly known government procedures. It is designed to help users understand processes, forms, and requirements.'
                  }
                </p>
              </div>

              <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-2">
                  {isArabic ? 'قيود مهمة' : 'Important Limitations'}
                </h3>
                <ul className="space-y-2 text-sm sm:text-base">
                  {[
                    isArabic ? 'ليس نصيحة حكومية رسمية' : 'Not official government advice',
                    isArabic ? 'ليس نصيحة قانونية أو هجرة' : 'Not legal or immigration advice',
                    isArabic ? 'ليس ضمانًا للموافقة' : 'Not a guarantee of approval',
                    isArabic ? 'قد تكون غير مكتملة أو غير صحيحة أحيانًا' : 'May occasionally be incomplete or incorrect',
                    isArabic ? 'يجب إحالة الأسئلة المعقدة إلى المتخصصين' : 'Complex questions should be referred to specialists',
                    isArabic ? 'لا يمكن للذكاء الاصطناعي تقديم طلبات أو إجراء مدفوعات' : 'AI cannot submit applications or make payments'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-2">
                  {isArabic ? 'أمان بيانات الذكاء الاصطناعي' : 'AI Data Security'}
                </h3>
                <ul className="space-y-2 text-sm sm:text-base">
                  {[
                    isArabic ? 'تفاعلات الذكاء الاصطناعي مشفرة' : 'AI interactions are encrypted',
                    isArabic ? 'البيانات مجهولة المصدر لتحسين الذكاء الاصطناعي' : 'Data is anonymized for AI improvement',
                    isArabic ? 'لا مشاركة مع أطراف ثالثة' : 'No sharing with third parties',
                    isArabic ? 'لا تُستخدم رسائل العملاء لتدريب نماذج الذكاء الاصطناعي العامة' : 'Customer messages are not used to train public AI models',
                    isArabic ? 'لا ينبغي إدخال كلمات المرور والبيانات الحساسة في محادثة الذكاء الاصطناعي' : 'Passwords and sensitive data should not be entered into AI chat'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <ShieldCheck className="h-4 w-4 text-[#0A3269] shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ─── SECTION 7: COOKIE POLICY ────────────────────────────── */}
          <section id="cookie" className="mb-12 sm:mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20">
                <Cookie className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white" style={{ fontWeight: 600 }}>
                {isArabic ? 'سياسة الكوكيز' : 'Cookie Policy'}
              </h2>
            </div>

            <div className="space-y-4 text-black/70 dark:text-white/60">
              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-2">
                  {isArabic ? 'الكوكيز الأساسية' : 'Essential Cookies'}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed">
                  {isArabic 
                    ? 'الكوكيز الأساسية مطلوبة لوظائف المنصة الأساسية بما في ذلك تسجيل الدخول إلى الحساب والأمان وإعدادات اللغة ومعالجة الدفع وإدارة الجلسة ومنع الاحتيال.'
                    : 'Essential cookies are required for basic platform functionality including account login, security, language settings, payment processing, session management, and fraud prevention.'
                  }
                </p>
              </div>

              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-2">
                  {isArabic ? 'الكوكيز غير الأساسية' : 'Non-Essential Cookies'}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed">
                  {isArabic 
                    ? 'تتطلب كوكيز التحليلات والتسويق موافقتك الصريحة قبل تمكينها. يمكنك قبول الكل أو رفض غير الأساسي أو إدارة تفضيلاتك.'
                    : 'Analytics and marketing cookies require your explicit consent before they are enabled. You can accept all, reject non-essential, or manage your preferences.'
                  }
                </p>
              </div>
            </div>
          </section>

          {/* ─── SECTION 8: COMPLAINTS ─────────────────────────────────── */}
          <section id="complaints" className="mb-12 sm:mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-green-500/10 dark:bg-green-500/20">
                <Headphones className="h-5 w-5 text-green-600 dark:text-green-400" strokeWidth={1.75} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white" style={{ fontWeight: 600 }}>
                {isArabic ? 'سياسة الشكاوى' : 'Complaints Policy'}
              </h2>
            </div>

            <div className="space-y-4 text-black/70 dark:text-white/60">
              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-2">
                  {isArabic ? 'كيفية تقديم شكوى' : 'How to Submit a Complaint'}
                </h3>
                <ul className="space-y-2 text-sm sm:text-base">
                  {[
                    isArabic ? 'البريد الإلكتروني: complaints@tmmt.ae' : 'Email: complaints@tmmt.ae',
                    isArabic ? 'الهاتف/واتساب: [INSERT NUMBER]' : 'Phone/WhatsApp: [INSERT NUMBER]',
                    isArabic ? 'نموذج عبر الإنترنت متاح على المنصة' : 'Online form available on the platform',
                    isArabic ? 'قم بتضمين اسمك ورقم الطلب ومرجع الدفع ووصف المشكلة والأدلة الداعمة' : 'Include your name, request number, payment reference, issue description, and supporting evidence'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-[#0A3269] shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base mb-2">
                  {isArabic ? 'ردنا' : 'Our Response'}
                </h3>
                <ul className="space-y-2 text-sm sm:text-base">
                  {[
                    isArabic ? 'إقرار خلال 24 ساعة' : 'Acknowledgment within 24 hours',
                    isArabic ? 'تحقيق خلال 3 أيام عمل' : 'Investigation within 3 business days',
                    isArabic ? 'حل نهائي خلال 10 أيام عمل' : 'Final resolution within 10 business days',
                    isArabic ? 'قد تستغرق الحالات المعقدة ما يصل إلى 30 يومًا' : 'Complex cases may take up to 30 days',
                    isArabic ? 'يحتفظ العملاء بالحق في الاتصال بسلطات حماية المستهلك' : 'Customers retain the right to contact consumer protection authorities'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-[#0A3269] shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ─── SECTION 9: FINAL DISCLAIMER ──────────────────────────── */}
          <section id="disclaimer" className="mb-12 sm:mb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-red-500/10 dark:bg-red-500/20">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" strokeWidth={1.75} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white" style={{ fontWeight: 600 }}>
                {isArabic ? 'إخلاء المسؤولية النهائي' : 'Disclaimer'}
              </h2>
            </div>
            
            <div className="space-y-4 text-black/70 dark:text-white/60">
              <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
                <p className="font-semibold text-black dark:text-white text-sm sm:text-base leading-relaxed">
                  {isArabic 
                    ? 'TMMT هي منصة خاصة تساعد المستخدمين في الإجراءات الحكومية في الإمارات. نحن لست جهة حكومية، ولا ننتمي إلى أي سلطة حكومية أو نعمل نيابة عنها. تشمل خدماتنا الإرشاد ومراجعة المستندات ومساعدة العمليات فقط. يتم دفع جميع الرسوم الحكومية مباشرة إلى السلطات المعنية، ونحن لا نضمن الموافقة أو أي نتيجة محددة.'
                    : 'TMMT is a private platform that helps users with UAE government procedures. We are not a government entity, nor are we affiliated with or endorsed by any government authority. Our services include guidance, document review, and process assistance only. All government fees are paid directly to the relevant authorities, and we do not guarantee approval or any specific outcome.'
                  }
                </p>
              </div>
              
              <div className="bg-white/50 dark:bg-black/30 rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                <p className="font-semibold text-black dark:text-white text-sm sm:text-base mb-4">
                  {isArabic ? 'باستخدام TMMT، فإنك تقر بأن:' : 'By using TMMT, you acknowledge that:'}
                </p>
                
                <ol className="space-y-3 text-sm sm:text-base">
                  {[
                    isArabic ? 'TMMT هي مزود خدمة خاص مستقل.' : 'TMMT is an independent private service provider.',
                    isArabic ? 'نحن لا نمثل أو نعمل نيابة عن أي سلطة حكومية.' : 'We do not represent or act on behalf of any government authority.',
                    isArabic ? 'تتخذ القرارات الحكومية من قبل السلطات المعنية فقط.' : 'Government decisions are made solely by the relevant authorities.',
                    isArabic ? 'أنت مسؤول عن التحقق من جميع المعلومات مع المصادر الرسمية.' : 'You are responsible for verifying all information with official sources.',
                    isArabic ? 'دور TMMT هو المساعدة، وليس ضمان النتائج.' : "TMMT's role is to assist, not to guarantee results."
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0A3269]/10 text-[#0A3269] text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
              
              <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
                <p className="text-sm sm:text-base leading-relaxed">
                  <strong className="text-black dark:text-white">
                    {isArabic ? 'للاستفسارات الرسمية،' : 'For any official inquiries,'}
                  </strong>
                  {' '}
                  {isArabic 
                    ? 'يرجى الاتصال بالسلطة الحكومية المختصة مباشرة.'
                    : 'please contact the relevant government authority directly.'
                  }
                </p>
              </div>
            </div>
          </section>

          {/* ─── FOOTER ──────────────────────────────────────────────────── */}
          <div className="border-t border-black/10 dark:border-white/10 pt-6 sm:pt-8 mt-8 sm:mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-center sm:text-left text-xs sm:text-sm text-black/40 dark:text-white/30">
                © {currentYear} TMMT. {isArabic ? 'جميع الحقوق محفوظة.' : 'All Rights Reserved.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-black/40 dark:text-white/30">
                <Link to="/legal#terms" className="hover:text-black dark:hover:text-white transition-colors">
                  {isArabic ? 'الشروط' : 'Terms'}
                </Link>
                <span className="w-px h-4 bg-black/10 dark:bg-white/10" />
                <Link to="/legal#privacy" className="hover:text-black dark:hover:text-white transition-colors">
                  {isArabic ? 'الخصوصية' : 'Privacy'}
                </Link>
                <span className="w-px h-4 bg-black/10 dark:bg-white/10" />
                <Link to="/legal#refund" className="hover:text-black dark:hover:text-white transition-colors">
                  {isArabic ? 'الاسترداد' : 'Refund'}
                </Link>
                <span className="w-px h-4 bg-black/10 dark:bg-white/10" />
                <Link to="/legal#guarantee" className="hover:text-black dark:hover:text-white transition-colors">
                  {isArabic ? 'الضمان' : 'Guarantee'}
                </Link>
                <span className="w-px h-4 bg-black/10 dark:bg-white/10" />
                <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">
                  {isArabic ? 'الرئيسية' : 'Home'}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalPage;