

interface authProps {}
import { apiClient } from './client'

// Define response types for API calls
interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    role: 'user' | 'admin'
  }
}

interface RegisterResponse {
  success: boolean
  message: string
}

interface ForgotPasswordResponse {
  success: boolean
  message: string
}

interface ResetPasswordResponse {
  success: boolean
  message: string
}

interface MeResponse {
  user: {
    id: string
    name: string
    email: string
    role: 'user' | 'admin'
  }
}

// Auth service with API calls
export const authService = {
  /**
   * Authenticate a user with email and password
   */
  login: (email: string, password: string) => {
    return apiClient.post<LoginResponse>('/auth/login', { email, password })
  },

  /**
   * Register a new user
   */
  register: (name: string, email: string, password: string) => {
    return apiClient.post<RegisterResponse>('/auth/register', {
      name,
      email,
      password,
    })
  },

  /**
   * Get current user information
   */
  me: () => {
    return apiClient.get<MeResponse>('/auth/me')
  },

  /**
   * Request a password reset email
   */
  forgotPassword: (email: string) => {
    return apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', {
      email,
    })
  },

  /**
   * Reset password with token
   */
  resetPassword: (token: string, password: string) => {
    return apiClient.post<ResetPasswordResponse>('/auth/reset-password', {
      token,
      password,
    })
  },

  /**
   * Logout (clear token on the server)
   */
  logout: () => {
    return apiClient.post('/auth/logout', {})
  },
}