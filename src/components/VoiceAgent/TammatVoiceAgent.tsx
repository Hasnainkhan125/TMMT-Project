'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX,
  Sparkles, Loader2, X, MessageSquare, Headphones,
  CheckCircle2, Clock, ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVoiceAgent } from '@/contexts/VoiceAgentContext'

// ============================================================================
// Types
// ============================================================================

export interface TammatVoiceAgentProps {
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
  showTranscript?: boolean
  floatingButton?: boolean
}

// ============================================================================
// Component
// ============================================================================

export default function TammatVoiceAgent({
  className = '',
  position = 'bottom-right',
  size = 'md',
  showTranscript = true,
  floatingButton = true
}: TammatVoiceAgentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const transcriptRef = useRef<HTMLDivElement>(null)

  const { 
    state, 
    conversation, 
    startVoiceSession, 
    endVoiceSession 
  } = useVoiceAgent()

  const isConnected = conversation?.status === 'connected'
  const isSpeaking = conversation?.isSpeaking || false

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [state.transcript])

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (conversation) {
      if (isMuted) {
        await conversation.setVolume({ volume: 1 })
      } else {
        await conversation.setVolume({ volume: 0 })
      }
      setIsMuted(!isMuted)
    }
  }, [conversation, isMuted])

  // Handle start/end session
  const handleToggleSession = useCallback(async () => {
    if (isConnected) {
      await endVoiceSession()
      setIsExpanded(false)
    } else {
      await startVoiceSession()
      setIsExpanded(true)
    }
  }, [isConnected, startVoiceSession, endVoiceSession])

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  // Size classes
  const sizeClasses = {
    sm: { button: 'w-12 h-12', icon: 'w-5 h-5', panel: 'w-72' },
    md: { button: 'w-14 h-14', icon: 'w-6 h-6', panel: 'w-80' },
    lg: { button: 'w-16 h-16', icon: 'w-7 h-7', panel: 'w-96' }
  }

  // If not floating button mode, render inline
  if (!floatingButton) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <button
          onClick={handleToggleSession}
          disabled={state.isVoiceConnecting}
          className={`
            rounded-full px-5 py-2.5 font-medium transition-all
            ${isConnected 
              ? 'bg-[#0A3269] hover:bg-[#1a4a7a] text-white shadow-lg shadow-[#0A3269]/30' 
              : 'bg-[#0A3269] hover:bg-[#1a4a7a] text-white dark:bg-[#4A8ABF] dark:hover:bg-[#4A8ABF]/80 dark:text-white'
            }
            ${isSpeaking ? 'ring-4 ring-[#0A3269]/30 dark:ring-[#4A8ABF]/30 animate-pulse' : ''}
          `}
        >
          {state.isVoiceConnecting ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2 text-white dark:text-white" />
          ) : isConnected ? (
            <Mic className={`w-4 h-4 mr-2 text-white dark:text-white ${isSpeaking ? 'animate-pulse' : ''}`} />
          ) : (
            <Headphones className="w-4 h-4 mr-2 text-white dark:text-white" />
          )}
          {isConnected ? 'Listening...' : 'Voice Assistant'}
        </button>
        
        {isConnected && (
          <button
            onClick={toggleMute}
            className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400 dark:text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-slate-600 dark:text-white" />
            )}
          </button>
        )}
      </div>
    )
  }

  // Floating button mode
  return (
    <div className={`fixed ${positionClasses[position]} z-50 flex flex-col items-end gap-3 ${className}`}>
      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`
              bg-white dark:bg-slate-950 
              border border-[#0A3269]/20 dark:border-[#0A3269]/20
              rounded-2xl shadow-2xl shadow-[#0A3269]/20 dark:shadow-[#4A8ABF]/20
              overflow-hidden ${sizeClasses[size].panel}
            `}
          >
            {/* ─── Header ─────────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-[#0A3269] via-[#0A3269] to-[#1a4a7a] dark:from-[#0A3269] dark:via-[#0A3269] dark:to-[#0A3269]/80 px-5 py-4 relative">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-white to-white/80 flex items-center justify-center shadow-lg shadow-white/20">
                    <Sparkles className="w-4 h-4 text-[#0A3269] dark:text-[#0A3269]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white dark:text-white">Voice Assistant</p>
                    <p className="text-[11px] text-white/70 dark:text-white/70">Talk to apply for services</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white/60 dark:text-white/60 hover:text-white dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4 text-white dark:text-white" />
                </button>
              </div>
            </div>

            {/* ─── Status Bar ─────────────────────────────────────────── */}
            <div className="px-4 py-2.5 border-b border-[#0A3269]/15 dark:border-[#4A8ABF]/20 flex items-center justify-between bg-[#0A3269]/5 dark:bg-[#4A8ABF]/10">
              <div className="flex items-center gap-2.5">
                <div className={`relative flex items-center gap-2`}>
                  <div className={`
                    w-2 h-2 rounded-full 
                    ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}
                    ${isConnected && isSpeaking ? 'animate-pulse' : ''}
                  `} />
                  <span className="text-xs font-medium text-slate-600 dark:text-white/70">
                    {isSpeaking ? 'Speaking...' : isConnected ? 'Listening' : 'Disconnected'}
                  </span>
                </div>
              </div>
              
              {state.lastVoiceCommand && (
                <div className="flex items-center gap-1.5 text-xs text-[#0A3269] dark:text-white bg-[#0A3269]/10 dark:bg-[#4A8ABF]/20 px-2.5 py-1 rounded-full">
                  <Mic className="w-3 h-3 text-[#0A3269] dark:text-white" />
                  <span className="truncate max-w-32 text-[#0A3269] dark:text-white">{state.lastVoiceCommand}</span>
                </div>
              )}
            </div>

            {/* ─── Transcript ──────────────────────────────────────────── */}
            {showTranscript && state.transcript.length > 0 && (
              <div 
                ref={transcriptRef}
                className="max-h-48 overflow-y-auto p-4 space-y-2.5 bg-[#0A3269]/5 dark:bg-[#4A8ABF]/10"
              >
                {state.transcript.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-[#0A3269]/15 dark:border-[#4A8ABF]/20 shadow-sm"
                  >
                    <div className="h-7 w-7 rounded-full bg-[#0A3269]/10 dark:bg-[#4A8ABF]/30 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-3.5 h-3.5 text-[#0A3269] dark:text-white" />
                    </div>
                    <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed">
                      {msg}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ─── Service Info ────────────────────────────────────────── */}
            {state.selectedService && (
              <div className="px-4 py-2.5 bg-[#0A3269]/10 dark:bg-[#4A8ABF]/20 border-t border-[#0A3269]/15 dark:border-[#4A8ABF]/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-white/60">
                    <span className="font-medium text-slate-700 dark:text-white">Service:</span> {state.selectedService.name}
                  </span>
                  <span className="text-slate-500 dark:text-white/60">
                    <span className="font-medium text-slate-700 dark:text-white">Step:</span> {state.activeTab?.replace('-', ' ') || 'Selecting'}
                  </span>
                </div>
              </div>
            )}

            {/* ─── Controls ────────────────────────────────────────────── */}
            <div className="p-4 border-t border-[#0A3269]/15 dark:border-[#4A8ABF]/20 bg-white dark:bg-slate-950">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleMute}
                  className={`
                    flex-1 h-10 rounded-xl font-medium text-sm transition-all
                    flex items-center justify-center gap-2
                    ${isMuted 
                      ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30' 
                      : 'bg-[#0A3269]/10 dark:bg-[#4A8ABF]/20 text-slate-700 dark:text-white hover:bg-[#0A3269]/20 dark:hover:bg-[#4A8ABF]/30'
                    }
                  `}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-red-600 dark:text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-slate-700 dark:text-white" />
                  )}
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                
                <button
                  onClick={endVoiceSession}
                  className="flex-1 h-10 rounded-xl font-medium text-sm transition-all bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                >
                  <PhoneOff className="w-4 h-4 text-white" />
                  End Call
                </button>
              </div>

              {/* Trust indicator */}
              <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-slate-400 dark:text-white/50">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#0A3269] dark:text-white" />
                  Encrypted
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#0A3269] dark:text-white" />
                  Real-time
                </span>
                <span>•</span>
                <span>Secure</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Floating Button with Hover Tooltip ──────────────────── */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative group"
      >
        <button
          onClick={handleToggleSession}
          disabled={state.isVoiceConnecting}
          className={`
            ${sizeClasses[size].button} 
            rounded-full p-0 shadow-xl transition-all
            flex items-center justify-center
            ${isConnected 
              ? 'bg-[#0A3269] dark:bg-[#0A3269] hover:bg-[#1a4a7a] dark:hover:bg-[#0A3269]/80 shadow-[#0A3269]/30 dark:shadow-[#0A3269]/30' 
              : 'bg-gradient-to-br from-[#0A3269] to-[#1a4a7a] dark:from-[#0A3269] dark:to-[#0A3269]/80 hover:shadow-2xl hover:shadow-[#0A3269]/40 dark:hover:shadow-[#4A8ABF]/40'
            }
            ${isSpeaking ? 'ring-4 ring-[#0A3269]/40 dark:ring-[#4A8ABF]/40 animate-pulse' : ''}
            ${state.isVoiceConnecting ? 'opacity-70 cursor-not-allowed' : ''}
          `}
          aria-label="Voice assistant"
        >
          {state.isVoiceConnecting ? (
            <Loader2 className={`${sizeClasses[size].icon} text-white dark:text-white animate-spin`} />
          ) : isConnected ? (
            <Mic className={`${sizeClasses[size].icon} text-white dark:text-white ${isSpeaking ? 'animate-pulse' : ''}`} />
          ) : (
            <Headphones className={`${sizeClasses[size].icon} text-white dark:text-white`} />
          )}
        </button>

        {/* ─── HOVER TOOLTIP ───────────────────────────────────────────── */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 dark:bg-slate-800 px-3 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg border border-white/10">
          <span className="flex items-center gap-1.5">
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Voice Agent • Live
              </>
            ) : (
              <>
                <Headphones className="w-3 h-3 text-white" />
                Voice Agent
              </>
            )}
          </span>
        </div>

        {/* Status indicator dot */}
        {isConnected && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950 shadow-sm"
          />
        )}
      </motion.div>
    </div>
  )
}