/**
 * ApplyPage — full-screen, no chrome, no header, no modal.
 * This IS the product. Stripe-style conversion funnel.
 */
import { useSearchParams } from 'react-router'
import ApplicationFlow from '@/components/Applications/ApplicationFlow'

export default function ApplyPage() {
  const [params] = useSearchParams()
  const service  = params.get('service') || ''

  return (
    <div className="min-h-dvh w-full bg-slate-50 dark:bg-[#0F172A] transition-colors duration-200">
      <ApplicationFlow initialService={service} />
    </div>
  )
}