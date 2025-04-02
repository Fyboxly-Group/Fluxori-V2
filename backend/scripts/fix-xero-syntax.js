#!/usr/bin/env node

/**
 * Xero Module Syntax Fixer
 * ========================
 * This script specifically targets syntax errors in the Xero connector module.
 * 
 * Usage:
 * node scripts/fix-xero-syntax.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\x1b[36m%s\x1b[0m', '🔧 Xero Module Syntax Fixer');
console.log('\x1b[36m%s\x1b[0m', '========================');
console.log('Fixing common syntax errors in the Xero connector module\n');

// Find Xero module files
function findXeroFiles() {
  console.log('Finding Xero module files...');
  try {
    const command = `find src/modules/xero-connector -name "*.ts"`;
    const files = execSync(command, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    console.log(`Found ${files.length} Xero module files\n`);
    return files;
  } catch (error) {
    console.error('Error finding Xero files:', error.message);
    return [];
  }
}

// Define specific fixes for Xero syntax issues
const fixPatterns = [
  {
    name: 'Missing commas in property assignments',
    pattern: /(\w+):\s*(['"][^'"]*['"]|\w+)\s*\n\s+(\w+):/g,
    replacement: (match, prop1, value, prop2) => `${prop1}: ${value},\n    ${prop2}:`
  },
  {
    name: 'Missing parentheses in conditional expressions',
    pattern: /if\s+\([^)]*(?<!\))\s*\{/g,
    replacement: (match) => match.replace('{', ') {')
  },
  {
    name: 'Malformed async/await expressions',
    pattern: /const\s+(\w+)\s+=\s+await\s+([^;(]+)\(/g,
    replacement: (match, varName, fnName) => `const ${varName} = await ${fnName}(`
  },
  {
    name: 'Missing return type annotations',
    pattern: /(async\s+\w+\([^)]*\))\s*{/g,
    replacement: (match, fnDef) => `${fnDef}: Promise<any> {`
  },
  {
    name: 'Xero token typing issues',
    pattern: /tokenSet\.(refresh_token|access_token|id_token)/g,
    replacement: (match, tokenType) => `tokenSet.${tokenType} as string`
  },
  {
    name: 'Missing semicolons in return statements',
    pattern: /return\s+{[^}]*}\s*(?!;)/g,
    replacement: (match) => `${match};`
  },
  {
    name: 'Mongoose schema property semicolons',
    pattern: /(type:\s*\w+)(?=,|\s*\n)/g,
    replacement: (match) => `${match}`
  },
  {
    name: 'Missing async return type',
    pattern: /(export\s+async\s+function\s+\w+\([^)]*\))\s*{/g,
    replacement: (match, fnDef) => `${fnDef}: Promise<any> {`
  },
  {
    name: 'Xero client constructor arguments',
    pattern: /new\s+XeroClient\({[^}]*(?<!\n\s+})\)/g,
    replacement: (match) => {
      if (!match.includes('\n')) {
        return match;
      }
      return match.replace(/\)$/, '\n  })');
    }
  }
];

// Apply fixes to a file
function applyXeroSyntaxFixes(filePath) {
  console.log(`Processing ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;
    
    let fixCount = 0;
    let fixDetails = {};
    
    // Apply each fix pattern
    fixPatterns.forEach(({ name, pattern, replacement }) => {
      const before = content;
      content = content.replace(pattern, replacement);
      
      if (content !== before) {
        const matches = (before.match(pattern) || []).length;
        fixCount += matches;
        fixDetails[name] = (fixDetails[name] || 0) + matches;
      }
    });
    
    // Only write if changed
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`\x1b[32m✓ Fixed ${fixCount} issues in ${filePath}\x1b[0m`);
      
      // Print fix details
      Object.entries(fixDetails).forEach(([name, count]) => {
        console.log(`  - ${name}: ${count}`);
      });
      
      return { fixed: true, count: fixCount };
    } else {
      console.log(`No syntax issues found in ${filePath}`);
      return { fixed: false, count: 0 };
    }
  } catch (error) {
    console.error(`\x1b[31m× Error processing ${filePath}: ${error.message}\x1b[0m`);
    return { fixed: false, count: 0 };
  }
}

// Main execution
function main() {
  const files = findXeroFiles();
  
  if (files.length === 0) {
    console.log('No Xero module files found.');
    return;
  }
  
  let totalFixed = 0;
  let filesFixed = 0;
  
  files.forEach(file => {
    const { fixed, count } = applyXeroSyntaxFixes(file);
    if (fixed) {
      filesFixed++;
      totalFixed += count;
    }
  });
  
  console.log(`\n\x1b[32m🎉 Fixed ${totalFixed} syntax issues in ${filesFixed} files\x1b[0m`);
  console.log('\nRun TypeScript check to verify the changes:');
  console.log('$ npx tsc --skipLibCheck --noEmit src/modules/xero-connector/**/*.ts');
}

main();