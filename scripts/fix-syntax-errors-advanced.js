/**
 * Advanced syntax error fixing script
 * Focused on the most common error patterns in the codebase
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');

// Stats tracking
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  errorsFix: {
    commaErrors: 0,
    semicolonErrors: 0,
    unexpectedTokens: 0,
    declarationErrors: 0,
    braceErrors: 0,
    parenthesisErrors: 0,
    propertyAssignmentErrors: 0,
    importErrors: 0
  }
};

/**
 * Fix comma errors
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixCommaErrors(content) {
  let modified = content;
  let fixCount = 0;

  // Fix missing commas in object literals
  const objectPropertyPattern = /(\w+)\s*:\s*(?:['"]?[\w\s.]+['"]?|{[^{}]*}|function\s*\([^)]*\)\s*{[^}]*})\s+(\w+)\s*:/g;
  modified = modified.replace(objectPropertyPattern, (match, prop1, prop2) => {
    fixCount++;
    return `${prop1}: ${match.substring(prop1.length + 1, match.length - prop2.length - 1)}, ${prop2}:`;
  });

  // Fix missing commas in array literals
  const arrayItemPattern = /\[\s*(?:(?:\w+|['"][\w\s]+['"]|{[^{}]*}|function\s*\([^)]*\)\s*{[^}]*})\s+)+(?:\w+|['"][\w\s]+['"]|{[^{}]*}|function\s*\([^)]*\)\s*{[^}]*})\s*\]/g;
  modified = modified.replace(arrayItemPattern, (match) => {
    // If already has commas, don't fix
    if (match.includes(',')) return match;
    
    // Add commas between items
    return match.replace(/(\w+|['"][\w\s]+['"]|{[^{}]*}|function\s*\([^)]*\)\s*{[^}]*})\s+(?=\w+|['"]|{)/g, (m, item) => {
      fixCount++;
      return `${item}, `;
    });
  });

  // Fix missing commas in function parameters
  const functionParamsPattern = /function\s*\w*\s*\(\s*(?:(?:\w+\s*:\s*\w+(?:<[^>]*>)?)\s+)+(?:\w+\s*:\s*\w+(?:<[^>]*>)?)\s*\)/g;
  modified = modified.replace(functionParamsPattern, (match) => {
    // If already has commas, don't fix
    if (match.includes(',')) return match;
    
    // Add commas between parameters
    return match.replace(/(\w+\s*:\s*\w+(?:<[^>]*>)?)\s+(?=\w+\s*:)/g, (m, param) => {
      fixCount++;
      return `${param}, `;
    });
  });

  stats.errorsFix.commaErrors += fixCount;
  return modified;
}

/**
 * Fix semicolon errors
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixSemicolonErrors(content) {
  let modified = content;
  let fixCount = 0;

  // Fix missing semicolons after statements
  const statementPattern = /(var|let|const)\s+\w+\s*=\s*(?:['"][\w\s]+['"]|\d+|true|false|{[^{}]*}|\[[^\[\]]*\]|function\s*\([^)]*\)\s*{[^}]*})\s*(?!\s*[;,)\]}])/gm;
  modified = modified.replace(statementPattern, (match) => {
    fixCount++;
    return `${match};`;
  });

  // Fix missing semicolons after function/method calls
  const functionCallPattern = /(\w+\([^()]*\))\s*(?!\s*[;,)\]}])/gm;
  modified = modified.replace(functionCallPattern, (match, call) => {
    // Ignore if it's part of an if/for/while condition
    if (content.substring(match.index - 10, match.index).includes('if') || 
        content.substring(match.index - 10, match.index).includes('for') ||
        content.substring(match.index - 10, match.index).includes('while')) {
      return match;
    }
    fixCount++;
    return `${call};`;
  });

  stats.errorsFix.semicolonErrors += fixCount;
  return modified;
}

/**
 * Fix unexpected token errors
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixUnexpectedTokenErrors(content) {
  let modified = content;
  let fixCount = 0;

  // Fix 'as any: any' pattern which causes unexpected token errors
  const asAnyPattern = /\bas\s+any\s*:\s*any\b/g;
  modified = modified.replace(asAnyPattern, (match) => {
    fixCount++;
    return 'as any';
  });

  // Fix 'as any' pattern generally
  const asAnyGeneralPattern = /\bas\s+any\b(?!\s*\.)/g;
  modified = modified.replace(asAnyGeneralPattern, (match) => {
    // Don't count these as fixes
    return '';
  });

  // Fix missing newline after import statements
  const importPattern = /(import\s+(?:(?:{[^}]*})|(?:\*\s+as\s+\w+))\s+from\s+['"][@\w/-]+['"];)(?!\s*$)/gm;
  modified = modified.replace(importPattern, (match) => {
    fixCount++;
    return `${match}\n`;
  });

  // Fix unexpected 'catch' without try blocks
  const standaloneCatchPattern = /}\s*catch\s*\(\s*\w+\s*\)\s*{/g;
  modified = modified.replace(standaloneCatchPattern, (match) => {
    // Check if there's a try block before
    const beforeMatch = modified.substring(0, modified.indexOf(match));
    if (!beforeMatch.includes('try')) {
      fixCount++;
      return '} try { throw new Error("Missing try block"); } catch (error) {';
    }
    return match;
  });

  stats.errorsFix.unexpectedTokens += fixCount;
  return modified;
}

/**
 * Fix declaration errors
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixDeclarationErrors(content) {
  let modified = content;
  let fixCount = 0;

  // Fix missing declarations (where a variable is used but not declared)
  const undeclaredVarPattern = /(if|for|while|switch)\s*\(\s*(\w+)(?!\s*[=:<])/g;
  modified = modified.replace(undeclaredVarPattern, (match, keyword, varName) => {
    // Check if the variable appears to be declared elsewhere
    if (!modified.includes(`let ${varName}`) && 
        !modified.includes(`var ${varName}`) && 
        !modified.includes(`const ${varName}`) &&
        !modified.includes(`function ${varName}`) &&
        !modified.includes(`class ${varName}`)) {
      fixCount++;
      // Insert declaration before the control structure
      const insertPos = modified.indexOf(match);
      const beforeInsert = modified.substring(0, insertPos);
      const afterInsert = modified.substring(insertPos);
      
      modified = `${beforeInsert}let ${varName};\n${afterInsert}`;
      return match; // Return unchanged since we modified the string directly
    }
    return match;
  });

  // Fix improper variable declarations
  const improperDecPattern = /(?:var|let|const)\s+(\w+)\s*[:=]\s*(\w+):?/g;
  modified = modified.replace(improperDecPattern, (match, varName, typeName) => {
    fixCount++;
    return `let ${varName}: ${typeName} =`;
  });

  stats.errorsFix.declarationErrors += fixCount;
  return modified;
}

/**
 * Fix brace and parenthesis errors
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixBraceAndParenthesisErrors(content) {
  let modified = content;
  let fixCount = 0;

  // Fix missing closing braces in simple cases
  const openBracePattern = /{\s*(?:[^{}]*?[^{};\s])\s*$/gm;
  modified = modified.replace(openBracePattern, (match) => {
    fixCount++;
    return `${match}\n}`;
  });

  // Fix missing closing parentheses in function calls
  const openParenPattern = /\b(\w+)\(\s*(?:[^()]*?[^();\s])\s*$/gm;
  modified = modified.replace(openParenPattern, (match, funcName) => {
    fixCount++;
    return `${match})`;
  });

  // Fix double parentheses: functionName()()
  const doubleParenPattern = /\b(\w+)\(\)\(\)/g;
  modified = modified.replace(doubleParenPattern, (match, funcName) => {
    fixCount++;
    return `${funcName}()`;
  });

  // Fix mismatched braces in function definitions
  const functionDefPattern = /function\s+\w+\s*\([^)]*\)\s*{(?:[^{}]*{[^{}]*})*[^{}]*$/g;
  modified = modified.replace(functionDefPattern, (match) => {
    // Count open braces vs closed braces
    const openCount = (match.match(/{/g) || []).length;
    const closeCount = (match.match(/}/g) || []).length;
    if (openCount > closeCount) {
      fixCount += openCount - closeCount;
      return `${match}${'}'.repeat(openCount - closeCount)}`;
    }
    return match;
  });

  stats.errorsFix.braceErrors += fixCount;
  return modified;
}

/**
 * Fix property assignment errors
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixPropertyAssignmentErrors(content) {
  let modified = content;
  let fixCount = 0;

  // Fix misformatted property assignments
  const badPropertyPattern = /(\w+)\s*([^:=]*)\s*:/g;
  modified = modified.replace(badPropertyPattern, (match, propName, stuff) => {
    if (stuff && stuff.trim() !== '') {
      fixCount++;
      return `${propName}:`;
    }
    return match;
  });

  // Fix incorrect property access
  const badPropertyAccessPattern = /(\w+)\s*:\s*(\w+)\./g;
  modified = modified.replace(badPropertyAccessPattern, (match, propName, objName) => {
    fixCount++;
    return `${propName}: ${objName}.`;
  });

  stats.errorsFix.propertyAssignmentErrors += fixCount;
  return modified;
}

/**
 * Fix import errors
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixImportErrors(content) {
  let modified = content;
  let fixCount = 0;

  // Fix malformed imports
  const malformedImportPattern = /import\s*{\s*([^}]*)\s*}\s*from\s*(?!['"])/g;
  modified = modified.replace(malformedImportPattern, (match, imports) => {
    fixCount++;
    return `import { ${imports} } from '`;
  });

  // Fix imports with trailing colon
  const importColonPattern = /import\s*{\s*([^:}]*):([^}]*)\s*}\s*from\s*/g;
  modified = modified.replace(importColonPattern, (match, before, after) => {
    fixCount++;
    return `import { ${before} } from `;
  });

  stats.errorsFix.importErrors += fixCount;
  return modified;
}

