/**
 * Script to fix exact mongoose import patterns
 */
const fs = require('fs');
const path = require('path');

const CONFIG = {
  name: 'Mongoose Import Pattern Fixer',
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
    
    // Check if this file has mongoose import issues
    if (content.includes('mongoose')) {
      console.log(`Processing ${filePath}...`);
      
      // Create a backup if configured
      if (CONFIG.backupFiles) {
        const backupPath = `${filePath}.backup-${Date.now()}`;
        fs.writeFileSync(backupPath, content);
        console.log(`  Created backup at ${backupPath}`);
      }
      
      // Fix mongoose duplicate imports with specific patterns
      let fixedContent = content;
      
      // Pattern 1: Both default and namespace imports (common pattern in model files)
      const pattern1 = /import mongoose,\s*{[^}]*}\s*from\s*['"]mongoose['"];\s*import\s*\*\s*as\s*mongoose\s*from\s*['"]mongoose['"];/g;
      if (pattern1.test(content)) {
        fixedContent = content.replace(pattern1, (match) => {
          // Extract the named imports
          const namedImportsMatch = match.match(/import mongoose,\s*{([^}]*)}\s*from\s*['"]mongoose['"];/);
          const namedImports = namedImportsMatch ? namedImportsMatch[1].trim() : '';
          
          return `import mongoose, { ${namedImports} } from 'mongoose';`;
        });
      }
      
      // Pattern 2: Default import and namespace import (most common pattern)
      const pattern2 = /import mongoose\s*from\s*['"]mongoose['"];\s*import\s*\*\s*as\s*mongoose\s*from\s*['"]mongoose['"];/g;
      if (pattern2.test(fixedContent)) {
        fixedContent = fixedContent.replace(pattern2, "import mongoose from 'mongoose';");
      }
      
      // Pattern 3: Namespace import and default import (reversed order)
      const pattern3 = /import\s*\*\s*as\s*mongoose\s*from\s*['"]mongoose['"];\s*import mongoose\s*from\s*['"]mongoose['"];/g;
      if (pattern3.test(fixedContent)) {
        fixedContent = fixedContent.replace(pattern3, "import mongoose from 'mongoose';");
      }
      
      // Pattern 4: Named imports and namespace import
      const pattern4 = /import\s*{\s*([^}]*)\s*}\s*from\s*['"]mongoose['"];\s*import\s*\*\s*as\s*mongoose\s*from\s*['"]mongoose['"];/g;
      if (pattern4.test(fixedContent)) {
        fixedContent = fixedContent.replace(pattern4, (match, namedImports) => {
          return `import mongoose, { ${namedImports} } from 'mongoose';`;
        });
      }
      
      // Pattern 5: Namespace import and named imports
      const pattern5 = /import\s*\*\s*as\s*mongoose\s*from\s*['"]mongoose['"];\s*import\s*{\s*([^}]*)\s*}\s*from\s*['"]mongoose['"];/g;
      if (pattern5.test(fixedContent)) {
        fixedContent = fixedContent.replace(pattern5, (match, namedImports) => {
          return `import mongoose, { ${namedImports} } from 'mongoose';`;
        });
      }
      
      // Only write changes if content was modified and not in dry run mode
      if (fixedContent !== content && !CONFIG.dryRun) {
        fs.writeFileSync(filePath, fixedContent);
        console.log(`  Fixed successfully`);
        return { fixed: true, file: filePath };
      } else if (fixedContent !== content && CONFIG.dryRun) {
        console.log(`  [DRY RUN] Would fix mongoose imports`);
        return { fixed: true, file: filePath };
      } else {
        console.log(`  No matching mongoose import patterns found to fix`);
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
  
  // Find all TypeScript files with mongoose imports
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