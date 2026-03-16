'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { ChatMessage, Conversation } from '@/types';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Record<string, ChatMessage[]>;
  unreadCount: number;
  typingUsers: Record<string, boolean>;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, message: string, recipientId: string) => Promise<void>;
  sendTyping: (conversationId: string, recipientId: string) => void;
  stopTyping: (conversationId: string, recipientId: string) => void;
  markAsRead: (conversationId: string) => void;
  loadMessages: (conversationId: string, messages: ChatMessage[]) => void;
  setActiveConversation: (conversationId: string | null) => void;
  updateConversations: (conversations: Conversation[]) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const { user, isAuthenticated, userType } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('new_message', (data: { message: ChatMessage; conversationId: string }) => {
      const { message, conversationId } = data;
      
      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), message],
      }));

      // Update last message in conversations
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversationId === conversationId
            ? {
                ...conv,
                lastMessage: {
                  message: message.message,
                  sender: message.sender._id,
                  senderModel: message.senderModel,
                  createdAt: message.createdAt,
                },
              }
            : conv
        )
      );

      // Show notification if not in active conversation
      if (activeConversation !== conversationId && message.sender._id !== user?.id) {
        toast.success(`New message from ${(message.sender as any).firstName}`);
        setUnreadCount((prev) => prev + 1);
      }
    });

    newSocket.on('new_notification', (data: any) => {
      toast.success(data.message?.text || 'New notification');
    });

    newSocket.on('user_typing', (data: { conversationId: string; userId: string }) => {
      setTypingUsers((prev) => ({ ...prev, [data.userId]: true }));
    });

    newSocket.on('user_stop_typing', (data: { conversationId: string; userId: string }) => {
      setTypingUsers((prev) => ({ ...prev, [data.userId]: false }));
    });

    newSocket.on('messages_read', (data: { conversationId: string; readBy: string }) => {
      // Update read status for messages
      setMessages((prev) => ({
        ...prev,
        [data.conversationId]: prev[data.conversationId]?.map((msg) =>
          msg.sender._id !== data.readBy ? { ...msg, isRead: true, readAt: new Date().toISOString() } : msg
        ),
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  const joinConversation = useCallback(
    (conversationId: string) => {
      socket?.emit('join_conversation', conversationId);
      setActiveConversation(conversationId);
    },
    [socket]
  );

  const leaveConversation = useCallback(
    (conversationId: string) => {
      socket?.emit('leave_conversation', conversationId);
      if (activeConversation === conversationId) {
        setActiveConversation(null);
      }
    },
    [socket, activeConversation]
  );

  const sendMessage = useCallback(
    async (conversationId: string, message: string, recipientId: string) => {
      return new Promise<void>((resolve, reject) => {
        socket?.emit(
          'send_message',
          {
            conversationId,
            message,
            messageType: 'text',
          },
          (response: any) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.error || 'Failed to send message'));
            }
          }
        );
      });
    },
    [socket]
  );

  const sendTyping = useCallback(
    (conversationId: string, recipientId: string) => {
      socket?.emit('typing', { conversationId, recipientId });
    },
    [socket]
  );

  const stopTyping = useCallback(
    (conversationId: string, recipientId: string) => {
      socket?.emit('stop_typing', { conversationId, recipientId });
    },
    [socket]
  );

  const markAsRead = useCallback(
    (conversationId: string) => {
      socket?.emit('mark_as_read', { conversationId });
    },
    [socket]
  );

  const loadMessages = useCallback((conversationId: string, newMessages: ChatMessage[]) => {
    setMessages((prev) => ({
      ...prev,
      [conversationId]: newMessages,
    }));
  }, []);

  const updateConversations = useCallback((newConversations: Conversation[]) => {
    setConversations(newConversations);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        conversations,
        activeConversation,
        messages,
        unreadCount,
        typingUsers,
        joinConversation,
        leaveConversation,
        sendMessage,
        sendTyping,
        stopTyping,
        markAsRead,
        loadMessages,
        setActiveConversation,
        updateConversations,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
