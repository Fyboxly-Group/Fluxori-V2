#!/usr/bin/env node

/**
 * Comprehensive script to fix Chakra UI v3 patterns:
 * 1. Converts barrel imports to direct module imports with correct paths
 * 2. Fixes prop names to match Chakra UI v3 naming conventions
 * 3. Updates usage of deprecated APIs 
 * 
 * Usage:
 *   node scripts/fix-chakra-ui-v3.js [target]
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const { execSync } = require('child_process');

// Chakra UI v3 component mapping
const COMPONENT_MAP = {
  // Layout components
  'Box': '@chakra-ui/react/box',
  'Center': '@chakra-ui/react/center',
  'Container': '@chakra-ui/react/container',
  'Flex': '@chakra-ui/react/flex',
  'Grid': '@chakra-ui/react/grid',
  'GridItem': '@chakra-ui/react/grid',
  'SimpleGrid': '@chakra-ui/react/simple-grid',
  'Spacer': '@chakra-ui/react/spacer',
  'Stack': '@chakra-ui/react/stack',
  'HStack': '@chakra-ui/react/stack',
  'VStack': '@chakra-ui/react/stack',
  'Wrap': '@chakra-ui/react/wrap',
  'WrapItem': '@chakra-ui/react/wrap',
  
  // Typography components
  'Heading': '@chakra-ui/react/typography',
  'Text': '@chakra-ui/react/typography',
  
  // Form components
  'Button': '@chakra-ui/react/button',
  'IconButton': '@chakra-ui/react/button',
  'ButtonGroup': '@chakra-ui/react/button-group',
  'Checkbox': '@chakra-ui/react/checkbox',
  'FormControl': '@chakra-ui/react/form-control',
  'FormLabel': '@chakra-ui/react/form-control',
  'FormErrorMessage': '@chakra-ui/react/form-control',
  'FormHelperText': '@chakra-ui/react/form-control',
  'Input': '@chakra-ui/react/input',
  'InputGroup': '@chakra-ui/react/input',
  'InputLeftElement': '@chakra-ui/react/input',
  'InputRightElement': '@chakra-ui/react/input',
  'InputLeftAddon': '@chakra-ui/react/input',
  'InputRightAddon': '@chakra-ui/react/input',
  'Radio': '@chakra-ui/react/radio-group',
  'RadioGroup': '@chakra-ui/react/radio-group',
  'Select': '@chakra-ui/react/select',
  'Switch': '@chakra-ui/react/switch',
  'Textarea': '@chakra-ui/react/textarea',
  
  // Data display components
  'Badge': '@chakra-ui/react/badge',
  'Card': '@chakra-ui/react/card',
  'CardHeader': '@chakra-ui/react/card',
  'CardBody': '@chakra-ui/react/card',
  'CardFooter': '@chakra-ui/react/card',
  'Divider': '@chakra-ui/react/separator',
  'List': '@chakra-ui/react/list',
  'ListItem': '@chakra-ui/react/list',
  'ListIcon': '@chakra-ui/react/list',
  'OrderedList': '@chakra-ui/react/list',
  'UnorderedList': '@chakra-ui/react/list',
  'Stat': '@chakra-ui/react/stat',
  'StatLabel': '@chakra-ui/react/stat',
  'StatNumber': '@chakra-ui/react/stat',
  'StatHelpText': '@chakra-ui/react/stat',
  'StatArrow': '@chakra-ui/react/stat',
  'StatGroup': '@chakra-ui/react/stat',
  'Table': '@chakra-ui/react/table',
  'Thead': '@chakra-ui/react/table',
  'Tbody': '@chakra-ui/react/table',
  'Tfoot': '@chakra-ui/react/table',
  'Tr': '@chakra-ui/react/table',
  'Th': '@chakra-ui/react/table',
  'Td': '@chakra-ui/react/table',
  'TableContainer': '@chakra-ui/react/table',
  'TableCaption': '@chakra-ui/react/table',
  'Tag': '@chakra-ui/react/tag',
  'TagLabel': '@chakra-ui/react/tag',
  'TagLeftIcon': '@chakra-ui/react/tag',
  'TagRightIcon': '@chakra-ui/react/tag',
  'TagCloseButton': '@chakra-ui/react/tag',
  
  // Navigation components
  'Breadcrumb': '@chakra-ui/react/breadcrumb',
  'BreadcrumbItem': '@chakra-ui/react/breadcrumb',
  'BreadcrumbLink': '@chakra-ui/react/breadcrumb',
  'BreadcrumbSeparator': '@chakra-ui/react/breadcrumb',
  'Link': '@chakra-ui/react/link',
  'LinkBox': '@chakra-ui/react/link',
  'LinkOverlay': '@chakra-ui/react/link',
  'Menu': '@chakra-ui/react/menu',
  'MenuButton': '@chakra-ui/react/menu',
  'MenuList': '@chakra-ui/react/menu',
  'MenuItem': '@chakra-ui/react/menu',
  'MenuDivider': '@chakra-ui/react/menu',
  'MenuGroup': '@chakra-ui/react/menu',
  'MenuOptionGroup': '@chakra-ui/react/menu',
  'MenuItemOption': '@chakra-ui/react/menu',
  'Tabs': '@chakra-ui/react/tabs',
  'TabList': '@chakra-ui/react/tabs',
  'Tab': '@chakra-ui/react/tabs',
  'TabPanels': '@chakra-ui/react/tabs',
  'TabPanel': '@chakra-ui/react/tabs',
  
  // Feedback components
  'Alert': '@chakra-ui/react/alert',
  'AlertIcon': '@chakra-ui/react/alert',
  'AlertTitle': '@chakra-ui/react/alert',
  'AlertDescription': '@chakra-ui/react/alert',
  'CircularProgress': '@chakra-ui/react/progress-circle',
  'CircularProgressLabel': '@chakra-ui/react/progress-circle',
  'Progress': '@chakra-ui/react/progress',
  'Skeleton': '@chakra-ui/react/skeleton',
  'SkeletonCircle': '@chakra-ui/react/skeleton',
  'SkeletonText': '@chakra-ui/react/skeleton',
  'Spinner': '@chakra-ui/react/spinner',
  'createToaster': '@chakra-ui/react/toast',
  'useToast': '@chakra-ui/react/toast',
  
  // Overlay components
  'AlertDialog': '@chakra-ui/react/dialog',
  'AlertDialogBody': '@chakra-ui/react/dialog',
  'AlertDialogContent': '@chakra-ui/react/dialog',
  'AlertDialogFooter': '@chakra-ui/react/dialog',
  'AlertDialogHeader': '@chakra-ui/react/dialog',
  'AlertDialogOverlay': '@chakra-ui/react/dialog',
  'Drawer': '@chakra-ui/react/drawer',
  'DrawerBody': '@chakra-ui/react/drawer',
  'DrawerCloseButton': '@chakra-ui/react/drawer',
  'DrawerContent': '@chakra-ui/react/drawer',
  'DrawerFooter': '@chakra-ui/react/drawer',
  'DrawerHeader': '@chakra-ui/react/drawer',
  'DrawerOverlay': '@chakra-ui/react/drawer',
  'Modal': '@chakra-ui/react/modal',
  'ModalBody': '@chakra-ui/react/modal',
  'ModalCloseButton': '@chakra-ui/react/modal',
  'ModalContent': '@chakra-ui/react/modal',
  'ModalFooter': '@chakra-ui/react/modal',
  'ModalHeader': '@chakra-ui/react/modal',
  'ModalOverlay': '@chakra-ui/react/modal',
  'Popover': '@chakra-ui/react/popover',
  'PopoverArrow': '@chakra-ui/react/popover',
  'PopoverBody': '@chakra-ui/react/popover',
  'PopoverCloseButton': '@chakra-ui/react/popover',
  'PopoverContent': '@chakra-ui/react/popover',
  'PopoverFooter': '@chakra-ui/react/popover',
  'PopoverHeader': '@chakra-ui/react/popover',
  'PopoverTrigger': '@chakra-ui/react/popover',
  'Tooltip': '@chakra-ui/react/tooltip',
  
  // Media components
  'Avatar': '@chakra-ui/react/avatar',
  'AvatarBadge': '@chakra-ui/react/avatar',
  'AvatarGroup': '@chakra-ui/react/avatar',
  'Icon': '@chakra-ui/react/icon',
  'Image': '@chakra-ui/react/image',
  
  // Other components
  'CloseButton': '@chakra-ui/react/close-button',
  'Portal': '@chakra-ui/react/portal',
  
  // Hooks and other utilities
  'useDisclosure': '@chakra-ui/react/hooks',
  'useColorMode': '@chakra-ui/react/color-mode',
  'useColorModeValue': '@chakra-ui/react/color-mode',
  'useTheme': '@chakra-ui/react/theme',
  
  // Provider
  'ChakraProvider': '@chakra-ui/react',
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

// Path for module declarations file
const TYPES_DIR = path.join(process.cwd(), 'src/types');
const DECLARATIONS_FILE = path.join(TYPES_DIR, 'module-declarations.d.ts');

// Stats tracking
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  barrelImportsFixed: 0,
  propsFixed: 0,
  componentsWithV2Props: 0,
  stackSpacingToGap: 0,
};

/**
 * Creates or updates module declarations file
 */
