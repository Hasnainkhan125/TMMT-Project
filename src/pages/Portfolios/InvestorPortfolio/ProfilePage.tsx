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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-black p-4 md:p-6 transition-colors duration-200 rounded-2xl">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header - Clean & Minimal */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight">
                Profile Settings
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account, documents, and preferences</p>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                <Button 
  variant="ghost" 
  onClick={() => setIsEditing(false)}
  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
>
  Cancel
</Button>
<Button 
  onClick={handleSave} 
  disabled={isSaving} 
  className="bg-white dark:bg-black text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300 shadow-sm hover:shadow-md"
>
  {isSaving ? (
    <>
      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    <>
      <Save className="mr-2 h-4 w-4" />
      Save Changes
    </>
  )}
</Button>
                </>
              ) : (
          <Button
  onClick={() => setIsEditing(true)}
  className="bg-white dark:bg-black text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300 shadow-sm hover:shadow-md"
>
  <Settings className="mr-2 h-4 w-4" />
  Edit Profile
</Button>
              )}
            </div>
          </div>

          {/* Profile Overview Card - Clean without shadow */}
          <div className="relative overflow-hidden border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-black">
            <div className="relative p-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
               <Avatar className="h-28 w-28 border-2 border-gray-200 dark:border-white/10">
  <AvatarImage src={profileData.avatar} alt="Profile" />
  <AvatarFallback className="text-2xl bg-white dark:bg-black text-gray-900 dark:text-white">
    {profileData.firstName.charAt(0)}
    {profileData.lastName.charAt(0)}
  </AvatarFallback>
</Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full h-9 w-9 p-0 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                      onClick={() => toast.info('Opening image picker...')}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                    <h2 className="text-2xl font-bold text-black dark:text-white">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                    <Badge variant="outline" className="border-gray-300 dark:border-gray-700 text-black dark:text-white">
                      <Crown className="mr-1 h-3 w-3 text-black dark:text-white" />
                      Premium
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 justify-center md:justify-start">
                    <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="mr-1 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      {profileData.email}
                    </span>
                    <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="mr-1 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      {profileData.phone}
                    </span>
                    <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="mr-1 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      {profileData.country || 'Not set'}
                    </span>
                  </div>
                  {profileData.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">{profileData.bio}</p>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-900/50 px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-black dark:text-white">Security Score</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={stats.securityScore} className="w-32 h-2 bg-gray-200 dark:bg-gray-700" />
                    <span className="text-lg font-bold text-black dark:text-white">{stats.securityScore}%</span>
                  </div>
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
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black rounded-full h-8 w-8 md:hidden border border-gray-200 dark:border-gray-700"
                onClick={() => scrollTabs('left')}
              >
                <ChevronLeft className="h-4 w-4 text-black dark:text-white" />
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
                      className={`shrink-0 rounded-xl whitespace-nowrap transition-all duration-300 ${
                        isActive
                          ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon className={`h-4 w-4 mr-1.5 ${isActive ? 'text-white dark:text-black' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span className="text-sm">{tab.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {showRightArrow && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black rounded-full h-8 w-8 md:hidden border border-gray-200 dark:border-gray-700"
                onClick={() => scrollTabs('right')}
              >
                <ChevronRight className="h-4 w-4 text-black dark:text-white" />
              </Button>
            )}
          </div>

          {/* Tab Content - Clean without shadows */}
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-black"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-black dark:text-white">
                    <User className="h-5 w-5 text-black dark:text-white" />
                    Personal Information
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your basic profile details</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-black dark:text-white text-sm font-medium">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-black dark:text-white text-sm font-medium">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-black dark:text-white text-sm font-medium">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-black dark:text-white text-sm font-medium">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-black dark:text-white text-sm font-medium">Country</Label>
                      <Input
                        id="country"
                        value={profileData.country}
                        onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-black dark:text-white text-sm font-medium">Company</Label>
                      <Input
                        id="company"
                        value={profileData.company}
                        onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle" className="text-black dark:text-white text-sm font-medium">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={profileData.jobTitle}
                        onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-black dark:text-white text-sm font-medium">Website</Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-0"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="bio" className="text-black dark:text-white text-sm font-medium">Bio</Label>
                      <textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full min-h-[100px] rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-black"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-black dark:text-white">
                    <FileText className="h-5 w-5 text-black dark:text-white" />
                    Personal Documents
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your identity and official documents</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Emirates ID', 'Passport', 'Residence Visa', 'Driving License', 'Bank Statement', 'Salary Certificate'].map((docType) => {
                      const doc = personalDocuments.find(d => d.type === docType)
                      const status = doc ? getDocumentStatus(doc) : null

                      return (
                        <div key={docType} className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-black hover:border-black dark:hover:border-white transition-all">
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                                  <FileText className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                                </div>
                                <div>
                                  <p className="font-medium text-black dark:text-white">{docType}</p>
                                  {doc ? (
                                    <>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{doc.name}</p>
                                      {status && (
                                        <Badge className={`${status.color} text-xs mt-1 border-0`}>
                                          {status.label}
                                        </Badge>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Not uploaded</p>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant={doc ? "outline" : "default"}
                                onClick={() => handleUploadDocument(docType)}
                                className={doc ? "border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800" : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"}
                              >
                                {doc ? <RefreshCw className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
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
                className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-black"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-black dark:text-white">
                    <CreditCard className="h-5 w-5 text-black dark:text-white" />
                    Payment Methods
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your credit and debit cards</p>
                </div>
                <div className="p-6">
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <CreditCard className="h-10 w-10 text-gray-700 dark:text-gray-300" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">No payment methods added yet</p>
                      <Button onClick={() => toast.info('Opening payment method dialog...')} className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Credit/Debit Card
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-black">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-6 h-6 text-black dark:text-white" />
                            <div>
                              <p className="font-medium text-black dark:text-white">{method.cardType} •••• {method.last4}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Expires {method.expiry}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => toast.info('Opening payment method dialog...')}>
                        <Plus className="w-4 h-4 mr-2" />
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
                className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-black"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-black dark:text-white">
                    <Shield className="h-5 w-5 text-black dark:text-white" />
                    Security Settings
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account security</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-black dark:text-white">Password</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Change your account password</p>
                    </div>
                    <Button variant="outline" onClick={() => toast.info('Opening password change dialog...')} className="border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Lock className="mr-2 h-4 w-4 text-black dark:text-white" />
                      Change Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-black dark:text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add extra security to your account</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-black dark:text-white">Show Sensitive Data</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Toggle visibility of sensitive information</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowSensitiveData(!showSensitiveData)}
                      className="border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {showSensitiveData ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4 text-black dark:text-white" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4 text-black dark:text-white" />
                          Show
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-black dark:text-white">Fingerprint Authentication</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Use fingerprint to sign in</p>
                    </div>
                    <Switch />
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
                className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-black"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-black dark:text-white">
                    <Bell className="h-5 w-5 text-black dark:text-white" />
                    Notification Preferences
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose how you want to receive updates</p>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
                    { id: 'sms', label: 'SMS Notifications', desc: 'Receive urgent alerts via SMS', icon: Phone },
                    { id: 'push', label: 'Push Notifications', desc: 'Browser notifications', icon: Bell },
                    { id: 'security', label: 'Security Alerts', desc: 'Get notified about security events', icon: Shield },
                    { id: 'updates', label: 'Product Updates', desc: 'New features and improvements', icon: Sparkles },
                    { id: 'marketing', label: 'Marketing Communications', desc: 'Updates about features and offers', icon: Gift },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <item.icon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <p className="font-medium text-black dark:text-white">{item.label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications[item.id as keyof typeof notifications]}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.id]: checked }))}
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
                className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-black"
              >
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-black dark:text-white">
                    <Activity className="h-5 w-5 text-black dark:text-white" />
                    Activity Log
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Recent account activity and connected devices</p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Connected Devices */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-black dark:text-white">
                      <Smartphone className="h-4 w-4 text-black dark:text-white" />
                      Connected Devices
                    </h4>
                    <div className="space-y-3">
                      {connectedDevices.map((device) => {
                        const DeviceIcon = getDeviceIcon(device.type)
                        return (
                          <div key={device.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                                <DeviceIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                              </div>
                              <div>
                                <p className="font-medium text-black dark:text-white">{device.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Last active: {device.lastActive}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {device.isCurrent && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                                  Current
                                </Badge>
                              )}
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                                <Trash2 className="h-4 w-4" />
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
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-black dark:text-white">
                      <Clock className="h-4 w-4 text-black dark:text-white" />
                      Recent Activity
                    </h4>
                    <div className="space-y-3">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                            <Activity className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-black dark:text-white">{log.action}</p>
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span>{log.timestamp}</span>
                              <span>•</span>
                              <span>{log.device}</span>
                              <span>•</span>
                              <span>{log.location}</span>
                              <span>•</span>
                              <span>IP: {log.ip}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400">
                            <MoreVertical className="h-4 w-4" />
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