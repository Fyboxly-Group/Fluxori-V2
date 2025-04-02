#!/usr/bin/env node

/**
 * Comprehensive TypeScript fixer for Xero connector module
 * This script will methodically fix TypeScript errors in Xero module files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}🔧 Comprehensive Xero TypeScript Fixer${colors.reset}`);
console.log(`${colors.cyan}=====================================${colors.reset}`);

// Define the priority order of files to fix
const filePriorities = [
  // Core types first
  'src/modules/xero-connector/types/index.ts',
  
  // Models next
  'src/modules/xero-connector/models/xero-config.model.ts',
  'src/modules/xero-connector/models/xero-connection.model.ts',
  'src/modules/xero-connector/models/xero-account-mapping.model.ts',
  'src/modules/xero-connector/models/xero-sync-status.model.ts',
  
  // Core services
  'src/modules/xero-connector/services/xero-auth.service.ts',
  'src/modules/xero-connector/services/xero-config.service.ts',
  
  // Other services
  'src/modules/xero-connector/services/xero-account.service.ts',
  'src/modules/xero-connector/services/xero-contact.service.ts',
  'src/modules/xero-connector/services/xero-invoice.service.ts',
  'src/modules/xero-connector/services/xero-sync.service.ts',
  'src/modules/xero-connector/services/xero-webhook.service.ts',
  'src/modules/xero-connector/services/xero-bulk-sync.service.ts',
  
  // Controllers
  'src/modules/xero-connector/controllers/xero-auth.controller.ts',
  'src/modules/xero-connector/controllers/xero-config.controller.ts',
  'src/modules/xero-connector/controllers/xero-account.controller.ts',
  'src/modules/xero-connector/controllers/xero-contact.controller.ts',
  'src/modules/xero-connector/controllers/xero-invoice.controller.ts',
  'src/modules/xero-connector/controllers/xero-sync.controller.ts',
  'src/modules/xero-connector/controllers/xero-webhook.controller.ts',
  
  // Routes and utils
  'src/modules/xero-connector/routes/xero.routes.ts',
  'src/modules/xero-connector/utils/order-hooks.ts',
  
  // Index file
  'src/modules/xero-connector/index.ts',
];

// Common patterns to fix across all files
const commonFixPatterns = [
  // Fix 1: Extra semicolons in object properties
  {
    description: 'Fix extra semicolons in object properties',
    pattern: /([a-zA-Z0-9_]+)(\s*:\s*[^,;{}\n]+);(\s*[,}])/g,
    replacement: '$1$2$3'
  },
  
  // Fix 2: Semicolons followed by commas
  {
    description: 'Fix semicolons followed by commas',
    pattern: /;,/g,
    replacement: ','
  },
  
  // Fix 3: Semicolons in closing braces followed by comma
  {
    description: 'Fix semicolons in object options',
    pattern: /};,/g,
    replacement: '},'
  },
  
  // Fix 4: Fix redundant type casts
  {
    description: 'Fix redundant type casts',
    pattern: /as string as string(?: as string)*/g,
    replacement: 'as string'
  },
  
  // Fix 5: Fix missing comma in Promise return type
  {
    description: 'Fix missing comma in Promise return type',
    pattern: /(Promise<.*?)(\s+)([a-zA-Z0-9_]+:)/g,
    replacement: '$1,$2$3'
  },
  
  // Fix 6: Fix problematic error handling in catch blocks
  {
    description: 'Fix problematic error handling in catch blocks',
    pattern: /catch\(error\) \{\s*const errorMessage = error instanceof Error.*?(?:\)\)\)|String\(error\)\))/g,
    replacement: 'catch(error) {'
  },
  
  // Fix 7: Missing semicolons at end of statements
  {
    description: 'Add missing semicolons',
    pattern: /(\w+\([^;]*\))(\s*\n)/g,
    replacement: function(match, p1, p2) {
      // Only add semicolon if it's not already part of a larger statement
      if (!/[{:,]$/.test(p1)) {
        return p1 + ';' + p2;
      }
      return match;
    }
  },
  
  // Fix 8: Extra closing brackets in constructor or methods
  {
    description: 'Fix extra closing brackets',
    pattern: /(\s+\});(\s+\})/g,
    replacement: '$2'
  },
  
  // Fix 9: Fix index declarations with semicolons
  {
    description: 'Fix index declarations',
    pattern: /index\(.*?\);}/g,
    replacement: 'index(...)}' // We'll look at the specific replacement in processFile
  }
];

