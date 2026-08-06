// /**
//  * PaymentStep — two-column desktop layout
//  *
//  * Left  col (desktop): service summary, price breakdown by location, trust signals
//  * Right col (desktop): Pay Now (Stripe card) OR Pay Later (Stripe payment link)
//  * Mobile: single column, summary on top, payment below
//  *
//  * Pay Now  → direct Stripe card payment via PaymentIntent
//  * Pay Later → generates a Stripe Payment Link and opens it / copies URL
//  *
//  * Re-render fix: SummaryPanel and PaymentPanel are extracted as top-level
//  * memo'd components so the 1-second countdown timer doesn't recreate them
//  * and cause Stripe Elements to unmount/remount.
//  */
// import { useState, useEffect, useRef, memo, useCallback } from 'react'
// import { useTranslation } from 'react-i18next'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   Shield, Lock, Clock, CreditCard, Link as LinkIcon,
//   CheckCircle2, ArrowRight, ChevronDown, ChevronUp, Sparkles,
//   Landmark, Copy, Check, Building2, Upload, Info,
// } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Separator } from '@/components/ui/separator'
// import { Badge } from '@/components/ui/badge'
// import StripePaymentForm from '@/components/Payment/StripePaymentForm'
// import type { FlowService } from '../ApplicationFlow'

// interface PaymentStepProps {
//   amount:         number
//   applicationId?: string
//   service?:       FlowService
//   location?:      string
//   onSuccess:      (result: unknown) => void
//   onError:        (err: string) => void
// }

// const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'
// const apiUrl  = `${apiBase}/api/v1`

// type PayMode = 'now' | 'later'

// // ── Bank Transfer Info Component (Small & Clean) ─────────────────────────────
// interface BankTransferInfoProps {
//   bankDetails: {
//     accountName: string
//     iban: string
//     bic: string
//     bankName: string
//     bankAddress: string
//   }
//   onReceiptUploaded?: (file: File) => Promise<void>
//   receiptUploaded?: boolean
//   uploading?: boolean
// }

// const BankTransferInfo = memo(function BankTransferInfo({ 
//   bankDetails, 
//   onReceiptUploaded, 
//   receiptUploaded = false,
//   uploading = false 
// }: BankTransferInfoProps) {
//   const { t } = useTranslation()
//   const [copied, setCopied] = useState<string | null>(null)

