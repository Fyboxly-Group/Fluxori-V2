/**
 * Script to fix duplicate mongoose imports in TypeScript files
 */
const fs = require('fs');
const path = require('path');

const CONFIG = {
  name: 'Mongoose Import Error Fixer',
  extensions: ['.ts'],
  backupFiles: true,
  dryRun: false,
  verbose: true,
};

function findAllTSFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.')) {
      results = results.concat(findAllTSFiles(filePath));
    } else if (
      stat.isFile() && 
      CONFIG.extensions.includes(path.extname(file)) &&
      !file.startsWith('.')
    ) {
      results.push(filePath);
    }
  }
  
  return results;
}

function fixMongooseImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains mongoose duplicate imports
    if (content.match(/mongoose.*mongoose/s)) {
      console.log(`Processing ${filePath}...`);
      
      // Create a backup if configured
      if (CONFIG.backupFiles) {
        const backupPath = `${filePath}.backup-${Date.now()}`;
        fs.writeFileSync(backupPath, content);
        console.log(`  Created backup at ${backupPath}`);
      }
      
      // Fix mongoose duplicate imports
      let fixedContent = content;
      
      // Pattern 1: Two separate import statements
      fixedContent = fixedContent.replace(
        /import mongoose from ['"]mongoose['"];\s*import \* as mongoose from ['"]mongoose['"];/g,
        `import mongoose from 'mongoose';`
      );
      
      // Pattern 2: First import as namespace, then default
      fixedContent = fixedContent.replace(
        /import \* as mongoose from ['"]mongoose['"];\s*import mongoose from ['"]mongoose['"];/g,
        `import mongoose from 'mongoose';`
      );
      
      // Pattern 3: First import default, then as namespace
      fixedContent = fixedContent.replace(
        /import mongoose from ['"]mongoose['"];\s*import \* as mongoose from ['"]mongoose['"];/g,
        `import mongoose from 'mongoose';`
      );
      
      // Only write changes if content was modified and not in dry run mode
      if (fixedContent !== content && !CONFIG.dryRun) {
        fs.writeFileSync(filePath, fixedContent);
        console.log(`  Fixed successfully`);
        return { fixed: true, file: filePath };
      } else if (fixedContent !== content && CONFIG.dryRun) {
        console.log(`  [DRY RUN] Would fix duplicate mongoose imports`);
        return { fixed: true, file: filePath };
      } else {
        console.log(`  No duplicate mongoose patterns found to fix`);
        return { fixed: false, file: filePath };
      }
    }
    
    return { fixed: false, file: filePath };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { error: true, file: filePath, message: error.message };
  }
}

async function run() {
  console.log(`Starting ${CONFIG.name}...`);
  
  // Find all TypeScript files
  const rootDir = path.resolve(__dirname, '..');
  const allTsFiles = findAllTSFiles(rootDir);
  
  console.log(`Found ${allTsFiles.length} TypeScript files to check`);
  
  // Process each file
  const results = {
    fixed: 0,
    skipped: 0,
    errors: 0,
  };
  
  for (const file of allTsFiles) {
    const result = fixMongooseImports(file);
    
    if (result.fixed) {
      results.fixed++;
    } else if (result.error) {
      results.errors++;
      console.error(`Error in ${result.file}: ${result.message}`);
    } else {
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