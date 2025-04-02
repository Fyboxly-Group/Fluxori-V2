#!/usr/bin/env node

/**
 * Plan for fixing remaining TypeScript errors in the Fluxori-V2 backend
 * This script analyzes the codebase to identify files with @ts-nocheck pragma
 * and generates a structured plan for addressing them.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const execAsync = promisify(exec);

// Base directory paths
const baseDir = path.resolve(__dirname, '..');

console.log('🔍 Analyzing TypeScript Files with @ts-nocheck Pragmas');
console.log('===================================================');

/**
 * Main function to analyze and plan fixes for remaining TypeScript errors
 */
async function planRemainingFixes() {
  try {
    // Find all files with @ts-nocheck pragma
    const files = await findFilesWithTsNoCheck();
    console.log(`\nFound ${files.length} files with @ts-nocheck pragma`);
    
    // Group files by module/category
    const groupedFiles = groupFilesByModule(files);
    
    // Generate plan for fixing each module
    const plan = generateFixPlan(groupedFiles);
    
    // Create action plan file
    await createActionPlanFile(plan, groupedFiles);
    
    console.log('✅ Generated action plan for fixing remaining TypeScript errors');
    console.log(`📄 Plan saved to: ${path.join(baseDir, 'TYPESCRIPT-ACTION-PLAN.md')}`);
    
  } catch (error) {
    console.error('❌ Error analyzing files:', error);
    process.exit(1);
  }
}

/**
 * Find all files with @ts-nocheck pragma in the codebase
 */
async function findFilesWithTsNoCheck() {
  try {
    // Use grep to find all files with @ts-nocheck
    const { stdout } = await execAsync('grep -r "@ts-nocheck" --include="*.ts" src/');
    
    // Parse the output to extract file paths
    const files = stdout.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const [filePath] = line.split(':');
        return path.join(baseDir, filePath);
      });
    
    return [...new Set(files)]; // Remove duplicates
  } catch (error) {
    if (error.code === 1 && error.stdout === '') {
      // grep returns exit code 1 when no matches are found
      return [];
    }
    throw error;
  }
}

/**
 * Group files by module or category
 */
function groupFilesByModule(files) {
  const groups = {
    'Core': [],
    'Models': [],
    'Controllers': [],
    'Services': [],
    'Routes': [],
    'ProductIngestion': [],
    'Marketplaces': {
      'Amazon': [],
      'Shopify': [],
      'Takealot': [],
      'Other': []
    },
    'Connection': [],
    'Scripts': [],
    'Tests': [],
    'Other': []
  };
  
  files.forEach(file => {
    const relativePath = path.relative(baseDir, file);
    
    if (relativePath.includes('models/')) {
      groups['Models'].push(relativePath);
    } else if (relativePath.includes('controllers/')) {
      groups['Controllers'].push(relativePath);
    } else if (relativePath.includes('services/')) {
      groups['Services'].push(relativePath);
    } else if (relativePath.includes('routes/')) {
      groups['Routes'].push(relativePath);
    } else if (relativePath.includes('modules/product-ingestion/')) {
      groups['ProductIngestion'].push(relativePath);
    } else if (relativePath.includes('modules/marketplaces/')) {
      if (relativePath.includes('/amazon/')) {
        groups['Marketplaces']['Amazon'].push(relativePath);
      } else if (relativePath.includes('/shopify/')) {
        groups['Marketplaces']['Shopify'].push(relativePath);
      } else if (relativePath.includes('/takealot/')) {
        groups['Marketplaces']['Takealot'].push(relativePath);
      } else {
        groups['Marketplaces']['Other'].push(relativePath);
      }
    } else if (relativePath.includes('modules/connections/')) {
      groups['Connection'].push(relativePath);
    } else if (relativePath.includes('scripts/')) {
      groups['Scripts'].push(relativePath);
    } else if (relativePath.includes('.test.ts')) {
      groups['Tests'].push(relativePath);
    } else if (relativePath === 'src/app.ts') {
      groups['Core'].push(relativePath);
    } else {
      groups['Other'].push(relativePath);
    }
  });
  
  return groups;
}

/**
 * Generate a plan for fixing each module
 */
