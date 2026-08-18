"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Progress } from "../../../components/ui/progress"
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
  ChevronLeft, ChevronRight, User, Mail, Phone, MapPin, Link2,
  Search, Filter, SlidersHorizontal, Trash2
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

// ─── Brand Color ──────────────────────────────────────────────────────────
const primaryColor = '#0A3269'

// ─── Helpers ────────────────────────────────────────────────────────────────
const getDocumentUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${apiBase}${normalizedPath}`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'valid': return 'emerald'
    case 'expiring_soon': return 'amber'
    case 'expired': return 'red'
    default: return 'gray'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'valid': return CheckCircle
    case 'expiring_soon': return AlertTriangle
    case 'expired': return XCircle
    default: return Clock
  }
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
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)

  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  // ─── Data loading ──────────────────────────────────────────────────────────
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

  useEffect(() => {
    loadComplianceData()
    loadUserProfile()
  }, [user])

  // ─── Scroll handling ──────────────────────────────────────────────────────
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

  // ─── Document handlers ──────────────────────────────────────────────────────
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

  // ─── Delete document ──────────────────────────────────────────────────────
  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }

    setDeletingDocId(docId)
    try {
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId

      const response = await fetch(`${apiBase}/api/v1/user/${userId}/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Document deleted successfully')
        loadUserProfile()
        loadComplianceData()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.message || 'Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    } finally {
      setDeletingDocId(null)
    }
  }

  // ─── Filtered documents ────────────────────────────────────────────────────
  const filteredDocuments = useMemo(() => {
    if (!userProfile?.documents) return []
    let docs = [...userProfile.documents]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      docs = docs.filter(doc => 
        doc.type.toLowerCase().includes(q) ||
        doc.documentNumber?.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      docs = docs.filter(doc => doc.status === statusFilter)
    }
    return docs
  }, [userProfile?.documents, searchQuery, statusFilter])

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = [
    {
      title: 'Compliance Score',
      value: `${complianceData?.complianceScore || 0}%`,
      icon: Shield,
      color: 'bg-[#0A3269]',
      textColor: 'text-white',
      progress: complianceData?.complianceScore || 0,
    },
    {
      title: 'Valid Documents',
      value: `${(complianceData?.totalDocuments || 0) - (complianceData?.expiredCount || 0) - (complianceData?.expiringSoonCount || 0)}`,
      icon: CheckCircle,
      color: 'bg-blue-600',
      textColor: 'text-white',
    },
    {
      title: 'Expiring Soon',
      value: `${complianceData?.expiringSoonCount || 0}`,
      icon: AlertTriangle,
      color: 'bg-amber-600',
      textColor: 'text-white',
    },
    {
      title: 'Expired',
      value: `${complianceData?.expiredCount || 0}`,
      icon: XCircle,
      color: 'bg-red-600',
      textColor: 'text-white',
    },
  ]

  const tabItems = [
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'business', label: 'Business Setup', icon: Building2 },
    { id: 'regulations', label: 'Regulations', icon: Gavel },
    { id: 'alerts', label: 'Alerts', icon: Bell },
  ]

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-black/20 transition-colors duration-200 p-2">
        <div className="space-y-5">
          {/* ─── Header ──────────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <div className="p-1.5 rounded-lg bg-[#0A3269]">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-light text-gray-900 dark:text-white tracking-tight">
                  Compliance Dashboard
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light ml-1">
                Monitor your documents and regulatory compliance
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="ghost" 
                onClick={loadComplianceData} 
                disabled={isLoading}
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg h-9 px-4 text-sm font-light"
              >
                <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={() => setShowUploadDialog(true)}
                className="bg-[#0A3269] text-white hover:bg-[#1A4A8A] rounded-lg h-9 px-4 text-sm font-light shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Upload className="mr-2 h-3.5 w-3.5" />
                Upload Document
              </Button>
            </div>
          </div>

          {/* ─── Stats ──────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative overflow-hidden rounded-xl border border-gray-200/60 dark:border-white/5 bg-white dark:bg-black/40 shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A3269]/5 to-transparent pointer-events-none" />
                <div className="p-3 sm:p-4 relative z-10">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs font-light text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {stat.title}
                      </p>
                      <p className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white mt-0.5">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg ${stat.color} ${stat.textColor} shadow-sm`}>
                      <stat.icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </div>
                  </div>
                  {stat.progress !== undefined && (
                    <div className="mt-2 relative">
                      <Progress value={stat.progress} className="h-1 bg-gray-200/50 dark:bg-gray-700/50 [&>div]:bg-[#0A3269]" />
                      <div className="absolute top-0 left-0 h-full w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* ─── Urgent Alert ────────────────────────────────────────────────── */}
          <AnimatePresence>
            {complianceData && (complianceData.expiredCount > 0 || complianceData.expiringSoonCount > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/30 bg-amber-50/60 dark:bg-amber-950/15 p-3.5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-amber-900 dark:text-amber-200 text-sm font-light">
                      <strong>Action Required:</strong> You have {complianceData.expiredCount} expired and {complianceData.expiringSoonCount} expiring documents. Please renew them to maintain compliance.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Main Card ───────────────────────────────────────────────────── */}
          <div className="rounded-xl border border-gray-200/60 dark:border-white/5 bg-white dark:bg-black/40 duration-300 overflow-hidden shadow-sm">
            {/* ─── Tabs ──────────────────────────────────────────────────────── */}
            <div className="border-b border-gray-200/50 dark:border-white/5 px-3 py-2.5 relative">
              <div className="flex items-center gap-1.5">
                {showLeftArrow && (
                  <button
                    onClick={() => scrollTabs('left')}
                    className="shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                )}
                
                <div
                  ref={tabsContainerRef}
                  className="overflow-x-auto scrollbar-hide flex-1"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  <div className="flex gap-1.5 min-w-max px-2">
                    {tabItems.map((tab) => {
                      const Icon = tab.icon
                      const isActive = activeTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`
                            shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-light
                            transition-all duration-300 whitespace-nowrap
                            ${isActive
                              ? 'bg-[#0A3269] text-white shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                            }
                          `}
                        >
                          <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                          <span className="hidden sm:inline">{tab.label}</span>
                          <span className="sm:hidden">{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {showRightArrow && (
                  <button
                    onClick={() => scrollTabs('right')}
                    className="shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* ─── Content ───────────────────────────────────────────────────── */}
            <div className="p-4 max-h-[600px] overflow-y-auto scrollbar-thin">
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
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-light text-gray-900 dark:text-white">Document Status</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-light">Track expiration dates and renewal requirements</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <Input
                              placeholder="Search documents..."
                              className="pl-8 h-9 w-full sm:w-44 rounded-lg border-gray-200/50 dark:border-white/10 bg-white dark:bg-black/10 text-xs focus:ring-[#0A3269]"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-9 w-32 rounded-lg border-gray-200/50 dark:border-white/10 bg-white dark:bg-black/10 text-xs focus:ring-[#0A3269]">
                              <SelectValue placeholder="All status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="valid">Valid</SelectItem>
                              <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        <AnimatePresence>
                          {filteredDocuments.length > 0 ? (
                            filteredDocuments.map((doc: UserDocument, index: number) => {
                              const expiryDate = doc.expiryDate ? new Date(doc.expiryDate) : null
                              const daysRemaining = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
                              const statusColor = getStatusColor(doc.status)
                              const StatusIcon = getStatusIcon(doc.status)
                              const isDeleting = deletingDocId === doc._id
                              
                              return (
                                <motion.div
                                  key={doc._id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <div className={`rounded-lg border p-3 transition-all duration-300 hover:shadow-sm ${
                                    statusColor === 'emerald' ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30' :
                                    statusColor === 'amber' ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30' :
                                    statusColor === 'red' ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30' :
                                    'bg-gray-50/60 dark:bg-gray-800/20 border-gray-200/50 dark:border-gray-700/30'
                                  }`}>
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                      <div className="flex items-start gap-2.5 flex-1">
                                        <div className={`p-1.5 rounded-lg ${
                                          statusColor === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                          statusColor === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                          statusColor === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                          'bg-gray-100 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400'
                                        }`}>
                                          <StatusIcon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="text-sm font-light text-gray-900 dark:text-white capitalize">
                                              {doc.type.replace(/_/g, ' ')}
                                            </h4>
                                            <Badge className={`${
                                              statusColor === 'emerald' ? 'bg-emerald-100/60 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-0' :
                                              statusColor === 'amber' ? 'bg-amber-100/60 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-0' :
                                              statusColor === 'red' ? 'bg-red-100/60 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-0' :
                                              'bg-gray-100/60 text-gray-700 dark:bg-gray-800/20 dark:text-gray-400 border-0'
                                            } text-[9px] font-light px-2 py-0`}>
                                              {doc.status.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 mt-1 text-xs">
                                            {doc.documentNumber && (
                                              <div className="flex items-center gap-1">
                                                <span className="text-gray-500 dark:text-gray-400 font-light">#</span>
                                                <span className="font-light text-gray-900 dark:text-white truncate">{doc.documentNumber}</span>
                                              </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                              <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                              <span className="text-gray-500 dark:text-gray-400 font-light">Uploaded:</span>
                                              <span className="font-light text-gray-900 dark:text-white">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                            </div>
                                            {expiryDate && (
                                              <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                <span className="text-gray-500 dark:text-gray-400 font-light">Expires:</span>
                                                <span className={`font-light ${
                                                  daysRemaining && daysRemaining < 30 ? 'text-amber-600 dark:text-amber-400' : 
                                                  daysRemaining && daysRemaining < 0 ? 'text-red-600 dark:text-red-400' : 
                                                  'text-gray-900 dark:text-white'
                                                }`}>
                                                  {expiryDate.toLocaleDateString()}
                                                  {daysRemaining !== null && (
                                                    <span className="ml-1 text-[9px]">
                                                      ({daysRemaining < 0 ? 'Expired' : `${daysRemaining} days`})
                                                    </span>
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                          </div>

                                          {doc.status === 'expiring_soon' && (
                                            <div className="mt-2 rounded-lg border border-amber-200/50 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-950/10 p-2">
                                              <div className="flex items-start gap-1.5">
                                                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5" />
                                                <span className="text-xs text-amber-900 dark:text-amber-200 font-light">
                                                  This document will expire soon. Please renew it to avoid service interruption.
                                                </span>
                                              </div>
                                            </div>
                                          )}

                                          {doc.status === 'expired' && (
                                            <div className="mt-2 rounded-lg border border-red-200/50 dark:border-red-800/30 bg-red-50/50 dark:bg-red-950/10 p-2">
                                              <div className="flex items-start gap-1.5">
                                                <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 mt-0.5" />
                                                <span className="text-xs text-red-900 dark:text-red-200 font-light">
                                                  This document has expired. Immediate renewal required.
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-1 self-start sm:self-center">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => window.open(getDocumentUrl(doc.path), '_blank')}
                                          className="h-7 w-7 p-0 rounded-lg text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                                          title="View document"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={async () => {
                                            const url = getDocumentUrl(doc.path)
                                            try {
                                              const token = localStorage.getItem('authToken') || ''
                                              const response = await fetch(url, {
                                                headers: { Authorization: `Bearer ${token}` },
                                              })
                                              if (!response.ok) throw new Error('Download failed')
                                              const blob = await response.blob()
                                              const blobUrl = URL.createObjectURL(blob)
                                              const link = document.createElement('a')
                                              link.href = blobUrl
                                              link.download = doc.type || 'document'
                                              document.body.appendChild(link)
                                              link.click()
                                              document.body.removeChild(link)
                                              setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
                                              toast.success('Download started')
                                            } catch (error) {
                                              window.open(url, '_blank')
                                              toast.info('Opening in new tab')
                                            }
                                          }}
                                          className="h-7 w-7 p-0 rounded-lg text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                                          title="Download document"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteDocument(doc._id)}
                                          disabled={isDeleting}
                                          className="h-7 w-7 p-0 rounded-lg text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                                          title="Delete document"
                                        >
                                          {isDeleting ? (
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )
                            })
                          ) : (
                            <div className="text-center py-10">
                              <div className="mx-auto w-14 h-14 rounded-full bg-gray-100/50 dark:bg-gray-800/50 flex items-center justify-center mb-3">
                                <FileText className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-light mb-3">No documents match your search</p>
                              <Button 
                                onClick={() => setShowUploadDialog(true)} 
                                className="bg-[#0A3269] text-white hover:bg-[#1A4A8A] rounded-lg h-9 px-4 text-sm font-light shadow-sm hover:shadow-md transition-all duration-300"
                              >
                                <Upload className="w-3.5 h-3.5 mr-2" />
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
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-light text-gray-900 dark:text-white">Business Setup in UAE</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-light">Manage your company information and trade license</p>
                        </div>
                        <Button 
                          onClick={() => setShowBusinessDialog(true)}
                          className="bg-white dark:bg-black text-gray-900 dark:text-white border border-gray-200/60 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg h-8 px-3 text-xs font-light shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          {businessData.hasCompany ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                              Update
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 mr-1.5" />
                              Setup
                            </>
                          )}
                        </Button>
                      </div>

                      {businessData.hasCompany ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
                              <Label className="text-[10px] text-gray-500 dark:text-gray-400 font-light uppercase tracking-wider">Company Name</Label>
                              <p className="font-light text-gray-900 dark:text-white mt-0.5 text-sm">{businessData.companyName || 'Not set'}</p>
                            </div>
                            <div className="p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
                              <Label className="text-[10px] text-gray-500 dark:text-gray-400 font-light uppercase tracking-wider">Establishment Type</Label>
                              <p className="font-light text-gray-900 dark:text-white capitalize mt-0.5 text-sm">{businessData.establishmentType || 'Not set'}</p>
                            </div>
                            <div className="p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
                              <Label className="text-[10px] text-gray-500 dark:text-gray-400 font-light uppercase tracking-wider">Business Activity</Label>
                              <p className="font-light text-gray-900 dark:text-white mt-0.5 text-sm">{businessData.businessActivity || 'Not set'}</p>
                            </div>
                            {businessData.tradeLicenseNumber && (
                              <div className="p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
                                <Label className="text-[10px] text-gray-500 dark:text-gray-400 font-light uppercase tracking-wider">Trade License Number</Label>
                                <p className="font-light text-gray-900 dark:text-white mt-0.5 text-sm">{businessData.tradeLicenseNumber}</p>
                              </div>
                            )}
                          </div>

                          {businessData.tradeLicenseExpiry && (
                            <div className="rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30 p-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                                <span className="text-sm font-light text-gray-900 dark:text-white">
                                  Trade License expires on {new Date(businessData.tradeLicenseExpiry).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <div className="mx-auto w-14 h-14 rounded-full bg-gray-100/50 dark:bg-gray-800/50 flex items-center justify-center mb-3">
                            <Building2 className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                          </div>
                          <h3 className="text-base font-light text-gray-900 dark:text-white mb-1">Setup Your Business</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-light mb-3 max-w-md mx-auto">
                            Add your company information to track trade license and establishment requirements
                          </p>
                          <Button onClick={() => setShowBusinessDialog(true)} className="bg-[#0A3269] text-white hover:bg-[#1A4A8A] rounded-lg h-9 px-4 text-sm font-light shadow-sm hover:shadow-md transition-all duration-300">
                            <Plus className="w-3.5 h-3.5 mr-2" />
                            Add Business Information
                          </Button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                          >
                            <div className="rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-black/20 hover:border-[#0A3269]/30 transition-all duration-300 overflow-hidden">
                              <div className="h-0.5 bg-[#0A3269]"></div>
                              <div className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <item.icon className="h-4 w-4 text-[#0A3269]" />
                                  <h4 className="text-sm font-light text-gray-900 dark:text-white">{item.title}</h4>
                                </div>
                                <ul className="space-y-1.5 text-xs">
                                  {item.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-600 dark:text-gray-400 font-light">{feature}</span>
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
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#0A3269]/10">
                          <Gavel className="h-5 w-5 text-[#0A3269]" />
                        </div>
                        <div>
                          <h3 className="text-base font-light text-gray-900 dark:text-white">
                            UAE Immigration & Visa Regulations
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-light mt-0.5">
                            Stay updated with the latest rules and requirements for 2024-2025
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-blue-200/40 dark:border-blue-800/20 bg-blue-50/30 dark:bg-blue-950/10 p-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-200/30">
                            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="text-blue-900 dark:text-blue-200">
                            <p className="text-xs font-medium">Latest Update</p>
                            <p className="text-xs opacity-90 font-light">
                              New visa categories introduced in 2024, including 5-year multi-entry tourist visa and expanded golden visa eligibility.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5">
                            <FileText className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                          </div>
                          <h4 className="text-sm font-light text-gray-900 dark:text-white">
                            Document Validity Requirements
                          </h4>
                        </div>
                        <div className="grid gap-2">
                          {[
                            {
                              title: 'Emirates ID',
                              desc: 'Must be renewed before expiry. Processing time: 2-3 weeks',
                              icon: Shield,
                              color: 'bg-emerald-50/30 dark:bg-emerald-950/10'
                            },
                            {
                              title: 'Residence Visa',
                              desc: 'Grace period: 30 days after expiry. Late fine: AED 125 per day',
                              icon: Clock,
                              color: 'bg-blue-50/30 dark:bg-blue-950/10'
                            },
                            {
                              title: 'Trade License',
                              desc: 'Annual renewal required. Late renewal penalties apply',
                              icon: Building2,
                              color: 'bg-amber-50/30 dark:bg-amber-950/10'
                            },
                            {
                              title: 'Passport Validity',
                              desc: 'Must be valid for at least 6 months for visa applications',
                              icon: FileText,
                              color: 'bg-purple-50/30 dark:bg-purple-950/10'
                            }
                          ].map((item, index) => {
                            const Icon = item.icon
                            return (
                              <motion.div
                                key={item.title}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.06 }}
                                className={`p-3 rounded-lg border border-gray-200/40 dark:border-white/5 ${item.color}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="p-1.5 rounded-lg bg-gray-100/50 dark:bg-white/5 border border-gray-200/20 dark:border-white/5">
                                    <Icon className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-light text-gray-900 dark:text-white">{item.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light mt-0.5">{item.desc}</p>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5">
                            <ExternalLink className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                          </div>
                          <h4 className="text-sm font-light text-gray-900 dark:text-white">
                            Important Links
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {[
                            { label: 'UAE Government Portal', url: 'https://u.ae/' },
                            { label: 'GDRFA Dubai', url: 'https://www.gdrfad.gov.ae' },
                            { label: 'ICP Smart Services', url: 'https://smartservices.icp.gov.ae' },
                            { label: 'MOHRE', url: 'https://www.mohre.gov.ae' }
                          ].map((link) => (
                            <Button 
                              key={link.label}
                              variant="ghost" 
                              className="justify-start text-gray-600 dark:text-gray-400 bg-white dark:bg-black/20 border border-gray-200/30 dark:border-white/5 rounded-lg px-3 py-2 h-auto text-xs font-light hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300"
                              onClick={() => window.open(link.url, '_blank')}
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-2 text-gray-500 dark:text-gray-400" />
                              <span>{link.label}</span>
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
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#0A3269]/10">
                          <Bell className="h-5 w-5 text-[#0A3269]" />
                        </div>
                        <div>
                          <h3 className="text-base font-light text-gray-900 dark:text-white">
                            Notification Preferences
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-light mt-0.5">
                            Manage how you receive expiry alerts
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-blue-200/40 dark:border-blue-800/20 bg-blue-50/30 dark:bg-blue-950/10 p-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-200/30">
                            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="text-blue-900 dark:text-blue-200">
                            <p className="text-xs font-medium">Smart Notifications</p>
                            <p className="text-xs opacity-90 font-light">
                              We'll notify you when your documents are expiring: <strong>30 days</strong>, <strong>15 days</strong>, and <strong>7 days</strong> before expiry.
                            </p>
                          </div>
                        </div>
                      </div>

                      {complianceData?.expiringDocuments && complianceData.expiringDocuments.length > 0 ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5">
                              <Clock className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                            </div>
                            <h4 className="text-sm font-light text-gray-900 dark:text-white">
                              Upcoming Renewals
                            </h4>
                            <Badge className="bg-amber-100/60 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-0 text-[9px] font-light px-2 py-0 ml-auto">
                              {complianceData.expiringDocuments.length} items
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {complianceData.expiringDocuments.map((doc, index) => (
                              <motion.div
                                key={doc.documentId}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.06 }}
                              >
                                <div className={`p-3 rounded-lg border ${
                                  doc.status === 'expired' 
                                    ? 'border-rose-200/40 dark:border-rose-800/20 bg-rose-50/30 dark:bg-rose-950/10' 
                                    : 'border-amber-200/40 dark:border-amber-800/20 bg-amber-50/30 dark:bg-amber-950/10'
                                }`}>
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      <div className={`p-1.5 rounded-lg ${
                                        doc.status === 'expired' 
                                          ? 'bg-rose-500/10 border border-rose-200/30' 
                                          : 'bg-amber-500/10 border border-amber-200/30'
                                      }`}>
                                        {doc.status === 'expired' ? (
                                          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                        ) : (
                                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        )}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <p className="text-sm font-light text-gray-900 dark:text-white capitalize">
                                            {doc.documentType.replace(/_/g, ' ')}
                                          </p>
                                          <Badge className={`${
                                            doc.status === 'expired' 
                                              ? 'bg-rose-100/60 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400 border-0 text-[9px] font-light px-2 py-0' 
                                              : 'bg-amber-100/60 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-0 text-[9px] font-light px-2 py-0'
                                          }`}>
                                            {doc.status === 'expired' ? 'Expired' : 'Expiring Soon'}
                                          </Badge>
                                        </div>
                                        <p className={`text-xs font-light ${
                                          doc.status === 'expired' 
                                            ? 'text-rose-700 dark:text-rose-400' 
                                            : 'text-amber-700 dark:text-amber-400'
                                        }`}>
                                          {doc.status === 'expired' 
                                            ? `Expired ${Math.abs(doc.daysRemaining)} days ago`
                                            : `Expires in ${doc.daysRemaining} days`
                                          }
                                        </p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-light mt-0.5">
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
                                      } rounded-lg h-8 px-3 text-xs font-light shadow-sm hover:shadow-md transition-all duration-300`}
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
                        <div className="rounded-lg border border-emerald-200/40 dark:border-emerald-800/20 bg-emerald-50/30 dark:bg-emerald-950/10 p-6 text-center">
                          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-200/30 flex items-center justify-center mb-3">
                            <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <p className="text-base font-light text-gray-900 dark:text-white">All Documents Valid</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-light mt-0.5">No upcoming renewals required</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-light mt-1">✓ All your documents are up to date</p>
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

      {/* ─── Upload Dialog ────────────────────────────────────────────────── */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="bg-white dark:bg-black border border-gray-200/50 dark:border-white/10 max-w-md rounded-xl shadow-xl p-0 overflow-hidden backdrop-blur-sm">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0A3269]" />
            <DialogHeader className="p-5 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0A3269]/10">
                  <Upload className="h-4 w-4 text-[#0A3269]" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-light text-gray-900 dark:text-white">
                    Upload Document
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 font-light">
                    Add a new document to your profile
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-5 pt-3 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-light text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                Document Type
              </Label>
              <Select value={uploadDocType} onValueChange={setUploadDocType}>
                <SelectTrigger className="bg-white dark:bg-black border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white rounded-lg h-10 text-sm font-light focus:ring-[#0A3269]">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border border-gray-200/50 dark:border-white/10 rounded-lg">
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

            <div className="space-y-1.5">
              <Label className="text-xs font-light text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                Document File
              </Label>
              <div className="relative">
                <Input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="bg-white dark:bg-black border-2 border-dashed border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white rounded-lg h-10 text-sm font-light file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-light file:bg-[#0A3269] file:text-white hover:file:bg-[#1A4A8A] transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-light text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                Document Number <span className="text-[10px] text-gray-400 dark:text-gray-500 font-light">(Optional)</span>
              </Label>
              <Input
                value={uploadDocNumber}
                onChange={(e) => setUploadDocNumber(e.target.value)}
                placeholder="e.g., 784-1234-5678901-2"
                className="bg-white dark:bg-black border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-lg h-10 text-sm font-light focus:ring-[#0A3269]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-light text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                Expiry Date <span className="text-[10px] text-gray-400 dark:text-gray-500 font-light">(Optional)</span>
              </Label>
              <Input
                type="date"
                value={uploadExpiryDate}
                onChange={(e) => setUploadExpiryDate(e.target.value)}
                className="bg-white dark:bg-black border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white rounded-lg h-10 text-sm font-light focus:ring-[#0A3269]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button 
                onClick={handleUploadDocument} 
                disabled={isLoading} 
                className="flex-1 bg-[#0A3269] text-white hover:bg-[#1A4A8A] rounded-lg h-10 text-sm font-light shadow-sm hover:shadow-md transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-3.5 w-3.5" />
                    Upload Document
                  </>
                )}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowUploadDialog(false)} 
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg h-10 px-4 text-sm font-light transition-all duration-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Business Dialog ──────────────────────────────────────────────── */}
      <Dialog open={showBusinessDialog} onOpenChange={setShowBusinessDialog}>
        <DialogContent className="bg-white dark:bg-black border border-gray-200/50 dark:border-white/10 max-w-2xl rounded-xl shadow-xl p-0 overflow-hidden">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0A3269]" />
            <DialogHeader className="p-5 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0A3269]/10">
                  <Building2 className="h-4 w-4 text-[#0A3269]" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-light text-gray-900 dark:text-white">
                    Business Information
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 font-light">
                    Manage your company and trade license details
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-5 pt-3 space-y-4">
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200/50 dark:border-white/10 bg-gray-50/30 dark:bg-white/5">
              <input
                type="checkbox"
                checked={businessData.hasCompany}
                onChange={(e) => setBusinessData({ ...businessData, hasCompany: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-700 h-4 w-4 accent-[#0A3269]"
              />
              <Label className="text-sm font-light text-gray-900 dark:text-white">I have a company in UAE</Label>
            </div>

            {businessData.hasCompany && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div>
                    <Label className="text-xs font-light text-gray-700 dark:text-gray-300">Company Name</Label>
                    <Input
                      value={businessData.companyName}
                      onChange={(e) => setBusinessData({ ...businessData, companyName: e.target.value })}
                      placeholder="Enter company name"
                      className="bg-white dark:bg-black border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-lg h-10 text-sm font-light focus:ring-[#0A3269]"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-light text-gray-700 dark:text-gray-300">Establishment Type</Label>
                    <Select 
                      value={businessData.establishmentType} 
                      onValueChange={(value) => setBusinessData({ ...businessData, establishmentType: value })}
                    >
                      <SelectTrigger className="bg-white dark:bg-black border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white rounded-lg h-10 text-sm font-light focus:ring-[#0A3269]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-black border border-gray-200/50 dark:border-white/10 rounded-lg">
                        <SelectItem value="mainland">Mainland</SelectItem>
                        <SelectItem value="freezone">Freezone</SelectItem>
                        <SelectItem value="offshore">Offshore</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-light text-gray-700 dark:text-gray-300">Business Activity</Label>
                    <Input
                      value={businessData.businessActivity}
                      onChange={(e) => setBusinessData({ ...businessData, businessActivity: e.target.value })}
                      placeholder="e.g., Trading, Consulting, etc."
                      className="bg-white dark:bg-black border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-lg h-10 text-sm font-light focus:ring-[#0A3269]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-light text-gray-700 dark:text-gray-300">Trade License Number</Label>
                      <Input
                        value={businessData.tradeLicenseNumber}
                        onChange={(e) => setBusinessData({ ...businessData, tradeLicenseNumber: e.target.value })}
                        placeholder="License number"
                        className="bg-white dark:bg-black border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-lg h-10 text-sm font-light focus:ring-[#0A3269]"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-light text-gray-700 dark:text-gray-300">License Expiry Date</Label>
                      <Input
                        type="date"
                        value={businessData.tradeLicenseExpiry}
                        onChange={(e) => setBusinessData({ ...businessData, tradeLicenseExpiry: e.target.value })}
                        className="bg-white dark:bg-black border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white rounded-lg h-10 text-sm font-light focus:ring-[#0A3269]"
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            <div className="flex gap-2 pt-1">
              <Button onClick={handleUpdateBusiness} disabled={isLoading} className="flex-1 bg-[#0A3269] text-white hover:bg-[#1A4A8A] rounded-lg h-10 text-sm font-light shadow-sm hover:shadow-md transition-all duration-300">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowBusinessDialog(false)} 
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg h-10 px-4 text-sm font-light transition-all duration-300"
              >
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