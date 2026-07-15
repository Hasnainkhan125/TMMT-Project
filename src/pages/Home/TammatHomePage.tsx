// import React, { useState } from 'react';
// import { motion } from 'framer-motion'
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
  Send,
  BadgeCheck
} from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Sun, Moon } from "lucide-react";
import {
  TrendingUp,
  Activity,
  CircleCheckBig 
} from "lucide-react";
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

  // Service titles for the animated headline
  const serviceTitles = [
    // { title: t('services.emiratesId.title'), color: '#D4A574', titleColor: '#B8874A' }, // deeper gold
    // { title: t('services.medicalScreening.title'), color: '#7BA3C7', titleColor: '#4F7FAF' }, // stronger blue
    // { title: t('services.residenceVisa.title'), color: '#C89FA5', titleColor: '#A56A75' }, // richer rose
    { title: t('services.SupervisorAccess.title'), color: '#E8B4A0', titleColor: '#C97A5C' }, // warm coral
    { title: t('services.fineReduction.title'), color: '#B8A08C', titleColor: '#8E6F57' }, // darker taupe
    { title: t('services.partnerVisaCancellation.title'), color: '#A5C7D0', titleColor: '#5E9FB3' }, // clearer teal
    { title: t('services.overstayFineChecker.title'), color: '#C89FA5', titleColor: '#A56A75' }, // warmer rose
    { title: t('services.abscondingChecker.title'), color: '#E8B4A0', titleColor: '#C97A5C' }, // warmer coral
    { title: t('services.nawakas.title'), color: '#B8A08C', titleColor: '#8E6F57' }, // darker taupe
    { title: t('services.establishmentCardBanChecker.title'), color: '#A5C7D0', titleColor: '#5E9FB3' }, // clearer teal
  ]


  // Auto-cycle through services with flip animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % serviceTitles.length)
    }, 2500) // Change every 2.5 seconds for smooth flip
    return () => clearInterval(interval)
  }, [serviceTitles.length])


  return (
    <section className="container mx-auto px-4  pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="space-y-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div
              className="relative h-[62px] sm:h-[78px] md:h-[84px] lg:h-[110px] overflow-hidden"
              style={{ perspective: '1000px' }}
            >
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentServiceIndex}
                  initial={{
                    y: '100%',
                    opacity: 0,
                  }}
                  animate={{
                    y: 0,
                    opacity: 1,
                  }}
                  exit={{
                    y: '-100%',
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                    opacity: { duration: 0.4 },
                  }}
                  style={{
                    color: serviceTitles[currentServiceIndex].titleColor,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  className="absolute md:-tracking-[6px] -tracking-[2px] inset-0 text-[2rem] sm:text-[5rem] md:text-[5rem] lg:text-[5rem] font-medium "
                >
                  {serviceTitles[currentServiceIndex].title}
                </motion.div>
              </AnimatePresence>
            </div>

           

            <div
              className="text-[2rem] -mt-4 md:-tracking-[6px] -tracking-[2px] sm:text-[5rem] md:text-[5rem] lg:text-[5rem] font-medium text-foreground"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {t('services.personalizedToYou', 'personalized to you')}
            </div>
          </div>


          <p
            className="mt-4 text-text-secondary  text-base sm:text-lg max-w-xl"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t('services.subtitle')}
          </p>
        </div>
      </div>

      

          <motion.div>
      <div className=" relative z-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* {SERVICES.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={()=>navigate(`/customer-dashboard`)}
              index={index}
            />
          ))} */}
        </div>

{/* ================= Service Cards ================= */}

