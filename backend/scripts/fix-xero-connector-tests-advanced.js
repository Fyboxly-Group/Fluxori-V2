/**
 * Advanced TypeScript error fixer for Xero connector test files
 * 
 * This script specifically targets the Xero connector test files with
 * more comprehensive fixes for syntax and type errors.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const SKIP_TYPECHECK = process.argv.includes('--skip-typecheck');
const TARGET_DIR = '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/xero-connector/tests';

// Utility functions
function log(message) {
  if (VERBOSE) {
    console.log(message);
  }
}

function logError(message) {
  console.error('\x1b[31m%s\x1b[0m', message);
}

function logSuccess(message) {
  console.log('\x1b[32m%s\x1b[0m', message);
}

function getTypeScriptErrorCount() {
  try {
    const result = execSync('npx tsc --noEmit', { encoding: 'utf8' });
    return 0;
  } catch (error) {
    const errorOutput = error.stdout.toString();
    const matches = errorOutput.match(/Found (\d+) error/);
    if (matches && matches[1]) {
      return parseInt(matches[1], 10);
    }
    return 0;
  }
}

// Fixers
function fixImportStatements(content) {
  // Fix import statements with semicolons
  return content.replace(/import (.*) from (.*),/g, 'import $1 from $2;');
}

function fixMockFunctionDeclarations(content) {
  // Fix jest.fn(); -> jest.fn(),
  let fixed = content.replace(/jest\.fn\(\);/g, 'jest.fn(),');
  
  // Fix mockImplementation(() => ({ -> mockImplementation(() => ({
  fixed = fixed.replace(/mockImplementation\(\(\) => \({/g, 'mockImplementation(() => ({');
  
  return fixed;
}

function fixObjectPropertyDeclarations(content) {
  // Find objects with property declarations using semicolons instead of commas
  return content.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([^,;\s][^;]*);(?=\s*[a-zA-Z_]|[\s]*\})/g, '$1: $2,');
}

function fixArrayDeclarations(content) {
  // Fix array declarations with semicolons: [...]; -> [...],
  return content.replace(/(\[[^\]]*\]);(?=\s*[a-zA-Z_]|[\s]*\})/g, '$1,');
}

function fixStringLiterals(content) {
  // Fix string literals with semicolons: 'string'; -> 'string',
  return content.replace(/'([^']*)';(?!\s*[,)])/g, "'$1',");
}

function fixTypeCastingSyntax(content) {
  // Fix as any as any -> as any
  let fixed = content.replace(/as any as any/g, 'as any');
  
  // Fix as any) -> ) as any
  fixed = fixed.replace(/\{([^}]*)\} as any\)/g, '{$1}) as any');
  
  return fixed;
}

function fixMockResolvedValues(content) {
  // Fix mockResolvedValue(({...})) -> mockResolvedValue({...})
  return content.replace(/mockResolvedValue\(\((\{[^}]*\})\)\)/g, 'mockResolvedValue($1)');
}

function fixJestMocks(content) {
  // Fix jest.Mock syntax - replace mockResolvedValue(mockXeroClient) with proper mock function
  let fixed = content;
  
  // Fix xeroAuthService.getAuthenticatedClient as jest.Mock.mockResolvedValue
  fixed = fixed.replace(
    /(xeroAuthService\.getAuthenticatedClient) as jest\.Mock\.mockResolvedValue/g, 
    '($1 as jest.Mock).mockResolvedValue'
  );
  
  // Fix mockCustomerModel.findById as jest.Mock.mockResolvedValue
  fixed = fixed.replace(
    /(mockCustomerModel\.findById) as jest\.Mock\.mockResolvedValue/g,
    '($1 as jest.Mock).mockResolvedValue'
  );
  
  return fixed;
}

function fixArrayBrackets(content) {
  // Fix missing array brackets: [...], -> [...],
  return content.replace(/(\[[^\]]*\]);/g, '$1,');
}

function fixArrayUnclosedBrackets(content) {
  // Look for unclosed array brackets
  let lines = content.split('\n');
  let inArray = false;
  let arrayStartIndex = -1;
  let bracketCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Count opening and closing brackets in the line
    const openBrackets = (line.match(/\[/g) || []).length;
    const closeBrackets = (line.match(/\]/g) || []).length;
    
    if (!inArray && line.includes('[') && openBrackets > closeBrackets) {
      inArray = true;
      arrayStartIndex = i;
      bracketCount = openBrackets - closeBrackets;
    } else if (inArray) {
      bracketCount += openBrackets - closeBrackets;
      
      if (bracketCount === 0) {
        inArray = false;
        
        // Check if there's a semicolon after the closing bracket where it shouldn't be
        if (line.trim().endsWith('];') && i < lines.length - 1 && !line.trim().endsWith('],') && !line.trim().endsWith('];},')) {
          lines[i] = line.replace('];', '],');
        }
      }
    }
  }
  
  return lines.join('\n');
}

function fixExpectStatements(content) {
  // Fix expect statements with missing parentheses
  return content.replace(/expect\((.*?)\)\.toHaveBeenCalled;/g, 'expect($1).toHaveBeenCalled();');
}

function removeNoCheckPragma(content) {
  return content.replace(/\/\/ @ts-nocheck.*?\n/, '');
}

// Comprehensive fix function
function fixFileContent(content) {
  let fixed = content;
  
  // Remove @ts-nocheck pragma
  fixed = removeNoCheckPragma(fixed);
  
  // Fix import statements
  fixed = fixImportStatements(fixed);
  
  // Fix mock function declarations
  fixed = fixMockFunctionDeclarations(fixed);
  
  // Fix object property declarations
  fixed = fixObjectPropertyDeclarations(fixed);
  
  // Fix array declarations
  fixed = fixArrayDeclarations(fixed);
  
  // Fix string literals
  fixed = fixStringLiterals(fixed);
  
  // Fix type casting syntax
  fixed = fixTypeCastingSyntax(fixed);
  
  // Fix mock resolved values
  fixed = fixMockResolvedValues(fixed);
  
  // Fix Jest mocks
  fixed = fixJestMocks(fixed);
  
  // Fix array brackets
  fixed = fixArrayBrackets(fixed);
  
  // Fix unclosed array brackets
  fixed = fixArrayUnclosedBrackets(fixed);
  
  // Fix expect statements
  fixed = fixExpectStatements(fixed);
  
  return fixed;
}

// Main file processing function
function processFile(filePath) {
  log(`Processing file: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Apply comprehensive fixes
  content = fixFileContent(content);
  
  // Only write if changes were made and not in dry run mode
  if (content !== originalContent) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf8');
      logSuccess(`Fixed: ${filePath}`);
    } else {
      log(`Would fix: ${filePath} (dry run)`);
    }
    return true;
  } else {
    log(`No changes needed: ${filePath}`);
    return false;
  }
}

// Find and process files
function processDirectory(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  let fixedCount = 0;
  
  for (const file of files) {
    if (file.endsWith('.test.ts')) {
      const filePath = path.join(directoryPath, file);
      const fixed = processFile(filePath);
      if (fixed) fixedCount++;
    }
  }
  
  return fixedCount;
}

// Main execution
(async function main() {
  console.log('Fixing TypeScript errors in Xero connector test files...');
  
  // Check TypeScript errors before fixes
  if (!SKIP_TYPECHECK) {
    const beforeErrorCount = getTypeScriptErrorCount();
    console.log(`TypeScript errors before fixes: ${beforeErrorCount}`);
  }
  
  // Process files
  const fixedCount = processDirectory(TARGET_DIR);
  console.log(`Fixed ${fixedCount} files.`);
  
  // Check TypeScript errors after fixes
  if (!DRY_RUN && !SKIP_TYPECHECK) {
    const afterErrorCount = getTypeScriptErrorCount();
    console.log(`TypeScript errors after fixes: ${afterErrorCount}`);
  }
  
  console.log('Done!');
})();