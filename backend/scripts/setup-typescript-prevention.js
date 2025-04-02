#!/usr/bin/env node

/**
 * Setup TypeScript Prevention System
 * 
 * This script sets up a TypeScript error prevention system with:
 * - ESLint rules to prevent @ts-nocheck in production code
 * - Husky pre-commit hooks to validate TypeScript
 * - Type generation utilities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Install dependencies
 */
function installDependencies() {
  console.log('Installing dependencies...');
  
  const devDependencies = [
    '@typescript-eslint/eslint-plugin@latest',
    '@typescript-eslint/parser@latest',
    'eslint@latest',
    'husky@latest',
    'lint-staged@latest',
    'glob@latest',
    'chalk@^4.1.2', // Using v4 for CommonJS compatibility
    'rimraf@latest'
  ];
  
  try {
    execSync(`npm install --save-dev ${devDependencies.join(' ')}`, { 
      stdio: 'inherit', 
      cwd: ROOT_DIR 
    });
    console.log('✅ Dependencies installed successfully');
    return true;
  } catch (error) {
    console.error('Error installing dependencies:', error);
    return false;
  }
}

/**
 * Create enhanced ESLint configuration
 */
function setupESLintConfig() {
  console.log('Setting up enhanced ESLint configuration...');
  
  const eslintConfig = `/**
 * Enhanced ESLint configuration with stricter TypeScript rules
 */
module.exports = {
  extends: ['./.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Ban @ts-nocheck in production code
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-nocheck': 'error',
        'ts-ignore': 'error',
        'ts-expect-error': {
          descriptionFormat: '^: TS\\\\d+: .+$'
        }
      }
    ],
    
    // Enforce explicit types
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    
    // Enforce type safety
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    
    // MongoDB/Mongoose specific rules
    '@typescript-eslint/no-misused-promises': [
      'error', 
      { 'checksVoidReturn': false }
    ]
  },
  
  // Explicitly allow @ts-nocheck only in test files
  overrides: [
    {
      files: ['**/*.test.ts', '**/tests/**/*.ts'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off'
      }
    }
  ]
};
`;
  
  const eslintConfigPath = path.join(ROOT_DIR, '.eslintrc.enhanced.js');
  fs.writeFileSync(eslintConfigPath, eslintConfig, 'utf8');
  console.log(`✅ Enhanced ESLint configuration created: ${path.relative(ROOT_DIR, eslintConfigPath)}`);
  return true;
}

/**
 * Set up Husky pre-commit hooks
 */
