#!/usr/bin/env node

/**
 * Comprehensive script to fix Chakra UI v3 compatibility issues:
 * 1. Converts barrel imports to direct module imports
 * 2. Fixes prop names to match Chakra UI v3 naming conventions
 * 3. Reports the number of errors fixed in each category
 * 
 * Usage:
 *   node scripts/fix-chakra-ui-v3-patterns.js [target]
 *   
 * If no target is specified, the script will process the entire src directory.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

// Component mappings - maps each Chakra UI component to its proper module path
const COMPONENT_MAP = {
  // Layout
  Box: '@chakra-ui/react/box',
  Container: '@chakra-ui/react/layout',
  Flex: '@chakra-ui/react/flex',
  Grid: '@chakra-ui/react/layout',
  GridItem: '@chakra-ui/react/layout',
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
  ButtonGroup: '@chakra-ui/react/button',
  Checkbox: '@chakra-ui/react/checkbox',
  FormControl: '@chakra-ui/react/form-control',
  FormLabel: '@chakra-ui/react/form-control',
  FormErrorMessage: '@chakra-ui/react/form-control',
  FormHelperText: '@chakra-ui/react/form-control',
  Input: '@chakra-ui/react/input',
  InputGroup: '@chakra-ui/react/input',
  InputLeftElement: '@chakra-ui/react/input',
  InputRightElement: '@chakra-ui/react/input',
  InputLeftAddon: '@chakra-ui/react/input',
  InputRightAddon: '@chakra-ui/react/input',
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
  ListIcon: '@chakra-ui/react/list',
  OrderedList: '@chakra-ui/react/list',
  UnorderedList: '@chakra-ui/react/list',
  Stat: '@chakra-ui/react/stat',
  StatLabel: '@chakra-ui/react/stat',
  StatNumber: '@chakra-ui/react/stat',
  StatHelpText: '@chakra-ui/react/stat',
  StatArrow: '@chakra-ui/react/stat',
  StatGroup: '@chakra-ui/react/stat',
  Table: '@chakra-ui/react/table',
  Thead: '@chakra-ui/react/table',
  Tbody: '@chakra-ui/react/table',
  Tfoot: '@chakra-ui/react/table',
  Tr: '@chakra-ui/react/table',
  Th: '@chakra-ui/react/table',
  Td: '@chakra-ui/react/table',
  TableContainer: '@chakra-ui/react/table',
  TableCaption: '@chakra-ui/react/table',
  Tag: '@chakra-ui/react/tag',
  TagLabel: '@chakra-ui/react/tag',
  TagLeftIcon: '@chakra-ui/react/tag',
  TagRightIcon: '@chakra-ui/react/tag',
  TagCloseButton: '@chakra-ui/react/tag',
  
  // Navigation
  Breadcrumb: '@chakra-ui/react/breadcrumb',
  BreadcrumbItem: '@chakra-ui/react/breadcrumb',
  BreadcrumbLink: '@chakra-ui/react/breadcrumb',
  BreadcrumbSeparator: '@chakra-ui/react/breadcrumb',
  Link: '@chakra-ui/react/layout',
  LinkBox: '@chakra-ui/react/link',
  LinkOverlay: '@chakra-ui/react/link',
  Menu: '@chakra-ui/react/menu',
  MenuButton: '@chakra-ui/react/menu',
  MenuList: '@chakra-ui/react/menu',
  MenuItem: '@chakra-ui/react/menu',
  MenuDivider: '@chakra-ui/react/menu',
  MenuGroup: '@chakra-ui/react/menu',
  MenuOptionGroup: '@chakra-ui/react/menu',
  MenuItemOption: '@chakra-ui/react/menu',
  Tabs: '@chakra-ui/react/tabs',
  TabList: '@chakra-ui/react/tabs',
  Tab: '@chakra-ui/react/tabs',
  TabPanels: '@chakra-ui/react/tabs',
  TabPanel: '@chakra-ui/react/tabs',
  
  // Feedback
  Alert: '@chakra-ui/react/alert',
  AlertIcon: '@chakra-ui/react/alert',
  AlertTitle: '@chakra-ui/react/alert',
  AlertDescription: '@chakra-ui/react/alert',
  CircularProgress: '@chakra-ui/react/progress',
  CircularProgressLabel: '@chakra-ui/react/progress',
  Progress: '@chakra-ui/react/progress',
  Skeleton: '@chakra-ui/react/skeleton',
  SkeletonCircle: '@chakra-ui/react/skeleton',
  SkeletonText: '@chakra-ui/react/skeleton',
  Spinner: '@chakra-ui/react/spinner',
  Toast: '@chakra-ui/react/toast',
  ToastProvider: '@chakra-ui/react/toast',
  useToast: '@chakra-ui/react/toast',
  
  // Overlay
  AlertDialog: '@chakra-ui/react/alert-dialog',
  AlertDialogBody: '@chakra-ui/react/alert-dialog',
  AlertDialogContent: '@chakra-ui/react/alert-dialog',
  AlertDialogFooter: '@chakra-ui/react/alert-dialog',
  AlertDialogHeader: '@chakra-ui/react/alert-dialog',
  AlertDialogOverlay: '@chakra-ui/react/alert-dialog',
  AlertDialogCloseButton: '@chakra-ui/react/alert-dialog',
  Drawer: '@chakra-ui/react/drawer',
  DrawerBody: '@chakra-ui/react/drawer',
  DrawerFooter: '@chakra-ui/react/drawer',
  DrawerHeader: '@chakra-ui/react/drawer',
  DrawerOverlay: '@chakra-ui/react/drawer',
  DrawerContent: '@chakra-ui/react/drawer',
  DrawerCloseButton: '@chakra-ui/react/drawer',
  Modal: '@chakra-ui/react/modal',
  ModalOverlay: '@chakra-ui/react/modal',
  ModalContent: '@chakra-ui/react/modal',
  ModalHeader: '@chakra-ui/react/modal',
  ModalFooter: '@chakra-ui/react/modal',
  ModalBody: '@chakra-ui/react/modal',
  ModalCloseButton: '@chakra-ui/react/modal',
  Popover: '@chakra-ui/react/popover',
  PopoverTrigger: '@chakra-ui/react/popover',
  PopoverContent: '@chakra-ui/react/popover',
  PopoverHeader: '@chakra-ui/react/popover',
  PopoverBody: '@chakra-ui/react/popover',
  PopoverFooter: '@chakra-ui/react/popover',
  PopoverArrow: '@chakra-ui/react/popover',
  PopoverCloseButton: '@chakra-ui/react/popover',
  PopoverAnchor: '@chakra-ui/react/popover',
  Tooltip: '@chakra-ui/react/tooltip',
  
  // Disclosure
  Accordion: '@chakra-ui/react/accordion',
  AccordionItem: '@chakra-ui/react/accordion',
  AccordionButton: '@chakra-ui/react/accordion',
  AccordionPanel: '@chakra-ui/react/accordion',
  AccordionIcon: '@chakra-ui/react/accordion',
  
  // Media and icons
  Avatar: '@chakra-ui/react/avatar',
  AvatarBadge: '@chakra-ui/react/avatar',
  AvatarGroup: '@chakra-ui/react/avatar',
  Icon: '@chakra-ui/react/icon',
  Image: '@chakra-ui/react/image',
  
  // Other
  Portal: '@chakra-ui/react/portal',
  CloseButton: '@chakra-ui/react/close-button',
  
  // Hooks
  useBoolean: '@chakra-ui/react/hooks',
  useBreakpoint: '@chakra-ui/react/hooks',
  useBreakpointValue: '@chakra-ui/react/hooks',
  useClipboard: '@chakra-ui/react/hooks',
  useConst: '@chakra-ui/react/hooks',
  useControllable: '@chakra-ui/react/hooks',
  useControllableState: '@chakra-ui/react/hooks',
  useDisclosure: '@chakra-ui/react/hooks',
  useMediaQuery: '@chakra-ui/react/hooks',
  useMergeRefs: '@chakra-ui/react/hooks',
  useOutsideClick: '@chakra-ui/react/hooks',
  usePrefersReducedMotion: '@chakra-ui/react/hooks',
  useToken: '@chakra-ui/react/hooks',
  
  // Color Mode
  useColorMode: '@chakra-ui/react/color-mode',
  useColorModeValue: '@chakra-ui/react/color-mode',
  ColorModeProvider: '@chakra-ui/react/color-mode',
  
  // Theme
  useTheme: '@chakra-ui/react/theme',
  ThemeProvider: '@chakra-ui/react/theme',
  
  // Others
  ChakraProvider: '@chakra-ui/react',
  createToaster: '@chakra-ui/react/toast',
};

// Prop mappings from v2 to v3
const PROP_MAPPINGS = {
  'isLoading': 'loading',
  'isOpen': 'open',
  'isDisabled': 'disabled',
  'isChecked': 'checked',
  'isActive': 'active',
  'isFocused': 'focused',
  'isAttached': 'attached',
  'isInvalid': 'invalid',
  'isReadOnly': 'readOnly',
  'isTruncated': 'truncated',
  'isFullWidth': 'fullWidth',
  'isExternal': 'external',
  'isRequired': 'required',
  'isIndeterminate': 'indeterminate',
};

// Components that need special handling for props - these components still use the v2 prop names
const V2_PROP_COMPONENTS = [
  'NotificationList',  // isLoading instead of loading
  'QueryStateHandler', // isLoading instead of loading
  'Modal',             // isOpen instead of open
  'AlertDialog',       // isOpen instead of open
  'DisconnectAlertDialog', // isLoading instead of loading
  'Popover',           // isOpen instead of open
  'Drawer',            // isOpen instead of open
  'Menu',              // isOpen instead of open
  'Tooltip',           // isOpen instead of open
];

// Files that need special attention due to heavy Chakra usage
const PRIORITY_FILES = [
  'src/features/ai-cs-agent/components/AIChatInterface.tsx',
  'src/features/warehouse/components/WarehouseForm.tsx',
  'src/features/warehouse/components/WarehouseManagement.tsx',
  'src/features/buybox/pages/BuyBoxDashboardPage.tsx',
  'src/features/buybox/contexts/BuyBoxContext.tsx',
  'src/features/feedback/components/FeedbackList.tsx',
];

// Track statistics
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  barrelImportsFixed: 0,
  propsFixed: 0,
  componentsWithV2Props: 0,
  stackSpacingToGap: 0,
};

/**
 * Process a file to fix Chakra UI imports and props
 */
