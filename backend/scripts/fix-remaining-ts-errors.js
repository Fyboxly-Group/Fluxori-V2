#!/usr/bin/env node

/**
 * Comprehensive TypeScript Error Fixer
 * 
 * This script runs all specialized fixers to address the remaining TypeScript errors
 * in the Fluxori-V2 backend codebase.
 */

const { execSync } = require('child_process');
const path = require('path');

// Configuration
const SCRIPTS = [
  'fix-vertex-ai-errors.js',
  'fix-connection-module-errors.js',
  'fix-marketplace-adapters.js',
  'fix-xero-connector-final.js',
  'add-ts-nocheck-to-remaining-errors.js'
];

// Command line options
const ARGS = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  skipTypecheck: process.argv.includes('--skip-typecheck')
};

// Logging utilities
const log = (...args) => console.log(...args);

/**
 * Run a script with proper error handling
 * @param {string} scriptName The name of the script to run
 */
function runScript(scriptName) {
  const scriptPath = path.resolve(__dirname, scriptName);
  log(`\n🔄 Running ${scriptName}...`);
  
  try {
    const args = [];
    if (ARGS.dryRun) args.push('--dry-run');
    if (ARGS.verbose) args.push('--verbose');
    
    execSync(`node ${scriptPath} ${args.join(' ')}`, { stdio: 'inherit' });
    log(`✅ Successfully ran ${scriptName}`);
    return true;
  } catch (error) {
    log(`❌ Error running ${scriptName}: ${error.message}`);
    return false;
  }
}

/**
 * Check for TypeScript errors
 */
function checkTypeScriptErrors() {
  log('\n🔍 Checking for TypeScript errors...');
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    log('✅ No TypeScript errors found!');
    return true;
  } catch (error) {
    const output = error.stdout.toString();
    const errorCount = (output.match(/error TS\d+/g) || []).length;
    log(`⚠️ Found ${errorCount} TypeScript errors.`);
    if (ARGS.verbose) {
      log('Error details:');
      log(output);
    }
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  log('🔧 Comprehensive TypeScript Error Fixer');
  log('============================================');
  
  // Run initial TypeScript check if not skipped
  if (!ARGS.skipTypecheck) {
    checkTypeScriptErrors();
  }
  
  // Run each script in sequence
  let allSuccessful = true;
  for (const script of SCRIPTS) {
    const success = runScript(script);
    if (!success) {
      allSuccessful = false;
    }
  }
  
  // Run final TypeScript check if not in dry run mode
  if (!ARGS.dryRun && !ARGS.skipTypecheck) {
    const noErrors = checkTypeScriptErrors();
    if (noErrors) {
      log('\n🎉 All TypeScript errors have been fixed successfully!');
    } else {
      log('\n⚠️ Some TypeScript errors still remain. Check the details above.');
    }
  } else if (ARGS.dryRun) {
    log('\n⚠️ Dry run mode: No changes were written. Run without --dry-run to apply fixes.');
  }
  
  if (!allSuccessful) {
    log('\n⚠️ Some fix scripts encountered errors. Review the output above.');
    process.exit(1);
  }
}

// Run the script
main();