function generateFixPlan(groupedFiles) {
  const plans = {
    'Core': {
      description: 'Fix core application files with proper Express typing',
      steps: [
        'Create middleware type definitions',
        'Improve express-extensions.ts with comprehensive Request/Response types',
        'Fix app.ts with proper middleware typing',
        'Add proper error handler typing'
      ],
      scriptName: 'fix-core-app.js',
      priority: 'High',
      estimatedEffort: 'Medium'
    },
    'Models': {
      description: 'Fix model files with proper Mongoose schema typing',
      steps: [
        'Create standardized model type patterns',
        'Fix Document interface extensions',
        'Implement consistent approach for schema methods',
        'Add proper virtuals typing',
        'Fix pre/post hooks with correct this typing'
      ],
      scriptName: 'fix-models.js',
      priority: 'High',
      estimatedEffort: 'High'
    },
    'Controllers': {
      description: 'Fix controller files with proper Express request typing',
      steps: [
        'Implement consistent AuthenticatedRequest usage',
        'Improve request and response typing',
        'Add proper parameter validation with type guards',
        'Fix error handling patterns'
      ],
      scriptName: 'fix-controllers.js',
      priority: 'High',
      estimatedEffort: 'Medium'
    },
    'Services': {
      description: 'Fix service files with proper typing',
      steps: [
        'Add proper dependency injection typing',
        'Fix service method return types',
        'Implement consistent error handling patterns',
        'Fix Promise handling with proper typing'
      ],
      scriptName: 'fix-services.js',
      priority: 'Medium',
      estimatedEffort: 'Medium'
    },
    'ProductIngestion': {
      description: 'Fix product ingestion mappers and related files',
      steps: [
        'Create proper interfaces for marketplace-specific product formats',
        'Fix mapper functions with proper typing',
        'Implement type guards for validating product data',
        'Add comprehensive error handling'
      ],
      scriptName: 'fix-product-ingestion-mappers.js',
      priority: 'Medium',
      estimatedEffort: 'Low'
    },
    'Marketplaces': {
      description: 'Fix marketplace adapters with proper typing',
      steps: [
        'Create declaration files for marketplace APIs',
        'Fix adapter classes with proper typing',
        'Implement interface hierarchies for adapter functionality',
        'Add proper error handling with type narrowing'
      ],
      scriptName: {
        'Amazon': 'fix-amazon-adapters.js',
        'Shopify': 'fix-shopify-adapters.js',
        'Takealot': 'fix-takealot-adapters.js',
        'Other': 'fix-other-marketplace-adapters.js'
      },
      priority: 'High',
      estimatedEffort: 'Very High'
    },
    'Connection': {
      description: 'Fix connection module files',
      steps: [
        'Fix connection routes with proper typing',
        'Implement proper module initialization',
        'Add proper error handling'
      ],
      scriptName: 'fix-connection-module.js',
      priority: 'Low',
      estimatedEffort: 'Low'
    },
    'Tests': {
      description: 'Fix test files with proper Jest typing',
      steps: [
        'Create Jest mock utilities with proper typing',
        'Fix test fixture typing',
        'Implement proper assertion typing',
        'Add proper mock function return types'
      ],
      scriptName: 'fix-test-files.js',
      priority: 'Low',
      estimatedEffort: 'Very High'
    }
  };
  
  return plans;
}

/**
 * Create an action plan file for fixing remaining TypeScript errors
 */
async function createActionPlanFile(plans, groupedFiles) {
  const planFilePath = path.join(baseDir, 'TYPESCRIPT-ACTION-PLAN.md');
  
  let content = `# TypeScript Migration Action Plan
  
This document outlines the action plan for fixing the remaining TypeScript errors in the Fluxori-V2 backend codebase.

## Overview

We've identified ${countTotalFiles(groupedFiles)} files that still contain \`@ts-nocheck\` pragmas. This document outlines a structured approach for systematically addressing these files.

## Prioritized Modules

`;

  // Core modules first
  for (const module of ['Core', 'Models', 'Controllers', 'Services']) {
    const plan = plans[module];
    const files = groupedFiles[module];
    
    if (files.length === 0) continue;
    
    content += `### ${module} (${files.length} files)
    
**Description:** ${plan.description}

**Priority:** ${plan.priority}
**Estimated Effort:** ${plan.estimatedEffort}
**Automation Script:** \`${plan.scriptName}\`

**Approach:**
${plan.steps.map(step => `- ${step}`).join('\n')}

**Files to Fix:**
${files.map(file => `- \`${file}\``).join('\n')}

`;
  }
  
  // Product Ingestion
  const piFiles = groupedFiles['ProductIngestion'];
  if (piFiles.length > 0) {
    const plan = plans['ProductIngestion'];
    
    content += `### Product Ingestion (${piFiles.length} files)
    
**Description:** ${plan.description}

