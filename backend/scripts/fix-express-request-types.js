/**
 * Script to fix Express request type issues
 * 
 * This script addresses the common Express request typing issues we identified 
 * during the TypeScript migration:
 * 1. Missing Request type extensions for authenticated requests
 * 2. Improper user property access without type checking
 * 3. Missing type imports for Express
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Target files with Express request issues
const TARGET_FILES = [
  'src/controllers/**/*.ts',
  'src/routes/**/*.ts',
  'src/middleware/**/*.ts',
  'src/modules/*/controllers/**/*.ts',
  'src/modules/*/routes/**/*.ts'
];

// Track statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  issuesFixed: 0,
};

// Express request type fixes
const expressRequestFixes = [
  // Fix missing Request type imports
  {
    name: 'Missing Express type imports',
    matcher: /import\s+{\s*(Router|Application)[,\s]*}(?!\s*,\s*{\s*(?:[^{}]*,\s*)?(Request|Response|NextFunction))/g,
    replacer: 'import { $1, Request, Response, NextFunction }'
  },
  
  // Fix authenticated request interface
  {
    name: 'Improper AuthenticatedRequest interface',
    matcher: /interface\s+(\w+Request)\s+extends\s+Request\s*{([^}]*)}/g,
    replacer: 'type $1 = Request & {$2}'
  },
  
  // Fix req.user access without type checking
  {
    name: 'Unchecked req.user access',
    matcher: /req\.user\.(id|organizationId|email|role)(?!\?)/g,
    replacer: 'req.user?.$1'
  },
  
  // Add user type guard pattern
  {
    name: 'Missing user type guard',
    matcher: /function\s+(\w+)\s*\(\s*req\s*:\s*(?:.*?)Request[^)]*\)[^{]*{(?!\s*if\s*\(\s*!req\.user\s*\))/g,
    replacer: (match, funcName) => {
      // Only add the guard if the function uses req.user
      if (match.includes('req.user')) {
        return match.replace('{', '{\n  if (!req.user) {\n    return res.status(401).json({ success: false, message: "Authentication required" });\n  }\n');
      }
      return match;
    }
  },
  
  // Fix Express middleware handler typing
  {
    name: 'Improper Express middleware handler',
    matcher: /app\.(use|get|post|put|patch|delete)\s*\(\s*(['"][^'"]+['"]),\s*\(?(?!req|request|_req|_)(\w+)(?!:\s*(?:Request|any))\)/g,
    replacer: 'app.$1($2, ($3 as (req: Request, res: Response, next: NextFunction) => void))'
  },
  
  // Add AuthenticatedRequest type if missing but needed
  {
    name: 'Missing AuthenticatedRequest type',
    matcher: /import\s+{[^}]*Request[^}]*}\s+from\s+['"]express['"];(?!\s*\/\/\s*Authenticated[^]*?type\s+AuthenticatedRequest)/g,
    checkAndReplace: (content, match) => {
      if (content.includes('req.user') && !content.includes('AuthenticatedRequest')) {
        return match + '\n\n// Authenticated request type\ntype AuthenticatedRequest = Request & {\n  user?: {\n    id: string;\n    organizationId: string;\n    email?: string;\n    role?: string;\n  };\n};';
      }
      return match;
    }
  }
];

// Process a file and apply fixes
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if file doesn't contain Express-related content
    if (!content.includes('express') && !content.includes('Request') && 
        !content.includes('req.') && !content.includes('router.')) {
      stats.filesProcessed++;
      return;
    }
    
    console.log(chalk.blue(`Processing ${filePath}...`));
    let modifiedContent = content;
    let fixCount = 0;
    
    // Apply each Express request fix
    for (const fix of expressRequestFixes) {
      if (fix.checkAndReplace) {
        // Custom check and replace logic
        const matches = modifiedContent.match(fix.matcher) || [];
        for (const match of matches) {
          const replacement = fix.checkAndReplace(modifiedContent, match);
          if (replacement !== match) {
            modifiedContent = modifiedContent.replace(match, replacement);
            fixCount++;
            console.log(chalk.green(`  - Applied ${fix.name}`));
          }
        }
      } else {
        // Standard regex replacement
        let beforeFix = modifiedContent;
        modifiedContent = modifiedContent.replace(fix.matcher, fix.replacer);
        
        if (beforeFix !== modifiedContent) {
          const matches = (beforeFix.match(fix.matcher) || []).length;
          fixCount += matches;
          console.log(chalk.green(`  - Applied ${fix.name}: ${matches} matches`));
        }
      }
    }
    
    // Only save if changes were made
    if (modifiedContent !== content) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      stats.filesModified++;
      stats.issuesFixed += fixCount;
      console.log(chalk.green(`✓ Fixed ${fixCount} Express request issues in ${filePath}`));
    } else {
      console.log(chalk.yellow(`✓ No Express request issues found in ${filePath}`));
    }
    
    stats.filesProcessed++;
  } catch (error) {
    console.error(chalk.red(`Error processing ${filePath}:`), error);
  }
}

// Find files to process
function findTargetFiles() {
  let files = [];
  for (const pattern of TARGET_FILES) {
    const matches = glob.sync(pattern, { cwd: process.cwd() });
    files = [...files, ...matches];
  }
  return [...new Set(files)]; // Remove duplicates
}

// Main execution
function main() {
  console.log(chalk.bold.blue('Starting Express Request TypeScript fixing script...'));
  
  const files = findTargetFiles();
  console.log(chalk.blue(`Found ${files.length} files to process`));
  
  for (const file of files) {
    processFile(file);
  }
  
  // Print stats
  console.log(chalk.bold.green('\nScript completed!'));
  console.log(chalk.green(`Files processed: ${stats.filesProcessed}`));
  console.log(chalk.green(`Files modified: ${stats.filesModified}`));
  console.log(chalk.green(`Express request issues fixed: ${stats.issuesFixed}`));
  
  console.log(chalk.yellow('\nNext steps:'));
  console.log(chalk.yellow('1. Run TypeScript check to see remaining errors:'));
  console.log(chalk.yellow('   npx tsc --noEmit | grep "Request"'));
}

// Run the script
main();