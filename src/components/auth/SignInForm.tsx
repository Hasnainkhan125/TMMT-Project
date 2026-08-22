"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight, ShieldCheck, CheckCircle, User, Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"

interface SignInFormProps {
  onSwitchToSignUp: () => void
  onForgotPassword: () => void
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSwitchToSignUp, onForgotPassword }) => {
  const { signIn } = useAuth()
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [remember, setRemember] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header - Desktop Only */}
      <div className="hidden sm:block mb-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-16 h-16 rounded-2xl bg-[#14235E] dark:bg-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#14235E]/20 dark:shadow-white/10"
        >
          <User className="w-8 h-8 text-white dark:text-[#14235E]" />
        </motion.div>
        <h2 className="text-2xl font-bold text-[#14235E] dark:text-white">Welcome Back</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-[#14235E] dark:text-white">
            {t('common.email')}
          </Label>
          <div
            className={`
              relative flex items-center rounded-xl px-4 h-12
              bg-gray-50 dark:bg-white/5
              border transition-all duration-300
              ${emailFocused 
                ? 'border-[#14235E] dark:border-white shadow-lg shadow-[#14235E]/10 dark:shadow-white/5' 
                : 'border-gray-200 dark:border-white/10'
              }
            `}
          >
            <Mail
              className={`w-4 h-4 shrink-0 mr-3 rtl:mr-0 rtl:ml-3 transition-colors duration-300 ${
                emailFocused ? 'text-[#14235E] dark:text-white' : 'text-gray-400 dark:text-gray-500'
              }`}
            />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              required
              placeholder={t('auth.enterEmail')}
              style={{ fontSize: '16px', outline: 'none', boxShadow: 'none' }}
              className="
                flex-1 min-w-0 bg-transparent border-0
                text-[#14235E] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0
              "
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-[#14235E] dark:text-white">
            {t('common.password')}
          </Label>
          <div
            className={`
              relative flex items-center rounded-xl px-4 h-12
              bg-gray-50 dark:bg-white/5
              border transition-all duration-300
              ${passwordFocused 
                ? 'border-[#14235E] dark:border-white shadow-lg shadow-[#14235E]/10 dark:shadow-white/5' 
                : 'border-gray-200 dark:border-white/10'
              }
            `}
          >
            <Lock
              className={`w-4 h-4 shrink-0 mr-3 rtl:mr-0 rtl:ml-3 transition-colors duration-300 ${
                passwordFocused ? 'text-[#14235E] dark:text-white' : 'text-gray-400 dark:text-gray-500'
              }`}
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              required
              placeholder={t('auth.enterPassword')}
              style={{ fontSize: '16px', outline: 'none', boxShadow: 'none' }}
              className="
                flex-1 min-w-0 bg-transparent border-0
                text-[#14235E] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0
              "
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="shrink-0 p-1 -m-1 text-gray-400 hover:text-[#14235E] dark:hover:text-white transition-colors"
              tabIndex={-1}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={showPassword ? 'hide' : 'show'}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <button
              type="button"
              onClick={() => setRemember(!remember)}
              className={`
                relative w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0
                border-2 transition-all duration-200
                ${remember 
                  ? 'bg-[#14235E] dark:bg-white border-[#14235E] dark:border-white' 
                  : 'border-gray-300 dark:border-white/20 bg-transparent group-hover:border-[#14235E] dark:group-hover:border-white/40'
                }
              `}
            >
              <AnimatePresence>
                {remember && (
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    viewBox="0 0 12 10"
                    className="w-2.5 h-2.5 text-white dark:text-[#14235E]"
                    fill="none"
                  >
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-[#14235E] dark:group-hover:text-white transition-colors">
              {t('auth.rememberMe')}
            </span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#14235E] dark:hover:text-white transition-colors font-medium"
          >
            {t('auth.forgotPasswordQuestion')}
          </button>
        </div>

        {/* Submit Button - Modern */}
        <motion.div
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className="pt-2"
        >
          <Button
            type="submit"
            disabled={loading}
            className="
              group
              relative
              h-12
              w-full
              overflow-hidden
              rounded-xl
              bg-[#14235E]
              dark:bg-white
              text-white
              dark:text-[#14235E]
              font-semibold
              text-[15px]
              shadow-lg
              shadow-[#14235E]/25
              dark:shadow-white/10
              transition-all
              duration-300
              hover:shadow-xl
              hover:shadow-[#14235E]/35
              dark:hover:shadow-white/20
              hover:scale-[1.02]
              hover:bg-[#1a4a7a]
              dark:hover:bg-gray-100
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-60
              disabled:hover:scale-100
              disabled:hover:bg-[#14235E]
              dark:disabled:hover:bg-white
            "
          >
            {/* Premium Shimmer Effect */}
            <span
              className="
                absolute
                inset-0
                -translate-x-full
                bg-gradient-to-r
                from-transparent
                via-white/20
                dark:via-black/10
                to-transparent
                transition-transform
                duration-700
                ease-in-out
                group-hover:translate-x-full
              "
            />

            {/* Subtle Glow Effect */}
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#14235E]/10 dark:bg-white/5 blur-xl" />

            {/* Button Content */}
            <AnimatePresence mode="wait" initial={false}>
              {loading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center justify-center gap-2.5 z-10"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('auth.signingIn')}
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center justify-center gap-2.5 z-10"
                >
                  {t('auth.signIn')}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        {/* Divider */}
        <div className="relative flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
            Secure
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
        </div>

        {/* Sign Up Link */}
        <div className="text-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">{t('auth.dontHaveAccount')} </span>
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-[#14235E] dark:text-white font-semibold hover:underline transition-colors relative group"
          >
            {t('auth.signUp')}
            <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-[#14235E] dark:bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-5 pt-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#14235E] dark:text-gray-500" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">256-bit SSL</span>
          </div>
          <span className="w-px h-3.5 bg-gray-200 dark:bg-white/10" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Secure</span>
          </div>
          <span className="w-px h-3.5 bg-gray-200 dark:bg-white/10" />
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#14235E] dark:text-blue-400" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Encrypted</span>
          </div>
        </div>
      </form>
    </div>
  )
}