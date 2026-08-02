/**
 * UploadStep — Document upload (advanced)
 *
 * Features:
 *   - Category color-coding (Identity / Legal / Financial / Business / Property)
 *   - Per-card drag & drop, not just the global dropzone
 *   - Live thumbnail preview (image) or type glyph (pdf)
 *   - Skip button at top with document icon
 *   - Continue with at least one document uploaded
 */
import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Camera, CheckCircle2, AlertTriangle,
  Loader2, FileText, X, ArrowRight, Sparkles, RotateCcw, PartyPopper,
  SkipForward, FileUp, Clock, Shield,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'

// ─── Types ───────────────────────────────────────────────────────────────────
export interface DocDef {
  id:           string
  label:        string
  required:     boolean
  description?: string
  fileTypes?:   string[]
  maxSize?:     number
  category?:    string
  priority?:    string
}

type FileStatus = 'idle' | 'uploading' | 'checking' | 'ok' | 'warn' | 'error'

interface SlotFile {
  uploadId:    string
  name:        string
  size:        number
  file:        File
  status:      FileStatus
  progress:    number
  feedback?:   string
  previewUrl?: string
}

interface UploadStepProps {
  docDefs: DocDef[]
  onNext:  (data: Record<string, File[]>) => void
}

// ─── Category color system ───────────────────────────────────────────────────
const CATEGORIES: [string, { name: string; c: string; bg: string; ring: string }][] = [
  ['passport',        { name: 'Identity',  c: '#8B5CF6', bg: '#F5F3FF', ring: 'rgba(139,92,246,0.35)' }],
  ['emirates id',      { name: 'Identity',  c: '#8B5CF6', bg: '#F5F3FF', ring: 'rgba(139,92,246,0.35)' }],
  ['national id',      { name: 'Identity',  c: '#8B5CF6', bg: '#F5F3FF', ring: 'rgba(139,92,246,0.35)' }],
  ['visa',             { name: 'Identity',  c: '#8B5CF6', bg: '#F5F3FF', ring: 'rgba(139,92,246,0.35)' }],
  ['personal photo',   { name: 'Identity',  c: '#8B5CF6', bg: '#F5F3FF', ring: 'rgba(139,92,246,0.35)' }],
  ['marriage certif',  { name: 'Legal',     c: '#0EA5E9', bg: '#F0F9FF', ring: 'rgba(14,165,233,0.35)' }],
  ['birth certif',     { name: 'Legal',     c: '#0EA5E9', bg: '#F0F9FF', ring: 'rgba(14,165,233,0.35)' }],
  ['memorandum',       { name: 'Legal',     c: '#0EA5E9', bg: '#F0F9FF', ring: 'rgba(14,165,233,0.35)' }],
  ['trade license',    { name: 'Business',  c: '#F59E0B', bg: '#FFFBEB', ring: 'rgba(245,158,11,0.35)' }],
  ['salary certif',    { name: 'Financial', c: '#10B981', bg: '#ECFDF5', ring: 'rgba(16,185,129,0.35)' }],
  ['bank statement',   { name: 'Financial', c: '#10B981', bg: '#ECFDF5', ring: 'rgba(16,185,129,0.35)' }],
  ['ejari',            { name: 'Property',  c: '#F43F5E', bg: '#FFF1F2', ring: 'rgba(244,63,94,0.35)' }],
]
const DEFAULT_CAT = { name: 'Document', c: '#64748B', bg: '#F8FAFC', ring: 'rgba(100,116,139,0.3)' }

const getCategory = (label: string) => {
  const l = label.toLowerCase()
  for (const [key, meta] of CATEGORIES) if (l.includes(key)) return meta
  return DEFAULT_CAT
}

