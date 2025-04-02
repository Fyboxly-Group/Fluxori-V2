const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Import Statements and Comments Fix Script');

// Track modifications for reporting
const stats = {
  filesScanned: 0,
  filesFixed: 0,
  chakraImportsFixed: 0,
  tsIgnoresRemoved: 0,
  importStatementsAdded: 0
};

/**
 * Find all TypeScript files in the project
 */
function findTypeScriptFiles() {
  try {
    // Use git to list all TypeScript files
    const output = execSync('git ls-files "*.ts" "*.tsx"', { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    // Fallback to manual file search if git command fails
    console.log('⚠️ Git command failed, falling back to manual file search');
    return findFilesRecursively('src', /\.(ts|tsx)$/);
  }
}

/**
 * Find files recursively within a directory
 */
function findFilesRecursively(dir, pattern) {
  let results = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules' && item !== '.next' && item !== 'out') {
      results = results.concat(findFilesRecursively(fullPath, pattern));
    } else if (pattern.test(item)) {
      results.push(fullPath);
    }
  }
  
  return results;
}

/**
 * Fix incorrect Chakra UI import patterns
 */
function fixChakraImports(content) {
  let updated = content;
  let count = 0;
  
  // Fix import from '@chakra-ui/react' without destructuring
  if (updated.includes("import ChakraUI from '@chakra-ui/react'") || 
      updated.includes("import * as Chakra from '@chakra-ui/react'")) {
    updated = updated
      .replace("import ChakraUI from '@chakra-ui/react'", "// Use direct imports for Chakra UI v3 components")
      .replace("import * as Chakra from '@chakra-ui/react'", "// Use direct imports for Chakra UI v3 components");
    count++;
  }
  
  // Find all Chakra UI component usages
  const chakraComponentPattern = /<([A-Z][A-Za-z0-9]*)(?=[\s/>])/g;
  const chakraComponents = new Set();
  let match;
  
  while ((match = chakraComponentPattern.exec(content)) !== null) {
    const componentName = match[1];
    // Check if likely a Chakra UI component (this is a heuristic)
    if (['Box', 'Flex', 'Grid', 'Button', 'Text', 'Heading', 'Stack', 'HStack', 'VStack',
         'Input', 'Checkbox', 'Radio', 'Select', 'Textarea', 'FormControl', 'FormLabel',
         'Switch', 'Modal', 'ModalOverlay', 'ModalContent', 'ModalHeader', 'ModalBody',
         'ModalFooter', 'ModalCloseButton', 'Drawer', 'Menu', 'Tabs', 'Tab', 'Spinner',
         'Badge', 'Alert', 'Card', 'CardHeader', 'CardBody', 'CardFooter', 'Avatar',
         'IconButton', 'Image', 'Link', 'Table', 'Thead', 'Tbody', 'Tr', 'Th', 'Td']
         .includes(componentName)) {
      
      chakraComponents.add(componentName);
    }
  }
  
  // If components are found but not imported from Chakra UI, add imports
  if (chakraComponents.size > 0) {
    const barrelImportMatch = updated.match(/import\s+{([^}]*)}\s+from\s+['"]@chakra-ui\/react['"]/);
    
    if (barrelImportMatch) {
      // Components are imported from barrel import, no action needed
    } else {
      // Check for each component if it's imported
      let importStatements = [];
      
      chakraComponents.forEach(component => {
        // Check if component is already imported
        const importRegex = new RegExp(`import\\s+({\\s*${component}\\s*}|${component})\\s+from\\s+['"]@chakra-ui/react`, 'g');
        if (!importRegex.test(updated)) {
          // Get module path for the component
          const modulePath = getChakraModulePath(component);
          importStatements.push(`import { ${component} } from '@chakra-ui/react/${modulePath}';`);
          count++;
        }
      });
      
      // Add import statements after other imports
      if (importStatements.length > 0) {
        const lastImportIndex = updated.lastIndexOf('import ');
        
        if (lastImportIndex !== -1) {
          // Find the end of the last import statement
          const lastImportEndIndex = updated.indexOf(';', lastImportIndex) + 1;
          
          updated = 
            updated.substring(0, lastImportEndIndex) + 
            '\n' + importStatements.join('\n') + 
            updated.substring(lastImportEndIndex);
          
          stats.importStatementsAdded += importStatements.length;
        } else {
          // No imports found, add at the beginning
          updated = importStatements.join('\n') + '\n\n' + updated;
          stats.importStatementsAdded += importStatements.length;
        }
      }
    }
  }
  
  return { content: updated, count };
}

/**
 * Map a Chakra UI component name to its module path
 */
function getChakraModulePath(componentName) {
  // This is a simplified mapping - in a real script you'd have a comprehensive mapping
  const componentModuleMap = {
    // Layout Components
    Box: 'box',
    Center: 'center',
    Container: 'container',
    Flex: 'flex',
    Grid: 'grid',
    GridItem: 'grid',
    SimpleGrid: 'simple-grid',
    Stack: 'stack',
    HStack: 'stack',
    VStack: 'stack',
    Wrap: 'wrap',
    WrapItem: 'wrap',
    
    // Typography
    Heading: 'heading',
    Text: 'text',
    
    // Form Components
    Button: 'button',
    IconButton: 'button',
    ButtonGroup: 'button',
    Checkbox: 'checkbox',
    FormControl: 'form-control',
    FormLabel: 'form-control',
    FormErrorMessage: 'form-control',
    FormHelperText: 'form-control',
    Input: 'input',
    InputGroup: 'input',
    InputLeftAddon: 'input',
    InputRightAddon: 'input',
    InputLeftElement: 'input',
    InputRightElement: 'input',
    Select: 'select',
    Textarea: 'textarea',
    
    // Feedback Components
    Alert: 'alert',
    AlertIcon: 'alert',
    AlertTitle: 'alert',
    AlertDescription: 'alert',
    Spinner: 'spinner',
    Progress: 'progress',
    
    // Disclosure Components
    Accordion: 'accordion',
    AccordionItem: 'accordion',
    AccordionButton: 'accordion',
    AccordionPanel: 'accordion',
    AccordionIcon: 'accordion',
    Tabs: 'tabs',
    TabList: 'tabs',
    Tab: 'tabs',
    TabPanels: 'tabs',
    TabPanel: 'tabs',
    
    // Navigation Components
    Breadcrumb: 'breadcrumb',
    BreadcrumbItem: 'breadcrumb',
    BreadcrumbLink: 'breadcrumb',
    BreadcrumbSeparator: 'breadcrumb',
    Link: 'link',
    LinkBox: 'link-box',
    LinkOverlay: 'link-overlay',
    
    // Overlay Components
    Modal: 'modal',
    ModalOverlay: 'modal',
    ModalContent: 'modal',
    ModalHeader: 'modal',
    ModalFooter: 'modal',
    ModalBody: 'modal',
    ModalCloseButton: 'modal',
    Drawer: 'drawer',
    DrawerOverlay: 'drawer',
    DrawerContent: 'drawer',
    DrawerHeader: 'drawer',
    DrawerFooter: 'drawer',
    DrawerBody: 'drawer',
    DrawerCloseButton: 'drawer',
    Popover: 'popover',
    PopoverTrigger: 'popover',
    PopoverContent: 'popover',
    PopoverHeader: 'popover',
    PopoverFooter: 'popover',
    PopoverBody: 'popover',
    PopoverArrow: 'popover',
    PopoverCloseButton: 'popover',
    Tooltip: 'tooltip',
    
    // Data Display Components
    Badge: 'badge',
    Card: 'card',
    CardHeader: 'card',
    CardBody: 'card',
    CardFooter: 'card',
    Table: 'table',
    Thead: 'table',
    Tbody: 'table',
    Tfoot: 'table',
    Tr: 'table',
    Th: 'table',
    Td: 'table',
    TableCaption: 'table',
    TableContainer: 'table',
    
    // Media Components
    Image: 'image',
    Avatar: 'avatar',
    AvatarBadge: 'avatar',
    AvatarGroup: 'avatar',
    
    // Other Components
    Divider: 'divider',
    CloseButton: 'close-button',
    
    // Default fallback
    default: 'react'
  };
  
  return componentModuleMap[componentName] || componentModuleMap.default;
}

/**
 * Remove @ts-ignore comments where possible
 */
function removeUnnecessaryTsIgnores(content) {
  // Count how many @ts-ignore or @ts-nocheck comments are found
  const tsIgnorePattern = /\/\/\s*@ts-(ignore|nocheck)/g;
  const matches = content.match(tsIgnorePattern) || [];
  const count = matches.length;
  
  // Remove @ts-ignore comments that are no longer needed
  let updated = content.replace(/\/\/\s*@ts-ignore(\s*\/\/[^\n]*)?\n/g, '');
  
  // Remove @ts-nocheck comments that are no longer needed (only in production code, not tests)
  if (!content.includes('test(') && !content.includes('describe(') && !content.includes('it(')) {
    updated = updated.replace(/\/\/\s*@ts-nocheck(\s*\/\/[^\n]*)?\n/g, '');
  }
  
  // Count how many were actually removed
  const removedCount = count - (updated.match(tsIgnorePattern) || []).length;
  
  return { content: updated, count: removedCount };
}

/**
 * Process a single file to fix imports and comments
 */
function processFile(filePath) {
  try {
    stats.filesScanned++;
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Apply fixes
    const { content: importsFixed, count: importsCount } = fixChakraImports(content);
    const { content: commentsFixed, count: commentsCount } = removeUnnecessaryTsIgnores(importsFixed);
    
    // Update stats
    stats.chakraImportsFixed += importsCount;
    stats.tsIgnoresRemoved += commentsCount;
    
    // Only write if changes were made
    if (content !== commentsFixed) {
      fs.writeFileSync(filePath, commentsFixed, 'utf8');
      stats.filesFixed++;
      console.log(`✅ Fixed ${relativePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main execution
async function main() {
  // Find all TypeScript files
  const typeScriptFiles = findTypeScriptFiles();
  console.log(`🔍 Found ${typeScriptFiles.length} TypeScript files to process`);
  
  // Process each file
  for (const filePath of typeScriptFiles) {
    processFile(filePath);
  }
  
  // Print summary
  console.log('\n📊 Script Execution Summary:');
  console.log(`Files scanned: ${stats.filesScanned}`);
  console.log(`Files fixed: ${stats.filesFixed}`);
  console.log(`Chakra imports fixed: ${stats.chakraImportsFixed}`);
  console.log(`@ts-ignore comments removed: ${stats.tsIgnoresRemoved}`);
  console.log(`Import statements added: ${stats.importStatementsAdded}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
});