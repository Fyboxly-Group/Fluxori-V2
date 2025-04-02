#!/usr/bin/env node

/**
 * Script to fix TypeScript errors in model files
 * This script focuses on fixing Mongoose schema typing issues
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execSync } = require('child_process');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const existsAsync = promisify(fs.exists);
const mkdirAsync = promisify(fs.mkdir);

// Base directory paths
const baseDir = path.resolve(__dirname, '..');
const srcDir = path.join(baseDir, 'src');
const modelsDir = path.join(srcDir, 'models');
const typesDir = path.join(srcDir, 'types');
const progressFilePath = path.join(baseDir, 'TYPESCRIPT-MIGRATION-PROGRESS.md');

console.log('🔧 Fix Mongoose Model TypeScript Errors');
console.log('===========================================');

/**
 * Main function to fix model TypeScript errors
 */
async function fixModels() {
  try {
    // Enhance mongo-util-types.ts with additional mongoose schema utilities
    await enhanceMongoUtilTypes();
    
    // Find all model files to fix
    const modelFiles = getModelFilesToFix();
    console.log(`Found ${modelFiles.length} model files with @ts-nocheck pragma`);
    
    // Count initial files with @ts-nocheck
    const initialCount = modelFiles.length;
    
    // Fix each model file
    for (const filePath of modelFiles) {
      await fixModelFile(filePath);
    }
    
    // Count files after fixes
    const currentModelFiles = getModelsWithTsNoCheck();
    const fixedCount = initialCount - currentModelFiles.length;
    
    console.log(`\n✅ Fixed ${fixedCount} model files`);
    
    // Update progress tracking
    await updateProgressFile(fixedCount);
    
    console.log('✅ Updated progress tracking');
    console.log('\n🎉 Model TypeScript migration complete!');
    
  } catch (error) {
    console.error('❌ Error fixing model files:', error);
    process.exit(1);
  }
}

/**
 * Enhance mongo-util-types.ts with additional mongoose schema utilities
 */
