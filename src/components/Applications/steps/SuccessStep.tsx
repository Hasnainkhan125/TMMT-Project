import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { CheckCircle2, MessageCircle, LayoutDashboard, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import confetti from 'canvas-confetti'

interface SuccessStepProps {
  serviceName:    string
  applicationId?: string
  onClose:        () => void
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } },
}
const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28 } },
}

export default function SuccessStep({ serviceName, applicationId, onClose }: SuccessStepProps) {
  const { t } = useTranslation()

  const NEXT_STEPS = [
    { title: t('successStep.step1Title', 'We verify your documents'),     sub: t('successStep.step1Sub', 'Our team reviews everything within minutes') },
    { title: t('successStep.step2Title', 'Submit to UAE authorities'),     sub: t('successStep.step2Sub', 'We handle all paperwork on your behalf') },
    { title: t('successStep.step3Title', 'You get updates on WhatsApp'),   sub: t('successStep.step3Sub', "You'll hear from us at every stage") },
    { title: t('successStep.step4Title', 'Visa issued'),                   sub: t('successStep.step4Sub', 'Average processing time: 2–5 business days') },
  ]

  useEffect(() => {
    const fire = (ratio: number, opts: confetti.Options) =>
      confetti({ origin: { y: 0.5 }, ...opts, particleCount: Math.floor(180 * ratio) })

    fire(0.25, { spread: 28, startVelocity: 55, colors: ['#BBF451', '#ffffff'] })
    fire(0.2,  { spread: 60,                    colors: ['#ffffff', '#BBF451'] })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#BBF451', '#0F2A44'] })
    fire(0.1,  { spread: 120, startVelocity: 25, colors: ['#ffffff', '#BBF451'] })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full flex flex-col gap-6 text-center"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
        className="mx-auto w-20 h-20 rounded-full bg-[#F0FDF4] border border-[#BBF451]/40 flex items-center justify-center"
      >
        <CheckCircle2 className="w-10 h-10 text-[#BBF451]" strokeWidth={2} />
      </motion.div>

      {/* Headline */}
      <div className="space-y-2">
        <h2
          className="font-bold text-[#0F2A44] leading-tight"
          style={{ fontSize: 'clamp(1.65rem, 5.5vw, 2.3rem)' }}
        >
          {t('successStep.title', 'Your visa process has started')}
        </h2>
        <p className="text-[#64748B] text-[15px] leading-relaxed">
          {t('successStep.subtitle', "We're now handling everything for you")}
        </p>
        {applicationId && (
          <p className="text-[11px] text-[#CBD5E1] font-mono mt-1">
            {t('successStep.ref', 'Ref')}: {applicationId.slice(-10).toUpperCase()}
          </p>
        )}
        <p className="text-[13px] text-[#94A3B8]">
          {t('successStep.applicationFor', 'Application for')}{' '}
          <span className="font-semibold text-[#0F2A44]">{serviceName}</span>
        </p>
      </div>

      {/* Next steps */}
      <div className="rounded-2xl border border-[#F1F5F9] bg-[#F8FAFC] p-5 text-left">
        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3">
          {t('successStep.whatHappensNext', 'What happens next')}
        </p>
        <Separator className="bg-[#F1F5F9] mb-4" />
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {NEXT_STEPS.map((s, i) => (
            <motion.div key={i} variants={fadeUp} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#BBF451]/20 border border-[#BBF451]/40 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-[#4D7C0F]">{i + 1}</span>
              </div>
              <div className="text-left">
                <p className="text-[14px] font-semibold text-[#0F2A44]">{s.title}</p>
                <p className="text-[12px] text-[#94A3B8] leading-snug mt-0.5">{s.sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <motion.a
          whileTap={{ scale: 0.97 }}
          href="https://wa.me/971000000000?text=Hi+Tammat%2C+I+just+submitted+my+application"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 h-14 rounded-2xl bg-[#0F2A44] text-white font-semibold active:scale-[0.97] transition-transform"
          style={{ fontSize: '16px' }}
        >
          <MessageCircle className="w-5 h-5" />
          {t('successStep.chatSupport', 'Chat with support anytime')}
        </motion.a>

        <Button
          variant="outline"
          onClick={onClose}
          className="h-12 rounded-2xl border-[#F1F5F9] bg-white text-[#64748B] hover:text-[#0F2A44] hover:bg-[#F8FAFC] flex items-center justify-center gap-2"
          style={{ fontSize: '15px' }}
        >
          <LayoutDashboard className="w-4 h-4" />
          {t('successStep.trackApp', 'Track my application')}
          <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />
        </Button>
      </div>
    </motion.div>
  )
}
