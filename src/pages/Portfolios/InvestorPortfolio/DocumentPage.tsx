"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { 
  FileText, 
  Download, 
  Eye, 
  Lock,
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Zap, 
  FolderOpen,
  Search,
  X,
  Upload,
  Sparkles,
  TrendingUp,
  Shield,
  User,
  Calendar,
  ChevronRight,
} from 'lucide-react'
import { toast } from "sonner"
import { Layout } from "../../Dashboards/InvestorDashboard/Layout"
import { useApplications } from "@/hooks/useApplications"
import { DocumentUploadDialog } from "@/components/AmerDashboard/DocumentUploadDialog"

const DocumentsPage = () => {
  const { applications, loading, refreshApplications } = useApplications()

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState('all')

  // ─── Preview Modal State ──────────────────────────────────────────────
  const [previewDoc, setPreviewDoc] = useState<any>(null)
  const [previewApp, setPreviewApp] = useState<any>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  // ─── Upload Dialog State ──────────────────────────────────────────────
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedAppIdForUpload, setSelectedAppIdForUpload] = useState<string | null>(null)

  // ─── Role check ────────────────────────────────────────────────────────
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
  const isAmer = userRole === 'amer' || userRole === 'admin'

  // ─── Brand Color ──────────────────────────────────────────────────────────
  const primaryColor = '#14235E'

  const getAppId = (app: any) => app?._id || app?.id
  const getDocId = (doc: any) => doc?._id || doc?.id

  // ─── Get file URL for preview ─────────────────────────────────────────
  const getFileUrl = (doc: any, app: any): string => {
    if (!doc) return ''
    if (doc.url) return doc.url
    if (doc.fileUrl) return doc.fileUrl
    if (doc.secure_url) return doc.secure_url
    if (doc.downloadUrl) return doc.downloadUrl
    if (doc.previewUrl) return doc.previewUrl

    if (doc.path) {
      if (doc.path.startsWith('http://') || doc.path.startsWith('https://')) {
        return doc.path
      }
      if (doc.path.startsWith('/')) {
        return `${apiBase}${doc.path}`
      }
      const appId = getAppId(app)
      if (appId) {
        return `${apiBase}/uploads/applications/${appId}/${doc.path}`
      }
    }
    if (doc.filename) {
      const appId = getAppId(app)
      if (appId) {
        return `${apiBase}/uploads/applications/${appId}/${doc.filename}`
      }
    }
    return ''
  }

  const isImage = (doc: any, url: string): boolean => {
    if (!url) return false
    const mime = doc.mimeType || ''
    if (mime.startsWith('image/')) return true
    const ext = doc.originalName?.split('.').pop()?.toLowerCase() || ''
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif'].includes(ext)
  }

  const isPdf = (doc: any, url: string): boolean => {
    if (!url) return false
    const mime = doc.mimeType || ''
    if (mime === 'application/pdf') return true
    const ext = doc.originalName?.split('.').pop()?.toLowerCase() || ''
    return ext === 'pdf'
  }

  const handleDownloadDocument = async (doc: any, app: any) => {
    try {
      const token = localStorage.getItem('authToken') || ''
      const response = await fetch(
        `${apiBase}/api/v1/visa/${getAppId(app)}/attachments/${getDocId(doc)}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.originalName || doc.filename || 'document'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Downloading ${doc.originalName || doc.filename || 'document'}...`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download document')
    }
  }

  const handleViewDocument = (doc: any, app: any) => {
    setPreviewDoc(doc)
    setPreviewApp(app)
    setImageError(false)
    setIsPreviewOpen(true)
  }

  const closePreview = () => {
    setIsPreviewOpen(false)
    setPreviewDoc(null)
    setPreviewApp(null)
  }

  const statusPill = (status: string) => {
    const map: Record<string, { bg: string; text: string; icon: any; border: string }> = {
      approved: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        icon: CheckCircle2,
        border: 'border-emerald-200 dark:border-emerald-800/30',
      },
      pending: {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-400',
        icon: Clock,
        border: 'border-amber-200 dark:border-amber-800/30',
      },
      rejected: {
        bg: 'bg-red-50 dark:bg-red-950/30',
        text: 'text-red-700 dark:text-red-400',
        icon: AlertTriangle,
        border: 'border-red-200 dark:border-red-800/30',
      },
    }
    const cfg = map[status]
    if (!cfg) return null
    const Icon = cfg.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-light ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
        <Icon className="w-2.5 h-2.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const titleCase = (s: string) =>
    s
      ?.replace(/_/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

  const openUploadDialog = (appId: string) => {
    setSelectedAppIdForUpload(appId)
    setUploadDialogOpen(true)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
          <div className="text-center">
            <div className="rounded-full h-12 w-12 border-2 border-[#14235E] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-light">Loading documents...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const submittedCount = applications.reduce((sum, app) => sum + (app.attachments?.length || 0), 0)
  const resultCount = applications.reduce((sum, app) => sum + ((app as any).resultDocuments?.length || 0), 0)
  const approvedCount = applications.reduce(
    (sum, app) => sum + (app.attachments?.filter((a: any) => a.status === 'approved').length || 0),
    0
  )
  const pendingCount = applications.reduce(
    (sum, app) => sum + (app.attachments?.filter((a: any) => a.status === 'pending').length || 0),
    0
  )

  const stats = [
    {
      label: 'Total Documents',
      value: submittedCount + resultCount,
      icon: FileText,
      color: 'bg-[#14235E]',
      textColor: 'text-white',
      sub: 'All documents',
    },
    {
      label: 'Submitted',
      value: submittedCount,
      icon: FolderOpen,
      color: 'bg-[#1a4a7a]',
      textColor: 'text-white',
      sub: 'Uploaded by you',
    },
    {
      label: 'Results',
      value: resultCount,
      icon: CheckCircle2,
      color: 'bg-emerald-600',
      textColor: 'text-white',
      sub: 'From Amer',
    },
    {
      label: 'Pending Review',
      value: pendingCount,
      icon: Clock,
      color: 'bg-amber-600',
      textColor: 'text-white',
      sub: 'Awaiting approval',
    },
  ]

  // ─── Document Row ─────────────────────────────────────────────────────
  const DocRow = ({ doc, app, variant, index }: { doc: any; app: any; variant: 'submitted' | 'result'; index: number }) => {
    const isResult = variant === 'result'
    const fileUrl = getFileUrl(doc, app)

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md
          ${isResult
            ? 'bg-emerald-50/60 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-700/50'
            : 'bg-white dark:bg-black/20 border-gray-200/60 dark:border-white/5 hover:border-[#14235E]/30'}
          `}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-300
              ${isResult
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-[#14235E]/10 text-[#14235E]'}`}
          >
            {isResult ? <Zap className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-xs sm:text-sm font-light truncate ${isResult ? 'text-gray-900 dark:text-gray-100' : 'text-gray-900 dark:text-white'}`}>
              {isResult ? (doc.label || doc.originalName || 'Result Document') : (doc.filename || doc.originalName || 'Document')}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {isResult ? (
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-light">
                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                </p>
              ) : (
                doc.status && statusPill(doc.status)
              )}
              {isResult && doc.uploadedByRole && (
                <Badge variant="outline" className="text-[9px] border-gray-200/50 dark:border-gray-700/50 text-gray-500 dark:text-gray-400 font-light px-1.5 py-0">
                  by {doc.uploadedByRole}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 rounded-lg p-0 transition-all duration-300 ${
              isResult
                ? 'text-gray-500 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                : 'text-gray-500 dark:text-gray-400 hover:bg-[#14235E]/10'
            }`}
            onClick={() => handleViewDocument(doc, app)}
            title="View"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 rounded-lg p-0 transition-all duration-300 ${
              isResult
                ? 'text-gray-500 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                : 'text-gray-500 dark:text-gray-400 hover:bg-[#14235E]/10'
            }`}
            onClick={() => handleDownloadDocument(doc, app)}
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.div>
    )
  }

  // ─── Preview Modal ──────────────────────────────────────────────────────
  const renderPreviewContent = () => {
    if (!previewDoc || !previewApp) return null

    const fileUrl = getFileUrl(previewDoc, previewApp)
    const isImageDoc = isImage(previewDoc, fileUrl)
    const isPdfDoc = isPdf(previewDoc, fileUrl)

    if (!fileUrl) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 p-8">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
          <p>Document URL not found</p>
        </div>
      )
    }

    if (isImageDoc) {
      return (
        <div className="relative w-full flex items-center justify-center min-h-[200px]">
          {!imageError ? (
            <img
              src={fileUrl}
              alt={previewDoc.originalName || 'Document'}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
              <p>Failed to load image</p>
              <Button
                onClick={() => window.open(fileUrl, '_blank')}
                className="mt-4 bg-[#14235E] text-white hover:bg-[#1A4A8A]"
              >
                Open in new tab
              </Button>
            </div>
          )}
        </div>
      )
    }

    if (isPdfDoc) {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-[70vh] border-0 rounded-lg"
          title={previewDoc.originalName || 'PDF Document'}
        />
      )
    }

    return (
      <div className="text-center text-gray-500 dark:text-gray-400 p-8">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
        <p>Preview not available for this file type</p>
        <Button
          onClick={() => window.open(fileUrl, '_blank')}
          className="mt-4 bg-[#14235E] text-white hover:bg-[#1A4A8A]"
        >
          Open in new tab
        </Button>
      </div>
    )
  }

  // ─── Empty State ───────────────────────────────────────────────────────
  const EmptyState = ({ icon: Icon, title, subtitle, action }: { icon: any; title: string; subtitle?: string; action?: React.ReactNode }) => (
    <Card className="border border-dashed border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-black/20 rounded-xl">
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-[#14235E]/10 flex items-center justify-center">
            <Icon className="h-8 w-8 text-[#14235E]/40" />
          </div>
          <p className="text-base font-light text-gray-900 dark:text-white">{title}</p>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 font-light mt-1">{subtitle}</p>}
          {action && <div className="mt-4">{action}</div>}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-black/20 transition-colors duration-200 p-2">
        <div className="space-y-5">
          {/* ─── Header ────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <div className="p-1.5 rounded-lg bg-[#14235E]">
                  <FolderOpen className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-white tracking-tight">
                  Documents
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light ml-1">
                Manage all your application documents and results in one place
              </p>
            </div>
            {isAmer && applications.length > 0 && (
              <Button
                onClick={() => openUploadDialog(getAppId(applications[0]))}
                className="bg-[#14235E] text-white hover:bg-[#1A4A8A] rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Results
              </Button>
            )}
          </div>

          {/* ─── Stats Cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="rounded-xl border border-gray-200/60 dark:border-white/5 bg-white dark:bg-black/40">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs font-light text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white mt-0.5">
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-light mt-0.5">{stat.sub}</p>
                    </div>
                    <div className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg ${stat.color} ${stat.textColor} shadow-sm`}>
                      <stat.icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ─── Search Bar ────────────────────────────────────────────── */}
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-black/10 border border-gray-200/60 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#14235E]/30 focus:border-transparent text-gray-900 dark:text-white text-sm font-light placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-300"
            />
          </div>

          {/* ─── Tabs ───────────────────────────────────────────────────── */}
          <Tabs defaultValue="all" className="space-y-4" onValueChange={setSelectedTab}>
            <TabsList className="bg-white dark:bg-black/10 border border-gray-200/60 dark:border-white/5 p-1 rounded-lg backdrop-blur-sm">
              <TabsTrigger 
                value="all" 
                className="rounded-md text-xs font-light data-[state=active]:bg-[#14235E] data-[state=active]:text-white text-gray-600 dark:text-gray-400 transition-all duration-300 px-3 py-1.5"
              >
                All Documents
              </TabsTrigger>
              <TabsTrigger 
                value="submitted" 
                className="rounded-md text-xs font-light data-[state=active]:bg-[#14235E] data-[state=active]:text-white text-gray-600 dark:text-gray-400 transition-all duration-300 px-3 py-1.5"
              >
                <FileText className="h-3 w-3 mr-1.5" />
                Submitted
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                className="rounded-md text-xs font-light data-[state=active]:bg-[#14235E] data-[state=active]:text-white text-gray-600 dark:text-gray-400 transition-all duration-300 px-3 py-1.5"
              >
                <CheckCircle2 className="h-3 w-3 mr-1.5" />
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {applications.length === 0 ? (
                <EmptyState 
                  icon={FileText} 
                  title="No documents yet" 
                  subtitle="Start an application to upload and manage your documents"
                />
              ) : (
                applications.map((app) => {
                  const hasSubmitted = app.attachments && app.attachments.length > 0
                  const hasResults = (app as any).resultDocuments && (app as any).resultDocuments.length > 0

                  if (!hasSubmitted && !hasResults) return null

                  return (
                    <Card key={getAppId(app)} className="rounded-xl border border-gray-200/60 dark:border-white/5 bg-white dark:bg-black/10 transition-shadow duration-300 overflow-hidden hover:shadow-sm dark:hover:shadow-white/5">
                      <CardHeader className="border-b border-gray-100/50 dark:border-white/5 pb-3 px-4 pt-4 sm:px-5 sm:pt-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#14235E]/10 flex items-center justify-center">
                              <FolderOpen className="w-4 h-4 text-[#14235E]" />
                            </div>
                            <div>
                              <CardTitle className="text-sm sm:text-base font-light text-gray-900 dark:text-white">
                                {titleCase(app.applicationType)}
                              </CardTitle>
                              <CardDescription className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-light">
                                Created: {new Date(app.createdAt).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className="rounded-full px-3 py-0.5 font-light bg-[#14235E]/5 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-white/5 text-[10px]">
                            {hasSubmitted ? app.attachments.length : 0} submitted · {hasResults ? (app as any).resultDocuments.length : 0} results
                          </Badge>
                          {isAmer && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUploadDialog(getAppId(app))}
                              className="text-[10px] rounded-lg border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#14235E] hover:text-[#14235E]"
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              Upload Results
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                  <CardContent className="pt-4 pb-4 px-4 sm:px-6 space-y-5">
  {hasSubmitted && (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <div className="p-1 rounded-lg bg-[#14235E]/10">
            <FileText className="w-3.5 h-3.5 text-[#14235E]" />
          </div>
          <span>Submitted Documents</span>
          <Badge className="bg-[#14235E]/5 text-[#14235E] border-0 text-[10px] font-light px-2 py-0 rounded-full">
            {app.attachments.length}
          </Badge>
        </h4>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-[10px] text-gray-400 hover:text-[#14235E] hover:bg-[#14235E]/5 rounded-lg px-2"
        >
          View All
          <ChevronRight className="w-3 h-3 ml-0.5" />
        </Button>
      </div>
      <div className="space-y-2">
        {app.attachments.slice(0, 3).map((doc: any, idx: number) => (
          <DocRow key={getDocId(doc) || idx} doc={doc} app={app} variant="submitted" index={idx} />
        ))}
        {app.attachments.length > 3 && (
          <button className="w-full text-center text-[10px] text-gray-400 hover:text-[#14235E] py-1.5 transition-colors duration-200 font-light">
            + {app.attachments.length - 3} more documents
          </button>
        )}
      </div>
    </div>
  )}

  {hasResults && (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span>Result Documents</span>
          <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-0 text-[10px] font-light px-2 py-0 rounded-full">
            {(app as any).resultDocuments.length}
          </Badge>
        </h4>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-[10px] text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg px-2"
        >
          View All
          <ChevronRight className="w-3 h-3 ml-0.5" />
        </Button>
      </div>
      <div className="space-y-2">
        {(app as any).resultDocuments.slice(0, 3).map((doc: any, idx: number) => (
          <DocRow key={getDocId(doc) || idx} doc={doc} app={app} variant="result" index={idx} />
        ))}
        {(app as any).resultDocuments.length > 3 && (
          <button className="w-full text-center text-[10px] text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 py-1.5 transition-colors duration-200 font-light">
            + {(app as any).resultDocuments.length - 3} more results
          </button>
        )}
      </div>
    </div>
  )}
</CardContent>
                    </Card>
                  )
                })
              )}
            </TabsContent>

            <TabsContent value="submitted" className="space-y-4">
              {applications.filter((app) => app.attachments && app.attachments.length > 0).length === 0 ? (
                <EmptyState icon={FileText} title="No submitted documents" subtitle="Upload documents through your applications" />
              ) : (
                applications
                  .filter((app) => app.attachments && app.attachments.length > 0)
                  .map((app) => (
                    <Card key={getAppId(app)} className="rounded-xl border border-gray-200/60 dark:border-white/5 bg-white dark:bg-black/40 transition-shadow duration-300 overflow-hidden hover:shadow-sm dark:hover:shadow-white/5">
                      <CardHeader className="border-b border-gray-100/50 dark:border-white/5 pb-3 px-4 pt-4 sm:px-5 sm:pt-5">
                        <CardTitle className="text-sm sm:text-base font-light text-gray-900 dark:text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#14235E]" />
                          {titleCase(app.applicationType)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-3 pb-3 px-4 sm:px-5">
                        <div className="space-y-1.5">
                          {app.attachments.map((doc: any, idx: number) => (
                            <DocRow key={getDocId(doc) || idx} doc={doc} app={app} variant="submitted" index={idx} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {applications.filter((app) => (app as any).resultDocuments && (app as any).resultDocuments.length > 0).length === 0 ? (
                <EmptyState 
                  icon={CheckCircle2} 
                  title="No result documents yet" 
                  subtitle={isAmer ? "Upload result documents using the 'Upload Results' button" : "Results will appear here once the Amer officer uploads them"}
                  action={
                    isAmer && applications.length > 0 && (
                      <Button
                        onClick={() => openUploadDialog(getAppId(applications[0]))}
                        className="bg-[#14235E] text-white hover:bg-[#1A4A8A] rounded-xl px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Results Now
                      </Button>
                    )
                  }
                />
              ) : (
                applications
                  .filter((app) => (app as any).resultDocuments && (app as any).resultDocuments.length > 0)
                  .map((app) => (
                    <Card key={getAppId(app)} className="rounded-xl border border-emerald-200/60 dark:border-emerald-800/20 bg-emerald-50/30 dark:bg-emerald-950/5 transition-shadow duration-300 overflow-hidden hover:shadow-sm">
                      <CardHeader className="border-b border-emerald-100/40 dark:border-emerald-800/15 pb-3 px-4 pt-4 sm:px-5 sm:pt-5">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm sm:text-base font-light flex items-center gap-2 text-gray-900 dark:text-white">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            {titleCase(app.applicationType)}
                          </CardTitle>
                          {isAmer && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUploadDialog(getAppId(app))}
                              className="text-[10px] rounded-lg border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#14235E] hover:text-[#14235E]"
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              More Results
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3 pb-3 px-4 sm:px-5">
                        <div className="space-y-1.5">
                          {(app as any).resultDocuments.map((doc: any, idx: number) => (
                            <DocRow key={getDocId(doc) || idx} doc={doc} app={app} variant="result" index={idx} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ─── Preview Modal ─────────────────────────────────────────────────── */}
      <Dialog open={isPreviewOpen} onOpenChange={closePreview}>
        <DialogContent className="max-w-5xl max-h-[100vh] w-[95vw] bg-white dark:bg-black/95 border border-gray-200/50 dark:border-white/10 p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200/50 dark:border-white/10">
            <DialogTitle className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white truncate">
              <FileText className="h-4 w-4 text-[#14235E]" />
              {previewDoc?.originalName || previewDoc?.filename || 'Document'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={closePreview}
              className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] flex items-center justify-center bg-gray-50/50 dark:bg-black/30">
            {renderPreviewContent()}
          </div>
          <div className="flex items-center justify-between p-3 border-t border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-black/20">
            <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Secure
              </span>
              <span className="w-px h-3 bg-gray-300 dark:bg-gray-700" />
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Verified
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={closePreview}
                className="h-8 text-xs rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
              >
                Close
              </Button>
              {previewDoc && previewApp && (
                <Button
                  size="sm"
                  onClick={() => handleDownloadDocument(previewDoc, previewApp)}
                  className="h-8 text-xs bg-[#14235E] text-white hover:bg-[#1A4A8A] rounded-lg px-3"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Upload Dialog ────────────────────────────────────────────────── */}
      {selectedAppIdForUpload && (
        <DocumentUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          applicationId={selectedAppIdForUpload}
          isResultDocument={true}
          onUploadComplete={() => {
            refreshApplications();
            toast.success('Results uploaded successfully! Refreshing...');
          }}
        />
      )}
    </Layout>
  )
}

export default DocumentsPage