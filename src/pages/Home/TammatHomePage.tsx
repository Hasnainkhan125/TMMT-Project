import { ThemeSelector } from '@/components/ui/ThemeSelector';
import SEO from '@/components/SEO/SEO';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { AuthDrawer } from '@/components/auth/AuthDrawer';
import { SheetClose } from '@/components/ui/sheet';
import TammatVoiceAgent from '@/components/VoiceAgent/TammatVoiceAgent';
import { useVoiceAgent } from '@/contexts/VoiceAgentContext';
import './smooth-scroll.css';
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
  ChevronLeft,
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
import EmailCapture from './EmailCapture';
import { motion } from 'framer-motion';

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
  Maximize,
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

// ─── Utility hook for scroll‑triggered reveals (no Framer Motion) ──────
function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return { ref, isInView };
}

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

  // ─── removed motion.dev container variants ───────────────────────────────

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

// ✅ Video states
const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
const [isPlaying, setIsPlaying] = useState(true);
const [isMuted, setIsMuted] = useState(true);
const [progress, setProgress] = useState(0);
const [duration, setDuration] = useState(0);
const [showControls, setShowControls] = useState(true);
const videoRef = useRef<HTMLVideoElement>(null);
const modalVideoRef = useRef<HTMLVideoElement>(null);
const fullVideoRef = useRef<HTMLVideoElement>(null);
const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

// ✅ Increase video playback speed for faster experience
useEffect(() => {
  if (videoRef.current) {
    videoRef.current.playbackRate = 1.2;
  }
}, []);

// ✅ Update progress
useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  const updateProgress = () => {
    if (video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
      setDuration(video.duration);
    }
  };

  video.addEventListener('timeupdate', updateProgress);
  return () => video.removeEventListener('timeupdate', updateProgress);
}, []);

// ✅ Auto-hide controls
useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const container = video.parentElement;
  if (container) {
    container.addEventListener('mousemove', handleMouseMove);
  }

  return () => {
    if (container) {
      container.removeEventListener('mousemove', handleMouseMove);
    }
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };
}, [isPlaying]);

// ✅ Video controls functions
const togglePlay = () => {
  const video = videoRef.current;
  if (!video) return;

  if (video.paused) {
    video.play();
    setIsPlaying(true);
  } else {
    video.pause();
    setIsPlaying(false);
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const cardHover = {
  whileHover: {
    y: -6,
    scale: 1.02,
    boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)",
    transition: { duration: 0.25, ease: "easeOut" },
  },
  whileTap: { scale: 0.98 },
};

const itemReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};


const toggleMute = () => {
  const video = videoRef.current;
  if (!video) return;

  video.muted = !video.muted;
  setIsMuted(video.muted);
};

const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
  const video = videoRef.current;
  if (!video || !video.duration) return;

  const rect = e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  video.currentTime = percent * video.duration;
};

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

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

// ✅ Handle modal close
const closeVideoModal = () => {
  setIsVideoModalOpen(false);
  if (modalVideoRef.current) {
    modalVideoRef.current.pause();
  }
};

