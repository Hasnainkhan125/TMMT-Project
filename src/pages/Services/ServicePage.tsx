"use client"

import OpenAI from "openai";
import { type Tool } from "openai/resources/responses/responses";
import { type ResponseInputItem } from "openai/resources/responses/responses";

import React, { useState, useEffect, useContext } from 'react'
import { getSocket } from '@/lib/socket'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import SEO from '@/components/SEO/SEO'
import { 
  FileText, 
  User, 
  Building2, 
  MapPin, 
  CreditCard, 
  Shield, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  TrendingUp, 
  Users, 
  Phone,
  Award,
  Zap,
  Target,
  Search,
  Upload,
  Send,
  Bot,
  Brain
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import LazyVideo from '@/pages/Home/lazy-video'
import { ThemeContext } from '@/contexts/ThemeContext'
import { Input } from '@/components/ui/input'

interface Service {
  id: string
  name: string
  description: string
  category: string
  price: string
  duration: string
  requirements: string[]
  features: string[]
  icon: any
  color: string
  popular?: boolean
  videoSrc?: string
  tone?: string
  gradient?: string
}

// Theme hook
const useTheme = () => {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

const SERVICES: Service[] = [
  {
    id: 'family-visa-spouse',
    name: 'Spouse Family Visa',
    description: 'Apply for a family visa to sponsor your spouse in the UAE',
    category: 'Family Visa',
    price: 'AED 1,089',
    duration: '2-4 weeks',
    requirements: ['Marriage Certificate', 'Passport Copy', 'Emirates ID', 'Salary Certificate'],
    features: ['Fast Processing', 'Expert Support', 'Document Verification', 'Status Tracking'],
    icon: User,
    color: 'text-orange-600',
    popular: true,
    videoSrc: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/uae-visa-placeholder-video.mp4',
    tone: 'trusted',
    gradient: 'from-orange-500 via-red-500 to-pink-500'
  },
  {
    id: 'family-visa-child',
    name: 'Child Family Visa',
    description: 'Sponsor your children under 18 years of age',
    category: 'Family Visa',
    price: 'AED 1,089',
    duration: '2-4 weeks',
    requirements: ['Birth Certificate', 'Passport Copy', 'Emirates ID', 'School Letter'],
    features: ['Child-friendly Process', 'Educational Support', 'Health Coverage', 'Renewal Service'],
    icon: User,
    color: 'text-orange-500',
    videoSrc: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/uae-visa-placeholder-video.mp4',
    tone: 'family',
    gradient: 'from-orange-400 via-amber-500 to-yellow-500'
  },
  {
    id: 'residence-visa',
    name: 'Residence Visa',
    description: 'Long-term residence visa for professionals and investors',
    category: 'Residence',
    price: 'AED 1,126',
    duration: '3-6 weeks',
    requirements: ['Employment Contract', 'Trade License', 'Bank Statements', 'Medical Test'],
    features: ['Long-term Stay', 'Work Authorization', 'Family Sponsorship', 'Visa Renewal'],
    icon: Building2,
    color: 'text-orange-700',
    videoSrc: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/uae-visa-placeholder-video.mp4',
    tone: 'professional',
    gradient: 'from-orange-600 via-red-600 to-rose-600'
  },
  {
    id: 'entry-permit',
    name: 'Entry Permit',
    description: 'Short-term entry permit for visitors and tourists',
    category: 'Entry',
    price: 'AED 2,152',
    duration: '1-2 weeks',
    requirements: ['Passport Copy', 'Photo', 'Travel Insurance', 'Return Ticket'],
    features: ['Quick Processing', 'Multiple Entry', 'Flexible Duration', 'Easy Extension'],
    icon: MapPin,
    color: 'text-orange-400',
    videoSrc: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/uae-visa-placeholder-video.mp4',
    tone: 'fast',
    gradient: 'from-orange-300 via-orange-400 to-orange-500'
  },
  {
    id: 'emirates-id',
    name: 'Emirates ID',
    description: 'National identity card for UAE residents',
    category: 'Identity',
    price: 'AED 510',
    duration: '1-2 weeks',
    requirements: ['Visa Copy', 'Photo', 'Biometric Data', 'Application Form'],
    features: ['Digital Identity', 'Government Services', 'Banking Access', 'Travel Document'],
    icon: CreditCard,
    color: 'text-orange-600',
    videoSrc: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/uae-visa-placeholder-video.mp4',
    tone: 'digital',
    gradient: 'from-orange-500 via-amber-600 to-yellow-600'
  },
  {
    id: 'visa-renewal',
    name: 'Visa Renewal',
    description: 'Renew your existing UAE visa before expiration',
    category: 'Renewal',
    price: 'AED 510',
    duration: '1-2 weeks',
    requirements: ['Current Visa', 'Passport Copy', 'Emirates ID', 'Medical Test'],
    features: ['Seamless Renewal', 'No Interruption', 'Priority Processing', 'Status Maintenance'],
    icon: Clock,
    color: 'text-orange-500',
    videoSrc: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/uae-visa-placeholder-video.mp4',
    tone: 'seamless',
    gradient: 'from-orange-400 via-orange-500 to-orange-600'
  }
]

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system' | 'amer';
  content: string;
  timestamp: Date;
}

interface ApplicationState {
  step: number;
  service: Service | null;
  documents: Record<string, File[]>;
  personalInfo: Record<string, string>;
  chatHistory: ChatMessage[];
  isProcessing: boolean;
  progress: number;
}

const ServicePage: React.FC = () => {
  const { theme } = useTheme();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [applicationState, setApplicationState] = useState<ApplicationState>({
    step: 0,
    service: null,
    documents: {},
    personalInfo: {},
    chatHistory: [],
    isProcessing: false,
    progress: 0
  });
  
  // Animation states
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<ReturnType<typeof getSocket> | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceResponse, setServiceResponse] = useState('');
  // Initialize socket.io connection
  useEffect(() => {
    if (!showApplicationForm) return
    const s = getSocket()
    setSocket(s)

    const onAmerConnected = (payload: any) => {
      setRoomId(payload?.roomId)
    }
    const onNewMessage = (msg: any) => {
      setApplicationState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, {
          id: msg.id || Date.now().toString(),
          type: msg.sender && msg.sender !== 'user' ? 'amer' : 'user',
          content: msg.content,
          timestamp: new Date(msg.timestamp || Date.now())
        }]
      }))
    }
    const onUserTyping = (payload: any) => setIsTyping(!!payload?.isTyping)

    s.on('amer_connected', onAmerConnected)
    s.on('new_message', onNewMessage)
    s.on('user_typing', onUserTyping)

    return () => {
      s.off('amer_connected', onAmerConnected)
      s.off('new_message', onNewMessage)
      s.off('user_typing', onUserTyping)
    }
  }, [showApplicationForm])

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setApplicationState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, userMessage]
    }));

    setChatInput('');
    setIsTyping(true);

    try {
      // Send to OpenAI for processing
      const response = await fetch('/api/v1/chat/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: chatInput,
          context: {
            service: selectedService,
            step: applicationState.step,
            documents: Object.keys(applicationState.documents)
          }
        })
      });

      const data = await response.json();

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: data.response,
        timestamp: new Date()
      };

      setApplicationState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, aiMessage]
      }));

      // Handle any actions returned by the AI
      if (data.actions) {
        handleAIActions(data.actions);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };

      setApplicationState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, errorMessage]
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleAIActions = (actions: any[]) => {
    actions.forEach(action => {
      switch (action.type) {
        case 'REQUEST_DOCUMENT':
          // Highlight document upload section
          break;
        case 'CONNECT_AMER':
          // Request Amer officer connection
          socket?.emit('request_amer_connection', { service: selectedService?.id })
          break;
        case 'UPDATE_PROGRESS':
          setApplicationState(prev => ({
            ...prev,
            progress: action.progress
          }));
          break;
        default:
          console.log('Unknown action:', action);
      }
    });
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setShowApplicationForm(true)
    // join a temp room once created
  }





