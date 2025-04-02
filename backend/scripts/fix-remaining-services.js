/**
 * Specialized fix script for service files with syntax issues
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Get all service files
const serviceFiles = glob.sync(path.join(__dirname, '../src/services/*.service.ts'));

// Function to fix a generic service file
function fixServiceFile(filePath) {
  console.log(`Fixing service file: ${filePath}`);
  
  // Skip files we've already fixed
  const fileName = path.basename(filePath);
  if (['system-status.service.ts'].includes(fileName)) {
    console.log(`Skipping already fixed file: ${fileName}`);
    return false;
  }
  
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix common issues in service files
  let fixed = content;
  
  // Fix unterminated string literals at the end of files
  fixed = fixed.replace(/["']([\s]*)$/, '');
  
  // Fix service method parameters
  fixed = fixed.replace(/async\s+([a-zA-Z0-9_]+)\s*\(([^)]+);([^)]+)\)/g, 'async $1($2,$3)');
  
  // Fix function parameters with semicolons instead of commas
  fixed = fixed.replace(/(\w+)\s*:\s*([a-zA-Z<>[\]]+);/g, '$1: $2,');
  
  // Fix object property declarations with semicolons instead of commas
  fixed = fixed.replace(/([a-zA-Z0-9_]+)\s*:\s*([^,;\n]*);(\s*[a-zA-Z0-9_}])/g, '$1: $2,$3');
  
  // Fix service class method interfaces
  fixed = fixed.replace(/interface ([a-zA-Z]+)Service {/g, 'interface $1Service {\n');
  
  // Fix lines with missing types
  fixed = fixed.replace(/([a-zA-Z0-9_]+) ([a-zA-Z0-9_]+)[:,]/g, '$1: $2,');
  
  // Fix object properties
  fixed = fixed.replace(/name\s*:\s*['"][^'"]+['"];/g, (match) => match.replace(';', ','));
  fixed = fixed.replace(/type\s*:\s*['"][^'"]+['"];/g, (match) => match.replace(';', ','));
  fixed = fixed.replace(/value\s*:\s*['"][^'"]+['"];/g, (match) => match.replace(';', ','));
  
  // Write the fixed content back
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed);
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  
  console.log(`No changes needed: ${filePath}`);
  return false;
}

// Process each service file
let fixedCount = 0;
for (const file of serviceFiles) {
  const fixed = fixServiceFile(file);
  if (fixed) fixedCount++;
}

console.log(`\nFixed ${fixedCount} out of ${serviceFiles.length - 1} remaining service files.`);