<section className="pb-10">
  <div className="max-w-[1400px] mx-auto px-2 sm:px-6 lg:px-10">

    {/* Fixed grid on all screens — no horizontal scroll/snap on mobile */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
      {[
        {
          name: "Checkers",
          image: isDarkMode ? checkDark : checkWhite,
          description:
            "Check overstay fines, travel bans, absconding, nawakas, and more.",
          cta: "Apply",
          link: "/customer-dashboard",
        },
        {
          name: "Services",
          image: isDarkMode ? servicesImageDark : servicesImage3,
          description:
            "Apply for entry permits, residence visa, emiratesid, renewals, etc.",
          cta: "Apply",
          link: "/apply",
        },
        {
          name: "Packages",
          image: isDarkMode ? packagesImageDark : servicesImage2,
          description:
            "Packages allow you to choose bundled applications for your govt transactions",
          cta: "Apply",
          link: "/packages",
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
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="group relative flex w-full flex-col justify-between rounded-3xl overflow-hidden cursor-pointer bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          {/* Image */}
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
            <img
              src={card.image}
              alt={card.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1.5">
              {card.name}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
              {card.description}
            </p>

            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              className="
                group/btn relative inline-flex items-center justify-center gap-3
                overflow-hidden rounded-full
                px-6 sm:px-7
                py-2.5 sm:py-3
                text-[15px] sm:text-base
                font-semibold tracking-tight
                bg-white dark:bg-black
                text-black dark:text-white
                border border-black/10 dark:border-white/10
                shadow-sm
                transition-all duration-300
                hover:border-[var(--primary)]/60
                hover:shadow-md
              "
            >
              <span className="relative z-10 whitespace-nowrap">
                {card.cta}
              </span>

              <div
                className="
                  relative z-10
                  flex h-9 w-9 sm:h-10 sm:w-10
                  items-center justify-center
                  rounded-full
                  bg-[var(--primary)]
                  transition-transform duration-300
                  group-hover/btn:translate-x-1
                "
              >
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>

  </div>
</section>

        </motion.div>
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
      'https://media.licdn.com/dms/image/v2/D4D1BAQGYWCfd7SyhGQ/company-background_10000/company-background_10000/0/1654679737492/visa_sponsor_australia_cover?e=2147483647&v=beta&t=WyLijCLXaZKQUJG0lO8o-E7m6O2EmcysaCGZW8G_brw',
      'https://images.aeonmedia.co/images/117538c2-9aa5-4de2-8829-7b7c6a2bb8e9/sz-final-gettyimages-1319979885.jpg?top=0&left=657&cropWidth=2629&cropHeight=2629&width=3840&quality=75&format=auto',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop',
      'https://content.kaspersky-labs.com/se/com/content/en-global/images/repository/isc/48-Biometrics/48-Biometrics.jpg',
      'https://media.istockphoto.com/id/157643745/photo/stamping-passports.jpg?s=612x612&w=0&k=20&c=uaXi7hvH_tmKFv8dA_TB0AJ86iyAVWQgTUWU7G1UfjA=',
    ],
    goldenVisa: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop',
    ],
    emiratesId: [
      'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?q=80&w=600&auto=format&fit=crop',
    ],
    businessSetup: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=600&auto=format&fit=crop',
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
      className="relative py-20 sm:py-28 md:py-2 bg-background border-t-2 border-x-2 border-primary/20 rounded-t-[2rem] overflow-hidden"
    >
 {/* ================= Premium Hero Header ================= */}

<div className="pointer-events-none absolute inset-0 overflow-hidden">

  {/* Large Ambient Glow */}
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
    className="
      absolute
      left-1/2
      top-[-18rem]
      h-[52rem]
      w-[52rem]
      -translate-x-1/2
      rounded-full
      bg-[var(--primary)]/15
      blur-[180px]
    "
  />

  {/* Left Glow */}
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
    className="
      absolute
      left-[-12rem]
      top-32
      h-[34rem]
      w-[34rem]
      rounded-full
      bg-sky-500/10
      blur-[150px]
    "
  />

  {/* Right Glow */}
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
    className="
      absolute
      right-[-10rem]
      bottom-[-8rem]
      h-[28rem]
      w-[28rem]
      rounded-full
      bg-[var(--primary)]/10
      blur-[150px]
    "
  />

  {/* Mesh Grid */}
  <div
    className="
      absolute
      inset-0
      opacity-[0.04]
      dark:opacity-[0.07]
    "
    style={{
      backgroundImage:
        "radial-gradient(circle at 1px 1px,currentColor 1px,transparent 0)",
      backgroundSize: "36px 36px",
    }}
  />

  {/* Top Fade */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

</div>

<div className="container relative z-10 mx-auto max-w-[1500px] px-5 lg:px-10">

<motion.div
initial={{opacity:0,y:40}}
animate={isInView ? {opacity:1,y:0}:{ }}
transition={{
duration:.8,
ease:[0.22,1,0.36,1]
}}
className="mb-20"
>

<div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">

{/* Center */}
<div className="max-w-5xl mx-auto flex flex-col items-center text-center">

  {/* Floating Badge */}
  <motion.div
    whileHover={{ scale: 1.04 }}
    className="
      inline-flex
      items-center
      gap-3

      rounded-full

      border
      border-black/10
      dark:border-white/10

      bg-white/70
      dark:bg-white/[0.05]

      backdrop-blur-2xl

      px-4
      py-2

      shadow-lg
      shadow-black/5
      dark:shadow-black/40
    "
  >
    <div
      className="
        flex
        h-6
        w-6
        items-center
        justify-center

        rounded-full

        bg-[var(--primary)]/15
      "
    >
      <Sparkles className="h-3 w-3 text-[var(--primary)]" />
    </div>

    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/70 dark:text-white/70">
      {t("how its works")}
    </span>
  </motion.div>
{/* Premium Heading */}
<h2
  className="
    mt-8

    w-full
    max-w-none

    font-black

    leading-[0.95]
    tracking-[-0.04em]

    text-black
    dark:text-white

    text-4xl

    sm:text-5xl

    md:text-6xl

    lg:text-7xl

    xl:text-[5.5rem]

    whitespace-normal
    break-words
  "
  style={{
    fontFamily: "Poppins,sans-serif",
  }}
>
  {t("serviceJourney.headline")}{" "}
<span
  className="
    inline

    bg-gradient-to-r

    from-[var(--primary)]
    via-[var(--primary)]/80
    to-[var(--primary)]/60

    bg-clip-text
    text-transparent

    drop-shadow-[0_15px_45px_rgba(10,50,105,.35)]
  "
>
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
  className="mb-8 sm:mb-12 flex justify-center"
>
  <div
    className="
      relative

      flex
      w-full
      max-w-fit

      overflow-x-auto
      scrollbar-hide

      rounded-2xl
      lg:rounded-3xl

      border border-black/10
      dark:border-white/10

      bg-white/80
      dark:bg-white/[0.04]

      backdrop-blur-2xl

      p-1.5

      shadow-[0_10px_40px_rgba(0,0,0,.08)]
      dark:shadow-[0_15px_50px_rgba(0,0,0,.35)]
    "
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
            group
            relative
            flex
            shrink-0
            items-center
            gap-2

            rounded-2xl

            px-4
            py-3

            sm:px-5
            lg:px-7

            transition-all
            duration-300

${
  active
    ? "text-black dark:text-white"
    : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
}
          `}
        >
          {/* Active Background */}
          {active && (
            <motion.div
              layoutId="active-service-tab"
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 34,
              }}
              className="
                absolute inset-0

                overflow-hidden

                rounded-2xl

             bg-white
dark:bg-black

                shadow-[0_12px_35px_rgba(0,0,0,.15)]
                dark:shadow-[0_10px_35px_rgba(255,255,255,.12)]

                -z-10
              "
            >
              {/* Shine sweep — plays once when a tab becomes active */}
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

          {/* Hover Glow */}
          {!active && (
            <span
              className="
                absolute inset-0
                rounded-2xl

                opacity-0
                group-hover:opacity-100

                bg-black/[0.03]
                dark:bg-white/[0.05]

                transition-opacity
                duration-300
              "
            />
          )}

          {/* Icon */}
          <div
            className={`
              relative z-10

              flex
              h-8
              w-8
              items-center
              justify-center

              rounded-xl

              transition-all
              duration-300

              ${
                active
                  ? "bg-[var(--primary)] text-white shadow-[0_6px_20px_rgba(10,50,105,.35)] scale-105"
                  : "bg-black/[0.05] dark:bg-white/[0.06] group-hover:scale-105"
              }
            `}
          >
            <tab.Icon
              className="h-4 w-4"
              strokeWidth={2.2}
            />
          </div>

          {/* Label */}
          <span
            className="
              relative z-10

              text-sm
              sm:text-[15px]
              lg:text-base

              font-semibold
              whitespace-nowrap
            "
          >
            {tab.label}
          </span>

        </button>
      );
    })}
  </div>
</motion.div>

{/* Bento Grid Layout */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
  {/* Main Timeline Card - Large, glass surface */}
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="lg:col-span-7 bg-card/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm border border-border/50 relative overflow-hidden"
  >
    {/* Orbiting circles decoration */}
    <div className="absolute -top-20 -right-20 w-64 h-64 opacity-10 hidden sm:block">
      <motion.div
        className="absolute inset-0 border-2 border-primary/30 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-8 border-2 border-primary/20 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-16 border-2 border-primary/10 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
    </div>

    {/* Title */}
    <div className="mb-5 sm:mb-8">
      <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <activeTabMeta.Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div
          className="text-lg sm:text-2xl font-medium text-foreground"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {t(`serviceJourney.${activeTab}.title`)}
        </div>
      </div>
      <p className="text-text-secondary text-xs sm:text-base">
        {t(`serviceJourney.${activeTab}.description`)}
      </p>
      <div className="mt-2.5 sm:mt-3 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-[11px] sm:text-sm font-medium">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[var(--primary)] rounded-full animate-pulse" />
        {t(`serviceJourney.${activeTab}.totalDuration`)}
      </div>
    </div>

    {/* Timeline Steps */}
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
              group relative
              flex items-start gap-3 sm:gap-5
              rounded-2xl sm:rounded-3xl
              p-3.5 sm:p-5
              cursor-pointer
              overflow-hidden
              border
              backdrop-blur-xl
              transition-all duration-300

              ${
                activeStep === index
                  ? `
                    border-[var(--primary)]/40
                    bg-[var(--primary)]/10
                    shadow-md shadow-[color:var(--primary)]/10
                  `
                  : `
                    border-border/60
                    bg-card/70
                    hover:bg-card
                    hover:border-[var(--primary)]/20
                    hover:shadow-md
                  `
              }
            `}
          >
            {/* Step Number */}
            <div className="relative flex-shrink-0">

              {activeStep === index && (
                <motion.div
                  layoutId="activeRing"
                  className="absolute -inset-1.5 sm:-inset-2 rounded-full border-2 border-[var(--primary)]/40"
                />
              )}

              <div
                className={`
                  relative
                  flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center
                  rounded-xl sm:rounded-2xl
                  font-bold
                  text-xs sm:text-sm
                  transition-all duration-300

                  ${
                    activeStep === index
                      ? "bg-[var(--primary)] text-white shadow-md shadow-[color:var(--primary)]/30"
                      : activeStep > index
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground border border-border"
                  }
                `}
              >
                {activeStep > index ? "✓" : index + 1}
              </div>

            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">

              <div className="mb-1 sm:mb-2 flex items-center justify-between gap-2 sm:gap-3">

                <h4 className="text-sm sm:text-base font-semibold text-foreground truncate">
                  {step.title}
                </h4>

                <span
                  className={`
                    shrink-0
                    rounded-full
                    px-2 sm:px-3 py-0.5 sm:py-1
                    text-[9px] sm:text-[11px]
                    font-semibold

                    ${
                      activeStep === index
                        ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {step.duration}
                </span>

              </div>

              <p className="text-xs sm:text-sm leading-5 sm:leading-7 text-muted-foreground">
                {step.description}
              </p>

            </div>

          </motion.div>
        ))}
      </div>


      

{/* ================= Responsive Completion Badge ================= */}
<motion.div
  initial={{ opacity: 0, y: 25, scale: 0.96 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ delay: 0.5, duration: 0.6 }}
  whileHover={{ y: -3 }}
  className="
    group relative overflow-hidden

    mt-5 sm:mt-8

    flex flex-col
    xs:flex-row
    items-start xs:items-center
    justify-between

    gap-4

    rounded-2xl sm:rounded-3xl

    border border-border/60
    bg-card/80
    backdrop-blur-2xl

    p-4 sm:p-5 lg:p-6

    shadow-lg
    transition-all duration-500
  "
>
  {/* Glow */}
  <div className="absolute -right-10 -top-10 h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-[var(--primary)]/15 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

  {/* Left */}
  <div className="relative flex w-full items-center gap-3 sm:gap-4 min-w-0">

    {/* Icon */}
    <div
      className="
        flex
        h-11 w-11
        sm:h-14 sm:w-14
        lg:h-16 lg:w-16

        shrink-0
        items-center justify-center

        rounded-xl sm:rounded-2xl

        border border-[var(--primary)]/20

        bg-gradient-to-br
        from-[var(--primary)]/20
        via-[var(--primary)]/10
        to-transparent

        shadow-lg shadow-[color:var(--primary)]/10

        transition-all duration-300
        group-hover:scale-105
      "
    >
      <Award className="h-5 w-5 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-[var(--primary)]" />
    </div>

    {/* Text */}
    <div className="min-w-0 flex-1">

      <p
        className="
          text-[9px]
          sm:text-[10px]
          md:text-xs

          uppercase
          tracking-[0.22em]

          font-semibold
        "
      >
        Completed
      </p>

      <h4
        className="
          mt-1

          text-sm
          sm:text-base
          md:text-lg

          font-semibold
          leading-snug

          text-foreground

          break-words
        "
      >
        {t(`serviceJourney.${activeTab}.completion`)}
      </h4>

      <p
        className="
          mt-1

          text-[11px]
          sm:text-xs
          md:text-sm

          leading-relaxed

          text-muted-foreground

          break-words
        "
      >
        Everything is ready. Continue your application anytime.
      </p>

    </div>

  </div>
</motion.div>

    </div>
  </motion.div>

          {/* Right Column - Bento Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 sm:gap-5">
{/* ================= Featured Image Card ================= */}

<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
  whileHover={{ y: -4 }}
  className="
    group
    relative
    col-span-2
    h-56 xs:h-64 sm:h-80 lg:h-[26rem]
    overflow-hidden
    rounded-2xl sm:rounded-[28px] lg:rounded-[32px]
    border border-white/10
    bg-card
    shadow-sm
    transition-shadow duration-300
    hover:shadow-lg
  "
>
  {/* Image */}
  <AnimatePresence mode="wait">
    <motion.img
      key={`${activeTab}-${activeStep}`}
      src={currentImages[activeStep]}
      alt={currentSteps[activeStep]?.title}
      className="
        absolute inset-0
        h-full
        w-full
        object-cover
        transition-transform
        duration-700
        ease-out
        group-hover:scale-105
      "
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5 }}
    />
  </AnimatePresence>

  {/* Dark Overlay — slightly richer gradient for depth */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

  {/* Subtle top sheen for a premium glass feel */}
  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent" />

  {/* Top Left Badge */}
  <div
    className="
      absolute
      left-3 top-3
      sm:left-6 sm:top-6
      flex
      items-center
      gap-1.5 sm:gap-2
      rounded-full
      border border-white/15
      bg-white/10
      px-2.5 py-1
      sm:px-4 sm:py-2
      backdrop-blur-xl
    "
  >
    <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-60" />
      <span className="relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[var(--primary)]" />
    </span>

    <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-white">
      {t("serviceJourney.steps.step")} {activeStep + 1}
    </span>
  </div>


  {/* Bottom Content */}
  <motion.div
    key={activeStep}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-6 lg:p-7"
  >
    <h3 className="text-lg sm:text-2xl lg:text-[2.1rem] font-bold text-white tracking-tight leading-tight">
      {currentSteps[activeStep]?.title}
    </h3>

    <p className="mt-1 sm:mt-2 max-w-[92%] sm:max-w-md text-xs sm:text-sm leading-relaxed text-white/75 line-clamp-2 sm:line-clamp-none">
      {currentSteps[activeStep]?.description}
    </p>
{/* Progress — Modern interactive timeline with glow effects */}
<div className="mt-3 sm:mt-5">
  {/* Progress Header with animated counter */}
  <div className="mb-2 sm:mb-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-[10px] sm:text-xs font-medium text-white/50">
        Progress
      </span>
      <motion.div
        key={activeStep}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 'auto', opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="px-2 py-0.5 rounded-full bg-[var(--primary)]/20 border border-[var(--primary)]/30"
      >
        <span className="text-[8px] sm:text-[10px] font-bold text-[var(--primary)]">
          {Math.round(((activeStep + 1) / currentSteps.length) * 100)}%
        </span>
      </motion.div>
    </div>

    <motion.span 
      key={activeStep}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="text-[11px] sm:text-sm font-bold text-white"
    >
      {String(activeStep + 1).padStart(2, '0')}
      <span className="text-white/30 font-medium">/{String(currentSteps.length).padStart(2, '0')}</span>
    </motion.span>
  </div>

  {/* Progress Bar — Modern glass-morphism with glow */}
  <div className="relative">
    {/* Glass background track */}
    <div className="relative h-2 sm:h-2.5 rounded-full overflow-hidden bg-white/5 backdrop-blur-sm border border-white/5">
      {/* Animated fill with gradient and glow */}
      <motion.div
        initial={false}
        animate={{ 
          width: `${((activeStep + 1) / currentSteps.length) * 100}%` 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 30,
          mass: 0.8
        }}
        className="relative h-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%)',
        }}
      >
        {/* Shimmer effect on bar */}
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1
          }}
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            width: '50%',
          }}
        />
        
        {/* Glow effect at the end */}
        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full blur-xl"
          style={{ background: 'var(--primary)' }}
        />
      </motion.div>

      {/* Step markers on the bar */}
      <div className="absolute inset-0 flex items-center justify-between px-0.5">
        {currentSteps.map((_, i) => {
          const isActive = i === activeStep
          const isCompleted = i < activeStep
          
          return (
            <motion.button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`
                relative z-10
                h-3 w-3 sm:h-3.5 sm:w-3.5 
                rounded-full 
                transition-all duration-300
                focus:outline-none
                ${isActive 
                  ? 'scale-110 ring-2 ring-white/30 ring-offset-2 ring-offset-transparent' 
                  : isCompleted 
                    ? 'scale-100' 
                    : 'scale-90'
                }
                cursor-pointer
              `}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Background circle */}
              <div 
                className={`
                  absolute inset-0 rounded-full
                  ${isActive || isCompleted 
                    ? 'bg-white' 
                    : 'bg-white/20'
                  }
                  transition-colors duration-300
                `}
              />

              {/* Inner dot for completed steps */}
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full" />
                </motion.div>
              )}

              {/* Pulse ring for active */}
              {isActive && (
                <motion.div
                  className="absolute inset-[-4px] rounded-full"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 0, 0.6]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  style={{ 
                    border: '2px solid var(--primary)',
                  }}
                />
              )}

              {/* Tooltip on hover */}
              <div className="absolute -top-6 sm:-top-7 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-[7px] sm:text-[9px] font-medium text-white bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded whitespace-nowrap">
                  Step {i + 1}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  </div>

  {/* Progress labels - minimal */}
  <div className="mt-1.5 sm:mt-2 flex items-center justify-between text-[8px] sm:text-[9px] font-medium text-white/20">
    <span>Start</span>
    <div className="flex items-center gap-3">
      {currentSteps.map((step, i) => (
        <motion.span
          key={i}
          animate={{ 
            opacity: i === activeStep ? 1 : i < activeStep ? 0.6 : 0.3
          }}
          className="hidden sm:inline text-[8px] transition-colors duration-300"
        >
          {step.title?.split(' ').slice(0, 2).join(' ')}
        </motion.span>
      ))}
    </div>
    <span>Complete</span>
  </div>
    </div>
  </motion.div>

</motion.div>


{/* ================= Success Card ================= */}
{/* Takes full width on mobile since CTA card is hidden there */}

<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
  className="relative w-full col-span-2 md:col-span-1 rounded-3xl
border border-black/10 dark:border-white/10
bg-white
dark:bg-zinc-900
p-5
shadow-sm
transition-colors duration-300"
>

  <div className="flex items-start justify-between">

    <div>
      <div className="inline-flex items-center gap-2 rounded-full
border border-[var(--primary)]/30
bg-[var(--primary)]/5 dark:bg-[var(--primary)]/10
px-3 py-1">

        <div className="flex h-6 w-6 items-center justify-center rounded-full
                 bg-[var(--primary)]">
          <ShieldCheck className="h-3.5 w-3.5 text-white" />
        </div>

        <div className="leading-tight">
          <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">
            Verified
          </p>

          <p className="text-[10px] font-semibold text-zinc-900 dark:text-white">
            Success Rate
          </p>
        </div>

      </div>

      <div className="mt-5">

        <h2
          className="flex items-start
text-[44px] sm:text-[52px]
               font-bold
               tracking-tight
               leading-none
               text-zinc-900 dark:text-white"
        >
          99.8

          {/* Percent Badge */}
          <span
            className="ml-2
flex h-8 w-8 items-center justify-center
rounded-full
border border-[var(--primary)]/30
bg-[var(--primary)]/10
text-xs
font-semibold
text-[var(--primary)]"
          >
            %
          </span>

        </h2>

        <p className="mt-2 max-w-xs sm:max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Applications approved without resubmission through
          <span className="font-medium text-zinc-900 dark:text-white">
            {" "}expert review
          </span>
          , secure verification, and a streamlined application process.
        </p>

      </div>
    </div>

    {/* Quality Badge */}
    <div className="relative">

      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]"
      >
        <Award className="h-4 w-4 text-white" />
      </div>

      <div
        className="absolute -bottom-1 -right-1
               flex h-5 w-5 items-center justify-center
               rounded-full
               border-2 border-white dark:border-zinc-900
               bg-emerald-500"
      >
        <CircleCheckBig className="h-3 w-3 text-white" />
      </div>

    </div>
  </div>

  {/* Divider */}
  <div className="my-4 h-px bg-zinc-100 dark:bg-white/10" />

  {/* Stats */}
  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-3">

    <div className="rounded-2xl border border-zinc-100 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
      <TrendingUp className="mb-3 h-4 w-4 text-[var(--primary)]" />
      <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        99.8%
      </p>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        Approval
      </span>
    </div>

    <div className="rounded-2xl border border-zinc-100 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
      <Activity className="mb-3 h-4 w-4 text-[var(--primary)]" />
      <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        24/7
      </p>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        Monitoring
      </span>
    </div>

    <div className="rounded-2xl border border-zinc-100 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
      <Users className="mb-3 h-4 w-4 text-[var(--primary)]" />
      <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        250+
      </h3>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        Expert Advisors
      </span>
    </div>

    <div className="rounded-2xl border border-zinc-100 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-4">
      <ShieldCheck className="mb-3 h-4 w-4 text-[var(--primary)]" />
      <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        A+
      </p>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        Rating
      </span>
    </div>

  </div>

</motion.div>

{/* ================= CTA Card ================= */}
{/* Hidden on mobile/tablet — Success card takes the full space instead. Shows from md breakpoint up. */}

<motion.div
  initial={{ opacity: 0, y: 28 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
  onClick={() => navigate("/apply")}
  className="hidden md:flex relative h-full flex-col
    cursor-pointer overflow-hidden rounded-3xl
    border border-white/10
    p-6
    shadow-lg shadow-black/10
    transition-all duration-300
    hover:-translate-y-2
    hover:shadow-2xl hover:shadow-black/20"
>

  {/* Background Image */}
  <div
    className="absolute inset-0 -z-20 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
    style={{
      backgroundImage:
        "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1600&auto=format&fit=crop')",
    }}
  />

  {/* Gradient Overlay for legibility */}
  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-transparent" />

  {/* Badge */}
  <div className="inline-flex items-center gap-2 rounded-full
    border border-[var(--primary)]/40
    bg-white/10
    backdrop-blur-md
    px-3 py-1.5
    w-fit">

    <ShieldCheck className="h-3.5 w-3.5 text-[var(--primary)]" />

    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
      Trusted Platform
    </span>

  </div>

  {/* Main Content */}
  <div className="mt-5 flex flex-1 flex-col">

    <h2 className="max-w-lg text-4xl font-bold leading-tight tracking-tight text-white">
      Start Your
      <span className="block text-[var(--primary)]">
        Dream Journey
      </span>
    </h2>

    <p className="mt-3 max-w-md text-sm leading-6 text-zinc-200">
      Apply online with expert consultants, verified documentation,
      fast processing, and complete visa assistance from start to finish.
    </p>

    {/* Footer */}
    <div
      className="mt-auto flex items-center justify-between
        border-t border-white/15
        pt-5"
    >
      <div className="space-y-0.5">

        <h6 className="text-sm font-semibold tracking-tight text-white">
          Begin Your Application
        </h6>

        <div className="flex items-center gap-4 text-[11px] text-zinc-300">

          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />

          <span>Safe</span>

          <span className="text-white/20">•</span>

          <span>Secure</span>

          <span className="text-white/20">•</span>

          <span>Professional</span>

        </div>

      </div>

    </div>

  </div>

</motion.div>

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

  return (
    <section ref={containerRef} className="relative py-20 sm:py-28 lg:py-36 bg-gradient-to-b from-[#0a0a0f] via-[#14141e] to-[#0a0a0f] overflow-hidden">
      {/* Ambient Glow Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[var(--primary)]/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Main Card - Glassmorphism */}
          <div className="relative rounded-3xl sm:rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
            
            {/* Gradient Border Glow */}
            <div className="absolute inset-0 rounded-3xl sm:rounded-[2.5rem] lg:rounded-[3rem] p-[1px] bg-gradient-to-br from-[var(--primary)]/30 via-transparent to-purple-500/20 pointer-events-none" />

            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcPFn8w41Do-AU84eTh-TDGEJII7tle_SO02AvzlhUrA&s=10"
                alt="Dubai skyline modern"
                className="w-full h-full object-cover opacity-20"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0f]/95 via-[#14141e]/90 to-[#1a1a2e]/80" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 p-8 sm:p-12 md:p-16 lg:p-20 xl:p-24">

                {/* Left */}
                <div className="flex-1 max-w-3xl">

                  {/* Premium Badge */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-6 sm:mb-8 inline-flex items-center gap-3 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-2 backdrop-blur-xl"
                  >
                    <div className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                      Free Consultation
                    </span>
                    <span className="h-4 w-px bg-[var(--primary)]/20" />
               
                  </motion.div>

                  {/* Heading */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="
                      font-black
                      leading-[1.05]
                      tracking-[-0.03em]
                      text-white
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
                    Get Your Free
  <motion.span 
    className="block mt-1 sm:mt-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent"
    animate={{ 
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
    }}
    transition={{ 
      duration: 6, 
      repeat: Infinity,
      ease: "linear"
    }}
    style={{ backgroundSize: '200% 100%' }}
  >
    Guidance Today
  </motion.span>
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="
                      mt-4 sm:mt-6
                      max-w-xl
                      text-white/60
                      text-sm
                      sm:text-base
                      lg:text-lg
                      leading-relaxed
                      sm:leading-relaxed
                    "
                  >
                    Everything you need to know about UAE visas, residency, and citizenship. 
                    Expert insights from Amer — professional typist with 10+ years of experience.
                  </motion.p>

                  {/* Trust Indicators */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="mt-6 flex flex-wrap items-center gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-white/20 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                            <img
                              src={`https://i.pravatar.cc/40?img=${i + 10}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-white/50">
                        <span className="text-white font-semibold">2,000+</span> professionals
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40">
                      <span className="h-4 w-px bg-white/10" />
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[var(--primary)] text-[var(--primary)]" />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-white/50">4.9 rating</span>
                    </div>
                  </motion.div>

                  {/* Email Capture Form */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="mt-8 w-full max-w-lg"
                  >
                    <div className="flex flex-col sm:flex-row items-stretch gap-3">

                      {/* Modern Email Input */}
                      <div
                        className={`
                          group relative flex-1 flex items-center gap-3
                          overflow-hidden
                          rounded-2xl
                          border
                          ${focused
                            ? 'border-[var(--primary)]/50 ring-4 ring-[var(--primary)]/20'
                            : 'border-white/10'
                          }
                          bg-white/5
                          backdrop-blur-xl
                          transition-all duration-300
                          px-4 sm:px-5
                          py-3.5
                          hover:border-white/20
                        `}
                      >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--primary)]/10 via-transparent to-[var(--primary)]/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

                        {/* Icon */}
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/15 text-[var(--primary)]">
                          <Mail className="h-4.5 w-4.5" />
                        </div>

                        {/* Input */}
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocused(true)}
                          onBlur={() => setFocused(false)}
                          placeholder="Enter your email address"
                          className="
                            relative
                            w-full
                            bg-transparent
                            text-[15px] sm:text-base
                            font-medium
                            text-white
                            placeholder:text-white/30
                            outline-none
                            caret-[var(--primary)]
                          "
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        />
                      </div>

                               {/* CTA Button - Dark Blue */}
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
                        bg-gradient-to-r from-[#0D1F3C] via-[#1a2a4a] to-[#0D1F3C]
                        hover:from-[#1a2a4a] hover:via-[#2a3a5a] hover:to-[#1a2a4a]
                      "
                    >
                      {/* Shimmer Effect */}
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      
                      {/* Subtle Glow */}
                      <span className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 bg-white/5 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                      
                      {/* Border Glow on Hover */}
                      <span className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                        boxShadow: 'inset 0 0 30px rgba(10, 22, 40, 0.2)'
                      }} />
                      
                      <span className="relative z-10 flex items-center gap-2.5">
                        Get Started Now
                        <ArrowRight className="h-4 w-4 sm:h-4.5 sm:w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </motion.button>
                    </div>

                    {/* Terms */}
                    <p className="mt-3 sm:mt-4 px-1 text-[10px] sm:text-xs leading-5 text-white/30">
                      By downloading, you agree to our
                      <a href="/t&c" className="mx-1 font-medium text-white/50 hover:text-[var(--primary)] transition-colors underline underline-offset-2">
                        Terms & Conditions
                      </a>
                      and
                      <a href="/privacy" className="mx-1 font-medium text-white/50 hover:text-[var(--primary)] transition-colors underline underline-offset-2">
                        Privacy Policy
                      </a>
                      . Unsubscribe anytime.
                    </p>
                  </motion.div>
                </div>

                {/* Right - Visual */}
                <div className="hidden lg:block flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="relative max-w-md ml-auto"
                  >
                    {/* Main Image Card */}
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
                      <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHvHmcqgUfXVacxaUbUfjs1XvI7_RFxdQQnkjYegUdSQ&s=10"
                        alt="Professional visa consultant"
                        className="w-full h-auto object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                    </div>

                  {/* Floating Trust Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      className="absolute -bottom-4 -right-4 flex items-center gap-3 rounded-2xl bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 px-4 py-3 shadow-xl"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20">
                        <Users className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">10,000+</p>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-white/50">Applications Processed</p>
                      </div>
                    </motion.div>

                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

// Animated Tammat Footer with clip text
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
                alt="Tammat logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-2xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>Tammat</span>
            </div>
            <p className="text-background/70 text-lg max-w-md">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h5 className="font-semibold text-lg mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t('footer.navigation')}</h5>
            <ul className="space-y-3">
              <li><a href="/" className="text-background/70 hover:text-primary transition-colors">{t('header.home')}</a></li>
              <li><a href="/services" className="text-background/70 hover:text-primary transition-colors">{t('header.services')}</a></li>
              <li><a href="/faqs" className="text-background/70 hover:text-primary transition-colors">{t('header.faq')}</a></li>
              <li><a href="/auth" className="text-background/70 hover:text-primary transition-colors">{t('header.signIn')}</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h5 className="font-semibold text-lg mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{t('footer.socialMedia.title')}</h5>
            <ul className="space-y-3">
              <li><a href="https://twitter.com/tammat" className="text-background/70 hover:text-primary transition-colors">{t('footer.socialMedia.twitter')}</a></li>
              <li><a href="https://instagram.com/tammat" className="text-background/70 hover:text-primary transition-colors">{t('footer.socialMedia.instagram')}</a></li>
              <li><a href="https://linkedin.com/company/tammat" className="text-background/70 hover:text-primary transition-colors">{t('footer.socialMedia.linkedin')}</a></li>
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
            <a href="/t&c" className="text-background/60 hover:text-primary text-sm transition-colors">Terms</a>
            <a href="/privacy" className="text-background/60 hover:text-primary text-sm transition-colors">Privacy</a>
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


          {/* <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div
              className={`animate-scroll-left flex whitespace-nowrap ${pausedRow === 'second' ? 'animation-play-state-paused' : ''}`}
              style={{
                animationPlayState:
                  pausedRow === 'second' ? 'paused' : 'running',
                width: 'max-content',
              }}
            >

              {[...secondRowLogos, ...secondRowLogos, ...secondRowLogos].map(
                (logo, index) => (
                  <LogoCard
                    key={`second-${index}`}
                    logo={logo}
                    rowId="second"
                  />
                )
              )}
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};


// UNUSED: Commented out to fix type errors
// const SERVICES: Service[] = [
//   {
//     id: 'family-visa-spouse',
//     name: 'Spouse Family Visa',
//     description: 'Apply for a family visa to sponsor your spouse in the UAE',
//     category: 'Family Visa',
//     price: 'AED 1,089',
//     duration: '2-4 weeks',
//     requirements: ['Marriage Certificate', 'Passport Copy', 'Emirates ID', 'Salary Certificate'],
//     features: ['Fast Processing', 'Expert Support', 'Document Verification', 'Status Tracking'],
//     icon: UserIcon,
//     color: 'text-orange-600',
//     popular: true,
//     videoSrc: 'https://www.youtube.com/shorts/8v1NTAR8CWI',
//     tone: 'trusted',
//     gradient: 'from-orange-500 via-red-500 to-pink-500'
//   },
//   {
//     id: 'residence-visa',
//     name: 'Residence Visa',
//     description: 'Long-term residence visa for professionals and investors',
//     category: 'Residence',
//     price: 'AED 1,126',
//     duration: '3-6 weeks',
//     requirements: ['Employment Contract', 'Trade License', 'Bank Statements', 'Medical Test'],
//     features: ['Long-term Stay', 'Work Authorization', 'Family Sponsorship', 'Visa Renewal'],
//     icon: Building2Icon,
//     color: 'text-orange-700',
//     videoSrc: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/uae-visa-placeholder-video.mp4',
//     tone: 'professional',
//     gradient: 'from-orange-600 via-red-600 to-rose-600'
//   },
//   {
//     id: 'emirates-id',
//     name: 'Emirates ID',
//     description: 'National identity card for UAE residents',
//     category: 'Identity',
//     price: 'AED 510',
//     duration: '1-2 weeks',
//     requirements: ['Visa Copy', 'Photo', 'Biometric Data', 'Application Form'],
//     features: ['Digital Identity', 'Government Services', 'Banking Access', 'Travel Document'],
//     icon: CreditCardIcon,
//     color: 'text-orange-600',
//     videoSrc: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/uae-visa-placeholder-video.mp4',
//     tone: 'digital',
//     gradient: 'from-orange-500 via-amber-600 to-yellow-600'
//   }
// ]

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



// Laptop Showcase Section - Shows Tammat platform screenshots in a laptop mockup
const LaptopShowcase = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [activeScreen, setActiveScreen] = useState(0);

  const screens = [
    {
      id: 'tracking',
      label: t('laptopShowcase.features.tracking'),
      // Placeholder - you can replace with actual screenshot paths
      image: '/screenshots/tracking-dashboard.png',
      fallbackGradient: 'from-primary/20 via-accent/10 to-secondary/20'
    },
    {
      id: 'dashboard',
      label: t('laptopShowcase.features.dashboard'),
      image: '/screenshots/main-dashboard.png',
      fallbackGradient: 'from-accent/20 via-primary/10 to-success/20'
    },
    {
      id: 'documents',
      label: t('laptopShowcase.features.documents'),
      image: '/screenshots/document-manager.png',
      fallbackGradient: 'from-secondary/20 via-accent/10 to-primary/20'
    },
    {
      id: 'notifications',
      label: t('laptopShowcase.features.notifications'),
      image: '/screenshots/notifications.png',
      fallbackGradient: 'from-warning/20 via-primary/10 to-accent/20'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % screens.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [screens.length]);

  return (
    <section
      ref={sectionRef}
      className="relative py-14 sm:py-20 md:py-32 overflow-hidden bg-gradient-to-b from-background via-background/95 to-card/30"
    >
      {/* Decorative background — smaller and clipped on mobile so it can't cause overflow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-56 h-56 sm:w-96 sm:h-96 bg-primary/5 rounded-full blur-2xl sm:blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-80 sm:h-80 bg-accent/5 rounded-full blur-2xl sm:blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8 sm:mb-12 md:mb-20"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-md px-3 sm:px-3.5 py-1 sm:py-1.5 mb-4 sm:mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('laptopShowcase.eyebrow', 'See it in action')}
            </span>
          </div>

          <h2 className="font-poppins tracking-tight text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-3 sm:mb-4 leading-[1.15] sm:leading-[1.1] px-2">
            {t('laptopShowcase.headline')}{' '}
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 bg-clip-text text-transparent">
              {t('laptopShowcase.headlineHighlight')}
            </span>
          </h2>
          <p className="font-tajawal text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
            {t('laptopShowcase.subheadline')}
          </p>
        </motion.div>

        {/* Laptop Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Laptop Frame */}
          <div className="relative">
            {/* Screen Bezel */}
            <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-t-xl sm:rounded-t-2xl md:rounded-t-3xl p-1.5 sm:p-2 md:p-3 shadow-xl sm:shadow-2xl">
              {/* Camera dot */}
              <div className="absolute top-2 sm:top-3 md:top-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-neutral-700 rounded-full">
                <div className="absolute inset-0 m-auto w-0.5 h-0.5 sm:w-1 sm:h-1 md:w-1.5 md:h-1.5 bg-neutral-600 rounded-full" />
              </div>

              {/* Screen Content */}
              <div className="relative bg-card rounded-md sm:rounded-lg md:rounded-xl overflow-hidden aspect-[16/10] shadow-inner">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScreen}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="absolute inset-0"
                  >
                    {/* Placeholder gradient - replace with actual screenshots */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${screens[activeScreen].fallbackGradient}`}>
                      {/* Mock UI Elements for placeholder */}
                      <div className="absolute inset-2.5 sm:inset-4 md:inset-6 flex flex-col">
                        {/* Header bar */}
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-4 md:mb-6">
                          <div className="flex gap-1 sm:gap-1.5">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full bg-error/60" />
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full bg-warning/60" />
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full bg-success/60" />
                          </div>
                          <div className="flex-1 h-3 sm:h-4 md:h-6 bg-card/50 rounded-full max-w-xs mx-auto" />
                        </div>

                        {/* Content area — single row on mobile, fuller layout from sm up */}
                        <div className="flex-1">
                          {/* Mobile: one clean row */}
                          <div className="flex sm:hidden gap-2 h-full">
                            <div className="flex-1 h-full bg-card/30 rounded-lg" />
                            <div className="flex-1 h-full bg-card/40 rounded-lg" />
                            <div className="flex-1 h-full bg-card/30 rounded-lg" />
                          </div>

                          {/* sm and up: fuller dashboard layout */}
                          <div className="hidden sm:grid grid-cols-3 gap-3 md:gap-4 h-full">
                            <div className="col-span-1 space-y-2 md:space-y-3">
                              <div className="h-6 md:h-8 bg-card/40 rounded-lg" />
                              <div className="h-20 md:h-32 bg-card/30 rounded-xl" />
                              <div className="h-12 md:h-20 bg-card/30 rounded-xl" />
                            </div>
                            <div className="col-span-2 space-y-2 md:space-y-3">
                              <div className="h-24 md:h-40 bg-card/30 rounded-xl" />
                              <div className="grid grid-cols-2 gap-2 md:gap-3">
                                <div className="h-16 md:h-24 bg-card/30 rounded-xl" />
                                <div className="h-16 md:h-24 bg-card/30 rounded-xl" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actual screenshot - uncomment when you have screenshots */}
                    {/* <img
                      className="w-full h-full object-cover"
                    /> */}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

{/* Laptop Base */}
<div className="relative h-2 sm:h-3 md:h-4 bg-gradient-to-b from-neutral-300 to-neutral-400 dark:from-neutral-700 dark:to-neutral-800 rounded-b-lg sm:rounded-b-xl">
  <div className="absolute left-1/2 top-0 -translate-x-1/2 w-10 sm:w-16 md:w-24 h-1 sm:h-1.5 md:h-2 bg-neutral-400 dark:bg-neutral-600 rounded-b-md sm:rounded-b-lg" />
</div>
</div>

{/* Modern feature-selector pills */}
<div className="mt-5 sm:mt-8 md:mt-10 flex flex-nowrap items-center justify-center gap-1 sm:gap-2.5 px-4 sm:px-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-px-4">
  {screens.map((screen, i) => {
    const active = activeScreen === i
    return (
      <motion.button
        key={screen.id}
        onClick={() => setActiveScreen(i)}
        animate={{ scale: active ? 1.08 : 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className={`
          relative flex items-center gap-1 sm:gap-2 rounded-full px-2.5 sm:px-5 py-1.5 sm:py-2.5
          text-[9px] sm:text-sm font-medium
          border whitespace-nowrap shrink-0 snap-center
          ${active
            ? 'text-black dark:text-white border-transparent'
            : 'text-muted-foreground border-border/60 hover:text-foreground hover:border-[var(--primary)]/40'
          }
        `}
      >
        {active && (
          <motion.span
            layoutId="laptop-showcase-pill"
            className="absolute inset-0 rounded-full bg-white dark:bg-black shadow-[0_4px_16px_-2px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_16px_-2px_rgba(255,255,255,0.1)] -z-10"
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        )}
        <span
          className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full transition-colors duration-300 shrink-0 ${
            active ? 'bg-[var(--primary)]' : 'bg-muted-foreground/40'
          }`}
        />
        {screen.label}
      </motion.button>
    )
  })}
          </div>
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
                Tammat
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

  const links = [
    { href: '/', label: t('header.home'), icon: Briefcase },
    { href: '/faqs', label: t('header.faq'), icon: HelpCircle },
    { href: '/subscription', label: t('header.subscription'), icon: FileText },
  ];

  return (
    <motion.header
      initial={false}
      animate={{ y: hidden ? '-110%' : '0%' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 p-4"
      style={{ '--primary': '#0A3269' } as React.CSSProperties}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          animate={{
            boxShadow: scrolled
              ? '0 8px 32px -12px rgba(0,0,0,0.28)'
              : '0 2px 8px rgba(0,0,0,0.06)',
          }}
          transition={{ duration: 0.3 }}
          className={`
            relative flex h-14 items-center justify-between rounded-full px-5
            border transition-all duration-300
            backdrop-blur-2xl backdrop-saturate-150
            bg-white/55 dark:bg-black/45
            border-black/[0.06] dark:border-white/10
            ${scrolled ? 'bg-white/75 dark:bg-black/65' : ''}
          `}
        >
          {/* subtle top highlight for glass realism */}
          <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={TammatLogoWhite} alt="Tammat logo" width={20} height={20} className="h-4 w-4" />
            <span className="text-foreground font-semibold tracking-wide">Tmmt</span>
          </Link>

          {/* Desktop Nav — pill hover state */}
          <nav className="hidden items-center gap-1 text-sm md:flex">
            {links.map(l => (
              <Link
                key={l.href}
                to={l.href}
                className="
                  relative px-4 py-2 rounded-full font-medium
                  text-neutral-600 dark:text-neutral-400
                  hover:text-[var(--primary)] dark:hover:text-white
                  hover:bg-black/[0.04] dark:hover:bg-white/[0.06]
                  transition-colors duration-200
                "
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2.5 md:flex">
            {/* Apply CTA — primary in both themes, deeper shadow in dark */}
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowStartApplication(true)}
              className="
                group relative overflow-hidden rounded-full
                bg-[var(--primary)]
                px-5 py-2.5 font-semibold text-white text-sm
                shadow-[0_6px_18px_-4px_rgba(10,50,105,0.55)]
                dark:shadow-[0_6px_22px_-4px_rgba(10,50,105,0.35)]
                transition-shadow duration-300
                hover:shadow-[0_10px_26px_-4px_rgba(10,50,105,0.7)]
                dark:hover:shadow-[0_10px_30px_-4px_rgba(10,50,105,0.5)]
                hover:brightness-110
              "
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Rocket className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                {t('hero.cta', 'Apply Now')}
              </span>
              <span className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
            </motion.button>

            {/* Dashboard icon */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                onClick={() => navigate(user.role === 'amer' ? '/amer-dashboard' : '/user/dashboard')}
                aria-label={t('header.dashboard')}
              >
                <span className="sr-only">{t('header.profile')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1112 21a8.963 8.963 0 01-6.879-3.196z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>
            )}

            {/* Theme toggle — light/dark: primary chip */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.94 }}
              className="
                relative flex h-9 items-center gap-2 rounded-full border pr-3 pl-1
                transition-colors duration-300
                bg-black/[0.03] dark:bg-white/[0.05]
                border-black/[0.08] dark:border-white/10
                hover:border-[var(--primary)]/50
              "
              aria-label="Toggle theme"
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className={`flex h-7 w-7 items-center justify-center rounded-full ${isLight ? 'bg-yellow-400/20' : 'bg-[var(--primary)]/15'}`}
              >
                {isLight ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-[var(--primary)]" />}
              </motion.span>
              <span className={`text-xs font-semibold ${isLight ? 'text-yellow-600' : 'text-[var(--primary)]'}`}>
                {isLight ? 'Light' : 'Dark'}
              </span>
            </motion.button>

            {/* Auth button — different treatment per theme */}
<motion.button
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.96 }}
  onClick={() => navigate("/auth")}
  className={`
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

    ${
      isLight
        ? `
          bg-white
          text-black
          border-zinc-200
          hover:bg-zinc-100
          hover:border-zinc-300
        `
        : `
          bg-black
          text-white
          border-white/10
          hover:bg-zinc-900
          hover:border-white/20
        `
    }
  `}
>
  <LogIn className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
  {t("header.signIn")}
</motion.button>



          </div>

       {/* Mobile: Theme toggle + Menu trigger */}
<div className="flex items-center gap-2 md:hidden">

  {/* Modern pill-style theme toggle */}
  <motion.button
    onClick={toggleTheme}
    whileTap={{ scale: 0.92 }}
    className="relative flex h-9 w-16 items-center rounded-full border border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.06] px-1 transition-colors"
    aria-label="Toggle theme"
  >
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-black shadow-sm"
      style={{ marginLeft: isLight ? 0 : "auto" }}
    >
      {isLight ? (
        <Sun className="h-3.5 w-3.5 text-yellow-500" />
      ) : (
        <Moon className="h-3.5 w-3.5 text-[var(--primary)]" />
      )}
    </motion.div>
  </motion.button>

  <Sheet>
    <SheetTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.05] text-foreground hover:bg-black/[0.06] dark:hover:bg-white/[0.1]"
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </Button>
    </SheetTrigger>

    {/* Theme-aware mobile menu */}
    <SheetContent
      side="right"
      className="
        flex w-72 flex-col p-0
        bg-white/90 dark:bg-neutral-950/95
        backdrop-blur-2xl
        border-l border-black/10 dark:border-white/10
      "
    >
      {/* Brand header — logo + title */}
      <div className="flex items-center gap-2.5 border-b border-black/10 dark:border-white/10 px-5 py-4">
        <img src={TammatLogoWhite} alt="Tammat logo" width={24} height={24} className="h-6 w-6" />
        <span className="text-base font-bold tracking-tight text-[var(--primary)] dark:text-white">
          Tammat
        </span>
      </div>

{/* ================= Modern Premium Navigation ================= */}
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

        hover:border-[var(--primary)]/30
        hover:bg-white
        dark:hover:bg-white/[0.04]

        hover:shadow-[0_12px_40px_rgba(10,50,105,.15)]
        hover:-translate-y-0.5
      "
    >
      {/* Background Overlay */}
      <span
        className="
          absolute inset-0
          opacity-0
          transition-all duration-500
          group-hover:opacity-100

          bg-gradient-to-r
          from-[var(--primary)]/12
          via-transparent
          to-[var(--primary)]/5
        "
      />

      {/* Glow */}
      <span
        className="
          absolute
          -left-16
          top-1/2
          h-20
          w-20
          -translate-y-1/2
          rounded-full
          bg-[var(--primary)]/20
          blur-3xl
          opacity-0
          transition-all duration-500
          group-hover:opacity-100
        "
      />

      {/* Icon */}
      <div
        className="
          relative z-10
          flex h-11 w-11
          items-center justify-center
          rounded-xl

          border border-black/10
          dark:border-white/10

          bg-black/[0.03]
          dark:bg-white/[0.05]

          transition-all duration-500

          group-hover:bg-[var(--primary)]
          group-hover:border-[var(--primary)]
          group-hover:rotate-6
          group-hover:scale-110
        "
      >
        <l.icon
          className="
            h-5 w-5

            text-[var(--primary)]
            transition-all duration-300

            group-hover:text-white
          "
        />
      </div>

      {/* Text */}
      <div className="relative z-10 flex flex-col">
        <span
          className="
            text-[15px]
            font-semibold
            text-black/80
            dark:text-white/90

            transition-colors duration-300
            group-hover:text-black
            dark:group-hover:text-white
          "
        >
          {l.label}
        </span>

        <span
          className="
            text-xs
            text-black/45
            dark:text-white/40
          "
        >
          Quick access
        </span>
      </div>

      {/* Arrow */}
      <div
        className="
          ml-auto
          relative z-10

          opacity-0
          -translate-x-2

          transition-all duration-300

          group-hover:opacity-100
          group-hover:translate-x-0
        "
      >
        <ChevronRight className="h-5 w-5 text-[var(--primary)]" />
      </div>
    </Link>
  ))}

  {/* Dashboard Link */}
  <Link
    to={user?.role === "amer" ? "/amer-dashboard" : "/user/dashboard"}
    className="
      group relative overflow-hidden
      flex items-center gap-4
      rounded-2xl
      px-5 py-4

      border border-transparent

      transition-all duration-500

      hover:border-[var(--primary)]/30
      hover:bg-white
      dark:hover:bg-white/[0.04]

      hover:shadow-[0_12px_40px_rgba(10,50,105,.15)]
      hover:-translate-y-0.5
    "
  >
    <span
      className="
        absolute inset-0
        opacity-0
        transition-all duration-500
        group-hover:opacity-100
        bg-gradient-to-r
        from-[var(--primary)]/12
        via-transparent
        to-[var(--primary)]/5
      "
    />

    <div
      className="
        relative z-10
        flex h-11 w-11
        items-center justify-center
        rounded-xl

        border border-black/10
        dark:border-white/10

        bg-black/[0.03]
        dark:bg-white/[0.05]

        transition-all duration-500

        group-hover:bg-[var(--primary)]
        group-hover:rotate-6
        group-hover:scale-110
      "
    >
      <FileText className="h-5 w-5 text-[var(--primary)] group-hover:text-white transition-all duration-300" />
    </div>

    <div className="relative z-10 flex flex-col">
      <span className="text-[15px] font-semibold text-black/80 dark:text-white/90">
        Dashboard
      </span>

      <span className="text-xs text-black/45 dark:text-white/40">
        Manage your account
      </span>
    </div>

    <ChevronRight className="ml-auto h-5 w-5 text-[var(--primary)] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
  </Link>

