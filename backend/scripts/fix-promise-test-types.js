#!/usr/bin/env node

/**
 * This script fixes Promise-related TypeScript errors in test files.
 * Specifically, it addresses errors like:
 * - TS1477: An instantiation expression cannot be followed by a property access.
 * - Incorrect Promise<T> syntax in mockImplementation
 * - Malformed imports and semicolons in test files
 * 
 * Usage:
 * node scripts/fix-promise-test-types.js
 * 
 * Options:
 * --path=<path>   Specify a specific directory or file to fix (default: src/)
 * --dryrun        Show changes without applying them
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dryrun'),
  path: args.find(arg => arg.startsWith('--path='))?.split('=')[1] || 'src/',
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

console.log(`${COLORS.CYAN}🔧 Promise Test Types Fixer${COLORS.RESET}`);
console.log(`${COLORS.CYAN}================================${COLORS.RESET}`);
console.log(`This script fixes Promise-related TypeScript errors in test files.`);

// Find test files
const findTestFiles = (basePath) => {
  console.log(`Finding test files with errors...`);
  try {
    const command = `find ${basePath} -type f -name "*.test.ts" | xargs grep -l "Promise<.*>\\." || true`;
    const files = execSync(command, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    return files;
  } catch (error) {
    console.error(`Error finding test files: ${error.message}`);
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
  const importFixRegex = /import\s+.*[^;]$/gm;
  content = content.replace(importFixRegex, (match) => {
    if (match.endsWith('/')) {
      fixCount++;
      return match.slice(0, -1) + ';';
    }
    if (!match.endsWith(';')) {
      fixCount++;
      return match + ';';
    }
    return match;
  });

  // 2. Fix Promise<T>.resolve() to Promise.resolve<T>() or just Promise.resolve()
  const promiseResolveRegex = /Promise<(\w+)>\.resolve\(/g;
  content = content.replace(promiseResolveRegex, (match, type) => {
    fixCount++;
    return `Promise.resolve(`;
  });

  // 3. Fix malformed function implementations and return blocks
  const fnImplRegex = /mockImplementation\(\(\) => {return {/g;
  content = content.replace(fnImplRegex, (match) => {
    fixCount++;
    return `mockImplementation(() => {\n      return {`;
  });

  // 4. Fix trailing slashes at end of lines
  const trailingSlashRegex = /\/\)(?![\s\S]*\/\))/g;
  content = content.replace(trailingSlashRegex, (match) => {
    fixCount++;
    return ')';
  });

  // 5. Fix misplaced commas instead of semicolons
  const commaSemicolonRegex = /expect\([^)]+\)\.toBe\([^)]+\)\s*,/g;
  content = content.replace(commaSemicolonRegex, (match) => {
    fixCount++;
    return match.replace(',', ';');
  });

  // 6. Fix typos in JSON syntax (especially in mocks)
  const jsonStructureRegex = /{([^{}]*),\s*}/g;
  content = content.replace(jsonStructureRegex, (match, inner) => {
    // Only apply if it appears to be a trailing comma issue
    if (inner.trim().endsWith(',')) {
      fixCount++;
      return `{${inner.replace(/,\s*$/, '')} }`;
    }
    return match;
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

// Main execution
const main = () => {
  const testFiles = findTestFiles(options.path);
  
  if (testFiles.length === 0) {
    console.log(`${COLORS.YELLOW}No test files with Promise type errors found.${COLORS.RESET}`);
    return;
  }
  
  console.log(`Found ${testFiles.length} test files with errors`);
  
  let totalFixed = 0;
  let filesModified = 0;
  
  testFiles.forEach(file => {
    const { modified, fixCount } = applyFixes(file);
    if (modified) filesModified++;
    totalFixed += fixCount;
  });
  
  if (options.dryRun) {
    console.log(`\n${COLORS.YELLOW}🔍 Dry run: Would fix ${totalFixed} errors in ${filesModified} files${COLORS.RESET}`);
  } else {
    console.log(`\n${COLORS.GREEN}🎉 Fixed ${totalFixed} errors in ${filesModified} files${COLORS.RESET}`);
  }
  
  console.log(`\nRun TypeScript check to see remaining errors:`);
  console.log(`$ npx tsc --noEmit`);
};

// Run the script
main();