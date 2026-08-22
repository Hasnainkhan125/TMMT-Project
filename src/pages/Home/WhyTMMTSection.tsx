// src/components/Home/WhyTMMTSection.jsx
import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Shield,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Headphones,
  Award,
} from 'lucide-react';

// ─── Color system — every value derived from the single brand ink #14235E ──
const INK = '#14235E';
const INK_DEEPER = '#14235E';
const INK_DARK = '#0A1440';
const INK_MID = '#14235E';
const INK_LIGHT = '#4457AE';
const INK_LIGHTER = '#14235E';
const INK_PALE = '#14235E';

const WhyTMMTSection = () => {
  const sectionRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isArabic, setIsArabic] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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

  // ─── Respect reduced motion ─────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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
        isDarkMode ? 'bg-[#000]' : 'bg-white'
      }`}
      style={{ perspective: '1800px' }}
    >
    
   
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `1px solid ${isDarkMode ? INK_LIGHTER + '1f' : INK + '0d'}`,
              transform: 'rotateX(72deg) rotateZ(20deg)',
            }}
          />
        <div
          className={`absolute inset-0 ${isDarkMode ? 'opacity-[0.04]' : 'opacity-[0.03]'}`}
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${
              isDarkMode ? '#ffffff' : INK
            } 1px, transparent 0)`,
            backgroundSize: '38px 38px',
          }}
        />

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 relative z-10 max-w-7xl mx-auto">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="text-center max-w-4xl mx-auto mb-14 md:mb-16">
   
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
                <span
                  className="font-light"
                  style={{
                    fontSize: 'clamp(1.8rem, 7vw, 2.8rem)',
                    backgroundImage: `linear-gradient(100deg, ${INK}, ${INK_LIGHT} 55%, ${INK})`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  الخدمات الحكومية
                </span>
              </>
            ) : (
              <>
                <span className="font-bold">Your Trusted Partner for</span>
                <br className="hidden md:block" />
                <span
                  className="font-light"
                  style={{
                    fontSize: 'clamp(1.8rem, 7vw, 2.8rem)',
                    backgroundImage: `linear-gradient(100deg, ${INK})`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: '#14235E',
                  }}
                >
                  Government Services
                </span>
              </>
            )}
          </h2>

          <p
            className={`text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed mt-4 ${
              isDarkMode ? 'text-white/50' : 'text-gray-600'
            }`}
          >
            {isArabic
              ? 'نحن نعيد تعريف تجربة الخدمات الحكومية في الإمارات من خلال الجمع بين التكنولوجيا المتطورة والخبرة البشرية.'
              : 'We are redefining the UAE government service experience by combining cutting-edge technology with human expertise.'}
          </p>
        </div>

        {/* ─── Benefits Grid — 3D tilt cards ──────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 max-w-7xl mx-auto w-full">
          {benefits.map((benefit, idx) => (
            <TiltCard
              key={idx}
              idx={idx}
              benefit={benefit}
              isDarkMode={isDarkMode}
              isArabic={isArabic}
              disableTilt={prefersReducedMotion}
            />
          ))}
        </div>
      </div>

      {/* ─── INJECT PREMIUM CSS KEYFRAMES ───────────────────────────── */}
      <style>{`
        @keyframes fade-up-stagger {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes wt-orb-drift-a {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-3%, 4%, 40px) scale(1.08); }
        }
        @keyframes wt-orb-drift-b {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(4%, -3%, 20px) scale(1.06); }
        }
        @keyframes wt-ring-spin {
          0% { transform: rotateX(72deg) rotateZ(0deg); }
          100% { transform: rotateX(72deg) rotateZ(360deg); }
        }
        @keyframes wt-ring-wrap-spin {
          0% { transform: rotateZ(0deg); }
          100% { transform: rotateZ(-360deg); }
        }

        .wt-orb-a { animation: wt-orb-drift-a 13s ease-in-out infinite; }
        .wt-orb-b { animation: wt-orb-drift-b 16s ease-in-out infinite; }
        .wt-ring { animation: wt-ring-wrap-spin 60s linear infinite; }
        .wt-ring > div { animation: wt-ring-spin 40s linear infinite; }

        .wt-badge-3d { transition: transform 0.35s cubic-bezier(0.22,1,0.36,1); }
        .wt-badge-3d:hover { transform: translateY(-2px) scale(1.03); }

        @media (prefers-reduced-motion: reduce) {
          .wt-orb-a, .wt-orb-b, .wt-ring, .wt-ring > div { animation: none !important; }
        }
      `}</style>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ─── TiltCard — pointer-tracked 3D card with parallax icon & glare ──