</nav>

      {/* CTA buttons — bottom of sheet */}
      <div className="mt-auto border-t border-black/10 dark:border-white/10 p-4 space-y-2.5">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowStartApplication(true)}
          className="
            w-full rounded-full px-6 py-3 font-semibold text-sm
            bg-[var(--primary)]
            text-white
            flex items-center justify-center gap-2
            transition-all duration-200
          "
        >
          <Rocket className="h-4 w-4" />
          {t('hero.cta', 'Apply Now')}
        </motion.button>

        {user ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => signOut()}
            className="
              w-full rounded-full px-6 py-3 font-medium text-sm
              border border-black/10 dark:border-white/10
              hover:bg-black/[0.06] dark:hover:bg-white/[0.1]
              transition-colors
            "
          >
            {t('header.signOut')}
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth')}
            className={`
              w-full rounded-full px-6 py-3 font-semibold text-sm
              flex items-center justify-center gap-2 transition-colors
              ${isLight
                ? 'bg-[var(--primary)] text-white hover:brightness-110'
                : 'bg-zinc-900 text-[var(--primary)] border border-[var(--primary)]/30 hover:bg-[var(--primary)] hover:text-white'
              }
            `}
          >
            <LogIn className="h-4 w-4" />
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
  // Add smooth scroll behavior
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
        {/* <SiteHeader /> */}
        {/* <Hero /> */}
        <Services />
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