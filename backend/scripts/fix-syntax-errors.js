#!/usr/bin/env node

/**
 * Fix Syntax Errors Script
 * 
 * This script attempts to fix syntax errors in files by:
 * 1. Regenerating the file structure with proper spacing
 * 2. Removing invisible characters that might be causing issues
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Target file to fix
const targetFile = process.argv[2];

if (!targetFile) {
  console.error(chalk.red('Please provide a file path to fix'));
  process.exit(1);
}

// Fix syntax issues in a file
function fixFile(filePath) {
  try {
    console.log(chalk.blue(`Fixing syntax issues in ${filePath}...`));
    
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Create a backup
    const backupPath = `${filePath}.backup`;
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(chalk.blue(`Backup created at ${backupPath}`));
    
    // Process the content
    // 1. Replace invisible characters
    let newContent = content
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width spaces and BOM
      .replace(/\r\n/g, '\n')                // Normalize line endings
      .replace(/\t/g, '  ');                 // Replace tabs with spaces
    
    // 2. Normalize method declarations
    newContent = newContent.replace(
      /private\s+async\s+(\w+)\s*\(/g, 
      'private async $1('
    );
    
    // 3. Normalize promise declarations
    newContent = newContent.replace(
      /Promise<(\w+)>\./g,
      'Promise.$1<'
    );
    
    // Write the fixed content
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(chalk.green(`✓ Fixed file saved to ${filePath}`));
    
    return true;
  } catch (error) {
    console.error(chalk.red(`Error fixing ${filePath}:`), error);
    return false;
  }
}

// Run the fix
const result = fixFile(targetFile);
process.exit(result ? 0 : 1);