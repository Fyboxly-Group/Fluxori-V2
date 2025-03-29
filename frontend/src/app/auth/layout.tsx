'use client'

import { Box } from '@chakra-ui/react/box'
import { Flex } from '@chakra-ui/react/flex'
import { useColorMode } from '@chakra-ui/react/color-mode'
import { IconButton } from '@chakra-ui/react/button'

// Placeholder for icons
const SunIcon = () => <Box>☀️</Box>
const MoonIcon = () => <Box>🌙</Box>

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { colorMode, toggleColorMode } = useColorMode()
  
  return (
    <Box minH="100vh" bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}>
      {/* Color mode toggle */}
      <IconButton
        aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        position="absolute"
        top="4"
        right="4"
        zIndex="overlay"
        onClick={toggleColorMode}
        variant="ghost"
      />
      
      <Flex 
        minH="100vh" 
        align="center" 
        justify="center" 
        p={4}
      >
        {children}
      </Flex>
    </Box>
  )
}