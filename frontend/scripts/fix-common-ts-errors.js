const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Common TypeScript Errors Fix Script');

// Helper function to get all TypeScript files in a directory (recursive)
function getTypeScriptFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      fileList = getTypeScriptFiles(filePath, fileList);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Helper function to update file content with a regex pattern
function updateFileContent(filePath, pattern, replacement) {
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(pattern, replacement);
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    return true;
  }
  
  return false;
}

// Fix components that need imports from chakra-compat
function fixChakraComponentImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file already imports from @/utils/chakra-compat
  const hasChakraCompatImport = /import [^;]*from ['"]@\/utils\/chakra-compat['"]/g.test(content);
  
  // Common Chakra components that need to be properly imported
  const chakraComponents = [
    'Box', 'Button', 'Flex', 'Text', 'Heading', 'VStack', 'HStack', 'Stack',
    'FormControl', 'FormLabel', 'FormErrorMessage', 'FormHelperText',
    'Input', 'InputGroup', 'InputLeftElement', 'InputRightElement',
    'Table', 'Thead', 'Tbody', 'Tr', 'Th', 'Td', 'TableContainer',
    'Card', 'CardHeader', 'CardBody', 'CardFooter',
    'Modal', 'ModalOverlay', 'ModalContent', 'ModalHeader', 'ModalBody', 'ModalFooter', 'ModalCloseButton',
    'Tabs', 'TabList', 'Tab', 'TabPanel', 'TabPanels',
    'Alert', 'AlertIcon', 'AlertTitle', 'AlertDescription',
    'Checkbox', 'Radio', 'RadioGroup', 'Select', 'Textarea',
    'Spinner', 'Progress', 'Skeleton', 'SkeletonText',
    'Badge', 'Tag', 'Avatar', 'AvatarBadge',
    'Menu', 'MenuButton', 'MenuList', 'MenuItem',
    'Popover', 'PopoverTrigger', 'PopoverContent', 'PopoverHeader', 'PopoverBody', 'PopoverFooter',
    'Tooltip', 'useToast', 'useDisclosure', 'useColorMode'
  ];
  
  // Look for components that are used but not imported
  const usedComponents = new Set();
  
  // Use a regular expression to find JSX components
  const jsxComponentRegex = /<([A-Z][a-zA-Z]*)/g;
  let match;
  
  while ((match = jsxComponentRegex.exec(content)) !== null) {
    const component = match[1];
    if (chakraComponents.includes(component)) {
      usedComponents.add(component);
    }
  }
  
  // Also look for hook usage
  const hooksRegex = /(use[A-Z][a-zA-Z]*)\(/g;
  while ((match = hooksRegex.exec(content)) !== null) {
    const hook = match[1];
    if (chakraComponents.includes(hook)) {
      usedComponents.add(hook);
    }
  }
  
  // Don't make changes if no Chakra components are used or if they're already imported
  if (usedComponents.size === 0 || (hasChakraCompatImport && content.includes('chakra-compat'))) {
    return false;
  }
  
  // Generate the import statement if not already present
  let newContent = content;
  
  if (!hasChakraCompatImport) {
    // Find a good place to insert the import
    const importStatements = content.match(/import [^;]*;/g) || [];
    const lastImportIndex = importStatements.length > 0 
      ? content.lastIndexOf(importStatements[importStatements.length - 1]) + importStatements[importStatements.length - 1].length
      : 0;
    
    // Create import statement
    const componentsArray = Array.from(usedComponents).sort();
    const importStatement = `import { ${componentsArray.join(', ')} } from '@/utils/chakra-compat';\n`;
    
    // Insert the import statement after the last import
    newContent = content.substring(0, lastImportIndex) + 
                 '\n' + importStatement + 
                 content.substring(lastImportIndex);
    
    fs.writeFileSync(filePath, newContent);
    return true;
  }
  
  return false;
}

// Fix unnecessary @ts-nocheck comments
function removeUnnecessaryIgnores(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const pattern = /\/\/ @ts-nocheck.*[\r\n]+/g;
  
  if (pattern.test(content)) {
    const newContent = content.replace(pattern, '');
    fs.writeFileSync(filePath, newContent);
    return true;
  }
  
  return false;
}

// Fix files with missing JSX imports
function fixJsxImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file uses JSX but doesn't import React
  if (content.includes('<') && content.includes('/>') && !content.includes('import React')) {
    // Find a good place to insert the import
    const importStatements = content.match(/import [^;]*;/g) || [];
    const firstImportIndex = importStatements.length > 0 
      ? content.indexOf(importStatements[0])
      : 0;
    
    // Create React import if needed
    const importStatement = `import React from 'react';\n`;
    
    // Insert the import statement before the first import
    const newContent = content.substring(0, firstImportIndex) + 
                 importStatement + 
                 content.substring(firstImportIndex);
    
    fs.writeFileSync(filePath, newContent);
    return true;
  }
  
  return false;
}

