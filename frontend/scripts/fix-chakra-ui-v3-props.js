#!/usr/bin/env node

/**
 * Script to fix Chakra UI v3 prop patterns without changing imports
 * This script focuses on:
 * 1. Fixing prop names to match Chakra UI v3 naming conventions (isLoading -> loading)
 * 2. Fixing spacing -> gap in Stack components
 * 3. Preserving v2 props for components that need them
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const { execSync } = require('child_process');

// Prop mappings from v2 to v3
const PROP_MAPPINGS = {
  'isLoading': 'loading',
  'isOpen': 'open',
  'isDisabled': 'disabled',
  'isChecked': 'checked',
  'isActive': 'active',
  'isFocused': 'focused',
  'isAttached': 'attached',
  'isInvalid': 'invalid',
  'isReadOnly': 'readOnly',
  'isTruncated': 'truncated',
  'isFullWidth': 'fullWidth',
  'isExternal': 'external',
  'isRequired': 'required',
};

// Components that need special handling for props - these components still use the v2 prop names
const V2_PROP_COMPONENTS = [
  'NotificationList',  // isLoading instead of loading
  'QueryStateHandler', // isLoading instead of loading
  'Modal',             // isOpen instead of open
  'AlertDialog',       // isOpen instead of open
  'DisconnectAlertDialog', // isLoading instead of loading
  'Popover',           // isOpen instead of open
  'Drawer',            // isOpen instead of open
  'Menu',              // isOpen instead of open
  'Tooltip',           // isOpen instead of open
];

// Stats tracking
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  propsFixed: 0,
  componentsWithV2Props: 0,
  stackSpacingToGap: 0,
};

/**
 * Process a file to fix Chakra UI props
 */
async function processFile(filePath) {
  try {
    let fileModified = false;
    
    // Read the file content
    const content = await readFile(filePath, 'utf8');
    let updatedContent = content;
    
    // Step 1: Fix prop names (isLoading -> loading, etc.)
    Object.entries(PROP_MAPPINGS).forEach(([oldProp, newProp]) => {
      // Find JSX props
      const propRegex = new RegExp(`(\\s+)${oldProp}(\\s*=\\s*{[^}]+})`, 'g');
      const propMatches = updatedContent.match(propRegex);
      
      if (propMatches) {
        const originalLength = propMatches.length;
        let updatedMatches = propMatches;
        
        // Filter out props for components that should keep v2 prop names
        for (const v2Component of V2_PROP_COMPONENTS) {
          const v2ComponentRegex = new RegExp(`<${v2Component}[^>]*\\s+${oldProp}\\s*=`, 'g');
          const v2Matches = updatedContent.match(v2ComponentRegex);
          
          if (v2Matches) {
            stats.componentsWithV2Props += v2Matches.length;
            // Remove these matches from the ones to replace
            updatedMatches = updatedMatches.filter(match => {
              for (const v2Match of v2Matches) {
                if (v2Match.includes(match.trim())) {
                  return false;
                }
              }
              return true;
            });
          }
        }
        
        stats.propsFixed += updatedMatches.length;
        
        // Replace the props
        updatedContent = updatedContent.replace(propRegex, (match, prefix, propValue) => {
          // Check if this match is for a component that should keep v2 prop names
          for (const v2Component of V2_PROP_COMPONENTS) {
            const v2ComponentRegex = new RegExp(`<${v2Component}[^>]*${match.trim()}`, 'g');
            if (updatedContent.match(v2ComponentRegex)) {
              return match; // Keep original for v2 components
            }
          }
          
          return `${prefix}${newProp}${propValue}`;
        });
        
        if (propMatches.length !== updatedMatches.length) {
          fileModified = true;
        }
      }
    });
    
    // Step 2: Fix stack spacing prop -> gap
    const stackSpacingRegex = /(<(?:Stack|HStack|VStack)[^>]*\s+)spacing(\s*=\s*{[^}]+})/g;
    const stackSpacingMatches = updatedContent.match(stackSpacingRegex);
    
    if (stackSpacingMatches) {
      stats.stackSpacingToGap += stackSpacingMatches.length;
      updatedContent = updatedContent.replace(stackSpacingRegex, '$1gap$2');
      fileModified = true;
    }
    
    // Step 3: Reverse prop changes for special cases that need the v2 prop names
    V2_PROP_COMPONENTS.forEach(componentName => {
      Object.entries(PROP_MAPPINGS).forEach(([oldProp, newProp]) => {
        // Find where the new prop is used with these components
        const wrongPropRegex = new RegExp(`(<${componentName}[^>]*\\s+)${newProp}(\\s*=\\s*{[^}]+})`, 'g');
        const wrongPropMatches = updatedContent.match(wrongPropRegex);
        
        if (wrongPropMatches) {
          // Change back to the old prop name
          updatedContent = updatedContent.replace(wrongPropRegex, `$1${oldProp}$2`);
          fileModified = true;
        }
      });
    });
    
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
  console.log('\n📊 Chakra UI v3 Props Fix Statistics:');
  console.log('----------------------------------------');
  console.log(`📄 Files Processed: ${stats.filesProcessed}`);
  console.log(`✨ Files Modified: ${stats.filesModified}`);
  console.log('----------------------------------------');
  console.log(`🔄 Props Fixed: ${stats.propsFixed}`);
  console.log(`🔄 Components With v2 Props Preserved: ${stats.componentsWithV2Props}`);
  console.log(`🔄 Stack spacing -> gap: ${stats.stackSpacingToGap}`);
  console.log('----------------------------------------');
}

/**
 * After fixing props, try to build the project to see if we've addressed all issues
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
    console.log('🚀 Starting Chakra UI v3 props fixer...');
    
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
    
    console.log('✨ Chakra UI v3 props fixes completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();