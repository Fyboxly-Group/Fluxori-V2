import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId?: string;
  organizationName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  organizationName?: string;
}

/**
 * Authentication hook for handling user login, registration, and session management
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is authenticated
  const { data: user, isLoading: isUserLoading } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        // Check for token
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        
        // Fetch current user data
        const response = await api.get<User>('/auth/me');
        return response.data || null;
      } catch (error) {
        // Clear token on authentication error
        localStorage.removeItem('accessToken');
        return null;
      }
    },
    onSettled: () => setIsLoading(false),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Login mutation
  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<{ token: string, user: User }>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.token) {
        localStorage.setItem('accessToken', data.token);
        queryClient.setQueryData(['user'], data.user);
      }
    },
  });
  
  // Register mutation
  const register = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post<{ token: string, user: User }>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.token) {
        localStorage.setItem('accessToken', data.token);
        queryClient.setQueryData(['user'], data.user);
      }
    },
  });
  
  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    queryClient.setQueryData(['user'], null);
    queryClient.invalidateQueries({ queryKey: ['user'] });
    // Optionally call logout endpoint
    api.post('/auth/logout').catch(() => {
      // Silent catch - we've already cleared local state
    });
  }, [queryClient]);
  
  // Check for token on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
    }
  }, []);
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || isUserLoading,
    login,
    register,
    logout,
  };
}

export default useAuth;