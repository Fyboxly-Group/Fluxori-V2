#!/usr/bin/env node

/**
 * Script to convert direct module imports back to barrel imports
 * This script addresses module resolution errors by:
 * 1. Finding direct imports like @chakra-ui/react/color-mode
 * 2. Converting them back to barrel imports (@chakra-ui/react)
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
  importsFixes: 0,
};

/**
 * Process a file to fix direct imports by converting them to barrel imports
 */
async function processFile(filePath) {
  try {
    let fileModified = false;
    
    // Read the file content
    const content = await readFile(filePath, 'utf8');
    let updatedContent = content;
    
    // Find all direct imports from @chakra-ui/react/ submodules
    const directImportRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]@chakra-ui\/react\/([^'"]+)['"]/g;
    const matches = updatedContent.matchAll(directImportRegex);
    
    if (matches) {
      const componentsByModule = new Map();
      const allMatches = Array.from(matches);
      
      if (allMatches.length > 0) {
        // Group components by their module
        for (const match of allMatches) {
          const components = match[1].split(',').map(c => c.trim()).filter(Boolean);
          const module = match[0];
          
          if (!componentsByModule.has(module)) {
            componentsByModule.set(module, { components, module });
          } else {
            const existing = componentsByModule.get(module);
            existing.components.push(...components);
          }
        }
        
        // Remove all direct imports
        updatedContent = updatedContent.replace(directImportRegex, '// Placeholder for Chakra UI import');
        
        // Add a single barrel import with all components
        const allComponents = new Set();
        for (const { components } of componentsByModule.values()) {
          components.forEach(c => allComponents.add(c));
        }
        
        const componentList = Array.from(allComponents).join(', ');
        const barrelImport = `import { ${componentList} } from '@chakra-ui/react';`;
        
        updatedContent = updatedContent.replace('// Placeholder for Chakra UI import', barrelImport);
        
        // Remove any remaining placeholders (in case there were multiple)
        updatedContent = updatedContent.replace(/\/\/ Placeholder for Chakra UI import\n?/g, '');
        
        fileModified = true;
        stats.importsFixes += allMatches.length;
        console.log(`  - Fixed ${allMatches.length} direct imports in ${path.basename(filePath)}`);
      }
    }
    
    // Fix isAdmin errors
    const isAdminRegex = /\(([^)]+) as any\)\.isAdmin/g;
    const isAdminMatches = updatedContent.match(isAdminRegex);
    
    if (isAdminMatches) {
      updatedContent = updatedContent.replace(isAdminRegex, '$1?.isAdmin');
      console.log(`  - Fixed ${isAdminMatches.length} User.isAdmin casts in ${path.basename(filePath)}`);
      fileModified = true;
      stats.importsFixes += isAdminMatches.length;
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
  console.log('\n📊 Module Import Fix Statistics:');
  console.log('----------------------------------------');
  console.log(`📄 Files Processed: ${stats.filesProcessed}`);
  console.log(`✨ Files Modified: ${stats.filesModified}`);
  console.log(`🔄 Imports Fixed: ${stats.importsFixes}`);
  console.log('----------------------------------------');
}

/**
 * After fixing imports, try to build the project to see if we've addressed all issues
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
    console.log('🚀 Starting module import fixer...');
    
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
    
    console.log('✨ Module import fixes completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();