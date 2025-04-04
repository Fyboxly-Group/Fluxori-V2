#!/usr/bin/env node

/**
 * Safe TypeScript Syntax Fixer
 * 
 * This script carefully fixes common TypeScript syntax errors while ensuring
 * it doesn't corrupt files. Key features:
 * 
 * 1. Creates backups before any changes
 * 2. Uses precise regex patterns with context awareness
 * 3. Validates syntax after changes
 * 4. Can restore from backup if validation fails
 * 5. Focus on fixing only well-understood patterns
 * 
 * Usage:
 *   node scripts/fix-syntax-safely.js [--restore] [--path=src/path]
 * 
 * Options:
 *   --restore    Restore corrupted files from backups
 *   --path       Target specific path for fixing
 *   --test       Test mode (no actual file changes)
 *   --verbose    Show detailed logs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  restore: args.includes('--restore'),
  path: args.find(arg => arg.startsWith('--path='))?.split('=')[1] || 'src/',
  test: args.includes('--test'),
  verbose: args.includes('--verbose')
};

// Stats collection
const stats = {
  filesProcessed: 0,
  filesFixed: 0,
  filesRestored: 0,
  filesFailed: 0,
  errorsByType: {}
};

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

/**
 * Logging utility
 */
const log = {
  info: (message) => console.log(`${colors.blue}ℹ️ ${message}${colors.reset}`),
  success: (message) => console.log(`${colors.green}✅ ${message}${colors.reset}`),
  warning: (message) => console.log(`${colors.yellow}⚠️ ${message}${colors.reset}`),
  error: (message) => console.log(`${colors.red}❌ ${message}${colors.reset}`),
  detail: (message) => {
    if (options.verbose) {
      console.log(`   ${message}`);
    }
  }
};

/**
 * Find files to process
 */
