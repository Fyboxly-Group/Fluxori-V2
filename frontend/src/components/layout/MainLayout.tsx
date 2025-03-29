'use client'

import { Box } from '@chakra-ui/react/box'
import { Flex } from '@chakra-ui/react/flex'
import { useColorMode } from '@chakra-ui/react/color-mode'
import { ReactNode, useState } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { IconButton } from '@chakra-ui/react/button'

// Placeholder for menu icon
const MenuIcon = () => <Box>☰</Box> 

type MainLayoutProps = {
  children: ReactNode
  showSidebar?: boolean
}

export function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  const { colorMode } = useColorMode()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <Box minH="100vh" bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}>
      {/* Navbar is always visible */}
      <Navbar />
      
      <Flex>
        {/* Sidebar - only visible on larger screens or when toggled */}
        {showSidebar && (
          <Box 
            display={{ base: sidebarOpen ? 'block' : 'none', md: 'block' }}
            position={{ base: 'fixed', md: 'relative' }}
            zIndex={{ base: 'modal', md: 'auto' }}
            w={{ base: 'full', md: '250px' }}
            h={{ base: 'full', md: 'auto' }}
          >
            <Sidebar sections={[
              {
                items: [
                  { label: 'Dashboard', href: '/dashboard', icon: <Box>🏠</Box> },
                  { label: 'Analytics', href: '/analytics', icon: <Box>📊</Box> }
                ]
              },
              {
                title: 'Workspace',
                items: [
                  { label: 'Projects', href: '/projects', icon: <Box>📂</Box> },
                  { label: 'Team', href: '/team', icon: <Box>👥</Box> }
                ]
              }
            ]} />
          </Box>
        )}
        
        {/* Mobile sidebar toggle button - only visible on small screens */}
        {showSidebar && (
          <IconButton
            aria-label="Toggle sidebar"
            icon={<MenuIcon />}
            position="fixed"
            bottom="4"
            left="4"
            zIndex="overlay"
            display={{ base: 'flex', md: 'none' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            boxShadow="md"
          />
        )}
        
        {/* Main content area */}
        <Box 
          as="main" 
          flex="1"
          p={{ base: 4, md: 6 }}
          ml={{ base: 0, md: showSidebar ? '0' : '0' }}
          transition="margin-left 0.2s"
        >
          {children}
        </Box>
      </Flex>
    </Box>
  )
}