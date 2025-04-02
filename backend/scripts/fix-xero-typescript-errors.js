#!/usr/bin/env node

/**
 * Script to fix TypeScript errors in Xero connector module
 * This script targets common error patterns in the Xero files and fixes them
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}🔧 Fixing TypeScript Errors in Xero Connector Module${colors.reset}`);
console.log(`${colors.cyan}=====================================================${colors.reset}`);

// Define fix patterns
const fixPatterns = [
  // Fix 1: Extra closing bracket in constructor
  {
    description: 'Fix extra closing bracket in constructor',
    pattern: /(\s+\}\);)\s+(\s+\})/g,
    replacement: '$2'
  },
  
  // Fix 2: Missing comma in return type
  {
    description: 'Fix missing comma in Promise return type',
    pattern: /(Promise<.*?)(\s+)([a-zA-Z0-9_]+:)/g,
    replacement: '$1,$2$3'
  },
  
  // Fix 3: Extra semicolons in object properties
  {
    description: 'Fix extra semicolons in object properties',
    pattern: /([a-zA-Z0-9_]+)(\s*:\s*[^,;{}\n]+);(\s*[,}])/g,
    replacement: '$1$2$3'
  },
  
  // Fix 4: Double "as string" casts
  {
    description: 'Fix redundant type casts',
    pattern: /as string as string(?: as string)*/g,
    replacement: 'as string'
  },
  
  // Fix 5: Fix unexpected tokens and declaration errors
  {
    description: 'Fix unexpected tokens and declaration errors',
    pattern: /public\s+([a-zA-Z0-9_]+)\([^)]*\)(?:\s*:\s*[^{]+)?\s*{[\s\S]*?\n\s*\}\s*>\s*{/g,
    replacement: function(match) {
      // Extract method declaration up to first {
      const methodStart = match.match(/public\s+([a-zA-Z0-9_]+)\([^)]*\)(?:\s*:\s*[^{]+)?\s*{/)[0];
      // Find the last } in the match (closing the method)
      const lastIndex = match.lastIndexOf('}');
      return methodStart + match.substring(methodStart.length, lastIndex + 1);
    }
  },
  
  // Fix 6: Fix interface definition in conditional
  {
    description: 'Fix problematic error handling in catch blocks',
    pattern: /catch\(error\) \{\s*const errorMessage = error instanceof Error.*?(?:\)\)\)|String\(error\)\))/g,
    replacement: 'catch(error) {'
  }
];

// Function to process a single file
function processFile(filePath) {
  console.log(`\nProcessing ${path.relative(process.cwd(), filePath)}`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixCount = 0;
  
  // Apply each fix pattern
  for (const fix of fixPatterns) {
    const beforeContent = content;
    content = content.replace(fix.pattern, fix.replacement);
    
    if (content !== beforeContent) {
      const matches = beforeContent.match(fix.pattern) || [];
      console.log(`${colors.green}✓ ${fix.description}: ${matches.length} matches fixed${colors.reset}`);
      fixCount += matches.length;
    }
  }
  
  // Only write back if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`${colors.green}✓ Fixed ${fixCount} issues in ${path.basename(filePath)}${colors.reset}`);
    return fixCount;
  } else {
    console.log(`${colors.yellow}⚠ No fixes applied to ${path.basename(filePath)}${colors.reset}`);
    return 0;
  }
}

// Function to find specific files to test the script
function getTestFiles() {
  return [
    path.resolve(__dirname, '../src/modules/xero-connector/services/xero-auth.service.ts')
  ];
}

// Function to get all Xero module files
function getAllXeroFiles() {
  return glob.sync('src/modules/xero-connector/**/*.ts', {
    cwd: path.resolve(__dirname, '..'),
    absolute: true
  });
}

// Main execution
const testMode = process.argv.includes('--test');
const files = testMode ? getTestFiles() : getAllXeroFiles();

console.log(`Running in ${testMode ? 'TEST' : 'FULL'} mode`);
console.log(`Found ${files.length} files to process`);

let totalFixCount = 0;
for (const file of files) {
  totalFixCount += processFile(file);
}

console.log(`\n${colors.green}✅ Fixed ${totalFixCount} issues in ${files.length} files${colors.reset}`);

if (testMode) {
  console.log(`\n${colors.yellow}This was a test run. To fix all files, run:${colors.reset}`);
  console.log(`node ${path.basename(__filename)}`);
}

// Validation step - check if TypeScript errors remain in fixed files
try {
  console.log(`\n${colors.cyan}Validating fixes...${colors.reset}`);
  
  // Only validate the test file in test mode
  const fileToValidate = testMode ? 
    path.relative(process.cwd(), files[0]) : 
    'src/modules/xero-connector/services/xero-auth.service.ts';
  
  // Use TypeScript compiler to check
  const { execSync } = require('child_process');
  const result = execSync(`npx tsc --noEmit ${fileToValidate} 2>&1 || true`, { encoding: 'utf8' });
  
  if (result.includes('error TS')) {
    console.log(`\n${colors.yellow}⚠️ Some TypeScript errors remain in ${fileToValidate}:${colors.reset}`);
    console.log(result.split('\n').slice(0, 10).join('\n') + (result.split('\n').length > 10 ? '\n...' : ''));
  } else {
    console.log(`\n${colors.green}✅ No TypeScript errors in ${fileToValidate}!${colors.reset}`);
  }
} catch (error) {
  console.error(`\n${colors.red}❌ Validation failed:${colors.reset}`, error.message);
}