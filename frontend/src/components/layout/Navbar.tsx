'use client'

import { Flex } from '@chakra-ui/react/flex'
import { Box } from '@chakra-ui/react/box'
import { Button } from '@chakra-ui/react/button'
import { Image } from '@chakra-ui/react/image'
import { HStack } from '@chakra-ui/react/stack'
import { IconButton } from '@chakra-ui/react/button'
import { useColorMode } from '@chakra-ui/react/color-mode'
import { useDisclosure } from '@chakra-ui/react/hooks'
import { Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton } from '@chakra-ui/react/drawer'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ColorModeToggle } from '@/components/ui/ColorModeToggle'
import { NotificationBell } from '@/features/notifications'

// Placeholder for icons - in a real app you'd import from your icon library
const SunIcon = () => <Box>☀️</Box>
const MoonIcon = () => <Box>🌙</Box>
const MenuIcon = () => <Box>☰</Box>

type NavItem = {
  label: string
  href: string
}

type NavbarProps = {
  logo?: string
  navItems?: NavItem[]
}

export function Navbar({ 
  logo = '/logo.svg', 
  navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Projects', href: '/projects' },
    { label: 'Settings', href: '/settings' }
  ]
}: NavbarProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Box 
      as="nav" 
      position="sticky" 
      top="0" 
      zIndex="sticky"
      width="100%"
      boxShadow={scrolled ? 'md' : 'none'}
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      transition="box-shadow 0.2s, background-color 0.2s"
    >
      <Flex 
        px={{ base: 4, md: 6 }} 
        py={3} 
        align="center"
        justify="space-between"
        maxW="1400px"
        mx="auto"
      >
        <Flex align="center">
          <Link href="/" passHref>
            <Box mr={8} cursor="pointer">
              {/* Replace with your actual logo */}
              <Box fontWeight="bold" fontSize="xl">Fluxori</Box>
            </Box>
          </Link>

          {/* Desktop Navigation */}
          <HStack gap={8} display={{ base: 'none', md: 'flex' }}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Box 
                  px={2}
                  py={1}
                  rounded="md"
                  fontWeight="medium"
                  color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
                  _hover={{ 
                    bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
                    color: colorMode === 'light' ? 'gray.900' : 'white' 
                  }}
                  cursor="pointer"
                >
                  {item.label}
                </Box>
              </Link>
            ))}
          </HStack>
        </Flex>

        <HStack gap={2}>
          {/* Notification Bell - hidden on mobile */}
          <Box display={{ base: 'none', md: 'block' }}>
            <NotificationBell />
          </Box>
        
          {/* Use ColorModeToggle component */}
          <ColorModeToggle />

          {/* Mobile menu button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            aria-label="Open menu"
            variant="ghost"
            icon={<MenuIcon />}
            onClick={onOpen}
          />

          {/* User actions button */}
          <Button 
            display={{ base: 'none', md: 'inline-flex' }}
            variant="primary"
            size="sm"
          >
            Sign In
          </Button>
        </HStack>
      </Flex>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <Flex direction="column" gap={4}>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} passHref onClick={onClose}>
                  <Box 
                    px={3}
                    py={2}
                    rounded="md"
                    _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                  >
                    {item.label}
                  </Box>
                </Link>
              ))}
              <Button mt={4} variant="primary">
                Sign In
              </Button>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}