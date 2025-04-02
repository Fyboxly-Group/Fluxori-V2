/**
 * Specialized fix script for remaining controller files with syntax issues
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Get all controller files
const controllerFiles = glob.sync(path.join(__dirname, '../src/controllers/*.controller.ts'));

// Function to fix a generic controller file
function fixControllerFile(filePath) {
  console.log(`Fixing controller file: ${filePath}`);
  
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix common issues in controller files
  let fixed = content;
  
  // Fix import statements with semicolons instead of commas
  fixed = fixed.replace(/import ([^;]+), from (["'][^"']+["'])/g, 'import $1 from $2');
  
  // Fix unterminated string literals at the end of files
  fixed = fixed.replace(/["']([\s]*)$/, '');
  
  // Fix object property declarations with semicolons instead of commas
  fixed = fixed.replace(/([a-zA-Z0-9_]+)\s*:\s*([^,;\n]*);(\s*[a-zA-Z0-9_}])/g, '$1: $2,$3');
  
  // Fix error messages with semicolons
  fixed = fixed.replace(/error\.message: String\(error\),/g, 'error.message : String(error);');
  
  // Fix response objects with commas
  fixed = fixed.replace(/res\.status\([0-9]+\)\.json\(\{[^}]+\}\);/g, (match) => match);
  
  // Fix missing NextFunction in function parameters
  fixed = fixed.replace(/async\s*\(\s*req\s*:\s*Request\s*,\s*res\s*:\s*Response\s*\)\s*:/g, 'async (req: Request, res: Response, next: NextFunction):');
  
  // Fix lines with error message
  fixed = fixed.replace(/const errorMessage = error instanceof Error \? error\.message: String\(error\),/g, 
                       'const errorMessage = error instanceof Error ? error.message : String(error);');
  
  // Write the fixed content back
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed);
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  
  console.log(`No changes needed: ${filePath}`);
  return false;
}

// Process each controller file
let fixedCount = 0;
for (const file of controllerFiles) {
  // Skip files we've already fixed
  const fileName = path.basename(file);
  if (['customer.controller.ts', 'dashboard.controller.ts', 'example.controller.ts',
       'analytics.controller.ts', 'auth.controller.ts'].includes(fileName)) {
    console.log(`Skipping already fixed file: ${fileName}`);
    continue;
  }
  
  const fixed = fixControllerFile(file);
  if (fixed) fixedCount++;
}

console.log(`\nFixed ${fixedCount} out of ${controllerFiles.length - 5} remaining controller files.`);