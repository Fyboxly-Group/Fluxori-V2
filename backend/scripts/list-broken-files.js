#!/usr/bin/env node

/**
 * List Severely Broken Files
 * 
 * This script identifies and lists files with severe syntax errors.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Identifies files with severe syntax errors
 */
function identifyBrokenFiles() {
  console.log('Identifying severely broken files...');
  try {
    // Run TypeScript compiler to find errors
    const command = 'npx tsc --noEmit';
    const tscOutput = execSync(command, { encoding: 'utf8', cwd: ROOT_DIR, stdio: ['pipe', 'pipe', 'ignore'] });
    return processErrorOutput(tscOutput);
  } catch (error) {
    if (error.stdout) {
      return processErrorOutput(error.stdout.toString());
    }
    
    console.error('Error running TypeScript:', error);
    return [];
  }
}

/**
 * Process TypeScript error output to find the most broken files
 */
function processErrorOutput(output) {
  // Count errors per file
  const errorCounts = {};
  const regex = /^([^(]+\.ts)/gm;
  const matches = [...output.matchAll(regex)];
  
  matches.forEach(match => {
    const filePath = match[1];
    errorCounts[filePath] = (errorCounts[filePath] || 0) + 1;
  });
  
  // Find files with more than 20 errors (severely broken)
  const brokenFiles = Object.entries(errorCounts)
    .filter(([_, count]) => count > 20)
    .map(([filePath, count]) => ({ filePath, errorCount: count }))
    .sort((a, b) => b.errorCount - a.errorCount);
  
  console.log(`Found ${brokenFiles.length} severely broken files`);
  return brokenFiles;
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Severely Broken Files List');
  console.log('================================');
  
  // Find broken files
  const brokenFiles = identifyBrokenFiles();
  
  if (brokenFiles.length === 0) {
    console.log('No severely broken files found. All good!');
    return;
  }
  
  // Print the list in table format
  console.log('\nSeverely broken files:');
  console.log('======================');
  console.log('| Error Count | File Path');
  console.log('|-------------|----------------------------------------------------------');
  
  brokenFiles.forEach(({ filePath, errorCount }) => {
    console.log(`| ${errorCount.toString().padStart(11)} | ${filePath}`);
  });
  
  // Group files by type
  const fileGroups = {
    'Controller': [],
    'Controller Test': [],
    'Routes Test': [],
    'Integration Test': [],
    'Service': [],
    'Other': []
  };
  
  brokenFiles.forEach(fileInfo => {
    const { filePath } = fileInfo;
    
    if (filePath.includes('controller.ts') && !filePath.includes('.test.ts')) {
      fileGroups['Controller'].push(fileInfo);
    } else if (filePath.includes('controller.test.ts')) {
      fileGroups['Controller Test'].push(fileInfo);
    } else if (filePath.includes('routes.test.ts')) {
      fileGroups['Routes Test'].push(fileInfo);
    } else if (filePath.includes('integration.test.ts')) {
      fileGroups['Integration Test'].push(fileInfo);
    } else if (filePath.includes('service.ts')) {
      fileGroups['Service'].push(fileInfo);
    } else {
      fileGroups['Other'].push(fileInfo);
    }
  });
  
  // Print grouped summary
  console.log('\nSummary by file type:');
  console.log('===================');
  
  Object.entries(fileGroups).forEach(([groupName, files]) => {
    if (files.length > 0) {
      console.log(`\n${groupName} Files (${files.length}):`);
      files.forEach(({ filePath, errorCount }) => {
        console.log(`  - ${filePath} (${errorCount} errors)`);
      });
    }
  });
  
  console.log('\nRecommendation:');
  console.log('==============');
  console.log('These files should be deleted and rebuilt from scratch with proper TypeScript typing.');
  console.log('First, check their backup versions to understand the core functionality needed:');
  console.log('```bash');
  console.log('# Example: check a backup file');
  console.log('cat src/controllers/some-controller.ts.backup');
  console.log('```');
}

// Run the script
main();