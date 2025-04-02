#!/usr/bin/env node

/**
 * Enhanced Type Generator
 * 
 * This script analyzes the codebase and generates TypeScript types for:
 * 1. Mongoose models
 * 2. API response types
 * 3. Discriminated unions for error handling
 * 4. Type-safe MongoDB utilities
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const MODEL_PATTERN = 'src/**/*.model.ts';
const CONTROLLER_PATTERN = 'src/**/*.controller.ts';
const TYPE_OUTPUT_DIR = 'src/types';

/**
 * Create directory if it doesn't exist
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${path.relative(ROOT_DIR, dirPath)}`);
  }
}

/**
 * Find all model files
 */
function findModelFiles() {
  console.log(chalk.blue('Finding model files...'));
  
  const modelPattern = path.join(ROOT_DIR, MODEL_PATTERN);
  const modelFiles = glob.sync(modelPattern);
  
  console.log(`Found ${modelFiles.length} model files`);
  return modelFiles;
}

/**
 * Find all controller files
 */
function findControllerFiles() {
  console.log(chalk.blue('Finding controller files...'));
  
  const controllerPattern = path.join(ROOT_DIR, CONTROLLER_PATTERN);
  const controllerFiles = glob.sync(controllerPattern);
  
  console.log(`Found ${controllerFiles.length} controller files`);
  return controllerFiles;
}

/**
 * Extract model name from file path
 */
function extractModelName(filePath) {
  const fileName = path.basename(filePath, '.model.ts');
  const pascalCase = fileName.charAt(0).toUpperCase() + fileName.slice(1);
  return pascalCase;
}

/**
 * Generate model interfaces for a model file
 */
function generateModelInterfaces(filePath) {
  console.log(`Processing model: ${path.relative(ROOT_DIR, filePath)}...`);
  
  try {
    // Read model file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract model name
    const modelName = extractModelName(filePath);
    
    // Analyze schema properties
    const schemaMatch = content.match(/new Schema\(\s*\{([^}]*)\}/s);
    if (!schemaMatch) {
      console.log(chalk.yellow(`  ⚠️ Could not find Schema in ${path.relative(ROOT_DIR, filePath)}`));
      return null;
    }
    
    const schemaContent = schemaMatch[1];
    
    // Extract property definitions
    const propertyLines = [];
    const schemaLines = schemaContent.split('\n');
    
    for (let line of schemaLines) {
      line = line.trim();
      
      if (!line || line.startsWith('//')) continue;
      
      const propertyMatch = line.match(/(\w+):\s*(?:{[^}]*}|[^,]*)/);
      if (propertyMatch) {
        const propName = propertyMatch[1];
        let propType = 'any'; // Default type
        
        if (line.includes('type: String')) {
          propType = 'string';
        } else if (line.includes('type: Number')) {
          propType = 'number';
        } else if (line.includes('type: Boolean')) {
          propType = 'boolean';
        } else if (line.includes('type: Date')) {
          propType = 'Date';
        } else if (line.includes('type: Schema.Types.ObjectId') || line.includes('type: Types.ObjectId')) {
          propType = 'Types.ObjectId';
        } else if (line.includes('type: [String]') || line.includes('type: Array') && line.includes('String')) {
          propType = 'string[]';
        } else if (line.includes('type: [Number]') || line.includes('type: Array') && line.includes('Number')) {
          propType = 'number[]';
        } else if (line.includes('type: Object') || line.includes('type: {}')) {
          propType = 'Record<string, any>';
        }
        
        // Handle required properties
        const isRequired = line.includes('required: true');
        
        // Add property to interface
        propertyLines.push(`  ${propName}${isRequired ? '' : '?'}: ${propType};`);
      }
    }
    
    // Always add common properties
    propertyLines.push('  _id?: Types.ObjectId;');
    propertyLines.push('  createdAt?: Date;');
    propertyLines.push('  updatedAt?: Date;');
    
    // Generate interface content
    const interfaceContent = `import { Document, Types, Model } from 'mongoose';

/**
 * Base interface for ${modelName} (raw data)
 */
export interface I${modelName} {
${propertyLines.join('\n')}
}

/**
 * Document interface for ${modelName} (includes Document methods)
 */
export interface I${modelName}Document extends Document, I${modelName} {
  // Add document-specific methods here
}

/**
 * Model interface for ${modelName} (includes static methods)
 */
export interface I${modelName}Model extends Model<I${modelName}Document> {
  // Add static model methods here
}
`;
    
    // Write interface to file
    const interfaceDir = path.join(ROOT_DIR, TYPE_OUTPUT_DIR, 'models');
    ensureDirectoryExists(interfaceDir);
    
    const interfaceFile = path.join(interfaceDir, `${modelName.toLowerCase()}.types.ts`);
    fs.writeFileSync(interfaceFile, interfaceContent, 'utf8');
    
    console.log(chalk.green(`  ✅ Generated interface for ${modelName}`));
    
    return {
      modelName,
      interfaceFile
    };
  } catch (error) {
    console.error(chalk.red(`  ❌ Error processing ${path.relative(ROOT_DIR, filePath)}:`), error);
    return null;
  }
}