return (
 <section id="services" className="container mx-auto px-4 pb-16 sm:pb-24">
  <div className="max-w-7xl mx-auto">
    <div className="mb-12">
      {/* ─── VIDEO COMPONENT WITH CONTROLS ────────────────────────────── */}
      <div className="w-full max-w-10xl mx-auto px-2 sm:px-0">
        <div
          className="relative rounded-2xl sm:rounded-[28px] overflow-hidden group bg-black/95 ring-1 ring-white/10"
          style={{ aspectRatio: "21/9" }}
        >
          {/* Video */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover cursor-pointer"
            src="/images/laptop/subscription-video.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onClick={togglePlay}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

          {/* Play/Pause Overlay Button — 3D disc, no shadow, ring + gradient for depth */}
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            {!isPlaying && (
              <div
                className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center relative transition-transform duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.28), rgba(255,255,255,0.08))",
                  border: "1px solid rgba(255,255,255,0.35)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <span className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse-ring" />
                <span className="absolute inset-0 rounded-full border-2 border-white/10 animate-pulse-ring-delayed" />
                <Play className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 md:h-9 md:w-9 text-white ml-0.5 xs:ml-1" strokeWidth={2.5} />
              </div>
            )}
          </div>

          {/* Video Controls Bar */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="w-full h-1 bg-white/25 rounded-full cursor-pointer mb-2 hover:h-1.5 transition-all"
              onClick={handleProgressClick}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #4A8ABF, #ffffff)",
                }}
              />
            </div>

            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>

                <span className="text-[10px] sm:text-xs opacity-80 ml-1 tabular-nums">
                  {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={openVideoModal}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Fullscreen"
              >
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ANIMATED SERVICE TITLES ──────────────────────────────────── */}
      <div className="space-y-1 mt-8" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div
          className="relative h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px] overflow-hidden"
          style={{ perspective: "1200px" }}
        >
          <div
            key={currentServiceIndex}
            className="absolute inset-0 flex items-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transform: "translateY(0) scale(1) rotateX(0)",
              opacity: 1,
              color: serviceTitles[currentServiceIndex].titleColor,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <span className="text-[1.7rem] sm:text-[3rem] md:text-[4.5rem] lg:text-[4.5rem] leading-[1.1] break-words max-w-full text-left font-semibold">
              {serviceTitles[currentServiceIndex].title}
            </span>
          </div>
        </div>

        <div
          className="text-[2rem] -mt-4 md:-tracking-[6px] -tracking-[2px] sm:text-[5rem] md:text-[5rem] lg:text-[4.5rem] font-medium text-foreground"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {t("services.personalizedToYou", "personalized to you")}
        </div>
      </div>

      <p
        className="mt-2 text-text-secondary max-w-x2"
        style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(0.77rem, 1.5vw, 1.3rem)" }}
      >
        {t("services.subtitle")}
      </p>
    </div>
  </div>

  {/* ─── VIDEO MODAL ────────────────────────────────────────────────── */}
  {isVideoModalOpen && (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={closeVideoModal}>
      <div className="relative w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={closeVideoModal}
          className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors z-10"
          aria-label="Close video"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden ring-1 ring-white/10">
          <video
            ref={modalVideoRef}
            className="w-full h-full object-cover cursor-pointer"
            src="/images/laptop/subscription-video.mp4"
            controls
            playsInline
            preload="auto"
          />
        </div>
      </div>
    </div>
  )}
{/* ─── SERVICE CARDS ──────────────────────────────────────────────────── */}
<section className="py-10 sm:py-12 md:py-16">
  <div className="max-w-[1400px] mx-auto">
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:gap-8"
      style={{ perspective: "1600px" }}
    >
      {[
        {
          name: isArabic ? "المدققون" : "Checkers",
          image: isDarkMode ? checkDark : checkWhite,
          description: isArabic
            ? "تحقق من غرامات التجاوز، حظر السفر، الاختفاء، النواكاس، والمزيد."
            : "Check overstay fines, travel bans, absconding, nawakas, and more.",
          cta: isArabic ? "تقديم" : "Apply",
          link: "/customer-dashboard",
          accent: "#3B82F6",
        },
        {
          name: isArabic ? "الخدمات" : "Services",
          image: isDarkMode ? servicesImageDark : servicesImage3,
          description: isArabic
            ? "تقديم طلبات تصاريح الدخول، تأشيرة الإقامة، الهوية الإماراتية، التجديدات، وغيرها."
            : "Apply for entry permits, residence visa, emiratesid, renewals, etc.",
          cta: isArabic ? "تقديم" : "Apply",
          link: "/apply",
          accent: "#10B981",
        },
        {
          name: isArabic ? "الباقات" : "Packages",
          image: isDarkMode ? packagesImageDark : servicesImage2,
          description: isArabic
            ? "تتيح لك الباقات اختيار التطبيقات المجمعة لمعاملاتك الحكومية"
            : "Packages allow you to choose bundled applications for your govt transactions",
          cta: isArabic ? "تقديم" : "Apply",
          link: "/packages",
          accent: "#8B5CF6",
        },
      ].map((card, idx) => {
        const { ref, isInView } = useInView({ threshold: 0.1 });
        return (
          <div
            key={idx}
            ref={ref as any}
            onClick={() => {
              if (card.link === "/packages") {
                setOpen(true);
              } else {
                navigate(card.link);
              }
            }}
            className={`
              group relative flex w-full flex-col
              rounded-3xl overflow-hidden cursor-pointer
              transition-all duration-500 ease-out
              ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
            `}
            style={{
              transitionDelay: `${idx * 100}ms`,
            }}
          >
            <div className="relative flex flex-col w-full h-full rounded-3xl bg-white dark:bg-[#0c0c0c] overflow-hidden border border-gray-200 dark:border-zinc-800 hover:border-[#14235E]/30 dark:hover:border-[#14235E]/30 transition-all duration-300 hover:-translate-y-2 ">
              
              {/* Image Container */}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <img
                  src={card.image}
                  alt={card.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Category Label */}
                <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span
                    className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium border border-white/10"
                  >
                    {card.name}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white group-hover:text-[#14235E] dark:group-hover:text-[#14235E] transition-colors duration-300">
                    {card.name}
                  </h3>
                </div>

                <p className="text-sm text-black/60 dark:text-white/50 leading-relaxed font-light max-w-sm">
                  {card.description}
                </p>

                <button
                  className="
                    group/btn relative inline-flex items-center justify-start gap-3
                    overflow-hidden rounded-2xl
                    px-8 sm:px-10
                    py-2.5 sm:py-3
                    text-[15px] sm:text-[17px] font-medium tracking-tight
                    text-white mt-4 w-fit
                    transition-all duration-300
                    hover:-translate-y-0.5 active:translate-y-0
                    bg-[#14235E] hover:bg-[#1A3A6E]
                  "
                >
                  <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                  <span className="relative z-10 whitespace-nowrap">{card.cta}</span>

                  <div
                    className="
                      relative z-10 flex h-7 w-7 sm:h-8 sm:w-8
                      items-center justify-center rounded-full bg-white
                      transition-transform duration-300 group-hover/btn:translate-x-1
                    "
                  >
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-black" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</section>
  {/* ─── FULLSCREEN VIDEO MODAL ────────────────────────────────────── */}
  {isVideoModalOpen && (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center" onClick={() => setIsVideoModalOpen(false)}>
      <div className="relative w-full h-full bg-black" onClick={(e) => e.stopPropagation()}>
        <video
          ref={modalVideoRef}
          className="w-full h-full object-cover"
          src="/images/laptop/subscription-video.mp4"
          controls
          autoPlay
          playsInline
          controlsList="nodownload"
          onClick={(e) => e.stopPropagation()}
        />

        <button
          onClick={() => setIsVideoModalOpen(false)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all duration-300 hover:scale-110 border border-white/10 z-20"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

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

        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/30 text-[10px] sm:text-xs bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5 pointer-events-none">
          Press ESC or click ✕ to close
        </div>
      </div>
    </div>
  )}

  <TammatSupervisor position="bottom-right" size="md" showTranscript={true} />

  <TammatVoiceAgent position="bottom-right" size="md" showTranscript={true} />

  <PackageApplicationDialog open={open} onOpenChange={setOpen} />
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
        <div
          className={`text-center mb-8 sm:mb-12 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
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
        </div>

        {/* Professional Person + iPhone Layout */}
        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">

            {/* Professional Person Image - Ultra Realistic */}
            <div
              className={`relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[380px] order-2 lg:order-1 transition-all duration-700 delay-200 ${
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#e8e0d0]">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
                  alt="Professional businessman in UAE celebrating success"
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a2520]/40 via-transparent to-transparent" />
              </div>
            </div>

            {/* iPhone Mockup with Scroll-changing content */}
            <div
              ref={phoneRef}
              className={`relative w-full max-w-[220px] sm:max-w-[260px] order-1 lg:order-2 transition-all duration-700 delay-300 ${
                isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
            >
              {/* iPhone Frame */}
              <div className="relative rounded-[2.5rem] sm:rounded-[3rem] bg-[#1a1a1a] p-2 sm:p-3 shadow-2xl">
                {/* Dynamic Island */}
                <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-6 sm:h-7 bg-black rounded-full z-20" />

                {/* Screen - Light yellow background matching section */}
                <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-[#faf8f2] aspect-[9/19] overflow-hidden relative">
                  <div className="p-3 sm:p-4 pt-10 sm:pt-12 space-y-2 sm:space-y-3">
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
                        <div
                          className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500"
                          style={{ width: `${currentSlide.progress}%` }}
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
                        <div
                          key={i}
                          className="flex items-center gap-2 transition-all duration-300"
                          style={{ transitionDelay: `${0.1 + i * 0.1}s` }}
                        >
                          <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center ${item.done ? 'bg-success' : 'border-2 border-primary'}`}>
                            {item.done && <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-background" />}
                          </div>
                          <span className={`text-[9px] sm:text-[10px] ${item.done ? 'text-background' : 'text-text-secondary'}`}>{item.text}</span>
                        </div>
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
                  </div>
                </div>
              </div>

              {/* Scroll hint for mobile */}
              <p className="text-center text-[10px] sm:text-xs text-text-secondary mt-3 sm:mt-4 lg:hidden">
                {t('lifeUpgraded.phoneSlides.scrollHint')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons with micro-interactions */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-10 sm:mt-12 md:mt-16 transition-all duration-700 delay-500 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div
            className="transition-all duration-300 hover:scale-105 active:scale-95"
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
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                <span className="absolute inset-0 bg-surface/20 scale-0 group-active:scale-100 rounded-full transition-transform duration-300" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Cards Section - Mobile First Grid */}
      <div className="relative z-10 px-4 pb-12 sm:pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Main Feature Card */}
          <div
            className="mb-4 sm:mb-6 transition-all duration-700"
            style={{ transitionDelay: '100ms' }}
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
                  <div className="transition-all duration-300 hover:scale-105 active:scale-95">
                    <Button
                      asChild
                      className="mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-secondary-hover hover:bg-secondary-hover/70 text-white rounded-full font-medium text-sm sm:text-base transition-all duration-300"
                    >
                      <Link to="/services">{t('lifeUpgradedCards.exploreServices')}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Card 1 - Stats */}
            <div
              className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-[#fef9f0] border border-[#e8e0d0] p-5 sm:p-6 md:p-8 min-h-[280px] sm:min-h-[320px] cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
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
            </div>

            {/* Card 2 - Services */}
            <div
              className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-[#fef9f0] border border-[#e8e0d0] p-5 sm:p-6 md:p-8 min-h-[280px] sm:min-h-[320px] cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
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
                  <span
                    key={i}
                    onClick={() => {
                      setQueryParams(tag.label)
                      setShowStartDialog(true)
                    }}
                    className={`
                      px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium cursor-pointer
                      transition-all duration-200 hover:scale-105 active:scale-95
                      ${tag.highlight ? 'bg-primary text-button-text' : 'bg-border text-foreground hover:bg-primary/20'}
                    `}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>

              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 md:left-8 transition-all duration-300 hover:scale-105 active:scale-95">
                <Button
                  asChild
                  variant="outline"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-secondary-hover hover:bg-secondary-hover/70 text-white border-0 rounded-full text-xs sm:text-sm font-medium"
                >
                  <span onClick={() => setShowStartDialog(true)}>{t(`features.browseServices`)}</span>
                </Button>
              </div>
            </div>
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
        <div
          className={`mb-12 sm:mb-16 md:mb-20 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-medium text-white -tracking-[4px]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t('testimonials.headline')}{' '}
            <span className="text-primary">{t('testimonials.headlineHighlight')}</span>
          </div>
        </div>

        {/* Stacking Cards - Scroll-triggered animations */}
        <div className="max-w-2xl space-y-4 sm:space-y-6">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className={`transition-all duration-700 hover:-translate-y-1 hover:scale-105`}
              style={{ transitionDelay: `${index * 100}ms` }}
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
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${review.color} flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6`}
                  >
                    <span className="text-foreground font-bold text-base sm:text-lg">{review.initials}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base sm:text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>{review.name}</p>
                    <p className="text-text-muted text-sm sm:text-base">{review.role}</p>
                  </div>
                </div>
              </div>
            </div>
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
        <div
          className={`mb-12 sm:mb-16 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
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
        </div>

     {/* Category Tabs – Staggered Reveal */}
<div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-12 border-b border-border pb-4">
  {categories.map((cat, index) => (
    <button
      key={cat.id}
      onClick={() => setActiveCategory(cat.id)}
      className={`
        px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300
        ${activeCategory === cat.id
          ? 'bg-foreground text-background shadow-lg'
          : 'text-text-secondary hover:bg-background/10 hover:text-foreground border border-border'}
      `}
      style={{
        transitionDelay: `${index * 80}ms`,
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {cat.label}
    </button>
  ))}
</div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredFeatures.map((feature, index) => (
            <div
              key={feature.id}
              className="group cursor-pointer transition-all duration-500 hover:-translate-y-2"
              style={{ transitionDelay: `${index * 100}ms` }}
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
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-12 sm:mt-16 transition-all duration-500 delay-300 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Button
            asChild
            className="px-8 sm:px-10 py-4 sm:py-5 bg-primary hover:bg-primary-hover text-button-text rounded-full font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span onClick={() => setShowStartDialog(true)}>
              {t('tammatFeatures.cta')} →
            </span>
          </Button>
        </div>
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
      className="relative py-10 sm:py-2 md:py-2 bg-white dark:bg-black/90 border-t-2 border-x-2 border-[#14235E]/20 rounded-t-[2rem] overflow-hidden px-0"
    >
   {/* ================= Premium Hero Header ================= */}
<div className="pointer-events-none absolute inset-0 overflow-hidden">
  <div className="absolute right-[-6rem] bottom-[-6rem] h-[18rem] w-[18rem] sm:h-[24rem] sm:w-[24rem] lg:h-[28rem] lg:w-[28rem] rounded-full bg-[#14235E]/10 blur-[100px] sm:blur-[120px] lg:blur-[150px] animate-float-slower" />
  <div
    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
    style={{
      backgroundImage:
        "radial-gradient(circle at 1px 1px,currentColor 1px,transparent 0)",
      backgroundSize: "24px 24px sm:28px 28px lg:36px 36px",
    }}
  />
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/60 dark:to-black/80" />
</div>

<div className="container relative z-10 mx-auto max-w-[1500px] px-3 sm:px-5 lg:px-10">
  <div
    className={cn(
      "mb-8 sm:mb-12 lg:mb-16 transition-all duration-700",
      isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    )}
  >
    <div className="flex flex-col gap-8 lg:gap-12 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <h2
          className="mt-4 sm:mt-6 lg:mt-8 w-full max-w-none font-bold leading-[1.05] sm:leading-[0.95] tracking-[-0.03em] sm:tracking-[-0.04em] text-black dark:text-white whitespace-normal break-words"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontVariationSettings: "'opsz' 144",
            fontSize: 'clamp(1.6rem, 6vw, 3rem)'
          }}
        >
          {t("serviceJourney.headline")}
          <br />
          <span className="text-[#14235E] font-normal">
            {t("serviceJourney.headlineHighlight")}
          </span>
        </h2>
      </div>
    </div>
  </div>

{/* ─── Premium Modern Segmented Tabs ──────────────────────────────────────── */}
<div
  className={cn(
    "mb-3 sm:mb-5 lg:mb-8 flex justify-center px-1 transition-all duration-500 delay-100",
    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
  )}
>
  <div
    className="relative flex w-full max-w-full sm:max-w-fit overflow-x-auto scrollbar-hide 
      rounded-3xl sm:rounded-2xl lg:rounded-3xl 
      border border-black/10 dark:border-white/10 
      p-0 sm:p-3 shadow-inner shadow-black/5 dark:shadow-white/5"
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
              group relative flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-2.5 
              rounded-lg sm:rounded-xl 
              px-5 sm:px-5 lg:px-5 xl:px-10
              py-3.5 sm:py-2 lg:py-3.5 
              transition-all duration-300
              ${active 
                ? "text-white dark:text-white" 
                : "text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              }
            `}
          >
            {/* ─── Active Background ──────────────────────────────────────── */}
            {active && (
              <div className="absolute inset-0 overflow-hidden rounded-lg sm:rounded-2xl bg-[#14235E] dark:bg-[#14235E] shadow-[0_4px_15px_rgba(10,50,105,.15)] dark:shadow-[0_4px_15px_rgba(10,50,105,.25)] -z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
              </div>
            )}

            {/* ─── Hover Background ──────────────────────────────────────── */}
            {!active && (
              <span className="absolute inset-0 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 bg-black/[0.05] dark:bg-white/[0.08] transition-opacity duration-300" />
            )}

            {/* ─── Icon ────────────────────────────────────────────────────── */}
            <div
              className={`
                relative z-10 flex h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 
                items-center justify-center 
                rounded-lg 
                transition-all duration-300
                ${active 
                  ? "bg-white/20 text-white shadow-[0_2px_8px_rgba(0,0,0,.1)] dark:bg-white/20" 
                  : "bg-black/[0.04] dark:bg-white/[0.05] text-zinc-500 dark:text-zinc-400 group-hover:bg-black/[0.06] dark:group-hover:bg-white/[0.08] group-hover:scale-105"
                }
              `}
            >
              <tab.Icon 
                className={cn(
                  "h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 transition-colors duration-300",
                  active ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'
                )} 
                strokeWidth={2} 
              />
            </div>

            {/* ─── Label ────────────────────────────────────────────────────── */}
            <span className={`
              relative z-10 
              text-[12px] sm:text-[11px] lg:text-sm xl:text-[16px] 
              font-medium sm:font-semibold 
              whitespace-nowrap 
              transition-colors duration-300
              ${active 
                ? 'text-white' 
                : 'text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white'
              }
            `}>
              {tab.label}
            </span>

            {/* ─── Badge ────────────────────────────────────────────────────── */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`
                relative z-10 
                ml-0.5 sm:ml-1 
                px-1 sm:px-1.5 
                py-0.5 
                rounded-full 
                text-[7px] sm:text-[9px] lg:text-[10px] 
                font-bold 
                transition-all duration-300
                ${active 
                  ? "bg-white/30 text-white" 
                  : "bg-red-500/90 text-white shadow-sm shadow-red-500/30"
                }
              `}>
                {tab.badge > 9 ? '9+' : tab.badge}
              </span>
            )}

          </button>
      );
    })}
  </div>
</div>
      {/* ================= Main layout ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Timeline card — steps as ink stamps on a dashed flight path */}
          <div
            className="lg:col-span-7 bg-white dark:bg-white/[0.03] rounded-2xl p-5 sm:p-8 shadow-sm border border-[#14235E]/12 dark:border-white/10 relative transition-all duration-500"
            style={{ transitionDelay: '200ms' }}
          >
            <div className="mb-6 flex items-center justify-between gap-3 border-b border-solid border-[#14235E]/20 dark:border-white/15 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#14235E] dark:bg-[#14235E] flex items-center justify-center shrink-0">
                  <activeTabMeta.Icon className="w-5 h-5 text-[#fff] dark:text-[#fff]" />
                </div>
                <div>
                  <div
                    className="text-lg sm:text-xl font-medium text-[#0A0E14] dark:text-white"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {t(`serviceJourney.${activeTab}.title`)}
                  </div>
                  <p className="text-[#0A0E14]/45 dark:text-white/40 text-xs sm:text-sm">
                    {t(`serviceJourney.${activeTab}.description`)}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex shrink-0 items-center gap-1.5 rounded-full border border-[#14235E]/20 dark:border-[#14235E]/25 px-3 py-1.5 font-mono text-[11px] font-semibold text-[#14235E] dark:text-[#14235E]">
                {t(`serviceJourney.${activeTab}.totalDuration`)}
              </div>
            </div>
 
            <div className="relative space-y-1">
              {currentSteps.map((step, index) => {
                const done = activeStep > index;
                const active = activeStep === index;
                return (
                  <div key={`${activeTab}-step-${index}`} className="relative flex gap-4 sm:gap-3">
                    {/* connecting dashed "flight path" */}
                    {index < currentSteps.length - 1 && (
                      <div className="absolute left-[19px] sm:left-[23px] top-11 sm:top-12 bottom-0 w-px border-l-2 border-solid border-[#14235E]/15 dark:border-white/10" />
                    )}
 
                    <button
                      onClick={() => setActiveStep(index)}
                      className="relative shrink-0 self-start pt-3"
                      aria-label={step.title}
                    >
                      <div
                        className={`
                          flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-solid font-mono text-xs font-bold transition-all duration-300
                          ${
                            done
                              ? 'border-[#14235E] bg-[#14235E] text-[#fff] rotate-[-6deg]'
                              : active
                              ? 'border-[#14235E] bg-[#14235E] text-white scale-105 shadow-md shadow-[#14235E]/25'
                              : 'border-[#14235E]/20 dark:border-white/15 text-[#0A0E14]/30 dark:text-white/25'
                          }
                        `}
                      >
                        {done ? '✓' : String(index + 1).padStart(2, '0')}
                      </div>
                    </button>
 
                    <div
                      onClick={() => setActiveStep(index)}
                      className={`
                        group mb-2 flex-1 min-w-0 cursor-pointer rounded-2xl border px-4 sm:px-5 py-3.5 sm:py-4 transition-all duration-300
                        ${
                          active
                            ? 'border-[#14235E]/30 bg-[#14235E]/[0.04] dark:bg-[#14235E]/10'
                            : 'border-transparent hover:border-[#14235E]/15 hover:bg-black/[0.015] dark:hover:bg-white/[0.02]'
                        }
                      `}
                    >
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <h4 className="text-sm sm:text-base font-semibold text-[#0A0E14] dark:text-white truncate">
                          {step.title}
                        </h4>
                        <span className="shrink-0 font-mono text-[10px] sm:text-[11px] font-semibold text-[#0A0E14]/35 dark:text-white/35">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-[#0A0E14]/50 dark:text-white/40">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>


{/* ─── Completion strip — ticket stub styling ────────────────────────────── */}
<div className="relative mt-2 sm:mt-8 lg:mt-9 flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border border-[#14235E]/15 dark:border-white/10 bg-[#14235E]/[0.03] dark:bg-white/[0.02] p-3 sm:p-4 lg:p-5">
  
  {/* ─── Icon ────────────────────────────────────────────────────────────── */}
  <div className="flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-full border-2 border-solid border-[#14235E] bg-[#14235E]/10">
    <Award className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-[#14235E]" />
  </div>
  
  {/* ─── Content ──────────────────────────────────────────────────────────── */}
  <div className="min-w-0 flex-1">
    <p className="font-mono text-[8px] sm:text-[9px] lg:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] lg:tracking-[0.22em] font-semibold text-[#0A0E14]/40 dark:text-white/35">
      Cleared
    </p>
    <h4 className="mt-0.5 text-xs sm:text-sm lg:text-base font-semibold text-[#0A0E14] dark:text-white">
      {t(`serviceJourney.${activeTab}.completion`)}
    </h4>
    <p className="text-xs sm:text-sm lg:text-base text-[#0A0E14] dark:text-white/80 font-light">
      Everything is ready. Continue your application anytime.
    </p>
    
    {/* ─── Button ────────────────────────────────────────────────────────── */}
    <button
      onClick={() => navigate('/apply')}
      className="mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 sm:gap-2 text-[#14235E] font-semibold text-[10px] sm:text-sm transition-all hover:gap-2 sm:hover:gap-3 group"
    >
      <span>Continue Application</span>
      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
    </button>
  </div>
</div>
</div> 




{/* Right column */}
<div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-5">
  {/* Featured image — passport-page framing, 3D tilt, gradient-border depth (no box-shadow) */}
  <div
    className="group relative col-span-2 w-full h-52 xs:h-60 sm:h-72 md:h-80 lg:h-[26rem] rounded-2xl sm:rounded-[28px] transition-transform duration-500 ease-out will-change-transform"
    style={{
      transformStyle: "preserve-3d",
      background: "linear-gradient(155deg, #4A8ABF66, #14235E33)",
      padding: "1.5px", // gradient "border" trick — fakes elevation without a shadow
    }}
    onMouseMove={(e) => {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "rotateY(0deg) rotateX(0deg) translateY(0)";
    }}
  >
    <div className="relative w-full h-full overflow-hidden rounded-[calc(1rem-1.5px)] sm:rounded-[26.5px] bg-[#14235E]">
      <img
        src={currentImages[activeStep]}
        alt={currentSteps[activeStep]?.title}
        className="absolute inset-0 w-full h-full object-content transition-transform duration-1000 ease-out group-hover:scale-105"
      />

      {/* Base gradient so the whole image reads cleanly even without the panel */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Subtle depth wash along the top edge instead of a shadow */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 lg:p-6 z-0">
        <div className="rounded-md">
          <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-white tracking-tight leading-tight line-clamp-2">
            {currentSteps[activeStep]?.title}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-white/70 leading-relaxed line-clamp-2">
            {currentSteps[activeStep]?.description}
          </p>

          <div className="mt-2 flex items-center gap-1.5">
            {currentSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className="group/dot relative py-2"
                aria-label={`Go to step ${i + 1}`}
              >
                <span
                  className="block h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === activeStep ? "1.5rem" : "0.75rem",
                    background:
                      i === activeStep
                        ? "linear-gradient(90deg, #4A8ABF, #FAFAFA)"
                        : i < activeStep
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(255,255,255,0.15)",
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Corner accent to match the service-card treatment */}
      <div className="absolute top-0 right-0 w-14 h-14 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-7 h-7 rounded-tr-2xl"
          style={{ borderTop: "2px solid #4A8ABF", borderRight: "2px solid #14235E" }}
        />
      </div>
    </div>
  </div>
{/* Success card — Modern Premium */}
<div
  className="group relative w-full col-span-2 md:col-span-1 rounded-3xl transition-all duration-500 ease-out will-change-transform"
>
  <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c0c0c] p-6 border border-gray-200 dark:border-zinc-800 htransition-all duration-300 shadow-sm ">
    

    {/* Verified badge */}
    <div className="inline-flex items-center gap-2 rounded-full bg-[#14235E]/10 dark:bg-[#14235E]/20 px-3.5 py-1.5 border border-[#14235E]/20 dark:border-[#14235E]/30">
      <ShieldCheck className="h-3.5 w-3.5 text-[#14235E] dark:text-[#14235E]" />
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#14235E] dark:text-[#14235E]">
        {t("successCard.verified")}
      </p>
    </div>

    {/* Headline stat */}
    <h2 className="mt-4 flex items-end text-5xl sm:text-6xl font-bold tracking-tight leading-none text-black dark:text-white">
      99.8
      <span className="ml-1.5 mb-1 text-lg font-semibold text-gray-400 dark:text-white/40">%</span>
    </h2>

    <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-white/60">
      {t("successCard.approvedText")}
      <span className="font-semibold text-[#14235E] dark:text-[#14235E]"> {t("successCard.expertReview")} </span>
      {t("successCard.processText")}
    </p>

    <div className="my-5 h-px bg-gradient-to-r from-[#14235E]/20 via-[#14235E]/40 to-[#14235E]/20 dark:from-[#14235E]/30 dark:via-[#14235E]/50 dark:to-[#14235E]/30" />

    {/* Stat grid */}
    <div className="grid grid-cols-2 gap-3">
      {[
        { Icon: TrendingUp, value: "99.8%", label: t("successCard.approval") },
        { Icon: Activity, value: "24/7", label: t("successCard.monitoring") },
        { Icon: Users, value: "250+", label: t("successCard.expertAdvisors") },
        { Icon: ShieldCheck, value: "A+", label: t("successCard.rating") },
      ].map(({ Icon, value, label }, i) => (
        <div
          key={i}
          className="group/tile rounded-xl bg-gray-50 dark:bg-[#141414] p-3.5 transition-all duration-300 hover:bg-[#14235E]/5 dark:hover:bg-[#14235E]/10 hover:-translate-y-0.5 border border-transparent hover:border-[#14235E]/20 dark:hover:border-[#14235E]/20"
        >
          <Icon
            className="mb-2 h-4 w-4 text-[#14235E] dark:text-[#14235E] transition-transform duration-300 group-hover/tile:scale-110"
          />
          <p className="text-xl font-bold tracking-tight text-black dark:text-white">{value}</p>
          <span className="text-[11px] text-gray-400 dark:text-white/40">{label}</span>
        </div>
      ))}
    </div>

  </div>
</div>
 
            {/* CTA card */}
            <div
              onClick={() => navigate('/apply')}
              className="hidden md:flex relative h-full flex-col cursor-pointer overflow-hidden rounded-3xl border border-white/10 p-5 transition-all duration-500 hover:-translate-y-1"
            >
              <div
                className="absolute inset-0 -z-20 bg-cover"
                style={{ backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjLLKWm9-qd6hj615NwZSSMnNYrGfA5VgzqfdrDC7PVw&s=10')" }}
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#000]/75 via-[#0A0E14]/80 to-transparent" />
 
 
              <div className="mt-25  flex flex-1 flex-col">
              
                <h2 className="text-3xl font-bold text-white leading-tight">{t('ctaCard.startYour')}</h2>
                <h4 className="text-2xl font-bold text-white mt-0.5 " style={{ fontFamily: "'Fraunces', serif" }}>
                  {t('ctaCard.dreamJourney')}
                </h4>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60 font-light">{t('ctaCard.description')}</p>
 
             <div className="mt-6">
  <button className="inline-flex items-center gap-2.5 px-6 py-3 text-white font-semibold text-sm transition-all duration-300 group">
    <span>{t('ctaCard.applyNow')}</span>
    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
  </button>
</div>
 
                <div className="mt-auto pt-5 border-t border-dashed border-white/15 flex items-center gap-6 text-[11px] text-white/55 font-light">
                  <span>{t('ctaCard.applications')}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    {t('ctaCard.successRate')}
                  </span>
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
        <LaptopShowcase />
    </section>
  );
};
// ============================================================================
//  What Does TMMT Membership Include? – Modern Simple Design
// ============================================================================
function MembershipSection() {
  const { t } = useTranslation();
  const [isArabic, setIsArabic] = useState(false);
  useEffect(() => {
    const checkLanguage = () => {
      const lang = localStorage.getItem('i18nextLng');
      const htmlLang = document.documentElement.lang;
      setIsArabic(lang === 'ar' || lang === 'ar-AE' || htmlLang === 'ar' || htmlLang === 'ar-AE');
    };
    checkLanguage();
    const handler = () => checkLanguage();
    window.addEventListener('storage', handler);
    window.addEventListener('languageChanged', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('languageChanged', handler);
    };
  }, []);

  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-white dark:bg-black overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14 lg:mb-20">
            <h2
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] tracking-[-0.02em] text-black dark:text-white"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span className="font-bold text-black dark:text-white">
                {isArabic ? 'ماذا تشمل عضوية' : 'What Does TMMT Membership'}
              </span>
              <br className="hidden sm:block" />
              <span
                className="font-light bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #14235E, #4A8ABF)' }}
              >
                {isArabic ? 'TMMT؟' : 'Include?'}
              </span>
            </h2>

            <p className="mt-4 max-w-3xl mx-auto text-gray-500 dark:text-white/50 text-[10px] sm:text-base lg:text-[19px] leading-relaxed px-4 sm:px-0">
              {isArabic
                ? 'تمنحك TMMT وصولاً مباشراً إلى خبراء لديهم سنوات من الخبرة في الإجراءات والخدمات الحكومية في الإمارات، مما يساعدك على اتخاذ القرارات الصحيحة قبل اتخاذ أي إجراء.'
                : 'TMMT gives you direct access to specialists with years of experience in UAE government procedures and services, helping you make the right decisions before taking action.'}
            </p>
          </div>

          {/* Service Cards – Modern Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-7">
            {[
              {
                icon: Shield,
                title: isArabic ? 'الإقامة والتأشيرات' : 'Residency & Visas',
                items: isArabic
                  ? ['إصدار التأشيرات والتجديدات والإلغاءات', 'تأشيرات السياحة والزيارة', 'كفالة العائلة', 'تحويل الكفالة', 'تتبع الطلبات', 'الغرامات والقيود']
                  : ['Visa issuance, renewals & cancellations', 'Tourist & visit visas', 'Family sponsorship', 'Sponsorship transfers', 'Application tracking', 'Fines & restrictions'],
                from: '#3B82F6',
                to: '#06B6D4',
              },
              {
                icon: Landmark,
                title: isArabic ? 'الهوية الإماراتية وجوازات السفر' : 'Emirates ID & Passports',
                items: isArabic
                  ? ['إصدار الهوية الإماراتية وتجديدها', 'تتبع الطلبات', 'تحديثات التوصيل', 'تجديد جوازات السفر والإرشاد']
                  : ['Emirates ID issuance & renewals', 'Application tracking', 'Delivery updates', 'Passport renewals & guidance'],
                from: '#10B981',
                to: '#14B8A6',
              },
              {
                icon: Building2,
                title: isArabic ? 'التراخيص التجارية والأعمال' : 'Business & Trade Licenses',
                items: isArabic
                  ? ['اختيار النشاط التجاري المناسب', 'اختيار الترخيص التجاري المناسب', 'فهم تكاليف التأسيس', 'مراجعات السلطات والتصاريح', 'بطاقات المنشأة', 'تغييرات الشركاء والموافقات']
                  : ['Choosing the right business activity', 'Selecting the right trade license', 'Understanding setup costs', 'Authority & permission reviews', 'Establishment cards', 'Partner changes & approvals'],
                from: '#A855F7',
                to: '#EC4899',
              },
              {
                icon: Car,
                title: isArabic ? 'المركبات والقيادة' : 'Vehicles & Driving',
                items: isArabic
                  ? ['شراء وبيع المركبات', 'نقل الملكية', 'التسجيل والتأمين والفحص', 'رخص القيادة', 'الإجراءات المرورية والغرامات']
                  : ['Buying & selling vehicles', 'Ownership transfers', 'Registration, insurance & testing', 'Driving licenses', 'Traffic procedures & fines'],
                from: '#F59E0B',
                to: '#EF4444',
              },
              {
                icon: Users2,
                title: isArabic ? 'خدمات العائلة' : 'Family Services',
                items: isArabic
                  ? ['إجراءات الزواج', 'توثيق المستندات', 'الترجمة القانونية', 'طلبات العائلة والدعم']
                  : ['Marriage procedures', 'Document attestation', 'Legal translation', 'Family applications & support'],
                from: '#4A8ABF',
                to: '#14235E',
              },
              {
                icon: Briefcase,
                title: isArabic ? 'التوظيف والقوى العاملة' : 'Employment & Workforce',
                items: isArabic
                  ? ['تصاريح العمل', 'كفالة الموظفين', 'العمالة المنزلية', 'إجراءات التوظيف']
                  : ['Work permits', 'Employee sponsorship', 'Domestic workers', 'Employment procedures'],
                from: '#06B6D4',
                to: '#3B82F6',
              },
            ].map((section, idx) => (
              <div
                key={section.title}
                className="group relative rounded-2xl bg-white dark:bg-[#0c0c0c] p-6 sm:p-7 border border-gray-200 dark:border-zinc-800 hover:border-[#14235E]/30 dark:hover:border-[#14235E]/30 transition-all duration-300"
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, ${section.from}, ${section.to})` }}
                />

                <div className="relative">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <div
                      className="p-2.5 sm:p-3 rounded-xl transition-all duration-300"
                      style={{ background: `${section.from}1a` }}
                    >
                      <section.icon
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        style={{ color: section.from }}
                        strokeWidth={1.75}
                      />
                    </div>
                    <h4 className="font-bold text-black dark:text-white text-sm sm:text-lg">
                      {section.title}
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-white/60"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 mt-0.5" style={{ color: section.from }} strokeWidth={2.5} />
                        <span className="font-light">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Full Service + Smart Renewals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8 sm:mt-10">
            <div className="group relative rounded-2xl bg-white dark:bg-[#0c0c0c] p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 hover:border-[#14235E]/30 dark:hover:border-[#14235E]/30 transition-all duration-300">
              <div className="flex items-center gap-3 sm:gap-4 mb-3">
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#14235E]/10 dark:bg-[#14235E]/20">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-[#14235E] dark:text-[#14235E]" strokeWidth={1.75} />
                </div>
                <h4 className="font-bold text-black dark:text-white text-base sm:text-xl">
                  {isArabic ? 'معالجة الخدمة الكاملة' : 'Full Service Processing'}
                </h4>
              </div>
              <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed font-light">
                {isArabic
                  ? 'إذا كنت تفضل عدم التعامل مع العملية بنفسك، يمكن لـ TMMT إكمال العملية بأكملها نيابة عنك مقابل رسوم الخدمة بالإضافة إلى الرسوم الحكومية.'
                  : 'If you prefer not to handle the process yourself, TMMT can complete the entire process on your behalf for service fees plus government fees.'}
              </p>
            </div>

            <div className="group relative rounded-2xl bg-white dark:bg-[#0c0c0c] p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 hover:border-[#14235E]/30 dark:hover:border-[#14235E]/30 transition-all duration-300">
              <div className="flex items-center gap-3 sm:gap-4 mb-3">
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#14235E]/10 dark:bg-[#14235E]/20">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#14235E] dark:text-[#14235E]" strokeWidth={1.75} />
                </div>
                <h4 className="font-bold text-black dark:text-white text-base sm:text-xl">
                  {isArabic ? 'تنبيهات التجديد الذكية' : 'Smart Renewal Alerts'}
                </h4>
              </div>
              <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed font-light mb-3">
                {isArabic
                  ? 'تلقي تذكيرات عبر واتساب أو البريد الإلكتروني قبل انتهاء صلاحية:'
                  : 'Receive reminders through WhatsApp or email before the expiry of:'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(isArabic
                  ? ['جوازات السفر', 'التأشيرات', 'الهوية الإماراتية', 'الرخص التجارية', 'بطاقات المنشأة', 'تصاريح العمل', 'رخص القيادة', 'تسجيلات المركبات']
                  : ['Passports', 'Visas', 'Emirates IDs', 'Trade licenses', 'Establishment cards', 'Work permits', 'Driving licenses', 'Vehicle registrations']
                ).map((item) => (
                  <span
                    key={item}
                    className="text-[9px] sm:text-xs font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-black dark:text-white/70 border border-gray-200 dark:border-zinc-700 transition-all duration-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* How Can TMMT Help You? */}
          <div className="mt-8 sm:mt-10 relative rounded-2xl bg-white dark:bg-[#0c0c0c] p-6 sm:p-8 lg:p-10 border border-gray-200 dark:border-zinc-800 hover:border-[#14235E]/30 dark:hover:border-[#14235E]/30 transition-all duration-300">
            <div className="flex items-center gap-3 sm:gap-4 mb-5">
              <div className="p-2.5 sm:p-3 rounded-xl bg-[#14235E]/10 dark:bg-[#14235E]/20">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#14235E] dark:text-[#14235E]" strokeWidth={1.75} />
              </div>
              <h4 className="font-bold text-black dark:text-white text-base sm:text-xl">
                {isArabic ? 'كيف يمكن لـ' : 'How Can'}{' '}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #14235E, #4A8ABF)' }}>
                  TMMT
                </span>{' '}
                {isArabic ? 'مساعدتك؟' : 'Help You?'}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(isArabic
                ? [
                    'تجنب غرامات التجديد المتأخرة',
                    'تجنب اختيار تأسيس الأعمال الخاطئ',
                    'تجنب التكاليف والرسوم غير الضرورية',
                    'تجنب الأخطاء المكلفة في الإجراءات الحكومية',
                    'توفير الوقت والجهد',
                    'اتخاذ قرارات مستنيرة بثقة قبل اتخاذ أي إجراء',
                  ]
                : [
                    'Avoid late renewal fines',
                    'Avoid choosing the wrong business setup',
                    'Avoid unnecessary costs and fees',
                    'Avoid costly mistakes in government procedures',
                    'Save time and effort',
                    'Make informed decisions with confidence before taking action',
                  ]
              ).map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-white/60 p-3 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5 transition-all duration-300"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-[#14235E] dark:text-[#4A8ABF] shrink-0"
                    strokeWidth={2.5}
                  />
                  <span className="font-light">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
// FAQ Section - Smooth accordion animations (pure CSS)
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
        <div
          className={`mb-12 sm:mb-16 md:mb-20 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div
            className="text-[5rem] -mt-4 -tracking-[6px] sm:text-[5rem] md:text-[5rem] lg:text-[5rem] font-medium text-foreground leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t('faq.headline')}{' '}
            <span className="text-[#14235E]">{t('faq.headlineHighlight')}</span>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={item.id}
              className="border-b border-border/50 transition-all duration-500"
              style={{ transitionDelay: `${index * 100}ms` }}
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
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${openIndex === index ? 'bg-foreground text-background rotate-45' : 'bg-border text-foreground'
                    }`}
                >
                  <span className="text-xl sm:text-2xl font-light">+</span>
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="pb-6 sm:pb-8 text-text-secondary text-base sm:text-lg leading-relaxed max-w-3xl">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
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
{/* ✅ WhatsApp Channel */}
<li>
  <a 
    href="https://whatsapp.com/channel/0029Vb8cSN6Fy72JAZVR0R0M" 
    className="text-background/70 hover:text-primary transition-colors flex items-center gap-2.5 group"
    target="_blank"
    rel="noopener noreferrer"
  >
    <svg 
      className="w-4 h-4 group-hover:scale-110 transition-transform" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
    WhatsApp 
  </a>
</li>

{/* ✅ Facebook - New */}
<li>
  <a 
    href="https://www.facebook.com/share/1L9cTPxZ88/?mibextid=wwXIfr" 
    className="text-background/70 hover:text-primary transition-colors flex items-center gap-2.5 group"
    target="_blank"
    rel="noopener noreferrer"
  >
    <svg 
      className="w-4 h-4 group-hover:scale-110 transition-transform" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
    Facebook
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
        <div className="flex whitespace-nowrap animate-scroll-text">
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
        </div>
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
      <div className="bg-background/5 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 backdrop-blur-xl sm:h-24 sm:w-24 lg:h-28 lg:w-28 transition-transform duration-300 hover:scale-110">
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
              className={`flex whitespace-nowrap animate-scroll-right ${pausedRow === 'first' ? 'animation-play-state-paused' : ''}`}
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

const LaptopShowcase = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView({ threshold: 0.2 });
  const [activeScreen, setActiveScreen] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isArabic, setIsArabic] = useState(false);
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

  // Image paths
  const screens = [
    { id: 'img1', image: '/images/laptop/img1.png' },
    { id: 'img2', image: '/images/laptop/img2.png' },
    { id: 'img3', image: '/images/laptop/img3.png' },
    { id: 'img4', image: '/images/laptop/img4.png' },
    { id: 'img5', image: '/images/laptop/img5.png' },
    { id: 'img6', image: '/images/laptop/img6.png' },
    { id: 'img7', image: '/images/laptop/img7.png' },
  ];

  // Auto-slide – changes every 2 seconds
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % screens.length);
    }, 3000); // ← changed from 5000 to 2000

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, screens.length]);

  // Navigation handlers (unchanged)
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
    }, 8000);
  };

  const goToPrev = () => {
    const prevIndex = (activeScreen - 1 + screens.length) % screens.length;
    goToScreen(prevIndex);
  };

  const goToNext = () => {
    const nextIndex = (activeScreen + 1) % screens.length;
    goToScreen(nextIndex);
  };

  const togglePause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }

    const newPauseState = !isPaused;
    setIsPaused(newPauseState);
    setManualPause(newPauseState);
  };
