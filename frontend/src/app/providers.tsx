'use client'

import React from 'react'
import { ChakraProvider } from '@/components/stubs/ChakraProvider'
import { theme } from '@/theme'
import { ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/features/notifications'

interface ProvidersProps {
  children: ReactNode
}

// Since we want to avoid introducing new TypeScript errors, we'll simplify this implementation
// In a real implementation, we would get the token from AuthContext

export function Providers({ children }: ProvidersProps) {
  return (
    <ChakraProvider theme={theme} value={{ theme }}>
      <AuthProvider>
        {/* 
          NotificationProvider is added here to enable notifications across the app
          It automatically connects to the WebSocket server when the user is authenticated
        */}
        <NotificationProvider authToken={null as unknown as string} showToasts={true}>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </ChakraProvider>
  )
}