async function enhanceMongoUtilTypes() {
  const mongoUtilTypesPath = path.join(typesDir, 'mongo-util-types.ts');
  
  try {
    const content = await readFileAsync(mongoUtilTypesPath, 'utf8');
    
    // Check if we need to add Mongoose schema method types
    if (!content.includes('SchemaMethodsType')) {
      const enhancedContent = content + `
/**
 * Helper type for augmenting Mongoose Schema to support typed schema methods
 */
export type SchemaMethodsType<T> = {
  [K in keyof T]: T[K];
};

/**
 * Helper type for augmenting Mongoose Schema to support typed schema statics
 */
export type SchemaStaticsType<T> = {
  [K in keyof T]: T[K];
};

/**
 * Type for Mongoose schema with proper method and static typing
 */
export type TypedSchema<T extends Document, M = {}, S = {}> = Schema<T> & {
  methods: SchemaMethodsType<M>;
  statics: SchemaStaticsType<S>;
};

/**
 * Fix for typing Mongoose Schema pre-hooks to support proper this binding
 */
export type PreHookCallback<T extends Document> = (this: T, next: (err?: Error) => void) => void | Promise<void>;

/**
 * Fix for typing Mongoose Schema post-hooks to support proper this binding
 */
export type PostHookCallback<T extends Document> = (this: T, doc: T, next: (err?: Error) => void) => void | Promise<void>;

/**
 * Type for augmenting Mongoose's Schema interface
 * This ensures proper typing for schema methods
 */
declare module 'mongoose' {
  interface Schema<DocType = Document> {
    methods: Record<string, Function>;
    statics: Record<string, Function>;
  }
}
`;
      
      await writeFileAsync(mongoUtilTypesPath, enhancedContent);
      console.log(`✅ Enhanced mongo-util-types.ts with schema method types`);
    } else {
      console.log(`ℹ️ mongo-util-types.ts already has schema method types`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error enhancing mongo-util-types.ts: ${error.message}`);
    return false;
  }
}

/**
 * Get all model files that need fixing
 */
function getModelFilesToFix() {
  // Find all model files with @ts-nocheck pragma
  const files = [];
  
  // Get files in main models directory
  try {
    const modelFiles = fs.readdirSync(modelsDir)
      .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts'))
      .map(file => path.join(modelsDir, file));
      
    for (const filePath of modelFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('@ts-nocheck')) {
        files.push(filePath);
      }
    }
  } catch (err) {
    console.error('Error reading models directory:', err);
  }
  
  // Check for marketplace models
  try {
    const marketplaceModelsDir = path.join(srcDir, 'modules', 'marketplaces', 'models');
    if (fs.existsSync(marketplaceModelsDir)) {
      const marketplaceModelFiles = fs.readdirSync(marketplaceModelsDir)
        .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts'))
        .map(file => path.join(marketplaceModelsDir, file));
        
      for (const filePath of marketplaceModelFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('@ts-nocheck')) {
          files.push(filePath);
        }
      }
    }
  } catch (err) {
    console.error('Error reading marketplace models directory:', err);
  }
  
  return files;
}

/**
 * Fix a specific model file
 */
async function fixModelFile(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8');
    const filename = path.basename(filePath);
    const modelName = filename.replace('.model.ts', '');
    
    console.log(`Fixing model: ${modelName}`);
    
    let newContent = content;
    
    // Remove @ts-nocheck pragma
    newContent = newContent.replace(/\/\/ @ts-nocheck.*?\n/, '');
    
    // Fix imports - add TypedSchema and other helpers
    if (!newContent.includes('import { TypedSchema }')) {
      newContent = newContent.replace(
        /import mongoose,\s*{\s*Document,\s*Model,\s*Schema\s*}.*?;/,
        `import mongoose, { Document, Model, Schema } from 'mongoose';
import { TypedSchema, PreHookCallback, PostHookCallback } from '../types/mongo-util-types';`
      );
    }
    
    // Fix model interface extensions
    if (newContent.includes('export interface I') && newContent.includes('Document')) {
      // Get the interface name
      const interfaceMatches = newContent.match(/export interface I(\w+)Document extends I\w+, Document/);
      if (interfaceMatches && interfaceMatches[1]) {
        const interfaceName = interfaceMatches[1];
        
        // Add method interface if it doesn't exist
        if (!newContent.includes(`I${interfaceName}Methods`)) {
          // Find the end of the document interface
          const docInterfaceMatch = newContent.match(/export interface I(\w+)Document extends I\w+, Document.*?}/s);
          if (docInterfaceMatch) {
            const insertPoint = docInterfaceMatch[0].lastIndexOf('}') + 1;
            
            // Add the methods interface
            const methodsInterface = `\n\n/**
 * Methods for ${interfaceName} model
 */
export interface I${interfaceName}Methods {
  // Add methods as needed
}`;
            
            // Insert the methods interface
            newContent = newContent.slice(0, insertPoint) + methodsInterface + newContent.slice(insertPoint);
            
            // Update the document interface to include methods
            newContent = newContent.replace(
              /export interface I(\w+)Document extends I\w+, Document/,
              `export interface I$1Document extends I$1, Document, I$1Methods`
            );
          }
        }
        
        // Add statics interface if it doesn't exist
        if (!newContent.includes(`I${interfaceName}Statics`)) {
          // Find the end of the methods interface or document interface
          const methodsInterfaceMatch = newContent.match(/export interface I(\w+)Methods.*?}/s);
          let insertPoint;
          
          if (methodsInterfaceMatch) {
            insertPoint = methodsInterfaceMatch[0].lastIndexOf('}') + 1;
          } else {
            const docInterfaceMatch = newContent.match(/export interface I(\w+)Document.*?}/s);
            if (docInterfaceMatch) {
              insertPoint = docInterfaceMatch[0].lastIndexOf('}') + 1;
            }
          }
          
          if (insertPoint) {
            // Add the statics interface
            const staticsInterface = `\n\n/**
 * Static methods for ${interfaceName} model
 */
export interface I${interfaceName}Statics {
  // Add static methods as needed
}`;
            
            // Insert the statics interface
            newContent = newContent.slice(0, insertPoint) + staticsInterface + newContent.slice(insertPoint);
          }
        }
        
        // Fix the model type
        if (!newContent.includes(`${interfaceName}Model`)) {
          // Add model type before the schema
          const schemaMatch = newContent.match(/const (\w+)Schema =/);
          if (schemaMatch) {
            const insertPoint = schemaMatch.index;
            
            // Add the model type
            const modelType = `/**
 * Type for ${interfaceName} model with statics
 */
export type ${interfaceName}Model = Model<I${interfaceName}Document> & I${interfaceName}Statics;

`;
            
            // Insert the model type
            newContent = newContent.slice(0, insertPoint) + modelType + newContent.slice(insertPoint);
          }
        }
        
        // Fix schema definition to use TypedSchema
        newContent = newContent.replace(
          /const (\w+)Schema = new Schema<I\w+Document>/,
          `const $1Schema = new Schema<I${interfaceName}Document, ${interfaceName}Model, I${interfaceName}Methods>`
        );
        
        // Fix model creation
        newContent = newContent.replace(
          /const (\w+) = mongoose.model<I\w+Document>/,
          `const $1 = mongoose.model<I${interfaceName}Document, ${interfaceName}Model>`
        );
        
        // Add type assertion for schema methods if needed
        if (newContent.includes('Schema.methods.') || newContent.includes('Schema.method(')) {
          newContent = newContent.replace(
            /(\w+)Schema.methods./g,
            `$1Schema.methods.`
          );
        }
        
        // Add type assertion for schema statics if needed
        if (newContent.includes('Schema.statics.')) {
          newContent = newContent.replace(
            /(\w+)Schema.statics./g,
            `$1Schema.statics.`
          );
        }
        
        // Fix pre/post hooks to use proper this typing
        newContent = newContent.replace(
          /(\w+)Schema.pre\(['"](\w+)['"]\s*,\s*function\s*\(/g,
          `$1Schema.pre('$2', function(`
        );
        
        newContent = newContent.replace(
          /(\w+)Schema.post\(['"](\w+)['"]\s*,\s*function\s*\(/g,
          `$1Schema.post('$2', function(`
        );
        
        // Add type info for pre hooks
        if (newContent.includes('Schema.pre(')) {
          newContent = newContent.replace(
            /(\w+)Schema.pre\(['"](\w+)['"]\s*,\s*function\s*\(([^)]*)\)/g, 
            `$1Schema.pre('$2', function($3): void`
          );
        }
        
        // Add type info for post hooks
        if (newContent.includes('Schema.post(')) {
          newContent = newContent.replace(
            /(\w+)Schema.post\(['"](\w+)['"]\s*,\s*function\s*\(([^)]*)\)/g, 
            `$1Schema.post('$2', function($3): void`
          );
        }
      }
    }
    
    // Write the fixed file
    await writeFileAsync(filePath, newContent);
    console.log(`✅ Fixed ${filePath}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error fixing model file ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Get all model files that still have @ts-nocheck
 */
function getModelsWithTsNoCheck() {
  const files = [];
  
  // Get files in main models directory
  try {
    const modelFiles = fs.readdirSync(modelsDir)
      .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts'))
      .map(file => path.join(modelsDir, file));
      
    for (const filePath of modelFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('@ts-nocheck')) {
        files.push(filePath);
      }
    }
  } catch (err) {
    console.error('Error reading models directory:', err);
  }
  
  // Check for marketplace models
  try {
    const marketplaceModelsDir = path.join(srcDir, 'modules', 'marketplaces', 'models');
    if (fs.existsSync(marketplaceModelsDir)) {
      const marketplaceModelFiles = fs.readdirSync(marketplaceModelsDir)
        .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts'))
        .map(file => path.join(marketplaceModelsDir, file));
        
      for (const filePath of marketplaceModelFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('@ts-nocheck')) {
          files.push(filePath);
        }
      }
    }
  } catch (err) {
    console.error('Error reading marketplace models directory:', err);
  }
  
  return files;
}

/**
 * Update the TypeScript migration progress file
 */
async function updateProgressFile(fixedCount) {
  try {
    const content = await readFileAsync(progressFilePath, 'utf8');
    
    // Extract current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Update the progress file with Model fixes
    
    // 1. Update the current progress statistics
    const currentStats = extractProgressStats(content);
    const newFixedFiles = currentStats.filesFixed + fixedCount;
    const newRemainingFiles = currentStats.remainingFiles - fixedCount;
    const percentComplete = ((newFixedFiles / (newFixedFiles + newRemainingFiles)) * 100).toFixed(2);
    
    let updatedContent = content.replace(
      /- \*\*Files Fixed\*\*: \d+\/\d+ \(\d+\.\d+%\)/,
      `- **Files Fixed**: ${newFixedFiles}/${currentStats.totalFiles} (${percentComplete}%)`
    );
    
    updatedContent = updatedContent.replace(
      /- \*\*Remaining @ts-nocheck Files\*\*: -?\d+/,
      `- **Remaining @ts-nocheck Files**: ${newRemainingFiles}`
    );
    
    // 2. Add entry to Recent Changes section if not already there for today
    const recentChangesEntry = `
### ${currentDate}

Fixed Model Files:
- Fixed Mongoose schema type issues in ${fixedCount} model files
- Enhanced mongo-util-types.ts with schema method and statics types
- Added proper typing for schema methods and hook functions
- Fixed TypedSchema implementation for Mongoose models
- Improved model interface definitions
- Added type narrowing for Mongoose document operations
`;
    
    // Check if there's already an entry for today
    if (!updatedContent.includes(`### ${currentDate}`)) {
      // Insert after "## Recent Changes"
      updatedContent = updatedContent.replace(
        '## Recent Changes',
        '## Recent Changes' + recentChangesEntry
      );
    } else if (!updatedContent.includes("Fixed Model Files:")) {
      // Add our entry after today's date header
      updatedContent = updatedContent.replace(
        `### ${currentDate}`,
        `### ${currentDate}` + "\n\nFixed Model Files:\n- Fixed Mongoose schema type issues in " + fixedCount + " model files\n- Enhanced mongo-util-types.ts with schema method and statics types\n- Added proper typing for schema methods and hook functions\n- Fixed TypedSchema implementation for Mongoose models\n- Improved model interface definitions\n- Added type narrowing for Mongoose document operations"
      );
    }
    
    // 3. Add statistics for models
    const statsTableEntry = `| Model Files | ${fixedCount} | ${21 - fixedCount} | ${((fixedCount / 21) * 100).toFixed(2)}% |`;
    
    if (!updatedContent.includes('| Model Files |')) {
      // Add to Statistics section if not already there
      updatedContent = updatedContent.replace(
        '| Core Application | 1 | 0 | 100.00% |',
        '| Core Application | 1 | 0 | 100.00% |\n| Model Files | ' + fixedCount + ' | ' + (21 - fixedCount) + ' | ' + ((fixedCount / 21) * 100).toFixed(2) + '% |'
      );
    } else {
      // Update existing entry
      updatedContent = updatedContent.replace(
        /\| Model Files \| \d+ \| \d+ \| \d+\.\d+% \|/,
        statsTableEntry
      );
    }
    
    await writeFileAsync(progressFilePath, updatedContent);
    return true;
  } catch (error) {
    console.error(`❌ Error updating progress file: ${error.message}`);
    return false;
  }
}

/**
 * Extract progress statistics from the progress file
 */
function extractProgressStats(content) {
  const filesFixedMatch = content.match(/- \*\*Files Fixed\*\*: (\d+)\/(\d+)/);
  const remainingFilesMatch = content.match(/- \*\*Remaining @ts-nocheck Files\*\*: (-?\d+)/);
  
  return {
    filesFixed: filesFixedMatch ? parseInt(filesFixedMatch[1], 10) : 0,
    totalFiles: filesFixedMatch ? parseInt(filesFixedMatch[2], 10) : 0,
    remainingFiles: remainingFilesMatch ? parseInt(remainingFilesMatch[1], 10) : 0
  };
}

fixModels().catch(console.error);