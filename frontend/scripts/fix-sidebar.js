#!/usr/bin/env node

/**
 * Fix Sidebar component
 * 
 * This script provides a proper implementation of Sidebar.tsx which has
 * significant syntax issues.
 */

const fs = require('fs');
const path = require('path');

// Root directory
const ROOT_DIR = process.cwd();

function fixSidebarComponent() {
  console.log('🔍 Fixing Sidebar component...');
  
  const filePath = path.join(ROOT_DIR, 'src/components/layout/Sidebar.tsx');
  
  if (fs.existsSync(filePath)) {
    // Provide a clean implementation
    const fixedContent = `'use client';

import { Home, BarChart, FolderOpen, Users, Bell, Settings } from 'lucide-react';
import { Box } from '@chakra-ui/react/box';
import { Flex } from '@chakra-ui/react/flex';
import { VStack } from '@chakra-ui/react/stack';
import { Text } from '@chakra-ui/react/text';
import { Divider } from '@chakra-ui/react/divider';
import { useColorMode } from '@chakra-ui/react/color-mode';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Types
interface MenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarSection {
  title?: string;
  items: MenuItem[];
}

interface SidebarProps {
  sections?: SidebarSection[];
}

// Default sidebar sections
const defaultSections: SidebarSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
      { label: 'Analytics', href: '/analytics', icon: <BarChart size={20} /> },
    ]
  },
  {
    title: 'Workspace',
    items: [
      { label: 'Projects', href: '/projects', icon: <FolderOpen size={20} /> },
      { label: 'Team', href: '/team', icon: <Users size={20} /> },
    ]
  },
  {
    title: 'Account',
    items: [
      { label: 'Notifications', href: '/notifications', icon: <Bell size={20} /> },
      { label: 'Settings', href: '/settings', icon: <Settings size={20} /> },
    ]
  }
];

export function Sidebar({ sections = defaultSections }: SidebarProps) {
  const { colorMode } = useColorMode();
  const pathname = usePathname();
  
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(\`\${href}/\`);
  };

  return (
    <Box
      as="aside"
      height="100vh"
      width={{ base: 'full', md: '250px' }}
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      borderRight="1px solid"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      position="sticky"
      top="0"
      pt="4"
      pb="10"
      overflowY="auto"
    >
      <Flex direction="column" height="full" gap={6}>
        {sections.map((section, sectionIndex) => (
          <Box key={sectionIndex} px="4">
            {section.title && (
              <Text
                fontWeight="medium"
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                mb="3"
                color={colorMode === 'light' ? 'gray.500' : 'gray.400'}
              >
                {section.title}
              </Text>
            )}
            <VStack align="stretch" gap="1">
              {section.items.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Flex
                    align="center"
                    px="3"
                    py="2"
                    rounded="md"
                    cursor="pointer"
                    color={isActive(item.href)
                      ? (colorMode === 'light' ? 'brand.600' : 'brand.300')
                      : (colorMode === 'light' ? 'gray.700' : 'gray.300')
                    }
                    bg={isActive(item.href)
                      ? (colorMode === 'light' ? 'brand.50' : 'rgba(66, 153, 225, 0.16)')
                      : 'transparent'
                    }
                    fontWeight={isActive(item.href) ? 'semibold' : 'normal'}
                    _hover={{
                      bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
                      color: colorMode === 'light' ? 'gray.900' : 'white',
                    }}
                  >
                    {item.icon && <Box mr="3">{item.icon}</Box>}
                    <Text>{item.label}</Text>
                  </Flex>
                </Link>
              ))}
            </VStack>
            {sectionIndex < sections.length - 1 && (
              <Divider my="4" borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'} />
            )}
          </Box>
        ))}
      </Flex>
    </Box>
  );
}`;
    
    fs.writeFileSync(filePath, fixedContent, { mode: 0o644 });
    console.log(`✅ Fixed ${path.relative(process.cwd(), filePath)}`);
  }
}

function main() {
  try {
    console.log('🚀 Starting Sidebar component fix script');
    
    // Fix the Sidebar component
    fixSidebarComponent();
    
    console.log('✅ All fixes applied');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();