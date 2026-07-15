"use client"

import { useState, useEffect, useRef } from "react"
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
import { 
  Shield, CheckCircle, AlertTriangle, Clock, FileText, Users, Globe, Gavel, 
  RefreshCw, Download, Eye, ExternalLink, Building2, Upload, Calendar, 
  XCircle, Bell, Briefcase, Plus, Sparkles, TrendingUp, Award, Zap,
  BarChart3, Layers, Target, Star, Gem, Crown, Heart, Gift, Smartphone,
  Monitor, Laptop, Tablet, Wifi, Bluetooth, Printer, FolderOpen,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { toast } from "sonner"
import { Layout } from "../../Dashboards/InvestorDashboard/Layout"
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
  const [activeTab, setActiveTab] = useState('documents')
  const [showBusinessDialog, setShowBusinessDialog] = useState(false)
  const [businessData, setBusinessData] = useState({
    hasCompany: false,
    companyName: '',
    establishmentType: '',
    businessActivity: '',
    tradeLicenseNumber: '',
    tradeLicenseExpiry: ''
  })

  // Scroll container refs
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  useEffect(() => {
    loadComplianceData()
    loadUserProfile()
  }, [user])

  const checkScroll = () => {
    const container = tabsContainerRef.current
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    const container = tabsContainerRef.current
    if (container) {
      checkScroll()
      container.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        container.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [])

  const scrollTabs = (direction: 'left' | 'right') => {
    const container = tabsContainerRef.current
    if (container) {
      const scrollAmount = container.clientWidth * 0.7
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
      case 'expiring_soon':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
      case 'expired':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
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

  const stats = [
    {
      title: 'Compliance Score',
      value: `${complianceData?.complianceScore || 0}%`,
      icon: Shield,
      gradient: 'from-emerald-500 to-emerald-400',
      progress: complianceData?.complianceScore || 0,
    },
    {
      title: 'Valid Documents',
      value: `${(complianceData?.totalDocuments || 0) - (complianceData?.expiredCount || 0) - (complianceData?.expiringSoonCount || 0)}`,
      icon: CheckCircle,
      gradient: 'from-blue-500 to-blue-400',
    },
    {
      title: 'Expiring Soon',
      value: `${complianceData?.expiringSoonCount || 0}`,
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-amber-400',
    },
    {
      title: 'Expired',
      value: `${complianceData?.expiredCount || 0}`,
      icon: XCircle,
      gradient: 'from-red-500 to-red-400',
    },
  ]

  const tabItems = [
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'business', label: 'Business Setup', icon: Building2 },
    { id: 'regulations', label: 'Regulations', icon: Gavel },
    { id: 'alerts', label: 'Alerts', icon: Bell },
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-black p-4 md:p-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight">
                Compliance Dashboard
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor your documents and regulatory compliance</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="ghost" 
                onClick={loadComplianceData} 
                disabled={isLoading}
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
           <Button 
  onClick={() => setShowUploadDialog(true)}
  className="bg-white dark:bg-black text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
>
  <Upload className="mr-2 h-4 w-4 text-gray-900 dark:text-white" />
  Upload Document
</Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-black p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-black dark:text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} bg-opacity-10`}>
                      <stat.icon className="h-5 w-5 text-black dark:text-white" />
                    </div>
                  </div>
                  {stat.progress !== undefined && (
                    <Progress value={stat.progress} className="mt-3 h-1.5 bg-gray-200 dark:bg-gray-700" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Urgent Alerts */}
          <AnimatePresence>
            {complianceData && (complianceData.expiredCount > 0 || complianceData.expiringSoonCount > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="border border-amber-200 dark:border-amber-800 rounded-2xl bg-amber-50 dark:bg-amber-950/20 p-4">
                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-amber-900 dark:text-amber-200">
                      <strong>Action Required:</strong> You have {complianceData.expiredCount} expired and {complianceData.expiringSoonCount} expiring documents. Please renew them to maintain compliance.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-black overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 relative">
       

       {/* Scrollable Tabs Container */}
<div
  ref={tabsContainerRef}
  className="overflow-x-auto scrollbar-hide px-1"
  style={{
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  }}
>
  <div className="flex gap-2 sm:gap-3 min-w-max px-2 sm:px-0">
    {tabItems.map((tab) => {
      const Icon = tab.icon
      const isActive = activeTab === tab.id
      return (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            shrink-0 flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-xl text-sm font-medium
            transition-all duration-300 whitespace-nowrap
            ${isActive
              ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
            }
          `}
        >
          <Icon className={`h-4 w-4 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden">{tab.shortLabel || tab.label}</span>
          {isActive && (
            <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white" />
          )}
        </button>
      )
    })}
  </div>
</div>
            </div>

            {/* Tab Content */}
            <div className="p-6 max-h-[600px] overflow-y-auto scrollbar-thin">
              <AnimatePresence mode="wait">
                {activeTab === 'documents' && (
                  <motion.div
                    key="documents"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-black dark:text-white">Document Status</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Track expiration dates and renewal requirements</p>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
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
                                  <div className={`border-2 rounded-xl p-4 ${getDocumentStatusColor(doc.status)}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                      <div className="flex items-start gap-3 flex-1">
                                        <div className={`p-2 rounded-xl ${getDocumentStatusColor(doc.status)}`}>
                                          {getDocumentStatusIcon(doc.status)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-semibold text-black dark:text-white capitalize">
                                              {doc.type.replace(/_/g, ' ')}
                                            </h4>
                                            <Badge className={`${getDocumentStatusColor(doc.status)} border-0`}>
                                              {doc.status.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 mt-2 text-sm">
                                            {doc.documentNumber && (
                                              <div className="flex items-center gap-1">
                                                <span className="text-gray-500 dark:text-gray-400">#</span>
                                                <span className="font-medium text-black dark:text-white truncate">{doc.documentNumber}</span>
                                              </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                              <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                              <span className="text-gray-500 dark:text-gray-400">Uploaded:</span>
                                              <span className="font-medium text-black dark:text-white">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                            </div>
                                            {expiryDate && (
                                              <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                <span className="text-gray-500 dark:text-gray-400">Expires:</span>
                                                <span className={`font-medium ${daysRemaining && daysRemaining < 30 ? 'text-amber-600 dark:text-amber-400' : daysRemaining && daysRemaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'}`}>
                                                  {expiryDate.toLocaleDateString()}
                                                  {daysRemaining !== null && (
                                                    <span className="ml-1 text-xs">
                                                      ({daysRemaining < 0 ? 'Expired' : `${daysRemaining} days`})
                                                    </span>
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                          </div>

                                          {doc.status === 'expiring_soon' && (
                                            <div className="mt-3 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3">
                                              <div className="flex items-start gap-2">
                                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                                                <span className="text-sm text-amber-900 dark:text-amber-200">
                                                  This document will expire soon. Please renew it to avoid service interruption.
                                                </span>
                                              </div>
                                            </div>
                                          )}

                                          {doc.status === 'expired' && (
                                            <div className="mt-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20 p-3">
                                              <div className="flex items-start gap-2">
                                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                                                <span className="text-sm text-red-900 dark:text-red-200">
                                                  This document has expired. Immediate renewal required.
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-2 self-start sm:self-center">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => window.open(`${apiBase}/${doc.path}`, '_blank')}
                                          className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const link = document.createElement('a')
                                            link.href = `${apiBase}/${doc.path}`
                                            link.download = doc.type
                                            link.click()
                                          }}
                                          className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                          <Download className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )
                            })
                          ) : (
                            <div className="text-center py-12">
                              <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                <FileText className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 mb-4">No documents uploaded yet</p>
                          <Button 
  onClick={() => setShowUploadDialog(true)} 
  className="bg-white dark:bg-black text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
>
  <Upload className="w-4 h-4 mr-2 text-gray-900 dark:text-white" />
  Upload Your First Document
</Button>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'business' && (
                  <motion.div
                    key="business"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-black dark:text-white">Business Setup in UAE</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your company information and trade license</p>
                        </div>
                        <Button 
                          onClick={() => setShowBusinessDialog(true)}
                          className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                        >
                          {businessData.hasCompany ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Update Info
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Setup Business
                            </>
                          )}
                        </Button>
                      </div>

                      {businessData.hasCompany ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                              <Label className="text-xs text-gray-500 dark:text-gray-400">Company Name</Label>
                              <p className="font-medium text-black dark:text-white mt-1">{businessData.companyName || 'Not set'}</p>
                            </div>
                            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                              <Label className="text-xs text-gray-500 dark:text-gray-400">Establishment Type</Label>
                              <p className="font-medium text-black dark:text-white capitalize mt-1">{businessData.establishmentType || 'Not set'}</p>
                            </div>
                            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                              <Label className="text-xs text-gray-500 dark:text-gray-400">Business Activity</Label>
                              <p className="font-medium text-black dark:text-white mt-1">{businessData.businessActivity || 'Not set'}</p>
                            </div>
                            {businessData.tradeLicenseNumber && (
                              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <Label className="text-xs text-gray-500 dark:text-gray-400">Trade License Number</Label>
                                <p className="font-medium text-black dark:text-white mt-1">{businessData.tradeLicenseNumber}</p>
                              </div>
                            )}
                          </div>

                          {businessData.tradeLicenseExpiry && (
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 p-4">
                              <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-black dark:text-white" />
                                <span className="text-black dark:text-white">
                                  Trade License expires on {new Date(businessData.tradeLicenseExpiry).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <Building2 className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Setup Your Business</h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                            Add your company information to track trade license and establishment requirements
                          </p>
                          <Button onClick={() => setShowBusinessDialog(true)} className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Business Information
                          </Button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            title: 'Dubai Mainland',
                            icon: Globe,
                            features: [
                              'Trade in UAE market and internationally',
                              'DED (Department of Economic Development) license',
                              'Physical office space required',
                              'Local service agent may be required'
                            ],
                          },
                          {
                            title: 'Dubai Freezone',
                            icon: Zap,
                            features: [
                              '100% foreign ownership',
                              '0% corporate and personal tax',
                              '100% repatriation of capital and profits',
                              'Quick and easy setup process'
                            ],
                          }
                        ].map((item, index) => (
                          <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-black hover:border-black dark:hover:border-white transition-all duration-300 overflow-hidden">
                              <div className="h-1 bg-black dark:bg-white"></div>
                              <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                  <item.icon className="h-5 w-5 text-black dark:text-white" />
                                  <h4 className="text-lg font-semibold text-black dark:text-white">{item.title}</h4>
                                </div>
                                <ul className="space-y-2 text-sm">
                                  {item.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

             {activeTab === 'regulations' && (
  <motion.div
    key="regulations"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#0D1F3C]/10 to-[#1a2a4a]/10 dark:from-white/10 dark:to-white/5">
          <Gavel className="h-6 w-6 text-[#0D1F3C] dark:text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            UAE Immigration & Visa Regulations
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Stay updated with the latest rules and requirements for 2024-2025
          </p>
        </div>
      </div>

      {/* Latest Update Alert */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-200/50 dark:border-blue-800/30 bg-gradient-to-br from-blue-50/80 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/10 p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
        <div className="flex items-start gap-3 relative">
          <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 border border-blue-200/50 dark:border-blue-400/20">
            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-blue-900 dark:text-blue-200">
            <p className="font-medium text-sm">Latest Update</p>
            <p className="text-sm opacity-90">
              New visa categories introduced in 2024, including 5-year multi-entry tourist visa and expanded golden visa eligibility.
            </p>
          </div>
        </div>
      </div>

      {/* Document Validity Requirements */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gray-100 dark:bg-white/5">
            <FileText className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Document Validity Requirements
          </h4>
        </div>
        <div className="grid gap-3">
          {[
            {
              title: 'Emirates ID',
              desc: 'Must be renewed before expiry. Processing time: 2-3 weeks',
              icon: Shield,
              color: 'from-emerald-500/10 to-emerald-600/5'
            },
            {
              title: 'Residence Visa',
              desc: 'Grace period: 30 days after expiry. Late fine: AED 125 per day',
              icon: Clock,
              color: 'from-blue-500/10 to-blue-600/5'
            },
            {
              title: 'Trade License',
              desc: 'Annual renewal required. Late renewal penalties apply',
              icon: Building2,
              color: 'from-amber-500/10 to-amber-600/5'
            },
            {
              title: 'Passport Validity',
              desc: 'Must be valid for at least 6 months for visa applications',
              icon: FileText,
              color: 'from-purple-500/10 to-purple-600/5'
            }
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="p-4 rounded-xl border border-gray-200/50 dark:border-white/10 bg-gradient-to-br from-white to-gray-50/50 dark:from-black dark:to-white/5"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${item.color} border border-gray-200/30 dark:border-white/5`}>
                    <Icon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Important Links */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gray-100 dark:bg-white/5">
            <ExternalLink className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Important Links
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: 'UAE Government Portal', url: 'https://u.ae/', color: 'from-[#0D1F3C]/10 to-[#1a2a4a]/5' },
            { label: 'GDRFA Dubai', url: 'https://www.gdrfad.gov.ae', color: 'from-emerald-500/10 to-emerald-600/5' },
            { label: 'ICP Smart Services', url: 'https://smartservices.icp.gov.ae', color: 'from-violet-500/10 to-violet-600/5' },
            { label: 'MOHRE', url: 'https://www.mohre.gov.ae', color: 'from-rose-500/10 to-rose-600/5' }
          ].map((link) => (
            <Button 
              key={link.label}
              variant="ghost" 
              className={`justify-start text-gray-600 dark:text-gray-400 bg-gradient-to-br ${link.color} border border-gray-200/30 dark:border-white/5 rounded-xl px-4 py-2.5`}
              onClick={() => window.open(link.url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium">{link.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
)}

        {activeTab === 'alerts' && (
  <motion.div
    key="alerts"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#0D1F3C]/10 to-[#1a2a4a]/10 dark:from-white/10 dark:to-white/5">
          <Bell className="h-6 w-6 text-[#0D1F3C] dark:text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Notification Preferences
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage how you receive expiry alerts
          </p>
        </div>
      </div>

      {/* Alert Info Card */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-200/50 dark:border-blue-800/30 bg-gradient-to-br from-blue-50/80 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/10 p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
        <div className="flex items-start gap-3 relative">
          <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 border border-blue-200/50 dark:border-blue-400/20">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-blue-900 dark:text-blue-200">
            <p className="text-sm font-medium">Smart Notifications</p>
            <p className="text-sm opacity-90">
              We'll notify you when your documents are expiring: <strong>30 days</strong>, <strong>15 days</strong>, and <strong>7 days</strong> before expiry.
            </p>
          </div>
        </div>
      </div>

      {complianceData?.expiringDocuments && complianceData.expiringDocuments.length > 0 ? (
        <>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-white/5">
              <Clock className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Upcoming Renewals
            </h4>
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0 ml-auto">
              {complianceData.expiringDocuments.length} items
            </Badge>
          </div>
          <div className="space-y-3">
            {complianceData.expiringDocuments.map((doc, index) => (
              <motion.div
                key={doc.documentId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <div className={`p-4 rounded-xl border ${
                  doc.status === 'expired' 
                    ? 'border-rose-200/50 dark:border-rose-800/30 bg-gradient-to-br from-rose-50/80 to-rose-100/30 dark:from-rose-950/30 dark:to-rose-900/10' 
                    : 'border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-br from-amber-50/80 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/10'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-xl ${
                        doc.status === 'expired' 
                          ? 'bg-rose-500/10 dark:bg-rose-400/10 border border-rose-200/50 dark:border-rose-400/20' 
                          : 'bg-amber-500/10 dark:bg-amber-400/10 border border-amber-200/50 dark:border-amber-400/20'
                      }`}>
                        {doc.status === 'expired' ? (
                          <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white capitalize">
                            {doc.documentType.replace(/_/g, ' ')}
                          </p>
                          <Badge className={`${
                            doc.status === 'expired' 
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-0' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0'
                          }`}>
                            {doc.status === 'expired' ? 'Expired' : 'Expiring Soon'}
                          </Badge>
                        </div>
                        <p className={`text-sm font-medium ${
                          doc.status === 'expired' 
                            ? 'text-rose-700 dark:text-rose-400' 
                            : 'text-amber-700 dark:text-amber-400'
                        }`}>
                          {doc.status === 'expired' 
                            ? `Expired ${Math.abs(doc.daysRemaining)} days ago`
                            : `Expires in ${doc.daysRemaining} days`
                          }
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Expiry Date: {new Date(doc.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className={`${
                        doc.status === 'expired' 
                          ? 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white' 
                          : 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white'
                      } shadow-lg shadow-${doc.status === 'expired' ? 'rose' : 'amber'}-500/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5`}
                    >
                      Renew Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/10 p-8 text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
          <div className="relative">
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-200/50 dark:border-emerald-400/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">All Documents Valid</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No upcoming renewals required</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">✓ All your documents are up to date</p>
          </div>
        </div>
      )}
    </div>
  </motion.div>
)}
  </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

  {/* Upload Document Dialog - Modern */}
<Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
  <DialogContent className="bg-white dark:bg-black border border-gray-200/50 dark:border-white/10 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
    {/* Header with gradient accent */}
    <div className="relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0D1F3C] via-[#1a2a4a] to-[#2D4A7A] dark:from-white dark:via-gray-200 dark:to-gray-300" />
      <DialogHeader className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#0D1F3C]/10 to-[#1a2a4a]/10 dark:from-white/10 dark:to-white/5">
            <Upload className="h-5 w-5 text-[#0D1F3C] dark:text-white" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Upload Document
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              Add a new document to your profile
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
    </div>

    <div className="p-6 pt-4 space-y-5">
      {/* Document Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          Document Type
        </Label>
        <Select value={uploadDocType} onValueChange={setUploadDocType}>
          <SelectTrigger className="bg-white dark:bg-black border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white rounded-xl h-11 focus:ring-[#0D1F3C] dark:focus:ring-white">
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-black border border-gray-200/50 dark:border-white/10 rounded-xl">
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

      {/* Document File */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Upload className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          Document File
        </Label>
        <div className="relative">
          <Input
            type="file"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            accept=".pdf,.jpg,.jpeg,.png"
            className="bg-white dark:bg-black border-2 border-dashed border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white rounded-xl h-11 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#0D1F3C] dark:file:bg-white file:text-white dark:file:text-[#0D1F3C] hover:file:bg-[#1a2a4a] dark:hover:file:bg-gray-200 transition-all duration-300"
          />
        </div>
      </div>

      {/* Document Number */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          Document Number <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">(Optional)</span>
        </Label>
        <Input
          value={uploadDocNumber}
          onChange={(e) => setUploadDocNumber(e.target.value)}
          placeholder="e.g., 784-1234-5678901-2"
          className="bg-white dark:bg-black border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-xl h-11 focus:ring-[#0D1F3C] dark:focus:ring-white"
        />
      </div>

      {/* Expiry Date */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          Expiry Date <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">(Optional)</span>
        </Label>
        <Input
          type="date"
          value={uploadExpiryDate}
          onChange={(e) => setUploadExpiryDate(e.target.value)}
          className="bg-white dark:bg-black border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white rounded-xl h-11 focus:ring-[#0D1F3C] dark:focus:ring-white"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button 
          onClick={handleUploadDocument} 
          disabled={isLoading} 
          className="flex-1 bg-[#0D1F3C] dark:bg-white text-white dark:text-[#0D1F3C] hover:bg-[#1a2a4a] dark:hover:bg-gray-200 rounded-xl h-11 shadow-lg shadow-[#0D1F3C]/25 dark:shadow-white/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => setShowUploadDialog(false)} 
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl h-11 px-6 transition-all duration-300"
        >
          Cancel
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>




      {/* Business Setup Dialog */}
      <Dialog open={showBusinessDialog} onOpenChange={setShowBusinessDialog}>
        <DialogContent className="max-w-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Business Information</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">Manage your company and trade license details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={businessData.hasCompany}
                onChange={(e) => setBusinessData({ ...businessData, hasCompany: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-700"
              />
              <Label className="text-black dark:text-white">I have a company in UAE</Label>
            </div>

            {businessData.hasCompany && (
              <>
                <div>
                  <Label className="text-black dark:text-white">Company Name</Label>
                  <Input
                    value={businessData.companyName}
                    onChange={(e) => setBusinessData({ ...businessData, companyName: e.target.value })}
                    placeholder="Enter company name"
                    className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  />
                </div>

                <div>
                  <Label className="text-black dark:text-white">Establishment Type</Label>
                  <Select 
                    value={businessData.establishmentType} 
                    onValueChange={(value) => setBusinessData({ ...businessData, establishmentType: value })}
                  >
                    <SelectTrigger className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
                      <SelectItem value="mainland">Mainland</SelectItem>
                      <SelectItem value="freezone">Freezone</SelectItem>
                      <SelectItem value="offshore">Offshore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-black dark:text-white">Business Activity</Label>
                  <Input
                    value={businessData.businessActivity}
                    onChange={(e) => setBusinessData({ ...businessData, businessActivity: e.target.value })}
                    placeholder="e.g., Trading, Consulting, etc."
                    className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-black dark:text-white">Trade License Number</Label>
                    <Input
                      value={businessData.tradeLicenseNumber}
                      onChange={(e) => setBusinessData({ ...businessData, tradeLicenseNumber: e.target.value })}
                      placeholder="License number"
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="text-black dark:text-white">License Expiry Date</Label>
                    <Input
                      type="date"
                      value={businessData.tradeLicenseExpiry}
                      onChange={(e) => setBusinessData({ ...businessData, tradeLicenseExpiry: e.target.value })}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button onClick={handleUpdateBusiness} disabled={isLoading} className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="ghost" onClick={() => setShowBusinessDialog(false)} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
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