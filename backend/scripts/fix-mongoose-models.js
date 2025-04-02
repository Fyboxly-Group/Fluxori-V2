/**
 * Fix TypeScript issues in Mongoose models
 * 
 * This script properly fixes TypeScript typing in Mongoose models by:
 * 1. Adding proper mongoose imports
 * 2. Creating proper document and model interfaces
 * 3. Adding proper type definitions for model methods
 * 4. Fixing Schema definitions with proper types
 * 5. Removing @ts-nocheck directives
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  name: 'Mongoose Models',
  pattern: 'src/**/*model.ts', // Match all model files
  isAlreadyFixed: (content) => {
    return content.includes('// TypeScript fixed');
  },
  addFixedComment: true,
  fixedComment: '// TypeScript fixed',
  removeNoCheckDirectives: true,
  createBackups: true,
};

/**
 * Main fix function - runs the script
 */
async function run() {
  console.log(`Starting fix script for ${CONFIG.name}...`);
  
  // Find files that need fixing
  const files = glob.sync(CONFIG.pattern);
  console.log(`Found ${files.length} files matching pattern ${CONFIG.pattern}`);
  
  let fixedFiles = 0;
  let skippedFiles = 0;
  let errorFiles = 0;
  
  // Process each file
  for (const file of files) {
    try {
      console.log(`Processing ${file}...`);
      
      // Read file content
      const content = fs.readFileSync(file, 'utf8');
      
      // Skip if file is already fixed
      if (CONFIG.isAlreadyFixed(content)) {
        console.log(`  Skipping - already fixed`);
        skippedFiles++;
        continue;
      }
      
      // Create backup if enabled
      if (CONFIG.createBackups) {
        const backupPath = `${file}.backup-${Date.now()}`;
        fs.writeFileSync(backupPath, content, 'utf8');
        console.log(`  Created backup at ${backupPath}`);
      }
      
      // Apply fixes
      let fixedContent = content;
      
      // Fix 1: Ensure mongoose is properly imported
      fixedContent = ensureMongooseImport(fixedContent);
      
      // Fix 2: Fix document interface definitions
      fixedContent = fixDocumentInterface(fixedContent, file);
      
      // Fix 3: Fix model interface definitions
      fixedContent = fixModelInterface(fixedContent, file);
      
      // Fix 4: Fix schema type definitions
      fixedContent = fixSchemaDefinitions(fixedContent);
      
      // Fix 5: Fix model export
      fixedContent = fixModelExport(fixedContent, file);
      
      // Remove @ts-nocheck directives if configured
      if (CONFIG.removeNoCheckDirectives) {
        fixedContent = fixedContent.replace(/\/\/\s*@ts-nocheck\s*\n/g, '');
      }
      
      // Add fixed comment if configured
      if (CONFIG.addFixedComment && !fixedContent.includes(CONFIG.fixedComment)) {
        fixedContent = `${CONFIG.fixedComment}\n${fixedContent}`;
      }
      
      // Write the fixed content back to the file
      fs.writeFileSync(file, fixedContent, 'utf8');
      fixedFiles++;
      console.log(`  Fixed successfully`);
      
    } catch (error) {
      console.error(`  Error fixing ${file}:`, error);
      errorFiles++;
    }
  }
  
  // Print summary
  console.log(`
=========== FIX SUMMARY ===========
Fixed ${fixedFiles} files
Skipped ${skippedFiles} files (already fixed)
Errors in ${errorFiles} files
====================================
  `);
}

/**
 * Ensure mongoose is properly imported
 */
function ensureMongooseImport(content) {
  // If mongoose is not imported, add import
  if (!content.includes('import * as mongoose from') && 
      !content.includes('import mongoose from')) {
    
    // Check if there are other imports to add after
    if (content.includes('import ')) {
      // Add after last import
      const lastImportIndex = content.lastIndexOf('import ');
      const endOfImportLine = content.indexOf('\n', lastImportIndex) + 1;
      
      return (
        content.substring(0, endOfImportLine) +
        'import * as mongoose from "mongoose";\n' +
        content.substring(endOfImportLine)
      );
    } else {
      // No imports, add at start
      return 'import * as mongoose from "mongoose";\n\n' + content;
    }
  }
  
  return content;
}

/**
 * Fix document interface definitions
 */
