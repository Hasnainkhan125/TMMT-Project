import { ThemeSelector } from '@/components/ui/ThemeSelector';
import SEO from '@/components/SEO/SEO';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { AuthDrawer } from '@/components/auth/AuthDrawer';
import TammatVoiceAgent from '@/components/VoiceAgent/TammatVoiceAgent';
import { useVoiceAgent } from '@/contexts/VoiceAgentContext';
import {
  Rocket,
  Sparkles,
  Flag,
  Send,
  BadgeCheck
} from "lucide-react";
import { Volume2, VolumeX } from 'lucide-react';
import { ChevronRight } from "lucide-react";
import { Twitter, Instagram, Linkedin } from 'lucide-react';
import { Sun, Moon } from "lucide-react";
import { 
 Heart, 
 X, Maximize2, Minimize2
} from 'lucide-react';
import {
  Clock,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Activity,
  CircleCheckBig ,
  Wallet,
  CreditCard
} from "lucide-react";
import { 
   Shield,  Landmark, Car, 
  Users2,  Crown, Bell, 
} from 'lucide-react'
import { Mail } from "lucide-react";
import { LogIn, LogOut } from "lucide-react";
// ✅ Force static generation for low TTFB
export const dynamic = 'force-static';
import { useEffect, useState, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import StartApplicationDialog, { LegacyStartApplicationDialog, _LegacyStartApplicationDialog } from '@/components/Applications/StartApplicationDialog';
// keep dialog imports defined once elsewhere; removing duplicates to fix lint
import { Sheet, SheetContent, SheetTrigger } from '../../components/ui/sheet';
import { Award } from "lucide-react";
// At the top with other imports
import VideoSection from './Videosubscription'; // or whatever the path is to your VideoSection component
// or
// import { BadgeCheck } from "lucide-react";
import checkWhite from './images/checkWhite.png';
import checkDark from './images/checkDark.png';
import servicesImage2 from './images/package.png';
import packagesImageDark from './images/packageDark.png';
import servicesImage3 from './images/servicesCombo.png';
import servicesImageDark from './images/servicesComboDark.png';
import TammatFlowDialog from '@/components/Applications/TammatFlowDialog';
import { Home, Users, Star, IdCard, Building2,  ArrowRight as ArrowRightLucide, Zap, ShieldCheck, Headphones } from 'lucide-react';

import ApplicationFlow from '@/components/Applications/ApplicationFlow';
import WhyTMMTSection from './WhyTMMTSection';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  Play,
  Pause,
  Menu,
  Briefcase,
  Tag,
  HelpCircle,
  CheckCircle,
  ArrowRightIcon,
  ArrowRight,
  FileText,
} from 'lucide-react';
import {
  // Main navigation icons
  LayoutDashboard,
  MessageSquare,
  Gem,
  Compass,
  Lightbulb,
  Grid2x2,
  MessagesSquare,
  BadgePlus,
  House,
  CircleHelp,
  Diamond,
  

} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.tsx';

import TammatLogoWhite from './icons/TMMTLogo.png';
import NotificationCenter from '@/components/Notifications/NotificationCenter';

// import intuitive1 from "./images/intuitive-1.png"
// import intuitive2 from "./images/intuitive-2.png"
// import topRated1 from "./images/top-rated-1.png"
// import topRated2 from "./images/top-rated-2.png"
import icpLogo from './images/icp.png';
import moiLogo from './images/MOI.jpg';
import citizenshipLogo from './images/citizenship.png';
import amerLogo from './images/amer.png';
import { ThemeContext } from '@/contexts/ThemeContext.tsx';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Service } from '@/types/tammat.types';
import { ServiceCard } from '@/components/Services/ServiceCard';
import { SERVICES } from '@/lib/services';
import SubscriptionPage, { SubscriptionPageInner } from '../subscription/SubscriptionPage';
import TammatSupervisor from '@/components/VoiceAgent/TammatSupervisor';
import PackageApplicationDialog from '@/components/Applications/Packageapplicationdialog';
import { PACKAGE_CONFIG } from '@/config/packageDocs';
const ACCENT = 'var(--primary)';
type YouTubeGridProps = {
  videoIds: string[];
};
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface FeaturesContent {
  title: string;
  subtitle: string;
}

const defaultContentFeature: FeaturesContent = {
  title: 'What makes us the best for you.',
  subtitle: 'Discover our unique approach to VISA & Residency',
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Services Section inspired by Hims design
const Services = () => {
  const [open, setOpen] = useState(false);
  const [packages, setPackages] = useState<any[]>([]); // your packages list JSON
  useEffect(() => {
    setPackages(Object.keys(PACKAGE_CONFIG).map((key) => PACKAGE_CONFIG[key]));
  }, []);
  const [showAllServices, setShowAllServices] = useState(false);
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0)
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [queryParams, setQueryParams] = useState<string>('');


const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};


const darkMode = useTheme()
  const isDarkMode = darkMode.currentTheme === 'dark'
  console.log(darkMode.currentTheme)
  // Voice Agent Context - for global voice control
  const {
    state: voiceState,
    closeDialog,
    setServices
  } = useVoiceAgent();

  // Services for voice agent - register with context
  const voiceAgentServices = [
    { id: 'emirates-id', name: 'Emirates ID', category: 'Identity', description: 'Apply for or renew your Emirates ID card' },
    { id: 'residence-visa', name: 'Residence Visa', category: 'Residence', description: 'Apply for UAE residence visa' },
    { id: 'family-visa', name: 'Family Visa', category: 'Family', description: 'Sponsor your family members' },
    { id: 'spouse-visa', name: 'Spouse Visa', category: 'Family', description: 'Sponsor your spouse for UAE residency' },
    { id: 'medical-screening', name: 'Medical Screening', category: 'Medical', description: 'Complete required medical fitness test' },
    { id: 'change-status', name: 'Change Status', category: 'Status', description: 'Change your visa or residency status' },
    { id: 'visa-cancellation', name: 'Visa Cancellation', category: 'Cancellation', description: 'Cancel your current visa' },
    { id: 'golden-visa', name: 'Golden Visa', category: 'Premium', description: 'Apply for 10-year Golden Visa' },
    { id: 'investor-visa', name: 'Investor Visa', category: 'Business', description: 'Visa for investors in UAE' },
    { id: 'partner-visa', name: 'Partner Visa', category: 'Business', description: 'Visa for business partners' },
    { id: 'employment-visa', name: 'Employment Visa', category: 'Work', description: 'Work visa for employees' },
    { id: 'visa-renewal', name: 'Visa Renewal', category: 'Renewal', description: 'Renew your existing visa' },
    
  ];

  // Register services with voice agent context on mount
  useEffect(() => {
    setServices(voiceAgentServices);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync local dialog state with voice agent state
  // When voice agent opens dialog, sync local state
  useEffect(() => {
    if (voiceState.isDialogOpen) {
      setShowStartDialog(true);
      if (voiceState.serviceQuery) {
        setQueryParams(voiceState.serviceQuery);
      }
    }
  }, [voiceState.isDialogOpen, voiceState.serviceQuery, showStartDialog]);

  // When dialog closes locally, sync to context
  const handleDialogClose = (open: boolean) => {
    setShowStartDialog(open);
    if (!open) {
      closeDialog();
    }
  };

const [isArabic, setIsArabic] = useState(false);

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



// Service titles for the animated headline
const serviceTitles = [
  { title: t('services.SupervisorAccess.title'), color: '#E8B4A0', titleColor: '#C97A5C' },
  { title: t('services.fineReduction.title'), color: '#B8A08C', titleColor: '#8E6F57' },
  { title: t('services.partnerVisaCancellation.title'), color: '#A5C7D0', titleColor: '#5E9FB3' },
  { title: t('services.overstayFineChecker.title'), color: '#C89FA5', titleColor: '#A56A75' },
  { title: t('services.abscondingChecker.title'), color: '#E8B4A0', titleColor: '#C97A5C' },
  { title: t('services.nawakas.title'), color: '#B8A08C', titleColor: '#8E6F57' },
  { title: t('services.establishmentCardBanChecker.title'), color: '#A5C7D0', titleColor: '#5E9FB3' },
]
// Auto-cycle through services with flip animation
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentServiceIndex((prev) => (prev + 1) % serviceTitles.length)
  }, 3000) // Change every 3 seconds
  return () => clearInterval(interval)
}, [serviceTitles.length])

// ✅ Video modal state
const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
const videoRef = useRef<HTMLVideoElement>(null);
const modalVideoRef = useRef<HTMLVideoElement>(null);

// ✅ Increase video playback speed for faster experience
useEffect(() => {
  if (videoRef.current) {
    videoRef.current.playbackRate = 1.2;
  }
}, []);

// ✅ Handle modal open
const openVideoModal = () => {
  setIsVideoModalOpen(true);
  setTimeout(() => {
    if (modalVideoRef.current) {
      modalVideoRef.current.playbackRate = 1.2;
      modalVideoRef.current.play().catch(() => {});
    }
  }, 100);
};

