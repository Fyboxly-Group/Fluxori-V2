#!/usr/bin/env node

/**
 * This script analyzes the codebase for Chakra UI component usage
 * and automatically updates the src/types/chakra-ui.d.ts file with
 * any missing type declarations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SCAN_DIR = path.resolve(__dirname, '../src');
const TYPES_FILE = path.resolve(__dirname, '../src/types/chakra-ui.d.ts');

// Components to map and their import paths
const COMPONENT_MAP = {
  // Layout
  Box: '@chakra-ui/react/box',
  Container: '@chakra-ui/react/container',
  Flex: '@chakra-ui/react/flex',
  Grid: '@chakra-ui/react/grid',
  GridItem: '@chakra-ui/react/grid',
  SimpleGrid: '@chakra-ui/react/simple-grid',
  Stack: '@chakra-ui/react/stack',
  HStack: '@chakra-ui/react/stack',
  VStack: '@chakra-ui/react/stack',
  Center: '@chakra-ui/react/center',
  
  // Typography
  Text: '@chakra-ui/react/text',
  Heading: '@chakra-ui/react/heading',
  
  // Forms
  Button: '@chakra-ui/react/button',
  IconButton: '@chakra-ui/react/button',
  ButtonGroup: '@chakra-ui/react/button-group',
  Checkbox: '@chakra-ui/react/checkbox',
  FormControl: '@chakra-ui/react/form-control',
  FormLabel: '@chakra-ui/react/form-control',
  FormErrorMessage: '@chakra-ui/react/form-control',
  FormHelperText: '@chakra-ui/react/form-control',
  Input: '@chakra-ui/react/input',
  Select: '@chakra-ui/react/select',
  Radio: '@chakra-ui/react/radio',
  RadioGroup: '@chakra-ui/react/radio',
  Switch: '@chakra-ui/react/switch',
  Textarea: '@chakra-ui/react/textarea',
  
  // Data Display
  Badge: '@chakra-ui/react/badge',
  Card: '@chakra-ui/react/card',
  CardHeader: '@chakra-ui/react/card',
  CardBody: '@chakra-ui/react/card',
  CardFooter: '@chakra-ui/react/card',
  Divider: '@chakra-ui/react/divider',
  List: '@chakra-ui/react/list',
  ListItem: '@chakra-ui/react/list',
  Stat: '@chakra-ui/react/stat',
  Table: '@chakra-ui/react/table',
  
  // Navigation
  Breadcrumb: '@chakra-ui/react/breadcrumb',
  BreadcrumbItem: '@chakra-ui/react/breadcrumb',
  BreadcrumbLink: '@chakra-ui/react/breadcrumb',
  Link: '@chakra-ui/react/link',
  Menu: '@chakra-ui/react/menu',
  
  // Feedback
  Alert: '@chakra-ui/react/alert',
  AlertIcon: '@chakra-ui/react/alert',
  AlertTitle: '@chakra-ui/react/alert',
  AlertDescription: '@chakra-ui/react/alert',
  Spinner: '@chakra-ui/react/spinner',
  
  // Overlay
  Modal: '@chakra-ui/react/modal',
  ModalOverlay: '@chakra-ui/react/modal',
  ModalContent: '@chakra-ui/react/modal',
  ModalHeader: '@chakra-ui/react/modal',
  ModalCloseButton: '@chakra-ui/react/modal',
  ModalBody: '@chakra-ui/react/modal',
  ModalFooter: '@chakra-ui/react/modal',
  Popover: '@chakra-ui/react/popover',
  PopoverTrigger: '@chakra-ui/react/popover',
  PopoverContent: '@chakra-ui/react/popover',
  PopoverHeader: '@chakra-ui/react/popover',
  PopoverBody: '@chakra-ui/react/popover',
  PopoverFooter: '@chakra-ui/react/popover',
  PopoverArrow: '@chakra-ui/react/popover',
  PopoverCloseButton: '@chakra-ui/react/popover',
  Tooltip: '@chakra-ui/react/tooltip',
  
  // Misc
  CloseButton: '@chakra-ui/react/close-button',
  Icon: '@chakra-ui/react/icon',
  Image: '@chakra-ui/react/image',
  Avatar: '@chakra-ui/react/avatar',
  
  // Tabs
  Tabs: '@chakra-ui/react/tabs',
  TabList: '@chakra-ui/react/tabs',
  Tab: '@chakra-ui/react/tabs',
  TabPanels: '@chakra-ui/react/tabs',
  TabPanel: '@chakra-ui/react/tabs',
};

// Find all TypeScript and TSX files in the project
const findTsFiles = () => {
  try {
    const result = execSync(`find ${SCAN_DIR} -type f -name "*.ts*" | grep -v ".d.ts" | grep -v "node_modules"`).toString().trim();
    return result.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding TS files:', error);
    return [];
  }
};

// Find Chakra UI components used in a file
const findChakraComponents = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const usedComponents = new Set();
  
  // Look for import statements
  const importRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]@chakra-ui\/react['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(part => part.trim());
    for (const importName of imports) {
      if (COMPONENT_MAP[importName]) {
        usedComponents.add(importName);
      }
    }
  }
  
  // Look for JSX components
  for (const component of Object.keys(COMPONENT_MAP)) {
    const componentRegex = new RegExp(`<${component}[\\s/>]`, 'g');
    if (componentRegex.test(content)) {
      usedComponents.add(component);
    }
  }
  
  return [...usedComponents];
};

// Generate type declaration for a component
const generateTypeDeclaration = (component) => {
  const importPath = COMPONENT_MAP[component];
  
  // Skip if not in map
  if (!importPath) return '';
  
  // Generate declaration based on component type
  switch (component) {
    case 'Box':
      return `
declare module '${importPath}' {
  export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: React.ElementType
    [key: string]: any
  }
  export const Box: React.FC<BoxProps>
}`;
    
    case 'Button':
      return `
declare module '${importPath}' {
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: string
    colorScheme?: string
    size?: string
    loading?: boolean  // Changed from isLoading
    disabled?: boolean // Changed from isDisabled
    leftIcon?: React.ReactElement
    rightIcon?: React.ReactElement
    [key: string]: any
  }
  export const Button: React.FC<ButtonProps>
  
  export interface IconButtonProps extends ButtonProps {
    icon?: React.ReactElement
    'aria-label': string
    [key: string]: any
  }
  export const IconButton: React.FC<IconButtonProps>
}`;
    
    // Add more specialized cases here
    
    // Default case for simpler components
    default:
      return `
declare module '${importPath}' {
  export interface ${component}Props {
    [key: string]: any
  }
  export const ${component}: React.FC<${component}Props>
}`;
  }
};

// Check if declaration already exists in types file
const declarationExists = (typesContent, modulePath) => {
  return typesContent.includes(`declare module '${modulePath}'`);
};

// Main function
const main = async () => {
  console.log('Scanning for Chakra UI component usage...');
  
  // Find all TS/TSX files
  const tsFiles = findTsFiles();
  console.log(`Found ${tsFiles.length} TypeScript files to scan`);
  
  // Track all used components
  const usedComponents = new Set();
  
  // Scan each file for Chakra components
  for (const file of tsFiles) {
    const components = findChakraComponents(file);
    components.forEach(component => usedComponents.add(component));
  }
  
  console.log(`Found ${usedComponents.size} Chakra UI components in use`);
  
  // Read existing types file
  let typesContent = '';
  try {
    typesContent = fs.readFileSync(TYPES_FILE, 'utf8');
  } catch (error) {
    console.log('Types file not found, creating a new one');
    typesContent = '// Type declarations for Chakra UI v3 components and modules\n\n';
  }
  
  // Generate declarations for missing components
  let updatedContent = typesContent;
  let addedCount = 0;
  
  for (const component of usedComponents) {
    const modulePath = COMPONENT_MAP[component];
    if (modulePath && !declarationExists(typesContent, modulePath)) {
      const declaration = generateTypeDeclaration(component);
      updatedContent += declaration;
      addedCount++;
    }
  }
  
  // Only update file if changes were made
  if (addedCount > 0) {
    fs.writeFileSync(TYPES_FILE, updatedContent);
    console.log(`Added ${addedCount} new type declarations to ${TYPES_FILE}`);
  } else {
    console.log('No new type declarations needed');
  }
};

// Run the script
main().catch(console.error);