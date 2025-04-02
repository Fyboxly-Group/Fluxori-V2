#!/usr/bin/env node

/**
 * TypeScript Promise Pattern Fixer
 * ================================
 * This script addresses common TypeScript errors in test files, particularly those
 * related to Promise syntax, mock implementations, and Jest assertions.
 * 
 * It fixes:
 * - TS1477: An instantiation expression cannot be followed by a property access.
 * - Import statement formatting and missing semicolons
 * - Function implementation formatting issues
 * - Incorrect Promise<T>.resolve() syntax
 * - Trailing slashes and other punctuation errors
 * 
 * Usage:
 * node scripts/ts-fix-promise-patterns.js [options]
 * 
 * Options:
 * --path=<path>     Specify a directory or file to process (default: src/)
 * --include=<ext>   File extensions to include (default: .test.ts)
 * --verbose         Show detailed logging
 * --dryrun          Show changes without applying them
 * --verify          Check if files compile after fixing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  path: args.find(arg => arg.startsWith('--path='))?.split('=')[1] || 'src/',
  include: args.find(arg => arg.startsWith('--include='))?.split('=')[1] || '.test.ts',
  dryRun: args.includes('--dryrun'),
  verbose: args.includes('--verbose'),
  verify: args.includes('--verify'),
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

console.log(`${COLORS.CYAN}🔧 TypeScript Promise Pattern Fixer${COLORS.RESET}`);
console.log(`${COLORS.CYAN}====================================${COLORS.RESET}`);
console.log(`This script fixes common TypeScript errors related to Promises and async patterns.`);

// Log output if verbose mode is enabled
const log = (message) => {
  if (options.verbose) {
    console.log(message);
  }
};

// Find all relevant files
const findFiles = () => {
  log(`Finding files with pattern ${options.include} in ${options.path}...`);
  try {
    const command = `find ${options.path} -type f -name "*${options.include}"`;
    const files = execSync(command, { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    return files;
  } catch (error) {
    console.error(`${COLORS.RED}Error finding files: ${error.message}${COLORS.RESET}`);
    return [];
  }
};

// Define fix patterns - each with a regex pattern and replacement function
const fixPatterns = [
  {
    name: 'Import statement formatting',
    pattern: /import\s+.*['"][^;]*['"][^;]*$/gm,
    replacement: (match) => {
      if (match.includes('/;')) {
        return match.replace('/;', ';');
      }
      if (!match.endsWith(';')) {
        return match + ';';
      }
      return match;
    }
  },
  {
    name: 'Promise<T>.resolve() syntax',
    pattern: /Promise<[^>]*>\.resolve\(/g,
    replacement: () => 'Promise.resolve('
  },
  {
    name: 'Promise<T>.reject() syntax',
    pattern: /Promise<[^>]*>\.reject\(/g,
    replacement: () => 'Promise.reject('
  },
  {
    name: 'Function implementation formatting',
    pattern: /mockImplementation\(\(\) =>\s*{return {/g,
    replacement: () => 'mockImplementation(() => {\n      return {'
  },
  {
    name: 'Trailing slashes',
    pattern: /([a-zA-Z0-9_'")])\/([),;])/g,
    replacement: (match, before, after) => `${before}${after}`
  },
  {
    name: 'Commas instead of semicolons in assertions',
    pattern: /(expect\([^)]+\)[^;]*),(\s*}|\s*\)|\s*\/|\s*$)/g,
    replacement: (match, expectStmt, after) => `${expectStmt};${after}`
  },
  {
    name: 'Missing semicolons in object properties',
    pattern: /([a-zA-Z0-9_]+):\s*(['"][^'"]*['"]|[a-zA-Z0-9_]+)\s*$/gm,
    replacement: (match) => `${match};`
  },
  {
    name: 'Missing commas in function arguments',
    pattern: /\(([^)]*[a-zA-Z0-9_])\s+(['"][^'"]*['"])\)/g,
    replacement: (match, arg1, arg2) => `(${arg1}, ${arg2})`
  },
  {
    name: 'Extra parentheses in async arrow functions',
    pattern: /async\s*\(\s*\(\s*\)\s*=>\s*{/g,
    replacement: () => 'async () => {'
  },
  {
    name: 'Malformed test arrow functions',
    pattern: /it\s*\(\s*['"][^'"]*['"]\s*,\s*async\s*[=][>]\s*{/g,
    replacement: (match) => match.replace(/async\s*[=][>]/, 'async () =>')
  },
  {
    name: 'Incorrect spacing in function calls',
    pattern: /([a-zA-Z0-9_]+)\s+\(/g,
    replacement: (match, fnName) => `${fnName}(`
  },
  {
    name: 'Missing semicolons in mock property declarations',
    pattern: /(refreshToken|status|tenantId|tenantName|id_token|access_token|email|name):\s*['"]?[^,;{}]*['"]?(?=[,}])/g,
    replacement: (match) => `${match};`
  },
  {
    name: 'Missing semicolons after method definitions',
    pattern: /(\w+):\s*jest\.fn\(\)[^;,]*(?=[,}])/g,
    replacement: (match) => `${match};`
  },
  {
    name: 'Object bracket closing errors',
    pattern: /}\);?\s*}\);?\s*}\);?/g,
    replacement: () => '});\n      });\n    });'
  },
  {
    name: 'Missing semicolons in expect statements',
    pattern: /(expect\([^)]+\)\.toBe\([^)]+\))([^;])/g,
    replacement: (match, expect, after) => `${expect};${after}`
  },
  {
    name: 'Missing semicolons after save mock',
    pattern: /(save:\s*jest\.fn\(\)[^;]*)(?=[\s,}])/g,
    replacement: (match) => `${match};`
  },
  {
    name: 'Missing semicolons after last statement in block',
    pattern: /(expect\([^;]+\))[^;]*\n\s*}/g,
    replacement: (match, expectStmt) => `${expectStmt};\n  }`
  },
  {
    name: 'Malformed brackets in test files',
    pattern: /}\);\n\s*}\);(?:\s*\n)*\s*}\);/g,
    replacement: (match) => '});\n  });\n});'
  }
];

// Apply fixes to a file
const applyFixes = (filePath) => {
  log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let fixCounts = {};
  
  // Apply each fix pattern
  fixPatterns.forEach(({ name, pattern, replacement }) => {
    const originalContent = content;
    content = content.replace(pattern, replacement);
    
    if (content !== originalContent) {
      const count = (originalContent.match(pattern) || []).length;
      fixCounts[name] = (fixCounts[name] || 0) + count;
      modified = true;
      
      if (options.verbose) {
        log(`  - Applied ${name}: ${count} matches`);
      }
    }
  });
  
  // Only write if we made changes and not in dry run mode
  const totalFixes = Object.values(fixCounts).reduce((sum, count) => sum + count, 0);
  
  if (totalFixes > 0) {
    if (options.dryRun) {
      console.log(`${COLORS.YELLOW}🔍 Would fix in ${filePath}:${COLORS.RESET}`);
      Object.entries(fixCounts).forEach(([name, count]) => {
        console.log(`   ${COLORS.YELLOW}⟶ ${name}: ${count} fixes${COLORS.RESET}`);
      });
    } else {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`${COLORS.GREEN}✅ Modified ${filePath}:${COLORS.RESET}`);
      Object.entries(fixCounts).forEach(([name, count]) => {
        console.log(`   ${COLORS.GREEN}⟶ ${name}: ${count} fixes${COLORS.RESET}`);
      });
    }
  } else {
    log(`${COLORS.BLUE}ℹ️ No issues found in ${filePath}${COLORS.RESET}`);
  }
  
  return { modified, fixCount: totalFixes, fixCounts };
};

// Verify if a file compiles correctly
const verifyFile = (filePath) => {
  if (!options.verify) return true;
  
  try {
    log(`Verifying ${filePath}...`);
    execSync(`cd /home/tarquin_stapa/Fluxori-V2/backend && npx tsc --noEmit ${filePath}`, { 
      encoding: 'utf-8',
      stdio: options.verbose ? 'inherit' : 'pipe'
    });
    return true;
  } catch (error) {
    console.log(`${COLORS.RED}❌ TypeScript errors remain in ${filePath}${COLORS.RESET}`);
    return false;
  }
};

// Main execution
const main = () => {
  const files = findFiles();
  
  if (files.length === 0) {
    console.log(`${COLORS.YELLOW}No files found matching pattern *${options.include} in ${options.path}.${COLORS.RESET}`);
    return;
  }
  
  console.log(`Found ${files.length} files to process`);
  
  let stats = {
    totalFiles: files.length,
    filesModified: 0,
    filesVerified: 0,
    totalFixes: 0,
    fixesByType: {}
  };
  
  files.forEach(file => {
    const { modified, fixCount, fixCounts } = applyFixes(file);
    
    // Update statistics
    if (modified) {
      stats.filesModified++;
      stats.totalFixes += fixCount;
      
      // Aggregate fixes by type
      Object.entries(fixCounts).forEach(([name, count]) => {
        stats.fixesByType[name] = (stats.fixesByType[name] || 0) + count;
      });
      
      // Verify the file if requested
      if (!options.dryRun && verifyFile(file)) {
        stats.filesVerified++;
      }
    }
  });
  
  // Print summary
  if (options.dryRun) {
    console.log(`\n${COLORS.YELLOW}🔍 Dry run summary:${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}Would modify ${stats.filesModified}/${stats.totalFiles} files${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}Would apply ${stats.totalFixes} total fixes${COLORS.RESET}`);
  } else {
    console.log(`\n${COLORS.GREEN}✅ Summary:${COLORS.RESET}`);
    console.log(`${COLORS.GREEN}Modified ${stats.filesModified}/${stats.totalFiles} files${COLORS.RESET}`);
    console.log(`${COLORS.GREEN}Applied ${stats.totalFixes} total fixes${COLORS.RESET}`);
    
    if (options.verify) {
      console.log(`${COLORS.GREEN}Successfully verified ${stats.filesVerified}/${stats.filesModified} files${COLORS.RESET}`);
    }
  }
  
  // Show fixes by type if any were applied
  if (stats.totalFixes > 0) {
    console.log(`\n📊 Fixes by type:`);
    Object.entries(stats.fixesByType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        console.log(`   ⟶ ${name}: ${count}`);
      });
  }
  
  console.log(`\nRun TypeScript check to see remaining errors:`);
  console.log(`$ npx tsc --noEmit`);
};

// Run the script
main();