function fixDocumentInterface(content, filePath) {
  // Extract model name from file path
  const fileName = path.basename(filePath, '.ts');
  const modelName = fileName
    .replace('.model', '')
    .replace(/-([a-z])/g, (_, char) => char.toUpperCase())
    .replace(/^([a-z])/, (_, char) => char.toUpperCase());
  
  // Check if there's already a document interface
  const hasDocInterface = content.includes(`interface I${modelName}Document`);
  
  if (!hasDocInterface) {
    // Extract schema fields by looking at the schema definition
    const schemaFields = extractSchemaFields(content);
    
    // Create the document interface
    const docInterface = `
export interface I${modelName}Document extends mongoose.Document {
${schemaFields.map(field => `  ${field.name}: ${field.type};`).join('\n')}
  createdAt?: Date;
  updatedAt?: Date;
}
`;
    
    // Find the right place to insert the interface
    // Try to add after imports but before other code
    const importSection = findImportSection(content);
    if (importSection.end > 0) {
      return (
        content.substring(0, importSection.end) +
        '\n' + docInterface + '\n' +
        content.substring(importSection.end)
      );
    } else {
      // Fallback: add after any existing interface or type
      const interfaceMatch = content.match(/export (interface|type) [^{]+\{[^}]+\}/);
      if (interfaceMatch) {
        const interfaceEnd = interfaceMatch.index + interfaceMatch[0].length;
        return (
          content.substring(0, interfaceEnd) +
          '\n\n' + docInterface +
          content.substring(interfaceEnd)
        );
      } else {
        // Last resort: add after imports or at the top if no imports
        const firstNonImport = content.search(/^(?!import).+$/m);
        if (firstNonImport > 0) {
          return (
            content.substring(0, firstNonImport) +
            docInterface + '\n\n' +
            content.substring(firstNonImport)
          );
        } else {
          return docInterface + '\n\n' + content;
        }
      }
    }
  }
  
  return content;
}

/**
 * Fix model interface definitions
 */
function fixModelInterface(content, filePath) {
  // Extract model name from file path
  const fileName = path.basename(filePath, '.ts');
  const modelName = fileName
    .replace('.model', '')
    .replace(/-([a-z])/g, (_, char) => char.toUpperCase())
    .replace(/^([a-z])/, (_, char) => char.toUpperCase());
  
  // Check if there's already a model interface
  const hasModelInterface = content.includes(`interface I${modelName}Model`);
  
  if (!hasModelInterface) {
    // Extract schema static methods by looking at statics definitions
    const staticMethods = extractStaticMethods(content);
    
    // Create the model interface
    const modelInterface = `
export interface I${modelName}Model extends mongoose.Model<I${modelName}Document> {
${staticMethods.map(method => `  ${method.name}(${method.params}): ${method.returnType};`).join('\n')}
}
`;
    
    // Find the document interface to add after it
    const docInterfaceMatch = content.match(new RegExp(`export interface I${modelName}Document[^}]+}`));
    if (docInterfaceMatch) {
      const docInterfaceEnd = docInterfaceMatch.index + docInterfaceMatch[0].length;
      
      return (
        content.substring(0, docInterfaceEnd) +
        '\n\n' + modelInterface +
        content.substring(docInterfaceEnd)
      );
    } else {
      // If no document interface found, add after imports
      const importSection = findImportSection(content);
      if (importSection.end > 0) {
        return (
          content.substring(0, importSection.end) +
          '\n' + modelInterface + '\n' +
          content.substring(importSection.end)
        );
      } else {
        // Last resort: add at the top
        return modelInterface + '\n\n' + content;
      }
    }
  }
  
  return content;
}

/**
 * Fix schema type definitions
 */
