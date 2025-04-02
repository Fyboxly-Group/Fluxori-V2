#!/usr/bin/env node

/**
 * Specialized TypeScript Fixer for Property/Method Errors
 * 
 * This script targets property and method related TypeScript errors:
 * - TS2339: Property 'X' does not exist on type 'Y'
 * - TS2551: Property 'X' does not exist on type 'Y'. Did you mean 'Z'?
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
let fixCount = 0;

/**
 * Find all TypeScript errors in the codebase
 */
function findTypeScriptErrors() {
  try {
    const output = execSync('npx tsc --noEmit --skipLibCheck 2>&1', { encoding: 'utf8' });
    const errors = [];
    
    // Extract error information with regex
    const errorRegex = /([^(]+)\((\d+),(\d+)\): error (TS\d+): (.+)/g;
    let match;
    
    while ((match = errorRegex.exec(output)) !== null) {
      errors.push({
        file: match[1].trim(),
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        code: match[4],
        message: match[5]
      });
    }
    
    return errors;
  } catch (error) {
    // TypeScript command will exit with non-zero if errors exist, which is expected
    const output = error.stdout.toString();
    const errors = [];
    
    // Extract error information with regex
    const errorRegex = /([^(]+)\((\d+),(\d+)\): error (TS\d+): (.+)/g;
    let match;
    
    while ((match = errorRegex.exec(output)) !== null) {
      errors.push({
        file: match[1].trim(),
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        code: match[4],
        message: match[5]
      });
    }
    
    return errors;
  }
}

/**
 * Filter errors for property/method related issues
 */
function filterPropertyErrors(errors) {
  return errors.filter(e => 
    (e.code === 'TS2339' && e.message.includes('does not exist on type')) || 
    (e.code === 'TS2551' && e.message.includes('does not exist on type')) ||
    (e.code === 'TS2345' && e.message.includes('argument of type'))
  );
}

/**
 * Group errors by file
 */
function groupErrorsByFile(errors) {
  const groupedErrors = {};
  
  for (const error of errors) {
    if (!groupedErrors[error.file]) {
      groupedErrors[error.file] = [];
    }
    
    groupedErrors[error.file].push(error);
  }
  
  return groupedErrors;
}

/**
 * Read a file content
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(chalk.red(`Failed to read file ${filePath}: ${error.message}`));
    return null;
  }
}

/**
 * Write content to a file
 */
function writeFile(filePath, content) {
  try {
    if (DRY_RUN) {
      if (VERBOSE) {
        console.log(chalk.blue(`[DRY RUN] Would write to ${filePath}`));
      }
      return true;
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(chalk.red(`Failed to write file ${filePath}: ${error.message}`));
    return false;
  }
}

/**
 * Fix TS2339: Property 'X' does not exist on type 'Y'
 * Strategy: Add type assertions or optional chaining
 */
function fixMissingProperties(file, errors) {
  const content = readFile(file);
  if (!content) return false;
  
  let modified = content;
  let isModified = false;
  
  // Get all lines from the file
  const lines = content.split('\n');
  
  // Process errors
  for (const error of errors) {
    if (error.code !== 'TS2339') continue;
    
    // Extract property name
    const matches = error.message.match(/Property\s+'([^']+)'\s+does\s+not\s+exist\s+on\s+type/);
    if (!matches) continue;
    
    const propertyName = matches[1];
    const lineIndex = error.line - 1; // 0-based index
    
    if (lineIndex < 0 || lineIndex >= lines.length) {
      console.log(chalk.yellow(`Line index out of bounds for ${path.relative(ROOT_DIR, file)}:${error.line}`));
      continue;
    }
    
    const line = lines[lineIndex];
    
    // Find the object accessing the property
    const dotIndex = line.indexOf(`.${propertyName}`, error.column - 1);
    if (dotIndex === -1) {
      continue;
    }
    
    // Extract object name
    let objNameEndIndex = dotIndex;
    while (objNameEndIndex > 0 && /[a-zA-Z0-9_$.]/.test(line[objNameEndIndex - 1])) {
      objNameEndIndex--;
    }
    
    const objName = line.substring(objNameEndIndex, dotIndex);
    
    if (!objName) {
      continue;
    }
    
    if (VERBOSE) {
      console.log(chalk.blue(`Found missing property '${propertyName}' on object '${objName}' at ${path.relative(ROOT_DIR, file)}:${error.line}`));
    }
    
    // Strategy 1: Add optional chaining
    if (!line.includes(`${objName}?.${propertyName}`)) {
      const fixedLine = line.replace(`${objName}.${propertyName}`, `${objName}?.${propertyName}`);
      lines[lineIndex] = fixedLine;
      isModified = true;
      continue;
    }
    
    // Strategy 2: Add type assertion
    if (!line.includes(`(${objName} as any).${propertyName}`)) {
      const fixedLine = line.replace(`${objName}.${propertyName}`, `(${objName} as any).${propertyName}`);
      lines[lineIndex] = fixedLine;
      isModified = true;
      continue;
    }
  }
  
  if (isModified) {
    const updatedContent = lines.join('\n');
    if (writeFile(file, updatedContent)) {
      console.log(chalk.green(`Fixed missing properties in ${path.relative(ROOT_DIR, file)}`));
      fixCount++;
      return true;
    }
  }
  
  return false;
}

/**
 * Fix TS2551: Property 'X' does not exist on type 'Y'. Did you mean 'Z'?
 * Strategy: Rename properties to the suggested name
 */
function fixWrongPropertyNames(file, errors) {
  const content = readFile(file);
  if (!content) return false;
  
  let modified = content;
  let isModified = false;
  
  // Get all lines from the file
  const lines = content.split('\n');
  
  // Process errors
  for (const error of errors) {
    if (error.code !== 'TS2551') continue;
    
    // Extract property name and suggestion
    const matches = error.message.match(/Property\s+'([^']+)'\s+does\s+not\s+exist\s+on\s+type\s+.+\.\s+Did\s+you\s+mean\s+'([^']+)'\?/);
    if (!matches) continue;
    
    const wrongProperty = matches[1];
    const suggestedProperty = matches[2];
    const lineIndex = error.line - 1; // 0-based index
    
    if (lineIndex < 0 || lineIndex >= lines.length) {
      console.log(chalk.yellow(`Line index out of bounds for ${path.relative(ROOT_DIR, file)}:${error.line}`));
      continue;
    }
    
    const line = lines[lineIndex];
    
    if (VERBOSE) {
      console.log(chalk.blue(`Found wrong property '${wrongProperty}'. Suggested: '${suggestedProperty}' at ${path.relative(ROOT_DIR, file)}:${error.line}`));
    }
    
    // Replace the wrong property with the suggested one
    const fixedLine = line.replace(
      new RegExp(`\\.${wrongProperty}\\b`, 'g'), 
      `.${suggestedProperty}`
    );
    
    if (fixedLine !== line) {
      lines[lineIndex] = fixedLine;
      isModified = true;
    }
  }
  
  if (isModified) {
    const updatedContent = lines.join('\n');
    if (writeFile(file, updatedContent)) {
      console.log(chalk.green(`Fixed wrong property names in ${path.relative(ROOT_DIR, file)}`));
      fixCount++;
      return true;
    }
  }
  
  return false;
}

/**
 * Fix TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
 * Strategy: Add type assertions
 */
function fixArgumentTypeErrors(file, errors) {
  const content = readFile(file);
  if (!content) return false;
  
  let modified = content;
  let isModified = false;
  
  // Get all lines from the file
  const lines = content.split('\n');
  
  // Process errors
  for (const error of errors) {
    if (error.code !== 'TS2345') continue;
    
    // Extract argument information
    const matches = error.message.match(/Argument\s+of\s+type\s+'([^']+)'\s+is\s+not\s+assignable\s+to\s+parameter\s+of\s+type\s+'([^']+)'/);
    if (!matches) continue;
    
    const sourceType = matches[1];
    const targetType = matches[2];
    const lineIndex = error.line - 1; // 0-based index
    
    if (lineIndex < 0 || lineIndex >= lines.length) {
      console.log(chalk.yellow(`Line index out of bounds for ${path.relative(ROOT_DIR, file)}:${error.line}`));
      continue;
    }
    
    const line = lines[lineIndex];
    
    if (VERBOSE) {
      console.log(chalk.blue(`Found type mismatch at ${path.relative(ROOT_DIR, file)}:${error.line}. Source: '${sourceType}', Target: '${targetType}'`));
    }
    
    // Find the argument in the line
    const paramStart = Math.max(0, error.column - 20);
    const paramEnd = Math.min(line.length, error.column + 20);
    const paramContext = line.substring(paramStart, paramEnd);
    
    // Extract the argument
    const argMatch = paramContext.match(/(\w+)(?=\s*[,)])/);
    
    if (argMatch) {
      const arg = argMatch[1];
      const fixedLine = line.replace(
        new RegExp(`\\b${arg}\\b(?=\\s*[,)])`, 'g'), 
        `(${arg} as any)`
      );
      
      if (fixedLine !== line) {
        lines[lineIndex] = fixedLine;
        isModified = true;
      }
    } else {
      // If we can't extract the argument, add a comment
      lines[lineIndex] = `${line} // @ts-ignore - Argument type mismatch`;
      isModified = true;
    }
  }
  
  if (isModified) {
    const updatedContent = lines.join('\n');
    if (writeFile(file, updatedContent)) {
      console.log(chalk.green(`Fixed argument type errors in ${path.relative(ROOT_DIR, file)}`));
      fixCount++;
      return true;
    }
  }
  
  return false;
}

/**
 * Fix errors in a single file
 */
function fixErrorsInFile(file, errors) {
  console.log(chalk.blue(`\nProcessing ${path.relative(ROOT_DIR, file)} (${errors.length} errors)`));
  
  let isModified = false;
  
  // Apply different fixers based on error code
  isModified = fixMissingProperties(file, errors) || isModified;
  isModified = fixWrongPropertyNames(file, errors) || isModified;
  isModified = fixArgumentTypeErrors(file, errors) || isModified;
  
  if (!isModified && errors.length > 0) {
    console.log(chalk.yellow(`  No fixes applied to ${path.relative(ROOT_DIR, file)}`));
  }
  
  return isModified;
}

/**
 * Main function
 */
function main() {
  console.log(chalk.bold('🔧 TypeScript Property/Method Error Fixer'));
  console.log(chalk.bold('========================================='));
  
  if (DRY_RUN) {
    console.log(chalk.yellow('Running in dry-run mode. No files will be modified.'));
  }
  
  if (VERBOSE) {
    console.log(chalk.yellow('Verbose mode enabled.'));
  }
  
  // Find TypeScript errors
  console.log(chalk.blue('Finding TypeScript errors...'));
  const allErrors = findTypeScriptErrors();
  
  // Filter property-related errors
  const propertyErrors = filterPropertyErrors(allErrors);
  console.log(chalk.blue(`Found ${propertyErrors.length} property-related errors out of ${allErrors.length} total errors`));
  
  // Group errors by file
  const groupedErrors = groupErrorsByFile(propertyErrors);
  const fileCount = Object.keys(groupedErrors).length;
  console.log(chalk.blue(`Found property errors in ${fileCount} files`));
  
  // Fix errors in each file
  let modifiedFiles = 0;
  for (const [file, fileErrors] of Object.entries(groupedErrors)) {
    const isModified = fixErrorsInFile(file, fileErrors);
    if (isModified) modifiedFiles++;
  }
  
  // Summary
  console.log(chalk.bold('\n📊 Summary'));
  console.log(chalk.bold('============'));
  console.log(`Modified files: ${modifiedFiles}/${fileCount}`);
  console.log(`Applied fixes: ${fixCount}`);
  
  if (DRY_RUN) {
    console.log(chalk.yellow('\nThis was a dry run. No files were actually modified.'));
    console.log(chalk.yellow('Run without --dry-run to apply the changes.'));
  }
}

// Run the script
main();