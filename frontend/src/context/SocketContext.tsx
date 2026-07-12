import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector, useAppDispatch } from '../store';
import { addNotification, type NotificationItem } from '../store/notificationSlice';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // If authenticated, connect to the Socket.IO server
    if (isAuthenticated && token) {
      const serverUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
      
      const socket = io(serverUrl, {
        auth: {
          token,
        },
        autoConnect: true,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('⚡ Socket.IO connected successfully');
      });

      socket.on('disconnect', (reason) => {
        console.log('⚡ Socket.IO disconnected:', reason);
      });

      // Listen for push notifications from the backend
      socket.on('notification', (data: NotificationItem) => {
        console.log('⚡ Socket notification received:', data);
        dispatch(addNotification(data));
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error.message);
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [isAuthenticated, token, dispatch]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};
