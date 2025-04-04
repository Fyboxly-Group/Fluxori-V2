/**
 * Script to fix common syntax errors in TypeScript files
 * Specifically targeting a set of files with known issues
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');

// Files with severe syntax issues
const problematicFiles = [
  'src/modules/marketplaces/adapters/amazon/inventory/fba-small-light/fba-small-light.ts',
  'src/modules/international-trade/services/compliance.service.ts'
];

/**
 * Fix basic syntax errors
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixSyntaxErrors(content) {
  let modified = content;

  // Remove `: undefined}` at end of code blocks
  modified = modified.replace(/:\s*undefined\s*}/g, '}');

  // Remove `;` after opening braces
  modified = modified.replace(/{\s*;/g, '{');

  // Fix erroneous type syntax: `string as any: any` -> `string`
  modified = modified.replace(/([a-zA-Z<>[\]]+)\s+as\s+any(?::\s*any)?/g, '$1');

  // Fix erroneous catch syntax: `catch(error as any: any)`
  modified = modified.replace(/catch\s*\(\s*error\s+as\s+any\s*:\s*any\s*\)/g, 'catch (error)');

  // Fix imports with bad syntax
  modified = modified.replace(/import\s*{\s*([A-Za-z0-9_]+)\s*:\s*[A-Za-z0-9_]+(?:,\s*[A-Za-z0-9_]+\s*:\s*[^}]+)?\s*}\s*as\s+any\s+from/g, 'import { $1 } from');

  // Fix incorrect "path": `/path/${var: var} as any catch...`
  modified = modified.replace(/(\$\{\s*[a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\s*\}\s*as\s+any\s+catch/g, '$1}');

  // Fix malformed interface declarations
  modified = modified.replace(/}\s*as\s+any\b/g, '}');

  // Fix Promise<any>.resolve(null as any: any)
  modified = modified.replace(/Promise(?:<[^>]+>)?\.resolve\(([^)]*)\s+as\s+any\s*:\s*any\)/g, 'Promise.resolve($1)');

  // Fix special case for params object
  modified = modified.replace(/const\s+param:\s*anys:\s*Record<string,\s*any>/g, 'const params: Record<string, any>');

  // Fix variable declarations with typos
  modified = modified.replace(/let\s+nextToke:\s*anyn:/g, 'let nextToken:');
  modified = modified.replace(/const\s+allEnrollment:\s*anys:/g, 'const allEnrollments:');
  modified = modified.replace(/const\s+option:\s*anys:/g, 'const options:');

  // Fix broken parameter access with bad suffix: param.nextToken;
  modified = modified.replace(/([a-zA-Z]+)\.([a-zA-Z]+)\s*;\s*}\s*as\s+any/g, '$1.$2; }');

  // Fix the "allEnrollments.push(...response.data.enrollments as any: any)" pattern
  modified = modified.replace(/([a-zA-Z0-9_]+)\.push\(\.\.\.(.*?)\s+as\s+any\s*:\s*any\s*\)/g, '$1.push(...$2)');

  // Fix do-while with extra suffix
  modified = modified.replace(/}\s+while\((.*?)\s+as\s+any\s*:\s*any\)/g, '} while($1)');

  // Fix specific constructor issue
  modified = modified.replace(/constructor\((.*?)\)\s*{;/g, 'constructor($1) {');

  // Fix common issues with "if" statements
  modified = modified.replace(/if\(\!(.*?)\s+as\s+any\s*:\s*any\)\s*{;/g, 'if(!$1) {');
  modified = modified.replace(/if\((.*?)\s+as\s+any\s*:\s*any\)\s*{;/g, 'if($1) {');

  // Fix method return types
  modified = modified.replace(/(\s+as\s+any,\s+[a-zA-Z0-9_]+\s+as\s+any)\s*:\s*any\)/g, '$1)');

  // Fix broken function parameter list
  modified = modified.replace(/function\s+([a-zA-Z0-9_]+)\(\s*([^:]+):\s+anys\s*:/g, 'function $1($2:');

  return modified;
}

/**
 * Process a file
 * @param {string} filePath Path to the file
 */
function processFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const updatedContent = fixSyntaxErrors(originalContent);
    
    if (updatedContent !== originalContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    } else {
      console.log(`No changes needed for: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * Main function
 */
function main() {
  console.log('Starting syntax error fix script...');
  
  problematicFiles.forEach(relPath => {
    const fullPath = path.join(BACKEND_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      processFile(fullPath);
    } else {
      console.error(`File not found: ${fullPath}`);
    }
  });
  
  console.log('\nDone!');
}

main();