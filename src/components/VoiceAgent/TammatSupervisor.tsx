import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Send, Upload, User, Sparkles, MessageSquare, Brain, PhoneCall,
  Minimize2, Clock, ShieldCheck, Paperclip, X, ArrowUp,
  CheckCircle2, AlertCircle, Loader2, Bot, Headphones, Crown,
  Zap, Gift, Info, Lock, Star, Users, FileText, Check,
  AlertTriangle, GraduationCap, TrendingUp, File, Image as ImageIcon,
  FileCode, FileSpreadsheet, FileArchive, FileJson, FileIcon,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { getSocket } from '@/lib/socket';
import { StreamingMessage, TypingIndicator } from '@/components/Chat/StreamingMessage';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────
type ChatMode = 'ai' | 'specialist' | 'voice';
type ConnectionStatus = 'idle' | 'requesting' | 'pending' | 'connected' | 'no_officers';
type QuestionComplexity = 'simple' | 'complex' | 'requires_human';

type ChatMessage = {
  id: string;
  type: 'user' | 'bot' | 'system' | 'specialist' | 'file' | 'escalation';
  content: string;
  timestamp: Date;
  metadata?: any;
  isStreaming?: boolean;
  complexity?: QuestionComplexity;
  escalated?: boolean;
};

// ─── File preview type ─────────────────────────────────────────────────────
type FilePreview = {
  id: string;
  file: File;
  previewUrl?: string;
  progress: number;
  status: 'uploading' | 'uploaded' | 'error';
  error?: string;
};

// ─── Free trial configuration ──────────────────────────────────────────────
const FREE_TRIAL_CONFIG = {
  MAX_QUESTIONS: 3,
  MAX_ESCALATIONS: 1,
} as const;

// ─── Anonymous identity helper ──────────────────────────────────────────────
const getAnonId = (): string => {
  let id = localStorage.getItem('tammat:anonId');
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('tammat:anonId', id);
  }
  return id;
};

// ─── Free trial tracking ──────────────────────────────────────────────────
const getFreeTrialData = () => {
  const data = localStorage.getItem('tammat:freeTrialData');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return { questionsUsed: 0, escalationsUsed: 0 };
    }
  }
  return { questionsUsed: 0, escalationsUsed: 0 };
};

const updateFreeTrialData = (updates: Partial<{ questionsUsed: number; escalationsUsed: number }>) => {
  const current = getFreeTrialData();
  const updated = { ...current, ...updates };
  localStorage.setItem('tammat:freeTrialData', JSON.stringify(updated));
  return updated;
};

const canUseAI = (isSubscribed: boolean): boolean => {
  if (isSubscribed) return true;
  const data = getFreeTrialData();
  return data.questionsUsed < FREE_TRIAL_CONFIG.MAX_QUESTIONS;
};

const canEscalate = (isSubscribed: boolean): boolean => {
  if (isSubscribed) return true;
  const data = getFreeTrialData();
  return data.escalationsUsed < FREE_TRIAL_CONFIG.MAX_ESCALATIONS;
};

const getRemainingQuestions = (isSubscribed: boolean): number => {
  if (isSubscribed) return Infinity;
  const data = getFreeTrialData();
  return Math.max(0, FREE_TRIAL_CONFIG.MAX_QUESTIONS - data.questionsUsed);
};

const getRemainingEscalations = (isSubscribed: boolean): number => {
  if (isSubscribed) return Infinity;
  const data = getFreeTrialData();
  return Math.max(0, FREE_TRIAL_CONFIG.MAX_ESCALATIONS - data.escalationsUsed);
};

