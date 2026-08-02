"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { Mail, Loader2, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react"
import { useTranslation } from "react-i18next"

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToSignIn }) => {
  const { resetPassword } = useAuth()
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (error) {
      console.error("Reset password error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center space-y-5 max-w-md mx-auto"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
          className="w-20 h-20 rounded-2xl bg-[#0A3269] dark:bg-white flex items-center justify-center mx-auto shadow-xl shadow-[#0A3269]/20 dark:shadow-white/10"
        >
          <CheckCircle2 className="w-10 h-10 text-white dark:text-[#0A3269]" strokeWidth={2} />
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-[#0A3269] dark:text-white">Check your email</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            We've sent a password reset link to{" "}
            <span className="font-semibold text-[#0A3269] dark:text-white">{email}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 justify-center text-xs text-gray-400 dark:text-gray-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0A3269] dark:text-gray-400" />
          <span>Secure link sent</span>
          <span className="w-px h-3 bg-gray-200 dark:bg-white/10" />
          <span>Expires in 24 hours</span>
        </div>
        <Button
          onClick={onBackToSignIn}
          className="
            w-full
            h-12
            rounded-xl
            bg-[#0A3269]
            dark:bg-white
            text-white
            dark:text-[#0A3269]
            font-semibold
            shadow-lg
            shadow-[#0A3269]/25
            dark:shadow-white/10
            transition-all
            duration-300
            hover:shadow-xl
            hover:shadow-[#0A3269]/35
            dark:hover:shadow-white/20
            hover:scale-[1.02]
            hover:bg-[#1a4a7a]
            dark:hover:bg-gray-100
            active:scale-[0.98]
            group
          "
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Sign In
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header - Desktop Only */}
      <div className="hidden sm:block mb-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-16 h-16 rounded-2xl bg-[#0A3269] dark:bg-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#0A3269]/20 dark:shadow-white/10"
        >
          <Mail className="w-8 h-8 text-white dark:text-[#0A3269]" />
        </motion.div>
        <h2 className="text-2xl font-bold text-[#0A3269] dark:text-white">Reset Password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your email to receive a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-[#0A3269] dark:text-white">
            {t('common.email')}
          </Label>
          <div
            className={`
              relative flex items-center rounded-xl px-4 h-12
              bg-gray-50 dark:bg-white/5
              border transition-all duration-300
              ${emailFocused 
                ? 'border-[#0A3269] dark:border-white shadow-lg shadow-[#0A3269]/10 dark:shadow-white/5' 
                : 'border-gray-200 dark:border-white/10'
              }
            `}
          >
            <Mail
              className={`w-4 h-4 shrink-0 mr-3 rtl:mr-0 rtl:ml-3 transition-colors duration-300 ${
                emailFocused ? 'text-[#0A3269] dark:text-white' : 'text-gray-400 dark:text-gray-500'
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
              placeholder="you@example.com"
              style={{ fontSize: '16px', outline: 'none', boxShadow: 'none' }}
              className="
                flex-1 min-w-0 bg-transparent border-0
                text-[#0A3269] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0
              "
            />
          </div>
        </div>

        {/* Submit Button */}
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
              bg-[#0A3269]
              dark:bg-white
              text-white
              dark:text-[#0A3269]
              font-semibold
              shadow-lg
              shadow-[#0A3269]/25
              dark:shadow-white/10
              transition-all
              duration-300
              hover:shadow-xl
              hover:shadow-[#0A3269]/35
              dark:hover:shadow-white/20
              hover:scale-[1.02]
              hover:bg-[#1a4a7a]
              dark:hover:bg-gray-100
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-60
              disabled:hover:scale-100
              disabled:hover:bg-[#0A3269]
              dark:disabled:hover:bg-white
            "
          >
            {/* Shimmer Effect */}
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

            {/* Clean Hover Glow */}
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#0A3269]/10 dark:bg-white/5 blur-xl" />

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
                  Sending...
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center justify-center gap-2.5 z-10"
                >
                  Send Reset Link
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

        {/* Back Button */}
        <Button
          onClick={onBackToSignIn}
          variant="outline"
          className="
            group
            w-full
            h-12
            rounded-xl
            border-2 border-gray-200 dark:border-white/10
            bg-transparent
            text-[#0A3269]
            dark:text-white
            font-medium
            transition-all
            duration-300
            hover:scale-[1.02]
            hover:border-[#0A3269]
            dark:hover:border-white/30
            hover:bg-[#0A3269]/5
            dark:hover:bg-white/5
            active:scale-[0.98]
          "
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Sign In
        </Button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-5 pt-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0A3269] dark:text-gray-500" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">256-bit SSL</span>
          </div>
          <span className="w-px h-3.5 bg-gray-200 dark:bg-white/10" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Secure</span>
          </div>
          <span className="w-px h-3.5 bg-gray-200 dark:bg-white/10" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0A3269] dark:bg-blue-400" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Encrypted</span>
          </div>
        </div>
      </form>
    </div>
  )
}