const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Analyzing TypeScript Errors...');

// Create a temporary tsconfig for error checking
const tempTsConfigPath = path.resolve(__dirname, '../tsconfig.analyze.json');
const tempTsConfig = {
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "typeRoots": ["./node_modules/@types", "./src/types"],
    "noImplicitAny": false,
    "strictNullChecks": false,
    "strictFunctionTypes": false,
    "noImplicitThis": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "strictPropertyInitialization": false,
    "strictBindCallApply": false,
    "allowSyntheticDefaultImports": true,
    "noFallthroughCasesInSwitch": false,
    "noUncheckedIndexedAccess": false
  },
  "include": [
    "next-env.d.ts",
    "src/**/*.ts",
    "src/**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "**/__tests__/**/*.ts",
    "**/__tests__/**/*.tsx",
    "jest.config.js",
    "jest.setup.js",
    "src/types/User.d.ts",
    "src/types/user.d.ts"
  ]
};

// Write the temporary config
fs.writeFileSync(tempTsConfigPath, JSON.stringify(tempTsConfig, null, 2), 'utf8');

// Create a file to store the error output
const errorOutputPath = path.resolve(__dirname, '../typescript-errors.log');

try {
  // Run TypeScript check and save output to file
  execSync(`npx tsc --noEmit --project ${tempTsConfigPath} > ${errorOutputPath} 2>&1 || true`);
  
  // Read error file
  const errorOutput = fs.readFileSync(errorOutputPath, 'utf8');
  
  // Parse errors
  const errors = [];
  const lines = errorOutput.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const errorMatch = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/);
    
    if (errorMatch) {
      const [_, filePath, lineNum, colNum, errorCode, message] = errorMatch;
      errors.push({
        file: filePath,
        line: parseInt(lineNum),
        column: parseInt(colNum),
        code: parseInt(errorCode),
        message: message
      });
    }
  }
  
  // Count errors by type
  const errorsByType = {};
  errors.forEach(error => {
    errorsByType[error.code] = (errorsByType[error.code] || 0) + 1;
  });
  
  // Count errors by file
  const errorsByFile = {};
  errors.forEach(error => {
    const fileName = path.basename(error.file);
    errorsByFile[fileName] = (errorsByFile[fileName] || 0) + 1;
  });
  
  // Count errors by directory
  const errorsByDir = {};
  errors.forEach(error => {
    const dir = path.dirname(error.file);
    const dirParts = dir.split('/');
    const category = dirParts.slice(0, 3).join('/');
    errorsByDir[category] = (errorsByDir[category] || 0) + 1;
  });
  
  // Analyze duplicate identifier errors (TS2300)
  const duplicateIdentifiers = {};
  errors.filter(error => error.code === 2300).forEach(error => {
    const match = error.message.match(/Duplicate identifier ['"]([^'"]+)['"]/);
    if (match && match[1]) {
      const identifier = match[1];
      duplicateIdentifiers[identifier] = (duplicateIdentifiers[identifier] || 0) + 1;
    }
  });
  
  // Analyze missing identifier errors (TS2304)
  const missingIdentifiers = {};
  errors.filter(error => error.code === 2304).forEach(error => {
    const match = error.message.match(/Cannot find name ['"]([^'"]+)['"]/);
    if (match && match[1]) {
      const identifier = match[1];
      missingIdentifiers[identifier] = (missingIdentifiers[identifier] || 0) + 1;
    }
  });
  
  // Output summary
  console.log(`\n📊 Found ${errors.length} TypeScript errors`);
  
  console.log('\n📊 Errors by Type:');
  Object.entries(errorsByType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([code, count]) => {
      console.log(`TS${code}: ${count} errors`);
    });
  
  console.log('\n📊 Top Files with Errors:');
  Object.entries(errorsByFile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([file, count]) => {
      console.log(`${file}: ${count} errors`);
    });
  
  console.log('\n📊 Errors by Directory:');
  Object.entries(errorsByDir)
    .sort((a, b) => b[1] - a[1])
    .forEach(([dir, count]) => {
      console.log(`${dir}: ${count} errors`);
    });
  
  // Output most common duplicate identifiers
  console.log('\n📊 Top Duplicate Identifiers (TS2300):');
  Object.entries(duplicateIdentifiers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([identifier, count]) => {
      console.log(`${identifier}: ${count} occurrences`);
    });
  
  // Output most common missing identifiers
  console.log('\n📊 Top Missing Identifiers (TS2304):');
  Object.entries(missingIdentifiers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([identifier, count]) => {
      console.log(`${identifier}: ${count} occurrences`);
    });
  
  // Analyze the most frequent error patterns
  console.log('\n📊 Common Error Patterns:');
  const errorPatterns = {};
  errors.forEach(error => {
    // Create a simplified pattern from the error message
    let pattern = error.message
      .replace(/['"][-\w]+['"]/g, 'IDENTIFIER')  // Replace identifiers 
      .replace(/[0-9]+/g, 'NUMBER');             // Replace numbers
    
    errorPatterns[pattern] = (errorPatterns[pattern] || 0) + 1;
  });
  
  Object.entries(errorPatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([pattern, count]) => {
      console.log(`${count} errors: ${pattern}`);
    });
  
  // Create individual lists of files with specific error types
  const commonErrorTypes = [2300, 2304, 2305, 2786, 2339, 2607];
  
  commonErrorTypes.forEach(errorCode => {
    const filesWithError = {};
    
    errors.filter(error => error.code === errorCode).forEach(error => {
      const fileName = error.file;
      filesWithError[fileName] = (filesWithError[fileName] || 0) + 1;
    });
    
    // Save to file
    const outputPath = path.resolve(__dirname, `../ts${errorCode}-files.txt`);
    const fileOutput = Object.entries(filesWithError)
      .sort((a, b) => b[1] - a[1])
      .map(([file, count]) => `${file} (${count})`)
      .join('\n');
    
    fs.writeFileSync(outputPath, fileOutput);
    console.log(`\n✅ Saved list of files with TS${errorCode} errors to ts${errorCode}-files.txt`);
  });
  
  console.log('\n🎯 Recommendations:');
  
  // Based on error analysis, provide recommendations
  if (errorsByType[2300] > 0) {
    console.log("1. Fix duplicate identifier issues by correcting import statements");
    console.log("   - Create a script to normalize Chakra UI imports");
    console.log("   - Ensure components are imported from only one source");
  }
  
  if (errorsByType[2304] > 0) {
    console.log("2. Add missing identifiers by creating type declarations");
    console.log("   - Create type declarations for commonly used components");
    console.log("   - Ensure all Chakra UI components have proper imports");
  }
  
  if (errorsByType[2305] > 0) {
    console.log("3. Fix module import issues by updating import paths");
    console.log("   - Update to Chakra UI V3 import patterns");
    console.log("   - Fix incorrect module paths");
  }
  
  console.log("\n4. Establish a consistent import strategy for Chakra UI");
  console.log("   - Either use direct imports everywhere or utility imports, but not both");
  console.log("   - Create helper utilities to simplify imports");
  
  console.log("\n5. Create comprehensive type declarations for Chakra UI V3");
  console.log("   - Follow TYPESCRIPT-AUTOMATION.md guidance");
  console.log("   - Generate types automatically where possible");
  
} catch (error) {
  console.error(`❌ Error analyzing TypeScript errors: ${error.message}`);
} finally {
  // Clean up
  if (fs.existsSync(tempTsConfigPath)) {
    fs.unlinkSync(tempTsConfigPath);
  }
}