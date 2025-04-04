#!/usr/bin/env node

/**
 * Restore Corrupted TypeScript Files from Backups
 * 
 * This script is specifically designed to restore files that were corrupted
 * by previous TypeScript syntax-fixing attempts. It identifies corrupted files
 * based on specific patterns and restores them from the most recent backup.
 * 
 * Usage:
 *   node scripts/restore-corrupted-files.js [--path=src/path] [--dry-run]
 * 
 * Options:
 *   --path       Target specific path (default: src/)
 *   --dry-run    Don't make actual changes, just report
 *   --verbose    Show detailed logs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  path: args.find(arg => arg.startsWith('--path='))?.split('=')[1] || 'src/',
  dryRun: args.includes('--dry-run'),
  verbose: args.includes('--verbose')
};

// Stats collection
const stats = {
  filesChecked: 0,
  filesCorrupted: 0,
  filesRestored: 0,
  restorationFailed: 0
};

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Logging utility
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
 * Find all TypeScript files in the specified path
 */
function findTypeScriptFiles() {
  try {
    log.info(`Finding TypeScript files in ${options.path}`);
    
    const command = `find ${options.path} -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*"`;
    const files = execSync(command, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    
    log.info(`Found ${files.length} TypeScript files to check`);
    return files;
  } catch (error) {
    log.error(`Error finding files: ${error.message}`);
    return [];
  }
}

/**
 * Find the most recent backup for a file
 */
function findMostRecentBackup(filePath) {
  try {
    const dir = path.dirname(filePath);
    const base = path.basename(filePath);
    
    // Find all backup files for this file
    const backups = fs.readdirSync(dir)
      .filter(file => file.startsWith(base + '.backup'))
      .map(file => path.join(dir, file));
    
    if (backups.length === 0) {
      log.detail(`No backups found for ${filePath}`);
      return null;
    }
    
    // Sort by modification time (most recent first)
    backups.sort((a, b) => {
      const statA = fs.statSync(a);
      const statB = fs.statSync(b);
      return statB.mtime.getTime() - statA.mtime.getTime();
    });
    
    log.detail(`Found ${backups.length} backups for ${filePath}, using most recent: ${backups[0]}`);
    return backups[0];
  } catch (error) {
    log.error(`Error finding backups for ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Check if a file appears to be corrupted
 */
function isFileCorrupted(content) {
  // Common corruption patterns from the failed syntax fixer
  const corruptionPatterns = [
    // Extra spaces in import paths
    /from\s+['"]\s+[^'"]+['"];/,
    
    // Multiple colons in type declarations
    /:\s*(\w+\s*:){2,}/,
    
    // Broken variable definitions
    /let\s+\w+\s*:\s*\w+\s*=\s*;/,
    
    // await = true pattern
    /await\s*=\s*true/,
    
    // Missing object in property access
    /\w+\s*=\s*\.\w+/,
    
    // Multiple type colons
    /type\s+\w+\s*=\s*\w+\s*:\s*{/,
    
    // String: String: String pattern
    /String\s*:\s*String/,
    
    // Constructor corruption
    /new\s*:\s*\w+/
  ];
  
  for (const pattern of corruptionPatterns) {
    if (pattern.test(content)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Restore a file from its most recent backup
 */
function restoreFromBackup(filePath) {
  try {
    // Find most recent backup
    const backupPath = findMostRecentBackup(filePath);
    if (!backupPath) {
      log.warning(`No backup found for ${filePath}`);
      stats.restorationFailed++;
      return false;
    }
    
    // Check if backup exists and is readable
    if (!fs.existsSync(backupPath) || !fs.statSync(backupPath).isFile()) {
      log.error(`Backup file ${backupPath} does not exist or is not readable`);
      stats.restorationFailed++;
      return false;
    }
    
    // Save original as corrupted version
    const corruptedBackupPath = `${filePath}.corrupted-${Date.now()}`;
    fs.copyFileSync(filePath, corruptedBackupPath);
    log.detail(`Saved corrupted version to ${corruptedBackupPath}`);
    
    if (options.dryRun) {
      log.warning(`Would restore ${filePath} from ${backupPath} (dry run)`);
      return true;
    }
    
    // Restore from backup
    fs.copyFileSync(backupPath, filePath);
    log.success(`Restored ${filePath} from ${backupPath}`);
    stats.filesRestored++;
    return true;
  } catch (error) {
    log.error(`Failed to restore ${filePath}: ${error.message}`);
    stats.restorationFailed++;
    return false;
  }
}

/**
 * Check a file for corruption and restore if necessary
 */
function checkAndRestoreFile(filePath) {
  stats.filesChecked++;
  
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file is corrupted
    if (isFileCorrupted(content)) {
      log.warning(`Found corrupted file: ${filePath}`);
      stats.filesCorrupted++;
      
      // Restore from backup
      return restoreFromBackup(filePath);
    } else {
      log.detail(`File appears valid: ${filePath}`);
      return true;
    }
  } catch (error) {
    log.error(`Error checking ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Process all TypeScript files
 */
function processAllFiles() {
  const files = findTypeScriptFiles();
  
  if (files.length === 0) {
    log.error('No files found to process');
    return;
  }
  
  log.info(`Checking ${files.length} files for corruption...`);
  
  // Check each file
  for (const filePath of files) {
    checkAndRestoreFile(filePath);
  }
  
  // Print summary
  console.log(`\n${colors.bold}${colors.cyan}=== Corruption Restoration Summary ===${colors.reset}`);
  console.log(`${colors.blue}Files checked: ${stats.filesChecked}${colors.reset}`);
  console.log(`${colors.yellow}Files identified as corrupted: ${stats.filesCorrupted}${colors.reset}`);
  
  if (options.dryRun) {
    console.log(`${colors.green}Files that would be restored: ${stats.filesCorrupted}${colors.reset}`);
  } else {
    console.log(`${colors.green}Files successfully restored: ${stats.filesRestored}${colors.reset}`);
    console.log(`${colors.red}Files that failed restoration: ${stats.restorationFailed}${colors.reset}`);
  }
  
  // Next steps
  console.log(`\n${colors.cyan}${colors.bold}Next steps:${colors.reset}`);
  if (options.dryRun) {
    console.log(`  1. Run without --dry-run to perform actual restoration: ${colors.yellow}node scripts/restore-corrupted-files.js${colors.reset}`);
  } else {
    console.log(`  1. Run TypeScript check: ${colors.yellow}npx tsc --noEmit${colors.reset}`);
    console.log(`  2. To fix remaining syntax errors safely: ${colors.yellow}node scripts/fix-syntax-safely.js${colors.reset}`);
  }
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.bold}${colors.cyan}🔄 TypeScript Corruption Restoration Tool${colors.reset}`);
  console.log(`${colors.cyan}=======================================\n${colors.reset}`);
  
  if (options.dryRun) {
    log.warning('Running in DRY RUN mode - no files will be modified');
  }
  
  processAllFiles();
}

// Run the script
main();