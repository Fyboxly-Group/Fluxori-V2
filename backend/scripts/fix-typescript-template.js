/**
 * TypeScript Fix Script Template
 * 
 * This template provides a structured approach to fixing TypeScript errors
 * in a specific module or category of files. Use this as a starting point
 * for creating specialized fix scripts.
 * 
 * Instructions:
 * 1. Copy this template and rename it for your specific fix (e.g., fix-user-module.js)
 * 2. Update the CONFIG section with appropriate values
 * 3. Implement the appropriate fix functions for your specific case
 * 4. Add additional helper functions as needed
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ===== CONFIG =====
// Update these values for your specific fix script
const CONFIG = {
  // Name of the module or feature you're fixing
  name: 'MODULE_NAME',
  
  // Glob pattern to match files that need fixing
  pattern: 'src/modules/MODULE_NAME/**/*.ts',
  
  // Check if a file has already been fixed - implements logic to identify fixed files
  isAlreadyFixed: (content) => {
    // For example, check for a specific comment or pattern indicating a fix
    return content.includes('// TypeScript fixed');
  },
  
  // Whether to add a comment indicating the file has been fixed
  addFixedComment: true,
  
  // Comment to add at the top of fixed files
  fixedComment: '// TypeScript fixed',
  
  // Whether to remove @ts-nocheck directives
  removeNoCheckDirectives: true,
  
  // Backup files before fixing them (recommended)
  createBackups: true,
};
// ==================

/**
 * Main fix function - runs the script
 */
async function run() {
  console.log(`Starting fix script for ${CONFIG.name}...`);
  
  // Find files that need fixing
  const files = glob.sync(CONFIG.pattern);
  console.log(`Found ${files.length} files matching pattern ${CONFIG.pattern}`);
  
  let fixedFiles = 0;
  let skippedFiles = 0;
  let errorFiles = 0;
  
  // Process each file
  for (const file of files) {
    try {
      console.log(`Processing ${file}...`);
      
      // Read file content
      const content = fs.readFileSync(file, 'utf8');
      
      // Skip if file is already fixed
      if (CONFIG.isAlreadyFixed(content)) {
        console.log(`  Skipping - already fixed`);
        skippedFiles++;
        continue;
      }
      
      // Create backup if enabled
      if (CONFIG.createBackups) {
        const backupPath = `${file}.backup-${Date.now()}`;
        fs.writeFileSync(backupPath, content, 'utf8');
        console.log(`  Created backup at ${backupPath}`);
      }
      
      // Apply fixes
      let fixedContent = content;
      
      // Fix 1: Fix imports - implement specific import fixes
      fixedContent = fixImports(fixedContent, file);
      
      // Fix 2: Fix interface exports - implement specific interface fixes
      fixedContent = fixInterfaceExports(fixedContent, file);
      
      // Fix 3: Fix class implementations - implement specific class fixes
      fixedContent = fixClassImplementations(fixedContent, file);
      
      // Fix 4: Add missing type definitions - implement specific type definition fixes
      fixedContent = addMissingTypeDefinitions(fixedContent, file);
      
      // Remove @ts-nocheck directives if configured
      if (CONFIG.removeNoCheckDirectives) {
        fixedContent = fixedContent.replace(/\/\/\s*@ts-nocheck\s*\n/g, '');
      }
      
      // Add fixed comment if configured
      if (CONFIG.addFixedComment && !fixedContent.includes(CONFIG.fixedComment)) {
        fixedContent = `${CONFIG.fixedComment}\n${fixedContent}`;
      }
      
      // Write the fixed content back to the file
      fs.writeFileSync(file, fixedContent, 'utf8');
      fixedFiles++;
      console.log(`  Fixed successfully`);
      
    } catch (error) {
      console.error(`  Error fixing ${file}:`, error);
      errorFiles++;
    }
  }
  
  // Print summary
  console.log(`
=========== FIX SUMMARY ===========
Fixed ${fixedFiles} files
Skipped ${skippedFiles} files (already fixed)
Errors in ${errorFiles} files
====================================
  `);
}

/**
 * Fix imports in the file
 * 
 * @param {string} content - The file content
 * @param {string} filePath - The path to the file
 * @returns {string} - The fixed content
 */
function fixImports(content, filePath) {
  // IMPLEMENT ME: Add logic to fix imports
  
  /* Example implementation:
  // Add mongoose import if needed for model files
  if (filePath.includes('model') && !content.includes("import * as mongoose from 'mongoose'")) {
    return content.replace(
      /(import .+?;(\r?\n)+)/,
      '$1import * as mongoose from "mongoose";\n'
    );
  }
  */
  
  return content;
}

/**
 * Fix interface exports in the file
 * 
 * @param {string} content - The file content
 * @param {string} filePath - The path to the file
 * @returns {string} - The fixed content
 */
function fixInterfaceExports(content, filePath) {
  // IMPLEMENT ME: Add logic to fix interface exports
  
  /* Example implementation:
  // Fix model interface exports
  if (filePath.includes('model') && content.includes('export type')) {
    return content.replace(
      /export type (\w+)Model/g,
      'export interface $1Model extends mongoose.Model<$1Document> {}'
    );
  }
  */
  
  return content;
}

/**
 * Fix class implementations in the file
 * 
 * @param {string} content - The file content
 * @param {string} filePath - The path to the file
 * @returns {string} - The fixed content
 */
function fixClassImplementations(content, filePath) {
  // IMPLEMENT ME: Add logic to fix class implementations
  
  /* Example implementation:
  // Fix service implementations
  if (filePath.includes('service') && content.includes('implements')) {
    // Find missing methods from interfaces and add placeholders
    // This is an example - actual implementation would be more sophisticated
    const missingMethods = findMissingMethods(content);
    
    let fixedContent = content;
    for (const method of missingMethods) {
      fixedContent = addMethodImplementation(fixedContent, method);
    }
    
    return fixedContent;
  }
  */
  
  return content;
}

/**
 * Add missing type definitions in the file
 * 
 * @param {string} content - The file content
 * @param {string} filePath - The path to the file
 * @returns {string} - The fixed content
 */
function addMissingTypeDefinitions(content, filePath) {
  // IMPLEMENT ME: Add logic to add missing type definitions
  
  /* Example implementation:
  // Replace any types with more specific types
  if (content.includes(': any')) {
    // Convert 'any' to specific types based on context
    // This is an example - actual implementation would be more sophisticated
    return content
      .replace(/: any\[\]/g, ': string[]') // Arrays of any to string[]
      .replace(/: any(?!\[)/g, ': unknown'); // Plain any to unknown as a safer alternative
  }
  */
  
  return content;
}

// Run the script
run().catch(error => {
  console.error('Error running fix script:', error);
  process.exit(1);
});