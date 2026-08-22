import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { DocumentManager } from '@/components/DocumentManager/DocumentManager'
import { 
  CheckCircle, Clock, PhoneCall, Search, Send, Upload, User, 
  Sparkles, FileCheck, Camera, Mic, 
  ChevronRight, Brain, MessageSquare, Crown, CreditCard, Phone, Mail, Shield,
  Rocket, Minimize2, Globe, Users, Briefcase,
  DollarSign,
  Lock, ArrowRight, X        
} from 'lucide-react'
import { 
  TrendingUp, 
  Award,
  Handshake, 
  MapPin, 
  Home, 
} from 'lucide-react'
import { 
  FileText,
  File,
  Building,
  Building2,
  IdCard,
} from 'lucide-react'
import type { Socket } from 'socket.io-client'
import { getSocket } from '@/lib/socket'
import { toast } from 'sonner'
import { getAllServices as getLocalServices } from '@/config/services'
import StripePaymentForm from '@/components/Payment/StripePaymentForm'
import { StreamingMessage, TypingIndicator } from '@/components/Chat/StreamingMessage'
import { aiStreaming } from '@/lib/aiStreaming'
import { useAuth } from '@/contexts/AuthContext'
import { useVoiceAgent } from '@/contexts/VoiceAgentContext'
import TammatVoiceAgent from '@/components/VoiceAgent/TammatVoiceAgent'
import { cn } from '@/lib/utils'

type StartApplicationDialogProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  queryParams?: string
}

type ServiceItem = {
  id: string
  name: string
  description: string
  category?: string
  requirements?: string[]
  processingTime?: string
  process?: Array<{ step: number; title: string; description?: string; requiredDocuments?: string[] }>
}

type ChatMessage = {
  id: string
  type: 'user' | 'bot' | 'system' | 'amer' | 'file'
  content: string
  timestamp: Date
  metadata?: any
  isStreaming?: boolean
}

const serviceImages: Record<string, string> = {
  'spouse': 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?q=80&w=600&auto=format&fit=crop',
  'family': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600&auto=format&fit=crop',
  'parent': 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?q=80&w=600&auto=format&fit=crop',
  'investor': 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=600&auto=format&fit=crop',
  'partner': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
  'employment': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=600&auto=format&fit=crop',
  'golden': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop',
  'emirates': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop',
  'medical': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop',
  'business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
  'renewal': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop',
  'cancellation': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop'
}

const getServiceImage = (serviceName: string): string => {
  const name = serviceName.toLowerCase()
  if (name.includes('spouse') || name.includes('wife') || name.includes('husband')) return serviceImages.spouse
  if (name.includes('family') || name.includes('child') || name.includes('son') || name.includes('daughter')) return serviceImages.family
  if (name.includes('parent') || name.includes('mother') || name.includes('father')) return serviceImages.parent
  if (name.includes('investor')) return serviceImages.investor
  if (name.includes('partner')) return serviceImages.partner
  if (name.includes('employ') || name.includes('work')) return serviceImages.employment
  if (name.includes('golden')) return serviceImages.golden
  if (name.includes('emirates') || name.includes('id')) return serviceImages.emirates
  if (name.includes('medical') || name.includes('health')) return serviceImages.medical
  if (name.includes('business') || name.includes('license') || name.includes('establishment')) return serviceImages.business
  if (name.includes('renew')) return serviceImages.renewal
  if (name.includes('cancel')) return serviceImages.cancellation
  return serviceImages.default
}

const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase()
  if (name.includes('spouse') || name.includes('wife') || name.includes('husband')) return Handshake
  if (name.includes('family') || name.includes('child') || name.includes('son') || name.includes('daughter')) return Users
  if (name.includes('parent') || name.includes('mother') || name.includes('father')) return Home
  if (name.includes('investor') || name.includes('partner')) return TrendingUp
  if (name.includes('employ') || name.includes('work')) return Briefcase
  if (name.includes('golden')) return Crown
  if (name.includes('emirates') || name.includes('id')) return IdCard
  if (name.includes('medical') || name.includes('health')) return Shield
  if (name.includes('business') || name.includes('license') || name.includes('establishment')) return Building2
  if (name.includes('cancel')) return X
  return FileText
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
}

import { useNavigate as _useNavigate } from 'react-router'
function StartApplicationDialog({ open, onOpenChange }: StartApplicationDialogProps) {
  const _nav = _useNavigate()
  useEffect(() => {
    if (open) {
      onOpenChange(false)
      _nav('/apply')
    }
  }, [open, onOpenChange, _nav])
  return null
}
export default StartApplicationDialog

