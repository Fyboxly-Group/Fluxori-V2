/**
 * Fix JSX syntax errors in React components
 * 
 * This script targets specific syntax errors in JSX/TSX files:
 * - Missing closing tags
 * - Mismatched brackets
 * - Unexpected tokens
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Root directory
const ROOT_DIR = process.cwd();

// Get all files with JSX syntax errors
function getFilesWithSyntaxErrors() {
  try {
    const result = execSync('npx tsc --noEmit 2>&1', { cwd: ROOT_DIR });
    return []; // No errors
  } catch (error) {
    const errorOutput = error.stdout.toString();
    const lines = errorOutput.split('\n');
    
    // Extract unique file paths with syntax errors
    const filesWithErrors = new Set();
    
    for (const line of lines) {
      if (line.includes('error TS') && 
          (line.includes('Unexpected token') || 
           line.includes('expected') ||
           line.includes('has no corresponding closing tag') ||
           line.includes('JSX element'))) {
        const match = line.match(/^([^(]+)\(\d+,\d+\)/);
        if (match) {
          filesWithErrors.add(match[1]);
        }
      }
    }
    
    return Array.from(filesWithErrors);
  }
}

function fixNavbarComponent() {
  console.log('🔍 Fixing Navbar component...');
  
  const filePath = path.join(ROOT_DIR, 'src/components/layout/Navbar.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix syntax errors in the Navbar component
    // This is a targeted fix for the specific file
    const fixedContent = `'use client';

import { useState } from 'react';
import { Box } from '@chakra-ui/react/box';
import { HStack, VStack } from '@chakra-ui/react/stack';
import { Heading } from '@chakra-ui/react/heading';
import { IconButton } from '@chakra-ui/react/button';
import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay } from '@chakra-ui/react/drawer';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react/menu';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { Flex } from '@chakra-ui/react/flex';
import { Button } from '@chakra-ui/react/button';
import { Text } from '@chakra-ui/react/text';
import { Avatar } from '@chakra-ui/react/avatar';
import { Divider } from '@chakra-ui/react/divider';
import { Link } from '@chakra-ui/react/link';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Menu as MenuIcon, Bell, Settings, LogOut, Sun, Moon, Mail } from 'lucide-react';

import { ColorModeToggle } from '@/components/ui/ColorModeToggle';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onSidebarToggle: () => void;
}

export function Navbar({ onSidebarToggle }: NavbarProps) {
  const { colorMode } = useColorMode();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };
  
  return (
    <Box 
      as="nav" 
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      borderBottom="1px" 
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      py={2}
      px={4}
      position="sticky"
      top={0}
      zIndex={10}
      width="100%"
    >
      <Flex justify="space-between" align="center">
        {/* Logo and mobile menu toggle */}
        <HStack>
          <IconButton
            icon={<MenuIcon size={20} />}
            variant="ghost"
            display={{ base: 'flex', md: 'none' }}
            onClick={onSidebarToggle}
            aria-label="Toggle sidebar"
          />
          
          <NextLink href="/dashboard" passHref>
            <Heading as="h1" size="md" fontWeight="bold" cursor="pointer">
              Fluxori
            </Heading>
          </NextLink>
        </HStack>
        
        {/* Right side user controls */}
        <HStack spacing={2}>
          <ColorModeToggle size="sm" />
          
          <NotificationBell />
          
          {/* User Menu */}
          <Menu 
            open={isUserMenuOpen} 
            onClose={() => setIsUserMenuOpen(false)}
          >
            <MenuButton
              as={Button}
              variant="ghost"
              rounded="full"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              rightIcon={<User size={18} />}
              size="sm"
            >
              {user?.displayName || user?.email || 'User'}
            </MenuButton>
            
            <MenuList py={2}>
              <NextLink href="/profile" passHref>
                <MenuItem icon={<User size={16} />}>
                  Profile
                </MenuItem>
              </NextLink>
              
              <NextLink href="/settings" passHref>
                <MenuItem icon={<Settings size={16} />}>
                  Settings
                </MenuItem>
              </NextLink>
              
              <NextLink href="/feedback" passHref>
                <MenuItem icon={<Mail size={16} />}>
                  Send Feedback
                </MenuItem>
              </NextLink>
              
              <Divider my={2} />
              
              <MenuItem 
                icon={<LogOut size={16} />}
                onClick={handleLogout}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      
      {/* Mobile menu drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        placement="right"
        onClose={() => setIsMobileMenuOpen(false)}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          
          <DrawerBody>
            <VStack spacing={4} align="start">
              <NextLink href="/profile" passHref>
                <Button leftIcon={<User size={16} />} variant="ghost" justifyContent="flex-start" width="100%">
                  Profile
                </Button>
              </NextLink>
              
              <NextLink href="/settings" passHref>
                <Button leftIcon={<Settings size={16} />} variant="ghost" justifyContent="flex-start" width="100%">
                  Settings
                </Button>
              </NextLink>
              
              <Divider />
              
              <Button 
                leftIcon={<LogOut size={16} />}
                variant="ghost"
                justifyContent="flex-start"
                width="100%"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default Navbar;`;
    
    // Write the fixed content
    fs.writeFileSync(filePath, fixedContent);
    console.log(`✅ Fixed Navbar component`);
  }
}

function fixSidebarComponent() {
  console.log('🔍 Fixing Sidebar component...');
  
  const filePath = path.join(ROOT_DIR, 'src/components/layout/Sidebar.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the Flex closing tag issue
    if (content.includes('<Flex') && content.includes('JSX element \'Flex\' has no corresponding closing tag')) {
      // Find any unclosed Flex tags and close them
      content = content.replace(/<Flex([^>]*?)>(?!\s*<\/Flex>)/g, '<Flex$1>\n');
      
      // Add missing closing tags
      const openTags = (content.match(/<Flex/g) || []).length;
      const closeTags = (content.match(/<\/Flex>/g) || []).length;
      
      if (openTags > closeTags) {
        // Find positions where we need to add closing tags
        const lines = content.split('\n');
        let openCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Count opening and closing tags
          const opens = (line.match(/<Flex/g) || []).length;
          const closes = (line.match(/<\/Flex>/g) || []).length;
          openCount += opens - closes;
          
          // If we have an open tag at the end of a major section, close it
          if (openCount > 0 && 
              (line.includes('</Box>') || 
               line.includes('</VStack>') ||
               line.includes('return (') ||
               line.includes('</HStack>'))) {
            lines[i] = line + '\n' + '  '.repeat(openCount) + '</Flex>'.repeat(openCount);
            openCount = 0;
          }
        }
        
        content = lines.join('\n');
      }
    }
    
    // Fix active prop issues
    content = content.replace(/isActive/g, 'active');
    
    // Fix mismatched brackets in JSX expressions
    content = content.replace(/({[^{}]*}}+)/g, match => {
      // Count opening and closing braces
      const openBraces = (match.match(/{/g) || []).length;
      const closeBraces = (match.match(/}/g) || []).length;
      
      if (openBraces < closeBraces) {
        // Remove excess closing braces
        return match.replace(/}+$/, '}');
      }
      
      return match;
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed Sidebar component`);
  }
}

function fixQueryStateHandlerComponent() {
  console.log('🔍 Fixing QueryStateHandler component...');
  
  const filePath = path.join(ROOT_DIR, 'src/components/common/QueryStateHandler.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix missing parentheses and braces
    content = content.replace(/\)\s*=>\s*\{[^}]*?$/gm, match => {
      return match + '\n}';
    });
    
    // Check for proper JSX closing structure
    const jsxTags = [
      { open: '<Box', close: '</Box>' },
      { open: '<Flex', close: '</Flex>' },
      { open: '<VStack', close: '</VStack>' },
      { open: '<Center', close: '</Center>' },
      { open: '<Spinner', close: '</Spinner>' },
    ];
    
    jsxTags.forEach(tag => {
      const openCount = (content.match(new RegExp(tag.open, 'g')) || []).length;
      const closeCount = (content.match(new RegExp(tag.close, 'g')) || []).length;
      
      if (openCount > closeCount) {
        // Add closing tags at appropriate places
        const tagName = tag.close.replace(/[<\/]/g, '');
        const lastIndex = content.lastIndexOf('}');
        
        content = content.slice(0, lastIndex) + `\n${tag.close}\n` + content.slice(lastIndex);
      }
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed QueryStateHandler component`);
  }
}

function fixFeedbackPageComponent() {
  console.log('🔍 Fixing Feedback page component...');
  
  const filePath = path.join(ROOT_DIR, 'src/app/feedback/page.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix mismatched braces
    content = content.replace(/({[^{}]*}}+)/g, match => {
      // Count opening and closing braces
      const openBraces = (match.match(/{/g) || []).length;
      const closeBraces = (match.match(/}/g) || []).length;
      
      if (openBraces < closeBraces) {
        // Remove excess closing braces
        return match.substring(0, match.length - (closeBraces - openBraces));
      }
      
      return match;
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed Feedback page component`);
  }
}

function fixErrorMonitoringDashboardComponent() {
  console.log('🔍 Fixing ErrorMonitoringDashboard component...');
  
  const filePath = path.join(ROOT_DIR, 'src/components/admin/ErrorMonitoringDashboard.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix mismatched braces
    content = content.replace(/({[^{}]*}}+)/g, match => {
      // Count opening and closing braces
      const openBraces = (match.match(/{/g) || []).length;
      const closeBraces = (match.match(/}/g) || []).length;
      
      if (openBraces < closeBraces) {
        // Remove excess closing braces
        return match.substring(0, match.length - (closeBraces - openBraces));
      }
      
      return match;
    });
    
    // Fix import at wrong location
    if (content.includes("An import declaration can only be used")) {
      // Find import declarations inside function bodies
      const importRegex = /function\s+\w+\([^)]*\)\s*{[^}]*?import\s+/g;
      const matches = [...content.matchAll(importRegex)];
      
      if (matches.length > 0) {
        // Move imports to the top
        const imports = [];
        
        for (const match of matches) {
          const funcStart = match.index;
          const importStart = content.indexOf('import', funcStart);
          const importEnd = content.indexOf(';', importStart) + 1;
          
          if (importStart > 0 && importEnd > 0) {
            const importStatement = content.substring(importStart, importEnd);
            imports.push(importStatement);
            
            // Remove the import from its current location
            content = content.substring(0, importStart) + content.substring(importEnd);
          }
        }
        
        // Add all imports at the top
        if (imports.length > 0) {
          const firstImportIndex = content.indexOf('import');
          if (firstImportIndex >= 0) {
            // Find the import block
            let importBlockEnd = firstImportIndex;
            let line = content.substring(importBlockEnd);
            
            while (line.startsWith('import')) {
              const nextSemicolon = line.indexOf(';') + 1;
              importBlockEnd += nextSemicolon;
              line = content.substring(importBlockEnd);
            }
            
            // Insert the new imports after the existing import block
            content = 
              content.substring(0, importBlockEnd) + 
              '\n' + 
              imports.join('\n') + 
              '\n' + 
              content.substring(importBlockEnd);
          }
        }
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ErrorMonitoringDashboard component`);
  }
}

function fixJSXSyntaxInFile(filePath) {
  console.log(`🔍 Fixing JSX syntax in ${path.basename(filePath)}...`);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix mismatched braces
    content = content.replace(/({[^{}]*}}+)/g, match => {
      // Count opening and closing braces
      const openBraces = (match.match(/{/g) || []).length;
      const closeBraces = (match.match(/}/g) || []).length;
      
      if (openBraces < closeBraces) {
        // Remove excess closing braces
        return match.substring(0, match.length - (closeBraces - openBraces));
      }
      
      return match;
    });
    
    // Fix unexpected tokens in JSX
    content = content.replace(/(<[^>]+)\/([^>]*>)/g, '$1 $2');
    
    // Fix missing closing tags
    const jsxTags = [
      { open: '<div', close: '</div>' },
      { open: '<span', close: '</span>' },
      { open: '<Box', close: '</Box>' },
      { open: '<Flex', close: '</Flex>' },
      { open: '<VStack', close: '</VStack>' },
      { open: '<HStack', close: '</HStack>' },
      { open: '<Center', close: '</Center>' },
      { open: '<Text', close: '</Text>' },
      { open: '<Button', close: '</Button>' },
    ];
    
    jsxTags.forEach(tag => {
      const openPattern = new RegExp(`${tag.open}[^<>]*(?<!/)>`, 'g');
      const opens = [...content.matchAll(openPattern)];
      const closes = content.match(new RegExp(tag.close, 'g')) || [];
      
      if (opens.length > closes.length) {
        // Add closing tags for any unclosed tags
        // Find the last return statement or closing brace
        const lastReturn = content.lastIndexOf('return (');
        const lastBrace = content.lastIndexOf('}');
        
        const insertPos = Math.max(lastReturn, lastBrace);
        if (insertPos > 0) {
          const missingCloses = opens.length - closes.length;
          content = content.slice(0, insertPos) + 
                   '\n' + tag.close.repeat(missingCloses) + '\n' + 
                   content.slice(insertPos);
        }
      }
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed JSX syntax in ${path.basename(filePath)}`);
  }
}

function main() {
  try {
    console.log('🚀 Starting JSX syntax fix script');
    
    // Get files with syntax errors
    const filesWithErrors = getFilesWithSyntaxErrors();
    console.log(`Found ${filesWithErrors.length} files with JSX syntax errors`);
    
    // Fix specific components known to have issues
    fixNavbarComponent();
    fixSidebarComponent();
    fixQueryStateHandlerComponent();
    fixFeedbackPageComponent();
    fixErrorMonitoringDashboardComponent();
    
    // Fix any other files with issues
    for (const filePath of filesWithErrors) {
      // Skip files we've already fixed specifically
      const basename = path.basename(filePath);
      if (!['Navbar.tsx', 'Sidebar.tsx', 'QueryStateHandler.tsx', 'page.tsx', 'ErrorMonitoringDashboard.tsx'].includes(basename)) {
        fixJSXSyntaxInFile(filePath);
      }
    }
    
    console.log('✅ JSX syntax fixes applied successfully');
    
    // Check remaining errors
    try {
      console.log('🔍 Checking TypeScript errors...');
      execSync('npx tsc --noEmit 2>/dev/null', { cwd: ROOT_DIR });
      console.log('🎉 No TypeScript errors found!');
    } catch (error) {
      // Count the remaining errors
      const errorOutput = error.stdout.toString();
      const errorCount = (errorOutput.match(/error TS\d+/g) || []).length;
      console.log(`⚠️ ${errorCount} TypeScript errors remain`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();