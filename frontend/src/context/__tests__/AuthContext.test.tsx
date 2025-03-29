import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { createToaster } from '@chakra-ui/react/toast'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

jest.mock('@chakra-ui/react/toast', () => ({
  createToaster: jest.fn(),
}))

// Helper component to test the useAuth hook
const AuthTestComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth()

  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'no-user'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</div>
      <button 
        data-testid="login" 
        onClick={() => login('test@example.com', 'password123')}
      >
        Login
      </button>
      <button 
        data-testid="logout" 
        onClick={logout}
      >
        Logout
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  const mockPush = jest.fn()
  const mockShow = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock router
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    
    // Mock pathname
    ;(usePathname as jest.Mock).mockReturnValue('/')
    
    // Mock toast
    ;(createToaster as jest.Mock).mockReturnValue({
      show: mockShow,
    })
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })
  })

  it('provides authentication state to children', async () => {
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    )
    
    // Initial state should be unauthenticated
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('no')
  })

  it('handles login flow correctly', async () => {
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    )
    
    // Click login button
    fireEvent.click(screen.getByTestId('login'))
    
    // Wait for async login process
    await waitFor(() => {
      // Should set localStorage token
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth_token',
        expect.any(String)
      )
      
      // Should show success toast
      expect(mockShow).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Login successful',
        status: 'success',
      }))
      
      // Should redirect to dashboard
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('handles logout flow correctly', async () => {
    // Setup localStorage with a token
    ;(window.localStorage.getItem as jest.Mock).mockReturnValueOnce('mock-token')
    
    act(() => {
      render(
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      )
    })
    
    // Wait for auth check to complete
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('yes')
    })
    
    // Click logout button
    fireEvent.click(screen.getByTestId('logout'))
    
    // Wait for async logout process
    await waitFor(() => {
      // Should remove localStorage token
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token')
      
      // Should show success toast
      expect(mockShow).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Logged out',
        status: 'success',
      }))
      
      // Should redirect to login page
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('redirects unauthenticated users from protected routes', async () => {
    // Mock pathname to a protected route
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
    
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    )
    
    // Wait for auth check to complete
    await waitFor(() => {
      // Should show warning toast
      expect(mockShow).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Authentication required',
        status: 'warning',
      }))
      
      // Should redirect to login page
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('redirects authenticated users from auth routes', async () => {
    // Setup localStorage with a token
    ;(window.localStorage.getItem as jest.Mock).mockReturnValueOnce('mock-token')
    
    // Mock pathname to an auth route
    ;(usePathname as jest.Mock).mockReturnValue('/auth/login')
    
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    )
    
    // Wait for auth check to complete
    await waitFor(() => {
      // Should redirect to dashboard
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})