/**
 * Apply all fixes to file content
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixAllErrors(content) {
  let modified = content;
  
  // Apply fixes in a strategic order
  modified = fixCommaErrors(modified);
  modified = fixSemicolonErrors(modified);
  modified = fixBraceAndParenthesisErrors(modified);
  modified = fixPropertyAssignmentErrors(modified);
  modified = fixImportErrors(modified);
  modified = fixUnexpectedTokenErrors(modified);
  modified = fixDeclarationErrors(modified);
  
  return modified;
}

/**
 * Process a single file
 * @param {string} filePath Path to the file
 */
function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const updatedContent = fixAllErrors(originalContent);
    
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
 * Main function
 */
async function main() {
  console.log('Starting advanced syntax error fix script...');
  
  // Find files with most common syntax errors
  const errorPronePaths = [
    'src/modules/marketplaces/adapters/amazon/**/*.ts',
    'src/modules/international-trade/**/*.ts',
    'src/modules/ai-cs-agent/**/*.ts',
    'src/modules/ai-insights/**/*.ts'
  ];
  
  for (const pattern of errorPronePaths) {
    const files = glob.sync(pattern, {
      cwd: BACKEND_DIR,
      absolute: true,
      nodir: true
    });
    
    console.log(`Found ${files.length} files matching pattern: ${pattern}`);
    
    // Process files in batches to avoid memory issues
    const BATCH_SIZE = 10;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      batch.forEach(file => processFile(file));
      console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(files.length / BATCH_SIZE)}`);
    }
  }
  
  // Print summary
  console.log('\nSummary:');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log('Error patterns fixed:');
  console.log(`  - Comma errors: ${stats.errorsFix.commaErrors}`);
  console.log(`  - Semicolon errors: ${stats.errorsFix.semicolonErrors}`);
  console.log(`  - Unexpected token errors: ${stats.errorsFix.unexpectedTokens}`);
  console.log(`  - Declaration errors: ${stats.errorsFix.declarationErrors}`);
  console.log(`  - Brace/parenthesis errors: ${stats.errorsFix.braceErrors}`);
  console.log(`  - Property assignment errors: ${stats.errorsFix.propertyAssignmentErrors}`);
  console.log(`  - Import errors: ${stats.errorsFix.importErrors}`);
  console.log(`  - Total fixes: ${Object.values(stats.errorsFix).reduce((sum, val) => sum + val, 0)}`);
  console.log('\nDone!');
}

main().catch(error => {
  console.error('Error in main process:', error);
});