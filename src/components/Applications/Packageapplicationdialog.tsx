// components/PackageApplicationDialog.jsx
import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  ArrowRight, ArrowLeft, Check, UploadCloud,
  FileText, Loader2, Heart, Award, Briefcase, Users, IdCard, Baby,
  X, Clock, FileCheck, Sparkles, MapPin, Plane,
} from 'lucide-react';
import { PACKAGE_CONFIG } from '@/config/packageDocs';
import { usePackageApplication } from '@/hooks/usePackageApplication';

const STEP_COUNT = 4; // Package, Plan, Details, Documents
const STEP_LABELS = ['Package', 'Plan', 'Details', 'Documents'];
const fmtAED = (n) => `AED ${Math.round(n).toLocaleString()}`;

const ICONS = {
  PK5: Heart, PK1: Award, PK3: Briefcase, PK4: Users,
  PK6: IdCard, PK7: Users, PK8: Baby,
};
const iconFor = (slug) => ICONS[slug] || FileText;

const slide = {
  enter: (d) => ({ x: d > 0 ? 28 : -28, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d > 0 ? -28 : 28, opacity: 0 }),
};

// Hides scrollbars visually while keeping scroll (wheel/touch/drag) fully functional.
const NoScrollbarStyle = () => (
  <style>{`
    .no-scrollbar {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;     /* Firefox */
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;             /* Chrome, Safari, Opera */
      width: 0;
      height: 0;
    }
  `}</style>
);

