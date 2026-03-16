import api from './api';
import { Payment, ApiResponse, Pagination } from '@/types';

export const paymentService = {
  // Initialize payment
  initializePayment: async (bookingId: string): Promise<ApiResponse<{ authorizationUrl: string; reference: string }>> => {
    const response = await api.post<ApiResponse<{ authorizationUrl: string; reference: string }>>('/payments/initialize', {
      bookingId,
    });
    return response.data;
  },

  // Verify payment
  verifyPayment: async (reference: string): Promise<ApiResponse<Payment>> => {
    const response = await api.get<ApiResponse<Payment>>(`/payments/verify?reference=${reference}`);
    return response.data;
  },

  // Get all payments (admin)
  getAllPayments: async (params?: {
    status?: string;
    user?: string;
    artisan?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Payment[]> & { pagination: Pagination; totals: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.user) queryParams.append('user', params.user);
    if (params?.artisan) queryParams.append('artisan', params.artisan);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get<ApiResponse<Payment[]> & { pagination: Pagination; totals: any }>(
      `/payments?${queryParams}`
    );
    return response.data;
  },

  // Get payment stats (admin)
  getPaymentStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>('/payments/stats/overview');
    return response.data;
  },

  // Get my payments (user)
  getMyPayments: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Payment[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get<ApiResponse<Payment[]>>(`/payments/my-payments?${queryParams}`);
    return response.data;
  },

  // Release payment to artisan (admin)
  releasePayment: async (paymentId: string): Promise<ApiResponse<Payment>> => {
    const response = await api.post<ApiResponse<Payment>>(`/payments/${paymentId}/release`);
    return response.data;
  },
};
