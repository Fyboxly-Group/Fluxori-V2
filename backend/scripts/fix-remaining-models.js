/**
 * Specialized fix script for model files with syntax issues
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Get all model files
const modelFiles = glob.sync(path.join(__dirname, '../src/models/*.model.ts'));

// Function to fix a generic model file
function fixModelFile(filePath) {
  console.log(`Fixing model file: ${filePath}`);
  
  // Skip files we've already fixed
  const fileName = path.basename(filePath);
  if (['inventory-stock.model.ts', 'inventory.model.ts', 'order.model.ts', 'activity.model.ts'].includes(fileName)) {
    console.log(`Skipping already fixed file: ${fileName}`);
    return false;
  }
  
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix common issues in model files
  let fixed = content;
  
  // Fix import statements syntax
  fixed = fixed.replace(/import mongoose, { Document, Model, Schema } from 'mongoose';?$/m, 
                    "import mongoose, { Document, Model, Schema } from 'mongoose';");
  
  fixed = fixed.replace(/import\s*\n\s*\n/g, 'import mongoose, { Document, Model, Schema } from \'mongoose\';\nimport ');
  
  // Add missing import for TypedSchema
  if (!fixed.includes('TypedSchema') && fixed.includes('mongoose')) {
    fixed = fixed.replace(/import mongoose.*\n/, 
      "import mongoose, { Document, Model, Schema } from 'mongoose';\nimport { TypedSchema, PreHookCallback, PostHookCallback } from '../types/mongo-util-types';\n");
  }
  
  // Fix unterminated string literals at the end of files
  fixed = fixed.replace(/["']([\s]*)$/, '');
  
  // Fix interface and model properties with semicolons instead of commas
  // For interfaces
  const lines = fixed.split('\n');
  let inInterface = false;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    // Detect start of interface
    if (lines[i].includes('export interface') && lines[i].includes('{')) {
      inInterface = true;
      braceCount = 1;
    }
    
    // Count braces to track interface scope
    if (inInterface) {
      const openBraces = (lines[i].match(/{/g) || []).length;
      const closeBraces = (lines[i].match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;
      
      if (braceCount === 0) {
        inInterface = false;
        continue;
      }
      
      // Fix property declarations with semicolons in interfaces
      if (lines[i].match(/^\s*[a-zA-Z0-9_?]+\s*:\s*[^{},;]+;$/)) {
        lines[i] = lines[i].replace(/;$/, ',');
      }
    }
  }
  
  fixed = lines.join('\n');
  
  // Fix remaining semicolons in interface properties
  fixed = fixed.replace(/([a-zA-Z0-9_?]+)\s*:\s*([^{},;\n]+);(\s*\n)/g, '$1: $2,$3');
  
  // Fix schema definitions (replace semicolons with commas)
  fixed = fixed.replace(/type\s*:\s*([^,]+);/g, 'type: $1,');
  fixed = fixed.replace(/ref\s*:\s*['"][^'"]+['"];/g, (match) => match.replace(';', ','));
  fixed = fixed.replace(/required\s*:\s*(true|false);/g, (match) => match.replace(';', ','));
  fixed = fixed.replace(/default\s*:\s*([^,;]+);/g, (match) => match.replace(';', ','));
  
  // Write the fixed content back
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed);
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  
  console.log(`No changes needed: ${filePath}`);
  return false;
}

// Process each model file
let fixedCount = 0;
for (const file of modelFiles) {
  const fixed = fixModelFile(file);
  if (fixed) fixedCount++;
}

console.log(`\nFixed ${fixedCount} out of ${modelFiles.length - 4} remaining model files.`);