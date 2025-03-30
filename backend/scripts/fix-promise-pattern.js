#!/usr/bin/env node

/**
 * Fix Promise Pattern Issues Script
 * 
 * This script fixes a specific TypeScript error pattern:
 * "An instantiation expression cannot be followed by a property access."
 * 
 * The pattern that needs fixing is:
 *   Promise<any>.all([...]) -> Promise.all<any>([...])
 *   Promise<any>.race([...]) -> Promise.race<any>([...])
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Get all TypeScript files in the project
function findFiles() {
  const patterns = [
    'src/**/*.ts',
  ];
  
  let files = [];
  for (const pattern of patterns) {
    const matches = glob.sync(pattern, { cwd: process.cwd() });
    files = [...files, ...matches];
  }
  return [...new Set(files)]; // Remove duplicates
}

// Fix patterns in a file
function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let updatedContent = content;
    
    // Fix Promise<any>.all([...]) -> Promise.all<any>([...])
    const allPattern = /Promise<(\w+)>\.all\(/g;
    if (allPattern.test(content)) {
      updatedContent = updatedContent.replace(allPattern, (match, type) => {
        modified = true;
        console.log(chalk.green(`  - Fixed Promise<${type}>.all pattern`));
        return `Promise.all<${type}>(`;
      });
    }
    
    // Fix Promise<any>.race([...]) -> Promise.race<any>([...])
    const racePattern = /Promise<(\w+)>\.race\(/g;
    if (racePattern.test(content)) {
      updatedContent = updatedContent.replace(racePattern, (match, type) => {
        modified = true;
        console.log(chalk.green(`  - Fixed Promise<${type}>.race pattern`));
        return `Promise.race<${type}>(`;
      });
    }
    
    // Save if modified
    if (modified) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(chalk.blue(`✓ Updated ${filePath}`));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(chalk.red(`Error processing ${filePath}:`), error);
    return false;
  }
}

// Main function
async function main() {
  console.log(chalk.blue('Fixing Promise pattern issues...'));
  
  const files = findFiles();
  console.log(chalk.blue(`Found ${files.length} files to process`));
  
  let filesModified = 0;
  
  for (const file of files) {
    const wasModified = fixFile(file);
    if (wasModified) {
      filesModified++;
    }
  }
  
  console.log(chalk.bold.green('\nPromise pattern fixes completed!'));
  console.log(chalk.green(`Files modified: ${filesModified}`));
}

main().catch(error => {
  console.error(chalk.red('Error running script:'), error);
  process.exit(1);
});