#!/usr/bin/env node

/**
 * List All Files with TypeScript Errors
 * 
 * This script identifies and lists all files with TypeScript errors,
 * sorted by error count.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Identifies all files with TypeScript errors
 */
function identifyFilesWithErrors() {
  console.log('Identifying all files with TypeScript errors...');
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
 * Process TypeScript error output to find all files with errors
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
  
  // Create a sorted list of files with error counts
  const filesWithErrors = Object.entries(errorCounts)
    .map(([filePath, count]) => ({ filePath, errorCount: count }))
    .sort((a, b) => b.errorCount - a.errorCount);
  
  console.log(`Found ${filesWithErrors.length} files with TypeScript errors`);
  return filesWithErrors;
}

/**
 * Categorize files by type and location
 */
function categorizeFiles(filesWithErrors) {
  const categories = {
    'Controller': [],
    'Controller Test': [],
    'Route': [],
    'Route Test': [],
    'Model': [],
    'Service': [],
    'Middleware': [],
    'Integration Test': [],
    'Unit Test': [],
    'Adapter': [],
    'Utility': [],
    'Other': []
  };
  
  filesWithErrors.forEach(fileInfo => {
    const { filePath } = fileInfo;
    
    if (filePath.includes('/controllers/') && filePath.includes('.controller.ts') && !filePath.includes('.test.ts')) {
      categories['Controller'].push(fileInfo);
    } else if (filePath.includes('/controllers/') && filePath.includes('.controller.test.ts')) {
      categories['Controller Test'].push(fileInfo);
    } else if (filePath.includes('/routes/') && !filePath.includes('.test.ts')) {
      categories['Route'].push(fileInfo);
    } else if (filePath.includes('/routes/') && filePath.includes('.test.ts')) {
      categories['Route Test'].push(fileInfo);
    } else if (filePath.includes('/models/')) {
      categories['Model'].push(fileInfo);
    } else if (filePath.includes('/services/') || filePath.includes('.service.ts')) {
      categories['Service'].push(fileInfo);
    } else if (filePath.includes('/middleware/')) {
      categories['Middleware'].push(fileInfo);
    } else if (filePath.includes('/integration/') || filePath.includes('.integration.test.ts')) {
      categories['Integration Test'].push(fileInfo);
    } else if (filePath.includes('.test.ts') || filePath.includes('.spec.ts')) {
      categories['Unit Test'].push(fileInfo);
    } else if (filePath.includes('/adapters/') || filePath.includes('.adapter.ts')) {
      categories['Adapter'].push(fileInfo);
    } else if (filePath.includes('/utils/') || filePath.includes('/helpers/')) {
      categories['Utility'].push(fileInfo);
    } else {
      categories['Other'].push(fileInfo);
    }
  });
  
  return categories;
}

/**
 * Generate CSV file with error data
 */
function generateCSV(filesWithErrors) {
  const csvPath = path.join(ROOT_DIR, 'typescript-errors.csv');
  
  let csvContent = 'File Path,Error Count,Category\n';
  
  filesWithErrors.forEach(({ filePath, errorCount }) => {
    let category = 'Other';
    
    if (filePath.includes('/controllers/') && filePath.includes('.controller.ts') && !filePath.includes('.test.ts')) {
      category = 'Controller';
    } else if (filePath.includes('/controllers/') && filePath.includes('.controller.test.ts')) {
      category = 'Controller Test';
    } else if (filePath.includes('/routes/') && !filePath.includes('.test.ts')) {
      category = 'Route';
    } else if (filePath.includes('/routes/') && filePath.includes('.test.ts')) {
      category = 'Route Test';
    } else if (filePath.includes('/models/')) {
      category = 'Model';
    } else if (filePath.includes('/services/') || filePath.includes('.service.ts')) {
      category = 'Service';
    } else if (filePath.includes('/middleware/')) {
      category = 'Middleware';
    } else if (filePath.includes('/integration/') || filePath.includes('.integration.test.ts')) {
      category = 'Integration Test';
    } else if (filePath.includes('.test.ts') || filePath.includes('.spec.ts')) {
      category = 'Unit Test';
    } else if (filePath.includes('/adapters/') || filePath.includes('.adapter.ts')) {
      category = 'Adapter';
    } else if (filePath.includes('/utils/') || filePath.includes('/helpers/')) {
      category = 'Utility';
    }
    
    csvContent += `${filePath},${errorCount},${category}\n`;
  });
  
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log(`\nCSV file generated: typescript-errors.csv`);
}

/**
 * Count total errors
 */
function countTotalErrors(filesWithErrors) {
  return filesWithErrors.reduce((total, { errorCount }) => total + errorCount, 0);
}

/**
 * Main function
 */
function main() {
  console.log('🔍 TypeScript Error Analysis');
  console.log('============================');
  
  // Find files with errors
  const filesWithErrors = identifyFilesWithErrors();
  
  if (filesWithErrors.length === 0) {
    console.log('No files with TypeScript errors found. All good!');
    return;
  }
  
  // Count total errors
  const totalErrors = countTotalErrors(filesWithErrors);
  
  // Print summary
  console.log(`\nTotal TypeScript errors: ${totalErrors}`);
  console.log(`Files with errors: ${filesWithErrors.length}`);
  console.log(`Average errors per file: ${(totalErrors / filesWithErrors.length).toFixed(2)}`);
  
  // Print the top 20 files with most errors
  console.log('\nTop 20 files with most errors:');
  console.log('==============================');
  console.log('| Error Count | File Path');
  console.log('|-------------|----------------------------------------------------------');
  
  filesWithErrors.slice(0, 20).forEach(({ filePath, errorCount }) => {
    console.log(`| ${errorCount.toString().padStart(11)} | ${filePath}`);
  });
  
  // Categorize files
  const categories = categorizeFiles(filesWithErrors);
  
  // Print categorized summary
  console.log('\nSummary by file type:');
  console.log('===================');
  
  let totalFileCount = 0;
  
  Object.entries(categories).forEach(([category, files]) => {
    if (files.length > 0) {
      const categoryErrorCount = files.reduce((total, { errorCount }) => total + errorCount, 0);
      totalFileCount += files.length;
      
      console.log(`\n${category} Files (${files.length}): ${categoryErrorCount} errors`);
      files.slice(0, 5).forEach(({ filePath, errorCount }) => {
        console.log(`  - ${filePath} (${errorCount} errors)`);
      });
      
      if (files.length > 5) {
        console.log(`  - ... and ${files.length - 5} more`);
      }
    }
  });
  
  console.log(`\nTotal files categorized: ${totalFileCount}`);
  
  // Generate CSV
  generateCSV(filesWithErrors);
  
  // Recommendation
  console.log('\nRecommendation:');
  console.log('==============');
  console.log('1. Focus on rebuilding files in this order:');
  console.log('   a. Models (these define your data structures)');
  console.log('   b. Controllers (these implement your API endpoints)');
  console.log('   c. Routes (these define your API routes)');
  console.log('   d. Services (these implement your business logic)');
  console.log('   e. Tests (these validate your implementation)');
  console.log('2. Use the template creation script:');
  console.log('   npm run create:template <template-type> <output-path> <resource-name>');
}

// Run the script
main();