/**
 * Generate API response types for controllers
 */
function generateAPITypes(controllerFiles) {
  console.log(chalk.blue('Generating API response types...'));
  
  const responseTypes = [];
  
  for (const filePath of controllerFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const controllerName = path.basename(filePath, '.controller.ts');
      const pascalCase = controllerName.charAt(0).toUpperCase() + controllerName.slice(1);
      
      // Look for response patterns
      const responsePatterns = [];
      
      // Find all res.status(...).json(...) patterns
      const statusJsonMatches = content.matchAll(/res\.status\(\d+\)\.json\(\s*\{([^}]*)\}\s*\)/g);
      for (const match of statusJsonMatches) {
        const responseContent = match[1];
        
        // Extract properties from response
        const propMatches = responseContent.matchAll(/(\w+)\s*:/g);
        for (const propMatch of propMatches) {
          responsePatterns.push(propMatch[1]);
        }
      }
      
      // Create unique set of response properties
      const uniqueProps = [...new Set(responsePatterns)];
      
      // Skip if no response patterns found
      if (uniqueProps.length === 0) continue;
      
      // Generate response type
      responseTypes.push({
        name: `${pascalCase}Response`,
        properties: uniqueProps
      });
    } catch (error) {
      console.error(chalk.red(`  ❌ Error analyzing ${path.relative(ROOT_DIR, filePath)}:`), error);
    }
  }
  
  // Generate API types file
  let apiTypesContent = `import { Types } from 'mongoose';

/**
 * Base API response interface
 */
export interface APIResponse {
  success: boolean;
  message?: string;
  error?: string | Error;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> extends APIResponse {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

`;

  // Add individual response types
  for (const type of responseTypes) {
    apiTypesContent += `/**
 * ${type.name} interface
 */
export interface ${type.name} extends APIResponse {
${type.properties.map(prop => {
  if (prop === 'data') return '  data: any;';
  if (prop === 'success') return '  success: boolean;';
  if (prop === 'error') return '  error?: string | Error;';
  if (prop === 'message') return '  message?: string;';
  if (prop === 'meta') return '  meta?: Record<string, any>;';
  return `  ${prop}?: any;`;
}).join('\n')}
}

`;
  }
  
  // Add discriminated union for type safety
  apiTypesContent += `/**
 * Successful API response with data
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Failed API response with error
 */
export interface ErrorResponse {
  success: false;
  error: string | Error;
  message?: string;
}

/**
 * API result type (discriminated union)
 */
export type APIResult<T> = SuccessResponse<T> | ErrorResponse;
`;
  
  // Write API types file
  const apiTypesDir = path.join(ROOT_DIR, TYPE_OUTPUT_DIR, 'api');
  ensureDirectoryExists(apiTypesDir);
  
  const apiTypesFile = path.join(apiTypesDir, 'responses.ts');
  fs.writeFileSync(apiTypesFile, apiTypesContent, 'utf8');
  
  console.log(chalk.green(`✅ Generated API response types`));
}

