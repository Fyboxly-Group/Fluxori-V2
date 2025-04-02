/**
 * Script to fix missing exports in TypeScript files
 */
const fs = require('fs');
const path = require('path');

const CONFIG = {
  name: 'Missing Exports Fixer',
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
      !file.startsWith('.') &&
      file.includes('index.ts')
    ) {
      results.push(filePath);
    }
  }
  
  return results;
}

function fixMissingExports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(path.dirname(filePath));
    
    // Check if this is an index.ts with import statements but missing default exports
    if (filePath.includes('index.ts') && content.includes('import') && !content.includes('export default')) {
      console.log(`Processing ${filePath}...`);
      
      // Create a backup if configured
      if (CONFIG.backupFiles) {
        const backupPath = `${filePath}.backup-${Date.now()}`;
        fs.writeFileSync(backupPath, content);
        console.log(`  Created backup at ${backupPath}`);
      }
      
      // Fix missing exports
      let fixedContent = content;
      
      // Check for import patterns like: import X from './X'
      const moduleNameMatches = [...content.matchAll(/import\s+(\w+)\s+from\s+['"]\.\/(\w+)['"]/g)];
      
      if (moduleNameMatches.length > 0) {
        for (const match of moduleNameMatches) {
          const importName = match[1];
          const moduleName = match[2];
          
          // If we have an import X from './X' pattern but no export default X
          if (moduleName && !content.includes(`export default ${importName}`)) {
            // Add export default at the end of the file
            if (!fixedContent.endsWith('\n')) {
              fixedContent += '\n';
            }
            fixedContent += `\nexport default ${importName};\n`;
            console.log(`  Added missing default export for ${importName}`);
          }
        }
      }
      
      // Only write changes if content was modified and not in dry run mode
      if (fixedContent !== content && !CONFIG.dryRun) {
        fs.writeFileSync(filePath, fixedContent);
        console.log(`  Fixed successfully`);
        return { fixed: true, file: filePath };
      } else if (fixedContent !== content && CONFIG.dryRun) {
        console.log(`  [DRY RUN] Would fix missing exports`);
        return { fixed: true, file: filePath };
      } else {
        console.log(`  No missing exports found to fix`);
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
    const result = fixMissingExports(file);
    
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