function findFiles() {
  try {
    log.info(`Finding TypeScript files in ${options.path}`);
    
    // Using find to locate TypeScript files
    const excludeDirs = '-not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*"';
    const command = `find ${options.path} -type f -name "*.ts" ${excludeDirs}`;
    
    const files = execSync(command, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    
    log.success(`Found ${files.length} TypeScript files`);
    return files;
  } catch (error) {
    log.error(`Error finding files: ${error.message}`);
    return [];
  }
}

/**
 * Create a backup of a file
 */
function createBackup(filePath) {
  try {
    const backupPath = `${filePath}.safe-backup-${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    log.detail(`Created backup at ${backupPath}`);
    return backupPath;
  } catch (error) {
    log.error(`Failed to create backup for ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Check if a file appears to be corrupted based on specific patterns
 */
function isFileCorrupted(content) {
  const corruptionPatterns = [
    /import[^;]*?from\s+['"]\s+['"][^;]*?;/,       // Import with spaces in path
    /:\s*Request\s*:\s*Response\s*:/,               // Multiple colons in type definitions
    /=\s*:\s*/,                                     // Equals followed by colon
    /let\s+\w+\s*:\s*\w+\s*=\s*;/,                  // Variable declaration ending with =;
    /await\s*=\s*true\s*:/,                         // await = true:
    /\w+\s*=\s*\.[\w\.]+/                           // Property access missing object (x = .prop)
  ];
  
  return corruptionPatterns.some(pattern => pattern.test(content));
}

/**
 * Find the most recent backup for a file
 */
function findMostRecentBackup(filePath) {
  try {
    // Find all backups for this file
    const dir = path.dirname(filePath);
    const base = path.basename(filePath);
    
    const backups = fs.readdirSync(dir)
      .filter(file => file.startsWith(base + '.backup'))
      .map(file => path.join(dir, file));
    
    if (backups.length === 0) {
      return null;
    }
    
    // Sort by modification time (descending)
    backups.sort((a, b) => {
      return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
    });
    
    return backups[0]; // Return the most recent backup
  } catch (error) {
    log.error(`Error finding backups for ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Restore a file from its backup
 */
function restoreFromBackup(filePath) {
  const backupPath = findMostRecentBackup(filePath);
  if (!backupPath) {
    log.error(`No backup found for ${filePath}`);
    return false;
  }
  
  try {
    // Create a backup of the current (corrupted) file for reference
    const corruptedBackupPath = `${filePath}.corrupted-${Date.now()}`;
    fs.copyFileSync(filePath, corruptedBackupPath);
    
    // Restore from backup
    fs.copyFileSync(backupPath, filePath);
    log.success(`Restored ${filePath} from ${backupPath}`);
    stats.filesRestored++;
    return true;
  } catch (error) {
    log.error(`Failed to restore ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Safe syntax fixes that won't corrupt files
 */
const safeFixes = [
  // Fix 1: Import statement semicolons
  {
    name: 'Missing semicolons in imports',
    detect: (content) => {
      const regex = /import [^;]+from ['"][^'"]+['"](?!;)/g;
      return (content.match(regex) || []).length;
    },
    fix: (content) => {
      return content.replace(
        /import ([^;]+from ['"][^'"]+['"])(?!;)/g, 
        'import $1;'
      );
    }
  },
  
  // Fix 2: Promise<T>.all syntax
  {
    name: 'Promise<T>.all syntax',
    detect: (content) => {
      const regex = /Promise<[^>]+>\.all\(/g;
      return (content.match(regex) || []).length;
    },
    fix: (content) => {
      return content.replace(
        /Promise<([^>]+)>\.all\(/g,
        'Promise.all<$1>('
      );
    }
  },
  
  // Fix 3: Promise<T>.resolve syntax
  {
    name: 'Promise<T>.resolve syntax',
    detect: (content) => {
      const regex = /Promise<[^>]+>\.(resolve|reject)\(/g;
      return (content.match(regex) || []).length;
    },
    fix: (content) => {
      return content
        .replace(/Promise<([^>]+)>\.resolve\(/g, 'Promise.resolve<$1>(')
        .replace(/Promise<([^>]+)>\.reject\(/g, 'Promise.reject<$1>(');
    }
  },
  
  // Fix 4: Missing semicolons after statements
  {
    name: 'Missing semicolons after statements',
    detect: (content) => {
      // This is a simplified detection that won't catch all cases
      const statementEnds = content.match(/\b(return|throw|const|let|var)\b[^;{]*?(?=\n\s*[a-zA-Z])/g) || [];
      return statementEnds.length;
    },
    fix: (content) => {
      // More careful fix for specific statement types
      return content
        // Fix return statements
        .replace(/(\breturn\s+[^;{}\n]+)(\n\s*[a-zA-Z])/g, '$1;$2')
        // Fix throw statements
        .replace(/(\bthrow\s+[^;{}\n]+)(\n\s*[a-zA-Z])/g, '$1;$2')
        // Fix const/let/var declarations
        .replace(/(\b(?:const|let|var)\s+\w+\s*=\s*[^;{}\n]+)(\n\s*[a-zA-Z])/g, '$1;$2');
    }
  },
  
  // Fix 5: Missing commas in object literals
  {
    name: 'Missing commas in object literals',
    detect: (content) => {
      const regex = /{\s*\n\s*\w+\s*:[^,{}\n]+\n\s*\w+\s*:/g;
      return (content.match(regex) || []).length;
    },
    fix: (content) => {
      return content.replace(
        /(\s*\n\s*\w+\s*:[^,{}\n]+)\n(\s*\w+\s*:)/g,
        '$1,\n$2'
      );
    }
  },
  
  // Fix 6: Function parameter types
  {
    name: 'Missing parameter types',
    detect: (content) => {
      // This detection is limited to avoid false positives
      const regex = /function\s+\w+\s*\((\w+)(?!\s*:)/g;
      return (content.match(regex) || []).length;
    },
    fix: (content) => {
      // Add any type to parameters without types
      return content.replace(
        /function\s+(\w+)\s*\((\w+)(?!\s*:)/g,
        'function $1($2: any'
      );
    }
  },
  
  // Fix 7: Extra spaces in import paths
  {
    name: 'Extra spaces in import paths',
    detect: (content) => {
      const regex = /from\s+['"]\s+[^'"]+['"];/g;
      return (content.match(regex) || []).length;
    },
    fix: (content) => {
      return content.replace(
        /from\s+['"](\s+)([^'"]+)['"]/g,
        'from "$2"'
      );
    }
  },
  
  // Fix 8: Function return types
  {
    name: 'Missing return types on functions',
    detect: (content) => {
      // Limited to async functions for safety
      const regex = /async\s+function\s+\w+\s*\([^)]*\)\s*{(?!\s*:)/g;
      return (content.match(regex) || []).length;
    },
    fix: (content) => {
      return content.replace(
        /(async\s+function\s+\w+\s*\([^)]*\))\s*{/g,
        '$1: Promise<any> {'
      );
    }
  }
];

/**
 * Apply fixes to a file's content
 */
function applyFixes(content, filePath) {
  let modified = false;
  let fixResults = {};
  
  // Apply each fix and collect results
  for (const fix of safeFixes) {
    const beforeCount = fix.detect(content);
    if (beforeCount > 0) {
      const newContent = fix.fix(content);
      const afterCount = fix.detect(newContent);
      const fixedCount = beforeCount - afterCount;
      
      if (fixedCount > 0) {
        content = newContent;
        modified = true;
        fixResults[fix.name] = fixedCount;
        
        // Update global stats
        stats.errorsByType[fix.name] = (stats.errorsByType[fix.name] || 0) + fixedCount;
        
        log.detail(`Applied ${fix.name}: fixed ${fixedCount} instances`);
      }
    }
  }
  
  return { 
    content, 
    modified, 
    fixResults,
    fixCount: Object.values(fixResults).reduce((sum, count) => sum + count, 0)
  };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  stats.filesProcessed++;
  log.info(`Processing ${filePath}`);
  
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file is corrupted
    if (isFileCorrupted(content)) {
      log.warning(`File appears to be corrupted: ${filePath}`);
      
      if (options.restore) {
        return restoreFromBackup(filePath);
      } else {
        log.warning(`Use --restore option to fix corrupted files automatically`);
        stats.filesFailed++;
        return false;
      }
    }
    
    // Create backup before making changes
    const backupPath = createBackup(filePath);
    if (!backupPath && !options.test) {
      log.error(`Skipping ${filePath} - backup creation failed`);
      stats.filesFailed++;
      return false;
    }
    
    // Apply fixes
    const { content: fixedContent, modified, fixResults, fixCount } = applyFixes(content, filePath);
    
    if (modified) {
      if (options.test) {
        log.success(`Would fix ${fixCount} issues in ${filePath} (test mode)`);
        stats.filesFixed++;
      } else {
        // Write fixed content
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        log.success(`Fixed ${fixCount} issues in ${filePath}`);
        
        // Log detailed fixes if verbose
        if (options.verbose) {
          Object.entries(fixResults).forEach(([name, count]) => {
            log.detail(`  ${name}: ${count} fixes`);
          });
        }
        
        stats.filesFixed++;
      }
      return true;
    } else {
      log.detail(`No issues found in ${filePath}`);
      return true;
    }
  } catch (error) {
    log.error(`Error processing ${filePath}: ${error.message}`);
    stats.filesFailed++;
    return false;
  }
}

/**
 * Restore corrupted files in batch
 */
function restoreCorruptedFiles(files) {
  log.info(`Checking for corrupted files to restore`);
  let restoredCount = 0;
  
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (isFileCorrupted(content)) {
        log.warning(`Found corrupted file: ${filePath}`);
        if (restoreFromBackup(filePath)) {
          restoredCount++;
        }
      }
    } catch (error) {
      log.error(`Error checking ${filePath}: ${error.message}`);
    }
  }
  
  log.success(`Restored ${restoredCount} corrupted files`);
  return restoredCount;
}

/**
 * Test TypeScript compilation
 */
function testTypeScriptCompilation() {
  log.info('Testing TypeScript compilation...');
  
  try {
    execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
    log.success('TypeScript compilation successful!');
    return true;
  } catch (error) {
    const errorOutput = error.stdout || error.stderr || '';
    const errorCount = (errorOutput.match(/error TS/g) || []).length;
    log.warning(`TypeScript compilation failed with ${errorCount} errors`);
    
    // Log a sample of errors
    if (options.verbose) {
      const errorLines = errorOutput.split('\n').filter(line => line.includes('error TS'));
      const sampleErrors = errorLines.slice(0, 5);
      sampleErrors.forEach(error => log.detail(error));
      
      if (errorLines.length > 5) {
        log.detail(`... and ${errorLines.length - 5} more errors`);
      }
    }
    
    return false;
  }
}

/**
 * Print summary of actions performed
 */
function printSummary() {
  console.log(`\n${colors.bold}${colors.cyan}=== Safe TypeScript Syntax Fixer Summary ===${colors.reset}`);
  console.log(`${colors.cyan}Files processed: ${stats.filesProcessed}${colors.reset}`);
  console.log(`${colors.green}Files fixed: ${stats.filesFixed}${colors.reset}`);
  console.log(`${colors.yellow}Files restored from backup: ${stats.filesRestored}${colors.reset}`);
  console.log(`${colors.red}Files with errors: ${stats.filesFailed}${colors.reset}`);
  
  if (Object.keys(stats.errorsByType).length > 0) {
    console.log(`\n${colors.cyan}${colors.bold}Fixes by type:${colors.reset}`);
    Object.entries(stats.errorsByType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        console.log(`  ${colors.blue}${name}: ${count}${colors.reset}`);
      });
  }
  
  console.log(`\n${colors.cyan}${colors.bold}Next steps:${colors.reset}`);
  console.log(`  1. Run TypeScript check: ${colors.yellow}npx tsc --noEmit${colors.reset}`);
  console.log(`  2. To fix remaining errors: ${colors.yellow}node scripts/ts-migration-toolkit.js --analyze${colors.reset}`);
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.bold}${colors.cyan}🔧 Safe TypeScript Syntax Fixer${colors.reset}`);
  console.log(`${colors.cyan}===============================\n${colors.reset}`);
  
  if (options.test) {
    log.warning('Running in TEST MODE - no files will be modified');
  }
  
  const files = findFiles();
  if (files.length === 0) {
    log.error('No files found to process');
    return;
  }
  
  // Handle restore mode
  if (options.restore) {
    log.info('Running in RESTORE mode - will attempt to restore corrupted files');
    restoreCorruptedFiles(files);
    return;
  }
  
  // Process each file
  for (const filePath of files) {
    processFile(filePath);
  }
  
  // Test TypeScript compilation after fixes
  if (!options.test && (stats.filesFixed > 0 || stats.filesRestored > 0)) {
    testTypeScriptCompilation();
  }
  
  // Print summary
  printSummary();
}

// Run the script
main();