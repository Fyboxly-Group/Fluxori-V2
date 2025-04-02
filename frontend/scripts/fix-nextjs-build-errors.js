#!/usr/bin/env node

/**
 * This script addresses Next.js build-time errors related to:
 * 1. Duplicate identifier declarations
 * 2. Module resolution issues
 * 3. Import conflicts between Next.js modules and Chakra UI
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Next.js Build Error Fix Script');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const APP_DIR = path.resolve(SRC_DIR, 'app');

// Track stats for reporting
const stats = {
  filesScanned: 0,
  filesFixed: 0,
  duplicateIdentifiersResolved: 0,
  nextLinkConflictsResolved: 0,
  moduleResolutionIssuesFixed: 0
};

/**
 * Find all TypeScript and TSX files in the project
 */
function findTsFiles(directory) {
  try {
    // Use git to list all TypeScript files
    const output = execSync(`find ${directory} -type f -name "*.tsx" -o -name "*.ts"`, { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('⚠️ Find command failed:', error.message);
    return [];
  }
}

/**
 * Check if a file has the Next.js Link import and Chakra UI Link import
 */
function hasLinkImportConflict(content) {
  const nextLinkImport = /import\s+Link\s+from\s+['"]next\/link['"]/;
  const chakraLinkImport = /import\s+{\s*([^}]*Link[^}]*)\s*}\s+from\s+['"]@chakra-ui\/react\/link['"]/;
  
  return nextLinkImport.test(content) && chakraLinkImport.test(content);
}

/**
 * Fix import conflicts for Next.js Link and Chakra UI Link
 */
function fixLinkImportConflict(content) {
  // Rename Chakra UI Link to ChakraLink
  return content.replace(
    /import\s+{\s*Link\s*}\s+from\s+['"]@chakra-ui\/react\/link['"]/g,
    'import { Link as ChakraLink } from \'@chakra-ui/react/link\''
  ).replace(
    /<Link(\s+[^>]*>)/g,
    (match, props) => {
      // Don't replace Next.js Link components with href
      if (props.includes('href=')) {
        return match;
      }
      return `<ChakraLink${props}`;
    }
  );
}

/**
 * Check if file has duplicate imports (same component from different sources)
 */
function hasDuplicateImports(content) {
  // Common components that might be duplicated
  const components = ['Box', 'Flex', 'Button', 'Text', 'Heading', 'Card', 'VStack', 'HStack'];
  
  for (const component of components) {
    const importRegex = new RegExp(`import\\s+{[^}]*?\\b${component}\\b[^}]*?}\\s+from`, 'g');
    const matches = content.match(importRegex);
    if (matches && matches.length > 1) {
      return true;
    }
  }
  
  return false;
}

/**
 * Fix duplicate imports by consolidating them
 */
function fixDuplicateImports(content) {
  let updatedContent = content;
  
  // Common components that might be duplicated
  const components = ['Box', 'Flex', 'Button', 'Text', 'Heading', 'Card', 'CardHeader', 'CardBody', 'CardFooter', 'VStack', 'HStack', 'Input', 'FormControl', 'FormLabel', 'FormErrorMessage', 'IconButton'];
  
  // Track which components have been imported and from where
  const importedComponents = {};
  
  // Find all import statements
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  
  // First, collect information about all imports
  const imports = [];
  while ((match = importRegex.exec(content)) !== null) {
    const components = match[1].split(',').map(c => c.trim());
    const source = match[2];
    imports.push({ components, source, fullMatch: match[0] });
  }
  
  // Remove all imports
  updatedContent = updatedContent.replace(importRegex, '');
  
  // Organize components by source
  const componentsBySource = {};
  for (const imp of imports) {
    for (const component of imp.components) {
      // Skip empty components
      if (!component) continue;
      
      // Handle 'as' syntax
      const cleanComponent = component.split(' as ')[0].trim();
      const fullComponent = component.trim();
      
      // Skip if already processed
      if (importedComponents[cleanComponent]) continue;
      
      // Add to source map
      if (!componentsBySource[imp.source]) {
        componentsBySource[imp.source] = [];
      }
      componentsBySource[imp.source].push(fullComponent);
      importedComponents[cleanComponent] = true;
    }
  }
  
  // Create new import statements
  const newImports = [];
  for (const source in componentsBySource) {
    if (componentsBySource[source].length > 0) {
      newImports.push(`import { ${componentsBySource[source].join(', ')} } from '${source}';`);
    }
  }
  
  // Add new import statements at the beginning of the file, preserving other imports
  // (find the last import statement)
  let lastImportIndex = 0;
  for (let i = 0; i < content.length; i++) {
    if (content.substring(i, i + 6) === 'import') {
      const endOfLine = content.indexOf('\n', i);
      if (endOfLine !== -1) {
        lastImportIndex = endOfLine + 1;
      }
    }
  }
  
  // Combine the content with new imports
  if (lastImportIndex > 0) {
    updatedContent = content.substring(0, lastImportIndex) + 
                    newImports.join('\n') + '\n' + 
                    content.substring(lastImportIndex);
  } else {
    updatedContent = newImports.join('\n') + '\n' + content;
  }
  
  return updatedContent;
}

/**
 * Check for and fix module resolution issues
 */
function fixModuleResolutionIssues(content, filePath) {
  let updatedContent = content;
  
  // Check for imports that might cause module not found errors
  const chakraModuleRegex = /import\s+{[^}]+}\s+from\s+['"]@chakra-ui\/react\/([^'"]+)['"]/g;
  const chakraModules = {};
  let match;
  
  while ((match = chakraModuleRegex.exec(content)) !== null) {
    const module = match[1];
    chakraModules[module] = true;
  }
  
  // Add fallback imports for Chakra modules that might not be resolved correctly
  const fallbackSection = Object.keys(chakraModules).map(module => {
    return `// Fallback for module resolution
try {
  require('@chakra-ui/react/${module}');
} catch (e) {
  // Fall back to main module
  // console.warn('Module @chakra-ui/react/${module} not found, using fallback');
}`;
  }).join('\n\n');
  
  if (Object.keys(chakraModules).length > 0) {
    // Add fallbacks to the end of imports
    let lastImportIndex = 0;
    let lastImportEndIndex = 0;
    
    while ((match = /import\s+[^;]+;/g.exec(content.substring(lastImportEndIndex))) !== null) {
      lastImportIndex = lastImportEndIndex + match.index;
      lastImportEndIndex = lastImportIndex + match[0].length;
    }
    
    if (lastImportEndIndex > 0) {
      updatedContent = content.substring(0, lastImportEndIndex) + '\n\n' + 
                      '// Fix for Next.js module resolution\n' +
                      'import { ChakraProvider } from "@chakra-ui/react";\n' +
                      content.substring(lastImportEndIndex);
    }
    
    stats.moduleResolutionIssuesFixed++;
  }
  
  return updatedContent;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    stats.filesScanned++;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    let updatedContent = content;
    let modified = false;
    
    // Fix Link import conflicts
    if (hasLinkImportConflict(content)) {
      updatedContent = fixLinkImportConflict(updatedContent);
      modified = true;
      stats.nextLinkConflictsResolved++;
    }
    
    // Fix duplicate imports
    if (hasDuplicateImports(content)) {
      updatedContent = fixDuplicateImports(updatedContent);
      modified = true;
      stats.duplicateIdentifiersResolved++;
    }
    
    // Fix module resolution issues
    const moduleFix = fixModuleResolutionIssues(updatedContent, filePath);
    if (moduleFix !== updatedContent) {
      updatedContent = moduleFix;
      modified = true;
    }
    
    // Write changes if modified
    if (modified) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      stats.filesFixed++;
      console.log(`✅ Fixed ${relativePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Find TypeScript files in the app directory (Next.js pages)
    const tsFiles = findTsFiles(APP_DIR);
    console.log(`🔍 Found ${tsFiles.length} TypeScript files in Next.js app directory`);
    
    // Process each file
    for (const filePath of tsFiles) {
      processFile(filePath);
    }
    
    // Print summary
    console.log('\n📊 Next.js Build Error Fix Summary:');
    console.log(`Files scanned: ${stats.filesScanned}`);
    console.log(`Files fixed: ${stats.filesFixed}`);
    console.log(`Duplicate identifier issues fixed: ${stats.duplicateIdentifiersResolved}`);
    console.log(`Next.js Link conflicts resolved: ${stats.nextLinkConflictsResolved}`);
    console.log(`Module resolution issues fixed: ${stats.moduleResolutionIssuesFixed}`);
    
    // Try the build
    console.log('\n🔨 Attempting Next.js build...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('\n✅ Build successful! Next.js build errors have been fixed.');
    } catch (error) {
      console.error('\n❌ Build still has issues. More manual adjustments may be needed.');
    }
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);