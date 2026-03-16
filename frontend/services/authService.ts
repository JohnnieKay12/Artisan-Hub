import api from './api';
import Cookies from 'js-cookie';
import { User, Artisan, LoginCredentials, RegisterData, ArtisanRegisterData, ApiResponse } from '@/types';

interface AuthResponse {
  success: boolean;
  token: string;
  user: User | Artisan;
}

export const authService = {
  // User authentication
  registerUser: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      Cookies.set('token', response.data.token, { expires: 30 });
    }
    return response.data;
  },

  loginUser: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      Cookies.set('token', response.data.token, { expires: 30 });
    }
    return response.data;
  },

  // Artisan authentication
  registerArtisan: async (data: ArtisanRegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/artisan/register', data);
    if (response.data.token) {
      Cookies.set('token', response.data.token, { expires: 30 });
    }
    return response.data;
  },

  loginArtisan: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/artisan/login', credentials);
    if (response.data.token) {
      Cookies.set('token', response.data.token, { expires: 30 });
    }
    return response.data;
  },

  // Admin authentication
  loginAdmin: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/admin/login', credentials);
    if (response.data.token) {
      Cookies.set('token', response.data.token, { expires: 30 });
    }
    return response.data;
  },

  // Get current user
  getMe: async (): Promise<ApiResponse<User | Artisan>> => {
    const response = await api.get<ApiResponse<User | Artisan>>('/auth/me');
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.get('/auth/logout');
    Cookies.remove('token');
  },

  // Update password
  updatePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>('/auth/update-password', data);
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!Cookies.get('token');
  },

  // Get token
  getToken: (): string | undefined => {
    if (typeof window === 'undefined') return undefined;
    return Cookies.get('token');
  },
};