// ═══════════════════════════════════════════════════════════════════
const TiltCard = ({ idx, benefit, isDarkMode, isArabic, disableTilt }) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [fastTransition, setFastTransition] = useState(false);
  const Icon = benefit.icon;

  const handleMouseMove = useCallback(
    (e) => {
      if (disableTilt || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const ry = ((x - cx) / cx) * 9;
      const rx = -((y - cy) / cy) * 9;
      setTilt({ rx, ry });
      setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 1 });
      setFastTransition(true);
    },
    [disableTilt]
  );

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    setGlare((g) => ({ ...g, opacity: 0 }));
    setFastTransition(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative"
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0px)`,
        transition: fastTransition
          ? 'transform 0.08s ease-out'
          : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
        animation: `fade-up-stagger ${0.35 + idx * 0.08}s cubic-bezier(0.22, 1, 0.36, 1) both`,
      }}
    >
      <div
        className="relative rounded-2xl p-7 md:p-8 h-full overflow-hidden"
        style={{
          transformStyle: 'preserve-3d',
          background: isDarkMode ? '#0c0c0c' : '#ffffff',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : INK + '14'}`,
        }}
      >
        {/* Cursor-following glare sweep */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            opacity: glare.opacity * (isDarkMode ? 0.06 : 0.5),
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, ${isDarkMode ? '#ffffff' : '#ffffff'}, transparent 42%)`,
          }}
        />

          {/* Animated top edge line — reveals on hover */}
          <div
            className="absolute top-0 left-1/2 h-[2px] -translate-x-1/2 rounded-full w-0 group-hover:w-full transition-all duration-700 ease-out"
            style={{ backgroundColor: isDarkMode ? INK_LIGHTER : INK }}
          />

       

        {/* Icon tile — floats above card plane on hover for parallax depth */}
        <div
          className="relative flex h-12 w-12 items-center justify-center rounded-xl mb-5 transition-transform duration-500 ease-out group-hover:-translate-y-1"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(28px)',
            background: `linear-gradient(155deg, ${INK_MID}, ${INK_DARK})`,
          }}
        >
          <div
            className="absolute inset-0 rounded-xl opacity-60"
            style={{ background: `linear-gradient(160deg, ${INK_LIGHTER}55, transparent 55%)` }}
          />
          <Icon className="relative h-5 w-5 text-white" strokeWidth={1.9} />
        </div>

        <h3
          className="text-base sm:text-lg font-semibold mb-2.5"
          style={{
            color: isDarkMode ? '#ffffff' : '#0b1030',
            transform: 'translateZ(14px)',
          }}
        >
          {benefit.text}
        </h3>

        <p
          className="text-sm leading-relaxed"
          style={{ color: isDarkMode ? '#ffffffcc' : '#5b6280', transform: 'translateZ(8px)' }}
        >
          {benefit.description}
        </p>

        {/* Thin baseline accent */}
        <div
          className="mt-6 h-px w-full"
          style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : `${INK}14` }}
        />
      
        {/* Deep ambient glow anchored under the card */}
        <div
          className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : `${INK_LIGHTER}22` }}
        />
      </div>

      {/* Contact shadow beneath the card — grows as the card 'lifts' */}
      <div
        className="pointer-events-none absolute -inset-x-3 -bottom-3 h-8 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ backgroundColor: isDarkMode ? '#000000' : `${INK}30` }}
      />
    </div>
  );
};

export default WhyTMMTSection;