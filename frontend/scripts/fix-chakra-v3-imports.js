/**
 * Fix Chakra UI V3 imports
 * 
 * This script fixes imports for Chakra UI V3 by standardizing on the direct import pattern.
 * Chakra UI V3 recommends direct imports instead of barrel imports to reduce bundle size.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Map of components to their direct import paths
const componentImportMap = {
  // Layout components
  Box: '@chakra-ui/layout',
  Flex: '@chakra-ui/layout',
  Grid: '@chakra-ui/layout',
  GridItem: '@chakra-ui/layout',
  Center: '@chakra-ui/layout',
  Container: '@chakra-ui/layout',
  Stack: '@chakra-ui/layout',
  HStack: '@chakra-ui/layout',
  VStack: '@chakra-ui/layout',
  SimpleGrid: '@chakra-ui/layout',
  Wrap: '@chakra-ui/layout',
  WrapItem: '@chakra-ui/layout',
  Spacer: '@chakra-ui/layout',
  
  // Typography components
  Text: '@chakra-ui/layout',
  Heading: '@chakra-ui/layout',
  
  // Button components
  Button: '@chakra-ui/button',
  IconButton: '@chakra-ui/button',
  ButtonGroup: '@chakra-ui/button',
  
  // Form components
  FormControl: '@chakra-ui/form-control',
  FormLabel: '@chakra-ui/form-control',
  FormErrorMessage: '@chakra-ui/form-control',
  FormHelperText: '@chakra-ui/form-control',
  Input: '@chakra-ui/input',
  InputGroup: '@chakra-ui/input',
  InputLeftElement: '@chakra-ui/input',
  InputRightElement: '@chakra-ui/input',
  InputLeftAddon: '@chakra-ui/input',
  InputRightAddon: '@chakra-ui/input',
  Checkbox: '@chakra-ui/checkbox',
  CheckboxGroup: '@chakra-ui/checkbox',
  
  // Overlay components
  Modal: '@chakra-ui/modal',
  ModalOverlay: '@chakra-ui/modal',
  ModalContent: '@chakra-ui/modal',
  ModalHeader: '@chakra-ui/modal',
  ModalFooter: '@chakra-ui/modal',
  ModalBody: '@chakra-ui/modal',
  ModalCloseButton: '@chakra-ui/modal',
  
  // Data display components
  Badge: '@chakra-ui/layout',
  Card: '@chakra-ui/card',
  CardHeader: '@chakra-ui/card',
  CardBody: '@chakra-ui/card',
  CardFooter: '@chakra-ui/card',
  
  // Other components
  Alert: '@chakra-ui/alert',
  AlertIcon: '@chakra-ui/alert',
  AlertTitle: '@chakra-ui/alert',
  AlertDescription: '@chakra-ui/alert',
  Spinner: '@chakra-ui/spinner',
  CloseButton: '@chakra-ui/close-button',
  Divider: '@chakra-ui/layout',
  
  // Hooks
  useColorMode: '@chakra-ui/color-mode',
  useColorModeValue: '@chakra-ui/color-mode',
  useDisclosure: '@chakra-ui/hooks',
  useToast: '@chakra-ui/toast',
  
  // Tabs components
  Tabs: '@chakra-ui/tabs',
  TabList: '@chakra-ui/tabs',
  Tab: '@chakra-ui/tabs',
  TabPanels: '@chakra-ui/tabs',
  TabPanel: '@chakra-ui/tabs',
};

// Find all TypeScript/TSX files
function getTypeScriptFiles() {
  return execSync('find src -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
}

// Fix imports in a file
function fixChakraImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let importChanges = 0;
    
    // Find barrel imports from @chakra-ui/react
    const barrelImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@chakra-ui\/react['"]/g;
    const barrelImportMatches = [...content.matchAll(barrelImportRegex)];
    
    // Process each barrel import
    for (const match of barrelImportMatches) {
      const importString = match[0];
      const importedComponents = match[1].split(',').map(comp => comp.trim());
      
      // Group components by their import module
      const importGroups = {};
      for (const component of importedComponents) {
        // Extract the component name without extra stuff like 'as X'
        const componentName = component.split(' ')[0];
        
        // Skip if empty or not found
        if (!componentName || !componentImportMap[componentName]) continue;
        
        const modulePath = componentImportMap[componentName];
        if (!importGroups[modulePath]) {
          importGroups[modulePath] = [];
        }
        importGroups[modulePath].push(component);
      }
      
      // Create new import statements
      const newImports = Object.entries(importGroups).map(([modulePath, components]) => {
        return `import { ${components.join(', ')} } from '${modulePath}';`;
      }).join('\n');
      
      // Replace the old import with the new ones
      if (newImports) {
        updatedContent = updatedContent.replace(importString, newImports);
        importChanges++;
      }
    }
    
    // Fix circular imports by converting to stubs if needed
    const hasCircularDependency = content.includes('@/utils/chakra-compat') && 
                                 (content.includes('useDisclosure') || 
                                  content.includes('useColorMode') || 
                                  content.includes('Modal') ||
                                  content.includes('CloseButton'));
    
    if (hasCircularDependency) {
      // Add import for stubs
      if (!updatedContent.includes('@/components/stubs/ChakraStubs')) {
        updatedContent = updatedContent.replace(
          /import {([^}]+)} from ['"]@\/utils\/chakra-compat['"]/g,
          (match, importedStuff) => {
            const components = importedStuff.split(',').map(comp => comp.trim());
            const normalComponents = components.filter(c => 
              !c.includes('useDisclosure') && 
              !c.includes('useColorMode') && 
              !c.includes('Modal') && 
              !c.includes('CloseButton')
            );
            
            const stubComponents = components.filter(c => 
              c.includes('useDisclosure') || 
              c.includes('useColorMode') || 
              c.includes('Modal') || 
              c.includes('CloseButton')
            );
            
            if (stubComponents.length === 0) return match;
            
            let result = '';
            if (normalComponents.length > 0) {
              result += `import { ${normalComponents.join(', ')} } from '@/utils/chakra-compat';\n`;
            }
            if (stubComponents.length > 0) {
              result += `import { ${stubComponents.join(', ')} } from '@/components/stubs/ChakraStubs';`;
            }
            return result;
          }
        );
        importChanges++;
      }
    }
    
    // Write the updated content back if changes were made
    if (importChanges > 0) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Fixed imports in ${filePath} (${importChanges} changes)`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Main function to fix all files
function fixAllChakraImports() {
  console.log('🔄 Fixing Chakra UI V3 imports...');
  
  const files = getTypeScriptFiles();
  let totalFilesUpdated = 0;
  
  for (const file of files) {
    const wasUpdated = fixChakraImportsInFile(file);
    if (wasUpdated) {
      totalFilesUpdated++;
    }
  }
  
  console.log(`\n📊 Summary: Updated ${totalFilesUpdated} files with fixed imports`);
}

// Run the script
fixAllChakraImports();