import api from './api';
import { Artisan, ApiResponse, Pagination } from '@/types';

interface ArtisanFilters {
  search?: string;
  category?: string;
  minRating?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

interface ArtisanProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  category?: string;
  yearsOfExperience?: number;
  hourlyRate?: number;
  basePrice?: number;
  location?: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
  };
  serviceRadius?: number;
  availability?: any;
}

export const artisanService = {
  // Get all artisans with filters
  getArtisans: async (filters: ArtisanFilters = {}): Promise<ApiResponse<Artisan[]> & { pagination: Pagination }> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get<ApiResponse<Artisan[]> & { pagination: Pagination }>(`/artisans?${params}`);
    return response.data;
  },

  // Get single artisan
  getArtisan: async (id: string): Promise<ApiResponse<Artisan>> => {
    const response = await api.get<ApiResponse<Artisan>>(`/artisans/${id}`);
    return response.data;
  },

  // Get artisan categories
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get<ApiResponse<string[]>>('/artisans/categories');
    return response.data;
  },

  // Get my profile (for logged in artisan)
  getMyProfile: async (): Promise<ApiResponse<Artisan>> => {
    const response = await api.get<ApiResponse<Artisan>>('/artisans/profile/me');
    return response.data;
  },

  // Update artisan profile
  updateProfile: async (data: ArtisanProfileUpdate): Promise<ApiResponse<Artisan>> => {
    const response = await api.put<ApiResponse<Artisan>>('/artisans/profile', data);
    return response.data;
  },

  // Update profile image
  updateProfileImage: async (imageFile: File): Promise<ApiResponse<Artisan>> => {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    const response = await api.put<ApiResponse<Artisan>>('/artisans/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get my bookings
  getMyBookings: async (params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<any[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get<ApiResponse<any[]>>(`/artisans/bookings/my-bookings?${queryParams}`);
    return response.data;
  },

  // Get my earnings
  getMyEarnings: async (): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>('/artisans/earnings/my-earnings');
    return response.data;
  },

  // Add portfolio item
  addPortfolioItem: async (imageFile: File, title?: string, description?: string): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    
    const response = await api.post<ApiResponse<any>>('/artisans/portfolio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update portfolio
  updatePortfolio: async (portfolio: any[]): Promise<ApiResponse<any>> => {
    const response = await api.put<ApiResponse<any>>('/artisans/portfolio', { portfolio });
    return response.data;
  },
};
