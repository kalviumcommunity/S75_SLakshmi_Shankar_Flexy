import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io("https://flexy-backend.onrender.com", {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

export const SocketProvider = ({ children }) => {
  const [socket] = useState(() => getSocket());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Global socket connected:', socket.id);
      setConnected(true);

      const clientPhone = localStorage.getItem('clientPhone');
      const expertContact = localStorage.getItem('expertContact');
      
      const userIdentifier = clientPhone || expertContact;
      
      if (userIdentifier) {
        socket.emit('join-user-room', userIdentifier);
        console.log(`🔔 Joined personal notification room: ${userIdentifier}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Global socket disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};