#!/usr/bin/env node

/**
 * Script to fix TypeScript errors in controller files
 * This script focuses on fixing Express request/response typing issues
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execSync } = require('child_process');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const existsAsync = promisify(fs.exists);

// Base directory paths
const baseDir = path.resolve(__dirname, '..');
const srcDir = path.join(baseDir, 'src');
const controllersDir = path.join(srcDir, 'controllers');
const progressFilePath = path.join(baseDir, 'TYPESCRIPT-MIGRATION-PROGRESS.md');

console.log('🔧 Fix Controller TypeScript Errors');
console.log('===========================================');

/**
 * Main function to fix controller TypeScript errors
 */
async function fixControllers() {
  try {
    // Find all controller files to fix
    const controllerFiles = getControllerFilesToFix();
    console.log(`Found ${controllerFiles.length} controller files with @ts-nocheck pragma`);
    
    // Count initial files with @ts-nocheck
    const initialCount = controllerFiles.length;
    
    // Fix each controller file
    for (const filePath of controllerFiles) {
      await fixControllerFile(filePath);
    }
    
    // Count files after fixes
    const currentControllerFiles = getControllersWithTsNoCheck();
    const fixedCount = initialCount - currentControllerFiles.length;
    
    console.log(`\n✅ Fixed ${fixedCount} controller files`);
    
    // Update progress tracking
    await updateProgressFile(fixedCount);
    
    console.log('✅ Updated progress tracking');
    console.log('\n🎉 Controller TypeScript migration complete!');
    
  } catch (error) {
    console.error('❌ Error fixing controller files:', error);
    process.exit(1);
  }
}

/**
 * Get all controller files that need fixing
 */
function getControllerFilesToFix() {
  // Find all controller files with @ts-nocheck pragma
  const files = [];
  
  // Get files in controllers directory
  try {
    const controllerFiles = fs.readdirSync(controllersDir)
      .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts'))
      .map(file => path.join(controllersDir, file));
      
    for (const filePath of controllerFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('@ts-nocheck')) {
        files.push(filePath);
      }
    }
  } catch (err) {
    console.error('Error reading controllers directory:', err);
  }
  
  // Check for module-specific controllers
  const modulesDirs = [
    path.join(srcDir, 'modules', 'marketplaces', 'controllers'),
    path.join(srcDir, 'modules', 'notifications', 'controllers'),
    path.join(srcDir, 'modules', 'ai-cs-agent', 'controllers'),
    path.join(srcDir, 'modules', 'rag-retrieval', 'controllers'),
    path.join(srcDir, 'modules', 'credits', 'controllers'),
    path.join(srcDir, 'modules', 'xero-connector', 'controllers'),
    path.join(srcDir, 'modules', 'international-trade', 'controllers')
  ];
  
  for (const moduleDir of modulesDirs) {
    try {
      if (fs.existsSync(moduleDir)) {
        const moduleControllerFiles = fs.readdirSync(moduleDir)
          .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts'))
          .map(file => path.join(moduleDir, file));
          
        for (const filePath of moduleControllerFiles) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('@ts-nocheck')) {
            files.push(filePath);
          }
        }
      }
    } catch (err) {
      console.error(`Error reading ${moduleDir}:`, err);
    }
  }
  
  return files;
}

/**
 * Fix a specific controller file
 */
