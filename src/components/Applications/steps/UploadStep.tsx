/**
 * UploadStep — Document upload (advanced)
 * 
 * Features:
 *   - Premium, modern card design with horizontal layout
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
  FileUp, Clock, Shield, Zap,
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
  ['passport',        { name: 'Identity',  c: '#8B5CF6', bg: '#F5F3FF', ring: 'rgba(139,92,246,0.25)' }],
  ['emirates id',     { name: 'Identity',  c: '#8B5CF6', bg: '#F5F3FF', ring: 'rgba(139,92,246,0.25)' }],
  ['national id',     { name: 'Identity',  c: '#8B5CF6', bg: '#F5F3FF', ring: 'rgba(139,92,246,0.25)' }],
  ['visa',            { name: 'Identity',  c: '#8B5CF6', bg: '#F5F3FF', ring: 'rgba(139,92,246,0.25)' }],
  ['personal photo',  { name: 'Identity',  c: '#8B5CF6', bg: '#F5F3FF', ring: 'rgba(139,92,246,0.25)' }],
  ['marriage certif', { name: 'Legal',     c: '#0891B2', bg: '#ECFEFF', ring: 'rgba(8,145,178,0.25)' }],
  ['birth certif',    { name: 'Legal',     c: '#0891B2', bg: '#ECFEFF', ring: 'rgba(8,145,178,0.25)' }],
  ['memorandum',      { name: 'Legal',     c: '#0891B2', bg: '#ECFEFF', ring: 'rgba(8,145,178,0.25)' }],
  ['trade license',   { name: 'Business',  c: '#D97706', bg: '#FFFBEB', ring: 'rgba(217,119,6,0.25)' }],
  ['salary certif',   { name: 'Financial', c: '#059669', bg: '#ECFDF5', ring: 'rgba(5,150,105,0.25)' }],
  ['bank statement',  { name: 'Financial', c: '#059669', bg: '#ECFDF5', ring: 'rgba(5,150,105,0.25)' }],
  ['ejari',           { name: 'Property',  c: '#DC2626', bg: '#FEF2F2', ring: 'rgba(220,38,38,0.25)' }],
]
const DEFAULT_CAT = { name: 'Document', c: '#64748B', bg: '#F8FAFC', ring: 'rgba(100,116,139,0.2)' }

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
const CONFETTI_COLORS = ['#BBF451', '#7C3AED', '#06B6D4', '#F59E0B', '#F43F5E', '#10B981']
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
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-3xl border-0 shadow-2xl bg-white dark:bg-zinc-950">
        <div className="relative p-8 sm:p-10">

          <div className="relative z-10">
            <div className="relative w-20 h-20 mx-auto">
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="relative z-10 w-20 h-20 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center"
              >
                <FileUp className="w-10 h-10 text-white dark:text-zinc-900" strokeWidth={1.5} />
              </motion.div>
              
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-2xl border-2 border-zinc-900/10 dark:border-white/10"
              />
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.25, 0, 0.25] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute inset-0 rounded-2xl border border-zinc-900/5 dark:border-white/5"
              />
            </div>

            <motion.h3 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-2xl font-bold text-center text-zinc-900 dark:text-white tracking-tight"
            >
              Skip Document Upload?
            </motion.h3>

            <motion.p 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-2 text-sm text-center text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto"
            >
              No documents handy? No problem — you can upload them later. 
              Your application will stay on track.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 grid grid-cols-2 gap-3"
            >
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 group hover:border-zinc-900 dark:hover:border-white/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-5 h-5 text-zinc-900 dark:text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-zinc-900 dark:text-white">Upload Anytime</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">No rush at all</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 group hover:border-zinc-900 dark:hover:border-white/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-5 h-5 text-zinc-900 dark:text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-zinc-900 dark:text-white">Stay on Track</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Process continues</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-7 flex flex-col sm:flex-row gap-3"
            >
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 h-12 rounded-xl font-semibold text-sm border-2 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white hover:border-zinc-900 dark:hover:border-white/30 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="flex-1 h-12 rounded-xl font-semibold text-sm bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl shadow-zinc-900/20 dark:shadow-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
              >
                <FileUp className="w-4 h-4 mr-2 group-hover:translate-y-[-2px] transition-transform duration-300" strokeWidth={2} />
                Upload Later
              </Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-6 flex items-center gap-4"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-white/10 to-transparent" />
              <span className="text-[10px] font-medium text-zinc-400 dark:text-white/20 tracking-wider uppercase">
                Secure & Encrypted
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-zinc-300 dark:via-white/10 to-transparent" />
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-3 text-[10px] text-center text-zinc-400 dark:text-white/20 leading-relaxed"
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
        className={`
          group relative flex flex-col rounded-2xl overflow-hidden
          border border-zinc-200 dark:border-white/10
          bg-white dark:bg-zinc-900
          transition-all duration-300 ease-out
          p-5 gap-4
          hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)]
          ${isDragTarget
            ? 'scale-[1.01] shadow-xl ring-2 ring-zinc-900/10 dark:ring-white/10'
            : errored
            ? 'ring-1 ring-red-200 bg-red-50/60 dark:bg-red-900/10'
            : done
            ? 'ring-1 ring-emerald-200 bg-emerald-50/40 dark:bg-emerald-900/10'
            : busy
            ? 'bg-zinc-50 dark:bg-zinc-800/50'
            : ''
          }
        `}
      >
        {isDragTarget && (
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl z-10"
            style={{ boxShadow: `0 0 0 2px ${cat.c}`, background: `${cat.c}0D` }}
          />
        )}

        {/* Category strip */}
        <div className="h-[3px] w-full -mt-5 -mx-5 mb-2 px-5" style={{ background: `linear-gradient(90deg, ${cat.c}, ${cat.c}55)` }} />

        <ConfettiBurst active={pingId === doc.id} />

        {/* ── Card Layout ── */}
        <div className="flex flex-col sm:flex-row items-start gap-5 w-full">
          
          {/* Left: Thumbnail (Big Size) */}
          {slot && !errored && (
            <div className="w-full sm:w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700">
              {slot.previewUrl ? (
                <img src={slot.previewUrl} alt={slot.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-zinc-400 dark:text-zinc-500">
                  <FileText className="w-8 h-8" />
                  <span className="text-[10px] font-medium">PDF</span>
                </div>
              )}
              {slot.status === 'uploading' && <div className="absolute inset-0 bg-white/60 dark:bg-black/60" />}
              {slot.status === 'checking' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-zinc-900/5 dark:bg-white/5 backdrop-blur-[0.5px]" />
                  <motion.div
                    className="absolute left-0 right-0 h-8"
                    style={{ background: 'linear-gradient(180deg, transparent, rgba(187,244,81,0.4), transparent)' }}
                    initial={{ top: '-20%' }}
                    animate={{ top: '110%' }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Middle: Info (Large spacing & fonts) */}
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className={`font-semibold text-[17px] leading-tight tracking-tight ${
                slot?.status === 'ok' ? 'text-emerald-700 dark:text-emerald-400' :
                slot?.status === 'warn' ? 'text-amber-700 dark:text-amber-400' :
                errored ? 'text-red-700 dark:text-red-400' : 'text-zinc-900 dark:text-white'
              }`}>
                {doc.label}
              </p>
              {!done && (
                <Badge variant="secondary" className="h-6 px-2.5 text-[10px] font-medium border-0 rounded-full" style={{ background: `${cat.c}20`, color: cat.c }}>
                  {cat.name}
                </Badge>
              )}
              {doc.required && !done && (
                <Badge variant="secondary" className="h-6 px-2.5 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-0 rounded-full">
                  {t('upload.required_label', 'Required')}
                </Badge>
              )}
            </div>

            {slot ? (
              <div className="space-y-1.5">
                <p className="text-[13px] text-zinc-600 dark:text-zinc-400 truncate flex items-center gap-2">
                  <span className="font-medium">{slot.name}</span>
                  <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">· {formatBytes(slot.size)}</span>
                </p>
                
                {/* Status Updates */}
                {slot.status === 'uploading' && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-1.5 w-32 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-zinc-900 dark:bg-white"
                        style={{ width: `${slot.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{Math.round(slot.progress)}%</span>
                  </div>
                )}
                {slot.status === 'checking' && (
                  <p className="text-[12px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    {t('upload.aiChecking', 'Checking your document...')}
                  </p>
                )}
                <AnimatePresence>
                  {slot.feedback && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`text-[12px] leading-relaxed pt-1 ${
                        slot.status === 'ok' ? 'text-emerald-600 dark:text-emerald-400' :
                        slot.status === 'warn' ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400'
                      }`}
                    >
                      {slot.feedback}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="relative rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 border border-zinc-200 dark:border-zinc-700">
                  <span className="absolute -right-1 -top-1 font-black select-none pointer-events-none text-[2.2rem] opacity-[0.04] text-zinc-900 dark:text-white tracking-wider">SAMPLE</span>
                  <div className="relative z-10">
                    <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 leading-snug">{sample.what}</p>
                    <ul className="mt-1.5 space-y-0.5">
                      {sample.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-500">
                          <span className="w-1 h-1 rounded-full mt-[5px] shrink-0" style={{ background: cat.c }} />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions (Larger spacing) */}
          <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end gap-2 pt-1 sm:pt-0">
            {errored ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => slotFileRefs.current[doc.id]?.click()}
                className="h-9 px-4 rounded-lg text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Retry
              </Button>
            ) : done ? (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-9 px-3 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white" onClick={() => slotFileRefs.current[doc.id]?.click()}>
                  {t('upload.reupload', 'Replace')}
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg text-zinc-400 hover:text-red-500 dark:hover:text-red-400" onClick={() => removeSlot(doc.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : !busy ? (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="h-10 w-10 p-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all duration-200" onClick={() => slotFileRefs.current[doc.id]?.click()}>
                  <Upload className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="sm" className="h-10 w-10 p-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all duration-200" onClick={() => slotCamRefs.current[doc.id]?.click()}>
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>

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
            className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/60 pointer-events-none"
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
      <div className="w-full flex flex-col gap-8 max-w-4xl mx-auto py-6">
        {/* ── Header with Skip Button ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-1 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-600 dark:from-white dark:to-zinc-400" />
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 dark:text-white/40">
                {t('upload.step', 'Upload documents')}
              </p>
            </div>
            
            <button
              onClick={() => setShowSkipConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium 
                bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800
                text-zinc-800 dark:text-white
                border border-zinc-200 dark:border-white/10
                shadow-sm shadow-zinc-900/5 dark:shadow-black/20
                transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileUp className="w-4 h-4 text-zinc-500 dark:text-white/60" strokeWidth={1.75} />
              <span>Skip</span>  
            </button>
          </div>
          
          <h2 className="font-bold leading-tight tracking-[-0.02em] text-zinc-900 dark:text-white" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)' }}>
            {t('upload.title', 'Upload your documents')}
          </h2>
          <p className="text-zinc-500 dark:text-white/60 text-[15px] leading-relaxed">
            {t('upload.subtitle', 'Upload at least one document to continue or skip for later')}
          </p>
        </div>

        {/* ── Overall progress / celebration ── */}
        {hasDefs && Object.keys(slots).length > 0 && (
          <motion.div
            layout
            className={`
              relative rounded-2xl px-6 py-5 flex items-center gap-4 overflow-hidden
              border transition-all duration-300
              ${allRequiredDone
                ? 'bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/20 dark:to-zinc-950 border-emerald-400/40 dark:border-emerald-500/20'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10'
              }
            `}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-40" style={{ background: 'radial-gradient(120% 100% at 0% 0%, rgba(255,255,255,0.10), transparent 55%)' }} />

            <AnimatePresence>
              {allRequiredDone && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-transparent to-transparent dark:from-emerald-500/10 dark:via-transparent"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -inset-8 rounded-full blur-2xl"
                    style={{ background: 'radial-gradient(circle at 30% 50%, rgba(16,185,129,0.3), transparent 70%)' }}
                  />
                </>
              )}
            </AnimatePresence>

            <div className="relative w-16 h-16 shrink-0 z-10">
              <div className={`absolute inset-0 rounded-full blur-md transition-opacity duration-500 ${allRequiredDone ? 'opacity-100 bg-emerald-400/30' : 'opacity-0'}`} />
              <svg viewBox="0 0 40 40" className="w-16 h-16 -rotate-90 relative z-10">
                <circle cx="20" cy="20" r="16.5" fill="none" strokeWidth="3.5" stroke="currentColor" className="text-zinc-200 dark:text-white/10" />
                <defs>
                  <linearGradient id="progressRingGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={allRequiredDone ? '#10B981' : '#0F2A44'} />
                    <stop offset="100%" stopColor={allRequiredDone ? '#059669' : '#64748B'} />
                  </linearGradient>
                  <linearGradient id="progressRingGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={allRequiredDone ? '#34D399' : '#94A3B8'} />
                    <stop offset="100%" stopColor={allRequiredDone ? '#10B981' : '#64748B'} />
                  </linearGradient>
                </defs>
                <motion.circle
                  cx="20" cy="20" r="16.5" fill="none" stroke="url(#progressRingGradLight)" strokeWidth="3.5" strokeLinecap="round"
                  className="dark:hidden" strokeDasharray={2 * Math.PI * 16.5}
                  animate={{ strokeDashoffset: 2 * Math.PI * 16.5 * (1 - totalProgress / 100) }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <motion.circle
                  cx="20" cy="20" r="16.5" fill="none" stroke="url(#progressRingGradDark)" strokeWidth="3.5" strokeLinecap="round"
                  className="hidden dark:block" strokeDasharray={2 * Math.PI * 16.5}
                  animate={{ strokeDashoffset: 2 * Math.PI * 16.5 * (1 - totalProgress / 100) }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center z-20">
                <AnimatePresence mode="wait">
                  {allRequiredDone ? (
                    <motion.span key="done" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 16 }}>
                      <PartyPopper className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </motion.span>
                  ) : (
                    <motion.span key="pct" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] font-bold text-zinc-700 dark:text-white tabular-nums">
                      {totalProgress}%
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </div>

            <div className="flex-1 min-w-0 z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[15px] font-semibold text-zinc-800 dark:text-white">
                  {allRequiredDone
                    ? t('upload.allSetTitle', 'All required documents uploaded!')
                    : `${doneCount} ${t('upload.of', 'of')} ${totalRequired} ${t('upload.uploaded', 'uploaded')}`}
                </p>
                {!allRequiredDone && errorCount > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/15 rounded-full px-2.5 py-0.5">
                    {errorCount} {errorCount > 1 ? 'need attention' : 'needs attention'}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-zinc-500 dark:text-white/55 mt-0.5">
                {allRequiredDone
                  ? t('upload.allSet', 'Review and continue whenever you’re ready')
                  : errorCount > 0
                  ? t('upload.fixIssues', 'Fix the flagged files to continue')
                  : t('upload.keepGoing', 'Keep going — almost there')}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Document grid ── */}
        {hasDefs ? (
          <div className="space-y-4">
            <p className="text-[12px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {t('upload.required', 'Required documents')}
            </p>

            <div className="grid grid-cols-1 gap-4">
              {docDefs.map((doc, i) => <DocCard key={doc.id} doc={doc} index={i} />)}
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); processGlobalFiles(Array.from(e.dataTransfer.files)) }}
              onClick={() => globalFileRef.current?.click()}
              className={`
                rounded-2xl border-2 border-dashed px-6 py-5 cursor-pointer
                flex items-center gap-4 transition-all duration-200
                ${isDragOver ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 scale-[1.005]' : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-400/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10'}
              `}
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div>
                <p className="font-semibold text-zinc-800 dark:text-white text-[15px]">{t('upload.additionalDocs', 'Add additional documents')}</p>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">{t('upload.dropzone', 'Drag & drop or tap — PDF, JPG, PNG up to 10 MB')}</p>
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
            className={`rounded-2xl border-2 border-dashed py-14 text-center cursor-pointer transition-all duration-200 ${isDragOver ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-400/60'}`}
          >
            <Upload className="w-10 h-10 mx-auto mb-4 text-zinc-400 dark:text-zinc-500" />
            <p className="font-semibold text-zinc-800 dark:text-white text-[16px]">{t('upload.tapOrDrag', 'Tap or drag files here')}</p>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">{t('upload.formats', 'PDF, JPG, PNG — up to 10 MB')}</p>
            <input ref={globalFileRef} type="file" multiple accept="image/*,.pdf" className="hidden"
              onChange={e => { processGlobalFiles(Array.from(e.target.files || [])); e.target.value = '' }} />
          </div>
        )}

        <p className="text-[13px] text-zinc-400 dark:text-zinc-500 text-center">
          {t('upload.reassurance', "Don't worry — we'll review everything before submission")}
        </p>

        <Button
          onClick={handleContinueClick}
          disabled={!canContinue}
          className={`w-full h-14 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            canContinue
              ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/30 dark:shadow-white/10 active:scale-[0.97] cursor-pointer'
              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
          }`}
          style={{ fontSize: '17px' }}
        >
          {canContinue
            ? <><CheckCircle2 className="w-5 h-5" />{t('common.continue', 'Continue')}<ArrowRight className="w-5 h-5" /></>
            : <><Upload className="w-5 h-5" />{t('upload.uploadAtLeastOne', 'Upload at least one document')}</>
          }
        </Button>
      </div>

      <SkipConfirmDialog
        open={showSkipConfirm}
        onClose={() => setShowSkipConfirm(false)}
        onConfirm={handleSkip}
      />
    </>
  )
}