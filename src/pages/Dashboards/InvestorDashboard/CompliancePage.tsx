"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Progress } from "../../../components/ui/progress"
import { Alert, AlertDescription } from "../../../components/ui/alert"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Shield, CheckCircle, AlertTriangle, Clock, FileText, Users, Globe, Gavel, RefreshCw, Download, Eye, ExternalLink, Building2, Upload, Calendar, XCircle, Bell, Briefcase, Plus } from 'lucide-react'
import { toast } from "sonner"
import { Layout } from "./Layout"
import { useAuth } from "@/contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

interface UserDocument {
  _id: string
  type: string
  path: string
  uploadDate: string
  expiryDate?: string
  documentNumber?: string
  issuedBy?: string
  issuedDate?: string
  status: 'valid' | 'expiring_soon' | 'expired' | 'pending'
  notificationSent?: boolean
}

interface ComplianceData {
  complianceScore: number
  expiringDocuments: Array<{
    documentId: string
    documentType: string
    expiryDate: string
    daysRemaining: number
    status: string
  }>
  totalDocuments: number
  expiredCount: number
  expiringSoonCount: number
  business?: any
}

const CompliancePage = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadDocType, setUploadDocType] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadExpiryDate, setUploadExpiryDate] = useState('')
  const [uploadDocNumber, setUploadDocNumber] = useState('')

  // Business management state
  const [showBusinessDialog, setShowBusinessDialog] = useState(false)
  const [businessData, setBusinessData] = useState({
    hasCompany: false,
    companyName: '',
    establishmentType: '',
    businessActivity: '',
    tradeLicenseNumber: '',
    tradeLicenseExpiry: ''
  })

  useEffect(() => {
    loadComplianceData()
    loadUserProfile()
  }, [user])

  const loadComplianceData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
      
      const response = await fetch(`${apiBase}/api/v1/user/${userId}/compliance`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setComplianceData(data)
      }
    } catch (error) {
      console.error('Error loading compliance data:', error)
      toast.error('Failed to load compliance data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
      
      const response = await fetch(`${apiBase}/api/v1/user/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
        
        if (data.business) {
          setBusinessData({
            hasCompany: data.business.hasCompany || false,
            companyName: data.business.companyName || '',
            establishmentType: data.business.establishmentType || '',
            businessActivity: data.business.businessActivity || '',
            tradeLicenseNumber: data.business.tradeLicense?.number || '',
            tradeLicenseExpiry: data.business.tradeLicense?.expiryDate || ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const handleUploadDocument = async () => {
    if (!uploadFile || !uploadDocType) {
      toast.error('Please select a file and document type')
      return
    }

    try {
      setIsLoading(true)
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
      
      const formData = new FormData()
      formData.append('document', uploadFile)
      formData.append('type', uploadDocType)
      if (uploadExpiryDate) formData.append('expiryDate', uploadExpiryDate)
      if (uploadDocNumber) formData.append('documentNumber', uploadDocNumber)
      
      const response = await fetch(`${apiBase}/api/v1/user/${userId}/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      
      if (response.ok) {
        toast.success('Document uploaded successfully')
        setShowUploadDialog(false)
        setUploadFile(null)
        setUploadDocType('')
        setUploadExpiryDate('')
        setUploadDocNumber('')
        loadComplianceData()
        loadUserProfile()
      } else {
        toast.error('Failed to upload document')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateBusiness = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
      
      const payload = {
        hasCompany: businessData.hasCompany,
        companyName: businessData.companyName,
        establishmentType: businessData.establishmentType,
        businessActivity: businessData.businessActivity,
        tradeLicense: {
          number: businessData.tradeLicenseNumber,
          expiryDate: businessData.tradeLicenseExpiry
        }
      }
      
      const response = await fetch(`${apiBase}/api/v1/user/${userId}/business`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        toast.success('Business information updated successfully')
        setShowBusinessDialog(false)
        loadUserProfile()
        loadComplianceData()
      } else {
        toast.error('Failed to update business information')
      }
    } catch (error) {
      console.error('Error updating business:', error)
      toast.error('Failed to update business information')
    } finally {
      setIsLoading(false)
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'expiring_soon':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4" />
      case 'expiring_soon':
        return <AlertTriangle className="h-4 w-4" />
      case 'expired':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <Layout>
    <div className="space-y-6  m-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-foreground">Compliance Dashboard</h1>
            <p className="text-muted-foreground">Monitor your documents and regulatory compliance</p>
        </div>
        <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={loadComplianceData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
          </Button>
        </div>
      </div>

      {/* Compliance Score Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
              <div className={`text-2xl font-bold ${complianceData?.complianceScore && complianceData.complianceScore >= 80 ? 'text-green-600' : complianceData?.complianceScore && complianceData.complianceScore >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                {complianceData?.complianceScore || 0}%
              </div>
              <Progress value={complianceData?.complianceScore || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
                {complianceData?.totalDocuments || 0} total documents
            </p>
          </CardContent>
        </Card>

          <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Valid Documents</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(complianceData?.totalDocuments || 0) - (complianceData?.expiredCount || 0) - (complianceData?.expiringSoonCount || 0)}
              </div>
              <p className="text-xs text-green-700">All documents valid</p>
          </CardContent>
        </Card>

          <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {complianceData?.expiringSoonCount || 0}
            </div>
              <p className="text-xs text-orange-700">Requires attention</p>
          </CardContent>
        </Card>

          <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Expired</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {complianceData?.expiredCount || 0}
              </div>
              <p className="text-xs text-red-700">Urgent renewal needed</p>
          </CardContent>
        </Card>
      </div>

        {/* Urgent Alerts */}
        {complianceData && (complianceData.expiredCount > 0 || complianceData.expiringSoonCount > 0) && (
          <Alert className="border-orange-200 bg-orange-50">
            <Bell className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900">
              <strong>Action Required:</strong> You have {complianceData.expiredCount} expired and {complianceData.expiringSoonCount} expiring documents. Please renew them to maintain compliance.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documents">My Documents</TabsTrigger>
            <TabsTrigger value="business">Business Setup</TabsTrigger>
            <TabsTrigger value="regulations">UAE Regulations</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
                <CardHeader>
                <CardTitle>Document Status</CardTitle>
                <CardDescription>Track expiration dates and renewal requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {userProfile?.documents && userProfile.documents.length > 0 ? (
                      userProfile.documents.map((doc: UserDocument, index: number) => {
                        const expiryDate = doc.expiryDate ? new Date(doc.expiryDate) : null
                        const daysRemaining = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
                        
                        return (
                          <motion.div
                            key={doc._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className={`border-2 ${getDocumentStatusColor(doc.status)}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className={`p-2 rounded-lg ${getDocumentStatusColor(doc.status)}`}>
                                      {getDocumentStatusIcon(doc.status)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-foreground capitalize">
                                          {doc.type.replace(/_/g, ' ')}
                                        </h4>
                                        <Badge className={getDocumentStatusColor(doc.status)}>
                                          {doc.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                        {doc.documentNumber && (
                                          <div>
                                            <span className="text-muted-foreground">Number:</span>
                                            <span className="ml-1 font-medium">{doc.documentNumber}</span>
                                          </div>
                                        )}
                                        {doc.issuedBy && (
                                          <div>
                                            <span className="text-muted-foreground">Issued by:</span>
                                            <span className="ml-1 font-medium">{doc.issuedBy}</span>
                                          </div>
                                        )}
                                        <div>
                                          <span className="text-muted-foreground">Uploaded:</span>
                                          <span className="ml-1 font-medium">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                        </div>
                                        {expiryDate && (
                      <div>
                                            <span className="text-muted-foreground">Expires:</span>
                                            <span className={`ml-1 font-medium ${daysRemaining && daysRemaining < 30 ? 'text-orange-600' : daysRemaining && daysRemaining < 0 ? 'text-red-600' : ''}`}>
                                              {expiryDate.toLocaleDateString()}
                                              {daysRemaining !== null && (
                                                <span className="ml-1">
                                                  ({daysRemaining < 0 ? 'Expired' : `${daysRemaining} days left`})
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {doc.status === 'expiring_soon' && (
                                        <Alert className="mt-3 border-orange-200 bg-orange-50">
                                          <AlertTriangle className="h-3 w-3 text-orange-600" />
                                          <AlertDescription className="text-xs text-orange-900">
                                            This document will expire soon. Please renew it to avoid service interruption.
                                          </AlertDescription>
                                        </Alert>
                                      )}

                                      {doc.status === 'expired' && (
                                        <Alert className="mt-3 border-red-200 bg-red-50">
                                          <XCircle className="h-3 w-3 text-red-600" />
                                          <AlertDescription className="text-xs text-red-900">
                                            This document has expired. Immediate renewal required.
                                          </AlertDescription>
                                        </Alert>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(`${apiBase}/${doc.path}`, '_blank')}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const link = document.createElement('a')
                                        link.href = `${apiBase}/${doc.path}`
                                        link.download = doc.type
                                        link.click()
                                      }}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
                        <Button onClick={() => setShowUploadDialog(true)}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Your First Document
                        </Button>
                      </div>
                    )}
                  </AnimatePresence>
                    </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Setup Tab */}
          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Business Setup in UAE</CardTitle>
                    <CardDescription>Manage your company information and trade license</CardDescription>
                  </div>
                  <Button onClick={() => setShowBusinessDialog(true)}>
                    <Building2 className="w-4 h-4 mr-2" />
                    {businessData.hasCompany ? 'Update Info' : 'Setup Business'}
                  </Button>
                  </div>
                </CardHeader>
                <CardContent>
                {businessData.hasCompany ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm text-muted-foreground">Company Name</Label>
                        <p className="font-medium">{businessData.companyName}</p>
                    </div>
                    <div>
                        <Label className="text-sm text-muted-foreground">Establishment Type</Label>
                        <p className="font-medium capitalize">{businessData.establishmentType}</p>
                    </div>
                    <div>
                        <Label className="text-sm text-muted-foreground">Business Activity</Label>
                        <p className="font-medium">{businessData.businessActivity}</p>
                      </div>
                      {businessData.tradeLicenseNumber && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Trade License Number</Label>
                          <p className="font-medium">{businessData.tradeLicenseNumber}</p>
                        </div>
                      )}
                    </div>

                    {businessData.tradeLicenseExpiry && (
                      <Alert className="border-primary/30 bg-primary/5">
                        <Calendar className="h-4 w-4" />
                      <AlertDescription>
                          Trade License expires on {new Date(businessData.tradeLicenseExpiry).toLocaleDateString()}
                      </AlertDescription>
                    </Alert>
                  )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Setup Your Business</h3>
                    <p className="text-muted-foreground mb-4">Add your company information to track trade license and establishment requirements</p>
                    <Button onClick={() => setShowBusinessDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Business Information
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business Setup Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dubai Mainland</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Trade in UAE market and internationally</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>DED (Department of Economic Development) license</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Physical office space required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Local service agent may be required</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dubai Freezone</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>100% foreign ownership</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>0% corporate and personal tax</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>100% repatriation of capital and profits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Quick and easy setup process</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
          </div>
        </TabsContent>

          {/* Regulations Tab */}
          <TabsContent value="regulations" className="space-y-4">
          <Card>
            <CardHeader>
                <CardTitle>UAE Immigration & Visa Regulations (2024-2025)</CardTitle>
                <CardDescription>Stay updated with the latest rules and requirements</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  <Alert className="border-blue-200 bg-blue-50">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      <strong>Latest Update:</strong> New visa categories introduced in 2024, including 5-year multi-entry tourist visa and expanded golden visa eligibility.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Document Validity Requirements</h4>
                    <div className="grid gap-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-primary mt-1" />
                          <div>
                            <p className="font-medium">Emirates ID</p>
                            <p className="text-sm text-muted-foreground">Must be renewed before expiry. Processing time: 2-3 weeks</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-primary mt-1" />
                          <div>
                            <p className="font-medium">Residence Visa</p>
                            <p className="text-sm text-muted-foreground">Grace period: 30 days after expiry. Late fine: AED 125 per day</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-primary mt-1" />
                          <div>
                            <p className="font-medium">Trade License</p>
                            <p className="text-sm text-muted-foreground">Annual renewal required. Late renewal penalties apply</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-primary mt-1" />
                      <div>
                            <p className="font-medium">Passport Validity</p>
                            <p className="text-sm text-muted-foreground">Must be valid for at least 6 months for visa applications</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Important Links</h4>
                    <div className="grid gap-2">
                      <Button variant="outline" className="justify-start" onClick={() => window.open('https://u.ae/', '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        UAE Government Portal
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => window.open('https://www.gdrfad.gov.ae', '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        GDRFA Dubai
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => window.open('https://smartservices.icp.gov.ae', '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        ICP Smart Services
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => window.open('https://www.mohre.gov.ae', '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        MOHRE
                      </Button>
                    </div>
                  </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive expiry alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                  <Alert className="border-blue-200 bg-blue-50">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      We'll notify you when your documents are expiring: 30 days, 15 days, and 7 days before expiry.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    {complianceData?.expiringDocuments && complianceData.expiringDocuments.length > 0 ? (
                      <>
                        <h4 className="font-semibold">Upcoming Renewals</h4>
                        {complianceData.expiringDocuments.map((doc, index) => (
                          <motion.div
                            key={doc.documentId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className={`p-4 border-2 rounded-lg ${doc.status === 'expired' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  {doc.status === 'expired' ? (
                                    <XCircle className="w-5 h-5 text-red-600 mt-1" />
                                  ) : (
                                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-1" />
                                  )}
                                  <div>
                                    <p className="font-semibold capitalize">
                                      {doc.documentType.replace(/_/g, ' ')}
                                    </p>
                                    <p className={`text-sm ${doc.status === 'expired' ? 'text-red-700' : 'text-orange-700'}`}>
                                      {doc.status === 'expired' 
                                        ? `Expired ${Math.abs(doc.daysRemaining)} days ago`
                                        : `Expires in ${doc.daysRemaining} days`
                                      }
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Expiry Date: {new Date(doc.expiryDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <Button size="sm" variant={doc.status === 'expired' ? 'destructive' : 'default'}>
                                  Renew Now
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                        <p className="font-semibold text-green-900">All Documents Valid</p>
                        <p className="text-sm text-muted-foreground">No upcoming renewals required</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Add a new document to your profile</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Document Type</Label>
              <Select value={uploadDocType} onValueChange={setUploadDocType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emirates_id">Emirates ID</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="residence_visa">Residence Visa</SelectItem>
                  <SelectItem value="driving_license">Driving License</SelectItem>
                  <SelectItem value="trade_license">Trade License</SelectItem>
                  <SelectItem value="establishment_card">Establishment Card</SelectItem>
                  <SelectItem value="bank_statement">Bank Statement</SelectItem>
                  <SelectItem value="salary_certificate">Salary Certificate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Document File</Label>
              <Input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            <div>
              <Label>Document Number (Optional)</Label>
              <Input
                value={uploadDocNumber}
                onChange={(e) => setUploadDocNumber(e.target.value)}
                placeholder="e.g., 784-1234-5678901-2"
              />
            </div>

            <div>
              <Label>Expiry Date (Optional)</Label>
              <Input
                type="date"
                value={uploadExpiryDate}
                onChange={(e) => setUploadExpiryDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUploadDocument} disabled={isLoading} className="flex-1">
                {isLoading ? 'Uploading...' : 'Upload'}
              </Button>
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Business Setup Dialog */}
      <Dialog open={showBusinessDialog} onOpenChange={setShowBusinessDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Business Information</DialogTitle>
            <DialogDescription>Manage your company and trade license details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={businessData.hasCompany}
                onChange={(e) => setBusinessData({ ...businessData, hasCompany: e.target.checked })}
                className="rounded"
              />
              <Label>I have a company in UAE</Label>
                  </div>

            {businessData.hasCompany && (
              <>
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={businessData.companyName}
                    onChange={(e) => setBusinessData({ ...businessData, companyName: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <Label>Establishment Type</Label>
                  <Select 
                    value={businessData.establishmentType} 
                    onValueChange={(value) => setBusinessData({ ...businessData, establishmentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mainland">Mainland</SelectItem>
                      <SelectItem value="freezone">Freezone</SelectItem>
                      <SelectItem value="offshore">Offshore</SelectItem>
                    </SelectContent>
                  </Select>
                  </div>

                <div>
                  <Label>Business Activity</Label>
                  <Input
                    value={businessData.businessActivity}
                    onChange={(e) => setBusinessData({ ...businessData, businessActivity: e.target.value })}
                    placeholder="e.g., Trading, Consulting, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Trade License Number</Label>
                    <Input
                      value={businessData.tradeLicenseNumber}
                      onChange={(e) => setBusinessData({ ...businessData, tradeLicenseNumber: e.target.value })}
                      placeholder="License number"
                    />
                  </div>
                  <div>
                    <Label>License Expiry Date</Label>
                    <Input
                      type="date"
                      value={businessData.tradeLicenseExpiry}
                      onChange={(e) => setBusinessData({ ...businessData, tradeLicenseExpiry: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button onClick={handleUpdateBusiness} disabled={isLoading} className="flex-1">
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setShowBusinessDialog(false)}>
                Cancel
              </Button>
              </div>
    </div>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

export default CompliancePage
