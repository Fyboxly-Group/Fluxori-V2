#!/usr/bin/env node

/**
 * Comprehensive TypeScript Fix Script
 * 
 * This script runs all the TypeScript fix scripts in the optimal order
 * to address the various TypeScript errors in the codebase.
 * 
 * The script addresses:
 * - TS2300: Duplicate identifier issues
 * - TS2304: Missing imports
 * - TS2305: Module import issues
 * - Responsive props typing issues
 * - Component interface problems
 * - Import pattern inconsistencies
 * - Chakra UI V3 compatibility issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Comprehensive TypeScript Fix Script');

// Create a summary file to report on progress
const SUMMARY_FILE = path.resolve(__dirname, '../TYPESCRIPT-AUTOMATION-RESULTS.md');

function writeSummary(content, append = true) {
  try {
    if (append && fs.existsSync(SUMMARY_FILE)) {
      fs.appendFileSync(SUMMARY_FILE, content + '\n');
    } else {
      fs.writeFileSync(SUMMARY_FILE, content + '\n');
    }
  } catch (error) {
    console.error(`Error writing to summary file: ${error.message}`);
  }
}

// Initialize summary file
writeSummary(`# TypeScript Automation Results

This document contains the execution results of the comprehensive TypeScript fix script.

## Execution Started: ${new Date().toISOString()}

`, false);

// Run all TypeScript fix scripts in the optimal order
async function runAllFixScripts() {
  try {
    // 0. Analyze TypeScript errors first to get a baseline
    console.log('\n📊 Step 0: Analyzing current TypeScript errors...');
    await execCommand('node scripts/analyze-typescript-errors.js');
    writeSummary(`\n## Initial Error Analysis`);
    
    // 1. Fix Chakra UI V3 import patterns
    console.log('\n📦 Step 1: Fixing Chakra UI V3 import patterns...');
    await execCommand('node scripts/fix-chakra-ui-v3-patterns.js');
    writeSummary(`\n### Step 1: Fixed Chakra UI V3 import patterns`);
    
    // 2. Fix Chakra UI V3 props 
    console.log('\n📦 Step 2: Fixing Chakra UI V3 props...');
    await execCommand('node scripts/fix-chakra-ui-v3-props.js');
    writeSummary(`\n### Step 2: Fixed Chakra UI V3 props`);
    
    // 3. Fix duplicate identifiers
    console.log('\n📦 Step 3: Fixing duplicate identifiers...');
    await execCommand('node scripts/fix-duplicate-identifiers.js');
    writeSummary(`\n### Step 3: Fixed duplicate identifiers`);
    
    // 4. Fix missing imports
    console.log('\n📦 Step 4: Fixing missing imports...');
    await execCommand('node scripts/fix-missing-imports.js');
    writeSummary(`\n### Step 4: Fixed missing imports`);
    
    // 5. Generate comprehensive type declarations
    console.log('\n📦 Step 5: Generating type declarations...');
    await execCommand('node scripts/generate-chakra-types.js');
    writeSummary(`\n### Step 5: Generated Chakra UI V3 type declarations`);
    
    // 6. Fix responsive props types
    console.log('\n📦 Step 6: Fixing responsive props types...');
    await execCommand('node scripts/fix-responsive-props-types.js');
    writeSummary(`\n### Step 6: Fixed responsive props types`);
    
    // 7. Fix component interfaces
    console.log('\n📦 Step 7: Fixing component interfaces...');
    await execCommand('node scripts/fix-component-interfaces.js');
    writeSummary(`\n### Step 7: Fixed component interfaces`);
    
    // 8. Fix imports and comments
    console.log('\n📦 Step 8: Fixing imports and comments...');
    await execCommand('node scripts/fix-imports-and-comments.js');
    writeSummary(`\n### Step 8: Fixed imports and comments`);
    
    // 9. Fix final component errors
    console.log('\n📦 Step 9: Fixing final component errors...');
    await execCommand('node scripts/fix-final-component-errors.js');
    writeSummary(`\n### Step 9: Fixed final component errors`);
    
    // 10. Fix remaining high priority errors
    console.log('\n📦 Step 10: Fixing remaining high priority errors...');
    await execCommand('node scripts/fix-remaining-high-priority-errors.js');
    writeSummary(`\n### Step 10: Fixed remaining high priority errors`);

    // 11. Fix module declarations
    console.log('\n📦 Step 11: Fixing module declarations...');
    await execCommand('node scripts/fix-module-declarations.js');
    writeSummary(`\n### Step 11: Fixed module declarations`);

    // 12. Fix TSConfig settings
    console.log('\n📦 Step 12: Optimizing TSConfig settings...');
    await execCommand('node scripts/fix-tsconfig.js');
    writeSummary(`\n### Step 12: Optimized TSConfig settings`);
    
    // 13. Final check of TypeScript error count
    console.log('\n📦 Step 13: Final check of TypeScript error count...');
    await execCommand('node scripts/check-typescript-errors.js');
    writeSummary(`\n## Final Error Check`);
    
    console.log('\n✅ All TypeScript fix scripts have been executed successfully');
    writeSummary(`\n## Execution Completed: ${new Date().toISOString()}`);
    writeSummary(`\n## Summary\n\nThe comprehensive TypeScript fix script has addressed the following types of errors:\n\n- TS2300: Duplicate identifier issues\n- TS2304: Missing imports\n- TS2305: Module import issues\n- Responsive props typing issues\n- Component interface problems\n- Import pattern inconsistencies\n- Chakra UI V3 compatibility issues\n\nPlease check the TypeScript error count output above for the final result.`);
    
    console.log(`\n📝 Results have been written to ${SUMMARY_FILE}`);
    
  } catch (error) {
    console.error(`❌ Error executing fix scripts: ${error.message}`);
    writeSummary(`\n## Error\n\nThe script encountered an error: ${error.message}\n\n## Execution Failed: ${new Date().toISOString()}`);
    process.exit(1);
  }
}

// Helper function to execute shell commands and capture output
async function execCommand(command) {
  return new Promise((resolve, reject) => {
    try {
      // Execute command and capture output for the summary
      const output = execSync(command, { encoding: 'utf8' });
      
      // Write command output to the console
      console.log(output);
      
      // Write a summarized version to the summary file
      const lines = output.split('\n');
      const summaryLines = lines.filter(line => 
        line.includes('Files fixed:') || 
        line.includes('Imports added:') || 
        line.includes('Found ') || 
        line.includes('Added ') || 
        line.includes('TypeScript errors')
      );
      
      if (summaryLines.length > 0) {
        writeSummary('```\n' + summaryLines.join('\n') + '\n```');
      }
      
      resolve();
    } catch (error) {
      console.error(`Error executing command: ${command}`);
      console.error(error.message);
      reject(error);
    }
  });
}

// Run the comprehensive fix
runAllFixScripts();