import api from './api';
import { ChatMessage, Conversation, ApiResponse, Pagination } from '@/types';

interface SendMessageData {
  conversationId: string;
  message: string;
  messageType?: string;
  attachments?: any[];
  relatedBooking?: string;
}

export const chatService = {
  // Get or create conversation
  getOrCreateConversation: async (userId?: string, artisanId?: string): Promise<ApiResponse<Conversation>> => {
    const response = await api.post<ApiResponse<Conversation>>('/chat/conversations', { userId, artisanId });
    return response.data;
  },

  // Get user's conversations
  getConversations: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Conversation[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get<ApiResponse<Conversation[]>>(`/chat/conversations?${queryParams}`);
    return response.data;
  },

  // Get messages in a conversation
  getMessages: async (
    conversationId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<ChatMessage[]> & { pagination: Pagination }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get<ApiResponse<ChatMessage[]> & { pagination: Pagination }>(
      `/chat/conversations/${conversationId}/messages?${queryParams}`
    );
    return response.data;
  },

  // Send message
  sendMessage: async (data: SendMessageData): Promise<ApiResponse<ChatMessage>> => {
    const response = await api.post<ApiResponse<ChatMessage>>('/chat/messages', data);
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (conversationId: string): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>(`/chat/conversations/${conversationId}/read`);
    return response.data;
  },

  // Get unread message count
  getUnreadCount: async (): Promise<ApiResponse<{ total: number; conversations: any[] }>> => {
    const response = await api.get<ApiResponse<{ total: number; conversations: any[] }>>('/chat/unread-count');
    return response.data;
  },

  // Delete message
  deleteMessage: async (messageId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/chat/messages/${messageId}`);
    return response.data;
  },
};
