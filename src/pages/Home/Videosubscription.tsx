import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Play, ArrowRight, Shield, Star, Users, CheckCircle, 
  Sparkles, Clock, Award, Zap, Globe, Briefcase, Heart, 
  Rocket, TrendingUp, BadgeCheck, Crown, X, Maximize2, Minimize2, Pause
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
  const [isPlaying, setIsPlaying] = useState(false);

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
        className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 overflow-hidden bg-white dark:bg-[#0A0A0F] scroll-mt-20 px-1.5 sm:px-4"
      >
        {/* Gradient Orbs for dark mode - modern background effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 -right-20 w-[600px] h-[600px] rounded-full bg-[#0A3269]/5 dark:bg-[#4A8ABF]/8 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-[600px] h-[600px] rounded-full bg-[#0A3269]/5 dark:bg-[#4A8ABF]/8 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#0A3269]/3 dark:bg-[#4A8ABF]/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-1.5 sm:px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 xl:gap-20 items-center max-w-7xl mx-auto">
            
            {/* ─── Right Column - Video ────────── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative px-1 sm:px-0 order-1 lg:order-2"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <motion.div 
                className="relative rounded-2xl overflow-hidden shadow-lg shadow-black/10 dark:shadow-black/60 ring-1 ring-gray-200/50 dark:ring-white/10 cursor-pointer group"
                whileHover={!isMobile ? { scale: 1.03 } : {}}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                onClick={openModal}
              >
                <div className="relative aspect-video bg-black/95">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <Play className="h-7 w-7 sm:h-8 sm:w-8 text-white ml-1" strokeWidth={2.5} />
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                    <span className="text-white/50 text-xs font-light bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                      Click to watch
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* ─── Left Column - Content ──────── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5 sm:space-y-6 px-1 sm:px-0 order-2 lg:order-1"
            >
              <div className="space-y-3 sm:space-y-4">
                <h2 
                  className="text-black dark:text-white leading-[1.05] tracking-tight whitespace-normal break-words"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 'clamp(1.8rem, 6vw, 3rem)'
                  }}
                >
                  <span className="font-bold">{lang.visaJourney}</span>
                  <br />
                  <span className="relative inline-block">
                    <span className="text-[#0A3269] dark:text-[#4A8ABF] font-light" style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)' }}>
                      {lang.nowSeamless}
                    </span>
                    <span className="absolute -bottom-2 left-0 w-full h-px bg-[#0A3269]/30 dark:bg-[#4A8ABF]/30 rounded-full" />
                  </span>
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-black/60 dark:text-white/50 leading-relaxed max-w-lg font-light">
                  {lang.description}
                  <span className="text-black dark:text-white/70 font-normal block mt-1">{lang.descriptionHighlight}</span>
                </p>

                {/* ─── BIG MODERN FEATURE CARDS ────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
                  {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -3, scale: 1.02 }}
                        className="group relative flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-2xl bg-white/80 dark:bg-[#4A8ABF]/10 border border-black/5 dark:border-[#4A8ABF]/20 hover:border-[#0A3269]/40 dark:hover:border-[#4A8ABF]/50 hover:bg-white dark:hover:bg-[#4A8ABF]/15 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {/* Icon with Premium Background */}
                        <div className="p-2.5 rounded-xl bg-[#0A3269]/10 dark:bg-[#4A8ABF]/20 group-hover:bg-[#0A3269] dark:group-hover:bg-[#4A8ABF] transition-all duration-300">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A3269] dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300" strokeWidth={2} />
                        </div>
                        
                        {/* Label - Bigger & Bolder */}
                        <span className="text-[11px] sm:text-[13px] md:text-[14px] font-semibold text-black/80 dark:text-white/80 text-center leading-tight group-hover:text-[#0A3269] dark:group-hover:text-[#4A8ABF] transition-colors duration-300">
                          {feature.label}
                        </span>
                        
                        {/* Bottom Accent Line */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#0A3269]/20 dark:bg-[#4A8ABF]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
<motion.button
  whileHover={{ y: -2, scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 320, damping: 20 }}
  onClick={() => window.location.href = '/apply'}
  className="
    group/btn relative inline-flex items-center justify-start gap-1.5 sm:gap-2
    overflow-hidden rounded-full
    px-3.5 sm:px-6
    py-3 sm:py-2.5
    text-[12px] sm:text-[14px] md:text-[15px]
    font-medium tracking-tight
    bg-white dark:bg-black
    text-black dark:text-white
    border border-[#0A3269]/20 dark:border-white/10
    transition-all duration-300
    w-auto
  "
>
  <span className="relative z-10 whitespace-nowrap">
    {lang.cta}
  </span>

  <div
    className="
      relative z-10
      flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9
      items-center justify-center
      rounded-full
      bg-[#0A3269] dark:bg-[#4A8ABF]
      transition-transform duration-300
      group-hover/btn:translate-x-1
    "
  >
    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 text-white dark:text-black" />
  </div>
</motion.button>




            </motion.div>
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
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
            onClick={closeModal}
          >
            <motion.div
              ref={modalContainerRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
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

              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-300 hover:scale-110 z-20 border border-white/10"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/30 text-xs font-light bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5 pointer-events-none">
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