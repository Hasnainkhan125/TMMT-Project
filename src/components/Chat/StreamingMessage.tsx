import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, User, Shield, Loader2, Globe } from 'lucide-react'
import { formatAIResponse } from '@/lib/aiStreaming'

interface StreamingMessageProps {
  type: 'user' | 'ai' | 'amer' | 'system' | 'file'
  content: string
  isStreaming?: boolean
  onStreamingComplete?: () => void
  metadata?: any
  timestamp?: Date
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({
  type,
  content,
  isStreaming = false,
  onStreamingComplete,
  metadata,
  timestamp
}) => {
  const [displayedContent, setDisplayedContent] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  // Simulate streaming effect for AI responses
  useEffect(() => {
    if (type === 'ai' && isStreaming && content) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= content.length - 1) {
            clearInterval(interval)
            if (onStreamingComplete) onStreamingComplete()
            return content.length
          }
          return prev + 1
        })
      }, 20) // Adjust speed as needed

      return () => clearInterval(interval)
    } else {
      setDisplayedContent(content)
      setCurrentIndex(content.length)
    }
  }, [content, isStreaming, type, onStreamingComplete])

  useEffect(() => {
    if (isStreaming && type === 'ai') {
      setDisplayedContent(content.slice(0, currentIndex))
    } else {
      setDisplayedContent(content)
    }
  }, [currentIndex, content, isStreaming, type])

  const getIcon = () => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4 text-white" />
      case 'amer':
        return <Globe className="w-4 h-4 text-blue-600" />
      case 'system':
        return <Shield className="w-4 h-4 text-text-secondary" />
      default:
        return <Brain className="w-4 h-4 text-primary" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'user':
        return 'bg-primary'
      case 'amer':
        return 'bg-blue-100'
      case 'system':
        return 'bg-surface'
      default:
        return 'bg-surface'
    }
  }

  const getMessageStyle = () => {
    switch (type) {
      case 'user':
        return 'bg-primary text-white ml-auto'
      default:
        return 'bg-background text-foreground border border-border'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${type === 'user' ? 'flex-row-reverse' : ''} mb-4`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getBackgroundColor()}`}>
        {getIcon()}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-[80%] rounded-lg px-4 py-3 shadow-sm ${getMessageStyle()}`}>
        {/* Message Content */}
        <div className="text-sm leading-relaxed">
          {type === 'file' ? (
            <div className="space-y-2">
              {metadata?.fileUrl ? (
                metadata.fileType?.startsWith('image/') ? (
                  <div>
                    <img 
                      src={metadata.fileUrl} 
                      alt={metadata.fileName || 'Shared image'} 
                      className="max-w-xs rounded-lg shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">{metadata.fileName}</p>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-surface-light rounded-lg">
                    <div className="text-blue-600">📎</div>
                    <div>
                      <a 
                        href={metadata.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {metadata.fileName || 'Download file'}
                      </a>
                      {metadata.fileSize && (
                        <p className="text-xs text-gray-500">
                          {(metadata.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                )
              ) : metadata?.uploading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{displayedContent}</span>
                </div>
              ) : (
                <span>{displayedContent}</span>
              )}
            </div>
          ) : type === 'ai' ? (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: formatAIResponse(displayedContent) 
              }} 
            />
          ) : (
            <span>{displayedContent}</span>
          )}
          
          {/* Typing indicator for streaming */}
          {isStreaming && type === 'ai' && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
              className="inline-block w-2 h-4 bg-primary ml-1"
            />
          )}
        </div>

        {/* Metadata */}
        {metadata && (
          <div className="mt-2 text-xs text-gray-500">
            {metadata.confidence && (
              <span className="bg-surface px-2 py-1 rounded">
                Confidence: {Math.round(metadata.confidence * 100)}%
              </span>
            )}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <div className="mt-1 text-xs text-gray-400">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Typing indicator component
export const TypingIndicator: React.FC<{ sender?: string }> = ({ sender = 'AI' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-3 mb-4"
  >
    <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center">
      <Brain className="w-4 h-4 text-primary" />
    </div>
    <div className="bg-background border border-border rounded-lg px-4 py-3 shadow-sm">
      <div className="flex items-center space-x-1">
        <span className="text-sm text-text-secondary">{sender} is typing</span>
        <div className="flex space-x-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            className="w-2 h-2 bg-primary rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            className="w-2 h-2 bg-primary rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            className="w-2 h-2 bg-primary rounded-full"
          />
        </div>
      </div>
    </div>
  </motion.div>
)

export default StreamingMessage
