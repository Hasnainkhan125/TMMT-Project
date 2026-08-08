import { useState, useEffect, useRef, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Lock, Clock, CreditCard,
  CheckCircle2, ChevronDown, ChevronUp,
  Landmark, Copy, Check, Building2, Upload, Info,
  DollarSign, Zap, Percent, FileText, X,
  Loader2, AlertCircle, Eye, RefreshCw, ArrowRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { FlowService } from '../ApplicationFlow'
import { toast } from 'sonner'

interface PaymentStepProps {
  amount: number
  applicationId?: string
  service?: FlowService
  location?: string
  onSuccess: (result: unknown) => void
  onError: (err: string) => void
  receipt?: {
    url: string
    status: 'pending' | 'approved' | 'rejected' | null
    uploadedAt: string
    fileName: string
  }
  onReceiptStatusChange?: (status: string) => void
}

const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'
const apiUrl = `${apiBase}/api/v1`

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
  receiptUrl?: string | null
  receiptStatus?: 'pending' | 'approved' | 'rejected' | null
  onViewReceipt?: () => void
  onRetryUpload?: () => void
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
  receiptUrl = null,
  receiptStatus = null,
  onViewReceipt,
  onRetryUpload,
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

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image or PDF file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreviewUrl(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }

    if (onReceiptUploaded) {
      onReceiptUploaded(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (onRemoveReceipt) onRemoveReceipt()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-300' },
    approved: { label: 'Approved', color: 'bg-green-500/10 text-green-600 border-green-300' },
    rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-600 border-red-300' },
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#1A1A1F] border border-gray-200/80 dark:border-white/10">
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
          {receiptStatus && (
            <Badge className={`ml-auto ${statusConfig[receiptStatus]?.color || 'bg-gray-100 text-gray-600'}`}>
              {receiptStatus?.charAt(0).toUpperCase() + receiptStatus?.slice(1)}
            </Badge>
          )}
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
                    {t('payment.receiptVerified', 'Your receipt has been submitted for verification')}
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
                  {receiptUrl ? (
                    <button
                      onClick={onViewReceipt}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#0A3269] dark:text-[#4A8ABF] hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Receipt
                    </button>
                  ) : (
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Receipt URL not available — please contact support</span>
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

                {/* ─── Upload Error Display ────────────────────────────────── */}
                {uploadError && (
                  <div className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 space-y-2">
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="break-words">{uploadError}</span>
                    </p>
                    {onRetryUpload && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetryUpload}
                        className="border-red-300 text-red-600 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30 text-xs rounded-lg px-3 py-1 h-auto"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        Retry Upload
                      </Button>
                    )}
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
  receipt,
  onReceiptStatusChange,
}: PaymentStepProps) {
  const { t } = useTranslation()
  const [secondsLeft, setSecondsLeft] = useState(600)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [receiptUploaded, setReceiptUploaded] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(receipt?.url || null)
  
  // ─── Store the file for retry ──────────────────────────────────────────
  const selectedFileRef = useRef<File | null>(null)

  // 10-minute countdown
  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [secondsLeft])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const timerStr = `${minutes}:${String(seconds).padStart(2, '0')}`
  const expired = secondsLeft <= 0

  const insidePrice = service?.prices?.find(p => p.priceType?.toLowerCase() === 'inside')?.priceAmount ?? amount
  const outsidePrice = service?.prices?.find(p => p.priceType?.toLowerCase() === 'outside')?.priceAmount ?? amount
  const displayFee = location === 'inside' ? insidePrice : outsidePrice
  const otherFee = location === 'inside' ? outsidePrice : insidePrice
  const otherLabel = location === 'inside' ? 'Outside UAE' : 'Inside UAE'

  const PROCESSING_FEE = 70
  const subtotal = displayFee + PROCESSING_FEE
  const vatAmount = Math.round(subtotal * 0.05)
  const grandTotal = subtotal + vatAmount

  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const stableOnSuccess = useCallback((result: unknown) => onSuccessRef.current(result), [])
  const stableOnError = useCallback((err: string) => onErrorRef.current(err), [])

  // ─── UPLOAD RECEIPT ──────────────────────────────────────────────────────
  const uploadReceipt = useCallback(async (file: File) => {
    // Store the file for retry
    selectedFileRef.current = file

    if (!applicationId) {
      const errMsg = 'Application ID is missing. Please refresh and try again.'
      setUploadError(errMsg)
      toast.error(errMsg)
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append('receipt', file)

      const token = localStorage.getItem('authToken') || ''
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      const endpoint = `${apiUrl}/visa/${applicationId}/receipt`
      console.log('📤 Uploading receipt to:', endpoint)

      // ─── Fetch with timeout to catch network errors ──────────────────
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

      let res
      try {
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch (fetchError: any) {
        // This catches network errors, DNS failures, timeouts
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out – please try again.')
        }
        throw new Error(`Network error: ${fetchError.message || 'Unable to reach the server. Check your internet connection.'}`)
      }

      clearInterval(progressInterval)

      // ─── Read response body (even on error) ──────────────────────────
      let responseData
      const contentType = res.headers.get('content-type')
      try {
        if (contentType && contentType.includes('application/json')) {
          responseData = await res.json()
        } else {
          responseData = await res.text()
        }
      } catch (parseError) {
        // If we can't parse the body, we'll just use the status text
        responseData = { message: res.statusText || `HTTP ${res.status}` }
      }

      console.log('📥 Upload response:', res.status, responseData)

      if (!res.ok) {
        // ─── Extract the most meaningful error message ────────────────
        let errorMsg = `Server error (${res.status})`
        if (typeof responseData === 'object' && responseData !== null) {
          errorMsg = responseData.message || responseData.error || responseData.detail || errorMsg
        } else if (typeof responseData === 'string' && responseData.length > 0) {
          errorMsg = responseData
        }
        // If it's a 404 and we still don't have a specific message, give a hint.
        if (res.status === 404 && errorMsg === `Server error (${res.status})`) {
          errorMsg = 'The upload endpoint was not found. Please contact support.'
        }
        // Do NOT override for 500 – we want to show the actual server message
        throw new Error(errorMsg)
      }

      // ✅ Success – extract receipt URL
      const uploadedReceiptUrl = responseData?.data?.receiptUrl || responseData?.receiptUrl || null
      if (!uploadedReceiptUrl) {
        console.warn('⚠️ No receiptUrl returned from server:', responseData)
        // Still consider it a success, but warn the user
        toast.warning('Receipt uploaded, but no URL was returned. Please contact support if you don\'t see it in your dashboard.')
      } else {
        setReceiptUrl(uploadedReceiptUrl)
      }

      setUploadProgress(100)
      setReceiptUploaded(true)
      setUploadSuccess(true)

      toast.success('Receipt uploaded successfully!', {
        description: 'Your payment receipt has been submitted for verification.',
      })

      stableOnSuccess({ receiptUploaded: true, receiptUrl: uploadedReceiptUrl })

    } catch (e: any) {
      // ─── Handle errors ────────────────────────────────────────────────
      let errorMsg = e.message || 'Failed to upload receipt'
      // If the error is a TypeError or contains 'fetch', it's likely a network issue
      if (e.name === 'TypeError' || errorMsg.includes('fetch') || errorMsg.includes('network')) {
        errorMsg = 'Network error – please check your internet connection and try again.'
      }
      setUploadError(errorMsg)
      console.error('❌ Upload error:', e)
      toast.error('Upload failed', { description: errorMsg })
      stableOnError(errorMsg)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [applicationId, stableOnSuccess, stableOnError])

  // ─── Retry upload ──────────────────────────────────────────────────────
  const handleRetryUpload = useCallback(() => {
    if (selectedFileRef.current) {
      uploadReceipt(selectedFileRef.current)
    } else {
      toast.info('Please select a receipt file first.')
    }
  }, [uploadReceipt])

  // ─── Remove receipt ─────────────────────────────────────────────────────
  const handleRemoveReceipt = useCallback(() => {
    setReceiptUploaded(false)
    setUploadError(null)
    setUploadProgress(0)
    setUploadSuccess(false)
    setReceiptUrl(null)
    selectedFileRef.current = null
  }, [])

  // ─── Continue after success ────────────────────────────────────────────
  const handleContinue = useCallback(() => {
    stableOnSuccess({
      receiptUploaded: true,
      applicationId,
      receiptUrl,
    })
  }, [applicationId, receiptUrl, stableOnSuccess])

  const handleViewReceipt = useCallback(() => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank')
    } else if (receipt?.url) {
      window.open(receipt.url, '_blank')
    } else {
      toast.error('Receipt URL is not available. Please contact support.')
    }
  }, [receiptUrl, receipt])

  const toggleBreakdown = useCallback(() => setShowBreakdown(b => !b), [])

  const bankDetails = {
    accountName: 'E.A.O FOR MARKETING SERVICES VIA SOCIAL MEDIA',
    iban: 'AE240860000009389202326',
    bic: 'WIOBAEADXXX',
    bankName: 'Etihad Airways Centre 5th Floor',
    bankAddress: 'Abu Dhabi, UAE',
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
          onReceiptUploaded={uploadReceipt}
          receiptUploaded={receiptUploaded || !!receipt?.url}
          uploading={uploading}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
          onRemoveReceipt={handleRemoveReceipt}
          onContinue={receiptUploaded ? handleContinue : undefined}
          receiptUrl={receiptUrl || receipt?.url || null}
          receiptStatus={receipt?.status || null}
          onViewReceipt={handleViewReceipt}
          onRetryUpload={handleRetryUpload}
        />
      </div>
    </motion.div>
  )
}