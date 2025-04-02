/**
 * Fix all TypeScript errors in the frontend codebase
 * 
 * This script runs all the specialized fix scripts in sequence to
 * systematically eliminate TypeScript errors
 */

const { execSync } = require('child_process');
const path = require('path');

// Root directory
const ROOT_DIR = process.cwd();

// Scripts to run in order
const SCRIPTS = [
  'fix-chakra-v3-props.js',      // Fix Chakra UI v3 prop naming issues
  'fix-module-declarations.js',   // Fix missing module declarations and imports 
  'fix-component-issues.js',      // Fix component-specific issues
];

function countRemainingErrors() {
  try {
    console.log('🔍 Checking remaining TypeScript errors...');
    execSync('npx tsc --noEmit 2>/dev/null', { cwd: ROOT_DIR, stdio: ['ignore', 'ignore', 'ignore'] });
    return 0;
  } catch (error) {
    const errorOutput = error.stderr ? error.stderr.toString() : (error.stdout ? error.stdout.toString() : '');
    const matches = errorOutput.match(/error TS\d+/g);
    return matches ? matches.length : 0;
  }
}

function printSummary(script, beforeCount, afterCount) {
  const fixed = beforeCount - afterCount;
  const percentFixed = ((fixed / beforeCount) * 100).toFixed(2);
  
  console.log(`\n📊 Summary for ${script}:`);
  console.log(`  Errors before: ${beforeCount}`);
  console.log(`  Errors after:  ${afterCount}`);
  console.log(`  Fixed:         ${fixed} (${percentFixed}%)`);
  console.log('  ' + '='.repeat(40));
}

function main() {
  try {
    console.log('🚀 Starting TypeScript error fix script');
    
    // Count initial errors
    const initialErrorCount = countRemainingErrors();
    console.log(`🔍 Initial TypeScript error count: ${initialErrorCount}`);
    
    // Run each script in order
    let previousErrorCount = initialErrorCount;
    
    for (const script of SCRIPTS) {
      console.log(`\n📝 Running ${script}...`);
      try {
        execSync(`node ${path.join('scripts', script)}`, { 
          cwd: ROOT_DIR, 
          stdio: 'inherit' 
        });
        
        // Count errors after this script
        const currentErrorCount = countRemainingErrors();
        printSummary(script, previousErrorCount, currentErrorCount);
        previousErrorCount = currentErrorCount;
        
      } catch (error) {
        console.error(`❌ Error running ${script}:`, error.message);
      }
    }
    
    // Final error count
    const finalErrorCount = countRemainingErrors();
    const totalFixed = initialErrorCount - finalErrorCount;
    const percentFixed = ((totalFixed / initialErrorCount) * 100).toFixed(2);
    
    console.log('\n📊 Overall Results:');
    console.log(`  Initial errors:  ${initialErrorCount}`);
    console.log(`  Remaining errors: ${finalErrorCount}`);
    console.log(`  Total fixed:     ${totalFixed} (${percentFixed}%)`);
    
    if (finalErrorCount === 0) {
      console.log('\n🎉 All TypeScript errors fixed successfully!');
    } else {
      console.log(`\n⚠️ ${finalErrorCount} TypeScript errors remain. Run the script again or fix manually.`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();