import api from './api';
import { Booking, ApiResponse, BookingData, Pagination } from '@/types';

export const bookingService = {
  // Create booking
  createBooking: async (data: BookingData): Promise<ApiResponse<Booking>> => {
    const response = await api.post<ApiResponse<Booking>>('/bookings', data);
    return response.data;
  },

  // Get all bookings (admin)
  getAllBookings: async (params?: { 
    status?: string; 
    user?: string; 
    artisan?: string;
    page?: number; 
    limit?: number 
  }): Promise<ApiResponse<Booking[]> & { pagination: Pagination }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.user) queryParams.append('user', params.user);
    if (params?.artisan) queryParams.append('artisan', params.artisan);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get<ApiResponse<Booking[]> & { pagination: Pagination }>(`/bookings?${queryParams}`);
    return response.data;
  },

  // Get single booking
  getBooking: async (id: string): Promise<ApiResponse<Booking>> => {
    const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data;
  },

  // Update booking status (artisan)
  updateStatus: async (id: string, status: string): Promise<ApiResponse<Booking>> => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}/status`, { status });
    return response.data;
  },

  // Cancel booking (artisan)
  cancelBookingArtisan: async (id: string, reason?: string): Promise<ApiResponse<Booking>> => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  // Get booking stats (admin)
  getBookingStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>('/bookings/stats/overview');
    return response.data;
  },
};
