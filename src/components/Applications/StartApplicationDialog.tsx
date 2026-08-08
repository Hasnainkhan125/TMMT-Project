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
  ChevronRight, Brain, MessageSquare, Crown,CreditCard,Phone,Mail,Shield,
  Rocket, Minimize2, Globe, Users,  Briefcase,
  DollarSign,
  Lock, ArrowRight        

} from 'lucide-react'
import { 
  TrendingUp, 
  Award,
  Handshake, 
  MapPin, 
  Home, 
} from 'lucide-react'
import { 
  // ... other imports
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
  queryParams:string| undefined
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

// Service images mapping for ultra-realistic photos
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

// Get service image based on service name
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

// Animation variants for smooth transitions
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





// ── Redirect shim ─────────────────────────────────────────────────────────────
// StartApplicationDialog is deprecated in favour of the full-screen ApplicationFlow
// at /apply. This shim makes every existing caller transparently redirect there.
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

// ── Legacy implementation (kept for reference, no longer rendered) ────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function LegacyStartApplicationDialog({ open, onOpenChange,queryParams="" }: StartApplicationDialogProps) {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar' || i18n.language === 'ur'
  
  // Voice Agent Context - for global voice control (shared conversation)
  const { 
    state: voiceAgentState,
    conversation: voiceConversation,
    selectService: voiceSelectService,
    setActiveTab: voiceSetActiveTab,
    updateSponsorInfo: voiceUpdateSponsorInfo,
    updateDocumentProgress: voiceUpdateDocumentProgress,
    updateApplicationProgress: voiceUpdateApplicationProgress
  } = useVoiceAgent();
  
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

  // Enhanced features state
  const [activeTab, setActiveTab] = useState('smart-start')
  const [amerConnected, setAmerConnected] = useState(false)
  const [liveGuidance, setLiveGuidance] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'requesting' | 'pending' | 'connected' | 'no_officers'>('idle')
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null)
  const [officerInfo, setOfficerInfo] = useState<{ name: string; id: string } | null>(null)
  
  // Sponsor information state
  const [sponsorInfo, setSponsorInfo] = useState({
    email: '',
    phone: '',
    iban: '',
    sponsorType: 'employee' as 'employee' | 'investor' | 'partner',
    location: 'inside' as 'inside' | 'outside',
    processingMethod: 'tammat' as 'tammat' | 'amer'
  })

  
  // Chat panel state
  const [isChatCollapsed, setIsChatCollapsed] = useState(typeof window !== 'undefined' && window.innerWidth < 760 ? true : false)
  
  // UAE Pass state
  const [uaePassStatus, setUaePassStatus] = useState<'idle' | 'requesting' | 'authorized' | 'error'>('idle')
  
  // File upload state
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Payment state
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [applicationFee] = useState(1500) // AED 1,500 default fee


  // ============================================================================
  // Voice Agent Sync Effects (bidirectional sync between UI and voice agent)
  // ============================================================================

  // Sync FROM voice agent TO local state (voice controls UI)
  useEffect(() => {
    if (voiceAgentState.selectedService && !selected && services.length > 0) {
      // Voice selected a service, update local state
      const serviceFromContext = services.find(s => s.id === voiceAgentState.selectedService?.id);
      if (serviceFromContext) {
        setSelected(serviceFromContext);
      }
    }
  }, [voiceAgentState.selectedService, selected, services]);

  useEffect(() => {
    if (voiceAgentState.activeTab && voiceAgentState.activeTab !== activeTab) {
      // Voice navigated to a different tab
      setActiveTab(voiceAgentState.activeTab);
    }
  }, [voiceAgentState.activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Sync sponsor info FROM voice agent
    const voiceSponsor = voiceAgentState.sponsorInfo;
    if (voiceSponsor.email && voiceSponsor.email !== sponsorInfo.email) {
      setSponsorInfo(prev => ({ ...prev, email: voiceSponsor.email }));
    }
    if (voiceSponsor.phone && voiceSponsor.phone !== sponsorInfo.phone) {
      setSponsorInfo(prev => ({ ...prev, phone: voiceSponsor.phone }));
    }
  }, [voiceAgentState.sponsorInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync FROM local state TO voice agent context
  useEffect(() => {
    if (selected) {
      voiceSelectService({
        id: selected.id,
        name: selected.name,
        category: selected.category,
        description: selected.description
      });
    }
  }, [selected, voiceSelectService]);

  useEffect(() => {
    voiceSetActiveTab(activeTab);
  }, [activeTab, voiceSetActiveTab]);

  useEffect(() => {
    voiceUpdateSponsorInfo({
      email: sponsorInfo.email,
      phone: sponsorInfo.phone,
      sponsorType: sponsorInfo.sponsorType
    });
  }, [sponsorInfo.email, sponsorInfo.phone, sponsorInfo.sponsorType, voiceUpdateSponsorInfo]);

  useEffect(() => {
    const uploadedCount = Object.values(uploadedDocuments).filter(d => d.status === 'uploaded').length;
    const requiredCount = docDefs.filter(d => d.required).length;
    const uploadedIds = Object.keys(uploadedDocuments).filter(id => uploadedDocuments[id]?.status === 'uploaded');
    voiceUpdateDocumentProgress(uploadedCount, requiredCount, uploadedIds);
  }, [uploadedDocuments, docDefs, voiceUpdateDocumentProgress]);

  useEffect(() => {
    voiceUpdateApplicationProgress(progress);
  }, [progress, voiceUpdateApplicationProgress]);

  // Use shared voice conversation from context (no duplicate useConversation)
  // The voiceConversation from context is used for voice interactions
  // Get current chat based on mode
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
  
    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
      setTimeout(() => {
        const chatContainer = document.getElementById('chat-messages-container')
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight
        }
      }, 100)
    }
  
    // Handle chat mode changes
    useEffect(() => {
      // Scroll to bottom when switching modes
      scrollToBottom()
    }, [chatMode])
  

  useEffect(() => {
    if (!queryParams) return;
  
    const q =
      typeof queryParams === "string"
        ? queryParams
        :  "";
  
    setQuery(q);
  }, [queryParams]);


  useEffect(() => {
    if (!query) {
      setFiltered(services);
      return;
    }
  
    const filtered = services.filter(s =>
      `${s.name} ${s.description}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  
    setFiltered(filtered);
  }, [query, services]);
  
  

  // Restore from localStorage
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

  // Persist to localStorage
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

  // Load services from backend services.json with graceful fallback to local config
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
            console.log(source.filter((s: any) => (s.name).toLowerCase().includes(query.toLowerCase())),"filtered",queryParams)
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
      console.log('StartApplicationDialog: Socket connection established', socketConnection.connected)
      setSocket(socketConnection)
    } else {
      setSocket(null)
    }
  }, [token])
  // Enhanced Socket events for officer connection flow
  useEffect(() => {
    if (!socket) return

    const onAmerConnected = (payload: any) => {
      console.log('Amer officer connected:', payload)
      setRoomId(payload?.chatId || payload?.roomId)
      setAmerConnected(true)
      setConnectionStatus('connected')
      setOfficerInfo({ 
        name: payload?.officerName || 'Amer Officer', 
        id: payload?.officerId || 'unknown' 
      })
      setPendingRequestId(null)
      
      // Add system message about connection
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `✅ Connected to ${payload?.officerName || 'Amer Officer'}. You can now chat live!`,
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
      console.log('Request sent to officers:', payload)
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

      // Start timeout for pending request (5 minutes)
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
      console.log('No officers available:', payload)
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

      // Reset status after a delay
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
        // Start SLA 2 minutes by default
        const until = Date.now() + 2*60*1000
        setSlaUntil(until)
      }
    }
    const onNewMessage = (msg: any) => {
      console.log('StartApplicationDialog received new message:', msg)
      console.log('Current chat mode:', chatMode)
      console.log('Current room ID:', roomId)
      console.log('Message chat ID:', msg.chatId, msg.metadata?.roomId)
      
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

      // Always add Amer officer messages to amerChat regardless of current mode
      if (msg.sender === 'amer' || displayType === 'amer' || msg.type === 'amer') {
        console.log('Adding message to Amer chat:', newMessage)
        setAmerChat(prev => {
        // Avoid duplicates by id
        if (prev.some(p => p.id === msg.id)) return prev
          const newChat = [...prev, newMessage]
          console.log('Updated Amer chat:', newChat.length, 'messages')
          return newChat
        })
        
        // Auto-switch to Amer mode if we receive an officer message
        if (chatMode !== 'amer') {
          console.log('Auto-switching to Amer chat mode')
          setChatMode('amer')
        }
      } else {
        // Handle user messages or system messages
        console.log('Adding message to current chat mode:', chatMode)
        setCurrentChat(prev => {
          // Avoid duplicates by id
          if (prev.some(p => p.id === msg.id)) return prev
          return [...prev, newMessage]
        })
      }
      
      scrollToBottom()
    }

    const onMessageSent = (msg: any) => {
      console.log('Message sent confirmation:', msg)
      // Message was successfully sent, no need to add to chat as it's already there
    }

    const onMessageError = (error: any) => {
      console.error('Message error:', error)
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
      console.log('Chat history loaded:', payload)
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
      console.log('Chat ended:', payload)
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
      console.log('UAE Pass response:', response)
      if (response.status === 'pending') {
        setUaePassStatus('requesting')
        toast.info('UAE Pass Access', {
          description: 'Opening UAE Pass authentication...'
        })
        // Open UAE Pass in new window
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
    
    // Register event listeners
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

  // If user switches to voice and already has a room, request a call
  useEffect(() => {
    if (chatMode !== 'voice' || !roomId || !socket) return
    try {
      socket.emit('voice_call_request', { roomId, userId: 'user' })
      toast('Voice call requested')
    } catch {}
  }, [chatMode, roomId, socket])

  // SLA countdown timer
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
    setProgress(5) // Step 1: Select Service
    // Initialize enhanced features
    // keep at 5 — step-specific progress is set in goToNextTab and payment
  }, [open])

  // Update document score based on uploads
  useEffect(() => {
    const totalRequired = docDefs.filter(d => d.required).length || 1
    const uploadedRequired = docDefs.filter(d => d.required && uploaded[d.id]).length
    const newScore = Math.round((uploadedRequired / totalRequired) * 100)
    
    // Update live guidance based on progress
    if (newScore === 100) {
      setLiveGuidance(['All documents uploaded successfully', 'AI validation complete', 'Ready for submission'])
    } else if (newScore > 50) {
      setLiveGuidance(['Good progress on documents', 'Consider uploading remaining required docs'])
    } else {
      setLiveGuidance(['Start by uploading required documents', 'Use drag & drop for quick upload'])
    }
  }, [uploaded, docDefs])

  // File upload handlers
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
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large. Maximum size is 10MB.`)
        continue
      }

      // Create file message for immediate display
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

      // Add to appropriate chat
      if (chatMode === 'amer' && roomId) {
        setAmerChat(prev => [...prev, fileMessage])
      } else {
        setCurrentChat(prev => [...prev, fileMessage])
      }

      scrollToBottom()

      try {
        // Upload to server
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

          // Update message with successful upload
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

            // Send file message via WebSocket if connected to officer
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
        console.error('File upload error:', error)

        // Update message with error
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
        // AI with streaming - use AI chat context
        setAiChat(prev => [...prev, userMsg])

        // Check if user explicitly wants to connect to an officer
        const wantsOfficer = currentInput.toLowerCase().match(/\b(connect|officer|amer|human|live\s*support|speak\s*to|talk\s*to)\b/)
        if (wantsOfficer && socket) {
          setChatMode('amer')
          requestAmer()
          return
        }

        setIsAIStreaming(true)
        scrollToBottom()
        
        // Create placeholder message for streaming
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

        // Get AI context with limit (last 10 messages)
        const aiContext = aiChat.slice(-10)

        // Stream the AI response
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
              console.error('AI streaming error:', error)
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
        // Amer/Voice modes use WS chat - use Amer chat context
        setAmerChat(prev => [...prev, userMsg])
        setIsTyping(true)
        scrollToBottom()
        
        if (roomId && socket) {
          // Send message using the new chat_message format
          console.log('Sending message to officer:', currentInput, 'Room ID:', roomId)
          console.log('Socket connected:', socket.connected)
          
          socket.emit('chat_message', { 
            message: currentInput, 
            chatId: roomId, 
            type: 'text' 
          })
          
          // Add timeout for message confirmation
          const messageTimeout = setTimeout(() => {
            console.warn('Message not confirmed, adding error message')
            setAmerChat(prev => [...prev, {
              id: Date.now().toString(),
              type: 'system',
              content: '⚠️ Message may not have been delivered. Please check your connection.',
              timestamp: new Date()
            }])
            setIsTyping(false)
          }, 5000)
          
          // Clear timeout on successful send (handled in onMessageSent)
          socket.once('message_sent', () => {
            clearTimeout(messageTimeout)
            setIsTyping(false)
          })
          
        } else {
          // No active chat session, try to request officer
          console.log('No active chat session or socket, requesting officer...')
          setIsTyping(false)
          requestAmer()
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setCurrentChat(prev => [...prev, { id: Date.now().toString(), type: 'system', content: 'Network error. Please try again.', timestamp: new Date() }])
      setIsAIStreaming(false)
      setIsTyping(false)
      scrollToBottom()
    }
  }


  // Build dynamic document definitions from selected service with enhanced categorization
  useEffect(() => {
    if (!selected) { setDocDefs([]); return }

    // Enhanced document mapping with proper categorization and context awareness
    const enhancedDocumentMap: Record<string, {
      label: string
      category: 'sponsor' | 'sponsored' | 'establishment' | 'other'
      required: boolean
      description: string
      accepted?: string[]
      sponsorTypes?: string[]
    }> = {
      // Sponsor Documents
      'emirates-id': { label: 'Emirates ID Copy', category: 'sponsor', required: true, description: 'Clear copy of sponsor\'s Emirates ID' },
      'sponsor-passport': { label: 'Sponsor Passport Copy', category: 'sponsor', required: true, description: 'Clear copy of sponsor\'s passport' },
      'sponsor-visa': { label: 'Sponsor Visa Copy', category: 'sponsor', required: true, description: 'Copy of sponsor\'s current residence visa' },
      'sponsor-salary': { label: 'Salary Certificate', category: 'sponsor', required: true, description: 'Latest salary certificate from employer', sponsorTypes: ['employee'] },
      'sponsor-bank': { label: 'Bank Statement', category: 'sponsor', required: false, description: '3-month bank statement showing salary deposits', sponsorTypes: ['employee'] },
      
      // Sponsored Person Documents
      'spouse-passport': { label: 'Spouse Passport', category: 'sponsored', required: true, description: 'Clear copy of spouse\'s passport (valid for 6+ months)' },
      'spouse-photos': { label: 'Spouse Photos', category: 'sponsored', required: true, description: 'Recent passport-sized photos with white background' },
      'child-passport': { label: 'Child Passport', category: 'sponsored', required: true, description: 'Clear copy of child\'s passport (valid for 6+ months)' },
      'child-photos': { label: 'Child Photos', category: 'sponsored', required: true, description: 'Recent passport-sized photos with white background' },
      'birth-certificate': { label: 'Birth Certificate', category: 'sponsored', required: true, description: 'Attested birth certificate from home country' },
      'medical-certificate': { label: 'Medical Certificate', category: 'sponsored', required: false, description: 'Medical fitness certificate if required' },
      
      // Establishment Documents (only for investors/partners)
      'trade-license': { label: 'Trade License', category: 'establishment', required: true, description: 'Valid trade license copy', sponsorTypes: ['investor', 'partner'] },
      'establishment-card': { label: 'Establishment Card', category: 'establishment', required: true, description: 'Immigration establishment card', sponsorTypes: ['investor', 'partner'] },
      'mol-card': { label: 'MOL Card', category: 'establishment', required: false, description: 'Ministry of Labor card', sponsorTypes: ['investor', 'partner'] },
      'company-contract': { label: 'Company Contract', category: 'establishment', required: false, description: 'Company contract or MOA', sponsorTypes: ['investor', 'partner'] },
      'tenancy-contract': { label: 'Tenancy Contract', category: 'establishment', required: false, description: 'Office tenancy contract', sponsorTypes: ['investor', 'partner'] },
      
      // Other Documents
      'marriage-certificate': { label: 'Marriage Certificate', category: 'other', required: true, description: 'Attested marriage certificate from home country and MOFA UAE' },
      'police-clearance': { label: 'Police Clearance Certificate', category: 'other', required: false, description: 'Police clearance from home country' },
      'educational-certificate': { label: 'Educational Certificates', category: 'other', required: false, description: 'Attested educational certificates' },
      'passport': { label: 'Passport Copy', category: 'sponsor', required: true, description: 'Clear copy of passport' },
      'residency-visa': { label: 'Residency Visa Copy', category: 'sponsor', required: true, description: 'Copy of current residence visa' },
      'salary-certificate': { label: 'Salary Certificate', category: 'sponsor', required: true, description: 'Latest salary certificate' },
      'mohre-approval': { label: 'MOHRE Approval', category: 'sponsor', required: true, description: 'MOHRE approval permit for employment visa', sponsorTypes: ['employee'] },
      'labor-contract': { label: 'Labor Contract', category: 'sponsor', required: true, description: 'Labor contract with minimum salary requirements', sponsorTypes: ['employee'] }
    }

    // Filter documents based on sponsor type
    const filterDocumentsBySponsorType = (documents: any[]) => {
      return documents.filter(doc => {
        const enhanced = enhancedDocumentMap[doc.id as keyof typeof enhancedDocumentMap]
        if (!enhanced) return true
        
        // If document has sponsorTypes restriction, check if current sponsor type is included
        if (enhanced.sponsorTypes && !enhanced.sponsorTypes.includes(sponsorInfo.sponsorType)) {
          return false
        }
        
        return true
      })
    }

    // Try to enrich from local config (has detailed requirement objects)
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

    // Fallback: derive from requirements string[] with enhanced mapping
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
        console.log('doc required based on sponsor type: ', doc)
        // Filter based on sponsor type
        if (doc.sponsorTypes && !doc.sponsorTypes.includes(sponsorInfo.sponsorType)) {
          return false
        }
        if(doc.label.toLowerCase().startsWith('memorandum') && sponsorInfo.sponsorType !== 'investor') {
          return false
        }
        return true
      })
      .map(({ sponsorTypes, ...doc }) => doc) // Remove sponsorTypes from final object
    console.log(fallbackDefs,'fallbackDefs')
    setDocDefs(fallbackDefs)
  }, [selected, sponsorInfo.sponsorType])

  // Progress based on required docs uploaded
  useEffect(() => {
    if (!docDefs.length) return
    const requiredTotal = docDefs.filter(d => d.required).length || 1
    const requiredUploaded = docDefs.filter(d => d.required && uploaded[d.id]).length
    const docsPct = Math.round((requiredUploaded/requiredTotal)*40) // up to 40% from docs
    setProgress(prev => Math.max(prev, 40 + docsPct))
  }, [uploaded, docDefs])

  // Map service id -> backend enum applicationType
  const toApplicationType = (id?: string | number | null) => {
    if (!id) return ''
    
    // Convert to string for processing
    const idStr = String(id)
    
    // Map based on service IDs from services.json
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
    
    // Check if it's a service ID from the JSON
    if (serviceIdMap[idStr]) {
      return serviceIdMap[idStr]
    }
    
    // Fallback for string-based IDs (legacy or custom)
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
      
      // Ensure payment is completed
      if (!paymentCompleted) {
        toast.error('Please complete payment before submitting application')
        return false
      }
      
      // Ensure required docs satisfied
      if (!canContinueDocs) {
        toast.error('Please upload all required documents before continuing')
        return false
      }
      // Ensure all required documents across service.process are uploaded
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
      // Validate sponsored fields if required
      console.log('Creating application...', selected?.id, sponsoredFirstName, sponsoredLastName,selected)
      
      // Check if this is a family visa that requires sponsored person details
      const familyVisaIds = ['1', '4', '9', '13', '14', '15', '243', '17'] // IDs that require sponsored person details
      const needsSponsoredDetails = selected?.id && (
        familyVisaIds.includes(String(selected.id)) || 
        String(selected.id).includes('family') ||
        selected.name?.toLowerCase().includes('spouse') ||
        selected.name?.toLowerCase().includes('child') ||
        selected.name?.toLowerCase().includes('parent')
      )
      
      // if (needsSponsoredDetails && (!sponsoredFirstName || !sponsoredLastName)) {
      //   toast.error('Please complete sponsored person details')
      //   setActiveTab('ai-guidance')
      //   return false
      // }
      console.log('Creating application...', (selected))

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
      // Upload staged docs
      const ok = await uploadAllStagedDocuments(appId)
      if (!ok) {
        toast.error('Some documents failed to upload')
        return false
      }
      setProgress(100)
      toast.success('d and documents uploaded')
      return true
    } catch (e) {
      console.error('Creating application error:', e)
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

    console.log('Requesting Amer officer connection...')
    setConnectionStatus('requesting')
    
    // Send the connection request with user data
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
    
    // Add immediate feedback
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: '🔄 Sending request to available Amer officers...',
      timestamp: new Date()
    }
    setAmerChat(prev => [...prev, systemMessage])
    scrollToBottom()

    // Reset requesting status after a moment
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

    console.log('Requesting UAE Pass access...')
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

  // New document handling functions for DocumentManager
  const handleDocumentUpload = async (docId: string, file: File): Promise<void> => {
    const documentId = crypto.randomUUID()
    
    // Create preview URL
    const preview = URL.createObjectURL(file)
    
    // Add to uploaded documents with uploading status
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
      // Stage locally until application is created
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

      // Upload to server
    const form = new FormData()
    const uploadKey = mapDocIdToField(docId)
      form.append(uploadKey, file)

      // Simulate progress
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
    // Remove from all states
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

  // Build stepper data from service.process (if available)
  const serviceSteps = useMemo(() => (selected?.process || []) as Array<{ step: number; title: string; description?: string; requiredDocuments?: string[] }>, [selected])

  // Map app step -> corresponding service step index (heuristic)
  const currentServiceStepIndex = useMemo(() => {
    if (!serviceSteps.length) return -1
    // If in docs step, highlight the first process step that has requiredDocuments
    if (step === 2) {
      const idx = serviceSteps.findIndex(s => (s.requiredDocuments || []).length > 0)
      return idx >= 0 ? idx : 0
    }
    // If in review/payment, highlight last
    if (step === 3) return serviceSteps.length - 1
    // Otherwise, highlight first
    return 0
  }, [serviceSteps, step])

  // Determine if current step's requiredDocuments are satisfied
  const requiredDocsForCurrentServiceStep = useMemo(() => {
    if (currentServiceStepIndex < 0) return [] as string[]
    return (serviceSteps[currentServiceStepIndex]?.requiredDocuments || []) as string[]
  }, [serviceSteps, currentServiceStepIndex])

  const canContinueDocs = useMemo(() => {
    if (step !== 2) return true
    if (!requiredDocsForCurrentServiceStep.length) return true
    return requiredDocsForCurrentServiceStep.every(id => uploaded[id])
  }, [step, requiredDocsForCurrentServiceStep, uploaded])

  // Navigation functions — 3-step flow: Service → Info+Docs → Review/Pay
  const TAB_ORDER = ['smart-start', 'sponsor-info', 'review-submit'] as const

  const goToNextTab = () => {
    const currentIndex = TAB_ORDER.indexOf(activeTab as any)
    if (currentIndex < TAB_ORDER.length - 1) {
      const next = TAB_ORDER[currentIndex + 1]
      // Update deterministic progress when advancing
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
        // Require contact info; docs upload is optional until submit
        return !!sponsorInfo.email && !!sponsorInfo.phone
      case 'review-submit':
        return false
      default:
        return false
    }
  }

  // Map requirement id to server multer field key
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
  className={`max-w-[95vw] h-[94dvh] max-h-[94dvh] flex flex-col overflow-hidden p-3 bg-gradient-to-b from-background to-background/97 border border-primary/20 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.35)] rounded-3xl ${isRTL ? 'font-tajawal' : 'font-poppins'}`}
  dir={isRTL ? 'rtl' : 'ltr'}
>


        <div className="flex-1 min-h-0 flex flex-col p-2 sm:p-4 lg:p-6 overflow-hidden">
          {/* Advanced Multi-Tab Interface - Mobile Optimized */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col min-h-0 flex-1">
          {/* 3-step progress stepper — premium gradient nodes + animated connectors */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="mb-4 sm:mb-6 shrink-0"
>
  {/* Hidden tabs list — tabs are driven by stepper only */}
  <TabsList className="hidden">
    <TabsTrigger value="smart-start" />
    <TabsTrigger value="sponsor-info" />
    <TabsTrigger value="review-submit" />
  </TabsList>

  {/* Visual stepper */}
  {(() => {
    const steps = [
      { id: 'smart-start',   label: t('startApplication.tabs.service'),  icon: Sparkles,  step: 1 },
      { id: 'sponsor-info',  label: t('startApplication.tabs.sponsor'),   icon: User,      step: 2 },
      { id: 'review-submit', label: t('startApplication.tabs.submit'),    icon: Rocket,    step: 3 },
    ]
    const currentIdx = steps.findIndex(s => s.id === activeTab)
    return (
      <div className={`flex items-center gap-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {steps.map((s, idx) => {
          const Icon = s.icon
          const isActive   = s.id === activeTab
          const isComplete = idx < currentIdx
          const isDisabled = idx > currentIdx && !isComplete
          return (
            <div key={s.id} className={`flex items-center ${idx < steps.length - 1 ? 'flex-1' : ''}`}>
              <button
                onClick={() => !isDisabled && setActiveTab(s.id)}
                disabled={isDisabled}
                className={`group flex flex-col items-center gap-1.5 min-w-[64px] transition-all duration-200 disabled:cursor-not-allowed ${isRTL ? 'font-tajawal' : 'font-poppins'}`}
              >
                <div className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isComplete || isActive 
                    ? 'bg-[#0A3269] dark:bg-[#0A3269] shadow-[0_6px_16px_-4px_rgba(10,50,105,0.5)]' 
                    : 'bg-white dark:bg-[#0A3269]/20 border-2 border-[#0A3269]/20 dark:border-white/10 group-hover:border-[#0A3269]/40'
                  }
                `}>
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-[#0A3269]/40"
                      animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                    />
                  )}
                  {isComplete
                    ? <CheckCircle className="relative w-4 h-4 text-white" strokeWidth={2.5} />
                    : <Icon className={`relative w-4 h-4 ${isActive ? 'text-white' : 'text-[#0A3269] dark:text-white/50'}`} />
                  }
                </div>
                <span className={`text-[11px] font-semibold leading-none transition-colors duration-200 ${
                  isActive ? 'text-[#0A3269] dark:text-white' : 
                  isComplete ? 'text-[#0A3269] dark:text-white/80' : 
                  'text-[#0A3269]/50 dark:text-white/30'
                }`}>
                  {s.label}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div className="relative flex-1 h-[3px] mx-2 rounded-full bg-[#0A3269]/10 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: idx < currentIdx ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 rounded-full bg-[#0A3269] dark:bg-[#0A3269]"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  })()}
</motion.div>

<div className={`flex-1 min-h-0 flex flex-col lg:grid gap-2 lg:gap-4 xl:gap-6 transition-all duration-300 ${
  isChatCollapsed ? 'lg:grid-cols-1' : 'lg:grid-cols-12'
}`}>
  {/* Main Content Area */}
  <div className={`flex flex-col min-h-0 flex-1 transition-all duration-300 ${
    isChatCollapsed ? 'col-span-full' : 'lg:col-span-8'
  }`}>
    
    {/* Smart Start Tab */}
    <TabsContent value="smart-start" className="mt-0 flex flex-col min-h-0 flex-1">
      <AnimatePresence mode="wait">
        <motion.div
          key="smart-start"
          variants={fadeInUp}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex flex-col min-h-0 flex-1"
        >
          {/* Modern Service Selection Card */}
          <div className="relative bg-white dark:bg-[#0A1628] border border-[#0A3269]/10 dark:border-white/5 rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col min-h-0 flex-1">
            {/* Decorative ambient glow */}
            <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-[#0A3269]/5 dark:bg-[#0A3269]/10 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#0A3269]/5 dark:bg-[#0A3269]/10 blur-[80px]" />

            <div className="relative flex flex-col min-h-0 flex-1 space-y-4 sm:space-y-5 p-3 sm:p-4 lg:p-6 pt-5 overflow-hidden">
              {/* Modern Search Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative group"
              >
                <div className="relative flex items-center gap-3 rounded-2xl border border-[#0A3269]/15 dark:border-white/10 bg-white/90 dark:bg-[#0A3269]/5 backdrop-blur-sm px-3 py-2 transition-all duration-300 focus-within:border-[#0A3269]/40 focus-within:shadow-[0_0_0_4px_rgba(10,50,105,0.08)] dark:focus-within:shadow-[0_0_0_4px_rgba(255,255,255,0.05)]">
                  {/* Search Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0A3269] dark:bg-[#0A3269]">
                    <Search className="h-4 w-4 text-white" strokeWidth={2.2} />
                  </div>

                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("startApplication.serviceSelection.searchPlaceholder")}
                    className="flex-1 h-9 bg-transparent border-0 px-0 text-sm font-medium text-foreground/90 dark:text-white/90 placeholder:text-[#0A3269]/40 dark:placeholder:text-white/30 shadow-none ring-0 outline-none focus:border-0 focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:shadow-none focus:outline-none focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:shadow-none focus-visible:outline-none active:ring-0 active:shadow-none disabled:ring-0 disabled:shadow-none [&_*]:shadow-none [&_*]:ring-0"
                  />
                  
                  <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0A3269]/5 dark:bg-white/5 text-[10px] font-medium text-[#0A3269]/50 dark:text-white/30 border border-[#0A3269]/10 dark:border-white/10">
                    <span>⌘</span>K
                  </kbd>
                </div>
              </motion.div>

              {/* Modern Service Grid */}
              <motion.div
                variants={staggerContainer}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 flex-1 overflow-y-auto pr-1 min-h-0"
                style={{ scrollbarGutter: 'stable' }}
              >
                {filtered.map((service, index) => {
                  const isSelected = selected?.id === service.id
                  return (
                    <motion.div
                      key={service.id}
                      variants={staggerItem}
                      transition={{ delay: index * 0.03 }}
                      whileTap={{ scale: 0.97 }}
                      animate={isSelected ? { scale: 1.02 } : { scale: 1 }}
                      className="h-full"
                    >
                      <div
                        onClick={() => {
                          if (isSelected) {
                            setSelected(null)
                          } else {
                            setSelected(service)
                            setProgress(20)
                            setTimeout(() => setActiveTab('sponsor-info'), 300)
                          }
                        }}
                        className={`
                          relative cursor-pointer rounded-2xl overflow-hidden
                          bg-white dark:bg-[#0A1628]
                          border transition-all duration-300
                          h-full
                          ${isSelected
                            ? 'border-[#0A3269] dark:border-[#0A3269] shadow-[0_0_0_2px_rgba(10,50,105,0.15),0_12px_32px_-10px_rgba(10,50,105,0.15)] dark:shadow-[0_0_0_2px_rgba(10,50,105,0.2),0_12px_32px_-10px_rgba(0,0,0,0.5)]'
                            : 'border-[#0A3269]/10 dark:border-white/5 hover:border-[#0A3269]/30 dark:hover:border-[#0A3269]/20 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)]'
                          }
                        `}
                      >
                        {/* Selected state glow */}
                        {isSelected && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0A3269]/5 to-transparent dark:from-[#0A3269]/10 pointer-events-none" />
                            <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#0A3269]/15 dark:bg-[#0A3269]/20 blur-2xl" />
                          </>
                        )}

                        {/* Top accent bar */}
                        <motion.div
                          initial={false}
                          animate={{ scaleX: isSelected ? 1 : 0 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className="absolute top-0 left-0 right-0 h-[3px] bg-[#0A3269] dark:bg-[#0A3269] origin-left rounded-t-2xl"
                        />

                        {/* Service Icon Area */}
                        <div className="relative h-14 sm:h-16 w-full overflow-hidden bg-gradient-to-r from-[#0A3269]/5 to-[#1a4a7a]/5 dark:from-[#0A3269]/10 dark:to-[#1a4a7a]/5">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl sm:text-3xl font-bold text-[#0A3269]/10 dark:text-white/5">
                              {service.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          {service.category && (
                            <Badge className="absolute top-2 right-2 bg-white/90 dark:bg-[#0A1628]/80 backdrop-blur-sm text-[#0A3269] dark:text-white/70 border-[#0A3269]/15 dark:border-white/10 text-[7px] sm:text-[8px] font-medium rounded-full px-2 py-0.5 shadow-sm">
                              {service.category}
                            </Badge>
                          )}
                        </div>

                        <div className="relative p-3 sm:p-4 pt-2.5 sm:pt-3">
                          {/* Title */}
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <h3 className="text-[13px] sm:text-[15px] font-semibold leading-tight text-foreground/90 dark:text-white/90 line-clamp-1">
                              {service.name}
                            </h3>

                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0.4, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                className="shrink-0 w-5 h-5 rounded-full bg-[#0A3269] dark:bg-[#0A3269] flex items-center justify-center shadow-md shadow-[#0A3269]/30"
                              >
                                <CheckCircle className="w-3 h-3 text-white" strokeWidth={2.5} />
                              </motion.div>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-[10px] sm:text-[11px] leading-[1.4] text-foreground/50 dark:text-white/40 line-clamp-2 mb-2.5">
                            {service.description}
                          </p>

                          {/* Metadata */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#0A3269]/10 dark:border-white/5">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#0A3269]/40 dark:text-white/30" strokeWidth={2} />
                                <span className="text-[8px] sm:text-[9px] font-medium text-foreground/40 dark:text-white/30">
                                  {service.processingTime || 'Fast'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileCheck className="w-3 h-3 text-[#0A3269]/40 dark:text-white/30" strokeWidth={2} />
                                <span className="text-[8px] sm:text-[9px] text-foreground/40 dark:text-white/30">
                                  {service.requirements?.length || 0} docs
                                </span>
                              </div>
                            </div>
                            
                            {!isSelected && (
                              <span className="text-[7px] sm:text-[8px] font-medium text-[#0A3269]/50 dark:text-white/30 bg-[#0A3269]/10 dark:bg-white/5 px-2 py-0.5 rounded-full border border-[#0A3269]/15 dark:border-white/5 hover:bg-[#0A3269]/20 dark:hover:bg-white/10 transition-colors duration-200">
                                Select
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </TabsContent>

{/* Sponsor Information Tab - Modern Premium */}
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
      <div className="relative bg-white dark:bg-[#0A1628] border border-[#0A3269]/10 dark:border-white/5 rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] flex flex-col min-h-0 flex-1 overflow-hidden">
        {/* Decorative ambient glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[#0A3269]/5 dark:bg-[#0A3269]/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#0A3269]/5 dark:bg-[#0A3269]/10 blur-[100px]" />

        {/* Header */}
        <div className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-5 pb-2 sm:pb-3 border-b border-[#0A3269]/10 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#0A3269] shadow-[0_4px_12px_-4px_rgba(10,50,105,0.4)]">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2.25} />
              </div>
              <span className="text-sm sm:text-base font-semibold text-foreground/90 dark:text-white/90">
                {t('startApplication.sponsorInfo.title')}
              </span>
            </div>
            <Badge className="rounded-full bg-[#0A3269]/10 dark:bg-[#0A3269]/20 text-[#0A3269] dark:text-white/70 border border-[#0A3269]/15 dark:border-white/10 text-[8px] sm:text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5">
              {t('startApplication.sponsorInfo.required')}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-4 md:p-5 space-y-4 sm:space-y-5" style={{ scrollbarGutter: 'stable' }}>
    {/* Sponsor Type */}
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <div className="w-5 h-5 rounded-lg bg-[#0A3269]/10 dark:bg-[#0A3269]/20 flex items-center justify-center">
      <Users className="w-3 h-3 text-[#0A3269] dark:text-white/60" strokeWidth={2.5} />
    </div>
    <Label className={`text-xs sm:text-sm font-semibold text-foreground/80 dark:text-white/70 ${isRTL ? 'text-right block' : ''}`}>
      {t('startApplication.sponsorInfo.sponsorType')}
    </Label>
  </div>
  
  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
    {[
      { value: 'employee', label: t('startApplication.sponsorInfo.employee'), icon: Users },
      { value: 'investor', label: t('startApplication.sponsorInfo.investor'), icon: TrendingUp },
      { value: 'partner',  label: t('startApplication.sponsorInfo.partner'), icon: Handshake },
    ].map((type) => {
      const isActive = sponsorInfo.sponsorType === type.value
      const Icon = type.icon
      return (
        <motion.button
          key={type.value}
          type="button"
          onClick={() => setSponsorInfo(prev => ({ ...prev, sponsorType: type.value }))}
          whileTap={{ scale: 0.95 }}
          className={`relative group flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-[10px] sm:text-sm font-semibold transition-all duration-300 ${
            isActive
              ? 'bg-[#0A3269] text-white shadow-[0_4px_16px_-4px_rgba(10,50,105,0.4)]'
              : 'bg-[#0A3269]/5 dark:bg-[#0A3269]/10 text-foreground/60 dark:text-white/50 hover:bg-[#0A3269]/10 dark:hover:bg-[#0A3269]/20 hover:text-foreground/80 dark:hover:text-white/70'
          }`}
        >
          <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${
            isActive 
              ? 'text-white/90' 
              : 'text-[#0A3269]/40 dark:text-white/40 group-hover:text-[#0A3269]/60 dark:group-hover:text-white/60'
          }`} strokeWidth={2} />
          <span className="relative text-center">{type.label}</span>
          {isActive && (
            <motion.span 
              className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-white/60"
              layoutId="sponsor-indicator"
              transition={{ type: "spring", duration: 0.3 }}
            />
          )}
        </motion.button>
      )
    })}
  </div>
  
  <AnimatePresence mode="wait">
    <motion.p
      key={sponsorInfo.sponsorType}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
      className={`text-[10px] sm:text-xs text-foreground/50 dark:text-white/40 leading-relaxed flex items-start gap-1.5 ${isRTL ? 'text-right' : ''}`}
    >
      <span className="inline-block w-1 h-1 rounded-full bg-[#0A3269]/30 dark:bg-white/20 mt-1.5 shrink-0" />
      <span>
        {sponsorInfo.sponsorType === 'employee' && t('startApplication.sponsorInfo.employeeDesc')}
        {sponsorInfo.sponsorType === 'investor' && t('startApplication.sponsorInfo.investorDesc')}
        {sponsorInfo.sponsorType === 'partner'  && t('startApplication.sponsorInfo.partnerDesc')}
      </span>
    </motion.p>
  </AnimatePresence>
</div>

{/* Location */}
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <div className="w-5 h-5 rounded-lg bg-[#0A3269]/10 dark:bg-[#0A3269]/20 flex items-center justify-center">
      <MapPin className="w-3 h-3 text-[#0A3269] dark:text-white/60" strokeWidth={2.5} />
    </div>
    <Label className={`text-xs sm:text-sm font-semibold text-foreground/80 dark:text-white/70 ${isRTL ? 'text-right block' : ''}`}>
      {t('startApplication.sponsorInfo.location')}
    </Label>
  </div>
  
  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
    {[
      { value: 'inside',  label: t('startApplication.sponsorInfo.insideUae'), icon: Home },
      { value: 'outside', label: t('startApplication.sponsorInfo.outsideUae'), icon: Globe },
    ].map((loc) => {
      const isActive = sponsorInfo.location === loc.value
      const Icon = loc.icon
      return (
        <motion.button
          key={loc.value}
          type="button"
          onClick={() => setSponsorInfo(prev => ({ ...prev, location: loc.value }))}
          whileTap={{ scale: 0.95 }}
          className={`relative group flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-[10px] sm:text-sm font-semibold transition-all duration-300 ${
            isActive
              ? 'bg-[#0A3269] text-white shadow-[0_4px_16px_-4px_rgba(10,50,105,0.4)]'
              : 'bg-[#0A3269]/5 dark:bg-[#0A3269]/10 text-foreground/60 dark:text-white/50 hover:bg-[#0A3269]/10 dark:hover:bg-[#0A3269]/20 hover:text-foreground/80 dark:hover:text-white/70'
          }`}
        >
          <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${
            isActive 
              ? 'text-white/90' 
              : 'text-[#0A3269]/40 dark:text-white/40 group-hover:text-[#0A3269]/60 dark:group-hover:text-white/60'
          }`} strokeWidth={2} />
          <span className="relative">{loc.label}</span>
          {isActive && (
            <motion.span 
              className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-white/60"
              layoutId="location-indicator"
              transition={{ type: "spring", duration: 0.3 }}
            />
          )}
        </motion.button>
      )
    })}
  </div>
</div>

          {/* Processing Method */}
          <div className="space-y-2">
            <Label className={`text-xs sm:text-sm font-semibold text-foreground/80 dark:text-white/70 ${isRTL ? 'text-right block' : ''}`}>
              {t('startApplication.sponsorInfo.processingMethod')}
            </Label>
            <div className="space-y-2 sm:space-y-2.5">
              {[
                { 
                  value: 'tammat', 
                  label: t('startApplication.sponsorInfo.tammatProcessing'), 
                  description: t('startApplication.sponsorInfo.tammatDesc'),
                  price: 'AED 1,089',
                  benefits: [
                    t('startApplication.sponsorInfo.lowerFees'), 
                    t('startApplication.sponsorInfo.fasterResponse'), 
                    t('startApplication.sponsorInfo.uaePassIntegration'), 
                    t('startApplication.sponsorInfo.support247')
                  ],
                  recommended: true
                },
                { 
                  value: 'amer', 
                  label: t('startApplication.sponsorInfo.amerProcessing'), 
                  description: t('startApplication.sponsorInfo.amerDesc'),
                  price: 'AED 1,500',
                  benefits: [
                    t('startApplication.sponsorInfo.govDirect'), 
                    t('startApplication.sponsorInfo.officialChannels'), 
                    t('startApplication.sponsorInfo.standardProcessing')
                  ],
                  recommended: false
                }
              ].map((method) => {
                const isActive = sponsorInfo.processingMethod === method.value
                return (
                  <motion.div key={method.value} whileTap={{ scale: 0.98 }}>
                    <div
                      className={`relative cursor-pointer transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden border p-3 sm:p-4 ${
                        isActive
                          ? 'border-[#0A3269]/60 bg-[#0A3269]/5 dark:bg-[#0A3269]/10 shadow-[0_0_0_1px_rgba(10,50,105,0.2),0_8px_24px_-12px_rgba(10,50,105,0.15)]'
                          : 'border-[#0A3269]/15 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-[#0A3269]/20'
                      }`}
                      onClick={() => setSponsorInfo(prev => ({ ...prev, processingMethod: method.value }))}
                    >
                      {isActive && (
                        <div className="pointer-events-none absolute -top-6 -right-6 h-16 w-16 rounded-full bg-[#0A3269]/10 dark:bg-[#0A3269]/20 blur-2xl" />
                      )}
                      
                      <div className="relative space-y-2 sm:space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span className={`text-xs sm:text-sm font-semibold ${isActive ? 'text-[#0A3269] dark:text-white' : 'text-foreground/80 dark:text-white/70'}`}>
                                {method.label}
                              </span>
                              {method.recommended && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[7px] sm:text-[8px] font-semibold rounded-full px-1.5 sm:px-2 py-0.5">
                                  {t('startApplication.sponsorInfo.recommended')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[9px] sm:text-xs text-foreground/50 dark:text-white/40 mt-0.5 line-clamp-1">
                              {method.description}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className={`text-base sm:text-lg font-bold ${isActive ? 'text-[#0A3269] dark:text-white' : 'text-foreground/70 dark:text-white/60'}`}>
                              {method.price}
                            </div>
                            <div className="text-[8px] sm:text-[9px] text-foreground/40 dark:text-white/30">
                              {t('startApplication.sponsorInfo.processingFee')}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1.5 border-t border-[#0A3269]/10 dark:border-white/5">
                          {method.benefits.map((benefit, idx) => (
                            <span key={idx} className="flex items-center gap-1 text-[8px] sm:text-[9px] text-foreground/50 dark:text-white/40">
                              <CheckCircle className="w-2.5 h-2.5 text-[#0A3269] dark:text-white/30 shrink-0" strokeWidth={2.5} />
                              {benefit}
                            </span>
                          ))}
                        </div>

                        {isActive && (
                          <div className="absolute -top-3 -right-0.5 w-4 h-4 rounded-full bg-[#0A3269] flex items-center justify-center shadow-md shadow-[#0A3269]/30">
                            <CheckCircle className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Contact Information - WITH IBAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="sponsor-email" className={`text-[10px] sm:text-xs font-semibold text-foreground/70 dark:text-white/60 ${isRTL ? 'text-right block' : ''}`}>
                {t('startApplication.sponsorInfo.emailAddress')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30" />
                <Input
                  id="sponsor-email"
                  type="email"
                  placeholder="sponsor@ex.com"
                  value={sponsorInfo.email}
                  onChange={(e) => setSponsorInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-8 bg-[#0A3269]/5 dark:bg-[#0A3269]/10 border-[#0A3269]/15 focus:border-[#0A3269]/40 rounded-xl h-9 sm:h-10 text-xs sm:text-sm transition-all duration-300"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sponsor-phone" className={`text-[10px] sm:text-xs font-semibold text-foreground/70 dark:text-white/60 ${isRTL ? 'text-right block' : ''}`}>
                {t('startApplication.sponsorInfo.phoneNumber')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30" />
                <Input
                  id="sponsor-phone"
                  type="tel"
                  placeholder="+971 50 123 4567"
                  value={sponsorInfo.phone}
                  onChange={(e) => setSponsorInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="pl-8 bg-[#0A3269]/5 dark:bg-[#0A3269]/10 border-[#0A3269]/15 focus:border-[#0A3269]/40 rounded-xl h-9 sm:h-10 text-xs sm:text-sm transition-all duration-300"
                />
              </div>
            </div>
            {/* IBAN Number - Shows for Investor and Partner */}
            {(sponsorInfo.sponsorType === 'investor' || sponsorInfo.sponsorType === 'partner') && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="sponsor-iban" className={`text-[10px] sm:text-xs font-semibold text-foreground/70 dark:text-white/60 ${isRTL ? 'text-right block' : ''}`}>
                  {t('startApplication.sponsorInfo.ibanNumber')} <span className="text-amber-500 font-medium">{t('startApplication.sponsorInfo.optional')}</span>
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30" />
                  <Input
                    id="sponsor-iban"
                    type="text"
                    placeholder="AE12345678901234567890"
                    value={sponsorInfo.iban}
                    onChange={(e) => setSponsorInfo(prev => ({ ...prev, iban: e.target.value }))}
                    className="pl-8 bg-[#0A3269]/5 dark:bg-[#0A3269]/10 border-[#0A3269]/15 focus:border-[#0A3269]/40 rounded-xl h-9 sm:h-10 text-xs sm:text-sm transition-all duration-300"
                  />
                </div>
              </div>
            )}
          </div>

{/* Document Requirements Preview - Modern */}
{sponsorInfo.sponsorType && (
  <div className="space-y-3">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#0A3269]/10 to-[#1a4a7a]/10 dark:from-[#0A3269]/20 dark:to-[#1a4a7a]/20 flex items-center justify-center">
        <FileCheck className="w-3.5 h-3.5 text-[#0A3269] dark:text-white/60" strokeWidth={2.5} />
      </div>
      <Label className={`text-xs sm:text-sm font-semibold text-foreground/90 dark:text-white/80 ${isRTL ? 'text-right block' : ''}`}>
        {t('startApplication.sponsorInfo.docRequirementsPreview')}
      </Label>
      <Badge className="ml-auto bg-[#0A3269]/10 text-[#0A3269] dark:text-white/60 border border-[#0A3269]/15 text-[8px] font-medium rounded-full px-2 py-0.5">
        {sponsorInfo.sponsorType === 'employee' ? '6' : '6'} docs
      </Badge>
    </div>
    
    <div className="bg-gradient-to-br from-[#0A3269]/5 via-[#0A3269]/3 to-transparent dark:from-[#0A3269]/10 dark:via-[#0A3269]/5 dark:to-transparent border border-[#0A3269]/15 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_4px_16px_-8px_rgba(10,50,105,0.06)] dark:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.3)]">
      <div className="flex items-start gap-2.5">
        <p className="text-[10px] sm:text-xs text-foreground/60 dark:text-white/40 leading-relaxed">
          {t('startApplication.sponsorInfo.basedOnSelection')} 
          <span className="inline-flex items-center gap-1.5 mx-1">
            <span className="px-2 py-0.5 rounded-md bg-[#0A3269]/10 dark:bg-[#0A3269]/20 text-[#0A3269] dark:text-white/80 font-semibold text-[9px] sm:text-[10px] uppercase tracking-wide">
              {sponsorInfo.sponsorType}
            </span>
          </span>
          {t('startApplication.sponsorInfo.youWillNeed')}:
        </p>
      </div>
      
      {/* Document Items - 2 columns on mobile, auto on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
        {[
          { icon: Camera, label: t('startApplication.sponsorInfo.studioPhoto') },
          { icon: FileText, label: t('startApplication.sponsorInfo.passportCopy') },
          { icon: File, label: t('startApplication.sponsorInfo.passportCoverPage') },
          ...(sponsorInfo.sponsorType === 'employee' 
            ? [{ icon: Building, label: t('startApplication.sponsorInfo.mohreApproval') }]
            : [{ icon: Building2, label: t('startApplication.sponsorInfo.tradeLicenseEst') }]
          ),
          { icon: IdCard, label: t('startApplication.sponsorInfo.nationalId') }
        ].map((item, idx) => {
          const IconComponent = item.icon
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ 
                scale: 1.03,
                transition: { type: "spring", stiffness: 400, damping: 17 }
              }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-2 p-2.5 rounded-xl bg-white/90 dark:bg-[#0A3269]/15 backdrop-blur-sm border border-[#0A3269]/8 dark:border-[#0A3269]/20 shadow-sm hover:shadow-md hover:border-[#0A3269]/25 dark:hover:border-[#0A3269]/35 transition-all duration-200 cursor-default"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0A3269]/10 to-[#0A3269]/5 dark:from-[#0A3269]/30 dark:to-[#0A3269]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                <IconComponent className="w-3.5 h-3.5 text-[#0A3269] dark:text-white/50 group-hover:text-[#0A3269]/80 dark:group-hover:text-white/80 transition-colors duration-200" strokeWidth={2} />
              </div>
              <span className="text-[8px] sm:text-[10px] font-medium text-foreground/60 dark:text-white/50 group-hover:text-foreground/80 dark:group-hover:text-white/70 leading-tight line-clamp-2">
                {item.label}
              </span>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#0A3269]/10 dark:border-white/5 flex items-center justify-between">
        <span className="text-[8px] sm:text-[9px] text-foreground/40 dark:text-white/30">
          {t('startApplication.sponsorInfo.totalDocuments') || 'All documents required'}
        </span>
        <Badge className="bg-[#0A3269]/10 dark:bg-[#0A3269]/20 text-[#0A3269] dark:text-white/60 border-none text-[8px] sm:text-[9px] font-medium px-2.5 py-0.5">
          {sponsorInfo.sponsorType === 'employee' ? '6' : '6'} items
        </Badge>
      </div>
    </div>
  </div>
)}

{/* Document Upload - Modern with Green Status Indicators */}
{docDefs.length > 0 && (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="relative w-7 h-7 rounded-xl bg-gradient-to-br from-[#0A3269]/10 to-[#1a4a7a]/10 dark:from-[#0A3269]/20 dark:to-[#1a4a7a]/20 flex items-center justify-center group hover:scale-110 transition-transform duration-300">
          <Upload className="w-3.5 h-3.5 text-[#0A3269] dark:text-white/60 group-hover:text-[#0A3269] dark:group-hover:text-white transition-colors duration-300" strokeWidth={2.25} />
          {Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[8px] font-bold text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              {Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length}
            </span>
          )}
        </div>
        <div>
          <Label className={`text-xs sm:text-sm font-semibold text-foreground/90 dark:text-white/80 ${isRTL ? 'text-right block' : ''}`}>
            {t('applications.requiredDocuments')}
          </Label>
          <p className="text-[9px] sm:text-[10px] text-foreground/40 dark:text-white/30">
            {Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length} of {docDefs.filter(d => d.required).length} uploaded
          </p>
        </div>
      </div>
      
      <Badge className={`text-[8px] sm:text-[9px] font-medium rounded-full px-2.5 py-1 transition-all duration-300 ${
        Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length === docDefs.filter(d => d.required).length
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-[0_2px_8px_-4px_rgba(16,185,129,0.2)]'
          : Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length > 0
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25'
            : 'bg-[#0A3269]/10 text-[#0A3269]/50 dark:text-white/30 border border-[#0A3269]/15'
      }`}>
        {Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length === docDefs.filter(d => d.required).length
          ? '✅ Complete'
          : Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length > 0
            ? `${Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length}/${docDefs.filter(d => d.required).length}`
            : 'Pending'
        }
      </Badge>
    </div>

    <div className="rounded-2xl border border-[#0A3269]/15 dark:border-white/10 overflow-hidden bg-white dark:bg-[#0A1628] shadow-[0_4px_16px_-8px_rgba(10,50,105,0.06)] dark:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.3)] transition-shadow duration-300 hover:shadow-[0_8px_24px_-12px_rgba(10,50,105,0.08)] dark:hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)]">
      <DocumentManager
        documents={docDefs}
        uploadedDocuments={uploadedDocuments}
        onUpload={handleDocumentUpload}
        onDelete={handleDocumentDelete}
      />
    </div>

    {/* Upload Status Summary */}
    {Object.values(uploadedDocuments).length > 0 && (
      <div className="flex flex-wrap items-center gap-4 px-1 pt-1">
        <div className="flex items-center gap-1.5 group cursor-default">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_2px_4px_-2px_rgba(16,185,129,0.4)] group-hover:scale-125 transition-transform duration-300" />
          <span className="text-[8px] sm:text-[9px] text-foreground/40 dark:text-white/30 group-hover:text-foreground/60 dark:group-hover:text-white/50 transition-colors duration-300">
            {Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length} uploaded
          </span>
        </div>
        {Object.values(uploadedDocuments).filter(doc => doc.status === 'uploading').length > 0 && (
          <div className="flex items-center gap-1.5 group cursor-default">
            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_2px_4px_-2px_rgba(245,158,11,0.4)] animate-pulse group-hover:scale-125 transition-transform duration-300" />
            <span className="text-[8px] sm:text-[9px] text-foreground/40 dark:text-white/30 group-hover:text-foreground/60 dark:group-hover:text-white/50 transition-colors duration-300">
              {Object.values(uploadedDocuments).filter(doc => doc.status === 'uploading').length} uploading
            </span>
          </div>
        )}
        {Object.values(uploadedDocuments).filter(doc => doc.status === 'error').length > 0 && (
          <div className="flex items-center gap-1.5 group cursor-default">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_2px_4px_-2px_rgba(239,68,68,0.4)] group-hover:scale-125 transition-transform duration-300" />
            <span className="text-[8px] sm:text-[9px] text-foreground/40 dark:text-white/30 group-hover:text-foreground/60 dark:group-hover:text-white/50 transition-colors duration-300">
              {Object.values(uploadedDocuments).filter(doc => doc.status === 'error').length} failed
            </span>
          </div>
        )}
        <span className="text-[8px] sm:text-[9px] text-foreground/30 dark:text-white/20">
          {docDefs.filter(d => d.required).length} required
        </span>
      </div>
    )}
  </div>
)}

{/* Navigation Buttons - Modern */}
<div className="pt-3 sm:pt-4 space-y-2.5 sticky bottom-0 bg-gradient-to-t from-white dark:from-[#0A1628] via-white/95 dark:via-[#0A1628]/95 to-transparent -mx-3 sm:-mx-4 px-3 sm:px-4 py-3.5 border-t border-[#0A3269]/10 dark:border-white/5 backdrop-blur-sm">
<button
  onClick={() => {
    setProgress(80)
    setActiveTab('review-submit')
  }}
  disabled={!canNavigateToNext()}
  className={`relative w-full flex items-center justify-center gap-2 rounded-xl h-10 sm:h-12 font-semibold text-sm sm:text-base transition-all duration-300 overflow-hidden group ${
    canNavigateToNext()
      ? 'bg-gradient-to-r from-[#0A3269] to-[#1a4a7a] text-white shadow-[0_8px_24px_-8px_rgba(10,50,105,0.4)] hover:shadow-[0_12px_30px_-10px_rgba(10,50,105,0.5)] hover:scale-[1.02] active:scale-[0.97]'
      : 'bg-[#0A3269]/20 text-white/50 cursor-not-allowed'
  }`}
>
  {/* Shimmer Effect */}
  {canNavigateToNext() && (
    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
  )}
  
  {/* Hover Glow Effect */}
  {canNavigateToNext() && (
    <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/10 blur-xl" />
  )}
  
  <span className="relative z-10 flex items-center gap-2">
    {t('common.continue')}
    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
  </span>
</button>
  
  <div className="flex justify-center">
    <button
      onClick={goToPreviousTab}
      className="text-xs sm:text-sm text-foreground/50 dark:text-white/40 hover:text-foreground dark:hover:text-white transition-colors duration-300 flex items-center gap-1 group"
    >
      <ChevronRight className="w-4 h-4 inline rotate-180 transition-transform duration-300 group-hover:-translate-x-0.5" />
      {t('common.back')}
    </button>
  </div>
</div>
        </div>
      </div>
    </motion.div>
  </AnimatePresence>
</TabsContent>                
                {/* Live Assist Tab — kept for socket compatibility but hidden from stepper */}
                <TabsContent value="live-assist" className="mt-0 h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <Card className="bg-background border-primary/30 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-[#a47112] flex items-center text-base">
                          <MessageSquare className="w-4 h-4 mr-2 text-[#a47112]" />
                          Live Assistance
                          <Badge className="ml-2 bg-primary/10 text-primary border-primary/30 text-xs">
                            {amerConnected ? 'Officer Online' : 'AI Active'}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 max-h-[24rem] overflow-y-scroll">
                        {/* Enhanced Connection Options with Status */}
                        <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <Button
                            onClick={() => { setChatMode('ai'); setAmerConnected(false) }}
                            className={`${chatMode === 'ai' ? 'bg-primary text-white' : 'bg-surface text-foreground border border-primary/30'} hover:bg-primary hover:text-white`}
                          >
                            <Brain className="w-3 h-3 mr-1" />
                            AI
                          </Button>
                          <Button
                            onClick={() => { setChatMode('amer'); requestAmer() }}
                              disabled={connectionStatus === 'requesting' || connectionStatus === 'pending'}
                              className={`${chatMode === 'amer' || connectionStatus === 'connected' ? 'bg-primary text-white' : 'bg-surface text-foreground border border-primary/30'} hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <User className="w-3 h-3 mr-1" />
                              {connectionStatus === 'requesting' ? 'Requesting...' : 
                               connectionStatus === 'pending' ? 'Pending...' :
                               connectionStatus === 'connected' ? 'Connected' : 'Officer'}
                          </Button>
                          <Button
                            onClick={() => { setChatMode('voice'); toast('Voice call feature coming soon!') }}
                            className={`${chatMode === 'voice' ? 'bg-primary text-white' : 'bg-surface text-foreground border border-primary/30'} hover:bg-primary hover:text-white`}
                          >
                            <PhoneCall className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                          </div>

                          {/* Connection Status Indicator */}
                          {connectionStatus !== 'idle' && (
                            <div className={`p-3 rounded-lg border text-sm ${
                              connectionStatus === 'connected' ? 'bg-accent/10 border-accent/30 text-green-700' :
                              connectionStatus === 'pending' ? 'bg-warning/10 border-warning/30 text-yellow-700' :
                              connectionStatus === 'requesting' ? 'bg-primary/10 border-primary/30 text-blue-700' :
                              connectionStatus === 'no_officers' ? 'bg-error/10 border-error/30 text-red-700' :
                              'bg-surface-light border-border text-foreground'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    connectionStatus === 'connected' ? 'bg-accent/100 animate-pulse' :
                                    connectionStatus === 'pending' ? 'bg-warning/100 animate-pulse' :
                                    connectionStatus === 'requesting' ? 'bg-primary/100 animate-pulse' :
                                    'bg-error/100'
                                  }`}></div>
                                  <span className="font-medium text-accent">
                                    {connectionStatus === 'connected' && officerInfo ? `Connected to ${officerInfo.name}` :
                                     connectionStatus === 'pending' ? 'Waiting for officer approval...' :
                                     connectionStatus === 'requesting' ? 'Sending request...' :
                                     connectionStatus === 'no_officers' ? 'No officers available' :
                                     'Unknown status'}
                                  </span>
                                </div>
                                {connectionStatus === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelRequest}
                                    className="text-xs h-6 px-2"
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Live Guidance */}
                        {liveGuidance.length > 0 && (
                          <div className="bg-primary/5 border border-primary/30 rounded-lg p-4">
                            <h3 className="text-secondary font-medium mb-2">Live Guidance</h3>
                            <div className="space-y-1">
                              {liveGuidance.map((guide, idx) => (
                                <div key={idx} className="text-sm text-foreground flex items-center">
                                  <ChevronRight className="w-3 h-3 mr-1 text-primary" />
                                  {guide}
                                </div>
                      ))}
                    </div>
                    </div>
                  )}

                        <div className="space-y-3">
                          <Button
                            onClick={goToNextTab}
                            disabled={!canNavigateToNext()}
                            className="w-full bg-primary text-white hover:bg-primary/90 shadow-sm"
                          >
                            Next: Review & Submit <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                          <div className="flex justify-center">
                            <Button
                              variant="outline"
                              onClick={goToPreviousTab}
                              className="text-sm"
                            >
                              ← Back to Documents
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

    {/* Review & Submit Tab - Modern Premium */}
<TabsContent value="review-submit" className="mt-0 flex flex-col min-h-0 flex-1">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col min-h-0 flex-1"
  >
    <Card className="relative bg-gradient-to-br from-[#0A3269]/5 via-background to-[#0A3269]/5 border border-[#0A3269]/15 dark:border-white/10 shadow-[0_8px_30px_-12px_rgba(10,50,105,0.12)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] flex flex-col min-h-0 flex-1 rounded-2xl sm:rounded-3xl overflow-hidden">
      {/* Decorative ambient glows */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-gradient-to-br from-[#0A3269]/10 to-[#1a4a7a]/5 blur-[80px] sm:blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-gradient-to-tr from-[#0A3269]/8 to-[#1a4a7a]/5 blur-[80px] sm:blur-[120px]" />

      <CardHeader className="shrink-0 pb-3 sm:pb-4 relative border-b border-[#0A3269]/10 dark:border-white/5 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold">
            <span className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0A3269] to-[#1a4a7a] shadow-[0_6px_20px_-6px_rgba(10,50,105,0.4)]">
              <Rocket className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white" strokeWidth={2.25} />
            </span>
            <span className="text-foreground/90 dark:text-white/90 text-sm sm:text-base">
              {t('startApplication.reviewSubmit.title') || 'Review & Submit'}
            </span>
          </CardTitle>
          <Badge className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[8px] sm:text-[10px] font-semibold px-2 sm:px-3 py-1 sm:py-1.5 shadow-[0_2px_8px_-4px_rgba(16,185,129,0.15)] self-start sm:self-auto">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t('startApplication.reviewSubmit.readyToSubmit') || 'Ready to Submit'}
          </Badge>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
          <div className="flex-1 h-1 sm:h-1.5 rounded-full bg-[#0A3269]/10 dark:bg-white/10 overflow-hidden">
            <motion.div 
              className="h-full rounded-full bg-gradient-to-r from-[#0A3269] to-[#1a4a7a]"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>
          <span className="text-[8px] sm:text-[10px] font-medium text-foreground/40 dark:text-white/30 whitespace-nowrap">
            Ready to Submit
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-5" style={{ scrollbarGutter: 'stable' }}>
        {/* Application Summary - Modern Grid with Icons */}
        <div className="bg-gradient-to-br from-white/80 to-[#0A3269]/5 dark:from-[#0A1628] dark:to-[#0A3269]/10 border border-[#0A3269]/12 dark:border-white/8 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-[0_2px_12px_-6px_rgba(10,50,105,0.06)]">
          <h3 className="text-[#0A3269] dark:text-white/90 font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#0A3269]/10 dark:bg-[#0A3269]/20 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0A3269] dark:text-white/60" strokeWidth={2.5} />
            </div>
            Application Summary
          </h3>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {[
              { label: 'Service Selected', value: selected?.name || 'Not selected', icon: Briefcase },
              { label: 'Sponsor Type', value: sponsorInfo.sponsorType?.charAt(0).toUpperCase() + sponsorInfo.sponsorType?.slice(1) || 'Not selected', icon: Users },
              { label: 'Contact Email', value: sponsorInfo.email || 'Not provided', icon: Mail },
              { label: 'Phone Number', value: sponsorInfo.phone || 'Not provided', icon: Phone },
              { label: 'Documents Uploaded', value: `${Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length}/${docDefs.filter(doc => doc.required).length}`, icon: FileText },
              { label: 'Processing Time', value: '1-3 business days', icon: Clock },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div 
                  key={idx}
                  className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/50 dark:bg-white/5 border border-[#0A3269]/8 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all duration-200"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#0A3269]/8 dark:bg-[#0A3269]/15 flex items-center justify-center shrink-0">
                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0A3269]/50 dark:text-white/40" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] sm:text-[10px] font-medium text-foreground/40 dark:text-white/30">{item.label}</p>
                    <p className="text-[11px] sm:text-sm font-semibold text-foreground/80 dark:text-white/70 truncate">{item.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Application Fee & Status - Premium Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-4">
          <div className="bg-gradient-to-br from-[#0A3269]/10 to-[#1a4a7a]/5 dark:from-[#0A3269]/20 dark:to-[#1a4a7a]/10 border border-[#0A3269]/15 dark:border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#0A3269]/15 dark:bg-[#0A3269]/30 flex items-center justify-center">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A3269] dark:text-white/80" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] font-medium text-foreground/40 dark:text-white/30">Application Fee</p>
                <p className="text-base sm:text-xl font-bold text-[#0A3269] dark:text-white/90">AED {applicationFee || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/15 dark:bg-emerald-500/30 flex items-center justify-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] font-medium text-foreground/40 dark:text-white/30">Status</p>
                <Badge className="mt-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-semibold">
                  All Requirements Met
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Document Checklist - Modern Compact */}
        <div className="bg-gradient-to-br from-white/80 to-[#0A3269]/5 dark:from-[#0A1628] dark:to-[#0A3269]/10 border border-[#0A3269]/12 dark:border-white/8 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-[0_2px_12px_-6px_rgba(10,50,105,0.06)]">
          <h3 className="text-[#0A3269] dark:text-white/90 font-bold mb-2 sm:mb-3 flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#0A3269]/10 dark:bg-[#0A3269]/20 flex items-center justify-center">
              <FileCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0A3269] dark:text-white/60" strokeWidth={2.5} />
            </div>
            Document Checklist
            <span className="ml-auto text-[8px] sm:text-[10px] font-medium text-foreground/40 dark:text-white/30">
              {Object.values(uploadedDocuments).filter(doc => doc.status === 'uploaded').length} of {docDefs.length} uploaded
            </span>
          </h3>
          <div className="space-y-1 sm:space-y-1.5">
            {docDefs.map((doc) => {
              const uploadedDoc = uploadedDocuments[doc.id]
              const isUploaded = uploadedDoc?.status === 'uploaded'
              return (
                <div 
                  key={doc.id} 
                  className={`flex flex-col xs:flex-row xs:items-center justify-between gap-1 xs:gap-0 py-2 sm:py-2.5 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl transition-all duration-200 ${
                    isUploaded 
                      ? 'bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-500/15' 
                      : 'bg-[#0A3269]/5 dark:bg-[#0A3269]/10 border border-[#0A3269]/8 dark:border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isUploaded 
                        ? 'bg-emerald-500/20 text-emerald-500' 
                        : 'bg-[#0A3269]/10 dark:bg-[#0A3269]/20 text-[#0A3269]/30 dark:text-white/20'
                    }`}>
                      {isUploaded ? (
                        <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={2.5} />
                      ) : (
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={2} />
                      )}
                    </div>
                    <span className={`text-[10px] sm:text-sm font-medium truncate ${
                      isUploaded 
                        ? 'text-emerald-700 dark:text-emerald-400' 
                        : 'text-foreground/50 dark:text-white/40'
                    }`}>
                      {doc.label}
                    </span>
                    {doc.required && (
                      <Badge className="bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/15 text-[7px] sm:text-[8px] font-semibold rounded-full px-1 sm:px-1.5 py-0">
                        Required
                      </Badge>
                    )}
                  </div>
                  <span className={`text-[8px] sm:text-[10px] font-medium whitespace-nowrap ml-0 xs:ml-2 ${
                    isUploaded 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-foreground/30 dark:text-white/20'
                  }`}>
                    {isUploaded ? 'Uploaded' : 'Pending'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Payment Section - Modern Card */}
        {!paymentCompleted && (
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-amber-500/10 border border-amber-500/20 dark:border-amber-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-[0_2px_12px_-6px_rgba(245,158,11,0.06)]">
            <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" strokeWidth={2.5} />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-foreground/80 dark:text-white/80">Complete Payment</h3>
            </div>
            <StripePaymentForm
              amount={applicationFee}
              currency="aed"
              applicationId={applicationId || undefined}
              onSuccess={(_paymentResult) => {
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
        )}

        {paymentCompleted && (
          <div 
            className="bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/10 border border-emerald-500/25 dark:border-emerald-500/25 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-[0_4px_16px_-8px_rgba(16,185,129,0.15)]"
          >
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm sm:text-base">Payment Completed Successfully</p>
                <p className="text-xs sm:text-sm text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">AED {applicationFee} processed via test payment</p>
              </div>
            </div>
          </div>
        )}

     {/* Final Checks - Modern Compact */}
<div className="bg-gradient-to-br from-[#0A3269]/5 to-[#1a4a7a]/5 dark:from-[#0A3269]/15 dark:to-[#1a4a7a]/10 border border-[#0A3269]/12 dark:border-white/8 rounded-xl sm:rounded-2xl p-3 sm:p-5">
  <h3 className="text-[#0A3269] dark:text-white/90 font-bold mb-2 sm:mb-3 flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm">
    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#0A3269]/10 dark:bg-[#0A3269]/20 flex items-center justify-center">
      <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0A3269] dark:text-white/60" strokeWidth={2.5} />
    </div>
    Final Checks
  </h3>
  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
    {[
      { label: 'All required documents uploaded' },
      { label: 'AI validation passed' },
      { label: 'Eligibility confirmed' },
    ].map((item, idx) => (
      <div 
        key={idx}
        className="flex items-center gap-2 sm:gap-2.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-white/50 dark:bg-white/5 border border-[#0A3269]/8 dark:border-white/5"
      >
        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500" strokeWidth={2.5} />
        </div>
        <span className="text-[9px] sm:text-xs font-medium text-foreground/70 dark:text-white/60">{item.label}</span>
      </div>
    ))}
  </div>
</div>
{/* ✅ TMMT Golden Guarantee Card - Compact & Responsive */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.2 }}
  className="mt-2"
>
  <div className="relative rounded-xl border border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-br from-amber-50/80 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/10 p-2 sm:p-3 md:p-4 shadow-[0_4px_16px_-8px_rgba(245,158,11,0.08)]">
    <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 md:gap-3">
      {/* Icon */}
      <div className="p-1 sm:p-1.5 md:p-2 rounded-lg sm:rounded-xl bg-amber-500/20 border border-amber-500/20 flex-shrink-0">
        <Award className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-black dark:text-white text-xs sm:text-sm md:text-base flex flex-wrap items-center gap-1 sm:gap-1.5">
          {isRTL ? 'الضمان الذهبي من TMMT' : 'TMMT Golden Guarantee'}
          <Badge className="bg-amber-500 text-white text-[6px] sm:text-[7px] md:text-[8px] px-1 sm:px-1.5 md:px-2 py-0.5 rounded-full font-light border-0">
            ✓ Trusted
          </Badge>
        </h4>
        <p className="text-[9px] sm:text-xs md:text-sm text-gray-600 dark:text-white/60 leading-relaxed mt-0.5 max-w-2xl font-light">
          {isRTL 
            ? 'إذا حدث خطأ بسبب TMMT، سنقوم بتصحيحه دون أي رسوم خدمة إضافية وفقاً لسياسة الضمان الخاصة بنا.'
            : 'If an issue is caused by TMMT, we will correct it at no additional service fee according to our guarantee policy.'}
        </p>
        <button 
          className="text-[8px] sm:text-[9px] md:text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline-offset-2 hover:underline transition-colors mt-0.5 font-medium inline-flex items-center gap-1"
          onClick={() => window.open('/legal#guarantee', '_blank')}
        >
          {isRTL ? 'اقرأ المزيد عن الضمان →' : 'Read more about the guarantee →'}
          <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
      </div>
    </div>
  </div>
</motion.div>

{/* Action Buttons - Modern Premium */}
<div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
  <button
    onClick={async () => {
      const ok = await createApplicationAndUpload();
      if (!ok) return;
      setProgress(100);
      toast.success('Application submitted successfully!');
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    }}
    disabled={!paymentCompleted}
    className={`relative w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-[15px] transition-all duration-300 overflow-hidden ${
      paymentCompleted
        ? 'bg-gradient-to-r from-[#0A3269] to-[#1a4a7a] text-white shadow-[0_10px_30px_-10px_rgba(10,50,105,0.5)] hover:shadow-[0_14px_40px_-12px_rgba(10,50,105,0.6)] cursor-pointer'
        : 'bg-[#E8ECF0] dark:bg-white/10 text-[#9AA5B1] dark:text-white/30 cursor-not-allowed'
    }`}
  >
    {paymentCompleted && (
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
    )}
    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-2.5">
      {paymentCompleted ? (
        <>
          <Rocket className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" strokeWidth={2.25} />
          <span>Submit Application</span>
        </>
      ) : (
        <>
          <Lock className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" strokeWidth={2} />
          <span>Complete Payment First</span>
        </>
      )}
    </span>
  </button>
  
  <div className="flex justify-center">
    <button
      onClick={goToPreviousTab}
      className="group text-[10px] sm:text-xs md:text-sm text-foreground/40 dark:text-white/30 hover:text-foreground/70 dark:hover:text-white/60 transition-all duration-300 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-[#0A3269]/5 dark:hover:bg-white/5"
    >
      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-0.5" />
      {t('common.back') || 'Back'}
    </button>
  </div>
</div>
      </CardContent>
    </Card>
  </motion.div>
</TabsContent>
          </div>

      {/* Enhanced AI Chat Panel - Modern Premium */}
{!isChatCollapsed && (
  <div className="lg:col-span-4 flex flex-col bg-gradient-to-br from-[#0A3269]/5 via-background to-[#0A3269]/5 border border-[#0A3269]/20 rounded-2xl overflow-hidden shadow-[0_8px_30px_-12px_rgba(10,50,105,0.12)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] min-h-[280px] lg:min-h-0"
  >
    {/* Chat Header */}
    <div className="p-3 sm:p-4 lg:p-5 border-b border-[#0A3269]/15 bg-gradient-to-r from-[#0A3269]/5 to-transparent">
      {/* Chat Header with Collapse Button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-[#0A3269] dark:text-white font-medium flex items-center text-sm sm:text-base">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-[#0A3269] dark:text-white/80" />
            {connectionStatus === 'connected' && officerInfo ? officerInfo.name : 'Smart Assistant'}
          </div>
          <div className="text-xs text-[#64748B] dark:text-white/40">
            {connectionStatus === 'connected' ? 'Live Amer Officer Support' :
             connectionStatus === 'pending' ? 'Waiting for officer...' :
             connectionStatus === 'requesting' ? 'Requesting officer...' :
             'AI-powered guidance & real-time support'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* UAE Pass Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={requestUaePass}
            disabled={!user || uaePassStatus === 'requesting'}
            className={`border-[#0A3269]/20 text-xs px-2.5 py-1.5 h-8 rounded-xl transition-all duration-300 ${
              uaePassStatus === 'authorized' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                : 'text-[#0A3269] hover:bg-[#0A3269]/10 dark:text-white/60 dark:hover:text-white'
            }`}
            title="Access UAE Government Services"
          >
            <Globe className="w-3.5 h-3.5 mr-1.5" />
            {uaePassStatus === 'authorized' ? 'Connected' : 
             uaePassStatus === 'requesting' ? 'Connecting...' : 'UAE Pass'}
            {uaePassStatus === 'requesting' && <span className="animate-pulse ml-1">...</span>}
          </Button>
          
          {/* Collapse Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsChatCollapsed(true)}
            className="text-[#64748B] hover:text-[#0A3269] dark:text-white/40 dark:hover:text-white hover:bg-[#0A3269]/10 dark:hover:bg-white/10 h-8 w-8 p-0 rounded-xl transition-all duration-300"
            title="Minimize chat panel"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      {/* Chat Mode Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setChatMode('ai')}
            size="sm"
            className={`${
              chatMode === 'ai' 
                ? 'bg-[#0A3269] text-white shadow-[0_4px_12px_-4px_rgba(10,50,105,0.3)]' 
                : 'bg-transparent text-[#64748B] dark:text-white/50 border border-[#0A3269]/20 hover:bg-[#0A3269]/10 dark:hover:bg-white/10'
            } hover:bg-[#0A3269] hover:text-white flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl transition-all duration-300`}
          >
            <Brain className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">AI</span>
          </Button>
          <Button
            onClick={() => { setChatMode('amer'); requestAmer() }}
            size="sm"
            className={`${
              chatMode === 'amer' || connectionStatus === 'connected'
                ? 'bg-[#0A3269] text-white shadow-[0_4px_12px_-4px_rgba(10,50,105,0.3)]' 
                : 'bg-transparent text-[#64748B] dark:text-white/50 border border-[#0A3269]/20 hover:bg-[#0A3269]/10 dark:hover:bg-white/10'
            } hover:bg-[#0A3269] hover:text-white flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={connectionStatus === 'requesting' || connectionStatus === 'pending'}
          >
            <User className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">
              {connectionStatus === 'requesting' ? 'Requesting...' : 
               connectionStatus === 'pending' ? 'Pending...' :
               connectionStatus === 'connected' ? 'Connected' : 'Officer'}
            </span>
          </Button>
          <Button
            onClick={() => { setChatMode('voice'); toast('Voice call feature coming soon!') }}
            size="sm"
            className={`${
              chatMode === 'voice'
                ? 'bg-[#0A3269] text-white shadow-[0_4px_12px_-4px_rgba(10,50,105,0.3)]' 
                : 'bg-transparent text-[#64748B] dark:text-white/50 border border-[#0A3269]/20 hover:bg-[#0A3269]/10 dark:hover:bg-white/10'
            } hover:bg-[#0A3269] hover:text-white flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl transition-all duration-300`}
          >
            <PhoneCall className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Call</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Status Indicators */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
              connectionStatus === 'pending' ? 'bg-amber-500 animate-pulse' :
              connectionStatus === 'requesting' ? 'bg-[#0A3269] animate-pulse' :
              connectionStatus === 'no_officers' ? 'bg-red-500' :
              'bg-emerald-500 animate-pulse'
            }`}></div>
            <span className={`${
              connectionStatus === 'connected' ? 'text-emerald-600 dark:text-emerald-400 font-medium' :
              connectionStatus === 'pending' ? 'text-amber-600 dark:text-amber-400 font-medium' :
              connectionStatus === 'requesting' ? 'text-[#0A3269] dark:text-white/60 font-medium' :
              connectionStatus === 'no_officers' ? 'text-red-500 font-medium' :
              'text-[#0A3269] dark:text-white/60 font-medium'
            }`}>
              {connectionStatus === 'connected' ? `Connected to ${officerInfo?.name || 'Officer'}` :
               connectionStatus === 'pending' ? 'Awaiting officer...' :
               connectionStatus === 'requesting' ? 'Requesting...' :
               connectionStatus === 'no_officers' ? 'No officers available' :
               chatMode === 'ai' ? 'AI Ready' : 'Ready'}
            </span>
          </div>
          {slaCountdown && (
            <div className="flex items-center text-amber-500 dark:text-amber-400">
              <Clock className="w-3 h-3 mr-1" />
              <span className="font-medium">Response: {slaCountdown}</span>
            </div>
          )}
        </div>
      
      </div>
    </div>

    {/* Chat Messages */}
    <div 
      id="chat-messages-container"
      className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 space-y-3 bg-[#F8FAFC] dark:bg-[#0A3269]/5 min-h-0"
    >
      {/* Welcome Message */}
      {getCurrentChat().length === 0 && (
        <div className="bg-white/80 dark:bg-[#0A3269]/10 border border-[#0A3269]/15 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0A3269] dark:text-white/60 mr-2" />
            <span className="text-[#0A3269] dark:text-white/80 font-medium text-xs">{t('startApplication.chat.assistantActive')}</span>
          </div>  
          <p className="text-[#475569] dark:text-white/60 text-xs leading-relaxed">
            {t('startApplication.chat.welcomeMessage')} {selected?.name || t('startApplication.title')}, {t('startApplication.chat.requirementsOrProcessing')}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              "What documents do I need?",
              "How long will this take?",
              "Am I eligible?",
              "Connect me to an officer"
            ].map((suggestion) => (
              <Button
                key={suggestion}
                size="sm"
                variant="outline"
                onClick={() => setInput(suggestion)}
                className="text-[10px] border-[#0A3269]/20 text-[#475569] dark:text-white/60 bg-white dark:bg-transparent hover:bg-[#0A3269] hover:text-white shadow-sm h-7 px-3 rounded-xl transition-all duration-300"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Chat Messages */}
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
            <div className="flex justify-start pl-11 -mt-2 mb-4">
              <button
                onClick={() => {
                  setChatMode('amer')
                  requestAmer()
                }}
                className="px-4 py-2 rounded-xl bg-[#0A3269] text-white text-sm font-medium hover:bg-[#1a4a7a] transition-all duration-300 flex items-center gap-2 shadow-[0_4px_12px_-4px_rgba(10,50,105,0.3)]"
              >
                <Users className="w-4 h-4" />
                {t('startApplication.chat.suggestions.connectOfficer', 'Connect me to an officer')}
              </button>
            </div>
          )}
        </React.Fragment>
      ))}

      {/* Enhanced Typing Indicators */}
      {isAIStreaming && <TypingIndicator sender="TAMMAT AI" />}
      {isTyping && <TypingIndicator sender="Amer Officer" />}
    </div>

    {/* Enhanced Chat Input with Drag & Drop */}
    <div className="p-3 sm:p-4 border-t border-[#0A3269]/15 bg-white/80 dark:bg-[#0A3269]/5 flex-shrink-0">
      {/* File Drop Zone */}
      <div
        className={`mb-3 border-2 border-dashed rounded-xl p-3 text-center transition-all duration-300 ${
          isDragOver ? 'border-[#0A3269] bg-[#0A3269]/10' : 'border-[#0A3269]/15 hover:border-[#0A3269]/30'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragOver(false)
        }}
        onDrop={handleFileDrop}
      >
        <Upload className="w-4 h-4 mx-auto mb-1 text-[#64748B] dark:text-white/30" />
        <p className="text-[10px] text-[#64748B] dark:text-white/30">
          {isDragOver ? 'Drop files here' : 'Drag & drop files or images here'}
        </p>
      </div>

      {/* Message Input */}
      <div className="relative group">
        <div className="absolute -inset-0.5 rounded-xl opacity-0 group-focus-within:opacity-100 blur-md transition-opacity duration-300 bg-gradient-to-r from-[#0A3269] to-[#1a4a7a]" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (roomId && socket) socket.emit('typing_start', { roomId, userId: 'user' })
            if (e.key === 'Enter') {
              sendChat()
              if (roomId && socket) socket.emit('typing_stop', { roomId, userId: 'user' })
            }
          }}
          placeholder={!user ? "Please log in to start chatting" : "Ask about your application, requirements, or get live help..."}
          className="relative bg-white dark:bg-[#0A3269]/10 border-[#0A3269]/20 text-[#0A3269] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-white/30 focus:border-[#0A3269]/40 focus-visible:ring-[#0A3269]/20 rounded-xl pr-20 text-xs h-9 transition-all duration-300"
          disabled={!user}
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-0.5">
          {/* File Upload Button */}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 rounded-lg text-[#64748B] hover:text-[#0A3269] dark:text-white/40 dark:hover:text-white hover:bg-[#0A3269]/10 dark:hover:bg-white/10 transition-all duration-300"
            onClick={() => fileInputRef.current?.click()}
            disabled={!user || !roomId}
            title="Upload file"
          >
            <Upload className="w-3.5 h-3.5" />
          </Button>

          {/* Send Button */}
          <Button
            onClick={() => {
              sendChat()
              if (roomId && socket) socket.emit('typing_stop', { roomId, userId: 'user' })
            }}
            size="sm"
            className={`h-7 w-7 p-0 rounded-lg transition-all duration-300 ${
              !input.trim() || !user
                ? 'bg-[#E8ECF0] dark:bg-white/10 text-[#94A3B8] dark:text-white/20 cursor-not-allowed'
                : 'bg-[#0A3269] text-white hover:bg-[#1a4a7a] shadow-[0_4px_12px_-4px_rgba(10,50,105,0.3)]'
            }`}
            disabled={!input.trim() || !user}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />

      <div className="mt-2 flex items-center justify-between text-[10px] text-[#64748B] dark:text-white/30">
        <span>
          {!user ? 'Please log in to start chatting' : 'Powered by advanced AI • Real-time assistance'}
        </span>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-5 px-1.5 text-[10px] rounded-lg text-[#64748B] hover:text-[#0A3269] dark:text-white/30 dark:hover:text-white hover:bg-[#0A3269]/10 dark:hover:bg-white/10 transition-all duration-300" disabled={!user}>
            <Camera className="w-3 h-3 mr-1" />
          </Button>
          <Button size="sm" variant="ghost" className="h-5 px-1.5 text-[10px] rounded-lg text-[#64748B] hover:text-[#0A3269] dark:text-white/30 dark:hover:text-white hover:bg-[#0A3269]/10 dark:hover:bg-white/10 transition-all duration-300" disabled={!user}>
            <Mic className="w-3 h-3 mr-1" />
          </Button>
        </div>
      </div>
    </div>
  </div>
)}
  
{/* Floating Chat Toggle Button - Modern */}
{isChatCollapsed && (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    className="fixed bottom-6 right-6 z-50"
  >
    <Button
      onClick={() => setIsChatCollapsed(false)}
      className="bg-[#0A3269] text-white hover:bg-[#1a4a7a] shadow-[0_8px_30px_-12px_rgba(10,50,105,0.4)] hover:shadow-[0_12px_40px_-16px_rgba(10,50,105,0.5)] rounded-full w-14 h-14 p-0 transition-all duration-300 hover:scale-105 active:scale-95"
      title="Open chat panel"
    >
      <MessageSquare className="w-6 h-6" />
    </Button>
    {connectionStatus === 'connected' && (
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0A3269] animate-pulse shadow-lg shadow-emerald-500/30" />
    )}
  </motion.div>
)}              
            </div>
          </Tabs>
        </div>

      </DialogContent>
    </Dialog>
  )
}