import api from './api';
import { User, Artisan, ApiResponse, Pagination, DashboardStats, Review } from '@/types';

interface AdminRegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  permissions?: string[];
}

interface SettingsUpdate {
  commissionPercentage?: number;
}

export const adminService = {
  // Register new admin (super admin only)
  registerAdmin: async (data: AdminRegisterData): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>('/admin/register', data);
    return response.data;
  },

  // Get dashboard statistics
  getDashboard: async (): Promise<ApiResponse<DashboardStats & { monthlyStats: any[]; recentBookings: any[]; topArtisans: any[] }>> => {
    const response = await api.get<ApiResponse<DashboardStats & { monthlyStats: any[]; recentBookings: any[]; topArtisans: any[] }>>('/admin/dashboard');
    return response.data;
  },

  // Get all admins (super admin only)
  getAdmins: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get<ApiResponse<any[]>>('/admin/admins');
    return response.data;
  },

  // Get all users
  getUsers: async (params?: { search?: string; isActive?: boolean; page?: number; limit?: number }): Promise<ApiResponse<User[]> & { pagination: Pagination }> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get<ApiResponse<User[]> & { pagination: Pagination }>(`/admin/users?${queryParams}`);
    return response.data;
  },

  // Deactivate user
  deactivateUser: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>(`/admin/users/${userId}/deactivate`);
    return response.data;
  },

  // Get all artisans
  getArtisans: async (params?: { search?: string; isApproved?: boolean; isActive?: boolean; page?: number; limit?: number }): Promise<ApiResponse<Artisan[]> & { pagination: Pagination }> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isApproved !== undefined) queryParams.append('isApproved', params.isApproved.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get<ApiResponse<Artisan[]> & { pagination: Pagination }>(`/admin/artisans?${queryParams}`);
    return response.data;
  },

  // Approve artisan
  approveArtisan: async (artisanId: string): Promise<ApiResponse<Artisan>> => {
    const response = await api.put<ApiResponse<Artisan>>(`/admin/artisans/${artisanId}/approve`);
    return response.data;
  },

  // Reject artisan
  rejectArtisan: async (artisanId: string, reason?: string): Promise<ApiResponse<Artisan>> => {
    const response = await api.put<ApiResponse<Artisan>>(`/admin/artisans/${artisanId}/reject`, { reason });
    return response.data;
  },

  // Deactivate artisan
  deactivateArtisan: async (artisanId: string): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>(`/admin/artisans/${artisanId}/deactivate`);
    return response.data;
  },

  // Get settings
  getSettings: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get<ApiResponse<any[]>>('/admin/settings');
    return response.data;
  },

  // Update settings
  updateSettings: async (data: SettingsUpdate): Promise<ApiResponse<any[]>> => {
    const response = await api.put<ApiResponse<any[]>>('/admin/settings', data);
    return response.data;
  },

  // Get all reviews
  getReviews: async (params?: { reported?: boolean; page?: number; limit?: number }): Promise<ApiResponse<Review[]> & { pagination: Pagination }> => {
    const queryParams = new URLSearchParams();
    if (params?.reported) queryParams.append('reported', 'true');
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get<ApiResponse<Review[]> & { pagination: Pagination }>(`/admin/reviews?${queryParams}`);
    return response.data;
  },

  // Toggle review visibility
  toggleReviewVisibility: async (reviewId: string, isVisible: boolean): Promise<ApiResponse<Review>> => {
    const response = await api.put<ApiResponse<Review>>(`/admin/reviews/${reviewId}/visibility`, { isVisible });
    return response.data;
  },
};
