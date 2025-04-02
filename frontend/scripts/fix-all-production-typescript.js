#!/usr/bin/env node

/**
 * Fix all production TypeScript errors
 * 
 * This script orchestrates all the specialized fix scripts to address
 * TypeScript errors in production code without resorting to @ts-nocheck
 */

const { execSync } = require('child_process');
const path = require('path');

// Root directory
const ROOT_DIR = process.cwd();

// Function to count current TypeScript errors
function countTypeScriptErrors() {
  try {
    execSync('npx tsc --noEmit', { 
      cwd: ROOT_DIR 
    });
    return 0;
  } catch (error) {
    if (error.stdout) {
      const output = error.stdout.toString();
      const errorMatches = output.match(/error TS\d+/g);
      return errorMatches ? errorMatches.length : 0;
    }
    // If we can't get the error output, run grep to count errors
    try {
      const output = execSync('npx tsc --noEmit 2>&1 | grep -c "error TS"', {
        cwd: ROOT_DIR,
        shell: true
      });
      return parseInt(output.toString().trim());
    } catch (grepError) {
      console.error('Error counting TypeScript errors:', grepError.message);
      return -1;
    }
  }
}

// Function to run a fix script and report on its effectiveness
function runFixScript(scriptName, description) {
  console.log(`\n📋 Running ${description}...`);
  
  const beforeCount = countTypeScriptErrors();
  console.log(`🔍 Current TypeScript errors: ${beforeCount}`);
  
  try {
    // Execute the script
    execSync(`node scripts/${scriptName}`, {
      cwd: ROOT_DIR,
      stdio: 'inherit'
    });
    
    // Count errors after running the script
    const afterCount = countTypeScriptErrors();
    const fixedCount = beforeCount - afterCount;
    
    console.log(`\n📊 Results for ${description}:`);
    console.log(`  Errors before: ${beforeCount}`);
    console.log(`  Errors after:  ${afterCount}`);
    console.log(`  Fixed:         ${fixedCount} (${Math.round((fixedCount / beforeCount) * 100)}%)`);
    
    return { beforeCount, afterCount, fixedCount };
  } catch (error) {
    console.error(`❌ Error running ${scriptName}:`, error.message);
    return { beforeCount, afterCount: beforeCount, fixedCount: 0 };
  }
}

// Main function
async function main() {
  console.log('🚀 Starting comprehensive TypeScript error fix for production code');
  
  // Count initial errors
  const initialErrorCount = countTypeScriptErrors();
  console.log(`🔍 Initial TypeScript error count: ${initialErrorCount}`);
  
  if (initialErrorCount === 0) {
    console.log('✅ No TypeScript errors found! The codebase is already clean.');
    return;
  }
  
  // Run all fix scripts in a specific order
  const fixScripts = [
    { name: 'fix-chakra-ui-v3-patterns.js', description: 'Chakra UI v3 pattern fixes' },
    { name: 'fix-jsx-closing-tags.js', description: 'JSX tag structure fixes' },
    { name: 'fix-chakra-v3-components.js', description: 'Chakra UI v3 component fixes' },
    { name: 'fix-typescript-syntax.js', description: 'TypeScript syntax fixes' },
    { name: 'fix-jsx-structure.js', description: 'JSX deep structure fixes' },
    { name: 'fix-component-issues.js', description: 'Component-specific fixes' },
    { name: 'fix-frontend-ts-errors.js', description: 'Generic TypeScript error fixes' }
  ];
  
  let currentErrorCount = initialErrorCount;
  
  for (const script of fixScripts) {
    const result = runFixScript(script.name, script.description);
    currentErrorCount = result.afterCount;
    
    if (currentErrorCount === 0) {
      console.log('\n🎉 All TypeScript errors fixed successfully!');
      break;
    }
  }
  
  // Final error count
  const finalErrorCount = countTypeScriptErrors();
  const totalFixed = initialErrorCount - finalErrorCount;
  const percentFixed = Math.round((totalFixed / initialErrorCount) * 100);
  
  console.log('\n📊 Overall Results:');
  console.log(`  Initial errors:   ${initialErrorCount}`);
  console.log(`  Remaining errors: ${finalErrorCount}`);
  console.log(`  Total fixed:      ${totalFixed} (${percentFixed}%)`);
  
  if (finalErrorCount === 0) {
    console.log('\n🎉 All TypeScript errors fixed successfully!');
  } else {
    console.log(`\n⚠️ ${finalErrorCount} TypeScript errors remain.`);
    console.log('  Consider reviewing the remaining errors manually.');
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});