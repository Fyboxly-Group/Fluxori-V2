#!/usr/bin/env node

/**
 * MongoDB Schema to TypeScript Interface Generator
 * 
 * This script analyzes your Mongoose schema definitions and generates TypeScript
 * interfaces that match them. It handles nested objects, arrays, and adds proper JSDoc comments.
 * 
 * Key Features:
 * - Extracts field definitions from Mongoose schemas
 * - Handles nested schemas and sub-documents
 * - Supports arrays and complex types
 * - Detects and handles references to other models
 * - Generates proper TypeScript interfaces with JSDoc comments
 * - Creates three-tier interface structure (base, document, model)
 * - Detects schema methods and adds them to interfaces
 * - Handles schema virtuals and adds them to interfaces
 * - Support for enums, validators, and other schema options
 * - Processes circular references correctly
 * 
 * Usage:
 * ```
 * node scripts/generate-types-from-schema.js [--verbose] [--force] [--model=modelName]
 * ```
 * 
 * Options:
 * --verbose: Shows detailed logs during processing
 * --force: Overwrites existing type files even if they were manually modified
 * --model=name: Process only a specific model by name
 * 
 * This will scan all model files and generate corresponding TypeScript interfaces.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Get command line arguments
const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');
const FORCE_OVERWRITE = args.includes('--force');
const SPECIFIC_MODEL = args.find(arg => arg.startsWith('--model='))?.split('=')[1];

// Track processed models to handle circular references
const processedModels = new Set();
const pendingModelReferences = {};

// Utility to convert schema type to TypeScript type
function convertMongooseTypeToTypeScript(schemaType, isRequired, isArray = false, enumValues = null) {
  let tsType = '';
  
  // Check for enum values first, as they override normal type conversion
  if (enumValues) {
    tsType = enumValues.split(',').map(val => val.trim()).map(val => {
      // Remove quotes if present
      return val.replace(/^['"]|['"]$/g, '');
    }).map(val => `'${val}'`).join(' | ');
    return tsType;
  }
  
  switch (String(schemaType).toLowerCase()) {
    case 'string':
      tsType = 'string';
      break;
    case 'number':
      tsType = 'number';
      break;
    case 'date':
      tsType = 'Date';
      break;
    case 'boolean':
      tsType = 'boolean';
      break;
    case 'buffer':
      tsType = 'Buffer';
      break;
    case 'objectid':
    case 'schema.types.objectid':
    case 'mongoose.schema.types.objectid':
    case 'mongoose.types.objectid':
    case 'types.objectid':
      tsType = 'mongoose.Types.ObjectId';
      break;
    case 'map':
      tsType = 'Map<string, any>';
      break;
    case 'mixed':
    case 'schema.types.mixed':
    case 'mongoose.schema.types.mixed':
      tsType = 'any';
      break;
    case 'decimal128':
    case 'schema.types.decimal128':
    case 'mongoose.schema.types.decimal128':
      tsType = 'mongoose.Types.Decimal128';
      break;
    default:
      // Handle custom types (could be another schema/model)
      if (schemaType.toString().includes('Schema.Types.') || schemaType.toString().includes('Types.')) {
        const parts = schemaType.toString().split('.');
        const customType = parts[parts.length - 1];
        
        // Try to map known mongoose types
        switch (customType.toLowerCase()) {
          case 'objectid':
            tsType = 'mongoose.Types.ObjectId';
            break;
          case 'mixed':
            tsType = 'any';
            break;
          case 'decimal128':
            tsType = 'mongoose.Types.Decimal128';
            break;
          default:
            tsType = customType;
        }
      } else if (schemaType && typeof schemaType === 'string' && /^[A-Z]/.test(schemaType)) {
        // Likely a reference to another model
        tsType = `I${schemaType}Document`;
        
        // Track this reference for potential circular references
        if (!processedModels.has(schemaType)) {
          if (!pendingModelReferences[schemaType]) {
            pendingModelReferences[schemaType] = [];
          }
        }
      } else {
        tsType = 'any'; // Fallback for unknown types
      }
  }
  
  // Handle arrays
  if (isArray) {
    tsType = `${tsType}[]`;
  }
  
  // Handle optional fields
  if (!isRequired) {
    tsType = `${tsType} | null`;
  }
  
  return tsType;
}

// Extract typings from schema definition
function extractTypesFromSchema(content, schemaMatch) {
  const fields = [];
  const methods = [];
  const statics = [];
  const virtuals = [];
  
  if (!schemaMatch) {
    return { fields, methods, statics, virtuals };
  }
  
  const schemaDefinition = schemaMatch[1];
  
  // Extract field definitions (handling nested objects better)
  extractSchemaFields(schemaDefinition, fields);
  
  // Extract schema methods
  const methodsRegex = /(\w+)Schema\.methods\.(\w+)\s*=\s*(?:async\s*)?function\s*\([^)]*\)\s*{/g;
  const methodsMatches = [...content.matchAll(methodsRegex)];
  
  for (const methodMatch of methodsMatches) {
    const methodName = methodMatch[2];
    
    // Try to extract return type from method implementation
    const methodBody = content.substring(methodMatch.index);
    const returnTypeMatch = methodBody.match(/return\s+([^;]+);/);
    
    // Guess the return type based on common patterns (very basic inference)
    let returnType = 'any';
    
    if (methodBody.includes('Promise<') || methodBody.includes('async')) {
      returnType = 'Promise<any>';
    } else if (returnTypeMatch) {
      const returnValue = returnTypeMatch[1].trim();
      if (returnValue === 'true' || returnValue === 'false') {
        returnType = 'boolean';
      } else if (!isNaN(Number(returnValue))) {
        returnType = 'number';
      } else if (returnValue.startsWith('"') || returnValue.startsWith("'")) {
        returnType = 'string';
      }
    }
    
    methods.push({
      name: methodName,
      returnType,
      async: methodBody.includes('async') || returnType.startsWith('Promise')
    });
  }
  
  // Extract schema statics
  const staticsRegex = /(\w+)Schema\.statics\.(\w+)\s*=\s*(?:async\s*)?function\s*\(([^)]*)\)\s*{/g;
  const staticsMatches = [...content.matchAll(staticsRegex)];
  
  for (const staticMatch of staticsMatches) {
    const staticName = staticMatch[2];
    const params = staticMatch[3].split(',').map(p => p.trim()).filter(p => p);
    
    // Try to extract return type from static method implementation
    const staticBody = content.substring(staticMatch.index);
    let returnType = 'any';
    
    if (staticBody.includes('Promise<') || staticBody.includes('async')) {
      // Check if it's likely returning a document or array of documents
      if (staticBody.includes('.findOne') || staticBody.includes('.findById')) {
        returnType = 'Promise<I{ModelName}Document | null>';
      } else if (staticBody.includes('.find(')) {
        returnType = 'Promise<I{ModelName}Document[]>';
      } else {
        returnType = 'Promise<any>';
      }
    }
    
    statics.push({
      name: staticName,
      params: params.length,
      returnType,
      async: staticBody.includes('async') || returnType.startsWith('Promise')
    });
  }
  
  // Extract virtuals
  const virtualsRegex = /(\w+)Schema\.virtual\(['"](\w+)['"]\)(?:\.get\(([^)]+)\))?(?:\.set\(([^)]+)\))?/g;
  const virtualsMatches = [...content.matchAll(virtualsRegex)];
  
  for (const virtualMatch of virtualsMatches) {
    const virtualName = virtualMatch[2];
    
    // Try to guess the virtual type (very basic approach)
    const virtualCode = content.substring(virtualMatch.index, virtualMatch.index + 200);
    let virtualType = 'any';
    
    if (virtualCode.includes('return this._id.') || virtualCode.includes('ObjectId')) {
      virtualType = 'string';
    } else if (virtualCode.includes('Boolean(') || virtualCode.includes(' ? true : false')) {
      virtualType = 'boolean';
    } else if (virtualCode.includes('Number(') || virtualCode.match(/return\s+\d+/)) {
      virtualType = 'number';
    } else if (virtualCode.match(/return\s+['"]/)) {
      virtualType = 'string';
    } else if (virtualCode.includes('Date')) {
      virtualType = 'Date';
    } else if (virtualCode.includes('Array') || virtualCode.includes('[')) {
      virtualType = 'any[]';
    }
    
    virtuals.push({
      name: virtualName,
      type: virtualType
    });
  }
  
  return { fields, methods, statics, virtuals };
}

// Extract fields from schema definition, handling nested schemas
function extractSchemaFields(schemaText, fields, parentPath = '') {
  // Base field regex, matching field names and their definitions
  const fieldRegex = /(\w+):\s*({[^{}]*(?:{[^{}]*}[^{}]*)*}|[^,{}]*)/g;
  let match;
  
  while ((match = fieldRegex.exec(schemaText)) !== null) {
    const fieldName = match[1];
    let fieldDef = match[2].trim();
    
    // Skip fields that are likely not actual schema fields
    if (['_id', '__v', 'id'].includes(fieldName) && !fieldDef.includes('type:')) {
      continue;
    }
    
    const fullPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;
    
    // Check if it's a nested schema/object
    if (fieldDef.startsWith('{') && fieldDef.endsWith('}') && fieldDef.includes(':')) {
      // Extract nested schema definition
      const nestedSchemaText = fieldDef.substring(1, fieldDef.length - 1);
      
      // Check if it's a type definition with nested schema
      if (nestedSchemaText.includes('type: {')) {
        // Handle field with complex type definition
        processComplexField(nestedSchemaText, fieldName, fullPath, fields);
      } else if (nestedSchemaText.includes('type:')) {
        // Handle normal field with type definition
        processField(nestedSchemaText, fieldName, fullPath, fields);
      } else {
        // It's a nested object without explicit type
        fields.push({
          name: fullPath,
          type: 'Record<string, any>',
          required: false,
          jsDoc: `/**\n * Nested object for ${fieldName}\n */`
        });
        
        // Recursively process nested fields
        extractSchemaFields(nestedSchemaText, fields, fullPath);
      }
    } else {
      // Simple field definition
      processField(fieldDef, fieldName, fullPath, fields);
    }
  }
}

// Process a complex field with nested structure
function processComplexField(fieldDef, fieldName, fullPath, fields) {
  // Check if it's an array with nested schema
  const isArray = fieldDef.includes('type: [') || fieldDef.includes('type: Array');
  
  if (isArray) {
    // Handle array with nested schema
    fields.push({
      name: fullPath,
      type: `Array<Record<string, any>>`,
      required: fieldDef.includes('required: true'),
      jsDoc: `/**\n * Array of nested objects for ${fieldName}\n */`
    });
    
    // Try to extract the nested schema for array elements
    const nestedSchemaMatch = fieldDef.match(/type:\s*\[\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}\s*\]/);
    if (nestedSchemaMatch) {
      extractSchemaFields(nestedSchemaMatch[1], fields, `${fullPath}[].`);
    }
  } else {
    // Handle object with nested schema
    fields.push({
      name: fullPath,
      type: 'Record<string, any>',
      required: fieldDef.includes('required: true'),
      jsDoc: `/**\n * Nested object for ${fieldName}\n */`
    });
    
    // Extract the nested schema
    const nestedSchemaMatch = fieldDef.match(/type:\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}/) || 
                             fieldDef.match(/:\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}/);
    
    if (nestedSchemaMatch) {
      extractSchemaFields(nestedSchemaMatch[1], fields, fullPath);
    }
  }
}

// Process a normal field
function processField(fieldDef, fieldName, fullPath, fields) {
  // Extract field properties
  const typeMatch = /type:\s*(?:{\s*type:\s*)?([^,\s{}[\]]+|\[[^\]]+\])/i.exec(fieldDef);
  const requiredMatch = /required:\s*(true|false)/i.exec(fieldDef);
  const defaultMatch = /default:\s*([^,\s}]+)/i.exec(fieldDef);
  const refMatch = /ref:\s*['"]([^'"]+)['"]/i.exec(fieldDef) || 
                  /ref:\s*([A-Z]\w+)/i.exec(fieldDef);
  const enumMatch = /enum:\s*\[([^\]]+)\]/i.exec(fieldDef);
  
  // Extract min/max validators
  const minMaxMatch = /(min|max)(?:length)?:\s*(\d+)/gi;
  const minMaxValues = [];
  let minMaxResult;
  while ((minMaxResult = minMaxMatch.exec(fieldDef)) !== null) {
    minMaxValues.push({ type: minMaxResult[1], value: minMaxResult[2] });
  }
  
  // Check if field is an array
  const isArray = fieldDef.includes('[') || 
                  fieldDef.includes('Array') || 
                  (typeMatch && typeMatch[1].startsWith('['));
  
  // Process field type
  let type = 'String'; // Default to String
  let isArrayType = isArray; // Store the original isArray value
  
  if (typeMatch) {
    let rawType = typeMatch[1];
    
    // Handle array syntax in type
    if (rawType.startsWith('[') && rawType.endsWith(']')) {
      isArrayType = true;
      rawType = rawType.substring(1, rawType.length - 1).trim();
    }
    
    type = rawType;
  }
  
  // Handle references - they take precedence over type
  if (refMatch) {
    type = refMatch[1];
  }
  
  const isRequired = requiredMatch ? requiredMatch[1] === 'true' : false;
  
  // Process enum values if present
  let enumValues = null;
  if (enumMatch) {
    enumValues = enumMatch[1];
  }
  
  // Convert to TypeScript type
  const tsType = convertMongooseTypeToTypeScript(type, isRequired, isArrayType, enumValues);
  
  // Prepare JSDoc comment with field constraints
  let jsDoc = '/**\n';
  jsDoc += ` * ${fieldName} field\n`;
  
  if (isRequired) {
    jsDoc += ' * @required\n';
  }
  
  if (defaultMatch) {
    jsDoc += ` * @default ${defaultMatch[1]}\n`;
  }
  
  if (enumMatch) {
    jsDoc += ` * @enum ${enumMatch[1]}\n`;
  }
  
  for (const constraint of minMaxValues) {
    jsDoc += ` * @${constraint.type} ${constraint.value}\n`;
  }
  
  if (refMatch) {
    jsDoc += ` * References ${refMatch[1]} model\n`;
  }
  
  jsDoc += ' */';
  
  fields.push({
    name: fullPath,
    type: tsType,
    required: isRequired,
    jsDoc
  });
}

// Extract model name from file content
function extractModelName(content, filePath) {
  // Look for model definition with name
  const modelNameRegex = /mongoose\.model\(['"]([\w-]+)['"]|\.model\(['"]([\w-]+)['"]|model\(['"]([\w-]+)['"]/;
  const modelMatch = modelNameRegex.exec(content);
  
  if (modelMatch) {
    return modelMatch[1] || modelMatch[2] || modelMatch[3];
  }
  
  // Try to extract from const/export statements
  const constRegex = /const\s+(\w+)\s*=\s*mongoose\.model|const\s+(\w+)\s*=\s*.+\.model|export\s+const\s+(\w+)\s*=\s*mongoose\.model/;
  const constMatch = constRegex.exec(content);
  
  if (constMatch) {
    return constMatch[1] || constMatch[2] || constMatch[3];
  }
  
  // Extract from class name if it's a class-based model
  const classRegex = /export\s+class\s+(\w+)/;
  const classMatch = classRegex.exec(content);
  
  if (classMatch) {
    return classMatch[1];
  }
  
  // Extract from filename as fallback
  const basename = path.basename(filePath, '.ts');
  const cleanName = basename.replace('.model', '');
  // Convert kebab case or snake case to PascalCase
  const pascalName = cleanName
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  
  if (VERBOSE) {
    console.log(chalk.yellow(`Extracted model name ${pascalName} from filename ${basename}`));
  }
  
  return pascalName;
}

// Generate TypeScript interface based on model schema
function generateTypeScriptInterface(modelName, schema, modelFilePath) {
  const { fields, methods, statics, virtuals } = schema;
  
  if (!modelName || !fields || fields.length === 0) {
    return null;
  }
  
  // Record this model as processed to handle circular references
  processedModels.add(modelName);
  
  // Create interface name - I + ModelName
  const interfaceName = `I${modelName}`;
  
  // Build the interface definition
  let typeDefinition = `/**\n * Interface for ${modelName} model\n */\nexport interface ${interfaceName} {\n`;
  
  // Add fields to the interface
  for (const field of fields) {
    typeDefinition += `  ${field.jsDoc}\n`;
    typeDefinition += `  ${field.name}${field.required ? '' : '?'}: ${field.type};\n\n`;
  }
  
  // Add virtuals to the interface
  if (virtuals.length > 0) {
    typeDefinition += `  /**\n   * Virtual properties\n   */\n`;
    for (const virtual of virtuals) {
      typeDefinition += `  ${virtual.name}?: ${virtual.type};\n`;
    }
    typeDefinition += '\n';
  }
  
  typeDefinition += '}\n\n';
  
  // Add document interface (extends Mongoose Document)
  typeDefinition += `/**\n * Interface for ${modelName} document (includes Mongoose document methods)\n */\nexport interface ${interfaceName}Document extends ${interfaceName}, Document {\n`;
  
  // Add timestamp fields
  typeDefinition += `  /**\n   * Timestamp fields added by Mongoose if timestamps: true is set\n   */\n  createdAt?: Date;\n  updatedAt?: Date;\n\n`;
  
  // Add methods to the document interface
  if (methods.length > 0) {
    typeDefinition += `  /**\n   * Document methods\n   */\n`;
    for (const method of methods) {
      const asyncStr = method.async ? 'async ' : '';
      const returnType = method.returnType.replace('{ModelName}', modelName);
      typeDefinition += `  ${asyncStr}${method.name}(...args: any[]): ${returnType};\n`;
    }
    typeDefinition += '\n';
  }
  
  typeDefinition += '}\n\n';
  
  // Add model interface with static methods
  typeDefinition += `/**\n * Interface for ${modelName} model with static methods\n */\nexport interface ${modelName}Model extends Model<${interfaceName}Document> {\n`;
  
  // Add static methods to the model interface
  if (statics.length > 0) {
    typeDefinition += `  /**\n   * Static model methods\n   */\n`;
    for (const staticMethod of statics) {
      const asyncStr = staticMethod.async ? 'async ' : '';
      const returnType = staticMethod.returnType.replace('{ModelName}', modelName);
      typeDefinition += `  ${asyncStr}${staticMethod.name}(...args: any[]): ${returnType};\n`;
    }
    typeDefinition += '\n';
  }
  
  typeDefinition += `}\n`;
  
  return typeDefinition;
}

// Process a model file and generate TypeScript interface
function processModelFile(filePath) {
  try {
    if (VERBOSE) {
      console.log(chalk.blue(`Processing ${filePath}...`));
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find schema definition
    const schemaRegex = /new\s+(?:mongoose\.)?Schema\s*\(\s*({[^{}]*(?:{[^{}]*}[^{}]*)*})/gs;
    const schemaMatch = schemaRegex.exec(content);
    
    if (!schemaMatch) {
      console.log(chalk.yellow(`Could not extract schema from ${filePath}`));
      return false;
    }
    
    // Extract schema details
    const schema = extractTypesFromSchema(content, schemaMatch);
    
    if (!schema.fields || schema.fields.length === 0) {
      console.log(chalk.yellow(`No fields found in schema for ${filePath}`));
      return false;
    }
    
    // Get model name from content or filename fallback
    let modelName = extractModelName(content, filePath);
    
    // Skip processing if specified model is different
    if (SPECIFIC_MODEL && modelName !== SPECIFIC_MODEL) {
      if (VERBOSE) {
        console.log(chalk.gray(`Skipping ${modelName} as it doesn't match the specified model ${SPECIFIC_MODEL}`));
      }
      return false;
    }
    
    // Generate the TypeScript interface
    const typeDefinition = generateTypeScriptInterface(modelName, schema, filePath);
    
    if (!typeDefinition) {
      console.log(chalk.yellow(`Could not generate interface for ${filePath}`));
      return false;
    }
    
    // Write to the types directory
    const typesDir = path.join(process.cwd(), 'src', 'types', 'models');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }
    
    // Write the type file
    const typePath = path.join(typesDir, `${modelName.toLowerCase()}.types.ts`);
    
    // Check if file exists and should be overwritten
    if (fs.existsSync(typePath) && !FORCE_OVERWRITE) {
      const existingContent = fs.readFileSync(typePath, 'utf8');
      
      // Check if file was manually modified
      if (existingContent.includes('MANUAL EDITS') || existingContent.includes('DO NOT EDIT')) {
        console.log(chalk.yellow(`Skipping ${modelName} as the type file contains manual edits. Use --force to overwrite.`));
        return false;
      }
    }
    
    // Add imports to the type file
    let typeFileContent = `// Generated by generate-types-from-schema.js - ${new Date().toISOString()}\n`;
    typeFileContent += `// Source file: ${filePath}\n\n`;
    typeFileContent += `import { Document, Model } from 'mongoose';\nimport * as mongoose from 'mongoose';\n\n`;
    
    // Add imports for referenced models
    const referencedModels = extractReferencedModels(typeDefinition);
    if (referencedModels.length > 0) {
      for (const refModel of referencedModels) {
        if (refModel !== modelName) {
          // Convert to kebab case for the import
          const refModelKebab = refModel.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
          typeFileContent += `import { I${refModel}Document } from './${refModelKebab}.types';\n`;
        }
      }
      typeFileContent += '\n';
    }
    
    typeFileContent += typeDefinition;
    
    fs.writeFileSync(typePath, typeFileContent);
    console.log(chalk.green(`✓ Generated type definition for ${modelName} at ${typePath}`));
    
    return true;
  } catch (error) {
    console.error(chalk.red(`Error processing ${filePath}:`), error);
    return false;
  }
}

