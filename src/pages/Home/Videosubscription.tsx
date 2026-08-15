import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Play, ArrowRight, Shield, Users, 
  Zap, Globe, Rocket, TrendingUp, 
  X, Diamond, ChevronRight
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
          <div className={`absolute top-0 -right-20 w-[600px] h-[600px] rounded-full blur-3xl ${
            isDarkMode ? 'bg-[#4A8ABF]/3' : 'bg-[#0A3269]/3'
          }`} />
          <div className={`absolute bottom-0 -left-20 w-[600px] h-[600px] rounded-full blur-3xl ${
            isDarkMode ? 'bg-[#4A8ABF]/3' : 'bg-[#0A3269]/3'
          }`} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl ${
            isDarkMode ? 'bg-[#4A8ABF]/2' : 'bg-[#0A3269]/2'
          }`} />
        </div>

        <div className="container mx-auto px-1.5 sm:px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-14 xl:gap-20 items-center max-w-7xl mx-auto">
            
            {/* ─── Right Column - Video ────────── */}
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
                    isDarkMode 
                      ? 'bg-white/5' 
                      : 'bg-[#0A3269]/5'
                  }`}
                >
                  <Diamond className={`w-3.5 h-3.5 ${
                    isDarkMode ? 'text-white/60' : 'text-[#0A3269]/90'
                  }`} />
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-white/60' : 'text-[#0A3269]/90'
                  }`}>
                    Premium Service
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
                  <span className="relative inline-block">
                    <span 
                      className={`font-light ${
                        isDarkMode ? 'text-[#4A8ABF]' : 'text-[#0A3269]'
                      }`}
                      style={{ fontSize: 'clamp(1.8rem, 6vw, 3.2rem)' }}
                    >
                      {lang.nowSeamless}
                    </span>
                  </span>
                </h2>

                <p 
                  className={`text-sm sm:text-base md:text-lg leading-relaxed max-w-lg font-light ${
                    isDarkMode ? 'text-white/50' : 'text-black/50'
                  }`}
                >
                  {lang.description}
                  <span className={`font-normal block mt-1 ${
                    isDarkMode ? 'text-white/70' : 'text-black/70'
                  }`}>{lang.descriptionHighlight}</span>
                </p>

                {/* ─── FEATURE CARDS ────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
                  {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                          delay: idx * 0.05, 
                          duration: 0.4,
                          ease: "easeOut"
                        }}
                        whileHover={{ 
                          y: -4,
                          transition: { duration: 0.2 }
                        }}
                        className={`group flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-2xl transition-all duration-300 border ${
                          isDarkMode 
                            ? 'bg-black border-white/10 hover:border-white/30 hover:bg-[#1a1a1a]' 
                            : 'bg-[#0A3269]/5 border-[#0A3269]/10 hover:border-[#0A3269]/30 hover:bg-[#0A3269]/10'
                        }`}
                      >
                        {/* Icon */}
                        <div 
                          className={`p-2.5 rounded-xl transition-all duration-300 ${
                            isDarkMode 
                              ? 'bg-white/10 group-hover:bg-white/20' 
                              : 'bg-[#0A3269]/10 group-hover:bg-[#0A3269]/20'
                          }`}
                        >
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                            isDarkMode 
                              ? 'text-white group-hover:text-white' 
                              : 'text-[#0A3269] group-hover:text-[#0A3269]'
                          }`} strokeWidth={2} />
                        </div>
                        
                        {/* Label */}
                        <span className={`text-[11px] sm:text-[13px] md:text-[14px] font-semibold text-center leading-tight transition-colors duration-300 ${
                          isDarkMode 
                            ? 'text-white/80 group-hover:text-white' 
                            : 'text-black/70 group-hover:text-[#0A3269]'
                        }`}>
                          {feature.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Premium CTA Button - Smaller */}
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                onClick={() => window.location.href = '/apply'}
                className={`group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 sm:px-7 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-medium tracking-tight transition-all duration-300 w-auto min-w-[160px] sm:min-w-[180px] ${
                  isDarkMode 
                    ? 'bg-white text-black hover:bg-gray-100' 
                    : 'bg-[#013269] text-white hover:bg-[#1a4a7a]'
                } shadow-lg ${
                  isDarkMode 
                    ? 'shadow-white/10 hover:shadow-white/20' 
                    : 'shadow-[#013269]/30 hover:shadow-[#013269]/40'
                }`}
              >
                <span className="relative z-10  whitespace-nowrap">
                  {lang.cta}
                </span>

                <motion.div
                  className={`relative z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-transform duration-300 group-hover/btn:translate-x-1 ${
                    isDarkMode 
                      ? 'bg-black/30 text-white' 
                      : 'bg-white text-[#013269]'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ArrowRight className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                    isDarkMode ? 'text-black' : 'text-[#013269]'
                  }`} />
                </motion.div>
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