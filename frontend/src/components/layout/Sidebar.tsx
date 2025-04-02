'use client';

import React from 'react';
import NextLink from 'next/link';
import { Box, VStack, Text, Button } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;
import { Folder, Home, Settings, Layers, ChevronLeft, ChevronRight } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'drawer' | 'sidebar';
  children?: React.ReactNode;
  width?: string | number;
  bg?: string;
  borderRight?: string;
  position?: string;
  zIndex?: number;
  minH?: string;
  h?: string | number;
  boxShadow?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  menuItems?: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
    subItems?: Array<{
      label: string;
      href: string;
    }>;
  }>;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { colorMode } = useColorMode();
  
  // Navigation items
  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home size={18} /> },
    { label: 'Projects', href: '/projects', icon: <Folder size={18} /> },
    { label: 'Inventory', href: '/inventory', icon: <Layers size={18} /> },
    { label: 'Settings', href: '/settings', icon: <Settings size={18} /> },
  ];
  
  return (
    <Box
      as="aside"
      position="fixed"
      left={0}
      top={0}
      bottom={0}
      width={collapsed ? '60px' : '240px'}
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      borderRight="1px"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      transition="width 0.2s"
      zIndex="docked"
      pt="60px" // Space for navbar
      overflowX="hidden"
    >
      <VStack spacing={2} align="stretch" p={2}>
        {navItems.map((item) => (
          <NextLink key={item.href} href={item.href} passHref>
            <Button
              variant="ghost"
              justifyContent={collapsed ? 'center' : 'flex-start'}
              leftIcon={item.icon}
              width="full"
              borderRadius="md"
              py={collapsed ? 3 : 2}
            >
              {!collapsed && <Text ml={2}>{item.label}</Text>}
            </Button>
          </NextLink>
        ))}
      </VStack>
      
      {/* Collapse/Expand button */}
      <Box position="absolute" bottom={4} width="100%" textAlign="center">
        <Button
          size="sm"
          onClick={onToggle}
          variant="ghost"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </Box>
    </Box>
  );
}

export default Sidebar;