import api, { ApiResponse } from '../api-client';

/**
 * Authentication credentials model
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * User model
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  avatar?: string;
  settings?: UserSettings;
  lastLogin?: string;
}

/**
 * User settings model
 */
export interface UserSettings {
  language: string;
  theme: 'light' | 'dark' | 'system';
  motionPreference: 'minimal' | 'moderate' | 'full';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

/**
 * Auth token response
 */
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

/**
 * Authentication Service
 * Handles user authentication and session management
 */
const AuthService = {
  /**
   * Log in with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthTokenResponse> {
    const response = await api.post<AuthTokenResponse>('/auth/login', credentials);
    
    // Store tokens in localStorage
    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data as AuthTokenResponse;
  },

  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse> {
    return api.post('/auth/register', userData);
  },

  /**
   * Log out the current user
   */
  async logout(): Promise<ApiResponse> {
    const response = await api.post('/auth/logout');
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return response;
  },

  /**
   * Refresh auth token
   */
  async refreshToken(): Promise<AuthTokenResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post<AuthTokenResponse>('/auth/refresh', { refreshToken });
    
    // Update tokens in localStorage
    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data as AuthTokenResponse;
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse> {
    return api.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    return api.post('/auth/reset-password', { token, newPassword });
  },

  /**
   * Change user password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    return api.post('/auth/change-password', { oldPassword, newPassword });
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data as User;
  },

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/profile', profileData);
    
    // Update user in localStorage
    if (response.data) {
      const currentUserStr = localStorage.getItem('user');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          ...response.data
        }));
      }
    }
    
    return response.data as User;
  },

  /**
   * Update user settings
   */
  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await api.put<UserSettings>('/auth/settings', settings);
    
    // Update settings in localStorage
    if (response.data) {
      const currentUserStr = localStorage.getItem('user');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          settings: {
            ...currentUser.settings,
            ...response.data
          }
        }));
      }
    }
    
    return response.data as UserSettings;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Verify the current token is valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      await api.get('/auth/verify');
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(): Promise<{ secret: string; qrCodeUrl: string }> {
    const response = await api.post<{ secret: string; qrCodeUrl: string }>('/auth/2fa/enable');
    return response.data as { secret: string; qrCodeUrl: string };
  },

  /**
   * Verify two-factor authentication code
   */
  async verifyTwoFactorCode(code: string): Promise<ApiResponse> {
    return api.post('/auth/2fa/verify', { code });
  },

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(code: string): Promise<ApiResponse> {
    return api.post('/auth/2fa/disable', { code });
  }
};

export default AuthService;