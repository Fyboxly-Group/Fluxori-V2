#!/usr/bin/env node

/**
 * Fix Chakra UI v3 component issues
 * 
 * This script fixes component imports and usage patterns for Chakra UI v3
 * addressing issues with direct imports and prop naming
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Root directory
const ROOT_DIR = process.cwd();

// Chakra UI v3 component to module mapping
const COMPONENT_MODULE_MAP = {
  // Layout
  'Box': '@chakra-ui/react/box',
  'Center': '@chakra-ui/react/center',
  'Container': '@chakra-ui/react/container',
  'Flex': '@chakra-ui/react/flex',
  'Grid': '@chakra-ui/react/grid',
  'GridItem': '@chakra-ui/react/grid',
  'SimpleGrid': '@chakra-ui/react/simple-grid',
  'Stack': '@chakra-ui/react/stack',
  'HStack': '@chakra-ui/react/stack',
  'VStack': '@chakra-ui/react/stack',
  // Typography
  'Heading': '@chakra-ui/react/heading',
  'Text': '@chakra-ui/react/text',
  // Forms
  'Button': '@chakra-ui/react/button',
  'IconButton': '@chakra-ui/react/button',
  'Checkbox': '@chakra-ui/react/checkbox',
  'FormControl': '@chakra-ui/react/form-control',
  'FormLabel': '@chakra-ui/react/form-control',
  'FormErrorMessage': '@chakra-ui/react/form-control',
  'FormHelperText': '@chakra-ui/react/form-control',
  'Input': '@chakra-ui/react/input',
  'InputGroup': '@chakra-ui/react/input',
  'InputLeftElement': '@chakra-ui/react/input',
  'InputRightElement': '@chakra-ui/react/input',
  'Radio': '@chakra-ui/react/radio',
  'RadioGroup': '@chakra-ui/react/radio',
  'Select': '@chakra-ui/react/select',
  'Switch': '@chakra-ui/react/switch',
  'Textarea': '@chakra-ui/react/textarea',
  // Data Display
  'Badge': '@chakra-ui/react/badge',
  'Code': '@chakra-ui/react/code',
  'Divider': '@chakra-ui/react/divider',
  'Kbd': '@chakra-ui/react/kbd',
  'List': '@chakra-ui/react/list',
  'ListItem': '@chakra-ui/react/list',
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
  'TableCaption': '@chakra-ui/react/table',
  'TableContainer': '@chakra-ui/react/table',
  // Feedback
  'Alert': '@chakra-ui/react/alert',
  'AlertIcon': '@chakra-ui/react/alert',
  'AlertTitle': '@chakra-ui/react/alert',
  'AlertDescription': '@chakra-ui/react/alert',
  'Progress': '@chakra-ui/react/progress',
  'Skeleton': '@chakra-ui/react/skeleton',
  'SkeletonText': '@chakra-ui/react/skeleton',
  'SkeletonCircle': '@chakra-ui/react/skeleton',
  'Spinner': '@chakra-ui/react/spinner',
  'Toast': '@chakra-ui/react/toast',
  // Navigation
  'Breadcrumb': '@chakra-ui/react/breadcrumb',
  'BreadcrumbItem': '@chakra-ui/react/breadcrumb',
  'BreadcrumbLink': '@chakra-ui/react/breadcrumb',
  'BreadcrumbSeparator': '@chakra-ui/react/breadcrumb',
  'Link': '@chakra-ui/react/link',
  'LinkBox': '@chakra-ui/react/link',
  'LinkOverlay': '@chakra-ui/react/link',
  // Media
  'Avatar': '@chakra-ui/react/avatar',
  'AvatarBadge': '@chakra-ui/react/avatar',
  'AvatarGroup': '@chakra-ui/react/avatar',
  'Image': '@chakra-ui/react/image',
  // Overlay
  'Modal': '@chakra-ui/react/modal',
  'ModalOverlay': '@chakra-ui/react/modal',
  'ModalContent': '@chakra-ui/react/modal',
  'ModalHeader': '@chakra-ui/react/modal',
  'ModalFooter': '@chakra-ui/react/modal',
  'ModalBody': '@chakra-ui/react/modal',
  'ModalCloseButton': '@chakra-ui/react/modal',
  'Popover': '@chakra-ui/react/popover',
  'PopoverTrigger': '@chakra-ui/react/popover',
  'PopoverContent': '@chakra-ui/react/popover',
  'PopoverHeader': '@chakra-ui/react/popover',
  'PopoverBody': '@chakra-ui/react/popover',
  'PopoverFooter': '@chakra-ui/react/popover',
  'PopoverArrow': '@chakra-ui/react/popover',
  'PopoverCloseButton': '@chakra-ui/react/popover',
  'Menu': '@chakra-ui/react/menu',
  'MenuButton': '@chakra-ui/react/menu',
  'MenuList': '@chakra-ui/react/menu',
  'MenuItem': '@chakra-ui/react/menu',
  'MenuDivider': '@chakra-ui/react/menu',
  'Tooltip': '@chakra-ui/react/tooltip',
  // Disclosure
  'Accordion': '@chakra-ui/react/accordion',
  'AccordionItem': '@chakra-ui/react/accordion',
  'AccordionButton': '@chakra-ui/react/accordion',
  'AccordionPanel': '@chakra-ui/react/accordion',
  'AccordionIcon': '@chakra-ui/react/accordion',
  'Tabs': '@chakra-ui/react/tabs',
  'TabList': '@chakra-ui/react/tabs',
  'Tab': '@chakra-ui/react/tabs',
  'TabPanel': '@chakra-ui/react/tabs',
  'TabPanels': '@chakra-ui/react/tabs',
  // Other
  'Card': '@chakra-ui/react/card',
  'CardHeader': '@chakra-ui/react/card',
  'CardBody': '@chakra-ui/react/card',
  'CardFooter': '@chakra-ui/react/card',
  'Icon': '@chakra-ui/react/icon',
  'Tag': '@chakra-ui/react/tag',
  'TagLabel': '@chakra-ui/react/tag',
  'TagLeftIcon': '@chakra-ui/react/tag',
  'TagRightIcon': '@chakra-ui/react/tag',
  'TagCloseButton': '@chakra-ui/react/tag',
  'Portal': '@chakra-ui/react/portal',
  // Hooks
  'useDisclosure': '@chakra-ui/react/hooks',
  'useClipboard': '@chakra-ui/react/hooks',
  'useColorMode': '@chakra-ui/react/color-mode',
  'useColorModeValue': '@chakra-ui/react/color-mode',
};

// Prop name mappings from v2 to v3
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
};

// Files with the most Chakra UI component issues
const COMPONENT_ISSUE_FILES = [
  'src/components/common/QueryStateHandler.tsx',
  'src/features/ai-cs-agent/components/AIChatInterface.tsx',
  'src/features/ai-cs-agent/components/ConversationList.tsx',
  'src/features/notifications/components/NotificationCenter.tsx',
  'src/features/warehouse/components/WarehouseManagement.tsx',
  'src/features/buybox/pages/BuyBoxDashboardPage.tsx'
];

// Function to fix Chakra UI imports
function fixChakraImports(content) {
  // Extract import statements
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]@chakra-ui\/react['"]/g;
  let matches = [...content.matchAll(importRegex)];
  
  if (matches.length === 0) {
    return content; // No Chakra imports found
  }
  
  let updatedContent = content;
  const componentsMap = new Map();
  
  // Process each import statement
  for (const match of matches) {
    const importComponents = match[1].split(',').map(c => c.trim());
    
    // Group components by their module
    for (const comp of importComponents) {
      if (comp in COMPONENT_MODULE_MAP) {
        const module = COMPONENT_MODULE_MAP[comp];
        if (!componentsMap.has(module)) {
          componentsMap.set(module, []);
        }
        componentsMap.get(module).push(comp);
      }
    }
    
    // Mark the original import for replacement
    updatedContent = updatedContent.replace(match[0], `/* CHAKRA_IMPORT_REPLACE_${matches.indexOf(match)} */`);
  }
  
  // Generate new import statements
  let importStatements = '';
  for (const [module, components] of componentsMap.entries()) {
    importStatements += `import { ${components.join(', ')} } from '${module}';\n`;
  }
  
  // Replace placeholder with new imports
  for (let i = 0; i < matches.length; i++) {
    if (i === 0) {
      updatedContent = updatedContent.replace(`/* CHAKRA_IMPORT_REPLACE_${i} */`, importStatements.trim());
    } else {
      updatedContent = updatedContent.replace(`/* CHAKRA_IMPORT_REPLACE_${i} */`, '');
    }
  }
  
  return updatedContent;
}

// Function to fix Chakra UI props
function fixChakraProps(content) {
  let updatedContent = content;
  
  // Fix prop names
  for (const [oldProp, newProp] of Object.entries(PROP_MAPPINGS)) {
    // Regex to match props in JSX
    const propRegex = new RegExp(`(\\s+)${oldProp}(\\s*=\\s*{[^}]+})`, 'g');
    updatedContent = updatedContent.replace(propRegex, `$1${newProp}$2`);
    
    // Also fix props in interfaces and type definitions
    const typePropRegex = new RegExp(`(\\s+)${oldProp}(\\??:\\s*[^;\\n]+)`, 'g');
    updatedContent = updatedContent.replace(typePropRegex, `$1${newProp}$2`);
  }
  
  // Fix spacing prop for Stack components
  const stackSpacingRegex = /(<(?:Stack|HStack|VStack)[^>]*\s+)spacing(\s*=\s*{[^}]+})/g;
  updatedContent = updatedContent.replace(stackSpacingRegex, '$1gap$2');
  
  return updatedContent;
}

// Function to fix self-closing tags for Chakra UI components that should be self-closing
function fixSelfClosingTags(content) {
  const selfClosingComponents = [
    'Spinner', 'Input', 'Textarea', 'Avatar', 'Image', 'AlertIcon', 
    'Divider', 'Spacer', 'IconButton'
  ];
  
  const selfClosingRegex = new RegExp(`<(${selfClosingComponents.join('|')})([^>]*?)>(?!\\s*<\\/(${selfClosingComponents.join('|')})>)`, 'g');
  return content.replace(selfClosingRegex, '<$1$2 />');
}

// Process a single file
function processFile(filePath) {
  console.log(`🔧 Processing ${filePath}...`);
  
  try {
    // Get original content
    const fullPath = path.join(ROOT_DIR, filePath);
    const originalContent = fs.readFileSync(fullPath, 'utf8');
    
    // Apply fixes
    let updatedContent = originalContent;
    updatedContent = fixChakraImports(updatedContent);
    updatedContent = fixChakraProps(updatedContent);
    updatedContent = fixSelfClosingTags(updatedContent);
    
    // Write updated content if changes were made
    if (updatedContent !== originalContent) {
      fs.writeFileSync(fullPath, updatedContent);
      console.log(`✅ Fixed Chakra UI issues in ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️ No changes needed in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