// ─── File type helpers ─────────────────────────────────────────────────────
const getFileIcon = (file: File) => {
  const type = file.type;
  const name = file.name.toLowerCase();
  
  if (type.startsWith('image/')) return ImageIcon;
  if (type === 'application/pdf') return FileText;
  if (type.includes('spreadsheet') || type.includes('excel') || name.endsWith('.xlsx') || name.endsWith('.xls')) return FileSpreadsheet;
  if (type.includes('word') || name.endsWith('.docx') || name.endsWith('.doc')) return FileCode;
  if (type.includes('zip') || type.includes('rar') || name.endsWith('.zip') || name.endsWith('.rar')) return FileArchive;
  if (type.includes('json') || name.endsWith('.json')) return FileJson;
  return FileIcon;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// ─── Complexity detection ──────────────────────────────────────────────────
const detectComplexity = (message: string): QuestionComplexity => {
  const lower = message.toLowerCase();
  
  const complexKeywords = [
    'complex', 'complicated', 'urgent', 'emergency', 'appeal', 'dispute',
    'nawakas', 'absconding', 'mercy letter', 'cancellation', 'appeal',
    'overstay', 'ban', 'blacklist', 'court', 'legal', 'lawyer',
    'appeal', 'objection', 'complaint', 'investigation', 'violation',
    'serious', 'critical', 'difficult', 'confusing', 'unclear'
  ];
  
  const simpleKeywords = [
    'how to', 'what is', 'where', 'when', 'who', 'which',
    'check', 'status', 'fee', 'cost', 'price', 'timing',
    'document', 'form', 'application', 'process', 'step',
    'renew', 'update', 'change', 'modify', 'correct'
  ];

  for (const keyword of complexKeywords) {
    if (lower.includes(keyword)) {
      return 'complex';
    }
  }

  for (const keyword of simpleKeywords) {
    if (lower.includes(keyword)) {
      return 'simple';
    }
  }

  if (lower.includes('?') || lower.includes('how') || lower.includes('what')) {
    return 'simple';
  }

  return 'complex';
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const TammatSupervisor = ({
}) => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ur';
  const isSubscribed = user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing';

  // ─── Panel state ──────────────────────────────────────────────────────────
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [chatMode, setChatMode] = useState<ChatMode>('ai');

  // ─── Connection state ─────────────────────────────────────────────────────
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [specialistInfo, setSpecialistInfo] = useState<{ name: string; id: string } | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

  // ─── Chat state ───────────────────────────────────────────────────────────
  const [aiChat, setAiChat] = useState<ChatMessage[]>([]);
  const [specialistChat, setSpecialistChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isAIStreaming, setIsAIStreaming] = useState(false);
  const [isSpecialistTyping, setIsSpecialistTyping] = useState(false);
  const [trialData, setTrialData] = useState(getFreeTrialData());
  const [showSubscribePrompt, setShowSubscribePrompt] = useState(false);
  const [pendingEscalation, setPendingEscalation] = useState<string | null>(null);

  // ─── File upload state ────────────────────────────────────────────────────
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── DOM refs ─────────────────────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001';
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';

  // ─── Auto-scroll ──────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  // ─── Current chat ─────────────────────────────────────────────────────────
  const currentChat = chatMode === 'specialist' ? specialistChat : aiChat;
  const setCurrentChat = chatMode === 'specialist' ? setSpecialistChat : setAiChat;

  // ─── Socket setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }
    const sock = getSocket() as unknown as Socket;
    setSocket(sock);
  }, [token]);

  // ─── Socket event listeners ───────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onSpecialistConnected = (payload: any) => {
      setRoomId(payload?.chatId || payload?.roomId);
      setConnectionStatus('connected');
      setSpecialistInfo({
        name: payload?.specialistName || 'TMMT Specialist',
        id: payload?.specialistId || 'unknown',
      });
      setPendingRequestId(null);
      
      if (pendingEscalation) {
        addSystem(
          `Your case has been escalated to a specialist. ${payload?.specialistName || 'TMMT Specialist'} is now reviewing your issue.`,
          'specialist'
        );
        setPendingEscalation(null);
      } else {
        addSystem(`Connected to ${payload?.specialistName || 'TMMT Specialist'}. You can now chat live.`, 'specialist');
      }
      
      toast.success('Specialist is now in the chat', {
        description: `${payload?.specialistName || 'Specialist'} just joined.`,
      });
    };

    const onRequestSent = (payload: any) => {
      setConnectionStatus('pending');
      setPendingRequestId(payload?.requestId);
      addSystem(
        `Request sent. ${payload?.specialistsCount || 'Available'} specialists notified — typical reply time is 2 minutes.`,
        'specialist'
      );
    };

    const onNoSpecialists = (payload: any) => {
      setConnectionStatus('no_officers');
      addSystem(
        payload?.message || 'No specialists online right now. Leave a message and we will reply within 1 hour.',
        'specialist'
      );
      setTimeout(() => setConnectionStatus('idle'), 4000);
    };

    const onNewMessage = (msg: any) => {
      const isFile = msg.type === 'file';
      const isEscalation = msg.type === 'escalation';
      
      const newMessage: ChatMessage = {
        id: msg.id || Date.now().toString(),
        type: isFile ? 'file' : isEscalation ? 'escalation' : msg.sender === 'user' ? 'user' : 'specialist',
        content: isFile ? msg.metadata?.fileName || 'File shared' : msg.content,
        metadata: msg.metadata,
        timestamp: new Date(msg.timestamp || Date.now()),
        escalated: isEscalation,
      };

      if (msg.sender === 'specialist' || msg.type === 'specialist' || isEscalation) {
        setSpecialistChat((prev) => (prev.some((p) => p.id === msg.id) ? prev : [...prev, newMessage]));
        if (chatMode !== 'specialist') setChatMode('specialist');
      } else {
        setCurrentChat((prev) => (prev.some((p) => p.id === msg.id) ? prev : [...prev, newMessage]));
      }
      scrollToBottom();
    };

    const onTyping = (p: any) => setIsSpecialistTyping(!!p?.isTyping);

    const onChatEnded = (payload: any) => {
      setConnectionStatus('idle');
      setRoomId(null);
      setSpecialistInfo(null);
      addSystem(payload.message || `Chat ended: ${payload.reason}`, 'specialist');
    };

    socket.on('specialist_connected', onSpecialistConnected);
    socket.on('request_sent', onRequestSent);
    socket.on('no_specialists_available', onNoSpecialists);
    socket.on('new_message', onNewMessage);
    socket.on('user_typing', onTyping);
    socket.on('chat_ended', onChatEnded);

    return () => {
      socket.off('specialist_connected', onSpecialistConnected);
      socket.off('request_sent', onRequestSent);
      socket.off('no_specialists_available', onNoSpecialists);
      socket.off('new_message', onNewMessage);
      socket.off('user_typing', onTyping);
      socket.off('chat_ended', onChatEnded);
    };
  }, [socket, chatMode, scrollToBottom, pendingEscalation]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const addSystem = (content: string, target: 'ai' | 'specialist' = 'ai') => {
    const msg: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      type: 'system',
      content,
      timestamp: new Date(),
    };
    if (target === 'specialist') setSpecialistChat((p) => [...p, msg]);
    else setAiChat((p) => [...p, msg]);
    scrollToBottom();
  };

  // ─── Send: AI streaming with complexity detection ──────────────────────
  const sendAIMessage = async (content: string) => {
    if (!canUseAI(isSubscribed)) {
      setShowSubscribePrompt(true);
      addSystem(
        'You have used all your free questions. Subscribe to TMMT for unlimited AI access and specialist support.',
        'ai'
      );
      return;
    }

    const complexity = detectComplexity(content);
    const shouldEscalate = complexity === 'complex' && canEscalate(isSubscribed);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      complexity,
    };
    setAiChat((prev) => [...prev, userMsg]);
    scrollToBottom();

    if (shouldEscalate) {
      if (!isSubscribed) {
        const updated = updateFreeTrialData({ escalationsUsed: trialData.escalationsUsed + 1 });
        setTrialData(updated);
      }
      
      setPendingEscalation(content);
      addSystem(
        'This seems like a complex issue. I\'m connecting you to a specialist who can provide detailed assistance.',
        'ai'
      );
      
      setChatMode('specialist');
      setTimeout(() => requestSpecialist(content), 500);
      return;
    }

    if (!isSubscribed) {
      const updated = updateFreeTrialData({ questionsUsed: trialData.questionsUsed + 1 });
      setTrialData(updated);
    }

    setIsAIStreaming(true);

    const botId = (Date.now() + 1).toString();
    setAiChat((prev) => [
      ...prev,
      { id: botId, type: 'bot', content: '', timestamp: new Date(), isStreaming: true, complexity: 'simple' },
    ]);

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        headers['X-Anon-Id'] = getAnonId();
      }

      const res = await fetch(`${apiBase}/api/v1/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: content,
          chatHistory: aiChat.slice(-10),
          context: { 
            authenticated: !!token,
            isSubscribed,
            freeTrialData: trialData,
            remainingQuestions: getRemainingQuestions(isSubscribed),
            remainingEscalations: getRemainingEscalations(isSubscribed),
            complexity,
            shouldEscalate,
          },
        }),
      });

      if (!res.body) throw new Error('No stream body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';
      let detectedComplexity: QuestionComplexity = 'simple';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content' && parsed.content) {
              fullResponse += parsed.content;
              setAiChat((prev) =>
                prev.map((m) => (m.id === botId ? { ...m, content: m.content + parsed.content } : m))
              );
              scrollToBottom();
            }
            if (parsed.type === 'complete') {
              setAiChat((prev) =>
                prev.map((m) =>
                  m.id === botId ? { ...m, content: parsed.fullResponse || fullResponse, isStreaming: false } : m
                )
              );
              const lower = (parsed.fullResponse || fullResponse).toLowerCase();
              
              if (
                lower.includes('complex') ||
                lower.includes('specialist') ||
                lower.includes('human') ||
                lower.includes('review') ||
                lower.includes('escalate') ||
                lower.includes('nawakas') ||
                lower.includes('fine') ||
                lower.includes('absconding') ||
                lower.includes('mercy letter') ||
                lower.includes('cancellation') ||
                lower.includes('appeal')
              ) {
                detectedComplexity = 'complex';
              }
            }
          } catch (e) {}
        }
      }

      if (detectedComplexity === 'complex' && canEscalate(isSubscribed)) {
        setTimeout(() => {
          setAiChat((prev) =>
            prev.map((m) =>
              m.id === botId ? { ...m, complexity: 'complex' } : m
            )
          );
          
          setAiChat((prev) => [
            ...prev,
            {
              id: Date.now().toString() + '_escalate',
              type: 'system',
              content: '',
              timestamp: new Date(),
              metadata: { 
                action: 'escalate_to_specialist',
                complexity: 'complex',
                originalQuestion: content
              },
            },
          ]);
          scrollToBottom();
        }, 800);
      }
    } catch (err) {
      setAiChat((prev) =>
        prev.map((m) =>
          m.id === botId
            ? { ...m, content: 'Sorry, I had trouble responding. Try again in a moment.', isStreaming: false }
            : m
        )
      );
    } finally {
      setIsAIStreaming(false);
    }
  };

  // ─── Send: Specialist chat ──────────────────────────────────────────────────
  const sendSpecialistMessage = (content: string) => {
    if (!user) {
      toast.error('Please log in to chat with a specialist');
      return;
    }
    if (!socket || !roomId) {
      toast.error('Connection not ready — requesting specialist first');
      requestSpecialist();
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setSpecialistChat((prev) => [...prev, userMsg]);
    scrollToBottom();
    socket.emit('chat_message', { message: content, chatId: roomId, type: 'text' });
  };

  // ─── Send dispatcher ──────────────────────────────────────────────────────
  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;
    setInput('');

    if (chatMode === 'ai') {
      await sendAIMessage(content);
    } else if (chatMode === 'specialist') {
      sendSpecialistMessage(content);
    }
  };

  // ─── Request Specialist ─────────────────────────────────────────────────
  const requestSpecialist = (context?: string) => {
    if (!user) {
      toast.error('Please log in', {
        description: 'Live chat with a specialist requires an account so we can save your application.',
        action: { label: 'Log in', onClick: () => (window.location.href = '/auth?redirect=' + window.location.pathname) },
      });
      return;
    }
    
    if (!isSubscribed && !canEscalate(isSubscribed)) {
      toast.error('You have used your free escalation', {
        description: 'Subscribe to TMMT for unlimited access to specialists.',
        action: { label: 'Subscribe', onClick: () => (window.location.href = '/subscription') },
      });
      return;
    }

    if (!socket) {
      toast.error('Connection unavailable. Please refresh.');
      return;
    }
    if (connectionStatus === 'pending') {
      toast.info('Request already pending');
      return;
    }
    if (connectionStatus === 'connected') return;

    setConnectionStatus('requesting');
    socket.emit('request_specialist_connection', {
      service: 'visa application',
      userId: user?.id,
      userData: { name: user?.name || 'User', email: user?.email || '' },
      timestamp: new Date().toISOString(),
      context: context || 'General inquiry',
      isEscalation: !!context,
    });
    addSystem('Looking for an available TMMT specialist…', 'specialist');
  };

  // ─── Handle Escalation ──────────────────────────────────────────────────
  const handleEscalation = (question: string) => {
    if (!canEscalate(isSubscribed)) {
      toast.error('No escalations remaining', {
        description: 'Subscribe to TMMT for unlimited specialist access.',
        action: { label: 'Subscribe', onClick: () => (window.location.href = '/subscription') },
      });
      return;
    }
    
    setPendingEscalation(question);
    setChatMode('specialist');
    requestSpecialist(question);
  };

  // ─── File upload with preview ─────────────────────────────────────────
  const handleFiles = async (files: File[]) => {
    if (!user) {
      toast.error('Please log in to upload files');
      return;
    }

    if (!isSubscribed) {
      toast.info('File sharing available with subscription', {
        description: 'Subscribe to TMMT to share documents.',
        action: { label: 'Subscribe', onClick: () => (window.location.href = '/subscription') },
      });
      return;
    }

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      const previewId = Date.now().toString() + '_' + Math.random().toString(36).slice(2, 6);
      let previewUrl: string | undefined;
      
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }

      const filePreview: FilePreview = {
        id: previewId,
        file,
        previewUrl,
        progress: 0,
        status: 'uploading',
      };

      setFilePreviews((prev) => [...prev, filePreview]);

      const fileMsg: ChatMessage = {
        id: previewId,
        type: 'file',
        content: `Uploading ${file.name}…`,
        timestamp: new Date(),
        metadata: { 
          fileName: file.name, 
          fileSize: file.size, 
          fileType: file.type, 
          uploading: true,
          previewId,
        },
      };
      setSpecialistChat((p) => [...p, fileMsg]);

      try {
        const progressInterval = setInterval(() => {
          setFilePreviews((prev) =>
            prev.map((p) =>
              p.id === previewId
                ? { ...p, progress: Math.min(p.progress + 10, 90) }
                : p
            )
          );
        }, 200);

        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${apiBase}/api/v1/chat/upload?roomId=${roomId || 'general'}`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: form,
        });

        clearInterval(progressInterval);

        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        const { fileUrl } = data.data || {};

        setFilePreviews((prev) =>
          prev.map((p) =>
            p.id === previewId
              ? { ...p, progress: 100, status: 'uploaded' }
              : p
          )
        );

        setTimeout(() => {
          setFilePreviews((prev) => prev.filter((p) => p.id !== previewId));
        }, 3000);

        setSpecialistChat((p) =>
          p.map((m) =>
            m.id === previewId
              ? { 
                  ...m, 
                  content: file.name, 
                  metadata: { 
                    ...m.metadata, 
                    fileUrl, 
                    uploading: false,
                    uploaded: true,
                  } 
                }
              : m
          )
        );

        if (socket && roomId) {
          socket.emit('file_upload_complete', {
            chatId: roomId,
            userId: user.id,
            fileUrl,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          });
        }
        toast.success(`${file.name} uploaded`);
      } catch {
        setFilePreviews((prev) =>
          prev.map((p) =>
            p.id === previewId
              ? { ...p, status: 'error', error: 'Upload failed' }
              : p
          )
        );

        setSpecialistChat((p) =>
          p.map((m) =>
            m.id === previewId
              ? { ...m, content: `Failed: ${file.name}`, metadata: { error: true } }
              : m
          )
        );

        setTimeout(() => {
          setFilePreviews((prev) => prev.filter((p) => p.id !== previewId));
        }, 5000);
      }
    }
    setShowUpload(false);
  };

  // ─── Remove file preview ────────────────────────────────────────────────
  const removeFilePreview = (id: string) => {
    setFilePreviews((prev) => {
      const preview = prev.find(p => p.id === id);
      if (preview?.previewUrl) {
        URL.revokeObjectURL(preview.previewUrl);
      }
      return prev.filter(p => p.id !== id);
    });
  };

  // ─── Drag handlers ────────────────────────────────────────────────────────
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setShowUpload(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  // ─── Check if user has any free trials left ──────────────────────────────
  const hasFreeTrialsLeft = () => {
    if (isSubscribed) return true;
    const data = getFreeTrialData();
    return data.questionsUsed < FREE_TRIAL_CONFIG.MAX_QUESTIONS || 
           data.escalationsUsed < FREE_TRIAL_CONFIG.MAX_ESCALATIONS;
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  if (isCollapsed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-20 right-6 z-50"
      >
        <button
          onClick={() => setIsCollapsed(false)}
className="group relative h-14 w-14 rounded-full bg-gradient-to-br from-[#0A3269] to-[#1a4a7a] dark:from-[#4A8ABF] dark:to-[#4A8ABF]/80 hover:shadow-lg hover:shadow-[#0A3269]/30 dark:hover:shadow-[#4A8ABF]/30 transition-all hover:scale-105"          aria-label="Open chat"
        >
          <MessageSquare className="absolute inset-0 m-auto h-6 w-6 text-white" strokeWidth={1.5} />
          {connectionStatus === 'connected' && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
            </span>
          )}
          {!isSubscribed && hasFreeTrialsLeft() && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white border-2 border-white shadow-sm">
              {getRemainingQuestions(isSubscribed) + getRemainingEscalations(isSubscribed)}
            </span>
          )}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900/95 backdrop-blur-sm px-3 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
            <span className="flex items-center gap-1.5">
              {connectionStatus === 'connected' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Live Chat
                </>
              ) : (
                <>
                  <MessageSquare className="w-3 h-3 text-white" />
                  TMMT Assistant
                </>
              )}
            </span>
          </span>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-20 right-6 z-50 w-[min(420px,calc(100vw-2rem))] h-[min(640px,calc(100vh-3rem))] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-[#0A3269]/25 bg-white dark:bg-slate-950 border border-[#0A3269]/20 dark:border-slate-800/60"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ─── HEADER ─────────────────────────────────────────────────────── */}
      <ChatHeader
        chatMode={chatMode}
        connectionStatus={connectionStatus}
        specialistInfo={specialistInfo}
        isSubscribed={isSubscribed}
        onClose={() => setIsCollapsed(true)}
      />

      {/* ─── TRIAL STATUS BANNER ──────────────────────────────────────── */}
      {!isSubscribed && (
        <TrialStatusBanner 
          trialData={trialData}
          onSubscribe={() => window.location.href = '/subscription'}
          maxQuestions={FREE_TRIAL_CONFIG.MAX_QUESTIONS}
          maxEscalations={FREE_TRIAL_CONFIG.MAX_ESCALATIONS}
        />
      )}

      {/* ─── MODE SWITCHER ──────────────────────────────────────────────── */}
      <ChatModeSwitcher
        chatMode={chatMode}
        onModeChange={(m) => {
          setChatMode(m);
          if (m === 'specialist' && connectionStatus === 'idle') {
            if (!isSubscribed && !canEscalate(isSubscribed)) {
              toast.error('No escalations remaining', {
                description: 'Subscribe to TMMT for unlimited specialist access.',
                action: { label: 'Subscribe', onClick: () => (window.location.href = '/subscription') },
              });
              return;
            }
            requestSpecialist();
          }
          if (m === 'voice') toast.info('Voice call feature coming soon');
        }}
        hasUser={!!user}
        isSubscribed={isSubscribed}
        remainingEscalations={getRemainingEscalations(isSubscribed)}
      />

      {/* ─── MESSAGES ───────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0A3269]/5 via-white/50 to-white dark:from-[#0A3269]/10 dark:via-slate-950/80 dark:to-slate-950 relative"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={onDrop}
      >
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/85 backdrop-blur-sm"
            >
              <div className="text-center">
                <Upload className="h-12 w-12 text-white mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-white font-medium">Drop file to share</p>
                <p className="text-white/60 text-xs mt-1">PDF, image, or document up to 10MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 py-5 space-y-4">
          {currentChat.length === 0 && (
            <EmptyState 
              chatMode={chatMode} 
              onSuggestionClick={(s) => setInput(s)}
              isSubscribed={isSubscribed}
              remainingQuestions={getRemainingQuestions(isSubscribed)}
              remainingEscalations={getRemainingEscalations(isSubscribed)}
            />
          )}

          {currentChat.map((m, idx) => (
            <React.Fragment key={`${m.id}-${idx}`}>
              {m.metadata?.action === 'escalate_to_specialist' ? (
                <EscalationCard 
                  question={m.metadata?.originalQuestion || 'Your question'}
                  onEscalate={() => handleEscalation(m.metadata?.originalQuestion || '')}
                  canEscalate={canEscalate(isSubscribed)}
                  remainingEscalations={getRemainingEscalations(isSubscribed)}
                />
              ) : (
                <StreamingMessage
                  type={m.type === 'bot' ? 'ai' : (m.type as any)}
                  content={m.content}
                  isStreaming={m.isStreaming}
                  metadata={{
                    ...m.metadata,
                    complexity: m.complexity,
                    escalated: m.escalated,
                  }}
                  timestamp={m.timestamp}
                />
              )}
            </React.Fragment>
          ))}

          {isAIStreaming && currentChat[currentChat.length - 1]?.isStreaming !== true && (
            <TypingIndicator sender="TMMT AI" />
          )}
          {isSpecialistTyping && <TypingIndicator sender={specialistInfo?.name || 'TMMT Specialist'} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ─── FILE PREVIEWS AT BOTTOM ────────────────────────────────────── */}
      {filePreviews.length > 0 && (
        <div className="px-3 py-2 flex gap-2 overflow-x-auto border-t border-[#0A3269]/15 dark:border-slate-800/60 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm">
          {filePreviews.map((preview) => (
            <FilePreviewItem
              key={preview.id}
              preview={preview}
              onRemove={() => removeFilePreview(preview.id)}
            />
          ))}
        </div>
      )}

      {/* ─── INPUT BAR ──────────────────────────────────────────────────── */}
      <div className="border-t border-[#0A3269]/15 dark:border-slate-800/60 bg-white dark:bg-slate-950">
        <div className="px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-100/60 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5">
            {chatMode === 'ai' ? (
              <>
                <Sparkles className="h-3 w-3 text-[#0A3269]" />
                <span className="font-medium">AI Assistant</span>
                {!isSubscribed && user && (
                  <span className="text-[9px] text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full">
                    {getRemainingQuestions(isSubscribed)} free
                  </span>
                )}
                {isSubscribed && (
                  <span className="text-[9px] text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
                    Unlimited
                  </span>
                )}
              </>
            ) : connectionStatus === 'connected' ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium">Live with {specialistInfo?.name || 'TMMT Specialist'}</span>
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                <span className="font-medium">Specialist typically replies in 2 minutes</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            <span className="font-medium">Encrypted</span>
          </div>
        </div>

        <div className="p-3 flex items-end gap-2">
          <button
            onClick={() => {
              if (!user && chatMode === 'specialist') {
                toast.error('Log in to share files with a specialist');
                return;
              }
              if (!isSubscribed) {
                toast.info('File sharing available with subscription', {
                  description: 'Subscribe to TMMT to share documents.',
                  action: { label: 'Subscribe', onClick: () => (window.location.href = '/subscription') },
                });
                return;
              }
              fileInputRef.current?.click();
            }}
            className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
                if (chatMode === 'specialist' && roomId && socket) {
                  socket.emit('typing_start', { roomId, userId: 'user' });
                }
              }}
              placeholder={
                chatMode === 'ai'
                  ? 'Ask about visas, fines, documents...'
                  : connectionStatus === 'connected'
                  ? 'Message specialist...'
                  : !isSubscribed && !canEscalate(isSubscribed)
                  ? 'Subscribe for specialist access'
                  : 'Tap "Talk to Specialist" to start'
              }
              className="h-10 px-4 rounded-xl border-[#0A3269]/15 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 focus:border-[#0A3269]/30 dark:focus:border-slate-600 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              disabled={chatMode === 'specialist' && (connectionStatus !== 'connected' || (!isSubscribed && !canEscalate(isSubscribed)))}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isAIStreaming}
            className={cn(
              'shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all',
              input.trim() && !isAIStreaming
                ? 'bg-[#0A3269] dark:bg-slate-700 text-white hover:bg-[#1a4a7a] dark:hover:bg-slate-600 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
            )}
            aria-label="Send"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.json,.zip,.rar"
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
          className="hidden"
          multiple
        />
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// FILE PREVIEW ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const FilePreviewItem = ({ 
  preview, 
  onRemove 
}: { 
  preview: FilePreview; 
  onRemove: () => void;
}) => {
  const FileIconComponent = getFileIcon(preview.file);
  const isImage = preview.file.type.startsWith('image/');
  const isError = preview.status === 'error';
  const isUploading = preview.status === 'uploading';
  const isUploaded = preview.status === 'uploaded';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      className={cn(
        'relative group flex items-center gap-2 px-2 py-1.5 rounded-lg border',
        'bg-white dark:bg-slate-900 shadow-sm',
        isError 
          ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30'
          : isUploaded
          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30'
          : 'border-[#0A3269]/20 dark:border-slate-700/60'
      )}
    >
      {/* File Icon or Image Preview */}
      {isImage && preview.previewUrl ? (
        <div className="relative h-8 w-8 rounded overflow-hidden flex-shrink-0">
          <img 
            src={preview.previewUrl} 
            alt={preview.file.name}
            className="h-full w-full object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="h-3 w-3 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className={cn(
          'h-8 w-8 rounded flex items-center justify-center flex-shrink-0',
          isError ? 'bg-red-100 dark:bg-red-900/30' : 'bg-[#0A3269]/10 dark:bg-slate-700/30'
        )}>
          <FileIconComponent className={cn(
            'h-4 w-4',
            isError ? 'text-red-500' : 'text-[#0A3269] dark:text-slate-400'
          )} />
        </div>
      )}

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
          {preview.file.name}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {formatFileSize(preview.file.size)}
          </span>
          {isUploading && (
            <div className="flex items-center gap-1.5">
              <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0A3269] dark:bg-slate-500 rounded-full transition-all duration-300"
                  style={{ width: `${preview.progress}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500">
                {preview.progress}%
              </span>
            </div>
          )}
          {isUploaded && (
            <span className="text-[9px] text-emerald-500 dark:text-emerald-400 flex items-center gap-0.5">
              <Check className="h-2.5 w-2.5" />
              Done
            </span>
          )}
          {isError && (
            <span className="text-[9px] text-red-500 dark:text-red-400">
              Failed
            </span>
          )}
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="h-5 w-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition opacity-0 group-hover:opacity-100"
        aria-label="Remove file"
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const ChatHeader = ({
  chatMode,
  connectionStatus,
  specialistInfo,
  isSubscribed,
  onClose,
}: {
  chatMode: ChatMode;
  connectionStatus: ConnectionStatus;
  specialistInfo: { name: string; id: string } | null;
  isSubscribed: boolean;
  onClose: () => void;
}) => (
  <div className="relative bg-gradient-to-br from-[#0A3269] via-[#0A3269] to-[#1a4a7a] text-white px-5 py-4">
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-white to-white/80 flex items-center justify-center text-[#0A3269] font-semibold text-sm shadow-lg shadow-white/20">
            T
          </div>
          {connectionStatus === 'connected' && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0A3269] rounded-full shadow-sm" />
          )}
          {!isSubscribed && (
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-amber-400 border border-[#0A3269] rounded-full shadow-sm" />
          )}
        </div>
        <div>
          <p className="font-semibold text-sm leading-tight flex items-center gap-2">
            <span>TMMT</span>
            {!isSubscribed && (
              <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full text-white/90 font-medium">
                Free Trial
              </span>
            )}
            {isSubscribed && (
              <span className="text-[9px] bg-emerald-400/20 px-1.5 py-0.5 rounded-full text-emerald-200 font-medium flex items-center gap-1">
                <Check className="h-2.5 w-2.5" />
                Pro
              </span>
            )}
          </p>
          <p className="text-[11px] text-white/70 leading-tight mt-0.5">
            {connectionStatus === 'connected'
              ? `Online — ${specialistInfo?.name || 'Specialist'}`
              : chatMode === 'ai'
              ? 'AI Assistant'
              : 'Government Procedures Specialist'}
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="h-8 w-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
        aria-label="Minimize"
      >
        <Minimize2 className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
);

const TrialStatusBanner = ({ 
  trialData, 
  onSubscribe, 
  maxQuestions, 
  maxEscalations 
}: { 
  trialData: { questionsUsed: number; escalationsUsed: number };
  onSubscribe: () => void;
  maxQuestions: number;
  maxEscalations: number;
}) => {
  const remainingQuestions = Math.max(0, maxQuestions - trialData.questionsUsed);
  const remainingEscalations = Math.max(0, maxEscalations - trialData.escalationsUsed);
  const hasRemaining = remainingQuestions > 0 || remainingEscalations > 0;

  if (!hasRemaining) {
    return (
      <div className="px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100/80 dark:from-red-950/40 dark:to-red-900/30 border-b border-red-200/60 dark:border-red-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Free trial used</span> — Subscribe for unlimited access
            </span>
          </div>
          <button 
            onClick={onSubscribe}
            className="text-xs font-medium text-[#0A3269] dark:text-white hover:underline transition"
          >
            Subscribe →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2.5 bg-gradient-to-r from-amber-50 to-amber-100/80 dark:from-amber-950/40 dark:to-amber-900/30 border-b border-amber-200/60 dark:border-amber-800/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="font-semibold">{remainingQuestions}</span> AI questions
            <span className="h-3 w-px bg-amber-300 dark:bg-amber-700" />
            <span className="font-semibold">{remainingEscalations}</span> free escalation{remainingEscalations !== 1 ? 's' : ''}
          </span>
        </div>
        <button 
          onClick={onSubscribe}
          className="text-xs font-medium text-[#0A3269] dark:text-white hover:underline flex items-center gap-1"
        >
          Subscribe
          <ArrowUp className="h-3 w-3 rotate-45" />
        </button>
      </div>
    </div>
  );
};

const ChatModeSwitcher = ({
  chatMode,
  onModeChange,
  hasUser,
  isSubscribed,
  remainingEscalations,
}: {
  chatMode: ChatMode;
  onModeChange: (m: ChatMode) => void;
  hasUser: boolean;
  isSubscribed: boolean;
  remainingEscalations: number;
}) => {
  const modes: { id: ChatMode; label: string; icon: any; sub: string; badge?: string }[] = [
    { 
      id: 'ai', 
      label: 'AI', 
      icon: Bot, 
      sub: isSubscribed ? 'Unlimited' : `${Math.min(3, remainingEscalations + 3)} Free` 
    },
    { 
      id: 'specialist', 
      label: 'Specialist', 
      icon: Headphones, 
      sub: isSubscribed ? '~2 min' : `${remainingEscalations} esc. left`,
      badge: isSubscribed ? undefined : remainingEscalations > 0 ? `Free` : 'Locked'
    },
    { id: 'voice', label: 'Call', icon: PhoneCall, sub: 'Soon' },
  ];

  return (
    <div className="px-3 py-2 bg-[#0A3269]/5 dark:bg-slate-900/30 border-b border-[#0A3269]/10 dark:border-slate-800/60">
      <div className="grid grid-cols-3 gap-1.5">
        {modes.map((m) => {
          const isActive = chatMode === m.id;
          const Icon = m.icon;
          const isLocked = m.id === 'specialist' && !isSubscribed && remainingEscalations <= 0;
          
          return (
            <button
              key={m.id}
              onClick={() => {
                if (isLocked) {
                  toast.info('💡 Subscribe for specialist access', {
                    description: 'Get unlimited specialist support with TMMT Pro.',
                    action: { label: 'Subscribe', onClick: () => (window.location.href = '/subscription') },
                  });
                  return;
                }
                onModeChange(m.id);
              }}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all relative',
                isActive
                  ? 'bg-[#0A3269] dark:bg-slate-700 text-white shadow-md'
                  : isLocked
                  ? 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Icon className="h-3.5 w-3.5 mb-0.5" strokeWidth={1.75} />
              <span className="text-[11px] font-medium leading-tight">{m.label}</span>
              <span className={cn(
                'text-[9px] leading-tight mt-0.5',
                isActive ? 'text-white/70' : 'text-slate-400/60 dark:text-slate-500'
              )}>
                {m.sub}
              </span>
              {m.badge && !isActive && (
                <span className={cn(
                  'absolute -top-1 -right-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full',
                  m.badge === 'Locked' 
                    ? 'bg-red-500 text-white'
                    : m.badge === 'Free'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-500 text-white'
                )}>
                  {m.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const EmptyState = ({ 
  chatMode, 
  onSuggestionClick,
  isSubscribed,
  remainingQuestions,
  remainingEscalations,
}: { 
  chatMode: ChatMode; 
  onSuggestionClick: (s: string) => void;
  isSubscribed: boolean;
  remainingQuestions: number;
  remainingEscalations: number;
}) => {
  const suggestions = chatMode === 'ai'
    ? [
        'How do I check my overstay fine?',
        'What is a Nawakas application?',
        'My visa expires next month — what do I do?',
        'How to file a fine mercy letter?',
        'I need help with visa cancellation',
        'How to check my absconding status?',
      ]
    : [
        'I need help with a complex fine issue',
        'I have a Nawakas problem',
        'Visa cancellation appeal help',
        'Status of my application',
      ];

  const hasFreeTrials = remainingQuestions > 0 || remainingEscalations > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 py-2"
    >
      <div className="text-center space-y-3 pt-2 pb-4">
        <div className="inline-flex h-16 w-16 rounded-full bg-gradient-to-br from-[#0A3269] to-[#1a4a7a] items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#0A3269]/20">
          <GraduationCap className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {isSubscribed ? 'TMMT Pro' : 'TMMT — Free Trial'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed max-w-[280px] mx-auto">
            {chatMode === 'ai'
              ? isSubscribed
                ? 'Ask me anything about UAE government procedures. Unlimited AI access.'
                : `Ask me anything about UAE government procedures. You have ${remainingQuestions} AI questions and ${remainingEscalations} free escalation${remainingEscalations !== 1 ? 's' : ''} to a specialist.`
              : isSubscribed
                ? 'Share your issue with a specialist — they\'ll reply within 2 minutes.'
                : remainingEscalations > 0
                  ? `You have ${remainingEscalations} free escalation${remainingEscalations !== 1 ? 's' : ''} to a specialist. Subscribe for unlimited access.`
                  : 'Subscribe to TMMT for unlimited specialist access.'}
          </p>
          {!isSubscribed && !hasFreeTrials && (
            <button
              onClick={() => window.location.href = '/subscription'}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A3269] text-white text-sm font-medium hover:bg-[#1a4a7a] transition"
            >
              <Crown className="h-3.5 w-3.5" />
              Subscribe for unlimited access
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-medium px-1">
          {chatMode === 'ai' ? 'Common questions' : 'Common requests'}
        </p>
        <div className="grid grid-cols-1 gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestionClick(s)}
              className="group flex items-center justify-between px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 hover:border-[#0A3269]/40 dark:hover:border-[#0A3269]/30 hover:bg-[#0A3269]/5 dark:hover:bg-slate-800/50 transition text-left"
            >
              <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                {s}
              </span>
              <Send className="h-3 w-3 text-slate-400 group-hover:text-[#0A3269] transition" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 pt-2">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          Encrypted
        </span>
        <span>•</span>
        <span>Licensed</span>
        <span>•</span>
        <span>Dubai</span>
        {!isSubscribed && (
          <>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">Free Trial</span>
          </>
        )}
        {isSubscribed && (
          <>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Check className="h-2.5 w-2.5" />
              Pro
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
};

const EscalationCard = ({ 
  question, 
  onEscalate, 
  canEscalate,
  remainingEscalations,
}: { 
  question: string; 
  onEscalate: () => void;
  canEscalate: boolean;
  remainingEscalations: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className="mx-auto max-w-[85%] rounded-xl border border-[#0A3269]/30 bg-gradient-to-br from-[#0A3269]/10 to-[#0A3269]/5 dark:from-[#0A3269]/30 dark:to-[#0A3269]/10 p-4 shadow-sm"
  >
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 shrink-0 rounded-full bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
          Complex issue detected
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          This seems like a complex case that would benefit from a specialist's review.
          {canEscalate 
            ? ` You have ${remainingEscalations} free escalation${remainingEscalations !== 1 ? 's' : ''} remaining.`
            : ' Subscribe to TmmT for unlimited specialist access.'}
        </p>
        {canEscalate ? (
          <button
            onClick={onEscalate}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A3269] dark:bg-slate-700 text-white text-xs font-medium hover:bg-[#1a4a7a] dark:hover:bg-slate-600 transition"
          >
            Escalate to Specialist
            <Send className="h-3 w-3 rotate-45" />
          </button>
        ) : (
          <button
            onClick={() => window.location.href = '/subscription'}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A3269] dark:bg-slate-700 text-white text-xs font-medium hover:bg-[#1a4a7a] dark:hover:bg-slate-600 transition"
          >
            Subscribe to Escalate
            <Crown className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

export default TammatSupervisor;