//   const copyToClipboard = (text: string, label: string) => {
//     navigator.clipboard?.writeText(text)
//     setCopied(label)
//     setTimeout(() => setCopied(null), 2000)
//   }

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files?.[0] && onReceiptUploaded) {
//       onReceiptUploaded(e.target.files[0])
//     }
//   }

//   return (
//     <div className="rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#1A1A1F] p-4 space-y-4">
//       {/* Header */}
//       <div className="flex items-center gap-2">
//         <div className="h-5 w-1 rounded-full bg-[#0A3269]" />
//         <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0A3269] dark:text-[#4A8ABF]">
//           {t('payment.govBankTransfer', 'Government Bank Transfer Details')}
//         </p>
//       </div>

//       {/* Bank Details - Small Grid */}
//       <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
//         <div>
//           <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] dark:text-white/30 font-semibold">
//             {t('payment.accountName', 'Account Name')}
//           </p>
//           <div className="flex items-center gap-1.5 mt-0.5">
//             <span className="font-medium text-[#0A3269] dark:text-white/90 text-[11px]">
//               {bankDetails.accountName}
//             </span>
//             <button
//               onClick={() => copyToClipboard(bankDetails.accountName, 'name')}
//               className="text-[#0A3269] dark:text-[#4A8ABF] hover:opacity-70"
//             >
//               {copied === 'name' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
//             </button>
//           </div>
//         </div>

//         <div>
//           <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] dark:text-white/30 font-semibold">
//             IBAN
//           </p>
//           <div className="flex items-center gap-1.5 mt-0. 5">
//             <span className="font-mono font-medium text-[#0A3269] dark:text-white/90 text-[11px]">
//               {bankDetails.iban}
//             </span>
//             <button
//               onClick={() => copyToClipboard(bankDetails.iban, 'iban')}
//               className="text-[#0A3269] dark:text-[#4A8ABF] hover:opacity-70"
//             >
//               {copied === 'iban' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
//             </button>
//           </div>
//         </div>

//         <div>
//           <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] dark:text-white/30 font-semibold">
//             BIC / Swift
//           </p>
//           <div className="flex items-center gap-1.5 mt-0.5">
//             <span className="font-mono font-medium text-[#0A3269] dark:text-white/90 text-[11px]">
//               {bankDetails.bic}
//             </span>
//             <button
//               onClick={() => copyToClipboard(bankDetails.bic, 'bic')}
//               className="text-[#0A3269] dark:text-[#4A8ABF] hover:opacity-70"
//             >
//               {copied === 'bic' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
//             </button>
//           </div>
//         </div>

//         <div>
//           <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] dark:text-white/30 font-semibold">
//             {t('payment.bankName', 'Bank')}
//           </p>
//           <p className="font-medium text-[#0A3269] dark:text-white/90 text-[11px] mt-0.5">
//             {bankDetails.bankName}
//           </p>
//         </div>

//         <div className="col-span-2">
//           <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] dark:text-white/30 font-semibold">
//             {t('payment.bankAddress', 'Address')}
//           </p>
//           <p className="text-[11px] text-[#475569] dark:text-white/60 mt-0.5">
//             {bankDetails.bankAddress}
//           </p>
//         </div>
//       </div>

//       <Separator className="bg-[#F1F5F9] dark:bg-white/10" />

//       {/* Receipt Upload - Small */}
//       {onReceiptUploaded && (
//         <div className="rounded-lg border-2 border-dashed border-[#0A3269]/20 dark:border-[#0A3269]/30 p-3 text-center">
//           <p className="text-[11px] font-medium text-[#0A3269] dark:text-white flex items-center justify-center gap-1.5">
//             <Upload className="w-3.5 h-3.5" />
//             {t('payment.uploadReceipt', 'Upload Proof of Payment')}
//           </p>
          
//           {receiptUploaded ? (
//             <div className="flex items-center justify-center gap-1.5 text-[#0A3269] dark:text-[#4A8ABF] py-1">
//               <CheckCircle2 className="w-4 h-4" />
//               <span className="text-[11px] font-medium">{t('payment.receiptUploaded', 'Receipt uploaded')}</span>
//             </div>
//           ) : (
//             <>
//               <input
//                 type="file"
//                 accept="image/*,.pdf"
//                 onChange={handleFileChange}
//                 className="hidden"
//                 id="receipt-upload-small"
//                 disabled={uploading}
//               />
//               <label
//                 htmlFor="receipt-upload-small"
//                 className="cursor-pointer flex flex-col items-center gap-0.5 py-1"
//               >
//                 {uploading ? (
//                   <div className="flex items-center gap-1.5">
//                     <div className="w-3 h-3 border-2 border-[#0A3269]/30 border-t-[#0A3269] rounded-full animate-spin" />
//                     <span className="text-[10px] text-[#64748B] dark:text-white/60">
//                       {t('payment.uploading', 'Uploading...')}
//                     </span>
//                   </div>
//                 ) : (
//                   <>
//                     <span className="text-[10px] text-[#64748B] dark:text-white/60">
//                       {t('payment.clickToUpload', 'Click to upload receipt')}
//                     </span>
//                     <span className="text-[8px] text-[#94A3B8] dark:text-white/30">
//                       {t('payment.supportedFormats', 'JPG, PNG, PDF (max 5MB)')}
//                     </span>
//                   </>
//                 )}
//               </label>
//             </>
//           )}
//         </div>
//       )}

//       {/* Info Note - Small */}
//       <div className="flex items-start gap-1.5 text-[10px] text-[#64748B] dark:text-white/40">
//         <Info className="w-3 h-3 shrink-0 mt-0.5 text-[#0A3269] dark:text-[#4A8ABF]" />
//         <span>{t('payment.bankTransferNote', 'After transferring the amount, you will receive a confirmation receipt.')}</span>
//       </div>
//     </div>
//   )
// })

// // ── SummaryPanel (top-level, memo'd — immune to timer re-renders) ───────────
// interface SummaryPanelProps {
//   service?:       FlowService
//   location:       string
//   displayFee:     number
//   otherFee:       number
//   otherLabel:     string
//   processingFee:  number
//   vatAmount:      number
//   grandTotal:     number
//   timerStr:       string
//   expired:        boolean
//   showBreakdown:  boolean
//   onToggleBreakdown: () => void
// }

// const SummaryPanel = memo(function SummaryPanel({
//   service, location, displayFee, otherFee, otherLabel,
//   processingFee, vatAmount, grandTotal,
//   timerStr, expired, showBreakdown, onToggleBreakdown,
// }: SummaryPanelProps) {
//   const { t } = useTranslation()

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="rounded-2xl border border-[#F1F5F9] dark:border-white/10 bg-white dark:bg-[#1A1A1F] p-5 space-y-3">
//         <div className="flex items-start justify-between gap-3">
//           <div>
//             <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] dark:text-white/40 mb-0.5">
//               {t('payment.applyingFor', 'Applying for')}
//             </p>
//             <p className="font-bold text-[#0F2A44] dark:text-white text-[17px] leading-snug">
//               {service?.name || 'Visa Service'}
//             </p>
//           </div>
//           {service?.processingTime && (
//             <Badge className="shrink-0 flex items-center gap-1 bg-white dark:bg-[#2A2A2F] border border-[#F1F5F9] dark:border-white/10 text-[#64748B] dark:text-white/60 text-[11px] rounded-full px-2.5 py-1">
//               <Clock className="w-3 h-3" />
//               {service.processingTime}
//             </Badge>
//           )}
//         </div>

//         <Separator className="bg-[#F1F5F9] dark:bg-white/10" />

//         <div className="space-y-2">
//           <div className="flex items-center justify-between">
//             <span className="text-[13px] text-[#475569] dark:text-white/70">
//               {t('payment.serviceFee', 'Service fee')} <span className="text-[11px] text-[#94A3B8] dark:text-white/40">({location === 'inside' ? t('payment.insideUae', 'Inside UAE') : t('payment.outsideUae', 'Outside UAE')})</span>
//             </span>
//             <span className="font-bold text-[#0F2A44] dark:text-white tabular-nums text-[17px]">
//               AED {displayFee.toLocaleString()}
//             </span>
//           </div>

//           <button
//             onClick={onToggleBreakdown}
//             className="flex items-center gap-1 text-[11px] text-[#94A3B8] dark:text-white/40 hover:text-[#64748B] dark:hover:text-white/60 transition-colors"
//           >
//             {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
//             {otherLabel} price: AED {otherFee.toLocaleString()}
//           </button>

//           <AnimatePresence>
//             {showBreakdown && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: 'auto', opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="overflow-hidden"
//               >
//                 <div className="rounded-xl bg-[#F0F9FF] dark:bg-[#0A1628] border border-[#BAE6FD] dark:border-[#1A3A5C] px-3 py-2.5 text-[12px] text-[#0C4A6E] dark:text-[#7BB8E0]">
//                   Prices vary based on whether you are currently inside or outside the UAE when applying.
//                   Your location was recorded as <strong>{location === 'inside' ? t('payment.insideUae', 'Inside UAE') : t('payment.outsideUae', 'Outside UAE')}</strong>.
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <div className="flex items-center justify-between">
//             <span className="text-[13px] text-[#475569] dark:text-white/70">{t('payment.processingFeeLabel', 'Processing fee')}</span>
//             <span className="text-[13px] font-semibold text-[#0F2A44] dark:text-white tabular-nums">
//               AED {processingFee.toLocaleString()}
//             </span>
//           </div>

//           <div className="flex items-center justify-between">
//             <span className="text-[13px] text-[#475569] dark:text-white/70">{t('payment.vatLabel', 'VAT (5%)')}</span>
//             <span className="text-[13px] font-semibold text-[#0F2A44] dark:text-white tabular-nums">
//               AED {vatAmount.toLocaleString()}
//             </span>
//           </div>

//           <Separator className="bg-[#F1F5F9] dark:bg-white/10" />

//           <div className="flex items-center justify-between pt-0.5">
//             <span className="text-[13px] font-semibold text-[#0F2A44] dark:text-white">{t('payment.total', 'Total')}</span>
//             <span className="text-2xl font-bold text-[#0F2A44] dark:text-white tabular-nums">AED {grandTotal.toLocaleString()}</span>
//           </div>
//           <p className="text-[10px] text-[#94A3B8] dark:text-white/30">{t('payment.govFeesNote', 'Government fees are billed separately after approval')}</p>
//         </div>
//       </div>

//       <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-[13px] ${
//         expired 
//           ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400' 
//           : 'bg-[#FFFBEB] dark:bg-[#1A1A0F] border-[#FDE68A] dark:border-[#3A3A1A] text-[#92400E] dark:text-[#E8C84A]'
//       }`}>
//         <Clock className="w-4 h-4 shrink-0" />
//         {expired
//           ? t('payment.slotExpired', 'Your slot has expired — please restart your application.')
//           : <span>{t('payment.slotReserved', 'Slot reserved for')} <strong className="tabular-nums">{timerStr}</strong></span>
//         }
//       </div>

//       <div className="rounded-2xl border border-[#F1F5F9] dark:border-white/10 bg-white dark:bg-[#1A1A1F] p-4 space-y-2">
//         {[
//           { icon: Shield, color: 'text-[#0A3269]', text: t('payment.pciDss', 'Powered by Stripe — PCI DSS Level 1') },
//           { icon: Lock,   color: 'text-[#64748B] dark:text-white/40', text: t('payment.ssl256', '256-bit SSL encryption') },
//           { icon: CheckCircle2, color: 'text-[#0A3269]', text: t('payment.approvalRate', '97% approval rate on applications') },
//         ].map(({ icon: Icon, color, text }) => (
//           <div key={text} className="flex items-center gap-2.5 text-[12px] text-[#64748B] dark:text-white/60">
//             <Icon className={`w-4 h-4 shrink-0 ${color}`} />
//             {text}
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// })

// // ── PaymentPanel (top-level, memo'd — Stripe Elements stay mounted) ─────────
// interface PaymentPanelProps {
//   mode:            PayMode
//   setMode:         (m: PayMode) => void
//   grandTotal:      number
//   applicationId?:  string
//   serviceName:     string
//   linkUrl:         string | null
//   setLinkUrl:      (u: string | null) => void
//   linkLoading:     boolean
//   onGenerateLink:  () => void
//   onSuccess:       (result: unknown) => void
//   onError:         (err: string) => void
// }

// const PaymentPanel = memo(function PaymentPanel({
//   mode, setMode, grandTotal, applicationId,
//   linkUrl, setLinkUrl, linkLoading, onGenerateLink,
//   onSuccess, onError,
// }: PaymentPanelProps) {
//   const { t } = useTranslation()

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="rounded-2xl border border-[#F1F5F9] dark:border-white/10 bg-white dark:bg-[#1A1A1F] p-1.5 grid grid-cols-2 gap-1">
//         {(['now', 'later'] as PayMode[]).map(m => (
//           <button
//             key={m}
//             onClick={() => { setMode(m); setLinkUrl(null) }}
//             className={`
//               flex items-center justify-center gap-2 h-11 rounded-xl text-[14px] font-semibold
//               transition-all duration-150
//               ${mode === m
//                 ? 'bg-[#0F2A44] dark:bg-white text-white dark:text-[#0F2A44] shadow-sm'
//                 : 'text-[#64748B] dark:text-white/60 hover:bg-[#F8FAFC] dark:hover:bg-white/5'
//               }
//             `}
//           >
//             {m === 'now'
//               ? <><CreditCard className="w-4 h-4" /> {t('payment.payNow', 'Pay Now')}</>
//               : <><LinkIcon className="w-4 h-4" /> {t('payment.payLater', 'Pay Later')}</>
//             }
//           </button>
//         ))}
//       </div>

//       <AnimatePresence mode="wait">
//         {mode === 'now' ? (
//           <motion.div
//             key="now"
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -8 }}
//             transition={{ duration: 0.2 }}
//           >
//             <StripePaymentForm
//               amount={grandTotal}
//               currency="aed"
//               applicationId={applicationId}
//               onSuccess={onSuccess}
//               onError={onError}
//             />
//           </motion.div>
//         ) : (
//           <motion.div
//             key="later"
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -8 }}
//             transition={{ duration: 0.2 }}
//             className="flex flex-col gap-4"
//           >
//             <div className="rounded-2xl border border-[#F1F5F9] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#1A1A1F] p-5 space-y-3">
//               <div className="flex items-start gap-3">
//                 <LinkIcon className="w-5 h-5 text-[#0A3269] shrink-0 mt-0.5" />
//                 <div>
//                   <p className="font-semibold text-[#0F2A44] dark:text-white text-[15px]">{t('payment.payViaLink', 'Pay via secure link')}</p>
//                   <p className="text-[13px] text-[#64748B] dark:text-white/60 mt-0.5 leading-relaxed">
//                     {t('payment.payViaLinkDesc', "We'll generate a Stripe payment link. Use it from any browser or device — Apple Pay, Google Pay, or card.")}
//                   </p>
//                 </div>
//               </div>

