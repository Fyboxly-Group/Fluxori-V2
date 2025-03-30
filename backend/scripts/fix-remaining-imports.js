#!/usr/bin/env node

/**
 * Fix Remaining Imports
 * 
 * This script fixes the remaining import statement issues
 * in files that are otherwise close to working.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Finds files with import errors
 */
function findFilesWithImportErrors() {
  console.log('Finding files with import errors...');
  try {
    // Run TypeScript compiler to find errors
    const command = 'npx tsc --noEmit';
    const tscOutput = execSync(command, { encoding: 'utf8', cwd: ROOT_DIR, stdio: ['pipe', 'pipe', 'ignore'] });
    return processErrorOutput(tscOutput);
  } catch (error) {
    if (error.stdout) {
      return processErrorOutput(error.stdout.toString());
    }
    
    console.error('Error running TypeScript:', error);
    return [];
  }
}

/**
 * Process TypeScript error output to find files with import errors
 */
function processErrorOutput(output) {
  // Find files with import errors
  const importErrorFiles = new Set();
  
  // Look for "from expected" errors which indicate import problems
  const regex = /^([^(]+\.ts)\(\d+,\d+\):\s*error TS\d+:\s*['"]from['"]\s+expected/gm;
  const matches = [...output.matchAll(regex)];
  
  matches.forEach(match => {
    importErrorFiles.add(match[1]);
  });
  
  console.log(`Found ${importErrorFiles.size} files with import errors`);
  return Array.from(importErrorFiles);
}

/**
 * Fix import statements in a file
 */
function fixImports(filePath) {
  console.log(`Fixing imports in ${filePath}...`);
  const fullPath = path.join(ROOT_DIR, filePath);
  
  try {
    // Read the file
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Fix import * as X from ...
    content = content.replace(
      /import\s+\*\s+as\s+(\w+)([^;]*)/g,
      'import * as $1 from$2;'
    );
    
    // Fix import { X } from ...
    content = content.replace(
      /import\s+\{([^}]+)\}([^;]*)/g,
      'import {$1} from$2;'
    );
    
    // Add semicolons to imports
    content = content.replace(
      /^(import\s+.*\w+)$/gm,
      '$1;'
    );
    
    // Fix missing 'from' keyword
    content = content.replace(
      /import\s+(.*?)\s+(['"][^'"]+['"])/g,
      'import $1 from $2'
    );
    
    // Only write if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed imports in ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️ No changes to imports in ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error fixing imports in ${filePath}:`, error);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔧 Import Fixer');
  console.log('================================');
  console.log('This script fixes import statement errors.');
  
  // Find files with import errors
  const filesToFix = findFilesWithImportErrors();
  
  if (filesToFix.length === 0) {
    console.log('No files with import errors found. All good!');
    return;
  }
  
  // Fix each file
  let fixedCount = 0;
  for (const filePath of filesToFix) {
    if (fixImports(filePath)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed imports in ${fixedCount} files`);
  console.log('\nRun TypeScript check to see remaining errors:');
  console.log('$ npx tsc --noEmit');
}

// Run the script
main();