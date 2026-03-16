import api from './api';
import { User, ApiResponse, Review, Booking } from '@/types';

interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface ReviewData {
  booking: string;
  rating: number;
  review: string;
  categories?: {
    punctuality?: number;
    quality?: number;
    communication?: number;
    professionalism?: number;
  };
}

export const userService = {
  // Get user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: ProfileUpdate): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>('/users/profile', data);
    return response.data;
  },

  // Update avatar
  updateAvatar: async (imageFile: File): Promise<ApiResponse<User>> => {
    const formData = new FormData();
    formData.append('avatar', imageFile);
    
    const response = await api.put<ApiResponse<User>>('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async (): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>('/users/profile');
    return response.data;
  },

  // Get my bookings
  getMyBookings: async (params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<Booking[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get<ApiResponse<Booking[]>>(`/users/bookings?${queryParams}`);
    return response.data;
  },

  // Get single booking
  getBooking: async (id: string): Promise<ApiResponse<Booking>> => {
    const response = await api.get<ApiResponse<Booking>>(`/users/bookings/${id}`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id: string, reason?: string): Promise<ApiResponse<Booking>> => {
    const response = await api.put<ApiResponse<Booking>>(`/users/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  // Create review
  createReview: async (data: ReviewData): Promise<ApiResponse<Review>> => {
    const response = await api.post<ApiResponse<Review>>('/users/reviews', data);
    return response.data;
  },

  // Get my reviews
  getMyReviews: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Review[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get<ApiResponse<Review[]>>(`/users/reviews?${queryParams}`);
    return response.data;
  },

  // Get favorite artisans
  getFavoriteArtisans: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get<ApiResponse<any[]>>('/users/favorites');
    return response.data;
  },
};
