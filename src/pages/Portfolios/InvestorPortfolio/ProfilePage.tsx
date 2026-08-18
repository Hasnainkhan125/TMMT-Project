"use client"

import React, { useState, useEffect, useRef } from "react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
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
  status: 'valid' | 'expiring' | 'expired' | 'uploaded'
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

interface Session {
  id: string
  device: string
  location: string
  lastActive: string
  isCurrent: boolean
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [showSensitiveData, setShowSensitiveData] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>("personal")
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false)
  const [showRightArrow, setShowRightArrow] = useState<boolean>(false)
  
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
  
  // ─── Brand Color ──────────────────────────────────────────────────────────
  const primaryColor = '#0A3269'
  const primaryColorLight = '#0A3269' + '30'
  const primaryColorLighter = '#0A3269' + '15'

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
      status: 'uploaded'
    },
    {
      id: '2',
      type: 'Passport',
      name: 'passport_john_doe.pdf',
      uploadedAt: '2024-01-15',
      expiresAt: '2025-06-30',
      status: 'uploaded'
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

  // ─── SECURITY STATE ──────────────────────────────────────────────────────
  const [showPasswordDialog, setShowPasswordDialog] = useState<boolean>(false)
  const [showSessionsDialog, setShowSessionsDialog] = useState<boolean>(false)
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false)
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState<boolean>(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false)
  const [fingerprintEnabled, setFingerprintEnabled] = useState<boolean>(false)
  const [isFingerprintSupported, setIsFingerprintSupported] = useState<boolean>(false)
  const [activeSessions, setActiveSessions] = useState<Session[]>([
    { id: '1', device: 'Chrome on Windows', location: 'Dubai, UAE', lastActive: 'Today 09:30 AM', isCurrent: true },
    { id: '2', device: 'Safari on iPhone', location: 'Dubai, UAE', lastActive: 'Yesterday 10:15 PM', isCurrent: false },
    { id: '3', device: 'Firefox on MacBook', location: 'Abu Dhabi, UAE', lastActive: '2 days ago', isCurrent: false },
  ])

  // ─── VERIFICATION SYSTEM ──────────────────────────────────────────────
  const REQUIRED_DOCUMENTS = [
    'Emirates ID',
    'Passport',
    'Residence Visa',
    'Driving License',
    'Bank Statement',
    'Salary Certificate'
  ]

  const isFullyVerified = (): boolean => {
    const uploadedDocTypes = personalDocuments.map(doc => doc.type)
    return REQUIRED_DOCUMENTS.every(docType => uploadedDocTypes.includes(docType))
  }

  const getVerificationProgress = (): number => {
    const uploadedDocTypes = personalDocuments.map(doc => doc.type)
    const uploadedCount = REQUIRED_DOCUMENTS.filter(docType => uploadedDocTypes.includes(docType)).length
    return Math.round((uploadedCount / REQUIRED_DOCUMENTS.length) * 100)
  }

  const getVerificationStatus = (): { label: string; color: string; icon: React.ElementType } => {
    const progress = getVerificationProgress()
    if (progress === 100) return { label: 'Documents Complete', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 }
    if (progress >= 50) return { label: 'Partial Upload', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: Clock }
    return { label: 'No Documents', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', icon: Shield }
  }

  // ─── DOCUMENT STATUS ───────────────────────────────────────────────────
  const getDocumentStatus = (doc: PersonalDocument): { label: string; color: string } => {
    return { label: 'Uploaded', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' }
  }

  const stats = {
    documents: personalDocuments.length,
    applications: 5,
    approved: 3,
    pending: 2,
    securityScore: 85,
    accountAge: '2 years',
    loginCount: 156,
    lastLogin: 'Today at 09:30 AM',
    verificationProgress: getVerificationProgress(),
    isFullyVerified: isFullyVerified()
  }

  // ─── PASSWORD HELPERS ───────────────────────────────────────────────────
  const getPasswordScore = (password: string): number => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score += 25
    if (password.match(/[a-z]/)) score += 25
    if (password.match(/[A-Z]/)) score += 25
    if (password.match(/[0-9]/)) score += 25
    return score
  }

  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    const score = getPasswordScore(password)
    if (score >= 75) return 'strong'
    if (score >= 50) return 'medium'
    return 'weak'
  }

  const canChangePassword = (): boolean => {
    return currentPassword.length > 0 && 
           newPassword.length >= 8 && 
           newPassword === confirmPassword &&
           getPasswordStrength(newPassword) !== 'weak'
  }

  // ─── SECURITY HANDLERS ──────────────────────────────────────────────────
  const handlePasswordChange = async (): Promise<void> => {
    if (!canChangePassword()) {
      toast.error('Please ensure all fields are valid')
      return
    }

    setIsLoadingPassword(true)
    try {
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
      
      const response = await fetch(`${apiBase}/api/v1/user/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password changed successfully!')
        setShowPasswordDialog(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setIsLoadingPassword(false)
    }
  }

  const handleTwoFactorToggle = async (checked: boolean): Promise<void> => {
    setTwoFactorEnabled(checked)
    try {
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
      
      const response = await fetch(`${apiBase}/api/v1/user/${userId}/two-factor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: checked })
      })

      if (response.ok) {
        toast.success(checked ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled')
      } else {
        const data = await response.json()
        toast.error(data.message || 'Failed to update two-factor authentication')
        setTwoFactorEnabled(!checked)
      }
    } catch (error) {
      console.error('Error updating 2FA:', error)
      toast.error('Failed to update two-factor authentication')
      setTwoFactorEnabled(!checked)
    }
  }

  const handleFingerprintToggle = async (checked: boolean): Promise<void> => {
    setFingerprintEnabled(checked)
    
    if (checked) {
      if (!window.PublicKeyCredential) {
        toast.error('Fingerprint authentication is not supported on this device')
        setFingerprintEnabled(false)
        return
      }

      try {
        const token = localStorage.getItem('authToken')
        const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
        
        const response = await fetch(`${apiBase}/api/v1/user/${userId}/fingerprint/status`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json()
          if (!data.registered) {
            await registerFingerprint()
          } else {
            toast.success('Fingerprint already registered')
          }
        } else {
          await registerFingerprint()
        }
      } catch (error) {
        console.error('Fingerprint registration error:', error)
        toast.error('Failed to setup fingerprint authentication')
        setFingerprintEnabled(false)
      }
    } else {
      try {
        const token = localStorage.getItem('authToken')
        const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
        
        const response = await fetch(`${apiBase}/api/v1/user/${userId}/fingerprint`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.ok) {
          toast.success('Fingerprint authentication disabled')
        } else {
          toast.error('Failed to disable fingerprint authentication')
          setFingerprintEnabled(true)
        }
      } catch (error) {
        console.error('Error disabling fingerprint:', error)
        toast.error('Failed to disable fingerprint authentication')
        setFingerprintEnabled(true)
      }
    }
  }

  const registerFingerprint = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
      
      const challengeResponse = await fetch(`${apiBase}/api/v1/user/${userId}/fingerprint/challenge`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!challengeResponse.ok) {
        throw new Error('Failed to get challenge')
      }

      const challengeData = await challengeResponse.json()
      
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: Uint8Array.from(atob(challengeData.challenge), c => c.charCodeAt(0)),
        rp: {
          name: 'TMMT',
          id: window.location.hostname,
        },
        user: {
          id: Uint8Array.from(user?.id || '', c => c.charCodeAt(0)),
          name: user?.email || '',
          displayName: `${profileData.firstName} ${profileData.lastName}`,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
      }

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential

      if (credential) {
        const registerResponse = await fetch(`${apiBase}/api/v1/user/${userId}/fingerprint/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            credentialId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
            response: {
              clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
              attestationObject: btoa(String.fromCharCode(...new Uint8Array((credential.response as any).attestationObject))),
            }
          })
        })

        if (registerResponse.ok) {
          toast.success('Fingerprint authentication enabled successfully')
        } else {
          throw new Error('Registration failed')
        }
      }
    } catch (error) {
      console.error('Fingerprint registration error:', error)
      throw error
    }
  }

  const handleManageSessions = (): void => {
    setShowSessionsDialog(true)
    fetchSessions()
  }

  const fetchSessions = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
      
      const response = await fetch(`${apiBase}/api/v1/user/${userId}/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.sessions) {
          setActiveSessions(data.sessions)
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const handleRevokeSession = async (sessionId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
      
      const response = await fetch(`${apiBase}/api/v1/user/${userId}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Session revoked successfully')
        setActiveSessions(prev => prev.filter(s => s.id !== sessionId))
      } else {
        toast.error('Failed to revoke session')
      }
    } catch (error) {
      console.error('Error revoking session:', error)
      toast.error('Failed to revoke session')
    }
  }

  // ─── SCROLL HANDLING ────────────────────────────────────────────────────
  const checkScroll = (): void => {
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

  const scrollTabs = (direction: 'left' | 'right'): void => {
    const container = tabsContainerRef.current
    if (container) {
      const scrollAmount = container.clientWidth * 0.7
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // ─── USER PROFILE LOADING ──────────────────────────────────────────────
  useEffect(() => {
    loadUserProfile()
    checkFingerprintSupport()
    loadSecuritySettings()
  }, [user])

  const checkFingerprintSupport = (): void => {
    const supported = window.PublicKeyCredential && 
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    
    window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable?.()
      .then((result: boolean) => {
        setIsFingerprintSupported(result && supported)
      })
      .catch(() => {
        setIsFingerprintSupported(false)
      })
  }

  const loadSecuritySettings = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken')
      const userId = (user as any)?.id || (user as any)?._id || (user as any)?.userId
      
      if (!userId) return
      
      const response = await fetch(`${apiBase}/api/v1/user/${userId}/security-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setTwoFactorEnabled(data.twoFactorEnabled || false)
        setFingerprintEnabled(data.fingerprintEnabled || false)
      }
    } catch (error) {
      console.error('Error loading security settings:', error)
    }
  }

  const loadUserProfile = async (): Promise<void> => {
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
            status: 'uploaded'
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

  const handleSave = async (): Promise<void> => {
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

  const handleUploadDocument = (type: string): void => {
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
          const data = await response.json()
          toast.success(`${type} uploaded successfully`)
          
          const newDoc: PersonalDocument = {
            id: data._id || Date.now().toString(),
            type: type,
            name: file.name,
            uploadedAt: new Date().toISOString().split('T')[0],
            expiresAt: data.expiryDate || undefined,
            status: 'uploaded'
          }
          setPersonalDocuments(prev => [...prev, newDoc])
          
          const uploadedDocTypes = [...personalDocuments.map(d => d.type), type]
          const allUploaded = REQUIRED_DOCUMENTS.every(docType => uploadedDocTypes.includes(docType))
          
          if (allUploaded) {
            toast.success('🎉 All documents uploaded! Your profile is now complete.', {
              duration: 5000,
              icon: '✅'
            })
          }
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

  const getDeviceIcon = (type: string): React.ElementType => {
    switch(type) {
      case 'desktop': return Monitor
      case 'laptop': return Laptop
      case 'tablet': return Tablet
      case 'mobile': return Smartphone
      default: return Monitor
    }
  }

  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
    security: true,
    updates: true,
  })

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
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A3269] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-black/20 transition-colors duration-200 p-2 rounded-2xl">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <div className="p-1.5 rounded-lg bg-[#0A3269]">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl text-gray-900 dark:text-white tracking-tight">
                  Profile Settings
                </h2>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 ml-1">Manage your account, documents, and preferences</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${getVerificationStatus().color} border-0 text-xs font-normal px-3 py-1 flex items-center gap-1.5`}>
                {React.createElement(getVerificationStatus().icon, { className: "h-3.5 w-3.5" })}
                {getVerificationStatus().label}
                {stats.verificationProgress}%
              </Badge>
              {isEditing ? (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsEditing(false)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 h-9 px-4 text-sm font-light"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    className="bg-[#0A3269] text-white hover:bg-[#1A4A8A] transition-all duration-300 shadow-sm hover:shadow-md h-9 px-4 text-sm font-medium rounded-lg"
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
                  className="bg-white dark:bg-black/10 text-gray-900 dark:text-white border border-gray-200/60 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300 shadow-sm hover:shadow-md h-9 px-4 text-sm font-light rounded-lg"
                >
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Profile Overview Card */}
          <div className="relative overflow-hidden border border-gray-200/60 dark:border-white/5 rounded-xl bg-white dark:bg-black/40 shadow-sm">
            <div className="relative p-5">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-gray-200/60 dark:border-white/10">
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
                    <h2 className="text-xl font-light text-gray-900 dark:text-white">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    {isFullyVerified() ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs font-normal flex items-center gap-1">
                        <CheckCircle className="mr-1 h-3 w-3 text-green-600 dark:text-green-400" />
                        Documents Complete
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-0 text-xs font-normal flex items-center gap-1">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending Uploads
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 justify-center md:justify-start">
                    <span className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-light">
                      <Mail className="mr-1 h-3.5 w-3.5 text-[#0A3269]" />
                      {profileData.email}
                    </span>
                    <span className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-light">
                      <Phone className="mr-1 h-3.5 w-3.5 text-[#0A3269]" />
                      {profileData.phone}
                    </span>
                    <span className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-light">
                      <MapPin className="mr-1 h-3.5 w-3.5 text-[#0A3269]" />
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

          {/* Main Tabs */}
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
                        shrink-0 rounded-xl whitespace-nowrap transition-all duration-300 h-9 px-4 text-sm font-light
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

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200/60 dark:border-white/5 rounded-xl bg-white dark:bg-black/40"
              >
                <div className="border-b border-gray-200/50 dark:border-white/5 px-5 py-3.5">
                  <h3 className="text-base font-light flex items-center gap-2 text-gray-900 dark:text-white">
                    <User className="h-4 w-4 text-[#0A3269]" />
                    Personal Information
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-light">Update your basic profile details</p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-gray-900 dark:text-white text-sm font-light">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black/10 border border-gray-300/60 dark:border-white/10 text-gray-900 dark:text-white text-sm font-light focus:border-[#0A3269] focus:ring-0 focus:ring-[#0A3269]/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-gray-900 dark:text-white text-sm font-light">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black/10 border border-gray-300/60 dark:border-white/10 text-gray-900 dark:text-white text-sm font-light focus:border-[#0A3269] focus:ring-0 focus:ring-[#0A3269]/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-gray-900 dark:text-white text-sm font-light">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black/10 border border-gray-300/60 dark:border-white/10 text-gray-900 dark:text-white text-sm font-light focus:border-[#0A3269] focus:ring-0 focus:ring-[#0A3269]/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-gray-900 dark:text-white text-sm font-light">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black/10 border border-gray-300/60 dark:border-white/10 text-gray-900 dark:text-white text-sm font-light focus:border-[#0A3269] focus:ring-0 focus:ring-[#0A3269]/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="country" className="text-gray-900 dark:text-white text-sm font-light">Country</Label>
                      <Input
                        id="country"
                        value={profileData.country}
                        onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black/10 border border-gray-300/60 dark:border-white/10 text-gray-900 dark:text-white text-sm font-light focus:border-[#0A3269] focus:ring-0 focus:ring-[#0A3269]/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="company" className="text-gray-900 dark:text-white text-sm font-light">Company</Label>
                      <Input
                        id="company"
                        value={profileData.company}
                        onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black/10 border border-gray-300/60 dark:border-white/10 text-gray-900 dark:text-white text-sm font-light focus:border-[#0A3269] focus:ring-0 focus:ring-[#0A3269]/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="jobTitle" className="text-gray-900 dark:text-white text-sm font-light">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={profileData.jobTitle}
                        onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black/10 border border-gray-300/60 dark:border-white/10 text-gray-900 dark:text-white text-sm font-light focus:border-[#0A3269] focus:ring-0 focus:ring-[#0A3269]/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="website" className="text-gray-900 dark:text-white text-sm font-light">Website</Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        disabled={!isEditing}
                        className="h-9 bg-white dark:bg-black/10 border border-gray-300/60 dark:border-white/10 text-gray-900 dark:text-white text-sm font-light focus:border-[#0A3269] focus:ring-0 focus:ring-[#0A3269]/20 rounded-lg"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="bio" className="text-gray-900 dark:text-white text-sm font-light">Bio</Label>
                      <textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full min-h-[80px] rounded-lg border border-gray-300/60 dark:border-white/10 bg-white dark:bg-black/10 px-3 py-2 text-sm text-gray-900 dark:text-white font-light focus:border-[#0A3269] focus:ring-0 focus:ring-[#0A3269]/20 placeholder:text-gray-400 dark:placeholder:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="border border-gray-200/60 dark:border-white/5 rounded-xl bg-white dark:bg-black/40"
              >
                <div className="border-b border-gray-200/50 dark:border-white/5 px-5 py-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-light flex items-center gap-2 text-gray-900 dark:text-white">
                        <FileText className="h-4 w-4 text-[#0A3269]" />
                        Personal Documents
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-light">Manage your identity and official documents</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-light">Status:</span>
                        <Badge className={`${getVerificationStatus().color} border-0 text-xs font-normal flex items-center gap-1 px-2 py-0.5`}>
                          {React.createElement(getVerificationStatus().icon, { className: "h-3 w-3" })}
                          {getVerificationStatus().label} ({stats.verificationProgress}%)
                        </Badge>
                      </div>
                      {isFullyVerified() && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs font-normal flex items-center gap-1 px-2 py-0.5">
                          <CheckCircle className="h-3 w-3" />
                          Complete ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-4 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/60 dark:border-white/5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-light">Document Upload Progress</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.verificationProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          stats.verificationProgress === 100 
                            ? 'bg-green-500' 
                            : stats.verificationProgress >= 50 
                              ? 'bg-orange-500' 
                              : 'bg-[#0A3269]'
                        }`}
                        style={{ width: `${stats.verificationProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400 dark:text-gray-500 font-light">
                      <span>{REQUIRED_DOCUMENTS.filter(d => personalDocuments.some(pd => pd.type === d)).length} uploaded</span>
                      <span>{REQUIRED_DOCUMENTS.length} required</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {REQUIRED_DOCUMENTS.map((docType) => {
                      const doc = personalDocuments.find(d => d.type === docType)
                      const status = doc ? getDocumentStatus(doc) : null
                      const isUploaded = !!doc

                      return (
                        <div key={docType} className={`border rounded-xl transition-all ${
                          isUploaded 
                            ? 'border-blue-200/60 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10' 
                            : 'border-gray-200/60 dark:border-white/5 bg-white dark:bg-black/20'
                        }`}>
                          <div className="p-3.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-xl ${isUploaded ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800/30'}`}>
                                  {isUploaded ? (
                                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  ) : (
                                    <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                  )}
                                </div>
                                <div>
                                  <p className={`font-light text-sm ${isUploaded ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                                    {docType}
                                  </p>
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
                                variant={isUploaded ? "outline" : "default"}
                                onClick={() => handleUploadDocument(docType)}
                                className={`h-8 px-3 text-xs font-light rounded-lg ${isUploaded ? "border-gray-300/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5" : "bg-[#0A3269] text-white hover:bg-[#1A4A8A]"}`}
                              >
                                {isUploaded ? <RefreshCw className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {isFullyVerified() && (
                    <div className="mt-4 p-4 rounded-xl bg-green-50/60 dark:bg-green-900/20 border border-green-200/60 dark:border-green-800/30 flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-300">All Documents Uploaded!</p>
                        <p className="text-sm text-green-600/70 dark:text-green-400/70 font-light">Your document upload is complete. AI verification will be available soon.</p>
                      </div>
                    </div>
                  )}

                  {!isFullyVerified() && stats.verificationProgress > 0 && (
                    <div className="mt-4 p-4 rounded-xl bg-orange-50/60 dark:bg-orange-900/20 border border-orange-200/60 dark:border-orange-800/30 flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <div>
                        <p className="font-medium text-orange-700 dark:text-orange-300">Partial Upload</p>
                        <p className="text-sm text-orange-600/70 dark:text-orange-400/70 font-light">
                          Upload all {REQUIRED_DOCUMENTS.length} required documents to complete your profile.
                          {REQUIRED_DOCUMENTS.filter(d => !personalDocuments.some(pd => pd.type === d)).length} documents remaining.
                        </p>
                      </div>
                    </div>
                  )}
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
                className="border border-gray-200/60 dark:border-white/5 rounded-xl bg-white dark:bg-black/40"
              >
                <div className="border-b border-gray-200/50 dark:border-white/5 px-5 py-3.5">
                  <h3 className="text-base font-light flex items-center gap-2 text-gray-900 dark:text-white">
                    <CreditCard className="h-4 w-4 text-[#0A3269]" />
                    Payment Methods
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-light">Manage your credit and debit cards</p>
                </div>
                <div className="p-5">
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100/50 dark:bg-gray-800/50 flex items-center justify-center mb-3">
                        <CreditCard className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-light mb-3">No payment methods added yet</p>
                      <Button onClick={() => toast.info('Opening payment method dialog...')} className="bg-[#0A3269] text-white hover:bg-[#1A4A8A] rounded-lg h-9 px-4 text-sm font-light shadow-sm hover:shadow-md transition-all duration-300">
                        <Plus className="w-3.5 h-3.5 mr-2" />
                        Add Credit/Debit Card
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-3.5 border border-gray-200/60 dark:border-white/5 rounded-lg bg-white dark:bg-black/20">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            <div>
                              <p className="font-light text-gray-900 dark:text-white text-sm">{method.cardType} •••• {method.last4}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Expires {method.expiry}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-8 px-3 text-xs font-light rounded-lg">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full border-gray-300/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 h-9 text-sm font-light rounded-lg" onClick={() => toast.info('Opening payment method dialog...')}>
                        <Plus className="w-3.5 h-3.5 mr-2" />
                        Add Another Card
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── SECURITY TAB ────────────────────────────────────────────── */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200/60 dark:border-white/5 rounded-xl bg-white dark:bg-black/40"
              >
                <div className="border-b border-gray-200/50 dark:border-white/5 px-5 py-3.5">
                  <h3 className="text-base font-light flex items-center gap-2 text-gray-900 dark:text-white">
                    <Shield className="h-4 w-4 text-[#0A3269]" />
                    Security Settings
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-light">Manage your account security</p>
                </div>
                <div className="p-5 space-y-3.5">
                  {/* Password Change */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/60 dark:border-white/5">
                    <div>
                      <p className="font-light text-gray-900 dark:text-white text-sm">Password</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Change your account password</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPasswordDialog(true)} 
                      className="border-gray-300/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 h-8 px-3 text-sm font-light rounded-lg"
                    >
                      <Lock className="mr-2 h-3.5 w-3.5" />
                      Change Password
                    </Button>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/60 dark:border-white/5">
                    <div>
                      <p className="font-light text-gray-900 dark:text-white text-sm">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Add extra security to your account</p>
                    </div>
                    <Switch 
                      checked={twoFactorEnabled}
                      onCheckedChange={handleTwoFactorToggle}
                      className="data-[state=checked]:bg-[#0A3269]"
                    />
                  </div>

                  {/* Show Sensitive Data */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/60 dark:border-white/5">
                    <div>
                      <p className="font-light text-gray-900 dark:text-white text-sm">Show Sensitive Data</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Toggle visibility of sensitive information</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowSensitiveData(!showSensitiveData)}
                      className="border-gray-300/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 h-8 px-3 text-sm font-light rounded-lg"
                    >
                      {showSensitiveData ? (
                        <>
                          <EyeOff className="mr-2 h-3.5 w-3.5" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-3.5 w-3.5 text-[#0A3269]" />
                          Show
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Fingerprint Authentication */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/60 dark:border-white/5">
                    <div>
                      <p className="font-light text-gray-900 dark:text-white text-sm">Fingerprint Authentication</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Use fingerprint to sign in</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isFingerprintSupported && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-light">(Not supported)</span>
                      )}
                      <Switch 
                        checked={fingerprintEnabled}
                        onCheckedChange={handleFingerprintToggle}
                        disabled={!isFingerprintSupported}
                        className="data-[state=checked]:bg-[#0A3269]"
                      />
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/60 dark:border-white/5">
                    <div>
                      <p className="font-light text-gray-900 dark:text-white text-sm">Active Sessions</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Manage your active login sessions</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleManageSessions}
                      className="border-gray-300/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 h-8 px-3 text-sm font-light rounded-lg"
                    >
                      <Monitor className="mr-2 h-3.5 w-3.5" />
                      Manage Sessions
                    </Button>
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
                className="border border-gray-200/60 dark:border-white/5 rounded-xl bg-white dark:bg-black/40"
              >
                <div className="border-b border-gray-200/50 dark:border-white/5 px-5 py-3.5">
                  <h3 className="text-base font-light flex items-center gap-2 text-gray-900 dark:text-white">
                    <Bell className="h-4 w-4 text-[#0A3269]" />
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
                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-gray-100/50 dark:bg-gray-800/30">
                          <item.icon className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <p className="font-light text-gray-900 dark:text-white text-sm">{item.label}</p>
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
                className="border border-gray-200/60 dark:border-white/5 rounded-xl bg-white dark:bg-black/40"
              >
                <div className="border-b border-gray-200/50 dark:border-white/5 px-5 py-3.5">
                  <h3 className="text-base font-light flex items-center gap-2 text-gray-900 dark:text-white">
                    <Activity className="h-4 w-4 text-[#0A3269]" />
                    Activity Log
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-light">Recent account activity and connected devices</p>
                </div>
                <div className="p-5 space-y-5">
                  <div>
                    <h4 className="text-sm font-light mb-2.5 flex items-center gap-2 text-gray-900 dark:text-white">
                      <Smartphone className="h-3.5 w-3.5 text-[#0A3269]" />
                      Connected Devices
                    </h4>
                    <div className="space-y-2.5">
                      {connectedDevices.map((device) => {
                        const DeviceIcon = getDeviceIcon(device.type)
                        return (
                          <div key={device.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/60 dark:border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-gray-100/50 dark:bg-gray-800/30">
                                <DeviceIcon className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                              </div>
                              <div>
                                <p className="font-light text-gray-900 dark:text-white text-sm">{device.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-light">Last active: {device.lastActive}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {device.isCurrent && (
                                <Badge className="bg-[#0A3269]/10 text-[#0A3269] dark:bg-[#0A3269]/30 text-[#4A8ABF] border-0 text-[10px] font-light">
                                  Current
                                </Badge>
                              )}
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-7 w-7 p-0 rounded-lg">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Separator className="bg-gray-200/50 dark:bg-white/5" />

                  <div>
                    <h4 className="text-sm font-light mb-2.5 flex items-center gap-2 text-gray-900 dark:text-white">
                      <Clock className="h-3.5 w-3.5 text-[#0A3269]" />
                      Recent Activity
                    </h4>
                    <div className="space-y-2.5">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                          <div className="p-1.5 rounded-lg bg-gray-100/50 dark:bg-gray-800/30">
                            <Activity className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <p className="font-light text-gray-900 dark:text-white text-sm">{log.action}</p>
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
                          <Button variant="ghost" size="sm" className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 h-7 w-7 p-0 rounded-lg">
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

      {/* ─── PASSWORD CHANGE DIALOG ────────────────────────────────────────── */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-white dark:bg-black/95 border border-gray-200/50 dark:border-white/10 max-w-md rounded-xl shadow-xl p-0 overflow-hidden backdrop-blur-sm">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0A3269]" />
            <DialogHeader className="p-5 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0A3269]/10">
                  <Lock className="h-4 w-4 text-[#0A3269]" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-light text-gray-900 dark:text-white">
                    Change Password
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 font-light">
                    Enter your current password and choose a new one
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-5 pt-3 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-light text-gray-700 dark:text-gray-300">Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="bg-white dark:bg-black border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-lg h-10 text-sm font-light focus:ring-[#0A3269] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-light text-gray-700 dark:text-gray-300">New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="bg-white dark:bg-black border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-lg h-10 text-sm font-light focus:ring-[#0A3269] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      getPasswordStrength(newPassword) === 'strong' ? 'bg-emerald-500' :
                      getPasswordStrength(newPassword) === 'medium' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${getPasswordScore(newPassword)}%` }}
                  />
                </div>
                <span className={`text-[10px] font-light ${
                  getPasswordStrength(newPassword) === 'strong' ? 'text-emerald-600 dark:text-emerald-400' :
                  getPasswordStrength(newPassword) === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {getPasswordStrength(newPassword) === 'strong' ? 'Strong' :
                   getPasswordStrength(newPassword) === 'medium' ? 'Medium' :
                   'Weak'}
                </span>
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 font-light mt-1">
                Password must be at least 8 characters with uppercase, lowercase, and numbers
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-light text-gray-700 dark:text-gray-300">Confirm New Password</Label>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="bg-white dark:bg-black border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-lg h-10 text-sm font-light focus:ring-[#0A3269]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button 
                onClick={handlePasswordChange} 
                disabled={isLoadingPassword || !canChangePassword()}
                className="flex-1 bg-[#0A3269] text-white hover:bg-[#1A4A8A] rounded-lg h-10 text-sm font-light shadow-sm hover:shadow-md transition-all duration-300"
              >
                {isLoadingPassword ? (
                  <>
                    <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-3.5 w-3.5" />
                    Update Password
                  </>
                )}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowPasswordDialog(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }} 
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg h-10 px-4 text-sm font-light transition-all duration-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── SESSIONS DIALOG ────────────────────────────────────────────────── */}
      <Dialog open={showSessionsDialog} onOpenChange={setShowSessionsDialog}>
        <DialogContent className="bg-white dark:bg-black/95 border border-gray-200/50 dark:border-white/10 max-w-md rounded-xl shadow-xl p-0 overflow-hidden backdrop-blur-sm">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0A3269]" />
            <DialogHeader className="p-5 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0A3269]/10">
                  <Monitor className="h-4 w-4 text-[#0A3269]" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-light text-gray-900 dark:text-white">
                    Active Sessions
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 font-light">
                    Manage your active login sessions
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-5 pt-3 space-y-3">
            {activeSessions.length === 0 ? (
              <div className="text-center py-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100/50 dark:bg-gray-800/50 flex items-center justify-center mb-2">
                  <Monitor className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light">No active sessions found</p>
              </div>
            ) : (
              activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/30">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-gray-100/50 dark:bg-gray-800/30">
                      <Monitor className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div>
                      <p className="text-xs font-light text-gray-900 dark:text-white">{session.device}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-light">
                        {session.location} • {session.lastActive}
                        {session.isCurrent && (
                          <span className="ml-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">(Current)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 h-7 w-7 p-0 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

export default ProfilePage