/**
 * Master script to run all TypeScript error fixing scripts
 * and check the error count at each step
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');

// Helper function to count TypeScript errors
function countTypeScriptErrors() {
  try {
    // Run tsc with --noEmit and capture stderr
    const tscOutput = execSync('cd ' + BACKEND_DIR + ' && npx tsc --noEmit', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return 0; // No errors if we got here
  } catch (error) {
    // Count error lines, which start with a filename and end with an error code in parentheses
    const errorLines = (error.stderr || error.stdout || '')
      .split('\n')
      .filter(line => /^.+\(\d+,\d+\): error TS\d+:/.test(line));
    return errorLines.length;
  }
}

// Helper function to run a script and report results
function runScript(scriptName, description) {
  console.log(`\n========== Running ${description} ==========`);
  
  const beforeErrors = countTypeScriptErrors();
  console.log(`TypeScript errors before running ${scriptName}: ${beforeErrors}`);
  
  try {
    execSync(`node ${path.join(__dirname, scriptName)}`, { 
      encoding: 'utf8', 
      stdio: 'inherit'
    });
    
    const afterErrors = countTypeScriptErrors();
    console.log(`TypeScript errors after running ${scriptName}: ${afterErrors}`);
    console.log(`Errors fixed: ${beforeErrors - afterErrors}`);
    
    return {
      before: beforeErrors,
      after: afterErrors,
      fixed: beforeErrors - afterErrors
    };
  } catch (error) {
    console.error(`Error running ${scriptName}:`, error.message);
    return {
      before: beforeErrors,
      after: beforeErrors,
      fixed: 0,
      error: error.message
    };
  }
}

// Main function to run all scripts
async function main() {
  console.log('====================================================');
  console.log('STARTING TYPESCRIPT ERROR FIX PROCESS');
  console.log('====================================================');
  
  const initialErrorCount = countTypeScriptErrors();
  console.log(`\nInitial TypeScript error count: ${initialErrorCount}`);
  
  const results = [];
  
  // Run each script and collect results
  results.push(runScript('fix-instantiation-property-access.js', 'Fix for instantiation expression errors (TS1477)'));
  results.push(runScript('fix-international-trade-errors.js', 'Fix for international-trade module errors'));
  results.push(runScript('fix-remaining-typescript-errors.js', 'General fix for remaining TypeScript errors'));
  
  // Additional scripts using the ts-migration-toolkit from TYPESCRIPT-AUTOMATION.md
  results.push(runScript('../backend/scripts/ts-migration-toolkit.js --fix=mongoose', 'Mongoose-specific fixes'));
  results.push(runScript('../backend/scripts/ts-migration-toolkit.js --fix=express', 'Express-specific fixes'));
  results.push(runScript('../backend/scripts/ts-migration-toolkit.js --fix=async', 'Async/Promise fixes'));
  results.push(runScript('../backend/scripts/ts-migration-toolkit.js --fix=errors', 'Error handling fixes'));
  
  // Final error count
  const finalErrorCount = countTypeScriptErrors();
  
  console.log('\n====================================================');
  console.log('TYPESCRIPT ERROR FIX PROCESS SUMMARY');
  console.log('====================================================');
  console.log(`Initial error count: ${initialErrorCount}`);
  console.log(`Final error count: ${finalErrorCount}`);
  console.log(`Total errors fixed: ${initialErrorCount - finalErrorCount}`);
  console.log(`Success rate: ${((initialErrorCount - finalErrorCount) / initialErrorCount * 100).toFixed(2)}%`);
  
  // Table of results
  console.log('\nScript Results:');
  console.log('-----------------------------------------------------------------');
  console.log('| Script                                | Before | After | Fixed |');
  console.log('-----------------------------------------------------------------');
  results.forEach(result => {
    const scriptName = Object.keys(result).includes('error') ? `${Object.keys(result)[0]}*` : Object.keys(result)[0];
    console.log(`| ${scriptName.padEnd(36)} | ${result.before.toString().padStart(6)} | ${result.after.toString().padStart(5)} | ${result.fixed.toString().padStart(5)} |`);
  });
  console.log('-----------------------------------------------------------------');
  
  // Write results to a file for reference
  fs.writeFileSync(
    path.join(ROOT_DIR, 'typescript-fix-results.json'), 
    JSON.stringify({
      initialErrorCount,
      finalErrorCount,
      totalFixed: initialErrorCount - finalErrorCount,
      successRate: ((initialErrorCount - finalErrorCount) / initialErrorCount * 100).toFixed(2) + '%',
      scriptResults: results
    }, null, 2)
  );
  
  console.log('\nResults saved to typescript-fix-results.json');
}

main().catch(error => {
  console.error('Error in main process:', error);
  process.exit(1);
});