const openai = new OpenAI();



// 1. Define a list of callable tools for the model
const tools = [
  {
    type: "function",
    name: "get_service",
    description: "Get a service by name.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "A service name",
        },
      },
      required: ["name"],
    },
  },
];

function getService(name: string): Service | undefined {
  return SERVICES.find(service => service.name === name);
} 

// Create a running input list we will add to over time
let input: ResponseInputItem[] = [
    { role: "user", content: "What is my service? I want to apply for a tourist visa." },
];


console.log("Final input:");
console.log(JSON.stringify(input, null, 2));


const getServiceResponse = async (input: ResponseInputItem[]) => {


// 2. Prompt the model with tools defined
let response = await openai.responses.create({
  model: "gpt-5",
  tools: tools as Tool[],
  input,
});

response.output.forEach((item: any) => {
  if (item.type == "function_call") {
    if (item.name == "get_service") {
      // 3. Execute the function logic for get_horoscope
      const service = getService(JSON.parse(item.arguments))
      
      // 4. Provide function call results to the model
      input.push({
          type: "function_call_output",
          call_id: item.call_id,
          output: JSON.stringify({
            service
          })
      })
    }
  }
}); 
  return response;
}

  return (
    <>
      <SEO
        title="UAE Visa Services - Tourist, Resident & Investor Visas | Tammat"
        description="Explore our comprehensive UAE visa services including tourist visas, residence visas, golden visas, and investor visas. Fast processing, expert support, and hassle-free solutions."
        keywords="UAE visa services, Dubai visa, tourist visa UAE, residence visa Dubai, golden visa UAE, investor visa, family visa, employment visa"
        canonicalUrl="/services"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "UAE Visa Services",
          "provider": {
            "@type": "Organization",
            "name": "Tammat Visa Services"
          },
          "areaServed": "AE",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Visa Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Tourist Visa"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Residence Visa"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Golden Visa"
                }
              }
            ]
          }
        }}
      />
      <div className="min-h-screen" style={{ backgroundColor: theme.background, color: theme.text }}>
        {/* Hero Section */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.accent} 100%)`
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 animate-gradient-shift" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-300/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center liquid-glass"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FileText className="w-12 h-12 text-white" />
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 text-white"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="block">UAE Visa</span>
                <span className="block bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent">
                  Services
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-white/90 mb-10 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Professional visa application services with 98% success rate. 
                Fast, reliable, and hassle-free processing for all your immigration needs.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                    className="liquid-glass text-lg px-8 py-4 text-white border-white/20 hover:bg-white/10"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Explore Services
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="lg" 
                    className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 liquid-glass"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Us
                </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>


      <div>
        <div className=" flex m-10 gap-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">  

        <Input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for a service" />
        <Button onClick={() => getServiceResponse([{ role: "user", content: searchQuery } as ResponseInputItem]).then((response) => setServiceResponse(JSON.stringify(response.output, null, 2)))}>Search</Button>
        <div className="text-white">{serviceResponse}</div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20" style={{ backgroundColor: theme.surface }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 100 }}
              className="text-center group"
            >
              <motion.div 
                className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center liquid-glass group-hover:scale-110 transition-transform"
                style={{ backgroundColor: theme.primary + '20' }}
                whileHover={{ rotate: 5 }}
              >
                <Users className="w-10 h-10" style={{ color: theme.primary }} />
              </motion.div>
              <motion.div 
                className="text-4xl font-bold mb-2"
                style={{ color: theme.text }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              >
                50K+
              </motion.div>
              <div style={{ color: theme.textSecondary }}>Happy Clients</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
              className="text-center group"
            >
              <motion.div 
                className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center liquid-glass group-hover:scale-110 transition-transform"
                style={{ backgroundColor: theme.success + '20' }}
                whileHover={{ rotate: 5 }}
              >
                <CheckCircle className="w-10 h-10" style={{ color: theme.success }} />
              </motion.div>
              <motion.div 
                className="text-4xl font-bold mb-2"
                style={{ color: theme.text }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
              >
                98%
              </motion.div>
              <div style={{ color: theme.textSecondary }}>Success Rate</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
              className="text-center group"
            >
              <motion.div 
                className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center liquid-glass group-hover:scale-110 transition-transform"
                style={{ backgroundColor: theme.info + '20' }}
                whileHover={{ rotate: 5 }}
              >
                <Clock className="w-10 h-10" style={{ color: theme.info }} />
              </motion.div>
              <motion.div 
                className="text-4xl font-bold mb-2"
                style={{ color: theme.text }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
              >
                2-4
              </motion.div>
              <div style={{ color: theme.textSecondary }}>Weeks Processing</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 100 }}
              className="text-center group"
            >
              <motion.div 
                className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center liquid-glass group-hover:scale-110 transition-transform"
                style={{ backgroundColor: theme.warning + '20' }}
                whileHover={{ rotate: 5 }}
              >
                <Award className="w-10 h-10" style={{ color: theme.warning }} />
              </motion.div>
              <motion.div 
                className="text-4xl font-bold mb-2"
                style={{ color: theme.text }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
              >
                15+
              </motion.div>
              <div style={{ color: theme.textSecondary }}>Years Experience</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="py-20" style={{ backgroundColor: theme.background }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: theme.text }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Our Visa Services
            </motion.h2>
            <motion.p 
              className="text-xl max-w-3xl mx-auto leading-relaxed"
              style={{ color: theme.textSecondary }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Comprehensive visa solutions tailored to your needs. From family visas to business permits, 
              we handle it all with expertise and care.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <div className="glass-border relative rounded-[28px] p-2 h-full">
                    {service.popular && (
                      <motion.div 
                        className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        <Badge 
                          className="px-4 py-1 text-white font-semibold"
                          style={{ 
                            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                          }}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </motion.div>
                    )}
                    
                    <div className="relative aspect-[9/19] w-full overflow-hidden rounded-2xl bg-black">
                      <LazyVideo
                        src={service.videoSrc || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/uae-visa-placeholder-video.mp4'}
                        className="absolute inset-0 h-full w-full object-cover"
                        autoplay={true}
                        loop={true}
                        muted={true}
                        playsInline={true}
                        aria-label={`${service.name} - ${service.description}`}
                      />

                      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="bg-background/20 mx-auto mb-3 h-1.5 w-16 rounded-full" />
                          
                          <div className="flex items-center justify-between mb-2">
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center liquid-glass"
                              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                            >
                              <Icon className="w-6 h-6 text-white" />
                        </div>
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-white/10 text-white border-white/20"
                            >
                          {service.category}
                        </Badge>
                      </div>

                          <div className="space-y-2">
                            <h3 className="text-2xl leading-snug font-bold text-white">
                              {service.name}
                            </h3>
                            <p className="text-sm text-white/80 leading-relaxed">
                        {service.description}
                            </p>
                          </div>
                        </div>

                      <div className="space-y-4">
                        {/* Price and Duration */}
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-white">{service.price}</div>
                            <div className="text-sm text-white/70 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.duration}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-white text-sm">Key Features:</h4>
                          <div className="grid grid-cols-1 gap-1">
                              {service.features.slice(0, 2).map((feature, idx) => (
                                <div key={idx} className="flex items-center text-xs text-white/80">
                                  <CheckCircle className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>

                          {/* Tone Badge */}
                          <div 
                            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wider uppercase"
                            style={{ 
                              backgroundColor: 'rgba(0,0,0,0.4)',
                              color: theme.primary
                            }}
                          >
                            {service.tone}
                        </div>

                        {/* Action Button */}
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                        <Button 
                              className="w-full liquid-glass text-white border-white/20 hover:bg-white/10"
                          onClick={() => handleServiceSelect(service)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Apply Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                          </motion.div>
                      </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-20" style={{ backgroundColor: theme.surface }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: theme.text }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Why Choose Our Services?
            </motion.h2>
            <motion.p 
              className="text-xl max-w-3xl mx-auto leading-relaxed"
              style={{ color: theme.textSecondary }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              We provide exceptional visa services with unmatched expertise and customer support
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'High Success Rate',
                description: '98% approval rate with our proven application strategies and expert guidance.',
                color: theme.primary
              },
              {
                icon: Clock,
                title: 'Fast Processing',
                description: 'Quick turnaround times with priority processing and real-time status updates.',
                color: theme.success
              },
              {
                icon: Shield,
                title: 'Secure & Confidential',
                description: 'Your personal information is protected with bank-level security measures.',
                color: theme.info
              },
              {
                icon: Users,
                title: 'Expert Support',
                description: 'Dedicated visa specialists available 24/7 to assist with your application.',
                color: theme.warning
              },
              {
                icon: TrendingUp,
                title: 'Cost Effective',
                description: 'Competitive pricing with no hidden fees and transparent cost structure.',
                color: theme.error
              },
              {
                icon: Brain,
                title: 'AI-Powered Solutions',
                description: 'Smart document verification and intelligent application optimization.',
                color: theme.accent
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="text-center group"
                >
                  <div className="liquid-glass rounded-3xl p-8 h-full">
                    <motion.div 
                      className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center liquid-glass group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: feature.color + '20' }}
                      whileHover={{ rotate: 5 }}
                    >
                      <Icon className="w-10 h-10" style={{ color: feature.color }} />
                    </motion.div>
                    <motion.h3 
                      className="text-xl font-semibold mb-4"
                      style={{ color: theme.text }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p 
                      style={{ color: theme.textSecondary }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.7 }}
                    >
                      {feature.description}
                    </motion.p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div 
        className="py-20 text-white relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.accent} 100%)`
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 animate-gradient-shift" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-300/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Ready to Start Your Visa Application?
            </motion.h2>
            <motion.p 
              className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join thousands of satisfied clients who have successfully obtained their UAE visas through our services.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                  className="liquid-glass text-lg px-8 py-4 text-white border-white/20 hover:bg-white/10"
                onClick={() => setShowApplicationForm(true)}
              >
                <FileText className="w-5 h-5 mr-2" />
                Start Application
                  <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="lg" 
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 liquid-glass"
              >
                <Phone className="w-5 h-5 mr-2" />
                Get Free Consultation
              </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* AI Interface Dialog */}
      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent 
          className="max-w-7xl max-h-[95vh] overflow-hidden p-0 liquid-glass-enhanced"
          style={{ 
            background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.surface} 100%)`,
            border: `1px solid ${theme.border}`
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="relative"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className="absolute inset-0 animate-gradient-shift"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.secondary}10 50%, ${theme.accent}10 100%)`
                }}
              />
              <div className="absolute inset-0 backdrop-blur-3xl" />
            </div>

            {/* Header */}
            <DialogHeader 
              className="relative p-6 pb-4"
              style={{ borderBottom: `1px solid ${theme.border}` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle 
                    className="text-3xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.text} 0%, ${theme.textSecondary} 100%)`
                    }}
                  >
                    {selectedService ? `${selectedService.name} Application` : 'Visa Application'}
                  </DialogTitle>
                  <DialogDescription 
                    className="text-lg"
                    style={{ color: theme.textSecondary }}
                  >
                    AI-powered application assistant
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="flex items-center gap-2 px-4 py-2 rounded-full liquid-glass"
                    style={{ 
                      backgroundColor: theme.primary + '20',
                      border: `1px solid ${theme.primary}40`
                    }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span 
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: theme.primary }}
                      ></span>
                      <span 
                        className="relative inline-flex rounded-full h-2 w-2"
                        style={{ backgroundColor: theme.primary }}
                      ></span>
                    </span>
                    <span 
                      className="text-sm font-medium"
                      style={{ color: theme.primary }}
                    >
                      AI Active
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Main Content Area */}
            <div className="grid grid-cols-12 gap-6 p-6 h-[75vh]">
              {/* Service Selection / Document Upload */}
              <div className="col-span-8 space-y-6">
                <AnimatePresence mode="wait">
                  {applicationState.step === 0 ? (
                    <ServiceSelection 
                      onSelect={(service) => {
                        setApplicationState(prev => ({
                          ...prev,
                          service,
                          step: 1
                        }));
                      }}
                    />
                  ) : applicationState.step === 1 ? (
                    <DocumentUpload
                      service={applicationState.service!}
                      documents={applicationState.documents}
                      onUpload={(docs) => {
                        setApplicationState(prev => ({
                          ...prev,
                          documents: { ...prev.documents, ...docs },
                          step: 2
                        }));
                      }}
                    />
                  ) : (
                    <PersonalInfo
                      onSubmit={(info) => {
                        setApplicationState(prev => ({
                          ...prev,
                          personalInfo: info,
                          step: 3
                        }));
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* AI Chat Interface */}
              <div 
                className="col-span-4 rounded-2xl liquid-glass overflow-hidden flex flex-col"
                style={{ 
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.surface + '80'
                }}
              >
                <div 
                  className="p-6"
                  style={{ borderBottom: `1px solid ${theme.border}` }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center liquid-glass"
                      style={{ backgroundColor: theme.primary + '20' }}
                    >
                      <Brain className="w-5 h-5" style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: theme.text }}>AI Assistant</h3>
                      <p className="text-sm" style={{ color: theme.textSecondary }}>Get help with your application</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {applicationState.chatHistory.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  {isTyping && <TypingIndicator />}
                </div>

                <div 
                  className="p-6"
                  style={{ borderTop: `1px solid ${theme.border}` }}
                >
                  <div className="relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => {
                        socket?.emit('typing_start', { roomId, userId: 'user' })
                        if (e.key === 'Enter') handleSendMessage()
                      }}
                      placeholder="Ask anything about your application..."
                      className="w-full rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 liquid-glass"
                      style={{ 
                        backgroundColor: theme.inputBackground,
                        border: `1px solid ${theme.inputBorder}`,
                        color: theme.text
                      }}
                    />
                    <motion.button
                      onClick={() => {
                        if (roomId) socket?.emit('send_message', { roomId, userId: 'user', message: { content: chatInput, type: 'text' } })
                        handleSendMessage()
                        socket?.emit('typing_stop', { roomId, userId: 'user' })
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: theme.textSecondary }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Send className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {applicationState.isProcessing && (
              <div 
                className="absolute bottom-0 left-0 right-0 p-6 liquid-glass"
                style={{ 
                  borderTop: `1px solid ${theme.border}`,
                  backgroundColor: theme.surface + '90'
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress 
                      value={applicationState.progress} 
                      className="h-3 rounded-full"
                      style={{ 
                        backgroundColor: theme.surface
                      }}
                    />
                  </div>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    {applicationState.progress}%
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}

// Service Selection Component
const ServiceSelection: React.FC<{ onSelect: (service: Service) => void }> = ({ onSelect }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredServices = SERVICES.filter(service => 
    (!selectedCategory || service.category === selectedCategory) &&
    (!searchQuery || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" 
            style={{ color: theme.textSecondary }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search visa services..."
            className="w-full rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 liquid-glass"
            style={{ 
              backgroundColor: theme.inputBackground,
              border: `1px solid ${theme.inputBorder}`,
              color: theme.text
            }}
          />
        </div>
        <Select
          value={selectedCategory || ''}
          onValueChange={(value) => setSelectedCategory(value || null)}
        >
          <SelectTrigger 
            className="w-[200px] rounded-xl liquid-glass"
            style={{ 
              backgroundColor: theme.inputBackground,
              border: `1px solid ${theme.inputBorder}`,
              color: theme.text
            }}
          >
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent 
            className="liquid-glass"
            style={{ 
              backgroundColor: theme.surface,
              border: `1px solid ${theme.border}`
            }}
          >
            <SelectItem value="">All Categories</SelectItem>
            {Array.from(new Set(SERVICES.map(s => s.category))).map(category => (
              <SelectItem 
                key={category} 
                value={category}
                style={{ color: theme.text }}
              >
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.id}
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group cursor-pointer"
            onClick={() => onSelect(service)}
          >
            <div 
              className="h-full liquid-glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
              style={{ 
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.surface + '50'
              }}
            >
                <div className="flex items-start gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center liquid-glass group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: theme.primary + '20' }}
                >
                  <service.icon className="h-7 w-7" style={{ color: theme.primary }} />
                  </div>
                  <div className="flex-1">
                  <h3 
                    className="text-xl font-semibold mb-2 group-hover:text-orange-500 transition-colors"
                    style={{ color: theme.text }}
                  >
                    {service.name}
                  </h3>
                  <p 
                    className="text-sm mb-4 leading-relaxed"
                    style={{ color: theme.textSecondary }}
                  >
                    {service.description}
                  </p>
                    <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className="liquid-glass"
                      style={{ 
                        backgroundColor: theme.primary + '20',
                        border: `1px solid ${theme.primary}40`,
                        color: theme.primary
                      }}
                    >
                        {service.category}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm">
                      <Clock 
                        className="h-4 w-4" 
                        style={{ color: theme.textSecondary }}
                      />
                      <span style={{ color: theme.textSecondary }}>
                        {service.duration}
                      </span>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Document Upload Component
const DocumentUpload: React.FC<{
  service: Service;
  documents: Record<string, File[]>;
  onUpload: (docs: Record<string, File[]>) => void;
}> = ({ documents, onUpload }) => {
  const { theme } = useTheme();
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const requiredDocs = {
    sponsor: [
      { id: 'visa', name: 'Residence Visa' },
      { id: 'emirates_id', name: 'Emirates ID' },
      { id: 'passport', name: 'Passport' },
      { id: 'salary', name: 'Salary Certificate' },
      { id: 'trade_license', name: 'Trade License' },
      { id: 'establishment', name: 'Establishment Card' }
    ],
    sponsored: [
      { id: 'passport_front', name: 'Passport Front' },
      { id: 'passport_back', name: 'Passport Back' },
      { id: 'photo', name: 'White Background Photo' }
    ]
  };

  const handleDrop = async (docId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;

    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [docId]: 0 }));
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const current = prev[docId] || 0;
        return current >= 100 ? prev : { ...prev, [docId]: current + 10 };
      });
    }, 200);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    clearInterval(interval);
    setUploadProgress(prev => ({ ...prev, [docId]: 100 }));

    onUpload({ ...documents, [docId]: files });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="space-y-10"
    >
      {/* Sponsor Documents */}
      <div>
        <motion.h3 
          className="text-2xl font-semibold mb-6"
          style={{ color: theme.text }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Sponsor Documents
        </motion.h3>
        <div className="grid grid-cols-2 gap-6">
          {requiredDocs.sponsor.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(doc.id);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(doc.id, e)}
              className={cn(
                "relative rounded-2xl border-2 border-dashed p-6 transition-all duration-300 cursor-pointer group",
                dragOver === doc.id 
                  ? "border-orange-400 bg-orange-400/10 scale-105" 
                  : "hover:border-orange-300 hover:bg-orange-50/5"
              )}
              style={{ 
                borderColor: dragOver === doc.id ? theme.primary : theme.border,
                backgroundColor: dragOver === doc.id ? theme.primary + '10' : theme.surface + '30'
              }}
            >
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Upload 
                    className="h-10 w-10" 
                    style={{ color: dragOver === doc.id ? theme.primary : theme.textSecondary }}
                  />
                </motion.div>
                <div>
                  <p 
                    className="font-semibold text-lg mb-1"
                    style={{ color: theme.text }}
                  >
                    {doc.name}
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    Drag & drop or click to upload
                  </p>
                </div>
                {uploadProgress[doc.id] !== undefined && (
                  <div className="w-full">
                    <Progress 
                      value={uploadProgress[doc.id]} 
                      className="h-2 rounded-full"
                      style={{ 
                        backgroundColor: theme.surface
                      }}
                    />
                  </div>
                )}
                {documents[doc.id]?.length > 0 && (
                  <Badge 
                    className="px-3 py-1"
                    style={{ 
                      backgroundColor: theme.success + '20',
                      border: `1px solid ${theme.success}40`,
                      color: theme.success
                    }}
                  >
                    {documents[doc.id].length} file(s) uploaded
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sponsored Documents */}
      <div>
        <motion.h3 
          className="text-2xl font-semibold mb-6"
          style={{ color: theme.text }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          Sponsored Person Documents
        </motion.h3>
        <div className="grid grid-cols-2 gap-6">
          {requiredDocs.sponsored.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: (index + 6) * 0.1, type: "spring", stiffness: 100 }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(doc.id);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(doc.id, e)}
              className={cn(
                "relative rounded-2xl border-2 border-dashed p-6 transition-all duration-300 cursor-pointer group",
                dragOver === doc.id 
                  ? "border-orange-400 bg-orange-400/10 scale-105" 
                  : "hover:border-orange-300 hover:bg-orange-50/5"
              )}
              style={{ 
                borderColor: dragOver === doc.id ? theme.primary : theme.border,
                backgroundColor: dragOver === doc.id ? theme.primary + '10' : theme.surface + '30'
              }}
            >
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Upload 
                    className="h-10 w-10" 
                    style={{ color: dragOver === doc.id ? theme.primary : theme.textSecondary }}
                  />
                </motion.div>
                <div>
                  <p 
                    className="font-semibold text-lg mb-1"
                    style={{ color: theme.text }}
                  >
                    {doc.name}
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    Drag & drop or click to upload
                  </p>
                </div>
                {uploadProgress[doc.id] !== undefined && (
                  <div className="w-full">
                    <Progress 
                      value={uploadProgress[doc.id]} 
                      className="h-2 rounded-full"
                      style={{ 
                        backgroundColor: theme.surface
                      }}
                    />
                  </div>
                )}
                {documents[doc.id]?.length > 0 && (
                  <Badge 
                    className="px-3 py-1"
                    style={{ 
                      backgroundColor: theme.success + '20',
                      border: `1px solid ${theme.success}40`,
                      color: theme.success
                    }}
                  >
                    {documents[doc.id].length} file(s) uploaded
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Chat Message Component
const ChatMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const { theme } = useTheme();
  const isUser = message.type === 'user';
  
  return (
    <motion.div 
      className={cn(
      "flex gap-3",
      isUser ? "flex-row-reverse" : "flex-row"
      )}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
    >
      <motion.div 
        className="w-10 h-10 rounded-full flex items-center justify-center liquid-glass"
        style={{ 
          backgroundColor: isUser ? theme.primary : theme.accent + '20',
          border: `1px solid ${isUser ? theme.primary : theme.accent}40`
        }}
        whileHover={{ scale: 1.05 }}
      >
        {isUser ? (
          <User className="h-5 w-5" style={{ color: theme.buttonText }} />
        ) : (
          <Bot className="h-5 w-5" style={{ color: theme.accent }} />
        )}
      </motion.div>
      <div 
        className="rounded-2xl px-4 py-3 max-w-[80%] liquid-glass"
        style={{
          backgroundColor: isUser ? theme.primary : theme.surface + '80',
          border: `1px solid ${isUser ? theme.primary + '40' : theme.border}`,
          color: isUser ? theme.buttonText : theme.text
        }}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
    </motion.div>
  );
};

// Typing Indicator Component
const TypingIndicator = () => {
  const { theme } = useTheme();
  
  return (
    <motion.div 
      className="flex items-center gap-3"
      style={{ color: theme.textSecondary }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
    <div className="flex items-center gap-1">
      <motion.div
          animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 1, repeatDelay: 0.2 }}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: theme.primary }}
      />
      <motion.div
          animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 1, delay: 0.2, repeatDelay: 0.2 }}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: theme.primary }}
      />
      <motion.div
          animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 1, delay: 0.4, repeatDelay: 0.2 }}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: theme.primary }}
      />
    </div>
      <span className="text-sm font-medium">AI is typing...</span>
    </motion.div>
  );
};