export function LegacyStartApplicationDialog({ open, onOpenChange, queryParams = "" }: StartApplicationDialogProps) {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar' || i18n.language === 'ur'
  
  const { 
    state: voiceAgentState,
    conversation: voiceConversation,
    selectService: voiceSelectService,
    setActiveTab: voiceSetActiveTab,
    updateSponsorInfo: voiceUpdateSponsorInfo,
    updateDocumentProgress: voiceUpdateDocumentProgress,
    updateApplicationProgress: voiceUpdateApplicationProgress
  } = useVoiceAgent()
  
  const [step, setStep] = useState(0)
  const [services, setServices] = useState<ServiceItem[]>([])
  const [filtered, setFiltered] = useState<ServiceItem[]>([])
  const [query, setQuery] = useState(queryParams)
  const [selected, setSelected] = useState<ServiceItem | null>(null)
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [aiChat, setAiChat] = useState<ChatMessage[]>([])
  const [amerChat, setAmerChat] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isAIStreaming, setIsAIStreaming] = useState(false)
  const [input, setInput] = useState('')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [chatMode, setChatMode] = useState<'amer' | 'ai' | 'voice'>('ai')
  const [docDefs, setDocDefs] = useState<Array<{ id: string; label: string; category: 'sponsor' | 'sponsored' | 'establishment' | 'other'; required: boolean }>>([])
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({})
  const [stagedDocs, setStagedDocs] = useState<Record<string, File[]>>({})
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, {
    id: string
    file: File
    preview: string
    status: 'uploading' | 'uploaded' | 'error'
    progress: number
    extractedData?: any
    rejectionReason?: string
  }>>({})
  const [slaUntil, setSlaUntil] = useState<number | null>(null)
  const [slaCountdown, setSlaCountdown] = useState<string>('')

  const [activeTab, setActiveTab] = useState('smart-start')
  const [amerConnected, setAmerConnected] = useState(false)
  const [liveGuidance, setLiveGuidance] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'requesting' | 'pending' | 'connected' | 'no_officers'>('idle')
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null)
  const [officerInfo, setOfficerInfo] = useState<{ name: string; id: string } | null>(null)
  
  const [sponsorInfo, setSponsorInfo] = useState({
    email: '',
    phone: '',
    iban: '',
    sponsorType: 'employee' as 'employee' | 'investor' | 'partner',
    location: 'inside' as 'inside' | 'outside',
    processingMethod: 'tammat' as 'tammat' | 'amer'
  })

  const [isChatCollapsed, setIsChatCollapsed] = useState(typeof window !== 'undefined' && window.innerWidth < 760 ? true : false)
  const [uaePassStatus, setUaePassStatus] = useState<'idle' | 'requesting' | 'authorized' | 'error'>('idle')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [applicationFee] = useState(1500)

  // Handle dialog close with X button
  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, handleClose])

  useEffect(() => {
    if (voiceAgentState.selectedService && !selected && services.length > 0) {
      const serviceFromContext = services.find(s => s.id === voiceAgentState.selectedService?.id)
      if (serviceFromContext) {
        setSelected(serviceFromContext)
      }
    }
  }, [voiceAgentState.selectedService, selected, services])

  useEffect(() => {
    if (voiceAgentState.activeTab && voiceAgentState.activeTab !== activeTab) {
      setActiveTab(voiceAgentState.activeTab)
    }
  }, [voiceAgentState.activeTab])

  useEffect(() => {
    const voiceSponsor = voiceAgentState.sponsorInfo
    if (voiceSponsor.email && voiceSponsor.email !== sponsorInfo.email) {
      setSponsorInfo(prev => ({ ...prev, email: voiceSponsor.email }))
    }
    if (voiceSponsor.phone && voiceSponsor.phone !== sponsorInfo.phone) {
      setSponsorInfo(prev => ({ ...prev, phone: voiceSponsor.phone }))
    }
  }, [voiceAgentState.sponsorInfo])

  useEffect(() => {
    if (selected) {
      voiceSelectService({
        id: selected.id,
        name: selected.name,
        category: selected.category,
        description: selected.description
      })
    }
  }, [selected, voiceSelectService])

  useEffect(() => {
    voiceSetActiveTab(activeTab)
  }, [activeTab, voiceSetActiveTab])

  useEffect(() => {
    voiceUpdateSponsorInfo({
      email: sponsorInfo.email,
      phone: sponsorInfo.phone,
      sponsorType: sponsorInfo.sponsorType
    })
  }, [sponsorInfo.email, sponsorInfo.phone, sponsorInfo.sponsorType, voiceUpdateSponsorInfo])

  useEffect(() => {
    const uploadedCount = Object.values(uploadedDocuments).filter(d => d.status === 'uploaded').length
    const requiredCount = docDefs.filter(d => d.required).length
    const uploadedIds = Object.keys(uploadedDocuments).filter(id => uploadedDocuments[id]?.status === 'uploaded')
    voiceUpdateDocumentProgress(uploadedCount, requiredCount, uploadedIds)
  }, [uploadedDocuments, docDefs, voiceUpdateDocumentProgress])

  useEffect(() => {
    voiceUpdateApplicationProgress(progress)
  }, [progress, voiceUpdateApplicationProgress])

  const getCurrentChat = () => {
    switch (chatMode) {
      case 'ai': return aiChat
      case 'amer': return amerChat
      default: return chat
    }
  }
  
  const [sponsorPhone, setSponsorPhone] = useState('')
  const [sponsorEid, setSponsorEid] = useState('')
  const [sponsoredFirstName, setSponsoredFirstName] = useState('')
  const [sponsoredLastName, setSponsoredLastName] = useState('')
  const [sponsoredRelationship, setSponsoredRelationship] = useState('spouse')
  const [sponsoredPassport, setSponsoredPassport] = useState('')
  const [sponsoredNationality, setSponsoredNationality] = useState('')
  const [sponsoredDob, setSponsoredDob] = useState('')
  
  const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'
  const apiUrl = `${(import.meta.env.VITE_API_BASE_URL as string)}/api/v1` || 'http://localhost:5001/api/v1'
  const STORAGE_KEY = 'tammat:start-app:v1'
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''
  const [socket, setSocket] = useState<Socket | null>(null)
  
  const setCurrentChat = (newChat: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    const updateFn = typeof newChat === 'function' ? newChat : () => newChat
    switch (chatMode) {
      case 'ai': 
        setAiChat(updateFn)
        break
      case 'amer': 
        setAmerChat(updateFn)
        break
      default: 
        setChat(updateFn)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-messages-container')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }, 100)
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMode])

  useEffect(() => {
    if (!queryParams) return
    const q = typeof queryParams === "string" ? queryParams : ""
    setQuery(q)
  }, [queryParams])

  useEffect(() => {
    if (!query) {
      setFiltered(services)
      return
    }
    const filtered = services.filter(s =>
      `${s.name} ${s.description}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
    setFiltered(filtered)
  }, [query, services])

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (!raw) return
      const saved = JSON.parse(raw)
      if (saved?.selected) setSelected(saved.selected)
      if (typeof saved?.step === 'number') setStep(saved.step)
      if (saved?.sponsorPhone) setSponsorPhone(saved.sponsorPhone)
      if (saved?.sponsorEid) setSponsorEid(saved.sponsorEid)
      if (saved?.sponsoredFirstName) setSponsoredFirstName(saved.sponsoredFirstName)
      if (saved?.sponsoredLastName) setSponsoredLastName(saved.sponsoredLastName)
      if (saved?.sponsoredRelationship) setSponsoredRelationship(saved.sponsoredRelationship)
      if (saved?.sponsoredPassport) setSponsoredPassport(saved.sponsoredPassport)
      if (saved?.sponsoredNationality) setSponsoredNationality(saved.sponsoredNationality)
      if (saved?.sponsoredDob) setSponsoredDob(saved.sponsoredDob)
      if (saved?.uploaded) setUploaded(saved.uploaded)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      const payload = {
        version: 1,
        step,
        selected,
        sponsorPhone,
        sponsorEid,
        sponsoredFirstName,
        sponsoredLastName,
        sponsoredRelationship,
        sponsoredPassport,
        sponsoredNationality,
        sponsoredDob,
        uploaded,
      }
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {}
  }, [step, selected, sponsorPhone, sponsorEid, sponsoredFirstName, sponsoredLastName, sponsoredRelationship, sponsoredPassport, sponsoredNationality, sponsoredDob, uploaded])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`${apiUrl}/services/search?q=visa&limit=50`, { credentials: 'include' })
        const data = await res.json()
        const list: ServiceItem[] = data?.data?.services?.map((s: any) => ({
          id: s.id || s.serviceId || s.slug || s.name,
          name: s.serviceName || s.name,
          description: s.outsideDescription || s.description || '',
          category: s.categoryName || s.category || '',
          requirements: s.requirements || s.requiredDocuments || [],
          processingTime: s.processingTime || '',
          process: s.process || s.processSteps || []
        })) || []
        if (!cancelled) {
          const source = list.length ? list : getLocalServices().map((ls: any) => ({ id: ls.id, name: ls.name, description: ls.description, category: ls.category, requirements: (ls.requirements||[]).map((r: any) => r.id), process: ls.process || [] }))
          setServices(source)
          if(queryParams){
            const filtered = source.filter((s: any) => (s.name + ' ' + s.description).toLowerCase().includes(query.toLowerCase()))
            setFiltered(filtered)
          }else{
            setFiltered(source)
          }
        }
      } catch {
        const fallback = getLocalServices().map((ls: any) => ({ id: ls.id, name: ls.name, description: ls.description, category: ls.category, requirements: (ls.requirements||[]).map((r: any) => r.id), process: ls.process || [] }))
        if (!cancelled) {
          setServices(fallback)
          if(queryParams){
            const filtered = fallback.filter((s: any) => (s.name + ' ' + s.description).toLowerCase().includes(query.toLowerCase()))
            setFiltered(filtered)
          }else{
            setFiltered(fallback)
          }
        }
      }
    }
    if (open) load()
    return () => { cancelled = true }
  }, [open])

  useEffect(() => {
    if (token) {
      const socketConnection = getSocket() as unknown as Socket
      setSocket(socketConnection)
    } else {
      setSocket(null)
    }
  }, [token])

  useEffect(() => {
    if (!socket) return

    const onAmerConnected = (payload: any) => {
      setRoomId(payload?.chatId || payload?.roomId)
      setAmerConnected(true)
      setConnectionStatus('connected')
      setOfficerInfo({ 
        name: payload?.officerName || 'Amer Officer', 
        id: payload?.officerId || 'unknown' 
      })
      setPendingRequestId(null)
      
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `Connected to ${payload?.officerName || 'Amer Officer'}. You can now chat live!`,
        timestamp: new Date()
      }
      setAmerChat(prev => [...prev, systemMessage])
      scrollToBottom()
      
      toast.success('Connected to Amer Officer', { 
        description: `${payload?.officerName || 'Officer'} has joined the conversation` 
      })
      
      if (chatMode === 'voice' && payload?.chatId) {
        try {
          socket.emit('voice_call_request', { roomId: payload.chatId, userId: 'user' })
          toast('Voice call requested')
        } catch {}
      }
    }

    const onRequestSent = (payload: any) => {
      setConnectionStatus('pending')
      setPendingRequestId(payload?.requestId)
      
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `🔄 Request sent to ${payload?.officersCount || 'available'} officer(s). Please wait for an officer to accept...`,
        timestamp: new Date()
      }
      setAmerChat(prev => [...prev, systemMessage])
      scrollToBottom()
      
      toast.info('Request Sent', { 
        description: `Waiting for an officer to accept your request...` 
      })

      const timeout = setTimeout(() => {
        setConnectionStatus((current) => {
          if (current === 'pending') {
            setPendingRequestId(null)
            toast.warning('Request Timeout', {
              description: 'No officers responded. Please try again.'
            })
            return 'idle'
          }
          return current
        })
      }, 5 * 60 * 1000)

      return () => clearTimeout(timeout)
    }

    const onNoOfficersAvailable = (payload: any) => {
      setConnectionStatus('no_officers')
      
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `❌ ${payload?.message || 'No officers are currently available. Please try again later.'}`,
        timestamp: new Date()
      }
      setAmerChat(prev => [...prev, systemMessage])
      scrollToBottom()
      
      toast.warning('No Officers Available', { 
        description: 'Please try again later when officers are online.' 
      })

      setTimeout(() => {
        setConnectionStatus('idle')
      }, 3000)
    }

    const onConversationQueued = (payload: any) => {
      if (payload?.roomId) {
        setRoomId(payload.roomId)
        setChat(prev => ([...prev, { 
          id: Date.now().toString(), 
          type: 'system', 
          content: 'Invite sent. Waiting for Amer officer to join…', 
          timestamp: new Date() 
        }]))
        const until = Date.now() + 2*60*1000
        setSlaUntil(until)
      }
    }

    const onNewMessage = (msg: any) => {
      const isFile = msg.type === 'file'
      const displayType: ChatMessage['type'] = isFile ? 'file' : (msg.sender === 'user' ? 'user' : 'amer')
      const content = isFile ? (msg.metadata?.fileName || 'File shared') : msg.content
      
      const newMessage = { 
        id: msg.id || Date.now().toString(), 
        type: displayType, 
        content, 
        metadata: msg.metadata, 
        timestamp: new Date(msg.timestamp || Date.now()) 
      }

      if (msg.sender === 'amer' || displayType === 'amer' || msg.type === 'amer') {
        setAmerChat(prev => {
          if (prev.some(p => p.id === msg.id)) return prev
          const newChat = [...prev, newMessage]
          return newChat
        })
        
        if (chatMode !== 'amer') {
          setChatMode('amer')
        }
      } else {
        setCurrentChat(prev => {
          if (prev.some(p => p.id === msg.id)) return prev
          return [...prev, newMessage]
        })
      }
      
      scrollToBottom()
    }

    const onMessageSent = (msg: any) => {}

    const onMessageError = (error: any) => {
      setCurrentChat(prev => [...prev, { 
        id: Date.now().toString(), 
        type: 'system', 
        content: `Error: ${error.error || 'Failed to send message'}`, 
        timestamp: new Date() 
      }])
      setIsTyping(false)
    }

    const onTyping = (p: any) => setIsTyping(!!p?.isTyping)
    const onFileDone = () => toast.success('File uploaded')

    const onChatHistoryLoaded = (payload: any) => {
      if (payload.history && payload.history.length > 0) {
        const historyMessages = payload.history.map((msg: any) => ({
          id: msg.id,
          type: msg.type as ChatMessage['type'],
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          metadata: msg.metadata
        }))
        
        setAmerChat(prev => [...historyMessages, ...prev])
        scrollToBottom()
        
        toast.info('Chat History Loaded', {
          description: `${payload.history.length} previous messages restored`
        })
      }
    }

    const onChatEnded = (payload: any) => {
      setConnectionStatus('idle')
      setAmerConnected(false)
      setRoomId(null)
      setOfficerInfo(null)
      
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: payload.message || `Chat ended: ${payload.reason}`,
        timestamp: new Date()
      }
      setAmerChat(prev => [...prev, systemMessage])
      scrollToBottom()
      
      if (payload.canReconnect) {
        toast.info('Chat Ended', { 
          description: 'You can request a new connection anytime. Chat history is saved.' 
        })
      } else {
        toast.warning('Chat Ended', { 
          description: payload.reason || 'Chat session has ended.' 
        })
      }
    }

    const onUaePassResponse = (response: any) => {
      if (response.status === 'pending') {
        setUaePassStatus('requesting')
        toast.info('UAE Pass Access', {
          description: 'Opening UAE Pass authentication...'
        })
        if (response.authUrl) {
          window.open(response.authUrl, '_blank', 'width=800,height=600')
        }
      } else if (response.status === 'authorized') {
        setUaePassStatus('authorized')
        toast.success('UAE Pass Connected', {
          description: 'Successfully connected to UAE government services'
        })
      } else {
        setUaePassStatus('error')
        toast.error('UAE Pass Error', {
          description: response.message || 'Failed to connect to UAE Pass'
        })
      }
    }
    
    socket.on('amer_connected', onAmerConnected)
    socket.on('request_sent', onRequestSent)
    socket.on('no_officers_available', onNoOfficersAvailable)
    socket.on('conversation_queued', onConversationQueued)
    socket.on('new_message', onNewMessage)
    socket.on('message_sent', onMessageSent)
    socket.on('message_error', onMessageError)
    socket.on('user_typing', onTyping)
    socket.on('file_upload_complete', onFileDone)
    socket.on('chat_history_loaded', onChatHistoryLoaded)
    socket.on('chat_ended', onChatEnded)
    socket.on('uae_pass_response', onUaePassResponse)
    
    return () => {
      socket.off('amer_connected', onAmerConnected)
      socket.off('request_sent', onRequestSent)
      socket.off('no_officers_available', onNoOfficersAvailable)
      socket.off('conversation_queued', onConversationQueued)
      socket.off('new_message', onNewMessage)
      socket.off('message_sent', onMessageSent)
      socket.off('message_error', onMessageError)
      socket.off('user_typing', onTyping)
      socket.off('file_upload_complete', onFileDone)
      socket.off('chat_history_loaded', onChatHistoryLoaded)
      socket.off('chat_ended', onChatEnded)
      socket.off('uae_pass_response', onUaePassResponse)
    }
  }, [socket, chatMode, scrollToBottom])

  useEffect(() => {
    if (chatMode !== 'voice' || !roomId || !socket) return
    try {
      socket.emit('voice_call_request', { roomId, userId: 'user' })
      toast('Voice call requested')
    } catch {}
  }, [chatMode, roomId, socket])

  useEffect(() => {
    if (!slaUntil) { setSlaCountdown(''); return }
    const tick = () => {
      const left = Math.max(0, slaUntil - Date.now())
      const m = Math.floor(left/60000)
      const s = Math.floor((left%60000)/1000)
      setSlaCountdown(`${m}:${s.toString().padStart(2,'0')}`)
      if (left <= 0) setSlaUntil(null)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [slaUntil])

  useEffect(() => {
    if (!open) return
    setProgress(5)
  }, [open])

  useEffect(() => {
    const totalRequired = docDefs.filter(d => d.required).length || 1
    const uploadedRequired = docDefs.filter(d => d.required && uploaded[d]).length
    const newScore = Math.round((uploadedRequired / totalRequired) * 100)
    
    if (newScore === 100) {
      setLiveGuidance(['All documents uploaded successfully', 'AI validation complete', 'Ready for submission'])
    } else if (newScore > 50) {
      setLiveGuidance(['Good progress on documents', 'Consider uploading remaining required docs'])
    } else {
      setLiveGuidance(['Start by uploading required documents', 'Use drag & drop for quick upload'])
    }
  }, [uploaded, docDefs])

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (!user) {
      toast.error('Please log in to upload files')
      return
    }
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error('Please log in to upload files')
      return
    }
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    if (!user) return

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`)
        continue
      }

      const fileMessage: ChatMessage = {
        id: Date.now().toString() + '_file',
        type: 'file',
        content: `📎 Uploading ${file.name}...`,
        timestamp: new Date(),
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploading: true
        }
      }

      if (chatMode === 'amer' && roomId) {
        setAmerChat(prev => [...prev, fileMessage])
      } else {
        setCurrentChat(prev => [...prev, fileMessage])
      }

      scrollToBottom()

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('roomId', roomId || 'general')

        const response = await fetch(`${apiBase}/api/v1/chat/upload?roomId=${roomId || 'general'}`, {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          const { fileUrl } = data.data || {}

          const successMessage: ChatMessage = {
            ...fileMessage,
            content: `📎 ${file.name}`,
            metadata: {
              ...fileMessage.metadata,
              fileUrl,
              uploading: false
            }
          }

          if (chatMode === 'amer' && roomId) {
            setAmerChat(prev => prev.map(msg =>
              msg.id === fileMessage.id ? successMessage : msg
            ))
            if (socket && roomId) {
              socket.emit('file_upload_complete', {
                chatId: roomId,
                userId: user.id,
                fileUrl,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
              })
            }
          } else {
            setCurrentChat(prev => prev.map(msg =>
              msg.id === fileMessage.id ? successMessage : msg
            ))
          }

          toast.success(`${file.name} uploaded successfully`)
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: fileMessage.id,
          type: 'file',
          content: `❌ Failed to upload ${file.name}`,
          timestamp: fileMessage.timestamp,
          metadata: {
            ...fileMessage.metadata,
            uploading: false,
            error: true
          }
        }

        if (chatMode === 'amer' && roomId) {
          setAmerChat(prev => prev.map(msg =>
            msg.id === fileMessage.id ? errorMessage : msg
          ))
        } else {
          setCurrentChat(prev => prev.map(msg =>
            msg.id === fileMessage.id ? errorMessage : msg
          ))
        }

        toast.error(`Failed to upload ${file.name}`)
      }
    }
  }

  const sendChat = async () => {
    if (!input.trim()) return
    const userMsg: ChatMessage = { id: Date.now().toString(), type: 'user', content: input.trim(), timestamp: new Date() }
    const currentInput = input.trim()
    setInput('')
    
    try {
      if (chatMode === 'ai' || !socket) {
        setAiChat(prev => [...prev, userMsg])

        const wantsOfficer = currentInput.toLowerCase().match(/\b(connect|officer|amer|human|live\s*support|speak\s*to|talk\s*to)\b/)
        if (wantsOfficer && socket) {
          setChatMode('amer')
          requestAmer()
          return
        }

        setIsAIStreaming(true)
        scrollToBottom()
        
        const botMsgId = Date.now().toString()
        const placeholderMsg: ChatMessage = { 
          id: botMsgId, 
          type: 'bot', 
          content: '', 
          timestamp: new Date(),
          isStreaming: true
        }
        setAiChat(prev => [...prev, placeholderMsg])
        scrollToBottom()

        const aiContext = aiChat.slice(-10)

        await aiStreaming.getChatResponse(
          currentInput,
          { step, service: selected, chatHistory: aiContext },
          {
            onChunk: (chunk) => {
              setAiChat(prev => prev.map(msg => 
                msg.id === botMsgId 
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              ))
              scrollToBottom()
            },
            onComplete: (fullResponse) => {
              setAiChat(prev => prev.map(msg => 
                msg.id === botMsgId 
                  ? { ...msg, content: fullResponse, isStreaming: false }
                  : msg
              ))
              setIsAIStreaming(false)
              scrollToBottom()

              const lowerResp = fullResponse.toLowerCase()
              const suggestsOfficer = lowerResp.includes('officer') ||
                lowerResp.includes('amer') ||
                lowerResp.includes('live support') ||
                lowerResp.includes('human agent') ||
                lowerResp.includes('connect you')

              if (suggestsOfficer) {
                const actionMsg: ChatMessage = {
                  id: Date.now().toString() + '_action',
                  type: 'system',
                  content: '💡 Would you like to connect with an Amer officer for live assistance?',
                  timestamp: new Date(),
                  metadata: { action: 'connect_officer' }
                }
                setAiChat(prev => [...prev, actionMsg])
                scrollToBottom()
              }
            },
            onError: (error) => {
              setAiChat(prev => prev.map(msg => 
                msg.id === botMsgId 
                  ? { 
                      ...msg, 
                      content: 'I apologize, but I encountered an error. Please try again.', 
                      isStreaming: false 
                    }
                  : msg
              ))
              setIsAIStreaming(false)
              scrollToBottom()
            }
          }
        )
      } else {
        setAmerChat(prev => [...prev, userMsg])
        setIsTyping(true)
        scrollToBottom()
        
        if (roomId && socket) {
          socket.emit('chat_message', { 
            message: currentInput, 
            chatId: roomId, 
            type: 'text' 
          })
          
          const messageTimeout = setTimeout(() => {
            setAmerChat(prev => [...prev, {
              id: Date.now().toString(),
              type: 'system',
              content: '⚠️ Message may not have been delivered. Please check your connection.',
              timestamp: new Date()
            }])
            setIsTyping(false)
          }, 5000)
          
          socket.once('message_sent', () => {
            clearTimeout(messageTimeout)
            setIsTyping(false)
          })
          
        } else {
          setIsTyping(false)
          requestAmer()
        }
      }
    } catch (error) {
      setCurrentChat(prev => [...prev, { id: Date.now().toString(), type: 'system', content: 'Network error. Please try again.', timestamp: new Date() }])
      setIsAIStreaming(false)
      setIsTyping(false)
      scrollToBottom()
    }
  }

  useEffect(() => {
    if (!selected) { setDocDefs([]); return }

    const enhancedDocumentMap: Record<string, {
      label: string
      category: 'sponsor' | 'sponsored' | 'establishment' | 'other'
      required: boolean
      description: string
      accepted?: string[]
      sponsorTypes?: string[]
    }> = {
      'emirates-id': { label: 'Emirates ID Copy', category: 'sponsor', required: true, description: 'Clear copy of sponsor\'s Emirates ID' },
      'sponsor-passport': { label: 'Sponsor Passport Copy', category: 'sponsor', required: true, description: 'Clear copy of sponsor\'s passport' },
      'sponsor-visa': { label: 'Sponsor Visa Copy', category: 'sponsor', required: true, description: 'Copy of sponsor\'s current residence visa' },
      'sponsor-salary': { label: 'Salary Certificate', category: 'sponsor', required: true, description: 'Latest salary certificate from employer', sponsorTypes: ['employee'] },
      'sponsor-bank': { label: 'Bank Statement', category: 'sponsor', required: false, description: '3-month bank statement showing salary deposits', sponsorTypes: ['employee'] },
      'spouse-passport': { label: 'Spouse Passport', category: 'sponsored', required: true, description: 'Clear copy of spouse\'s passport (valid for 6+ months)' },
      'spouse-photos': { label: 'Spouse Photos', category: 'sponsored', required: true, description: 'Recent passport-sized photos with white background' },
      'child-passport': { label: 'Child Passport', category: 'sponsored', required: true, description: 'Clear copy of child\'s passport (valid for 6+ months)' },
      'child-photos': { label: 'Child Photos', category: 'sponsored', required: true, description: 'Recent passport-sized photos with white background' },
      'birth-certificate': { label: 'Birth Certificate', category: 'sponsored', required: true, description: 'Attested birth certificate from home country' },
      'medical-certificate': { label: 'Medical Certificate', category: 'sponsored', required: false, description: 'Medical fitness certificate if required' },
      'trade-license': { label: 'Trade License', category: 'establishment', required: true, description: 'Valid trade license copy', sponsorTypes: ['investor', 'partner'] },
      'establishment-card': { label: 'Establishment Card', category: 'establishment', required: true, description: 'Immigration establishment card', sponsorTypes: ['investor', 'partner'] },
      'mol-card': { label: 'MOL Card', category: 'establishment', required: false, description: 'Ministry of Labor card', sponsorTypes: ['investor', 'partner'] },
      'company-contract': { label: 'Company Contract', category: 'establishment', required: false, description: 'Company contract or MOA', sponsorTypes: ['investor', 'partner'] },
      'tenancy-contract': { label: 'Tenancy Contract', category: 'establishment', required: false, description: 'Office tenancy contract', sponsorTypes: ['investor', 'partner'] },
      'marriage-certificate': { label: 'Marriage Certificate', category: 'other', required: true, description: 'Attested marriage certificate from home country and MOFA UAE' },
      'police-clearance': { label: 'Police Clearance Certificate', category: 'other', required: false, description: 'Police clearance from home country' },
      'educational-certificate': { label: 'Educational Certificates', category: 'other', required: false, description: 'Attested educational certificates' },
      'passport': { label: 'Passport Copy', category: 'sponsor', required: true, description: 'Clear copy of passport' },
      'residency-visa': { label: 'Residency Visa Copy', category: 'sponsor', required: true, description: 'Copy of current residence visa' },
      'salary-certificate': { label: 'Salary Certificate', category: 'sponsor', required: true, description: 'Latest salary certificate' },
      'mohre-approval': { label: 'MOHRE Approval', category: 'sponsor', required: true, description: 'MOHRE approval permit for employment visa', sponsorTypes: ['employee'] },
      'labor-contract': { label: 'Labor Contract', category: 'sponsor', required: true, description: 'Labor contract with minimum salary requirements', sponsorTypes: ['employee'] }
    }

    const filterDocumentsBySponsorType = (documents: any[]) => {
      return documents.filter(doc => {
        const enhanced = enhancedDocumentMap[doc.id as keyof typeof enhancedDocumentMap]
        if (!enhanced) return true
        if (enhanced.sponsorTypes && !enhanced.sponsorTypes.includes(sponsorInfo.sponsorType)) {
          return false
        }
        return true
      })
    }

    const local = getLocalServices().find((ls: any) => ls.id === selected.id)
    if (local && Array.isArray(local.requirements)) {
      const filteredRequirements = filterDocumentsBySponsorType(local.requirements)
      const defs = filteredRequirements.map((r: any) => {
        const enhanced = enhancedDocumentMap[r.id as keyof typeof enhancedDocumentMap]
        return {
          id: r.id as string,
          label: enhanced?.label || r.name as string,
          category: (enhanced?.category || (r.category as any) || 'other') as 'sponsor' | 'sponsored' | 'establishment' | 'other',
          required: enhanced?.required !== undefined ? enhanced.required : !!r.required,
          description: enhanced?.description || '',
          accepted: enhanced?.accepted || ['Jpeg', 'png', 'pdf']
        }
      })
      setDocDefs(defs as any)
      return
    }

    const fallbackDefs = filterDocumentsBySponsorType(selected.requirements||[])
      .map((rid: any) => {
        const enhanced = enhancedDocumentMap[rid as keyof typeof enhancedDocumentMap]
        return {
          id: String(rid),
          label: enhanced?.label || String(rid).replace(/[-_]/g, ' '),
          category: (enhanced?.category || 'other') as 'sponsor' | 'sponsored' | 'establishment' | 'other',
          required: false,
          description: enhanced?.description || '',
          accepted: enhanced?.accepted || ['image/*', 'application/pdf'],
          sponsorTypes: enhanced?.sponsorTypes
        }
      })
      .filter(doc => {
        if (doc.sponsorTypes && !doc.sponsorTypes.includes(sponsorInfo.sponsorType)) {
          return false
        }
        if(doc.label.toLowerCase().startsWith('memorandum') && sponsorInfo.sponsorType !== 'investor') {
          return false
        }
        return true
      })
      .map(({ sponsorTypes, ...doc }) => doc)
    setDocDefs(fallbackDefs)
  }, [selected, sponsorInfo.sponsorType])

  useEffect(() => {
    if (!docDefs.length) return
    const requiredTotal = docDefs.filter(d => d.required).length || 1
    const requiredUploaded = docDefs.filter(d => d.required && uploaded[d]).length
    const docsPct = Math.round((requiredUploaded/requiredTotal)*40)
    setProgress(prev => Math.max(prev, 40 + docsPct))
  }, [uploaded, docDefs])

  const toApplicationType = (id?: string | number | null) => {
    if (!id) return ''
    const idStr = String(id)
    
    const serviceIdMap: Record<string, string> = {
      '1': 'son_daughter_residence_visa',
      '4': 'spouse_residence_visa', 
      '9': 'parents_residence_visa',
      '12': 'investor_partner_visa',
      '13': 'entry_permit_short_term_visit_parents_siblings_inlaws',
      '14': 'entry_permit_short_term_visit_spouse_kids',
      '15': 'entry_permit_long_term_visit_parents_siblings_inlaws',
      '243': 'entry_permit_long_term_visit_spouse_kids',
      '50': 'change_status_family',
      '51': 'change_status_employee',
      '52': 'change_status_visit_visa',
      '23': 'spouse_children_visa_stamping',
      '26': 'parents_visa_stamping',
      '22': 'employee_visa_stamping',
      '32': 'son_daughter_visa_stamping',
      '35': 'partner_investor_visa_stamping_2_years',
      '227': 'spouse_children_visa_renewal',
      '229': 'son_above_18_visa_renewal',
      '236': 'partner_investor_visa_renewal_2_years',
      '239': 'parents_visa_renewal_1_year',
      '38': 'family_residence_visa_cancellation',
      '40': 'employment_visa_cancellation',
      '42': 'partner_investor_visa_cancellation',
      '293': 'cancellation_entry_permit_before_entry_company',
      '36': 'cancellation_entry_permit_after_entry_family',
      '37': 'cancellation_entry_permit_after_entry_company',
      '17': 'new_born_residence_visa',
      '16': 'employment_visa',
      '54': 'golden_visa_commercial_investor',
      '55': 'golden_visa_director_manager',
      '56': 'golden_visa_doctors',
      '57': 'golden_visa_engineers',
      '58': 'golden_visa_new_born_baby',
      '59': 'golden_visa_phd_holder',
      '60': 'golden_visa_scientists',
      '61': 'golden_visa_family_members',
      '63': 'golden_visa_commercial_investor_2m_deposit',
      '64': 'golden_visa_outstanding_student_highschool',
      '65': 'golden_visa_outstanding_student_university',
      '66': 'golden_visa_creative_people_culture_art',
      '44': 'new_establishment_card_with_online',
      '45': 'new_establishment_card_without_online',
      '46': 'renewal_establishment_card_with_online',
      '47': 'renewal_establishment_card_without_online',
      '218': 'immigration_employee_list',
      '220': 'modification_immigration_card',
      '53': 'holding_visa_family',
      '67': 'data_modification_family',
      '68': 'data_modification_company',
      '219': 'new_pro_card',
      '221': 'renewal_pro_card',
      '222': 'modify_pro_card',
      '223': 'reconsideration_rejected_visa_application',
      '20': 'family_visit_visa_extend',
      '48': 'travel_report_family',
      '49': 'travel_report_company',
      '69': 'security_deposit'
    }
    
    if (serviceIdMap[idStr]) {
      return serviceIdMap[idStr]
    }
    
    const map: Record<string, string> = {
      'family-visa-spouse': 'family_visa_spouse',
      'family-visa-children': 'family_visa_child',
      'family-visa-child': 'family_visa_child',
      'residence-visa': 'residence_visa',
      'entry-permit': 'entry_permit',
      'emirates-id': 'emirates_id',
      'visa-renewal': 'visa_renewal'
    }
    
    return map[idStr] || idStr.replace(/-/g, '_')
  }

  async function uploadAllStagedDocuments(appId: string) {
    const form = new FormData()
    Object.entries(stagedDocs).forEach(([docId, files]) => {
      const field = mapDocIdToField(docId)
      files.forEach(f => form.append(field, f))
    })
    if ([...form.keys()].length === 0) return true
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/visa/${appId}/documents`, { method: 'POST', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: form })
    return res.ok
  }

  const createApplicationAndUpload = async (): Promise<boolean> => {
    try {
      if (!token) { toast.error('Please sign in to continue'); return false }
      if (!selected) { toast.error('Select a service'); return false }
      if (!paymentCompleted) {
        toast.error('Please complete payment before submitting application')
        return false
      }
      if (!canContinueDocs) {
        toast.error('Please upload all required documents before continuing')
        return false
      }
      const allRequired = new Set<string>()
      serviceSteps.forEach(s => (s.requiredDocuments || []).forEach((id: string) => allRequired.add(id)))
      if (allRequired.size === 0) {
        docDefs.filter(d => d.required).forEach(d => allRequired.add(d.id))
      }
      const allOk = Array.from(allRequired).every(id => uploaded[id])
      if (!allOk) {
        toast.error('Please upload all required documents for this service')
        setActiveTab('docs-upload')
        return false
      }
      
      const familyVisaIds = ['1', '4', '9', '13', '14', '15', '243', '17']
      const needsSponsoredDetails = selected?.id && (
        familyVisaIds.includes(String(selected.id)) || 
        String(selected.id).includes('family') ||
        selected.name?.toLowerCase().includes('spouse') ||
        selected.name?.toLowerCase().includes('child') ||
        selected.name?.toLowerCase().includes('parent')
      )
      
      setProgress(95)
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/visa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          applicationType: toApplicationType(selected?.id),
          serviceData: {
            id: selected?.id,
            name: selected?.name,
            description: selected?.description,
            requirements: selected?.requirements || []
          },
          sponsor: { 
            phone: sponsorPhone, 
            emiratesId: sponsorEid,
            email: user?.email || '',
            firstName: user?.name?.split(' ')[0] || '',
            lastName: user?.name?.split(' ').slice(1).join(' ') || ''
          },
          requiredDocuments: docDefs.filter(d => d.required).map(d => d.id),
          sponsored: needsSponsoredDetails && sponsoredFirstName && sponsoredLastName ? {
            firstName: sponsoredFirstName,
            lastName: sponsoredLastName,
            relationship: sponsoredRelationship,
            passportNumber: sponsoredPassport,
            nationality: sponsoredNationality,
            dateOfBirth: sponsoredDob
          } : undefined
        })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.message || 'Failed to create application')
        return false
      }
      const appId = data?.data?.application?._id
      setApplicationId(appId)
      const ok = await uploadAllStagedDocuments(appId)
      if (!ok) {
        toast.error('Some documents failed to upload')
        return false
      }
      setProgress(100)
      toast.success('d and documents uploaded')
      return true
    } catch (e) {
      toast.error('Network error')
      return false
    }
  }

  const requestAmer = () => {
    if (!socket) {
      toast.error('Connection not available. Please refresh the page.')
      return
    }

    if (connectionStatus === 'pending') {
      toast.info('Request already pending', { 
        description: 'Please wait for an officer to respond.' 
      })
      return
    }

    if (connectionStatus === 'connected') {
      toast.info('Already connected', { 
        description: `You are connected to ${officerInfo?.name || 'an officer'}` 
      })
      return
    }

    setConnectionStatus('requesting')
    
    if (!socket) {
      toast.error('Connection unavailable. Please refresh the page.')
      setConnectionStatus('idle')
      return
    }
    
    socket.emit('request_amer_connection', { 
      service: selected?.name || selected?.id || 'visa application',
      userId: user?.id || 'user',
      userData: {
        name: user?.name ? `${user.name}` : 'User',
        email: user?.email || 'user@example.com'
      },
      timestamp: new Date().toISOString()
    })
    
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: '🔄 Sending request to available Amer officers...',
      timestamp: new Date()
    }
    setAmerChat(prev => [...prev, systemMessage])
    scrollToBottom()

    setTimeout(() => {
      if (connectionStatus === 'requesting') {
        setConnectionStatus('idle')
      }
    }, 3000)
  }

  const cancelRequest = () => {
    if (pendingRequestId && socket) {
      socket.emit('cancel_request', { requestId: pendingRequestId })
      setConnectionStatus('idle')
      setPendingRequestId(null)
      
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: '❌ Request cancelled.',
        timestamp: new Date()
      }
      setChat(prev => [...prev, systemMessage])
      
      toast.info('Request cancelled')
    }
  }

  const requestUaePass = () => {
    if (!socket) {
      toast.error('Connection not available. Please refresh the page.')
      return
    }

    if (uaePassStatus === 'requesting') {
      toast.info('UAE Pass request already in progress')
      return
    }

    setUaePassStatus('requesting')
    
    socket.emit('request_uae_pass_access', {
      service: selected?.name || selected?.id || 'visa application',
      permissions: ['identity', 'documents', 'services'],
      roomId: roomId || 'general',
      timestamp: new Date().toISOString()
    })
    
    toast.info('UAE Pass Access', {
      description: 'Requesting access to UAE government services...'
    })
  }

  const handleDocumentUpload = async (docId: string, file: File): Promise<void> => {
    const documentId = crypto.randomUUID()
    const preview = URL.createObjectURL(file)
    
    setUploadedDocuments(prev => ({
      ...prev,
      [docId]: {
        id: documentId,
        file,
        preview,
        status: 'uploading',
        progress: 0
      }
    }))

    try {
      if (!applicationId) {
        setStagedDocs(prev => ({ ...prev, [docId]: [file] }))
        setUploadedDocuments(prev => ({
          ...prev,
          [docId]: {
            ...prev[docId],
            status: 'uploaded',
            progress: 100
          }
        }))
        setUploaded(u => ({ ...u, [docId]: true }))
        toast.success('Document staged successfully')
        return
      }

      const form = new FormData()
      const uploadKey = mapDocIdToField(docId)
      form.append(uploadKey, file)

      const progressInterval = setInterval(() => {
        setUploadedDocuments(prev => {
          const current = prev[docId]
          if (current && current.progress < 90) {
            return {
              ...prev,
              [docId]: {
                ...current,
                progress: current.progress + 10
              }
            }
          }
          return prev
        })
      }, 200)

      const res = await fetch(`${apiBase}/api/v1/visa/${applicationId}/documents`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: form
      })

      clearInterval(progressInterval)

      if (res.ok) {
        const data = await res.json()
        setUploadedDocuments(prev => ({
          ...prev,
          [docId]: {
            ...prev[docId],
            status: 'uploaded',
            progress: 100,
            extractedData: data.data?.extractedData
          }
        }))
        setUploaded(u => ({ ...u, [docId]: true }))
        toast.success('Document uploaded successfully')
      } else {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.message || 'Upload failed')
      }
    } catch (error) {
      setUploadedDocuments(prev => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          status: 'error',
          progress: 0
        }
      }))
      setUploaded(u => ({ ...u, [docId]: false }))
      throw error
    }
  }

  const handleDocumentDelete = (docId: string) => {
    setUploadedDocuments(prev => {
      const newState = { ...prev }
      if (newState[docId]?.preview) {
        URL.revokeObjectURL(newState[docId].preview)
      }
      delete newState[docId]
      return newState
    })
    setUploaded(u => ({ ...u, [docId]: false }))
    setStagedDocs(prev => {
      const newState = { ...prev }
      delete newState[docId]
      return newState
    })
  }

  const serviceSteps = useMemo(() => (selected?.process || []) as Array<{ step: number; title: string; description?: string; requiredDocuments?: string[] }>, [selected])

  const currentServiceStepIndex = useMemo(() => {
    if (!serviceSteps.length) return -1
    if (step === 2) {
      const idx = serviceSteps.findIndex(s => (s.requiredDocuments || []).length > 0)
      return idx >= 0 ? idx : 0
    }
    if (step === 3) return serviceSteps.length - 1
    return 0
  }, [serviceSteps, step])

  const requiredDocsForCurrentServiceStep = useMemo(() => {
    if (currentServiceStepIndex < 0) return [] as string[]
    return (serviceSteps[currentServiceStepIndex]?.requiredDocuments || []) as string[]
  }, [serviceSteps, currentServiceStepIndex])

  const canContinueDocs = useMemo(() => {
    if (step !== 2) return true
    if (!requiredDocsForCurrentServiceStep.length) return true
    return requiredDocsForCurrentServiceStep.every(id => uploaded[id])
  }, [step, requiredDocsForCurrentServiceStep, uploaded])

  const TAB_ORDER = ['smart-start', 'sponsor-info', 'review-submit'] as const

  const goToNextTab = () => {
    const currentIndex = TAB_ORDER.indexOf(activeTab as any)
    if (currentIndex < TAB_ORDER.length - 1) {
      const next = TAB_ORDER[currentIndex + 1]
      if (next === 'sponsor-info') setProgress(20)
      if (next === 'review-submit') setProgress(80)
      setActiveTab(next)
    }
  }

  const goToPreviousTab = () => {
    const currentIndex = TAB_ORDER.indexOf(activeTab as any)
    if (currentIndex > 0) {
      setActiveTab(TAB_ORDER[currentIndex - 1])
    }
  }

  const canNavigateToNext = () => {
    switch (activeTab) {
      case 'smart-start':
        return !!selected?.id
      case 'sponsor-info':
        return !!sponsorInfo.email && !!sponsorInfo.phone
      case 'review-submit':
        return false
      default:
        return false
    }
  }

  function mapDocIdToField(id: string): string {
    const map: Record<string, string> = {
      'emirates-id': 'sponsor_emirates_id',
      'residency-visa': 'sponsor_visa',
      'passport': 'sponsor_passport',
      'salary-certificate': 'sponsor_salary_certificate',
      'trade-license': 'sponsor_trade_license',
      'establishment-card': 'sponsor_establishment_card',
      'spouse-passport': 'sponsored_passport_front',
      'spouse-photos': 'sponsored_photo',
      'marriage-certificate': 'marriage_certificate',
      'birth-certificate': 'birth_certificate',
      'child-passport': 'sponsored_passport_front',
      'parents-passports': 'sponsored_passport_front',
      'parents-photos': 'sponsored_photo',
    }
    return map[id] || id
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[95vw] h-[94dvh] max-h-[94dvh] flex flex-col overflow-hidden p-0 bg-[#FBFBFD] dark:bg-[#05070F] border-0 rounded-[28px] shadow-[0_40px_100px_-24px_rgba(12,26,64,0.45)] ring-1 ring-black/[0.03] dark:ring-white/[0.06]"
        dir={isRTL ? 'rtl' : 'ltr'}
        hideCloseButton // Add this to hide the default close button
      >
        {/* Ambient gradient mesh */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
        </div>

        {/* Custom Close Button - Only one X */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-50 p-2 rounded-full bg-white/80 dark:bg-white/[0.06] backdrop-blur-md border border-[#14235E]/10 dark:border-white/10 hover:bg-gradient-to-br hover:from-[#1B3FA0] hover:to-[#14235E] hover:border-transparent group transition-all duration-300 text-[#14235E] dark:text-white/60 hover:scale-105 shadow-sm"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4 group-hover:text-white transition-colors duration-300" />
        </button>

        <div className="flex-1 min-h-0 flex flex-col p-3 sm:p-4 lg:p-5 overflow-hidden relative z-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col min-h-0 flex-1">
            {/* Stepper */}
            <div className="shrink-0 mb-4 sm:mb-6 px-1 pr-12">
              <div className="flex items-center justify-between mb-2 px-1">
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {(() => {
                  const steps = [
                    { id: 'smart-start', label: t('startApplication.tabs.service'), icon: Sparkles },
                    { id: 'sponsor-info', label: t('startApplication.tabs.sponsor'), icon: User },
                    { id: 'review-submit', label: t('startApplication.tabs.submit'), icon: Rocket },
                  ]
                  const currentIdx = steps.findIndex(s => s.id === activeTab)
                  return (
                    <div className="flex items-center w-full gap-1 sm:gap-2">
                      {steps.map((s, idx) => {
                        const Icon = s.icon
                        const isActive = s.id === activeTab
                        const isComplete = idx < currentIdx
                        const isDisabled = idx > currentIdx && !isComplete
                        return (
                          <React.Fragment key={s.id}>
                            <button
                              onClick={() => !isDisabled && setActiveTab(s.id)}
                              disabled={isDisabled}
                              className={`group relative flex items-center gap-2 sm:gap-3 flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed overflow-hidden ${
                                isActive 
                                  ? 'bg-gradient-to-br from-[#14235E] via-[#14235E] to-[#14235E] text-white ' 
                                  : isComplete
                                    ? 'bg-[#14235E]/[0.07] text-[#fff]/20 hover:bg-[#14235E]/[0.12]'
                                    : 'bg-[#14235E]/[0.04] text-[#14235E]/40 hover:bg-[#14235E]/10'
                              }`}
                            >
                           
                              <span className={`hidden sm:flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 transition-all duration-300 ${
                                isActive ? 'bg-white/20 text-white' : isComplete ? 'bg-[#14235E]/15 text-[#14235E]' : 'bg-[#14235E]/10 text-[#14235E]/40'
                              }`}>
                                {isComplete ? <CheckCircle className="w-3.5 h-3.5" strokeWidth={2.5} /> : idx + 1}
                              </span>
                              <Icon className={`w-4 h-4 sm:hidden transition-all duration-300 ${
                                isActive ? 'text-white' : isComplete ? 'text-[#14235E]' : 'text-inherit'
                              }`} strokeWidth={isActive ? 2.5 : 2} />
                              <span className={`text-[10px] sm:text-xs font-semibold tracking-wide transition-all duration-300 ${
                                isActive ? 'text-white' : isComplete ? 'text-[#14235E]' : 'text-inherit'
                              }`}>
                                {s.label}
                              </span>
                            </button>
                            {idx < steps.length - 1 && (
                              <div className="flex-1 h-[3px] min-w-[12px] rounded-full bg-[#14235E]/10 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full bg-gradient-to-r from-[#3B6FFF] via-[#1B3FA0] to-[#fff] transition-all duration-500 ${
                                    idx < currentIdx ? 'w-full' : 'w-0'
                                  }`}
                                />
                              </div>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            </div>

            <div className={`flex-1 min-h-0 flex flex-col lg:grid gap-3 lg:gap-4 transition-all duration-300 ${
              isChatCollapsed ? 'lg:grid-cols-1' : 'lg:grid-cols-12'
            }`}>
              {/* Main Content */}
              <div className={`flex flex-col min-h-0 flex-1 transition-all duration-300 ${
                isChatCollapsed ? 'col-span-full' : 'lg:col-span-8'
              }`}>
                
                {/* Smart Start Tab */}
                <TabsContent value="smart-start" className="mt-0 flex flex-col min-h-0 flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="smart-start"
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="flex flex-col min-h-0 flex-1"
                    >
                      <div className="relative bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border border-[#14235E]/10 dark:border-white/5 rounded-3xl flex flex-col min-h-0 flex-1 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]">
                        <div className="relative flex flex-col min-h-0 flex-1 p-3 sm:p-4 lg:p-5 pt-4 sm:pt-5 overflow-hidden">
                          {/* Search Bar */}
                          <div className="relative mb-3 sm:mb-4">
                            <div className="relative flex items-center gap-2 sm:gap-3 rounded-2xl bg-white dark:bg-[#14235E]/10 border border-[#14235E]/12 dark:border-white/5 px-3 sm:px-4 py-2 shadow-sm transition-all duration-300 focus-within:border-[#3B6FFF]/50 focus-within:shadow-[0_0_0_4px_rgba(59,111,255,0.10)]">
                              <Search className="w-4 h-4 text-[#14235E]/50 dark:text-white/30" strokeWidth={2} />
                              <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t("startApplication.serviceSelection.searchPlaceholder")}
                                className="flex-1 h-8 bg-transparent border-0 px-0 text-xs sm:text-sm font-medium text-foreground/90 dark:text-white/90 placeholder:text-[#14235E]/40 dark:placeholder:text-white/30 shadow-none ring-0 outline-none"
                              />
                              <span className="hidden sm:inline text-[9px] font-semibold tracking-wide uppercase text-[#14235E]/30 border border-[#14235E]/15 rounded-md px-1.5 py-0.5">
                                {filtered.length}
                              </span>
                            </div>
                          </div>

                          {/* Service Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 flex-1 overflow-y-auto pr-1 min-h-0">
                            {filtered.map((service, index) => {
                              const isSelected = selected?.id === service.id
                              const ServiceIcon = getServiceIcon(service.name)
                              return (
                                <div
                                  key={service.id}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelected(null)
                                    } else {
                                      setSelected(service)
                                      setProgress(20)
                                      setTimeout(() => setActiveTab('sponsor-info'), 300)
                                    }
                                  }}
                                  className={`group relative cursor-pointer rounded-2xl transition-all duration-300 p-3 sm:p-4 border ${
                                    isSelected
                                      ? 'border-transparent bg-gradient-to-br from-[#14235E]/[0.06] to-[#3B6FFF]/[0.05] dark:from-[#14235E]/20 dark:to-[#3B6FFF]/10 shadow-[0_14px_30px_-14px_rgba(20,35,94,0.45)] ring-1 ring-[#3B6FFF]/30 -translate-y-0.5'
                                      : 'border-[#14235E]/10 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:border-[#3B6FFF]/25 hover:shadow-[0_12px_26px_-14px_rgba(20,35,94,0.3)] hover:-translate-y-0.5'
                                  }`}
                                >
                                  {isSelected && (
                                    <span className="absolute -top-px -right-px w-8 h-8 overflow-hidden rounded-tr-2xl">
                                      <span className="absolute top-0 right-0 w-11 h-11 bg-gradient-to-br from-[#3B6FFF] to-[#14235E] rotate-45 translate-x-[15px] -translate-y-[15px]" />
                                    </span>
                                  )}
                                  <div className="flex items-start gap-2.5">
                                    <div className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                                      isSelected ? 'bg-gradient-to-br from-[#1B3FA0] to-[#14235E] text-white shadow-[0_4px_12px_-4px_rgba(20,35,94,0.5)]' : 'bg-[#14235E]/8 text-[#14235E]/70 group-hover:bg-[#14235E]/14'
                                    }`}>
                                      <ServiceIcon className="w-4 h-4" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-sm sm:text-base font-semibold text-foreground/90 dark:text-white/90 leading-snug">
                                          {service.name}
                                        </h3>
                                        {!isSelected && (
                                          <ChevronRight className="w-4 h-4 text-[#14235E]/25 dark:text-white/20 shrink-0 mt-0.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2} />
                                        )}
                                      </div>
                                      <p className="text-[10px] sm:text-xs text-foreground/50 dark:text-white/40 mt-0.5 line-clamp-2">
                                        {service.description}
                                      </p>
                                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#14235E]/10 dark:border-white/5">
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-[#14235E]/40 dark:text-white/30" strokeWidth={2} />
                                          <span className="text-[9px] sm:text-[10px] text-foreground/40 dark:text-white/30">
                                            {service.processingTime || 'Fast'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <FileCheck className="w-3 h-3 text-[#14235E]/40 dark:text-white/30" strokeWidth={2} />
                                          <span className="text-[9px] sm:text-[10px] text-foreground/40 dark:text-white/30">
                                            {service.requirements?.length || 0} docs
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>

                {/* Sponsor Info Tab */}
                <TabsContent value="sponsor-info" className="mt-0 flex flex-col min-h-0 flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="sponsor-info"
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="flex flex-col min-h-0 flex-1"
                    >
                      <div className="relative bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border border-[#14235E]/10 dark:border-white/5 rounded-3xl flex flex-col min-h-0 flex-1 overflow-hidden">
                        <div className="shrink-0 px-4 sm:px-5 pt-4 pb-3 border-b border-[#14235E]/10 dark:border-white/5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#14235E] to-[#14235E] flex items-center justify-center shadow-[0_4px_12px_-4px_rgba(20,35,94,0.5)]">
                              <User className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                            </div>
                            <div>
                              <span className="block text-sm sm:text-base font-semibold text-foreground/90 dark:text-white/90">
                                {t('startApplication.sponsorInfo.title')}
                              </span>
                              {selected?.name && (
                                <span className="block text-[10px] text-foreground/40 dark:text-white/30">{selected.name}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4 sm:space-y-5">
                          {/* Sponsor Type */}
                          <div className="space-y-2">
                            <Label className="text-[9px] sm:text-[10px] font-semibold tracking-[0.14em] uppercase text-foreground/50 dark:text-white/40 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[#14235E]/60 dark:text-white/40" strokeWidth={2} />
                              {t('startApplication.sponsorInfo.sponsorType')}
                            </Label>
                            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#14235E]/5 dark:bg-[#14235E]/10">
                              {[
                                { value: 'employee', label: t('startApplication.sponsorInfo.employee'), icon: Users },
                                { value: 'investor', label: t('startApplication.sponsorInfo.investor'), icon: TrendingUp },
                                { value: 'partner', label: t('startApplication.sponsorInfo.partner'), icon: Handshake },
                              ].map((type) => {
                                const isActive = sponsorInfo.sponsorType === type.value
                                const Icon = type.icon
                                return (
                                  <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setSponsorInfo(prev => ({ ...prev, sponsorType: type.value as any }))}
                                    className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-3 rounded-xl text-[11px] sm:text-sm font-medium transition-all duration-300 ${
                                      isActive
                                        ? 'bg-gradient-to-br from-[#1B3FA0] to-[#14235E] text-white shadow-[0_6px_16px_-6px_rgba(20,35,94,0.5)]'
                                        : 'text-foreground/60 dark:text-white/50 hover:bg-white/60 dark:hover:bg-white/5'
                                    }`}
                                  >
                                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white/90' : 'text-[#14235E]/40 dark:text-white/40'}`} strokeWidth={2} />
                                    <span>{type.label}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Location */}
                          <div className="space-y-2">
                            <Label className="text-[9px] sm:text-[10px] font-semibold tracking-[0.14em] uppercase text-foreground/50 dark:text-white/40 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#14235E]/60 dark:text-white/40" strokeWidth={2} />
                              {t('startApplication.sponsorInfo.location')}
                            </Label>
                            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#14235E]/5 dark:bg-[#14235E]/10">
                              {[
                                { value: 'inside', label: t('startApplication.sponsorInfo.insideUae'), icon: Home },
                                { value: 'outside', label: t('startApplication.sponsorInfo.outsideUae'), icon: Globe },
                              ].map((loc) => {
                                const isActive = sponsorInfo.location === loc.value
                                const Icon = loc.icon
                                return (
                                  <button
                                    key={loc.value}
                                    type="button"
                                    onClick={() => setSponsorInfo(prev => ({ ...prev, location: loc.value as any }))}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                                      isActive
                                        ? 'bg-gradient-to-br from-[#1B3FA0] to-[#14235E] text-white shadow-[0_6px_16px_-6px_rgba(20,35,94,0.5)]'
                                        : 'text-foreground/60 dark:text-white/50 hover:bg-white/60 dark:hover:bg-white/5'
                                    }`}
                                  >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white/90' : 'text-[#14235E]/40 dark:text-white/40'}`} strokeWidth={2} />
                                    <span>{loc.label}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="sponsor-email" className="text-[9px] sm:text-[10px] font-semibold tracking-[0.1em] uppercase text-foreground/50 dark:text-white/40 flex items-center gap-1.5">
                                {t('startApplication.sponsorInfo.emailAddress')} <span className="text-[#14235E]">*</span>
                              </Label>
                              <div className="relative">
                                <Mail className="w-3.5 h-3.5 text-[#14235E]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
                                <Input
                                  id="sponsor-email"
                                  type="email"
                                  placeholder="sponsor@example.com"
                                  value={sponsorInfo.email}
                                  onChange={(e) => setSponsorInfo(prev => ({ ...prev, email: e.target.value }))}
                                  className="bg-white dark:bg-[#14235E]/10 border-[#14235E]/15 focus:border-[#3B6FFF]/50 focus-visible:ring-[#3B6FFF]/15 rounded-xl h-10 text-sm pl-9"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="sponsor-phone" className="text-[9px] sm:text-[10px] font-semibold tracking-[0.1em] uppercase text-foreground/50 dark:text-white/40 flex items-center gap-1.5">
                                {t('startApplication.sponsorInfo.phoneNumber')} <span className="text-[#14235E]">*</span>
                              </Label>
                              <div className="relative">
                                <Phone className="w-3.5 h-3.5 text-[#14235E]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
                                <Input
                                  id="sponsor-phone"
                                  type="tel"
                                  placeholder="+971 50 123 4567"
                                  value={sponsorInfo.phone}
                                  onChange={(e) => setSponsorInfo(prev => ({ ...prev, phone: e.target.value }))}
                                  className="bg-white dark:bg-[#14235E]/10 border-[#14235E]/15 focus:border-[#3B6FFF]/50 focus-visible:ring-[#3B6FFF]/15 rounded-xl h-10 text-sm pl-9"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Document Upload */}
                          {docDefs.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Upload className="w-4 h-4 text-[#14235E] dark:text-white/60" strokeWidth={2} />
                                  <Label className="text-xs sm:text-sm font-semibold text-foreground/90 dark:text-white/80">
                                    {t('applications.requiredDocuments')}
                                  </Label>
                                </div>
                                <Badge className={`border-0 text-[9px] font-bold rounded-full px-2.5 py-0.5 ${
                                  Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length >= docDefs.filter(d => d.required).length && docDefs.filter(d => d.required).length > 0
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-[#14235E]/10 text-[#14235E] dark:text-white/60'
                                }`}>
                                  {Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length}/{docDefs.filter(d => d.required).length}
                                </Badge>
                              </div>
                              <div className="rounded-xl border border-[#14235E]/15 dark:border-white/10 overflow-hidden bg-white dark:bg-[#0A0A0F]">
                                <DocumentManager
                                  documents={docDefs}
                                  uploadedDocuments={uploadedDocuments}
                                  onUpload={handleDocumentUpload}
                                  onDelete={handleDocumentDelete}
                                />
                              </div>
                            </div>
                          )}

                          {/* Navigation */}
                          <div className="pt-3 space-y-2.5 sticky bottom-0 bg-gradient-to-t from-[#FBFAF7]/95 dark:from-[#0A0A0F]/95 to-transparent -mx-4 sm:-mx-5 px-4 sm:px-5 py-3 border-t border-[#14235E]/10 dark:border-white/5">
                            <button
                              onClick={() => {
                                setProgress(80)
                                setActiveTab('review-submit')
                              }}
                              disabled={!canNavigateToNext()}
                              className={`group relative w-full flex items-center justify-center gap-2 rounded-2xl h-10 sm:h-12 font-semibold text-sm sm:text-base overflow-hidden transition-all duration-300 ${
                                canNavigateToNext()
                                  ? 'bg-gradient-to-br from-[#1B3FA0] via-[#14235E] to-[#0D1A47] text-white shadow-[0_14px_28px_-10px_rgba(20,35,94,0.6)] ring-1 ring-[#3B6FFF]/30 active:scale-[0.97]'
                                  : 'bg-[#14235E]/15 text-[#14235E]/40 dark:text-white/30 cursor-not-allowed'
                              }`}
                            >
                              {canNavigateToNext() && (
                                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                              )}
                              <span className="relative flex items-center gap-2">
                                {t('common.continue')}
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                              </span>
                            </button>
                            <button
                              onClick={goToPreviousTab}
                              className="w-full text-xs sm:text-sm text-foreground/50 dark:text-white/40 hover:text-foreground dark:hover:text-white transition-colors duration-300 flex items-center justify-center gap-1"
                            >
                              <ChevronRight className="w-4 h-4 rotate-180" strokeWidth={2} />
                              {t('common.back')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>

                {/* Review & Submit Tab */}
                <TabsContent value="review-submit" className="mt-0 flex flex-col min-h-0 flex-1">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col min-h-0 flex-1"
                  >
                    <div className="relative bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border border-[#14235E]/10 dark:border-white/5 rounded-3xl flex flex-col min-h-0 flex-1 overflow-hidden">
                      <div className="shrink-0 px-4 sm:px-5 pt-4 pb-3 border-b border-[#14235E]/10 dark:border-white/5">
                        <div className="flex items-center justify-between gap-3">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5">
  {/* Left side - Icon & Title */}
  <div className="flex items-center gap-2.5">
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#1B3FA0] to-[#14235E] flex items-center justify-center shrink-0 shadow-[0_4px_12px_-4px_rgba(20,35,94,0.5)]">
      <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2} />
    </div>
    <span className="text-sm sm:text-base font-semibold text-foreground/90 dark:text-white/90">
      {t('startApplication.reviewSubmit.title') || 'Review & Submit'}
    </span>
  </div>
  
  {/* Right side - Badge */}
  <Badge className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 w-full sm:w-fit justify-center sm:justify-start">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
    {t('startApplication.reviewSubmit.readyToSubmit') || 'Ready to Submit'}
  </Badge>
</div>
</div>
                      </div>

                      <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4">
                        {/* Summary Grid */}
                        <div className="rounded-xl border border-[#14235E]/10 dark:border-white/5 overflow-hidden">
                          <div className="px-3.5 py-2 bg-[#14235E]/5 dark:bg-[#14235E]/10 border-b border-[#14235E]/10 dark:border-white/5">
                            <span className="text-[9px] font-semibold tracking-[0.14em] uppercase text-foreground/45 dark:text-white/35">Application Summary</span>
                          </div>
                          <div className="grid grid-cols-1 xs:grid-cols-2 divide-y xs:divide-y-0 divide-[#14235E]/8 dark:divide-white/5">
                            {[
                              { label: 'Service', value: selected?.name || 'Not selected', icon: Briefcase },
                              { label: 'Sponsor Type', value: sponsorInfo.sponsorType?.charAt(0).toUpperCase() + sponsorInfo.sponsorType?.slice(1) || 'Not selected', icon: Users },
                              { label: 'Documents', value: `${Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length}/${docDefs.filter(doc => doc.required).length}`, icon: FileText },
                              { label: 'Processing', value: '1-3 business days', icon: Clock },
                            ].map((item, idx) => {
                              const Icon = item.icon
                              return (
                                <div key={idx} className="flex items-center gap-3 p-3 xs:border-l xs:border-[#14235E]/8 dark:xs:border-white/5 xs:first:border-l-0 xs:[&:nth-child(2)]:border-l-0">
                                  <div className="w-8 h-8 rounded-lg bg-[#14235E]/8 flex items-center justify-center shrink-0">
                                    <Icon className="w-4 h-4 text-[#14235E]/70 dark:text-white/50" strokeWidth={2} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-semibold tracking-wide uppercase text-foreground/35 dark:text-white/25">{item.label}</p>
                                    <p className="text-sm font-semibold text-foreground/85 dark:text-white/75 truncate">{item.value}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Payment */}
                        {!paymentCompleted ? (
                          <div className="bg-white dark:bg-[#14235E]/10 border border-[#14235E]/12 dark:border-white/10 rounded-2xl p-3 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#EAC873] to-[#D6A94A] flex items-center justify-center shadow-[0_4px_12px_-4px_rgba(214,169,74,0.6)]">
                                  <CreditCard className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                                </div>
                                <h4 className="text-sm font-bold text-foreground/80 dark:text-white/80">Complete Payment</h4>
                              </div>
                              <span className="text-sm font-bold tabular-nums text-[#14235E] dark:text-white/80">AED {applicationFee}</span>
                            </div>
                            <StripePaymentForm
                              amount={applicationFee}
                              currency="aed"
                              applicationId={applicationId || undefined}
                              onSuccess={() => {
                                setPaymentCompleted(true)
                                setProgress(100)
                                toast.success(`Payment of AED ${applicationFee} completed successfully!`)
                              }}
                              onError={(error) => {
                                toast.error(`Payment failed: ${error}`)
                              }}
                              disabled={false}
                            />
                          </div>
                        ) : (
                          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                                <CheckCircle className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                              </div>
                              <div>
                                <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Payment Completed</p>
                                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">AED {applicationFee} processed successfully</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Submit */}
                        <button
                          onClick={async () => {
                            const ok = await createApplicationAndUpload()
                            if (!ok) return
                            setProgress(100)
                            toast.success('Application submitted successfully!')
                            setTimeout(() => {
                              onOpenChange(false)
                            }, 2000)
                          }}
                          disabled={!paymentCompleted}
                          className={`group relative w-full h-11 sm:h-12 rounded-2xl font-bold text-sm sm:text-[15px] overflow-hidden transition-all duration-300 ${
                            paymentCompleted
                              ? 'bg-gradient-to-br from-[#1B3FA0] via-[#14235E] to-[#0D1A47] text-white shadow-[0_16px_32px_-12px_rgba(20,35,94,0.65)] ring-1 ring-[#3B6FFF]/30 active:scale-[0.97]'
                              : 'bg-[#14235E]/10 dark:bg-white/10 text-[#14235E]/35 dark:text-white/30 cursor-not-allowed'
                          }`}
                        >
                          {paymentCompleted && (
                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                          )}
                          <span className="flex items-center justify-center gap-2">
                            {paymentCompleted ? (
                              <>
                                <Rocket className="w-4 h-4" strokeWidth={2.25} />
                                <span>Submit Application</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4" strokeWidth={2} />
                                <span>Complete Payment First</span>
                              </>
                            )}
                          </span>
                        </button>

                        <button
                          onClick={goToPreviousTab}
                          className="w-full text-xs sm:text-sm text-foreground/50 dark:text-white/40 hover:text-foreground dark:hover:text-white transition-colors duration-300 flex items-center justify-center gap-1"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" strokeWidth={2} />
                          {t('common.back')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
              </div>

              {/* Chat Panel */}
              {!isChatCollapsed && (
                <div className="lg:col-span-4 flex flex-col bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border border-[#14235E]/10 dark:border-white/5 rounded-3xl overflow-hidden min-h-[280px] lg:min-h-0 shadow-[0_20px_50px_-24px_rgba(20,35,94,0.35)]">
                  {/* Chat Header */}
                  <div className="shrink-0 px-4 py-3 border-b border-[#14235E]/10 dark:border-white/5 bg-gradient-to-b from-[#14235E]/[0.04] to-transparent dark:from-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B3FA0] to-[#14235E] flex items-center justify-center ring-2 ring-[#3B6FFF]/30 shadow-[0_4px_12px_-4px_rgba(20,35,94,0.5)]">
                            {connectionStatus === 'connected' ? (
                              <User className="w-4 h-4 text-white" strokeWidth={2} />
                            ) : (
                              <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
                            )}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0A0A0F] ${
                            connectionStatus === 'connected' ? 'bg-emerald-500' : connectionStatus === 'pending' || connectionStatus === 'requesting' ? 'bg-amber-400' : 'bg-[#14235E]/50'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-foreground/90 dark:text-white/90 truncate">
                            {connectionStatus === 'connected' && officerInfo ? officerInfo.name : 'Assistant'}
                          </div>
                          <div className="text-[10px] text-foreground/40 dark:text-white/30 truncate">
                            {connectionStatus === 'connected' ? 'Live Support' :
                             connectionStatus === 'pending' ? 'Waiting...' :
                             connectionStatus === 'requesting' ? 'Requesting...' :
                             'AI Assistant'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={requestUaePass}
                          disabled={!user || uaePassStatus === 'requesting'}
                          className={`h-7 px-2 rounded-lg text-[10px] font-medium ${
                            uaePassStatus === 'authorized' 
                              ? 'text-emerald-600 bg-emerald-500/10' 
                              : 'text-foreground/50 hover:text-foreground hover:bg-[#14235E]/10'
                          }`}
                        >
                          <Globe className="w-3 h-3 mr-1" />
                          {uaePassStatus === 'authorized' ? 'Connected' : 'UAE Pass'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsChatCollapsed(true)}
                          className="h-7 w-7 p-0 rounded-lg text-foreground/40 hover:text-foreground hover:bg-[#14235E]/10"
                        >
                          <Minimize2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Chat Mode Buttons */}
                    <div className="flex items-center gap-1 mt-2.5 p-1 rounded-lg bg-[#14235E]/5 dark:bg-white/5">
                      {[
                        { id: 'ai', label: 'AI', icon: Brain },
                        { id: 'amer', label: connectionStatus === 'connected' ? 'Officer' : 'Agent', icon: User },
                        { id: 'voice', label: 'Call', icon: PhoneCall },
                      ].map((mode) => {
                        const isActive = chatMode === mode.id
                        const Icon = mode.icon
                        return (
                          <Button
                            key={mode.id}
                            size="sm"
                            onClick={() => {
                              if (mode.id === 'amer') {
                                setChatMode('amer')
                                requestAmer()
                              } else if (mode.id === 'voice') {
                                setChatMode('voice')
                                toast('Voice call feature coming soon!')
                              } else {
                                setChatMode('ai')
                              }
                            }}
                            disabled={mode.id === 'amer' && (connectionStatus === 'requesting' || connectionStatus === 'pending')}
                            className={`flex-1 h-7 text-[10px] sm:text-xs font-medium rounded-lg transition-all duration-300 ${
                              isActive
                                ? 'bg-gradient-to-br from-[#1B3FA0] to-[#14235E] text-white '
                                : 'bg-transparent text-foreground/55 hover:bg-white/60 dark:hover:bg-white/5'
                            }`}
                          >
                            <Icon className="w-3 h-3 mr-1" />
                            {mode.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div 
                    id="chat-messages-container"
                    className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#14235E]/3 dark:bg-[#14235E]/5 min-h-0"
                  >
                    {getCurrentChat().length === 0 && (
                      <div className="bg-white dark:bg-[#0A0A0F] border border-[#14235E]/10 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-[#14235E]/10 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-[#14235E] dark:text-white/60" />
                          </div>
                          <span className="text-xs font-semibold text-[#14235E] dark:text-white/80">Assistant Active</span>
                        </div>
                        <p className="text-xs text-foreground/60 dark:text-white/50 leading-relaxed">
                          {t('startApplication.chat.welcomeMessage')} {selected?.name || t('startApplication.title')}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {[
                            "What documents do I need?",
                            "How long will this take?",
                            "Am I eligible?",
                            "Connect me to an officer"
                          ].map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => setInput(suggestion)}
                              className="text-[9px] sm:text-[10px] px-3 py-1.5 rounded-full border border-[#14235E]/10 bg-[#14235E]/[0.03] text-foreground/60 hover:bg-[#14235E] hover:border-[#14235E] hover:text-white transition-all duration-300"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {getCurrentChat().map((m, idx) => (
                      <React.Fragment key={`${m.id}-${idx}`}>
                        <StreamingMessage
                          type={m.type === 'bot' ? 'ai' : m.type as any}
                          content={m.content}
                          isStreaming={m.isStreaming}
                          metadata={m.metadata}
                          timestamp={m.timestamp}
                        />
                        {m.metadata?.action === 'connect_officer' && (
                          <div className="flex justify-start pl-11 -mt-2 mb-3">
                            <button
                              onClick={() => {
                                setChatMode('amer')
                                requestAmer()
                              }}
                              className="px-4 py-2 rounded-xl bg-[#14235E] text-white text-xs font-medium hover:bg-[#1B3FA0] transition-all duration-300 flex items-center gap-2"
                            >
                              <Users className="w-3.5 h-3.5" />
                              Connect to Officer
                            </button>
                          </div>
                        )}
                      </React.Fragment>
                    ))}

                    {isAIStreaming && <TypingIndicator sender="AI" />}
                    {isTyping && <TypingIndicator sender="Officer" />}
                  </div>

                  {/* Chat Input */}
                  <div className="shrink-0 p-3 border-t border-[#14235E]/10 dark:border-white/5 bg-white/50 dark:bg-[#0A0A0F]/50">
                    <div className="relative flex items-center gap-2 bg-white dark:bg-[#0A0A0F] border border-[#14235E]/15 dark:border-white/10 rounded-xl px-3 py-1.5 focus-within:border-[#14235E]/50 focus-within:shadow-[0_0_0_3px_rgba(10,50,105,0.08)] transition-all duration-300">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (roomId && socket) socket.emit('typing_start', { roomId, userId: 'user' })
                          if (e.key === 'Enter') {
                            sendChat()
                            if (roomId && socket) socket.emit('typing_stop', { roomId, userId: 'user' })
                          }
                        }}
                        placeholder={!user ? "Please log in to start chatting" : "Ask about your application..."}
                        className="flex-1 h-7 bg-transparent border-0 px-0 text-xs text-foreground/90 dark:text-white/90 placeholder:text-foreground/40 outline-none"
                        disabled={!user}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 rounded-lg text-foreground/40 hover:text-foreground hover:bg-[#14235E]/10"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!user || !roomId}
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          sendChat()
                          if (roomId && socket) socket.emit('typing_stop', { roomId, userId: 'user' })
                        }}
                        disabled={!input.trim() || !user}
                        className={`h-7 w-7 p-0 rounded-lg transition-all duration-300 ${
                          !input.trim() || !user
                            ? 'bg-[#E8ECF0] text-[#94A3B8] cursor-not-allowed'
                            : 'bg-gradient-to-br from-[#1B3FA0] to-[#14235E] text-white hover:brightness-110 shadow-[0_4px_10px_-4px_rgba(20,35,94,0.5)]'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                      multiple
                    />
                  </div>
                </div>
              )}
            </div>
          </Tabs>
        </div>

        {/* Floating Chat Toggle */}
        {isChatCollapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsChatCollapsed(false)}
              className="bg-gradient-to-br from-[#1B3FA0] via-[#14235E] to-[#0D1A47] text-white hover:brightness-110 rounded-full w-14 h-14 p-0 shadow-[0_16px_36px_-10px_rgba(20,35,94,0.65)] ring-2 ring-[#D6A94A]/40 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
            {connectionStatus === 'connected' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0A0A0F] animate-pulse" />
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}