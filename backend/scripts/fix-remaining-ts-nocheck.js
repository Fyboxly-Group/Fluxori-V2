/**
 * Script to fix any remaining files with @ts-nocheck directives
 * This is a comprehensive final pass to handle any files not fixed by the specialized scripts
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const glob = require('glob');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

// Function to find all files with @ts-nocheck
function findFilesWithTsNoCheck() {
  console.log(chalk.blue('Finding files with @ts-nocheck...'));
  
  const files = glob.sync(path.join(ROOT_DIR, 'src/**/*.ts'))
    .filter(file => !file.includes('/tests/') && !file.includes('.test.ts'))
    .filter(file => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('@ts-nocheck');
    });
  
  return files;
}

// Function to fix any file with @ts-nocheck
function fixFile(filePath) {
  console.log(chalk.blue(`Processing ${path.relative(ROOT_DIR, filePath)}...`));
  
  if (!fs.existsSync(filePath)) {
    console.log(chalk.yellow(`File not found: ${filePath}`));
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already fixed (no @ts-nocheck directive)
  if (!content.includes('@ts-nocheck')) {
    console.log(chalk.yellow(`File already fixed (no @ts-nocheck directive): ${path.relative(ROOT_DIR, filePath)}`));
    return false;
  }
  
  // Process the file
  let newContent = content;
  
  // Remove @ts-nocheck comment
  newContent = newContent.replace(/\/\/ @ts-nocheck.*\n/, '');
  
  // Common pattern fixes based on file type
  
  // ai-cs-agent module files
  if (filePath.includes('ai-cs-agent')) {
    // Add import for AuthenticatedRequest if using it
    if (newContent.includes('AuthenticatedRequest') && !newContent.includes('import { AuthenticatedRequest }')) {
      newContent = newContent.replace(/^import/, 'import { AuthenticatedRequest } from "../../../types/express-extensions";\nimport');
    }
    
    // Fix websocket.ts issues
    if (filePath.includes('websocket.ts')) {
      // Fix the .send() overloaded method call issue
      newContent = newContent.replace(
        /client\.send\(([^,]+),\s*([^,]+),\s*([^\)]+)\)/g, 
        'client.send(JSON.stringify({ type: $1, payload: $2, meta: $3 }))'
      );
    }
  }
  
  // Fix any marketplaces module index.ts
  if (filePath.includes('marketplaces') && path.basename(filePath) === 'index.ts') {
    // Add mongoose import if needed
    if (!newContent.includes('import mongoose from')) {
      newContent = newContent.replace(/^import/, 'import mongoose from \'mongoose\';\nimport');
    }
    
    // Add proper import for modules that may be missing
    if (newContent.includes('IMarketplaceConnection') && !newContent.includes('IMarketplaceConnection,')) {
      newContent = newContent.replace(
        /import {/,
        'import { IMarketplaceConnection, '
      );
    }
  }
  
  // Write the updated content
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(chalk.green(`Fixed TypeScript errors in: ${path.relative(ROOT_DIR, filePath)}`));
    return true;
  } else {
    console.log(chalk.yellow(`No changes needed in: ${path.relative(ROOT_DIR, filePath)}`));
    return false;
  }
}

// Main function
function main() {
  console.log(chalk.blue('🔧 Remaining @ts-nocheck Fixer'));
  console.log(chalk.blue('============================='));
  
  // Run all the specialized fixers first
  try {
    console.log(chalk.blue('Running module exports fixer...'));
    execSync('node scripts/fix-module-exports.js', { stdio: 'inherit' });
    
    console.log(chalk.blue('Running Amazon adapters fixer...'));
    execSync('node scripts/fix-amazon-adapters.js', { stdio: 'inherit' });
    
    console.log(chalk.blue('Running Xero connector fixer...'));
    execSync('node scripts/fix-xero-connector.js', { stdio: 'inherit' });
    
    console.log(chalk.blue('Running route files fixer...'));
    execSync('node scripts/fix-route-files.js', { stdio: 'inherit' });
  } catch (error) {
    console.error(chalk.red('Error running specialized fixers:', error.message));
  }
  
  // Find any remaining files with @ts-nocheck
  const remainingFiles = findFilesWithTsNoCheck();
  console.log(chalk.blue(`Found ${remainingFiles.length} files still using @ts-nocheck`));
  
  let fixedFiles = 0;
  
  for (const filePath of remainingFiles) {
    if (fixFile(filePath)) {
      fixedFiles++;
    }
  }
  
  console.log(chalk.blue('📊 Summary'));
  console.log(chalk.blue('============'));
  console.log(chalk.green(`Fixed ${fixedFiles} out of ${remainingFiles.length} remaining files with @ts-nocheck`));
  
  // Count how many files still have @ts-nocheck
  const finalRemainingFiles = findFilesWithTsNoCheck();
  console.log(chalk.blue(`${finalRemainingFiles.length} files still using @ts-nocheck after all fixes`));
  
  if (finalRemainingFiles.length > 0) {
    console.log(chalk.yellow('Remaining files with @ts-nocheck:'));
    finalRemainingFiles.forEach(file => {
      console.log(chalk.yellow(`- ${path.relative(ROOT_DIR, file)}`));
    });
  }
}

main();