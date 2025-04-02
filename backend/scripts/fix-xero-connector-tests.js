/**
 * Fix TypeScript errors in Xero connector test files
 * 
 * This script specifically targets the Xero connector test files with @ts-nocheck pragmas:
 * - xero-contact.service.test.ts
 * - xero-invoice.service.test.ts
 * - xero-webhook.service.test.ts
 * - xero-auth.service.test.ts
 * 
 * Common issues fixed:
 * - Mock function declarations with semicolons instead of commas
 * - Object property declarations with semicolons instead of commas
 * - String literals with semicolons
 * - Type casting syntax issues
 * - Missing parentheses in function calls
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

// Fixers
function fixMockFunctionDeclarations(content) {
  // Fix jest.fn(); -> jest.fn(),
  return content.replace(/jest\.fn\(\);(?!,\s*$)/g, 'jest.fn(),');
}

function fixObjectPropertyDeclarations(content) {
  // Find objects with property declarations using semicolons instead of commas
  return content.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([^,;\s][^;]*);(?=\s*[a-zA-Z_])/g, '$1: $2,');
}

function fixStringLiterals(content) {
  // Fix string literals with semicolons: 'string'; -> 'string',
  return content.replace(/'([^']*)';(?!\s*[,)])/g, "'$1',");
}

function fixTypeCastingSyntax(content) {
  // Fix as any as any -> as any
  return content.replace(/as any as any/g, 'as any');
}

function fixMissingParentheses(content) {
  // Fix (mockAccountingApi.updateContact as jest.Mock)
  return content.replace(/\(([\w.]+) as jest\.Mock\)/g, '$1 as jest.Mock');
}

function fixTestSyntaxErrors(content) {
  // Fix various test-specific syntax errors
  let fixed = content;
  
  // Fix missing parentheses in expect statements
  fixed = fixed.replace(/expect\(([\w.]+)\.toHaveBeenCalled\)/g, 'expect($1).toHaveBeenCalled()');
  
  // Fix errant semicolons in describe/it blocks
  fixed = fixed.replace(/it\('([^']*)',\s*async\(\)\s*=>\s*{/g, "it('$1', async() => {");
  
  // Fix mockResolvedValue syntax
  fixed = fixed.replace(/mockResolvedValue\(\(({[^}]*})\)\)/g, 'mockResolvedValue($1)');
  
  return fixed;
}

function removeNoCheckPragma(content) {
  return content.replace(/\/\/ @ts-nocheck.*?\n/, '');
}

// Main file processing function
function processFile(filePath) {
  log(`Processing file: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Apply fixers
  content = fixMockFunctionDeclarations(content);
  content = fixObjectPropertyDeclarations(content);
  content = fixStringLiterals(content);
  content = fixTypeCastingSyntax(content);
  content = fixMissingParentheses(content);
  content = fixTestSyntaxErrors(content);
  content = removeNoCheckPragma(content);
  
  // Only write if changes were made and not in dry run mode
  if (content !== originalContent) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf8');
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
  console.log('Fixing TypeScript errors in Xero connector test files...');
  
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