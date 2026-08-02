import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Check, Briefcase, Building2, Handshake,
  MapPin, Plane, User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Option {
  value:        string
  label:        string
  description?: string
}

interface InputStepProps {
  label:         string
  sublabel?:     string
  fieldKey:      string
  type?:         'text' | 'email' | 'tel' | 'options'
  placeholder?:  string
  options?:      Option[]
  defaultValue?: string
  onNext:        (data: Record<string, string>) => void
}

// UAE phone formatter: +971 50 123 4567
function formatPhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return raw.startsWith('+') ? '+' : ''
  if (digits.startsWith('971')) {
    const local = digits.slice(3)
    if (local.length === 0)  return '+971 '
    if (local.length <= 2)   return `+971 ${local}`
    if (local.length <= 5)   return `+971 ${local.slice(0, 2)} ${local.slice(2)}`
    return `+971 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 9)}`
  }
  return raw.startsWith('+') ? raw : `+${raw}`
}

// Icon per option value — falls back to a generic icon if unmatched
const OPTION_ICONS: Record<string, typeof User> = {
  employee: Briefcase,
  investor: Building2,
  partner:  Handshake,
  inside:   MapPin,
  outside:  Plane,
}
const iconForOption = (value: string) => OPTION_ICONS[value] || User

const shakeVariants = {
  shake: { x: [0, -6, 6, -4, 4, -2, 2, 0], transition: { duration: 0.32 } },
  rest:  { x: 0 },
}

const cardStagger = { animate: { transition: { staggerChildren: 0.05 } } }
const cardItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function InputStep({
  label,
  sublabel,
  fieldKey,
  type = 'text',
  placeholder,
  options,
  defaultValue = '',
  onNext,
}: InputStepProps) {
  const [value,    setValue]    = useState(defaultValue)
  const [selected, setSelected] = useState<string | null>(null)
  const [shaking,  setShaking]  = useState(false)
  const inputRef                = useRef<HTMLInputElement>(null)

  // Trigger mobile keyboard immediately on mount
  useEffect(() => {
    if (type !== 'options') {
      const t = setTimeout(() => inputRef.current?.focus(), 200)
      return () => clearTimeout(t)
    }
  }, [type])

  const submit = useCallback((val?: string) => {
    const v = (val ?? value).trim()
    if (!v) {
      setShaking(true)
      setTimeout(() => setShaking(false), 380)
      return
    }
    onNext({ [fieldKey]: v })
  }, [value, fieldKey, onNext])

  const handlePhoneChange = (raw: string) => {
    if (/[^0-9\s+\-()]/.test(raw.slice(-1))) {
      setShaking(true)
      setTimeout(() => setShaking(false), 380)
      return
    }
    setValue(formatPhone(raw))
  }

  // Tap option → flash → auto-advance, no second button needed
  const handleOptionSelect = (opt: Option) => {
    setSelected(opt.value)
    setTimeout(() => onNext({ [fieldKey]: opt.value }), 180)
  }

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Question headline */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26 }}
        className="space-y-2"
      >
      
        {sublabel && (
          <p className="text-[#64748B] dark:text-neutral-400 text-[15px] leading-relaxed">{sublabel}</p>
        )}
      </motion.div>

      {/* Option cards — modern grid, icon chip, elevated selected state */}
      {type === 'options' && options ? (
        <motion.div
          variants={cardStagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {options.map(opt => {
            const isSelected = selected === opt.value
            const Icon = iconForOption(opt.value)
            return (
              <motion.button
                key={opt.value}
                variants={cardItem}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionSelect(opt)}
                disabled={selected !== null}
                className={`
                  group relative flex flex-col items-start gap-3 p-5 rounded-2xl border text-left
                  transition-all duration-200 cursor-pointer overflow-hidden
                  outline-none focus:outline-none focus-visible:outline-none focus:ring-0
                  ${isSelected
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5 dark:bg-[var(--primary)]/10 shadow-[0_10px_28px_-8px_rgba(10,50,105,0.35)]'
                    : 'border-[#E9EDF1] dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-[var(--primary)]/15 dark:hover:border-neutral-600 shadow-[0_1px_2px_rgba(10,50,105,0.04)] dark:shadow-none hover:shadow-[0_10px_24px_rgba(10,50,105,0.08)] dark:hover:shadow-[0_10px_24px_rgba(0,0,0,0.4)]'
                  }
                `}
              >
                {/* top accent bar */}
                <span
                  className="absolute inset-x-0 top-0 h-[3px] transition-opacity duration-200"
                  style={{ background: 'var(--primary)', opacity: isSelected ? 1 : 0 }}
                />

                {/* selected check badge */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                      className="absolute top-3.5 right-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]"
                    >
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Icon chip */}
                <div
                  className={`
                    flex h-11 w-11 items-center justify-center rounded-xl shrink-0
                    transition-colors duration-200
                    ${isSelected
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[#F0F4F8] dark:bg-neutral-800 text-[var(--primary)] dark:text-neutral-300 group-hover:bg-[var(--primary)] dark:group-hover:bg-[var(--primary)] group-hover:text-white dark:group-hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>

                {/* Text */}
                <div className="min-w-0 pr-6">
                  <div className="font-semibold text-[var(--primary)] dark:text-white text-[15px] leading-snug">
                    {opt.label}
                  </div>
                  {opt.description && (
                    <div className="text-[12.5px] text-[#94A3B8] dark:text-neutral-500 mt-1 leading-snug">
                      {opt.description}
                    </div>
                  )}
                </div>

                {/* Arrow, bottom-right */}
                <ArrowRight
                  className={`
                    absolute bottom-4 right-4 w-4 h-4 transition-all duration-200
                    ${isSelected
                      ? 'opacity-0'
                      : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-[var(--primary)] dark:text-white'
                    }
                  `}
                />
              </motion.button>
            )
          })}
        </motion.div>
      ) : (
        /* Text / Email / Tel — bottom-border style, iOS-safe 18px */
        <div className="flex flex-col gap-6">
          <motion.div variants={shakeVariants} animate={shaking ? 'shake' : 'rest'}>
            <input
              ref={inputRef}
              type={type}
              value={value}
              inputMode={type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'text'}
              autoComplete={type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'on'}
              onChange={e =>
                type === 'tel' ? handlePhoneChange(e.target.value) : setValue(e.target.value)
              }
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder={placeholder}
              style={{ fontSize: '18px', outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}
              /* Must be ≥16px — prevents iOS Safari zoom */
              className="
               w-full bg-transparent border-0 border-b-2 border-[#E2E8F0] dark:border-neutral-700 rounded-none
                text-[var(--primary)] dark:text-white placeholder:text-[#CBD5E1] dark:placeholder:text-neutral-600
                pb-3 pt-1 px-0
                outline-none ring-0 ring-offset-0
                focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none
                focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0
                appearance-none
                transition-colors duration-200
                focus:border-[var(--primary)] dark:focus:border-[var(--primary)]
                caret-[var(--primary)]
              "
            />
          </motion.div>

          <Button
            onClick={() => submit()}
            disabled={!value.trim()}
            className="
              h-14 rounded-2xl font-semibold
              bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white
              dark:bg-[var(--primary)] dark:text-white dark:hover:bg-[var(--primary)]/90
              disabled:opacity-25 disabled:cursor-not-allowed
              active:scale-[0.97] transition-all
              flex items-center justify-center gap-2
            "
            style={{ fontSize: '17px' }}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-center text-[12px] text-[#CBD5E1] dark:text-neutral-600">
            Press Enter to continue
          </p>
        </div>
      )}
    </div>
  )
}