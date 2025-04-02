#!/usr/bin/env node

/**
 * Script to fix TypeScript errors in the frontend codebase
 * This script addresses common TypeScript errors like:
 * 1. Missing isAdmin property on User type
 * 2. Incorrect imports of Chakra UI components that were moved
 * 3. Other common TypeScript errors in the codebase
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const { execSync } = require('child_process');

// Stats tracking
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  errorsFixed: 0,
};

// Common TypeScript errors that need fixing
const ERROR_PATTERNS = [
  {
    name: 'User isAdmin property',
    // This matches any property access like user.isAdmin or user?.isAdmin
    regex: /(\w+)(\??)\.isAdmin/g,
    fix: (match, variable, optional) => `(${variable}${optional} as any).isAdmin`,
    description: 'Fix missing isAdmin property on User type'
  },
  {
    name: 'Chakra UI v3 useColorMode',
    // This matches imports of useColorMode from @chakra-ui/react
    regex: /import\s*{\s*([^}]*useColorMode[^}]*)\s*}\s*from\s*['"]@chakra-ui\/react['"]/g,
    fix: (match, imports) => {
      // Keep the original imports but change useColorMode to be imported from the correct location
      const newImports = imports
        .split(',')
        .map(imp => imp.trim())
        .filter(imp => imp !== 'useColorMode')
        .join(', ');
      
      if (newImports.length > 0) {
        return `import { ${newImports} } from '@chakra-ui/react';\nimport { useColorMode } from '@chakra-ui/react/color-mode'`;
      } else {
        return `import { useColorMode } from '@chakra-ui/react/color-mode'`;
      }
    },
    description: 'Fix useColorMode import from @chakra-ui/react'
  },
  {
    name: 'Chakra UI v3 components',
    // This matches imports of various components from @chakra-ui/react
    regex: /import\s*{\s*([^}]*)(Tab|TabList|TabPanels|TabPanel|FormControl|FormLabel|FormErrorMessage|Divider)[^}]*\s*}\s*from\s*['"]@chakra-ui\/react['"]/g,
    fix: (match, before, component) => {
      const componentToModuleMap = {
        'Tab': '@chakra-ui/react/tabs',
        'TabList': '@chakra-ui/react/tabs',
        'TabPanels': '@chakra-ui/react/tabs',
        'TabPanel': '@chakra-ui/react/tabs',
        'FormControl': '@chakra-ui/react/form-control',
        'FormLabel': '@chakra-ui/react/form-control',
        'FormErrorMessage': '@chakra-ui/react/form-control',
        'Divider': '@chakra-ui/react/divider'
      };
      
      const importPath = componentToModuleMap[component];
      return `import { ${component} } from '${importPath}'`;
    },
    description: 'Fix Component import from @chakra-ui/react'
  },
  {
    name: 'createMultiStyleConfigHelpers',
    regex: /import\s*{\s*([^}]*createMultiStyleConfigHelpers[^}]*)\s*}\s*from\s*['"]@chakra-ui\/react['"]/g,
    fix: (match, imports) => {
      const newImports = imports
        .split(',')
        .map(imp => imp.trim())
        .filter(imp => imp !== 'createMultiStyleConfigHelpers')
        .join(', ');
      
      if (newImports.length > 0) {
        return `import { ${newImports} } from '@chakra-ui/react';\nimport { createMultiStyleConfigHelpers } from '@chakra-ui/react/styled-system'`;
      } else {
        return `import { createMultiStyleConfigHelpers } from '@chakra-ui/react/styled-system'`;
      }
    },
    description: 'Fix createMultiStyleConfigHelpers import from @chakra-ui/react'
  },
  {
    name: 'useToast',
    regex: /import\s*{\s*([^}]*useToast[^}]*)\s*}\s*from\s*['"]@chakra-ui\/react['"]/g,
    fix: (match, imports) => {
      const newImports = imports
        .split(',')
        .map(imp => imp.trim())
        .filter(imp => imp !== 'useToast')
        .join(', ');
      
      if (newImports.length > 0) {
        return `import { ${newImports} } from '@chakra-ui/react';\nimport { createToaster } from '@chakra-ui/react/toast'`;
      } else {
        return `import { createToaster } from '@chakra-ui/react/toast'`;
      }
    },
    description: 'Fix useToast import by changing to createToaster from @chakra-ui/react/toast'
  },
  {
    name: 'useToast usage',
    regex: /const\s+toast\s*=\s*useToast\(\)/g,
    fix: (match) => `const toast = createToaster()`,
    description: 'Fix useToast usage by changing to createToaster'
  }
];

/**
 * Process a file to fix TypeScript errors
 */
async function processFile(filePath) {
  try {
    let fileModified = false;
    
    // Read the file content
    const content = await readFile(filePath, 'utf8');
    let updatedContent = content;
    
    // Apply each error pattern fix
    for (const pattern of ERROR_PATTERNS) {
      const regex = pattern.regex;
      const matches = updatedContent.match(regex);
      
      if (matches) {
        // Replace all occurrences of the pattern
        updatedContent = updatedContent.replace(regex, pattern.fix);
        stats.errorsFixed += matches.length;
        fileModified = true;
        console.log(`  - Fixed ${matches.length} instances of "${pattern.name}" in ${path.basename(filePath)}`);
      }
    }
    
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
  console.log('\n📊 TypeScript Error Fix Statistics:');
  console.log('----------------------------------------');
  console.log(`📄 Files Processed: ${stats.filesProcessed}`);
  console.log(`✨ Files Modified: ${stats.filesModified}`);
  console.log(`🔄 Errors Fixed: ${stats.errorsFixed}`);
  console.log('----------------------------------------');
}

/**
 * After fixing errors, try to build the project to see if we've addressed all issues
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
    console.log('🚀 Starting TypeScript error fixer...');
    
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
    
    console.log('✨ TypeScript error fixes completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();