return (
  <section className="container mx-auto px-4 pb-16 sm:pb-24">
    <div className="max-w-7xl mx-auto">
      <div className="mb-12">
        {/* ─── VIDEO COMPONENT WITH PLAY OVERLAY ────────────────────────────── */}
        <div className="w-full max-w-10xl mx-auto px-2 sm:px-0">
          <div 
            className="relative rounded-lg sm:rounded-xl overflow-hidden cursor-pointer group"
            onClick={openVideoModal}
          >
            <div className="relative bg-black/95" style={{ aspectRatio: "21/9" }}>
            <video
        className="w-full h-full object-cover"
        src="/images/laptop/subscription-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              
              {/* ✅ Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
<motion.div 
  className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-2xl relative"
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  transition={{ type: "spring", stiffness: 400 }}
>
  {/* ✅ Pulsing ring animation */}
  <motion.span 
    className="absolute inset-0 rounded-full border-2 border-white/20"
    animate={{ 
      scale: [1, 1.3, 1],
      opacity: [0.6, 0, 0.6]
    }}
    transition={{ 
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
  
  {/* ✅ Second delayed pulse ring */}
  <motion.span 
    className="absolute inset-0 rounded-full border-2 border-white/10"
    animate={{ 
      scale: [1, 1.5, 1],
      opacity: [0.4, 0, 0.4]
    }}
    transition={{ 
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 1
    }}
  />
  
  {/* ✅ Icon with subtle animation */}
  <motion.div
    animate={{ 
      scale: [1, 1.05, 1],
      rotate: [0, 2, -2, 0]
    }}
    transition={{ 
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <Play className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 md:h-9 md:w-9 text-white ml-0.5 xs:ml-1" strokeWidth={2.5} />
  </motion.div>
</motion.div>
              </div>
              
              {/* ✅ "Watch Video" Label */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <span className="text-white/80 text-[10px] xs:text-xs sm:text-sm font-medium bg-black/50 backdrop-blur-sm px-3 py-1 xs:px-4 xs:py-1.5 sm:px-5 sm:py-2 rounded-full border border-white/15 flex items-center gap-1.5 xs:gap-2">
  <span className="text-[10px] xs:text-xs sm:text-base">▶</span>
  Watch the full journey
</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
          <div
            className="relative h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px] overflow-hidden"
            style={{ perspective: '1200px' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentServiceIndex}
                initial={{
                  y: 40,
                  opacity: 0,
                  rotateX: 15,
                  scale: 0.95,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  rotateX: 0,
                  scale: 1,
                }}
                exit={{
                  y: -40,
                  opacity: 0,
                  rotateX: -15,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                  opacity: { duration: 0.3 },
                }}
                style={{
                  color: serviceTitles[currentServiceIndex].titleColor,
                  fontFamily: "'Poppins', sans-serif",
                }}
                className="absolute inset-0 font-medium flex items-center"
              >
                <span className="text-[1.7rem] sm:text-[3rem] md:text-[4.5rem] lg:text-[4.5rem] leading-[1.1] break-words max-w-full text-left">
                  {serviceTitles[currentServiceIndex].title}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            className="text-[2rem] -mt-4 md:-tracking-[6px] -tracking-[2px] sm:text-[5rem] md:text-[5rem] lg:text-[4.5rem] font-medium text-foreground"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t('services.personalizedToYou', 'personalized to you')}
          </div>
        </div>

        <p
          className="mt-2 text-text-secondary max-w-x2"
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 'clamp(0.77rem, 1.5vw, 1.3rem)'
          }}
        >
          {t('services.subtitle')}
        </p>
      </div>
    </div>

    <motion.div>
      <div className="relative z-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      </div>

      {/* ================= Service Cards ================= */}
      <section className="pb-10">
        <div className="max-w-[1400px] mx-auto px-2 sm:px-5 lg:px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {[
              {
                name: isArabic ? "المدققون" : "Checkers",
                image: isDarkMode ? checkDark : checkWhite,
                description: isArabic
                  ? "تحقق من غرامات التجاوز، حظر السفر، الاختفاء، النواكاس، والمزيد."
                  : "Check overstay fines, travel bans, absconding, nawakas, and more.",
                cta: isArabic ? "تقديم" : "Apply",
                link: "/customer-dashboard",
                gradient: "from-blue-500/10 to-cyan-500/5",
              },
              {
                name: isArabic ? "الخدمات" : "Services",
                image: isDarkMode ? servicesImageDark : servicesImage3,
                description: isArabic
                  ? "تقديم طلبات تصاريح الدخول، تأشيرة الإقامة، الهوية الإماراتية، التجديدات، وغيرها."
                  : "Apply for entry permits, residence visa, emiratesid, renewals, etc.",
                cta: isArabic ? "تقديم" : "Apply",
                link: "/apply",
                gradient: "from-emerald-500/10 to-teal-500/5",
              },
              {
                name: isArabic ? "الباقات" : "Packages",
                image: isDarkMode ? packagesImageDark : servicesImage2,
                description: isArabic
                  ? "تتيح لك الباقات اختيار التطبيقات المجمعة لمعاملاتك الحكومية"
                  : "Packages allow you to choose bundled applications for your govt transactions",
                cta: isArabic ? "تقديم" : "Apply",
                link: "/packages",
                gradient: "from-purple-500/10 to-pink-500/5",
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                onClick={() => {
                  if (card.link === "/packages") {
                    setOpen(true);
                  } else {
                    navigate(card.link);
                  }
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`
                  group relative flex w-full flex-col 
                  rounded-2xl sm:rounded-3xl overflow-hidden 
                  cursor-pointer 
                  bg-white dark:bg-slate-900/80 
                  border border-slate-200/60 dark:border-slate-700/50 
                  transition-all duration-500 
                  backdrop-blur-sm
                `}
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Premium Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--primary)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Image with Modern Overlay */}
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <img
                    src={card.image}
                    alt={card.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-medium border border-white/20">
                      {card.name}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 p-5 sm:p-6 lg:p-7">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2.5">
                    {card.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light max-w-sm">
                    {card.description}
                  </p>

                  <motion.button
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 320, damping: 20 }}
                    className="
                      group/btn relative inline-flex items-center justify-start gap-4
                      overflow-hidden rounded-full
                      px-4 sm:px-7
                      py-2 sm:py-2.5
                      text-[13px] sm:text-[14px]
                      font-semibold tracking-tight
                      bg-white dark:bg-black
                      text-black dark:text-white
                      border border-black/10 dark:border-white/10
                      transition-all duration-300
                      mt-2
                    "
                  >
                    <span className="relative z-10 whitespace-nowrap">
                      {card.cta}
                    </span>

                    <div
                      className="
                        relative z-10
                        flex h-7 w-7 sm:h-8 sm:w-8
                        items-center justify-center
                        rounded-full
                        bg-[var(--primary)] dark:bg-[#4A8ABF]
                        transition-transform duration-300
                        group-hover/btn:translate-x-1
                      "
                    >
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white dark:text-black" />
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>

  {/* ─── FULLSCREEN VIDEO MODAL ────────────────────────────────────── */}
<AnimatePresence>
  {isVideoModalOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      onClick={() => setIsVideoModalOpen(false)}
    >
      <motion.div
        ref={modalVideoRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full h-full bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ Fullscreen video with all controls */}
       <video
        className="w-full h-full object-cover"
        src="/images/laptop/subscription-video.mp4"
      controls
          autoPlay
          playsInline
          controlsList="nodownload"
          onClick={(e) => e.stopPropagation()}
      />

        {/* Close Button */}
        <button
          onClick={() => setIsVideoModalOpen(false)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all duration-300 hover:scale-110 border border-white/10 z-20"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Fullscreen Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              document.documentElement.requestFullscreen();
            }
          }}
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all duration-300 hover:scale-110 border border-white/10 z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
          </svg>
        </button>

        {/* Close Hint */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/30 text-[10px] sm:text-xs bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5 pointer-events-none">
          Press ESC or click ✕ to close
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      {/* <ApplicationFlow
        open={showStartDialog}
        onOpenChange={handleDialogClose}
        queryParams={queryParams}
      /> */}

        <TammatSupervisor
        position="bottom-right"
        size="md"
        showTranscript={true}
        
        />

      {/* Voice Agent - Floating Button (uses shared context) */}
      <TammatVoiceAgent
        position="bottom-right"
        size="md"
        showTranscript={true}
      />

<PackageApplicationDialog
  open={open}
  onOpenChange={setOpen}
  // packages={packages}   // pass the array straight from your packages JSON
/>
    </section>
  );
};

// Post-Hero Trust Builder Section - Life Upgraded (Mobile-First, Hims-inspired)
const LifeUpgraded = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [activePhoneSlide, setActivePhoneSlide] = useState(0);
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [queryParams, setQueryParams] = useState("")
  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Phone slide content - Milestone achievements that trigger dopamine (fully translated)
  interface PhoneSlide {
    title: string;
    status: string;
    statusColor: string;
    progress: number;
    nextStep: string;
    icon: string;
    items: { done: boolean; text: string }[];
  }
  const phoneSlides: PhoneSlide[] = [
    {
      title: t('lifeUpgraded.cards.emiratesId'),
      status: t('lifeUpgraded.phoneSlides.emiratesId.status'),
      statusColor: 'text-success',
      progress: 100,
      nextStep: t('lifeUpgraded.phoneSlides.emiratesId.nextStep'),
      icon: '🪪',
      items: [
        { done: true, text: t('lifeUpgraded.phoneSlides.emiratesId.items.biometrics') },
        { done: true, text: t('lifeUpgraded.phoneSlides.emiratesId.items.photo') },
        { done: true, text: t('lifeUpgraded.phoneSlides.emiratesId.items.ready') },
      ]
    },
    {
      title: t('lifeUpgraded.cards.medicalTest'),
      status: t('lifeUpgraded.phoneSlides.medicalTest.status'),
      statusColor: 'text-success',
      progress: 100,
      nextStep: t('lifeUpgraded.phoneSlides.medicalTest.nextStep'),
      icon: '🏥',
      items: [
        { done: true, text: t('lifeUpgraded.phoneSlides.medicalTest.items.blood') },
        { done: true, text: t('lifeUpgraded.phoneSlides.medicalTest.items.xray') },
        { done: true, text: t('lifeUpgraded.phoneSlides.medicalTest.items.fitness') },
      ]
    },
    {
      title: t('lifeUpgraded.cards.residenceVisa'),
      status: t('lifeUpgraded.phoneSlides.residenceVisa.status'),
      statusColor: 'text-success',
      progress: 100,
      nextStep: t('lifeUpgraded.phoneSlides.residenceVisa.nextStep'),
      icon: '🏠',
      items: [
        { done: true, text: t('lifeUpgraded.phoneSlides.residenceVisa.items.entry') },
        { done: true, text: t('lifeUpgraded.phoneSlides.residenceVisa.items.status') },
        { done: true, text: t('lifeUpgraded.phoneSlides.residenceVisa.items.stamped') },
      ]
    },
    {
      title: t('lifeUpgraded.cards.bankAccount'),
      status: t('lifeUpgraded.phoneSlides.bankAccount.status'),
      statusColor: 'text-success',
      progress: 100,
      nextStep: t('lifeUpgraded.phoneSlides.bankAccount.nextStep'),
      icon: '🏦',
      items: [
        { done: true, text: t('lifeUpgraded.phoneSlides.bankAccount.items.kyc') },
        { done: true, text: t('lifeUpgraded.phoneSlides.bankAccount.items.activated') },
        { done: true, text: t('lifeUpgraded.phoneSlides.bankAccount.items.online') },
      ]
    },
    {
      title: t('lifeUpgraded.cards.drivingLicense'),
      status: t('lifeUpgraded.phoneSlides.drivingLicense.status'),
      statusColor: 'text-success',
      progress: 100,
      nextStep: t('lifeUpgraded.phoneSlides.drivingLicense.nextStep'),
      icon: '🚗',
      items: [
        { done: true, text: t('lifeUpgraded.phoneSlides.drivingLicense.items.verified') },
        { done: true, text: t('lifeUpgraded.phoneSlides.drivingLicense.items.converted') },
        { done: true, text: t('lifeUpgraded.phoneSlides.drivingLicense.items.issued') },
      ]
    },
  ];

  // Scroll-based phone slide change
  useEffect(() => {
    const handleScroll = () => {
      if (!phoneRef.current) return;
      const rect = phoneRef.current.getBoundingClientRect();
      const scrollProgress = 1 - (rect.top / window.innerHeight);
      const slideIndex = Math.min(
        Math.max(Math.floor(scrollProgress * phoneSlides.length), 0),
        phoneSlides.length - 1
      );
      setActivePhoneSlide(slideIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [phoneSlides.length]);

  const currentSlide = phoneSlides[activePhoneSlide];

  return (
    <section
      ref={containerRef}
      id="life-upgraded"
      className="relative overflow-hidden bg-[#faf8f2] rounded-t-[2rem] border-t-2  "
    >

      {/* Theme-based Gradient Background */}
      <div
        className="absolute inset-0 -z-10 rounded-t-[2rem]"
        style={{
          background: `linear-gradient(to bottom, var(--surface) 0%, var(--surfaceLight) 50%, var(--background) 100%)`
        }}
      />

      {/* Subtle pattern overlay for depth */}
      <div className="absolute inset-0 -z-5 opacity-5 bg-[radial-gradient(circle_at_1px_1px,_var(--textMuted)_1px,_transparent_0)] bg-[length:32px_32px]" />

      {/* Main Content - Mobile First */}
      <div className="relative bg-background z-10 px-4 py-12 sm:py-16 md:py-20">
        {/* Header Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <p className="text-primary text-xs sm:text-sm font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-2 sm:mb-3">
            {t('lifeUpgraded.microLabel')}
          </p>
          <div
            className="text-2xl sm:text-3xl  md:text-4xl lg:text-5xl lg:text-6xl  font-medium text-foreground leading-tight tracking-tight max-w-3xl mx-auto px-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t('lifeUpgraded.headline')}
          </div>
          <p className="mt-4 text-text-secondary text-sm sm:text-base max-w-xl mx-auto">
            {t('lifeUpgraded.trustReinforcement')}
          </p>
        </motion.div>

        {/* Professional Person + iPhone Layout */}
        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">

            {/* Professional Person Image - Ultra Realistic */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[380px] order-2 lg:order-1"
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#e8e0d0]">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
                  alt="Professional businessman in UAE celebrating success"
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
                {/* Premium overlay - subtle gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a2520]/40 via-transparent to-transparent" />

                {/* Floating success badge - matching light yellow theme */}
                {/* <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={isInView ? { scale: 1, rotate: 0 } : {}}
                  transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                  className="absolute bottom-4 left-4 right-4 bg-[#faf8f2]/95 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-xl border border-[#e8e0d0]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#22c55e] flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-[#1a1a1a]">{t("lifeUpgraded.phoneSlides.visa.approved")}</p>
                      <p className="text-[10px] sm:text-xs text-[#6b6560]">{t("lifeUpgraded.phoneSlides.visa.welcome")}</p>
                    </div>
                  </div>
                </motion.div> */}
              </div>
            </motion.div>

            {/* iPhone Mockup with Scroll-changing content */}
            <motion.div
              ref={phoneRef}
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative w-full max-w-[220px] sm:max-w-[260px] order-1 lg:order-2"
            >
              {/* iPhone Frame */}
              <div className="relative rounded-[2.5rem] sm:rounded-[3rem] bg-[#1a1a1a] p-2 sm:p-3 shadow-2xl">
                {/* Dynamic Island */}
                <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-6 sm:h-7 bg-black rounded-full z-20" />

                {/* Screen - Light yellow background matching section */}
                <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-[#faf8f2] aspect-[9/19] overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activePhoneSlide}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="p-3 sm:p-4 pt-10 sm:pt-12 space-y-2 sm:space-y-3"
                    >
                      {/* Status bar hint */}
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[8px] sm:text-[9px] text-text-muted">9:41</span>
                        <div className="flex gap-1">
                          <div className="w-3 sm:w-4 h-1.5 sm:h-2 bg-secondary/30 rounded-full" />
                          <div className="w-3 sm:w-4 h-1.5 sm:h-2 bg-secondary/30 rounded-full" />
                        </div>
                      </div>

                      {/* App header - Milestone achievement */}
                      <div className="bg-[#f5f0e6]/90 backdrop-blur rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-sm border border-[#e8e0d0]">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-lg sm:text-xl">{currentSlide.icon}</span>
                            <div>
                              <p className="text-[9px] sm:text-[10px] text-text-secondary font-medium">{currentSlide.title}</p>
                              <p className={`text-xs sm:text-sm font-bold ${currentSlide.statusColor}`}>{currentSlide.status}</p>
                            </div>
                          </div>
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-success/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 sm:h-2 bg-border rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${currentSlide.progress}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                          />
                        </div>
                      </div>

                      {/* Next step */}
                      <div className="bg-[#f0ebe0] rounded-xl p-2.5 sm:p-3 border-l-3 sm:border-l-4 border-primary">
                        <p className="text-[8px] sm:text-[9px] text-primary font-medium">{t('lifeUpgraded.phoneSlides.complete')}</p>
                        <p className="text-[10px] sm:text-xs font-semibold text-background">{currentSlide.nextStep}</p>
                      </div>

                      {/* Checklist - All done for milestones */}
                      <div className="space-y-1.5 sm:space-y-2 pt-1 sm:pt-2">
                        {currentSlide.items.map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.1 }}
                            className="flex items-center gap-2"
                          >
                            <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center ${item.done ? 'bg-success' : 'border-2 border-primary'}`}>
                              {item.done && <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-background" />}
                            </div>
                            <span className={`text-[9px] sm:text-[10px] ${item.done ? 'text-background' : 'text-text-secondary'}`}>{item.text}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Slide indicators */}
                      <div className="flex justify-center gap-1.5 pt-2 sm:pt-3">
                        {phoneSlides.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${i === activePhoneSlide ? 'w-4 sm:w-6 bg-primary' : 'w-1 sm:w-1.5 bg-border'}`}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Scroll hint for mobile */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="text-center text-[10px] sm:text-xs text-text-secondary mt-3 sm:mt-4 lg:hidden"
              >
                {t('lifeUpgraded.phoneSlides.scrollHint')}
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* CTA Buttons with micro-interactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-10 sm:mt-12 md:mt-16"
        >
          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onMouseDown={() => setButtonPressed('primary')}
            onMouseUp={() => setButtonPressed(null)}
            onMouseLeave={() => setButtonPressed(null)}
          >
            <Button
              asChild
              className={`
                group relative overflow-hidden w-full sm:w-auto
                px-6 sm:px-8 py-3 sm:py-4 bg-primary text-button-text rounded-full 
                font-semibold text-sm sm:text-base shadow-lg
                transition-all duration-300
                ${buttonPressed === 'primary' ? 'shadow-inner bg-primary-hover' : 'hover:shadow-xl hover:bg-primary-hover'}
              `}
            >
              <Link to="/auth">
                <span className="relative z-10 flex items-center gap-2">
                  {t('lifeUpgraded.cta')}
                  <motion.span
                    animate={{ x: buttonPressed === 'primary' ? 5 : 0 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.span>
                </span>
                {/* Ripple effect */}
                <span className="absolute inset-0 bg-surface/20 scale-0 group-active:scale-100 rounded-full transition-transform duration-300" />
              </Link>
            </Button>
          </motion.div>

          {/* <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onMouseDown={() => setButtonPressed('secondary')}
            onMouseUp={() => setButtonPressed(null)}
            onMouseLeave={() => setButtonPressed(null)}
          >
            <Button
              variant="outline"
              className={`
                w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 
                bg-secondary text-white border-0 rounded-full 
                font-medium text-sm sm:text-base
                transition-all duration-300
                ${buttonPressed === 'secondary' ? 'bg-secondary-hover' : 'hover:bg-secondary-hover'}
              `}
            >
              <Link to="/services">Learn More</Link>
            </Button>
          </motion.div> */}
        </motion.div>
      </div>

      {/* Feature Cards Section - Mobile First Grid */}
      <div className="relative z-10 px-4 pb-12 sm:pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Main Feature Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="mb-4 sm:mb-6"
          >
            <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-background mt-12 border border-[#e8dcc8] p-5 sm:p-8 md:p-12">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {t('lifeUpgradedCards.yourCompleteJourney')}
                  </div>
                  <p className="text-text-secondary text-sm sm:text-base md:text-lg max-w-md mx-auto md:mx-0">
                    {t('lifeUpgraded.description')}
                  </p>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      asChild
                      className="mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-secondary-hover hover:bg-secondary-hover/70 text-white rounded-full font-medium text-sm sm:text-base transition-all duration-300"
                    >
                      <Link to="/services">{t('lifeUpgradedCards.exploreServices')}</Link>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Two Column Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Card 1 - Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-[#fef9f0] border border-[#e8e0d0] p-5 sm:p-6 md:p-8 min-h-[280px] sm:min-h-[320px] cursor-pointer shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-xl sm:text-2xl md:text-3xl font-medium text-[#1a1a1a] mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {t('lifeUpgradedCards.trackProgress')}
              </div>
              <p className="text-[#6b6560] text-xs sm:text-sm mb-4 sm:mb-6">{t('lifeUpgradedCards.realTimeUpdates')}</p>

              <div className="bg-[#f5edd8] backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-[#e8dcc8]">
                <p className="text-[9px] sm:text-[10px] text-primary tracking-wide uppercase mb-1 sm:mb-2">{t('lifeUpgradedCards.asOfToday')}</p>
                <div className="text-4xl sm:text-5xl md:text-6xl font-medium text-background" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  99.8<span className="text-2xl sm:text-3xl">%</span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">{t('lifeUpgradedCards.successRate')}</p>

                <div className="flex gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                  <div>
                    <div className="text-lg sm:text-xl font-medium text-background">5-7</div>
                    <p className="text-[9px] sm:text-[10px] text-text-muted">{t('lifeUpgradedCards.daysAvg')}</p>
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-medium text-success">24/7</div>
                    <p className="text-[9px] sm:text-[10px] text-text-muted">{t('lifeUpgradedCards.support')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2 - Services */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-[#fef9f0] border border-[#e8e0d0] p-5 sm:p-6 md:p-8 min-h-[280px] sm:min-h-[320px] cursor-pointer shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-xl sm:text-2xl md:text-3xl font-medium text-[#1a1a1a] mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {t('lifeUpgradedCards.allServices')}
              </div>
              <p className="text-text-secondary text-xs sm:text-sm mb-4 sm:mb-6">{t('lifeUpgradedCards.allServicesDesc')}</p>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  { label: t('lifeUpgraded.cards.residenceVisa'), highlight: true },
                  { label: t('lifeUpgraded.cards.familyVisa'), highlight: false },
                  { label: t('lifeUpgraded.cards.emiratesId'), highlight: false },
                  { label: t('lifeUpgraded.cards.medicalTest'), highlight: false },
                  { label: t('lifeUpgraded.cards.goldenVisa'), highlight: true },
                  { label: t('lifeUpgraded.cards.bankAccount'), highlight: false },
                ].map((tag, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setQueryParams(tag.label)
                      setShowStartDialog(true)
                    }}
                    className={`
                      px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium cursor-pointer
                      transition-all duration-200
                      ${tag.highlight ? 'bg-primary text-button-text' : 'bg-border text-foreground hover:bg-primary/20'}
                    `}
                  >
                    {tag.label}
                  </motion.span>
                ))}
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 md:left-8">
                <Button
                  asChild
                  variant="outline"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-secondary-hover hover:bg-secondary-hover/70 text-white border-0 rounded-full text-xs sm:text-sm font-medium"
                >
                  <span onClick={() => setShowStartDialog(true)}>{t(`features.browseServices`)}</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee-slow {
          0% { transform: rotate(-15deg) translateX(0); }
          100% { transform: rotate(-15deg) translateX(-33.33%); }
        }
        @keyframes marquee-slow-reverse {
          0% { transform: rotate(15deg) translateX(-33.33%); }
          100% { transform: rotate(15deg) translateX(0); }
        }
        .animate-marquee-slow {
          animation: marquee-slow 40s linear infinite;
        }
        .animate-marquee-slow-reverse {
          animation: marquee-slow-reverse 45s linear infinite;
        }
      `}</style>
      <StartApplicationDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
        queryParams={queryParams}
      />
    </section>
  );
};

// Testimonials Section - Jeton-inspired vertical stacking cards
const Testimonials = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const reviews = [
    {
      id: 1,
      title: t('testimonials.reviews.review1.title'),
      text: t('testimonials.reviews.review1.text'),
      name: t('testimonials.reviews.review1.name'),
      role: t('testimonials.reviews.review1.role'),
      initials: 'AK',
      color: 'bg-primary',
    },
    {
      id: 2,
      title: t('testimonials.reviews.review2.title'),
      text: t('testimonials.reviews.review2.text'),
      name: t('testimonials.reviews.review2.name'),
      role: t('testimonials.reviews.review2.role'),
      initials: 'PS',
      color: 'bg-accent',
    },
    {
      id: 3,
      title: t('testimonials.reviews.review3.title'),
      text: t('testimonials.reviews.review3.text'),
      name: t('testimonials.reviews.review3.name'),
      role: t('testimonials.reviews.review3.role'),
      initials: 'MR',
      color: 'bg-success',
    },
    {
      id: 4,
      title: t('testimonials.reviews.review4.title'),
      text: t('testimonials.reviews.review4.text'),
      name: t('testimonials.reviews.review4.name'),
      role: t('testimonials.reviews.review4.role'),
      initials: 'SL',
      color: 'bg-warning',
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Full Background Image - Ultra Realistic High Quality */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=3000&auto=format&fit=crop"
          alt="Professional team collaboration in modern office"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1512]/95 via-[#2a2520]/80 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 sm:py-28 md:py-32">


        
        {/* Headline - Consistent with Your visa journey step by step
Services section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 sm:mb-16 md:mb-20"
        >
          <div
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-medium text-white -tracking-[4px]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t('testimonials.headline')}{' '}
            <span className="text-primary">{t('testimonials.headlineHighlight')}</span>
          </div>
        </motion.div>

        {/* Stacking Cards - Scroll-triggered animations */}
        <div className="max-w-2xl space-y-4 sm:space-y-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: -100, rotateY: -15 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: false, margin: '-100px' }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1]
              }}
              whileHover={{
                scale: 1.03,
                x: 20,
                transition: { duration: 0.3 }
              }}
              className="group cursor-pointer"
            >
              <div className="bg-white/95 dark:bg-surface/95  p-10 backdrop-blur-xl rounded-2xl sm:rounded-3xl sm:p-6 md:p-20 shadow-2xl border border-white/20 transition-all duration-300 hover:shadow-primary/20 hover:shadow-3xl">
                {/* Title */}
                <div
                  className="text-xl sm:text-2xl font-semibold text-foreground border-b border-border pb-2 mb-2 sm:mb-3"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {review.title}
                </div>

                {/* Review Text */}
                <p className="text-text-secondary text-base  sm:text-lg leading-tight mb-4 sm:mb-5">
                  {review.text}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <motion.div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${review.color} flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <span className="text-foreground font-bold text-base sm:text-lg">{review.initials}</span>
                  </motion.div>
                  <div>
                    <p className="font-semibold text-foreground text-base sm:text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>{review.name}</p>
                    <p className="text-text-muted text-sm sm:text-base">{review.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features/Insights Section - What Tammat Offers
const TammatFeatures = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('individuals');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const categories = [
    { id: 'individuals', label: t('tammatFeatures.categories.individuals') },
    { id: 'families', label: t('tammatFeatures.categories.families') },
    { id: 'businesses', label: t('tammatFeatures.categories.businesses') },
    { id: 'compliance', label: t('tammatFeatures.categories.compliance') },
  ];

  const featureItems = [
    {
      id: 'residency',
      category: 'individuals',
      title: t('tammatFeatures.items.residency.title'),
      description: t('tammatFeatures.items.residency.description'),
      tags: ['Entry Permit', 'Residence Visa', 'Status Change', 'Renewals'],
      image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=800&auto=format&fit=crop',
      icon: '🏠',
    },
    {
      id: 'family',
      category: 'families',
      title: t('tammatFeatures.items.family.title'),
      description: t('tammatFeatures.items.family.description'),
      tags: ['Spouse Visa', 'Dependents', 'Parent Visa', 'Reunification'],
      image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=800&auto=format&fit=crop',
      icon: '👨‍👩‍👧‍👦',
    },
    {
      id: 'identity',
      category: 'individuals',
      title: t('tammatFeatures.items.identity.title'),
      description: t('tammatFeatures.items.identity.description'),
      tags: ['Medical', 'Biometrics', 'ID Issuance', 'Renewals'],
      image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=800&auto=format&fit=crop',
      icon: '🪪',
    },
    {
      id: 'business',
      category: 'businesses',
      title: t('tammatFeatures.items.business.title'),
      description: t('tammatFeatures.items.business.description'),
      tags: ['Trade License', 'Investor Visa', 'Freelance', 'PRO'],
      image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=800&auto=format&fit=crop',
      icon: '🏢',
    },
    {
      id: 'employees',
      category: 'businesses',
      title: t('tammatFeatures.items.employees.title'),
      description: t('tammatFeatures.items.employees.description'),
      tags: ['Work Permits', 'Bulk Processing', 'Digital Workers', 'Compliance'],
      image: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=800&auto=format&fit=crop',
      icon: '👥',
    },
    {
      id: 'compliance',
      category: 'compliance',
      title: t('tammatFeatures.items.compliance.title'),
      description: t('tammatFeatures.items.compliance.description'),
      tags: ['Expiry Alerts', 'Reminders', 'Fine Avoidance', 'Grace Period'],
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop',
      icon: '⏰',
    },
  ];

  const filteredFeatures = activeCategory === 'all'
    ? featureItems
    : featureItems.filter(item => item.category === activeCategory ||
      (activeCategory === 'individuals' && item.id === 'identity') ||
      (activeCategory === 'individuals' && item.id === 'residency'));

  return (
    <section
      ref={containerRef}
      className="relative bg-background py-16 sm:py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-12 sm:mb-16"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-12">
            <div
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-[1] text-foreground tracking-tight max-w-2xl"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {t('tammatFeatures.headline')}{' '}
              <span className="text-primary">{t('tammatFeatures.headlineHighlight')}</span>{' '}
              {t('tammatFeatures.headlineEnd')}
            </div>
            <div className="lg:max-w-md">
              <p className="text-lg sm:text-xl text-text-secondary font-medium mb-2">
                {t('tammatFeatures.measureMatters')}
              </p>
              <p className="text-text-muted text-sm sm:text-base">
                {t('tammatFeatures.subheadline')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-12 border-b border-border pb-4"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300
                ${activeCategory === cat.id
                  ? 'bg-foreground text-background shadow-lg'
                  : ' text-text-secondary hover:bg-background/10 hover:text-foreground border border-border'}
              `}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
            >
              <div className="relative h-full rounded-2xl sm:rounded-3xl overflow-hidden  border border-border shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Image */}
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/40 to-transparent" />

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <div className="text-xl sm:text-2xl font-medium text-white mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {feature.title}
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm line-clamp-2">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="p-4 sm:p-5">
                  <p className="text-[10px] sm:text-xs text-text-muted mb-2 sm:mb-3">
                    {t('tammatFeatures.includesServices', { count: feature.tags.length })}
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {feature.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 sm:px-3 py-1 bg-border rounded-full text-[10px] sm:text-xs text-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {feature.tags.length > 3 && (
                      <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">
                        +
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12 sm:mt-16"
        >
          <Button
            asChild
            className="px-8 sm:px-10 py-4 sm:py-5 bg-primary hover:bg-primary-hover text-button-text rounded-full font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span onClick={() => setShowStartDialog(true)}>
              {t('tammatFeatures.cta')} →
            </span>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};



// Service Journey Section — Modern bento grid, glass cards, lucide icons, progress-ring steps

const ServiceJourney = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('residenceVisa');
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showFlowDialog, setShowFlowDialog] = useState(false);
  const [showAppFlow, setShowAppFlow] = useState(false);

  const [isArabic, setIsArabic] = useState(false);

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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-advance steps
  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, [isInView]);

  const tabs = [
    { id: 'residenceVisa', label: t('serviceJourney.tabs.residenceVisa'), Icon: Home },
    { id: 'familyVisa', label: t('serviceJourney.tabs.familyVisa'), Icon: Users },
    { id: 'goldenVisa', label: t('serviceJourney.tabs.goldenVisa'), Icon: Star },
    { id: 'emiratesId', label: t('serviceJourney.tabs.emiratesId'), Icon: IdCard },
    { id: 'businessSetup', label: t('serviceJourney.tabs.businessSetup'), Icon: Building2 },
  ];

  const journeyImages: Record<string, string[]> = {
    residenceVisa: [
      'https://photoaid.com/blog/wp-content/uploads/2025/05/how-to-take-passport-photo-with-iphone.jpg',
      'https://d2eq3fbwkhut3u.cloudfront.net/articles/8152133052195992/banner/all-you-need-to-know-about-GDRFA.png',
      'https://theimcentre.com/wp-content/uploads/2021/04/best-quality-healthcare-story-img.jpg',
      'https://cdn.prod.website-files.com/61845f7929f5aa517ebab941/67766281ba687b8fcec33823_Emirates%20ID%20Explained.jpg',
      'https://media.istockphoto.com/id/157643745/photo/stamping-passports.jpg?s=612x612&w=0&k=20&c=uaXi7hvH_tmKFv8dA_TB0AJ86iyAVWQgTUWU7G1UfjA=',
    ],
    familyVisa: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1Rc73NKNQzNJQpmPkSV0adCFhi9UHfuUKDRcVhNGYuQ&s=10',
      'https://images.aeonmedia.co/images/117538c2-9aa5-4de2-8829-7b7c6a2bb8e9/sz-final-gettyimages-1319979885.jpg?top=0&left=657&cropWidth=2629&cropHeight=2629&width=3840&quality=75&format=auto',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_1SGzOAqu3kf634G0lW8rzfmpIaBHmYQgQ7W21DoCIQ&s=10',
      'https://content.kaspersky-labs.com/se/com/content/en-global/images/repository/isc/48-Biometrics/48-Biometrics.jpg',
      'https://media.istockphoto.com/id/157643745/photo/stamping-passports.jpg?s=612x612&w=0&k=20&c=uaXi7hvH_tmKFv8dA_TB0AJ86iyAVWQgTUWU7G1UfjA=',
    ],
    goldenVisa: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1oS9BVrmGU9X8haDLsB2xFW_YLLHD4oKUqSZgie72eg&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRxqV3bCORUx7lN4BzOZsOqf2ehek5QjPMsunHoHnGFw&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTh_ZDqhh8q-zOSNWEUPYcsNYygPJW_OYANRKT6V20jw&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS60zm1NlooLSfokhq95XVqGHXU4oden-08ClxXmuI2bg&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTASPhQYpb5V-dUFrAEIRHsRCZa7rKCI_P_EwgbM6xcuw&s=10',
    ],
    emiratesId: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE3vQVc3Dowb5nL__jBmEHl2Q61gQSQpsDdDG7-ujjlQ&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScil2Rnh2z2kphIQUhl9x7ImBDMT31I_FxYhPJ-WHdgg&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS60zm1NlooLSfokhq95XVqGHXU4oden-08ClxXmuI2bg&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvYJ2JSP7UDgEg9Okm2dGMwkYL_1sjGJYtKkT-8wGOhQ&s',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5PhlRuOhlDAQfNYSZT7TH0W5KL_2_i_Wu4p622C6z7Q&s=10',
    ],
    businessSetup: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQ-Od3Wal8EAANxInHhUbD08_CX-GNE9_c6M5UcXATqg&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu4Yw-u1u24LZHBDw0LrgoOHialHUn4cSFoYQseMIkVw&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4sVWEPq4wtLxUPXqQtyjub7YbRRM--TLFwaXCjzKi6Q&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXZ1XveQFpZkv3h-valb8fJvfiPQUPBZwr5obZ4ReODA&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRA9z_6V4aa3uPp4ouhKjA1tkykzCQ6HzxYQCdDcSyvA&s=10',
    ],
  };

  const getSteps = (tabId: string) => [
    {
      title: t(`serviceJourney.${tabId}.step1.title`),
      description: t(`serviceJourney.${tabId}.step1.description`),
      duration: t(`serviceJourney.${tabId}.step1.duration`),
    },
    {
      title: t(`serviceJourney.${tabId}.step2.title`),
      description: t(`serviceJourney.${tabId}.step2.description`),
      duration: t(`serviceJourney.${tabId}.step2.duration`),
    },
    {
      title: t(`serviceJourney.${tabId}.step3.title`),
      description: t(`serviceJourney.${tabId}.step3.description`),
      duration: t(`serviceJourney.${tabId}.step3.duration`),
    },
    {
      title: t(`serviceJourney.${tabId}.step4.title`),
      description: t(`serviceJourney.${tabId}.step4.description`),
      duration: t(`serviceJourney.${tabId}.step4.duration`),
    },
    {
      title: t(`serviceJourney.${tabId}.step5.title`),
      description: t(`serviceJourney.${tabId}.step5.description`),
      duration: t(`serviceJourney.${tabId}.step5.duration`),
    },
  ];

  const currentSteps = getSteps(activeTab);
  const currentImages = journeyImages[activeTab];
  const activeTabMeta = tabs.find(tb => tb.id === activeTab)!;

  return (
    <section
      ref={containerRef}
      className="relative py-20 sm:py-28 md:py-2 bg-white dark:bg-black border-t-2 border-x-2 border-[#0A3269]/20 dark:border-[#4A8ABF]/20 rounded-t-[2rem] overflow-hidden px-0"
    >
      {/* ================= Premium Hero Header ================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.45, 0.7, 0.45],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-[-18rem] h-[52rem] w-[52rem] -translate-x-1/2 rounded-full bg-[#0A3269]/15 dark:bg-[#4A8ABF]/15 blur-[180px]"
        />

        <motion.div
          animate={{
            x: [-30, 20, -30],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[-12rem] top-32 h-[34rem] w-[34rem] rounded-full bg-sky-500/10 dark:bg-sky-500/10 blur-[150px]"
        />

        <motion.div
          animate={{
            x: [20, -30, 20],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-10rem] bottom-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[#0A3269]/10 dark:bg-[#4A8ABF]/10 blur-[150px]"
        />

        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px,currentColor 1px,transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80 dark:to-black/80" />
      </div>

      <div className="container relative z-10 mx-auto max-w-[1500px] px-0 sm:px-5 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-15"
        >
          <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
              <h2
                className="mt-8 w-full max-w-none font-bold leading-[0.95] tracking-[-0.04em] text-black dark:text-white whitespace-normal break-words"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 700,
                  fontVariationSettings: "'opsz' 144",
                  fontSize: 'clamp(2rem, 8vw, 3rem)'
                }}
              >
                {t("serviceJourney.headline")}
                <br />
                <span className="text-[#0A3269] dark:text-[#4A8ABF] font-normal">
                  {t("serviceJourney.headlineHighlight")}
                </span>
              </h2>
            </div>
          </div>
        </motion.div>

        {/* Premium Modern Segmented Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12 flex justify-center px-2 sm:px-0"
        >
          <div
            className="relative flex w-full max-w-fit overflow-x-auto scrollbar-hide rounded-2xl lg:rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl p-1.5 "
          >
            {tabs.map((tab) => {
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setActiveStep(0);
                  }}
                  className={`
                    group relative flex shrink-0 items-center gap-2 rounded-2xl px-3 sm:px-5 lg:px-7 py-2.5 sm:py-3 transition-all duration-300
                    ${active ? "text-black dark:text-white" : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"}
                  `}
                >
                  {active && (
                    <motion.div
                      layoutId="active-service-tab"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                      className="absolute inset-0 overflow-hidden rounded-2xl bg-white dark:bg-black shadow-[0_12px_35px_rgba(0,0,0,.15)] dark:shadow-[0_10px_35px_rgba(255,255,255,.12)] -z-10"
                    >
                      <motion.span
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.35) 50%, transparent 80%)",
                        }}
                        initial={{ x: "-120%" }}
                        animate={{ x: "120%" }}
                        transition={{ duration: 1, ease: "easeInOut", delay: 0.1 }}
                      />
                    </motion.div>
                  )}

                  {!active && (
                    <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-black/[0.03] dark:bg-white/[0.05] transition-opacity duration-300" />
                  )}

                  <div
                    className={`
                      relative z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl transition-all duration-300
                      ${active ? "bg-[#0A3269] dark:bg-[#4A8ABF] text-white shadow-[0_6px_20px_rgba(10,50,105,.35)] dark:shadow-[0_6px_20px_rgba(74,138,191,.35)] scale-105" : "bg-black/[0.05] dark:bg-white/[0.06] group-hover:scale-105"}
                    `}
                  >
                    <tab.Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.2} />
                  </div>

                  <span className="relative z-10 text-xs sm:text-[15px] lg:text-base font-semibold whitespace-nowrap">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 px-2 sm:px-0">
          {/* Main Timeline Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm border border-[#0A3269]/20 dark:border-[#4A8ABF]/20 relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 opacity-10 hidden sm:block">
              <motion.div
                className="absolute inset-0 border-2 border-[#0A3269]/30 dark:border-[#4A8ABF]/30 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-8 border-2 border-[#0A3269]/20 dark:border-[#4A8ABF]/20 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-16 border-2 border-[#0A3269]/10 dark:border-[#4A8ABF]/10 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            <div className="mb-5 sm:mb-8">
              <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0A3269]/15 dark:bg-[#4A8ABF]/15 flex items-center justify-center shrink-0">
                  <activeTabMeta.Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A3269] dark:text-[#4A8ABF]" />
                </div>
                <div
                  className="text-lg sm:text-2xl font-medium text-black dark:text-white"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t(`serviceJourney.${activeTab}.title`)}
                </div>
              </div>
              <p className="text-black/50 dark:text-white/40 text-xs sm:text-base">
                {t(`serviceJourney.${activeTab}.description`)}
              </p>
              <div className="mt-2.5 sm:mt-3 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#0A3269]/10 dark:bg-[#4A8ABF]/10 text-[#0A3269] dark:text-[#4A8ABF] rounded-full text-[11px] sm:text-sm font-medium">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#0A3269] dark:bg-[#4A8ABF] rounded-full animate-pulse" />
                {t(`serviceJourney.${activeTab}.totalDuration`)}
              </div>
            </div>

            <div className="relative">
              <div className="space-y-3 sm:space-y-5">
                {currentSteps.map((step, index) => (
                  <motion.div
                    key={`${activeTab}-step-${index}`}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.08,
                      ease: "easeOut",
                    }}
                    whileHover={{ x: 4, y: -2 }}
                    onClick={() => setActiveStep(index)}
                    className={`
                      group relative flex items-start gap-3 sm:gap-5 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 cursor-pointer overflow-hidden border backdrop-blur-xl transition-all duration-300
                      ${activeStep === index ? "border-[#0A3269]/40 dark:border-[#4A8ABF]/40 bg-[#0A3269]/10 dark:bg-[#4A8ABF]/10 shadow-md shadow-[#0A3269]/10 dark:shadow-[#4A8ABF]/10" : "border-[#0A3269]/20 dark:border-[#4A8ABF]/20 bg-white/70 dark:bg-black/30 hover:bg-white/80 dark:hover:bg-black/40 hover:border-[#0A3269]/30 dark:hover:border-[#4A8ABF]/30 hover:shadow-md"}
                    `}
                  >
                    <div className="relative flex-shrink-0">
                      {activeStep === index && (
                        <motion.div layoutId="activeRing" className="absolute -inset-1.5 sm:-inset-2 rounded-full border-2 border-[#0A3269]/40 dark:border-[#4A8ABF]/40" />
                      )}
                      <div
                        className={`
                          relative flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300
                          ${activeStep === index ? "bg-[#0A3269] dark:bg-[#4A8ABF] text-white shadow-md shadow-[#0A3269]/30 dark:shadow-[#4A8ABF]/30" : activeStep > index ? "bg-green-500 text-white" : "bg-black/5 dark:bg-white/10 text-black/40 dark:text-white/40 border border-[#0A3269]/20 dark:border-[#4A8ABF]/20"}
                        `}
                      >
                        {activeStep > index ? "✓" : index + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="mb-1 sm:mb-2 flex items-center justify-between gap-2 sm:gap-3">
                        <h4 className="text-sm sm:text-base font-semibold text-black dark:text-white truncate">
                          {step.title}
                        </h4>
                        <span
                          className={`
                            shrink-0 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold
                            ${activeStep === index ? "bg-[#0A3269]/15 dark:bg-[#4A8ABF]/15 text-[#0A3269] dark:text-[#4A8ABF]" : "bg-black/5 dark:bg-white/10 text-black/40 dark:text-white/40"}
                          `}
                        >
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm leading-5 sm:leading-7 text-black/50 dark:text-white/40">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 25, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                whileHover={{ y: -3 }}
                className="group relative overflow-hidden mt-5 sm:mt-8 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 rounded-2xl sm:rounded-3xl border border-[#0A3269]/20 dark:border-[#4A8ABF]/20 bg-white/80 dark:bg-black/30 backdrop-blur-2xl p-4 sm:p-5 lg:p-6 ransition-all duration-500"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-[#0A3269]/15 dark:bg-[#4A8ABF]/15 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex w-full items-center gap-3 sm:gap-4 min-w-0">
                  <div className="flex h-11 w-11 sm:h-14 sm:w-14 lg:h-16 lg:w-16 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-[#0A3269]/20 dark:border-[#4A8ABF]/20 bg-gradient-to-br from-[#0A3269]/20 dark:from-[#4A8ABF]/20 via-[#0A3269]/10 dark:via-[#4A8ABF]/10 to-transparent shadow-lg shadow-[#0A3269]/10 dark:shadow-[#4A8ABF]/10 transition-all duration-300 group-hover:scale-105">
                    <Award className="h-5 w-5 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-[#0A3269] dark:text-[#4A8ABF]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.22em] font-semibold text-black/40 dark:text-white/40">
                      Completed
                    </p>
                    <h4 className="mt-1 text-sm sm:text-base md:text-lg font-semibold leading-snug text-black dark:text-white break-words">
                      {t(`serviceJourney.${activeTab}.completion`)}
                    </h4>
                    <p className="mt-1 text-[11px] sm:text-xs md:text-sm leading-relaxed text-black/40 dark:text-white/40 break-words">
                      Everything is ready. Continue your application anytime.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column - Bento Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 xs:gap-4 sm:gap-5">
            {/* Featured Image Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="group relative col-span-2 w-full h-48 xs:h-56 sm:h-72 md:h-80 lg:h-[28rem] overflow-hidden rounded-xl xs:rounded-2xl sm:rounded-[28px] lg:rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg shadow-slate-900/20 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-900/30 border border-white/5"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${activeTab}-${activeStep}`}
                  src={currentImages[activeStep]}
                  alt={currentSteps[activeStep]?.title}
                  className="absolute inset-0 w-full h-full object-conten transition-transform duration-1000 ease-out group-hover:scale-110"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
              <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0A3269]/10 dark:from-[#4A8ABF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="absolute left-3 top-3 xs:left-4 xs:top-4 sm:left-6 sm:top-6 z-10">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-1 xs:gap-1.5 px-2 py-1 xs:px-2.5 xs:py-1.5 sm:px-3 sm:py-1.5 rounded-full backdrop-blur-xl border shadow-lg transition-all duration-300 hover:scale-105 bg-white/90 border-white/20 shadow-black/5 dark:bg-black/50 dark:border-white/10 dark:shadow-black/20"
                >
                  <span className="text-[8px] xs:text-[9px] sm:text-[12px] md:text-[13px] font-medium transition-colors duration-300 text-slate-700 dark:text-white/90 tracking-wide">
                    <span className="text-[#0A3269] dark:text-[#4A8ABF] font-semibold">0{activeStep + 1}</span>
                    <span className="mx-1 text-slate-300 dark:text-white/20">/</span>
                    <span className="text-slate-400 dark:text-white/40">{currentSteps.length}</span>
                  </span>
                </motion.div>
              </div>

              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-0 left-0 right-0 p-3 xs:p-4 sm:p-6 lg:p-8 z-10"
              >
                <h2 className="text-sm xs:text-base sm:text-xl md:text-2xl lg:text-[2rem] font-bold text-white tracking-tight leading-tight drop-shadow-lg line-clamp-2">
                  {currentSteps[activeStep]?.title}
                </h2>
                <p className="mt-1 xs:mt-1.5 max-w-[95%] xs:max-w-[90%] sm:max-w-[90%] text-[10px] xs:text-xs sm:text-sm text-white/60 leading-relaxed drop-shadow-md line-clamp-2 xs:line-clamp-2 sm:line-clamp-none">
                  {currentSteps[activeStep]?.description}
                </p>
                <div className="mt-2 xs:mt-3 sm:mt-4 md:mt-5">
                  <div className="mb-1 xs:mb-1.5 sm:mb-2 flex items-center justify-between">
                    <span className="text-[9px] xs:text-[10px] sm:text-[10px] font-medium text-white/40 uppercase tracking-[0.15em]">
                      Progress
                    </span>
                    <span className="text-[11px] xs:text-[12px] sm:text-[12px] font-semibold text-white/80">
                      {String(activeStep + 1).padStart(2, '0')}
                      <span className="text-white/30 font-medium">
                        /{String(currentSteps.length).padStart(2, '0')}
                      </span>
                    </span>
                  </div>

                  <div className="relative h-2 xs:h-2 sm:h-2.5 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm">
                    <motion.div
                      initial={false}
                      animate={{ width: `${((activeStep + 1) / currentSteps.length) * 100}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="relative h-full rounded-full bg-gradient-to-r from-[#0A3269] to-[#4A8ABF] dark:from-[#4A8ABF] dark:to-[#4A8ABF]"
                    >
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                          width: '40%',
                        }}
                      />
                    </motion.div>

                    <div className="absolute inset-0 flex items-center justify-between px-0.5">
                      {currentSteps.map((_, i) => {
                        const isActive = i === activeStep;
                        const isCompleted = i < activeStep;
                        return (
                          <button
                            key={i}
                            onClick={() => setActiveStep(i)}
                            className="relative z-10 group"
                          >
                            <div className={`
                              h-2 w-2 xs:h-2 xs:w-2 sm:h-2.5 sm:w-2.5 rounded-full transition-all duration-300
                              ${isActive ? 'bg-white scale-125 shadow-lg shadow-white/30' : isCompleted ? 'bg-white/60' : 'bg-white/20'}
                            `} />
                            {isActive && (
                              <div className="absolute inset-[-3px] rounded-full border border-white/30 animate-ping" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-1.5 xs:mt-2 flex items-center justify-between">
                    <span className="text-[7px] xs:text-[7px] sm:text-[8px] font-medium text-white/20 uppercase tracking-[0.2em]">
                      Start
                    </span>
                    <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
                      {currentSteps.map((step, i) => (
                        <span
                          key={i}
                          className={`
                            text-[7px] xs:text-[8px] sm:text-[9px] font-medium transition-all duration-300 hidden xs:inline-block
                            ${i === activeStep ? 'text-white/80' : i < activeStep ? 'text-white/40' : 'text-white/15'}
                          `}
                        >
                          {step.title?.split(' ').slice(0, 1).join(' ')}
                        </span>
                      ))}
                    </div>
                    <span className="text-[7px] xs:text-[7px] sm:text-[8px] font-medium text-white/20 uppercase tracking-[0.2em]">
                      Done
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Success Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative w-full col-span-2 md:col-span-1 rounded-3xl border border-[#E2E8F0] dark:border-[#4A8ABF]/20 bg-white dark:bg-[#0A0A0F] p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] dark:border-[#4A8ABF]/20 bg-gray-50 dark:bg-[#4A8ABF]/10 px-3 py-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A3269] dark:bg-[#4A8ABF]">
                      <ShieldCheck className="h-3.5 w-3.5 text-white dark:text-black" />
                    </div>
                    <div className="leading-tight">
                      <p className="text-[9px] font-medium uppercase tracking-wider text-gray-500 dark:text-white/40">
                        {t('successCard.verified')}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-900 dark:text-white">
                        {t('successCard.successRate')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <h2 className="flex items-start text-[44px] sm:text-[52px] font-bold tracking-tight leading-none text-gray-900 dark:text-white">
                      99.8
                      <span className="ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] dark:border-[#4A8ABF]/20 bg-gray-50 dark:bg-[#4A8ABF]/10 text-xs font-semibold text-gray-900 dark:text-white">
                        %
                      </span>
                    </h2>
                    <p className="mt-2 max-w-xs sm:max-w-sm text-sm leading-6 text-gray-500 dark:text-white/60">
                      {t('successCard.approvedText')}
                      <span className="font-medium text-[#0A3269] dark:text-[#4A8ABF]">
                        {t('successCard.expertReview')}
                      </span>
                      {t('successCard.processText')}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A3269] dark:bg-[#4A8ABF]">
                    <Award className="h-4 w-4 text-white dark:text-black" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white dark:border-[#0A0A0F] bg-[#0A3269] dark:bg-[#4A8ABF]">
                    <CircleCheckBig className="h-3 w-3 text-white dark:text-black" />
                  </div>
                </div>
              </div>

              <div className="my-4 h-px bg-gray-100 dark:bg-[#4A8ABF]/20" />

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-100 dark:border-[#4A8ABF]/20 bg-gray-50 dark:bg-[#4A8ABF]/10 p-4 hover:border-[#0A3269]/30 dark:hover:border-[#4A8ABF]/40 transition-all duration-300">
                  <TrendingUp className="mb-3 h-4 w-4 text-[#0A3269] dark:text-[#4A8ABF]" />
                  <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">99.8%</p>
                  <span className="text-xs text-gray-500 dark:text-white/40">{t('successCard.approval')}</span>
                </div>

                <div className="rounded-2xl border border-gray-100 dark:border-[#4A8ABF]/20 bg-gray-50 dark:bg-[#4A8ABF]/10 p-4 hover:border-[#0A3269]/30 dark:hover:border-[#4A8ABF]/40 transition-all duration-300">
                  <Activity className="mb-3 h-4 w-4 text-[#0A3269] dark:text-[#4A8ABF]" />
                  <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">24/7</p>
                  <span className="text-xs text-gray-500 dark:text-white/40">{t('successCard.monitoring')}</span>
                </div>

                <div className="rounded-2xl border border-gray-100 dark:border-[#4A8ABF]/20 bg-gray-50 dark:bg-[#4A8ABF]/10 p-4 hover:border-[#0A3269]/30 dark:hover:border-[#4A8ABF]/40 transition-all duration-300">
                  <Users className="mb-3 h-4 w-4 text-[#0A3269] dark:text-[#4A8ABF]" />
                  <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">250+</h3>
                  <span className="text-xs text-gray-500 dark:text-white/40">{t('successCard.expertAdvisors')}</span>
                </div>

                <div className="rounded-2xl border border-gray-100 dark:border-[#4A8ABF]/20 bg-gray-50 dark:bg-[#4A8ABF]/10 p-4 hover:border-[#0A3269]/30 dark:hover:border-[#4A8ABF]/40 transition-all duration-300">
                  <ShieldCheck className="mb-3 h-4 w-4 text-[#0A3269] dark:text-[#4A8ABF]" />
                  <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">A+</p>
                  <span className="text-xs text-gray-500 dark:text-white/40">{t('successCard.rating')}</span>
                </div>
              </div>
            </motion.div>

            {/* CTA Card */}
            <div
              onClick={() => navigate("/apply")}
              className="hidden md:flex relative h-full flex-col cursor-pointer overflow-hidden rounded-3xl border border-white/10 p-8"
            >
              <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1600&auto=format&fit=crop')" }} />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/80 to-transparent" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black/20 via-black/10 to-transparent" />
              <div className="absolute inset-0 -z-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-40 translate-x-40" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl translate-y-40 -translate-x-40" />
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent" />

              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-2 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/80">{t('ctaCard.trustedPlatform')}</span>
              </div>

              <div className="mt-6 flex flex-1 flex-col">
                <h2 className="max-w-lg">
                  <span className="block text-sm font-medium tracking-wider text-white/60 uppercase mb-2">{t('ctaCard.journeyBegins')}</span>
                  <span className="block text-4xl font-bold text-white leading-tight">{t('ctaCard.startYour')}</span>
                  <span className="block text-5xl font-bold text-white mt-1 leading-tight">{t('ctaCard.dreamJourney')}</span>
                </h2>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70 font-light">{t('ctaCard.description')}</p>

                <div className="mt-8">
                  <div className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm shadow-xl shadow-black/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/40 active:scale-95 cursor-pointer group">
                    <span>{t('ctaCard.applyNow')}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/10">
                  <div className="flex items-center gap-8 text-xs text-white/60 font-light">
                    <div className="flex items-center gap-2.5">
                      <div className="flex -space-x-1.5">
                        <div className="w-6 h-6 rounded-full bg-white/20 border border-white/10 flex items-center justify-center text-[8px] font-bold text-white">✓</div>
                        <div className="w-6 h-6 rounded-full bg-white/15 border border-white/10 flex items-center justify-center text-[8px] font-bold text-white">✓</div>
                        <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[8px] font-bold text-white">✓</div>
                      </div>
                      <span>{t('ctaCard.applications')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{t('ctaCard.successRate')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{t('ctaCard.support')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



      </div>
      <StartApplicationDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
        queryParams={""}
      />
      <TammatFlowDialog
        open={showFlowDialog}
        onOpenChange={setShowFlowDialog}
      />
      {/* <ApplicationFlow
        open={showAppFlow}
        onOpenChange={setShowAppFlow}
        queryParams=""
      /> */}


     {/* ================= What Does TMMT Membership Include? ================= */}
<section className="relative py-16 sm:py-20 lg:py-28 bg-white dark:bg-black overflow-hidden">
  {/* Subtle ambient glow */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#0A3269]/5 dark:bg-[#4A8ABF]/10 rounded-full blur-[120px]" />
    <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#0A3269]/3 dark:bg-[#4A8ABF]/8 rounded-full blur-[100px]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0A3269]/3 dark:bg-[#4A8ABF]/5 rounded-full blur-[150px]" />
  </div>

  {/* Grid pattern */}
  <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" style={{
    backgroundImage: `
      linear-gradient(rgba(10,50,105,0.2) 1px, transparent 1px),
      linear-gradient(90deg, rgba(10,50,105,0.2) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px'
  }} />

  <div className="container mx-auto px-4 sm:px-6 relative z-10">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-14 lg:mb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] tracking-[-0.02em] text-black dark:text-white"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <span className="font-bold text-[#1a1a1a] dark:text-white">
            {isArabic ? 'ماذا تشمل عضوية' : 'What Does TMMT Membership'}
          </span>
          <br className="hidden sm:block" />
          <span className="text-[#0A3269] dark:text-[#4A8ABF] font-light">
            {isArabic ? 'TMMT؟' : 'Include?'}
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-4 max-w-3xl mx-auto text-gray-500 dark:text-white/50 text-sm sm:text-base lg:text-[19px] leading-relaxed px-4 sm:px-0"
        >
          {isArabic 
            ? 'تمنحك TMMT وصولاً مباشراً إلى خبراء لديهم سنوات من الخبرة في الإجراءات والخدمات الحكومية في الإمارات، مما يساعدك على اتخاذ القرارات الصحيحة قبل اتخاذ أي إجراء.'
            : 'TMMT gives you direct access to specialists with years of experience in UAE government procedures and services, helping you make the right decisions before taking action.'
          }
        </motion.p>
      </div>

      {/* Service Cards - Premium Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7">
        {[
          {
            icon: Shield,
            title: isArabic ? 'الإقامة والتأشيرات' : 'Residency & Visas',
            items: isArabic 
              ? ['إصدار التأشيرات والتجديدات والإلغاءات', 'تأشيرات السياحة والزيارة', 'كفالة العائلة', 'تحويل الكفالة', 'تتبع الطلبات', 'الغرامات والقيود']
              : ['Visa issuance, renewals & cancellations', 'Tourist & visit visas', 'Family sponsorship', 'Sponsorship transfers', 'Application tracking', 'Fines & restrictions'],
            gradient: 'from-[#0A3269]/5 to-[#1A4A8A]/5'
          },
          {
            icon: Landmark,
            title: isArabic ? 'الهوية الإماراتية وجوازات السفر' : 'Emirates ID & Passports',
            items: isArabic
              ? ['إصدار الهوية الإماراتية وتجديدها', 'تتبع الطلبات', 'تحديثات التوصيل', 'تجديد جوازات السفر والإرشاد']
              : ['Emirates ID issuance & renewals', 'Application tracking', 'Delivery updates', 'Passport renewals & guidance'],
            gradient: 'from-[#0A3269]/5 to-[#1A4A8A]/5'
          },
          {
            icon: Building2,
            title: isArabic ? 'التراخيص التجارية والأعمال' : 'Business & Trade Licenses',
            items: isArabic
              ? ['اختيار النشاط التجاري المناسب', 'اختيار الترخيص التجاري المناسب', 'فهم تكاليف التأسيس', 'مراجعات السلطات والتصاريح', 'بطاقات المنشأة', 'تغييرات الشركاء والموافقات']
              : ['Choosing the right business activity', 'Selecting the right trade license', 'Understanding setup costs', 'Authority & permission reviews', 'Establishment cards', 'Partner changes & approvals'],
            gradient: 'from-[#0A3269]/5 to-[#1A4A8A]/5'
          },
          {
            icon: Car,
            title: isArabic ? 'المركبات والقيادة' : 'Vehicles & Driving',
            items: isArabic
              ? ['شراء وبيع المركبات', 'نقل الملكية', 'التسجيل والتأمين والفحص', 'رخص القيادة', 'الإجراءات المرورية والغرامات']
              : ['Buying & selling vehicles', 'Ownership transfers', 'Registration, insurance & testing', 'Driving licenses', 'Traffic procedures & fines'],
            gradient: 'from-[#0A3269]/5 to-[#1A4A8A]/5'
          },
          {
            icon: Users2,
            title: isArabic ? 'خدمات العائلة' : 'Family Services',
            items: isArabic
              ? ['إجراءات الزواج', 'توثيق المستندات', 'الترجمة القانونية', 'طلبات العائلة والدعم']
              : ['Marriage procedures', 'Document attestation', 'Legal translation', 'Family applications & support'],
            gradient: 'from-[#0A3269]/5 to-[#1A4A8A]/5'
          },
          {
            icon: Briefcase,
            title: isArabic ? 'التوظيف والقوى العاملة' : 'Employment & Workforce',
            items: isArabic
              ? ['تصاريح العمل', 'كفالة الموظفين', 'العمالة المنزلية', 'إجراءات التوظيف']
              : ['Work permits', 'Employee sponsorship', 'Domestic workers', 'Employment procedures'],
            gradient: 'from-[#0A3269]/5 to-[#1A4A8A]/5'
          }
        ].map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + (idx * 0.06), duration: 0.5 }}
            className="group relative rounded-2xl border border-gray-200 dark:border-[#4A8ABF]/10 bg-gradient-to-br from-white to-gray-50/50 dark:from-black dark:to-[#0A1628] p-5 sm:p-7 hover:border-[#0A3269]/40 dark:hover:border-[#4A8ABF]/40 hover:shadow-[0_20px_60px_-20px_rgba(10,50,105,0.15)] dark:hover:shadow-[0_20px_60px_-20px_rgba(74,138,191,0.15)] transition-all duration-500 overflow-hidden"
          >
            {/* Gradient Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A3269]/0 via-[#0A3269]/0 to-[#1A4A8A]/0 group-hover:from-[#0A3269]/5 group-hover:via-[#0A3269]/3 group-hover:to-[#1A4A8A]/5 transition-all duration-700" />
            
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0A3269] via-[#1A4A8A] to-[#0A3269] dark:from-[#4A8ABF] dark:via-[#4A8ABF] dark:to-[#4A8ABF] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Glow effect on hover */}
            <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-[#0A3269]/5 dark:bg-[#4A8ABF]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2.5 sm:p-3 rounded-xl bg-gray-100 dark:bg-[#4A8ABF]/10 group-hover:bg-[#0A3269] dark:group-hover:bg-[#4A8ABF] transition-all duration-500 shadow-md group-hover:shadow-[0_8px_24px_-8px_rgba(10,50,105,0.3)] dark:group-hover:shadow-[0_8px_24px_-8px_rgba(74,138,191,0.3)]">
                  <section.icon className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300" strokeWidth={1.75} />
                </div>
                <h4 className="font-bold text-black dark:text-white text-sm sm:text-lg group-hover:text-[#0A3269] dark:group-hover:text-[#4A8ABF] transition-colors duration-300">
                  {section.title}
                </h4>
              </div>
              <ul className="space-y-1.5 sm:space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 dark:text-white/50 group-hover:text-gray-600 dark:group-hover:text-white/70 transition-colors duration-300">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A3269] dark:text-[#4A8ABF] shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full Service + Smart Renewals - Premium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8 sm:mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="group relative rounded-2xl border border-gray-200 dark:border-[#4A8ABF]/10 bg-gradient-to-br from-gray-50/80 to-white dark:from-[#0A1628] dark:to-black p-5 sm:p-8 hover:border-[#0A3269]/40 dark:hover:border-[#4A8ABF]/40 hover:shadow-[0_20px_60px_-20px_rgba(10,50,105,0.12)] dark:hover:shadow-[0_20px_60px_-20px_rgba(74,138,191,0.15)] transition-all duration-500 overflow-hidden"
        >
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-[#0A3269]/5 dark:bg-[#4A8ABF]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-gray-200 dark:bg-[#4A8ABF]/10 group-hover:bg-[#0A3269] dark:group-hover:bg-[#4A8ABF] transition-all duration-500 shadow-md group-hover:shadow-[0_8px_24px_-8px_rgba(10,50,105,0.3)] dark:group-hover:shadow-[0_8px_24px_-8px_rgba(74,138,191,0.3)]">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300" strokeWidth={1.75} />
            </div>
            <h4 className="font-bold text-black dark:text-white text-base sm:text-xl group-hover:text-[#0A3269] dark:group-hover:text-[#4A8ABF] transition-colors duration-300">
              {isArabic ? 'معالجة الخدمة الكاملة' : 'Full Service Processing'}
            </h4>
          </div>
          <p className="text-xs sm:text-base text-gray-500 dark:text-white/50 leading-relaxed">
            {isArabic 
              ? 'إذا كنت تفضل عدم التعامل مع العملية بنفسك، يمكن لـ TMMT إكمال العملية بأكملها نيابة عنك مقابل رسوم الخدمة بالإضافة إلى الرسوم الحكومية.'
              : 'If you prefer not to handle the process yourself, TMMT can complete the entire process on your behalf for service fees plus government fees.'
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="group relative rounded-2xl border border-gray-200 dark:border-[#4A8ABF]/10 bg-gradient-to-br from-gray-50/80 to-white dark:from-[#0A1628] dark:to-black p-5 sm:p-8 hover:border-[#0A3269]/40 dark:hover:border-[#4A8ABF]/40 hover:shadow-[0_20px_60px_-20px_rgba(10,50,105,0.12)] dark:hover:shadow-[0_20px_60px_-20px_rgba(74,138,191,0.15)] transition-all duration-500 overflow-hidden"
        >
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#0A3269]/5 dark:bg-[#4A8ABF]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-gray-200 dark:bg-[#4A8ABF]/10 group-hover:bg-[#0A3269] dark:group-hover:bg-[#4A8ABF] transition-all duration-500 shadow-md group-hover:shadow-[0_8px_24px_-8px_rgba(10,50,105,0.3)] dark:group-hover:shadow-[0_8px_24px_-8px_rgba(74,138,191,0.3)]">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300" strokeWidth={1.75} />
            </div>
            <h4 className="font-bold text-black dark:text-white text-base sm:text-xl group-hover:text-[#0A3269] dark:group-hover:text-[#4A8ABF] transition-colors duration-300">
              {isArabic ? 'تنبيهات التجديد الذكية' : 'Smart Renewal Alerts'}
            </h4>
          </div>
          <p className="text-xs sm:text-base text-gray-500 dark:text-white/50 leading-relaxed mb-3">
            {isArabic 
              ? 'تلقي تذكيرات عبر واتساب أو البريد الإلكتروني قبل انتهاء صلاحية:'
              : 'Receive reminders through WhatsApp or email before the expiry of:'
            }
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {isArabic 
              ? ['جوازات السفر', 'التأشيرات', 'الهوية الإماراتية', 'الرخص التجارية', 'بطاقات المنشأة', 'تصاريح العمل', 'رخص القيادة', 'تسجيلات المركبات']
              : ['Passports', 'Visas', 'Emirates IDs', 'Trade licenses', 'Establishment cards', 'Work permits', 'Driving licenses', 'Vehicle registrations']
            .map((item) => (
              <span 
                key={item} 
                className="text-[9px] sm:text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gray-100 dark:bg-[#4A8ABF]/10 text-black dark:text-white border border-gray-200 dark:border-[#4A8ABF]/20 group-hover:border-[#0A3269]/30 dark:group-hover:border-[#4A8ABF]/30 group-hover:text-[#0A3269] dark:group-hover:text-[#4A8ABF] group-hover:bg-[#0A3269]/10 dark:group-hover:bg-[#4A8ABF]/10 transition-all duration-300"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* How Can TMMT Help You? - Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 sm:mt-10 relative rounded-2xl border border-gray-200 dark:border-[#4A8ABF]/10 bg-gradient-to-br from-white to-gray-50/50 dark:from-black dark:to-[#0A1628] p-5 sm:p-8 lg:p-10 hover:border-[#0A3269]/40 dark:hover:border-[#4A8ABF]/40 hover:shadow-[0_20px_60px_-20px_rgba(10,50,105,0.12)] dark:hover:shadow-[0_20px_60px_-20px_rgba(74,138,191,0.15)] transition-all duration-500 overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#0A3269]/5 dark:bg-[#4A8ABF]/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-[#0A3269]/3 dark:bg-[#4A8ABF]/3 blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#0A3269]/10 dark:bg-[#4A8ABF]/10 shadow-md shadow-[#0A3269]/10 dark:shadow-[#4A8ABF]/10">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#0A3269] dark:text-[#4A8ABF]" strokeWidth={1.75} />
            </div>
            <h4 className="font-bold text-black dark:text-white text-base sm:text-xl">
              {isArabic ? 'كيف يمكن لـ' : 'How Can'} <span className="text-[#0A3269] dark:text-[#4A8ABF]">TMMT</span> {isArabic ? 'مساعدتك؟' : 'Help You?'}
            </h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {isArabic 
              ? ['تجنب غرامات التجديد المتأخرة', 'تجنب اختيار تأسيس الأعمال الخاطئ', 'تجنب التكاليف والرسوم غير الضرورية', 'تجنب الأخطاء المكلفة في الإجراءات الحكومية', 'توفير الوقت والجهد', 'اتخاذ قرارات مستنيرة بثقة قبل اتخاذ أي إجراء']
              : ['Avoid late renewal fines', 'Avoid choosing the wrong business setup', 'Avoid unnecessary costs and fees', 'Avoid costly mistakes in government procedures', 'Save time and effort', 'Make informed decisions with confidence before taking action']
            .map((text) => (
              <div key={text} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-white/60 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 dark:bg-[#4A8ABF]/5 border border-gray-100 dark:border-[#4A8ABF]/10 hover:bg-[#0A3269]/5 dark:hover:bg-[#4A8ABF]/10 hover:border-[#0A3269]/20 dark:hover:border-[#4A8ABF]/20 transition-all duration-300 group">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A3269] dark:text-[#4A8ABF] shrink-0 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Founding Members Section - Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="mt-8 sm:mt-10 relative rounded-2xl border-2 border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-br from-amber-50/90 to-orange-50/60 dark:from-amber-950/30 dark:to-orange-950/15 p-5 sm:p-8 lg:p-10 hover:border-amber-500/50 dark:hover:border-amber-500/40 transition-all duration-500 overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-amber-500/5 blur-3xl" />
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/20 shadow-md shadow-amber-500/20">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="font-bold text-black dark:text-white text-base sm:text-xl">
                  {isArabic ? 'الأعضاء المؤسسون' : 'Founding Members'}
                </h4>
                <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full mt-1">
                  {isArabic ? 'وقت محدود' : 'Limited Time'}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-base text-gray-600 dark:text-white/60 max-w-md leading-relaxed">
              {isArabic 
                ? 'كن من بين أول 1,000 عضو واحصل على مزايا حصرية مدى الحياة.'
                : 'Be among the first 1,000 members and get exclusive lifetime benefits.'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-5">
            {[
              { icon: BadgeCheck, title: isArabic ? 'شارة العضو المؤسس' : 'Founding Member Badge', desc: isArabic ? 'شارة حصرية على حسابك تظهر وضعك كعضو مؤسس.' : 'Exclusive badge on your account showing your founding member status.' },
              { icon: Gem, title: isArabic ? 'أسعار مدى الحياة' : 'Lifetime Pricing', desc: isArabic ? 'احتفظ بأسعار العضوية الحالية إلى الأبد — حتى مع زيادة الأسعار.' : 'Keep your current membership rates forever — even as prices increase.' },
              { icon: Sparkles, title: isArabic ? 'مزايا حصرية' : 'Exclusive Benefits', desc: isArabic ? 'الوصول إلى الميزات المميزة عند إضافتها إلى المنصة.' : 'Access to premium features as they are added to the platform.' }
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-black/30 border border-amber-200/30 dark:border-amber-800/20 hover:border-amber-500/30 dark:hover:border-amber-500/20 transition-all duration-300 group">
                <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors duration-300">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
                </div>
                <div>
                  <h5 className="font-semibold text-black dark:text-white text-xs sm:text-sm">{item.title}</h5>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-white/50 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-[10px] sm:text-sm text-amber-700 dark:text-amber-300/80 text-center font-medium">
              {isArabic 
                ? 'مقتصرة على أول 1,000 عضو. قد تزيد الأسعار في المستقبل.'
                : 'Limited to the first 1,000 members. Prices may increase in the future.'
              }
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </div>
</section>
    </section>
  );
};



// FAQ Section - Smooth accordion animations
const FAQSection = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const faqItems = [
    { id: 1, question: t('faq.items.q1.question'), answer: t('faq.items.q1.answer') },
    { id: 2, question: t('faq.items.q2.question'), answer: t('faq.items.q2.answer') },
    { id: 3, question: t('faq.items.q3.question'), answer: t('faq.items.q3.answer') },
    { id: 4, question: t('faq.items.q4.question'), answer: t('faq.items.q4.answer') },
    { id: 5, question: t('faq.items.q5.question'), answer: t('faq.items.q5.answer') },
    { id: 6, question: t('faq.items.q6.question'), answer: t('faq.items.q6.answer') },
  ];

  return (
    <section ref={containerRef} className="relative py-20 sm:py-28 md:py-32 bg-background border-t-2 border-x-2 border-primary/20 rounded-t-[2rem]">
      <div className="container mx-auto px-4">
        {/* Headline - Consistent styling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 sm:mb-16 md:mb-20"
        >
          <div
            className="text-[5rem] -mt-4 -tracking-[6px] sm:text-[5rem] md:text-[5rem] lg:text-[5rem] font-medium text-foreground leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t('faq.headline')}{' '}
            <span className="text-primary">{t('faq.headlineHighlight')}</span>
          </div>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border-b border-border/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-6 sm:py-8 flex items-center justify-between text-left group"
              >
                <div
                  className="text-xl sm:text-2xl md:text-3xl font-medium text-foreground pr-4"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {item.question}
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${openIndex === index ? 'bg-foreground text-background' : 'bg-border text-foreground'
                    }`}
                >
                  <span className="text-xl sm:text-2xl font-light">+</span>
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 sm:pb-8 text-text-secondary text-base sm:text-lg leading-relaxed max-w-3xl">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Email Capture Section - Modern, Premium Design
const EmailCapture = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isArabic, setIsArabic] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
// ─── Translation Constants ──────────────────────────────────────────
const translations = {
  en: {
    heading: 'Get Your Free',
    headingHighlight: 'Government Guidance',
    description: 'Everything you need to know about UAE visas, Emirates ID, fines, business setup, and all government procedures. Expert insights from professionals with 10+ years of experience.',
    placeholder: 'Enter your email address',
    cta: 'Get Free Guide',
    terms: 'By downloading, you agree to our',
    termsLink: 'Terms & Conditions',
    privacyLink: 'Privacy Policy',
    unsubscribe: 'Unsubscribe anytime.',
    mute: 'Mute',
    unmute: 'Unmute',
    muted: 'Muted',
    unmuted: 'Unmuted'
  },
  ar: {
    badge: 'استشارة خبير مجانية',
    heading: 'احصل على',
    headingHighlight: 'إرشاد حكومي مجاني',
    description: 'كل ما تحتاج معرفته عن تأشيرات الإمارات، الهوية الإماراتية، الغرامات، تأسيس الأعمال، وجميع الإجراءات الحكومية. رؤى خبراء من محترفين لديهم أكثر من 10 سنوات من الخبرة.',
    placeholder: 'أدخل بريدك الإلكتروني',
    cta: 'احصل على الدليل المجاني',
    terms: 'بتحميلك، فإنك توافق على',
    termsLink: 'الشروط والأحكام',
    privacyLink: 'سياسة الخصوصية',
    unsubscribe: 'يمكنك إلغاء الاشتراك في أي وقت.',
    mute: 'كتم الصوت',
    unmute: 'إلغاء كتم الصوت',
    muted: 'مكتوم',
    unmuted: 'غير مكتوم'
  }
};

const lang = translations[isArabic ? 'ar' : 'en'];

// Intersection Observer to detect when section is in view
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (videoRef.current && !hasStarted) {
          videoRef.current.play().catch(() => {});
          setHasStarted(true);
        }
      } else {
        if (videoRef.current && hasStarted) {
          videoRef.current.pause();
        }
      }
    },
    { threshold: 0.2 }
  );

  if (containerRef.current) {
    observer.observe(containerRef.current);
  }

  return () => {
    if (containerRef.current) {
      observer.unobserve(containerRef.current);
    }
  };
}, [hasStarted]);

useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden && videoRef.current) {
      videoRef.current.pause();
    } else if (!document.hidden && videoRef.current) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);

