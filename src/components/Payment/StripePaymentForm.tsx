/**
 * StripePaymentForm — functional Stripe card payment
 *
 * Anti-blink guarantee:
 *   - stripePromise is created ONCE at module level (never inside a component)
 *   - <Elements> wrapper is a stable component that never remounts
 *   - No state that causes parent re-renders is held here
 *
 * Flow:
 *   1. createPaymentMethod(card) → pm.id
 *   2. POST /api/v1/services/payments/create-intent → { clientSecret, status }
 *   3. If status !== 'succeeded' → confirmCardPayment(clientSecret, pm.id)
 *   4. onSuccess / onError
 */
import React, { useState, useRef, memo } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useTranslation } from 'react-i18next'
import { CreditCard, Shield, Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// ── Module-level singleton — never recreated ──────────────────────────────────
const PK =
  (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string) || '';

// loadStripe returns the same promise object every call with the same key
// but we cache it at module scope so it's truly created once.
const stripePromise = loadStripe(PK)

const API_BASE   = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'
const INTENT_URL = `${API_BASE}/api/v1/services/payments/create-intent`

// CardElement appearance — stable object reference so Stripe doesn't re-render
const CARD_OPTIONS = {
  style: {
    base: {
      fontSize:      '16px',
      color:         '#0F2A44',
      fontFamily:    '"Inter", system-ui, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#94A3B8' },
    },
    invalid: { color: '#EF4444', iconColor: '#EF4444' },
  },
  hidePostalCode: true,
} as const

// ── Props ─────────────────────────────────────────────────────────────────────
export interface StripePaymentFormProps {
  amount:         number   // AED integer e.g. 1089
  currency?:      string
  applicationId?: string
  onSuccess:      (result: unknown) => void
  onError:        (err: string) => void
  disabled?:      boolean
}

// ── Inner form — must sit inside <Elements> ───────────────────────────────────
// memo() prevents unnecessary remounts when PaymentStep re-renders
const CardForm = memo(function CardForm({
  amount,
  currency = 'aed',
  applicationId,
  onSuccess,
  onError,
  disabled = false,
}: StripePaymentFormProps) {
  const { t }    = useTranslation()
  const stripe   = useStripe()
  const elements = useElements()

  const [processing, setProcessing] = useState(false)
  const [cardError,  setCardError]  = useState<string | null>(null)
  const [succeeded,  setSucceeded]  = useState(false)

  // Stable ref so handleSubmit always has fresh values without re-creating the fn
  const ctxRef = useRef({ amount, currency, applicationId, onSuccess, onError })
  ctxRef.current = { amount, currency, applicationId, onSuccess, onError }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { amount: amt, currency: cur, applicationId: appId, onSuccess: ok, onError: fail } = ctxRef.current

    if (!stripe || !elements) { fail(t('payment.stripeNotLoaded', 'Stripe not loaded')); return }
    const cardEl = elements.getElement(CardElement)
    if (!cardEl) { fail(t('payment.cardMissing', 'Card element missing')); return }

    setProcessing(true)
    setCardError(null)

    try {
      // 1 — create payment method client-side
      const { error: pmErr, paymentMethod } = await stripe.createPaymentMethod({ type: 'card', card: cardEl })
      if (pmErr) throw new Error(pmErr.message)

      // 2 — create intent on backend
      const token = localStorage.getItem('authToken') || ''
      const res   = await fetch(INTENT_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount:            10,   // AED → fils
          currency:          cur.toLowerCase(),
          payment_method_id: paymentMethod!.id,
          application_id:    appId || '',
          description:       'TAMMAT visa service fee',
        }),
      })
      const intentData = await res.json()
      if (!res.ok) throw new Error(intentData?.message || t('payment.intentFailed', 'Failed to create payment intent'))

      const { clientSecret, status } = intentData.data || {}

      // 3 — if already succeeded (no 3DS)
      if (status === 'succeeded') {
        setSucceeded(true)
        toast.success(t('payment.success', 'Payment successful!'))
        ok(intentData.data)
        return
      }

      // 4 — confirm (handles 3DS automatically)
      const { error: confirmErr, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod!.id,
      })
      if (confirmErr) throw new Error(confirmErr.message)

      if (paymentIntent?.status === 'succeeded') {
        setSucceeded(true)
        toast.success(t('payment.success', 'Payment successful!'))
        ok(paymentIntent)
      } else {
        throw new Error(`${t('payment.unexpectedStatus', 'Unexpected status')}: ${paymentIntent?.status}`)
      }
    } catch (err: any) {
      const msg = err.message || t('payment.failed', 'Payment failed')
      setCardError(msg)
      fail(msg)
      toast.error(msg)
    } finally {
      setProcessing(false)
    }
  }

  if (succeeded) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border border-[#BBF451]/40 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#BBF451]" />
        </div>
        <p className="font-bold text-[#0F2A44] text-[18px]">{t('payment.received', 'Payment received')}</p>
        <p className="text-[#64748B] text-[14px]">{t('payment.processingNote', 'Your application is now being processed')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
      {/* Card input */}
      <div className="space-y-2">
        <label className="text-[13px] font-semibold text-[#475569] uppercase tracking-wider">
          {t('payment.cardDetails', 'Card details')}
        </label>
        <div className={`rounded-xl border px-4 py-4 bg-white transition-colors ${
          cardError ? 'border-red-300 bg-red-50' : 'border-[#E2E8F0] focus-within:border-[#BBF451]'
        }`}>
          <CardElement options={CARD_OPTIONS} onChange={e => setCardError(e.error?.message || null)} />
        </div>
        {cardError && (
          <div className="flex items-center gap-1.5 text-[12px] text-red-600">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {cardError}
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] px-4 py-3 flex items-center justify-between">
        <span className="text-[13px] text-[#64748B] font-medium">{t('payment.total', 'Total')}</span>
        <span className="text-[18px] font-bold text-[#0F2A44] tabular-nums">AED {amount.toLocaleString()}</span>
      </div>

      {/* Accepted cards */}
      <div className="flex items-center gap-3">
        <p className="text-[11px] text-[#94A3B8]">{t('payment.weAccept', 'We accept')}</p>
        <div className="flex items-center gap-2">
          {['VISA', 'MC', 'AMEX'].map(c => (
            <span key={c} className="px-2 py-0.5 rounded border border-[#E2E8F0] text-[10px] font-bold text-[#475569] bg-white">{c}</span>
          ))}
        </div>
      </div>

      {/* Trust strip */}
      <div className="flex items-center justify-center gap-5 text-[11px] text-[#94A3B8]">
        <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[#BBF451]" />{t('payment.stripeSecured', 'Stripe secured')}</span>
        <span className="text-[#E2E8F0]">·</span>
        <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" />{t('payment.sslEncrypted', 'SSL encrypted')}</span>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={!stripe || processing || disabled}
        className="w-full h-14 rounded-2xl font-bold bg-[#0F2A44] hover:bg-[#1a3a5c] text-white disabled:opacity-40 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
        style={{ fontSize: '17px' }}
      >
        {processing ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('payment.processing', 'Processing…')}</>
        ) : (
          <><CreditCard className="w-4 h-4" />{t('payment.payBtn', 'Pay AED {{amount}} securely', { amount: amount.toLocaleString() })}</>
        )}
      </Button>
    </form>
  )
})

// ── Stable Elements wrapper ───────────────────────────────────────────────────
// This is a separate component (not inline) so React never destroys <Elements>
// between renders of the parent — that was the blink cause.
export const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => (
  <Elements stripe={stripePromise}>
    <CardForm {...props} />
  </Elements>
)

export default StripePaymentForm
