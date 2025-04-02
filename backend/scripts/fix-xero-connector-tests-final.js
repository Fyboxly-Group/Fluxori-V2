/**
 * Final fix script for Xero connector test files
 * 
 * This script applies a more thorough approach to fixing syntax issues
 * in the Xero connector test files. It uses a detailed linting approach
 * to fix each type of syntax issue correctly.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const SKIP_TYPECHECK = process.argv.includes('--skip-typecheck');
const TARGET_DIR = '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/xero-connector/tests';

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

// Line-by-line transformer
function transformLines(content) {
  const lines = content.split('\n');
  let fixed = [];
  let depth = 0;
  let inObjectLiteral = false;
  let inArrayLiteral = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Track depth of braces
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    
    // Track depth of brackets
    const openBrackets = (line.match(/\[/g) || []).length;
    const closeBrackets = (line.match(/\]/g) || []).length;
    
    // Track if we're in an object or array literal
    if (line.includes('{') && !line.includes('}')) {
      inObjectLiteral = true;
    } else if (line.includes('}') && !line.includes('{')) {
      inObjectLiteral = false;
    }
    
    if (line.includes('[') && !line.includes(']')) {
      inArrayLiteral = true;
    } else if (line.includes(']') && !line.includes('[')) {
      inArrayLiteral = false;
    }
    
    // Update depth
    depth += openBraces - closeBraces + openBrackets - closeBrackets;
    
    // Fix import statements with commas
    if (line.trim().startsWith('import ') && line.endsWith(',')) {
      line = line.replace(/,$/, ';');
    }
    
    // Fix jest.fn() with semicolons
    if (line.includes('jest.fn();')) {
      line = line.replace(/jest\.fn\(\);/g, 'jest.fn(),');
    }
    
    // Fix property declarations with semicolons
    if (inObjectLiteral && line.trim().match(/[a-zA-Z0-9_]+\s*:\s*.+;$/)) {
      line = line.replace(/;$/, ',');
    }
    
    // Fix string literals with semicolons
    if (line.match(/'[^']*';/)) {
      line = line.replace(/'([^']*)';/g, "'$1',");
    }
    
    // Fix parentheses in type casting
    if (line.includes('as jest.Mock')) {
      line = line.replace(/\(([a-zA-Z0-9_.]+)\s+as\s+jest\.Mock\)/, '$1 as jest.Mock');
    }
    
    // Fix mockResolvedValue syntax
    if (line.includes('mockResolvedValue((')) {
      line = line.replace(/mockResolvedValue\(\(([^)]*)\)\)/, 'mockResolvedValue($1)');
    }
    
    // Store the fixed line
    fixed.push(line);
  }
  
  return fixed.join('\n');
}

// Complete file fixer
function fixFile(content) {
  // First pass: Remove @ts-nocheck pragma
  let fixed = content.replace(/\/\/ @ts-nocheck.*?\n/, '');
  
  // Fix import statements
  fixed = fixed.replace(/import\s+(.*?)\s+from\s+(.*?),/g, 'import $1 from $2;');
  
  // Fix object literals with semicolons
  fixed = fixed.replace(/([a-zA-Z0-9_]+)\s*:\s*([^;,]*);(?!\s*$)/g, '$1: $2,');
  
  // Fix string literals with semicolons
  fixed = fixed.replace(/'([^']*)';(?!\s*[,})])/g, "'$1',");
  
  // Fix double 'as any'
  fixed = fixed.replace(/as any as any/g, 'as any');
  
  // Fix mock functions
  fixed = fixed.replace(/jest\.fn\(\);(?!\s*[,})])/g, 'jest.fn(),');
  
  // Fix method calls with semicolons
  fixed = fixed.replace(/(\w+)\.(\w+)\(\);(?!\s*[,);])/g, '$1.$2(),');
  
  // Fix missing parentheses in .mockResolvedValue
  fixed = fixed.replace(/(\w+\s+as\s+jest\.Mock)\.mockResolvedValue/g, '($1).mockResolvedValue');
  
  // Fix incorrectly closed braces in objects
  fixed = fixed.replace(/(\{[^{}]*);(\s*\})/g, '$1,$2');
  
  // Fix incorrectly closed parentheses
  fixed = fixed.replace(/\)';/g, ")',");
  
  // Fix unclosed parentheses in mockResolvedValue
  fixed = fixed.replace(/mockResolvedValue\(\(({[^{}]*})\)\)/g, 'mockResolvedValue($1)');
  
  // Fix misplaced parentheses in type casting
  fixed = fixed.replace(/\((\w+\.\w+) as jest\.Mock\)/g, '$1 as jest.Mock');
  
  // Apply line-by-line transformer for more complex fixes
  fixed = transformLines(fixed);
  
  return fixed;
}

// Main file processing function
function processFile(filePath) {
  log(`Processing file: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Apply thorough fixes
  const fixedContent = fixFile(content);
  
  // Only write if changes were made and not in dry run mode
  if (fixedContent !== originalContent) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      logSuccess(`Fixed: ${filePath}`);
    } else {
      log(`Would fix: ${filePath} (dry run)`);
    }
    return true;
  } else {
    log(`No changes needed: ${filePath}`);
    return false;
  }
}

// Find and process files
function processDirectory(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  let fixedCount = 0;
  
  for (const file of files) {
    if (file.endsWith('.test.ts')) {
      const filePath = path.join(directoryPath, file);
      const fixed = processFile(filePath);
      if (fixed) fixedCount++;
    }
  }
  
  return fixedCount;
}

// Main execution
(async function main() {
  console.log('Final fix for TypeScript errors in Xero connector test files...');
  
  // Check TypeScript errors before fixes
  if (!SKIP_TYPECHECK) {
    const beforeErrorCount = getTypeScriptErrorCount();
    console.log(`TypeScript errors before fixes: ${beforeErrorCount}`);
  }
  
  // Process files
  const fixedCount = processDirectory(TARGET_DIR);
  console.log(`Fixed ${fixedCount} files.`);
  
  // Check TypeScript errors after fixes
  if (!DRY_RUN && !SKIP_TYPECHECK) {
    const afterErrorCount = getTypeScriptErrorCount();
    console.log(`TypeScript errors after fixes: ${afterErrorCount}`);
  }
  
  console.log('Done!');
})();