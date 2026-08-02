import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  content: string;
  type: 'text' | 'file' | 'image';
  sender: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileUrl?: string;
  };
}

export interface ChatRoom {
  id: string;
  userId: string;
  officerId: string;
  participants: string[];
  status: 'active' | 'ended';
  createdAt: Date;
  lastActivity: Date;
  messages?: ChatMessage[];
}

export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  onMessage?: (message: ChatMessage) => void;
  onRoomJoined?: (room: ChatRoom) => void;
  onUserTyping?: (data: { userId: string; isTyping: boolean }) => void;
  onVoiceCallRequest?: (data: { from: string; roomId: string }) => void;
  onVideoCallRequest?: (data: { from: string; roomId: string }) => void;
  onCallEnded?: (data: { by: string; callType: string; roomId: string }) => void;
  onError?: (error: string) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    url = `${import.meta.env.VITE_API_BASE_URL}`,
    autoConnect = true,
    onMessage,
    onRoomJoined,
    onUserTyping,
    onVoiceCallRequest,
    onVideoCallRequest,
    onCallEnded,
    onError
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize socket connection
  const connect = useCallback((token: string) => {
    try {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      socketRef.current = io(url, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Connection events
      socketRef.current.on('connect', () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log('WebSocket connected');
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        setConnectionError(error.message);
        console.error('WebSocket connection error:', error);
        if (onError) onError(error.message);
      });

      // Chat events
      socketRef.current.on('new_message', (message: ChatMessage) => {
        if (onMessage) onMessage(message);
      });

      socketRef.current.on('room_joined', (room: ChatRoom) => {
        setCurrentRoom(room.id);
        if (onRoomJoined) onRoomJoined(room);
      });

      socketRef.current.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
        if (data.isTyping) {
          setTypingUsers(prev => new Set(prev).add(data.userId));
        } else {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
        if (onUserTyping) onUserTyping(data);
      });

      // Call events
      socketRef.current.on('voice_call_request', (data: { from: string; roomId: string }) => {
        if (onVoiceCallRequest) onVoiceCallRequest(data);
      });

      socketRef.current.on('video_call_request', (data: { from: string; roomId: string }) => {
        if (onVideoCallRequest) onVideoCallRequest(data);
      });

      socketRef.current.on('call_ended', (data: { by: string; callType: string; roomId: string }) => {
        if (onCallEnded) onCallEnded(data);
      });

      // File upload events
      socketRef.current.on('file_upload_start', (data: { userId: string; fileName: string; fileSize: number }) => {
        console.log('File upload started:', data);
      });

      socketRef.current.on('file_upload_complete', (message: ChatMessage) => {
        if (onMessage) onMessage(message);
      });

      // Error handling
      socketRef.current.on('error', (error: { message: string }) => {
        setConnectionError(error.message);
        if (onError) onError(error.message);
      });

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create connection');
      if (onError) onError('Failed to create connection');
    }
  }, [url, onMessage, onRoomJoined, onUserTyping, onVoiceCallRequest, onVideoCallRequest, onCallEnded, onError]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setCurrentRoom(null);
    setTypingUsers(new Set());
  }, []);

  // Join chat room
  const joinRoom = useCallback((roomId: string, userId: string, officerId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_chat_room', { roomId, userId, officerId });
    }
  }, [isConnected]);

  // Leave chat room
  const leaveRoom = useCallback((roomId: string, userId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave_chat_room', { roomId, userId });
      setCurrentRoom(null);
    }
  }, [isConnected]);

  // Send message
  const sendMessage = useCallback((roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>, userId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', { roomId, message, userId });
    }
  }, [isConnected]);

  // Start typing indicator
  const startTyping = useCallback((roomId: string, userId: string) => {
    if (socketRef.current && isConnected && !isTyping) {
      socketRef.current.emit('typing_start', { roomId, userId });
      setIsTyping(true);
    }
  }, [isConnected, isTyping]);

  // Stop typing indicator
  const stopTyping = useCallback((roomId: string, userId: string) => {
    if (socketRef.current && isConnected && isTyping) {
      socketRef.current.emit('typing_stop', { roomId, userId });
      setIsTyping(false);
    }
  }, [isConnected, isTyping]);

  // File upload
  const uploadFile = useCallback((roomId: string, userId: string, file: File) => {
    if (socketRef.current && isConnected) {
      // Start file upload
      socketRef.current.emit('file_upload_start', {
        roomId,
        userId,
        fileName: file.name,
        fileSize: file.size
      });

      // Simulate file upload completion (in real app, this would upload to server first)
      setTimeout(() => {
        const fileUrl = URL.createObjectURL(file);
        socketRef.current?.emit('file_upload_complete', {
          roomId,
          userId,
          fileUrl,
          fileName: file.name,
          fileSize: file.size
        });
      }, 1000);
    }
  }, [isConnected]);

  // Voice call functions
  const requestVoiceCall = useCallback((roomId: string, userId: string, targetUserId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('voice_call_request', { roomId, userId, targetUserId });
    }
  }, [isConnected]);

  const answerVoiceCall = useCallback((roomId: string, userId: string, accepted: boolean, targetUserId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('voice_call_answer', { roomId, userId, accepted, targetUserId });
    }
  }, [isConnected]);

  const rejectVoiceCall = useCallback((roomId: string, userId: string, targetUserId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('voice_call_reject', { roomId, userId, targetUserId });
    }
  }, [isConnected]);

  // Video call functions
  const requestVideoCall = useCallback((roomId: string, userId: string, targetUserId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('video_call_request', { roomId, userId, targetUserId });
    }
  }, [isConnected]);

  const answerVideoCall = useCallback((roomId: string, userId: string, accepted: boolean, targetUserId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('video_call_answer', { roomId, userId, accepted, targetUserId });
    }
  }, [isConnected]);

  const rejectVideoCall = useCallback((roomId: string, userId: string, targetUserId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('video_call_reject', { roomId, userId, targetUserId });
    }
  }, [isConnected]);

  // End call
  const endCall = useCallback((roomId: string, userId: string, callType: 'voice' | 'video') => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('call_end', { roomId, userId, callType });
    }
  }, [isConnected]);

  // Update user presence
  const updatePresence = useCallback((userId: string, status: 'online' | 'away' | 'busy' | 'offline') => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('user_presence', { userId, status });
    }
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    isConnected,
    currentRoom,
    isTyping,
    typingUsers,
    connectionError,
    
    // Connection methods
    connect,
    disconnect,
    
    // Room methods
    joinRoom,
    leaveRoom,
    
    // Message methods
    sendMessage,
    startTyping,
    stopTyping,
    
    // File methods
    uploadFile,
    
    // Call methods
    requestVoiceCall,
    answerVoiceCall,
    rejectVoiceCall,
    requestVideoCall,
    answerVideoCall,
    rejectVideoCall,
    endCall,
    
    // Presence methods
    updatePresence,
    
    // Socket instance (for advanced usage)
    socket: socketRef.current
  };
}; 