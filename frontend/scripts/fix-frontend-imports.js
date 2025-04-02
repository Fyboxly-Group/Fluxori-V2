#!/usr/bin/env node

/**
 * Fix Frontend Import Errors Script
 * 
 * This script fixes import issues in the frontend code:
 * 1. Fixes missing Chakra UI imports with correct paths
 * 2. Fixes missing Lucide React icon imports
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration for the script
const CONFIG = {
  name: 'Frontend Import Errors',
  pattern: 'src/features/connections/components/*.tsx',
  utilsPattern: 'src/features/connections/utils/*.tsx',
  createBackups: true,
};

// Run the script
async function run() {
  console.log(`Starting fix script for ${CONFIG.name}...`);
  
  // Find component files that need fixing
  const componentFiles = glob.sync(CONFIG.pattern);
  console.log(`Found ${componentFiles.length} component files to process`);
  
  // Find utils files that need fixing
  const utilsFiles = glob.sync(CONFIG.utilsPattern);
  console.log(`Found ${utilsFiles.length} utils files to process`);
  
  let fixedFiles = 0;
  let skippedFiles = 0;
  let errorFiles = 0;
  
  // Process component files
  for (const file of [...componentFiles, ...utilsFiles]) {
    try {
      console.log(`Processing ${file}...`);
      
      // Read file content
      const content = fs.readFileSync(file, 'utf8');
      
      // Create backup if enabled
      if (CONFIG.createBackups) {
        const backupPath = `${file}.backup-${Date.now()}`;
        fs.writeFileSync(backupPath, content, 'utf8');
        console.log(`  Created backup at ${backupPath}`);
      }
      
      // Apply fixes
      let fixedContent = content;
      
      // 1. Fix Chakra UI SimpleGrid import
      fixedContent = fixedContent.replace(
        /import \{ (.*?)SimpleGrid(.*?) \} from ['"]@chakra-ui\/react\/simple-grid['"];/g,
        (match, prefix, suffix) => {
          return `import { ${prefix}${suffix} } from '@chakra-ui/react/layout';\nimport { SimpleGrid } from '@chakra-ui/react/layouts';`;
        }
      );
      
      // 2. Fix AlertDialog imports
      fixedContent = fixedContent.replace(
        /import \{([^}]*?)AlertDialog([^}]*?)\} from ['"]@chakra-ui\/react\/modal['"];/g,
        (match, prefix, suffix) => {
          return `import {${prefix}${suffix}} from '@chakra-ui/react';\n// Fixed: AlertDialog components are imported from '@chakra-ui/react'`;
        }
      );
      
      // 3. Fix missing Lucide React FileInvoice icon
      if (fixedContent.includes("FileInvoice")) {
        fixedContent = fixedContent.replace(
          /FileInvoice,/g,
          "FileText, // Changed FileInvoice to FileText"
        );
        
        // Replace any use of FileInvoice with FileText
        fixedContent = fixedContent.replace(
          /icon: FileInvoice,/g,
          "icon: FileText, // Changed FileInvoice to FileText"
        );
        
        fixedContent = fixedContent.replace(
          /return FileInvoice;/g,
          "return FileText; // Changed FileInvoice to FileText"
        );
      }
      
      // Write the fixed content back to the file if changes were made
      if (fixedContent !== content) {
        fs.writeFileSync(file, fixedContent, 'utf8');
        fixedFiles++;
        console.log(`  Fixed successfully`);
      } else {
        skippedFiles++;
        console.log(`  No issues found to fix`);
      }
      
    } catch (error) {
      console.error(`  Error fixing ${file}:`, error);
      errorFiles++;
    }
  }
  
  // Print summary
  console.log(`
=========== FRONTEND FIX SUMMARY ===========
Fixed ${fixedFiles} files
Skipped ${skippedFiles} files
Errors in ${errorFiles} files
============================================
  `);
}

// Run the script
run().catch(error => {
  console.error('Error running fix script:', error);
  process.exit(1);
});