return (
    <section
  ref={sectionRef}
  className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden bg-gray-50/80 dark:bg-black/95"
>
  {/* Background */}
  <div className="absolute inset-0">
    <div
      className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(10,50,105,0.5) 1px, transparent 0)',
        backgroundSize: '26px 26px',
      }}
    />
  </div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
    {/* Header */}
    
    <div
      className={`text-center mb-8 sm:mb-12 md:mb-16 transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      
    
      <h2
        className="font-bold text-black dark:text-white leading-[1.05] tracking-[-0.02em]"
        style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(1.8rem, 8vw, 3rem)' }}
      >
        {isArabic ? (
          <>
            شاهد كيف
            <br />
            <span
              className="italic font-light"
              style={{
                backgroundImage: 'linear-gradient(100deg, #14235E, #4457AE 55%, #14235E)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              تعمل TMMT
            </span>
          </>
        ) : (
          <>
            See how
            <br />
            <span
              className="italic font-light"
              style={{
                backgroundImage: 'linear-gradient(100deg, #14235E, #14235E 55%, #14235E)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              TMMT works
            </span>
          </>
        )}
      </h2>
     <p className="text-black/50 dark:text-white/40 text-sm sm:text-base mt-3 max-w-2xl mx-auto font-light px-4">
        {isArabic
          ? 'اختبر معالجة التأشيرات السلسة مع منصتنا البديهية'
          : 'Experience seamless visa processing with our intuitive platform'}
      </p>
    </div>
 {/* ─── Laptop Mockup ───────────────────────────────────────────── */}
    <div
      className={`relative max-w-6xl mx-auto transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="relative">
        {/* Gradient-ring frame — border only, no box-shadow */}
        <div className="tmmt-ring relative rounded-xl sm:rounded-2xl md:rounded-3xl p-[1.5px]">
          <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#0d0d0d] to-[#050505] rounded-xl sm:rounded-2xl md:rounded-3xl p-1.5 sm:p-1.5 md:p-1">
            {/* Camera */}
            <div className="absolute top-2 sm:top-3 md:top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2 py-0.5">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#FAFAFA]/40 rounded-full" />
            </div>
 
            {/* Screen */}
            <div
              className="relative bg-black rounded-lg sm:rounded-xl md:rounded-3xl overflow-hidden aspect-video cursor-pointer group w-full min-h-[250px] sm:min-h-[340px] md:min-h-[420px] lg:min-h-[480px]"
              onClick={togglePause}
            >
              <div className="absolute inset-0 transition-opacity duration-700">
                <div className="w-full h-full flex items-center justify-center p-0 sm:p-1 md:p-1.5 lg:p-2">
                  <div className="relative w-full h-full rounded-none sm:rounded-lg md:rounded-xl lg:rounded-2xl overflow-hidden">
                    <img
                      src={screens[activeScreen].image}
                      alt={`Screenshot ${activeScreen + 1}`}
                      className="w-full h-full object-content transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
              </div>
 
              {/* Pause indicator */}
              {isPaused && (
                <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-20">
                  <span className="text-white text-[8px] sm:text-xs font-medium bg-black/60 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/10 flex items-center gap-1 sm:gap-1.5">
                    <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={2} />
                    Paused
                  </span>
                </div>
              )}
 
              {/* Screen glare — a lighting overlay, not a shadow */}
            </div>
          </div>
        </div>
 
        {/* Laptop Base — border only, no shadow */}
        <div className="relative">
          <div className="relative h-1.5 sm:h-2 md:h-3 lg:h-4 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-b-lg sm:rounded-b-xl md:rounded-b-2xl border-x border-b border-white/[0.06]">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-12 sm:w-20 md:w-24 lg:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-[#4457AE]/30 to-transparent rounded-b" />
          </div>
        </div>
      </div>
    </div>
 
    {/* ─── Navigation Controls ────────────────────────────────────── */}
    <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 md:mt-10">
      {/* Prev Button */}
      <button
        onClick={goToPrev}
        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border border-[#14235E]/20 dark:border-white/10 bg-white dark:bg-black/60 hover:bg-[#14235E] dark:hover:bg-[#14235E] hover:border-[#14235E] dark:hover:border-[#14235E] active:scale-95 transition-all duration-300 group"
        aria-label="Previous"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#14235E] dark:text-white/70 group-hover:text-white group-hover:-translate-x-0.5 transition-all duration-300" strokeWidth={2} />
      </button>
 
      {/* Segmented indicator track — modern replacement for plain dots */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
        {screens.map((_, index) => (
          <button
            key={index}
            onClick={() => goToScreen(index)}
            className={`relative h-1.5 sm:h-2 rounded-full overflow-hidden transition-all duration-300 ${
              index === activeScreen ? 'w-7 sm:w-9 md:w-10' : 'w-2 sm:w-2.5 md:w-3'
            }`}
            style={{
              backgroundColor: index === activeScreen ? 'rgba(20,35,94,0.14)' : 'rgba(20,35,94,0.18)',
            }}
            aria-label={`Go to slide ${index + 1}`}
          >
            {index === activeScreen && (
              <span
                className="tmmt-fill-bar absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: '100%',
                  backgroundImage: 'linear-gradient(90deg, #14235E, #4457AE)',
                  animation: isPaused ? 'none' : 'tmmt-fill 6s linear infinite',
                }}
              />
            )}
          </button>
        ))}
      </div>
 
      {/* Next Button */}
      <button
        onClick={goToNext}
        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border border-[#14235E]/20 dark:border-white/10 bg-white dark:bg-black/60 hover:bg-[#14235E] dark:hover:bg-[#14235E] hover:border-[#14235E] dark:hover:border-[#14235E] active:scale-95 transition-all duration-300 group"
        aria-label="Next"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#14235E] dark:text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" strokeWidth={2} />
      </button>
    </div>
 
    {/* Slide counter */}
    <div className="text-center mt-2 sm:mt-3 text-[10px] sm:text-xs text-black/30 dark:text-white/20 font-light tabular-nums">
      {String(activeScreen + 1).padStart(2, '0')} / {String(screens.length).padStart(2, '0')}
    </div>
  </div>
 
  {/* ─── Styles: gradient ring (border-only) + indicator fill anim ──── */}
  <style>{`
    .tmmt-ring {
      background: linear-gradient(140deg, rgba(80,80,80,0.45), rgba(60,60,60,0.25) 45%, rgba(40,40,40,0.15) 100%);
    }
    @keyframes tmmt-fill {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(0%); }
    }
    @media (prefers-reduced-motion: reduce) {
      .tmmt-fill-bar { animation: none !important; }
    }
  `}</style>
</section>

  );
};

// 7 Emirates Section with smooth reveal animation like goodhand.ae (pure CSS)
const EmiratesSection = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView({ threshold: 0.15 });
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

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-card/30 via-background to-background"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl transition-all duration-1500 ${isInView ? 'opacity-50 scale-100' : 'opacity-0 scale-90'}`} />
        <div className={`absolute -bottom-32 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl transition-all duration-1500 delay-300 ${isInView ? 'opacity-50 scale-100' : 'opacity-0 scale-90'}`} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header with smooth reveal */}
        <div
          className={`text-center mb-12 md:mb-20 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span
            className="inline-block font-poppins text-sm md:text-base font-medium text-primary mb-4 px-4 py-1.5 bg-primary/10 rounded-full"
          >
            🇦🇪 {t('emirates.subheadline')}
          </span>

          <div
            className="font-poppins tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-foreground mb-4"
          >
            {t('emirates.headline')}
            <br />
            <span className="text-primary">{t('emirates.headlineHighlight')}</span>
          </div>
        </div>

        {/* Emirates Grid with staggered reveal */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {emirates.map((emirate, index) => (
            <div
              key={emirate.id}
              className={`group relative cursor-pointer transition-all duration-700 ${index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''} ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredEmirate(emirate.id)}
              onMouseLeave={() => setHoveredEmirate(null)}
            >
              <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl ${index === 0 ? 'aspect-square' : 'aspect-[4/3]'} shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1`}>
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
                  <div className="transition-all duration-300" style={{ transform: hoveredEmirate === emirate.id ? 'translateY(-8px)' : 'translateY(0)' }}>
                    <h3 className={`font-poppins font-semibold text-white ${index === 0 ? 'text-xl md:text-3xl' : 'text-base md:text-xl'}`}>
                      {emirate.name}
                    </h3>
                  </div>

                  {/* Hover indicator */}
                  <div
                    className={`mt-2 md:mt-3 transition-all duration-300 ${
                      hoveredEmirate === emirate.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                  >
                    <span className="font-tajawal text-sm text-white/90 flex items-center gap-1">
                      Explore services <ArrowRightIcon className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Shine effect on hover */}
                <div
                  className={`absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 transition-all duration-600 ${
                    hoveredEmirate === emirate.id ? 'translate-x-[200%] opacity-30' : '-translate-x-full opacity-0'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
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
<header
      className="sticky top-0 z-50 p-4 transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ transform: hidden ? 'translateY(-110%)' : 'translateY(0)' }}
    >
      <div className="container mx-auto max-w-6xl">
        <div
          className={`
            relative flex h-14 items-center justify-between rounded-full px-5
            border transition-all duration-300  
            backdrop-blur-2xl backdrop-saturate-150
            bg-white/70 dark:bg-[#000]/60
            border-black/10 dark:border-white/10
            ${scrolled
              ? 'bg-white/90 dark:bg-[#000]/85 shadow-[0_8px_30px_-8px_rgba(10,50,105,0.25)] dark:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]'
              : 'shadow-sm shadow-black/5 dark:shadow-black/20'
            }
          `}
        >
          {/* ambient glow, only visible once scrolled for a subtle "lit" feel */}
          <span
            className={`pointer-events-none absolute -top-10 left-1/4 w-40 h-20 rounded-full bg-[#4A8ABF]/20 blur-3xl transition-opacity duration-500 ${
              scrolled ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {/* subtle top highlight for glass realism */}
          <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />

          {/* Brand Logo */}
          <Link to="/" className="relative flex items-center gap-2 shrink-0">
            <img
              src={TammatLogoWhite}
              alt="Tammat logo"
              width={30}
              height={30}
              className="h-14 w-12 dark:brightness-0 dark:invert"
            />
            <span className="text-black dark:text-white font-semibold tracking-tight">TMMT</span>
          </Link>

          {/* Desktop Nav — without Icons */}
          <nav className="hidden items-center gap-1 text-sm md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="
                  group relative px-4 py-2 rounded-full font-medium
                  text-gray-700 dark:text-white/70
                  hover:text-black dark:hover:text-white
                  hover:bg-gray-100/60 dark:hover:bg-white/10
                  transition-colors duration-200
                "
              >
                {l.label}
              </Link>
            ))}

            {/* Dashboard Link in Desktop Nav */}
            {user && (
              <Link
                to={user?.role === 'amer' ? '/amer-dashboard' : '/user/dashboard'}
                className="
                  group relative px-4 py-2 rounded-full font-medium
                  text-gray-700 dark:text-white/70
                  hover:text-black dark:hover:text-white
                  hover:bg-gray-100/60 dark:hover:bg-white/10
                  transition-colors duration-200
                "
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2.5 md:flex">
            {/* Apply CTA — Premium Dark Blue */}
            <button
              onClick={() => setShowStartApplication(true)}
              className="
                group relative overflow-hidden rounded-full
                bg-gradient-to-br from-[#14235E] to-[#08234F] text-white
                px-6 py-2.5 font-semibold text-sm
                shadow-lg shadow-[#14235E]/25
                transition-all duration-300
                hover:shadow-xl hover:shadow-[#14235E]/35
                hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]
              "
            >
              {/* soft sheen sweep on hover */}
              <span
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                style={{
                  background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
                }}
              />
              <span className="relative z-10 flex items-center gap-1.5">
                <Rocket className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                {t('hero.cta', 'Apply Now')}
              </span>
            </button>

            {/* Dashboard icon */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100/60 dark:hover:bg-white/10 text-black dark:text-white transition-colors"
                onClick={() => navigate(user.role === 'amer' ? '/amer-dashboard' : '/user/dashboard')}
                aria-label={t('header.dashboard')}
              >
                <span className="sr-only">{t('header.profile')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1112 21a8.963 8.963 0 01-6.879-3.196z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>
            )}

                {/* Theme toggle — Clean */}
        <button
          onClick={toggleTheme}
          className="
            relative flex h-9 items-center gap-2 rounded-full border pr-2 pl-2
            transition-all duration-300
            bg-gray-100/50 dark:bg-white/5
            border-gray-200 dark:border-white/10
            hover:border-gray-300 dark:hover:border-white/20
            hover:scale-105 active:scale-95
          "
          aria-label="Toggle theme"
        >
          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isLight ? 'bg-gray-200' : 'bg-white/10'}`}>
            {isLight ? (
              <Sun className="h-4 w-4 text-black dark:text-white" />
            ) : (
              <Moon className="h-4 w-4 text-black dark:text-white" />
            )}
          </span>
        </button>

            {/* Auth button */}
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                className="
                  group flex items-center gap-2 rounded-full px-5 py-2.5
                  text-sm font-semibold border
                  transition-all duration-300
                  bg-white dark:bg-white/5
                  text-black dark:text-white
                  border-gray-200 dark:border-white/10
                  hover:border-red-300 dark:hover:border-red-500/30
                  hover:bg-red-50 dark:hover:bg-red-500/10
                  hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]
                "
              >
                <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                {t('header.signOut')}
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="
                  group flex items-center gap-2 rounded-full px-5 py-2.5
                  text-sm font-semibold border
                  transition-all duration-300
                  bg-black dark:bg-white
                  text-white dark:text-black
                  border-gray-800 dark:border-white/20
                  hover:bg-gray-800 dark:hover:bg-gray-100
                  hover:border-gray-700 dark:hover:border-white/30
                  hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]
                "
              >
                <LogIn className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                {t('header.signIn')}
              </button>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Sliding pill theme toggle */}
            <button
              onClick={toggleTheme}
              className="relative flex h-9 w-10 items-center rounded-full border border-gray-200 dark:border-white/10 bg-gray-100/60 dark:bg-white/5 px-1 transition-all duration-300 hover:border-gray-300 dark:hover:border-white/20 active:scale-95"
              aria-label="Toggle theme"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isLight ? 'bg-gray-200' : 'bg-white/10'}`}>
            {isLight ? (
              <Sun className="h-4 w-4 text-black dark:text-white" />
            ) : (
              <Moon className="h-4 w-4 text-black dark:text-white" />
            )}
          </span> 
            </button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-gray-200 dark:border-white/10 bg-gray-100/60 dark:bg-white/5 text-black dark:text-white hover:bg-gray-200/60 dark:hover:bg-white/10"
                >
          {/* mobile menu */}

                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>

   {/* Theme-aware mobile menu - Modern Glass */}
<SheetContent
  side="right"
  className="
    flex w-80 flex-col p-0
    bg-white dark:bg-[#0a0a0a]/95
    backdrop-blur-2xl backdrop-saturate-150
    border-l border-white/20 dark:border-white/5
    shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.6)]
  "
>
  {/* ─── Close Button ────────────────────────────────────────────── */}
  <SheetClose className="absolute right-2 top-1 rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 p-2 transition-all duration-300 hover:scale-105 hover:bg-black/10 dark:hover:bg-white/10 z-50">
    <X className="h-4 w-4 text-black dark:text-white" strokeWidth={2} />
    <span className="sr-only">Close</span>
  </SheetClose>

  {/* ─── Brand header ────────────────────────────────────────────── */}
  <div className="relative flex items-center gap-3 border-b border-black/5 dark:border-white/5 px-6 py-5 overflow-hidden">
    <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#14235E]/10 dark:bg-[#4A8ABF]/10 blur-3xl" />
    <div className="relative">
      <div className="absolute inset-0 bg-[#14235E]/10 dark:bg-[#4A8ABF]/15 rounded-full blur-lg" />
      <img
        src={TammatLogoWhite}
        alt="Tammat logo"
        width={32}
        height={32}
        className="relative h-13 w-10 dark:brightness-0 dark:invert"
      />
    </div>
    <div>
      <span className="text-lg font-bold tracking-tight text-black dark:text-white">
        TMMT
      </span>
    </div>
  </div>

  {/* ─── Navigation ──────────────────────────────────────────────── */}
  <nav className="mt-6 flex flex-col gap-1 px-4">
    {links.map((l) => (
      <Link
        key={l.href}
        to={l.href}
        className="
          group relative flex items-center gap-4
          rounded-xl px-4 py-3
          transition-all duration-300
          hover:bg-black/5 dark:hover:bg-white/5
          active:scale-[0.97]
        "
      >
        <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 transition-all duration-300 group-hover:bg-[#14235E] dark:group-hover:bg-[#4A8ABF] group-hover:scale-105">
          <l.icon className="h-4 w-4 text-black/60 dark:text-white/60  transition-colors duration-300 group-hover:text-white" strokeWidth={1.8} />
        </div>

        <div className="relative z-10 flex flex-col">
          <span className="text-sm font-medium text-black dark:text-white transition-colors duration-300 group-hover:text-[#14235E] dark:group-hover:text-[#4A8ABF]">
            {l.label}
          </span>
        </div>

        <ChevronRight className="ml-auto h-4 w-4 text-black/20 dark:text-white/20 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[#14235E] dark:group-hover:text-[#4A8ABF]" />
      </Link>
    ))}

    {/* Dashboard Link - Mobile */}
    <Link
      to={user?.role === 'amer' ? '/amer-dashboard' : '/user/dashboard'}
      className="
        group relative flex items-center gap-4
        rounded-xl px-4 py-3
        transition-all duration-300
        hover:bg-black/5 dark:hover:bg-white/5
        active:scale-[0.97]
      "
    >
      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 transition-all duration-300 group-hover:bg-[#14235E] dark:group-hover:bg-[#4A8ABF] group-hover:scale-105">
        <LayoutDashboard className="h-4 w-4 text-black/60 dark:text-white/60 transition-colors duration-300 group-hover:text-white" strokeWidth={1.8} />
      </div>

      <div className="relative z-10 flex flex-col">
        <span className="text-sm font-medium text-black dark:text-white transition-colors duration-300 group-hover:text-[#14235E] dark:group-hover:text-[#4A8ABF]">
          Dashboard
        </span>
      </div>

      <ChevronRight className="ml-auto h-4 w-4 text-black/20 dark:text-white/20 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[#14235E] dark:group-hover:text-[#4A8ABF]" />
    </Link>
  </nav>

  {/* ─── CTA buttons ──────────────────────────────────────────────── */}
  <div className="mt-auto border-t border-black/5 dark:border-white/5 p-5 space-y-2.5">
    {/* Primary CTA */}
    <button
      onClick={() => setShowStartApplication(true)}
      className="
        group relative overflow-hidden rounded-xl w-full
        bg-[#14235E] dark:bg-white
        px-6 py-3.5 font-medium text-sm
        text-white dark:text-[#14235E]
        shadow-lg shadow-[#14235E]/25 dark:shadow-white/10
        transition-all duration-300
        hover:shadow-xl hover:shadow-[#14235E]/35 dark:hover:shadow-white/20
        hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]
        flex items-center justify-center gap-2.5
      "
    >
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
        style={{
          background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
        }}
      />
      <span className="relative z-10 flex items-center gap-2.5">
        <Rocket className="h-4 w-4" strokeWidth={1.8} />
        <span>{t('hero.cta', 'Apply Now')}</span>
      </span>
    </button>

    {/* Secondary CTA */}
    {user ? (
      <button
        onClick={() => signOut()}
        className="
          w-full rounded-xl px-6 py-3 font-medium text-sm
          border border-black/10 dark:border-white/10
          bg-transparent
          text-black dark:text-white
          hover:bg-red-50 dark:hover:bg-red-500/10
          hover:border-red-300 dark:hover:border-red-500/30
          transition-all duration-300
          active:scale-[0.97]
          flex items-center justify-center gap-2
        "
      >
        <LogOut className="h-4 w-4" strokeWidth={1.8} />
        {t('header.signOut')}
      </button>
    ) : (
      <button
        onClick={() => navigate('/auth')}
        className="
          w-full rounded-xl px-6 py-3 font-medium text-sm
          bg-black/5 dark:bg-white/5
          text-black dark:text-white
          border border-black/10 dark:border-white/10
          flex items-center justify-center gap-2.5
          transition-all duration-300
          hover:bg-black/10 dark:hover:bg-white/10
          active:scale-[0.97]
        "
      >
        <LogIn className="h-4 w-4" strokeWidth={1.8} />
        {t('header.signIn')}
      </button>
    )}
  </div>
</SheetContent>
            </Sheet>
          </div>
        </div>
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
    </header>
  );
}


  const TammatHomePage = () => {
    useEffect(() => {
      // ============================================
      // 1. ULTRA SMOOTH SCROLL WITH PHYSICS
      // ============================================
      
      document.documentElement.style.scrollBehavior = 'smooth';
      
      const originalScrollTo = window.scrollTo;
      window.scrollTo = function(optionsOrX, y) {
        if (typeof optionsOrX === 'object') {
          const target = optionsOrX.top || 0;
          const start = window.pageYOffset;
          const distance = target - start;
          const duration = Math.min(2000, Math.max(800, Math.abs(distance) * 1.5));
          let startTime: number | null = null;
          
          const easeOutElastic = (t: number) => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : 
              Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
          };
          
          const easeInOutQuint = (t: number) => {
            return t < 0.5 
              ? 16 * t * t * t * t * t 
              : 1 - Math.pow(-2 * t + 2, 5) / 2;
          };
          
          const animation = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = Math.abs(distance) > 800 ? easeOutElastic(progress) : easeInOutQuint(progress);
            window.scrollTo(0, start + distance * ease);
            if (timeElapsed < duration) {
              requestAnimationFrame(animation);
            }
          };
          requestAnimationFrame(animation);
        } else {
          originalScrollTo.call(window, optionsOrX as any, y as any);
        }
      };

      // ============================================
      // 2. ADVANCED INTERSECTION OBSERVER
      // ============================================
      
      const animationObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              target.classList.add('visible');
              
              const children = target.querySelectorAll('.stagger-item, .stagger-children > *');
              children.forEach((child, index) => {
                setTimeout(() => {
                  child.classList.add('visible');
                }, 80 + index * 60);
              });
              
              const counters = target.querySelectorAll('.count-up');
              counters.forEach((counter) => {
                animateCounter(counter as HTMLElement);
              });
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -50px 0px',
        }
      );

      // Observe all elements with animation classes
      const animatedElements = document.querySelectorAll(
        '.fade-in-scroll, .slide-in-left, .slide-in-right, .scale-in, ' +
        '.reveal-on-scroll, .fade-in-slow, .opacity-glide, .zoom-blur-in, ' +
        '.flip-in, .slide-in-bottom, .glow-in, .rotate-in, .bounce-in, ' +
        '.slide-fade, .stagger-children'
      );
      
      animatedElements.forEach((el) => {
        animationObserver.observe(el);
      });

      // ============================================
      // 3. COUNTER ANIMATION
      // ============================================
      
      const animateCounter = (element: HTMLElement) => {
        const target = parseInt(element.getAttribute('data-target') || '0');
        const duration = 2000;
        const startTime = performance.now();
        
        const updateCounter = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(ease * target);
          element.textContent = current.toString();
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            element.textContent = target.toString();
          }
        };
        requestAnimationFrame(updateCounter);
      };

      // ============================================
      // 4. PARALLAX EFFECT
      // ============================================
      
      const handleParallax = () => {
        const parallaxElements = document.querySelectorAll('.parallax-element');
        const scrolled = window.pageYOffset;
        parallaxElements.forEach((el) => {
          const speed = parseFloat(el.getAttribute('data-speed') || '0.1');
          const rect = el.getBoundingClientRect();
          const offset = rect.top + scrolled;
          const yPos = (scrolled - offset) * speed;
          const maxMove = 100;
          const clamped = Math.max(-maxMove, Math.min(maxMove, yPos));
          (el as HTMLElement).style.transform = `translateY(${clamped}px)`;
        });
      };

      window.addEventListener('scroll', handleParallax, { passive: true });

      // ============================================
      // 5. ANCHOR NAVIGATION
      // ============================================
      
      const handleAnchorClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest('a[href^="#"]');
        
        if (anchor) {
          const href = anchor.getAttribute('href');
          if (href && href !== '#') {
            e.preventDefault();
            
            document.querySelectorAll('.nav-link').forEach((link) => {
              link.classList.remove('active');
            });
            anchor.classList.add('active');
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
              const headerOffset = 80;
              const elementPosition = targetElement.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

              const start = window.pageYOffset;
              const distance = offsetPosition - start;
              const duration = Math.min(1800, Math.max(800, Math.abs(distance) * 1.2));
              let startTime: number | null = null;
              
              const easeInOutQuint = (t: number) => {
                return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
              };
              
              const animation = (currentTime: number) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                const ease = easeInOutQuint(progress);
                window.scrollTo(0, start + distance * ease);
                if (timeElapsed < duration) {
                  requestAnimationFrame(animation);
                }
              };
              requestAnimationFrame(animation);
              history.pushState(null, '', href);
            }
          }
        }
      };

      document.addEventListener('click', handleAnchorClick);

      // ============================================
      // 6. SCROLL PROGRESS
      // ============================================
      
      let ticking = false;
      const updateProgress = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const progressBar = document.getElementById('scroll-progress');
            if (!progressBar) return;

            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

            progressBar.style.width = `${progress}%`;
            progressBar.classList.toggle('active', scrollTop > 100);
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', updateProgress, { passive: true });

      // ============================================
      // 7. ACTIVE SECTION HIGHLIGHTING
      // ============================================
      
      const highlightActiveSection = () => {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        let currentSection = '';
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100) {
            currentSection = section.id;
          }
        });
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
          }
        });
      };

      window.addEventListener('scroll', highlightActiveSection, { passive: true });

      // ============================================
      // 8. SCROLL TOP BUTTON
      // ============================================
      
      const scrollTopBtn = document.querySelector('.scroll-top-btn');
      if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
          scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });

        scrollTopBtn.addEventListener('click', () => {
          const start = window.pageYOffset;
          const duration = 1200;
          let startTime: number | null = null;
          const easeInOutQuint = (t: number) => {
            return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
          };
          const animation = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutQuint(progress);
            window.scrollTo(0, start * (1 - ease));
            if (timeElapsed < duration) {
              requestAnimationFrame(animation);
            }
          };
          requestAnimationFrame(animation);
        });
      }

      // ============================================
      // 9. CLEANUP
      // ============================================
      
      return () => {
        document.documentElement.style.scrollBehavior = '';
        window.scrollTo = originalScrollTo;
        animationObserver.disconnect();
        window.removeEventListener('scroll', handleParallax);
        window.removeEventListener('scroll', updateProgress);
        window.removeEventListener('scroll', highlightActiveSection);
        document.removeEventListener('click', handleAnchorClick);
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
        <main className="min-h-[100dvh] text-foreground scroll-smooth">
          <div className="scroll-progress" id="scroll-progress" />
          
          {/* Original sections - NO WRAPPING DIVS, just add classes directly to sections */}
          <Services />
          <WhyTMMTSection />
          <VideoSection />
          <SubscriptionPage />

          <ServiceJourney />
          <FAQSection />
          {/* <MembershipSection />  */}
          <EmailCapture />
          <TammatFooter />
          
       
        </main>
      </>
    );
  };
export default TammatHomePage;