// Fix imports in files where specific Chakra UI components are used
function fixChakraImportsInFiles() {
  console.log('🔍 Finding files using Chakra UI components...');
  
  // Get all TypeScript files in the project
  const allFiles = getAllTypeScriptFiles(path.join(ROOT_DIR, 'src'));
  
  // First process the files with known issues
  let fixedFiles = 0;
  for (const filePath of COMPONENT_ISSUE_FILES) {
    const fixed = processFile(filePath);
    if (fixed) fixedFiles++;
  }
  
  // Then process other files that import Chakra
  for (const filePath of allFiles) {
    if (COMPONENT_ISSUE_FILES.includes(filePath)) {
      continue; // Skip already processed files
    }
    
    // Check if the file has Chakra imports
    const fullPath = path.join(ROOT_DIR, filePath);
    let content;
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      console.error(`❌ Error reading ${filePath}:`, error);
      continue;
    }
    
    if (content.includes('@chakra-ui/react')) {
      const fixed = processFile(filePath);
      if (fixed) fixedFiles++;
    }
  }
  
  console.log(`\n📊 Fixed Chakra UI issues in ${fixedFiles} files`);
  return fixedFiles;
}

// Helper function to get all TypeScript files in a directory
function getAllTypeScriptFiles(dirPath, fileList = []) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (file === 'node_modules' || file === '.next' || file === 'dist') {
        continue;
      }
      getAllTypeScriptFiles(fullPath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      // Add TypeScript files to the list
      const relativePath = path.relative(ROOT_DIR, fullPath);
      fileList.push(relativePath);
    }
  }
  
  return fileList;
}

// Main function
function main() {
  try {
    console.log('🚀 Starting Chakra UI v3 component fix script');
    
    // Fix Chakra UI imports and props in files
    const fixedFiles = fixChakraImportsInFiles();
    
    // Run TypeScript check to see if we fixed the errors
    console.log('\n🔍 Checking for remaining TypeScript errors...');
    let remainingErrors = 0;
    
    try {
      execSync('npx tsc --noEmit', { 
        cwd: ROOT_DIR 
      });
      console.log('✅ All TypeScript errors fixed!');
    } catch (error) {
      // Count remaining errors
      const errorMatches = error.stdout.toString().match(/error TS\d+/g);
      remainingErrors = errorMatches ? errorMatches.length : 0;
      console.log(`⚠️ ${remainingErrors} TypeScript errors remain`);
    }
    
    return remainingErrors;
  } catch (error) {
    console.error('❌ Error:', error);
    return -1;
  }
}

// Run the script
const remainingErrors = main();
process.exit(remainingErrors > 0 ? 1 : 0);