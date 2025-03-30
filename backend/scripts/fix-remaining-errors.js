#!/usr/bin/env node

/**
 * Fix Remaining Errors Script
 * 
 * This script targets specifically the remaining TypeScript errors
 * that weren't fixed by previous scripts.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Finds files that still have TypeScript errors
 */
function findFilesWithErrors() {
  console.log('Finding files with remaining errors...');
  try {
    // Run TypeScript compiler to find errors
    const tscOutput = execSync('npx tsc --noEmit', { encoding: 'utf8', cwd: ROOT_DIR, stdio: ['pipe', 'pipe', 'ignore'] });
    const errorFileSet = new Set();

    // Extract unique error file paths
    const regex = /^([^(]+\.ts)/gm;
    const matches = tscOutput.matchAll(regex);
    
    for (const match of matches) {
      errorFileSet.add(match[1]);
    }

    const errorFiles = Array.from(errorFileSet);
    console.log(`Found ${errorFiles.length} files with errors`);
    return errorFiles;
  } catch (error) {
    if (error.stdout) {
      const errorFileSet = new Set();
      const regex = /^([^(]+\.ts)/gm;
      const matches = error.stdout.toString().matchAll(regex);
      
      for (const match of matches) {
        errorFileSet.add(match[1]);
      }

      const errorFiles = Array.from(errorFileSet);
      console.log(`Found ${errorFiles.length} files with errors`);
      return errorFiles;
    }
    
    console.error('Error finding files:', error);
    return [];
  }
}

/**
 * Fix import statements
 */
function fixImports(content) {
  // Fix import statements missing semicolons
  content = content.replace(
    /^import\s+([^;]+)$/gm,
    'import $1;'
  );

  // Fix specific Request import issue
  content = content.replace(
    /import\s+{\s*Request:\s*Request/g,
    'import { Request'
  );
  
  return content;
}

/**
 * Fix missing semicolons after import statements
 */
function fixMissingSemicolons(content) {
  // Add semicolons after import statements
  content = content.replace(
    /^(import\s+.*\w+)$/gm,
    '$1;'
  );
  
  // Add semicolons after variable declarations
  content = content.replace(
    /(const|let|var)\s+(\w+)(\s*=\s*[^;]*)(\s*\n)/g,
    '$1 $2$3;$4'
  );
  
  // Add semicolons after statements
  content = content.replace(
    /(\)\s*\{)\s*(\n\s*)/g, 
    '$1;$2'
  );
  
  return content;
}

/**
 * Fix jest.mock expressions
 */
function fixJestMock(content) {
  // Fix jest.mock statements that are missing expressions
  content = content.replace(
    /jest\.mock\((['"])([^'"]+)(['"])\);?/g,
    'jest.mock($1$2$3, () => ({}));'
  );
  
  return content;
}

/**
 * Fix declaration or statement expected errors
 */
function fixMalformedStatements(content) {
  // Remove extraneous curly braces
  content = content.replace(/^\s*\}\s*\}\s*$/gm, '}');
  
  // Fix broken nested describe and it blocks
  content = content.replace(
    /\}\s*describe\(/g,
    '});\n\ndescribe('
  );
  
  // Fix nested try blocks
  content = content.replace(
    /\b(catch|finally)\s*\(\s*([^)]*)\s*\)\s*\{/g, 
    '$1 ($2) {'
  );
  
  // Add missing try keyword
  content = content.replace(
    /\b(const|let|var)\s+(\w+)(\s*=\s*)(async\s*\(\)\s*=>\s*\{)/g,
    '$1 $2$3async () => {\n    try {'
  );
  
  return content;
}

/**
 * Fix property assignment issues
 */
function fixPropertyAssignments(content) {
  // Fix malformed property assignments in objects
  content = content.replace(
    /\{([^{}]*),\s*([^:{}]+)\}/g,
    '{$1, $2: undefined}'
  );
  
  // Fix chained method calls that need commas
  content = content.replace(
    /(\.\w+\([^)]*\))\s+(\.\w+)/g,
    '$1$2'
  );
  
  return content;
}

/**
 * Main function to fix a file
 */
function fixFile(filePath) {
  console.log(`Processing ${filePath}...`);
  const fullPath = path.join(ROOT_DIR, filePath);
  
  try {
    // Read the file
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Apply all fixes
    content = fixImports(content);
    content = fixMissingSemicolons(content);
    content = fixJestMock(content);
    content = fixMalformedStatements(content);
    content = fixPropertyAssignments(content);
    
    // Only write if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed errors in ${filePath}`);
    } else {
      console.log(`ℹ️ No changes made to ${filePath}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔧 Remaining Error Fixer');
  console.log('================================');
  console.log('This script fixes remaining TypeScript errors.');
  
  // Find all files with errors
  const filesToFix = findFilesWithErrors();
  
  // Fix each file
  let fixedCount = 0;
  for (const filePath of filesToFix) {
    if (fixFile(filePath)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed errors in ${fixedCount} files`);
  console.log('\nRun TypeScript check to see remaining errors:');
  console.log('$ npx tsc --noEmit');
}

// Run the script
main();