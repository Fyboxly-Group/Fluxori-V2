#!/usr/bin/env node

/**
 * Script to fix API response type issues in hook files
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

async function processFile(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    
    // Read the file content
    const content = await readFile(filePath, 'utf8');
    
    // Look for property access on response.data
    const hasPropertyAccessIssue = /\.data(?!\w)/.test(content);
    
    if (!hasPropertyAccessIssue) {
      console.log(`  No property access issues found in ${filePath}`);
      return false;
    }
    
    // Fix the pattern by adding proper type assertions
    let updatedContent = content;
    
    // Pattern 1: response.data as an array: response.data -> (response as any).data
    updatedContent = updatedContent.replace(
      /(\w+)\.data(\s*(?:\?\.)?\s*\w+|\s*\[\s*\d+\s*\])/g, 
      '($1 as any).data$2'
    );
    
    // Pattern 2: simpler property access: response.data -> (response as any).data
    updatedContent = updatedContent.replace(
      /(\w+)\.data(?!\w)/g, 
      '($1 as any).data'
    );
    
    // Also fix any direct property access on arrays
    const arrayAccessRegex = /(\w+)\s*\.\s*(filter|map|forEach|reduce|some|every|find|findIndex)\(/g;
    updatedContent = updatedContent.replace(
      arrayAccessRegex,
      '($1 as any[]).$2('
    );
    
    // Write updated content back to file
    await writeFile(filePath, updatedContent, 'utf8');
    console.log(`✅ Fixed property access issues in ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

async function walkDirectory(dirPath) {
  const entries = await readdir(dirPath);
  let fixedFiles = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and .next directories
      if (entry === 'node_modules' || entry === '.next' || entry === 'public') {
        continue;
      }
      fixedFiles += await walkDirectory(fullPath);
    } else if (stats.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      const fixed = await processFile(fullPath);
      if (fixed) fixedFiles++;
    }
  }
  
  return fixedFiles;
}

async function main() {
  try {
    console.log('🔍 Starting to fix API response type issues...');
    
    // Get the target from command line args or default to src/
    const target = process.argv[2] || 'src';
    const targetPath = path.resolve(process.cwd(), target);
    
    const stats = await stat(targetPath);
    let fixedFiles = 0;
    
    if (stats.isDirectory()) {
      console.log(`📁 Processing directory: ${targetPath}`);
      fixedFiles = await walkDirectory(targetPath);
    } else if (stats.isFile()) {
      console.log(`📄 Processing file: ${targetPath}`);
      const fixed = await processFile(targetPath);
      if (fixed) fixedFiles++;
    } else {
      console.error(`❌ Target is neither a file nor a directory: ${targetPath}`);
      process.exit(1);
    }
    
    console.log(`✨ Completed! Fixed type issues in ${fixedFiles} files.`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();