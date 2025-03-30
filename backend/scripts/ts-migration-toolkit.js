#!/usr/bin/env node
/**
 * TypeScript Migration Toolkit
 * 
 * A comprehensive toolkit for fixing common TypeScript issues based on our experience
 * with the Fluxori-V2 backend TypeScript migration.
 * 
 * Run with one of the following commands:
 * - node scripts/ts-migration-toolkit.js --all
 * - node scripts/ts-migration-toolkit.js --fix=mongoose
 * - node scripts/ts-migration-toolkit.js --fix=express
 * - node scripts/ts-migration-toolkit.js --fix=async
 * - node scripts/ts-migration-toolkit.js --fix=errors
 * - node scripts/ts-migration-toolkit.js --analyze
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Utility functions
const utils = {
  findFiles: (patterns) => {
    let files = [];
    for (const pattern of patterns) {
      const matches = glob.sync(pattern, { cwd: process.cwd() });
      files = [...files, ...matches];
    }
    return [...new Set(files)]; // Remove duplicates
  },
  
  countTsErrors: () => {
    try {
      const result = execSync('npx tsc --noEmit 2>&1 | grep -c "error TS"', { encoding: 'utf8' });
      return parseInt(result.trim());
    } catch (error) {
      // The command exits with error if there are TypeScript errors
      if (error.stdout) {
        return parseInt(error.stdout.trim());
      }
      console.error('Failed to count TypeScript errors:', error);
      return 0;
    }
  },
  
  countTsErrorsByPattern: (pattern) => {
    try {
      const result = execSync(`npx tsc --noEmit 2>&1 | grep "error TS" | grep -c "${pattern}"`, { encoding: 'utf8' });
      return parseInt(result.trim());
    } catch (error) {
      if (error.stdout) {
        return parseInt(error.stdout.trim());
      }
      // If no matches, return 0
      return 0;
    }
  }
};

// Fix modules
const fixers = {
  // Fix Route Test Files
  routeTests: {
    name: 'Route Test Files',
    description: 'Fixes TypeScript issues in route test files',
    patterns: [
      'src/routes/*.routes.test.ts'
    ],
    fixes: [
      {
        name: 'Import statements',
        matcher: /import request from 'supertest';\nimport app from '\.\.\/app';\nimport mongoose from 'mongoose';\nimport jwt from 'jsonwebtoken';\nimport config from '\.\.\/config';/g,
        replacer: `import * as request from 'supertest';
import { Express } from 'express';
import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as config from '../config';

// Import app but handle type issues
const app = require('../app').default;`
      },
      {
        name: 'Mock model setup',
        matcher: /jest\.mock\('\.\.\/models\/(\w+)\.model', \(\) => \({\n  find: jest\.fn\(\),\n  findById: jest\.fn\(\),\n  create: jest\.fn\(\),\n  findByIdAndUpdate: jest\.fn\(\),\n  findByIdAndDelete: jest\.fn\(\)\n}\)\);/g,
        replacer: `jest.mock('../models/$1.model', () => ({
  __esModule: true,
  default: {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([])
  }
}));`
      }
    ]
  },
  
  // Fix Mongoose ObjectId issues
  mongoose: {
    name: 'Mongoose ObjectId',
    description: 'Fixes MongoDB ObjectId typing issues in the codebase',
    patterns: [
      'src/modules/**/*.ts',
      'src/models/**/*.ts',
      'src/services/**/*.ts',
      'src/controllers/**/*.ts'
    ],
    fixes: [
      {
        name: 'Direct ID assignment',
        matcher: /(\w+)\.(id|userId|organizationId|customerId|productId|orderId|shipmentId)\s*=\s*(?!new mongoose\.Types\.ObjectId)(['"][^'"]+['"]|\w+);/g,
        replacer: (match, obj, idType, value) => {
          if (match.includes('mongoose.Types.ObjectId')) return match;
          return `${obj}.${idType} = new mongoose.Types.ObjectId(${value});`;
        }
      },
      {
        name: 'ObjectId in document creation',
        matcher: /new\s+(\w+)\(\s*{[^}]*?(\w+Id):\s*(?!new mongoose\.Types\.ObjectId)(['"][^'"]+['"]|\w+)/g,
        replacer: (match, model, idField, value) => {
          if (value === 'null' || value === 'undefined' || match.includes('mongoose.Types.ObjectId')) {
            return match;
          }
          return match.replace(idField + ':', `${idField}: new mongoose.Types.ObjectId(`).replace(value, `${value})`);
        }
      },
      {
        name: 'ObjectId to ObjectId assignment',
        matcher: /(\w+)\._id\s*=\s*(\w+)\._id;/g,
        replacer: '$1._id = $2._id as unknown as mongoose.Types.ObjectId;'
      },
      {
        name: 'Missing ObjectId import',
        matcher: /import\s+\*\s+as\s+mongoose\s+from\s+['"]mongoose['"];(?!\s+import\s+{\s*(?:[^{}]*,\s*)?(ObjectId|Types))/g,
        replacer: 'import * as mongoose from \'mongoose\';\nimport { Types, ObjectId } from \'mongoose\';'
      }
    ]
  },
  
  // Fix Express request type issues
  express: {
    name: 'Express Request Types',
    description: 'Fixes Express request typing issues in controllers and routes',
    patterns: [
      'src/controllers/**/*.ts',
      'src/routes/**/*.ts',
      'src/middleware/**/*.ts',
      'src/modules/*/controllers/**/*.ts',
      'src/modules/*/routes/**/*.ts'
    ],
    fixes: [
      {
        name: 'Missing Express type imports',
        matcher: /import\s+{\s*(Router|Application)[,\s]*}(?!\s*,\s*{\s*(?:[^{}]*,\s*)?(Request|Response|NextFunction))/g,
        replacer: 'import { $1, Request, Response, NextFunction }'
      },
      {
        name: 'Improper AuthenticatedRequest interface',
        matcher: /interface\s+(\w+Request)\s+extends\s+Request\s*{([^}]*)}/g,
        replacer: 'type $1 = Request & {$2}'
      },
      {
        name: 'Unchecked req.user access',
        matcher: /req\.user\.(id|organizationId|email|role)(?!\?)/g,
        replacer: 'req.user?.$1'
      }
    ],
    customFixes: [
      {
        name: 'Add AuthenticatedRequest type',
        apply: (content, filePath) => {
          if (content.includes('req.user') && 
              !content.includes('AuthenticatedRequest') && 
              content.includes('express')) {
            
            // Find a good position to add the type
            const lastImport = content.lastIndexOf('import');
            if (lastImport !== -1) {
              const insertPos = content.indexOf(';', lastImport) + 1;
              const authType = `\n\n// Authenticated request type\ntype AuthenticatedRequest = Request & {\n  user?: {\n    id: string;\n    organizationId: string;\n    email?: string;\n    role?: string;\n  };\n};`;
              return content.slice(0, insertPos) + authType + content.slice(insertPos);
            }
          }
          return content;
        }
      }
    ]
  },
  
  // Fix async/Promise typing issues
  async: {
    name: 'Async/Promise Types',
    description: 'Fixes async function return types and Promise handling',
    patterns: [
      'src/modules/**/*.ts',
      'src/services/**/*.ts',
      'src/controllers/**/*.ts'
    ],
    fixes: [
      {
        name: 'Missing async function return type',
        matcher: /async\s+function\s+(\w+)\s*\([^)]*\)\s*{\s*(?!Promise<)/g,
        replacer: (match, funcName) => {
          // Determine return type from function body
          const returnType = match.includes('return') ? 'Promise<any>' : 'Promise<void>';
          return match.replace('{', `: ${returnType} {`);
        }
      },
      {
        name: 'Missing async method return type',
        matcher: /async\s+(\w+)\s*\([^)]*\)\s*{\s*(?!Promise<)/g,
        replacer: (match, methodName) => {
          // Skip constructor method
          if (methodName === 'constructor') return match;
          
          // Determine return type from method body
          const returnType = match.includes('return') ? 'Promise<any>' : 'Promise<void>';
          return match.replace('{', `: ${returnType} {`);
        }
      },
      {
        name: 'Missing Promise generic parameter',
        matcher: /Promise(?!<)/g,
        replacer: 'Promise<any>'
      }
    ]
  },
  
  // Fix error handling patterns
  errors: {
    name: 'Error Handling Patterns',
    description: 'Implements proper TypeScript error handling patterns',
    patterns: [
      'src/modules/**/*.ts',
      'src/services/**/*.ts',
      'src/controllers/**/*.ts'
    ],
    fixes: [
      {
        name: 'Untyped catch error',
        matcher: /catch\s*\(\s*error\s*\)\s*{(?![^}]*instanceof)/g,
        replacer: 'catch (error) {\n    const errorMessage = error instanceof Error ? error.message : String(error);'
      },
      {
        name: 'Direct error message access',
        matcher: /error\.message(?!\s*\?\?)/g,
        replacer: '(error instanceof Error ? error.message : String(error))'
      },
      {
        name: 'Untyped error throwing',
        matcher: /throw\s+error;/g,
        replacer: 'throw error instanceof Error ? error : new Error(String(error));'
      }
    ]
  }
};

