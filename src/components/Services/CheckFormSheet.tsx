"use client";

import { useState, useCallback, useMemo, useRef, DragEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Upload,
  Trash2,
  Check,
  Clock,
  Zap,
  Shield,
  CreditCard,
  File,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { cn } from '@/lib/utils';
import type { Service, FormField } from '@/lib/services';
import { NATIONALITIES } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionUpsellCard } from './SubscriptionUpsellCard';

const FREE_SERVICES = ['overstay-fine', 'absconding'];

interface CheckFormSheetProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
}

// Always 3 steps now — Docs / Speed / Review. Payment happens via /subscribe page.
const STEPS = [
  { id: 1, label: 'Docs' },
  { id: 2, label: 'Speed' },
  { id: 3, label: 'Review' },
];

const slideVariants = {
  initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 30 : -30 }),
  animate: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -30 : 30 }),
};

export function CheckFormSheet({ service, isOpen, onClose }: CheckFormSheetProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, fetchTrial } = useAuth();
  const { isActive: hasActiveSubscription, subscription, loading: loadingSub } = useSubscription();

  const isFreeService = FREE_SERVICES.includes(service.id);

  // Can the user actually submit this check?
  // - Free service → always yes
  // - Paid service → only if subscribed
  const canSubmit = isFreeService || hasActiveSubscription || user?.trialUsed === false;

  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});
  const [speedTier, setSpeedTier] = useState<'standard' | 'fast-track'>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const totalPrice = isFreeService
    ? 0
    : speedTier === 'fast-track'
    ? service.priceFastTrack
    : service.priceStandard;

  const isFieldVisible = useCallback(
    (field: FormField): boolean => {
      if (!field.conditionalOn) return true;
      const { field: condField, value: condValue } = field.conditionalOn;
      return formData[condField] === condValue;
    },
    [formData]
  );

  const updateFormData = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const uploadFileWithProgress = useCallback((docId: string, file: File) => {
    const fileKey = `${docId}__${file.name}`;
    return new Promise<void>((resolve) => {
      let pct = 0;
      const interval = setInterval(() => {
        pct = Math.min(pct + 20, 95);
        setFileProgress((prev) => ({ ...prev, [fileKey]: pct }));
        if (pct >= 95) {
          clearInterval(interval);
          setFileProgress((prev) => ({ ...prev, [fileKey]: 100 }));
          resolve();
        }
      }, 80);
    });
  }, []);

  const handleFileAdd = useCallback(
    async (docId: string, newFiles: File[]) => {
      const MAX_SIZE = 10 * 1024 * 1024;
      const valid = newFiles.filter((f) => f.size <= MAX_SIZE);
      if (valid.length < newFiles.length) {
        toast.error('Some files exceeded 10MB and were skipped.');
      }
      setFiles((prev) => ({ ...prev, [docId]: [...(prev[docId] || []), ...valid] }));
      await Promise.all(valid.map((f) => uploadFileWithProgress(docId, f)));
    },
    [uploadFileWithProgress]
  );

  const handleFileInputChange = useCallback(
    async (docId: string, fileList: FileList | null) => {
      if (!fileList) return;
      await handleFileAdd(docId, Array.from(fileList));
    },
    [handleFileAdd]
  );

  const removeFile = useCallback((docId: string, index: number) => {
    setFiles((prev) => {
      const updated = (prev[docId] || []).filter((_, i) => i !== index);
      return { ...prev, [docId]: updated };
    });
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>, docId: string) => {
    e.preventDefault();
    setDragOver(docId);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(null), []);

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>, docId: string) => {
      e.preventDefault();
      setDragOver(null);
      const droppedFiles = Array.from(e.dataTransfer.files);
      await handleFileAdd(docId, droppedFiles);
    },
    [handleFileAdd]
  );

  const submitCheck = async () => {
    setIsSubmitting(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');

      const fd = new FormData();
      fd.append('serviceId', service.id);
      fd.append('serviceType', service.title);
      fd.append('identifiers', JSON.stringify(formData));
      fd.append('speedTier', speedTier);

      Object.values(files).flat().forEach((file) => fd.append('documents', file));

      const res = await fetch(`${apiBase}/api/v1/checks`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) throw new Error('Submit failed');

      setSubmitSuccess(true);
      await fetchTrial();
      toast.success(t('checks.successTitle'));
      
      setTimeout(() => handleClose(), 2500);
    } catch {
      toast.error(t('checks.errorSubmit'));
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setDirection(1);
    setFormData({});
    setFiles({});
    setFileProgress({});
    setSpeedTier('standard');
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setDragOver(null);
    onClose();
  };

  const goNext = () => {
    if (currentStep < STEPS.length) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const fileProgressKey = (docId: string, file: File) => `${docId}__${file.name}`;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col bg-background overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-muted shrink-0">
              <img
                src={service.image}
                alt={service.title}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base leading-tight truncate">{service.title}</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('checks.via')} {service.authority}
              </p>
            </div>

            {hasActiveSubscription ? (
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 shrink-0 gap-1">
                <Crown className="h-3 w-3" />
                Member
              </Badge>
            ) : isFreeService ? (
              <Badge className="bg-green-500/15 text-green-600 border-green-500/30 shrink-0">
                {t('checks.step3.freeService')}
              </Badge>
            ) : null}

    
          </div>
        </SheetHeader>

        {/* Step Indicator */}
        <div className="px-6 py-3 border-b border-border bg-muted/30 shrink-0">
          <div className="w-full h-1 bg-border rounded-full mb-3 overflow-hidden">
            <motion.div
              className="h-full bg-black dark:bg-white rounded-full"
              animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200',
                      currentStep === step.id
                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                        : currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {currentStep > step.id ? <Check className="h-3.5 w-3.5" /> : step.id}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] mt-1 hidden sm:block font-medium transition-colors',
                      currentStep === step.id ? 'text-black dark:text-white' : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-px w-8 sm:w-14 mx-2 transition-colors duration-300',
                      currentStep > step.id ? 'bg-green-500' : 'bg-border'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="px-6 py-6"
            >
              {/* ── Step 1: Documents ── */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{t('checks.step2.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('checks.step2.subtitle')}</p>
                  </div>

                  <div className="space-y-5">
                    {service.documents.map((doc) => {
                      const docFiles = files[doc.id] || [];
                      const isDragging = dragOver === doc.id;

                      return (
                        <div key={doc.id} className="space-y-2">
                          <Label className="flex items-center gap-1 text-sm font-medium">
                            {doc.label}
                            {doc.required && <span className="text-destructive">*</span>}
                          </Label>

                          <div
                            className={cn(
                              'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200',
                              isDragging
                                ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 scale-[1.01]'
                                : docFiles.length > 0
                                ? 'border-green-500 bg-green-500/5'
                                : 'border-border hover:border-black/60 dark:hover:border-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                            )}
                            onClick={() => document.getElementById(`file-${doc.id}`)?.click()}
                            onDragOver={(e) => handleDragOver(e, doc.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, doc.id)}
                          >
                            <input
                              id={`file-${doc.id}`}
                              type="file"
                              accept="image/*,application/pdf,.heic"
                              multiple={doc.multiple ?? true}
                              className="hidden"
                              onChange={(e) => handleFileInputChange(doc.id, e.target.files)}
                            />
                            <Upload
                              className={cn(
                                'h-7 w-7 mx-auto mb-2 transition-colors',
                                docFiles.length > 0 ? 'text-green-500' : 'text-muted-foreground'
                              )}
                            />
                            <p className="text-sm font-medium">
                              {docFiles.length > 0
                                ? `${docFiles.length} ${t('checks.files')}`
                                : t('checks.step2.dragDrop')}
                            </p>
                            {doc.helpText && (
                              <p className="text-xs text-muted-foreground mt-1">{doc.helpText}</p>
                            )}
                          </div>

                          {docFiles.length > 0 && (
                            <div className="space-y-2">
                              {docFiles.map((file, index) => {
                                const key = fileProgressKey(doc.id, file);
                                const progress = fileProgress[key] ?? 100;
                                const isUploading = progress < 100;

                                return (
                                  <motion.div
                                    key={`${file.name}-${index}`}
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-lg border border-border bg-muted/40 overflow-hidden"
                                  >
                                    <div className="flex items-center gap-3 px-3 py-2.5">
                                      <File className="h-4 w-4 text-black dark:text-white shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate font-medium">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {isUploading
                                            ? `${t('checks.step2.uploading')} ${progress}%`
                                            : `${(file.size / 1024 / 1024).toFixed(2)} MB — ${t('checks.step2.uploaded')}`}
                                        </p>
                                      </div>
                                      {!isUploading && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 shrink-0 hover:bg-black/5 dark:hover:bg-white/10 text-destructive"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(doc.id, index);
                                          }}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                    </div>
                                    {isUploading && (
                                      <div className="h-0.5 bg-border">
                                        <motion.div
                                          className="h-full bg-black dark:bg-white"
                                          animate={{ width: `${progress}%` }}
                                          transition={{ duration: 0.1 }}
                                        />
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Step 2: Speed ── */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{t('checks.step3.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('checks.step3.subtitle')}</p>
                  </div>

                  {isFreeService ? (
                    <div className="rounded-xl border-2 border-green-500 bg-green-500/8 p-6 text-center space-y-2">
                      <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-green-500/15">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-green-700 dark:text-green-400">
                        {t('checks.step3.freeService')}
                      </h4>
                      <p className="text-sm text-muted-foreground">{t('checks.step3.freeDesc')}</p>
                    </div>
                  ) : (
                    <RadioGroup
                      value={speedTier}
                      onValueChange={(v) => setSpeedTier(v as 'standard' | 'fast-track')}
                      className="space-y-3"
                    >
                      <label
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                          speedTier === 'standard'
                            ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                            : 'border-border hover:border-black/60 dark:hover:border-white/60'
                        )}
                      >
                        <RadioGroupItem value="standard" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{t('checks.step3.standard')}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{t('checks.standard.time')}</p>
                        </div>
                        {hasActiveSubscription ? (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 shrink-0">
                            <Crown className="h-3 w-3" />
                            Included
                          </Badge>
                        ) : (
                          <p className="text-xl font-bold shrink-0">AED {service.priceStandard}</p>
                        )}
                      </label>

                      <label
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                          speedTier === 'fast-track'
                            ? 'border-amber-500 bg-amber-500/8'
                            : 'border-border hover:border-amber-500/50'
                        )}
                      >
                        <RadioGroupItem value="fast-track" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <span className="font-semibold">{t('checks.step3.fastTrack')}</span>
                            {!hasActiveSubscription && (
                              <Badge
                                variant="secondary"
                                className="bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs border-0"
                              >
                                Priority
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{t('checks.fastTrack.time')}</p>
                        </div>
                        {hasActiveSubscription ? (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 shrink-0">
                            <Crown className="h-3 w-3" />
                            Included
                          </Badge>
                        ) : (
                          <p className="text-xl font-bold shrink-0">AED {service.priceFastTrack}</p>
                        )}
                      </label>
                    </RadioGroup>
                  )}

                  {/* Subscription upsell — only for logged-in non-subscribers on paid services */}
                  {user && !isFreeService && !hasActiveSubscription && !loadingSub && (
                    <SubscriptionUpsellCard
                      currentCheckPrice={totalPrice}
                      serviceTitle={service.title}
                    />
                  )}
                </div>
              )}

              {/* ── Step 3: Review ── */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {submitSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center space-y-4"
                    >
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold">{t('checks.successTitle')}</h3>
                      <p className="text-muted-foreground max-w-xs">{t('checks.successDesc')}</p>
                      <Button 
                        onClick={handleClose} 
                        className="mt-2 rounded-full px-8 bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80"
                      >
                        {t('common.close')}
                      </Button>
                    </motion.div>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{t('checks.step4.title')}</h3>
                        <p className="text-sm text-muted-foreground">{t('checks.step4.subtitle')}</p>
                      </div>

                      {/* Member banner */}
                      {hasActiveSubscription && subscription && (
                        <div className="rounded-xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-3 flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                            <Crown className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{subscription.productName} Member</p>
                            <p className="text-xs text-muted-foreground">
                              This check is included in your subscription
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="rounded-xl border border-border overflow-hidden">
                        <div className="p-4 bg-muted/40 flex items-center gap-3">
                          <div className="h-11 w-11 rounded-lg overflow-hidden shrink-0">
                            <img
                              src={service.image}
                              alt={service.title}
                              width={44}
                              height={44}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{service.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {t('checks.authority')}: {service.authority}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 space-y-2.5 divide-y divide-border/60">
                          {Object.entries(formData).slice(0, 4).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm pt-2 first:pt-0">
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className="font-medium text-right max-w-[55%] truncate">
                                {typeof value === 'boolean'
                                  ? value ? 'Yes' : 'No'
                                  : typeof value === 'object' && value !== null
                                  ? JSON.stringify(value)
                                  : String(value).slice(-8)}
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm pt-2">
                            <span className="text-muted-foreground">{t('checks.step4.documents')}</span>
                            <span className="font-medium">
                              {Object.values(files).flat().length} {t('checks.files')}
                            </span>
                          </div>
                          {!isFreeService && (
                            <div className="flex justify-between text-sm pt-2">
                              <span className="text-muted-foreground">Speed</span>
                              <Badge variant="outline" className="text-xs">
                                {speedTier === 'fast-track'
                                  ? t('checks.step3.fastTrack')
                                  : t('checks.step3.standard')}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="p-4 border-t border-border bg-muted/30 flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{t('checks.step4.total')}</span>
                          {isFreeService ? (
                            <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-base px-3 py-1">
                              {t('checks.step4.free')}
                            </Badge>
                          ) : hasActiveSubscription ? (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-base px-3 py-1 gap-1">
                              <Crown className="h-3.5 w-3.5" />
                              Included
                            </Badge>
                          ) : (
                            <span className="text-2xl font-bold">AED {totalPrice}</span>
                          )}
                        </div>
                      </div>

                      {/* Auth / subscription gate */}
                      {!user ? (
                        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
                          <ShieldCheck className="h-10 w-10 mx-auto text-black dark:text-white" />
                          <div>
                            <h3 className="font-semibold">{t('checks.loginRequired')}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{t('checks.loginDesc')}</p>
                          </div>
                          <div className="flex gap-3 justify-center flex-wrap">
                            <Button 
                              onClick={() => navigate('/auth')} 
                              className="rounded-full px-6 bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80"
                            >
                              {t('checks.signIn')}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => navigate('/auth?tab=signup')}
                              className="rounded-full px-6 border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              {t('checks.createAccount')}
                            </Button>
                          </div>
                        </div>
                      ) : !canSubmit ? (
                        // Paid service + no subscription → show full upsell card
                        <SubscriptionUpsellCard
                          currentCheckPrice={totalPrice}
                          serviceTitle={service.title}
                        />
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Shield className="h-4 w-4 text-green-500 shrink-0" />
                            <span>Submitted to ICP-authorized typing centre</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CreditCard className="h-4 w-4 text-black dark:text-white shrink-0" />
                            <span>Stripe secure payment</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span>Results delivered to dashboard, email &amp; WhatsApp</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!submitSuccess && (
          <div className="px-6 py-4 border-t border-border bg-card shrink-0">
            <div className="flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <Button 
                  variant="outline" 
                  onClick={goBack} 
                  className="gap-2 border-border text-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground" 
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('checks.back')}
                </Button>
              ) : (
                <div />
              )}

              {/* Steps 1 & 2 — continue */}
              {currentStep < 3 && (
                <Button 
                  onClick={goNext} 
                  className="gap-2 min-w-[120px] bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 transition-all duration-200"
                >
                  {t('checks.continue')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              {/* Step 3 (Review) — submit OR redirect to subscribe */}
              {currentStep === 3 && (
                <>
                  {!user ? (
                    <Button 
                      disabled 
                      className="gap-2 min-w-[160px] opacity-50 bg-muted text-muted-foreground cursor-not-allowed"
                    >
                      {t('checks.step4.submitFree')}
                    </Button>
                  ) : !canSubmit ? (
                    // Paid service + not subscribed → CTA goes to /subscribe
                    <Button
                      onClick={() => navigate('/subscription')}
                      className="gap-2 min-w-[180px] bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all duration-200"
                    >
                      <Crown className="h-4 w-4" />
                      Subscribe to Submit
                    </Button>
                  ) : (
                    // Free service OR subscribed → submit directly
                    <Button
                      onClick={submitCheck}
                      disabled={isSubmitting}
                      className="gap-2 min-w-[160px] bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <motion.span
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          {t('checks.step4.submitting')}
                        </motion.span>
                      ) : (
                        <>
                          Submit Check
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}