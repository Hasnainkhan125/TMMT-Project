'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  X,
  Bot,
  User,
  Loader2,
  Paperclip,
  Minimize2,
  Maximize2,
  Sparkles,
  Shield,
  CheckCircle2,
  Clock,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getSocket } from '@/lib/socket';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'officer';
  timestamp: Date;
  attachments?: string[];
}

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Hello! I\'m your AI assistant. How can I help you with your visa application today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [officerOnline, setOfficerOnline] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  useEffect(() => {
    const socket = getSocket();

    socket.on('officer_status', (data: any) => {
      setOfficerOnline(data.online);
    });

    socket.on('chat_message', (data: any) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: data.message,
        sender: data.sender === 'officer' ? 'officer' : 'ai',
        timestamp: new Date(data.timestamp),
      };
      setMessages((prev) => [...prev, newMessage]);
      
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
        toast.info('New message from support', {
          description: data.message.substring(0, 50) + '...',
        });
      }
    });

    socket.on('typing_indicator', (data: any) => {
      setIsTyping(data.isTyping);
    });

    return () => {
      socket.off('officer_status');
      socket.off('chat_message');
      socket.off('typing_indicator');
    };
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('authToken');
      const socket = getSocket();

      socket.emit('chat_message', {
        message: inputMessage,
        sender: 'user',
        timestamp: new Date(),
      });

      const response = await fetch(`${apiBase}/api/v1/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || 'I understand. Let me help you with that.',
          sender: officerOnline ? 'officer' : 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`File "${file.name}" attached`);
    }
  };

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'ai':
        return <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'officer':
        return <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      default:
        return <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
  };

  const getSenderColor = (sender: string) => {
    switch (sender) {
      case 'ai':
        return 'bg-gradient-to-r from-violet-500 to-purple-500';
      case 'officer':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500';
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    }
  };

  return (
    <>
      {/* Chat Toggle Button - Fixed Position */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-18 right-2 sm:bottom-8 sm:right-8 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-10 w-10 sm:h-16 sm:w-16 md:h-[72px] md:w-[72px] rounded-full shadow-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] hover:scale-105 transition-all duration-300 relative group border-2 border-white/20"
              size="icon"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
              
              {/* Inner ring animation */}
              <div className="absolute inset-1 rounded-full border-2 border-white/10 animate-pulse" />
              
              <MessageSquare className="w-4 h-4 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white relative z-10" />
              
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-6 w-6 sm:h-7 sm:w-7 p-0 flex items-center justify-center bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] sm:text-xs font-bold border-2 border-white shadow-lg z-20 animate-bounce">
                  {unreadCount}
                </Badge>
              )}
              
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" style={{ animationDuration: '2s' }} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : undefined,
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 
              w-[calc(100vw-2rem)] sm:w-[380px] md:w-[420px] 
              max-h-[calc(100vh-2rem)] sm:max-h-[600px] md:max-h-[650px] 
              bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl 
              shadow-2xl border border-gray-200/50 dark:border-gray-700/50 
              flex flex-col overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-gray-900/95"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 p-3 sm:p-4 md:p-5 flex items-center justify-between overflow-hidden">
              
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 relative z-10 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-2 border-white/30 shadow-lg">
                    <AvatarFallback className="bg-white/20 backdrop-blur-sm text-white font-bold text-sm sm:text-base md:text-lg">
                      {officerOnline ? (
                        <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      ) : (
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-2 border-white ${
                    officerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white text-sm sm:text-base md:text-lg tracking-tight truncate">
                    {officerOnline ? 'Live Support' : 'AI Assistant'}
                  </h3>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <div className={`h-1.5 w-1.5 rounded-full ${officerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span className="text-white/80 text-[10px] sm:text-xs font-medium">
                      {officerOnline ? 'Online Now' : 'AI Available'}
                    </span>
                    {officerOnline && (
                      <Badge className="bg-emerald-500/20 text-emerald-100 border-0 text-[8px] sm:text-[9px] px-1.5 py-0 h-3.5 sm:h-4">
                        <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
                        Live
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5 sm:gap-1 relative z-10 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg sm:rounded-xl h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg sm:rounded-xl h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 bg-gradient-to-b from-violet-50/30 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                  {/* Status Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/60 dark:bg-gray-800/60 rounded-lg sm:rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-violet-500" />
                      <span className="hidden xs:inline">End-to-end encrypted</span>
                      <span className="xs:hidden">Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-violet-500" />
                      <span className="hidden xs:inline">Response time: ~30s</span>
                      <span className="xs:hidden">~30s</span>
                    </div>
                  </div>

                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex gap-2 sm:gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <Avatar className={`h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 shrink-0 shadow-md ${getSenderColor(message.sender)}`}>
                        <AvatarFallback className="text-white text-[10px] sm:text-xs">
                          {getSenderIcon(message.sender)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`max-w-[75%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 shadow-sm ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 text-white shadow-violet-500/25'
                            : 'bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-gray-200/50 dark:shadow-gray-800/50'
                        }`}
                      >
                        {message.sender !== 'user' && (
                          <div className="flex items-center gap-1 mb-1">
                            <Badge className={`text-[7px] sm:text-[8px] px-1 sm:px-1.5 py-0 h-3 sm:h-4 ${
                              message.sender === 'officer' 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0' 
                                : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-0'
                            }`}>
                              {message.sender === 'officer' ? 'Officer' : 'AI'}
                            </Badge>
                            {message.sender === 'ai' && (
                              <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-violet-400" />
                            )}
                          </div>
                        )}
                        <p className={`text-xs sm:text-sm md:text-base leading-relaxed ${
                          message.sender === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-100'
                        }`}>
                          {message.text}
                        </p>
                        <span
                          className={`text-[9px] sm:text-[10px] md:text-xs mt-1 block ${
                            message.sender === 'user' ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2 sm:gap-3"
                    >
                      <Avatar className={`h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 shadow-md ${
                        officerOnline ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'
                      }`}>
                        <AvatarFallback className="text-white text-[10px] sm:text-xs">
                          {officerOnline ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 flex items-center gap-2 shadow-sm">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-violet-400"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-violet-500"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-violet-600"
                          />
                        </div>
                        <span className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 ml-0.5 sm:ml-1">
                          {officerOnline ? 'Officer typing...' : 'AI thinking...'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-2.5 sm:p-3 md:p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <div className="flex gap-1.5 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleFileAttach}
                      className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-lg sm:rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 text-gray-500 hover:text-violet-500"
                    >
                      <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl border-gray-200/50 dark:border-gray-700/50 focus:border-violet-500 focus:ring-violet-500/20 pr-3 sm:pr-4 py-1.5 sm:py-2 md:py-2.5 h-9 sm:h-10 md:h-11"
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-lg sm:rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                      size="icon"
                    >
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-400" />
                      <span className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">Secure</span>
                    </div>
                    <div className="w-px h-3 bg-gray-200 dark:bg-gray-700" />
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
                      <span className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                        {officerOnline ? 'Officer online' : 'AI ready'}
                      </span>
                    </div>
                    <div className="w-px h-3 bg-gray-200 dark:bg-gray-700" />
                    <div className="flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                      <span className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">Instant</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChatWidget;