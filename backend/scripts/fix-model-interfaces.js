#!/usr/bin/env node

/**
 * Fix Model Interfaces Script
 * 
 * This script updates all model interfaces to use MongooseDocument
 * instead of Document to avoid _id conflict errors.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const TYPES_DIR = path.join(ROOT_DIR, 'src/types/models');

/**
 * Process a type file
 */
function processTypeFile(filePath) {
  console.log(`Processing ${path.relative(ROOT_DIR, filePath)}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace import { Document, Types, Model } with import { Types, Model }
    content = content.replace(
      /import\s*{\s*Document,\s*Types,\s*Model\s*}\s*from\s*'mongoose';/g,
      "import { Types, Model } from 'mongoose';\nimport { MongooseDocument } from '../utils/mongoose-document';"
    );
    
    // Replace Document with MongooseDocument in interface extensions
    content = content.replace(
      /extends\s+Document,\s+I(\w+)\s+{/g,
      "extends MongooseDocument, I$1 {"
    );
    
    // Remove _id from interface
    content = content.replace(
      /_id\?:\s*Types\.ObjectId;/g,
      "// _id is provided by MongooseDocument"
    );
    
    // Only write if changes were made
    if (content !== originalContent) {
      // Create backup
      const backupPath = `${filePath}.interface-backup`;
      fs.writeFileSync(backupPath, originalContent, 'utf8');
      
      // Write updated content
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(chalk.green(`✅ Updated ${path.relative(ROOT_DIR, filePath)}`));
      return true;
    } else {
      console.log(chalk.yellow(`⚠️ No changes needed in ${path.relative(ROOT_DIR, filePath)}`));
      return false;
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error processing ${path.relative(ROOT_DIR, filePath)}:`), error);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log(chalk.bold('🔧 Fix Model Interfaces'));
  console.log(chalk.bold('====================='));
  
  // Find all model type files
  const typeFiles = glob.sync(`${TYPES_DIR}/*.types.ts`);
  
  if (typeFiles.length === 0) {
    console.log(chalk.yellow('No model type files found'));
    return;
  }
  
  console.log(`Found ${typeFiles.length} model type files to process`);
  
  // Process all files
  let updatedCount = 0;
  for (const file of typeFiles) {
    if (processTypeFile(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n🎉 Updated ${updatedCount} files`);
}

// Run the script
main();