// Analysis function
function analyzeTypeScriptErrors() {
  console.log(chalk.bold.blue('Analyzing TypeScript errors...'));
  
  // Count total errors
  const totalErrors = utils.countTsErrors();
  console.log(chalk.blue(`Total TypeScript errors: ${totalErrors}`));
  
  // Analyze by error type
  console.log(chalk.blue('\nErrors by category:'));
  const categories = [
    { name: 'ObjectId issues', pattern: 'ObjectId' },
    { name: 'Type assertion issues', pattern: 'as' },
    { name: 'Property access issues', pattern: 'Property' },
    { name: 'Missing return type', pattern: 'return' },
    { name: 'Interface issues', pattern: 'Interface' },
    { name: 'Import issues', pattern: 'import' },
    { name: 'Parameter issues', pattern: 'Parameter' }
  ];
  
  for (const category of categories) {
    const count = utils.countTsErrorsByPattern(category.pattern);
    const percentage = totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0;
    console.log(chalk.blue(`  - ${category.name}: ${count} (${percentage}%)`));
  }
  
  // Recommend fixers based on analysis
  console.log(chalk.blue('\nRecommended fixers based on analysis:'));
  
  const objectIdIssues = utils.countTsErrorsByPattern('ObjectId');
  if (objectIdIssues > 0) {
    console.log(chalk.green('  - Run mongoose fixer: node scripts/ts-migration-toolkit.js --fix=mongoose'));
  }
  
  const requestIssues = utils.countTsErrorsByPattern('Request');
  if (requestIssues > 0) {
    console.log(chalk.green('  - Run express fixer: node scripts/ts-migration-toolkit.js --fix=express'));
  }
  
  const promiseIssues = utils.countTsErrorsByPattern('Promise');
  if (promiseIssues > 0) {
    console.log(chalk.green('  - Run async fixer: node scripts/ts-migration-toolkit.js --fix=async'));
  }
  
  const errorIssues = utils.countTsErrorsByPattern('Error');
  if (errorIssues > 0) {
    console.log(chalk.green('  - Run error fixer: node scripts/ts-migration-toolkit.js --fix=errors'));
  }
  
  console.log(chalk.green('  - Run all fixers: node scripts/ts-migration-toolkit.js --all'));
}

