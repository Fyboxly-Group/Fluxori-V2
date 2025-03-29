'use client'

import { IconButton } from '@chakra-ui/react/button'
import { useColorMode } from '@chakra-ui/react/color-mode'
import { Box } from '@chakra-ui/react/box'
import { useEffect } from 'react'
import { storeColorMode } from '@/utils/colorMode'

// Placeholder for icons
const SunIcon = () => <Box>☀️</Box>
const MoonIcon = () => <Box>🌙</Box>

interface ColorModeToggleProps {
  variant?: string
  size?: string
}

export function ColorModeToggle({ 
  variant = 'ghost', 
  size = 'md' 
}: ColorModeToggleProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  
  // Persist the color mode to localStorage whenever it changes
  useEffect(() => {
    storeColorMode(colorMode)
  }, [colorMode])
  
  return (
    <IconButton
      aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
      icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      onClick={toggleColorMode}
      variant={variant}
      size={size}
    />
  )
}