//               <ul className="space-y-1.5">
//                 {[
//                   t('payment.linkValid24h', 'Link valid for 24 hours'),
//                   t('payment.supportsAppleGooglePay', 'Supports Apple Pay and Google Pay'),
//                   t('payment.applicationSaved', 'Your application is already saved'),
//                   t('payment.payFromAnyDevice', 'Pay from any device or share with someone else'),
//                 ].map(txt => (
//                   <li key={txt} className="flex items-center gap-2 text-[12px] text-[#475569] dark:text-white/60">
//                     <CheckCircle2 className="w-3.5 h-3.5 text-[#0A3269] shrink-0" />
//                     {txt}
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {linkUrl ? (
//               <div className="rounded-2xl border border-[#0A3269]/40 dark:border-[#0A3269]/20 bg-[#F0F7FF] dark:bg-[#0A1628] p-4 space-y-3">
//                 <div className="flex items-center gap-2">
//                   <Sparkles className="w-4 h-4 text-[#0A3269]" />
//                   <p className="font-semibold text-[#0A3269] dark:text-[#4A8ABF] text-[14px]">{t('payment.linkReady', 'Your payment link is ready')}</p>
//                 </div>
//                 <div className="rounded-xl border border-[#0A3269]/30 dark:border-[#0A3269]/20 bg-white dark:bg-[#0A0A0F] px-3 py-2.5 flex items-center gap-2">
//                   <span className="text-[12px] text-[#475569] dark:text-white/60 flex-1 truncate">{linkUrl}</span>
//                   <button
//                     onClick={() => navigator.clipboard?.writeText(linkUrl)}
//                     className="text-[11px] font-semibold text-[#0A3269] hover:underline shrink-0"
//                   >
//                     {t('payment.copy', 'Copy')}
//                   </button>
//                 </div>
//                 <div className="grid grid-cols-2 gap-2">
//                   <a
//                     href={linkUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="h-12 rounded-2xl bg-[#0A3269] dark:bg-white text-white dark:text-[#0A3269] font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[#1A4A7A] dark:hover:bg-white/90 transition-colors"
//                   >
//                     <ArrowRight className="w-4 h-4" />
//                     {t('payment.openLink', 'Open link')}
//                   </a>
//                   <button
//                     onClick={() => { setLinkUrl(null) }}
//                     className="h-12 rounded-2xl border border-[#F1F5F9] dark:border-white/10 text-[#64748B] dark:text-white/60 text-[14px] font-medium hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors"
//                   >
//                     {t('payment.generateNew', 'Generate new')}
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <Button
//                 onClick={onGenerateLink}
//                 disabled={linkLoading}
//                 className="w-full h-14 rounded-2xl font-semibold bg-[#0A3269] dark:bg-white hover:bg-[#1A4A7A] dark:hover:bg-white/90 text-white dark:text-[#0A3269] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
//                 style={{ fontSize: '17px' }}
//               >
//                 {linkLoading
//                   ? <><div className="w-4 h-4 border-2 border-white/30 dark:border-[#0A3269]/30 border-t-white dark:border-t-[#0A3269] rounded-full animate-spin" /> {t('payment.generating', 'Generating…')}</>
//                   : <><LinkIcon className="w-4 h-4" /> {t('payment.generateLinkBtn', 'Generate payment link — AED {{amount}}', { amount: grandTotal.toLocaleString() })}</>
//                 }
//               </Button>
//             )}

//             <p className="text-center text-[11px] text-[#CBD5E1] dark:text-white/30">
//               {t('payment.savedPayAnytime', 'Your application is saved. Pay anytime within 24 hours to keep your slot.')}
//             </p>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <p className="text-center text-[11px] text-[#CBD5E1] dark:text-white/20">
//         {t('payment.termsNote', 'By paying you agree to our Terms of Service. Government fees are billed separately.')}
//       </p>
//     </div>
//   )
// })

// // ── Main PaymentStep ────────────────────────────────────────────────────────
// export default function PaymentStep({
//   amount,
//   applicationId,
//   service,
//   location = 'inside',
//   onSuccess,
//   onError,
// }: PaymentStepProps) {
//   const { t } = useTranslation()
//   const [mode,        setMode]        = useState<PayMode>('now')
//   const [secondsLeft, setSecondsLeft] = useState(600)
//   const [linkUrl,     setLinkUrl]     = useState<string | null>(null)
//   const [linkLoading, setLinkLoading] = useState(false)
//   const [showBreakdown, setShowBreakdown] = useState(false)
//   const [uploading, setUploading] = useState(false)
//   const [receiptUploaded, setReceiptUploaded] = useState(false)

//   // 10-minute slot countdown
//   useEffect(() => {
//     if (secondsLeft <= 0) return
//     const id = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
//     return () => clearTimeout(id)
//   }, [secondsLeft])

//   const minutes  = Math.floor(secondsLeft / 60)
//   const seconds  = secondsLeft % 60
//   const timerStr = `${minutes}:${String(seconds).padStart(2, '0')}`
//   const expired  = secondsLeft <= 0

//   const insidePrice  = service?.prices?.find(p => p.priceType?.toLowerCase() === 'inside')?.priceAmount  ?? amount
//   const outsidePrice = service?.prices?.find(p => p.priceType?.toLowerCase() === 'outside')?.priceAmount ?? amount
//   const displayFee   = location === 'inside' ? insidePrice : outsidePrice
//   const otherFee     = location === 'inside' ? outsidePrice : insidePrice
//   const otherLabel   = location === 'inside' ? 'Outside UAE' : 'Inside UAE'

//   const PROCESSING_FEE = 70
//   const subtotal   = displayFee + PROCESSING_FEE
//   const vatAmount  = Math.round(subtotal * 0.05)
//   const grandTotal = subtotal + vatAmount

//   // Stable callback refs so memo'd children never get stale closures
//   const onSuccessRef = useRef(onSuccess)
//   onSuccessRef.current = onSuccess
//   const onErrorRef = useRef(onError)
//   onErrorRef.current = onError

//   const stableOnSuccess = useCallback((result: unknown) => onSuccessRef.current(result), [])
//   const stableOnError   = useCallback((err: string) => onErrorRef.current(err), [])

//   const handleGenerateLink = useCallback(async () => {
//     setLinkLoading(true)
//     try {
//       const token = localStorage.getItem('authToken') || ''
//       const res   = await fetch(`${apiUrl}/services/payments/create-link`, {
//         method:  'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify({
//           amount:         grandTotal,
//           currency:       'aed',
//           service_name:   service?.name || 'TAMMAT Visa Service',
//           application_id: applicationId || '',
//         }),
//       })
//       const d = await res.json()
//       if (!res.ok || !d?.data?.url) throw new Error(d?.message || 'Could not generate payment link')
//       setLinkUrl(d.data.url)
//     } catch (e: any) {
//       onErrorRef.current(e.message || 'Failed to generate payment link')
//     } finally 


//       setLinkLoading(false
//     }
//   }, [grandTotal, service?.name, applicationId])

//   const handleReceiptUpload = useCallback(async (file: File) => {
//     setUploading(true)
//     try {
//       const formData = new FormData()
//       formData.append('receipt', file)
//       formData.append('applicationId', applicationId || '')
      
//       const token = localStorage.getItem('authToken') || ''
//       const res = await fetch(`${apiUrl}/applications/upload-receipt`, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       })
      
//       if (!res.ok) {
//         const errorData = await res.json().catch(() => ({}))
//         throw new Error(errorData?.message || 'Upload failed')
//       }
      
//       setReceiptUploaded(true)
//       onSuccessRef.current({ receiptUploaded: true })
//     } catch (e: any) {
//       onErrorRef.current(e.message || 'Failed to upload receipt')
//     } finally {
//       setUploading(false)
//     }
//   }, [applicationId])

//   const toggleBreakdown = useCallback(() => setShowBreakdown(b => !b), [])

//   const bankDetails = {
//     accountName: 'E.A.O FOR MARKETING SERVICES VIA SOCIAL MEDIA',
//     iban: 'AE240860000009389202326',
//     bic: 'WIOBAEADXXX',
//     bankName: 'Etihad Airways Centre 5th Floor',
//     bankAddress: 'Abu Dhabi, UAE'
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, x: 32 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: -32 }}
//       transition={{ duration: 0.26 }}
//       className="w-full"
//     >
//       <div className="space-y-1.5 mb-6">
//         <div className="flex items-center gap-2">
//           <div className="h-5 w-1 rounded-full bg-gradient-to-b from-[#0A3269] to-[#1A4A8A]" />
//           <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#64748B] dark:text-white/40">
//             {t('flow.group.payment', 'Payment')}
//           </p>
//         </div>
//         <h2
//           className="font-bold leading-tight text-[#0F2A44] dark:text-white"
//           style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}
//         >
//           {t('payment.completeApplication', 'Complete your application')}
//         </h2>
//         <p className="text-[#64748B] dark:text-white/60 text-[14px]">
//           {t('payment.securePayment', 'Secure payment — protected by Stripe')}
//         </p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">
//         <div className="flex flex-col gap-4">
//           <SummaryPanel
//             service={service}
//             location={location}
//             displayFee={displayFee}
//             otherFee={otherFee}
//             otherLabel={otherLabel}
//             processingFee={PROCESSING_FEE}
//             vatAmount={vatAmount}
//             grandTotal={grandTotal}
//             timerStr={timerStr}
//             expired={expired}
//             showBreakdown={showBreakdown}
//             onToggleBreakdown={toggleBreakdown}
//           />
          