export default function PackageApplicationDialog({ open, onOpenChange, packages = [] }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [slug, setSlug] = useState(null);
  const [applicantType, setApplicantType] = useState('outside');
  const [contact, setContact] = useState({ fullName: '', email: '', phone: '', nationality: '', preferredLanguage: 'en' });
  const [files, setFiles] = useState({});
  const [refId, setRefId] = useState('');
  const [done, setDone] = useState(false);

  const { submitApplication, uploadDocuments, submitting, uploading } = usePackageApplication();

  const cards = useMemo(() => {
    const all = Object.entries(PACKAGE_CONFIG).map(([s, cfg]) => ({ slug: s, ...cfg }));
    if (packages.length) {
      const present = new Set(packages.map((p) => p.sub2Slug));
      return all.filter((c) => present.has(c.slug));
    }
    return all;
  }, [packages]);

  const cfg = slug ? PACKAGE_CONFIG[slug] : null;
  const price = cfg ? (cfg.pricing[applicantType]?.amount ?? cfg.pricing.outside.amount) : 0;
  const accent = cfg?.accent || 'var(--foreground)';

  const go = (next) => { setDir(next > step ? 1 : -1); setStep(next); };
  const pickPackage = (s) => { setSlug(s); go(1); };

  const canContinue = () => {
    if (step === 0) return !!slug;
    if (step === 1) return true;
    if (step === 2) return contact.fullName.trim() && contact.phone.trim();
    return true;
  };

  const handleSubmit = async () => {
    const stored = (() => { try { return JSON.parse(localStorage.getItem('userData') || 'null'); } catch { return null; } })();
    const app = await submitApplication({
      packageSlug: slug,
      packageName: cfg.name,
      applicantType,
      contact,
      pricing: { baseAmount: price, currency: 'AED', priceType: cfg.pricing[applicantType]?.label || 'Start From' },
      user_id: stored?._id || undefined,
    });
    if (!app) return;
    setRefId(app.referenceId);

    const list = Object.entries(files).map(([docKey, file]) => ({
      docKey,
      label: cfg.docs.find((d) => d.docKey === docKey)?.label || docKey,
      file,
    }));
    if (list.length) {
      const ok = await uploadDocuments(app._id, list);
      if (!ok) console.warn('Documents did not upload; lead saved without them');
    }
    setDone(true);
  };

  const reset = () => {
    setStep(0); setSlug(null); setFiles({}); setApplicantType('outside');
    setRefId(''); setDone(false);
    setContact({ fullName: '', email: '', phone: '', nationality: '', preferredLanguage: 'en' });
  };

  const close = () => { reset(); onOpenChange(false); };
  const busy = submitting || uploading;

  return (
    <>
      <NoScrollbarStyle />
      <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
        <DialogContent 
          className="
            max-w-4xl 
            w-[95vw] 
            p-0 gap-0 
            overflow-scroll no-scrollbar 
            rounded-[28px] border-none 
            shadow-[0_24px_70px_-12px_rgba(0,0,0,0.35)]
            max-h-[92vh]
            h-auto
          "
        >
          {done ? (
            <SuccessScreen refId={refId} onClose={close} accent={accent} />
          ) : (
            <div className="flex flex-col">
              {/* Progress rail — numbered circles + connecting track */}
              <div className="px-6 pt-7 pb-1">
                <div className="relative flex items-center justify-between">
                  {/* Base track */}
                  <div className="absolute left-4 right-4 top-4 h-[2px] bg-border rounded-full -z-0" />
                  {/* Filled track */}
                  <motion.div
                    className="absolute left-4 top-4 h-[2px] rounded-full -z-0"
                    style={{ background: accent }}
                    initial={false}
                    animate={{ width: `calc(${(step / (STEP_COUNT - 1)) * 100}% - ${step === 0 ? 0 : 32}px)` }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                  {Array.from({ length: STEP_COUNT }).map((_, i) => {
                    const isDone = i < step;
                    const isActive = i === step;
                    return (
                      <div key={i} className="relative z-10 flex flex-col items-center gap-1.5" style={{ flex: i === 0 || i === STEP_COUNT - 1 ? '0 0 auto' : '1' }}>
                        <motion.div
                          animate={{
                            scale: isActive ? 1.12 : 1,
                            backgroundColor: isDone || isActive ? accent : 'var(--background)',
                            borderColor: isDone || isActive ? accent : 'var(--border)',
                          }}
                          transition={{ duration: 0.25 }}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[12px] font-semibold"
                          style={{ color: isDone || isActive ? 'white' : 'var(--muted-foreground)' }}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {isDone ? (
                              <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                              </motion.span>
                            ) : (
                              <motion.span key="num" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                {i + 1}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        <span
                          className="hidden sm:block text-[10px] font-medium transition-colors duration-200 whitespace-nowrap"
                          style={{ color: isDone || isActive ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                        >
                          {STEP_LABELS[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Body - with increased min-height for bigger feel */}
              <div className="relative min-h-[480px] px-6 pt-6">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>

                    {step === 0 && <StepPackage cards={cards} onPick={pickPackage} selected={slug} />}
                    {step === 1 && cfg && (
                      <StepPlan cfg={cfg} slug={slug} applicantType={applicantType} setApplicantType={setApplicantType} />
                    )}
                    {step === 2 && <StepDetails cfg={cfg} contact={contact} setContact={setContact} applicantType={applicantType} price={price} />}
                    {step === 3 && cfg && <StepDocuments cfg={cfg} files={files} setFiles={setFiles} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4 mt-2 bg-muted/40 backdrop-blur-sm rounded-b-[28px]">
                {step > 0 ? (
                  <button onClick={() => go(step - 1)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                ) : <span />}

                <div className="flex items-center gap-3 ml-auto">
                  {cfg && step > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground leading-none">total</p>
                      <p className="text-[16px] font-bold leading-tight mt-0.5" style={{ color: accent }}>{fmtAED(price)}</p>
                    </div>
                  )}
                  {step < 3 ? (
                    <motion.button whileHover={{ scale: canContinue() ? 1.02 : 1 }} whileTap={{ scale: canContinue() ? 0.97 : 1 }}
                      disabled={!canContinue()} onClick={() => go(step + 1)}
                      className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-[0_4px_16px_rgba(0,0,0,0.12)] disabled:opacity-40 disabled:shadow-none transition-all">
                      Continue <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  ) : (
                    <motion.button whileHover={{ scale: busy ? 1 : 1.02 }} whileTap={{ scale: busy ? 1 : 0.97 }}
                      disabled={busy} onClick={handleSubmit}
                      className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-[0_4px_16px_rgba(0,0,0,0.12)] disabled:opacity-60 transition-all">
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                      {busy ? 'Submitting' : 'Submit'}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ----------------------------- Step 0: Package ---------------------------- */
function StepPackage({ cards, onPick, selected }) {
  return (
    <>
      <h3 className="text-xl font-bold tracking-tight">Choose your package</h3>
      <p className="mt-1 mb-4 text-[13px] text-muted-foreground">Every package bundles the full government process end to end.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto no-scrollbar -mr-2 pr-2">
        {cards.map((c) => {
          const Icon = iconFor(c.slug);
          const isSel = selected === c.slug;
          return (
            <motion.button
              key={c.slug}
              layout
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPick(c.slug)}
              className="group relative flex flex-col rounded-[22px] p-4 text-left overflow-hidden bg-card transition-all duration-300"
              style={{
                border: isSel ? `1.5px solid ${c.accent}` : '1px solid var(--border)',
                boxShadow: isSel
                  ? `0 16px 34px -10px ${c.accent}55`
                  : '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              {/* selected check badge */}
              <AnimatePresence>
                {isSel && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full shadow-sm"
                    style={{ background: c.accent }}
                  >
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>

              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 mb-3 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
                style={{ background: `linear-gradient(135deg, ${c.accent}26, ${c.accent}0d)` }}
              >
                <Icon className="h-5 w-5" style={{ color: c.accent }} />
              </div>

              <p className="text-[15px] font-semibold leading-tight pr-6">{c.name}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-snug line-clamp-2">{c.tagline}</p>

              <div className="mt-3.5 flex items-center justify-between">
                <span
                  className="inline-flex items-baseline gap-1 rounded-full px-2.5 py-1"
                  style={{ background: `${c.accent}14` }}
                >
                  <span className="text-[9px] font-medium uppercase tracking-wide" style={{ color: c.accent }}>from</span>
                  <span className="text-[13px] font-bold" style={{ color: c.accent }}>{fmtAED(c.pricing.outside.amount)}</span>
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 transition-all duration-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                  style={{ color: c.accent }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------ Step 1: Plan ------------------------------ */
function StepPlan({ cfg, slug, applicantType, setApplicantType }) {
  const Icon = iconFor(slug);
  return (
    <>
      <div className="flex items-center gap-3.5 mb-5">
        <div
          className="flex h-[54px] w-[54px] items-center justify-center rounded-2xl shrink-0"
          style={{ background: `linear-gradient(135deg, ${cfg.accent}26, ${cfg.accent}0d)` }}
        >
          <Icon className="h-6 w-6" style={{ color: cfg.accent }} />
        </div>
        <div>
          <p className="text-[19px] font-bold tracking-tight leading-tight">{cfg.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{cfg.durationLabel.replace(' Residence Visa', '')} · renewable</p>
        </div>
      </div>

      <div className="flex rounded-2xl border border-border overflow-hidden mb-5 bg-muted/40">
        <Meta label="processing" value={cfg.processingTime} border />
        <Meta label="documents" value={`${cfg.docs.length} needed`} />
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Included</p>
      <div className="flex flex-wrap gap-1.5 mb-6">
        {cfg.includedServices.map((s) => (
          <span key={s} className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <Check className="h-3 w-3 shrink-0" style={{ color: cfg.accent }} />
            {s}
          </span>
        ))}
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Where is the applicant now?</p>
      <div className="relative flex gap-2 rounded-2xl bg-muted/50 p-1.5">
        {['outside', 'inside'].map((t) => {
          const sel = applicantType === t;
          const p = cfg.pricing[t];
          const Ico = t === 'outside' ? Plane : MapPin;
          return (
            <button key={t} onClick={() => setApplicantType(t)} className="relative flex-1 z-10">
              {sel && (
                <motion.div
                  layoutId="plan-selected-bg"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-card shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
                  style={{ border: `1.5px solid ${cfg.accent}` }}
                />
              )}
              <div className="relative flex items-center gap-2.5 p-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-colors duration-200"
                  style={{ background: sel ? `${cfg.accent}1f` : 'transparent' }}
                >
                  <Ico className="h-4 w-4" style={{ color: sel ? cfg.accent : 'var(--muted-foreground)' }} />
                </div>
                <div className="text-left">
                  <p className="text-[12.5px] font-medium leading-tight" style={{ color: sel ? cfg.accent : 'var(--foreground)' }}>{p.label}</p>
                  <p className="text-[14px] font-bold leading-tight mt-0.5" style={{ color: sel ? cfg.accent : 'var(--foreground)' }}>{fmtAED(p.amount)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{cfg.eligibility}</p>
    </>
  );
}

function Meta({ label, value, border }) {
  return (
    <div className={`flex-1 px-3.5 py-3 ${border ? 'border-r border-border' : ''}`}>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[13px] font-semibold">{value}</p>
    </div>
  );
}

/* ----------------------------- Step 2: Details ---------------------------- */
function StepDetails({ cfg, contact, setContact, applicantType, price }) {
  const [focused, setFocused] = useState(null);
  const set = (k) => (v) => setContact({ ...contact, [k]: v });
  return (
    <>
      <h3 className="text-xl font-bold tracking-tight">Your details</h3>
      <p className="mt-1 mb-5 text-[13px] text-muted-foreground">Our team calls you to confirm and process everything — no payment needed yet.</p>
      <div className="grid grid-cols-2 gap-3">
        <Field id="fullName" label="Full name" required value={contact.fullName} onChange={set('fullName')} placeholder="As per passport" full focused={focused} setFocused={setFocused} />
        <Field id="phone" label="Phone" required value={contact.phone} onChange={set('phone')} placeholder="+971 50 000 0000" focused={focused} setFocused={setFocused} />
        <Field id="email" label="Email" type="email" value={contact.email} onChange={set('email')} placeholder="you@email.com" focused={focused} setFocused={setFocused} />
        <Field id="nationality" label="Nationality" value={contact.nationality} onChange={set('nationality')} placeholder="e.g. Pakistani" full focused={focused} setFocused={setFocused} />
      </div>
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-muted/50 border border-border px-4 py-3.5">
        <div>
          <p className="text-[13px] font-semibold">{cfg?.name}</p>
          <p className="text-[11px] text-muted-foreground">{cfg?.pricing[applicantType]?.label}</p>
        </div>
        <p className="text-[16px] font-bold" style={{ color: cfg?.accent }}>{fmtAED(price)}</p>
      </div>
    </>
  );
}

function Field({ id, label, value, onChange, placeholder, type = 'text', required, full, focused, setFocused }) {
  const isFocused = focused === id;
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {label}{required && <span className="text-foreground/50"> *</span>}
      </label>
      <div
        className={`
          relative mt-1.5 rounded-xl px-3.5 h-11 flex items-center
          bg-muted/50 transition-all duration-200
          ${isFocused ? 'bg-card shadow-[0_2px_14px_rgba(0,0,0,0.08)]' : ''}
        `}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused(null)}
          placeholder={placeholder}
          style={{ fontSize: '16px', outline: 'none', boxShadow: 'none' }}
          className="flex-1 min-w-0 bg-transparent border-0 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-0"
        />
        <motion.div
          initial={false}
          animate={{ width: isFocused ? '100%' : '0%' }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute left-0 right-0 bottom-0 h-[2px] bg-foreground/70 rounded-full"
        />
      </div>
    </div>
  );
}

/* --------------------------- Step 3: Documents ---------------------------- */
function StepDocuments({ cfg, files, setFiles }) {
  const uploaded = Object.keys(files).length;
  const total = cfg.docs.length;
  const pct = total ? (uploaded / total) * 100 : 0;
  return (
    <>
      <div className="flex items-end justify-between mb-1">
        <h3 className="text-xl font-bold tracking-tight">Upload documents</h3>
        <div className="flex items-center gap-2 pb-0.5">
          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: cfg.accent }}
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{uploaded}/{total}</span>
        </div>
      </div>
      <p className="max-w-[20rem] md:max-w-full truncate mt-1 mb-4 text-[13px] text-muted-foreground">Add what you have now. You can send the rest after our team calls you.</p>
      <div className="flex flex-col gap-2 max-h-[330px] overflow-y-auto no-scrollbar -mr-2 pr-2">
        {cfg.docs.map((doc) => (
          <DocRow key={doc.docKey} doc={doc} accent={cfg.accent}
            file={files[doc.docKey]}
            onSet={(f) => setFiles({ ...files, [doc.docKey]: f })}
            onClear={() => { const n = { ...files }; delete n[doc.docKey]; setFiles(n); }} />
        ))}
      </div>
    </>
  );
}

function DocRow({ doc, accent, file, onSet, onClear }) {
  const inputRef = useRef(null);
  return (
    <div
      className={`
        flex items-center gap-3 rounded-2xl p-3 transition-all duration-200 md:max-w-full max-w-[20rem]
        ${file ? '' : 'bg-slate-50 dark:bg-white/[0.05] border border-dashed border-slate-200 dark:border-white/15'}
      `}
      style={
        file
          ? { border: `1px solid ${accent}66`, background: `${accent}0d` }
          : undefined
      }
    >
      <div
        className={`
          flex h-9 w-9 items-center justify-center rounded-xl shrink-0
          ${file ? '' : 'bg-white dark:bg-white/[0.08]'}
        `}
        style={file ? { background: `${accent}22` } : undefined}
      >
        {file ? (
          <FileCheck className="h-4 w-4" style={{ color: accent }} />
        ) : (
          <FileText className="h-4 w-4 text-slate-500 dark:text-slate-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium flex items-center gap-1.5 leading-tight">
          <span className="truncate">{doc.label}</span>
          {!doc.required && (
            <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/15 rounded px-1 shrink-0">
              optional
            </span>
          )}
        </p>
        {file ? (
          <p className="text-[11px] truncate" style={{ color: accent }}>{file.name}</p>
        ) : doc.hint ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{doc.hint}</p>
        ) : null}
      </div>
      {file ? (
        <button
          onClick={onClear}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 transition-colors shrink-0"
          aria-label="Remove"
        >
          <X className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 text-xs font-semibold shrink-0 px-2.5 py-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 transition-colors"
          style={{ color: accent }}
        >
          <UploadCloud className="h-3.5 w-3.5" />
          Add
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => e.target.files?.[0] && onSet(e.target.files[0])}
      />
    </div>
  );
}
/* ------------------------------ Success ----------------------------------- */
function SuccessScreen({ refId, onClose, accent }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
      <motion.div
        initial={{ scale: 0, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full mb-5"
        style={{ background: `linear-gradient(135deg, ${accent}26, ${accent}0d)` }}
      >
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full" style={{ background: `${accent}26` }}>
          <Check className="h-9 w-9" strokeWidth={2.5} style={{ color: accent }} />
        </div>
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 14 }}
          className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-background shadow-md"
        >
          <Sparkles className="h-4 w-4" style={{ color: accent }} />
        </motion.span>
      </motion.div>
      <h3 className="text-2xl font-bold tracking-tight">You're all set</h3>
      <div className="mt-3.5 rounded-xl bg-muted px-4 py-2.5">
        <p className="text-[11px] text-muted-foreground leading-none mb-1">Reference</p>
        <p className="text-sm font-semibold tracking-wide font-mono">{refId}</p>
      </div>
      <p className="mt-4 max-w-[280px] text-[13px] leading-relaxed text-muted-foreground flex items-center gap-1.5 justify-center">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        Our team will call you within 2 hours to confirm and process payment.
      </p>
      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onClose}
        className="mt-8 w-full rounded-xl bg-foreground py-3.5 text-sm font-semibold text-background shadow-[0_4px_16px_rgba(0,0,0,0.12)]">Done</motion.button>
    </div>
  );
}