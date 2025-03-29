import React from 'react'
import { render, screen, fireEvent } from '@/utils/test/test-utils'
import { ColorModeToggle } from '../ColorModeToggle'
import { useColorMode } from '@chakra-ui/react/color-mode'

// Mock the useColorMode hook from Chakra UI
jest.mock('@chakra-ui/react/color-mode', () => ({
  useColorMode: jest.fn(),
}))

describe('ColorModeToggle', () => {
  const mockToggleColorMode = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders light mode toggle button', () => {
    // Mock return value for useColorMode
    (useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    })

    render(<ColorModeToggle />)
    
    // Check if button exists
    const button = screen.getByRole('button', { name: /switch to dark mode/i })
    expect(button).toBeInTheDocument()
  })

  it('renders dark mode toggle button', () => {
    // Mock return value for useColorMode
    (useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'dark',
      toggleColorMode: mockToggleColorMode,
    })

    render(<ColorModeToggle />)
    
    // Check if button exists
    const button = screen.getByRole('button', { name: /switch to light mode/i })
    expect(button).toBeInTheDocument()
  })

  it('calls toggleColorMode when button is clicked', () => {
    // Mock return value for useColorMode
    (useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    })

    render(<ColorModeToggle />)
    
    // Check if button exists and click it
    const button = screen.getByRole('button', { name: /switch to dark mode/i })
    fireEvent.click(button)
    
    // Check if toggleColorMode was called
    expect(mockToggleColorMode).toHaveBeenCalledTimes(1)
  })

  it('renders with custom variant and size', () => {
    // Mock return value for useColorMode
    (useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    })

    render(<ColorModeToggle variant="solid" size="lg" />)
    
    // Check if button exists
    const button = screen.getByRole('button', { name: /switch to dark mode/i })
    expect(button).toBeInTheDocument()
    // Note: We can't easily test for specific Chakra UI styling in this simple test
  })
})