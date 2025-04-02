const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Component Interface Update Script');

// Track modifications for reporting
const stats = {
  filesScanned: 0,
  filesFixed: 0,
  interfacesAdded: 0,
  interfacesUpdated: 0,
  responsivePropsTyped: 0
};

/**
 * Find all React component files in the project
 */
function findComponentFiles() {
  try {
    // Use git to list all TypeScript React files
    const output = execSync('git ls-files "*.tsx"', { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    // Fallback to manual file search if git command fails
    console.log('⚠️ Git command failed, falling back to manual file search');
    return findFilesRecursively('src', /\.tsx$/);
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
 * Check if a file contains a functional React component
 */
function containsFunctionalComponent(content, fileName) {
  // Check for component function declaration
  if (content.match(/export\s+function\s+(\w+)\s*\(/)) {
    return true;
  }
  
  // Check for component arrow function declaration
  if (content.match(/export\s+const\s+(\w+)\s*=\s*\(.*\)\s*=>/)) {
    return true;
  }
  
  // Extract component name from filename
  const componentName = path.basename(fileName, path.extname(fileName));
  
  // Check if the file exports a component with the same name as the file
  if (content.includes(`export function ${componentName}`) ||
      content.includes(`export const ${componentName} =`)) {
    return true;
  }
  
  return false;
}

/**
 * Extract component name from a file's content
 */
function extractComponentName(content, fileName) {
  // Try to extract component name from export declaration
  const exportMatch = content.match(/export\s+function\s+(\w+)\s*\(/) ||
                      content.match(/export\s+const\s+(\w+)\s*=\s*\(.*\)\s*=>/);
  
  if (exportMatch && exportMatch[1]) {
    return exportMatch[1];
  }
  
  // Use filename as fallback
  return path.basename(fileName, path.extname(fileName));
}

/**
 * Check if the component already has a props interface
 */
function hasPropsInterface(content, componentName) {
  // Look for interfaces related to the component
  const interfacePattern = new RegExp(`interface\\s+${componentName}Props\\s*\\{`, 'g');
  const typePattern = new RegExp(`type\\s+${componentName}Props\\s*=`, 'g');
  
  return interfacePattern.test(content) || typePattern.test(content);
}

/**
 * Extract props used by the component
 */
function extractComponentProps(content, componentName) {
  const props = new Set();
  
  // Look for component parameter destructuring
  const funcMatch = content.match(new RegExp(
    `(export\\s+)?function\\s+${componentName}\\s*\\(\\s*\\{([^}]*)\\}\\s*\\)`, 's'
  ));
  
  const arrowMatch = content.match(new RegExp(
    `(export\\s+)?const\\s+${componentName}\\s*=\\s*\\(\\s*\\{([^}]*)\\}\\s*\\)`, 's'
  ));
  
  const propsStr = (funcMatch && funcMatch[2]) || (arrowMatch && arrowMatch[2]) || '';
  
  // Extract props from destructuring
  propsStr.split(',').forEach(prop => {
    const trimmed = prop.trim();
    if (trimmed) {
      // Handle renaming destructuring patterns: { someProp: renamedProp }
      const propParts = trimmed.split(':');
      props.add(propParts[0].trim());
    }
  });
  
  // Scan for props used in JSX
  const jsxProps = new Set();
  
  // Look for prop usage: <Component propName={...} or propName="..."
  const propRegex = /<\w+\s+([^>]+)>/g;
  let propMatch;
  
  while ((propMatch = propRegex.exec(content)) !== null) {
    const propsText = propMatch[1];
    
    // Extract individual props
    const propNameRegex = /(\w+)=\{|\w+="/g;
    let propNameMatch;
    
    while ((propNameMatch = propNameRegex.exec(propsText)) !== null) {
      if (propNameMatch[1]) {
        jsxProps.add(propNameMatch[1]);
      }
    }
  }
  
  // Return both destructured props and props found in JSX
  return {
    destructuredProps: Array.from(props),
    jsxProps: Array.from(jsxProps)
  };
}

/**
 * Analyze component content for responsive props usage
 */
function analyzeResponsiveProps(content) {
  const responsiveProps = new Set();
  
  // Look for responsive prop values: property={{base: ..., md: ...}}
  const responsivePropRegex = /(\w+)=\{\{[^}]*base:[^}]*\}\}/g;
  let match;
  
  while ((match = responsivePropRegex.exec(content)) !== null) {
    const propName = match[1];
    responsiveProps.add(propName);
  }
  
  return Array.from(responsiveProps);
}

/**
 * Generate a props interface for a component
 */
function generatePropsInterface(componentName, propsData, responsiveProps) {
  // Combine all unique props
  const allProps = new Set([
    ...propsData.destructuredProps,
    ...propsData.jsxProps
  ]);
  
  // Common props that often need specific typing
  const propTypes = {
    // Event handlers
    onClick: '() => void',
    onChange: '(event: React.ChangeEvent<HTMLInputElement>) => void',
    onSubmit: '(data: any) => void',
    
    // Children and content
    children: 'React.ReactNode',
    
    // Common data props
    data: 'any', // Use a more specific type in real code
    items: 'any[]', // Use a more specific type in real code
    
    // UI state props
    loading: 'boolean',
    disabled: 'boolean',
    open: 'boolean',
    checked: 'boolean',
    
    // Style props
    className: 'string',
    style: 'React.CSSProperties',
    
    // Responsive props
    ...Object.fromEntries(
      responsiveProps.map(prop => {
        if (['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'].includes(prop)) {
          return [prop, 'ResponsiveValue<string | number>'];
        } else if (['fontSize', 'lineHeight', 'letterSpacing', 'fontWeight'].includes(prop)) {
          return [prop, 'ResponsiveValue<string | number>'];
        } else if (['margin', 'padding', 'm', 'p', 'mt', 'mb', 'ml', 'mr', 'mx', 'my', 'pt', 'pb', 'pl', 'pr', 'px', 'py'].includes(prop)) {
          return [prop, 'ResponsiveValue<string | number>'];
        } else if (['templateColumns', 'templateRows', 'templateAreas'].includes(prop)) {
          return [prop, 'ResponsiveValue<string>'];
        } else if (['gap', 'rowGap', 'columnGap'].includes(prop)) {
          return [prop, 'ResponsiveValue<string | number>'];
        } else if (['direction', 'justifyContent', 'alignItems', 'flexDirection'].includes(prop)) {
          return [prop, 'ResponsiveValue<string>'];
        } else {
          return [prop, 'ResponsiveValue<any>']; // Generic responsive type
        }
      })
    )
  };
  
  // Generate interface content
  const interfaceProps = Array.from(allProps).map(prop => {
    const type = propTypes[prop] || 'any'; // Default to 'any' if no specific type
    return `  ${prop}?: ${type};`;
  });
  
  // Add common props that might not be directly used but are expected
  if (!interfaceProps.some(p => p.startsWith('  className'))) {
    interfaceProps.push('  className?: string;');
  }
  
  // React.HTMLAttributes for div-like components
  const includeHtmlAttributes = allProps.has('className') || 
                               allProps.has('style') || 
                               responsiveProps.length > 0;
                               
  if (includeHtmlAttributes) {
    return `interface ${componentName}Props extends React.HTMLAttributes<HTMLDivElement> {
${interfaceProps.join('\n')}
}`;
  } else {
    return `interface ${componentName}Props {
${interfaceProps.join('\n')}
}`;
  }
}

/**
 * Update or create a props interface for a component
 */
function updateComponentInterface(content, componentName, propsData, responsiveProps) {
  // Check if an interface already exists
  if (hasPropsInterface(content, componentName)) {
    // Update existing interface
    return updateExistingInterface(content, componentName, responsiveProps);
  } else {
    // Create new interface
    const newInterface = generatePropsInterface(componentName, propsData, responsiveProps);
    return addNewInterface(content, componentName, newInterface);
  }
}

/**
 * Update an existing props interface
 */
function updateExistingInterface(content, componentName, responsiveProps) {
  // Find the interface in the content
  const interfaceRegex = new RegExp(`(interface\\s+${componentName}Props\\s*\\{[^\\}]*\\})`, 'gs');
  const interfaceMatch = content.match(interfaceRegex);
  
  if (!interfaceMatch) {
    // Interface not found, don't modify
    return { content, updated: false };
  }
  
  let updatedContent = content;
  let updated = false;
  
  // Update responsive props in the interface
  responsiveProps.forEach(prop => {
    // Check if the prop already exists in the interface
    const propRegex = new RegExp(`(\\s+${prop}\\?:\\s*)[^;\\n]+`, 'g');
    const propMatch = updatedContent.match(propRegex);
    
    if (propMatch) {
      // Only update if not already typed as ResponsiveValue
      if (!propMatch[0].includes('ResponsiveValue')) {
        let typeAnnotation = 'ResponsiveValue<any>';
        
        // Choose appropriate type based on prop name
        if (['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'].includes(prop)) {
          typeAnnotation = 'ResponsiveValue<string | number>';
        } else if (['templateColumns', 'templateRows', 'templateAreas'].includes(prop)) {
          typeAnnotation = 'ResponsiveValue<string>';
        } else if (['gap', 'rowGap', 'columnGap'].includes(prop)) {
          typeAnnotation = 'ResponsiveValue<string | number>';
        } else if (['direction', 'justifyContent', 'alignItems', 'flexDirection'].includes(prop)) {
          typeAnnotation = 'ResponsiveValue<string>';
        }
        
        // Replace prop type
        updatedContent = updatedContent.replace(propRegex, `$1${typeAnnotation}`);
        updated = true;
        stats.responsivePropsTyped++;
      }
    } else {
      // Prop doesn't exist in interface, add it
      const interfaceEndRegex = new RegExp(`(interface\\s+${componentName}Props\\s*\\{[^\\}]*)(\\})`, 'gs');
      let typeAnnotation = 'ResponsiveValue<any>';
      
      // Choose appropriate type based on prop name
      if (['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'].includes(prop)) {
        typeAnnotation = 'ResponsiveValue<string | number>';
      } else if (['templateColumns', 'templateRows', 'templateAreas'].includes(prop)) {
        typeAnnotation = 'ResponsiveValue<string>';
      } else if (['gap', 'rowGap', 'columnGap'].includes(prop)) {
        typeAnnotation = 'ResponsiveValue<string | number>';
      } else if (['direction', 'justifyContent', 'alignItems', 'flexDirection'].includes(prop)) {
        typeAnnotation = 'ResponsiveValue<string>';
      }
      
      // Add prop to interface
      updatedContent = updatedContent.replace(interfaceEndRegex, `$1  ${prop}?: ${typeAnnotation};\n$2`);
      updated = true;
      stats.responsivePropsTyped++;
    }
  });
  
  return { content: updatedContent, updated };
}

/**
 * Add a new props interface to a component
 */
function addNewInterface(content, componentName, interfaceDeclaration) {
  // Find appropriate location to add the interface
  // Try to add after imports but before component definition
  const lines = content.split('\n');
  let lastImportIndex = -1;
  let componentDefIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^import /)) {
      lastImportIndex = i;
    }
    
    if (lines[i].match(new RegExp(`export\\s+(function|const)\\s+${componentName}`))) {
      componentDefIndex = i;
      break;
    }
  }
  
  // Insert after the last import or before component definition
  const insertIndex = lastImportIndex > -1 ? lastImportIndex + 1 : 
                     (componentDefIndex > -1 ? componentDefIndex : 0);
  
  // Insert empty line and interface declaration
  lines.splice(insertIndex, 0, '', interfaceDeclaration, '');
  
  // Update component function to use the new interface
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Update function parameter
    if (line.match(new RegExp(`export\\s+function\\s+${componentName}\\s*\\(\\s*\\{`))) {
      lines[i] = line.replace(
        new RegExp(`(export\\s+function\\s+${componentName})\\s*\\(\\s*\\{`),
        `$1({ `
      ).replace(/}\s*\)/, ' }: ' + componentName + 'Props)');
    }
    
    // Update arrow function parameter
    if (line.match(new RegExp(`export\\s+const\\s+${componentName}\\s*=\\s*\\(\\s*\\{`))) {
      lines[i] = line.replace(
        new RegExp(`(export\\s+const\\s+${componentName}\\s*=)\\s*\\(\\s*\\{`),
        `$1({ `
      ).replace(/}\s*\)/, ' }: ' + componentName + 'Props)');
    }
  }
  
  stats.interfacesAdded++;
  return { content: lines.join('\n'), updated: true };
}

