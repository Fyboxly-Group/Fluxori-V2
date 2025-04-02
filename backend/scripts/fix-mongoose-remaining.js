/**
 * Script to fix remaining mongoose import issues
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
  name: 'Mongoose Remaining Duplicates Fixer',
  extensions: ['.ts'],
  backupFiles: true,
  dryRun: false,
  verbose: true,
};

// List of files known to have mongoose duplication issues
const FILES_TO_FIX = [
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/ai-cs-agent/models/conversation.model.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/credits/models/credit.model.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/international-trade/models/international-trade.model.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/notifications/models/notification.model.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/order-ingestion/models/order.model.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/product-ingestion/models/product-sync-config.model.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/product-ingestion/models/warehouse.model.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/xero-connector/models/xero-account-mapping.model.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/xero-connector/models/xero-config.model.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/xero-connector/models/xero-connection.model.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/xero-connector/models/xero-sync-status.model.ts',
];

function fixMongooseImports(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Processing ${filePath}...`);
    
    // Create a backup if configured
    if (CONFIG.backupFiles) {
      const backupPath = `${filePath}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, content);
      console.log(`  Created backup at ${backupPath}`);
    }
    
    // Fix mongoose imports with pattern matching
    let fixed = false;
    
    // Check for duplicate mongoose imports
    if (content.match(/import.*mongoose.*import.*mongoose/s)) {
      // Pattern 1: Remove all import statements for mongoose
      const pattern1Regex = /import\s+mongoose.*from\s+['"]mongoose['"];\s*|import\s+\*\s+as\s+mongoose\s+from\s+['"]mongoose['"];\s*/g;
      const cleanedContent = content.replace(pattern1Regex, '');
      
      // Pattern 2: Add a single correct import at the top
      let importLine = "import mongoose from 'mongoose';\n";
      
      // Check if we need to include Schema, Document, etc.
      if (content.includes('Schema') || content.includes('Document')) {
        importLine = "import mongoose, { Schema, Document } from 'mongoose';\n";
      }
      
      // Add the import line at the top after any comments and TypeScript directives
      const lines = cleanedContent.split('\n');
      const insertLine = lines.findIndex(line => !line.trim().startsWith('//') && !line.trim().startsWith('/*') && line.trim() !== '') || 0;
      
      lines.splice(insertLine, 0, importLine);
      content = lines.join('\n');
      
      fixed = true;
    }
    
    // Only write changes if modifications were made and not in dry run mode
    if (fixed && !CONFIG.dryRun) {
      fs.writeFileSync(filePath, content);
      console.log(`  Fixed successfully`);
      return { fixed: true, file: filePath };
    } else if (fixed && CONFIG.dryRun) {
      console.log(`  [DRY RUN] Would fix mongoose imports`);
      return { fixed: true, file: filePath };
    } else {
      console.log(`  No mongoose issues found to fix`);
      return { fixed: false, file: filePath };
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { error: true, file: filePath, message: error.message };
  }
}

async function run() {
  console.log(`Starting ${CONFIG.name}...`);
  
  console.log(`Found ${FILES_TO_FIX.length} files to process`);
  
  // Process each file
  const results = {
    fixed: 0,
    skipped: 0,
    errors: 0,
  };
  
  for (const file of FILES_TO_FIX) {
    if (fs.existsSync(file)) {
      const result = fixMongooseImports(file);
      
      if (result.fixed) {
        results.fixed++;
      } else if (result.error) {
        results.errors++;
        console.error(`Error in ${result.file}: ${result.message}`);
      } else {
        results.skipped++;
      }
    } else {
      console.log(`File not found: ${file}`);
      results.skipped++;
    }
  }
  
  // Print summary
  console.log(`\n=========== ${CONFIG.name.toUpperCase()} SUMMARY ===========`);
  console.log(`Fixed ${results.fixed} files`);
  console.log(`Skipped ${results.skipped} files`);
  console.log(`Errors in ${results.errors} files`);
  console.log(`============================================`);
}

// Run the script
run().catch(console.error);