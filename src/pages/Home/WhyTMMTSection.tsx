// src/components/Home/WhyTMMTSection.jsx
import { useRef, useState, useEffect } from 'react';
import {
  Clock,
  Shield,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Headphones,
  Award,
} from 'lucide-react';

const WhyTMMTSection = () => {
  const sectionRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isArabic, setIsArabic] = useState(false);

  // ─── Detect dark mode ──────────────────────────────────────────
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    const observer = new MutationObserver(() => {
      checkDarkMode();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // ─── Detect language manually ──────────────────────────────────────────
  useEffect(() => {
    const checkLanguage = () => {
      const lang = localStorage.getItem('i18nextLng');
      const htmlLang = document.documentElement.lang;
      const navLang = navigator.language;

      const isAr =
        lang === 'ar' ||
        lang === 'ar-AE' ||
        htmlLang === 'ar' ||
        htmlLang === 'ar-AE' ||
        htmlLang?.startsWith('ar') ||
        navLang === 'ar' ||
        navLang === 'ar-AE';

      setIsArabic(isAr);
    };

    checkLanguage();

    const handleStorageChange = (e) => {
      if (e.key === 'i18nextLng' || e.key === 'language' || e.key === 'lang') {
        checkLanguage();
      }
    };

    const handleCustomEvent = () => {
      checkLanguage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('languageChanged', handleCustomEvent);
    window.addEventListener('i18nLanguageChanged', handleCustomEvent);

    const observer = new MutationObserver(() => {
      const lang = document.documentElement.lang;
      setIsArabic(lang === 'ar' || lang === 'ar-AE' || lang?.startsWith('ar'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageChanged', handleCustomEvent);
      window.removeEventListener('i18nLanguageChanged', handleCustomEvent);
      observer.disconnect();
    };
  }, []);

  // ─── Use #0A3269 in both light and dark mode ──────────────────────────
  const accent = '#0A3269';

  // ─── Benefits for "Why TMMT?" section ──────────────────────────────────
 const benefits = [
    {
      icon: Clock,
      text: isArabic ? 'وفّر وقتك وجهدك' : 'Save time and effort',
      description: isArabic
        ? 'تجاوز الطوابير والارتباك. نحن نتولى الأوراق بينما تركز أنت على حياتك.'
        : 'Skip the queues and confusion. We handle the paperwork while you focus on your life.',
    },
    {
      icon: Shield,
      text: isArabic ? 'تجنب الأخطاء المكلفة' : 'Avoid costly mistakes',
      description: isArabic
        ? 'احصل على إرشاد خبير قبل اتخاذ أي قرار حكومي. تجنب الغرامات والرفض.'
        : 'Get expert guidance before making any government decision. Prevent fines and rejections.',
    },
    {
      icon: CheckCircle2,
      text: isArabic ? 'كل شيء في مكان واحد' : 'Everything in one place',
      description: isArabic
        ? 'جميع الخدمات الحكومية الإماراتية، الفحوصات، والإجراءات متاحة على منصة واحدة.'
        : 'All UAE government services, checkers, and procedures available on a single platform.',
    },
    {
      icon: MessageSquare,
      text: isArabic ? 'اسأل قبل أن تتصرف' : 'Ask before you act',
      description: isArabic
        ? 'احصل على إجابات قبل الدفع أو التوقيع أو تقديم أي طلب. اتخذ قرارات مستنيرة.'
        : 'Get answers before you pay, sign, or submit any application. Make informed decisions.',
    },
    {
      icon: Sparkles,
      text: isArabic ? 'إجابات فورية بالذكاء الاصطناعي' : 'Instant AI answers',
      description: isArabic
        ? 'احصل على إجابات فورية على مدار الساعة. يتم التعامل مع الحالات المعقدة من قبل خبرائنا.'
        : 'Get instant answers 24/7. Complex cases are handled by our specialists.',
    },
    {
      icon: Headphones,
      text: isArabic ? 'دعم خبراء حقيقيين' : 'Real expert support',
      description: isArabic
        ? 'خبراء مؤهلون متاحون على مدار الساعة طوال أيام الأسبوع كلما احتجت إليهم.'
        : 'Qualified specialists available 24/7 whenever you need them.',
    },
  ];


  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-28 w-full ${
        isDarkMode ? 'bg-black' : 'bg-white'
      }`}
    >
      {/* Premium Background Effects with Floating Animations */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-0 -right-20 w-[500px] h-[500px] rounded-full blur-3xl animate-float-slow ${
            isDarkMode ? 'bg-white/3' : 'bg-black/3'
          }`}
        />
        <div
          className={`absolute bottom-0 -left-20 w-[500px] h-[500px] rounded-full blur-3xl animate-float-medium ${
            isDarkMode ? 'bg-white/3' : 'bg-black/3'
          }`}
        />
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-float-fast ${
            isDarkMode ? 'bg-white/2' : 'bg-black/2'
          }`}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${
              isDarkMode ? '#ffffff' : '#000000'
            } 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 relative z-10 max-w-7xl mx-auto">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="text-center max-w-4xl mx-auto mb-14 md:mb-16">
          <div
            className={`inline-flex items-center gap-2 rounded-full border backdrop-blur-sm px-4 py-2 mb-5 transition-all duration-300 hover:scale-105 ${
              isDarkMode ? 'border-white/10 bg-black/40' : 'border-black/10 bg-white/80 shadow-sm'
            }`}
          >
            <Award className="h-4 w-4" style={{ color: accent }} />
            <span className="text-xs font-semibold tracking-wider" style={{ color: accent }}>
              {isArabic ? 'لماذا TMMT؟' : 'WHY TMMT?'}
            </span>
          </div>

          <h2
            className={`font-bold leading-[1.1] ${isDarkMode ? 'text-white' : 'text-black'}`}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(2.2rem, 8vw, 3.5rem)',
            }}
          >
            {isArabic ? (
              <>
                شريكك الموثوق لـ
                <br className="hidden md:block" />
                <span className="font-light" style={{ color: accent, fontSize: 'clamp(1.8rem, 7vw, 2.8rem)' }}>
                  الخدمات الحكومية
                </span>
              </>
            ) : (
              <>
                <span className="font-bold">Your Trusted Partner for</span>
                <br className="hidden md:block" />
                <span className="font-light" style={{ color: accent, fontSize: 'clamp(1.8rem, 7vw, 2.8rem)' }}>
                  Government Services
                </span>
              </>
            )}
          </h2>

          <p className={`text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed mt-4 ${
            isDarkMode ? 'text-white/50' : 'text-gray-600'
          }`}>
            {isArabic
              ? 'نحن نعيد تعريف تجربة الخدمات الحكومية في الإمارات من خلال الجمع بين التكنولوجيا المتطورة والخبرة البشرية.'
              : 'We are redefining the UAE government service experience by combining cutting-edge technology with human expertise.'}
          </p>
        </div>

        {/* ─── Benefits Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 max-w-7xl mx-auto w-full">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className={`group relative rounded-2xl p-7 md:p-8 transition-all duration-300 ease-out
                  hover:-translate-y-1
                  ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}
                `}
                style={{
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(10,50,105,0.08)'}`,
                  animation: `fade-up-stagger ${0.35 + idx * 0.08}s cubic-bezier(0.22, 1, 0.36, 1) both`,
                }}
            
              >
                {/* Animated Line - Shows ONLY on hover (hidden by default) */}
                <div
                  className={`absolute top-0 left-1/2 h-[2px] -translate-x-1/2 rounded-full 
                    w-0 group-hover:w-full transition-all duration-700 ease-out group-hover:animate-line-expand
                    ${isDarkMode ? 'bg-[#0A3269]' : 'bg-[#0A3269]'}
                  `}
                />

                {/* Glass Reflection Overlay */}
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-white/10 to-transparent'
                      : 'bg-gradient-to-br from-[#0A3269]/5 to-transparent'
                  }`}
                />

                {/* Corner index tag */}
                <span
                  className={`absolute top-6 right-7 text-[11px] font-semibold tabular-nums ${
                    isDarkMode ? 'text-white/25' : 'text-black/20'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Solid icon tile */}
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl mb-5 shadow-sm transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: accent }}
                >
                  <Icon className="h-5.5 w-5.5 text-white" strokeWidth={1.9} />
                </div>

                <h3 className={`text-base sm:text-lg font-semibold mb-2.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {benefit.text}
                </h3>

                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                  {benefit.description}
                </p>

                {/* Thin baseline accent */}
                <div
                  className="mt-6 h-px w-full"
                  style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(10,50,105,0.08)' }}
                />
                <div
                  className="mt-3 flex items-center gap-1.5 text-xs font-medium opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                  style={{ color: accent }}
                >
                  {isArabic ? 'اعرف المزيد' : 'Learn more'}
                  <span aria-hidden="true">{isArabic ? '←' : '→'}</span>
                </div>

                {/* Subtle Glow Effect */}
                <div
                  className={`absolute -bottom-16 -right-16 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
                    isDarkMode ? 'bg-[#0A3269]/5' : 'bg-[#0A3269]/5'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── INJECT PREMIUM CSS KEYFRAMES ───────────────────────────── */}
      <style>{`
        @keyframes fade-up-stagger {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          33% { transform: translate(30px, -20px) scale(1.1); opacity: 0.5; }
          66% { transform: translate(-20px, 10px) scale(0.9); opacity: 0.2; }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          33% { transform: translate(-20px, 30px) scale(1.2); opacity: 0.4; }
          66% { transform: translate(20px, -10px) scale(0.85); opacity: 0.1; }
        }
        @keyframes float-fast {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
          33% { transform: translate(-40%, -60%) scale(1.3); opacity: 0.4; }
          66% { transform: translate(-60%, -40%) scale(0.8); opacity: 0.1; }
        }
        
        @keyframes line-expand {
          0% { width: 0%; opacity: 0; }
          50% { width: 80%; opacity: 1; }
          100% { width: 100%; opacity: 1; }
        }

        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 10s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 8s ease-in-out infinite;
        }
        .animate-line-expand {
          animation: line-expand 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </section>
  );
};

export default WhyTMMTSection;