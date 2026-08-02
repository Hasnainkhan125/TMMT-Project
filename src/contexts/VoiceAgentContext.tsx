'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from 'react'
import { useConversation } from '@elevenlabs/react'
import { toast } from 'sonner'

// ============================================================================
// Types
// ============================================================================

export interface VoiceAgentService {
  id: string
  name: string
  category?: string
  description?: string
  processingTime?: string
}

export interface VoiceAgentState {
  // Dialog state
  isDialogOpen: boolean
  selectedService: VoiceAgentService | null
  serviceQuery: string
  
  // Current step/tab
  activeTab: string
  
  // Sponsor info
  sponsorInfo: {
    email: string
    phone: string
    sponsorType: 'employee' | 'investor' | 'partner'
    location: 'inside' | 'outside'
  }
  
  // Documents
  documentsUploaded: number
  documentsRequired: number
  uploadedDocIds: string[]
  
  // Progress
  applicationProgress: number
  
  // Voice agent state
  isVoiceActive: boolean
  isVoiceConnecting: boolean
  isSpeaking: boolean
  lastVoiceCommand: string | null
  lastAIResponse: string | null
  transcript: string[]
}

interface VoiceAgentContextType {
  state: VoiceAgentState
  
  // Conversation controls
  conversation: ReturnType<typeof useConversation> | null
  startVoiceSession: () => Promise<void>
  endVoiceSession: () => Promise<void>
  
  // State actions
  openDialog: (serviceQuery?: string) => void
  closeDialog: () => void
  selectService: (service: VoiceAgentService) => void
  setActiveTab: (tab: string) => void
  updateSponsorInfo: (info: Partial<VoiceAgentState['sponsorInfo']>) => void
  updateDocumentProgress: (uploaded: number, required: number, uploadedDocIds?: string[]) => void
  updateApplicationProgress: (progress: number) => void
  setVoiceActive: (active: boolean) => void
  setLastVoiceCommand: (command: string | null) => void
  addToTranscript: (message: string) => void
  resetState: () => void
  