async function processFile(filePath) {
  try {
    let fileModified = false;
    
    // Read the file content
    const content = await readFile(filePath, 'utf8');
    let updatedContent = content;
    
    // Step 1: Fix barrel imports (import {X} from '@chakra-ui/react')
    const barrelImportPattern = /import\s+{([^}]+)}\s+from\s+['"]@chakra-ui\/react['"]/g;
    let match;
    
    // Get all matches for barrel imports
    const matches = updatedContent.match(barrelImportPattern);
    if (matches) {
      for (const importStatement of matches) {
        // Extract component names from import statement
        const componentsMatch = /import\s+{([^}]+)}\s+from/.exec(importStatement);
        if (!componentsMatch || !componentsMatch[1]) continue;
        
        const componentNames = componentsMatch[1].split(',').map(c => c.trim());
        
        // Group components by their target module
        const moduleToComponents = {};
        for (const componentName of componentNames) {
          const modulePath = COMPONENT_MAP[componentName];
          if (!modulePath) continue; // Skip components not in our mapping
          
          moduleToComponents[modulePath] = moduleToComponents[modulePath] || [];
          moduleToComponents[modulePath].push(componentName);
        }
        
        // Generate new import statements
        const newImports = Object.entries(moduleToComponents).map(([modulePath, components]) => {
          return `import { ${components.join(', ')} } from '${modulePath}'`;
        });
        
        if (newImports.length > 0) {
          updatedContent = updatedContent.replace(importStatement, newImports.join(';\n'));
          stats.barrelImportsFixed += newImports.length;
          fileModified = true;
        }
      }
    }
    
    // Step 2: Fix prop names (isLoading -> loading, etc.)
    Object.entries(PROP_MAPPINGS).forEach(([oldProp, newProp]) => {
      // Find JSX props
      const propRegex = new RegExp(`(\\s+)${oldProp}(\\s*=\\s*{[^}]+})`, 'g');
      const propMatches = updatedContent.match(propRegex);
      
      if (propMatches) {
        const originalLength = propMatches.length;
        let updatedMatches = propMatches;
        
        // Filter out props for components that should keep v2 prop names
        for (const v2Component of V2_PROP_COMPONENTS) {
          const v2ComponentRegex = new RegExp(`<${v2Component}[^>]*\\s+${oldProp}\\s*=`, 'g');
          const v2Matches = updatedContent.match(v2ComponentRegex);
          
          if (v2Matches) {
            stats.componentsWithV2Props += v2Matches.length;
            // Remove these matches from the ones to replace
            updatedMatches = updatedMatches.filter(match => {
              for (const v2Match of v2Matches) {
                if (v2Match.includes(match.trim())) {
                  return false;
                }
              }
              return true;
            });
          }
        }
        
        stats.propsFixed += updatedMatches.length;
        
        // Replace the props
        updatedContent = updatedContent.replace(propRegex, (match, prefix, propValue) => {
          // Check if this match is for a component that should keep v2 prop names
          for (const v2Component of V2_PROP_COMPONENTS) {
            const v2ComponentRegex = new RegExp(`<${v2Component}[^>]*${match.trim()}`, 'g');
            if (updatedContent.match(v2ComponentRegex)) {
              return match; // Keep original for v2 components
            }
          }
          
          return `${prefix}${newProp}${propValue}`;
        });
        
        if (propMatches.length !== updatedMatches.length) {
          fileModified = true;
        }
      }
      
      // Also fix boolean props (like isLoading without a value)
      const boolPropRegex = new RegExp(`(\\s+)${oldProp}(?=\\s|>|\\/>)`, 'g');
      const boolPropMatches = updatedContent.match(boolPropRegex);
      
      if (boolPropMatches) {
        updatedContent = updatedContent.replace(boolPropRegex, (match, prefix) => {
          // Check if this match is for a component that should keep v2 prop names
          for (const v2Component of V2_PROP_COMPONENTS) {
            const v2ComponentRegex = new RegExp(`<${v2Component}[^>]*${match.trim()}`, 'g');
            if (updatedContent.match(v2ComponentRegex)) {
              return match; // Keep original for v2 components
            }
          }
          
          return `${prefix}${newProp}`;
        });
        
        stats.propsFixed += boolPropMatches.length;
        fileModified = true;
      }
    });
    
    // Step 3: Fix stack spacing prop -> gap
    const stackSpacingRegex = /(<(?:Stack|HStack|VStack)[^>]*\s+)spacing(\s*=\s*{[^}]+}|\s*=\s*["'][^"']*["'])/g;
    const stackSpacingMatches = updatedContent.match(stackSpacingRegex);
    
    if (stackSpacingMatches) {
      stats.stackSpacingToGap += stackSpacingMatches.length;
      updatedContent = updatedContent.replace(stackSpacingRegex, '$1gap$2');
      fileModified = true;
    }
    
    // Step 4: Fix self-closing tags for components that should be self-closing
    const selfClosingComponents = [
      'Spinner', 'Input', 'Textarea', 'Avatar', 'Image', 'AlertIcon',
      'Divider', 'Spacer', 'IconButton', 'InputLeftElement', 'InputRightElement'
    ];
    
    const selfClosingRegex = new RegExp(`<(${selfClosingComponents.join('|')})([^>]*?)>(?:\\s*?)<\\/(${selfClosingComponents.join('|')})>`, 'g');
    const selfClosingMatches = updatedContent.match(selfClosingRegex);
    
    if (selfClosingMatches) {
      updatedContent = updatedContent.replace(selfClosingRegex, '<$1$2 />');
      fileModified = true;
    }
    
    // Also fix components that are already self-closing but missing a space
    const missingSpaceRegex = new RegExp(`<(${selfClosingComponents.join('|')})([^>]*?)\/>`, 'g');
    const missingSpaceMatches = updatedContent.match(missingSpaceRegex);
    
    if (missingSpaceMatches) {
      updatedContent = updatedContent.replace(missingSpaceRegex, '<$1$2 />');
      fileModified = true;
    }
    
    // Write changes back to file if needed
    if (fileModified) {
      await writeFile(filePath, updatedContent, 'utf8');
      stats.filesModified++;
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
    }
    
    stats.filesProcessed++;
    return fileModified;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