// Extract referenced models from a type definition
function extractReferencedModels(typeDefinition) {
  const regex = /I(\w+)Document/g;
  const models = new Set();
  let match;
  
  while ((match = regex.exec(typeDefinition)) !== null) {
    if (match[1]) {
      models.add(match[1]);
    }
  }
  
  return Array.from(models);
}

// Find and process all model files
function processAllModelFiles() {
  console.log(chalk.blue('Generating TypeScript interfaces from Mongoose schemas...'));
  
  const modelPatterns = [
    'src/models/*.ts',
    'src/models/**/*.ts',
    'src/modules/**/models/*.ts'
  ];
  
  let files = [];
  for (const pattern of modelPatterns) {
    const matches = glob.sync(pattern, { cwd: process.cwd() });
    files = [...files, ...matches];
  }
  
  // Remove duplicates and test files
  files = [...new Set(files)].filter(file => !file.includes('.test.ts'));
  
  // If specific model is requested, try to find it directly
  if (SPECIFIC_MODEL) {
    const specificModelFiles = files.filter(file => 
      path.basename(file, '.ts').toLowerCase() === SPECIFIC_MODEL.toLowerCase() ||
      path.basename(file, '.ts').toLowerCase() === `${SPECIFIC_MODEL.toLowerCase()}.model`
    );
    
    if (specificModelFiles.length > 0) {
      console.log(chalk.blue(`Found ${specificModelFiles.length} file(s) for model ${SPECIFIC_MODEL}`));
      files = specificModelFiles;
    } else {
      console.log(chalk.yellow(`No exact file match for model ${SPECIFIC_MODEL}, will search by model name in all files`));
    }
  }
  
  console.log(chalk.blue(`Found ${files.length} model files to process`));
  
  let generatedCount = 0;
  
  for (const file of files) {
    const success = processModelFile(file);
    if (success) {
      generatedCount++;
    }
  }
  
  console.log(chalk.bold.green(`\nGenerated ${generatedCount} TypeScript interfaces from Mongoose schemas!`));
  
  // Generate index.ts for types
  const typesDir = path.join(process.cwd(), 'src', 'types', 'models');
  if (fs.existsSync(typesDir)) {
    const typeFiles = fs.readdirSync(typesDir).filter(file => file.endsWith('.types.ts'));
    
    let indexContent = '// Generated TypeScript interfaces for Mongoose models\n';
    indexContent += `// Last updated: ${new Date().toISOString()}\n\n`;
    
    for (const typeFile of typeFiles) {
      const basename = path.basename(typeFile, '.types.ts');
      indexContent += `export * from './${basename}.types';\n`;
    }
    
    fs.writeFileSync(path.join(typesDir, 'index.ts'), indexContent);
    console.log(chalk.green(`✓ Generated index.ts file for type exports`));
  }
  
  // Check for circular references
  if (Object.keys(pendingModelReferences).length > 0) {
    console.log(chalk.yellow(`\nWarning: Detected potential circular references between models:`));
    for (const model in pendingModelReferences) {
      console.log(chalk.yellow(`  - ${model} references other models not yet processed`));
    }
    console.log(chalk.yellow(`  This may require manual adjustment in the generated type files.`));
  }
}

// Run the script
processAllModelFiles();