"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { FileText, Download, Eye, CheckCircle2, Clock, AlertTriangle, Zap, Trash2, Loader2, FolderOpen } from 'lucide-react'
import { toast } from "sonner"
import { Layout } from "../../Dashboards/InvestorDashboard/Layout"
import { useApplications } from "@/hooks/useApplications"

const DocumentsPage = () => {
  const { applications, loading, deleteDocument, refreshApplications } = useApplications()

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

  // Tracks which document is currently being deleted so we can disable
  // its button / show a spinner instead of the trash icon, and prevent
  // duplicate delete requests for the same document.
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
      const fileUrl = `${apiBase}/uploads/applications/${getAppId(app)}/${doc.path}`
      window.open(fileUrl, '_blank')
    } catch (error) {
      toast.error('Failed to open document')
    }
  }

  const handleDeleteDocument = async (doc: any, app: any) => {
    const docId = getDocId(doc)
    const appId = getAppId(app)
    const label = doc.filename || doc.originalName || 'this document'

    if (!docId || !appId) {
      toast.error('Unable to identify this document')
      return
    }

    // Guard against double-clicks firing a second delete request
    // while the first one is still in flight.
    if (deletingId === docId) return

    const confirmed = window.confirm(`Delete "${label}"? This action cannot be undone.`)
    if (!confirmed) return

    setDeletingId(docId)
    try {
      // Call the deleteDocument function from your hook
      await deleteDocument(appId, docId)
      
      // Show success message
      toast.success(`"${label}" deleted successfully`)
      
      // Refresh the applications list to update the UI
      await refreshApplications()
      
    } catch (error: any) {
      console.error('Delete error:', error)
      
      // Show detailed error message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          `Failed to delete "${label}"`
      toast.error(errorMessage)
      
      // If the error is due to authorization, redirect to login
      if (error?.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        // Optionally redirect to login page
        // router.push('/login')
      }
    } finally {
      setDeletingId(null)
    }
  }

  const statusPill = (status: string) => {
    const map: Record<string, { bg: string; text: string; dot: string; icon: any }> = {
      approved: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-400',
        dot: 'bg-green-500',
        icon: CheckCircle2,
      },
      pending: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-800 dark:text-amber-400',
        dot: 'bg-amber-500',
        icon: Clock,
      },
      rejected: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400',
        dot: 'bg-red-500',
        icon: AlertTriangle,
      },
    }
    const cfg = map[status]
    if (!cfg) return null
    const Icon = cfg.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
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
        <div className="flex min-h-screen items-center justify-center mt-[10%] bg-white dark:bg-black ">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
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
      label: 'Submitted Docs',
      value: submittedCount,
      icon: FileText,
      iconColor: 'text-black dark:text-white',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
    {
      label: 'Result Docs',
      value: resultCount,
      icon: Zap,
      iconColor: 'text-black dark:text-white',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
    {
      label: 'Approved',
      value: approvedCount,
      icon: CheckCircle2,
      iconColor: 'text-black dark:text-white',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: Clock,
      iconColor: 'text-black dark:text-white',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
  ]

  const DocRow = ({ doc, app, variant }: { doc: any; app: any; variant: 'submitted' | 'result' }) => {
    const docId = getDocId(doc)
    const isDeleting = deletingId === docId
    const isResult = variant === 'result'

    return (
      <div
        className={`group relative flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-200 
          ${isResult
            ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
            : 'bg-white dark:bg-black border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white hover:shadow-md'}
          ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0 ">
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0
              ${isResult
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            {isResult ? <Zap className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium truncate ${isResult ? 'text-gray-900 dark:text-gray-100' : 'text-black dark:text-white'}`}>
              {isResult ? (doc.label || doc.originalName || 'Result Document') : (doc.filename || doc.originalName || 'Document')}
            </p>
            {isResult ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
            ) : (
              doc.status && <div className="mt-1.5">{statusPill(doc.status)}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${isResult
              ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
            onClick={() => handleViewDocument(doc, app)}
            title="View"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${isResult
              ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
            onClick={() => handleDownloadDocument(doc, app)}
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>
          {!isResult && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500/70 hover:text-red-600 hover:bg-red-50 dark:text-red-400/70 dark:hover:text-red-400 dark:hover:bg-red-900/20"
              disabled={isDeleting}
              onClick={() => handleDeleteDocument(doc, app)}
              title="Delete"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>
    )
  }

  const EmptyState = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) => (
    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
      <CardContent className="pt-6">
        <div className="text-center py-14">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-lg font-semibold text-black dark:text-white">{title}</p>
          {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200 rounded-2xl">
        <div className="space-y-6 m-4 p-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
                All Documents
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">View all your application documents and results</p>
            </div>
          </div>

          {/* Document Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <Card
                key={s.label}
                className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black hover:shadow-lg dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-black dark:text-white">{s.value}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${s.bgColor} flex items-center justify-center shadow-sm ${s.iconColor}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Documents by Application */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              <TabsTrigger 
                value="all" 
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400"
              >
                All Documents
              </TabsTrigger>
              <TabsTrigger 
                value="submitted" 
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400"
              >
                Submitted
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400"
              >
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {applications.length === 0 ? (
                <EmptyState icon={FileText} title="No documents yet" subtitle="Start an application to upload documents" />
              ) : (
                applications.map((app) => {
                  const hasSubmitted = app.attachments && app.attachments.length > 0
                  const hasResults = (app as any).resultDocuments && (app as any).resultDocuments.length > 0

                  if (!hasSubmitted && !hasResults) return null

                  return (
                    <Card key={getAppId(app)} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm hover:shadow-md dark:hover:shadow-black/20 transition-shadow duration-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <FolderOpen className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            </div>
                            <div>
                              <CardTitle className="text-lg text-black dark:text-white">{titleCase(app.applicationType)}</CardTitle>
                              <CardDescription className="text-gray-500 dark:text-gray-400">
                                Created: {new Date(app.createdAt).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="rounded-full px-3 py-1 font-medium border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                            {hasSubmitted ? app.attachments.length : 0} submitted · {hasResults ? (app as any).resultDocuments.length : 0} results
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {hasSubmitted && (
                          <div>
                            <h4 className="font-semibold text-sm text-black dark:text-white mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                              Submitted Documents ({app.attachments.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {app.attachments.map((doc: any, idx: number) => (
                                <DocRow key={getDocId(doc) || idx} doc={doc} app={app} variant="submitted" />
                              ))}
                            </div>
                          </div>
                        )}

                        {hasResults && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Result Documents ({(app as any).resultDocuments.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {(app as any).resultDocuments.map((doc: any, idx: number) => (
                                <DocRow key={getDocId(doc) || idx} doc={doc} app={app} variant="result" />
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
                <EmptyState icon={FileText} title="No submitted documents" />
              ) : (
                applications
                  .filter((app) => app.attachments && app.attachments.length > 0)
                  .map((app) => (
                    <Card key={getAppId(app)} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm hover:shadow-md dark:hover:shadow-black/20 transition-shadow duration-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-black dark:text-white">{titleCase(app.applicationType)}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {app.attachments.map((doc: any, idx: number) => (
                            <DocRow key={getDocId(doc) || idx} doc={doc} app={app} variant="submitted" />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {applications.filter((app) => (app as any).resultDocuments && (app as any).resultDocuments.length > 0).length === 0 ? (
                <EmptyState icon={CheckCircle2} title="No result documents yet" subtitle="Results will appear here when available" />
              ) : (
                applications
                  .filter((app) => (app as any).resultDocuments && (app as any).resultDocuments.length > 0)
                  .map((app) => (
                    <Card key={getAppId(app)} className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 shadow-sm hover:shadow-md dark:hover:shadow-black/20 transition-shadow duration-200">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-black dark:text-white">
                          <CheckCircle2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                          {titleCase(app.applicationType)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(app as any).resultDocuments.map((doc: any, idx: number) => (
                            <DocRow key={getDocId(doc) || idx} doc={doc} app={app} variant="result" />
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