function setupHusky() {
  console.log('Setting up Husky pre-commit hooks...');
  
  try {
    // Initialize Husky
    execSync('npm run prepare', { 
      stdio: 'inherit', 
      cwd: ROOT_DIR 
    });
    
    // Create Husky directory if it doesn't exist
    const huskyDir = path.join(ROOT_DIR, '.husky');
    if (!fs.existsSync(huskyDir)) {
      fs.mkdirSync(huskyDir, { recursive: true });
    }
    
    // Create enhanced pre-commit hook
    const preCommitEnhanced = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running TypeScript validation..."

# Run TypeScript validator
node scripts/typescript-validator.js

# Only if TypeScript validation succeeds, run lint-staged
if [ $? -eq 0 ]; then
  npx lint-staged
else
  echo "❌ TypeScript validation failed, commit rejected"
  exit 1
fi
`;
    
    const preCommitPath = path.join(huskyDir, 'pre-commit.enhanced');
    fs.writeFileSync(preCommitPath, preCommitEnhanced, 'utf8');
    fs.chmodSync(preCommitPath, 0o755); // Make executable
    
    console.log(`✅ Enhanced pre-commit hook created: ${path.relative(ROOT_DIR, preCommitPath)}`);
    console.log('To use the enhanced pre-commit hook, run: npm run husky:use-enhanced');
    return true;
  } catch (error) {
    console.error('Error setting up Husky:', error);
    return false;
  }
}

/**
 * Create TypeScript validation script
 */
function createTypeScriptValidator() {
  console.log('Creating TypeScript validation script...');
  
  // The content of this file is already in scripts/typescript-validator.js
  // We'll just check if it exists and create it if it doesn't
  
  const validatorPath = path.join(ROOT_DIR, 'scripts/typescript-validator.js');
  
  if (!fs.existsSync(validatorPath)) {
    // The content would be copied from the existing implementation
    console.log(`❌ TypeScript validator script not found: ${path.relative(ROOT_DIR, validatorPath)}`);
    console.log('Please create this file manually or run the appropriate script');
    return false;
  }
  
  // Make executable
  fs.chmodSync(validatorPath, 0o755);
  console.log(`✅ TypeScript validator script ready: ${path.relative(ROOT_DIR, validatorPath)}`);
  return true;
}

/**
 * Create directories for TypeScript types
 */
function createTypeDirectories() {
  console.log('Creating directories for TypeScript types...');
  
  const directories = [
    path.join(ROOT_DIR, 'src/types'),
    path.join(ROOT_DIR, 'src/types/models'),
    path.join(ROOT_DIR, 'src/types/api'),
    path.join(ROOT_DIR, 'src/types/utils')
  ];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${path.relative(ROOT_DIR, dir)}`);
    }
  }
  
  // Create basic utility type files
  const utilityTypesPath = path.join(ROOT_DIR, 'src/types/utils/mongodb.ts');
  const utilityTypesContent = `/**
 * MongoDB utility types
 */
import { Types } from 'mongoose';

/**
 * Safely converts a string or ObjectId to ObjectId
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
 * Type guard for ObjectId
 */
export function isObjectId(value: any): value is Types.ObjectId {
  return value instanceof Types.ObjectId;
}

/**
 * Type guard for ObjectId string
 */
export function isObjectIdString(value: any): value is string {
  return typeof value === 'string' && Types.ObjectId.isValid(value);
}
`;
  
  fs.writeFileSync(utilityTypesPath, utilityTypesContent, 'utf8');
  console.log(`✅ Created MongoDB utility types: ${path.relative(ROOT_DIR, utilityTypesPath)}`);
  
  // Create result pattern type file
  const resultTypePath = path.join(ROOT_DIR, 'src/types/utils/result.ts');
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
  
  fs.writeFileSync(resultTypePath, resultTypeContent, 'utf8');
  console.log(`✅ Created Result pattern types: ${path.relative(ROOT_DIR, resultTypePath)}`);
  
  return true;
}

/**
 * Create template files for models, controllers, services
 */