/**
 * Generate utility types
 */
function generateUtilityTypes() {
  console.log(chalk.blue('Generating utility types...'));
  
  // MongoDB utility types
  const mongoDbUtilsContent = `import { Types } from 'mongoose';

/**
 * Safely converts a string or ObjectId to ObjectId
 * @throws Error if the input is not a valid ObjectId
 */
export function toObjectId(id: string | Types.ObjectId | null | undefined): Types.ObjectId {
  if (id instanceof Types.ObjectId) {
    return id;
  }
  
  if (!id) {
    throw new Error('Invalid ObjectId: null or undefined value provided');
  }
  
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(\`Invalid ObjectId: "\${id}" is not a valid ObjectId\`);
  }
  
  return new Types.ObjectId(id);
}

/**
 * Type guard for checking if a value is an ObjectId
 */
export function isObjectId(value: any): value is Types.ObjectId {
  return value instanceof Types.ObjectId;
}

/**
 * Type guard for checking if a string is a valid ObjectId string
 */
export function isObjectIdString(value: any): value is string {
  return typeof value === 'string' && Types.ObjectId.isValid(value);
}

/**
 * Safely converts an ObjectId to string
 */
export function objectIdToString(id: Types.ObjectId | string | null | undefined): string {
  if (!id) {
    return '';
  }
  
  if (typeof id === 'string') {
    return id;
  }
  
  return id.toString();
}
`;

  // Result pattern for error handling
  const resultTypeContent = `/**
 * Result pattern for type-safe error handling
 */

/**
 * Success result type
 */
export interface Success<T> {
  success: true;
  data: T;
}

/**
 * Failure result type
 */
export interface Failure<E = Error> {
  success: false;
  error: E;
}

/**
 * Result type (either Success or Failure)
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Create a success result
 */
export function success<T>(data: T): Success<T> {
  return { success: true, data };
}

/**
 * Create a failure result
 */
export function failure<E = Error>(error: E): Failure<E> {
  return { success: false, error };
}

/**
 * Type guard for Success
 */
export function isSuccess<T, E = Error>(result: Result<T, E>): result is Success<T> {
  return result.success === true;
}

/**
 * Type guard for Failure
 */
export function isFailure<T, E = Error>(result: Result<T, E>): result is Failure<E> {
  return result.success === false;
}
`;

  // Write utility types
  const utilsDir = path.join(ROOT_DIR, TYPE_OUTPUT_DIR, 'utils');
  ensureDirectoryExists(utilsDir);
  
  const mongoDbUtilsFile = path.join(utilsDir, 'mongodb.ts');
  fs.writeFileSync(mongoDbUtilsFile, mongoDbUtilsContent, 'utf8');
  
  const resultTypeFile = path.join(utilsDir, 'result.ts');
  fs.writeFileSync(resultTypeFile, resultTypeContent, 'utf8');
  
  console.log(chalk.green(`✅ Generated utility types`));
}

/**
 * Generate index file for types
 */
function generateTypeIndex(modelInterfaces) {
  console.log(chalk.blue('Generating type index files...'));
  
  // Generate model types index
  let modelIndexContent = `// Model type definitions
`;

  // Add imports and exports for each model
  if (modelInterfaces && modelInterfaces.length > 0) {
    for (const model of modelInterfaces) {
      if (!model) continue;
      
      const relativePath = path.relative(
        path.join(ROOT_DIR, TYPE_OUTPUT_DIR), 
        model.interfaceFile
      ).replace(/\\/g, '/');
      
      modelIndexContent += `export * from './${relativePath.replace(/\.ts$/, '')}';
`;
    }
  }
  
  // Write model index file
  const modelIndexFile = path.join(ROOT_DIR, TYPE_OUTPUT_DIR, 'models', 'index.ts');
  fs.writeFileSync(modelIndexFile, modelIndexContent, 'utf8');
  
  // Generate main types index
  const mainIndexContent = `// Type definitions

// API response types
export * from './api/responses';

// MongoDB utility types
export * from './utils/mongodb';

// Result pattern types
export * from './utils/result';

// Model types
export * from './models';
`;
  
  // Write main index file
  const mainIndexFile = path.join(ROOT_DIR, TYPE_OUTPUT_DIR, 'index.ts');
  fs.writeFileSync(mainIndexFile, mainIndexContent, 'utf8');
  
  console.log(chalk.green(`✅ Generated type index files`));
}