  // Services registry
  services: VoiceAgentService[]
  setServices: (services: VoiceAgentService[]) => void
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: VoiceAgentState = {
  isDialogOpen: false,
  selectedService: null,
  serviceQuery: '',
  activeTab: 'smart-start',
  sponsorInfo: {
    email: '',
    phone: '',
    sponsorType: 'employee',
    location: 'inside'
  },
  documentsUploaded: 0,
  documentsRequired: 0,
  uploadedDocIds: [],
  applicationProgress: 0,
  isVoiceActive: false,
  isVoiceConnecting: false,
  isSpeaking: false,
  lastVoiceCommand: null,
  lastAIResponse: null,
  transcript: []
}

// ============================================================================
// Context
// ============================================================================

const VoiceAgentContext = createContext<VoiceAgentContextType | undefined>(undefined)

// ============================================================================
// Provider
// ============================================================================

export function VoiceAgentProvider({ 
  children,
  agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || ''
}: { 
  children: ReactNode
  agentId?: string 
}) {
  const [state, setState] = useState<VoiceAgentState>(initialState)
  const [services, setServices] = useState<VoiceAgentService[]>([])
  const stateRef = useRef(state)
  const servicesRef = useRef(services)
  
  // Keep refs in sync
  useEffect(() => {
    stateRef.current = state
  }, [state])
  
  useEffect(() => {
    servicesRef.current = services
  }, [services])

  // ============================================================================
  // State Actions
  // ============================================================================

  const openDialog = useCallback((serviceQuery?: string) => {
    console.log('[VoiceAgentContext] openDialog:', serviceQuery)
    setState(prev => ({
      ...prev,
      isDialogOpen: true,
      serviceQuery: serviceQuery || ''
    }))
    toast.success('Opening application', {
      description: serviceQuery ? `For: ${serviceQuery}` : 'Select a service to begin'
    })
  }, [])

  const closeDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDialogOpen: false
    }))
  }, [])

  const selectService = useCallback((service: VoiceAgentService) => {
    console.log('[VoiceAgentContext] selectService:', service)
    setState(prev => ({
      ...prev,
      selectedService: service,
      serviceQuery: service.name,
      activeTab: 'sponsor-info', // Move to next step
      applicationProgress: Math.max(prev.applicationProgress, 20)
    }))
    toast.success(`Selected: ${service.name}`, {
      description: 'Moving to sponsor information'
    })
  }, [])

  const setActiveTab = useCallback((tab: string) => {
    console.log('[VoiceAgentContext] setActiveTab:', tab)
    setState(prev => {
      // Calculate progress based on tab
      const tabProgress: Record<string, number> = {
        'smart-start': 10,
        'sponsor-info': 30,
        'docs-upload': 50,
        'ai-guidance': 70,
        'review-submit': 90
      }
      return {
        ...prev,
        activeTab: tab,
        applicationProgress: Math.max(prev.applicationProgress, tabProgress[tab] || prev.applicationProgress)
      }
    })
  }, [])

  const updateSponsorInfo = useCallback((info: Partial<VoiceAgentState['sponsorInfo']>) => {
    console.log('[VoiceAgentContext] updateSponsorInfo:', info)
    setState(prev => ({
      ...prev,
      sponsorInfo: { ...prev.sponsorInfo, ...info }
    }))
  }, [])

  const updateDocumentProgress = useCallback((uploaded: number, required: number, uploadedDocIds?: string[]) => {
    setState(prev => ({
      ...prev,
      documentsUploaded: uploaded,
      documentsRequired: required,
      uploadedDocIds: uploadedDocIds || prev.uploadedDocIds,
      applicationProgress: Math.max(prev.applicationProgress, 50 + Math.round((uploaded / Math.max(required, 1)) * 30))
    }))
  }, [])

  const updateApplicationProgress = useCallback((progress: number) => {
    setState(prev => ({
      ...prev,
      applicationProgress: progress
    }))
  }, [])

  const setVoiceActive = useCallback((active: boolean) => {
    setState(prev => ({
      ...prev,
      isVoiceActive: active
    }))
  }, [])

  const setLastVoiceCommand = useCallback((command: string | null) => {
    setState(prev => ({
      ...prev,
      lastVoiceCommand: command
    }))
  }, [])
  
  const addToTranscript = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      transcript: [...prev.transcript.slice(-20), message]
    }))
  }, [])

  const resetState = useCallback(() => {
    setState(initialState)
  }, [])

  // ============================================================================
  // ElevenLabs Conversation with Client Tools
  // ============================================================================

  const conversation = useConversation({
    onConnect: () => {
      console.log('[VoiceAgentContext] Connected to ElevenLabs')
      setState(prev => ({ ...prev, isVoiceActive: true, isVoiceConnecting: false }))
      toast.success('Voice assistant ready', {
        description: 'Say "I need help with..." to begin'
      })
    },
    onDisconnect: () => {
      console.log('[VoiceAgentContext] Disconnected from ElevenLabs')
      setState(prev => ({ ...prev, isVoiceActive: false, isSpeaking: false }))
    },
    onMessage: (message) => {
      console.log('[VoiceAgentContext] Message:', message)
      if (message.message) {
        addToTranscript(message.message)
        setState(prev => ({ ...prev, lastAIResponse: message.message }))
      }
    },
    onError: (error) => {
      console.error('[VoiceAgentContext] Error:', error)
      setState(prev => ({ ...prev, isVoiceConnecting: false, isVoiceActive: false }))
      toast.error('Voice assistant error', {
        description: 'Please try again'
      })
    },
    
    // ========================================================================
    // CLIENT TOOLS - AI can call these to control the UI
    // ========================================================================
    clientTools: {
      // Get all available services
      getAvailableServices: async () => {
        console.log('[ClientTool] getAvailableServices')
        const serviceList = servicesRef.current.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category || 'General',
          description: s.description
        }))
        return JSON.stringify(serviceList)
      },

      // Search for a service by keyword
      searchService: async ({ query }: { query: string }) => {
        console.log('[ClientTool] searchService:', query)
        const results = servicesRef.current.filter(s =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          (s.description && s.description.toLowerCase().includes(query.toLowerCase())) ||
          (s.category && s.category.toLowerCase().includes(query.toLowerCase()))
        )
        return JSON.stringify(results.slice(0, 5))
      },

      // Select a service and open dialog - THIS IS THE KEY TOOL
      selectService: async ({ serviceId, serviceName }: { serviceId?: string; serviceName?: string }) => {
        console.log('[ClientTool] selectService:', { serviceId, serviceName })
        
        let selectedService: VoiceAgentService | undefined
        
        if (serviceId) {
          selectedService = servicesRef.current.find(s => s.id === serviceId)
        } else if (serviceName) {
          selectedService = servicesRef.current.find(s =>
            s.name.toLowerCase().includes(serviceName.toLowerCase())
          )
        }
        
        if (selectedService) {
          // Open dialog AND select service
          setState(prev => ({
            ...prev,
            isDialogOpen: true,
            selectedService: selectedService!,
            serviceQuery: selectedService!.name,
            activeTab: 'sponsor-info',
            applicationProgress: Math.max(prev.applicationProgress, 20)
          }))
          
          toast.success(`Selected: ${selectedService.name}`, {
            description: 'Opening application form'
          })
          
          return JSON.stringify({ success: true, service: selectedService })
        }
        
        return JSON.stringify({ success: false, error: 'Service not found' })
      },

      // Open the application dialog
      openApplicationDialog: async ({ query }: { query?: string } = {}) => {
        console.log('[ClientTool] openApplicationDialog:', query)
        setState(prev => ({
          ...prev,
          isDialogOpen: true,
          serviceQuery: query || ''
        }))
        toast.success('Opening application dialog')
        return JSON.stringify({ success: true })
      },

      // Navigate to a specific tab
      navigateToTab: async ({ tab }: { tab: string }) => {
        console.log('[ClientTool] navigateToTab:', tab)
        const validTabs = ['smart-start', 'sponsor-info', 'docs-upload', 'ai-guidance', 'review-submit']
        if (validTabs.includes(tab)) {
          const tabProgress: Record<string, number> = {
            'smart-start': 10,
            'sponsor-info': 30,
            'docs-upload': 50,
            'ai-guidance': 70,
            'review-submit': 90
          }
          setState(prev => ({
            ...prev,
            activeTab: tab,
            applicationProgress: Math.max(prev.applicationProgress, tabProgress[tab] || prev.applicationProgress)
          }))
          toast.info(`Moving to ${tab.replace('-', ' ')}`)
          return JSON.stringify({ success: true, tab })
        }
        return JSON.stringify({ success: false, error: 'Invalid tab' })
      },

      // Update sponsor information
      updateSponsorInfo: async (info: { email?: string; phone?: string; sponsorType?: string }) => {
        console.log('[ClientTool] updateSponsorInfo:', info)
        setState(prev => ({
          ...prev,
          sponsorInfo: {
            ...prev.sponsorInfo,
            ...(info.email && { email: info.email }),
            ...(info.phone && { phone: info.phone }),
            ...(info.sponsorType && { sponsorType: info.sponsorType as 'employee' | 'investor' | 'partner' })
          }
        }))
        toast.success('Information updated')
        return JSON.stringify({ success: true, updated: info })
      },

      // Get current application progress
      getApplicationProgress: async () => {
        console.log('[ClientTool] getApplicationProgress')
        const currentState = stateRef.current
        return JSON.stringify({
          currentStep: currentState.activeTab,
          selectedService: currentState.selectedService?.name || 'None',
          documentsUploaded: currentState.documentsUploaded,
          documentsRequired: currentState.documentsRequired,
          progress: currentState.applicationProgress,
          sponsorInfoComplete: !!(currentState.sponsorInfo.email && currentState.sponsorInfo.phone),
          isDialogOpen: currentState.isDialogOpen
        })
      },

      // Get document upload status
      getDocumentStatus: async () => {
        console.log('[ClientTool] getDocumentStatus')
        const currentState = stateRef.current
        return JSON.stringify({
          uploaded: currentState.documentsUploaded,
          required: currentState.documentsRequired,
          percentage: currentState.documentsRequired
            ? Math.round(currentState.documentsUploaded / currentState.documentsRequired * 100)
            : 0
        })
      },

      // Get current state summary
      getCurrentState: async () => {
        console.log('[ClientTool] getCurrentState')
        const currentState = stateRef.current
        return JSON.stringify({
          isDialogOpen: currentState.isDialogOpen,
          selectedService: currentState.selectedService,
          activeTab: currentState.activeTab,
          sponsorInfo: currentState.sponsorInfo,
          documentsUploaded: currentState.documentsUploaded,
          documentsRequired: currentState.documentsRequired,
          applicationProgress: currentState.applicationProgress
        })
      },

      // Get help for a topic
      getHelpTopic: async ({ topic }: { topic: string }) => {
        console.log('[ClientTool] getHelpTopic:', topic)
        const helpTopics: Record<string, string> = {
          'documents': 'Required documents include passport copies, photos, and certificates.',
          'processing': 'Standard processing takes 3-5 business days.',
          'requirements': 'Requirements vary by visa type.',
          'payment': 'We accept credit cards and bank transfers.',
          'status': 'Track your application in real-time on the dashboard.'
        }
        
        for (const [key, value] of Object.entries(helpTopics)) {
          if (topic.toLowerCase().includes(key)) {
            return JSON.stringify({ topic: key, help: value })
          }
        }
        
        return JSON.stringify({ topic: 'general', help: 'How can I help you today?' })
      },

      // Move to next step
      nextStep: async () => {
        console.log('[ClientTool] nextStep')
        const tabs = ['smart-start', 'sponsor-info', 'docs-upload', 'ai-guidance', 'review-submit']
        const currentState = stateRef.current
        const currentIndex = tabs.indexOf(currentState.activeTab)
        
        if (currentIndex < tabs.length - 1) {
          const nextTab = tabs[currentIndex + 1]
          setState(prev => ({
            ...prev,
            activeTab: nextTab,
            applicationProgress: Math.max(prev.applicationProgress, (currentIndex + 2) * 20)
          }))
          toast.info(`Moving to ${nextTab.replace('-', ' ')}`)
          return JSON.stringify({ success: true, newTab: nextTab })
        }
        
        return JSON.stringify({ success: false, error: 'Already at last step' })
      },

      // Move to previous step
      previousStep: async () => {
        console.log('[ClientTool] previousStep')
        const tabs = ['smart-start', 'sponsor-info', 'docs-upload', 'ai-guidance', 'review-submit']
        const currentState = stateRef.current
        const currentIndex = tabs.indexOf(currentState.activeTab)
        
        if (currentIndex > 0) {
          const prevTab = tabs[currentIndex - 1]
          setState(prev => ({
            ...prev,
            activeTab: prevTab
          }))
          toast.info(`Moving back to ${prevTab.replace('-', ' ')}`)
          return JSON.stringify({ success: true, newTab: prevTab })
        }
        
        return JSON.stringify({ success: false, error: 'Already at first step' })
      }
    }
  })

  // ============================================================================
  // Conversation Controls
  // ============================================================================

  const startVoiceSession = useCallback(async () => {
    if (conversation.status === 'connected') {
      console.log('[VoiceAgentContext] Already connected')
      return
    }

    setState(prev => ({ ...prev, isVoiceConnecting: true, transcript: [] }))

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Start the conversation session
      await conversation.startSession({
        agentId:agentId,
        connectionType: 'webrtc'
      })
      
      console.log('[VoiceAgentContext] Session started')
    } catch (error) {
      console.error('[VoiceAgentContext] Failed to start session:', error)
      setState(prev => ({ ...prev, isVoiceConnecting: false }))
      toast.error('Failed to start voice agent', {
        description: 'Please check microphone permissions'
      })
    }
  }, [agentId, conversation])

  const endVoiceSession = useCallback(async () => {
    try {
      await conversation.endSession()
    } catch (error) {
      console.error('[VoiceAgentContext] Failed to end session:', error)
    }
  }, [conversation])

  // ============================================================================
  // Provider Value
  // ============================================================================

  return (
    <VoiceAgentContext.Provider value={{
      state,
      conversation,
      startVoiceSession,
      endVoiceSession,
      openDialog,
      closeDialog,
      selectService,
      setActiveTab,
      updateSponsorInfo,
      updateDocumentProgress,
      updateApplicationProgress,
      setVoiceActive,
      setLastVoiceCommand,
      addToTranscript,
      resetState,
      services,
      setServices
    }}>
      {children}
    </VoiceAgentContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

export function useVoiceAgent() {
  const context = useContext(VoiceAgentContext)
  if (!context) {
    throw new Error('useVoiceAgent must be used within a VoiceAgentProvider')
  }
  return context
}
