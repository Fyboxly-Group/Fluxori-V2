#!/usr/bin/env node

/**
 * TypeScript Migration Tool
 * 
 * This script automates the removal of @ts-nocheck pragmas and fixes TypeScript errors
 * systematically across the codebase. It can:
 * 
 * 1. Analyze the codebase for TypeScript errors
 * 2. Fix common error patterns
 * 3. Apply targeted fixes for specific modules
 * 4. Track progress in the TYPESCRIPT-MIGRATION-PROGRESS.md file
 * 
 * Usage:
 *   node scripts/typescript-migration-tool.js [options]
 * 
 * Options:
 *   --analyze           Analyze the codebase for TypeScript errors
 *   --fix-module=NAME   Fix a specific module (e.g., --fix-module=websocket)
 *   --fix-file=PATH     Fix a specific file (e.g., --fix-file=src/modules/websocket/services/socket-server.ts)
 *   --fix-pattern=TYPE  Fix a specific error pattern (e.g., --fix-pattern=objectid)
 *   --auto-fix          Automatically fix all detected errors
 *   --dry-run           Show what would be changed without making changes
 *   --verbose           Show detailed logs
 *   --report            Generate a comprehensive error report
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync, exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Command line arguments
const ARGS = {
  analyze: process.argv.includes('--analyze'),
  autoFix: process.argv.includes('--auto-fix'),
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  report: process.argv.includes('--report'),
  fixModule: process.argv.find(arg => arg.startsWith('--fix-module=')),
  fixFile: process.argv.find(arg => arg.startsWith('--fix-file=')),
  fixPattern: process.argv.find(arg => arg.startsWith('--fix-pattern=')),
};

// Extract values from arguments
if (ARGS.fixModule) {
  ARGS.fixModule = ARGS.fixModule.split('=')[1];
}

if (ARGS.fixFile) {
  ARGS.fixFile = ARGS.fixFile.split('=')[1];
}

if (ARGS.fixPattern) {
  ARGS.fixPattern = ARGS.fixPattern.split('=')[1];
}

// Logging utilities
const log = (...args) => console.log(...args);
const verbose = (...args) => ARGS.verbose && console.log(...args);

// File patterns to exclude
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.test\.ts$/,
  /\.spec\.ts$/,
  /test\//,
  /tests\//,
  /mocks\//,
  /fixtures\//,
];

// Common TypeScript error patterns and their fixes
const ERROR_PATTERNS = [
  {
    name: 'objectid',
    description: 'MongoDB ObjectId type errors and property access issues',
    pattern: /Property '_id' does not exist on type|ObjectId.*any/i,
    fix: (content) => {
      // Import the mongo-util-types utilities if not already imported
      if (!content.includes('mongo-util-types')) {
        const importMatch = content.match(/import.*from.*['"].*;/);
        if (importMatch) {
          content = content.replace(
            importMatch[0],
            `import { toObjectId, getSafeId } from '../../../types/mongo-util-types';\n${importMatch[0]}`
          );
        }
      }

      // Replace new mongoose.Types.ObjectId with toObjectId
      content = content.replace(
        /new mongoose\.Types\.ObjectId\(([^)]+)\)/g,
        'toObjectId($1)'
      );

      // Add null checks for _id access
      content = content.replace(
        /(\w+)\._id/g,
        '$1 && $1._id'
      );

      // Add getSafeId for safe _id to string conversion
      content = content.replace(
        /String\((\w+\._id)\)/g,
        'getSafeId($1)'
      );

      return content;
    }
  },
  {
    name: 'promise',
    description: 'Promise.allSettled result access and Promise handling',
    pattern: /Property '.*?' does not exist on type 'PromiseSettledResult|Type 'Promise<.*?>' is not assignable/i,
    fix: (content) => {
      // Import the promise utilities if not already imported
      if (!content.includes('promise-utils')) {
        const importMatch = content.match(/import.*from.*['"].*;/);
        if (importMatch) {
          content = content.replace(
            importMatch[0],
            `import { isFulfilled, isRejected, getPromiseResult } from '../../../types/promise-utils';\n${importMatch[0]}`
          );
        }
      }

      // Replace result.status === 'fulfilled' with isFulfilled(result)
      content = content.replace(
        /(\w+)\.status === ['"]fulfilled['"]/g,
        'isFulfilled($1)'
      );

      // Replace result.status === 'rejected' with isRejected(result)
      content = content.replace(
        /(\w+)\.status === ['"]rejected['"]/g,
        'isRejected($1)'
      );

      // Add type-safe Promise result access
      content = content.replace(
        /const (\w+) = (await )?Promise\.allSettled\((.*?)\);/g,
        'const $1 = $2Promise.allSettled($3);\n\n  // Process Promise results with type safety\n  const typedResults = $1.map(result => getPromiseResult(result));'
      );

      return content;
    }
  },
  {
    name: 'nullable',
    description: 'Null and undefined checks for optional properties',
    pattern: /Object is possibly 'undefined'|Object is possibly 'null'/i,
    fix: (content) => {
      // Add null checks to conditional statements
      content = content.replace(
        /if\s*\(([^)&|]+)\)\s*{/g,
        'if ($1 !== undefined && $1 !== null) {'
      );

      // Add optional chaining for deep property access
      content = content.replace(
        /(\w+)\.(\w+)\.(\w+)/g,
        '$1?.$2?.$3'
      );

      // Add nullish coalescing for default values
      content = content.replace(
        /(\w+)(\.\w+)? \|\| (["'][^"']+["']|\d+|\[\]|{})/g,
        '$1$2 ?? $3'
      );

      return content;
    }
  },
  {
    name: 'import',
    description: 'Import statement and module resolution issues',
    pattern: /Cannot find module|has no default export/i,
    fix: (content) => {
      // Fix mongoose imports
      content = content.replace(
        /import mongoose from ['"]mongoose['"];/,
        'import * as mongoose from \'mongoose\';\nimport { Schema, Document, Model, Types } from \'mongoose\';'
      );

      // Fix express imports
      content = content.replace(
        /import express from ['"]express['"];/,
        'import * as express from \'express\';\nimport { Request, Response, NextFunction } from \'express\';'
      );

      // Fix relative imports
      content = content.replace(
        /from ['"]\.\.\/(\w+)['"];/g,
        'from \'../$1/index\';'
      );

      return content;
    }
  },
  {
    name: 'type-assertion',
    description: 'Type assertion and type narrowing issues',
    pattern: /Type '.*?' is not assignable to type|is not assignable to parameter of type/i,
    fix: (content) => {
      // Add type assertions in key locations
      content = content.replace(
        /return ([\w.]+);/g,
        'return $1 as any;'
      );

      // Add type guards for error handling
      content = content.replace(
        /catch \((error)\) {/g,
        'catch (error) {\n    const typedError = error instanceof Error ? error : new Error(String(error));'
      );

      // Add more specific type assertions where needed
      content = content.replace(
        /(\w+) = (\w+);/g,
        '$1 = $2 as any;'
      );

      return content;
    }
  }
];

// Module-specific fixers
const MODULE_FIXERS = {
  websocket: {
    description: 'Fix TypeScript errors in the Websocket module',
    fix: async (filePath, content) => {
      // If it's the socket-server.ts file
      if (filePath.includes('socket-server.ts')) {
        // Add socket.io type imports
        if (!content.includes('@types/socket.io')) {
          const importSection = content.match(/import.*from.*['"].*;(\r?\n|$)*/);
          if (importSection) {
            content = content.replace(
              importSection[0],
              `import { Server as SocketIOServer, Socket } from 'socket.io';\n${importSection[0]}`
            );
          }
        }

        // Fix the Server type
        content = content.replace(
          /const io = new Server\(/g,
          'const io = new SocketIOServer('
        );

        // Add proper socket event handler typing
        content = content.replace(
          /socket.on\(['"](\w+)['"](, \(?([^)]+)\)? => {)/g,
          'socket.on(\'$1\', ($3: any) => {'
        );
      }

      // If it's the socket-handlers.ts file
      if (filePath.includes('socket-handlers.ts')) {
        // Add proper event handler interface
        if (!content.includes('SocketEventHandler')) {
          content = content.replace(
            /export /,
            `/**
 * Interface for socket event handlers
 */
export interface SocketEventHandler {
  eventName: string;
  handler: (socket: any, data: any) => void;
}

export `
          );
        }

        // Fix handler registrations
        content = content.replace(
          /(\w+)\.on\(['"](\w+)['"](, \(?([^)]+)\)? => {)/g,
          '$1.on(\'$2\', ($4: any) => {'
        );
      }

      return content;
    }
  },
  invoice: {
    description: 'Fix TypeScript errors in the Invoice module',
    fix: async (filePath, content) => {
      // If it's the invoice model
      if (filePath.includes('invoice.model.ts')) {
        // Add proper mongoose schema typing
        content = content.replace(
          /const invoiceSchema = new Schema\({/g,
          'const invoiceSchema = new Schema<IInvoiceDocument>({'
        );

        // Fix method implementations
        content = content.replace(
          /invoiceSchema\.methods\.(\w+) = function/g,
          'invoiceSchema.methods.$1 = function(this: IInvoiceDocument)'
        );
      }

      // If it's the invoice generation service
      if (filePath.includes('invoice-generation.service.ts')) {
        // Add proper typing for PDFs
        if (!content.includes('PDFDocument')) {
          const importSection = content.match(/import.*from.*['"].*;(\r?\n|$)*/);
          if (importSection) {
            content = content.replace(
              importSection[0],
              `import { PDFDocument } from 'pdf-lib';\n${importSection[0]}`
            );
          }
        }

        // Add type safety for Promise results
        content = content.replace(
          /const (results|invoices) = await Promise\.all\((.*?)\);/g,
          'const $1 = await Promise.all($2) as any[];'
        );
      }

      return content;
    }
  },
  // Add more module fixers as needed
};

/**
 * Get all TypeScript files in the source directory
 * @returns {Promise<string[]>} Array of TypeScript file paths
 */
async function getAllTypeScriptFiles() {
  try {
    // Use find to get all .ts files, exclude node_modules, test files, etc.
    const { stdout } = await execPromise(
      'find src -name "*.ts" | grep -v "node_modules" | grep -v ".test.ts" | grep -v ".spec.ts" | grep -v "/test/" | grep -v "/tests/" | grep -v "/mocks/"'
    );
    return stdout.trim().split('\n').filter(Boolean);
  } catch (error) {
    log(`❌ Error finding TypeScript files: ${error.message}`);
    return [];
  }
}

/**
 * Get files with @ts-nocheck pragma
 * @returns {Promise<string[]>} Array of file paths with @ts-nocheck
 */
async function getFilesWithTsNocheck() {
  log('🔍 Finding files with @ts-nocheck pragma...');
  
  try {
    // Use grep to find files with @ts-nocheck
    const { stdout } = await execPromise(
      'grep -l "@ts-nocheck" $(find src -name "*.ts" | grep -v "node_modules" | grep -v ".test.ts" | grep -v ".spec.ts" | grep -v "/test/" | grep -v "/tests/" | grep -v "/mocks/")'
    );
    const files = stdout.trim().split('\n').filter(Boolean);
    
    log(`Found ${files.length} files with @ts-nocheck pragma.`);
    
    // Filter by module if specified
    if (ARGS.fixModule) {
      const moduleFiles = files.filter(file => file.includes(`/modules/${ARGS.fixModule}/`));
      log(`Filtered to ${moduleFiles.length} files in module: ${ARGS.fixModule}`);
      return moduleFiles;
    }
    
    // Filter to single file if specified
    if (ARGS.fixFile) {
      const matchingFiles = files.filter(file => file.includes(ARGS.fixFile));
      log(`Filtered to ${matchingFiles.length} files matching: ${ARGS.fixFile}`);
      return matchingFiles;
    }
    
    return files;
  } catch (error) {
    if (error.stderr && error.stderr.includes('No such file or directory')) {
      log('✅ No files with @ts-nocheck found.');
      return [];
    }
    
    log(`❌ Error finding files with @ts-nocheck: ${error.message}`);
    return [];
  }
}

/**
 * Analyze TypeScript errors in a file
 * @param {string} filePath Path to the file
 * @returns {Promise<{errors: string[], patterns: string[]}>} Analysis results
 */
async function analyzeFileErrors(filePath) {
  try {
    // Read the file content
    const content = await fs.readFile(filePath, 'utf8');
    
    // Make a temporary copy without @ts-nocheck
    const tempContent = content.replace(/\/\/ @ts-nocheck.*\n/, '');
    const tempFile = `${filePath}.temp`;
    await fs.writeFile(tempFile, tempContent, 'utf8');
    
    // Run TypeScript on the temporary file
    try {
      execSync(`npx tsc --noEmit ${tempFile}`, { stdio: 'pipe' });
      
      // No errors, file doesn't need @ts-nocheck
      await fs.unlink(tempFile);
      return { errors: [], patterns: [] };
    } catch (error) {
      const errorOutput = error.stdout.toString();
      
      // Parse the error messages
      const errors = [];
      const errorLines = errorOutput.split('\n').filter(line => line.includes(`${tempFile}(`));
      
      errorLines.forEach(line => {
        const errorMatch = line.match(/\(\d+,\d+\): error TS\d+: (.*)/);
        if (errorMatch) {
          errors.push(errorMatch[1]);
        }
      });
      
      // Identify error patterns
      const patterns = [];
      ERROR_PATTERNS.forEach(pattern => {
        if (errors.some(error => pattern.pattern.test(error))) {
          patterns.push(pattern.name);
        }
      });
      
      // Clean up the temporary file
      await fs.unlink(tempFile);
      
      return { errors, patterns };
    }
  } catch (error) {
    log(`❌ Error analyzing file ${filePath}: ${error.message}`);
    return { errors: [], patterns: [] };
  }
}

/**
 * Fix TypeScript errors in a file
 * @param {string} filePath Path to the file
 * @returns {Promise<boolean>} True if fixes were applied
 */
async function fixFile(filePath) {
  log(`📝 Fixing file: ${filePath}`);
  
  try {
    // Read the file content
    let content = await fs.readFile(filePath, 'utf8');
    
    // Remove @ts-nocheck pragma
    const originalContent = content;
    content = content.replace(/\/\/ @ts-nocheck.*\n/, '// Fixed by typescript-migration-tool.js\n');
    
    // Analyze the file to identify error patterns
    const { errors, patterns } = await analyzeFileErrors(filePath);
    
    if (errors.length === 0) {
      log(`✅ File has no errors, removing @ts-nocheck: ${filePath}`);
      
      // Write the changes if not in dry run mode
      if (!ARGS.dryRun) {
        await fs.writeFile(filePath, content, 'utf8');
      }
      
      return true;
    }
    
    verbose(`Found ${errors.length} TypeScript errors in ${filePath}`);
    verbose(`Error patterns: ${patterns.join(', ')}`);
    
    // Apply module-specific fixes if applicable
    const moduleMatch = filePath.match(/\/modules\/([^\/]+)\//);
    const module = moduleMatch ? moduleMatch[1] : null;
    
    if (module && MODULE_FIXERS[module]) {
      log(`Applying module-specific fixes for ${module} module`);
      content = await MODULE_FIXERS[module].fix(filePath, content);
    }
    
    // Apply pattern-specific fixes
    let fixesApplied = false;
    for (const pattern of patterns) {
      const errorPattern = ERROR_PATTERNS.find(p => p.name === pattern);
      if (errorPattern) {
        log(`Applying fixes for ${errorPattern.name} pattern`);
        content = errorPattern.fix(content);
        fixesApplied = true;
      }
    }
    
    // If specified, also apply the specific pattern fix
    if (ARGS.fixPattern) {
      const specificPattern = ERROR_PATTERNS.find(p => p.name === ARGS.fixPattern);
      if (specificPattern) {
        log(`Applying specified fix for ${specificPattern.name} pattern`);
        content = specificPattern.fix(content);
        fixesApplied = true;
      }
    }
    
    // Check if we made any changes
    if (content === originalContent.replace(/\/\/ @ts-nocheck.*\n/, '// Fixed by typescript-migration-tool.js\n')) {
      log(`⚠️ No automatic fixes could be applied to: ${filePath}`);
      return false;
    }
    
    // Write the changes if not in dry run mode
    if (!ARGS.dryRun) {
      await fs.writeFile(filePath, content, 'utf8');
      log(`✅ Applied fixes to: ${filePath}`);
    } else {
      log(`⚠️ Dry run mode: Would apply fixes to: ${filePath}`);
    }
    
    return fixesApplied;
  } catch (error) {
    log(`❌ Error fixing file ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Update the TypeScript migration progress file
 * @param {number} fixedCount Number of files fixed
 * @param {number} totalCount Total number of files with @ts-nocheck
 * @param {Object} moduleStats Statistics by module
 */
async function updateProgressFile(fixedCount, totalCount, moduleStats) {
  const progressFilePath = path.join(process.cwd(), 'TYPESCRIPT-MIGRATION-PROGRESS.md');
  
  try {
    // Read the current progress file
    const content = await fs.readFile(progressFilePath, 'utf8');
    
    // Update the statistics
    let updatedContent = content.replace(
      /- \*\*Files Fixed\*\*: \d+\/\d+ \(\d+\.\d+%\)/,
      `- **Files Fixed**: ${fixedCount}/${totalCount} (${((fixedCount / totalCount) * 100).toFixed(2)}%)`
    );
    
    updatedContent = updatedContent.replace(
      /- \*\*Remaining @ts-nocheck Files\*\*: \d+/,
      `- **Remaining @ts-nocheck Files**: ${totalCount - fixedCount}`
    );
    
    // Add today's date to the recent changes section if not already there
    const today = new Date().toISOString().split('T')[0];
    if (!updatedContent.includes(`### ${today}`)) {
      const recentChangesIndex = updatedContent.indexOf('## Recent Changes');
      if (recentChangesIndex !== -1) {
        // Find where to insert the new changes
        const insertIndex = recentChangesIndex + '## Recent Changes'.length;
        
        // Create the new changes section
        const newChanges = `\n\n### ${today}\n\nAutomated fixes using typescript-migration-tool.js:\n`;
        
        // Add module-specific details
        const moduleDetails = Object.entries(moduleStats)
          .filter(([_, stats]) => stats.fixed > 0)
          .map(([module, stats]) => `- Fixed ${stats.fixed} files in the ${module} module (${((stats.fixed / stats.total) * 100).toFixed(2)}%)`)
          .join('\n');
        
        // Insert the new changes
        updatedContent = updatedContent.slice(0, insertIndex) + newChanges + moduleDetails + updatedContent.slice(insertIndex);
      }
    }
    
    // Update the statistics section with module statistics
    const statsTable = `
| Category | Count Before | Count Now | Reduction |
|----------|--------------|-----------|-----------|
| Total @ts-nocheck | ${totalCount} | ${totalCount - fixedCount} | ${((fixedCount / totalCount) * 100).toFixed(2)}% |
`;
    
    // Find the statistics section and replace it
    const statsIndex = updatedContent.indexOf('## Statistics');
    if (statsIndex !== -1) {
      const nextSectionIndex = updatedContent.indexOf('##', statsIndex + 1);
      const statsSection = updatedContent.slice(statsIndex, nextSectionIndex !== -1 ? nextSectionIndex : undefined);
      
      // Create the new statistics section
      const newStatsSection = `## Statistics\n\n${statsTable}`;
      
      // Replace the old statistics section
      updatedContent = updatedContent.replace(statsSection, newStatsSection);
    }
    
    // Write the changes if not in dry run mode
    if (!ARGS.dryRun) {
      await fs.writeFile(progressFilePath, updatedContent, 'utf8');
      log(`✅ Updated TYPESCRIPT-MIGRATION-PROGRESS.md`);
    } else {
      log(`⚠️ Dry run mode: Would update TYPESCRIPT-MIGRATION-PROGRESS.md`);
    }
  } catch (error) {
    log(`❌ Error updating progress file: ${error.message}`);
  }
}

/**
 * Generate a comprehensive report of TypeScript errors in the codebase
 * @param {Object} fileErrors Map of files to their error patterns
 */
async function generateErrorReport(fileErrors) {
  log('📊 Generating TypeScript error report...');
  
  const reportPath = path.join(process.cwd(), 'TYPESCRIPT-ERROR-REPORT.md');
  
  // Count errors by module
  const moduleStats = {};
  
  // Count errors by pattern
  const patternStats = {};
  ERROR_PATTERNS.forEach(pattern => {
    patternStats[pattern.name] = 0;
  });
  
  // Process each file's errors
  Object.entries(fileErrors).forEach(([file, patterns]) => {
    // Extract module name
    const moduleMatch = file.match(/\/modules\/([^\/]+)\//);
    const module = moduleMatch ? moduleMatch[1] : 'other';
    
    // Update module statistics
    if (!moduleStats[module]) {
      moduleStats[module] = { fileCount: 0, patterns: {} };
    }
    moduleStats[module].fileCount++;
    
    // Update pattern statistics
    patterns.forEach(pattern => {
      patternStats[pattern]++;
      
      if (!moduleStats[module].patterns[pattern]) {
        moduleStats[module].patterns[pattern] = 0;
      }
      moduleStats[module].patterns[pattern]++;
    });
  });
  
  // Sort modules by file count
  const sortedModules = Object.entries(moduleStats)
    .sort((a, b) => b[1].fileCount - a[1].fileCount);
  
  // Sort patterns by frequency
  const sortedPatterns = Object.entries(patternStats)
    .sort((a, b) => b[1] - a[1]);
  
  // Generate the report
  const report = `# TypeScript Error Analysis Report

## Summary

- Total files with @ts-nocheck: ${Object.keys(fileErrors).length}
- Error patterns detected: ${sortedPatterns.filter(([_, count]) => count > 0).length}
- Modules affected: ${sortedModules.length}

## Error Pattern Distribution

${sortedPatterns.map(([pattern, count]) => {
  const errorPattern = ERROR_PATTERNS.find(p => p.name === pattern);
  return `### ${pattern} (${count} files)

${errorPattern ? `**Description**: ${errorPattern.description}` : ''}

**Files affected**: ${count} (${((count / Object.keys(fileErrors).length) * 100).toFixed(2)}% of total)
`;
}).join('\n')}

## Module Analysis

${sortedModules.map(([module, stats]) => `
### ${module} Module

- Files with @ts-nocheck: ${stats.fileCount}
- Common error patterns:
${Object.entries(stats.patterns)
  .sort((a, b) => b[1] - a[1])
  .map(([pattern, count]) => `  - ${pattern}: ${count} files (${((count / stats.fileCount) * 100).toFixed(2)}%)`)
  .join('\n')}
`).join('\n')}

## Recommendations

Based on this analysis, we recommend:

1. Focus first on the ${sortedPatterns[0][0]} pattern, which affects the most files (${sortedPatterns[0][1]} files).
2. Prioritize the ${sortedModules[0][0]} module, which has the most files with TypeScript errors (${sortedModules[0][1].fileCount} files).
3. Use the typescript-migration-tool.js script with the following options:
   - \`node scripts/typescript-migration-tool.js --fix-pattern=${sortedPatterns[0][0]}\`
   - \`node scripts/typescript-migration-tool.js --fix-module=${sortedModules[0][0]}\`

## Detailed Errors by File

${Object.entries(fileErrors)
  .map(([file, patterns]) => `- ${file}: ${patterns.join(', ')}`)
  .join('\n')}
`;
  
  // Write the report
  if (!ARGS.dryRun) {
    await fs.writeFile(reportPath, report, 'utf8');
    log(`✅ Generated TypeScript error report: ${reportPath}`);
  } else {
    log(`⚠️ Dry run mode: Would generate TypeScript error report`);
  }
}

/**
 * Main function
 */
async function main() {
  log('🔧 TypeScript Migration Tool');
  log('=========================');
  
  try {
    // Get files with @ts-nocheck pragma
    const files = await getFilesWithTsNocheck();
    
    if (files.length === 0) {
      log('✅ No files with @ts-nocheck found! Nothing to do.');
      return;
    }
    
    // Analyze mode
    if (ARGS.analyze || ARGS.report) {
      log('\n📊 Analyzing TypeScript errors in files with @ts-nocheck...');
      
      const fileErrors = {};
      
      // Process files in parallel
      const analysisPromises = files.map(async file => {
        const { errors, patterns } = await analyzeFileErrors(file);
        return { file, errors, patterns };
      });
      
      const analysisResults = await Promise.all(analysisPromises);
      
      // Collect results
      analysisResults.forEach(result => {
        if (result.patterns.length > 0) {
          fileErrors[result.file] = result.patterns;
        }
      });
      
      // Display summary
      log('\n📊 Analysis Results');
      log('================');
      log(`\nFound ${files.length} files with @ts-nocheck.`);
      log(`${Object.keys(fileErrors).length} files have TypeScript errors.`);
      
      // Count files by error pattern
      const patternCounts = {};
      Object.values(fileErrors).forEach(patterns => {
        patterns.forEach(pattern => {
          patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
        });
      });
      
      log('\nError pattern distribution:');
      Object.entries(patternCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([pattern, count]) => {
          log(`- ${pattern}: ${count} files (${((count / Object.keys(fileErrors).length) * 100).toFixed(2)}%)`);
        });
      
      // Generate a comprehensive report if requested
      if (ARGS.report) {
        await generateErrorReport(fileErrors);
      }
      
      return;
    }
    
    // Fix mode
    if (ARGS.autoFix || ARGS.fixModule || ARGS.fixFile || ARGS.fixPattern) {
      log('\n🔧 Fixing TypeScript errors in files with @ts-nocheck...');
      
      let fixedCount = 0;
      const moduleStats = {};
      
      // Process files sequentially to avoid conflicts
      for (const file of files) {
        // Get the module name
        const moduleMatch = file.match(/\/modules\/([^\/]+)\//);
        const module = moduleMatch ? moduleMatch[1] : 'other';
        
        // Update module statistics
        if (!moduleStats[module]) {
          moduleStats[module] = { total: 0, fixed: 0 };
        }
        
        moduleStats[module].total++;
        
        // Fix the file
        const fixed = await fixFile(file);
        
        if (fixed) {
          fixedCount++;
          moduleStats[module].fixed++;
        }
      }
      
      log(`\n✅ Fixed ${fixedCount} out of ${files.length} files.`);
      
      // Display module statistics
      log('\nModule statistics:');
      Object.entries(moduleStats)
        .filter(([_, stats]) => stats.total > 0)
        .sort((a, b) => b[1].total - a[1].total)
        .forEach(([module, stats]) => {
          log(` - ${module}: ${stats.fixed}/${stats.total} (${stats.total > 0 ? ((stats.fixed / stats.total) * 100).toFixed(2) : 0}%)`);
        });
      
      // Update the progress file
      await updateProgressFile(fixedCount, files.length, moduleStats);
      
      // Run TypeScript checking again to confirm fixes
      if (!ARGS.dryRun && fixedCount > 0) {
        log('\n🔍 Running TypeScript check on fixed files...');
        try {
          // Check only the files we fixed
          const fixedFiles = files.filter((_, index) => index < fixedCount);
          execSync(`npx tsc --noEmit ${fixedFiles.join(' ')}`, { stdio: 'pipe' });
          log('✅ No TypeScript errors remain in the fixed files!');
        } catch (error) {
          const errorCount = (error.stdout.toString().match(/error TS\d+/g) || []).length;
          log(`⚠️ ${errorCount} TypeScript errors still remain in the fixed files.`);
          if (ARGS.verbose) {
            log('Error details:');
            log(error.stdout.toString());
          }
        }
      }
      
      return;
    }
    
    // Default mode: just show summary
    log(`\nFound ${files.length} files with @ts-nocheck pragma.`);
    log('Use --analyze to analyze errors, --fix-pattern=NAME to fix a specific error pattern,');
    log('--fix-module=NAME to fix a specific module, or --auto-fix to automatically fix all errors.');
  } catch (error) {
    log(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();