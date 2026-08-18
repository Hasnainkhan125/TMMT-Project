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
    color: "from-emerald-500 to-emerald-700"
  },
  {
    id: 2,
    title: "24/7 Expert Support",
    description: "Dedicated visa assistance team",
    icon: Headphones,
    color: "from-blue-500 to-blue-700"
  },
  {
    id: 3,
    title: "Secure Processing",
    description: "Bank-level encryption & UAE compliance",
    icon: Lock,
    color: "from-purple-500 to-purple-700"
  },
  {
    id: 4,
    title: "Fast Track Service",
    description: "Expedited visa processing available",
    icon: Calendar,
    color: "from-amber-500 to-amber-700"
  },
  {
    id: 5,
    title: "Gov Approved",
    description: "Official government partnership",
    icon: Shield,
    color: "from-rose-500 to-rose-700"
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
      url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop",
      title: "Dubai Skyline",
    },
    {
      url: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHVhZXxlbnwwfHwwfHx8MA%3D%3D",
      title: "Modern Architecture",
    },
    {
      url: "https://images.unsplash.com/photo-1650728768250-29d1061bf84b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGR1YmFpJTIwbmlnaHR8ZW58MHx8MHx8fDA%3D",
      title: "Beach View",
    },
    {
      url: "https://images.unsplash.com/photo-1542718786-2e81a9d3dfac?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fG5pZ2h0JTIwYnVpbGRpbmd8ZW58MHx8MHx8fDA%3D",
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
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-black dark:text-white mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t('common.loading')}</p>
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
    <div className="min-h-screen bg-white dark:bg-black overflow-hidden">
      <div className="flex min-h-screen">
        {/* ─── Left Side - Premium Image Section ─────────────────────────── */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-black">
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
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

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
  className="w-20 h-20 object-contain brightness-0 invert" 
/>            </motion.div>

            {/* Center - Big Content */}
            <div className="space-y-6 max-w-2xl">
              {/* Big Hero Title - Not Bold */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight"
              >
                <span className="text-white">Your Visa</span>
                <br />
                <span className="inline-block font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#0a3269] to-[#0a3269]">
                  Journey Starts Here
                </span>
              </motion.h1>

              {/* Big Description - Not Bold */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-white/60 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-light"
              >
                Simply upload your documents, and our{" "}
                <span className="text-white/80 font-medium">AI-powered system</span>{" "}
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-2xl p-5 bg-white/10 backdrop-blur-md border border-white/10 shadow-xl shadow-black/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${TRUST_CARDS[currentCardIndex].color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                        {React.createElement(TRUST_CARDS[currentCardIndex].icon as React.ComponentType<{ className?: string }>, { 
                          className: "w-7 h-7 text-white" 
                        })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-lg">
                          {TRUST_CARDS[currentCardIndex].title}
                        </h3>
                        <p className="text-white/60 text-sm font-light">
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
                    gradient: 'from-blue-500/20 to-blue-600/10',
                    border: 'border-blue-500/30',
                    iconBg: 'from-blue-500 to-blue-600',
                    iconColor: 'text-white',
                  },
                  { 
                    icon: UserCheck, 
                    label: 'Expert Support', 
                    desc: 'Licensed officers handle everything',
                    gradient: 'from-purple-500/20 to-purple-600/10',
                    border: 'border-purple-500/30',
                    iconBg: 'from-purple-500 to-purple-600',
                    iconColor: 'text-white',
                  },
                  { 
                    icon: Eye, 
                    label: 'Real Tracking', 
                    desc: 'Track everything through your dashboard',
                    gradient: 'from-amber-500/20 to-amber-600/10',
                    border: 'border-amber-500/30',
                    iconBg: 'from-amber-500 to-amber-600',
                    iconColor: 'text-white',
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                    className={`relative rounded-2xl p-4 bg-gradient-to-br ${item.gradient} backdrop-blur-sm border ${item.border} hover:scale-105 transition-all duration-300 group cursor-default shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-white/5`}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center mb-2 shadow-lg shadow-white/10 group-hover:scale-110 group-hover:rotate-[-3deg] transition-all duration-300`}>
                      <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    
                    <h4 className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                      {item.label}
                    </h4>
                    <p className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors mt-1 font-light">
                      {item.desc}
                    </p>
                    
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                <div className="flex items-center gap-2.5 text-white/50 text-sm font-light">
                  <Shield className="w-4 h-4" />
                  <span>Bank-level Encryption</span>
                </div>
                <span className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-2.5 text-white/50 text-sm font-light">
                  <CheckCircle className="w-4 h-4" />
                  <span>UAE Compliant</span>
                </div>
                <span className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-2.5 text-white/50 text-sm font-light">
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
              className="flex flex-wrap items-center gap-6 text-white/30 text-[11px] font-light pt-4 border-t border-white/5"
            >
              <span>© 2024 Tammat. All rights reserved.</span>
              <span className="w-px h-3 bg-white/10" />
              <span>Privacy Policy</span>
              <span className="w-px h-3 bg-white/10" />
              <span>Terms of Service</span>
            </motion.div>
          </div>

          <div className="absolute top-1/4 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2" />
        </div>

        {/* ─── Right Side - Form ──────────────────────────────────────────── */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-8 bg-white dark:bg-black">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="mx-auto w-20 h-20 flex items-center justify-center mb-3">
                <img src={TMMTLogo} alt="Tammat" className="h-22 w-16 dark:brightness-0 dark:invert" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light">{t('auth.nextGenUaeSmartServices')}</p>
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
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed font-light">
                {t('auth.termsAgreement')}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-4">
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
                <Badge className="bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 font-light">
                  <Shield className="w-3 h-3 mr-1" />
                  {t('auth.uaeGovernmentApproved')}
                </Badge>
                <Badge className="bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 font-light">
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