// Apply fixes for a specific module
function applyFixes(fixer) {
  console.log(chalk.bold.blue(`Applying ${fixer.name} fixes...`));
  
  const files = utils.findFiles(fixer.patterns);
  console.log(chalk.blue(`Found ${files.length} files to process`));
  
  let filesModified = 0;
  let fixesApplied = 0;
  
  for (const filePath of files) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      let fileFixCount = 0;
      
      // Apply regex fixes
      for (const fix of fixer.fixes || []) {
        let beforeFix = content;
        content = content.replace(fix.matcher, fix.replacer);
        
        if (beforeFix !== content) {
          const matches = (beforeFix.match(fix.matcher) || []).length;
          fileFixCount += matches;
          console.log(chalk.green(`  - Applied ${fix.name} to ${filePath}: ${matches} matches`));
        }
      }
      
      // Apply custom fixes
      for (const customFix of fixer.customFixes || []) {
        let beforeFix = content;
        content = customFix.apply(content, filePath);
        
        if (beforeFix !== content) {
          fileFixCount++;
          console.log(chalk.green(`  - Applied ${customFix.name} to ${filePath}`));
        }
      }
      
      // Save if modified
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        filesModified++;
        fixesApplied += fileFixCount;
        console.log(chalk.green(`✓ Modified ${filePath} with ${fileFixCount} fixes`));
      }
    } catch (error) {
      console.error(chalk.red(`Error processing ${filePath}:`), error);
    }
  }
  
  console.log(chalk.bold.green(`\n${fixer.name} fixes completed!`));
  console.log(chalk.green(`Files modified: ${filesModified}`));
  console.log(chalk.green(`Fixes applied: ${fixesApplied}`));
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  // Check for specific fix command
  const fixArg = args.find(arg => arg.startsWith('--fix='));
  if (fixArg) {
    const fixerName = fixArg.split('=')[1];
    const fixer = fixers[fixerName];
    
    if (fixer) {
      console.log(chalk.bold.blue(`Running ${fixer.name} fixer...`));
      console.log(chalk.blue(fixer.description));
      applyFixes(fixer);
    } else {
      console.error(chalk.red(`Unknown fixer: ${fixerName}`));
      console.log(chalk.yellow('Available fixers:'));
      Object.keys(fixers).forEach(name => {
        console.log(chalk.yellow(`  - ${name}: ${fixers[name].description}`));
      });
    }
    return;
  }
  
  // Run analysis
  if (args.includes('--analyze')) {
    analyzeTypeScriptErrors();
    return;
  }
  
  // Run all fixers
  if (args.includes('--all')) {
    console.log(chalk.bold.blue('Running all TypeScript fixers...'));
    
    // Count errors before
    const errorsBefore = utils.countTsErrors();
    console.log(chalk.blue(`TypeScript errors before: ${errorsBefore}`));
    
    // Run each fixer
    for (const [name, fixer] of Object.entries(fixers)) {
      console.log(chalk.bold.blue(`\nRunning ${fixer.name} fixer...`));
      applyFixes(fixer);
    }
    
    // Count errors after
    const errorsAfter = utils.countTsErrors();
    console.log(chalk.bold.green(`\nAll fixers completed!`));
    console.log(chalk.green(`TypeScript errors before: ${errorsBefore}`));
    console.log(chalk.green(`TypeScript errors after: ${errorsAfter}`));
    console.log(chalk.green(`Errors fixed: ${errorsBefore - errorsAfter}`));
    return;
  }
  
  // Show help
  console.log(chalk.bold.blue('TypeScript Migration Toolkit'));
  console.log(chalk.blue('A comprehensive toolkit for fixing common TypeScript issues'));
  console.log(chalk.blue('\nUsage:'));
  console.log(chalk.yellow('  node scripts/ts-migration-toolkit.js --all'));
  console.log(chalk.yellow('  node scripts/ts-migration-toolkit.js --fix=mongoose'));
  console.log(chalk.yellow('  node scripts/ts-migration-toolkit.js --fix=express'));
  console.log(chalk.yellow('  node scripts/ts-migration-toolkit.js --fix=async'));
  console.log(chalk.yellow('  node scripts/ts-migration-toolkit.js --fix=errors'));
  console.log(chalk.yellow('  node scripts/ts-migration-toolkit.js --analyze'));
  
  console.log(chalk.blue('\nAvailable fixers:'));
  Object.entries(fixers).forEach(([name, fixer]) => {
    console.log(chalk.yellow(`  - ${name}: ${fixer.description}`));
  });
}

// Run the script
main();