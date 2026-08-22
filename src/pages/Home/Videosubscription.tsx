import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Play, ArrowRight, Shield, Users,
  Zap, Globe, Rocket, TrendingUp,
  X, Diamond
} from 'lucide-react';

// ─── Color system — every value derived from the single brand ink #14235E ──
const INK = '#14235E';
const INK_DEEPER = '#050A24';
const INK_DARK = '#0A1440';
const INK_MID = '#243B8C';
const INK_LIGHT = '#4457AE';
const INK_LIGHTER = '#7C8CD6';
const INK_PALE = '#EEF1FB';

const VideoSection = () => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoFrameRef = useRef<HTMLDivElement>(null);
  const subscriptionVideo = '/images/laptop/tmmt.mp4';

  const [isHovering, setIsHovering] = useState(false);
  const [isArabic, setIsArabic] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // ─── 3D scene parallax — cursor position relative to the section ───────
  const [scenePos, setScenePos] = useState({ x: 0, y: 0 });
  // ─── Video frame tilt ────────────────────────────────────────────────
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [fastTransition, setFastTransition] = useState(false);

  // Check dark mode
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

  // Check language
  useEffect(() => {
    const checkLanguage = () => {
      const lang = localStorage.getItem('i18nextLng');
      const htmlLang = document.documentElement.lang;
      const isAr = lang === 'ar' || lang === 'ar-AE' || htmlLang === 'ar' || htmlLang === 'ar-AE';
      setIsArabic(isAr);
    };

    checkLanguage();

    const handleChange = () => {
      const newLang = localStorage.getItem('i18nextLng');
      const newHtmlLang = document.documentElement.lang;
      setIsArabic(newLang === 'ar' || newLang === 'ar-AE' || newHtmlLang === 'ar' || newHtmlLang === 'ar-AE');
    };

    window.addEventListener('storage', handleChange);
    window.addEventListener('languageChanged', handleChange);

    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener('languageChanged', handleChange);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // ─── Respect reduced motion ─────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ─── Track cursor relative to the section for a gentle 3D parallax ─────
  useEffect(() => {
    if (prefersReducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1..1
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setScenePos({ x: nx, y: ny });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  const handleFrameMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReducedMotion || !videoFrameRef.current) return;
      const rect = videoFrameRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const ry = ((x - cx) / cx) * 6;
      const rx = -((y - cy) / cy) * 6;
      setTilt({ rx, ry });
      setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 1 });
      setFastTransition(true);
    },
    [prefersReducedMotion]
  );

  const handleFrameMouseLeave = () => {
    setIsHovering(false);
    setTilt({ rx: 0, ry: 0 });
    setGlare((g) => ({ ...g, opacity: 0 }));
    setFastTransition(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => {
      if (modalVideoRef.current) {
        modalVideoRef.current.play().catch(() => {});
        requestFullscreen();
      }
    }, 100);
  };

  const closeModal = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsModalOpen(false);
  };

  const requestFullscreen = () => {
    try {
      if (modalContainerRef.current) {
        if (modalContainerRef.current.requestFullscreen) {
          modalContainerRef.current.requestFullscreen();
        }
      }
    } catch (err) {
      try {
        document.documentElement.requestFullscreen();
      } catch (e) {
        console.log('Fullscreen not supported');
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isModalOpen) {
        setTimeout(() => {
          if (isModalOpen && modalContainerRef.current) {
            try {
              modalContainerRef.current.requestFullscreen();
            } catch (e) {}
          }
        }, 100);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isModalOpen]);

  // ─── Translation Constants ──────────────────────────────────────────
  const translations = {
    en: {
      watchJourney: 'watch journey',
      visaJourney: 'Your Visa Journey,',
      nowSeamless: 'now Seamless',
      description: 'From application to approval, our expert team handles every step of your UAE visa process.',
      descriptionHighlight: 'Watch how we make your journey effortless.',
      features: {
        fastProcessing: 'Fast Processing',
        secure: '100% Secure',
        uaeWide: 'UAE Wide',
        expertSupport: 'Expert Support',
        quickApproval: 'Quick Approval',
        success: '97% Success'
      },
      cta: 'Start Your Journey',
      clickToWatch: 'Click to watch'
    },
    ar: {
      watchJourney: 'شاهد الرحلة',
      visaJourney: 'رحلة تأشيرتك،',
      nowSeamless: 'الآن بسلاسة',
      description: 'من التقديم إلى الموافقة، فريقنا الخبير يتولى كل خطوة من عملية تأشيرتك في الإمارات.',
      descriptionHighlight: 'شاهد كيف نجعل رحلتك خالية من المتاعب.',
      features: {
        fastProcessing: 'معالجة سريعة',
        secure: 'آمن 100%',
        uaeWide: 'في جميع أنحاء الإمارات',
        expertSupport: 'دعم خبير',
        quickApproval: 'موافقة سريعة',
        success: 'نجاح 97%'
      },
      cta: 'ابدأ رحلتك',
      clickToWatch: 'انقر للمشاهدة'
    }
  };

  const lang = translations[isArabic ? 'ar' : 'en'];

  const features = [
    { icon: Zap, label: lang.features.fastProcessing },
    { icon: Shield, label: lang.features.secure },
    { icon: Globe, label: lang.features.uaeWide },
    { icon: Users, label: lang.features.expertSupport },
    { icon: Rocket, label: lang.features.quickApproval },
    { icon: TrendingUp, label: lang.features.success },
  ];

  return (
    <>
      <section
        ref={sectionRef}
        className={`relative py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 overflow-hidden scroll-mt-20 px-4 sm:px-6 ${
          isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'
        }`}
        style={{ perspective: '1800px' }}
      >

        {/* ─── Subtle grid pattern ────────────────────────────────────────── */}
        <div
          className={`absolute inset-0 ${isDarkMode ? 'opacity-[0.03]' : 'opacity-[0.02]'}`}
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkMode ? '#ffffff' : INK} 1px, transparent 0)`,
            backgroundSize: '38px 38px',
          }}
        />

        <div className="container mx-auto px-1.5 sm:px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-14 xl:gap-20 items-center max-w-7xl mx-auto">

            {/* ─── Right Column - Video (3D tilt frame) ────────── */}
            <div
              className="relative px-0 order-1 lg:order-2 "
              style={{ perspective: '1200px' }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={handleFrameMouseLeave}
              onMouseMove={handleFrameMouseMove}
            >
              <div
                ref={videoFrameRef}
                onClick={openModal}
                className="relative cursor-pointer group"
                style={{
                  transformStyle: 'preserve-3d',
                  transition: fastTransition
                    ? 'transform 0.08s ease-out'
                    : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >

                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    border: `1px solid ${isDarkMode ? INK_LIGHTER + '26' : INK + '14'}`,
                  }}
                >
                  <div className="relative aspect-video  bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-contain "
                      src={subscriptionVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                    />

               
                    {/* ─── Play Button — raised 3D chip, floats above the frame ─── */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
                      <div
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{
                          transform: 'translateZ(50px)',
                          background: isHovering
                            ? `linear-gradient(155deg, ${INK_MID}, ${INK_DARK})`
                            : 'rgba(255,255,255,0.18)',
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${isHovering ? INK_LIGHTER + '55' : 'rgba(255,255,255,0.3)'}`,
                        }}
                      >
                        <Play className="h-8 w-8 sm:h-10 sm:w-10 text-white ml-1" strokeWidth={2.5} />
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                      <span
                        className="flex items-center gap-1.5 rounded-full backdrop-blur-md px-4 py-1.5 text-xs font-light text-white/80"
                        style={{
                          border: `1px solid ${INK_LIGHTER}30`,
                          backgroundColor: `${INK_DEEPER}70`,
                        }}
                      >
                        {lang.clickToWatch}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Left Column - Content ──────── */}
            <div className="space-y-5 sm:space-y-6 px-0 order-2 lg:order-1">
              <div className="space-y-3 sm:space-y-4">
            

                <h2
                  className={`leading-[1.05] tracking-tight whitespace-normal break-words ${
                    isDarkMode ? 'text-white' : 'text-black'
                  }`}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 'clamp(2.2rem, 7vw, 4rem)'
                  }}
                >
                  <span className="font-bold">{lang.visaJourney}</span>
                  <br />
                  <span
                    className="font-light"
                    style={{
                      fontSize: 'clamp(1.8rem, 6vw, 3.2rem)',
                      backgroundImage: `linear-gradient(100deg, ${INK} 55%)`,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {lang.nowSeamless}
                  </span>
                </h2>

                <p
                  className={`text-sm sm:text-base md:text-lg leading-relaxed max-w-lg font-light ${
                    isDarkMode ? 'text-white/50' : 'text-black/50'
                  }`}
                >
                  {lang.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2" style={{ perspective: '900px' }}>
                  {features.map((feature, idx) => (
                    <FeatureTile
                      key={idx}
                      idx={idx}
                      feature={feature}
                      isDarkMode={isDarkMode}
                      disableTilt={prefersReducedMotion}
                    />
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ y: -3 }}
                whileTap={{ y: 0, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                onClick={() => (window.location.href = '/apply')}
                className="group relative overflow-hidden flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold whitespace-nowrap text-white rounded-2xl "
                style={{
                  background: `linear-gradient(155deg, ${INK_MID}, ${INK_DARK})`,
                }}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative z-10 flex items-center gap-2.5">
                  {lang.cta}

                  {/* Arrow bubble — raised chip that inverts on hover */}
                  <div
                    className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white transition-all duration-300 group-hover:scale-105"
                  >
                    <ArrowRight
                      className="h-4 w-4 sm:h-4.5 sm:w-4.5 transition-transform duration-300 rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5"
                      style={{ color: INK_DARK }}
                      strokeWidth={2.5}
                    />
                  </div>
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FULLSCREEN VIDEO MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center"
            onClick={closeModal}
          >
            <motion.div
              ref={modalContainerRef}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.5,
              }}
              className="relative w-full h-full bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                ref={modalVideoRef}
                className="w-full h-full object-contain"
                src={subscriptionVideo}
                controls
                autoPlay
                playsInline
                controlsList="nodownload"
              />

              {/* Premium Close Button */}
              <motion.button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all duration-300 hover:scale-110 z-20 border border-white/20 backdrop-blur-sm"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* Bottom Hint */}
              <div
                className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/30 text-xs font-light bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/5 pointer-events-none"
              >
                Press ESC or click ✕ to exit
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ─── FeatureTile — Simple white/black background with 3D tilt ─────
// ═══════════════════════════════════════════════════════════════════
const FeatureTile = ({
  idx,
  feature,
  isDarkMode,
  disableTilt,
}: {
  idx: number;
  feature: { icon: any; label: string };
  isDarkMode: boolean;
  disableTilt: boolean;
}) => {
  const tileRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [fastTransition, setFastTransition] = useState(false);
  const Icon = feature.icon;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (disableTilt || !tileRef.current) return;
      const rect = tileRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const ry = ((x - cx) / cx) * 10;
      const rx = -((y - cy) / cy) * 10;
      setTilt({ rx, ry });
      setFastTransition(true);
    },
    [disableTilt]
  );

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    setFastTransition(false);
  };

  return (
    <motion.div
      ref={tileRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.05, duration: 0.4, ease: 'easeOut' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative"
      style={{
        transformStyle: 'preserve-3d',
        transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(${tilt.rx === 0 && tilt.ry === 0 ? 0 : -3}px)`,
        transition: fastTransition ? 'transform 0.08s ease-out' : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div
        className="relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl overflow-hidden"
        style={{
          transformStyle: 'preserve-3d',
          background: isDarkMode ? '#0c0c0c' : '#ffffff',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        }}
      >
        <div
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5"
          style={{
            transform: 'translateZ(20px)',
            background: `linear-gradient(155deg, ${INK_MID}, ${INK_DARK})`,
          }}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
        </div>

        <span
          className="text-[11px] sm:text-[13px] font-semibold text-center leading-tight"
          style={{ color: isDarkMode ? '#ffffffcc' : '#0b1030b3', transform: 'translateZ(10px)' }}
        >
          {feature.label}
        </span>
      </div>
    </motion.div>
  );
};

export default VideoSection;