#!/usr/bin/env node

/**
 * Script to fix component exports that are missing default exports
 * This addresses errors like: "Module has no exported member 'default'"
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
    
    // Look for exported function components that aren't exported as default
    const exportedComponentRegex = /export\s+function\s+(\w+)/g;
    let match;
    let hasExportedComponent = false;
    let componentName = '';
    
    while ((match = exportedComponentRegex.exec(content)) !== null) {
      hasExportedComponent = true;
      componentName = match[1];
    }
    
    // Check if there's already a default export
    const hasDefaultExport = /export\s+default/.test(content);
    
    // If there's an exported component but no default export, add it
    if (hasExportedComponent && !hasDefaultExport) {
      let updatedContent = content;
      
      // Add default export at the end of the file
      if (componentName) {
        updatedContent += `\n\nexport default ${componentName};\n`;
        await writeFile(filePath, updatedContent, 'utf8');
        console.log(`✅ Added default export for ${componentName} in ${filePath}`);
        return true;
      }
    } else {
      console.log(`  No export issues found in ${filePath}`);
    }
    
    return false;
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
    } else if (stats.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      const fixed = await processFile(fullPath);
      if (fixed) fixedFiles++;
    }
  }
  
  return fixedFiles;
}

async function main() {
  try {
    console.log('🔍 Starting to fix component export issues...');
    
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
    
    console.log(`✨ Completed! Fixed export issues in ${fixedFiles} files.`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();