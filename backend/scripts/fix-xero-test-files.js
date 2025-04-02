#!/usr/bin/env node

/**
 * This script fixes TypeScript errors in Xero connector test files.
 * It's specialized for the specific patterns found in the Xero module.
 * 
 * Issues fixed:
 * - Promise<T>.resolve() syntax errors
 * - Malformed imports and trailing slashes
 * - Function implementation formatting
 * - Missing semicolons and incorrect commas
 * 
 * Usage:
 * node scripts/fix-xero-test-files.js
 * 
 * Options:
 * --dryrun        Show changes without applying them
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dryrun'),
  debug: args.includes('--debug')
};

// Terminal colors for output
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m'
};

console.log(`${COLORS.CYAN}🔧 Xero Test Files Fixer${COLORS.RESET}`);
console.log(`${COLORS.CYAN}================================${COLORS.RESET}`);
console.log(`This script fixes TypeScript errors specific to Xero connector test files.`);

// Find Xero test files
const findXeroTestFiles = () => {
  console.log(`Finding Xero test files...`);
  try {
    const baseDir = 'src/modules/xero-connector/tests';
    const files = fs.readdirSync(baseDir)
      .filter(file => file.endsWith('.test.ts'))
      .map(file => path.join(baseDir, file));
    return files;
  } catch (error) {
    console.error(`Error finding Xero test files: ${error.message}`);
    return [];
  }
};

// Apply fixes to a file
const applyFixes = (filePath) => {
  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let fixCount = 0;

  // 1. Fix import statements with trailing slashes and missing semicolons
  const importFixRegex = /import\s+.*['"][^;]*['"][^;]*$/gm;
  content = content.replace(importFixRegex, (match) => {
    if (match.includes('/;')) {
      fixCount++;
      return match.replace('/;', ';');
    }
    if (!match.endsWith(';')) {
      fixCount++;
      return match + ';';
    }
    return match;
  });

  // 2. Fix Promise<T>.resolve() to Promise.resolve()
  const promiseResolveRegex = /Promise<[^>]*>\.resolve\(/g;
  content = content.replace(promiseResolveRegex, (match) => {
    fixCount++;
    return `Promise.resolve(`;
  });

  // 3. Fix malformed function implementations and return blocks
  const fnImplRegex = /mockImplementation\(\(\) =>\s*{return {/g;
  content = content.replace(fnImplRegex, (match) => {
    fixCount++;
    return `mockImplementation(() => {\n      return {`;
  });

  // 4. Fix trailing slashes at end of lines
  const trailingSlashRegex = /([a-zA-Z0-9_'")])\/([),;])/g;
  content = content.replace(trailingSlashRegex, (match, before, after) => {
    fixCount++;
    return `${before}${after}`;
  });

  // 5. Fix misplaced commas instead of semicolons in expect statements
  const expectCommaRegex = /(expect\([^)]+\)[^;]*),(\s*}|\s*\)|\s*\/|\s*$)/g;
  content = content.replace(expectCommaRegex, (match, expectStmt, after) => {
    fixCount++;
    return `${expectStmt};${after}`;
  });

  // 6. Fix malformed function call arguments without commas
  const argsWithoutCommas = /\(([^)]*[a-zA-Z0-9_])\s+(['"][^'"]*['"])\)/g;
  content = content.replace(argsWithoutCommas, (match, arg1, arg2) => {
    fixCount++;
    return `(${arg1}, ${arg2})`;
  });

  // 7. Fix Promise type patterns in Xero test files
  const xeroSpecificPromiseRegex = /(apiCallback|updateTenants|refreshToken):\s*jest\.fn\(\)\.mockImplementation\(\(\) => Promise<[^>]*>\.resolve/g;
  content = content.replace(xeroSpecificPromiseRegex, (match) => {
    fixCount++;
    return match.replace(/Promise<[^>]*>\.resolve/, 'Promise.resolve');
  });

  // 8. Fix mock implementation return object formatting
  const mockReturnRegex = /mockXeroClient\.mockImplementation\(\(\) =>\s*{return\s*{([^}]*)};?\s*}\);/g;
  content = content.replace(mockReturnRegex, (match, inner) => {
    fixCount++;
    return `mockXeroClient.mockImplementation(() => {\n        return {\n          ${inner.trim()}\n        };\n      });`;
  });

  // Only write if we made changes and not in dry run mode
  if (fixCount > 0 && !options.dryRun) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`${COLORS.GREEN}✅ Fixed ${fixCount} errors in ${filePath}${COLORS.RESET}`);
    modified = true;
  } else if (fixCount > 0) {
    console.log(`${COLORS.YELLOW}🔍 Would fix ${fixCount} errors in ${filePath} (dry run)${COLORS.RESET}`);
  } else {
    console.log(`${COLORS.BLUE}ℹ️ No issues found in ${filePath}${COLORS.RESET}`);
  }

  return { modified, fixCount };
};

// Check if fixes were successful
const verifyFixes = (filePath) => {
  try {
    const command = `cd /home/tarquin_stapa/Fluxori-V2/backend && npx tsc --noEmit ${filePath}`;
    execSync(command, { encoding: 'utf-8' });
    return true;
  } catch (error) {
    console.log(`${COLORS.RED}❌ TypeScript errors remain in ${filePath}${COLORS.RESET}`);
    return false;
  }
};

// Main execution
const main = () => {
  const testFiles = findXeroTestFiles();
  
  if (testFiles.length === 0) {
    console.log(`${COLORS.YELLOW}No Xero test files found.${COLORS.RESET}`);
    return;
  }
  
  console.log(`Found ${testFiles.length} Xero test files`);
  
  let totalFixed = 0;
  let filesModified = 0;
  let filesVerified = 0;
  
  testFiles.forEach(file => {
    const { modified, fixCount } = applyFixes(file);
    if (modified) {
      filesModified++;
      totalFixed += fixCount;
      
      // Verify fixes if not in dry run mode
      if (!options.dryRun && verifyFixes(file)) {
        filesVerified++;
      }
    }
  });
  
  if (options.dryRun) {
    console.log(`\n${COLORS.YELLOW}🔍 Dry run: Would fix ${totalFixed} errors in ${filesModified} files${COLORS.RESET}`);
  } else if (filesModified > 0) {
    console.log(`\n${COLORS.GREEN}🎉 Fixed ${totalFixed} errors in ${filesModified} files${COLORS.RESET}`);
    console.log(`${COLORS.GREEN}✓ Successfully verified ${filesVerified}/${filesModified} files${COLORS.RESET}`);
  } else {
    console.log(`\n${COLORS.BLUE}ℹ️ No files needed fixing${COLORS.RESET}`);
  }
  
  console.log(`\nRun TypeScript check to see remaining errors:`);
  console.log(`$ npx tsc --noEmit src/modules/xero-connector/**/*.ts`);
};

// Run the script
main();