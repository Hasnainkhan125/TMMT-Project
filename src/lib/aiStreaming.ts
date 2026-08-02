interface StreamingOptions {
  onChunk: (chunk: string) => void
  onComplete: (fullResponse: string, actions?: any[]) => void
  onError: (error: Error) => void
  signal?: AbortSignal
}

interface ChatMessage {
  id?: string
  type?: 'user' | 'bot' | 'system' | 'amer' | 'file'
  role?: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
  metadata?: any
  isStreaming?: boolean
}

export class AIStreamingService {
  private apiUrl: string
  private authToken: string | null

  constructor() {
    this.apiUrl = `${(import.meta.env.VITE_API_BASE_URL as string)}/api/v1` || 'http://localhost:5001/api/v1'
    this.authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  }

  async streamChatResponse(
    message: string,
    context: {
      step?: number
      service?: any
      chatHistory?: ChatMessage[]
      documents?: string[]
    },
    options: StreamingOptions
  ): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
        },
        body: JSON.stringify({
          message,
          context,
          stream: true
        }),
        signal: options.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Response body is not readable')
      }

      const decoder = new TextDecoder()
      let fullResponse = ''
      let actions: any[] = []

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.trim() === '') continue
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              
              if (data === '[DONE]') {
                options.onComplete(fullResponse, actions)
                return
              }

              try {
                const parsed = JSON.parse(data)
                
                // Handle different message types for better UX
                switch (parsed.type) {
                  case 'connected':
                    console.log('✅ Streaming connection established')
                    break
                    
                  case 'content':
                    if (parsed.content) {
                      fullResponse += parsed.content
                      options.onChunk(parsed.content)
                    }
                    break
                    
                  case 'complete':
                    if (parsed.actions) {
                      actions = parsed.actions
                    }
                    if (parsed.fullResponse) {
                      fullResponse = parsed.fullResponse
                    }
                    break
                    
                  case 'error':
                    if (parsed.content) {
                      fullResponse = parsed.content
                      options.onChunk(parsed.content)
                    }
                    if (parsed.actions) {
                      actions = parsed.actions
                    }
                    break
                    
                  default:
                    // Legacy format support
                    if (parsed.content) {
                      fullResponse += parsed.content
                      options.onChunk(parsed.content)
                    }
                }
              } catch (e) {
                // Handle non-JSON chunks for backward compatibility
                if (data.trim()) {
                  fullResponse += data
                  options.onChunk(data)
                }
              }
            }
          }
        }

        options.onComplete(fullResponse, actions)
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      console.error('Streaming error:', error)
      if (error instanceof Error) {
        options.onError(error)
      } else {
        options.onError(new Error('Unknown streaming error'))
      }
    }
  }

  // Fallback to regular API if streaming is not available
  async fallbackChatResponse(
    message: string,
    context: {
      step?: number
      service?: any
      chatHistory?: ChatMessage[]
      documents?: string[]
    }
  ): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/chat/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
        },
        body: JSON.stringify({ message, context }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data?.response || 'I apologize, but I could not generate a response.'
    } catch (error) {
      console.error('Fallback chat API error:', error)
      return 'I apologize, but I am currently experiencing technical difficulties. Please try again later.'
    }
  }

  // Main method that tries streaming first, then falls back to regular API
  async getChatResponse(
    message: string,
    context: {
      step?: number
      service?: any
      chatHistory?: ChatMessage[]
      documents?: string[]
    },
    options: Partial<StreamingOptions> = {}
  ): Promise<{ response: string; actions?: any[] }> {
    return new Promise((resolve, reject) => {
      const streamOptions: StreamingOptions = {
        onChunk: options.onChunk || (() => {}),
        onComplete: (fullResponse, actions) => {
          if (options.onComplete) options.onComplete(fullResponse, actions)
          resolve({ response: fullResponse, actions })
        },
        onError: async (error) => {
          console.warn('Streaming failed, falling back to regular API:', error.message)
          
          try {
            const fallbackResponse = await this.fallbackChatResponse(message, context)
            if (options.onComplete) options.onComplete(fallbackResponse)
            resolve({ response: fallbackResponse })
          } catch (fallbackError) {
            if (options.onError) options.onError(fallbackError as Error)
            reject(fallbackError)
          }
        },
        signal: options.signal
      }

      this.streamChatResponse(message, context, streamOptions)
    })
  }
}

// Export singleton instance
export const aiStreaming = new AIStreamingService()

// Helper function to format AI responses with enhanced UX
export const formatAIResponse = (content: string): string => {
  // Add proper formatting for AI responses with better spacing
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
    .replace(/\n\n/g, '<br><br>') // Double line breaks for paragraphs
    .replace(/\n/g, '<br>') // Single line breaks
    .replace(/- (.*?)(?=\n|$)/g, '• $1') // Bullet points
    .replace(/(\d+)\. (.*?)(?=\n|$)/g, '<div class="numbered-item">$1. $2</div>') // Numbered lists
    .replace(/\*\*Important:\*\*/gi, '<div class="highlight-important">⚠️ Important:</div>') // Important callouts
    .replace(/\*\*Note:\*\*/gi, '<div class="highlight-note">📝 Note:</div>') // Note callouts
    .replace(/\*\*Tip:\*\*/gi, '<div class="highlight-tip">💡 Tip:</div>') // Tip callouts
}

// Helper to extract structured data from AI responses
export const parseStructuredResponse = (content: string) => {
  try {
    // Look for JSON blocks in the response
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      return {
        structured: JSON.parse(jsonMatch[1]),
        text: content.replace(jsonMatch[0], '').trim()
      }
    }
  } catch (e) {
    // Ignore parsing errors
  }

  return {
    structured: null,
    text: content
  }
}