/**
 * Process all TypeScript/JavaScript files in a directory recursively
 */
async function walkDirectory(dirPath) {
  const entries = await readdir(dirPath);
  let modifiedFiles = 0;
  
  // Process priority files first
  for (const priorityFile of PRIORITY_FILES) {
    const fullPath = path.join(process.cwd(), priorityFile);
    if (fs.existsSync(fullPath)) {
      const modified = await processFile(fullPath);
      if (modified) modifiedFiles++;
    }
  }
  
  for (const entry of entries) {
    // Skip hidden files and directories
    if (entry.startsWith('.')) continue;
    
    const fullPath = path.join(dirPath, entry);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and .next directories
      if (entry === 'node_modules' || entry === '.next' || entry === 'public') {
        continue;
      }
      modifiedFiles += await walkDirectory(fullPath);
    } else if (stats.isFile() && /\.(jsx?|tsx?)$/.test(fullPath)) {
      // Skip priority files that were already processed
      const relativePath = path.relative(process.cwd(), fullPath);
      if (PRIORITY_FILES.includes(relativePath)) {
        continue;
      }
      
      const modified = await processFile(fullPath);
      if (modified) modifiedFiles++;
    }
  }
  
  return modifiedFiles;
}

/**
 * Print statistics about the fixes applied
 */