function createTemplates() {
  console.log('Creating template files...');
  
  const templatesDir = path.join(ROOT_DIR, 'src/templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
  // Model template
  const modelTemplatePath = path.join(templatesDir, 'model.template.ts');
  const modelTemplateContent = `import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Base interface (raw data)
 */
export interface I{{ModelName}} {
  // Define model properties here
  name: string;
  description?: string;
  isActive: boolean;
  // Add more properties...
  
  // Common properties
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document interface (base + Document methods)
 */
export interface I{{ModelName}}Document extends Document, I{{ModelName}} {
  // Add document-specific methods here
}

/**
 * Model interface
 */
export interface I{{ModelName}}Model extends mongoose.Model<I{{ModelName}}Document> {
  // Add static model methods here
}

/**
 * Schema definition
 */
const {{modelName}}Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  // Add more fields...
}, { 
  timestamps: true,
  collection: '{{collectionName}}'
});

/**
 * Create and export the model
 */
export const {{ModelName}}Model = mongoose.model<I{{ModelName}}Document, I{{ModelName}}Model>(
  '{{ModelName}}',
  {{modelName}}Schema
);
`;
  
  fs.writeFileSync(modelTemplatePath, modelTemplateContent, 'utf8');
  console.log(`✅ Created model template: ${path.relative(ROOT_DIR, modelTemplatePath)}`);
  
  // Controller template
  const controllerTemplatePath = path.join(templatesDir, 'controller.template.ts');
  const controllerTemplateContent = `import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { {{ModelName}}Model } from '../models/{{modelName}}.model';

/**
 * {{ModelName}} Controller
 */
export class {{ModelName}}Controller {
  /**
   * Get all {{modelNamePlural}}
   */
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {{modelNamePlural}} = await {{ModelName}}Model.find({ isActive: true }).sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        data: {{modelNamePlural}}
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get {{modelName}} by ID
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = new Types.ObjectId(req.params.id);
      const {{modelName}} = await {{ModelName}}Model.findById(id);
      
      if (!{{modelName}}) {
        return res.status(404).json({
          success: false,
          error: '{{ModelName}} not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: {{modelName}}
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Create {{modelName}}
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {{modelName}} = new {{ModelName}}Model(req.body);
      const result = await {{modelName}}.save();
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update {{modelName}}
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = new Types.ObjectId(req.params.id);
      const updates = req.body;
      
      const {{modelName}} = await {{ModelName}}Model.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );
      
      if (!{{modelName}}) {
        return res.status(404).json({
          success: false,
          error: '{{ModelName}} not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: {{modelName}}
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Delete {{modelName}}
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = new Types.ObjectId(req.params.id);
      const {{modelName}} = await {{ModelName}}Model.findByIdAndDelete(id);
      
      if (!{{modelName}}) {
        return res.status(404).json({
          success: false,
          error: '{{ModelName}} not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: '{{ModelName}} deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
`;
  
  fs.writeFileSync(controllerTemplatePath, controllerTemplateContent, 'utf8');
  console.log(`✅ Created controller template: ${path.relative(ROOT_DIR, controllerTemplatePath)}`);
  
  // Service template
  const serviceTemplatePath = path.join(templatesDir, 'service.template.ts');
  const serviceTemplateContent = `import { Injectable } from '../../decorators/injectable.decorator';
import { Types } from 'mongoose';
import { {{ModelName}}Model, I{{ModelName}}, I{{ModelName}}Document } from '../models/{{modelName}}.model';
import { Result, success, failure } from '../../types/utils/result';

/**
 * {{ModelName}} Service
 */
@Injectable()
export class {{ModelName}}Service {
  /**
   * Get all {{modelNamePlural}}
   */
  async getAll(): Promise<Result<I{{ModelName}}Document[]>> {
    try {
      const {{modelNamePlural}} = await {{ModelName}}Model.find({ isActive: true }).sort({ createdAt: -1 });
      return success({{modelNamePlural}});
    } catch (error) {
      return failure(error as Error);
    }
  }
  
  /**
   * Get {{modelName}} by ID
   */
  async getById(id: Types.ObjectId): Promise<Result<I{{ModelName}}Document | null>> {
    try {
      const {{modelName}} = await {{ModelName}}Model.findById(id);
      return success({{modelName}});
    } catch (error) {
      return failure(error as Error);
    }
  }
  
  /**
   * Create {{modelName}}
   */
  async create(data: I{{ModelName}}): Promise<Result<I{{ModelName}}Document>> {
    try {
      const {{modelName}} = new {{ModelName}}Model(data);
      const result = await {{modelName}}.save();
      return success(result);
    } catch (error) {
      return failure(error as Error);
    }
  }
  
  /**
   * Update {{modelName}}
   */
  async update(id: Types.ObjectId, updates: Partial<I{{ModelName}}>): Promise<Result<I{{ModelName}}Document | null>> {
    try {
      const {{modelName}} = await {{ModelName}}Model.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );
      return success({{modelName}});
    } catch (error) {
      return failure(error as Error);
    }
  }
  
  /**
   * Delete {{modelName}}
   */
  async delete(id: Types.ObjectId): Promise<Result<I{{ModelName}}Document | null>> {
    try {
      const {{modelName}} = await {{ModelName}}Model.findByIdAndDelete(id);
      return success({{modelName}});
    } catch (error) {
      return failure(error as Error);
    }
  }
}
`;
  
  fs.writeFileSync(serviceTemplatePath, serviceTemplateContent, 'utf8');
  console.log(`✅ Created service template: ${path.relative(ROOT_DIR, serviceTemplatePath)}`);
  
  return true;
}

/**
 * Create documentation
 */
function createDocumentation() {
  console.log('Creating TypeScript documentation...');
  
  const docPath = path.join(ROOT_DIR, 'TYPESCRIPT-PREVENTION-STRATEGY.md');
  
  // Check if documentation already exists
  if (fs.existsSync(docPath)) {
    console.log(`TypeScript prevention documentation already exists: ${path.relative(ROOT_DIR, docPath)}`);
    return true;
  }
  
  // The content would be copied from the existing implementation
  console.log(`❌ TypeScript prevention documentation not found: ${path.relative(ROOT_DIR, docPath)}`);
  console.log('Please create this file manually or run the appropriate script');
  
  return true;
}

/**
 * Create scripts
 */
function createScripts() {
  console.log('Creating npm scripts...');
  
  try {
    // Read package.json
    const packageJsonPath = path.join(ROOT_DIR, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add or update scripts
    packageJson.scripts = packageJson.scripts || {};
    
    // TypeScript validation scripts
    packageJson.scripts['typecheck:src'] = packageJson.scripts['typecheck:src'] || 
      'tsc --noEmit --skipLibCheck --excludeFiles "src/**/*.test.ts" --excludeFiles "src/tests/**/*.ts"';
    
    packageJson.scripts['typecheck:enhanced'] = packageJson.scripts['typecheck:enhanced'] || 
      'node scripts/typescript-validator.js';
    
    packageJson.scripts['lint:enhanced'] = packageJson.scripts['lint:enhanced'] || 
      'eslint . --ext .ts --config .eslintrc.enhanced.js';
    
    packageJson.scripts['lint:enhanced:fix'] = packageJson.scripts['lint:enhanced:fix'] || 
      'eslint . --ext .ts --config .eslintrc.enhanced.js --fix';
    
    packageJson.scripts['husky:use-enhanced'] = packageJson.scripts['husky:use-enhanced'] || 
      'chmod +x .husky/pre-commit.enhanced && cp .husky/pre-commit.enhanced .husky/pre-commit';
    
    packageJson.scripts['check:code-quality'] = packageJson.scripts['check:code-quality'] || 
      'node scripts/typescript-validator.js';
    
    // Update package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log(`✅ Updated npm scripts in: ${path.relative(ROOT_DIR, packageJsonPath)}`);
    
    return true;
  } catch (error) {
    console.error('Error updating package.json:', error);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔧 Setting up TypeScript Error Prevention System');
  console.log('================================================');
  
  let success = true;
  
  // Setup steps
  success = installDependencies() && success;
  success = setupESLintConfig() && success;
  success = setupHusky() && success;
  success = createTypeScriptValidator() && success;
  success = createTypeDirectories() && success;
  success = createTemplates() && success;
  success = createDocumentation() && success;
  success = createScripts() && success;
  
  if (success) {
    console.log('\n✅ TypeScript Error Prevention System set up successfully!');
    console.log('\nNext steps:');
    console.log('1. Run npm run husky:use-enhanced to activate the TypeScript validation pre-commit hook');
    console.log('2. Run npm run check:code-quality to check TypeScript compliance');
    console.log('3. Run npm run lint:enhanced to lint with enhanced TypeScript rules');
  } else {
    console.log('\n⚠️ Setup completed with some issues. Please review the messages above.');
  }
}

// Run the script
main();