**Priority:** ${plan.priority}
**Estimated Effort:** ${plan.estimatedEffort}
**Automation Script:** \`${plan.scriptName}\`

**Approach:**
${plan.steps.map(step => `- ${step}`).join('\n')}

**Files to Fix:**
${piFiles.map(file => `- \`${file}\``).join('\n')}

`;
  }
  
  // Marketplaces
  const mpGroups = groupedFiles['Marketplaces'];
  const totalMarketplaceFiles = Object.values(mpGroups).flat().length;
  
  if (totalMarketplaceFiles > 0) {
    const plan = plans['Marketplaces'];
    
    content += `### Marketplaces (${totalMarketplaceFiles} files)
    
**Description:** ${plan.description}

**Priority:** ${plan.priority}
**Estimated Effort:** ${plan.estimatedEffort}

**Approach:**
${plan.steps.map(step => `- ${step}`).join('\n')}

`;

    for (const [mp, files] of Object.entries(mpGroups)) {
      if (files.length === 0) continue;
      
      content += `#### ${mp} (${files.length} files)
      
**Automation Script:** \`${plan.scriptName[mp]}\`

**Files to Fix:**
${files.map(file => `- \`${file}\``).join('\n')}

`;
    }
  }
  
  // Connection
  const connFiles = groupedFiles['Connection'];
  if (connFiles.length > 0) {
    const plan = plans['Connection'];
    
    content += `### Connection Module (${connFiles.length} files)
    
**Description:** ${plan.description}

**Priority:** ${plan.priority}
**Estimated Effort:** ${plan.estimatedEffort}
**Automation Script:** \`${plan.scriptName}\`

**Approach:**
${plan.steps.map(step => `- ${step}`).join('\n')}

**Files to Fix:**
${connFiles.map(file => `- \`${file}\``).join('\n')}

`;
  }
  
  // Tests - these are numerous so we'll just summarize
  const testFiles = groupedFiles['Tests'];
  if (testFiles.length > 0) {
    const plan = plans['Tests'];
    
    content += `### Test Files (${testFiles.length} files)
    
**Description:** ${plan.description}

**Priority:** ${plan.priority}
**Estimated Effort:** ${plan.estimatedEffort}
**Automation Script:** \`${plan.scriptName}\`

**Approach:**
${plan.steps.map(step => `- ${step}`).join('\n')}

**Strategy:** Due to the large number of test files, we'll develop an automated approach to fix common test file patterns.

`;
  }
  
  // Other files
  const otherFiles = groupedFiles['Other'];
  if (otherFiles.length > 0) {
    content += `### Other Files (${otherFiles.length} files)

These files don't fit neatly into other categories and will be handled individually as needed.

**Files to Fix:**
${otherFiles.map(file => `- \`${file}\``).join('\n')}

`;
  }
  
  // Implementation Schedule
  content += `
## Implementation Schedule

1. **Week 1: Core, Models, and Controllers**
   - Fix core application files
   - Fix model files
   - Fix controller files
   - Update progress tracking

2. **Week 2: Services and Product Ingestion**
   - Fix service files
   - Fix product ingestion mappers
   - Update progress tracking

3. **Week 3-4: Marketplace Adapters**
   - Fix Amazon adapters
   - Fix Shopify adapters
   - Fix Takealot adapters
   - Fix other marketplace adapters
   - Update progress tracking

4. **Week 5: Remaining Files**
   - Fix connection module files
   - Fix remaining miscellaneous files
   - Update progress tracking

5. **Ongoing: Test Files**
   - Develop automated approach for test files
   - Gradually fix test files alongside module fixes
   - Update progress tracking

## Success Metrics

1. **Quantitative Metrics:**
   - Number of files without @ts-nocheck pragmas
   - Percentage of codebase with proper TypeScript typing
   - Number of TypeScript errors fixed
   - Type coverage percentage

2. **Qualitative Metrics:**
   - Improved developer experience
   - Faster error detection
   - Better code completion and IntelliSense
   - Reduced runtime errors

## Conclusion

This action plan provides a structured approach to systematically address the remaining TypeScript errors in the Fluxori-V2 backend codebase. By following this plan, we can complete the TypeScript migration efficiently and improve the overall quality of the codebase.
`;

  await writeFileAsync(planFilePath, content);
}

/**
 * Count total files with @ts-nocheck pragma
 */
function countTotalFiles(groupedFiles) {
  let total = 0;
  
  for (const [key, value] of Object.entries(groupedFiles)) {
    if (key === 'Marketplaces') {
      total += Object.values(value).flat().length;
    } else {
      total += value.length;
    }
  }
  
  return total;
}

planRemainingFixes().catch(console.error);