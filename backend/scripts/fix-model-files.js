#!/usr/bin/env node

/**
 * Fix Model Files Script
 * 
 * This script:
 * 1. Removes duplicate mongoose imports from model files
 * 2. Standardizes the mongoose import to use the ES module syntax
 * 3. Adds the TypeScript fixed comment to all fixed files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Paths to model files
const MODEL_FILES_PATTERN = 'src/models/*.ts';

// Main function to run the script
async function run() {
  console.log('🔧 Starting fix-model-files.js...');

  // Get all model files
  const modelFiles = glob.sync(MODEL_FILES_PATTERN);
  console.log(`Found ${modelFiles.length} model files to process.`);

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  // Process each model file
  for (const file of modelFiles) {
    try {
      console.log(`Processing ${file}...`);
      const content = fs.readFileSync(file, 'utf8');

      // Check if file already has TypeScript fixed comment
      const isAlreadyFixed = content.includes('// TypeScript fixed');

      // Count mongoose imports
      const defaultImport = content.match(/import\s+mongoose\s*,/);
      const namespaceImport = content.match(/import\s+\*\s+as\s+mongoose\s+from/);
      const hasDuplicateImports = defaultImport && namespaceImport;

      if (!hasDuplicateImports && isAlreadyFixed) {
        console.log(`  Skipping ${file} - already fixed.`);
        skipped++;
        continue;
      }

      // Create a backup of the original file
      const backupPath = `${file}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, content, 'utf8');

      // Fix the imports - remove namespace import if both exist
      let fixedContent = content;
      if (hasDuplicateImports) {
        fixedContent = fixedContent.replace(/import\s+\*\s+as\s+mongoose\s+from\s+['"]mongoose['"];?\n?/g, '');
      }

      // If no default import exists but namespace import does, replace it with default import
      if (!defaultImport && namespaceImport) {
        fixedContent = fixedContent.replace(
          /import\s+\*\s+as\s+mongoose\s+from\s+['"]mongoose['"];?\n?/g, 
          'import mongoose, { Document, Model, Schema } from \'mongoose\';\n'
        );
      }

      // Add TypeScript fixed comment if not exists
      if (!isAlreadyFixed) {
        fixedContent = '// TypeScript fixed\n' + fixedContent;
      }

      // Clean up multiple newlines
      fixedContent = fixedContent.replace(/\n{3,}/g, '\n\n');

      // Write the fixed content back
      fs.writeFileSync(file, fixedContent, 'utf8');
      console.log(`  ✅ Fixed ${file}`);
      fixed++;
    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error);
      errors++;
    }
  }

  // Print summary
  console.log(`
=========== FIX SUMMARY ===========
Fixed: ${fixed} files
Skipped: ${skipped} files
Errors: ${errors} files
====================================
`);
}

// Run the script
run().catch(error => {
  console.error('Script failed with error:', error);
  process.exit(1);
});