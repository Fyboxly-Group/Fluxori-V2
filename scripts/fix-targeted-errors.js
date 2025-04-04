/**
 * Script to fix targeted TypeScript errors in specific files
 * - Fixes TS1477: An instantiation expression cannot be followed by a property access
 * - Targets known problematic files 
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');

// Stats tracking
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  errorsFix: {
    promiseAllSyntax: 0,
    instantiationAccess: 0,
  }
};

// Instead of listing individual files, let's target entire directories that contain TS1477 errors
const problematicDirectories = [
  'src/controllers',
  'src/modules/ai-cs-agent',
  'src/modules/ai-insights',
  'src/modules/international-trade',
  'src/modules/marketplaces',
  'src/modules/rag-retrieval',
  'src/modules/xero-connector',
  'src/services/firestore'
];

/**
 * Fix instantiation expressions followed by property access (TS1477)
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixInstantiationPropertyAccess(content) {
  let modified = content;
  
  // Fix Promise<any>.all pattern
  const promiseAllRegex = /Promise<([^>]+)>\.all/g;
  modified = modified.replace(promiseAllRegex, (match, genericParams) => {
    stats.errorsFix.promiseAllSyntax++;
    return 'Promise.all';
  });
  
  // Fix other instantiation followed by property access
  const instantiationAccessRegex = /new\s+([A-Za-z0-9_]+)<([^>]+)>\(\)\.([A-Za-z0-9_]+)/g;
  modified = modified.replace(instantiationAccessRegex, (match, className, genericParams, propName) => {
    stats.errorsFix.instantiationAccess++;
    return `(new ${className}<${genericParams}>()).${propName}`;
  });
  
  // Fix instantiation expressions with arguments followed by property access
  // Pattern: new Class<T>(args).property
  const instantiationWithArgsRegex = /new\s+([A-Za-z0-9_]+)<([^>]+)>\(([^)]*)\)\.([A-Za-z0-9_]+)/g;
  modified = modified.replace(instantiationWithArgsRegex, (match, className, genericParams, args, propName) => {
    stats.errorsFix.instantiationAccess++;
    return `(new ${className}<${genericParams}>(${args})).${propName}`;
  });
  
  // Fix other generic class access patterns
  // Pattern: GenericClass<T>.staticMethod
  const genericClassRegex = /([A-Za-z0-9_]+)<([^>]+)>\.([A-Za-z0-9_]+)/g;
  modified = modified.replace(genericClassRegex, (match, className, genericParams, methodName) => {
    // Skip Promise specific methods we've already fixed
    if (className === 'Promise' && (methodName === 'all' || methodName === 'race' || methodName === 'resolve' || methodName === 'reject')) {
      return match;
    }
    stats.errorsFix.instantiationAccess++;
    return `${className}.${methodName}`;
  });
  
  return modified;
}

/**
 * Process a single file
 * @param {string} relPath Relative path from backend directory
 */
function processFile(relPath) {
  const filePath = path.join(BACKEND_DIR, relPath);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  
  try {
    console.log(`Processing: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = fixInstantiationPropertyAccess(content);
    
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      stats.filesModified++;
      console.log(`Updated: ${filePath}`);
    }
    
    stats.filesProcessed++;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * Process all TypeScript files in a directory recursively
 * @param {string} dirPath Directory path
 */
function processDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively process subdirectories
        processDirectory(fullPath);
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        // Process TypeScript files
        try {
          console.log(`Processing: ${fullPath}`);
          const content = fs.readFileSync(fullPath, 'utf8');
          const updatedContent = fixInstantiationPropertyAccess(content);
          
          if (updatedContent !== content) {
            fs.writeFileSync(fullPath, updatedContent, 'utf8');
            stats.filesModified++;
            console.log(`Updated: ${fullPath}`);
          }
          
          stats.filesProcessed++;
        } catch (error) {
          console.error(`Error processing ${fullPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error);
  }
}

/**
 * Main function
 */
function main() {
  console.log('Starting targeted TypeScript error fixes...');
  
  // Process each problematic directory
  problematicDirectories.forEach(relDir => {
    const fullPath = path.join(BACKEND_DIR, relDir);
    if (fs.existsSync(fullPath)) {
      console.log(`Processing directory: ${fullPath}`);
      processDirectory(fullPath);
    } else {
      console.error(`Directory not found: ${fullPath}`);
    }
  });
  
  // Print summary
  console.log('\nSummary:');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log('Error patterns fixed:');
  console.log(`  - Promise.all syntax: ${stats.errorsFix.promiseAllSyntax}`);
  console.log(`  - Instantiation property access: ${stats.errorsFix.instantiationAccess}`);
  console.log('\nDone!');
}

main();