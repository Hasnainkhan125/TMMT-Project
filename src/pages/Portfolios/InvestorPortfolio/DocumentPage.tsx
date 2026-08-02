"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Zap, 
  FolderOpen,
  Search,
  Filter,
  Grid3x3,
  List,
  ChevronDown,
  Plus,
  TrendingUp,
} from 'lucide-react'
import { toast } from "sonner"
import { Layout } from "../../Dashboards/InvestorDashboard/Layout"
import { useApplications } from "@/hooks/useApplications"

const DocumentsPage = () => {
  const { applications, loading, refreshApplications } = useApplications()

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedTab, setSelectedTab] = useState('all')

  const getAppId = (app: any) => app?._id || app?.id
  const getDocId = (doc: any) => doc?._id || doc?.id

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
      a.download = doc.originalName || doc.filename
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
  try {
    // Check if the path is already a full URL
    if (doc.path && doc.path.startsWith('http')) {
      // If it's already a full URL, open it directly
      window.open(doc.path, '_blank');
    } else {
      // Otherwise, construct the URL
      const fileUrl = `${apiBase}/uploads/applications/${getAppId(app)}/${doc.path}`;
      window.open(fileUrl, '_blank');
    }
  } catch (error) {
    console.error('View error:', error);
    toast.error('Failed to open document');
  }
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
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
        <Icon className="w-3 h-3" />
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

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
          <div className="text-center">
            <div className="rounded-full h-12 w-12 border-2 border-[#0D1F3C] dark:border-white border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading documents...</p>
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
      color: 'from-[#0D1F3C] to-[#1a2a4a]',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Submitted',
      value: submittedCount,
      icon: FolderOpen,
      color: 'from-blue-500 to-blue-600',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Results',
      value: resultCount,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-emerald-600',
      trend: '+5%',
      trendUp: true,
    },
    {
      label: 'Pending Review',
      value: pendingCount,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      trend: '-2%',
      trendUp: false,
    },
  ]

  const DocRow = ({ doc, app, variant, index }: { doc: any; app: any; variant: 'submitted' | 'result'; index: number }) => {
    const isResult = variant === 'result'

    return (
      <div
        className={`flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all duration-300 
          ${isResult
            ? 'bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-black/40 border-emerald-200/50 dark:border-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-lg hover:shadow-emerald-500/5'
            : 'bg-white dark:bg-black/40 border-gray-200/80 dark:border-white/10 hover:border-[#0D1F3C]/30 dark:hover:border-white/20 hover:shadow-lg hover:shadow-[#0D1F3C]/5 dark:hover:shadow-white/5'}
          hover:-translate-y-0.5 transition-all duration-300`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-all duration-300
              ${isResult
                ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-gradient-to-br from-[#0D1F3C]/10 to-[#1a2a4a]/5 dark:from-white/10 dark:to-white/5 text-[#0D1F3C] dark:text-white'}`}
          >
            {isResult ? <Zap className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-semibold truncate ${isResult ? 'text-gray-900 dark:text-gray-100' : 'text-gray-900 dark:text-white'}`}>
              {isResult ? (doc.label || doc.originalName || 'Result Document') : (doc.filename || doc.originalName || 'Document')}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {isResult ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              ) : (
                doc.status && statusPill(doc.status)
              )}
              {isResult && doc.uploadedByRole && (
                <Badge variant="outline" className="text-[10px] border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
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
            className={`h-9 w-9 rounded-xl p-0 transition-all duration-300 ${
              isResult
                ? 'text-gray-600 hover:bg-emerald-100 dark:text-gray-400 dark:hover:bg-emerald-900/30'
                : 'text-gray-600 hover:bg-[#0D1F3C]/10 dark:text-gray-400 dark:hover:bg-white/10'
            }`}
            onClick={() => handleViewDocument(doc, app)}
            title="View"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-9 w-9 rounded-xl p-0 transition-all duration-300 ${
              isResult
                ? 'text-gray-600 hover:bg-emerald-100 dark:text-gray-400 dark:hover:bg-emerald-900/30'
                : 'text-gray-600 hover:bg-[#0D1F3C]/10 dark:text-gray-400 dark:hover:bg-white/10'
            }`}
            onClick={() => handleDownloadDocument(doc, app)}
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>
          {/* ❌ DELETE BUTTON REMOVED */}
        </div>
      </div>
    )
  }

  const EmptyState = ({ icon: Icon, title, subtitle, action }: { icon: any; title: string; subtitle?: string; action?: React.ReactNode }) => (
    <Card className="border-2 border-dashed border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="text-center py-16">
          <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0D1F3C]/10 to-[#1a2a4a]/5 dark:from-white/10 dark:to-white/5 flex items-center justify-center">
            <Icon className="h-10 w-10 text-[#0D1F3C]/40 dark:text-white/30" />
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">{title}</p>
          {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>}
          {action && <div className="mt-6">{action}</div>}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0a0a0f] dark:via-[#14141e] dark:to-[#0a0a0f] transition-colors duration-200">
        <div className="space-y-6 p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#0D1F3C] to-[#1a2a4a] shadow-lg shadow-[#0D1F3C]/25">
                  <FolderOpen className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Documents
                </h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 ml-1">
                Manage all your application documents and results in one place
              </p>
            </div>
            <div className="flex items-center gap-3">
           
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-0 bg-white dark:bg-black/40 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:shadow-black/5 dark:hover:shadow-white/5 rounded-2xl">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-text-secondary truncate text-xs font-medium uppercase tracking-wide">
                        {stat.label}
                      </p>
                      <p className="text-foreground mt-1 text-2xl font-bold tracking-tight">
                        {stat.value}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-xs">
                        <span className={stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}>
                          {stat.trend}
                        </span>
                        <span className="text-text-secondary">vs last month</span>
                      </div>
                    </div>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg shadow-${stat.color.split(' ')[1]}/25`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 dark:focus:ring-white/20 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-300"
            />
          </div>

          {/* Documents Tabs */}
          <Tabs defaultValue="all" className="space-y-4" onValueChange={setSelectedTab}>
            <TabsList className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 p-1 rounded-xl backdrop-blur-sm">
              <TabsTrigger 
                value="all" 
                className="rounded-lg data-[state=active]:bg-[#0D1F3C] dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-[#0D1F3C]/25 text-gray-600 dark:text-gray-400 transition-all duration-300"
              >
                All Documents
              </TabsTrigger>
              <TabsTrigger 
                value="submitted" 
                className="rounded-lg data-[state=active]:bg-[#0D1F3C] dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-[#0D1F3C]/25 text-gray-600 dark:text-gray-400 transition-all duration-300"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Submitted
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                className="rounded-lg data-[state=active]:bg-[#0D1F3C] dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-[#0D1F3C]/25 text-gray-600 dark:text-gray-400 transition-all duration-300"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {applications.length === 0 ? (
                <EmptyState 
                  icon={FileText} 
                  title="No documents yet" 
                  subtitle="Start an application to upload and manage your documents"
                  action={
                    <Button className="bg-[#0D1F3C] hover:bg-[#1a2a4a] text-white rounded-xl shadow-lg shadow-[#0D1F3C]/25">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Application
                    </Button>
                  }
                />
              ) : (
                applications.map((app) => {
                  const hasSubmitted = app.attachments && app.attachments.length > 0
                  const hasResults = (app as any).resultDocuments && (app as any).resultDocuments.length > 0

                  if (!hasSubmitted && !hasResults) return null

                  return (
                    <Card key={getAppId(app)} className="border border-gray-200/80 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-[#0D1F3C]/5 dark:hover:shadow-white/5 transition-all duration-300 rounded-2xl overflow-hidden">
                      <CardHeader className="border-b border-gray-100 dark:border-white/5 pb-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D1F3C]/10 to-[#1a2a4a]/5 dark:from-white/10 dark:to-white/5 flex items-center justify-center">
                              <FolderOpen className="w-5 h-5 text-[#0D1F3C] dark:text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white">
                                {titleCase(app.applicationType)}
                              </CardTitle>
                              <CardDescription className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                                Created: {new Date(app.createdAt).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className="rounded-full px-4 py-1.5 font-medium bg-[#0D1F3C]/5 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                            {hasSubmitted ? app.attachments.length : 0} submitted · {hasResults ? (app as any).resultDocuments.length : 0} results
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-6">
                        {hasSubmitted && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#0D1F3C] dark:text-white" />
                              Submitted Documents ({app.attachments.length})
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                              {app.attachments.map((doc: any, idx: number) => (
                                <DocRow key={getDocId(doc) || idx} doc={doc} app={app} variant="submitted" index={idx} />
                              ))}
                            </div>
                          </div>
                        )}

                        {hasResults && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              Result Documents ({(app as any).resultDocuments.length})
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                              {(app as any).resultDocuments.map((doc: any, idx: number) => (
                                <DocRow key={getDocId(doc) || idx} doc={doc} app={app} variant="result" index={idx} />
                              ))}
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
                    <Card key={getAppId(app)} className="border border-gray-200/80 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-[#0D1F3C]/5 dark:hover:shadow-white/5 transition-all duration-300 rounded-2xl overflow-hidden">
                      <CardHeader className="border-b border-gray-100 dark:border-white/5 pb-4">
                        <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white flex items-center gap-2">
                          <FileText className="w-5 h-5 text-[#0D1F3C] dark:text-white" />
                          {titleCase(app.applicationType)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 gap-3">
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
                  subtitle="Results will appear here when your applications are processed" 
                />
              ) : (
                applications
                  .filter((app) => (app as any).resultDocuments && (app as any).resultDocuments.length > 0)
                  .map((app) => (
                    <Card key={getAppId(app)} className="border border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/30 to-white dark:from-emerald-950/10 dark:to-black/20 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 rounded-2xl overflow-hidden">
                      <CardHeader className="border-b border-emerald-100/50 dark:border-emerald-800/20 pb-4">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          {titleCase(app.applicationType)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 gap-3">
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
    </Layout>
  )
}

export default DocumentsPage