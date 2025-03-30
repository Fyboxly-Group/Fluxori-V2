#!/usr/bin/env node

/**
 * TypeScript Error Fixer Script
 * 
 * This script helps developers fix common TypeScript errors in their codebase by:
 * 1. Adding 'as any' type assertions to property access that causes errors
 * 2. Adding type annotations to parameters that have implicit any types
 * 3. Fixing 'this' context issues in tests
 * 
 * Note: This is a supplementary tool that doesn't replace proper TypeScript typing.
 * For comprehensive fixes, it's recommended to properly type your codebase.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Main function
async function main() {
  console.log('🔍 TypeScript Error Fixer');
  console.log('======================');
  console.log('This script adds type assertions to fix common TypeScript errors.');
  console.log('For best results, run this script multiple times until no more errors can be fixed.\n');
  
  const args = process.argv.slice(2);
  
  // Handle command line arguments
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }
  
  // Determine if we should modify test files
  const includeTests = args.includes('--tests') || args.includes('-t');
  const specificFile = args.find(arg => arg.endsWith('.ts') && !arg.startsWith('-'));
  
  console.log(`Mode: ${specificFile ? 'Single file' : includeTests ? 'Including tests' : 'Source files only'}`);
  
  if (specificFile) {
    console.log(`Target file: ${specificFile}`);
    await processFile(specificFile);
  } else {
    // Find and fix files
    const files = findEligibleFiles(includeTests);
    console.log(`Found ${files.length} TypeScript files to process\n`);
    
    let fixedFiles = 0;
    let totalFixes = 0;
    
    for (const file of files) {
      const fixes = await processFile(file);
      if (fixes > 0) {
        fixedFiles++;
        totalFixes += fixes;
      }
    }
    
    console.log(`\n✅ Applied ${totalFixes} fixes across ${fixedFiles} files`);
    
    if (totalFixes > 0) {
      console.log('\nRun TypeScript to check remaining errors:');
      console.log('$ npx tsc --noEmit');
      console.log('\nYou may need to run this script multiple times to fix more errors.');
    } else {
      console.log('\nNo fixes were applied. You may need to manually fix remaining errors.');
    }
  }
}

// Print help information
function printHelp() {
  console.log(`
Usage: node fix-typescript-errors.js [options] [file]

Options:
  --help, -h     Show this help
  --tests, -t    Include test files (*.test.ts) in the fix process
  
Examples:
  # Fix all source files (excluding tests)
  node fix-typescript-errors.js
  
  # Fix all source files including tests
  node fix-typescript-errors.js --tests
  
  # Fix a specific file
  node fix-typescript-errors.js src/controllers/user.controller.ts
  `);
}

// Find files eligible for fixing
function findEligibleFiles(includeTests) {
  const srcDir = path.join(process.cwd(), 'src');
  if (!fs.existsSync(srcDir)) {
    console.error('Error: src directory not found');
    process.exit(1);
  }
  
  const files = findFilesRecursively(srcDir, file => {
    if (!file.endsWith('.ts')) return false;
    if (file.endsWith('.d.ts')) return false;
    
    // Skip test files unless explicitly requested
    if (!includeTests && file.includes('.test.ts')) return false;
    
    return true;
  });
  
  return files;
}

// Find files recursively in a directory
function findFilesRecursively(dir, filterFn) {
  const files = [];
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      const subDirFiles = findFilesRecursively(itemPath, filterFn);
      files.push(...subDirFiles);
    } else if (filterFn(item)) {
      files.push(itemPath);
    }
  }
  
  return files;
}

// Process a single file
async function processFile(filePath) {
  // Skip if file doesn't exist
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return 0;
  }
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Apply fixes
  const isTestFile = filePath.includes('.test.ts');
  const isControllerFile = filePath.includes('.controller.ts');
  
  // Apply different fixes based on file type
  if (isTestFile) {
    content = fixTestFile(content);
  } else if (isControllerFile) {
    content = fixControllerFile(content);
  } else {
    content = fixSourceFile(content);
  }
  
  // Only save if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    const fixCount = countTypeAssertions(content) - countTypeAssertions(originalContent);
    console.log(`✅ Applied ${fixCount} fixes to ${path.relative(process.cwd(), filePath)}`);
    return fixCount;
  }
  
  return 0;
}

// Count 'as any' and ': any' occurrences in content
function countTypeAssertions(content) {
  return (content.match(/as any|: any/g) || []).length;
}

// Fix common issues in test files
function fixTestFile(content) {
  // Fix 'this' implicit any in describe/it blocks
  content = content.replace(
    /(describe|it)\(\s*(['"`].*?['"`]),\s*function\s*\(\s*\)/g, 
    '$1($2, function(this: any)'
  );
  
  // Fix implicit any in arrow functions
  content = content.replace(
    /(\(\s*)(\w+)(\s*\)\s*=>)/g, 
    '$1$2: any$3'
  );
  
  // Fix arrow function parameters in array callbacks (with proper parentheses)
  content = content.replace(
    /\.map\(\s*(\w+)\s*=>/g,
    '.map(($1: any) =>'
  );
  
  content = content.replace(
    /\.forEach\(\s*(\w+)\s*=>/g,
    '.forEach(($1: any) =>'
  );
  
  content = content.replace(
    /\.filter\(\s*(\w+)\s*=>/g,
    '.filter(($1: any) =>'
  );
  
  content = content.replace(
    /\.find\(\s*(\w+)\s*=>/g,
    '.find(($1: any) =>'
  );
  
  content = content.replace(
    /\.every\(\s*(\w+)\s*=>/g,
    '.every(($1: any) =>'
  );
  
  content = content.replace(
    /\.some\(\s*(\w+)\s*=>/g,
    '.some(($1: any) =>'
  );
  
  content = content.replace(
    /\.reduce\(\s*(\w+)\s*=>/g,
    '.reduce(($1: any) =>'
  );
  
  // Fix any existing broken callback with type annotations but no parens
  content = content.replace(
    /\.(map|forEach|filter|find|every|some|reduce)\(\s*(\w+)\s*:\s*any\s*=>/g,
    '.$1(($2: any) =>'
  );
  
  // Add type assertion to all property accesses with _id
  content = content.replace(
    /(\w+)\._id(?!\s+as)/g, 
    '($1 as any)._id'
  );
  
  // Add type assertion to all object literals in test mocks
  content = content.replace(
    /const\s+(\w+)\s*=\s*(\{\s*[^}]+\}\s*);(?!\s*\/\/)/g, 
    'const $1 = $2 as any;'
  );
  
  // Add type assertion to function calls with null/true/false
  content = content.replace(
    /\((\s*)(null|true|false|Error)(\s*)\)/g, 
    '($1$2 as any$3)'
  );
  
  return content;
}

// Fix common issues in controller files
function fixControllerFile(content) {
  // Fix req.params and req.body with type assertions
  content = content.replace(
    /(const|let|var)\s+(\w+)(\s*=\s*req\.params\.(\w+));/g, 
    '$1 $2$3 as any;'
  );
  
  content = content.replace(
    /(const|let|var)\s+(\w+)(\s*=\s*req\.body\.(\w+));/g, 
    '$1 $2$3 as any;'
  );
  
  // Fix req.user._id with type assertions
  content = content.replace(
    /req\.user\._id/g, 
    '(req.user as any)._id'
  );
  
  // Fix ObjectId type assertions
  content = content.replace(
    /(const|let|var)\s+(\w+)\s*:\s*ObjectId\s*=\s*([^;]+);/g, 
    '$1 $2: ObjectId = $3 as any;'
  );
  
  // Add type assertion to all property accesses with _id
  content = content.replace(
    /(\w+)\._id(?!\s+as)/g, 
    '($1 as any)._id'
  );
  
  return content;
}

// Fix common issues in regular source files
function fixSourceFile(content) {
  // Fix implicit any in arrow functions 
  content = content.replace(
    /(\(\s*)(\w+)(\s*\)\s*=>)/g, 
    '$1$2: any$3'
  );
  
  // Fix arrow function parameters in array callbacks (with proper parentheses)
  content = content.replace(
    /\.map\(\s*(\w+)\s*=>/g,
    '.map(($1: any) =>'
  );
  
  content = content.replace(
    /\.forEach\(\s*(\w+)\s*=>/g,
    '.forEach(($1: any) =>'
  );
  
  content = content.replace(
    /\.filter\(\s*(\w+)\s*=>/g,
    '.filter(($1: any) =>'
  );
  
  content = content.replace(
    /\.find\(\s*(\w+)\s*=>/g,
    '.find(($1: any) =>'
  );
  
  content = content.replace(
    /\.every\(\s*(\w+)\s*=>/g,
    '.every(($1: any) =>'
  );
  
  content = content.replace(
    /\.some\(\s*(\w+)\s*=>/g,
    '.some(($1: any) =>'
  );
  
  content = content.replace(
    /\.reduce\(\s*(\w+)\s*=>/g,
    '.reduce(($1: any) =>'
  );
  
  return content;
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});