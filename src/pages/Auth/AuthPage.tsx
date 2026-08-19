"use client"

import React from "react"
import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { SignInForm } from "@/components/auth/SignInForm"
import { SignUpForm } from "@/components/auth/SignUpForm"
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Shield,
  CheckCircle,
  Sparkles,
  Award,
  Clock,
  Users,
  Star,
  TrendingUp,
  Zap,
  Rocket,
  Heart,
  Globe,
  ArrowRight,
  Briefcase,
  Building2,
  Plane,
  MapPin,
  Crown,
  Gem,
  FileCheck,
  Headphones,
  Lock,
  Calendar,
  Upload,
  FileText,
  UserCheck,
  Building,
  CreditCard,
  Smartphone,
  Eye,
} from "lucide-react"
import { ThemeContext } from "@/contexts/ThemeContext"
import TMMTLogo from "@/assets/TMMTLogo.png"

type AuthMode = "signin" | "signup" | "forgot-password"

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Visa Trust Cards Data
const TRUST_CARDS = [
  {
    id: 1,
    title: "98% Success Rate",
    description: "Industry-leading visa approval rate",
    icon: Award,
    color: "from-emerald-400 to-emerald-600"
  },
  {
    id: 2,
    title: "24/7 Expert Support",
    description: "Dedicated visa assistance team",
    icon: Headphones,
    color: "from-[#4A8ABF] to-[#0A3269]"
  },
  {
    id: 3,
    title: "Secure Processing",
    description: "Bank-level encryption & UAE compliance",
    icon: Lock,
    color: "from-purple-400 to-purple-600"
  },
  {
    id: 4,
    title: "Fast Track Service",
    description: "Expedited visa processing available",
    icon: Calendar,
    color: "from-amber-400 to-amber-600"
  },
  {
    id: 5,
    title: "Gov Approved",
    description: "Official government partnership",
    icon: Shield,
    color: "from-rose-400 to-rose-600"
  },
]

