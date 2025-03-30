#!/usr/bin/env node

/**
 * Fix Test Files Script
 * 
 * This script specifically targets complex issues in test files that weren't fixed
 * by the previous automation scripts.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const GLOB_PATTERN = '**/*.test.ts';

/**
 * Finds test files that still have TypeScript errors
 */
function findFilesWithErrors() {
  console.log('Finding test files with errors...');
  try {
    // Run TypeScript compiler to find errors
    const tscOutput = execSync('npx tsc --noEmit', { encoding: 'utf8', cwd: ROOT_DIR, stdio: ['pipe', 'pipe', 'ignore'] });
    const errorFileSet = new Set();

    // Extract unique error file paths
    const regex = /^([^(]+\.(test|spec)\.ts)/gm;
    const matches = tscOutput.matchAll(regex);
    
    for (const match of matches) {
      errorFileSet.add(match[1]);
    }

    const errorFiles = Array.from(errorFileSet);
    console.log(`Found ${errorFiles.length} test files with errors`);
    return errorFiles;
  } catch (error) {
    if (error.stdout) {
      const errorFileSet = new Set();
      const regex = /^([^(]+\.(test|spec)\.ts)/gm;
      const matches = error.stdout.toString().matchAll(regex);
      
      for (const match of matches) {
        errorFileSet.add(match[1]);
      }

      const errorFiles = Array.from(errorFileSet);
      console.log(`Found ${errorFiles.length} test files with errors`);
      return errorFiles;
    }
    
    console.error('Error finding files:', error);
    return [];
  }
}

/**
 * Fix malformed import statements
 */
function fixImports(content) {
  // Fix import { Request: Request, Response ... } issues
  content = content.replace(
    /import\s+{\s*([^}:]+):\s*([^},]+)([^}]*)\}/g,
    'import { $1$3 }'
  );
  
  return content;
}

/**
 * Fix semicolons in object declarations
 */
function fixObjectSemicolons(content) {
  // Replace any ; in object literals with ,
  content = content.replace(
    /(\w+\s*:\s*[^,;{}]+);(\s*(?:[}\)]|[a-zA-Z_$][\w$]*\s*:))/g,
    '$1,$2'
  );
  
  return content;
}

/**
 * Fix Jest mock calls with extra null parameters
 */
function fixJestMocks(content) {
  // Remove null parameters from jest.fn calls
  content = content.replace(/jest\.fn\(\s*null\s*\)/g, 'jest.fn()');
  
  // Remove null parameters from mockReturnThis calls
  content = content.replace(/\.mockReturnThis\(\s*null\s*\)/g, '.mockReturnThis()');
  
  // Remove null parameters from mockImplementation calls
  content = content.replace(/\.mockImplementation\(\s*\(\)\s*=>\s*\{\s*return/g, '.mockImplementation(() => {return');
  
  // Fix jest.clearAllMocks calls
  content = content.replace(/jest\.clearAllMocks\(\s*null\s*\)/g, 'jest.clearAllMocks()');
  
  return content;
}

/**
 * Fix describe/it blocks that have formatting issues
 */
function fixTestBlocks(content) {
  // Fix malformed describe blocks - common pattern: }describe(
  content = content.replace(/}\s*describe/g, '});\n\ndescribe');
  
  // Fix malformed it blocks within describe - common pattern: }it(
  content = content.replace(/}\s*it/g, '});\n\nit');
  
  // Fix malformed this: any parameters
  content = content.replace(/function\(\s*this:\s*anythis:\s*any/g, 'function(this: any');
  
  return content;
}

/**
 * Fix comma issues in mockResolvedValue/mockRejectedValue calls
 */
function fixMockCalls(content) {
  // Fix extra commas in mock arrays - pattern: .mockResolvedValueOnce([, { 
  content = content.replace(/mockResolvedValueOnce\(\[\s*,\s*/g, 'mockResolvedValueOnce([');
  
  // Fix comma issues in as jest.Mock patterns
  content = content.replace(/\(([^()]+)\.([^(),]+),\s*as\s+jest\.Mock\)/g, '($1.$2 as jest.Mock)');
  
  // Fix multiple "as" statements
  content = content.replace(/\)\s*as\s+any\s+as\s+any\s+as\s+any/g, ') as any');
  
  // Fix expect calls with null parameters
  content = content.replace(/\.toHaveBeenCalled\(\s*null\s*\)/g, '.toHaveBeenCalled()');
  
  return content;
}

/**
 * Fix property assignment issues in expect statements
 */
function fixExpectStatements(content) {
  // Fix expect().toHaveBeenCalledWith({, success: true,
  content = content.replace(/toHaveBeenCalledWith\(\{\s*,\s*success:/g, 'toHaveBeenCalledWith({ success:');

  // Fix missing commas in expect statements
  content = content.replace(/expect\(([^)]+)\)\.toBe\(([^)]+),\s*as,\s*any\)/g, 'expect($1).toBe($2 as any)');
  
  return content;
}

/**
 * Fix issues with expression statements and missing braces
 */
function fixExpressionStatements(content) {
  // Fix missing closing braces and parentheses
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;
  
  // Add missing closing parentheses if needed
  if (openParens > closeParens) {
    const diff = openParens - closeParens;
    content = content + ')'.repeat(diff);
  }
  
  // Add missing closing braces if needed
  if (openBraces > closeBraces) {
    const diff = openBraces - closeBraces;
    content = content + '}'.repeat(diff);
  }
  
  return content;
}

/**
 * Fix issues specifically in Express Request/Response type assertion patterns
 */
function fixRequestResponseAssertions(content) {
  // Fix common pattern: mockRequest, as Request,
  content = content.replace(/(\w+),\s*as\s+([A-Z]\w+),/g, '$1 as $2,');
  
  // Fix broken type assertions in function parameters
  content = content.replace(/\(([^)]+), as ([A-Z][^,)]+)/g, '($1 as $2');
  
  return content;
}

/**
 * Fix unterminated regular expression literals
 */
function fixRegexLiterals(content) {
  // Find potential unterminated regex literals and try to close them
  content = content.replace(/\/([^\/\n\r*+{}()\[\]\\]*(?:\\.[^\/\n\r*+{}()\[\]\\]*)*)(?!\/)(?=\s*[,;)])/g, '/$1/');
  
  return content;
}

/**
 * Main function to fix a test file
 */
function fixTestFile(filePath) {
  console.log(`Processing ${filePath}...`);
  const fullPath = path.join(ROOT_DIR, filePath);
  
  try {
    // Read the file
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Apply all fixes
    content = fixImports(content);
    content = fixObjectSemicolons(content);
    content = fixJestMocks(content);
    content = fixTestBlocks(content);
    content = fixMockCalls(content);
    content = fixExpectStatements(content);
    content = fixRequestResponseAssertions(content);
    content = fixRegexLiterals(content);
    content = fixExpressionStatements(content);
    
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
  console.log('🔧 Test File Fixer');
  console.log('================================');
  console.log('This script fixes complex issues in test files.');
  
  // Find all test files with errors
  const filesToFix = findFilesWithErrors();
  
  // Fix each file
  let fixedCount = 0;
  for (const filePath of filesToFix) {
    if (fixTestFile(filePath)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed errors in ${fixedCount} files`);
  console.log('\nRun TypeScript check to see remaining errors:');
  console.log('$ npx tsc --noEmit');
}

// Run the script
main();