import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ChakraProvider, ChakraTheme } from '@chakra-ui/react'
import { theme } from '@/theme'
import { AuthProvider } from '@/context/AuthContext'

// Define AllProviders wrapper component for tests
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>{children}</AuthProvider>
    </ChakraProvider>
  )
}

// Custom render method
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options })

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override render method
export { customRender as render }