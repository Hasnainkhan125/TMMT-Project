"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ChevronRight,
  FileSearch,
  RefreshCw,
  Eye,
  CalendarClock,
  Plane,
  BriefcaseBusiness,
  MapPin,
  FileWarning,
  Building2,
  Sparkles,
  Upload,
  Paperclip,
  Download,
  MessageCircle,
  LogIn,
  ArrowRight,
  FileX,
  Globe,
  User,
  Hash,
  ShieldCheck,
  Award,  // ✅ Added for Golden Guarantee
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useApplications } from "@/contexts/ApplicationsContext";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "../ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | "pending_payment"
  | "submitted"
  | "processing"
  | "requires_documents"
  | "completed"
  | "failed"
  | "refunded";

export type ServiceId =
  | "overstay-fine"
  | "travel-ban"
  | "absconding"
  | "inside-outside"
  | "application-status"
  | "nawakas"
  | "establishment-card"
  | "expiry-checker";

export interface Attachment {
  originalName: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

export interface Identifiers {
  searchType?: "passport" | "emirates_id";
  passportNumber?: string;
  emiratesIdNumber?: string;
  nationality?: string;
  dateOfBirth?: { year?: number; month?: number; day?: number } | string;
  gender?: "male" | "female";
  [key: string]: unknown;
}

export interface RequestedDocument {
  _id: string;
  label: string;
  requestStatus: 'pending' | 'fulfilled' | 'rejected';
}

export interface Application {
  requestedDocuments: RequestedDocument[];
  id: string;
  serviceId: ServiceId;
  serviceType: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  estimatedCompletionAt: Date | null;
  completedAt: Date | null;
  amount: number;
  isFreeService: boolean;
  speedTier: "standard" | "fast-track";
  attachments: Attachment[];
  resultDocuments: Attachment[];
  identifiers: Identifiers;
  officerAssignedId: string | null;
  result?: Record<string, unknown>;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

export function mapApplicationFromApi(raw: Record<string, unknown>): Application {
  return {
    requestedDocuments: (raw.requestedDocuments as RequestedDocument[]) ?? [],
    id: raw.id as string,
    serviceId: raw.serviceId as ServiceId,
    serviceType: raw.serviceType as string,
    status: raw.status as ApplicationStatus,
    createdAt: new Date(raw.createdAt as string),
    updatedAt: new Date(raw.updatedAt as string),
    estimatedCompletionAt: raw.estimatedCompletionAt
      ? new Date(raw.estimatedCompletionAt as string)
      : null,
    completedAt:
      raw.status === "completed" ? new Date(raw.updatedAt as string) : null,
    amount: (raw.amount as number) ?? 20,
    isFreeService: (raw.isFreeService as boolean) ?? false,
    speedTier: (raw.speedTier as "standard" | "fast-track") ?? "standard",
    attachments: (raw.attachments as Attachment[]) ?? [],
    resultDocuments: (raw.resultDocuments as Attachment[]) ?? [],
    identifiers: (raw.identifiers as Identifiers) ?? {},
    officerAssignedId: (raw.officerAssignedId as string) ?? null,
    result: raw.result as Record<string, unknown> | undefined,
  };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ApplicationStatus,
  {
    label: string;
    color: string;
    dotColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending_payment: {
    label: "Pending Payment",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-400",
    icon: CreditCard,
  },
  submitted: {
    label: "Submitted",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-400",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    dotColor: "bg-violet-400",
    icon: RefreshCw,
  },
  requires_documents: {
    label: "Docs Required",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    dotColor: "bg-orange-400",
    icon: Upload,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-400",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    color: "bg-red-50 text-red-700 border-red-200",
    dotColor: "bg-red-400",
    icon: AlertCircle,
  },
  refunded: {
    label: "Refunded",
    color: "bg-slate-50 text-slate-600 border-slate-200",
    dotColor: "bg-slate-400",
    icon: FileX,
  },
};

const SERVICE_ICONS: Record<ServiceId, React.ComponentType<{ className?: string }>> = {
  "overstay-fine": CalendarClock,
  "travel-ban": Plane,
  absconding: BriefcaseBusiness,
  "inside-outside": MapPin,
  "application-status": FileSearch,
  nawakas: FileWarning,
  "establishment-card": Building2,
  "expiry-checker": Clock,
};

const SERVICE_ACCENT: Record<ServiceId, string> = {
  "overstay-fine": "bg-gradient-to-br from-amber-500/5 to-amber-600/0 border-amber-200/50",
  "travel-ban": "bg-gradient-to-br from-red-500/5 to-red-600/0 border-red-200/50",
  absconding: "bg-gradient-to-br from-orange-500/5 to-orange-600/0 border-orange-200/50",
  "inside-outside": "bg-gradient-to-br from-blue-500/5 to-blue-600/0 border-blue-200/50",
  "application-status": "bg-gradient-to-br from-violet-500/5 to-violet-600/0 border-violet-200/50",
  nawakas: "bg-gradient-to-br from-yellow-500/5 to-yellow-600/0 border-yellow-200/50",
  "establishment-card": "bg-gradient-to-br from-slate-500/5 to-slate-600/0 border-slate-200/50",
  "expiry-checker": "bg-gradient-to-br from-teal-500/5 to-teal-600/0 border-teal-200/50",
};

const SERVICE_ICON_COLOR: Record<ServiceId, string> = {
  "overstay-fine": "text-amber-600 bg-amber-50",
  "travel-ban": "text-red-600 bg-red-50",
  absconding: "text-orange-600 bg-orange-50",
  "inside-outside": "text-blue-600 bg-blue-50",
  "application-status": "text-violet-600 bg-violet-50",
  nawakas: "text-yellow-600 bg-yellow-50",
  "establishment-card": "text-slate-600 bg-slate-50",
  "expiry-checker": "text-teal-600 bg-teal-50",
};

type FilterStatus = "all" | ApplicationStatus;

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "requires_documents", label: "Action Needed" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date | null | undefined, future = false): string {
  if (!date || isNaN(date.getTime())) return "—";
  const now = Date.now();
  const diff = future ? date.getTime() - now : now - date.getTime();
  const mins = Math.floor(Math.abs(diff) / (1000 * 60));
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${future ? "left" : "ago"}`;
  if (hours > 0) return `${hours}h ${future ? "left" : "ago"}`;
  if (mins > 0) return `${mins}m ${future ? "left" : "ago"}`;
  return future ? "very soon" : "just now";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatNationality(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

function formatIdentifierLabel(key: string): string {
  const map: Record<string, string> = {
    searchType: "Search By",
    passportNumber: "Passport No.",
    emiratesIdNumber: "Emirates ID",
    nationality: "Nationality",
    dateOfBirth: "Date of Birth",
    gender: "Gender",
    visaFileNumber: "Visa File",
    applicationNumber: "App. No.",
  };
  return map[key] ?? key.replace(/([A-Z])/g, " $1").trim();
}

function formatIdentifierValue(key: string, value: unknown): string {
  if (!value) return "—";
  if (key === "nationality" && typeof value === "string") return formatNationality(value);
  if (key === "dateOfBirth") {
    if (typeof value === "object" && value !== null) {
      const d = value as { year?: number; month?: number; day?: number };
      if (d.year && d.month && d.day)
        return new Date(d.year, d.month - 1, d.day).toLocaleDateString("en-AE", {
          day: "numeric", month: "short", year: "numeric",
        });
    }
    if (typeof value === "string")
      return new Date(value).toLocaleDateString("en-AE", {
        day: "numeric", month: "short", year: "numeric",
      });
  }
  if (key === "gender" && typeof value === "string")
    return value.charAt(0).toUpperCase() + value.slice(1);
  if (key === "searchType" && typeof value === "string")
    return value === "passport" ? "Passport" : "Emirates ID";
  return String(value);
}

// ─── Main Export ──────────────────────────────────────────────────────────────

interface ApplicationsSectionProps {
  applications: Application[];
  isAuthenticated: boolean;
  onSignIn?: () => void;
  onStartCheck?: () => void;
}

export function ApplicationsSection({
  // applications,
}: ApplicationsSectionProps) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const { applications: applicationsFromContext, fetchApplications } = useApplications();
  const filteredApps = applicationsFromContext.filter(
    (app) => filter === "all" || app.status === filter
  );
  const { user } = useAuth();
  const navigate = useNavigate();
  const onSignIn = () => {
    navigate("/login");
  };
  const onStartCheck = () => {
    navigate("/start-check");
  };
  const actionNeededCount = applicationsFromContext.filter(
    (a: any) => a.status === "requires_documents" || a.status === "pending_payment"
  ).length;
  console.log(applicationsFromContext, "applicationsFromContext");
  console.log(user, "user", applicationsFromContext, "applicationsFromContext");

  useEffect(() => {
    if (user) {
      fetchApplications();
    } else {
      setSelectedApp(null);
    }
  }, []);

  // ── Guest ──────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[#C4994F]/10 border border-[#C4994F]/20">
              <ShieldCheck className="h-10 w-10 text-[#C4994F]" />
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                Track Your Applications
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                Sign in to view your UAE status checks, upload documents, and receive
                results from our Amer-certified officers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="rounded-full bg-[#111] text-white hover:bg-[#333] gap-2"
                onClick={onSignIn}
              >
                <LogIn className="h-4 w-4" />
                Sign In to View Applications
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full gap-2"
                onClick={onStartCheck}
              >
                Start a New Check
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Ghost preview */}
            <div className="mt-4 grid grid-cols-3 gap-3 opacity-30 pointer-events-none select-none blur-[2px]">
              {["Travel Ban", "Overstay Fine", "Absconding"].map((s) => (
                <div key={s} className="rounded-xl border bg-card p-4 text-left space-y-2">
                  <div className="h-2 w-16 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-2 w-12 bg-muted rounded" />
                </div>
              ))}
            </div>

            {/* ✅ Golden Guarantee for Guest */}
            <GoldenGuaranteeCard />
          </motion.div>
        </div>
      </section>
    );
  }

  // ── Authenticated ──────────────────────────────────────────────────────────
  return (
    <section id="applications" className="py-16 md:py-24 bg-muted/20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold tracking-tight"
            >
              My Checks
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1 text-sm"
            >
              {applicationsFromContext.length} total ·{" "}
              {applicationsFromContext.filter((a: any) => a.status === "completed").length} completed
            </motion.p>
          </div>

          {actionNeededCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium self-start"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              {actionNeededCount} action{actionNeededCount > 1 ? "s" : ""} needed
            </motion.div>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => {
            const count =
              f.value === "all"
                ? applicationsFromContext.length
                : applicationsFromContext.filter((a: any) => a.status === f.value).length;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  filter === f.value
                    ? "bg-[#111] text-white shadow-sm"
                    : "bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none tabular-nums",
                      filter === f.value
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* List */}
        <AnimatePresence mode="popLayout">
          {filteredApps.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState filter={filter} onStartCheck={onStartCheck} />
            </motion.div>
          ) : (
            <div className="grid gap-3">
              {filteredApps.map((app: any, i: number) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <ApplicationCard application={app} onViewResult={() => setSelectedApp(app)} fetchApplications={fetchApplications} />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* ✅ Golden Guarantee Card - Bottom of Applications Section */}
        <GoldenGuaranteeCard />

        {/* Result modal */}
        <AnimatePresence>
          {selectedApp && (
            <ResultModal
              application={selectedApp}
              isOpen={!!selectedApp}
              onClose={() => setSelectedApp(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── Application Card ─────────────────────────────────────────────────────────

function ApplicationCard({
  application,
  onViewResult,
  fetchApplications,
}: {
  application: any;
  onViewResult: () => void;
  fetchApplications: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[application.status as ApplicationStatus];
  console.log(application);
  const StatusIcon = status.icon;
  const ServiceIcon = SERVICE_ICONS[application.serviceType as ServiceId] ?? FileSearch;
  const accentClass = SERVICE_ACCENT[application.serviceType as ServiceId] ?? "border";
  const iconColorClass = SERVICE_ICON_COLOR[application.serviceType as ServiceId] ?? "text-slate-600 bg-slate-50";

  const { toast } = useToast();

  async function handleUploadDocuments(application: Application, requestedDocumentId: string, file: File[] | null) {
    const id = application.id;
    if (!file) { toast({ title: 'Select a document to upload', description: 'Please select a document to upload', variant: 'destructive' }); return; }
    try {
      if (!requestedDocumentId) { toast({ title: 'Requested document not found', description: 'Please try again', variant: 'destructive' }); return; }
      const form = new FormData();
      file?.forEach(f => form.append('documents', f));
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/checks/${id}/documents/${requestedDocumentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: form,
      });
      if (!res.ok) throw new Error('Upload failed');
      toast({ title: 'Documents uploaded', variant: 'default' });
      fetchApplications();
    } catch (err: any) {
      toast({ title: err?.message || 'Upload failed', variant: 'destructive' });
      fetchApplications();
    }
  }

  const progress =
    application.status === "processing" && application.estimatedCompletionAt
      ? Math.min(
          ((Date.now() - application.createdAt.getTime()) /
            (application.estimatedCompletionAt.getTime() - application.createdAt.getTime())) * 100,
          92
        )
      : application.status === "completed"
      ? 100
      : 0;

  const identifierEntries = Object.entries(application.identifiers ?? {}).filter(
    ([k, v]) => v != null && v !== "" && k !== "searchType"
  );

  return (
    <div
      className={cn(
        "group relative rounded-2xl border overflow-hidden transition-all duration-300",
        "hover:shadow-md hover:-translate-y-0.5",
        accentClass
      )}
    >
      {/* Action-needed top accent */}
      {application.status === "requires_documents" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 animate-pulse" />
      )}

      <div className="p-4 sm:p-5">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn("flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center", iconColorClass)}>
            <ServiceIcon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <h3 className="font-semibold text-sm text-foreground leading-snug">
                {application.serviceType}
              </h3>
              {application.isFreeService && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-[#C4994F]/40 text-[#C4994F] bg-[#C4994F]/5">
                  Free
                </Badge>
              )}
              {application.speedTier === "fast-track" && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-violet-50 text-violet-700 border-violet-200">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                  Fast-Track
                </Badge>
              )}
            </div>

            {/* Status */}
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", status.color)}>
              <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", status.dotColor)} />
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
          </div>

          {/* Right meta */}
          <div className="flex-shrink-0 text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">{formatRelativeTime(application.createdAt)}</p>
            <p className="text-[10px] font-mono text-muted-foreground/50 mt-0.5">
              #{application.id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Identifier pills */}
        {identifierEntries.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {identifierEntries.slice(0, 4).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/80 border border-border/60 text-[11px] text-muted-foreground"
              >
                <IdentifierIcon k={key} />
                <span className="text-foreground/80 font-medium">{formatIdentifierValue(key, value)}</span>
              </span>
            ))}
            {identifierEntries.length > 4 && (
              <span className="px-2 py-0.5 rounded-md bg-background/80 border border-border/60 text-[11px] text-muted-foreground">
                +{identifierEntries.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Processing bar */}
        {application.status === "processing" && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Amer officer checking portal…
              </span>
              <span>
                {application.estimatedCompletionAt
                  ? `Est. ${formatRelativeTime(application.estimatedCompletionAt, true)}`
                  : "In progress"}
              </span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        {/* Requires documents */}
        {application.status === "requires_documents" && (
          <>
            {application?.requestedDocuments?.length > 0 && application?.requestedDocuments.map((doc: any) => {
              if (doc.fulfilledAt) return null;
              return (
                <div className="mt-3 flex items-center justify-between gap-3 p-3 rounded-xl bg-orange-50 border border-orange-200" key={doc._id}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Upload className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <p className="text-xs text-orange-700 font-medium truncate">
                      {doc.label}
                    </p>
                    <Input type="file" id={`document-input-${doc._id}`} onChange={(e) => handleUploadDocuments(application, doc._id, Array.from(e.target.files || []))} className="hidden" />
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full h-7 text-xs border-orange-300 text-orange-700 hover:bg-orange-100 flex-shrink-0"
                    onClick={() => document.getElementById(`document-input-${doc._id}`)?.click()}
                  >
                    Upload
                  </Button>
                </div>
              );
            })}
          </>
        )}

        {/* Completed */}
        {application.status === "completed" && (
          <div className="mt-3 flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <p className="text-xs text-emerald-700 font-medium">Result ready</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-100 flex-shrink-0"
              onClick={onViewResult}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Result
            </Button>
          </div>
        )}

        {/* Failed */}
        {application.status === "failed" && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700">
              Check failed — full refund has been initiated.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {application.attachments.length > 0 && (
              <button
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setExpanded((e) => !e)}
              >
                <Paperclip className="h-3 w-3" />
                {application.attachments.length} doc{application.attachments.length > 1 ? "s" : ""}
              </button>
            )}
            {application.resultDocuments.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-[#C4994F]">
                <Download className="h-3 w-3" />
                {application.resultDocuments.length} result{application.resultDocuments.length > 1 ? "s" : ""}
              </span>
            )}
            {!application.isFreeService && (
              <span className="text-[11px] text-muted-foreground">
                AED {application.amount || 20}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {application.status === "pending_payment" && (
              <Button size="sm" className="rounded-full h-7 text-xs bg-[#C4994F] hover:bg-[#a07840] text-white">
                <CreditCard className="h-3 w-3 mr-1" />
                Pay AED {application.amount || 20}
              </Button>
            )}
            {(application.status === "submitted" || application.status === "processing") && (
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                Track
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
            {application.attachments.length > 0 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
              >
                {expanded ? "Hide" : "Show docs"}
              </button>
            )}
          </div>
        </div>

        {/* Expanded attachments */}
        <AnimatePresence>
          {expanded && application.attachments.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 grid gap-1.5">
                {application.attachments.map((att: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/70 border border-border/50">
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-foreground truncate flex-1">{att.originalName}</span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatBytes(att.size)}</span>
                    <a href={`${import.meta.env.VITE_API_BASE_URL}/uploads/checks/${application.id}/${att.filename}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Identifier icon ──────────────────────────────────────────────────────────

function IdentifierIcon({ k }: { k: string }) {
  if (k === "nationality") return <Globe className="h-2.5 w-2.5" />;
  if (k === "gender") return <User className="h-2.5 w-2.5" />;
  if (k === "dateOfBirth") return <CalendarClock className="h-2.5 w-2.5" />;
  return <Hash className="h-2.5 w-2.5" />;
}

// ─── Result Modal ─────────────────────────────────────────────────────────────

function ResultModal({
  application,
  isOpen,
  onClose,
}: {
  application: any;
  isOpen: boolean;
  onClose: () => void;
}) {

  async function handleWhatsApp(doc: any) {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/uploads/checks/${application.id}/results/${doc.filename}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
    });
    if (!res.ok) throw new Error('WhatsApp failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  async function handleDownloadResult(doc: any) {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/uploads/checks/${application.id}/results/${doc.filename}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
  const ServiceIcon = SERVICE_ICONS[application.serviceType as ServiceId] ?? FileSearch;
  const iconColorClass = SERVICE_ICON_COLOR[application.serviceType as ServiceId] ?? "text-slate-600 bg-slate-50";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0", iconColorClass)}>
              <ServiceIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base">{application.serviceType}</span>
              <p className="text-xs font-normal text-muted-foreground mt-0.5">
                Completed {formatRelativeTime(application.completedAt)} ·{" "}
                #{application.id.slice(-8).toUpperCase()}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Immigration status check result
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {/* Completed badge */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">
              Verified by Amer-certified officer
            </p>
          </div>

          {/* Who was checked */}
          {Object.keys(application.identifiers ?? {}).length > 0 && (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Checked For
                </h4>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {Object.entries(application.identifiers).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                      {formatIdentifierLabel(key)}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {formatIdentifierValue(key, value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result details */}
          {application.result && Object.keys(application.result).length > 0 ? (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Result
                </h4>
              </div>
              <div className="p-4 space-y-3">
                {Object.entries(application.result).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start gap-4">
                    <span className="text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-sm font-medium text-right">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-2">
              Full result is in the document below
            </p>
          )}

          {/* Result documents */}
          {application.resultDocuments.length > 0 && (
            <div className="space-y-2">
              {application.resultDocuments.map((doc: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                  <FileSearch className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm flex-1 truncate">{doc.filename}</span>
                  <Button size="sm" variant="ghost" className="h-7 rounded-full px-3 flex-shrink-0" onClick={() => handleDownloadResult(doc)}>
                    <Download className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Save</span>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 rounded-full gap-2" onClick={() => handleDownloadResult(application.resultDocuments[0])}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button className="flex-1 rounded-full bg-[#25D366] hover:bg-[#1fb855] text-white gap-2"
              onClick={() => handleWhatsApp(application.resultDocuments[0])}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filter, onStartCheck }: { filter: FilterStatus; onStartCheck?: () => void }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
        <FileSearch className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1.5">
        {filter === "all" ? "No checks submitted yet" : `No ${filter.replace(/_/g, " ")} checks`}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        {filter === "all"
          ? "Start your first UAE status check — results delivered within hours by Amer-certified officers."
          : "Checks with this status will appear here."}
      </p>
      {filter === "all" && (
        <Button
          className="rounded-full bg-[#111] text-white hover:bg-[#333] gap-2"
          onClick={onStartCheck}
        >
          <Sparkles className="h-4 w-4" />
          Start Your First Check
        </Button>
      )}
    </div>
  );
}

// ─── Section: Golden Guarantee ──────────────────────────────────────────────

const GoldenGuaranteeCard = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const isArabic = language === 'ar';

  return (
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.3 }}
  className="mt-6 sm:mt-8 max-w-3xl mx-auto"
>
  <a
    href="/legal#guarantee"
    target="_blank"
    rel="noopener noreferrer"
    className="block"
  >
    <div className="relative rounded-xl border border-amber-500/30 dark:border-amber-500/20 bg-white/50 dark:bg-black/40 backdrop-blur-sm p-3 sm:p-4 transition-all duration-300 group hover:shadow-sm hover:shadow-amber-500/5 cursor-pointer">
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3">
        {/* Icon */}
        <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/15 border border-amber-500/15 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
          <Award className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-light text-black dark:text-white text-sm sm:text-base flex flex-wrap items-center gap-1.5 sm:gap-2">
            {isArabic ? 'الضمان الذهبي من TMMT' : 'TMMT Golden Guarantee'}
            <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-0 text-[7px] sm:text-[8px] px-1.5 sm:px-2 py-0.5 rounded-full font-light">
              ✓ Trusted
            </Badge>
          </h4>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-white/50 leading-relaxed mt-0.5 max-w-2xl font-light">
            {isArabic
              ? 'إذا حدث خطأ بسبب TMMT، سنقوم بتصحيحه دون أي رسوم خدمة إضافية وفقاً لسياسة الضمان الخاصة بنا.'
              : 'If an issue is caused by TMMT, we will correct it at no additional service fee according to our guarantee policy.'}
          </p>
          <span className="inline-flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-light transition-all duration-300 group-hover:gap-1.5">
            <span>{isArabic ? 'اقرأ المزيد عن الضمان' : 'Read more about the guarantee'}</span>
            <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </div>
  </a>
</motion.div>
  );
};

export default ApplicationsSection;