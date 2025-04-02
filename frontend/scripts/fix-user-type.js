#!/usr/bin/env node

/**
 * Script to update the import pattern in the project
 * This script ensures we properly type-cast user to include isAdmin property
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
  userChecksFixed: 0,
};

/**
 * Process a file to fix user.isAdmin checks
 */
async function processFile(filePath) {
  try {
    let fileModified = false;
    
    // Read the file content
    const content = await readFile(filePath, 'utf8');
    let updatedContent = content;
    
    // Fix user.isAdmin checks - proper TypeScript solution is to use optional chaining
    const isAdminRegex = /(\!?)(user)(\??)\.isAdmin/g;
    const isAdminMatches = updatedContent.match(isAdminRegex);
    
    if (isAdminMatches) {
      // Replace all occurrences of user.isAdmin with user?.isAdmin (ensuring optional chaining)
      updatedContent = updatedContent.replace(isAdminRegex, (match, negation, variable, optional) => {
        if (!optional) {
          return `${negation}${variable}?.isAdmin`;
        }
        return match; // Already has optional chaining
      });
      
      stats.userChecksFixed += isAdminMatches.length;
      fileModified = true;
      console.log(`  - Fixed ${isAdminMatches.length} user.isAdmin checks in ${path.basename(filePath)}`);
    }
    
    // Import @chakra-ui/direct fixes
    const missingImportRegex = /import\s+{([^}]*)}\s+from\s+['"]@chakra-ui\/direct['"]/g;
    if (missingImportRegex.test(updatedContent)) {
      // Replace with proper imports from @chakra-ui/react
      updatedContent = updatedContent.replace(missingImportRegex, (match, imports) => {
        return `import {${imports}} from '@chakra-ui/react'`;
      });
      fileModified = true;
      console.log(`  - Fixed @chakra-ui/direct imports in ${path.basename(filePath)}`);
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
 * Create/Update User interface definition
 */
async function updateUserType() {
  const userTypePath = path.resolve(process.cwd(), 'src/types/user.d.ts');
  
  try {
    let content = await readFile(userTypePath, 'utf8');
    
    // Check if isAdmin already exists in the User interface
    if (content.includes('isAdmin?:')) {
      console.log('✅ User interface already contains isAdmin property');
      return;
    }
    
    // Add isAdmin property to User interface
    const userInterfaceRegex = /(export\s+interface\s+User\s+{[^}]+)(})/;
    const updatedContent = content.replace(
      userInterfaceRegex,
      (match, before, after) => {
        return `${before}  isAdmin?: boolean;\n${after}`;
      }
    );
    
    await writeFile(userTypePath, updatedContent, 'utf8');
    console.log('✅ Added isAdmin property to User interface');
  } catch (error) {
    console.error(`❌ Error updating User type: ${error.message}`);
  }
}

/**
 * Print statistics about the fixes applied
 */
function printStats() {
  console.log('\n📊 User Type Fix Statistics:');
  console.log('----------------------------------------');
  console.log(`📄 Files Processed: ${stats.filesProcessed}`);
  console.log(`✨ Files Modified: ${stats.filesModified}`);
  console.log(`🔄 User Checks Fixed: ${stats.userChecksFixed}`);
  console.log('----------------------------------------');
}

/**
 * After fixing user type issues, try to build the project
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
    console.log('🚀 Starting User Type fixer...');
    
    // Update User type definition first
    await updateUserType();
    
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
    
    console.log('✨ User Type fixes completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();