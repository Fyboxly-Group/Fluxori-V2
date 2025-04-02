/**
 * Script to fix duplicate mongoose imports in TypeScript files
 */
const fs = require('fs');
const path = require('path');

const CONFIG = {
  name: 'Mongoose Duplicates Fixer',
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

function fixMongooseDuplicates(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Only process files with mongoose imports
    if (content.includes('mongoose')) {
      console.log(`Processing ${filePath}...`);
      
      // Create a backup if configured
      if (CONFIG.backupFiles) {
        const backupPath = `${filePath}.backup-${Date.now()}`;
        fs.writeFileSync(backupPath, content);
        console.log(`  Created backup at ${backupPath}`);
      }
      
      // Fix multiple patterns of duplicate mongoose imports
      let fixedContent = content;
      
      // Pattern 1: Two separate import statements for mongoose
      fixedContent = fixedContent.replace(
        /import\s+mongoose\s+from\s+['"]mongoose['"];\s*import\s+\*\s+as\s+mongoose\s+from\s+['"]mongoose['"];/g,
        "import mongoose from 'mongoose';"
      );
      
      // Pattern 2: First as namespace, then default
      fixedContent = fixedContent.replace(
        /import\s+\*\s+as\s+mongoose\s+from\s+['"]mongoose['"];\s*import\s+mongoose\s+from\s+['"]mongoose['"];/g,
        "import mongoose from 'mongoose';"
      );
      
      // Pattern 3: Plain duplicates of default imports
      fixedContent = fixedContent.replace(
        /import\s+mongoose\s+from\s+['"]mongoose['"];\s*import\s+mongoose\s+from\s+['"]mongoose['"];/g,
        "import mongoose from 'mongoose';"
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
        // Check for more specific patterns that need manual fixing
        const hasDuplicateDeclarations = (
          content.includes('mongoose') && 
          /import.*mongoose.*;\s*import.*mongoose/s.test(content)
        );
        
        if (hasDuplicateDeclarations) {
          console.log(`  ⚠️ File has potential duplicate mongoose declarations that need manual fixing`);
          return { manual: true, file: filePath };
        }
        
        console.log(`  No mongoose duplicates found to fix`);
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
  
  // First, find all files with errors
  console.log("Identifying files with duplicate mongoose imports...");
  const dupeFiles = [];
  
  for (const file of allTsFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for patterns of duplicate mongoose imports
      const hasDuplicateImports = (
        (content.includes("import mongoose from 'mongoose';") && content.includes("import * as mongoose from 'mongoose';")) ||
        content.match(/import.*mongoose.*;\s*import.*mongoose/s)
      );
      
      if (hasDuplicateImports) {
        dupeFiles.push(file);
      }
    } catch (error) {
      console.error(`Error scanning ${file}:`, error);
    }
  }
  
  console.log(`Found ${dupeFiles.length} files with potential duplicate mongoose imports`);
  
  // Process each identified file
  const results = {
    fixed: 0,
    skipped: 0,
    manual: 0,
    errors: 0,
  };
  
  for (const file of dupeFiles) {
    const result = fixMongooseDuplicates(file);
    
    if (result.fixed) {
      results.fixed++;
    } else if (result.manual) {
      results.manual++;
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
  console.log(`Need manual fixing: ${results.manual} files`);
  console.log(`Errors in ${results.errors} files`);
  console.log(`============================================`);
  
  // If there are files that need manual fixing, print their paths
  if (results.manual > 0) {
    console.log("\nFiles that need manual fixing:");
    for (const file of dupeFiles) {
      const result = fixMongooseDuplicates(file);
      if (result.manual) {
        console.log(`- ${file}`);
      }
    }
  }
}

// Run the script
run().catch(console.error);