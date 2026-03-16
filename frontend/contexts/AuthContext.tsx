'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services';
import { User, Artisan } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | Artisan | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: 'user' | 'artisan' | 'admin' | null;
  login: (email: string, password: string, type: 'user' | 'artisan' | 'admin') => Promise<void>;
  register: (data: any, type: 'user' | 'artisan') => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User | Artisan) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | Artisan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        const response = await authService.getMe();
        if (response.success) {
          setUser(response.data);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, type: 'user' | 'artisan' | 'admin') => {
    try {
      setIsLoading(true);
      let response;

      switch (type) {
        case 'user':
          response = await authService.loginUser({ email, password });
          break;
        case 'artisan':
          response = await authService.loginArtisan({ email, password });
          break;
        case 'admin':
          response = await authService.loginAdmin({ email, password });
          break;
      }

      if (response.success) {
        localStorage.setItem("token", response.token); 
        setUser(response.user);
        toast.success('Login successful!');
        
        // Redirect based on user type
        switch (type) {
          case 'user':
            router.push('/dashboard/user');
            break;
          case 'artisan':
            router.push('/dashboard/artisan');
            break;
          case 'admin':
            router.push('/dashboard/admin');
            break;
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any, type: 'user' | 'artisan') => {
    try {
      setIsLoading(true);
      let response;

      if (type === 'user') {
        response = await authService.registerUser(data);
      } else {
        response = await authService.registerArtisan(data);
      }

      if (response.success) {
        setUser(response.user);
        toast.success('Registration successful!');
        
        if (type === 'user') {
          router.push('/dashboard/user');
        } else {
          toast.success('Your application is pending approval');
          router.push('/');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem("token");
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (updatedUser: User | Artisan) => {
    setUser(updatedUser);
  };

  const userType = user?.role as 'user' | 'artisan' | 'admin' | null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !isLoading && !!user,
        isLoading,
        userType,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