const AuthPage: React.FC = () => {
  const { user, loading } = useAuth()
  const { t } = useTranslation()
  const [authMode, setAuthMode] = useState<AuthMode>("signin")
  const { theme } = useTheme()
  const isDark = theme?.isDark || false
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)

  // Rotating Images
  const heroImages = [
    {
      url: "https://images.pexels.com/photos/6178934/pexels-photo-6178934.jpeg",
      title: "Dubai Skyline",
    },
    {
      url: "https://images.pexels.com/photos/712380/pexels-photo-712380.jpeg",
      title: "Modern Architecture",
    },
    {
      url: "https://images.pexels.com/photos/5577693/pexels-photo-5577693.jpeg?_gl=1*fddfiq*_ga*MjUzMTMxODcyLjE3ODcxMTgxMjk.*_ga_8JE65Q40S6*czE3ODcxMjcxOTgkbzIkZzAkdDE3ODcxMjcxOTgkajYwJGwwJGgw",
      title: "Beach View",
    },
    {
      url: "https://images.pexels.com/photos/417267/pexels-photo-417267.jpeg?_gl=1*1iuon6x*_ga*MjUzMTMxODcyLjE3ODcxMTgxMjk.*_ga_8JE65Q40S6*czE3ODcxMjcxOTgkbzIkZzEkdDE3ODcxMjczMzAkajYwJGwwJGgw",
      title: "City Night",
    },
  ]

  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 6000)
    return () => clearInterval(imageInterval)
  }, [])

  useEffect(() => {
    const cardInterval = setInterval(() => {
      setCurrentCardIndex((prev) => (prev + 1) % TRUST_CARDS.length)
    }, 5000)
    return () => clearInterval(cardInterval)
  }, [])

  useEffect(() => {
    if (user && !loading) {
      if (user.role === "amer") {
        window.location.href = "/amer-dashboard"
      } else {
        window.location.href = "/user/dashboard"
      }
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050d1c] flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-flex mb-4">
            <div className="absolute inset-0 rounded-full bg-[#0A3269]/20 blur-xl" />
            <Loader2 className="relative w-10 h-10 animate-spin text-[#0A3269] dark:text-[#4A8ABF]" />
          </div>
          <p className="text-gray-500 dark:text-white/40 font-light text-sm">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  const handleSwitchMode = (mode: AuthMode) => {
    setAuthMode(mode)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050d1c] overflow-hidden">
      <div className="flex min-h-screen">
        {/* ─── Left Side - Premium Image Section ─────────────────────────── */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-[#050d1c]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <img
                src={heroImages[currentImageIndex].url}
                alt={heroImages[currentImageIndex].title}
                className="w-full h-full object-content"
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-[#000]/90 via-[#000]/70 to-[#000]/20" />


          <div className="relative z-10 flex flex-col justify-between w-full h-full p-6 sm:p-10 lg:p-8 text-white">
            {/* Top - Brand */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <img
                src={TMMTLogo}
                alt="Tammat"
                className="w-18 h-29 object-contain brightness-0 invert"
              />
            </motion.div>

            {/* Center - Big Content */}
            <div className="space-y-6 max-w-2xl">
              {/* Big Hero Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight"
              >
                <span className="text-white">Your Visa</span>
                <br />
                <span className="text-2xl sm:text-2xl md:text-2xl lg:text-5xl font-bold leading-[1.05] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0a3269] to-[#0a3269]">
                  Journey Starts Here
                </span>
              </motion.h1>

              {/* Big Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-white/55 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-light"
              >
                Simply upload your documents, and our{" "}
                <span className="text-white/85 font-medium">AI-powered system</span>{" "}
                validates them instantly. Our licensed officers handle all government submissions, appointments, and follow-ups.
              </motion.p>

              {/* ─── Trust Cards Carousel ────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="relative"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCardIndex}
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.98 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden rounded-2xl p-5 bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
                  >

                    <div className="relative flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${TRUST_CARDS[currentCardIndex].color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                        {React.createElement(TRUST_CARDS[currentCardIndex].icon as React.ComponentType<{ className?: string }>, {
                          className: "w-7 h-7 text-white"
                        })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-lg tracking-tight">
                          {TRUST_CARDS[currentCardIndex].title}
                        </h3>
                        <p className="text-white/55 text-sm font-light">
                          {TRUST_CARDS[currentCardIndex].description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

           
              </motion.div>

              {/* ─── Big Feature Cards ────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="grid grid-cols-3 gap-4"
              >
                {[
                  {
                    icon: Upload,
                    label: 'Smart Upload',
                    desc: 'AI-powered document validation',
                    iconBg: 'from-[#4A8ABF] to-[#0A3269]',
                  },
                  {
                    icon: UserCheck,
                    label: 'Expert Support',
                    desc: 'Licensed officers handle everything',
                    iconBg: 'from-purple-400 to-purple-600',
                  },
                  {
                    icon: Eye,
                    label: 'Real Tracking',
                    desc: 'Track everything through your dashboard',
                    iconBg: 'from-amber-400 to-amber-600',
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                    whileHover={{ y: -3 }}
                    className="relative rounded-2xl p-4 bg-white/[0.05] backdrop-blur-xl border border-white/10 transition-colors duration-300 group cursor-default shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] hover:bg-white/[0.08] hover:border-white/20"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 group-hover:rotate-[-3deg] transition-transform duration-300`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>

                    <h4 className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                      {item.label}
                    </h4>
                    <p className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors mt-1 font-light leading-relaxed">
                      {item.desc}
                    </p>

                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-white/25 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </motion.div>
                ))}
              </motion.div>

              {/* ─── Trust & Security ──────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="flex flex-wrap items-center gap-6 pt-1"
              >
                <div className="flex items-center gap-2.5 text-white/45 text-sm font-light">
                  <Shield className="w-4 h-4" />
                  <span>Bank-level Encryption</span>
                </div>
                <span className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-2.5 text-white/45 text-sm font-light">
                  <CheckCircle className="w-4 h-4" />
                  <span>UAE Compliant</span>
                </div>
                <span className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-2.5 text-white/45 text-sm font-light">
                  <Lock className="w-4 h-4" />
                  <span>Secure Storage</span>
                </div>
              </motion.div>
            </div>

            {/* Bottom - Trust Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="flex flex-wrap items-center gap-6 text-white/30 text-[11px] font-light pt-0 border-t border-white/10"
            >
              <span>© 2024 Tammat. All rights reserved.</span>
              <span className="w-px h-3 bg-white/10" />
              <span>Privacy Policy</span>
              <span className="w-px h-3 bg-white/10" />
              <span>Terms of Service</span>
            </motion.div>
          </div>

        </div>

        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-8 bg-white dark:bg-[#000]/80 relative">

          <div className="relative w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center mb-3">
                <div className="absolute inset-0 bg-[#0A3269]/10 dark:bg-[#4A8ABF]/15 rounded-full blur-xl" />
                <img src={TMMTLogo} alt="Tammat" className="relative h-14 w-14 object-contain dark:brightness-0 dark:invert" />
              </div>
              <p className="text-sm text-gray-500 dark:text-white/40 font-light">{t('auth.nextGenUaeSmartServices')}</p>
            </div>

            {/* Auth Forms */}
            <AnimatePresence mode="wait">
              {authMode === "signin" && (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SignInForm
                    onSwitchToSignUp={() => handleSwitchMode("signup")}
                    onForgotPassword={() => handleSwitchMode("forgot-password")}
                  />
                </motion.div>
              )}

              {authMode === "signup" && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SignUpForm onSwitchToSignIn={() => handleSwitchMode("signin")} />
                </motion.div>
              )}

              {authMode === "forgot-password" && (
                <motion.div
                  key="forgot-password"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ForgotPasswordForm onBackToSignIn={() => handleSwitchMode("signin")} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="text-center mt-6 sm:mt-8">
              <p className="text-xs text-gray-400 dark:text-white/35 leading-relaxed font-light">
                {t('auth.termsAgreement')}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400 dark:text-white/35 mt-4">
                <a href="/legal#privacy" className="hover:text-black dark:hover:text-white transition-colors font-light">
                  {t('auth.privacyPolicy')}
                </a>
                <span className="w-px h-3 bg-gray-200 dark:bg-white/10" />
                <a href="/legal#terms" className="hover:text-black dark:hover:text-white transition-colors font-light">
                  {t('auth.termsOfService')}
                </a>
                <span className="w-px h-3 bg-gray-200 dark:bg-white/10" />
                <a href="/legal#guarantee" className="hover:text-black dark:hover:text-white transition-colors font-light">
                  {t('auth.support')}
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <Badge className="bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white/60 border-gray-200 dark:border-white/10 font-light">
                  <Shield className="w-3 h-3 mr-1" />
                  {t('auth.uaeGovernmentApproved')}
                </Badge>
                <Badge className="bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white/60 border-gray-200 dark:border-white/10 font-light">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t('auth.soc2Compliant')}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage