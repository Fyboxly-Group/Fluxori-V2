'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { Box, Flex, HStack, Button, IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent } from '@/utils/chakra-compat';
import { useColorMode, useDisclosure, DrawerCloseButton } from '@/components/stubs/ChakraStubs';;
import { Menu as MenuIcon } from 'lucide-react';
import { ColorModeToggle } from '../ui/ColorModeToggle';
import { NotificationBell } from '../common/NotificationBell';

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
  logoText?: string;
  logoSrc?: string;
  children?: React.ReactNode;
  fixed?: boolean;
  transparent?: boolean;
  bg?: string;
  height?: string | number;
  zIndex?: number;
  boxShadow?: string;
  borderBottomWidth?: string | number;
  borderBottomColor?: string;
  position?: string;
  logo?: React.ReactNode | string;
  navItems?: Array<{
    label: string;
    href: string;
    icon?: React.ReactElement;
  }>;
}

export function Navbar({ 
  logo = '/logo.svg',
  navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Projects', href: '/projects' },
    { label: 'Settings', href: '/settings' }
  ]
}: NavbarProps) {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        px={{ base: '4', md: '6' }} 
        py={3} 
        align="center"
        justify="space-between"
        maxW="1400px"
        mx="auto"
      >
        <Flex align="center">
          <NextLink href="/" passHref>
            <Box mr={8} cursor="pointer">
              {/* Replace with your actual logo */}
              <Box fontWeight="bold" fontSize="xl">Fluxori</Box>
            </Box>
          </NextLink>

          {/* Desktop Navigation */}
          <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
            {navItems.map((item: NavItem) => (
              <NextLink key={item.href} href={item.href} passHref>
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
              </NextLink>
            ))}
          </HStack>
        </Flex>

        <HStack spacing={2}>
          {/* Notification Bell - hidden on mobile */}
          <Box display={{ base: 'none', md: 'block' }}>
            <NotificationBell count={3} />
          </Box>
        
          {/* Use ColorModeToggle component */}
          <ColorModeToggle />

          {/* Mobile menu button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            aria-label="Open menu"
            variant="ghost"
            icon={<MenuIcon  />}
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
              {navItems.map((item: NavItem) => (
                <NextLink key={item.href} href={item.href} passHref>
                  <Box
                    onClick={onClose}
                    px={3}
                    py={2}
                    rounded="md"
                    _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                  >
                    {item.label}
                  </Box>
                </NextLink>
              ))}
              <Button mt={4} variant="primary">
                Sign In
              </Button>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}