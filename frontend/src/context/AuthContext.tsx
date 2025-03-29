'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createToaster } from '@chakra-ui/react/toast'

// Define the user type
export type User = {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

// Define the context type
type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()
  const pathname = usePathname()
  const toast = createToaster()

  // Check if the user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real application, you would check for a token in localStorage
        // and validate it with your backend API
        const token = localStorage.getItem('auth_token')
        
        if (token) {
          // Simulate API call to validate token and get user data
          // In a real app, you would make an API request here
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Mock user data for demo purposes
          setUser({
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user'
          })
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        // Clear any invalid tokens
        localStorage.removeItem('auth_token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  // Redirect unauthenticated users away from protected routes
  useEffect(() => {
    // Skip during SSR or when loading
    if (typeof window === 'undefined' || loading) return

    const isProtectedRoute = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/settings') ||
                           pathname.startsWith('/projects')
                           
    const isAuthRoute = pathname.startsWith('/auth/')
    
    if (isProtectedRoute && !user) {
      // Redirect to login if trying to access protected route while not authenticated
      router.push('/auth/login')
      toast.show({
        title: 'Authentication required',
        description: 'Please log in to access this page',
        status: 'warning',
      })
    } else if (isAuthRoute && user) {
      // Redirect to dashboard if trying to access auth routes while already authenticated
      router.push('/dashboard')
    }
  }, [pathname, user, loading, router, toast])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, you would make an API request to your backend
      // and store the returned token
      
      // Mock successful login for demo purposes
      localStorage.setItem('auth_token', 'mock_token_' + Date.now())
      
      // Set user state
      setUser({
        id: '1',
        name: 'John Doe',
        email,
        role: 'user'
      })
      
      toast.show({
        title: 'Login successful',
        description: 'Welcome back!',
        status: 'success',
      })
      
      router.push('/dashboard')
    } catch (error) {
      toast.show({
        title: 'Login failed',
        description: 'Invalid email or password',
        status: 'error',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, you would make an API request to your backend
      // to create a new user account
      
      toast.show({
        title: 'Registration successful',
        description: 'Your account has been created',
        status: 'success',
      })
      
      // Note: In most real applications, you would redirect to login
      // instead of automatically logging in the user
      router.push('/auth/login')
    } catch (error) {
      toast.show({
        title: 'Registration failed',
        description: 'An error occurred during registration',
        status: 'error',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem('auth_token')
    
    // Clear user state
    setUser(null)
    
    // Show success message
    toast.show({
      title: 'Logged out',
      description: 'You have been successfully logged out',
      status: 'success',
    })
    
    // Redirect to login page
    router.push('/auth/login')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}