//           {/* Bank Transfer Information - Small & Clean */}
//           <BankTransferInfo 
//             bankDetails={bankDetails}
//             onReceiptUploaded={handleReceiptUpload}
//             receiptUploaded={receiptUploaded}
//             uploading={uploading}
//           />
//         </div>
        
//         <PaymentPanel
//           mode={mode}
//           setMode={setMode}
//           grandTotal={grandTotal}
//           applicationId={applicationId}
//           serviceName={service?.name || 'Visa Service'}
//           linkUrl={linkUrl}
//           setLinkUrl={setLinkUrl}
//           linkLoading={linkLoading}
//           onGenerateLink={handleGenerateLink}
//           onSuccess={stableOnSuccess}
//           onError={stableOnError}
//         />
//       </div>
//     </motion.div>
//   )
// }











import { useState, useEffect, useRef, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Lock, Clock, CreditCard,
  CheckCircle2, ChevronDown, ChevronUp,
  Landmark, Copy, Check, Building2, Upload, Info,
  Banknote, Crown, Sparkles, ArrowRight,
  DollarSign, Zap, Percent, FileText, X, Image as ImageIcon,
  Loader2, AlertCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { FlowService } from '../ApplicationFlow'
import { toast } from 'sonner'

interface PaymentStepProps {
  amount:         number
  applicationId?: string
  service?:       FlowService
  location?:      string
  onSuccess:      (result: unknown) => void
  onError:        (err: string) => void
}

const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'
const apiUrl  = `${apiBase}/api/v1`

// ── Bank Transfer Info Component ─────────────────────────────────────────────
interface BankTransferInfoProps {
  bankDetails: {
    accountName: string
    iban: string
    bic: string
    bankName: string
    bankAddress: string
  }
  onReceiptUploaded?: (file: File) => Promise<void>
  receiptUploaded?: boolean
  uploading?: boolean
  uploadProgress?: number
  uploadError?: string | null
  onRemoveReceipt?: () => void
  onContinue?: () => void
}

const BankTransferInfo = memo(function BankTransferInfo({ 
  bankDetails, 
  onReceiptUploaded, 
  receiptUploaded = false,
  uploading = false,
  uploadProgress = 0,
  uploadError = null,
  onRemoveReceipt,
  onContinue,
}: BankTransferInfoProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image or PDF file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    
    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }

    // Auto-upload when file is selected
    if (onReceiptUploaded) {
      onReceiptUploaded(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onRemoveReceipt) {
      onRemoveReceipt()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#1A1A1F] border border-gray-200/80 dark:border-white/10 ">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0A3269]/5 dark:bg-[#0A3269]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#0A3269]/3 dark:bg-[#0A3269]/8 rounded-full blur-3xl" />
      
      <div className="relative p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#0A3269]/10 to-[#1A4A8A]/10">
            <Landmark className="w-5 h-5 text-[#0A3269] dark:text-[#4A8ABF]" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#0A3269] dark:text-[#4A8ABF]">
              {t('payment.govBankTransfer', 'Government Bank Transfer')}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-white/40">
              {t('payment.transferDetails', 'Transfer the government fee to the account below')}
            </p>
          </div>
        </div>

        {/* Bank Details */}
        <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 rounded-xl p-4 border border-gray-100/50 dark:border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="group">
              <p className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-white/30 font-semibold mb-0.5">
                {t('payment.accountName', 'Account Name')}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-gray-900 dark:text-white/90 truncate">
                  {bankDetails.accountName}
                </span>
                <button
                  onClick={() => copyToClipboard(bankDetails.accountName, 'name')}
                  className="p-1 rounded-lg hover:bg-[#0A3269]/10 dark:hover:bg-[#0A3269]/20 transition-all duration-200"
                >
                  {copied === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-[#0A3269]" />}
                </button>
              </div>
            </div>

            <div className="group">
              <p className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-white/30 font-semibold mb-0.5">
                IBAN
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono font-medium text-gray-900 dark:text-white/90">
                  {bankDetails.iban}
                </span>
                <button
                  onClick={() => copyToClipboard(bankDetails.iban, 'iban')}
                  className="p-1 rounded-lg hover:bg-[#0A3269]/10 dark:hover:bg-[#0A3269]/20 transition-all duration-200"
                >
                  {copied === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-[#0A3269]" />}
                </button>
              </div>
            </div>

            <div className="group">
              <p className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-white/30 font-semibold mb-0.5">
                BIC / Swift
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono font-medium text-gray-900 dark:text-white/90">
                  {bankDetails.bic}
                </span>
                <button
                  onClick={() => copyToClipboard(bankDetails.bic, 'bic')}
                  className="p-1 rounded-lg hover:bg-[#0A3269]/10 dark:hover:bg-[#0A3269]/20 transition-all duration-200"
                >
                  {copied === 'bic' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-[#0A3269]" />}
                </button>
              </div>
            </div>

            <div className="group">
              <p className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-white/30 font-semibold mb-0.5">
                {t('payment.bankName', 'Bank Name')}
              </p>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-gray-400 dark:text-white/40" />
                <span className="text-[12px] font-medium text-gray-900 dark:text-white/90">
                  {bankDetails.bankName}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100/50 dark:border-white/5">
            <p className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-white/30 font-semibold mb-0.5">
              {t('payment.bankAddress', 'Bank Address')}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-white/50">
              {bankDetails.bankAddress}
            </p>
          </div>
        </div>

        {/* Receipt Upload */}
        {onReceiptUploaded && (
          <div className="relative rounded-xl border-2 border-dashed border-[#0A3269]/20 dark:border-[#0A3269]/30 p-5 text-center hover:border-[#0A3269]/50 dark:hover:border-[#0A3269]/60 transition-all duration-300 bg-gray-50/30 dark:bg-white/5">
            {receiptUploaded ? (
              <div className="flex flex-col items-center gap-3 py-3">
                <div className="p-2 rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {t('payment.receiptUploaded', 'Receipt uploaded successfully')}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-white/40">
                    {t('payment.receiptVerified', 'Your receipt has been verified')}
                  </p>
                  {selectedFile && (
                    <div className="flex items-center gap-2 mt-1 justify-center">
                      <span className="text-[10px] text-gray-500 dark:text-white/40">
                        {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </span>
                      <button
                        onClick={handleRemoveFile}
                        className="p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                
                {onContinue && (
                  <Button
                    onClick={onContinue}
                    className="mt-2 bg-[#0A3269] hover:bg-[#1A4A8A] text-white rounded-xl px-6 h-10 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    Continue to Application
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="receipt-upload-premium"
                  ref={fileInputRef}
                  disabled={uploading}
                />
                <label
                  htmlFor="receipt-upload-premium"
                  className="cursor-pointer flex flex-col items-center gap-2 py-4"
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-[#0A3269] animate-spin" />
                        <span className="text-sm text-gray-500 dark:text-white/60">
                          {t('payment.uploading', 'Uploading...')}
                        </span>
                      </div>
                      <div className="w-full max-w-xs">
                        <Progress value={uploadProgress} className="h-1.5" />
                        <span className="text-[10px] text-gray-400 dark:text-white/30 mt-1">
                          {uploadProgress}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 rounded-full bg-[#0A3269]/10 dark:bg-[#0A3269]/20 group-hover:bg-[#0A3269]/20 transition-colors">
                        <Upload className="w-6 h-6 text-[#0A3269] dark:text-[#4A8ABF]" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-white/80">
                        {t('payment.clickToUpload', 'Click to upload receipt')}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-white/30">
                        {t('payment.supportedFormats', 'JPG, PNG, PDF (max 10MB)')}
                      </span>
                    </>
                  )}
                </label>

                {uploadError && (
                  <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {uploadError}
                    </p>
                  </div>
                )}

                {selectedFile && !uploading && !receiptUploaded && (
                  <div className="mt-3 p-2 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      {previewUrl ? (
                        <img 
                          src={previewUrl} 
                          alt="Receipt preview" 
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-white/10"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="text-xs font-medium text-gray-700 dark:text-white/80 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-white/30">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex items-start gap-3 bg-[#F0F7FF] dark:bg-[#0A1628] rounded-xl px-4 py-3.5 border border-[#0A3269]/10 dark:border-[#0A3269]/20">
          <div className="p-1 rounded-full bg-[#0A3269]/10 dark:bg-[#0A3269]/20 shrink-0 mt-0.5">
            <Info className="w-3.5 h-3.5 text-[#0A3269] dark:text-[#4A8ABF]" />
          </div>
          <span className="text-[11px] text-[#0A3269] dark:text-[#7BB8E0] leading-relaxed">
            {t('payment.bankTransferNote', 'After transferring the amount, upload your payment receipt. We will verify it within 24 hours.')}
          </span>
        </div>
      </div>
    </div>
  )
})

// ── Summary Panel ──────────────────────────────────────────────────────────────
interface SummaryPanelProps {
  service?: FlowService
  location: string
  displayFee: number
  otherFee: number
  otherLabel: string
  processingFee: number
  vatAmount: number
  grandTotal: number
  timerStr: string
  expired: boolean
  showBreakdown: boolean
  onToggleBreakdown: () => void
}

const SummaryPanel = memo(function SummaryPanel({
  service, location, displayFee, otherFee, otherLabel,
  processingFee, vatAmount, grandTotal,
  timerStr, expired, showBreakdown, onToggleBreakdown,
}: SummaryPanelProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex-1 rounded-2xl bg-white dark:bg-[#1A1A1F] border border-gray-200/80 dark:border-white/10 p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#0A3269]/10 dark:bg-[#0A3269]/20">
                <FileText className="w-4 h-4 text-[#0A3269] dark:text-[#4A8ABF]" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/40">
                {t('payment.applyingFor', 'Applying for')}
              </p>
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-lg leading-snug">
              {service?.name || 'Visa Service'}
            </p>
          </div>
          {service?.processingTime && (
            <Badge className="shrink-0 flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 border-0 text-gray-600 dark:text-white/60 text-[10px] rounded-full px-3 py-1.5">
              <Clock className="w-3.5 h-3.5" />
              {service.processingTime}
            </Badge>
          )}
        </div>

        <Separator className="bg-gray-100 dark:bg-white/5" />

        <div className="space-y-2.5">
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-gray-500 dark:text-white/60 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-gray-400 dark:text-white/30" />
              {t('payment.serviceFee', 'Service fee')}
              <span className="text-[10px] text-gray-400 dark:text-white/30">({location === 'inside' ? t('payment.insideUae', 'Inside UAE') : t('payment.outsideUae', 'Outside UAE')})</span>
            </span>
            <span className="font-bold text-gray-900 dark:text-white tabular-nums text-[17px]">
              AED {displayFee.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onToggleBreakdown}
            className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 transition-colors ml-1"
          >
            {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {otherLabel} price: AED {otherFee.toLocaleString()}
          </button>

          <AnimatePresence>
            {showBreakdown && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl bg-[#F0F9FF] dark:bg-[#0A1628] border border-[#BAE6FD] dark:border-[#1A3A5C] px-3 py-2.5 text-[11px] text-[#0C4A6E] dark:text-[#7BB8E0] flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#0A3269] dark:text-[#4A8ABF]" />
                  <span>
                    Prices vary based on whether you are currently inside or outside the UAE when applying.
                    Your location was recorded as <strong>{location === 'inside' ? t('payment.insideUae', 'Inside UAE') : t('payment.outsideUae', 'Outside UAE')}</strong>.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between py-1 border-t border-gray-100/50 dark:border-white/5">
            <span className="text-[13px] text-gray-500 dark:text-white/60 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-gray-400 dark:text-white/30" />
              {t('payment.processingFeeLabel', 'Processing fee')}
            </span>
            <span className="text-[13px] font-semibold text-gray-900 dark:text-white tabular-nums">
              AED {processingFee.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-gray-500 dark:text-white/60 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-gray-400 dark:text-white/30" />
              {t('payment.vatLabel', 'VAT (5%)')}
            </span>
            <span className="text-[13px] font-semibold text-gray-900 dark:text-white tabular-nums">
              AED {vatAmount.toLocaleString()}
            </span>
          </div>

          <Separator className="bg-gray-100 dark:bg-white/5" />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[14px] font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#0A3269] dark:text-[#4A8ABF]" />
              {t('payment.total', 'Total')}
            </span>
            <span className="text-2xl font-bold text-[#0A3269] dark:text-white tabular-nums">
              AED {grandTotal.toLocaleString()}
            </span>
          </div>
          <p className="text-[9px] text-gray-400 dark:text-white/30 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {t('payment.govFeesNote', 'Government fees are billed separately after approval')}
          </p>
        </div>
      </div>

      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] ${
        expired 
          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400' 
          : 'bg-[#FFFBEB] dark:bg-[#1A1A0F] border-[#FDE68A] dark:border-[#3A3A1A] text-[#92400E] dark:text-[#E8C84A]'
      }`}>
        <div className="p-1.5 rounded-lg bg-current/10">
          <Clock className="w-5 h-5 shrink-0" />
        </div>
        {expired
          ? t('payment.slotExpired', 'Your slot has expired — please restart your application.')
          : <span>{t('payment.slotReserved', 'Slot reserved for')} <strong className="tabular-nums text-[14px]">{timerStr}</strong></span>
        }
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#1A1A1F] border border-gray-200/80 dark:border-white/10 p-4 space-y-2.5">
        {[
          { icon: Shield, color: 'text-[#0A3269]', text: t('payment.pciDss', 'Powered by Stripe — PCI DSS Level 1') },
          { icon: Lock,   color: 'text-gray-400 dark:text-white/30', text: t('payment.ssl256', '256-bit SSL encryption') },
          { icon: CheckCircle2, color: 'text-[#0A3269]', text: t('payment.approvalRate', '97% approval rate on applications') },
        ].map(({ icon: Icon, color, text }) => (
          <div key={text} className="flex items-center gap-3 text-[12px] text-gray-500 dark:text-white/50">
            <div className={`p-1.5 rounded-lg ${color === 'text-[#0A3269]' ? 'bg-[#0A3269]/10 dark:bg-[#0A3269]/20' : 'bg-gray-100 dark:bg-white/5'}`}>
              <Icon className={`w-4 h-4 shrink-0 ${color}`} />
            </div>
            {text}
          </div>
        ))}
      </div>
    </div>
  )
})

// ── Main PaymentStep ────────────────────────────────────────────────────────
export default function PaymentStep({
  amount,
  applicationId,
  service,
  location = 'inside',
  onSuccess,
  onError,
}: PaymentStepProps) {
  const { t } = useTranslation()
  const [secondsLeft, setSecondsLeft] = useState(600)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [receiptUploaded, setReceiptUploaded] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // 10-minute slot countdown
  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [secondsLeft])

  const minutes  = Math.floor(secondsLeft / 60)
  const seconds  = secondsLeft % 60
  const timerStr = `${minutes}:${String(seconds).padStart(2, '0')}`
  const expired  = secondsLeft <= 0

  const insidePrice  = service?.prices?.find(p => p.priceType?.toLowerCase() === 'inside')?.priceAmount  ?? amount
  const outsidePrice = service?.prices?.find(p => p.priceType?.toLowerCase() === 'outside')?.priceAmount ?? amount
  const displayFee   = location === 'inside' ? insidePrice : outsidePrice
  const otherFee     = location === 'inside' ? outsidePrice : insidePrice
  const otherLabel   = location === 'inside' ? 'Outside UAE' : 'Inside UAE'

  const PROCESSING_FEE = 70
  const subtotal   = displayFee + PROCESSING_FEE
  const vatAmount  = Math.round(subtotal * 0.05)
  const grandTotal = subtotal + vatAmount

  // Stable callback refs
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const stableOnSuccess = useCallback((result: unknown) => onSuccessRef.current(result), [])
  const stableOnError   = useCallback((err: string) => onErrorRef.current(err), [])

  // ─── UPLOAD RECEIPT ──────────────────────────────────────────────────────
  const handleReceiptUpload = useCallback(async (file: File) => {
    setUploading(true)
    setUploadProgress(0)
    setUploadError(null)
    setUploadSuccess(false)
    
    try {
      // Validate applicationId
      if (!applicationId) {
        throw new Error('Application ID is missing. Please refresh and try again.')
      }

      const formData = new FormData()
      formData.append('receipt', file)
      
      const token = localStorage.getItem('authToken') || ''
      
      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // ✅ Use the receipt endpoint
      const endpoint = `${apiUrl}/visa/${applicationId}/receipt`
      
      console.log('📤 Uploading receipt to:', endpoint)
      console.log('📄 File:', file.name, file.size, file.type)
      console.log('📄 Application ID:', applicationId)
      console.log('📄 Token exists:', !!token)
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      
      clearInterval(progressInterval)
      
      let data = {}
      try {
        data = await res.json()
      } catch (e) {
        console.warn('Could not parse JSON response:', e)
      }
      
      console.log('📥 Upload response:', res.status, data)
      
      if (!res.ok) {
        throw new Error(data?.message || data?.error || `Upload failed (${res.status})`)
      }
      
      setUploadProgress(100)
      setReceiptUploaded(true)
      setUploadSuccess(true)
      
      toast.success('Receipt uploaded successfully!', {
        description: 'Your payment receipt has been verified.',
      })
      
    } catch (e: any) {
      const errorMsg = e.message || 'Failed to upload receipt'
      setUploadError(errorMsg)
      console.error('❌ Upload error:', e)
      
      if (e.message.includes('fetch') || e.message.includes('network')) {
        setUploadError('Network error - please check your connection and try again')
      }
      
      toast.error('Upload failed', {
        description: errorMsg,
      })
      onErrorRef.current(errorMsg)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [applicationId])

  const handleRemoveReceipt = useCallback(() => {
    setReceiptUploaded(false)
    setUploadError(null)
    setUploadProgress(0)
    setUploadSuccess(false)
  }, [])

  const handleContinue = useCallback(() => {
    onSuccessRef.current({ 
      receiptUploaded: true,
      applicationId: applicationId,
    })
  }, [applicationId])

  const toggleBreakdown = useCallback(() => setShowBreakdown(b => !b), [])

  const bankDetails = {
    accountName: 'E.A.O FOR MARKETING SERVICES VIA SOCIAL MEDIA',
    iban: 'AE240860000009389202326',
    bic: 'WIOBAEADXXX',
    bankName: 'Etihad Airways Centre 5th Floor',
    bankAddress: 'Abu Dhabi, UAE'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ duration: 0.26 }}
      className="w-full"
    >
      <div className="space-y-1.5 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-gradient-to-b from-[#0A3269] to-[#1A4A8A]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-white/30">
            {t('flow.group.payment', 'Payment')}
          </p>
        </div>
        <h2
          className="font-bold leading-tight text-gray-900 dark:text-white"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}
        >
          {t('payment.completeApplication', 'Complete your application')}
        </h2>
        <p className="text-gray-500 dark:text-white/50 text-[13px]">
          {t('payment.securePayment', 'Secure payment — protected by Stripe')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">
        <SummaryPanel
          service={service}
          location={location}
          displayFee={displayFee}
          otherFee={otherFee}
          otherLabel={otherLabel}
          processingFee={PROCESSING_FEE}
          vatAmount={vatAmount}
          grandTotal={grandTotal}
          timerStr={timerStr}
          expired={expired}
          showBreakdown={showBreakdown}
          onToggleBreakdown={toggleBreakdown}
        />
        
        <BankTransferInfo 
          bankDetails={bankDetails}
          onReceiptUploaded={handleReceiptUpload}
          receiptUploaded={receiptUploaded}
          uploading={uploading}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
          onRemoveReceipt={handleRemoveReceipt}
          onContinue={receiptUploaded ? handleContinue : undefined}
        />
      </div>
    </motion.div>
  )
}