function fixSchemaDefinitions(content) {
  // Replace 'new mongoose.Schema' with 'new mongoose.Schema<IModelDocument>'
  // to add proper typing to the Schema definition
  return content.replace(
    /(const|let|var)\s+(\w+Schema)\s*=\s*new\s+mongoose\.Schema\(/g,
    (match, keyword, schemaName) => {
      // Extract model name from schema name
      const modelName = schemaName.replace('Schema', '');
      
      // Convert first character to uppercase
      const modelNameProper = modelName.charAt(0).toUpperCase() + modelName.slice(1);
      
      return `${keyword} ${schemaName} = new mongoose.Schema<I${modelNameProper}Document>(`;
    }
  );
}

/**
 * Fix model export
 */
function fixModelExport(content, filePath) {
  // Extract model name from file path
  const fileName = path.basename(filePath, '.ts');
  const modelName = fileName
    .replace('.model', '')
    .replace(/-([a-z])/g, (_, char) => char.toUpperCase())
    .replace(/^([a-z])/, (_, char) => char.toUpperCase());
  
  // Find the model export line
  const modelExportPattern = /export\s+(?:default\s+)?(?:const|let|var)?\s*(\w+)\s*=\s*mongoose\.model\((['"])(\w+)(['"])/;
  const modelExportMatch = content.match(modelExportPattern);
  
  if (modelExportMatch) {
    const fullMatch = modelExportMatch[0];
    const exportVarName = modelExportMatch[1];
    const modelStringName = modelExportMatch[3];
    
    // Replace with typed model export
    return content.replace(
      fullMatch,
      `export default mongoose.model<I${modelName}Document, I${modelName}Model>(${modelExportMatch[2]}${modelStringName}${modelExportMatch[4]}`
    );
  }
  
  return content;
}

/**
 * Helper function to extract schema fields
 */
function extractSchemaFields(content) {
  // This is a very basic implementation - a more robust one would parse the schema definition properly
  const fields = [];
  
  // Find schema definition
  const schemaMatch = content.match(/new\s+mongoose\.Schema\(\s*\{([^}]+)\}/);
  
  if (schemaMatch && schemaMatch[1]) {
    const schemaBody = schemaMatch[1];
    
    // Extract field definitions
    const fieldPattern = /(\w+):\s*\{[^}]*type:\s*(\w+|\[\w+\])/g;
    let fieldMatch;
    
    while ((fieldMatch = fieldPattern.exec(schemaBody)) !== null) {
      const fieldName = fieldMatch[1];
      let fieldType = fieldMatch[2];
      
      // Map mongoose types to TypeScript types
      switch (fieldType) {
        case 'String':
          fieldType = 'string';
          break;
        case 'Number':
          fieldType = 'number';
          break;
        case 'Boolean':
          fieldType = 'boolean';
          break;
        case 'Date':
          fieldType = 'Date';
          break;
        case 'Buffer':
          fieldType = 'Buffer';
          break;
        case 'Mixed':
          fieldType = 'any';
          break;
        case 'ObjectId':
          fieldType = 'mongoose.Types.ObjectId';
          break;
        case '[String]':
          fieldType = 'string[]';
          break;
        case '[Number]':
          fieldType = 'number[]';
          break;
        case '[Boolean]':
          fieldType = 'boolean[]';
          break;
        case '[Date]':
          fieldType = 'Date[]';
          break;
        case '[ObjectId]':
          fieldType = 'mongoose.Types.ObjectId[]';
          break;
        default:
          fieldType = 'any';
      }
      
      fields.push({ name: fieldName, type: fieldType });
    }
    
    // Check for required fields
    fields.forEach(field => {
      if (schemaBody.includes(`${field.name}: { type:`)) {
        const fieldDef = schemaBody.match(new RegExp(`${field.name}:\\s*\\{[^}]+\\}`));
        if (fieldDef && fieldDef[0].includes('required: true')) {
          // Field is required
        } else {
          // Field is optional
          field.name = `${field.name}?`;
        }
      }
    });
  }
  
  return fields;
}

/**
 * Helper function to extract static methods
 */
function extractStaticMethods(content) {
  const staticMethods = [];
  
  // Find statics definition
  const staticsMatch = content.match(/statics:\s*\{([^}]+)\}/);
  
  if (staticsMatch && staticsMatch[1]) {
    const staticsBody = staticsMatch[1];
    
    // Extract method definitions - very basic approach
    const methodPattern = /(\w+):\s*(?:async\s*)?function\s*\(([^)]*)\)/g;
    let methodMatch;
    
    while ((methodMatch = methodPattern.exec(staticsBody)) !== null) {
      const methodName = methodMatch[1];
      const methodParams = methodMatch[2] || '';
      
      // Add a simple Promise<any> return type for now
      staticMethods.push({
        name: methodName,
        params: methodParams.trim(),
        returnType: 'Promise<any>',
      });
    }
  }
  
  return staticMethods;
}

/**
 * Helper function to find the import section
 */
function findImportSection(content) {
  const lines = content.split('\n');
  let end = 0;
  
  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      end = content.indexOf(lines[i]) + lines[i].length;
    }
  }
  
  // Add a newline after the import section
  if (end > 0) {
    end += 1;
  }
  
  return { end };
}

// Run the script
run().catch(error => {
  console.error('Error running fix script:', error);
  process.exit(1);
});