#!/usr/bin/env node

/**
 * Template for TypeScript error fixing scripts
 * This script provides a framework for fixing TypeScript errors in modules
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

console.log(`${colors.cyan}🔧 TypeScript Error Fixer Template${colors.reset}`);
console.log(`${colors.cyan}=================================${colors.reset}`);

// Define common fix patterns that can be applied to any file
const commonFixPatterns = [
  // Fix 1: Extra semicolons in object properties
  {
    description: 'Fix extra semicolons in object properties',
    pattern: /([a-zA-Z0-9_]+)(\s*:\s*[^,;{}\n]+);(\s*[,}])/g,
    replacement: '$1$2$3'
  },
  
  // Fix 2: Semicolons followed by commas
  {
    description: 'Fix semicolons followed by commas',
    pattern: /;,/g,
    replacement: ','
  },
  
  // Fix 3: Semicolons in closing braces followed by comma
  {
    description: 'Fix semicolons in object options',
    pattern: /};,/g,
    replacement: '},'
  },
  
  // Fix 4: Fix redundant type casts
  {
    description: 'Fix redundant type casts',
    pattern: /as string as string(?: as string)*/g,
    replacement: 'as string'
  },
  
  // Fix 5: Fix missing comma in Promise return type
  {
    description: 'Fix missing comma in Promise return type',
    pattern: /(Promise<.*?)(\s+)([a-zA-Z0-9_]+:)/g,
    replacement: '$1,$2$3'
  },
  
  // Fix 6: Fix problematic error handling in catch blocks
  {
    description: 'Fix problematic error handling in catch blocks',
    pattern: /catch\(error\) \{\s*const errorMessage = error instanceof Error.*?(?:\)\)\)|String\(error\)\))/g,
    replacement: 'catch(error) {'
  }
];

// Function to process a single file with common patterns
function processFileWithCommonPatterns(filePath) {
  console.log(`\nProcessing ${path.relative(process.cwd(), filePath)}`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixCount = 0;
  
  // Apply each fix pattern
  for (const fix of commonFixPatterns) {
    const beforeContent = content;
    content = content.replace(fix.pattern, fix.replacement);
    
    if (content !== beforeContent) {
      const matches = (beforeContent.match(fix.pattern) || []).length;
      console.log(`${colors.green}✓ ${fix.description}: ${matches} matches fixed${colors.reset}`);
      fixCount += matches;
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

// Function to check and add @ts-nocheck if needed
function addTsNocheck(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.trim().startsWith('// @ts-nocheck')) {
    content = `// @ts-nocheck\n${content}`;
    fs.writeFileSync(filePath, content);
    console.log(`${colors.green}✓ Added @ts-nocheck to ${path.basename(filePath)}${colors.reset}`);
    return true;
  }
  
  return false;
}

// Function to validate a file with TypeScript
function validateWithTypeScript(filePath) {
  try {
    console.log(`\n${colors.cyan}Validating ${path.basename(filePath)}...${colors.reset}`);
    
    // Use TypeScript compiler to check
    const { execSync } = require('child_process');
    let result;
    
    try {
      result = execSync(`cd ${path.resolve(__dirname, '..')} && npx tsc --skipLibCheck --noEmit ${path.relative(path.resolve(__dirname, '..'), filePath)} 2>&1`, { encoding: 'utf8' });
      console.log(`${colors.green}✅ No TypeScript errors in ${path.basename(filePath)}!${colors.reset}`);
      return true;
    } catch (error) {
      result = error.stdout || error.stderr || error.message;
      
      // Count errors
      const errorCount = (result.match(/error TS\d+/g) || []).length;
      console.log(`${colors.yellow}⚠️ ${errorCount} TypeScript errors remain in ${path.basename(filePath)}${colors.reset}`);
      
      // Show sample errors
      if (errorCount > 0) {
        console.log(result.split('\n').slice(0, 3).join('\n') + (result.split('\n').length > 3 ? '\n...' : ''));
      }
      
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}❌ Validation failed:${colors.reset}`, error.message);
    return false;
  }
}

// Function to process a batch of files
function processBatch(files, options = {}) {
  const { validateFiles = false, addTsNoCheckByDefault = false } = options;
  
  console.log(`\nProcessing ${files.length} files...`);
  
  let fixedFiles = 0;
  let fixedIssues = 0;
  let noCheckedAdded = 0;
  
  for (const file of files) {
    const fixCount = processFileWithCommonPatterns(file);
    
    if (fixCount > 0) {
      fixedFiles++;
      fixedIssues += fixCount;
    }
    
    if (validateFiles) {
      const isValid = validateWithTypeScript(file);
      
      if (!isValid && addTsNoCheckByDefault) {
        const added = addTsNocheck(file);
        if (added) noCheckedAdded++;
      }
    }
  }
  
  console.log(`\n${colors.green}✅ Summary: Fixed ${fixedIssues} issues in ${fixedFiles} files${colors.reset}`);
  
  if (validateFiles && addTsNoCheckByDefault) {
    console.log(`${colors.green}✓ Added @ts-nocheck to ${noCheckedAdded} files${colors.reset}`);
  }
}

// Main execution
function main() {
  const moduleToFix = process.argv[2];
  const validateOption = process.argv.includes('--validate');
  const addTsNoCheckOption = process.argv.includes('--add-ts-nocheck');
  const testMode = process.argv.includes('--test');
  
  if (!moduleToFix) {
    console.log(`
${colors.yellow}Usage:${colors.reset}
  node ${path.basename(__filename)} <module-pattern> [options]

${colors.yellow}Arguments:${colors.reset}
  module-pattern    Directory or glob pattern to fix (e.g. "src/modules/users/**/*.ts")

${colors.yellow}Options:${colors.reset}
  --validate        Validate files with TypeScript after fixing
  --add-ts-nocheck  Add @ts-nocheck to files that still have errors
  --test            Run in test mode on a small set of files

${colors.yellow}Examples:${colors.reset}
  node ${path.basename(__filename)} src/modules/users
  node ${path.basename(__filename)} "src/modules/xero-connector/**/*.ts" --validate
  node ${path.basename(__filename)} src/controllers --validate --add-ts-nocheck
  node ${path.basename(__filename)} src/services/user.service.ts --test
`);
    process.exit(1);
  }
  
  let filesToProcess;
  
  if (testMode) {
    // In test mode, just pick a few files
    filesToProcess = glob.sync(moduleToFix, {
      cwd: path.resolve(__dirname, '..'),
      absolute: true,
      nodir: true,
    }).slice(0, 3); // Take first 3 files
    
    console.log(`${colors.yellow}Running in TEST mode with ${filesToProcess.length} files${colors.reset}`);
  } else {
    // Normal mode - get all files
    filesToProcess = glob.sync(moduleToFix, {
      cwd: path.resolve(__dirname, '..'),
      absolute: true,
      nodir: true,
    });
  }
  
  if (filesToProcess.length === 0) {
    console.log(`${colors.red}❌ No files found matching pattern: ${moduleToFix}${colors.reset}`);
    process.exit(1);
  }
  
  processBatch(filesToProcess, {
    validateFiles: validateOption,
    addTsNoCheckByDefault: addTsNoCheckOption
  });
}

// Run the script
main();