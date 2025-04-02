const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Duplicate Identifier Fix Script');

// Track modifications for reporting
const stats = {
  filesScanned: 0,
  filesFixed: 0,
  duplicateImportsFixed: 0,
  chakraCompatImportsRemoved: 0
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
 * Check if a file imports a specific component from multiple sources
 */
function hasDuplicateImports(content, component) {
  const directImportRegex = new RegExp(`import\\s+{[^}]*?\\b${component}\\b[^}]*?}\\s+from\\s+['"]@chakra-ui\\/react\\/`, 'g');
  const barrelImportRegex = new RegExp(`import\\s+{[^}]*?\\b${component}\\b[^}]*?}\\s+from\\s+['"]@chakra-ui\\/react['"]`, 'g');
  const compatImportRegex = new RegExp(`import\\s+{[^}]*?\\b${component}\\b[^}]*?}\\s+from\\s+['"]@\\/utils\\/chakra-compat['"]`, 'g');
  
  const directImports = (content.match(directImportRegex) || []).length;
  const barrelImports = (content.match(barrelImportRegex) || []).length;
  const compatImports = (content.match(compatImportRegex) || []).length;
  
  return (directImports + barrelImports + compatImports) > 1;
}

/**
 * Normalize Chakra UI imports in a file
 */
function normalizeChakraImports(content) {
  let updated = content;
  let changesCount = 0;
  
  // Common Chakra UI components
  const commonComponents = [
    'Box', 'Flex', 'Grid', 'Stack', 'HStack', 'VStack', 'Button', 'IconButton',
    'Text', 'Heading', 'FormControl', 'FormLabel', 'FormErrorMessage', 'FormHelperText',
    'Input', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Switch', 'Badge',
    'Card', 'CardHeader', 'CardBody', 'CardFooter', 'Image', 'Avatar', 'Spinner',
    'Alert', 'AlertIcon', 'AlertTitle', 'AlertDescription', 'Modal', 'ModalOverlay',
    'ModalContent', 'ModalHeader', 'ModalBody', 'ModalFooter', 'ModalCloseButton',
    'Tabs', 'TabList', 'Tab', 'TabPanels', 'TabPanel', 'Table', 'Thead', 'Tbody',
    'Tr', 'Th', 'Td', 'Link', 'Menu', 'MenuButton', 'MenuList', 'MenuItem'
  ];
  
  // For each component, check if it's imported from multiple sources
  commonComponents.forEach(component => {
    if (hasDuplicateImports(updated, component)) {
      // Remove from chakra-compat and barrel imports, keep only direct imports
      
      // Find direct imports
      const directImportRegex = new RegExp(`import\\s+{[^}]*?\\b${component}\\b[^}]*?}\\s+from\\s+['"]@chakra-ui\\/react\\/`, 'g');
      const hasDirectImport = directImportRegex.test(updated);
      
      if (hasDirectImport) {
        // Remove from barrel imports
        const barrelImportRegex = new RegExp(`import\\s+{([^}]*)}\\s+from\\s+['"]@chakra-ui\\/react['"]`, 'g');
        updated = updated.replace(barrelImportRegex, (match, importList) => {
          const imports = importList.split(',').map(i => i.trim());
          const filteredImports = imports.filter(i => {
            const importName = i.split(' as ')[0].trim();
            return importName !== component;
          });
          
          if (filteredImports.length === 0) {
            return ''; // Remove the entire import statement
          }
          
          return `import { ${filteredImports.join(', ')} } from '@chakra-ui/react'`;
        });
        
        // Remove from chakra-compat imports
        const compatImportRegex = new RegExp(`import\\s+{([^}]*)}\\s+from\\s+['"]@\\/utils\\/chakra-compat['"]`, 'g');
        updated = updated.replace(compatImportRegex, (match, importList) => {
          const imports = importList.split(',').map(i => i.trim());
          const filteredImports = imports.filter(i => {
            const importName = i.split(' as ')[0].trim();
            return importName !== component;
          });
          
          if (filteredImports.length === 0) {
            return ''; // Remove the entire import statement
          }
          
          return `import { ${filteredImports.join(', ')} } from '@/utils/chakra-compat'`;
        });
        
        changesCount++;
      } else {
        // No direct import, prefer chakra-compat imports over barrel imports
        const compatImportRegex = new RegExp(`import\\s+{[^}]*?\\b${component}\\b[^}]*?}\\s+from\\s+['"]@\\/utils\\/chakra-compat['"]`, 'g');
        const hasCompatImport = compatImportRegex.test(updated);
        
        if (hasCompatImport) {
          // Remove from barrel imports
          const barrelImportRegex = new RegExp(`import\\s+{([^}]*)}\\s+from\\s+['"]@chakra-ui\\/react['"]`, 'g');
          updated = updated.replace(barrelImportRegex, (match, importList) => {
            const imports = importList.split(',').map(i => i.trim());
            const filteredImports = imports.filter(i => {
              const importName = i.split(' as ')[0].trim();
              return importName !== component;
            });
            
            if (filteredImports.length === 0) {
              return ''; // Remove the entire import statement
            }
            
            return `import { ${filteredImports.join(', ')} } from '@chakra-ui/react'`;
          });
          
          changesCount++;
        }
      }
    }
  });
  
  // Remove empty import statements
  updated = updated.replace(/import\s+{\s*}\s+from\s+['"][^'"]+['"]/g, '');
  
  // Remove consecutive blank lines created by removed imports
  updated = updated.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return { content: updated, changes: changesCount };
}

/**
 * Process a single file to fix duplicate imports
 */
function processFile(filePath) {
  try {
    stats.filesScanned++;
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Skip files that don't contain Chakra UI imports
    if (!content.includes('@chakra-ui/react') && !content.includes('@/utils/chakra-compat')) {
      return;
    }
    
    // Apply fixes
    const { content: fixedContent, changes } = normalizeChakraImports(content);
    
    // Update stats
    stats.duplicateImportsFixed += changes;
    
    // Only write if changes were made
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      stats.filesFixed++;
      console.log(`✅ Fixed duplicate imports in ${relativePath}`);
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
  console.log(`Duplicate imports fixed: ${stats.duplicateImportsFixed}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
});