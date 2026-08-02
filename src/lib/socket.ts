import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    socket = io(apiBase, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        token: localStorage.getItem('authToken'),
      },
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');
      
      if (userId && userRole) {
        socket?.emit('user_connected', { userId, role: userRole });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