/**
 * Add type exports to module index files
 */
function addTypeExportsToModules() {
  console.log(chalk.blue('Adding type exports to module index files...'));
  
  // Find all module index files
  const modulePattern = path.join(ROOT_DIR, 'src/modules/*/index.ts');
  const moduleIndexFiles = glob.sync(modulePattern);
  
  let updatedCount = 0;
  
  for (const indexFile of moduleIndexFiles) {
    try {
      // Read index file
      const content = fs.readFileSync(indexFile, 'utf8');
      
      // Skip if already exports types
      if (content.includes('export type') || content.includes('export interface')) {
        continue;
      }
      
      // Find model exports in the same module
      const modulePath = path.dirname(indexFile);
      const moduleModelsPattern = path.join(modulePath, '**/*.model.ts');
      const moduleModels = glob.sync(moduleModelsPattern);
      
      if (moduleModels.length === 0) {
        continue;
      }
      
      // Generate type exports
      let typeExports = '\n// Type exports\n';
      
      for (const modelFile of moduleModels) {
        const modelName = extractModelName(modelFile);
        const modelRelativePath = path.relative(modulePath, modelFile).replace(/\\/g, '/').replace(/\.ts$/, '');
        
        typeExports += `export type { I${modelName}, I${modelName}Document, I${modelName}Model } from './${modelRelativePath}';\n`;
      }
      
      // Add type exports to index file
      const updatedContent = content + typeExports;
      fs.writeFileSync(indexFile, updatedContent, 'utf8');
      
      console.log(chalk.green(`  ✅ Added type exports to ${path.relative(ROOT_DIR, indexFile)}`));
      updatedCount++;
    } catch (error) {
      console.error(chalk.red(`  ❌ Error processing ${path.relative(ROOT_DIR, indexFile)}:`), error);
    }
  }
  
  console.log(`Added type exports to ${updatedCount} module index files`);
}

/**
 * Main function
 */
function main() {
  console.log(chalk.bold('🔧 Enhanced Type Generator'));
  console.log(chalk.bold('============================'));
  
  // Ensure type directories exist
  ensureDirectoryExists(path.join(ROOT_DIR, TYPE_OUTPUT_DIR));
  ensureDirectoryExists(path.join(ROOT_DIR, TYPE_OUTPUT_DIR, 'models'));
  ensureDirectoryExists(path.join(ROOT_DIR, TYPE_OUTPUT_DIR, 'api'));
  ensureDirectoryExists(path.join(ROOT_DIR, TYPE_OUTPUT_DIR, 'utils'));
  
  // Find model and controller files
  const modelFiles = findModelFiles();
  const controllerFiles = findControllerFiles();
  
  // Generate model interfaces
  const modelInterfaces = modelFiles.map(generateModelInterfaces).filter(Boolean);
  
  // Generate API types
  generateAPITypes(controllerFiles);
  
  // Generate utility types
  generateUtilityTypes();
  
  // Generate type index files
  generateTypeIndex(modelInterfaces);
  
  // Add type exports to module index files
  addTypeExportsToModules();
  
  console.log(chalk.green('\n✅ Type generation completed!'));
  console.log('\nNext steps:');
  console.log('1. Import and use the generated types in your code');
  console.log('2. Run TypeScript validation: npm run typecheck:src');
}

// Run the script
main();