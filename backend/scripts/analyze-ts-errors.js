/**
 * TypeScript Error Analysis Script
 * 
 * This script analyzes existing TypeScript errors by:
 * 1. Temporarily removing @ts-nocheck comments
 * 2. Running TypeScript check and analyzing error patterns
 * 3. Categorizing errors by type and module
 * 4. Generating a detailed report
 * 5. Restoring @ts-nocheck comments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const targetModules = [
  'src/modules/sync-orchestrator',
  'src/modules/product-ingestion',
  'src/modules/order-ingestion'
];

// File backup storage
const backupFiles = new Map();

// Function to temporarily remove @ts-nocheck from files
function removeAndBackupTsNocheck(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  // Check if it's a file or directory
  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    // Process all TypeScript files in directory
    const files = fs.readdirSync(filePath);
    files.forEach(file => {
      const fullPath = path.join(filePath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        removeAndBackupTsNocheck(fullPath);
      } else if (file.endsWith('.ts')) {
        removeAndBackupTsNocheck(fullPath);
      }
    });
  } else if (filePath.endsWith('.ts')) {
    // Process TypeScript file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file has @ts-nocheck
    if (content.includes('@ts-nocheck')) {
      // Save the original file content
      backupFiles.set(filePath, content);
      
      // Remove the @ts-nocheck line
      const updatedContent = content.replace(/\/\/\s*@ts-nocheck.*\n/, '');
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Temporarily removed @ts-nocheck from: ${filePath}`);
    }
  }
}

// Function to restore @ts-nocheck to files
function restoreBackups() {
  backupFiles.forEach((content, filePath) => {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Restored @ts-nocheck to: ${filePath}`);
  });
}

// Function to get TypeScript errors
function getTypeScriptErrors() {
  try {
    execSync('npx tsc --noEmit', { stdio: 'ignore' });
    return '';
  } catch (error) {
    return execSync('npx tsc --noEmit 2>&1 || true').toString();
  }
}

// Function to categorize errors
function analyzeErrors(errorOutput) {
  const errors = errorOutput.split('\n');
  const errorMap = new Map();
  
  // Different error types to categorize
  const categories = {
    importErrors: [],
    propertyAccessErrors: [],
    typeMismatchErrors: [],
    missingPropertyErrors: [],
    undefinedErrors: [],
    syntaxErrors: [],
    promiseErrors: [],
    objectIdErrors: [],
    otherErrors: []
  };
  
  // Count errors by file
  const fileErrorCount = new Map();
  
  // Extract error patterns
  errors.forEach(line => {
    // Skip empty lines
    if (!line.trim()) return;
    
    // Extract file path and error code
    const match = line.match(/([^(]+)\((\d+),(\d+)\): error (TS\d+): (.+)/);
    if (match) {
      const [_, filePath, line, col, errorCode, message] = match;
      
      // Count errors by file
      const count = fileErrorCount.get(filePath) || 0;
      fileErrorCount.set(filePath, count + 1);
      
      // Categorize error
      if (errorCode === 'TS2307' || errorCode === 'TS1192') {
        categories.importErrors.push({ filePath, line, col, errorCode, message });
      } else if (errorCode === 'TS2339') {
        categories.propertyAccessErrors.push({ filePath, line, col, errorCode, message });
      } else if (errorCode === 'TS2366' || errorCode === 'TS2740' || errorCode === 'TS2367') {
        categories.typeMismatchErrors.push({ filePath, line, col, errorCode, message });
      } else if (errorCode === 'TS2551' || errorCode === 'TS2564') {
        categories.missingPropertyErrors.push({ filePath, line, col, errorCode, message });
      } else if (errorCode === 'TS18046') {
        categories.objectIdErrors.push({ filePath, line, col, errorCode, message });
      } else if (errorCode.startsWith('TS1')) {
        categories.syntaxErrors.push({ filePath, line, col, errorCode, message });
      } else if (message.includes('Promise') || message.includes('async')) {
        categories.promiseErrors.push({ filePath, line, col, errorCode, message });
      } else if (message.includes('undefined') || message.includes('null')) {
        categories.undefinedErrors.push({ filePath, line, col, errorCode, message });
      } else {
        categories.otherErrors.push({ filePath, line, col, errorCode, message });
      }
      
      // Count by error code
      const errorCodeCount = errorMap.get(errorCode) || 0;
      errorMap.set(errorCode, errorCodeCount + 1);
    }
  });
  
  return {
    totalErrors: errors.length - 1, // Subtract 1 for the empty line
    byErrorCode: Object.fromEntries(errorMap),
    byCategory: Object.fromEntries(
      Object.entries(categories).map(([key, value]) => [key, value.length])
    ),
    categories,
    fileErrorCount: Object.fromEntries(fileErrorCount),
    mostProblematicFiles: [...fileErrorCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([file, count]) => ({ file, count }))
  };
}

// Function to generate a detailed error report
function generateReport(analysis) {
  let report = '# TypeScript Error Analysis Report\n\n';
  
  // Overview section
  report += '## Overview\n\n';
  report += `Total errors: ${analysis.totalErrors}\n\n`;
  
  // Error category breakdown
  report += '## Error Categories\n\n';
  report += '| Category | Count |\n';
  report += '|----------|-------|\n';
  Object.entries(analysis.byCategory).forEach(([category, count]) => {
    report += `| ${category} | ${count} |\n`;
  });
  report += '\n';
  
  // Error code breakdown
  report += '## Error Codes\n\n';
  report += '| Error Code | Count | Description |\n';
  report += '|------------|-------|-------------|\n';
  
  // Error code descriptions
  const errorDescriptions = {
    'TS2307': 'Cannot find module or its type declarations',
    'TS1192': 'Module has no default export',
    'TS2339': 'Property does not exist on type',
    'TS2366': 'Function lacks return statement and return type does not include undefined',
    'TS2551': 'Property does not exist on type (did you mean...)',
    'TS2564': 'Property has no initializer and is not definitely assigned',
    'TS2739': 'Type is missing required properties',
    'TS2740': 'Type is missing required properties from type',
    'TS18046': 'Object is of type unknown',
    'TS2367': 'Comparison appears unintentional because types have no overlap'
  };
  
  Object.entries(analysis.byErrorCode).sort((a, b) => b[1] - a[1]).forEach(([code, count]) => {
    const description = errorDescriptions[code] || 'Unknown error';
    report += `| ${code} | ${count} | ${description} |\n`;
  });
  report += '\n';
  
  // Most problematic files
  report += '## Most Problematic Files\n\n';
  report += '| File | Error Count |\n';
  report += '|------|------------|\n';
  analysis.mostProblematicFiles.forEach(({ file, count }) => {
    report += `| ${file} | ${count} |\n`;
  });
  report += '\n';
  
  // Error examples by category
  report += '## Error Examples by Category\n\n';
  
  Object.entries(analysis.categories).forEach(([category, errors]) => {
    if (errors.length === 0) return;
    
    report += `### ${category} (${errors.length} errors)\n\n`;
    report += '```\n';
    
    // Show up to 5 examples
    errors.slice(0, 5).forEach(err => {
      report += `${err.filePath}(${err.line},${err.col}): error ${err.errorCode}: ${err.message}\n`;
    });
    
    if (errors.length > 5) {
      report += `... and ${errors.length - 5} more\n`;
    }
    
    report += '```\n\n';
  });
  
  // Fix recommendations
  report += '## Fix Recommendations\n\n';
  
  // Import errors
  if (analysis.byCategory.importErrors > 0) {
    report += '### Import Errors\n\n';
    report += '1. Use the `fix-remaining-imports.js` script to fix common import statement issues\n';
    report += '2. Check for missing packages in package.json\n';
    report += '3. Create missing type declarations for third-party libraries\n';
    report += '4. Ensure module paths are correct\n\n';
  }
  
  // Property access errors
  if (analysis.byCategory.propertyAccessErrors > 0) {
    report += '### Property Access Errors\n\n';
    report += '1. Add proper type assertions or narrowing\n';
    report += '2. Update interfaces to include missing properties\n';
    report += '3. Use optional chaining (`?.`) for properties that might not exist\n';
    report += '4. Add guard clauses to check if properties exist before accessing\n\n';
  }
  
  // Type mismatch errors
  if (analysis.byCategory.typeMismatchErrors > 0) {
    report += '### Type Mismatch Errors\n\n';
    report += '1. Update function return types to include undefined if needed\n';
    report += '2. Add type assertions to align types\n';
    report += '3. Add explicit return statements to functions\n';
    report += '4. Review comparison operations for incompatible types\n\n';
  }
  
  // Missing property errors
  if (analysis.byCategory.missingPropertyErrors > 0) {
    report += '### Missing Property Errors\n\n';
    report += '1. Initialize class properties in constructor\n';
    report += '2. Use definite assignment assertions (`!`) for properties initialized indirectly\n';
    report += '3. Add optional property markers (`?`) if appropriate\n';
    report += '4. Add property initializers\n\n';
  }
  
  // Object ID errors
  if (analysis.byCategory.objectIdErrors > 0) {
    report += '### MongoDB ObjectId Errors\n\n';
    report += '1. Add proper type assertions for ObjectId properties\n';
    report += '2. Use the `fix-mongoose-objectid.js` script to fix MongoDB ObjectId typing issues\n';
    report += '3. Add null checks before accessing ObjectId properties\n';
    report += '4. Convert string IDs to ObjectIds explicitly\n\n';
  }
  
  // Promise errors
  if (analysis.byCategory.promiseErrors > 0) {
    report += '### Promise/Async Errors\n\n';
    report += '1. Use the `ts-fix-promise-patterns.js` script to fix common Promise syntax issues\n';
    report += '2. Add proper Promise type parameters (`Promise<T>`)\n';
    report += '3. Use correct Promise static methods (`.resolve()`, `.reject()`)\n';
    report += '4. Add proper error handling for rejected Promises\n\n';
  }
  
  // General recommendations
  report += '### Next Steps\n\n';
  report += '1. Run `fix-critical-errors.js` to address critical syntax issues\n';
  report += '2. Run `fix-typescript-errors.js` to add basic type assertions\n';
  report += '3. Run `ts-migration-toolkit.js --fix=<category>` for focused fixes\n';
  report += '4. For severe issues in specific modules:\n';
  report += '   - Run `fix-marketplace-adapters.js` for marketplace adapter issues\n';
  report += '   - Run `fix-connection-module-errors.js` for connection module issues\n';
  report += '   - Run `fix-mongoose-objectid.js` for MongoDB ObjectId typing issues\n';
  report += '5. Consider using `add-ts-nocheck-to-remaining-errors.js` for files that are difficult to fix\n\n';
  
  return report;
}

// Main execution
async function main() {
  try {
    console.log('Starting TypeScript error analysis...');
    
    // Process each target module
    targetModules.forEach(module => {
      console.log(`Processing module: ${module}`);
      removeAndBackupTsNocheck(module);
    });
    
    // Get TypeScript errors
    console.log('Gathering TypeScript errors...');
    const errorOutput = getTypeScriptErrors();
    
    // Analyze errors
    console.log('Analyzing error patterns...');
    const analysis = analyzeErrors(errorOutput);
    
    // Generate report
    console.log('Generating error report...');
    const report = generateReport(analysis);
    
    // Write report to file
    const reportPath = path.join(process.cwd(), 'TYPESCRIPT-ERROR-REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`Error report written to: ${reportPath}`);
    
    // Restore original files
    console.log('Restoring @ts-nocheck to files...');
    restoreBackups();
    
    console.log('Error analysis complete!');
  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

main();