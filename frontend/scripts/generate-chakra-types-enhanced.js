#!/usr/bin/env node

/**
 * Enhanced Chakra UI v3 Type Generation Script
 * 
 * This script performs a deep analysis of the codebase to:
 * 1. Identify all Chakra UI components in use
 * 2. Analyze prop usage patterns and types
 * 3. Generate comprehensive type declarations
 * 4. Update type files without overwriting custom modifications
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const util = require('util');
const glob = util.promisify(require('glob'));

// Configuration
const SCAN_DIR = path.resolve(__dirname, '../src');
const TYPES_DIR = path.resolve(__dirname, '../src/types');
const TYPES_FILE = path.resolve(TYPES_DIR, 'chakra-ui.d.ts');
const MODULES_FILE = path.resolve(TYPES_DIR, 'chakra-ui-modules.d.ts');

// Debug and logging
const DEBUG = process.argv.includes('--verbose');
const verbose = (...args) => DEBUG && console.log(...args);

// Command line options
const ARGS = {
  force: process.argv.includes('--force'),
  components: process.argv.find(arg => arg.startsWith('--components='))?.split('=')[1]?.split(',') || [],
  scan: process.argv.find(arg => arg.startsWith('--scan='))?.split('=')[1]?.split(',') || [SCAN_DIR],
};

// Major component groups and their import paths
const COMPONENT_GROUPS = {
  LAYOUT: {
    components: ['Box', 'Container', 'Flex', 'Grid', 'GridItem', 'SimpleGrid', 'Stack', 'HStack', 'VStack', 'Center', 'Spacer'],
    importMap: {
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
      Spacer: '@chakra-ui/react/spacer',
    }
  },
  
  TYPOGRAPHY: {
    components: ['Text', 'Heading'],
    importMap: {
      Text: '@chakra-ui/react/text',
      Heading: '@chakra-ui/react/heading',
    }
  },
  
  FORMS: {
    components: ['Button', 'IconButton', 'ButtonGroup', 'Checkbox', 'FormControl', 'FormLabel', 'FormErrorMessage', 'FormHelperText', 'Input', 'InputGroup', 'InputElement', 'InputLeftElement', 'InputRightElement', 'Select', 'Radio', 'RadioGroup', 'Switch', 'Textarea'],
    importMap: {
      Button: '@chakra-ui/react/button',
      IconButton: '@chakra-ui/react/button',
      ButtonGroup: '@chakra-ui/react/button-group',
      Checkbox: '@chakra-ui/react/checkbox',
      FormControl: '@chakra-ui/react/form-control',
      FormLabel: '@chakra-ui/react/form-control',
      FormErrorMessage: '@chakra-ui/react/form-control',
      FormHelperText: '@chakra-ui/react/form-control',
      Input: '@chakra-ui/react/input',
      InputGroup: '@chakra-ui/react/input-group',
      InputElement: '@chakra-ui/react/input-group',
      InputLeftElement: '@chakra-ui/react/input-group',
      InputRightElement: '@chakra-ui/react/input-group',
      Select: '@chakra-ui/react/select',
      Radio: '@chakra-ui/react/radio',
      RadioGroup: '@chakra-ui/react/radio',
      Switch: '@chakra-ui/react/switch',
      Textarea: '@chakra-ui/react/textarea',
    }
  },
  
  DATA_DISPLAY: {
    components: ['Badge', 'Card', 'CardHeader', 'CardBody', 'CardFooter', 'Divider', 'List', 'ListItem', 'Stat', 'Table', 'Thead', 'Tbody', 'Tr', 'Th', 'Td', 'TableContainer'],
    importMap: {
      Badge: '@chakra-ui/react/badge',
      Card: '@chakra-ui/react/card',
      CardHeader: '@chakra-ui/react/card',
      CardBody: '@chakra-ui/react/card',
      CardFooter: '@chakra-ui/react/card',
      Divider: '@chakra-ui/react/divider',
      List: '@chakra-ui/react/list',
      ListItem: '@chakra-ui/react/list',
      Stat: '@chakra-ui/react/stat',
      Table: '@chakra-ui/react/table-container',
      Thead: '@chakra-ui/react/table-container',
      Tbody: '@chakra-ui/react/table-container',
      Tr: '@chakra-ui/react/table-container',
      Th: '@chakra-ui/react/table-container',
      Td: '@chakra-ui/react/table-container',
      TableContainer: '@chakra-ui/react/table-container',
    }
  },
  
  NAVIGATION: {
    components: ['Breadcrumb', 'BreadcrumbItem', 'BreadcrumbLink', 'Link', 'Menu', 'MenuButton', 'MenuList', 'MenuItem', 'MenuDivider'],
    importMap: {
      Breadcrumb: '@chakra-ui/react/breadcrumb',
      BreadcrumbItem: '@chakra-ui/react/breadcrumb',
      BreadcrumbLink: '@chakra-ui/react/breadcrumb',
      Link: '@chakra-ui/react/link',
      Menu: '@chakra-ui/react/menu-group',
      MenuButton: '@chakra-ui/react/menu-group',
      MenuList: '@chakra-ui/react/menu-group',
      MenuItem: '@chakra-ui/react/menu-group',
      MenuDivider: '@chakra-ui/react/menu-group',
    }
  },
  
  FEEDBACK: {
    components: ['Alert', 'AlertIcon', 'AlertTitle', 'AlertDescription', 'Spinner', 'Progress'],
    importMap: {
      Alert: '@chakra-ui/react/alert',
      AlertIcon: '@chakra-ui/react/alert',
      AlertTitle: '@chakra-ui/react/alert',
      AlertDescription: '@chakra-ui/react/alert',
      Spinner: '@chakra-ui/react/spinner',
      Progress: '@chakra-ui/react/progress-indicator',
    }
  },
  
  OVERLAY: {
    components: ['Modal', 'ModalOverlay', 'ModalContent', 'ModalHeader', 'ModalCloseButton', 'ModalBody', 'ModalFooter', 'Popover', 'PopoverTrigger', 'PopoverContent', 'PopoverHeader', 'PopoverBody', 'PopoverFooter', 'PopoverArrow', 'PopoverCloseButton', 'Tooltip'],
    importMap: {
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
    }
  },
  
  MISC: {
    components: ['CloseButton', 'Icon', 'Image', 'Avatar', 'ChakraProvider'],
    importMap: {
      CloseButton: '@chakra-ui/react/close-button',
      Icon: '@chakra-ui/react/icon',
      Image: '@chakra-ui/react/image',
      Avatar: '@chakra-ui/react/avatar',
      ChakraProvider: '@chakra-ui/react/provider',
    }
  },
  
  TABS: {
    components: ['Tabs', 'TabList', 'Tab', 'TabPanels', 'TabPanel'],
    importMap: {
      Tabs: '@chakra-ui/react/tabs',
      TabList: '@chakra-ui/react/tabs',
      Tab: '@chakra-ui/react/tabs',
      TabPanels: '@chakra-ui/react/tabs',
      TabPanel: '@chakra-ui/react/tabs',
    }
  },
  
  HOOKS: {
    components: ['useToast', 'useDisclosure', 'useColorMode', 'useBreakpointValue'],
    importMap: {
      useToast: '@chakra-ui/react/hooks',
      useDisclosure: '@chakra-ui/react/hooks',
      useColorMode: '@chakra-ui/react/color-mode',
      useBreakpointValue: '@chakra-ui/react/hooks',
    }
  },
};

// Flatten component maps for easier access
const COMPONENT_MAP = Object.values(COMPONENT_GROUPS).reduce((acc, group) => {
  return { ...acc, ...group.importMap };
}, {});

// Common props for all components
const COMMON_PROPS = {
  STYLE_PROPS: [
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
    'color', 'backgroundColor', 'bg', 'opacity', 'shadow', 'boxShadow',
    'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    'display', 'position', 'top', 'right', 'bottom', 'left',
    'flexDirection', 'alignItems', 'justifyContent', 'gap',
    'borderRadius', 'fontWeight', 'fontSize', 'textAlign',
  ],
  
  SHORTHAND_PROPS: {
    'm': 'margin', 'mt': 'marginTop', 'mr': 'marginRight', 'mb': 'marginBottom', 'ml': 'marginLeft',
    'p': 'padding', 'pt': 'paddingTop', 'pr': 'paddingRight', 'pb': 'paddingBottom', 'pl': 'paddingLeft',
    'w': 'width', 'h': 'height', 'minW': 'minWidth', 'minH': 'minHeight', 'maxW': 'maxWidth', 'maxH': 'maxHeight',
  }
};

// Component specific prop mappings (v2 to v3)
const PROP_UPDATES = {
  'isLoading': 'loading',
  'isDisabled': 'disabled',
  'isActive': 'active',
  'isChecked': 'checked',
  'isInvalid': 'invalid',
  'isReadOnly': 'readOnly',
  'isOpen': 'open',
  'isFocused': 'focused',
};

// Cache for file contents to avoid repeated reads
const fileCache = new Map();

/**
 * Finds all TypeScript and TSX files in the given directories
 */
