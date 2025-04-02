const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Chakra UI V3 Pattern Enforcement Script');

// Track modifications for reporting
const stats = {
  filesScanned: 0,
  filesFixed: 0,
  importPatternsFixed: 0,
  propPatternsFixed: 0,
  responsivePropsFixed: 0
};

/**
 * Find all React component files in the project
 */
function findComponentFiles() {
  try {
    // Use git to list all TypeScript and JavaScript React files
    const output = execSync('git ls-files "*.tsx" "*.jsx"', { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    // Fallback to manual file search if git command fails
    console.log('⚠️ Git command failed, falling back to manual file search');
    return findFilesRecursively('src', /\.(tsx|jsx)$/);
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
 * Fix Chakra UI barrel imports to use direct imports
 */
function fixBarrelImports(content) {
  let updated = content;
  let changesCount = 0;
  
  // Find barrel imports from Chakra UI
  const chakraBarrelImportRegex = /import\s+{([^}]*)}\s+from\s+['"]@chakra-ui\/react['"]/g;
  const chakraBarrelImports = content.match(chakraBarrelImportRegex);
  
  if (chakraBarrelImports) {
    for (const importStatement of chakraBarrelImports) {
      // Extract the components being imported
      const componentsMatch = importStatement.match(/import\s+{([^}]*)}\s+from/);
      
      if (componentsMatch && componentsMatch[1]) {
        const components = componentsMatch[1].split(',').map(comp => comp.trim());
        const directImports = [];
        
        // Map each component to its direct import
        for (const component of components) {
          // Skip empty components (can happen with trailing commas)
          if (!component) continue;
          
          // Handle aliased imports like "Icon as ChakraIcon"
          const [compName, alias] = component.split(' as ').map(part => part.trim());
          
          // Map component to module path (simplified mapping)
          const modulePath = getChakraModulePath(compName);
          
          // Create direct import statement
          if (alias) {
            directImports.push(`import { ${compName} as ${alias} } from '@chakra-ui/react/${modulePath}';`);
          } else {
            directImports.push(`import { ${compName} } from '@chakra-ui/react/${modulePath}';`);
          }
        }
        
        // Replace the barrel import with direct imports
        if (directImports.length > 0) {
          updated = updated.replace(importStatement, directImports.join('\n'));
          changesCount += directImports.length;
        }
      }
    }
  }
  
  return { content: updated, changes: changesCount };
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
 * Fix Chakra UI prop patterns to comply with V3
 */
function fixPropPatterns(content) {
  let updated = content;
  let changesCount = 0;
  
  // Fix 'is'-prefixed props
  const propMappings = {
    'isLoading': 'loading',
    'isDisabled': 'disabled',
    'isChecked': 'checked',
    'isInvalid': 'invalid',
    'isReadOnly': 'readOnly',
    'isOpen': 'open',
    'isActive': 'active',
    'isFocused': 'focused',
    'isAttached': 'attached',
    'spacing': 'gap'
  };
  
  // Process each prop mapping
  for (const [oldProp, newProp] of Object.entries(propMappings)) {
    // Matches JSX props with and without values
    // e.g., isLoading={true}, isLoading
    const propRegex = new RegExp(`${oldProp}(=\\{[^}]*\\}|="[^"]*"|='[^']*'|(?=[\\s/>]))`, 'g');
    
    // Replace props
    const updatedWithProps = updated.replace(propRegex, (match) => {
      changesCount++;
      // If the match has a value assignment, keep it, otherwise it's a boolean prop
      const hasValue = match.includes('=');
      return hasValue ? `${newProp}${match.slice(oldProp.length)}` : newProp;
    });
    
    if (updatedWithProps !== updated) {
      updated = updatedWithProps;
    }
  }
  
  return { content: updated, changes: changesCount };
}

/**
 * Fix responsive props to have proper type assertions
 */
function fixResponsiveProps(content) {
  let updated = content;
  let changesCount = 0;
  
  // Find responsive prop values without type assertions
  const responsivePropRegex = /(\w+)=\{\{([^}]+)\}\}/g;
  let match;
  
  // Collect all responsive prop expressions
  const responsiveProps = [];
  
  while ((match = responsivePropRegex.exec(content)) !== null) {
    const [fullMatch, propName, propValue] = match;
    
    // Check if it's a common responsive prop that needs type assertion
    if (
      ['templateColumns', 'direction', 'gap', 'width', 'height', 'fontSize', 'margin', 'padding', 'm', 'p'].includes(propName) &&
      (propValue.includes('base:') || propValue.includes('sm:') || propValue.includes('md:') || propValue.includes('lg:'))
    ) {
      // Check if it doesn't already have a type assertion
      if (!fullMatch.includes(' as ')) {
        responsiveProps.push({ 
          fullMatch, 
          propName, 
          propValue,
          index: match.index 
        });
      }
    }
  }
  
  // Apply type assertions in reverse order (to avoid offset issues)
  for (const prop of responsiveProps.sort((a, b) => b.index - a.index)) {
    // Determine type based on prop content
    let typeAssertion = 'ResponsiveValue<string>';
    
    // If prop value contains numbers, use a more appropriate type
    if (/\d+/.test(prop.propValue) && !prop.propValue.includes('"')) {
      typeAssertion = 'ResponsiveValue<number>';
    } else if (prop.propValue.includes('px') || prop.propValue.includes('rem') || prop.propValue.includes('em')) {
      typeAssertion = 'ResponsiveValue<string>';
    }
    
    // Special case for templateColumns
    if (prop.propName === 'templateColumns') {
      typeAssertion = 'ResponsiveValue<string>';
    }
    
    // Add type assertion
    const replacement = `${prop.propName}={{${prop.propValue}} as ${typeAssertion}}`;
    updated = updated.slice(0, prop.index) + replacement + updated.slice(prop.index + prop.fullMatch.length);
    changesCount++;
  }
  
  return { content: updated, changes: changesCount };
}

/**
 * Add ResponsiveValue import if needed
 */
function ensureResponsiveValueImport(content, filePath) {
  // If no ResponsiveValue is used in the file, return original content
  if (!content.includes('ResponsiveValue<')) {
    return content;
  }
  
  // If ResponsiveValue import already exists, return original content
  if (content.includes('import { ResponsiveValue }')) {
    return content;
  }
  
  // Calculate relative path to utils directory
  const fileDir = path.dirname(filePath);
  const utilsDir = path.resolve(__dirname, '../src/utils');
  let relativePath = path.relative(fileDir, utilsDir);
  
  // Ensure path starts with ./ or ../
  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`;
  }
  
  // Replace backslashes with forward slashes for import statements
  relativePath = relativePath.replace(/\\/g, '/');
  
  // Add import at the top of the file after other imports
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  // Insert after the last import or at the beginning if no imports
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, `import { ResponsiveValue } from '${relativePath}/chakra-utils';`);
  } else {
    lines.unshift(`import { ResponsiveValue } from '${relativePath}/chakra-utils';`);
  }
  
  return lines.join('\n');
}

/**
 * Process a single file to fix Chakra UI patterns
 */
function processFile(filePath) {
  try {
    stats.filesScanned++;
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Apply fixes
    const { content: contentWithFixedImports, changes: importChanges } = fixBarrelImports(content);
    const { content: contentWithFixedProps, changes: propChanges } = fixPropPatterns(contentWithFixedImports);
    const { content: contentWithFixedResponsiveProps, changes: responsiveChanges } = fixResponsiveProps(contentWithFixedProps);
    
    // Add ResponsiveValue import if needed
    const finalContent = ensureResponsiveValueImport(contentWithFixedResponsiveProps, filePath);
    
    // Update stats
    stats.importPatternsFixed += importChanges;
    stats.propPatternsFixed += propChanges;
    stats.responsivePropsFixed += responsiveChanges;
    
    // Only write if changes were made
    if (content !== finalContent) {
      fs.writeFileSync(filePath, finalContent, 'utf8');
      stats.filesFixed++;
      console.log(`✅ Fixed ${relativePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main execution
async function main() {
  // Find all component files
  const componentFiles = findComponentFiles();
  console.log(`🔍 Found ${componentFiles.length} component files to process`);
  
  // Process each file
  for (const filePath of componentFiles) {
    processFile(filePath);
  }
  
  // Print summary
  console.log('\n📊 Script Execution Summary:');
  console.log(`Files scanned: ${stats.filesScanned}`);
  console.log(`Files fixed: ${stats.filesFixed}`);
  console.log(`Import patterns fixed: ${stats.importPatternsFixed}`);
  console.log(`Prop patterns fixed: ${stats.propPatternsFixed}`);
  console.log(`Responsive props fixed: ${stats.responsivePropsFixed}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
});