import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Play, ArrowRight, Shield, Users, 
  Zap, Globe, Rocket, TrendingUp, 
  X, Diamond
} from 'lucide-react';

const VideoSection = () => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const subscriptionVideo = '/images/laptop/tmmt.mp4';

  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isArabic, setIsArabic] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Track mouse position for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  // ─── Use #0A3269 in both light and dark mode ──────────────────────────
  const accent = '#0A3269';

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
        className={`relative py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 overflow-hidden scroll-mt-20 px-4 sm:px-6 ${
          isDarkMode ? 'bg-black' : 'bg-white'
        }`}
      >
        {/* Background Effects - Subtle */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 -right-20 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ backgroundColor: accent, opacity: isDarkMode ? 0.04 : 0.04 }}
          />
          <div
            className="absolute bottom-0 -left-20 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ backgroundColor: accent, opacity: isDarkMode ? 0.04 : 0.04 }}
          />
        </div>

        <div className="container mx-auto px-1.5 sm:px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-14 xl:gap-20 items-center max-w-7xl mx-auto">
            
            {/* ─── Right Column - Video (unchanged) ────────── */}
            <div
              className="relative px-0 order-1 lg:order-2"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div 
                className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-2xl shadow-black/30 dark:shadow-black/60"
                onClick={openModal}
              >
                <div className="relative aspect-video bg-black">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    src={subscriptionVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30 shadow-2xl">
                      <Play className="h-8 w-8 sm:h-10 sm:w-10 text-white ml-1" strokeWidth={2.5} />
                    </div>
                  </div>
                  
                  {/* Bottom Label */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                    <span className="text-white/70 text-xs font-light bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                      {lang.clickToWatch}
                    </span>
                  </div>

                  {/* Corner Accents */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
                </div>
              </div>
            </div>

            {/* ─── Left Column - Content ──────── */}
            <div className="space-y-5 sm:space-y-6 px-0 order-2 lg:order-1">
              <div className="space-y-3 sm:space-y-4">
                {/* Premium Badge */}
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${
                    isDarkMode ? 'bg-white/5' : 'bg-black/[0.03]'
                  }`}
                >
                  <Diamond className="w-3.5 h-3.5" style={{ color: accent }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: accent }}>
                    Watch Demo
                  </span>
                </div>

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
                    style={{ color: accent, fontSize: 'clamp(1.8rem, 6vw, 3.2rem)' }}
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

                {/* ─── FEATURE CARDS ──── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2">
                  {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05, duration: 0.4, ease: 'easeOut' }}
                        whileHover={{ y: -3 }}
                        className={`group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-colors duration-300 ${
                          isDarkMode ? 'bg-zinc-900' : 'bg-white'
                        }`}
                        style={{
                          boxShadow: isDarkMode
                            ? '0 1px 0 rgba(255,255,255,0.06) inset, 0 16px 28px -20px rgba(0,0,0,0.6)'
                            : '0 1px 0 rgba(0,0,0,0.03) inset, 0 16px 28px -20px rgba(10,50,105,0.2)',
                          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(10,50,105,0.08)'}`,
                        }}
                      >
                        <div
                          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl shadow-sm"
                          style={{ backgroundColor: accent }}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
                        </div>

                        <span className={`text-[11px] sm:text-[13px] font-semibold text-center leading-tight ${
                          isDarkMode ? 'text-white/80' : 'text-black/70'
                        }`}>
                          {feature.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
  onClick={() => window.location.href = '/apply'}
  className="
    group relative overflow-hidden flex items-center justify-center gap-2.5
    w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold whitespace-nowrap
    transition-all duration-300 bg-[#0A3269] text-white
    rounded-md
  "
>
  <span className="relative z-10 flex items-center gap-2.5">
    {lang.cta}
    
    {/* Arrow with solid white background and black icon */}
    <div
      className="
        flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full
        bg-white
        transition-colors duration-300
        group-hover:bg-gray-100
      "
    >
      <ArrowRight 
        className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-black transition-transform duration-300 group-hover:translate-x-1" 
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

export default VideoSection;