// Fix props interface names to follow convention
function fixPropsInterfaces(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Get component name from filename
  const fileName = path.basename(filePath, path.extname(filePath));
  const componentName = fileName.replace(/\.(tsx|ts)$/, '');
  
  // Check if file has a component but no proper interface
  const hasComponent = content.includes(`function ${componentName}`) || 
                       content.includes(`const ${componentName}`);
  
  const hasPropsInterface = content.includes(`interface ${componentName}Props`);
  
  if (hasComponent && !hasPropsInterface) {
    // Find all interfaces
    const interfaceRegex = /interface ([a-zA-Z0-9_]+)/g;
    let match;
    let foundProps = false;
    
    while ((match = interfaceRegex.exec(content)) !== null) {
      const interfaceName = match[1];
      if (interfaceName.endsWith('Props')) {
        foundProps = true;
        break;
      }
    }
    
    if (!foundProps) {
      // Add a basic props interface
      const propsInterface = `\ninterface ${componentName}Props {}\n`;
      
      // Find a good place to insert the interface
      const importStatements = content.match(/import [^;]*;/g) || [];
      const lastImportIndex = importStatements.length > 0 
        ? content.lastIndexOf(importStatements[importStatements.length - 1]) + importStatements[importStatements.length - 1].length
        : 0;
      
      // Insert the interface after the last import
      const newContent = content.substring(0, lastImportIndex) + 
                   '\n' + propsInterface + 
                   content.substring(lastImportIndex);
      
      fs.writeFileSync(filePath, newContent);
      return true;
    }
  }
  
  return false;
}

// Fix implicit anys in functions
function fixImplicitAnys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Patterns for common implicit anys
  let updatedContent = content;
  
  // Fix arrow function parameters without types
  const arrowFuncRegex = /\(([^):{]*?)\) =>/g;
  updatedContent = updatedContent.replace(arrowFuncRegex, (match, params) => {
    // Skip if params are already typed or empty
    if (params.trim() === '' || params.includes(':')) {
      return match;
    }
    
    // Add types to each parameter
    const typedParams = params.split(',')
      .map(param => param.trim())
      .map(param => `${param}: any`)
      .join(', ');
    
    return `(${typedParams}) =>`;
  });
  
  // Fix event handlers
  const eventHandlerRegex = /on(Change|Click|Submit|Input|Blur|Focus)\s*=\s*\{?\s*\(\s*([^):]*?)\s*\)/g;
  updatedContent = updatedContent.replace(eventHandlerRegex, (match, eventType, param) => {
    // Skip if params are already typed or empty
    if (param.trim() === '' || param.includes(':')) {
      return match;
    }
    
    // Add event type based on the event name
    let eventTypeName = 'any';
    if (eventType === 'Change') eventTypeName = 'React.ChangeEvent<HTMLInputElement>';
    else if (eventType === 'Click') eventTypeName = 'React.MouseEvent';
    else if (eventType === 'Submit') eventTypeName = 'React.FormEvent';
    else if (eventType === 'Input') eventTypeName = 'React.FormEvent<HTMLInputElement>';
    else if (eventType === 'Blur' || eventType === 'Focus') eventTypeName = 'React.FocusEvent';
    
    return `on${eventType}={(${param}: ${eventTypeName})`;
  });
  
  if (updatedContent !== content) {
    fs.writeFileSync(filePath, updatedContent);
    return true;
  }
  
  return false;
}

// Main function to fix all TypeScript errors
async function fixTypeScriptErrors() {
  // Get the list of all TypeScript files
  const sourceDir = path.resolve(__dirname, '../src');
  const files = getTypeScriptFiles(sourceDir);
  
  console.log(`📁 Found ${files.length} TypeScript files to analyze`);
  
  let chakraFixCount = 0;
  let ignoreFixCount = 0;
  let jsxImportFixCount = 0;
  let propsInterfaceFixCount = 0;
  let implicitAnyFixCount = 0;
  
  // Process each file
  for (const filePath of files) {
    const shortPath = filePath.replace(path.resolve(__dirname, '..') + '/', '');
    
    // Only fix files with TypeScript errors
    // const hasErrors = checkForErrors(filePath);
    // if (!hasErrors) continue;
    
    // Apply fixes in order
    if (fixChakraComponentImports(filePath)) {
      chakraFixCount++;
      console.log(`✅ Fixed Chakra component imports in ${shortPath}`);
    }
    
    if (removeUnnecessaryIgnores(filePath)) {
      ignoreFixCount++;
      console.log(`✅ Removed unnecessary @ts-nocheck in ${shortPath}`);
    }
    
    if (fixJsxImports(filePath)) {
      jsxImportFixCount++;
      console.log(`✅ Added React import for JSX in ${shortPath}`);
    }
    
    if (fixPropsInterfaces(filePath)) {
      propsInterfaceFixCount++;
      console.log(`✅ Added missing Props interface in ${shortPath}`);
    }
    
    if (fixImplicitAnys(filePath)) {
      implicitAnyFixCount++;
      console.log(`✅ Fixed implicit 'any' types in ${shortPath}`);
    }
  }
  
  console.log('\n📊 Fix Summary:');
  console.log(`Chakra Component Imports: ${chakraFixCount} files`);
  console.log(`@ts-nocheck Removal: ${ignoreFixCount} files`);
  console.log(`JSX React Imports: ${jsxImportFixCount} files`);
  console.log(`Props Interfaces: ${propsInterfaceFixCount} files`);
  console.log(`Implicit 'any' Types: ${implicitAnyFixCount} files`);
  
  const totalFixed = chakraFixCount + ignoreFixCount + jsxImportFixCount + 
                    propsInterfaceFixCount + implicitAnyFixCount;
  
  console.log(`\n🎉 Total: Fixed issues in ${totalFixed} files`);
}

// Run the error fixer function
fixTypeScriptErrors().catch(error => {
  console.error('❌ Error fixing TypeScript errors:', error);
});