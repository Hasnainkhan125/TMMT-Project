"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Badge } from "../../../components/ui/badge"
import { Switch } from "../../../components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Progress } from "../../../components/ui/progress"
import { Separator } from "../../../components/ui/separator"
import {
  User,
  Mail,
  Phone,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Camera,
  CheckCircle,
  Settings,
  Lock,
  Upload,
  FileText,
  CreditCard,
  Plus,
  Trash2,
  Calendar,
  Award,
  Clock,
  Globe,
  Briefcase,
  MapPin,
  Link2,
  ShieldCheck,
  Fingerprint,
  Key,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Activity,
  Smartphone,
  Monitor,
  Laptop,
  Tablet,
  Wifi,
  Bluetooth,
  Printer,
  FolderOpen,
  Download,
  ExternalLink,
  Edit2,
  MoreVertical,
  Zap,
  Sparkles,
  Crown,
  Gem,
  Heart,
  Gift,
  Trophy,
  Medal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from "sonner"
import { Layout } from "../../Dashboards/InvestorDashboard/Layout"
import { useAuth } from "@/contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"

interface PersonalDocument {
  id: string
  type: string
  name: string
  uploadedAt: string
  expiresAt?: string
  status: 'valid' | 'expiring' | 'expired'
}

interface ActivityLog {
  id: string
  action: string
  timestamp: string
  device: string
  location: string
  ip: string
}

interface ConnectedDevice {
  id: string
  name: string
  type: 'desktop' | 'laptop' | 'tablet' | 'mobile'
  lastActive: string
  isCurrent: boolean
}

const ProfilePage = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSensitiveData, setShowSensitiveData] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("personal")
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
    country: "",
    company: "",
    jobTitle: "",
    bio: "",
    website: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      github: "",
    }
  })

  const [personalDocuments, setPersonalDocuments] = useState<PersonalDocument[]>([
    {
      id: '1',
      type: 'Emirates ID',
      name: 'emirates_id_front.pdf',
      uploadedAt: '2024-01-15',
      expiresAt: '2026-01-15',
      status: 'valid'
    },
    {
      id: '2',
      type: 'Passport',
      name: 'passport_john_doe.pdf',
      uploadedAt: '2024-01-15',
      expiresAt: '2025-06-30',
      status: 'expiring'
    }
  ])

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'Logged in',
      timestamp: '2024-01-20 09:30:00',
      device: 'Chrome on Windows',
      location: 'Dubai, UAE',
      ip: '192.168.1.1'
    },
    {
      id: '2',
      action: 'Updated profile',
      timestamp: '2024-01-19 14:20:00',
      device: 'Safari on MacOS',
      location: 'Abu Dhabi, UAE',
      ip: '192.168.1.2'
    },
    {
      id: '3',
      action: 'Document uploaded',
      timestamp: '2024-01-18 11:45:00',
      device: 'Chrome on Android',
      location: 'Dubai, UAE',
      ip: '192.168.1.3'
    }
  ])

  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([
    {
      id: '1',
      name: 'MacBook Pro',
      type: 'laptop',
      lastActive: '2024-01-20 09:30:00',
      isCurrent: true
    },
    {
      id: '2',
      name: 'iPhone 15 Pro',
      type: 'mobile',
      lastActive: '2024-01-19 22:15:00',
      isCurrent: false
    },
    {
      id: '3',
      name: 'iPad Air',
      type: 'tablet',
      lastActive: '2024-01-18 16:00:00',
      isCurrent: false
    }
  ])

  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
    security: true,
    updates: true,
  })

  const stats = {
    documents: 12,
    applications: 5,
    approved: 3,
    pending: 2,
    securityScore: 85,
    accountAge: '2 years',
    loginCount: 156,
    lastLogin: 'Today at 09:30 AM'
  }

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

  useEffect(() => {
    loadUserProfile()
  }, [user])

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
      
      if (!userId) return
      
      const response = await fetch(`${apiBase}/api/v1/user/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phoneNumber || '',
          avatar: data.profilePicture?.path || '',
          country: data.country || '',
          company: data.company || '',
          jobTitle: data.jobTitle || '',
          bio: data.bio || '',
          website: data.website || '',
          socialLinks: {
            linkedin: data.linkedin || '',
            twitter: data.twitter || '',
            github: data.github || '',
          }
        })
        
        if (data.documents && Array.isArray(data.documents)) {
          setPersonalDocuments(data.documents.map((doc: any) => ({
            id: doc._id,
            type: doc.type,
            name: doc.path.split('/').pop() || doc.type,
            uploadedAt: doc.uploadDate,
            expiresAt: doc.expiryDate,
            status: doc.status || 'valid'
          })))
        }

        if (data.compliance?.notificationPreferences) {
          setNotifications({
            email: data.compliance.notificationPreferences.email ?? true,
            sms: data.compliance.notificationPreferences.sms ?? false,
            push: data.compliance.notificationPreferences.push ?? true,
            marketing: false,
            security: true,
            updates: true,
          })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
      
      const response = await fetch(`${apiBase}/api/v1/user/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phoneNumber: profileData.phone,
          country: profileData.country,
          company: profileData.company,
          jobTitle: profileData.jobTitle,
          bio: profileData.bio,
          website: profileData.website,
          ...profileData.socialLinks
        })
      })
      
      if (response.ok) {
        setIsEditing(false)
        toast.success("Profile updated successfully")
        loadUserProfile()
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadDocument = (type: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.jpg,.jpeg,.png'
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return
      
      try {
        const token = localStorage.getItem('authToken')
        const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
        
        const formData = new FormData()
        formData.append('document', file)
        formData.append('type', type)
        
        const response = await fetch(`${apiBase}/api/v1/user/${userId}/documents/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })
        
        if (response.ok) {
          toast.success(`${type} uploaded successfully`)
          loadUserProfile()
        } else {
          toast.error('Failed to upload document')
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload document')
      }
    }
    input.click()
  }

  const getDocumentStatus = (doc: PersonalDocument) => {
    if (!doc.expiresAt) return { label: 'No expiry', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' }
    const daysUntilExpiry = Math.ceil((new Date(doc.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysUntilExpiry < 0) return { label: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
    if (daysUntilExpiry < 60) return { label: `Expires in ${daysUntilExpiry} days`, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' }
    return { label: 'Valid', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
  }

  const getDeviceIcon = (type: string) => {
    switch(type) {
      case 'desktop': return Monitor
      case 'laptop': return Laptop
      case 'tablet': return Tablet
      case 'mobile': return Smartphone
      default: return Monitor
    }
  }

  const tabItems = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'activity', label: 'Activity', icon: Activity },
  ]

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A3269] dark:border-white mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-black p-4 md:p-6 transition-colors duration-200 rounded-2xl">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Header - Clean & Minimal */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
         <h1 className="text-2xl md:text-3xl text-black dark:text-white tracking-tight">
  Profile Settings
</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Manage your account, documents, and preferences</p>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsEditing(false)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 h-9 px-4 text-sm font-normal"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    className="bg-[#0A3269] hover:bg-[#1A4A8A] text-white transition-all duration-300 shadow-sm hover:shadow-md h-9 px-4 text-sm font-normal"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-3.5 w-3.5" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-white dark:bg-black text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300 shadow-sm hover:shadow-md h-9 px-4 text-sm font-normal"
                >
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Profile Overview Card - Clean */}
          <div className="relative overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black">
            <div className="relative p-5">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-gray-200 dark:border-white/10">
                    <AvatarImage src={profileData.avatar} alt="Profile" />
                    <AvatarFallback className="text-xl bg-[#0A3269] text-white">
                      {profileData.firstName.charAt(0)}
                      {profileData.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-[#0A3269] text-white hover:bg-[#1A4A8A]"
                      onClick={() => toast.info('Opening image picker...')}
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                    <h2 className="text-xl font-normal text-black dark:text-white">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <Badge className="bg-[#0A3269]/10 text-[#0A3269] dark:bg-[#0A3269]/30 dark:text-[#4A8ABF] border-0 text-xs font-normal">
                      <CheckCircle className="mr-1 h-3 w-3 text-[#0A3269] dark:text-[#4A8ABF]" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 justify-center md:justify-start">
                    <span className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-light">
                      <Mail className="mr-1 h-3.5 w-3.5 text-[#0A3269] dark:text-[#4A8ABF]" />
                      {profileData.email}
                    </span>
                    <span className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-light">
                      <Phone className="mr-1 h-3.5 w-3.5 text-[#0A3269] dark:text-[#4A8ABF]" />
                      {profileData.phone}
                    </span>
                    <span className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-light">
                      <MapPin className="mr-1 h-3.5 w-3.5 text-[#0A3269] dark:text-[#4A8ABF]" />
                      {profileData.country || 'Not set'}
                    </span>
                  </div>
                  {profileData.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 max-w-2xl font-light">{profileData.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Tabs - Clean scrollable */}
          <div className="relative">
            {showLeftArrow && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black shadow-md rounded-full h-7 w-7 md:hidden border border-gray-200 dark:border-white/10"
                onClick={() => scrollTabs('left')}
              >
                <ChevronLeft className="h-3.5 w-3.5 text-gray-700 dark:text-white" />
              </Button>
            )}

            <div
              ref={tabsContainerRef}
              className="overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <div className="flex gap-1 min-w-max px-4 md:px-0">
                {tabItems.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <Button
                      key={tab.id}
                      variant="ghost"
                      size="sm"
                      className={`
                        shrink-0 rounded-xl whitespace-nowrap transition-all duration-300 h-9 px-4 text-sm font-normal
                        ${
                          isActive
                            ? 'bg-[#0A3269] text-white shadow-sm hover:bg-[#1A4A8A]'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                        }
                      `}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon className={`h-3.5 w-3.5 mr-1.5 ${
                        isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                      }`} />
                      <span>{tab.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {showRightArrow && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black shadow-md rounded-full h-7 w-7 md:hidden border border-gray-200 dark:border-white/10"
                onClick={() => scrollTabs('right')}
              >
                <ChevronRight className="h-3.5 w-3.5 text-gray-700 dark:text-white" />
              </Button>
            )}
          </div>

          {/* Tab Content - Clean */}
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-3.5">
                  <h3 className="text-base font-normal flex items-center gap-2 text-black dark:text-white">
                    <User className="h-4 w-4 text-[#0A3269] dark:text-[#4A8ABF]" />
                    Personal Information
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-light">Update your basic profile details</p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-black dark:text-white text-sm font-normal">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white text-sm font-light focus:border-[#0A3269] dark:focus:border-[#4A8ABF] focus:ring-0 focus:ring-[#0A3269]/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-black dark:text-white text-sm font-normal">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white text-sm font-light focus:border-[#0A3269] dark:focus:border-[#4A8ABF] focus:ring-0 focus:ring-[#0A3269]/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-black dark:text-white text-sm font-normal">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white text-sm font-light focus:border-[#0A3269] dark:focus:border-[#4A8ABF] focus:ring-0 focus:ring-[#0A3269]/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-black dark:text-white text-sm font-normal">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white text-sm font-light focus:border-[#0A3269] dark:focus:border-[#4A8ABF] focus:ring-0 focus:ring-[#0A3269]/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="country" className="text-black dark:text-white text-sm font-normal">Country</Label>
                      <Input
                        id="country"
                        value={profileData.country}
                        onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white text-sm font-light focus:border-[#0A3269] dark:focus:border-[#4A8ABF] focus:ring-0 focus:ring-[#0A3269]/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="company" className="text-black dark:text-white text-sm font-normal">Company</Label>
                      <Input
                        id="company"
                        value={profileData.company}
                        onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white text-sm font-light focus:border-[#0A3269] dark:focus:border-[#4A8ABF] focus:ring-0 focus:ring-[#0A3269]/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="jobTitle" className="text-black dark:text-white text-sm font-normal">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={profileData.jobTitle}
                        onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white text-sm font-light focus:border-[#0A3269] dark:focus:border-[#4A8ABF] focus:ring-0 focus:ring-[#0A3269]/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="website" className="text-black dark:text-white text-sm font-normal">Website</Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white text-sm font-light focus:border-[#0A3269] dark:focus:border-[#4A8ABF] focus:ring-0 focus:ring-[#0A3269]/20"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="bio" className="text-black dark:text-white text-sm font-normal">Bio</Label>
                      <textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full min-h-[80px] rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm text-black dark:text-white font-light focus:border-[#0A3269] dark:focus:border-[#4A8ABF] focus:ring-0 focus:ring-[#0A3269]/20 placeholder:text-gray-400 dark:placeholder:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-3.5">
                  <h3 className="text-base font-normal flex items-center gap-2 text-black dark:text-white">
                    <FileText className="h-4 w-4 text-[#0A3269] dark:text-[#4A8ABF]" />
                    Personal Documents
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-light">Manage your identity and official documents</p>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['Emirates ID', 'Passport', 'Residence Visa', 'Driving License', 'Bank Statement', 'Salary Certificate'].map((docType) => {
                      const doc = personalDocuments.find(d => d.type === docType)
                      const status = doc ? getDocumentStatus(doc) : null

                      return (
                        <div key={docType} className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-black hover:border-[#0A3269]/30 dark:hover:border-[#4A8ABF]/30 transition-all">
                          <div className="p-3.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800">
                                  <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                </div>
                                <div>
                                  <p className="font-normal text-black dark:text-white text-sm">{docType}</p>
                                  {doc ? (
                                    <>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 font-light">{doc.name}</p>
                                      {status && (
                                        <Badge className={`${status.color} text-[10px] mt-0.5 border-0 font-normal`}>
                                          {status.label}
                                        </Badge>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">Not uploaded</p>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant={doc ? "outline" : "default"}
                                onClick={() => handleUploadDocument(docType)}
                                className={`h-8 px-3 text-xs font-normal ${doc ? "border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800" : "bg-[#0A3269] text-white hover:bg-[#1A4A8A]"}`}
                              >
                                {doc ? <RefreshCw className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-3.5">
                  <h3 className="text-base font-normal flex items-center gap-2 text-black dark:text-white">
                    <CreditCard className="h-4 w-4 text-[#0A3269] dark:text-[#4A8ABF]" />
                    Payment Methods
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-light">Manage your credit and debit cards</p>
                </div>
                <div className="p-5">
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                        <CreditCard className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-light mb-3">No payment methods added yet</p>
                      <Button onClick={() => toast.info('Opening payment method dialog...')} className="bg-[#0A3269] text-white hover:bg-[#1A4A8A] h-9 px-4 text-sm font-normal">
                        <Plus className="w-3.5 h-3.5 mr-2" />
                        Add Credit/Debit Card
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-3.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-black">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-black dark:text-white" />
                            <div>
                              <p className="font-normal text-black dark:text-white text-sm">{method.cardType} •••• {method.last4}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Expires {method.expiry}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-8 px-3 text-xs font-normal">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 h-9 text-sm font-normal" onClick={() => toast.info('Opening payment method dialog...')}>
                        <Plus className="w-3.5 h-3.5 mr-2" />
                        Add Another Card
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-3.5">
                  <h3 className="text-base font-normal flex items-center gap-2 text-black dark:text-white">
                    <Shield className="h-4 w-4 text-[#0A3269] dark:text-[#4A8ABF]" />
                    Security Settings
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-light">Manage your account security</p>
                </div>
                <div className="p-5 space-y-3.5">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-normal text-black dark:text-white text-sm">Password</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Change your account password</p>
                    </div>
                    <Button variant="outline" onClick={() => toast.info('Opening password change dialog...')} className="border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 h-8 px-3 text-sm font-normal">
                      <Lock className="mr-2 h-3.5 w-3.5" />
                      Change Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-normal text-black dark:text-white text-sm">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Add extra security to your account</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-[#0A3269]" />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-normal text-black dark:text-white text-sm">Show Sensitive Data</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Toggle visibility of sensitive information</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowSensitiveData(!showSensitiveData)}
                      className="border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 h-8 px-3 text-sm font-normal"
                    >
                      {showSensitiveData ? (
                        <>
                          <EyeOff className="mr-2 h-3.5 w-3.5" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-3.5 w-3.5 text-[#0A3269] dark:text-[#4A8ABF]" />
                          Show
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-normal text-black dark:text-white text-sm">Fingerprint Authentication</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Use fingerprint to sign in</p>
                    </div>
                    <Switch className="data-[state=checked]:bg-[#0A3269]" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-3.5">
                  <h3 className="text-base font-normal flex items-center gap-2 text-black dark:text-white">
                    <Bell className="h-4 w-4 text-[#0A3269] dark:text-[#4A8ABF]" />
                    Notification Preferences
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-light">Choose how you want to receive updates</p>
                </div>
                <div className="p-5 space-y-3.5">
                  {[
                    { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
                    { id: 'sms', label: 'SMS Notifications', desc: 'Receive urgent alerts via SMS', icon: Phone },
                    { id: 'push', label: 'Push Notifications', desc: 'Browser notifications', icon: Bell },
                    { id: 'security', label: 'Security Alerts', desc: 'Get notified about security events', icon: Shield },
                    { id: 'updates', label: 'Product Updates', desc: 'New features and improvements', icon: Sparkles },
                    { id: 'marketing', label: 'Marketing Communications', desc: 'Updates about features and offers', icon: Gift },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <item.icon className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <p className="font-normal text-black dark:text-white text-sm">{item.label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-light">{item.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications[item.id as keyof typeof notifications]}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.id]: checked }))}
                        className="data-[state=checked]:bg-[#0A3269]"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-3.5">
                  <h3 className="text-base font-normal flex items-center gap-2 text-black dark:text-white">
                    <Activity className="h-4 w-4 text-[#0A3269] dark:text-[#4A8ABF]" />
                    Activity Log
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-light">Recent account activity and connected devices</p>
                </div>
                <div className="p-5 space-y-5">
                  {/* Connected Devices */}
                  <div>
                    <h4 className="text-sm font-normal mb-2.5 flex items-center gap-2 text-black dark:text-white">
                      <Smartphone className="h-3.5 w-3.5 text-[#0A3269] dark:text-[#4A8ABF]" />
                      Connected Devices
                    </h4>
                    <div className="space-y-2.5">
                      {connectedDevices.map((device) => {
                        const DeviceIcon = getDeviceIcon(device.type)
                        return (
                          <div key={device.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                                <DeviceIcon className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                              </div>
                              <div>
                                <p className="font-normal text-black dark:text-white text-sm">{device.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-light">Last active: {device.lastActive}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {device.isCurrent && (
                                <Badge className="bg-[#0A3269]/10 text-[#0A3269] dark:bg-[#0A3269]/30 dark:text-[#4A8ABF] border-0 text-[10px] font-normal">
                                  Current
                                </Badge>
                              )}
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-7 w-7 p-0">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Activity Logs */}
                  <div>
                    <h4 className="text-sm font-normal mb-2.5 flex items-center gap-2 text-black dark:text-white">
                      <Clock className="h-3.5 w-3.5 text-[#0A3269] dark:text-[#4A8ABF]" />
                      Recent Activity
                    </h4>
                    <div className="space-y-2.5">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                            <Activity className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <p className="font-normal text-black dark:text-white text-sm">{log.action}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 font-light">
                              <span>{log.timestamp}</span>
                              <span>•</span>
                              <span>{log.device}</span>
                              <span>•</span>
                              <span>{log.location}</span>
                              <span>•</span>
                              <span>IP: {log.ip}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 h-7 w-7 p-0">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  )
}

export default ProfilePage