// Function to process a single file
function processFile(filePath) {
  console.log(`\n${colors.blue}Processing ${path.relative(process.cwd(), filePath)}${colors.reset}`);
  
  // Create a backup of the file
  const backupPath = `${filePath}.backup`;
  fs.copyFileSync(filePath, backupPath);
  console.log(`${colors.yellow}⚠ Created backup at ${path.basename(backupPath)}${colors.reset}`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove @ts-nocheck if present
  const hadTsNoCheck = content.includes('// @ts-nocheck');
  content = content.replace(/\/\/ @ts-nocheck\n/g, '');
  
  // Apply common fixes
  let fixCount = 0;
  for (const fix of commonFixPatterns) {
    const beforeContent = content;
    
    // Special handling for fix 9 (index declarations)
    if (fix.description === 'Fix index declarations') {
      // Find all occurrences of index declarations with semicolons
      const indexPattern = /index\((.*?\));}/g;
      let match;
      while ((match = indexPattern.exec(beforeContent)) !== null) {
        const indexArgs = match[1];
        content = content.replace(`index(${indexArgs});}`, `index(${indexArgs})}`);
        fixCount++;
      }
      continue;
    }
    
    // Apply the fix pattern
    content = content.replace(fix.pattern, fix.replacement);
    
    if (content !== beforeContent) {
      const matches = (beforeContent.match(fix.pattern) || []).length;
      console.log(`${colors.green}✓ ${fix.description}: ${matches} fixes applied${colors.reset}`);
      fixCount += matches;
    }
  }
  
  // Apply file-specific fixes based on the filename
  const fileName = path.basename(filePath);
  
  // For xero-auth.service.ts
  if (fileName === 'xero-auth.service.ts') {
    // Fix the getAuthorizationUrl method completely
    const authUrlPattern = /public getAuthorizationUrl[\s\S]*?this\.xero\.buildConsentUrl\(state\);(\s*\}\);)?(\s*\/\/ @ts-ignore[\s\S]*?)(\s*return \/\/ @ts-ignore[\s\S]*?this\.xero\.buildConsentUrl\(state\);)(\s*\})/;
    const authUrlMatch = content.match(authUrlPattern);
    if (authUrlMatch) {
      content = content.replace(authUrlPattern, `public getAuthorizationUrl(userId: string, organizationId: string, redirectUrl: string): string {
    const state = this.generateState({ userId, organizationId, redirectUrl });
    
    // @ts-ignore - Xero types don't match implementation
    return this.xero.buildConsentUrl(state);
  }`);
      console.log(`${colors.green}✓ Fixed getAuthorizationUrl method${colors.reset}`);
      fixCount++;
    }
    
    // Fix the exchangeCodeForToken method
    const tokenMethodPattern = /public async exchangeCodeForToken[\s\S]*?decodedState,(\s*\};)(\s*\}\> \{[\s\S]*?)(\s*\};)(\s*\})/;
    const tokenMethodMatch = content.match(tokenMethodPattern);
    if (tokenMethodMatch) {
      content = content.replace(tokenMethodPattern, `public async exchangeCodeForToken(code: string, state: string): Promise<{ tokenResponse: XeroTokenResponse; decodedState: XeroOAuthState }> {
    // Exchange code for token set
    const tokenSet = await this.xero.apiCallback(code);
    
    // Get tenants (connected Xero organizations)
    await this.xero.updateTenants(false);
    const tenants = this.xero.tenants || [];
    
    if (!tenants || tenants.length === 0) {
      throw new Error('No Xero organizations connected. Please try again.');
    }
    
    // For this initial implementation, we'll use the first tenant
    const tenant = tenants[0];
    
    const decodedState = this.decodeState(state);
    
    return {
      tokenResponse: {
        tokenSet,
        tenantId: tenant.tenantId,
        tenantName: tenant.tenantName,
      },
      decodedState,
    };
  }`);
      console.log(`${colors.green}✓ Fixed exchangeCodeForToken method${colors.reset}`);
      fixCount++;
    }
    
    // Fix storeConnection method parameter
    if (content.includes('tokenResponse: XeroTokenResponse;')) {
      content = content.replace(
        /tokenResponse: XeroTokenResponse;/g,
        'tokenResponse: XeroTokenResponse'
      );
      console.log(`${colors.green}✓ Fixed storeConnection method parameter${colors.reset}`);
      fixCount++;
    }
  }
  
  // Write the fixed content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`${colors.green}✓ Fixed ${fixCount} issues in ${fileName}${colors.reset}`);
  
  // Validate the file with TypeScript
  try {
    console.log(`${colors.blue}Validating ${fileName} with TypeScript${colors.reset}`);
    execSync(`cd ${path.resolve(__dirname, '..')} && npx tsc --skipLibCheck --noEmit ${path.relative(process.cwd(), filePath)}`, { stdio: 'pipe' });
    console.log(`${colors.green}✓ ${fileName} is now TypeScript compliant!${colors.reset}`);
    return { file: filePath, success: true, hadTsNoCheck, errorCount: 0 };
  } catch (error) {
    const errorOutput = error.stdout ? error.stdout.toString() : (error.stderr ? error.stderr.toString() : error.message);
    const errorCount = (errorOutput.match(/error TS\d+/g) || []).length;
    console.log(`${colors.yellow}⚠ ${fileName} still has ${errorCount} TypeScript errors${colors.reset}`);
    
    // If the fix introduced errors, restore from backup
    if (fixCount === 0 && errorCount > 0) {
      fs.copyFileSync(backupPath, filePath);
      console.log(`${colors.yellow}⚠ No fixes were applied and errors were found - restored from backup${colors.reset}`);
    }
    
    // Re-add @ts-nocheck if it had it before
    if (hadTsNoCheck) {
      content = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(filePath, `// @ts-nocheck\n${content}`);
      console.log(`${colors.yellow}⚠ Re-added @ts-nocheck directive${colors.reset}`);
    }
    
    return { file: filePath, success: false, hadTsNoCheck, errorCount };
  }
}