function printStats() {
  console.log('\n🔍 Chakra UI v3 Fix Statistics:');
  console.log('----------------------------------------');
  console.log(`📄 Files Processed: ${stats.filesProcessed}`);
  console.log(`✨ Files Modified: ${stats.filesModified}`);
  console.log('----------------------------------------');
  console.log(`🔄 Barrel Imports Fixed: ${stats.barrelImportsFixed}`);
  console.log(`🔄 Props Fixed: ${stats.propsFixed}`);
  console.log(`🔄 Components With v2 Props Preserved: ${stats.componentsWithV2Props}`);
  console.log(`🔄 Stack spacing -> gap: ${stats.stackSpacingToGap}`);
  console.log('----------------------------------------');
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    console.log('🚀 Starting Chakra UI v3 pattern fixer...');
    
    // Get the target from command line args or default to src/
    const target = process.argv[2] || 'src';
    const targetPath = path.resolve(process.cwd(), target);
    
    const statInfo = await stat(targetPath);
    
    if (statInfo.isDirectory()) {
      console.log(`📁 Processing directory: ${targetPath}`);
      await walkDirectory(targetPath);
    } else if (statInfo.isFile()) {
      console.log(`📄 Processing file: ${targetPath}`);
      await processFile(targetPath);
    } else {
      console.error(`❌ Target is neither a file nor a directory: ${targetPath}`);
      process.exit(1);
    }
    
    printStats();
    console.log('✨ Chakra UI v3 fixes completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();