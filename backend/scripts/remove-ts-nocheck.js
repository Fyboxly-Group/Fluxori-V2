#!/usr/bin/env node

/**
 * Remove @ts-nocheck from Production Code
 * 
 * This script removes @ts-nocheck directives from production code files,
 * while preserving them in test files.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const PRODUCTION_DIRS = ['src/modules', 'src/controllers', 'src/middleware', 'src/types', 'src/models', 'src/routes', 'src/services', 'src/utils', 'src/schedulers'];
const TEST_PATTERNS = ['**/*.test.ts', '**/tests/**/*.ts'];

/**
 * Check if a file is a test file
 */
function isTestFile(filePath) {
  return TEST_PATTERNS.some(pattern => {
    return filePath.includes('.test.ts') || filePath.includes('/tests/');
  });
}

/**
 * Find all files with @ts-nocheck in production code
 */
function findFilesWithTsNoCheck() {
  console.log(chalk.blue('Finding files with @ts-nocheck in production code...'));
  
  let files = [];
  
  for (const dir of PRODUCTION_DIRS) {
    const pattern = path.join(ROOT_DIR, dir, '**/*.ts');
    const tsFiles = glob.sync(pattern);
    
    for (const file of tsFiles) {
      // Skip test files
      if (isTestFile(file)) {
        continue;
      }
      
      // Skip d.ts declaration files (they're not compiled directly)
      if (file.endsWith('.d.ts')) {
        continue;
      }
      
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('@ts-nocheck')) {
        files.push(file);
      }
    }
  }
  
  console.log(`Found ${files.length} files with @ts-nocheck in production code`);
  return files;
}

/**
 * Remove @ts-nocheck from a file
 */
function removeTsNoCheck(filePath) {
  console.log(`Processing ${path.relative(ROOT_DIR, filePath)}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remove @ts-nocheck directives
    content = content.replace(/\/\/\s*@ts-nocheck/g, '// TypeScript checked');
    content = content.replace(/\/\*\s*@ts-nocheck\s*\*\//g, '/* TypeScript checked */');
    
    // Only write if changes were made
    if (content !== originalContent) {
      // Create backup
      const backupPath = `${filePath}.nocheck-backup`;
      fs.writeFileSync(backupPath, originalContent, 'utf8');
      
      // Write updated content
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(chalk.green(`✅ Removed @ts-nocheck from ${path.relative(ROOT_DIR, filePath)}`));
      return true;
    } else {
      console.log(chalk.yellow(`⚠️ No @ts-nocheck found in ${path.relative(ROOT_DIR, filePath)}`));
      return false;
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error processing ${path.relative(ROOT_DIR, filePath)}:`), error);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log(chalk.bold('🔧 Remove @ts-nocheck from Production Code'));
  console.log(chalk.bold('========================================'));
  
  // Find files with @ts-nocheck
  const files = findFilesWithTsNoCheck();
  
  if (files.length === 0) {
    console.log(chalk.green('\n✅ No files with @ts-nocheck found in production code!'));
    return;
  }
  
  // Ask for confirmation
  console.log(chalk.yellow('\nWARNING: This will remove @ts-nocheck directives from production code.'));
  console.log(chalk.yellow('This may cause TypeScript errors to surface that were previously ignored.'));
  console.log(chalk.yellow('Backups will be created with the .nocheck-backup extension.'));
  
  // Process all files
  let removedCount = 0;
  for (const file of files) {
    if (removeTsNoCheck(file)) {
      removedCount++;
    }
  }
  
  console.log(`\n🎉 Removed @ts-nocheck from ${removedCount} files`);
  console.log('\nRun TypeScript check to see new errors:');
  console.log('$ npm run typecheck:src');
}

// Run the script
main();