const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Missing Imports Fix Script');

// Track modifications for reporting
const stats = {
  filesScanned: 0,
  filesFixed: 0,
  importsAdded: 0
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
 * Map Chakra component names to their module paths
 */
const chakraComponentModules = {
  // Layout components
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
  
  // Form components
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
  Switch: 'switch',
  
  // Data display
  Badge: 'badge',
  Table: 'table',
  Thead: 'table',
  Tbody: 'table',
  Tfoot: 'table',
  Tr: 'table',
  Th: 'table',
  Td: 'table',
  TableCaption: 'table',
  TableContainer: 'table',
  List: 'list',
  ListItem: 'list',
  ListIcon: 'list',
  OrderedList: 'list',
  UnorderedList: 'list',
  
  // Media
  Image: 'image',
  Avatar: 'avatar',
  AvatarBadge: 'avatar',
  AvatarGroup: 'avatar',
  
  // Feedback
  Alert: 'alert',
  AlertIcon: 'alert',
  AlertTitle: 'alert',
  AlertDescription: 'alert',
  Spinner: 'spinner',
  Progress: 'progress',
  
  // Navigation
  Breadcrumb: 'breadcrumb',
  BreadcrumbItem: 'breadcrumb',
  BreadcrumbLink: 'breadcrumb',
  BreadcrumbSeparator: 'breadcrumb',
  Link: 'link',
  
  // Disclosure
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
  
  // Overlay
  Modal: 'modal',
  ModalOverlay: 'modal',
  ModalContent: 'modal',
  ModalHeader: 'modal',
  ModalFooter: 'modal',
  ModalBody: 'modal',
  ModalCloseButton: 'modal',
  
  // Card components
  Card: 'card',
  CardHeader: 'card',
  CardBody: 'card',
  CardFooter: 'card',
  
  // Other
  Divider: 'divider',
  CloseButton: 'close-button'
};

/**
 * Find Components Used in JSX but not imported
 */
function findMissingImports(content) {
  const missingImports = new Set();
  
  // Find all JSX component usages
  const jsxComponentRegex = /<([A-Z][A-Za-z0-9]*)/g;
  let match;
  
  while ((match = jsxComponentRegex.exec(content)) !== null) {
    const componentName = match[1];
    
    // Check if it's a Chakra component
    if (chakraComponentModules[componentName]) {
      // Check if it's already imported
      const importRegex = new RegExp(`import\\s+{[^}]*?\\b${componentName}\\b[^}]*?}\\s+from\\s+(["'])(@chakra-ui\\/react|@\\/utils\\/chakra-compat|@chakra-ui\\/react\\/${chakraComponentModules[componentName]})\\1`, 'g');
      
      if (!importRegex.test(content)) {
        missingImports.add(componentName);
      }
    }
  }
  
  return Array.from(missingImports);
}

/**
 * Add missing imports to a file
 */
function addMissingImports(content, missingImports) {
  if (missingImports.length === 0) {
    return { content, changes: 0 };
  }
  
  let updated = content;
  let newImports = [];
  
  // Create import statements for each missing import
  missingImports.forEach(component => {
    const modulePath = chakraComponentModules[component];
    if (modulePath) {
      newImports.push(`import { ${component} } from '@chakra-ui/react/${modulePath}';`);
    }
  });
  
  // Add the new imports after the last import statement or at the top if no imports
  const lastImportIndex = updated.lastIndexOf('import ');
  if (lastImportIndex === -1) {
    // No imports, add at the top
    updated = newImports.join('\n') + '\n\n' + updated;
  } else {
    // Find the end of the last import statement
    const lastImportEndIndex = updated.indexOf(';', lastImportIndex) + 1;
    
    // Insert after the last import
    updated = 
      updated.substring(0, lastImportEndIndex) + 
      '\n' + newImports.join('\n') + 
      updated.substring(lastImportEndIndex);
  }
  
  return { content: updated, changes: newImports.length };
}

/**
 * Process a single file to fix missing imports
 */
function processFile(filePath) {
  try {
    stats.filesScanned++;
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Skip files that don't contain JSX
    if (!content.includes('</') && !content.includes('/>')) {
      return;
    }
    
    // Find missing imports
    const missingImports = findMissingImports(content);
    
    // Add missing imports
    const { content: updatedContent, changes } = addMissingImports(content, missingImports);
    
    // Update stats
    stats.importsAdded += changes;
    
    // Only write if changes were made
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      stats.filesFixed++;
      console.log(`✅ Added ${changes} imports to ${relativePath}`);
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
  console.log(`Imports added: ${stats.importsAdded}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
});