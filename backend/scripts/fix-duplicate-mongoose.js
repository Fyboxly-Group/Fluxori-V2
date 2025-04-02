#!/usr/bin/env node

/**
 * Fix Duplicate Mongoose Imports
 * 
 * This script fixes the common issue of having duplicate mongoose imports in model files:
 * 1. Removes duplicate mongoose imports
 * 2. Standardizes import format
 * 3. Adds the TypeScript fixed comment
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  name: 'Duplicate Mongoose Imports',
  pattern: 'src/**/*.ts', // Match all TypeScript files
  isAlreadyFixed: (content) => {
    return content.includes('// TypeScript fixed') || !hasDuplicateMongooseImports(content);
  },
  addFixedComment: true,
  fixedComment: '// TypeScript fixed',
  createBackups: true,
};

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
      // Read file content
      const content = fs.readFileSync(file, 'utf8');
      
      // Skip if file is already fixed or doesn't have duplicate mongoose imports
      if (CONFIG.isAlreadyFixed(content)) {
        skippedFiles++;
        continue;
      }
      
      console.log(`Processing ${file}...`);
      
      // Create backup if enabled
      if (CONFIG.createBackups) {
        const backupPath = `${file}.backup-${Date.now()}`;
        fs.writeFileSync(backupPath, content, 'utf8');
        console.log(`  Created backup at ${backupPath}`);
      }
      
      // Apply fixes
      let fixedContent = fixDuplicateMongooseImports(content);
      
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
Skipped ${skippedFiles} files (already fixed or no duplicate imports)
Errors in ${errorFiles} files
====================================
  `);
}

/**
 * Check if a file has duplicate mongoose imports
 */
function hasDuplicateMongooseImports(content) {
  const mongooseImports = content.match(/import\s+.*?mongoose.*?from.*?;/g) || [];
  return mongooseImports.length > 1;
}

/**
 * Fix duplicate mongoose imports in a file
 */
function fixDuplicateMongooseImports(content) {
  // Extract all mongoose imports
  const mongooseImports = content.match(/import\s+.*?mongoose.*?from.*?;/g) || [];
  
  // If no duplicates, return as is
  if (mongooseImports.length <= 1) {
    return content;
  }
  
  // Keep track of what's imported
  let hasNamedImport = false;
  let hasDefaultImport = false;
  let namedImports = new Set();
  
  // Analyze all mongoose imports
  mongooseImports.forEach(importStr => {
    // Check for default import (import mongoose from 'mongoose')
    if (importStr.match(/import\s+mongoose\s+from/)) {
      hasDefaultImport = true;
    }
    
    // Check for namespace import (import * as mongoose from 'mongoose')
    if (importStr.match(/import\s+\*\s+as\s+mongoose\s+from/)) {
      hasDefaultImport = true; // Treat namespace import as default for simplicity
    }
    
    // Check for named imports (import { X, Y } from 'mongoose')
    const namedMatch = importStr.match(/import\s+\{\s*(.*?)\s*\}\s+from\s+['"]mongoose['"]/);
    if (namedMatch && namedMatch[1]) {
      namedMatch[1].split(',').forEach(name => {
        const trimmedName = name.trim();
        if (trimmedName) {
          namedImports.add(trimmedName);
        }
      });
      hasNamedImport = true;
    }
  });
  
  // Create a new combined import statement
  let newImport = '';
  
  if (hasDefaultImport && hasNamedImport) {
    // Combined default and named imports
    newImport = `import mongoose, { ${Array.from(namedImports).join(', ')} } from 'mongoose';`;
  } else if (hasDefaultImport) {
    // Only default import
    newImport = `import mongoose from 'mongoose';`;
  } else if (hasNamedImport) {
    // Only named imports
    newImport = `import { ${Array.from(namedImports).join(', ')} } from 'mongoose';`;
  }
  
  // Replace all mongoose imports with the new combined import
  let fixedContent = content;
  mongooseImports.forEach(importStr => {
    fixedContent = fixedContent.replace(importStr, '');
  });
  
  // Add the new import at the top of the file
  if (newImport) {
    // Find a good position to add the import (after any existing imports)
    const importSection = findImportSection(fixedContent);
    if (importSection.end > 0) {
      fixedContent = 
        fixedContent.substring(0, importSection.end) + 
        newImport + '\n' +
        fixedContent.substring(importSection.end);
    } else {
      // Add at the beginning if no imports found
      fixedContent = newImport + '\n' + fixedContent;
    }
  }
  
  // Clean up any double newlines created by removing imports
  fixedContent = fixedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return fixedContent;
}

/**
 * Helper function to find the import section in a file
 */
function findImportSection(content) {
  const lines = content.split('\n');
  let end = 0;
  
  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      end = content.indexOf(lines[i]) + lines[i].length;
    }
  }
  
  // Add a newline after the import section
  if (end > 0) {
    end += 1;
  }
  
  return { end };
}

// Run the script
run().catch(error => {
  console.error('Error running fix script:', error);
  process.exit(1);
});