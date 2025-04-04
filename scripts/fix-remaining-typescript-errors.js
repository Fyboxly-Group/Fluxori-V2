/**
 * Script to fix remaining TypeScript errors in the Fluxori-V2 codebase
 * Focuses on common error patterns identified through analysis
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_SRC_DIR = path.join(ROOT_DIR, 'backend', 'src');

// Stats tracking
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  errorPatternsFix: {
    promiseAll: 0,
    objectInitSyntax: 0,
    missingReturnTypes: 0,
    errorHandlingPatterns: 0,
    genericTypeErrors: 0
  }
};

/**
 * Fix incorrect Promise.all syntax
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixPromiseAllSyntax(content) {
  let modified = content;
  const promiseAllRegex = /Promise<[^>]*>\.all\s*(<[^>]*>)?/g;
  
  let match;
  while ((match = promiseAllRegex.exec(content)) !== null) {
    const originalText = match[0];
    // Extract the generic type if it exists
    const genericType = match[1] || '';
    const replacement = `Promise.all${genericType}`;
    
    modified = modified.replace(originalText, replacement);
    stats.errorPatternsFix.promiseAll++;
  }
  
  return modified;
}

/**
 * Fix syntax errors in object initialization
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixObjectInitializationSyntax(content) {
  let modified = content;
  
  // Find malformed property assignments in object literals
  const objPropertyRegex = /([\w]+)\)\s*(\w+):\s*([^,}]+)([,}])/g;
  let match;
  while ((match = objPropertyRegex.exec(content)) !== null) {
    const originalText = match[0];
    const fixedText = `${match[1]}, ${match[2]}: ${match[3]}${match[4]}`;
    modified = modified.replace(originalText, fixedText);
    stats.errorPatternsFix.objectInitSyntax++;
  }
  
  // Find missing commas in object literals
  const missingCommaRegex = /(\w+):\s*[^,{}\n]+\s*(\w+):\s*/g;
  while ((match = missingCommaRegex.exec(content)) !== null) {
    const originalText = match[0];
    const fixedText = originalText.replace(
      new RegExp(`${match[1]}:\\s*[^,{}\\n]+\\s*${match[2]}:`), 
      `${match[1]}: ${match[0].substring(match[1].length + 1).trim().split(match[2])[0].trim()}, ${match[2]}:`
    );
    modified = modified.replace(originalText, fixedText);
    stats.errorPatternsFix.objectInitSyntax++;
  }
  
  return modified;
}

/**
 * Add return type annotations to async methods
 * @param {string} content File content
 * @returns {string} Updated content
 */
function addReturnTypeAnnotations(content) {
  let modified = content;
  
  // Target async methods without return types
  const asyncMethodRegex = /(async\s+[\w_]+\s*\([^)]*\))(\s*{)/g;
  let match;
  while ((match = asyncMethodRegex.exec(content)) !== null) {
    // Avoid modifying if it already has a return type
    if (!content.substring(match.index, match.index + match[0].length + 20).includes(':')) {
      const originalText = match[0];
      const fixedText = `${match[1]}: Promise<any>${match[2]}`;
      modified = modified.replace(originalText, fixedText);
      stats.errorPatternsFix.missingReturnTypes++;
    }
  }
  
  // Target non-async methods without return types
  const methodRegex = /(private|public|protected)?\s+([\w_]+\s*\([^)]*\))(\s*{)/g;
  while ((match = methodRegex.exec(content)) !== null) {
    // Skip if it's an async method (already handled) or if it already has a return type
    const methodDef = match[0];
    if (!methodDef.includes('async') && 
        !content.substring(match.index, match.index + methodDef.length + 20).includes(':')) {
      const originalText = match[0];
      // Default to returning any
      const fixedText = `${match[1] || ''} ${match[2]}: any${match[3]}`;
      modified = modified.replace(originalText, fixedText);
      stats.errorPatternsFix.missingReturnTypes++;
    }
  }
  
  return modified;
}

