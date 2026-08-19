'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, MicOff, PhoneOff, Volume2, VolumeX,
  Sparkles, Loader2, X, MessageSquare, Headphones,
  Clock, ShieldCheck, Radio
} from 'lucide-react'
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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const transcriptRef = useRef<HTMLDivElement>(null)

  const { 
    state, 
    conversation, 
    startVoiceSession, 
    endVoiceSession 
  } = useVoiceAgent()

  const isConnected = conversation?.status === 'connected'
  const isSpeaking = conversation?.isSpeaking || false

  // Detect dark mode
  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

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
    md: { button: 'w-14 h-14', icon: 'w-6 h-6', panel: 'w-[22rem]' },
    lg: { button: 'w-16 h-16', icon: 'w-7 h-7', panel: 'w-[25rem]' }
  }

  // ─── Shared colours ──────────────────────────────────────────────────────
  const borderColor = isDarkMode ? 'border-white/20' : 'border-gray-200'

  // ==========================================================================
  // Inline (non-floating) mode
  // ==========================================================================
  if (!floatingButton) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <button
          onClick={handleToggleSession}
          disabled={state.isVoiceConnecting}
          className={`
            group relative overflow-hidden rounded-full px-5 py-2.5 font-medium text-sm
            transition-all duration-300 ease-out
            shadow-lg
            ${isConnected 
              ? 'bg-[#0A3269] text-white shadow-[#0A3269]/30' 
              : isDarkMode 
                ? 'bg-[#0A3269] text-white hover:bg-[#1A4A8A]' 
                : 'bg-white text-[#0A3269] border border-[#0A3269]/20 hover:bg-gray-50'
            }
          `}
        >
          {isSpeaking && (
            <span className="absolute inset-0 rounded-full ring-2 ring-white/40 animate-ping" />
          )}
          <span className="relative flex items-center">
            {state.isVoiceConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : isConnected ? (
              <Mic className={`w-4 h-4 mr-2 ${isSpeaking ? 'animate-pulse' : ''}`} />
            ) : (
              <Headphones className="w-4 h-4 mr-2" />
            )}
            {isConnected ? 'Listening…' : 'Talk to the assistant'}
          </span>
        </button>
        
        {isConnected && (
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400 dark:text-white/60" />
            ) : (
              <Volume2 className="w-4 h-4 text-slate-600 dark:text-white/80" />
            )}
          </button>
        )}
      </div>
    )
  }

  // ==========================================================================
  // Floating widget mode
  // ==========================================================================
  return (
    <div className={`fixed ${positionClasses[position]} z-50 flex flex-col items-end gap-3 ${className}`}>
      {/* ─── Expanded Panel ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`
              relative ${sizeClasses[size].panel}
              rounded-[28px] overflow-hidden
              bg-white dark:bg-black
              border ${borderColor}
              shadow-[0_20px_60px_-15px_rgba(10,50,105,0.25)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]
            `}
          >
            {/* ─── Header ─────────────────────────────────────────────── */}
            <div className="relative px-5 pt-5 pb-4 bg-[#0A3269] dark:bg-[#0A3269]/90 overflow-hidden">
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-black/90">
                    <Sparkles className="w-4.5 h-4.5 text-[#0A3269]" />
                    {isConnected && (
                      <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-[15px] text-white tracking-tight leading-tight">Voice Assistant</p>
                    <p className="text-[11.5px] text-white/60 leading-tight mt-0.5">Speak to apply for services</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  aria-label="Close"
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ─── Live voice visualizer ─────────────────────────────── */}
              <div className="relative mt-5 flex items-center justify-center h-16">
                <VoiceRings active={isConnected} speaking={isSpeaking} />
              </div>

              <p className="relative mt-2 text-center text-[11.5px] font-medium text-white/70">
                {isSpeaking ? 'Assistant is speaking' : isConnected ? 'Listening…' : 'Not connected'}
              </p>
            </div>

            {/* ─── Live command chip ──────────────────────────────────── */}
            {state.lastVoiceCommand && (
              <div className="px-4 pt-3">
                <div className="flex items-center gap-1.5 text-[11.5px] text-[#0A3269] dark:text-white/90 bg-[#0A3269]/8 dark:bg-white/10 px-3 py-1.5 rounded-xl w-fit max-w-full">
                  <Radio className="w-3 h-3 shrink-0" />
                  <span className="truncate">{state.lastVoiceCommand}</span>
                </div>
              </div>
            )}

            {/* ─── Transcript ──────────────────────────────────────────── */}
            {showTranscript && state.transcript.length > 0 && (
              <div 
                ref={transcriptRef}
                className="max-h-48 overflow-y-auto px-4 py-3 space-y-2 scroll-smooth"
              >
                {state.transcript.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    className="flex items-start gap-2 px-3 py-2.5 rounded-2xl rounded-tl-md bg-white dark:bg-black/60 border border-gray-100 dark:border-white/10"
                  >
                    <div className="h-6 w-6 mt-0.5 rounded-full bg-[#0A3269]/10 dark:bg-white/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-3 h-3 text-[#0A3269] dark:text-white/90" />
                    </div>
                    <p className="text-[13px] text-slate-700 dark:text-white/80 leading-relaxed">
                      {msg}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ─── Service Info ────────────────────────────────────────── */}
            {state.selectedService && (
              <div className="mx-4 mb-1 px-3.5 py-2.5 rounded-xl bg-[#0A3269]/6 dark:bg-white/5 border border-[#0A3269]/10 dark:border-white/10">
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-slate-500 dark:text-white/60">
                    <span className="font-semibold text-slate-700 dark:text-white/90">Service</span>{' '}
                    <span className="text-slate-600 dark:text-white/70">{state.selectedService.name}</span>
                  </span>
                  <span className="text-slate-500 dark:text-white/60">
                    <span className="font-semibold text-slate-700 dark:text-white/90">Step</span>{' '}
                    <span className="text-slate-600 dark:text-white/70">{state.activeTab?.replace('-', ' ') || 'Selecting'}</span>
                  </span>
                </div>
              </div>
            )}

            {/* ─── Controls ────────────────────────────────────────────── */}
            <div className="p-4 pt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className={`
                    flex-1 h-11 rounded-2xl font-medium text-[13px] transition-colors
                    flex items-center justify-center gap-2
                    ${isMuted 
                      ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20' 
                      : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/85 hover:bg-slate-200 dark:hover:bg-white/15'
                    }
                  `}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                
                <button
                  onClick={endVoiceSession}
                  className="flex-1 h-11 rounded-2xl font-medium text-[13px] transition-all bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
                >
                  <PhoneOff className="w-4 h-4" />
                  End call
                </button>
              </div>

              {/* Trust indicator */}
              <div className="flex items-center justify-center gap-3 mt-3.5 text-[10px] font-medium text-slate-400 dark:text-white/40">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Encrypted
                </span>
                <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-white/20" />
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Real-time
                </span>
                <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-white/20" />
                <span>Secure</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Floating Button ────────────────────────────────────── */}
      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="relative group"
      >
        <button
          onClick={handleToggleSession}
          disabled={state.isVoiceConnecting}
          className={`
            relative ${sizeClasses[size].button} 
            rounded-full p-0 flex items-center justify-center
            transition-all duration-300 ease-out
            shadow-lg
            ${isConnected 
              ? 'bg-[#0A3269] text-white shadow-[0_8px_24px_-4px_rgba(10,50,105,0.5)]' 
              : isDarkMode
                ? 'bg-[#0A3269] text-white hover:bg-[#0A3269] shadow-[0_8px_24px_-4px_rgba(10,50,105,0.4)]'
                : 'bg-[#0A3269] text-white border border-[#0A3269]/20 hover:bg-[#0A3269] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.1)]'
            }
            ${state.isVoiceConnecting ? 'opacity-70 cursor-not-allowed' : ''}
          `}
          aria-label="Voice assistant"
        >
          {state.isVoiceConnecting ? (
            <Loader2 className={`${sizeClasses[size].icon} text-current animate-spin`} />
          ) : isConnected ? (
            <Mic className={`${sizeClasses[size].icon} text-current ${isSpeaking ? 'animate-pulse' : ''}`} />
          ) : (
            <Headphones className={`${sizeClasses[size].icon} text-current`} />
          )}
        </button>

        {/* ─── HOVER TOOLTIP ───────────────────────────────────────────── */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg border border-white/10">
          <span className="flex items-center gap-1.5">
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Voice agent · Live
              </>
            ) : (
              <>
                <Headphones className="w-3 h-3" />
                Voice agent
              </>
            )}
          </span>
        </div>
      </motion.div>
    </div>
  )
}


function VoiceRings({ active, speaking }: { active: boolean; speaking: boolean }) {
  const isDark = document.documentElement.classList.contains('dark')
  const ringColor = isDark ? 'border-white/30' : 'border-[#0A3269]/30'
  const centerBg = active ? (isDark ? 'bg-black' : 'bg-white') : 'bg-white/15'
  const iconColor = active ? (isDark ? 'text-white' : 'text-[#0A3269]') : 'text-white/50'

  return (
    <div className="relative flex items-center justify-center w-14 h-14">
      {active && (
        <>
          <motion.span
            className={`absolute inset-0 rounded-full border ${ringColor}`}
            animate={speaking ? { scale: [1, 1.9], opacity: [0.5, 0] } : { scale: 1, opacity: 0.25 }}
            transition={speaking ? { duration: 1.4, repeat: Infinity, ease: 'easeOut' } : {}}
          />
          <motion.span
            className={`absolute inset-0 rounded-full border ${ringColor}`}
            animate={speaking ? { scale: [1, 1.9], opacity: [0.5, 0] } : { scale: 1, opacity: 0.25 }}
            transition={speaking ? { duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.45 } : {}}
          />
          <motion.span
            className={`absolute inset-0 rounded-full border ${ringColor}`}
            animate={speaking ? { scale: [1, 1.9], opacity: [0.5, 0] } : { scale: 1, opacity: 0.25 }}
            transition={speaking ? { duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.9 } : {}}
          />
        </>
      )}
      <motion.div
        animate={active && !speaking ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={active && !speaking ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
        className={`relative h-11 w-11 rounded-full flex items-center justify-center ${centerBg} shadow-lg`}
      >
        {active ? (
          <Mic className={`w-4.5 h-4.5 ${iconColor} ${speaking ? 'animate-pulse' : ''}`} />
        ) : (
          <MicOff className={`w-4.5 h-4.5 ${iconColor}`} />
        )}
      </motion.div>
    </div>
  )
}