// Personal Info Component
const PersonalInfo: React.FC<{
  onSubmit: (info: Record<string, string>) => void;
}> = ({ onSubmit }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    passportNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="space-y-8"
    >
      <div>
        <motion.h3 
          className="text-2xl font-semibold mb-6"
          style={{ color: theme.text }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Personal Information
        </motion.h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text }}
              >
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 liquid-glass"
                style={{ 
                  backgroundColor: theme.inputBackground,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.text
                }}
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text }}
              >
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 liquid-glass"
                style={{ 
                  backgroundColor: theme.inputBackground,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.text
                }}
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text }}
              >
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 liquid-glass"
                style={{ 
                  backgroundColor: theme.inputBackground,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.text
                }}
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 liquid-glass"
                style={{ 
                  backgroundColor: theme.inputBackground,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.text
                }}
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text }}
              >
                Nationality
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 liquid-glass"
                style={{ 
                  backgroundColor: theme.inputBackground,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.text
                }}
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text }}
              >
                Passport Number
              </label>
              <input
                type="text"
                value={formData.passportNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, passportNumber: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 liquid-glass"
                style={{ 
                  backgroundColor: theme.inputBackground,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.text
                }}
                required
              />
            </motion.div>
  </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex justify-end"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                type="submit"
                className="px-8 py-3 liquid-glass"
                style={{ 
                  backgroundColor: theme.primary,
                  color: theme.buttonText,
                  border: `1px solid ${theme.primary}40`
                }}
              >
                Continue Application
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
};

export default ServicePage;