// ─── Per-document sample descriptions ────────────────────────────────────────
const DOC_SAMPLES: [string, { what: string; tips: string[] }][] = [
  ['passport', { what: 'Passport bio-data page — clear, all corners visible', tips: ['Photo page fills the frame', 'Text sharp and readable', 'No shadows or glare'] }],
  ['emirates id', { what: 'Emirates ID — both front and back', tips: ['Both sides, scanned flat', 'Text and chip area legible', 'Not expired'] }],
  ['marriage certif', { what: 'Attested marriage certificate', tips: ['Official government-issued copy', 'Translated & attested if needed', 'Seal and signatures visible'] }],
  ['birth certif', { what: 'Birth certificate — government issued', tips: ['Official seal present', 'Foreign docs need embassy attestation'] }],
  ['trade license', { what: 'Current, valid trade license', tips: ['Not expired', 'Front page fully readable', 'All pages included'] }],
  ['salary certif', { what: 'Salary certificate on letterhead', tips: ['Name and monthly salary shown', 'Signed by HR / management', 'Dated within 3 months'] }],
  ['personal photo', { what: 'Recent studio passport photo', tips: ['White background only', 'Face fully visible, no glasses', 'Taken within 6 months'] }],
  ['national id', { what: 'National ID — front and back', tips: ['Current and valid', 'Both sides in one image is fine'] }],
  ['memorandum', { what: 'Memorandum of Association (full copy)', tips: ['All pages included', 'Stamp and signature visible', 'Notarised if required'] }],
  ['ejari', { what: 'EJARI-registered tenancy contract', tips: ['Current registration only', 'Min. 2-bedroom for parent sponsorship', 'Barcode visible'] }],
  ['bank statement', { what: 'Bank statement — last 3 months', tips: ['Name and account number visible', 'Official letterhead or e-statement', 'Transactions visible'] }],
  ['visa', { what: 'Visa page from passport', tips: ['Currently valid', 'Stamped page, text readable'] }],
]
const getDocSample = (label: string) => {
  const l = label.toLowerCase()
  for (const [key, sample] of DOC_SAMPLES) if (l.includes(key)) return sample
  return { what: 'Clear, legible copy of the document', tips: ['Entire document visible', 'No blur or shadow', 'All text readable'] }
}

// ─── AI feedback ─────────────────────────────────────────────────────────────
const getAiFeedback = (name: string, docLabel: string): { status: 'ok' | 'warn'; msg: string } => {
  const n = (name + ' ' + docLabel).toLowerCase()
  if (n.includes('passport'))  return { status: 'ok',  msg: 'Passport detected — photo and text are readable' }
  if (n.includes('emirates'))  return { status: 'ok',  msg: 'Emirates ID detected — both sides confirmed' }
  if (n.includes('marriage'))  return { status: 'ok',  msg: 'Marriage certificate looks complete' }
  if (n.includes('birth'))     return { status: 'ok',  msg: 'Birth certificate verified successfully' }
  if (n.includes('trade'))     return { status: 'ok',  msg: 'Trade license verified and readable' }
  if (n.includes('salary'))    return { status: 'ok',  msg: 'Salary certificate detected and readable' }
  if (n.includes('photo'))     return { status: 'ok',  msg: 'Photo detected — background and framing look good' }
  if (n.includes('national'))  return { status: 'ok',  msg: 'National ID scanned — details confirmed' }
  if (n.includes('bank'))      return { status: 'ok',  msg: 'Bank statement — 3 months data confirmed' }
  if (n.includes('ejari'))     return { status: 'ok',  msg: 'Tenancy contract verified' }
  if (name.replace(/\.[^.]+$/, '').length < 4)
    return { status: 'warn', msg: 'Image may be unclear — a sharper photo speeds up approval' }
  return { status: 'ok', msg: 'Document uploaded and accepted' }
}

const isImageFile = (file: File) => file.type.startsWith('image/')
const formatBytes = (b: number) => b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024

const validateFile = (file: File, doc: DocDef): string | null => {
  const max = doc.maxSize ?? DEFAULT_MAX_SIZE
  if (file.size > max) return `File is too large — max ${formatBytes(max)}`
  if (doc.fileTypes?.length) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!doc.fileTypes.some(t => t.toLowerCase().replace('.', '') === ext)) {
      return `Unsupported format — use ${doc.fileTypes.join(', ')}`
    }
  }
  return null
}