const toggleSound = () => {
  if (videoRef.current) {
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }
};

// Handle modal open with auto-fullscreen
const openModal = () => {
  setIsModalOpen(true);
  setTimeout(() => {
    if (modalVideoRef.current) {
      modalVideoRef.current.play().catch(() => {});
      requestFullscreen();
    }
  }, 100);
};

// Handle modal close
const closeModal = () => {
  if (modalVideoRef.current) {
    modalVideoRef.current.pause();
  }
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  setIsModalOpen(false);
};

// Request fullscreen
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

// Handle fullscreen change
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

return (
  <>
    <section ref={containerRef} className="relative bg-white dark:bg-black overflow-hidden">
      {/* Ambient Glow Effects - Subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#0A3269]/5 dark:bg-[#4A8ABF]/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#0A3269]/3 dark:bg-[#4A8ABF]/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0A3269]/3 dark:bg-[#4A8ABF]/8 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern Overlay - Subtle */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(10,50,105,0.03) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container mx-auto px-0 sm:px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Main Card - Clean */}
          <div className="relative rounded-3xl sm:rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden border border-[#E2E8F0] dark:border-[#4A8ABF]/20 bg-white dark:bg-[#0A0A0F] shadow-2xl shadow-[#0A3269]/5 dark:shadow-[#4A8ABF]/10">
            
            {/* Background Image with Overlay - Clean */}
            <div className="absolute inset-0">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcPFn8w41Do-AU84eTh-TDGEJII7tle_SO02AvzlhUrA&s=10"
                alt="Dubai skyline modern"
                className="w-full h-full object-cover opacity-10 dark:opacity-20"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/95 via-white/90 to-white/80 dark:from-[#0A0A0F]/95 dark:via-[#0A0A0F]/90 dark:to-[#0A0A0F]/80" />
            </div>

            {/* Content - Video FIRST on mobile */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 xl:gap-20 p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20">
              
              {/* ─── Right - Video (Shows FIRST on mobile) ────────────── */}
              <div className="flex-1 w-full lg:w-auto order-1 lg:order-2">
                <motion.div
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="relative max-w-md mx-auto lg:ml-auto w-full"
                >
                  {/* Video Card - Clickable */}
                  <div 
                    className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#4A8ABF]/20 shadow-xl shadow-[#0A3269]/5 dark:shadow-[#4A8ABF]/10 bg-black w-full h-[200px] sm:h-[200px] md:h-[380px] lg:h-[550px] xl:h-[650px] cursor-pointer group"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onClick={openModal}
                  >
                    <video
                      ref={videoRef}
                      src="/images/laptop/sufiyan.mp4"
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A3269]/10 dark:from-[#4A8ABF]/10 via-transparent to-transparent" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-2xl transition-transform duration-300 group-hover:scale-110">
                        <Play className="h-8 w-8 sm:h-10 sm:w-10 text-white ml-1" strokeWidth={2.5} />
                      </div>
                    </div>
                    
                    {/* Sound Toggle Button - Shows on hover */}
                    {isHovering && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSound();
                        }}
                        className="absolute bottom-4 right-4 z-10"
                        aria-label={isMuted ? lang.unmute : lang.mute}
                      >
                        <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-black/80 hover:scale-110">
                          {isMuted ? (
                            <VolumeX className="h-4 w-4 text-white" strokeWidth={1.5} />
                          ) : (
                            <Volume2 className="h-4 w-4 text-white" strokeWidth={1.5} />
                          )}
                        </div>
                      </button>
                    )}

                    {/* Sound Status Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
                      {isMuted ? (
                        <VolumeX className="h-2.5 w-2.5 text-white/60" strokeWidth={1.5} />
                      ) : (
                        <Volume2 className="h-2.5 w-2.5 text-white/80" strokeWidth={1.5} />
                      )}
                      <span className="text-[8px] text-white/60">
                        {isMuted ? lang.muted : lang.unmuted}
                      </span>
                    </div>

                    {/* Click to play hint */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                      <span className="text-white/60 text-xs font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                        Click to watch
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ─── Left - Content (Shows SECOND on mobile) ──────────── */}
              <div className="flex-1 max-w-3xl order-2 lg:order-1">
         

                {/* Heading - Clean */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="
                    font-black
                    leading-[1.05]
                    tracking-[-0.03em]
                    text-gray-900 dark:text-white
                    text-[2rem]
                    xs:text-[2.5rem]
                    sm:text-[3.5rem]
                    md:text-[4.5rem]
                    lg:text-[5rem]
                    xl:text-[5.5rem]
                    2xl:text-[6rem]
                    max-w-4xl
                  "
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {lang.heading}
                  <span className="block mt-1 sm:mt-2 text-[#0A3269] dark:text-[#4A8ABF] font-bold">
                    {lang.headingHighlight}
                  </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="
                    mt-3 sm:mt-4
                    max-w-xl
                    text-gray-500 dark:text-white/60
                    text-sm
                    sm:text-base
                    lg:text-lg
                    leading-relaxed
                    sm:leading-relaxed
                  "
                >
                  {lang.description}
                </motion.p>

                {/* Email Capture Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="mt-6 sm:mt-8 w-full max-w-lg"
                >
                  <div className="flex flex-col sm:flex-row items-stretch gap-3">

                    {/* Modern Email Input - Clean */}
                    <div
                      className={`
                        group relative flex-1 flex items-center gap-3
                        overflow-hidden
                        rounded-2xl
                        border
                        ${focused
                          ? 'border-[#0A3269] dark:border-[#4A8ABF] ring-2 ring-[#0A3269]/20 dark:ring-[#4A8ABF]/20'
                          : 'border-gray-200 dark:border-[#4A8ABF]/20'
                        }
                        bg-white dark:bg-white/5
                        transition-all duration-300
                        px-4 sm:px-5
                        py-3.5
                        hover:border-[#0A3269]/30 dark:hover:border-[#4A8ABF]/30
                      `}
                    >
                      {/* Icon */}
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A3269]/10 dark:bg-[#4A8ABF]/10 text-[#0A3269] dark:text-[#4A8ABF]">
                        <Mail className="h-4.5 w-4.5" />
                      </div>

                      {/* Input */}
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder={lang.placeholder}
                        className="
                          relative
                          w-full
                          bg-transparent
                          text-[15px] sm:text-base
                          font-medium
                          text-gray-900 dark:text-white
                          placeholder:text-gray-400 dark:placeholder:text-white/30
                          outline-none
                          caret-[#0A3269] dark:caret-[#4A8ABF]
                        "
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>

                {/* CTA Button - Clean */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="
                    group
                    relative
                    overflow-hidden
                    flex items-center justify-center gap-2.5
                    w-full sm:w-auto
                    rounded-xl sm:rounded-2xl
                    px-6 sm:px-8
                    py-3.5 sm:py-4
                    text-sm sm:text-base
                    font-bold
                    text-white
                    whitespace-nowrap
                    transition-all duration-300
                    bg-[#0A3269] dark:bg-[#4A8ABF]
                    hover:bg-[#1A4A8A] dark:hover:bg-[#4A8ABF]/80
                    shadow-lg shadow-[#0A3269]/25 dark:shadow-[#4A8ABF]/25
                  "
                >
                  {/* Shimmer Effect */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  
                  <span className="relative z-10 flex items-center gap-2.5">
                    {lang.cta}
                    <ArrowRight className="h-4 w-4 sm:h-4.5 sm:w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </motion.button>
                  </div>

                  {/* Terms */}
                  <p className="mt-3 sm:mt-4 px-1 text-[10px] sm:text-xs leading-5 text-gray-400 dark:text-white/30">
                    {lang.terms}
                    <a href="/t&c" className="mx-1 font-medium text-[#0A3269] dark:text-[#4A8ABF] hover:text-[#1A4A8A] dark:hover:text-[#4A8ABF]/80 transition-colors underline underline-offset-2">
                      {lang.termsLink}
                    </a>
                    {isArabic ? 'و' : 'and'}
                    <a href="/privacy" className="mx-1 font-medium text-[#0A3269] dark:text-[#4A8ABF] hover:text-[#1A4A8A] dark:hover:text-[#4A8ABF]/80 transition-colors underline underline-offset-2">
                      {lang.privacyLink}
                    </a>
                    . {lang.unsubscribe}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-full bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Video - Fullscreen */}
              <video
                ref={modalVideoRef}
                className="w-full h-full object-contain"
                src="/images/laptop/sufiyan.mp4"
                controls
                autoPlay
                playsInline
                controlsList="nodownload"
              />

              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-300 hover:scale-110 z-20 border border-white/20"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Exit fullscreen hint */}
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-xs bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 pointer-events-none">
                Press ESC or click ✕ to exit
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
// Custom TikTok icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const TammatFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative bg-foreground text-background overflow-hidden">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16">
          {/* Logo & Tagline */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
<img
  src={TammatLogoWhite}
  alt="Tammat"
  className="w-20 h-20 object-contain invert dark:brightness-0 dark:invert-0"
/>

              <span className="text-2xl" style={{ fontFamily: "'Poppins', sans-serif" }}>TMMT</span>
            </div>
            <p className="text-background/70 text-lg max-w-md">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h5 className="font-semibold text-lg mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t('footer.navigation')}</h5>
            <ul className="space-y-3">
              <li><Link to="/" className="text-background/70 hover:text-primary transition-colors">{t('header.home')}</Link></li>
              <li>
                <Link to="/apply" className="text-background/70 hover:text-primary transition-colors">
                  {t('header.services')}
                </Link>
              </li>
              <li><Link to="/faqs" className="text-background/70 hover:text-primary transition-colors">{t('header.faq')}</Link></li>
              <li><Link to="/auth" className="text-background/70 hover:text-primary transition-colors">{t('header.signIn')}</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h5 className="font-semibold text-lg mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t('footer.socialMedia.title')}</h5>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://x.com/tmmtae11?s=11" 
                  className="text-background/70 hover:text-primary transition-colors flex items-center gap-2.5 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {t('footer.socialMedia.twitter')}
                </a>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/tmmt.ae?igsh=MWZtaHdwZjZwbjFhZg%3D%3D&utm_source=qr" 
                  className="text-background/70 hover:text-primary transition-colors flex items-center gap-2.5 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {t('footer.socialMedia.instagram')}
                </a>
              </li>
         
              <li>
                <a 
                  href="https://www.tiktok.com/@tmmt.ae" 
                  className="text-background/70 hover:text-primary transition-colors flex items-center gap-2.5 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TikTokIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {t('Tiktok')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Animated TAMMAT Text - Clip with gradient */}
      <div className="relative overflow-hidden py-8 border-t border-background/10">
        <motion.div
          initial={{ x: '0%' }}
          animate={{ x: '-50%' }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="flex whitespace-nowrap"
        >
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="text-[8rem] sm:text-[12rem] md:text-[16rem] font-bold uppercase tracking-tighter mx-8"
              style={{
                fontFamily: "'Poppins', sans-serif",
                background: 'linear-gradient(135deg, #c9a227 0%, #8B4513 50%, #d4a847 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              TMMT
            </span>
          ))}
        </motion.div>
      </div>

      {/* Copyright */}
      <div className="container mx-auto px-4 py-6 border-t border-background/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-background/60 text-sm">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
      <div className="flex gap-4">
  <Link to="/legal#terms" className="text-background/60 hover:text-primary text-sm transition-colors">
    Terms
  </Link>
  <Link to="/legal#privacy" className="text-background/60 hover:text-primary text-sm transition-colors">
    Privacy
  </Link>
  <Link to="/legal#guarantee" className="text-background/60 hover:text-primary text-sm transition-colors">
    Legal
  </Link>

</div>
        </div>
      </div>
    </footer>
  );
};

const YouTubeGrid = ({ videoIds }: YouTubeGridProps) => {
  const containerIds = useRef(
    videoIds.map(
      (_, i) => `yt-player-${i}-${Math.random().toString(36).slice(2)}`
    )
  );
  const playersRef = useRef<any[]>([]);
  const [apiReady, setApiReady] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  // Load IFrame API once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onReady = () => setApiReady(true);

    if (window.YT && window.YT.Player) {
      onReady();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      if (!existing) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        onReady();
      };
    }
  }, []);

  // Build players when API is ready
  useEffect(() => {
    if (!apiReady) return;
    // Clean up old players if any
    playersRef.current.forEach(p => p?.destroy?.());
    playersRef.current = [];

    containerIds.current.forEach((id, idx) => {
      const player = new window.YT.Player(id, {
        videoId: videoIds[idx],
        width: '100%',
        height: '100%',
        playerVars: {
          // Hide UI and keep design intact
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          disablekb: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          // Autoplay is controlled via our custom buttons
        },
        events: {
          onStateChange: (e: any) => {
            const state = e?.data;
            const YTP = window.YT?.PlayerState;
            if (state === YTP?.PLAYING) {
              // Pause others
              playersRef.current.forEach((p, i) => {
                if (i !== idx) {
                  try {
                    p.pauseVideo();
                  } catch { }
                }
              });
              setPlayingIndex(idx);
            } else if (
              state === YTP?.PAUSED ||
              state === YTP?.ENDED ||
              state === YTP?.CUED
            ) {
              setPlayingIndex(prev => (prev === idx ? null : prev));
            }
          },
        },
      });
      playersRef.current[idx] = player;
    });

    return () => {
      playersRef.current.forEach(p => p?.destroy?.());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, videoIds.join(',')]);

  const handlePlay = (idx: number) => {
    const player = playersRef.current[idx];
    if (!player) return;
    // Pause others first
    playersRef.current.forEach((p, i) => {
      if (i !== idx) {
        try {
          p.pauseVideo();
        } catch { }
      }
    });
    try {
      player.playVideo();
    } catch { }
  };

  const handlePause = (idx: number) => {
    const player = playersRef.current[idx];
    try {
      player.pauseVideo();
    } catch { }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {containerIds.current.map((cid, idx) => (
        <div
          key={cid}
          className="group liquid-glass relative overflow-hidden rounded-2xl"
        >
          <div className="relative z-0 aspect-video">
            <div id={cid} className="h-full w-full" />
          </div>

          {/* Hover gradient */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Overlay Controls */}
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex items-center justify-center">
            {playingIndex === idx ? (
              <button
                onClick={() => handlePause(idx)}
                className="liquid-glass-header pointer-events-auto rounded-full px-3 py-1 text-xs transition-colors"
                style={{ color: ACCENT }}
              >
                <span className="inline-flex items-center gap-1">
                  <Pause className="h-3.5 w-3.5" /> Pause
                </span>
              </button>
            ) : (
              <button
                onClick={() => handlePlay(idx)}
                className="pointer-events-auto rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: ACCENT }}
              >
                <span className="inline-flex items-center gap-1">
                  <Play className="h-3.5 w-3.5" /> Play
                </span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

type ExamplesDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  planName: string;
  price: string;
  videoIds: string[];
};

const ExamplesDialog = ({
  open,
  onOpenChange,
  planName,
  price,
  videoIds,
}: ExamplesDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] border-neutral-800 bg-[#0b0b0b] p-0 text-white sm:rounded-2xl xl:max-w-[1280px]">
        <div className="border-b border-neutral-900 bg-neutral-900/50 px-5 py-4">
          <DialogHeader className="space-y-1">
            <DialogTitle
              className="text-base font-semibold"
              style={{ color: ACCENT }}
            >
              {planName}
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-400">
              Pricing: {price}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="max-h-[80vh] overflow-auto px-5 py-5 lg:px-6 lg:py-6">
          <YouTubeGrid videoIds={videoIds} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface FooterContent {
  tagline: string;
  copyright: string;
}

const defaultContent: FooterContent = {
  tagline:
    'Experience 3D animation like never before. We craft cinematic visuals for brands and products.',
  copyright: '© 2025 — TMMET International UAE',
};


type Feature = { text: string; muted?: boolean };

function FeatureItem({ text, muted = false }: Feature) {
  return (
    <li className="text-secondary flex items-start gap-2">
      <CheckCircle2 className="mt-0.5 h-4 w-4" style={{ color: ACCENT }} />
      <span
        className={`text-sm ${muted ? 'text-neutral-500' : 'text-neutral-200'} text-secondary`}
      >
        {text}
      </span>
    </li>
  );
}

type Currency = 'INR' | 'USD';

const PRICES: Record<
  Currency,
  { startup: string; pro: string; standard: string; premium: string; save: string }
> = {
  INR: {
    startup: '₹25,000/-',
    pro: '₹55,000/-',
    standard: '₹1,70,500/-',
    premium: '₹1,70,500/-',
    save: 'Save Flat ₹1,500/-',
  },
  USD: {
    startup: '$299',
    pro: '$699',
    standard: '$2,049',
    premium: '$2,049',
    save: 'Save $20',
  },
};

function guessLocalCurrency(): Currency {
  const lang = typeof navigator !== 'undefined' ? navigator.language : '';
  const tz =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : '';
  if (/-(IN|PK|BD)\b/i.test(lang) || /(Kolkata|Karachi|Dhaka)/i.test(tz || ''))
    return 'INR';
  return 'USD';
}

// Startup demo videos
const startupVideos = [
  'ysz5S6PUM-U',
  'aqz-KE-bpKQ',
  'ScMzIvxBSi4',
  'dQw4w9WgXcQ',
  'VYOjWnS4cMY',
  '9bZkp7q19f0',
  '3JZ_D3ELwOQ',
  'e-ORhEE9VVg',
  'fJ9rUzIMcZQ',
];

// Pro demo videos
const proVideos = [
  'ASV2myPRfKA',
  'eTfS2lqwf6A',
  'KALbYHmGV4I',
  'Go0AA9hZ4as',
  'sB7RZ9QCOAg',
  'TK2WboJOJaw',
  '5Xq7UdXXOxI',
  'kMjWCidQSK0',
  'RKKdQvwKOhQ',
];

// Premium demo videos
const premiumVideos = [
  'v2AC41dglnM',
  'pRpeEdMmmQ0',
  '3AtDnEC4zak',
  'JRfuAukYTKg',
  'LsoLEjrDogU',
  'RB-RcX5DS5A',
  'hTWKbfoikeg',
  'YQHsXMglC9A',
  '09R8_2nJtjg',
];


const LogoMarquee = () => {
  const { t } = useTranslation();
  const [pausedRow, setPausedRow] = useState<string | null>(null);

  // Logo data with colors and content
  const logos = [
    {
      name: 'MOI',
      content: 'intel',
      color: 'text-neutral-300',
      image: moiLogo,
    },
    {
      name: 'Citizenship',
      content: '🟢',
      color: 'text-accent',
      image: citizenshipLogo,
    },
    {
      name: 'ICP',
      content: 'image',
      color: 'text-neutral-300',
      image: icpLogo,
    },
    {
      name: 'Amer',
      content: 'VK',
      color: 'text-white',
      bg: 'bg-primary/100',
      image: amerLogo,
    },


    {
      name: 'Kickstarter',
      content: 'K',
      color: 'text-white',
      bg: 'bg-accent/100',
    },
  ];


  const LogoCard = ({ logo, rowId }: { logo: any; rowId: string }) => (
    <div
      className="mx-3 flex-shrink-0"
      onMouseEnter={() => setPausedRow(rowId)}
      onMouseLeave={() => setPausedRow(null)}
    >
      <div className="bg-background/5 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 backdrop-blur-xl sm:h-24 sm:w-24 lg:h-28 lg:w-28">
        {logo.image ? (
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20 lg:h-24 lg:w-24">
            <img
              src={logo.image}
              alt={logo.name}
              className="h-12 w-12 rounded-full object-cover opacity-90 sm:h-16 sm:w-16 lg:h-16 lg:w-16"
              sizes="(min-width: 1024px) 128px, (min-width: 640px) 112px, 96px"
            />
          </div>
        ) : logo.bg ? (
          <div
            className={`h-8 w-8 rounded-full sm:h-10 sm:w-10 ${logo.bg} flex items-center justify-center`}
          >
            <span className={`text-sm font-bold sm:text-lg ${logo.color}`}>
              {logo.content}
            </span>
          </div>
        ) : (
          <span
            className={`text-lg font-semibold sm:text-xl lg:text-2xl ${logo.color}`}
          >
            {logo.content}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <section className="text-secondary overflow-hidden py-16 border-t-2 border-x-2 border-primary/20 rounded-t-[2rem] sm:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center justify-between sm:flex-row sm:items-center">
          <div
            className={`text-[5rem] -mt-4 -tracking-[6px] sm:text-[5rem] md:text-[5rem] lg:text-[5rem] font-medium text-foreground leading-tighter`}
          >
            {t('logoMarquee.headline')} <span className="text-primary">{t('logoMarquee.headlineHighlight')}</span>
          </div>
          <Button
            variant="outline"
            className="liquid-glass hover:liquid-glass-enhanced mt-4 bg-transparent sm:mt-0"
          >
            {t('serviceJourney.learnMore')}
          </Button>
        </div>

        {/* Logo Marquee */}
        <div className="relative">
          {/* First Row - Scrolling Right */}
          <div className="mb-6 flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div
              className={`animate-scroll-right flex whitespace-nowrap ${pausedRow === 'first' ? 'animation-play-state-paused' : ''}`}
              style={{
                animationPlayState:
                  pausedRow === 'first' ? 'paused' : 'running',
                width: 'max-content',
              }}
            >
              {/* Triple the logos for seamless loop */}
              {[...logos, ...logos, ...logos].map((logo, index) => (
                <LogoCard key={`first-${index}`} logo={logo} rowId="first" />
              ))}
            </div>
          </div>


        </div>
      </div>
    </section>
  );
};



const serviceData = [
  {
    title: 'Visa Applications',
    sub: 'Apply for new visas quickly and securely.',
    tone: 'essential',
    gradient: 'from-[#0b0b0b] via-[#0f172a] to-[#020617]',
    videoSrc: 'https://goodhand.b-cdn.net/Assets/Amer%20video.mp4',
  },
  {
    title: 'Residency Renewals',
    sub: 'Stay compliant with automated reminders.',
    tone: 'trusted',
    gradient: 'from-[#0b1a0b] via-[#052e16] to-[#022c22]',
    videoSrc: 'https://goodhand.b-cdn.net/Assets/Tasheelwebsite.mp4',
  },
  {
    title: 'Company Services',
    sub: 'Manage establishment cards and labor quotas.',
    tone: 'business',
    gradient: 'from-[#001028] via-[#0b355e] to-[#052e5e]',
    videoSrc:
      'https://www.visitdubai.com/en/-/media/Video/leisure/homepage-leisure/homepage-leisure-summer-september-2025.mp4',
  },
  {
    title: 'Status Tracking',
    sub: 'Track applications in real time, 24/7.',
    tone: 'transparent',
    gradient: 'from-[#0b0b0b] via-[#1f2937] to-[#0b1220]',
    videoSrc:
      'https://goodhand.b-cdn.net/Assets/Dubai%20Court%20Al%20Ahdeed.mp4',
  },
];


// Modern Laptop Showcase - Clean Images Only with Pause/Play
const LaptopShowcase = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [activeScreen, setActiveScreen] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isArabic, setIsArabic] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  // Image paths for laptop screenshots
  const screens = [
    { id: 'img1', image: '/images/laptop/img1.png' },
    { id: 'img2', image: '/images/laptop/img2.png' },
    { id: 'img3', image: '/images/laptop/img3.png' },
    { id: 'img4', image: '/images/laptop/img4.png' },
    { id: 'img5', image: '/images/laptop/img5.png' },
    { id: 'img6', image: '/images/laptop/img6.png' },
    { id: 'img7', image: '/images/laptop/img7.png' },
  ];

  // Auto-slide with pause functionality
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPaused) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % screens.length);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, screens.length]);

  // Handle manual navigation
  const goToScreen = (index: number) => {
    setActiveScreen(index);
    setIsPaused(true);
    setManualPause(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      setManualPause(false);
      setShowPauseIcon(false);
    }, 8000);
  };

  // Toggle pause/play
  const togglePause = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    
    const newPauseState = !isPaused;
    setIsPaused(newPauseState);
    setManualPause(newPauseState);
    
    if (!isMobile) {
      setShowPauseIcon(true);
      setTimeout(() => {
        if (!isHovering) {
          setShowPauseIcon(false);
        }
      }, 1500);
    }
  };

  const handleMouseEnter = () => {
    if (isMobile) return;
    setIsHovering(true);
    if (!manualPause) {
      setIsPaused(true);
      setShowPauseIcon(true);
    }
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setIsHovering(false);
    if (!manualPause) {
      setIsPaused(false);
      setShowPauseIcon(false);
    }
  };

  const handleScreenClick = () => {
    togglePause();
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
    >
      {/* Premium Background with Smooth Animations */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card/10" />
        
        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-2xl sm:blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-2xl sm:blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"
        />
        
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header with Smooth Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
     

          <h2 
            className="font-bold text-black dark:text-white leading-[1.05] tracking-tight"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontVariationSettings: "'opsz' 144",
              fontSize: 'clamp(2rem, 8vw, 3rem)'
            }}
          >
            {isArabic ? (
              <>
                شاهد كيف{' '}
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[#0A3269] via-[#0A3269]/80 to-[#0A3269] bg-clip-text text-transparent">
                    تعمل TMMT
                  </span>
                </span>
              </>
            ) : (
              <>
                See how{' '}
                <br />
                <span className="relative inline-block">
<span className="bg-gradient-to-r from-[#0A3269] via-[#0A3269]/80 to-[#0A3269] dark:from-[#4A8ABF] dark:via-[#4A8ABF]/80 dark:to-[#4A8ABF] bg-clip-text text-transparent font-normal">
  TMMT works
</span>
                </span>
              </>
            )}
          </h2>
          
          <p className="text-black/60 dark:text-white/40 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            {isArabic 
              ? 'اختبر معالجة التأشيرات السلسة مع منصتنا البديهية'
              : 'Experience seamless visa processing with our intuitive platform'
            }
          </p>
        </motion.div>

        {/* Modern Laptop Mockup with Smooth Animations */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-6xl mx-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Glow Effect Behind Laptop */}
          <motion.div
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -inset-6 sm:-inset-10 bg-gradient-to-r from-primary/20 dark:from-primary/30 via-transparent to-purple-500/20 dark:to-purple-500/30 blur-2xl sm:blur-3xl opacity-50 dark:opacity-70"
          />

          {/* Laptop Frame */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Premium Bezel */}
            <div className="relative bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-950 rounded-xl sm:rounded-2xl md:rounded-3xl p-1.5 sm:p-2 md:p-3 shadow-2xl shadow-black/50 dark:shadow-black/70">
              {/* Top Bar with Camera */}
              <div className="absolute top-2 sm:top-3 md:top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 z-10">
                <div className="w-2 h-2 sm:w-2.5 md:w-3 bg-neutral-700 rounded-full border border-neutral-600/50 dark:border-neutral-600/30">
                  <div className="absolute inset-0 m-auto w-0.5 h-0.5 sm:w-1 sm:h-1 bg-neutral-500 rounded-full" />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-1 bg-primary/30 rounded-full blur-sm"
                  />
                </div>
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-400 animate-pulse" />
              </div>

              {/* Screen Container */}
              <div 
                className="relative bg-black rounded-lg sm:rounded-xl md:rounded-3xl overflow-hidden aspect-[16/11] sm:aspect-[16/10] md:aspect-[16/10] lg:aspect-[16/9] cursor-pointer group"
                onClick={handleScreenClick}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScreen}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      duration: 0.7, 
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0"
                  >
                    {/* Full Width Image with Smooth Zoom Effect */}
                    <motion.div 
                      className="w-full h-full flex items-center justify-center bg-black/5 p-0 sm:p-1 md:p-1.5 lg:p-2"
                    >
                      <div className="relative w-full h-full rounded-none sm:rounded-lg md:rounded-xl lg:rounded-2xl overflow-hidden">
                        <img
                          src={screens[activeScreen].image}
                          alt={`Screenshot ${activeScreen + 1}`}
                          className="w-full h-full object-center transition-transform duration-700 group-"
                          loading="lazy"
                        />
                        {/* Subtle Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {/* Pause/Play Status */}
                <AnimatePresence>
                  {isPaused && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
                    >
                      <span className="text-white text-[10px] sm:text-xs font-medium bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-lg">
                        <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
                        Paused
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tap/Click Hint */}
                {!isPaused && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                  >
                    <motion.span
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-white/40 text-[8px] sm:text-[9px] font-medium bg-black/30 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/5 flex items-center gap-1.5"
                    >
                      Click to pause
                    </motion.span>
                  </motion.div>
                )}

                {/* Screen Glare Effect */}
                <motion.div
                  animate={{
                    opacity: [0, 0.05, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 pointer-events-none rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden"
                >
                  <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-transparent rotate-12" />
                </motion.div>
              </div>

              {/* Screen Reflection - Subtle */}
              <div className="absolute inset-0 pointer-events-none rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-white/3 via-transparent to-transparent rotate-12" />
              </div>
            </div>

            {/* Laptop Base with Smooth Shadow */}
            <div className="relative">
              <div className="relative h-2 sm:h-3 md:h-4 bg-gradient-to-b from-neutral-700 to-neutral-800 dark:from-neutral-700 dark:to-neutral-800 rounded-b-lg sm:rounded-b-xl md:rounded-b-2xl shadow-xl">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-12 sm:w-20 md:w-24 lg:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-neutral-500 dark:via-neutral-400 to-transparent rounded-b" />
                <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 -translate-x-1/2 w-10 sm:w-16 h-0.5 sm:h-1 bg-neutral-800/50 rounded-full blur-sm" />
              </div>
            </div>
          </motion.div>
        </motion.div>

      
      </div>
    </section>
  );
};


// 7 Emirates Section with smooth reveal animation like goodhand.ae
const EmiratesSection = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const [hoveredEmirate, setHoveredEmirate] = useState<string | null>(null);

  const emirates = [
    {
      id: 'dubai',
      name: t('emirates.cities.dubai'),
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
      icon: '🏙️',
      gradient: 'from-amber-500/80 to-orange-600/80'
    },
    {
      id: 'abuDhabi',
      name: t('emirates.cities.abuDhabi'),
      image: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?q=80&w=800&auto=format&fit=crop',
      icon: '🕌',
      gradient: 'from-blue-500/80 to-cyan-600/80'
    },
    {
      id: 'sharjah',
      name: t('emirates.cities.sharjah'),
      image: 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?q=80&w=800&auto=format&fit=crop',
      icon: '🏛️',
      gradient: 'from-emerald-500/80 to-teal-600/80'
    },
    {
      id: 'rasAlKhaimah',
      name: t('emirates.cities.rasAlKhaimah'),
      image: 'https://images.unsplash.com/photo-1586437553650-5c82e34e76ec?q=80&w=800&auto=format&fit=crop',
      icon: '🏔️',
      gradient: 'from-rose-500/80 to-pink-600/80'
    },
    {
      id: 'ajman',
      name: t('emirates.cities.ajman'),
      image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=800&auto=format&fit=crop',
      icon: '🌊',
      gradient: 'from-violet-500/80 to-purple-600/80'
    },
    {
      id: 'ummAlQuwain',
      name: t('emirates.cities.ummAlQuwain'),
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
      icon: '🏖️',
      gradient: 'from-indigo-500/80 to-blue-600/80'
    },
    {
      id: 'fujairah',
      name: t('emirates.cities.fujairah'),
      image: 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?q=80&w=800&auto=format&fit=crop',
      icon: '⛰️',
      gradient: 'from-lime-500/80 to-green-600/80'
    }
  ];

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-card/30 via-background to-background"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 0.5, scale: 1 } : {}}
          transition={{ duration: 1.5 }}
          className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 0.5, scale: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header with smooth reveal */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 md:mb-20"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-block font-poppins text-sm md:text-base font-medium text-primary mb-4 px-4 py-1.5 bg-primary/10 rounded-full"
          >
            🇦🇪 {t('emirates.subheadline')}
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-poppins tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-foreground mb-4"
          >
            {t('emirates.headline')}
            <br />
            <span className="text-primary">{t('emirates.headlineHighlight')}</span>
          </motion.div>
        </motion.div>

        {/* Emirates Grid with staggered reveal */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
        >
          {emirates.map((emirate, index) => (
            <motion.div
              key={emirate.id}
              variants={itemVariants}
              onMouseEnter={() => setHoveredEmirate(emirate.id)}
              onMouseLeave={() => setHoveredEmirate(null)}
              className={`relative group cursor-pointer ${index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
                }`}
            >
              <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl ${index === 0 ? 'aspect-square' : 'aspect-[4/3]'
                } shadow-lg hover:shadow-2xl transition-all duration-500`}>
                {/* Image */}
                <img
                  src={emirate.image}
                  alt={emirate.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${emirate.gradient} opacity-60 group-hover:opacity-70 transition-opacity duration-300`} />

                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                  <motion.div
                    animate={{
                      y: hoveredEmirate === emirate.id ? -8 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* <span className="text-2xl md:text-3xl mb-2 block">
                      {emirate.icon}
                    </span> */}
                    <h3 className={`font-poppins font-semibold text-white ${index === 0 ? 'text-xl md:text-3xl' : 'text-base md:text-xl'
                      }`}>
                      {emirate.name}
                    </h3>
                  </motion.div>

                  {/* Hover indicator */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: hoveredEmirate === emirate.id ? 1 : 0,
                      y: hoveredEmirate === emirate.id ? 0 : 10
                    }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 md:mt-3"
                  >
                    <span className="font-tajawal text-sm text-white/90 flex items-center gap-1">
                      Explore services <ArrowRightIcon className="w-4 h-4" />
                    </span>
                  </motion.div>
                </div>

                {/* Shine effect on hover */}
                <motion.div
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{
                    x: hoveredEmirate === emirate.id ? '200%' : '-100%',
                    opacity: hoveredEmirate === emirate.id ? 0.3 : 0
                  }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};


const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showStartDialog, setShowStartDialog] = useState(false);

  const buttonNew = (
    <Button
      onClick={() => navigate('/apply')}
      className="bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground rounded-full px-6 py-2 shadow-sm"
    >
      ⚡ {t('hero.cta')}
    </Button>
  );

  return (
    <>


      <section className="bg-background text-text relative isolate overflow-hidden">  
        <div className="fixed top-6 right-6 z-50">
          <ThemeSelector compact showPreview={false} />
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-14 sm:py-20">
            <div className="mb-5 flex items-center gap-2">
              <img
                src={TammatLogoWhite}
                alt="Tammat logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <p className="text-primary/80 text-sm tracking-[0.25em] uppercase">
                TMMT
              </p>
            </div>

            <h1 className="mt-3 text-center text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              <span className="text-secondary block">{t('hero.title').toUpperCase()}</span>
              <span className="text-primary block drop-shadow-md">
                {t('hero.subtitle').toUpperCase()}
              </span>
              <span className="text-secondary block">{t('hero.tagline').toUpperCase()}</span>
            </h1>

            <p className="text-text-secondary mt-5 max-w-xl text-center text-lg">
              {t('hero.description')}
            </p>


            <div className="mt-6">{buttonNew}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 gap-8">

            </div>

          </div>
        </div>
      </section>

      <StartApplicationDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
        queryParams={""}
      />
    </>
  );
};

  /**
  header sectiion 
  */
  export function SiteHeader() {
    const { t } = useTranslation();
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showStartApplication, setShowStartApplication] = useState(false);
    const [showAuthDrawer, setShowAuthDrawer] = useState(false);
    const navigate = useNavigate();

    const isLight = theme?.name === 'Orange Professional';

    // ── Scroll-based show/hide + glass intensity ──────────────────────────
    const [hidden, setHidden]     = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const lastScrollY             = useRef(0);

    useEffect(() => {
      const THRESHOLD = 8;
      const REVEAL_NEAR_TOP = 80;

      const onScroll = () => {
        const y = window.scrollY;
        const diff = y - lastScrollY.current;

        setScrolled(y > 24);

        if (y < REVEAL_NEAR_TOP) {
          setHidden(false);
        } else if (Math.abs(diff) > THRESHOLD) {
          setHidden(diff > 0);
          lastScrollY.current = y;
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }, []);

  // Update your links array with new icons
  const links = [
    { href: '/', label: t('header.home'), icon: Home },
    { href: '/faqs', label: t('header.faq'), icon: HelpCircle },
  { href: '/subscription', label: t('header.subscription'), icon: Wallet },
  ];

    return (
    <motion.header
    initial={false}
    animate={{ y: hidden ? '-110%' : '0%' }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    className="sticky top-0 z-50 p-4"
  >
    <div className="container mx-auto max-w-6xl">
      <motion.div
        animate={{
          boxShadow: scrolled
            ? '0 8px 32px -12px rgba(0,0,0,0.25)'
            : '0 2px 8px rgba(0,0,0,0.06)',
        }}
        transition={{ duration: 0.3 }}
        className={`
          relative flex h-14 items-center justify-between rounded-full px-5
          border transition-all duration-300
          backdrop-blur-2xl backdrop-saturate-150
          bg-white/70 dark:bg-black/60
          border-black/10 dark:border-white/10
          ${scrolled ? 'bg-white/90 dark:bg-black/80' : ''}
          shadow-sm shadow-black/5 dark:shadow-white/5
        `}
      >
        {/* subtle top highlight for glass realism */}
        <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
  <img 
    src={TammatLogoWhite} 
    alt="Tammat logo" 
    width={30} 
    height={30} 
    className="h-15 w-10 dark:brightness-0 dark:invert" 
  />    
      <span className="text-black dark:text-white font-semibold tracking-wide">TMMT</span>
        </Link>
  {/* Desktop Nav — without Icons */}
  <nav className="hidden items-center gap-1 text-sm md:flex">
    {links.map((l) => (
      <Link
        key={l.href}
        to={l.href}
        className="
          group relative px-4 py-2 rounded-full font-medium
          text-gray-700 dark:text-gray-300
          hover:text-black dark:hover:text-white
          hover:bg-gray-100/50 dark:hover:bg-white/10
          transition-all duration-200
        "
      >
        {l.label}
      </Link>
    ))}
    
    {/* Dashboard Link in Desktop Nav */}
    {user && (
      <Link
        to={user?.role === "amer" ? "/amer-dashboard" : "/user/dashboard"}
        className="
          group relative px-4 py-2 rounded-full font-medium
          text-gray-700 dark:text-gray-300
          hover:text-black dark:hover:text-white
          hover:bg-gray-100/50 dark:hover:bg-white/10
          transition-all duration-200
        "
      >
        Dashboard
      </Link>
    )}
  </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2.5 md:flex">
    {/* Apply CTA — Premium Dark Blue */}
  <motion.button
    whileHover={{ scale: 1.03, y: -1 }}
    whileTap={{ scale: 0.97 }}
    onClick={() => setShowStartApplication(true)}
    className="
      group relative overflow-hidden rounded-full
      bg-[#0A3269] dark:bg-white
      px-6 py-2.5 font-semibold text-sm
      text-white dark:text-[#0A3269]
      shadow-lg shadow-[#0A3269]/25 dark:shadow-white/10
      transition-all duration-300
      hover:shadow-xl hover:shadow-[#0A3269]/35 dark:hover:shadow-white/20
      hover:bg-[#1a4a7a] dark:hover:bg-gray-100
    "
  >
    <span className="relative z-10 flex items-center gap-1.5">
      <Rocket className="h-3.5 w-3.5 text-white dark:text-[#0A3269] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      {t('hero.cta', 'Apply Now')}
    </span>
    <span className="absolute inset-0 bg-white/20 dark:bg-black/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
  </motion.button>

          {/* Dashboard icon */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100/50 dark:hover:bg-white/10 text-black dark:text-white"
              onClick={() => navigate(user.role === 'amer' ? '/amer-dashboard' : '/user/dashboard')}
              aria-label={t('header.dashboard')}
            >
              <span className="sr-only">{t('header.profile')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1112 21a8.963 8.963 0 01-6.879-3.196z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
          )}

      {/* Theme toggle — Clean */}
  <motion.button
    onClick={toggleTheme}
    whileTap={{ scale: 0.94 }}
    className="
      relative flex h-9 items-center gap-2 rounded-full border pr-2 pl-2
      transition-all duration-300
      bg-gray-100/50 dark:bg-white/5
      border-gray-200 dark:border-white/10
      hover:border-gray-300 dark:hover:border-white/20
    "
    aria-label="Toggle theme"
  >
    <motion.span
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`flex h-7 w-7 items-center justify-center rounded-full ${isLight ? 'bg-gray-200' : 'bg-white/10'}`}
    >
      {isLight ? (
        <Sun className="h-4 w-4 text-black dark:text-white" />
      ) : (
        <Moon className="h-4 w-4 text-black dark:text-white" />
      )}
    </motion.span>
  </motion.button>

          {/* Auth button — Clean */}
          {user ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                signOut();
                navigate("/");
              }}
              className="
                group
                flex
                items-center
                gap-2
                rounded-full
                px-5
                py-2.5
                text-sm
                font-semibold
                border
                transition-all
                duration-300
                bg-white dark:bg-black
                text-black dark:text-white
                border-gray-200 dark:border-white/10
                hover:border-red-300 dark:hover:border-red-500/30
                hover:bg-red-50 dark:hover:bg-red-900/20
              "
            >
              <LogOut className="h-4 w-4 text-black dark:text-white transition-transform duration-300 group-hover:translate-x-0.5" />
              {t("header.signOut")}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/auth")}
              className="
                group
                flex
                items-center
                gap-2
                rounded-full
                px-5
                py-2.5
                text-sm
                font-semibold
                border
                transition-all
                duration-300
              bg-black dark:bg-white
              text-white dark:text-black
              border-gray-800 dark:border-white/20
              hover:bg-gray-800 dark:hover:bg-gray-100
              hover:border-gray-700 dark:hover:border-white/30
            "
          >
            <LogIn className="h-4 w-4 text-white dark:text-black transition-transform duration-300 group-hover:translate-x-0.5" />
            {t("header.signIn")}
          </motion.button>
        )}
      </div>




      

      <div className="flex items-center gap-2 md:hidden">
{/* Modern pill-style theme toggle */}
<motion.button
  onClick={toggleTheme}
  whileTap={{ scale: 0.92 }}
  className="relative flex h-9 w-10 items-center rounded-full border border-gray-200 dark:border-white/10 bg-gray-100/50 dark:bg-white/5 px-1 transition-all duration-300 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-md transition-all duration-300"
  aria-label="Toggle theme"
>
  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-100/20 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  
  <motion.div
    layout
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
    className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-black shadow-sm group-hover:shadow-md transition-all duration-300"
    style={{ marginLeft: isLight ? 0 : "auto" }}
  >
    {isLight ? (
      <Sun className="h-3.5 w-3.5 text-black dark:text-white transition-transform duration-300 group-hover:rotate-45" />
    ) : (
      <Moon className="h-3.5 w-3.5 text-black dark:text-white transition-transform duration-300 group-hover:rotate-[-15deg]" />
    )}
  </motion.div>
</motion.button>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-200 dark:border-white/10 bg-gray-100/50 dark:bg-white/5 text-black dark:text-white hover:bg-gray-200/50 dark:hover:bg-white/10"
            >
              <Menu className="h-4 w-4 text-black dark:text-white" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>

          {/* Theme-aware mobile menu */}
          <SheetContent
            side="right"
            className="
              flex w-72 flex-col p-0
              bg-white/95 dark:bg-black/95
              backdrop-blur-2xl
              border-l border-gray-200 dark:border-white/10
            "
          >
            {/* Brand header — logo + title */}
            <div className="flex items-center gap-2.5 border-b border-gray-200 dark:border-white/10 px-5 py-4">
<img 
  src={TammatLogoWhite} 
  alt="Tammat logo" 
  width={30} 
  height={30} 
  className="h-15 w-10 dark:brightness-0 dark:invert" 
/>   
              <span className="text-base  tracking-tight text-black dark:text-white">
                TMMT
              </span>
            </div>

            {/* Modern Premium Navigation */}
            <nav className="mt-4 flex flex-col gap-2 px-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className="
                    group relative overflow-hidden
                    flex items-center gap-4
                    rounded-2xl
                    px-5 py-4
                    border border-transparent
                    bg-transparent
                    transition-all duration-500
                    hover:border-black/20 dark:hover:border-white/20
                    hover:bg-gray-50 dark:hover:bg-white/5
                    hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5
                    hover:-translate-y-0.5
                  "
                >
                  <span className="absolute inset-0 opacity-0 transition-all duration-500 group-hover:opacity-100 bg-gradient-to-r from-black/5 via-transparent to-black/5 dark:from-white/5 dark:to-white/5" />
                  
                  <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100/50 dark:bg-white/5 transition-all duration-500 group-hover:bg-black dark:group-hover:bg-white group-hover:border-black dark:group-hover:border-white group-hover:rotate-6 group-hover:scale-110">
                    <l.icon className="h-5 w-5 text-black dark:text-white transition-all duration-300 group-hover:text-white dark:group-hover:text-black" />
                  </div>

                  <div className="relative z-10 flex flex-col">
                    <span className="text-[15px] font-semibold text-black dark:text-white transition-colors duration-300 group-hover:text-black dark:group-hover:text-white">
                      {l.label}
                    </span>
                    <span className="text-xs text-black/45 dark:text-white/40">
                      Quick access
                    </span>
                  </div>

                  <div className="ml-auto relative z-10 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <ChevronRight className="h-5 w-5 text-black dark:text-white" />
                  </div>
                </Link>
              ))}

{/* Dashboard Link - Mobile */}
<Link
  to={user?.role === "amer" ? "/amer-dashboard" : "/user/dashboard"}
  className="
    group relative overflow-hidden
    flex items-center gap-4
    rounded-2xl
    px-5 py-4
    border border-transparent
    transition-all duration-500
    hover:border-black/20 dark:hover:border-white/20
    hover:bg-gray-50 dark:hover:bg-white/5
    hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5
    hover:-translate-y-0.5
  "
>
  <span className="absolute inset-0 opacity-0 transition-all duration-500 group-hover:opacity-100 bg-gradient-to-r from-black/5 via-transparent to-black/5 dark:from-white/5 dark:to-white/5" />

  <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100/50 dark:bg-white/5 transition-all duration-500 group-hover:bg-black dark:group-hover:bg-white group-hover:border-black dark:group-hover:border-white group-hover:rotate-6 group-hover:scale-110">
    <LayoutDashboard className="h-5 w-5 text-black dark:text-white transition-all duration-300 group-hover:text-white dark:group-hover:text-black" strokeWidth={1.8} />
  </div>

  <div className="relative z-10 flex flex-col">
    <span className="text-[15px] font-semibold text-black dark:text-white">
      Dashboard
    </span>
    <span className="text-xs text-black/45 dark:text-white/40">
      Manage your account
    </span>
  </div>

  <ChevronRight className="ml-auto h-5 w-5 text-black dark:text-white opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
</Link>
            </nav>

{/* CTA buttons — bottom of sheet */}
<div className="mt-auto border-t border-gray-200 dark:border-white/10 p-4 space-y-2.5">
{/* ─── Primary CTA Button ────────────────────────────────────────────── */}
<motion.button
  whileHover={{ scale: 1.03, y: -1 }}
  whileTap={{ scale: 0.97 }}
  onClick={() => setShowStartApplication(true)}
  className="
    group relative overflow-hidden rounded-full
    w-full sm:w-auto
    bg-[#0A3269] dark:bg-white
    px-6 sm:px-8 py-3 sm:py-3.5 font-semibold text-sm sm:text-base
    text-white dark:text-[#0A3269]
    shadow-lg shadow-[#0A3269]/25 dark:shadow-white/10
    transition-all duration-300
    hover:shadow-xl hover:shadow-[#0A3269]/35 dark:hover:shadow-white/20
    hover:bg-[#1a4a7a] dark:hover:bg-gray-100
    flex items-center justify-center gap-2.5
  "
>
  {/* Shine Effect */}
  <motion.span
    className="absolute inset-0"
    style={{
      background: "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.15) 50%, transparent 80%)",
    }}
    initial={{ x: "-120%" }}
    animate={{ x: "120%" }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
  />
  
  {/* Hover Slide Effect */}
  <span className="absolute inset-0 bg-white/20 dark:bg-black/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
  
  <span className="relative z-10 flex items-center gap-2.5">
    <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-white dark:text-[#0A3269] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    <span>{t('hero.cta', 'Apply Now')}</span>
  </span>
</motion.button>
  {/* ─── Secondary CTA Button ──────────────────────────────────── */}
  {user ? (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => signOut()}
      className="
        w-full rounded-full px-6 py-3 font-medium text-sm sm:text-base
        border border-gray-200 dark:border-white/10
        bg-white dark:bg-black
        text-black dark:text-white
        hover:bg-red-50 dark:hover:bg-red-900/20
        hover:border-red-300 dark:hover:border-red-500/30
        transition-all duration-300
        active:scale-95
      "
    >
      {t('header.signOut')}
    </motion.button>
  ) : (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate('/auth')}
      className="
        w-full rounded-full px-6 py-3 font-semibold text-sm sm:text-base
        bg-white dark:bg-black
        text-black dark:text-white
        border border-gray-200 dark:border-white/10
        flex items-center justify-center gap-2.5
        transition-all duration-300
        hover:bg-gray-50 dark:hover:bg-white/5
        hover:border-gray-300 dark:hover:border-white/20
        active:scale-95
        shadow-sm hover:shadow-md
      "
    >
      <LogIn className="h-4 w-4 sm:h-5 sm:w-5 text-black dark:text-white" />
      {t('header.signIn')}
    </motion.button>
  )}
</div>



          </SheetContent>
        </Sheet>
      </div>
    </motion.div>
  </div>

  {showStartApplication && (
    <LegacyStartApplicationDialog
      open={showStartApplication}
      onOpenChange={setShowStartApplication}
      queryParams={''}
    />
  )}
  <AuthDrawer
    isOpen={showAuthDrawer}
    onClose={() => setShowAuthDrawer(false)}
  />
</motion.header>
  );
}




const TammatHomePage = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);
  return (
    <>
      <SEO
        title="Tammat - UAE Visa Services | Fast & Reliable"
        description="Professional UAE visa services for tourists, residents, and investors. Fast processing, expert support, and hassle-free visa solutions in Dubai and across the UAE."
        keywords="UAE visa, Dubai visa, residence visa, tourist visa, investor visa, golden visa UAE, Tammat visa services, Dubai immigration"
        canonicalUrl="/"
      />
      <main
        className=" min-h-[100dvh] text-foreground scroll-smooth"
        style={{ '--primary': '#0A3269' } as React.CSSProperties}
      >
          {/* <Hero /> */}

        <Services />

<WhyTMMTSection />
        <VideoSection /> 

        <SubscriptionPage />
        {/* <LifeUpgraded /> */}
        <LaptopShowcase />
        {/* <EmiratesSection /> */}
        <ServiceJourney />

        {/* <Testimonials /> */}
        {/* <TammatFeatures /> */}
        {/* <Features /> */}
        {/* <LogoMarquee /> */}
        {/* <Pricing /> */}

        <FAQSection />
        <EmailCapture />
        <TammatFooter />
      </main>


    </>
  );
};
export default TammatHomePage;