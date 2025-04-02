import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/api/client';

export interface UseUserOptions {
  redirectIfNotAuth?: boolean;
  redirectTo?: string;
}

export function useUser(options: UseUserOptions = {}) {
  const { redirectIfNotAuth = false, redirectTo = '/auth/login' } = options;
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch user data from API or localStorage
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get user from API
      const response = await apiClient.get('/api/user/me');
      setUser(response.data);
      setError(null);
      
      return response.data;
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
      
      if (redirectIfNotAuth) {
        router.push(redirectTo);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [redirectIfNotAuth, redirectTo, router]);
  
  // Update user data
  const updateUser = useCallback(async (userData: Partial<User>) => {
    try {
      setLoading(true);
      
      // Update user via API
      const response = await apiClient.put('/api/user/me', userData);
      setUser(response.data);
      setError(null);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update user'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Logout user
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call logout API
      await apiClient.post('/api/auth/logout');
      
      // Clear user data
      setUser(null);
      setError(null);
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to logout'));
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  // Fetch user on component mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  return {
    user,
    loading,
    error,
    fetchUser,
    updateUser,
    logout,
  };
}

export default useUser;