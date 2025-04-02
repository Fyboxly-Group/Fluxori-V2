import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User, LoginCredentials } from '../services/auth.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Auth hook for handling authentication state and operations
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Initialize auth state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const storedUser = AuthService.getCurrentUser();
      setUser(storedUser);
      setIsInitialized(true);
    }
  }, [isInitialized]);
  
  // Get user profile query
  const { data: profileData, isLoading: isLoadingProfile, error: profileError, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => AuthService.getProfile(),
    enabled: AuthService.isAuthenticated() && isInitialized,
    onSuccess: (data) => {
      setUser(data);
    },
    onError: () => {
      // If we can't fetch the profile, user might be logged out
      if (AuthService.isAuthenticated()) {
        // Try to refresh token
        refreshTokenMutation.mutate();
      }
    }
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => AuthService.login(credentials),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['user-profile'], data.user);
      
      // Redirect to dashboard or return URL
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      router.push(returnUrl || '/dashboard');
    }
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      router.push('/login');
    },
    onError: () => {
      // Even if server logout fails, clear local state
      setUser(null);
      queryClient.clear();
      router.push('/login');
    }
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: Partial<User>) => AuthService.updateProfile(profileData),
    onSuccess: (data) => {
      setUser(prevUser => prevUser ? { ...prevUser, ...data } : data);
      queryClient.setQueryData(['user-profile'], data);
    }
  });
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: any) => AuthService.updateSettings(settings),
    onSuccess: (data) => {
      setUser(prevUser => prevUser ? { ...prevUser, settings: { ...prevUser.settings, ...data } } : null);
      queryClient.setQueryData(['user-profile'], (oldData: User | undefined) => 
        oldData ? { ...oldData, settings: { ...oldData.settings, ...data } } : undefined
      );
    }
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => 
      AuthService.changePassword(oldPassword, newPassword)
  });
  
  // Request password reset mutation
  const requestPasswordResetMutation = useMutation({
    mutationFn: (email: string) => AuthService.requestPasswordReset(email)
  });
  
  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) => 
      AuthService.resetPassword(token, newPassword)
  });
  
  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: () => AuthService.refreshToken(),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['user-profile'], data.user);
    },
    onError: () => {
      // If token refresh fails, logout
      setUser(null);
      queryClient.clear();
      router.push('/login?session_expired=true');
    }
  });
  
  // Two-factor authentication mutations
  const enableTwoFactorMutation = useMutation({
    mutationFn: () => AuthService.enableTwoFactor()
  });
  
  const verifyTwoFactorMutation = useMutation({
    mutationFn: (code: string) => AuthService.verifyTwoFactorCode(code)
  });
  
  const disableTwoFactorMutation = useMutation({
    mutationFn: (code: string) => AuthService.disableTwoFactor(code)
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: { email: string; password: string; firstName: string; lastName: string }) => 
      AuthService.register(userData),
    onSuccess: () => {
      router.push('/login?registered=true');
    }
  });
  
  // Check if user has a specific permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return user.permissions?.includes(permission) || false;
  }, [user]);
  
  // Check if user has a specific role
  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  }, [user]);
  
  return {
    user,
    isAuthenticated: !!user,
    isInitialized,
    isLoading: isLoadingProfile && AuthService.isAuthenticated(),
    error: profileError,
    
    // Authentication operations
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    register: registerMutation.mutate,
    refreshToken: refreshTokenMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    requestPasswordReset: requestPasswordResetMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    enableTwoFactor: enableTwoFactorMutation.mutate,
    verifyTwoFactorCode: verifyTwoFactorMutation.mutate,
    disableTwoFactor: disableTwoFactorMutation.mutate,
    
    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRegistering: registerMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isEnablingTwoFactor: enableTwoFactorMutation.isPending,
    
    // Mutation results
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    updateProfileError: updateProfileMutation.error,
    changePasswordError: changePasswordMutation.error,
    
    // Helper functions
    hasPermission,
    hasRole,
    
    // Refresh user profile
    refreshProfile: refetch,
    
    // Two-factor data
    twoFactorData: enableTwoFactorMutation.data
  };
}

export default useAuth;