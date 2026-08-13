"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { FileText, Download, Eye, CheckCircle, Clock, AlertTriangle, Zap } from 'lucide-react'
import { toast } from "sonner"
import { Layout } from "./Layout"
import { useApplications } from "@/hooks/useApplications"

const DocumentsPage = () => {
  const { applications, loading } = useApplications()
console.log(applications)
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

  const handleDownloadDocument = async (doc: any,app: any) => {
    try {
      const token = localStorage.getItem('authToken') || '';
      const response = await fetch(`${apiBase}/api/v1/visa/${app?._id}/attachments/${doc._id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalName || doc.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Downloading ${doc.originalName || doc.filename || 'document'}...`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download document')
    }
  }



  const handleViewDocument = (doc: any,app: any) => {
    try {
      // const fileUrl = doc.path ? `${apiBase}/${doc.path}` : doc.downloadUrl;
      const fileUrl = `${apiBase}/uploads/applications/${app?._id}/${doc.path}`;
      window.open(fileUrl, '_blank');
      toast.success('Document opened successfully');
    } catch (error) {
      toast.error('Failed to open document');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center mt-[10%]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading documents...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6 m-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Documents</h1>
            <p className="text-muted-foreground">View all your application documents and results</p>
          </div>
        </div>

        {/* Document Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {applications.reduce((sum, app) => sum + (app.attachments?.length || 0), 0)}
                </p>
                <p className="text-sm text-text-secondary">Submitted Docs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {applications.reduce((sum, app) => sum + ((app as any).resultDocuments?.length || 0), 0)}
                </p>
                <p className="text-sm text-text-secondary">Result Docs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {applications.reduce((sum, app) => 
                    sum + (app.attachments?.filter((a: any) => a.status === 'approved').length || 0), 0
                  )}
                </p>
                <p className="text-sm text-text-secondary">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {applications.reduce((sum, app) => 
                    sum + (app.attachments?.filter((a: any) => a.status === 'pending').length || 0), 0
                  )}
                </p>
                <p className="text-sm text-text-secondary">Pending</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents by Application */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No documents yet</p>
                    <p className="text-muted-foreground">Start an application to upload documents</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              applications.map((app) => {
                const hasSubmitted = app.attachments && app.attachments.length > 0
                const hasResults = (app as any).resultDocuments && (app as any).resultDocuments.length > 0

                if (!hasSubmitted && !hasResults) return null

                return (
                  <Card key={app.id} className="border-primary/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {app.applicationType
                              .replace(/_/g, ' ')
                              .split(' ')
                              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(' ')}
                          </CardTitle>
                          <CardDescription>
                            Created: {new Date(app.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {hasSubmitted ? app.attachments.length : 0} submitted + {hasResults ? (app as any).resultDocuments.length : 0} results
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Submitted Documents */}
                      {hasSubmitted && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            Submitted Documents ({app.attachments.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {app.attachments.map((doc: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-surface-light rounded-lg border border-border hover:border-primary/50 transition-colors"
                              >
                                <div className="flex relative overflow-hidden items-center gap-2 flex-1">
                                  <FileText className="w-4 h-4 text-primary" />
                                  <div className="flex-1 overflow-hidden min-w-0">
                                  <p className="text-sm font-medium overflow-hidden text-ellipsis break-words max-w-full sm:max-w-[200px]">
                                  {doc.filename || doc.originalName || 'Document'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      {doc.status === 'approved' && (
                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Approved
                                        </Badge>
                                      )}
                                      {doc.status === 'pending' && (
                                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                                          <Clock className="w-3 h-3 mr-1" />
                                          Pending
                                        </Badge>
                                      )}
                                      {doc.status === 'rejected' && (
                                        <Badge className="bg-red-100 text-red-800 text-xs">
                                          <AlertTriangle className="w-3 h-3 mr-1" />
                                          Rejected
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewDocument(doc,app)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownloadDocument(doc,app)}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Result Documents */}
                      {hasResults && (
                        <div>
                          <h4 className="font-semibold text-sm text-green-700 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Result Documents ({(app as any).resultDocuments.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(app as any).resultDocuments.map((doc: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:border-green-300 transition-colors"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <Zap className="w-4 h-4 text-green-600" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-green-900 truncate">
                                      {doc.label || doc.originalName || 'Result Document'}
                                    </p>
                                    <p className="text-xs text-green-700">
                                      {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-700 hover:text-green-900"
                                    onClick={() => handleViewDocument(doc,app)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-700 hover:text-green-900"
                                    onClick={() => handleDownloadDocument(doc,app)}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
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
            {applications.filter(app => app.attachments && app.attachments.length > 0).length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No submitted documents</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              applications
                .filter(app => app.attachments && app.attachments.length > 0)
                .map((app) => (
                  <Card key={app.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {app.applicationType.replace(/_/g, ' ')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {app.attachments.map((doc: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-surface-light rounded-lg border border-border"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <FileText className="w-4 h-4 text-primary" />
                              <span className="text-sm overflow-hidden text-ellipsis">{doc.filename || doc.originalName}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc,app)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDownloadDocument(doc,app)}>
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {applications.filter(app => (app as any).resultDocuments && (app as any).resultDocuments.length > 0).length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No result documents yet</p>
                    <p className="text-muted-foreground">Results will appear here when available</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              applications
                .filter(app => (app as any).resultDocuments && (app as any).resultDocuments.length > 0)
                .map((app) => (
                  <Card key={app.id} className="border-green-200 bg-green-50/30">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        {app.applicationType.replace(/_/g, ' ')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(app as any).resultDocuments.map((doc: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Zap className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="text-sm overflow-hidden text-ellipsis font-medium text-green-900">{doc.label || doc.originalName}</p>
                                <p className="text-xs text-green-700">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-700"
                                onClick={() => handleViewDocument(doc,app)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-700"
                                onClick={() => handleDownloadDocument(doc,app)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}

export default DocumentsPage