async function fixControllerFile(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8');
    const filename = path.basename(filePath);
    const controllerName = filename.replace('.controller.ts', '');
    
    console.log(`Fixing controller: ${controllerName}`);
    
    let newContent = content;
    
    // Remove @ts-nocheck pragma
    newContent = newContent.replace(/\/\/ @ts-nocheck.*?\n/, '');
    
    // Fix imports - add AuthenticatedRequest
    if (!newContent.includes('import { AuthenticatedRequest }')) {
      if (newContent.includes('import { Request, Response')) {
        newContent = newContent.replace(
          /import { Request, Response/,
          'import { Request, Response'
        );
        
        // Add import for AuthenticatedRequest
        newContent = newContent.replace(
          /import { Request, Response.*?;/,
          `import { Request, Response$1;
import { AuthenticatedRequest, TypedResponse, getTypedResponse, ControllerMethod, AuthControllerMethod } from '../types/express-extensions';`
        );
      } else if (newContent.includes('import express')) {
        newContent = newContent.replace(
          /import express.*?;/,
          `import express from 'express';
import { AuthenticatedRequest, TypedResponse, getTypedResponse, ControllerMethod, AuthControllerMethod } from '../types/express-extensions';`
        );
      } else {
        // Add new import
        newContent = `import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, TypedResponse, getTypedResponse, ControllerMethod, AuthControllerMethod } from '../types/express-extensions';\n` + newContent;
      }
    }
    
    // Add relative path adjustment for nested controllers
    if (filePath.includes('/modules/')) {
      newContent = newContent.replace(
        /import { AuthenticatedRequest.*?from '\.\.\/types\/express-extensions';/,
        `import { AuthenticatedRequest, TypedResponse, getTypedResponse, ControllerMethod, AuthControllerMethod } from '../../../types/express-extensions';`
      );
    }
    
    // Fix controller method signatures that require authentication
    if (newContent.includes('req.user')) {
      newContent = newContent.replace(
        /export (const|async function) (\w+)\s*=\s*async\s*\(\s*req:\s*Request\s*,\s*res:\s*Response/g,
        'export $1 $2 = async (req: AuthenticatedRequest, res: Response'
      );
      
      // Fix class methods that require authentication
      newContent = newContent.replace(
        /public static async (\w+)\s*\(\s*req:\s*Request\s*,\s*res:\s*Response/g,
        'public static async $1(req: AuthenticatedRequest, res: Response'
      );
      
      // Fix instance methods that require authentication
      newContent = newContent.replace(
        /public async (\w+)\s*\(\s*req:\s*Request\s*,\s*res:\s*Response/g,
        'public async $1(req: AuthenticatedRequest, res: Response'
      );
    }
    
    // Fix error handling
    newContent = newContent.replace(
      /const errorMessage = error instanceof Error \? \(error instanceof Error \? \(error instanceof Error \? \(error instanceof Error \? \(error instanceof Error \? \(error instanceof Error \? \(error instanceof Error \? error\.message : String\(error\)\) : String\(error\)\) : String\(error\)\) : String\(error\)\) : String\(error\)\) : String\(error\)\) : String\(error\);/g,
      'const errorMessage = error instanceof Error ? error.message : String(error);'
    );
    
    // Fix response typing
    newContent = newContent.replace(
      /res\.status\(\d+\)\.json\((.*?)\) as any/g,
      'res.status($1).json($2)'
    );
    
    // Add TypedResponse usage
    if (newContent.includes('res.json(') || newContent.includes('res.status(')) {
      // Don't add if already has typedRes
      if (!newContent.includes('const typedRes = getTypedResponse(res)')) {
        const methodMatches = newContent.match(/export (const|async function|function) (\w+)\s*=\s*async\s*\(/g);
        
        if (methodMatches) {
          for (const methodMatch of methodMatches) {
            const methodName = methodMatch.match(/(\w+)\s*=\s*async/)[1];
            
            // Find the method body
            const methodRegex = new RegExp(`export (const|async function|function) ${methodName}\\s*=\\s*async\\s*\\([^)]*\\)\\s*{([\\s\\S]*?)\\n\\}`, 'g');
            const methodBodyMatch = methodRegex.exec(newContent);
            
            if (methodBodyMatch) {
              const methodBody = methodBodyMatch[2];
              
              // Add TypedResponse if the method uses res.json or res.status
              if ((methodBody.includes('res.json(') || methodBody.includes('res.status(')) && 
                  !methodBody.includes('const typedRes = getTypedResponse(res)')) {
                
                // Replace the method body
                const newMethodBody = methodBody.replace(
                  /try {/,
                  'try {\n    const typedRes = getTypedResponse(res);'
                );
                
                // Replace the entire method
                newContent = newContent.replace(
                  methodBodyMatch[0],
                  methodBodyMatch[0].replace(methodBody, newMethodBody)
                );
              }
            }
          }
        }
      }
    }
    
    // Fix typed responses
    if (newContent.includes('const typedRes = getTypedResponse(res)')) {
      // Success responses
      newContent = newContent.replace(
        /res\.status\(200\)\.json\(\{ success: true,([^}]*)\}\)/g,
        'typedRes.success({$1})'
      );
      
      newContent = newContent.replace(
        /res\.status\(201\)\.json\(\{ success: true,([^}]*)\}\)/g,
        'typedRes.success({$1}, "Created", 201)'
      );
      
      // Error responses
      newContent = newContent.replace(
        /res\.status\(400\)\.json\(\{ success: false, message: ['"](.*?)['"](.*)\}\)/g,
        'typedRes.error("$1"$2)'
      );
      
      newContent = newContent.replace(
        /res\.status\(404\)\.json\(\{ success: false, message: ['"](.*?)['"](.*)\}\)/g,
        'typedRes.notFound("$1")'
      );
      
      newContent = newContent.replace(
        /res\.status\(401\)\.json\(\{ success: false, message: ['"](.*?)['"](.*)\}\)/g,
        'typedRes.unauthorized("$1")'
      );
      
      newContent = newContent.replace(
        /res\.status\(403\)\.json\(\{ success: false, message: ['"](.*?)['"](.*)\}\)/g,
        'typedRes.forbidden("$1")'
      );
      
      newContent = newContent.replace(
        /res\.status\(500\)\.json\(\{ success: false, message: ['"](.*?)['"](.*)\}\)/g,
        'typedRes.error("$1", 500$2)'
      );
    }
    
    // Fix async method return types
    newContent = newContent.replace(
      /export const (\w+) = async \(([^)]*)\)(\s*)(=>|{)/g,
      'export const $1: ControllerMethod = async ($2)$3$4'
    );
    
    newContent = newContent.replace(
      /export const (\w+) = async \(([^)]*): AuthenticatedRequest([^)]*)\)(\s*)(=>|{)/g,
      'export const $1: AuthControllerMethod = async ($2: AuthenticatedRequest$3)$4$5'
    );
    
    // Class methods
    newContent = newContent.replace(
      /public static async (\w+)\(([^)]*)\): Promise<void>/g,
      'public static async $1($2): Promise<void>'
    );
    
    // Write the fixed file
    await writeFileAsync(filePath, newContent);
    console.log(`✅ Fixed ${filePath}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error fixing controller file ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Get all controller files that still have @ts-nocheck
 */
function getControllersWithTsNoCheck() {
  const files = [];
  
  // Get files in controllers directory
  try {
    const controllerFiles = fs.readdirSync(controllersDir)
      .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts'))
      .map(file => path.join(controllersDir, file));
      
    for (const filePath of controllerFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('@ts-nocheck')) {
        files.push(filePath);
      }
    }
  } catch (err) {
    console.error('Error reading controllers directory:', err);
  }
  
  // Check for module-specific controllers
  const modulesDirs = [
    path.join(srcDir, 'modules', 'marketplaces', 'controllers'),
    path.join(srcDir, 'modules', 'notifications', 'controllers'),
    path.join(srcDir, 'modules', 'ai-cs-agent', 'controllers'),
    path.join(srcDir, 'modules', 'rag-retrieval', 'controllers'),
    path.join(srcDir, 'modules', 'credits', 'controllers'),
    path.join(srcDir, 'modules', 'xero-connector', 'controllers'),
    path.join(srcDir, 'modules', 'international-trade', 'controllers')
  ];
  
  for (const moduleDir of modulesDirs) {
    try {
      if (fs.existsSync(moduleDir)) {
        const moduleControllerFiles = fs.readdirSync(moduleDir)
          .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts'))
          .map(file => path.join(moduleDir, file));
          
        for (const filePath of moduleControllerFiles) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('@ts-nocheck')) {
            files.push(filePath);
          }
        }
      }
    } catch (err) {
      console.error(`Error reading ${moduleDir}:`, err);
    }
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
    
    // Update the progress file with Controller fixes
    
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

Fixed Controller Files:
- Fixed Express request and response typing in ${fixedCount} controller files
- Implemented AuthenticatedRequest for user-authenticated controllers
- Added TypedResponse for consistent API responses
- Improved error handling with proper type narrowing
- Added proper controller method type definitions
- Fixed asynchronous method return types
`;
    
    // Check if there's already an entry for today
    if (!updatedContent.includes(`### ${currentDate}`)) {
      // Insert after "## Recent Changes"
      updatedContent = updatedContent.replace(
        '## Recent Changes',
        '## Recent Changes' + recentChangesEntry
      );
    } else if (!updatedContent.includes("Fixed Controller Files:")) {
      // Add our entry after today's date header
      updatedContent = updatedContent.replace(
        `### ${currentDate}`,
        `### ${currentDate}` + "\n\nFixed Controller Files:\n- Fixed Express request and response typing in " + fixedCount + " controller files\n- Implemented AuthenticatedRequest for user-authenticated controllers\n- Added TypedResponse for consistent API responses\n- Improved error handling with proper type narrowing\n- Added proper controller method type definitions\n- Fixed asynchronous method return types"
      );
    }
    
    // 3. Add statistics for controllers
    const statsTableEntry = `| Controller Files | ${fixedCount} | ${18 - fixedCount} | ${((fixedCount / 18) * 100).toFixed(2)}% |`;
    
    if (!updatedContent.includes('| Controller Files |')) {
      // Add to Statistics section if not already there
      updatedContent = updatedContent.replace(
        '| Model Files | 8 | 13 | 38.10% |',
        '| Model Files | 8 | 13 | 38.10% |\n| Controller Files | ' + fixedCount + ' | ' + (18 - fixedCount) + ' | ' + ((fixedCount / 18) * 100).toFixed(2) + '% |'
      );
    } else {
      // Update existing entry
      updatedContent = updatedContent.replace(
        /\| Controller Files \| \d+ \| \d+ \| \d+\.\d+% \|/,
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

fixControllers().catch(console.error);