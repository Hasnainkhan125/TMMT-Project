import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { ScrollArea } from './scroll-area';
import { Separator } from './separator';
import { 
  Send, 
  Phone, 
  Video, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageCircle, 
  User, 
  Bot,
  Clock,
  Check,
  CheckCheck,
  MoreVertical,
  Paperclip,
  Smile
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { useWebSocket, ChatMessage as WebSocketMessage } from '@/hooks/useWebSocket';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'officer' | 'system';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'file' | 'image';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  };
}

interface ChatInterfaceProps {
  officerId?: string;
  officerName?: string;
  officerAvatar?: string;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
  isConnected?: boolean;
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  officerId = 'immigration-officer-001',
  officerName = 'Officer Ahmed',
  officerAvatar = '/api/avatars/officer.jpg',
  onVoiceCall,
  onVideoCall,
  isConnected = true,
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Welcome to TAMMAT! I\'m Officer Ahmed, your dedicated immigration specialist. How can I assist you with your visa application today?',
      sender: 'officer',
      timestamp: new Date(Date.now() - 60000),
      status: 'read',
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WebSocket integration
  const {
    isConnected: wsConnected,
    currentRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    uploadFile,
    requestVoiceCall,
    requestVideoCall,
    endCall
  } = useWebSocket({
    onMessage: (message: WebSocketMessage) => {
      // Convert WebSocket message to local format
      const localMessage: ChatMessage = {
        id: message.id,
        content: message.content,
        sender: message.sender === 'user' ? 'user' : 'officer',
        timestamp: message.timestamp,
        status: message.status,
        type: message.type,
        metadata: message.metadata
      };
      setMessages(prev => [...prev, localMessage]);
    },
    onUserTyping: (data) => {
      if (data.userId !== 'user') {
        setIsTyping(data.isTyping);
      }
    },
    onVoiceCallRequest: (data) => {
      // Handle incoming voice call request
      console.log('Voice call request from:', data.from);
    },
    onVideoCallRequest: (data) => {
      // Handle incoming video call request
      console.log('Video call request from:', data.from);
    },
    onCallEnded: (data) => {
      // Handle call end
      if (data.callType === 'voice') {
        setIsVoiceCallActive(false);
      } else if (data.callType === 'video') {
        setIsVideoCallActive(false);
      }
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-join chat room when WebSocket connects
  useEffect(() => {
    if (wsConnected && !currentRoom) {
      const roomId = `room-${officerId}-${Date.now()}`;
      joinRoom(roomId, 'user', officerId);
    }
  }, [wsConnected, currentRoom, joinRoom, officerId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !attachedFile) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage || 'File attached',
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      type: attachedFile ? 'file' : 'text',
      metadata: attachedFile ? {
        fileName: attachedFile.name,
        fileSize: attachedFile.size,
        fileType: attachedFile.type
      } : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setAttachedFile(null);

    // Send message via WebSocket if connected
    if (wsConnected && currentRoom) {
      const wsMessage = {
        content: newMessage.content,
        type: newMessage.type,
        metadata: newMessage.metadata
      };
      sendMessage(currentRoom, wsMessage, 'user');
      
      // Update message status to sent
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'sent' as const }
              : msg
          )
        );
      }, 1000);
    } else {
      // Fallback to simulation if WebSocket not connected
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'sent' as const }
              : msg
          )
        );
      }, 1000);

      // Simulate officer typing and response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const officerResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: generateOfficerResponse(inputMessage),
          sender: 'officer',
          timestamp: new Date(),
          status: 'read',
          type: 'text'
        };
        setMessages(prev => [...prev, officerResponse]);
      }, 2000 + Math.random() * 3000);
    }
  };

  const generateOfficerResponse = (userMessage: string): string => {
    const responses = [
      "Thank you for your message. I understand your concern and I'm here to help you through the process.",
      "That's a great question! Let me explain the visa requirements in detail.",
      "I can see you're well-prepared. Let me guide you through the next steps.",
      "Based on your situation, I recommend we proceed with the following approach.",
      "I appreciate you sharing this information. Let me clarify the documentation requirements.",
      "You're absolutely right to ask about this. Here's what you need to know.",
      "I'm here to ensure your application process goes smoothly. Let me help you with the details.",
      "That's an important point. Let me walk you through the process step by step."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleVoiceCall = () => {
    if (wsConnected && currentRoom) {
      if (!isVoiceCallActive) {
        // Start voice call
        requestVoiceCall(currentRoom, 'user', officerId);
        setIsVoiceCallActive(true);
      } else {
        // End voice call
        endCall(currentRoom, 'user', 'voice');
        setIsVoiceCallActive(false);
      }
    } else {
      // Fallback to local state
      setIsVoiceCallActive(!isVoiceCallActive);
      onVoiceCall?.();
    }
  };

  const handleVideoCall = () => {
    if (wsConnected && currentRoom) {
      if (!isVideoCallActive) {
        // Start video call
        requestVideoCall(currentRoom, 'user', officerId);
        setIsVideoCallActive(true);
      } else {
        // End video call
        endCall(currentRoom, 'user', 'video');
        setIsVideoCallActive(false);
      }
    } else {
      // Fallback to local state
      setIsVideoCallActive(!isVideoCallActive);
      onVideoCall?.();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-slate-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-slate-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-white/20">
              <AvatarImage src={officerAvatar} alt={officerName} />
              <AvatarFallback className="bg-background/20 text-white">
                {officerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{officerName}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={wsConnected ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {wsConnected ? 'Online' : 'Offline'}
                </Badge>
                <span className="text-sm text-white/80">Immigration Officer</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isVoiceCallActive ? "destructive" : "secondary"}
              onClick={handleVoiceCall}
              className="bg-background/20 hover:bg-background/30 border-white/30"
            >
              {isVoiceCallActive ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            </Button>
            
            <Button
              size="sm"
              variant={isVideoCallActive ? "destructive" : "secondary"}
              onClick={handleVideoCall}
              className="bg-background/20 hover:bg-background/30 border-white/30"
            >
              {isVideoCallActive ? <PhoneOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="bg-background/20 hover:bg-background/30 text-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Chat History</DropdownMenuItem>
                <DropdownMenuItem>Report Issue</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-96 w-full">
          <div className="p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'officer' && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={officerAvatar} alt={officerName} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {officerName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-xs lg:max-w-md ${
                    message.sender === 'user' ? 'order-first' : ''
                  }`}>
                    <div className={`rounded-2xl px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-slate-100 text-foreground'
                    }`}>
                      {message.type === 'file' && message.metadata ? (
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{message.metadata.fileName}</div>
                            <div className="text-xs opacity-80">
                              {(message.metadata.fileSize / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-1 mt-1 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className="text-xs text-slate-500">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender === 'user' && getStatusIcon(message.status)}
                    </div>
                  </div>
                  
                  {message.sender === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {officerName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-slate-100 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-slate-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                      className="w-2 h-2 bg-slate-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-slate-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-4">
          {attachedFile && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {attachedFile.name}
                  </span>
                  <span className="text-xs text-blue-600">
                    ({(attachedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAttachedFile(null)}
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <Textarea
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                // Send typing indicators via WebSocket
                if (wsConnected && currentRoom) {
                  if (e.target.value.length > 0) {
                    startTyping(currentRoom, 'user');
                  } else {
                    stopTyping(currentRoom, 'user');
                  }
                }
              }}
              placeholder="Type your message..."
              className="min-h-[44px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                  // Stop typing when message is sent
                  if (wsConnected && currentRoom) {
                    stopTyping(currentRoom, 'user');
                  }
                }
              }}
              onBlur={() => {
                // Stop typing when input loses focus
                if (wsConnected && currentRoom) {
                  stopTyping(currentRoom, 'user');
                }
              }}
            />
            
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() && !attachedFile}
              className="flex-shrink-0 bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileAttach}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface; 