/**
 * Standardize error handling patterns
 * @param {string} content File content
 * @returns {string} Updated content
 */
function standardizeErrorHandling(content) {
  let modified = content;
  
  // Fix common error handling pattern with nested instanceof checks
  const nestedErrorCheckRegex = /error instanceof Error \? \(error instanceof Error \? \(error instanceof Error \?/g;
  const nestedErrorReplacement = 'error instanceof Error ?';
  modified = modified.replace(nestedErrorCheckRegex, nestedErrorReplacement);
  
  // Fix catch blocks without typed error
  const untypedErrorRegex = /catch\s*\(\s*error\s*\)\s*{/g;
  const typedErrorReplacement = 'catch (error: unknown) {';
  
  let match;
  while ((match = untypedErrorRegex.exec(content)) !== null) {
    modified = modified.replace(match[0], typedErrorReplacement);
    stats.errorPatternsFix.errorHandlingPatterns++;
  }
  
  return modified;
}

/**
 * Fix other generic TypeScript errors
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixGenericTypeErrors(content) {
  let modified = content;
  
  // Fix Map<any, any> instantiation followed by property access
  const mapRegex = /new Map<any,\s*any>\(\)\.([a-zA-Z0-9_]+)/g;
  modified = modified.replace(mapRegex, (match, propName) => {
    stats.errorPatternsFix.genericTypeErrors++;
    return `(new Map<any, any>()).${propName}`;
  });
  
  // Fix Set<any> instantiation followed by property access
  const setRegex = /new Set<any>\(\)\.([a-zA-Z0-9_]+)/g;
  modified = modified.replace(setRegex, (match, propName) => {
    stats.errorPatternsFix.genericTypeErrors++;
    return `(new Set<any>()).${propName}`;
  });
  
  // Fix any generic class instantiation followed by property access
  const genericClassRegex = /new ([A-Z][a-zA-Z0-9_]*)<([^>]+)>\(\)\.([a-zA-Z0-9_]+)/g;
  modified = modified.replace(genericClassRegex, (match, className, genericType, propName) => {
    stats.errorPatternsFix.genericTypeErrors++;
    return `(new ${className}<${genericType}>()).${propName}`;
  });
  
  return modified;
}

/**
 * Process a file to fix TypeScript errors
 * @param {string} filePath Path to the file
 */
function processFile(filePath) {
  try {
    // Read file content
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let updatedContent = originalContent;
    
    // Apply fixes
    updatedContent = fixPromiseAllSyntax(updatedContent);
    updatedContent = fixObjectInitializationSyntax(updatedContent);
    updatedContent = addReturnTypeAnnotations(updatedContent);
    updatedContent = standardizeErrorHandling(updatedContent);
    updatedContent = fixGenericTypeErrors(updatedContent);
    
    // Only write if changes were made
    if (updatedContent !== originalContent) {
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
 * Main function to run the script
 */
function main() {
  console.log('Starting TypeScript error fix script...');
  
  // Get all TypeScript files
  const files = glob.sync('**/*.ts', {
    cwd: BACKEND_SRC_DIR,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts'],
  });
  
  console.log(`Found ${files.length} TypeScript files to process`);
  
  // Process each file
  files.forEach(file => {
    processFile(file);
  });
  
  // Print summary
  console.log('\nSummary:');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log('Error patterns fixed:');
  console.log(`  - Promise.all syntax: ${stats.errorPatternsFix.promiseAll}`);
  console.log(`  - Object initialization syntax: ${stats.errorPatternsFix.objectInitSyntax}`);
  console.log(`  - Missing return types: ${stats.errorPatternsFix.missingReturnTypes}`);
  console.log(`  - Error handling patterns: ${stats.errorPatternsFix.errorHandlingPatterns}`);
  console.log(`  - Generic type errors: ${stats.errorPatternsFix.genericTypeErrors}`);
  console.log('\nDone!');
}

main();