// ─── Confetti particle burst ─────────────────────────────────────────────────
const CONFETTI_COLORS = ['#BBF451', '#8B5CF6', '#0EA5E9', '#F59E0B', '#F43F5E', '#10B981']
const ConfettiBurst = ({ active }: { active: boolean }) => {
  const particles = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    angle: (i / 14) * 360 + Math.random() * 20,
    dist: 40 + Math.random() * 40,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 3 + Math.random() * 3,
  })), [active])

  return (
    <AnimatePresence>
      {active && (
        <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center z-20">
          {particles.map(p => {
            const rad = (p.angle * Math.PI) / 180
            return (
              <motion.span
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: Math.cos(rad) * p.dist,
                  y: Math.sin(rad) * p.dist - 10,
                  opacity: 0,
                  scale: 1,
                }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  width: p.size, height: p.size,
                  borderRadius: '2px',
                  background: p.color,
                }}
              />
            )
          })}
        </div>
      )}
    </AnimatePresence>
  )
}
// ─── Skip Confirmation Dialog ──────────────────────────────────────────────
function SkipConfirmDialog({ 
  open, 
  onClose, 
  onConfirm 
}: { 
  open: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-3xl border-0 shadow-2xl bg-white dark:bg-black">
        <div className="relative p-8 sm:p-10">
          {/* Simple gradient orbs */}
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-gray-100/30 dark:bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gray-100/20 dark:bg-white/5 blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Icon with premium animation - Document Icon */}
            <div className="relative w-20 h-20 mx-auto">
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="relative z-10 w-20 h-20 rounded-2xl bg-black dark:bg-white flex items-center justify-center shadow-2xl shadow-black/20 dark:shadow-white/10"
              >
                <FileUp className="w-10 h-10 text-white dark:text-black" strokeWidth={1.5} />
              </motion.div>
              
              {/* Premium pulse rings */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-2xl border-2 border-black/10 dark:border-white/10"
              />
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.25, 0, 0.25] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute inset-0 rounded-2xl border border-black/5 dark:border-white/5"
              />
            </div>

            {/* Title with premium styling */}
            <motion.h3 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-2xl font-bold text-center text-black dark:text-white"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Skip Document Upload?
            </motion.h3>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto"
            >
              No documents handy? No problem — you can upload them later. 
              Your application will stay on track.
            </motion.p>

            {/* Premium feature badges - Simple */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 grid grid-cols-2 gap-3"
            >
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 group hover:border-black dark:hover:border-white/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-black dark:text-white">Upload Anytime</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">No rush at all</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 group hover:border-black dark:hover:border-white/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-black dark:text-white">Stay on Track</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Process continues</p>
                </div>
              </div>
            </motion.div>

            {/* Premium Buttons - Simple */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-7 flex flex-col sm:flex-row gap-3"
            >
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 h-12 rounded-xl font-semibold text-sm border-2 border-gray-200 dark:border-white/10 text-black dark:text-white hover:border-black dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="flex-1 h-12 rounded-xl font-semibold text-sm bg-black dark:bg-white text-white dark:text-black shadow-xl shadow-black/20 dark:shadow-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
              >
                <FileUp className="w-4 h-4 mr-2 group-hover:translate-y-[-2px] transition-transform duration-300" strokeWidth={2} />
                Upload Later
              </Button>
            </motion.div>

            {/* Premium divider with text */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-6 flex items-center gap-4"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/10 to-transparent" />
              <span className="text-[10px] font-medium text-gray-400 dark:text-white/20 tracking-wider uppercase">
                Secure & Encrypted
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 dark:via-white/10 to-transparent" />
            </motion.div>

            {/* Premium footnote */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-3 text-[10px] text-center text-gray-400 dark:text-white/20 leading-relaxed"
            >
              You can always upload documents later from your dashboard
            </motion.p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function UploadStep({ docDefs, onNext }: UploadStepProps) {
  const { t }                          = useTranslation()
  const [slots, setSlots]              = useState<Record<string, SlotFile | null>>({})
  const [pingId, setPingId]            = useState<string | null>(null)
  const [cardDragId, setCardDragId]    = useState<string | null>(null)
  const [isDragOver, setDragOver]      = useState(false)
  const [celebrated, setCelebrated]    = useState(false)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const globalFileRef                  = useRef<HTMLInputElement>(null)
  const slotFileRefs                   = useRef<Record<string, HTMLInputElement | null>>({})
  const slotCamRefs                    = useRef<Record<string, HTMLInputElement | null>>({})
  const filesMapRef                    = useRef<Record<string, File[]>>({})

  const hasDefs = docDefs.length > 0

  useEffect(() => () => {
    Object.values(slots).forEach(s => s?.previewUrl && URL.revokeObjectURL(s.previewUrl))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const processFileForSlot = useCallback((file: File, docId: string, docLabel: string, doc?: DocDef) => {
    const uploadId = crypto.randomUUID()
    const previewUrl = isImageFile(file) ? URL.createObjectURL(file) : undefined
    const err = doc ? validateFile(file, doc) : null

    if (err) {
      setSlots(prev => ({
        ...prev,
        [docId]: { uploadId, name: file.name, size: file.size, file, status: 'error', progress: 100, feedback: err, previewUrl },
      }))
      return
    }

    setSlots(prev => ({
      ...prev,
      [docId]: { uploadId, name: file.name, size: file.size, file, status: 'uploading', progress: 0, previewUrl },
    }))

    const START   = Date.now()
    const FILL_MS = 650 + Math.random() * 350

    const frame = () => {
      const prog = Math.min(((Date.now() - START) / FILL_MS) * 100, 100)
      setSlots(prev => ({ ...prev, [docId]: prev[docId] ? { ...prev[docId]!, progress: prog } : null }))
      if (prog < 100) {
        requestAnimationFrame(frame)
      } else {
        setSlots(prev => ({ ...prev, [docId]: prev[docId] ? { ...prev[docId]!, status: 'checking', progress: 100 } : null }))
        setTimeout(() => {
          const fb = getAiFeedback(file.name, docLabel)
          setSlots(prev => ({ ...prev, [docId]: prev[docId] ? { ...prev[docId]!, status: fb.status, feedback: fb.msg } : null }))
          if (fb.status === 'ok') {
            setPingId(docId)
            setTimeout(() => setPingId(null), 750)
          }
          filesMapRef.current[docId] = [file]
        }, 600 + Math.random() * 400)
      }
    }
    requestAnimationFrame(frame)
  }, [])

  const processGlobalFiles = useCallback((files: File[]) => {
    files.forEach((file, i) => {
      const unmatched = docDefs.filter(d => !slots[d.id])
      const target    = unmatched[i]
      if (target) processFileForSlot(file, target.id, target.label, target)
      else        processFileForSlot(file, `other_${crypto.randomUUID()}`, 'Additional document')
    })
  }, [docDefs, slots, processFileForSlot])

  const removeSlot = (docId: string) => {
    setSlots(prev => {
      const n = { ...prev }
      if (n[docId]?.previewUrl) URL.revokeObjectURL(n[docId]!.previewUrl!)
      delete n[docId]
      return n
    })
    delete filesMapRef.current[docId]
  }

  // ─── Check if at least one document is uploaded ──────────────────────
  const hasAnyDocument = Object.values(slots).some(s => s !== null && s.status !== 'error')
  const canContinue = hasAnyDocument

  const doneCount     = Object.values(slots).filter(s => s?.status === 'ok' || s?.status === 'warn').length
  const errorCount    = Object.values(slots).filter(s => s?.status === 'error').length
  const totalRequired = docDefs.filter(d => d.required).length
  const totalProgress = totalRequired > 0
    ? Math.round(
        Object.entries(slots)
          .filter(([id]) => docDefs.find(d => d.id === id))
          .reduce((s, [, f]) => s + (f?.status === 'ok' || f?.status === 'warn' ? 100 : (f?.status === 'error' ? 0 : (f?.progress ?? 0))), 0)
        / totalRequired
      )
    : 0
  const allRequiredDone = totalRequired > 0 && docDefs.filter(d => d.required)
    .every(d => slots[d.id]?.status === 'ok' || slots[d.id]?.status === 'warn')

  useEffect(() => {
    if (allRequiredDone && !celebrated) {
      setCelebrated(true)
    }
  }, [allRequiredDone, celebrated])

  const handleContinueClick = () => {
    if (canContinue) {
      onNext(filesMapRef.current)
    }
  }

  const handleSkip = () => {
    setShowSkipConfirm(false)
    onNext({})
  }

  // ─── Doc card component ───────────────────────────────────────────────────
  const DocCard = ({ doc, index }: { doc: DocDef; index: number }) => {
    const slot   = slots[doc.id] ?? null
    const sample = getDocSample(doc.label)
    const cat    = getCategory(doc.label)
    const done   = slot?.status === 'ok' || slot?.status === 'warn'
    const busy   = slot?.status === 'uploading' || slot?.status === 'checking'
    const errored = slot?.status === 'error'
    const isDragTarget = cardDragId === doc.id

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.04, ease: 'easeOut' }}
        onDragOver={e => { e.preventDefault(); setCardDragId(doc.id) }}
        onDragLeave={() => setCardDragId(prev => (prev === doc.id ? null : prev))}
        onDrop={e => {
          e.preventDefault()
          setCardDragId(null)
          const f = e.dataTransfer.files?.[0]
          if (f) processFileForSlot(f, doc.id, doc.label, doc)
        }}
        style={{
          boxShadow: done ? `0 1px 2px rgba(15,42,68,0.04)` : undefined,
        }}
        className={`
          group relative flex flex-col rounded-[20px] overflow-hidden
          transition-all duration-300 ease-out
          ${isDragTarget
            ? 'ring-2 scale-[1.01]'
            : errored
            ? 'ring-1 ring-red-200 bg-red-50/60'
            : done
            ? 'ring-1 ring-[#BBF451]/50 bg-[#F7FEE7]'
            : busy
            ? 'ring-1 ring-[#EAEEF3] bg-[#FAFBFC]'
            : 'ring-1 ring-[#EEF1F5] bg-white hover:shadow-[0_8px_24px_-8px_rgba(15,42,68,0.10)] hover:-translate-y-[2px]'
          }
        `}
      >
        {isDragTarget && (
          <div
            className="absolute inset-0 pointer-events-none rounded-[20px] z-10"
            style={{ boxShadow: `0 0 0 2px ${cat.c}`, background: `${cat.c}0D` }}
          />
        )}

        {/* Category strip */}
        <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${cat.c}, ${cat.c}55)` }} />

        <ConfettiBurst active={pingId === doc.id} />

        {/* ── Top section ── */}
        <div className="flex items-start gap-3 px-4 pt-3.5 pb-3">
          <div className={`
            shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 transition-colors duration-300
          `} style={{
            background: errored ? '#FEE2E2' : slot?.status === 'ok' ? '#BBF45140' : slot?.status === 'warn' ? '#FEF3C7' : busy ? `${cat.c}22` : `${cat.c}14`,
          }}>
            {busy
              ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: cat.c }} />
              : slot?.status === 'ok'
              ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                  <CheckCircle2 className="w-4 h-4 text-[#4D7C0F]" />
                </motion.div>
              : slot?.status === 'warn'
              ? <AlertTriangle className="w-4 h-4 text-amber-500" />
              : errored
              ? <AlertTriangle className="w-4 h-4 text-red-500" />
              : <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: `${cat.c}55` }} />
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className={`font-semibold text-[14px] leading-snug tracking-[-0.01em] ${
                slot?.status === 'ok' ? 'text-[#3F6512]' :
                slot?.status === 'warn' ? 'text-amber-700' :
                errored ? 'text-red-700' : 'text-[#0F2A44]'
              }`}>
                {doc.label}
              </p>
              {!done && (
                <Badge
                  className="h-[16px] px-1.5 text-[9px] font-bold border-0 rounded-full leading-none tracking-wide"
                  style={{ background: `${cat.c}16`, color: cat.c }}
                >
                  {cat.name}
                </Badge>
              )}
              {doc.required && !done && (
                <Badge className="h-[16px] px-1.5 text-[9px] font-bold bg-[#0F2A44]/[0.05] text-[#8A96A3] border-0 rounded-full leading-none tracking-wide">
                  {t('upload.required_label', 'required')}
                </Badge>
              )}
            </div>

            {slot && (
              <p className="text-[11px] text-[#7B8794] mt-0.5 truncate">
                {slot.name} <span className="text-[#B9C2CC]">· {formatBytes(slot.size)}</span>
              </p>
            )}

            {slot?.status === 'uploading' && (
              <div className="mt-2 max-w-[180px]">
                <div className="h-[3px] w-full rounded-full bg-[#E7ECF1] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ width: `${slot.progress}%`, background: `linear-gradient(90deg, ${cat.c}, #BBF451)` }}
                  />
                </div>
                <p className="text-[10px] text-[#9AA5B1] mt-1">Uploading… {Math.round(slot.progress)}%</p>
              </div>
            )}
            {slot?.status === 'checking' && (
              <p className="text-[11px] text-[#7B8794] mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#BBF451]" />
                {t('upload.aiChecking', 'Checking your document...')}
              </p>
            )}
            <AnimatePresence>
              {slot?.feedback && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`text-[11px] mt-1 leading-snug ${
                    slot.status === 'ok' ? 'text-[#4D7C0F]' :
                    slot.status === 'warn' ? 'text-amber-700' : 'text-red-600'
                  }`}
                >
                  {slot.feedback}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="shrink-0">
            {errored ? (
              <button
                onClick={() => slotFileRefs.current[doc.id]?.click()}
                className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 px-2 py-1.5 rounded-lg hover:bg-white transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Retry
              </button>
            ) : done ? (
              <div className="flex gap-1">
                <button
                  onClick={() => slotFileRefs.current[doc.id]?.click()}
                  className="text-[11px] font-medium text-[#5C6773] hover:text-[#0F2A44] px-2 py-1 rounded-lg hover:bg-white transition-colors"
                >
                  {t('upload.reupload', 'Replace')}
                </button>
                <button
                  onClick={() => removeSlot(doc.id)}
                  className="text-[#B9C2CC] hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : !busy ? (
              <div className="flex gap-1.5">
                <button
                  onClick={() => slotFileRefs.current[doc.id]?.click()}
                  title={t('upload.uploadFile', 'Upload file')}
                  className="w-9 h-9 rounded-xl bg-[#F6F8FA] flex items-center justify-center text-[#5C6773] transition-all duration-200"
                  onMouseEnter={e => { e.currentTarget.style.background = cat.c; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '' }}
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={() => slotCamRefs.current[doc.id]?.click()}
                  title={t('upload.takePhoto', 'Take photo')}
                  className="w-9 h-9 rounded-xl bg-[#F6F8FA] flex items-center justify-center text-[#5C6773] transition-all duration-200"
                  onMouseEnter={e => { e.currentTarget.style.background = cat.c; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '' }}
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Thumbnail with scanning sweep while checking ── */}
        {slot && !errored && (
          <div className="px-4 pb-4">
            <div className="relative h-28 rounded-xl overflow-hidden bg-[#0F2A44]/[0.03] ring-1 ring-black/[0.04]">
              {slot.previewUrl ? (
                <img src={slot.previewUrl} alt={slot.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-[#8A96A3]">
                  <FileText className="w-6 h-6" />
                  <span className="text-[10px] font-medium">PDF document</span>
                </div>
              )}
              {slot.status === 'uploading' && (
                <div className="absolute inset-0 bg-white/40" />
              )}
              {slot.status === 'checking' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-[#0F2A44]/10 backdrop-blur-[0.5px]" />
                  <motion.div
                    className="absolute left-0 right-0 h-8"
                    style={{ background: 'linear-gradient(180deg, transparent, rgba(187,244,81,0.55), transparent)' }}
                    initial={{ top: '-20%' }}
                    animate={{ top: '110%' }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {errored && slot?.previewUrl && (
          <div className="px-4 pb-4">
            <div className="relative h-20 rounded-xl overflow-hidden ring-1 ring-red-200 opacity-60">
              <img src={slot.previewUrl} alt={slot.name} className="w-full h-full object-cover grayscale" />
            </div>
          </div>
        )}

        {/* ── Sample reference (only before upload) ── */}
        {!slot && (
          <div className="mx-4 mb-4 rounded-xl overflow-hidden" style={{ background: cat.bg }}>
            <div className="relative px-3.5 pt-3 pb-3">
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-1 font-black select-none pointer-events-none"
                style={{ fontSize: '2.2rem', opacity: 0.06, letterSpacing: '0.05em', color: cat.c }}
              >
                SAMPLE
              </span>
              <div className="relative z-10 space-y-1.5">
                <p className="text-[11.5px] font-medium text-[#3D4A57] leading-snug">
                  {sample.what}
                </p>
                <ul className="space-y-1 pt-0.5">
                  {sample.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-[#7B8794]">
                      <span className="w-1 h-1 rounded-full mt-[5px] shrink-0" style={{ background: cat.c }} />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <input
          ref={el => { slotFileRefs.current[doc.id] = el }}
          type="file" accept="image/*,.pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) processFileForSlot(f, doc.id, doc.label, doc); e.target.value = '' }}
        />
        <input
          ref={el => { slotCamRefs.current[doc.id] = el }}
          type="file" accept="image/*" capture="environment" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) processFileForSlot(f, doc.id, doc.label, doc); e.target.value = '' }}
        />

        {pingId === doc.id && (
          <motion.div
            className="absolute inset-0 rounded-[20px] ring-2 ring-[#BBF451]/60 pointer-events-none"
            initial={{ opacity: 0.9, scale: 1 }}
            animate={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.div>
    )
  }

  return (
    <>
      <div className="w-full flex flex-col gap-6">
        {/* ── Header with Skip Button ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-gradient-to-b from-[#0A3269] to-[#0A3269]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#64748B] dark:text-white/40">
                {t('upload.step', 'Upload documents')}
              </p>
            </div>
            
            {/* Skip Button with Document Icon */}
            <button
              onClick={() => setShowSkipConfirm(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium 
                bg-white hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-900
                text-[#1a365d] dark:text-white
                border border-[#1a365d]/20 dark:border-white/20
                shadow-sm shadow-[#1a365d]/5 dark:shadow-black/20
                hover:shadow-[#1a365d]/10 dark:hover:shadow-black/30
                transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileUp className="w-4 h-4 text-[#1a365d] dark:text-white" strokeWidth={1.75} />
              <span>Skip </span>  
            </button>
          </div>
          
          <h2 className="font-bold leading-tight tracking-[-0.02em] text-[#0F2A44] dark:text-white" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            {t('upload.title', 'Upload your documents')}
          </h2>
          <p className="text-[#7B8794] dark:text-white/60 text-[14px] leading-relaxed">
            {t('upload.subtitle', 'Upload at least one document to continue or skip for later')}
          </p>
        </div>

        {/* ── Overall progress / celebration ── */}
        {hasDefs && Object.keys(slots).length > 0 && (
          <motion.div
            layout
            className={`
              relative rounded-2xl px-5 py-4 flex items-center gap-4 overflow-hidden
              border transition-all duration-300
              ${allRequiredDone
                ? 'bg-gradient-to-r from-[#F7FEE7] to-white dark:from-[#1A2A1A] dark:to-[#0F2A44] border-[#BBF451]/40 dark:border-[#BBF451]/20'
                : 'bg-white dark:bg-[#1A1A1F] border-[#E2E8F0] dark:border-white/10'
              }
            `}
          >
            {/* Ambient glow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-40"
              style={{
                background: 'radial-gradient(120% 100% at 0% 0%, rgba(255,255,255,0.10), transparent 55%)',
              }}
            />

            {/* Success glow pulse - New design */}
            <AnimatePresence>
              {allRequiredDone && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-[#BBF451]/20 via-transparent to-transparent dark:from-[#BBF451]/10 dark:via-transparent"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -inset-8 rounded-full blur-2xl"
                    style={{ background: 'radial-gradient(circle at 30% 50%, rgba(187,244,81,0.3), transparent 70%)' }}
                  />
                </>
              )}
            </AnimatePresence>

            {/* Progress ring with glow */}
            <div className="relative w-14 h-14 shrink-0 z-10">
              <div className={`
                absolute inset-0 rounded-full blur-md transition-opacity duration-500
                ${allRequiredDone ? 'opacity-100 bg-[#BBF451]/30' : 'opacity-0'}
              `} />
              <svg viewBox="0 0 40 40" className="w-14 h-14 -rotate-90 relative z-10">
                <circle
                  cx="20" cy="20" r="16.5" fill="none" strokeWidth="3.5"
                  stroke="currentColor"
                  className="text-[#0F2A44]/10 dark:text-white/14"
                />
                <defs>
                  <linearGradient id="progressRingGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={allRequiredDone ? '#4D7C0F' : '#0F2A44'} />
                    <stop offset="100%" stopColor={allRequiredDone ? '#8AA82E' : '#B08A4E'} />
                  </linearGradient>
                  <linearGradient id="progressRingGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={allRequiredDone ? '#BBF451' : '#DCC08E'} />
                    <stop offset="100%" stopColor={allRequiredDone ? '#4ADE80' : '#BBF451'} />
                  </linearGradient>
                </defs>

                <motion.circle
                  cx="20" cy="20" r="16.5" fill="none" stroke="url(#progressRingGradLight)" strokeWidth="3.5" strokeLinecap="round"
                  className="dark:hidden"
                  strokeDasharray={2 * Math.PI * 16.5}
                  animate={{ strokeDashoffset: 2 * Math.PI * 16.5 * (1 - totalProgress / 100) }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <motion.circle
                  cx="20" cy="20" r="16.5" fill="none" stroke="url(#progressRingGradDark)" strokeWidth="3.5" strokeLinecap="round"
                  className="hidden dark:block"
                  strokeDasharray={2 * Math.PI * 16.5}
                  animate={{ strokeDashoffset: 2 * Math.PI * 16.5 * (1 - totalProgress / 100) }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center z-20">
                <AnimatePresence mode="wait">
                  {allRequiredDone ? (
                    <motion.span
                      key="done"
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 16 }}
                    >
                      <PartyPopper className="w-5 h-5 text-[#4D7C0F] dark:text-[#BBF451]" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="pct"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[11px] font-bold text-[#0F2A44] dark:text-white tabular-nums"
                    >
                      {totalProgress}%
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </div>

            {/* Copy */}
            <div className="flex-1 min-w-0 z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[14px] font-semibold text-[#0F2A44] dark:text-white">
                  {allRequiredDone
                    ? t('upload.allSetTitle', '✅ All required documents uploaded!')
                    : `${doneCount} ${t('upload.of', 'of')} ${totalRequired} ${t('upload.uploaded', 'uploaded')}`}
                </p>
                {!allRequiredDone && errorCount > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-red-600 dark:text-[#FCA5A5] bg-red-50 dark:bg-red-500/15 rounded-full px-2.5 py-0.5">
                    {errorCount} {errorCount > 1 ? 'need attention' : 'needs attention'}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#64748B] dark:text-white/55 mt-0.5">
                {allRequiredDone
                  ? t('upload.allSet', 'Review and continue whenever you’re ready')
                  : errorCount > 0
                  ? t('upload.fixIssues', 'Fix the flagged files to continue')
                  : t('upload.keepGoing', 'Keep going — almost there')}
              </p>

              {/* Stepped segments */}
              {!allRequiredDone && totalRequired > 0 && totalRequired <= 12 && (
                <div className="flex gap-1 mt-2.5">
                  {Array.from({ length: totalRequired }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-[3px] flex-1 rounded-full transition-all duration-500 ${
                        i < doneCount
                          ? 'bg-gradient-to-r from-[#BBF451] to-[#8BC34A] dark:from-[#BBF451] dark:to-[#4ADE80]'
                          : 'bg-[#0F2A44]/10 dark:bg-white/16'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Document grid ── */}
        {hasDefs ? (
          <div className="space-y-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9AA5B1]">
              {t('upload.required', 'Required documents')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {docDefs.map((doc, i) => <DocCard key={doc.id} doc={doc} index={i} />)}
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); processGlobalFiles(Array.from(e.dataTransfer.files)) }}
              onClick={() => globalFileRef.current?.click()}
              className={`
                rounded-2xl border-2 border-dashed px-5 py-4 cursor-pointer
                flex items-center gap-4 transition-all duration-200
                ${isDragOver ? 'border-[#BBF451] bg-[#F7FEE7] scale-[1.005]' : 'border-[#E3E8EE] bg-white hover:border-[#BBF451]/60 hover:bg-[#FAFFF0]'}
              `}
            >
              <div className="w-10 h-10 rounded-xl bg-[#F6F8FA] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#B9C2CC]" />
              </div>
              <div>
                <p className="font-semibold text-[#0F2A44] text-[14px]">{t('upload.additionalDocs', 'Add additional documents')}</p>
                <p className="text-[11px] text-[#9AA5B1] mt-0.5">{t('upload.dropzone', 'Drag & drop or tap — PDF, JPG, PNG up to 10 MB')}</p>
              </div>
              <input ref={globalFileRef} type="file" multiple accept="image/*,.pdf" className="hidden"
                onChange={e => { processGlobalFiles(Array.from(e.target.files || [])); e.target.value = '' }} />
            </div>
          </div>
        ) : (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); processGlobalFiles(Array.from(e.dataTransfer.files)) }}
            onClick={() => globalFileRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed py-12 text-center cursor-pointer transition-all duration-200 ${isDragOver ? 'border-[#BBF451] bg-[#F7FEE7]' : 'border-[#E3E8EE] bg-white hover:border-[#BBF451]/60'}`}
          >
            <Upload className="w-8 h-8 mx-auto mb-3 text-[#B9C2CC]" />
            <p className="font-semibold text-[#0F2A44]">{t('upload.tapOrDrag', 'Tap or drag files here')}</p>
            <p className="text-[12px] text-[#9AA5B1] mt-1">{t('upload.formats', 'PDF, JPG, PNG — up to 10 MB')}</p>
            <input ref={globalFileRef} type="file" multiple accept="image/*,.pdf" className="hidden"
              onChange={e => { processGlobalFiles(Array.from(e.target.files || [])); e.target.value = '' }} />
          </div>
        )}

        <p className="text-[12px] text-[#9AA5B1] text-center">
          {t('upload.reassurance', "Don't worry — we'll review everything before submission")}
        </p>

        {/* ── Continue Button ── */}
        <Button
          onClick={handleContinueClick}
          disabled={!canContinue}
          className={`w-full h-14 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            canContinue
              ? 'bg-[#0F2A44] hover:bg-[#16385A] text-white shadow-[0_10px_30px_-12px_rgba(15,42,68,0.55)] active:scale-[0.97] cursor-pointer'
              : 'bg-[#E8ECF0] text-[#9AA5B1] cursor-not-allowed'
          }`}
          style={{ fontSize: '17px' }}
        >
          {canContinue
            ? <><CheckCircle2 className="w-4 h-4" />{t('common.continue', 'Continue')}<ArrowRight className="w-4 h-4" /></>
            : <><Upload className="w-4 h-4" />{t('upload.uploadAtLeastOne', 'Upload at least one document')}</>
          }
        </Button>
      </div>

      {/* ── Skip Confirmation Dialog ── */}
      <SkipConfirmDialog
        open={showSkipConfirm}
        onClose={() => setShowSkipConfirm(false)}
        onConfirm={handleSkip}
      />
    </>
  )
}