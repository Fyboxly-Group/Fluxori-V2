#!/usr/bin/env node

/**
 * Fix TypeScript syntax errors
 * 
 * This script targets common TypeScript syntax errors like:
 * - Missing commas, semicolons, and brackets
 * - Unterminated string literals
 * - Invalid object literals
 * - Type declaration issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Root directory
const ROOT_DIR = process.cwd();

// Function to get files with TypeScript syntax errors
function getFilesWithSyntaxErrors() {
  try {
    // Run TypeScript check and capture the output
    const output = execSync('npx tsc --noEmit 2>&1', { 
      cwd: ROOT_DIR,
      encoding: 'utf8'
    });
    return [];
  } catch (error) {
    const errorOutput = error.stdout.toString();
    const lines = errorOutput.split('\n');
    const filesWithErrors = new Set();
    
    // Extract file paths from the error output
    for (const line of lines) {
      // Match file paths in error messages like: file.tsx(10,5): error TS1005
      const match = line.match(/^([^(]+)\(\d+,\d+\): error TS\d+/);
      if (match) {
        // Only include syntax errors (TS1005, TS1003, etc.)
        const errorMatch = line.match(/error TS(\d+)/);
        if (errorMatch) {
          const errorCode = parseInt(errorMatch[1]);
          // Only focus on syntax errors
          if (errorCode >= 1000 && errorCode <= 1500) {
            filesWithErrors.add(match[1]);
          }
        }
      }
    }
    
    return Array.from(filesWithErrors);
  }
}

// Function to fix missing commas in object literals and parameter lists
function fixMissingCommas(content) {
  // Fix missing commas in object literals
  let updatedContent = content.replace(/(\w+)\s*:\s*[^,{}\n]+\s*\n\s*(\w+)\s*:/g, '$1: $2,\n  $3:');
  
  // Fix missing commas in parameter lists
  updatedContent = updatedContent.replace(/(\w+)\s*:\s*[^,)]+\s*\n\s*(\w+)\s*:/g, '$1: $2,\n  $3:');
  
  // Fix missing commas in array literals
  updatedContent = updatedContent.replace(/(\w+|\d+|true|false|null|undefined|'[^']*'|"[^"]*")\s*\n\s*(\w+|\d+|true|false|null|undefined|'[^']*'|"[^"]*")/g, '$1,\n  $2');
  
  return updatedContent;
}

// Function to fix missing closing brackets, parentheses, and braces
function fixMissingClosingBrackets(content) {
  let updatedContent = content;
  
  // Count and balance parentheses
  const openParenCount = (updatedContent.match(/\(/g) || []).length;
  const closeParenCount = (updatedContent.match(/\)/g) || []).length;
  
  if (openParenCount > closeParenCount) {
    // Add missing closing parentheses at the end
    const missingCount = openParenCount - closeParenCount;
    updatedContent += ')'.repeat(missingCount);
  }
  
  // Count and balance curly braces
  const openBraceCount = (updatedContent.match(/{/g) || []).length;
  const closeBraceCount = (updatedContent.match(/}/g) || []).length;
  
  if (openBraceCount > closeBraceCount) {
    // Add missing closing braces at the end
    const missingCount = openBraceCount - closeBraceCount;
    updatedContent += '}'.repeat(missingCount);
  }
  
  // Count and balance square brackets
  const openBracketCount = (updatedContent.match(/\[/g) || []).length;
  const closeBracketCount = (updatedContent.match(/\]/g) || []).length;
  
  if (openBracketCount > closeBracketCount) {
    // Add missing closing brackets at the end
    const missingCount = openBracketCount - closeBracketCount;
    updatedContent += ']'.repeat(missingCount);
  }
  
  return updatedContent;
}

// Function to fix unterminated string literals
function fixUnterminatedStrings(content) {
  // Find unterminated string literals
  const unterminated = content.match(/(['"])(?:\\.|[^\\])*?$/gm);
  
  if (!unterminated) {
    return content;
  }
  
  let updatedContent = content;
  for (const match of unterminated) {
    // Add missing quote at the end
    const quote = match[0];
    updatedContent = updatedContent.replace(match, match + quote);
  }
  
  return updatedContent;
}

// Function to fix interface and type declaration issues
function fixTypeDeclarations(content) {
  let updatedContent = content;
  
  // Fix missing colons in interface properties
  updatedContent = updatedContent.replace(/(\s+)(\w+)\s+(\w+|\{|\[)/g, '$1$2: $3');
  
  // Fix missing semicolons in interface properties
  updatedContent = updatedContent.replace(/(\w+)\s*:\s*[^;{}\n]+\s*\n(?!\s*[;,{}])/g, '$1;\n');
  
  return updatedContent;
}

// Function to fix specific syntax errors based on the file content
function fixSpecificSyntaxErrors(content, filePath) {
  let updatedContent = content;
  
  // Extract the file name
  const fileName = path.basename(filePath);
  
  // Fix QueryStateHandler component specific issues
  if (fileName === 'QueryStateHandler.tsx') {
    // Fix destructuring syntax
    updatedContent = updatedContent.replace(
      /const\s*{([^}]*?)}\s*=\s*props/g,
      (match, group) => {
        const props = group.split(',').map(prop => prop.trim());
        return `const { ${props.join(', ')} } = props`;
      }
    );
  }
  
  // Fix BuyBoxContext specific issues
  if (fileName === 'BuyBoxContext.tsx') {
    // Fix missing commas in context value object
    updatedContent = updatedContent.replace(
      /createContext\s*\(\s*{([^}]*?)}\s*\)/gs,
      (match, group) => {
        const lines = group.split('\n');
        const fixedLines = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line && !line.endsWith(',') && i < lines.length - 1 && lines[i+1].trim().match(/^\w+:/)) {
            fixedLines.push(line + ',');
          } else {
            fixedLines.push(line);
          }
        }
        
        return `createContext({\n${fixedLines.join('\n')}\n})`;
      }
    );
  }
  
  return updatedContent;
}

// Process a single file
function processFile(filePath) {
  console.log(`🔧 Processing ${filePath}...`);
  
  try {
    // Get original content
    const fullPath = path.join(ROOT_DIR, filePath);
    const originalContent = fs.readFileSync(fullPath, 'utf8');
    
    // Apply fixes
    let updatedContent = originalContent;
    updatedContent = fixMissingCommas(updatedContent);
    updatedContent = fixMissingClosingBrackets(updatedContent);
    updatedContent = fixUnterminatedStrings(updatedContent);
    updatedContent = fixTypeDeclarations(updatedContent);
    updatedContent = fixSpecificSyntaxErrors(updatedContent, filePath);
    
    // Write updated content if changes were made
    if (updatedContent !== originalContent) {
      fs.writeFileSync(fullPath, updatedContent);
      console.log(`✅ Fixed TypeScript syntax in ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️ No syntax changes needed in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
function main() {
  try {
    console.log('🚀 Starting TypeScript syntax fix script');
    
    // Get files with syntax errors
    const filesWithErrors = getFilesWithSyntaxErrors();
    console.log(`📁 Found ${filesWithErrors.length} files with syntax errors`);
    
    // Process each file
    let fixedFiles = 0;
    for (const filePath of filesWithErrors) {
      const fixed = processFile(filePath);
      if (fixed) fixedFiles++;
    }
    
    console.log(`\n📊 Fixed TypeScript syntax in ${fixedFiles} of ${filesWithErrors.length} files`);
    
    // Run TypeScript check to see if we fixed the errors
    console.log('\n🔍 Checking for remaining TypeScript errors...');
    let remainingErrors = 0;
    
    try {
      execSync('npx tsc --noEmit', { 
        cwd: ROOT_DIR 
      });
      console.log('✅ All TypeScript errors fixed!');
    } catch (error) {
      // Count remaining errors
      const errorMatches = error.stdout.toString().match(/error TS\d+/g);
      remainingErrors = errorMatches ? errorMatches.length : 0;
      console.log(`⚠️ ${remainingErrors} TypeScript errors remain`);
    }
    
    return remainingErrors;
  } catch (error) {
    console.error('❌ Error:', error);
    return -1;
  }
}

// Run the script
const remainingErrors = main();
process.exit(remainingErrors > 0 ? 1 : 0);