// Main execution
async function main() {
  const results = [];
  
  // Process each file in priority order
  for (const filePath of filePriorities) {
    const fullPath = path.resolve(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      const result = processFile(fullPath);
      results.push(result);
    } else {
      console.log(`${colors.red}❌ File not found: ${filePath}${colors.reset}`);
    }
  }
  
  // Generate a report
  console.log(`\n${colors.cyan}===== Xero TypeScript Fix Report =====${colors.reset}`);
  console.log(`${colors.cyan}Files processed: ${results.length}${colors.reset}`);
  
  const successCount = results.filter(r => r.success).length;
  console.log(`${colors.green}Files fixed successfully: ${successCount}${colors.reset}`);
  console.log(`${colors.yellow}Files with remaining errors: ${results.length - successCount}${colors.reset}`);
  
  console.log(`\n${colors.cyan}===== Details =====${colors.reset}`);
  for (const result of results) {
    const fileName = path.basename(result.file);
    if (result.success) {
      console.log(`${colors.green}✓ ${fileName} - Fixed successfully${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ ${fileName} - ${result.errorCount} errors remain${colors.reset}`);
    }
  }
  
  // Update tsconfig.json to re-include files that were fixed
  updateTsConfig(results);
  
  // Generate a summary file
  generateSummary(results);
}

// Function to update tsconfig.json to include fixed files
function updateTsConfig(results) {
  console.log(`\n${colors.cyan}Updating tsconfig.json${colors.reset}`);
  
  const tsconfigPath = path.resolve(__dirname, '../tsconfig.json');
  let tsconfig;
  
  try {
    tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  } catch (error) {
    console.error(`${colors.red}❌ Error reading tsconfig.json:${colors.reset}`, error.message);
    return;
  }
  
  // Get successfully fixed files
  const fixedFiles = results.filter(r => r.success).map(r => path.relative(path.resolve(__dirname, '..'), r.file));
  
  // Extract Xero module exclusion pattern
  const xeroExclusion = 'src/modules/xero-connector/**/*';
  
  if (fixedFiles.length > 0 && tsconfig.exclude && tsconfig.exclude.includes(xeroExclusion)) {
    // Remove the blanket exclusion
    tsconfig.exclude = tsconfig.exclude.filter(pattern => pattern !== xeroExclusion);
    
    // Add specific exclusions for files that still have errors
    const filesWithErrors = results.filter(r => !r.success).map(r => path.relative(path.resolve(__dirname, '..'), r.file));
    tsconfig.exclude = [...tsconfig.exclude, ...filesWithErrors];
    
    // Write updated tsconfig
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log(`${colors.green}✓ Updated tsconfig.json to include fixed files${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ No changes made to tsconfig.json${colors.reset}`);
  }
}

// Function to generate a summary file
function generateSummary(results) {
  const summaryPath = path.resolve(__dirname, '../XERO-TYPESCRIPT-FIX-PROGRESS.md');
  
  const successCount = results.filter(r => r.success).length;
  const fixedFiles = results.filter(r => r.success).map(r => path.relative(path.resolve(__dirname, '..'), r.file));
  const remainingFiles = results.filter(r => !r.success).map(r => path.relative(path.resolve(__dirname, '..'), r.file));
  
  const summaryContent = `# Xero TypeScript Fix Progress

## Summary
- **Total files processed:** ${results.length}
- **Files fixed successfully:** ${successCount}
- **Files with remaining errors:** ${results.length - successCount}
- **Success rate:** ${Math.round((successCount / results.length) * 100)}%

## Fixed Files
${fixedFiles.map(f => `- \`${f}\``).join('\n')}

## Files with Remaining Errors
${remainingFiles.map(f => `- \`${f}\``).join('\n')}

## Next Steps
1. Continue addressing TypeScript errors in the files with remaining issues
2. Focus on core service files that other modules depend on
3. Fix model and type definitions first to provide a foundation
4. Add proper typing for external libraries like xero-node

## Running the Fix Script
To run this fix script again:
\`\`\`
node scripts/comprehensive-xero-typescript-fixer.js
\`\`\`

Last updated: ${new Date().toISOString()}
`;

  fs.writeFileSync(summaryPath, summaryContent);
  console.log(`${colors.green}✓ Generated summary at XERO-TYPESCRIPT-FIX-PROGRESS.md${colors.reset}`);
}

// Run the main function
main().catch(err => {
  console.error(`${colors.red}❌ Error:${colors.reset}`, err);
  process.exit(1);
});