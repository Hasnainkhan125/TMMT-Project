"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { Eye, EyeOff, User, Mail, Phone, Lock, Building2, UserCog, Check, Loader2, ArrowRight, ShieldCheck } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

interface SignUpFormProps {
  onSwitchToSignIn: () => void
}

const ROLES = [
  { value: "user", label: "Individual User", icon: User },
  { value: "amer", label: "Amer Officer", icon: UserCog },
]

const fieldInputClass =
  "flex-1 min-w-0 bg-transparent border-0 text-[#14235E] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
const fieldInputStyle: React.CSSProperties = { fontSize: '16px', outline: 'none', boxShadow: 'none' }

const Field = ({
  id,
  icon: Icon,
  isFocused,
  children,
}: {
  id: string
  icon: React.ElementType
  isFocused: boolean
  children: React.ReactNode
}) => (
  <div
    className={`
      relative flex items-center rounded-xl px-4 h-12
      bg-gray-50 dark:bg-white/5
      border transition-all duration-300
      ${isFocused 
        ? 'border-[#14235E] dark:border-white shadow-lg shadow-[#14235E]/10 dark:shadow-white/5' 
        : 'border-gray-200 dark:border-white/10'
      }
    `}
  >
    <Icon className={`w-4 h-4 shrink-0 mr-3 rtl:mr-0 rtl:ml-3 transition-colors duration-300 ${isFocused ? 'text-[#14235E] dark:text-white' : 'text-gray-400 dark:text-gray-500'}`} />
    {children}
  </div>
)

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToSignIn }) => {
  const { signUp } = useAuth()
  const { t } = useTranslation()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [role, setRole] = useState("user")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp(email, password, `${firstName} ${lastName}`, {
        firstName,
        lastName,
        phoneNumber,
        role
      })
      toast.success("Account created successfully", {
        description: "Please check your email for verification",
      })
      onSwitchToSignIn()
    } catch (error) {
      console.error("Sign up error:", error)
      toast.error("Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const strength = Math.min(password.length / 10, 1)
  const strengthLabel = password.length === 0 ? "" : password.length < 6 ? "Weak" : password.length < 9 ? "Good" : "Strong"
  const strengthColor = strength < 0.4 ? "bg-red-400" : strength < 0.7 ? "bg-amber-400" : "bg-[#14235E] dark:bg-white"

  const selectedRole = ROLES.find(r => r.value === role)!

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
        <h2 className="text-2xl font-bold text-[#14235E] dark:text-white">Create Account</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join us today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm font-medium text-[#14235E] dark:text-white">First Name</Label>
            <Field id="firstName" icon={User} isFocused={focused === "firstName"}>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onFocus={() => setFocused("firstName")}
                onBlur={() => setFocused(null)}
                required
                placeholder="John"
                style={fieldInputStyle}
                className={fieldInputClass}
              />
            </Field>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm font-medium text-[#14235E] dark:text-white">Last Name</Label>
            <Field id="lastName" icon={User} isFocused={focused === "lastName"}>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onFocus={() => setFocused("lastName")}
                onBlur={() => setFocused(null)}
                required
                placeholder="Doe"
                style={fieldInputStyle}
                className={fieldInputClass}
              />
            </Field>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-[#14235E] dark:text-white">Email Address</Label>
          <Field id="email" icon={Mail} isFocused={focused === "email"}>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              required
              placeholder="john@example.com"
              style={fieldInputStyle}
              className={fieldInputClass}
            />
          </Field>
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber" className="text-sm font-medium text-[#14235E] dark:text-white">Phone Number</Label>
          <Field id="phoneNumber" icon={Phone} isFocused={focused === "phoneNumber"}>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onFocus={() => setFocused("phoneNumber")}
              onBlur={() => setFocused(null)}
              placeholder="+971 50 123 4567"
              style={fieldInputStyle}
              className={fieldInputClass}
            />
          </Field>
        </div>

        {/* Role Selection */}
        <div className="space-y-1.5 relative">
          <Label htmlFor="role" className="text-sm font-medium text-[#14235E] dark:text-white">Account Type</Label>
          <button
            type="button"
            id="role"
            onClick={() => setRoleOpen(!roleOpen)}
            className={`
              w-full flex items-center justify-between rounded-xl px-4 h-12
              bg-gray-50 dark:bg-white/5
              border transition-all duration-300
              ${roleOpen 
                ? 'border-[#14235E] dark:border-white shadow-lg shadow-[#14235E]/10 dark:shadow-white/5' 
                : 'border-gray-200 dark:border-white/10'
              }
            `}
          >
            <span className="flex items-center gap-2.5">
              <Building2 className={`w-4 h-4 shrink-0 transition-colors duration-300 ${roleOpen ? 'text-[#14235E] dark:text-white' : 'text-gray-400 dark:text-gray-500'}`} />
              <span className="text-[#14235E] dark:text-white text-[15px]">{selectedRole.label}</span>
            </span>
            <motion.svg
              animate={{ rotate: roleOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="text-gray-400 dark:text-gray-500 shrink-0"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </motion.svg>
          </button>

          <AnimatePresence>
            {roleOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setRoleOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-20 top-full mt-1.5 w-full rounded-xl bg-white dark:bg-black shadow-2xl shadow-black/20 dark:shadow-white/5 border border-gray-200 dark:border-white/10 p-1.5 overflow-hidden"
                >
                  {ROLES.map((r) => {
                    const RIcon = r.icon
                    const active = r.value === role
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => {
                          setRole(r.value)
                          setRoleOpen(false)
                        }}
                        className={`
                          w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                          transition-colors duration-150
                          ${active 
                            ? 'bg-[#14235E] dark:bg-white text-white dark:text-[#14235E]' 
                            : 'text-[#14235E] dark:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                          }
                        `}
                      >
                        <span className="flex items-center gap-2.5">
                          <RIcon className="w-4 h-4" />
                          {r.label}
                        </span>
                        {active && <Check className="w-4 h-4" />}
                      </button>
                    )
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-[#14235E] dark:text-white">Password</Label>
          <Field id="password" icon={Lock} isFocused={focused === "password"}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              required
              placeholder="Create a strong password"
              style={fieldInputStyle}
              className={fieldInputClass}
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
          </Field>

          {/* Strength meter */}
          {password.length > 0 && (
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: `${strength * 100}%` }}
                  transition={{ duration: 0.25 }}
                  className={`h-full rounded-full ${strengthColor}`}
                />
              </div>
              <span className={`text-xs font-medium w-10 text-right ${strength < 0.4 ? 'text-red-400' : strength < 0.7 ? 'text-amber-400' : 'text-[#14235E] dark:text-white'}`}>
                {strengthLabel}
              </span>
            </div>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500">Must be at least 6 characters long</p>
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
              bg-[#14235E]
              dark:bg-white
              text-white
              dark:text-[#14235E]
              font-semibold
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
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#14235E]/10 dark:bg-white/5 blur-xl" />

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="relative z-10 flex items-center gap-2.5"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="relative z-10 flex items-center gap-2.5"
                >
                  Create Account
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
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

        {/* Sign In Link */}
        <div className="text-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Already have an account? </span>
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-[#14235E] dark:text-white font-semibold hover:underline transition-colors relative group"
          >
            Sign in
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
            <div className="w-1.5 h-1.5 rounded-full bg-[#14235E] dark:bg-blue-400" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Encrypted</span>
          </div>
        </div>
      </form>
    </div>
  )
}