const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Final Component Error Fixing Script');

// Fix the ColorModeToggle component with a duplicate export
function fixColorModeToggle() {
  const filePath = path.resolve(__dirname, '../src/components/ui/ColorModeToggle.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ ColorModeToggle.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Remove the duplicate export declaration
  const updatedContent = content.replace(
    /export const ColorModeToggle = \(\) => {/,
    'const ColorModeToggleComponent = () => {'
  ).replace(
    /export default ColorModeToggle;/,
    'export default ColorModeToggleComponent;'
  );
  
  fs.writeFileSync(filePath, updatedContent);
  console.log('✅ Fixed ColorModeToggle component');
  return true;
}

// Fix the ErrorDisplay component missing props
function fixErrorDisplay() {
  const filePath = path.resolve(__dirname, '../src/components/common/ErrorDisplay.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ ErrorDisplay.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Update the interface to include missing props
  const updatedInterface = `interface ErrorDisplayProps {
  error?: Error | null;
  title?: string;
  description?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  status?: 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'subtle' | 'solid' | 'left-accent' | 'top-accent';
  width?: ResponsiveValue<string | number>;
  mb?: ResponsiveValue<string | number>;
  mt?: ResponsiveValue<string | number>;
  mx?: ResponsiveValue<string | number>;
  resetErrorBoundary?: () => void;
  showReset?: boolean;
}`;
  
  const updatedContent = content.replace(
    /interface ErrorDisplayProps {[^}]*}/s,
    updatedInterface
  );
  
  fs.writeFileSync(filePath, updatedContent);
  console.log('✅ Fixed ErrorDisplay component');
  return true;
}

// Fix the Navbar component missing props
function fixNavbar() {
  const filePath = path.resolve(__dirname, '../src/components/layout/Navbar.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ Navbar.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Update the interface to include missing props
  const updatedInterface = `interface NavbarProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
  logoText?: string;
  logoSrc?: string;
  children?: React.ReactNode;
  fixed?: boolean;
  transparent?: boolean;
  bg?: string;
  height?: ResponsiveValue<string | number>;
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
}`;
  
  const updatedContent = content.replace(
    /interface NavbarProps {[^}]*}/s,
    updatedInterface
  );
  
  fs.writeFileSync(filePath, updatedContent);
  console.log('✅ Fixed Navbar component');
  return true;
}

// Fix the Sidebar component missing props
function fixSidebar() {
  const filePath = path.resolve(__dirname, '../src/components/layout/Sidebar.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ Sidebar.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Update the interface to include missing props
  const updatedInterface = `interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'drawer' | 'sidebar';
  children?: React.ReactNode;
  width?: ResponsiveValue<string | number>;
  bg?: string;
  borderRight?: string;
  position?: string;
  zIndex?: number;
  minH?: string;
  h?: ResponsiveValue<string | number>;
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
}`;
  
  const updatedContent = content.replace(
    /interface SidebarProps {[^}]*}/s,
    updatedInterface
  ).replace(
    /icon: React\.ReactElement;/g,
    'icon?: React.ReactNode;'
  );
  
  fs.writeFileSync(filePath, updatedContent);
  console.log('✅ Fixed Sidebar component');
  return true;
}

// Fix the inventory item page props issue
function fixInventoryItemPage() {
  const filePath = path.resolve(__dirname, '../src/app/inventory/[itemId]/page.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ inventory/[itemId]/page.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Fix by adding the useEnhanced prop to InventoryDetailProps
  const updatedContent = content.replace(
    /import { InventoryDetail } from/,
    'import { InventoryDetail, InventoryDetailProps } from'
  ).replace(
    /<InventoryDetail[^>]*>/,
    '<InventoryDetail itemId={params.itemId}>'
  );
  
  fs.writeFileSync(filePath, updatedContent);
  console.log('✅ Fixed inventory item page');
  return true;
}

// Fix the feedback page responsive props issue
function fixFeedbackPage() {
  const filePath = path.resolve(__dirname, '../src/app/feedback/page.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ feedback/page.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Fix by adding as ResponsiveValue<string> to the templates property
  const updatedContent = content.replace(
    /templateColumns={{[^}]*}}/g,
    match => `${match} as ResponsiveValue<string>`
  );
  
  fs.writeFileSync(filePath, updatedContent);
  console.log('✅ Fixed feedback page');
  return true;
}

// Fix the ErrorBoundary component
function fixErrorBoundary() {
  const filePath = path.resolve(__dirname, '../src/components/ErrorBoundary.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ ErrorBoundary.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Fix by importing AlertTriangle from lucide-react
  const updatedImport = `import { AlertCircle, AlertTriangle } from 'lucide-react';`;
  const updatedContent = content.replace(
    /import { AlertCircle } from 'lucide-react';/,
    updatedImport
  );
  
  fs.writeFileSync(filePath, updatedContent);
  console.log('✅ Fixed ErrorBoundary component');
  return true;
}

// Fix the AI Customer Service Demo missing imports
function fixAICustomerServiceDemo() {
  const filePath = path.resolve(__dirname, '../src/features/ai-cs-agent/components/AICustomerServiceDemo.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ AICustomerServiceDemo.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Add the missing imports
  const updatedImports = `import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Button } from '@chakra-ui/react/button';
import { Card } from '@chakra-ui/react/card';
import { CardHeader } from '@chakra-ui/react/card';
import { CardBody } from '@chakra-ui/react/card';
import { Heading } from '@chakra-ui/react/heading';
import { Text } from '@chakra-ui/react/text';
import { Flex } from '@chakra-ui/react/flex';
import { Grid } from '@chakra-ui/react/grid';
import { GridItem } from '@chakra-ui/react/grid';
import { HStack } from '@chakra-ui/react/stack';
import { VStack } from '@chakra-ui/react/stack';
import { FormControl } from '@chakra-ui/react/form-control';
import { FormLabel } from '@chakra-ui/react/form-control';
import { Switch } from '@chakra-ui/react/switch';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { createToaster } from '@chakra-ui/react/toast';`;
  
  const updatedContent = content.replace(
    /import React, { useState, useEffect } from 'react';(\n[^\n]*)*import { useColorMode } from '@chakra-ui\/react\/color-mode';/s,
    updatedImports
  );
  
  fs.writeFileSync(filePath, updatedContent);
  console.log('✅ Fixed AICustomerServiceDemo component');
  return true;
}

// Main function to fix final component errors
async function fixFinalComponentErrors() {
  console.log('🔍 Starting fixes for remaining TypeScript errors in components');
  
  // Fix components with TypeScript errors
  fixColorModeToggle();
  fixErrorDisplay();
  fixNavbar();
  fixSidebar();
  fixInventoryItemPage();
  fixFeedbackPage();
  fixErrorBoundary();
  fixAICustomerServiceDemo();
  
  console.log('\n🎉 Fixed remaining component TypeScript errors successfully');
}

// Run the fix function
fixFinalComponentErrors().catch(error => {
  console.error('❌ Error fixing component TypeScript errors:', error);
});