/**
 * Script to fix MongoDB ObjectId typing issues
 * 
 * This script specifically addresses the common ObjectId typing issues we identified 
 * during the TypeScript migration:
 * 1. Missing mongoose.Types.ObjectId constructor for ID assignments
 * 2. Direct ObjectId comparison without toString()
 * 3. Missing type assertions for _id assignments
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Target files with ObjectId issues
const TARGET_FILES = [
  'src/modules/ai-cs-agent/**/*.ts',
  'src/modules/rag-retrieval/**/*.ts',
  'src/modules/marketplaces/**/*.ts',
  'src/routes/**/*.ts'
];

// Track statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  issuesFixed: 0,
};

// ObjectId pattern fixes
const objectIdFixes = [
  // Fix direct ID assignments
  {
    name: 'Direct ID assignment',
    matcher: /(\w+)\.(id|userId|organizationId|customerId|productId|orderId|shipmentId)\s*=\s*(?!new mongoose\.Types\.ObjectId)(['"][^'"]+['"]|\w+);/g,
    replacer: (match, obj, idType, value) => {
      // Skip if already properly typed
      if (match.includes('mongoose.Types.ObjectId')) return match;
      return `${obj}.${idType} = new mongoose.Types.ObjectId(${value});`;
    }
  },
  
  // Fix ObjectId creation in new documents
  {
    matcher: /new\s+(\w+)\(\s*{[^}]*?(\w+Id):\s*(?!new mongoose\.Types\.ObjectId)(['"][^'"]+['"]|\w+)/g,
    name: 'ObjectId in document creation',
    replacer: (match, model, idField, value) => {
      // Skip if value is null or already ObjectId
      if (value === 'null' || value === 'undefined' || match.includes('mongoose.Types.ObjectId')) {
        return match;
      }
      return match.replace(idField + ':', `${idField}: new mongoose.Types.ObjectId(`).replace(value, `${value})`);
    }
  },
  
  // Fix ObjectId comparison
  {
    name: 'ObjectId comparison',
    matcher: /(===|!==|==|!=)\s*(['"]?[0-9a-f]{24}['"]?|(?:req\.params|req\.query|req\.body)\.\w+)/g,
    replacer: (match, operator, value) => {
      if (value.startsWith('"') || value.startsWith("'")) {
        return `.toString() ${operator} ${value}`;
      } else {
        return `.toString() ${operator} ${value}.toString()`;
      }
    }
  },
  
  // Fix _id assignment from another ObjectId
  {
    name: 'ObjectId to ObjectId assignment',
    matcher: /(\w+)\._id\s*=\s*(\w+)\._id;/g,
    replacer: '$1._id = $2._id as unknown as mongoose.Types.ObjectId;'
  },
  
  // Fix mongoose subdocument ID typing
  {
    name: 'Subdocument _id assignment',
    matcher: /(\w+\.\w+)\._id/g,
    replacer: '$1._id as mongoose.Types.ObjectId'
  },
  
  // Fix MongoID filter queries
  {
    name: 'MongoDB query by ID',
    matcher: /\.findById\(\s*(?!new mongoose\.Types\.ObjectId)(['"][0-9a-f]{24}['"]|\w+\.\w+|\w+)\s*\)/g,
    replacer: (match, id) => {
      if (id.startsWith("'") || id.startsWith('"')) {
        return match.replace(id, `new mongoose.Types.ObjectId(${id})`);
      } else {
        return match.replace(id, `(${id} ? new mongoose.Types.ObjectId(${id}) : null)`);
      }
    }
  },
  
  // Fix ObjectId type imports
  {
    name: 'Missing ObjectId import',
    matcher: /import\s+\*\s+as\s+mongoose\s+from\s+['"]mongoose['"];(?!\s+import\s+{\s*(?:[^{}]*,\s*)?(ObjectId|Types))/g,
    replacer: 'import * as mongoose from \'mongoose\';\nimport { Types, ObjectId } from \'mongoose\';'
  }
];

// Process a file and apply fixes
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if file doesn't contain mongoose or ObjectId patterns
    if (!content.includes('mongoose') && !content.includes('_id') && 
        !content.match(/\bid\s*:/)) {
      stats.filesProcessed++;
      return;
    }
    
    console.log(chalk.blue(`Processing ${filePath}...`));
    let modifiedContent = content;
    let fixCount = 0;
    
    // Apply each ObjectId fix
    for (const fix of objectIdFixes) {
      let beforeFix = modifiedContent;
      modifiedContent = modifiedContent.replace(fix.matcher, fix.replacer);
      
      if (beforeFix !== modifiedContent) {
        const matches = (beforeFix.match(fix.matcher) || []).length;
        fixCount += matches;
        console.log(chalk.green(`  - Applied ${fix.name}: ${matches} matches`));
      }
    }
    
    // Add mongoose import if needed
    if (modifiedContent.includes('mongoose.Types.ObjectId') && 
        !modifiedContent.includes('import') && 
        !modifiedContent.includes('mongoose')) {
      modifiedContent = `import * as mongoose from 'mongoose';\n\n${modifiedContent}`;
      fixCount++;
      console.log(chalk.green('  - Added mongoose import'));
    }
    
    // Only save if changes were made
    if (modifiedContent !== content) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      stats.filesModified++;
      stats.issuesFixed += fixCount;
      console.log(chalk.green(`✓ Fixed ${fixCount} ObjectId issues in ${filePath}`));
    } else {
      console.log(chalk.yellow(`✓ No ObjectId issues found in ${filePath}`));
    }
    
    stats.filesProcessed++;
  } catch (error) {
    console.error(chalk.red(`Error processing ${filePath}:`), error);
  }
}

// Find files to process
function findTargetFiles() {
  let files = [];
  for (const pattern of TARGET_FILES) {
    const matches = glob.sync(pattern, { cwd: process.cwd() });
    files = [...files, ...matches];
  }
  return [...new Set(files)]; // Remove duplicates
}

// Main execution
function main() {
  console.log(chalk.bold.blue('Starting MongoDB ObjectId TypeScript fixing script...'));
  
  const files = findTargetFiles();
  console.log(chalk.blue(`Found ${files.length} files to process`));
  
  for (const file of files) {
    processFile(file);
  }
  
  // Print stats
  console.log(chalk.bold.green('\nScript completed!'));
  console.log(chalk.green(`Files processed: ${stats.filesProcessed}`));
  console.log(chalk.green(`Files modified: ${stats.filesModified}`));
  console.log(chalk.green(`ObjectId issues fixed: ${stats.issuesFixed}`));
  
  console.log(chalk.yellow('\nNext steps:'));
  console.log(chalk.yellow('1. Run TypeScript check to see remaining errors:'));
  console.log(chalk.yellow('   npx tsc --noEmit | grep -c "error TS"'));
}

// Run the script
main();