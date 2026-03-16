'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaPaperPlane, 
  FaPhone, 
  FaVideo, 
  FaEllipsisV,
  FaArrowLeft,
  FaSearch
} from 'react-icons/fa';
import { chatService } from '@/services';
import { Conversation, ChatMessage } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { formatTime, getRelativeTime } from '@/utils/helpers';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const artisanId = searchParams.get('artisan');
  
  const { user, userType } = useAuth();
  const { 
    conversations: socketConversations, 
    messages: socketMessages, 
    joinConversation, 
    leaveConversation, 
    sendMessage, 
    sendTyping, 
    stopTyping, 
    markAsRead,
    loadMessages,
    updateConversations,
    typingUsers 
  } = useSocket();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    // Update local conversations from socket
    if (socketConversations.length > 0) {
      setConversations(socketConversations);
    }
  }, [socketConversations]);

  useEffect(() => {
    // Update messages from socket
    if (activeConversation && socketMessages[activeConversation]) {
      setMessages(socketMessages[activeConversation]);
    }
  }, [socketMessages, activeConversation]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Handle initial artisan ID from URL
    if (artisanId && conversations.length > 0) {
      const conversation = conversations.find(
        c => c.artisan.id === artisanId || c.user.id === artisanId
      );
      if (conversation) {
        handleSelectConversation(conversation.conversationId);
      } else {
        // Create new conversation
        createConversation(artisanId);
      }
    }
  }, [artisanId, conversations]);

  const loadConversations = async () => {
    try {
      const response = await chatService.getConversations();
      if (response.success) {
        setConversations(response.data);
        updateConversations(response.data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (artisanId: string) => {
    try {
      const response = await chatService.getOrCreateConversation(
        userType === 'user' ? undefined : artisanId,
        userType === 'artisan' ? undefined : artisanId
      );
      if (response.success) {
        setConversations(prev => [response.data, ...prev]);
        handleSelectConversation(response.data.conversationId);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    // Leave previous conversation
    if (activeConversation) {
      leaveConversation(activeConversation);
    }

    setActiveConversation(conversationId);
    joinConversation(conversationId);

    // Load messages
    try {
      const response = await chatService.getMessages(conversationId);
      if (response.success) {
        setMessages(response.data);
        loadMessages(conversationId, response.data);
        markAsRead(conversationId);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const conversation = conversations.find(c => c.conversationId === activeConversation);
    if (!conversation) return;

    const recipientId = userType === 'user' ? conversation.artisan.id : conversation.user.id;

    try {
      await sendMessage(activeConversation, newMessage, recipientId);
      setNewMessage('');
      stopTyping(activeConversation, recipientId);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!activeConversation) return;

    const conversation = conversations.find(c => c.conversationId === activeConversation);
    if (!conversation) return;

    const recipientId = userType === 'user' ? conversation.artisan.id : conversation.user.id;

    if (!isTyping) {
      setIsTyping(true);
      sendTyping(activeConversation, recipientId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(activeConversation, recipientId);
    }, 1000);
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return userType === 'user' ? conversation.artisan : conversation.user;
  };

  const activeConversationData = conversations.find(c => c.conversationId === activeConversation);
  const otherParticipant = activeConversationData ? getOtherParticipant(activeConversationData) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 h-[calc(100vh-64px)]">
          {/* Conversations List */}
          <div className={`lg:col-span-1 bg-white border-r border-gray-200 ${activeConversation ? 'hidden lg:block' : 'block'}`}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Messages</h2>
              <div className="mt-3 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-100px)]">
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const other = getOtherParticipant(conversation);
                  const isActive = activeConversation === conversation.conversationId;
                  const unreadCount = userType === 'user' 
                    ? conversation.unreadCount.user 
                    : conversation.unreadCount.artisan;

                  return (
                    <button
                      key={conversation.conversationId}
                      onClick={() => handleSelectConversation(conversation.conversationId)}
                      className={`w-full p-4 flex items-center hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                        isActive ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={(other as any).profileImage || (other as any).avatar}
                          alt={`${other.firstName} ${other.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="ml-3 flex-1 text-left">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-gray-900">
                            {other.firstName} {other.lastName}
                          </p>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {getRelativeTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage.message}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`lg:col-span-2 bg-white flex flex-col ${activeConversation ? 'block' : 'hidden lg:flex'}`}>
            {activeConversation && otherParticipant ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() => setActiveConversation(null)}
                      className="lg:hidden mr-3 text-gray-600"
                    >
                      <FaArrowLeft />
                    </button>
                    <img
                      src={(otherParticipant as any).profileImage || (otherParticipant as any).avatar}
                      alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        {otherParticipant.firstName} {otherParticipant.lastName}
                      </p>
                      <p className="text-xs text-green-500">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                      <FaPhone />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                      <FaVideo />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                      <FaEllipsisV />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => {
                    const isSent = (message.sender as any)._id === user?.id;
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            isSent
                              ? 'bg-primary-600 text-white rounded-tr-sm'
                              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                          }`}
                        >
                          <p>{message.message}</p>
                          <p className={`text-xs mt-1 ${isSent ? 'text-primary-200' : 'text-gray-500'}`}>
                            {formatTime(message.createdAt)}
                            {isSent && message.isRead && ' • Read'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {/* Typing Indicator */}
                  {otherParticipant && typingUsers[otherParticipant.id] && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaPaperPlane className="text-primary-600 text-3xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
