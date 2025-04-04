/**
 * Script to fix TypeScript error TS1477: An instantiation expression cannot be followed by a property access
 * This is a common error pattern in several files
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
  instantiationErrors: 0
};

/**
 * Fix instantiation expressions followed by property access (TS1477)
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixInstantiationPropertyAccess(content) {
  let modified = content;
  
  // Match patterns like: new Class<T>().property, Promise<T>.all
  const patterns = [
    // Generic instantiation with property access: new Map<string, any>().set
    {
      regex: /new\s+(\w+)<([^>]+)>\(\)\.(\w+)/g,
      replacement: (match, className, genericParams, propName) => {
        stats.instantiationErrors++;
        return `(new ${className}<${genericParams}>()).${propName}`;
      }
    },
    // Promise.all with generics: Promise<T>.all
    {
      regex: /Promise<([^>]+)>\.all/g,
      replacement: (match, genericParams) => {
        stats.instantiationErrors++;
        return `Promise.all`;
      }
    },
    // Static method on generic class: SomeClass<T>.staticMethod
    {
      regex: /(\w+)<([^>]+)>\.(\w+)(?!\s*<)/g,
      replacement: (match, className, genericParams, methodName) => {
        // Only replace if it looks like a static method (not another generic)
        if (methodName !== 'all' && methodName !== 'race' && methodName !== 'resolve' && methodName !== 'reject') {
          return match; // Skip Promise built-in methods that we don't want to modify
        }
        stats.instantiationErrors++;
        return `${className}.${methodName}`;
      }
    }
  ];
  
  // Apply each pattern
  patterns.forEach(({ regex, replacement }) => {
    modified = modified.replace(regex, replacement);
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
    
    // Apply fixes
    const updatedContent = fixInstantiationPropertyAccess(originalContent);
    
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
  console.log('Starting fix for instantiation expression errors (TS1477)...');
  
  // Known files with this error type from the earlier analysis
  const knownProblematicFiles = [
    'src/controllers/analytics.controller.ts',
    'src/modules/ai-cs-agent/services/vertex-ai.service.ts',
    'src/modules/ai-cs-agent/tests/conversation.service.test.ts',
    'src/modules/ai-insights/services/deepseek-llm.service.ts',
    'src/modules/international-trade/services/compliance.service.ts'
  ];
  
  // Process known problematic files first
  knownProblematicFiles.forEach(relPath => {
    const fullPath = path.join(ROOT_DIR, 'backend', relPath);
    if (fs.existsSync(fullPath)) {
      console.log(`Processing known problematic file: ${fullPath}`);
      processFile(fullPath);
    } else {
      console.error(`Known problematic file not found: ${fullPath}`);
    }
  });
  
  // Get all other TypeScript files
  const files = glob.sync('**/*.ts', {
    cwd: BACKEND_SRC_DIR,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts'],
  }).filter(file => !knownProblematicFiles.some(problematic => file.endsWith(problematic)));
  
  console.log(`Found ${files.length} additional TypeScript files to check`);
  
  // Process each file
  files.forEach(file => {
    processFile(file);
  });
  
  // Print summary
  console.log('\nSummary:');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`Instantiation property access errors fixed: ${stats.instantiationErrors}`);
  console.log('\nDone!');
}

main();