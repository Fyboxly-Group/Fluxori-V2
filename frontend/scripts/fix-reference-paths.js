const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Fix TypeScript reference paths in source files
 */

// Function to get the correct reference path based on the file's location
function getCorrectReferencePath(filePath) {
  // Get the directory depth relative to the project root src
  const srcRoot = path.join(process.cwd(), 'src');
  const relativeToSrc = path.relative(srcRoot, path.dirname(filePath));
  
  // Build the correct relative path to the types/module-declarations.d.ts
  const depth = relativeToSrc.split(path.sep).length;
  let relativePath = '';
  
  if (depth === 0) {
    // Direct child of src
    relativePath = './types/module-declarations.d.ts';
  } else {
    // Nested in subdirectories
    relativePath = '../'.repeat(depth) + 'types/module-declarations.d.ts';
  }
  
  return relativePath;
}

/**
 * Process the file and fix reference paths
 */
async function processFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file has a reference path
    const referencePathRegex = /\/\/\/\s*<reference\s+path="([^"]+)"\s*\/>/;
    const match = content.match(referencePathRegex);
    
    if (match) {
      const currentPath = match[1];
      // If the path references module-declarations.d.ts
      if (currentPath.includes('module-declarations.d.ts')) {
        const correctPath = getCorrectReferencePath(filePath);
        const updatedContent = content.replace(referencePathRegex, `/// <reference path="${correctPath}" />`);
        
        if (content !== updatedContent) {
          fs.writeFileSync(filePath, updatedContent, 'utf8');
          console.log(`  Updated reference path in ${filePath}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * Find and process all TypeScript files
 */
async function main() {
  // Find all TypeScript files
  const files = glob.sync('src/**/*.{ts,tsx}', { cwd: process.cwd() });
  console.log(`Found ${files.length} files to process`);
  
  // Process each file
  for (const file of files) {
    await processFile(file);
  }
  
  console.log('Completed fixing reference paths');
}

main().catch(console.error);