/**
 * Add ResponsiveValue import if needed
 */
function ensureResponsiveValueImport(content, filePath) {
  // If no ResponsiveValue is used in the file, return original content
  if (!content.includes('ResponsiveValue<')) {
    return { content, updated: false };
  }
  
  // If ResponsiveValue import already exists, return original content
  if (content.includes('import { ResponsiveValue }')) {
    return { content, updated: false };
  }
  
  // Calculate relative path to utils directory
  const fileDir = path.dirname(filePath);
  const utilsDir = path.resolve(process.cwd(), 'src/utils');
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
  
  // Ensure React import exists
  if (!content.includes('import React')) {
    if (content.includes('import {')) {
      // Modify the first import that uses destructuring to include React
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/import\s*{/)) {
          lines[i] = lines[i].replace('import {', 'import React, {');
          break;
        }
      }
    } else {
      // Add React import at the beginning
      lines.unshift('import React from \'react\';');
    }
  }
  
  return { content: lines.join('\n'), updated: true };
}

/**
 * Process a single file to update component interfaces
 */
function processFile(filePath) {
  try {
    stats.filesScanned++;
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Check if file contains a React component
    if (!containsFunctionalComponent(content, filePath)) {
      return;
    }
    
    // Extract component name
    const componentName = extractComponentName(content, filePath);
    
    // Extract props
    const propsData = extractComponentProps(content, componentName);
    
    // Analyze responsive props
    const responsiveProps = analyzeResponsiveProps(content);
    
    // Update or create interface
    const { content: updatedInterfaceContent, updated: interfaceUpdated } = 
      updateComponentInterface(content, componentName, propsData, responsiveProps);
    
    if (interfaceUpdated) {
      stats.interfacesUpdated++;
    }
    
    // Add ResponsiveValue import if needed
    const { content: finalContent, updated: importUpdated } = 
      ensureResponsiveValueImport(updatedInterfaceContent, filePath);
    
    // Only write if changes were made
    if (interfaceUpdated || importUpdated) {
      fs.writeFileSync(filePath, finalContent, 'utf8');
      stats.filesFixed++;
      console.log(`✅ Fixed ${relativePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
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
  console.log(`Interfaces added: ${stats.interfacesAdded}`);
  console.log(`Interfaces updated: ${stats.interfacesUpdated}`);
  console.log(`Responsive props typed: ${stats.responsivePropsTyped}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
});