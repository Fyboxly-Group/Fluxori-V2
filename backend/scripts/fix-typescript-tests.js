/**
 * TypeScript test file fixer
 * 
 * This script applies a comprehensive approach to fixing TypeScript errors
 * in Jest test files, with special handling for mock functions and
 * common Jest patterns.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const SKIP_TYPECHECK = process.argv.includes('--skip-typecheck');

// Get the target directory from command-line arguments or use a default
const TARGET_DIR = process.argv.find(arg => arg.startsWith('--dir='))
  ? process.argv.find(arg => arg.startsWith('--dir=')).replace('--dir=', '')
  : 'src';

// Utility functions
function log(message) {
  if (VERBOSE) {
    console.log(message);
  }
}

function logError(message) {
  console.error('\x1b[31m%s\x1b[0m', message);
}

function logSuccess(message) {
  console.log('\x1b[32m%s\x1b[0m', message);
}

function getTypeScriptErrorCount() {
  try {
    const result = execSync('npx tsc --noEmit', { encoding: 'utf8' });
    return 0;
  } catch (error) {
    const errorOutput = error.stdout.toString();
    const matches = errorOutput.match(/Found (\d+) error/);
    if (matches && matches[1]) {
      return parseInt(matches[1], 10);
    }
    return 0;
  }
}

function findTestFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      findTestFiles(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.test.ts') || file.endsWith('.spec.ts')) &&
      fs.readFileSync(filePath, 'utf8').includes('@ts-nocheck')
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fixers for various TypeScript issues in test files
function applyTestFileFixes(content) {
  // Remove @ts-nocheck pragma
  let fixed = content.replace(/\/\/ @ts-nocheck.*?\n/, '');
  
  // Fix import statements with semicolons
  fixed = fixed.replace(/import (.*?) from (.*?),/g, 'import $1 from $2;');
  
  // Fix mock function declarations
  fixed = fixed.replace(/jest\.fn\(\);/g, 'jest.fn(),');
  
  // Fix proper casting to jest.Mock
  fixed = fixed.replace(/\((.*?) as jest\.Mock\)/g, '$1 as jest.Mock');
  
  // Fix comma/semicolon confusion in object literals
  fixed = fixed.replace(/([a-zA-Z0-9_]+)\s*:\s*([^,;\n]*);(\s*[a-zA-Z0-9_}])/g, '$1: $2,$3');
  
  // Fix mockResolvedValue syntax
  fixed = fixed.replace(/mockResolvedValue\(\((\{[^}]*\})\)\)/g, 'mockResolvedValue($1)');
  
  // Fix string literals with trailing semicolons
  fixed = fixed.replace(/'([^']*)';/g, "'$1',");
  
  // Fix double as any
  fixed = fixed.replace(/as any as any/g, 'as any');
  
  // Fix parens in object expression
  fixed = fixed.replace(/\{([^{}]*)\} as any\)/g, '{$1}) as any');
  
  // Fix as any at end of expressions
  fixed = fixed.replace(/as any\);/g, ');');
  
  // Fix jest.Mock usage without parens
  fixed = fixed.replace(/([a-zA-Z0-9_.]+) as jest\.Mock\.mockResolvedValue/g, '($1 as jest.Mock).mockResolvedValue');
  
  // Fix expect().toHaveBeenCalled
  fixed = fixed.replace(/expect\((.*?)\)\.toHaveBeenCalled;/g, 'expect($1).toHaveBeenCalled();');
  
  // Fix object property declarations
  let lines = fixed.split('\n');
  let inObjectLiteral = false;
  let objectDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Track object depth
    if (line.includes('{')) {
      objectDepth += (line.match(/{/g) || []).length;
      inObjectLiteral = true;
    }
    
    if (line.includes('}')) {
      objectDepth -= (line.match(/}/g) || []).length;
      if (objectDepth === 0) {
        inObjectLiteral = false;
      }
    }
    
    // Fix property declarations with semicolons in objects
    if (inObjectLiteral && line.match(/^[a-zA-Z0-9_]+\s*:\s*.+;$/)) {
      lines[i] = lines[i].replace(/;$/, ',');
    }
  }
  
  fixed = lines.join('\n');
  
  // Fix describe/it blocks
  fixed = fixed.replace(/it\('([^']*)',\s*async\(\)\s*=>\s*\{/g, "it('$1', async() => {");
  
  // Fix type assertions in arrays
  fixed = fixed.replace(/\]\s+as\s+any\)/g, '] as any)');
  
  // Fix template literals in mocks (replace with concatenation for Node.js compatibility)
  fixed = fixed.replace(/`([^`$]*)\${([^}]*)}\$?([^`]*)`/g, "'$1' + $2 + '$3'");
  
  return fixed;
}

// File processing function
function processFile(filePath) {
  log(`Processing file: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Apply fixes
  const fixedContent = applyTestFileFixes(content);
  
  // Only write if changes were made and not in dry run mode
  if (fixedContent !== originalContent) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      logSuccess(`Fixed: ${filePath}`);
      return true;
    } else {
      log(`Would fix: ${filePath} (dry run)`);
      return true;
    }
  } else {
    log(`No changes needed: ${filePath}`);
    return false;
  }
}

// Main execution
(async function main() {
  console.log(`Fixing TypeScript errors in test files in directory: ${TARGET_DIR}`);
  
  // Check TypeScript errors before fixes
  if (!SKIP_TYPECHECK) {
    const beforeErrorCount = getTypeScriptErrorCount();
    console.log(`TypeScript errors before fixes: ${beforeErrorCount}`);
  }
  
  // Find all test files with @ts-nocheck
  const testFiles = findTestFiles(TARGET_DIR);
  console.log(`Found ${testFiles.length} test files with @ts-nocheck pragma`);
  
  // Process files
  let fixedCount = 0;
  for (const filePath of testFiles) {
    const fixed = processFile(filePath);
    if (fixed) fixedCount++;
  }
  
  console.log(`Fixed ${fixedCount} files.`);
  
  // Check TypeScript errors after fixes
  if (!DRY_RUN && !SKIP_TYPECHECK) {
    const afterErrorCount = getTypeScriptErrorCount();
    console.log(`TypeScript errors after fixes: ${afterErrorCount}`);
  }
  
  console.log('Done!');
})();