async function findTsFiles(directories) {
  let allFiles = [];
  for (const dir of directories) {
    const files = await glob(`${dir}/**/*.{ts,tsx}`, { ignore: ['**/node_modules/**', '**/*.d.ts'] });
    allFiles = [...allFiles, ...files];
  }
  return allFiles;
}

/**
 * Extracts Chakra UI component imports and JSX usage from a file
 */
async function analyzeFile(filePath) {
  let content;
  
  // Use cached content if available
  if (fileCache.has(filePath)) {
    content = fileCache.get(filePath);
  } else {
    content = await fs.readFile(filePath, 'utf8');
    fileCache.set(filePath, content);
  }
  
  const usedComponents = new Set();
  const propUsages = new Map(); // Maps components to their observed props
  
  // Analyze direct @chakra-ui/react imports
  const barrelImportRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]@chakra-ui\/react['"]/g;
  let match;
  
  while ((match = barrelImportRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(part => part.trim());
    for (const importName of imports) {
      if (COMPONENT_MAP[importName]) {
        usedComponents.add(importName);
      }
    }
  }
  
  // Analyze direct module imports
  const directImportRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]@chakra-ui\/react\/([^'"]+)['"]/g;
  while ((match = directImportRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(part => part.trim());
    imports.forEach(importName => usedComponents.add(importName));
  }
  
  // Analyze JSX component usage and props
  for (const component of Object.keys(COMPONENT_MAP)) {
    // Find JSX opening tags like <Component ...> or <Component/>
    const componentRegex = new RegExp(`<${component}(\\s+[^>]*?)(/?)>`, 'g');
    
    while ((match = componentRegex.exec(content)) !== null) {
      usedComponents.add(component);
      
      // Extract props from the component usage
      const propsText = match[1];
      if (propsText && propsText.trim()) {
        if (!propUsages.has(component)) {
          propUsages.set(component, new Set());
        }
        
        // Extract prop names
        const propMatches = propsText.matchAll(/(\w+)(?:=|\s|$)/g);
        for (const propMatch of propMatches) {
          const propName = propMatch[1];
          if (propName && !propName.startsWith('_') && propName !== 'as') {
            propUsages.get(component).add(propName);
          }
        }
      }
    }
  }
  
  return { 
    usedComponents: [...usedComponents], 
    propUsages: Object.fromEntries([...propUsages.entries()].map(([k, v]) => [k, [...v]]))
  };
}

/**
 * Generate comprehensive type declarations for a component
 */
function generateTypeDeclaration(component, observedProps = []) {
  const importPath = COMPONENT_MAP[component];
  
  // Skip if not in component map
  if (!importPath) {
    verbose(`Skipping ${component} - not in component map`);
    return '';
  }
  
  // Start building the declaration
  let declaration = `\ndeclare module '${importPath}' {\n`;
  declaration += `  import * as React from 'react';\n`;
  
  // Common imports
  if (component !== 'Box' && component !== 'Text' && component !== 'ChakraProvider') {
    declaration += `  import { BoxProps } from '@chakra-ui/react/box';\n`;
  }
  
  // Generate specialized declarations based on component type
  switch (component) {
    case 'Box':
      declaration += `
  export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: React.ElementType;
    [key: string]: any;
  }
  export const Box: React.FC<BoxProps>;`;
      break;
      
    case 'Button':
      declaration += `
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: string;
    colorScheme?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    loading?: boolean;  // Changed from isLoading
    disabled?: boolean; // Changed from isDisabled
    leftIcon?: React.ReactElement;
    rightIcon?: React.ReactElement;
    [key: string]: any;
  }
  export const Button: React.FC<ButtonProps>;
  
  export interface IconButtonProps extends ButtonProps {
    icon?: React.ReactElement;
    'aria-label': string;
    [key: string]: any;
  }
  export const IconButton: React.FC<IconButtonProps>;`;
      break;
      
    case 'Input':
      declaration += `
  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    invalid?: boolean; // Changed from isInvalid
    readOnly?: boolean; // Changed from isReadOnly
    [key: string]: any;
  }
  export const Input: React.FC<InputProps>;`;
      break;
      
    case 'FormControl':
      declaration += `
  export interface FormControlProps extends BoxProps {
    invalid?: boolean; // Changed from isInvalid
    disabled?: boolean; // Changed from isDisabled
    required?: boolean; // Changed from isRequired
    [key: string]: any;
  }
  export const FormControl: React.FC<FormControlProps>;
  
  export interface FormLabelProps extends BoxProps {
    [key: string]: any;
  }
  export const FormLabel: React.FC<FormLabelProps>;
  
  export interface FormErrorMessageProps extends BoxProps {
    [key: string]: any;
  }
  export const FormErrorMessage: React.FC<FormErrorMessageProps>;
  
  export interface FormHelperTextProps extends BoxProps {
    [key: string]: any;
  }
  export const FormHelperText: React.FC<FormHelperTextProps>;`;
      break;

    case 'ChakraProvider':
      declaration += `
  export interface SystemContext {
    $$chakra: boolean;
    _config: any[];
    _global: any[];
    utility: {
      keys: any[];
      shorthands: Record<string, any>;
      hasShorthand: (prop: string) => boolean;
      resolveShorthand: (prop: string) => any;
      [key: string]: any;
    };
    [key: string]: any;
  }
  
  export interface ChakraTheme {
    colors: Record<string, any>;
    fonts: Record<string, string>;
    fontSizes: Record<string, string>;
    fontWeights: Record<string, number>;
    lineHeights: Record<string, string | number>;
    letterSpacings: Record<string, string>;
    breakpoints: Record<string, string>;
    sizes: Record<string, string | number>;
    shadows: Record<string, string>;
    space: Record<string, string | number>;
    borders: Record<string, string>;
    radii: Record<string, string | number>;
    zIndices: Record<string, number>;
    components: Record<string, any>;
  }
  
  export interface ChakraProviderProps {
    theme: ChakraTheme;
    children: React.ReactNode;
    value?: SystemContext | {};
  }
  
  export const ChakraProvider: React.FC<ChakraProviderProps>;`;
      break;
    
    // For hooks, use a different pattern
    case 'useToast':
      declaration += `
  export interface UseToastOptions {
    title?: string;
    description?: string;
    status?: 'info' | 'warning' | 'success' | 'error';
    duration?: number;
    isClosable?: boolean;
    position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left';
    onClose?: () => void;
  }
  
  export const useToast: () => ((options: UseToastOptions) => string) & {
    close: (id: string) => void;
    closeAll: () => void;
    update: (id: string, options: UseToastOptions) => void;
    isActive: (id: string) => boolean;
  };`;
      break;
      
    case 'useDisclosure':
      declaration += `
  export interface UseDisclosureReturn {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onToggle: () => void;
  }
  
  export const useDisclosure: (options?: { defaultIsOpen?: boolean }) => UseDisclosureReturn;`;
      break;
      
    case 'useColorMode':
      declaration += `
  export interface ColorModeContextType {
    colorMode: 'light' | 'dark';
    toggleColorMode: () => void;
    setColorMode: (mode: 'light' | 'dark') => void;
  }
  
  export const useColorMode: () => ColorModeContextType;`;
      break;
      
    // Default case for other components
    default:
      // Start with the component's props interface
      declaration += `\n  export interface ${component}Props extends BoxProps {\n`;
      
      // Add observed props if any
      if (observedProps && observedProps.length > 0) {
        observedProps.forEach(prop => {
          // Update prop names based on v2 -> v3 changes
          const finalProp = PROP_UPDATES[prop] || prop;
          declaration += `    ${finalProp}?: any;\n`;
        });
      }
      
      declaration += `    [key: string]: any;\n  }\n`;
      declaration += `  export const ${component}: React.FC<${component}Props>;\n`;
  }
  
  declaration += `\n}`;
  return declaration;
}

/**
 * Check if declaration already exists in types file
 */
function declarationExists(typesContent, modulePath) {
  return typesContent.includes(`declare module '${modulePath}'`);
}

/**
 * Main function
 */
async function main() {
  console.log('✨ Enhanced Chakra UI v3 Type Generation ✨');
  
  // Create types directory if it doesn't exist
  try {
    await fs.mkdir(TYPES_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
  
  // Find TypeScript files to scan
  const scanDirs = ARGS.scan;
  console.log(`Scanning directories: ${scanDirs.join(', ')}`);
  const tsFiles = await findTsFiles(scanDirs);
  console.log(`Found ${tsFiles.length} TypeScript files to scan`);
  
  // Filter for specified components if provided
  const targetComponents = ARGS.components.length > 0 
    ? ARGS.components
    : Object.keys(COMPONENT_MAP);
  
  if (ARGS.components.length > 0) {
    console.log(`Targeting specific components: ${targetComponents.join(', ')}`);
  }
  
  // Track components and their prop usages
  const usedComponents = new Set();
  const allPropUsages = new Map();
  
  // Process files in batches to prevent memory issues
  const BATCH_SIZE = 50;
  for (let i = 0; i < tsFiles.length; i += BATCH_SIZE) {
    const batch = tsFiles.slice(i, i + BATCH_SIZE);
    const analysisPromises = batch.map(analyzeFile);
    const results = await Promise.all(analysisPromises);
    
    for (const { usedComponents: components, propUsages } of results) {
      components.forEach(component => usedComponents.add(component));
      
      // Merge prop usages
      Object.entries(propUsages).forEach(([component, props]) => {
        if (!allPropUsages.has(component)) {
          allPropUsages.set(component, new Set());
        }
        props.forEach(prop => allPropUsages.get(component).add(prop));
      });
    }
    
    console.log(`Processed ${Math.min(i + BATCH_SIZE, tsFiles.length)}/${tsFiles.length} files...`);
  }
  
  console.log(`Found ${usedComponents.size} Chakra UI components in use`);
  
  // Read existing types files
  let typesContent = '';
  let modulesContent = '';
  
  try {
    typesContent = await fs.readFile(TYPES_FILE, 'utf8');
  } catch (error) {
    console.log('Main types file not found, creating a new one');
    typesContent = '// Type declarations for Chakra UI v3 components\n\n';
  }
  
  try {
    modulesContent = await fs.readFile(MODULES_FILE, 'utf8');
  } catch (error) {
    console.log('Modules types file not found, creating a new one');
    modulesContent = '// Type declarations for Chakra UI v3 modules\n\n';
  }
  
  // Filter to components we want to process
  const componentsToProcess = [...usedComponents].filter(comp => 
    targetComponents.includes(comp) || ARGS.force
  ).sort();
  
  if (componentsToProcess.length === 0) {
    console.log('No components to process. Exiting...');
    return;
  }
  
  // Generate declarations for components
  let updatedContent = typesContent;
  let updatedModulesContent = modulesContent;
  let addedCount = 0;
  
  for (const component of componentsToProcess) {
    const modulePath = COMPONENT_MAP[component];
    
    if (!modulePath) {
      console.warn(`⚠️ No module path found for component: ${component}`);
      continue;
    }
    
    // Skip if already declared (unless --force is used)
    if (!ARGS.force && (
        declarationExists(typesContent, modulePath) || 
        declarationExists(modulesContent, modulePath))) {
      verbose(`Skipping ${component} - already declared`);
      continue;
    }
    
    const observedProps = allPropUsages.get(component) ? [...allPropUsages.get(component)] : [];
    const declaration = generateTypeDeclaration(component, observedProps);
    
    if (declaration) {
      // Add to module declarations file
      updatedModulesContent += declaration;
      addedCount++;
      console.log(`Generated declaration for ${component}`);
    }
  }
  
  // Only update file if changes were made
  if (addedCount > 0) {
    await fs.writeFile(MODULES_FILE, updatedModulesContent);
    console.log(`✅ Added ${addedCount} new type declarations to ${MODULES_FILE}`);
  } else {
    console.log('ℹ️ No new type declarations needed');
  }
}

// Run the script
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});