async function ensureModuleDeclarations() {
  try {
    // Create types directory if it doesn't exist
    if (!fs.existsSync(TYPES_DIR)) {
      fs.mkdirSync(TYPES_DIR, { recursive: true });
    }
    
    // Create or update declarations file
    const moduleDeclarations = `// Generated module declarations for Chakra UI v3
// This file helps TypeScript understand the module structure of Chakra UI v3

declare module '@chakra-ui/react/box' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/button' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/flex' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/typography' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/card' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/stack' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/form-control' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/input' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/select' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/textarea' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/checkbox' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/radio-group' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/switch' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/table' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/tabs' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/modal' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/dialog' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/popover' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/drawer' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/menu' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/toast' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/alert' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/spinner' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/progress' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/progress-circle' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/avatar' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/badge' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/tooltip' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/separator' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/list' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/image' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/icon' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/close-button' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/tag' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/breadcrumb' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/link' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/skeleton' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/container' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/grid' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/simple-grid' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/center' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/wrap' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/button-group' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/portal' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/color-mode' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/theme' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/hooks' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/spacer' {
  export * from '@chakra-ui/react';
}

declare module '@chakra-ui/react/stat' {
  export * from '@chakra-ui/react';
}
`;
    
    // Write the declarations file
    await writeFile(DECLARATIONS_FILE, moduleDeclarations, 'utf8');
    console.log(`✅ Module declarations file updated at ${path.relative(process.cwd(), DECLARATIONS_FILE)}`);
    
  } catch (error) {
    console.error('❌ Error creating module declarations:', error);
  }
}

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
    });
    
    // Step 3: Fix stack spacing prop -> gap
    const stackSpacingRegex = /(<(?:Stack|HStack|VStack)[^>]*\s+)spacing(\s*=\s*{[^}]+})/g;
    const stackSpacingMatches = updatedContent.match(stackSpacingRegex);
    
    if (stackSpacingMatches) {
      stats.stackSpacingToGap += stackSpacingMatches.length;
      updatedContent = updatedContent.replace(stackSpacingRegex, '$1gap$2');
      fileModified = true;
    }
    
    // Step 4: Reverse prop changes for NotificationList and other special cases
    V2_PROP_COMPONENTS.forEach(componentName => {
      Object.entries(PROP_MAPPINGS).forEach(([oldProp, newProp]) => {
        // Find where the new prop is used with these components
        const wrongPropRegex = new RegExp(`(<${componentName}[^>]*\\s+)${newProp}(\\s*=\\s*{[^}]+})`, 'g');
        const wrongPropMatches = updatedContent.match(wrongPropRegex);
        
        if (wrongPropMatches) {
          // Change back to the old prop name
          updatedContent = updatedContent.replace(wrongPropRegex, `$1${oldProp}$2`);
          fileModified = true;
        }
      });
    });
    
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
  
  for (const entry of entries) {
    // Skip hidden files and directories
    if (entry.startsWith('.')) continue;
    
    const fullPath = path.join(dirPath, entry);
    const statInfo = await stat(fullPath);
    
    if (statInfo.isDirectory()) {
      // Skip node_modules and .next directories
      if (entry === 'node_modules' || entry === '.next' || entry === 'public') {
        continue;
      }
      modifiedFiles += await walkDirectory(fullPath);
    } else if (statInfo.isFile() && /\.(jsx?|tsx?)$/.test(fullPath)) {
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
  console.log('\n📊 Chakra UI v3 Fix Statistics:');
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
 * After fixing imports, try to build the project to see if we've addressed all issues
 */
async function runBuild() {
  console.log('\n🔨 Running build to verify fixes...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful!');
    return true;
  } catch (error) {
    console.log('❌ Build failed. Some issues might still need to be addressed.');
    return false;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    console.log('🚀 Starting Chakra UI v3 pattern fixer...');
    
    // First, create module declarations file
    await ensureModuleDeclarations();
    
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
    
    // Verify fixes by running a build
    await runBuild();
    
    console.log('✨ Chakra UI v3 fixes completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();