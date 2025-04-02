const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking TypeScript Errors...');

// Create a temporary tsconfig for error checking
const tempTsConfigPath = path.resolve(__dirname, '../tsconfig.temp.json');
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

fs.writeFileSync(tempTsConfigPath, JSON.stringify(tempTsConfig, null, 2), 'utf8');

// Run TypeScript check and count errors
exec('npx tsc --noEmit --project tsconfig.temp.json', { cwd: path.resolve(__dirname, '..') }, (error, stdout, stderr) => {
  // Remove the temporary config file
  fs.unlinkSync(tempTsConfigPath);
  
  if (error) {
    console.log('❌ TypeScript check failed with errors:');
    
    // Count the number of errors
    const errorMatch = stderr.match(/error TS\d+:/g);
    const errorCount = errorMatch ? errorMatch.length : 0;
    
    console.log(`🔢 Total TypeScript errors: ${errorCount}`);
    
    // Group errors by file and type
    const errorsByFile = {};
    const errorLines = stderr.split('\n').filter(line => line.includes('error TS'));
    
    errorLines.forEach(line => {
      const fileMatch = line.match(/(\/[^:]+):\d+:\d+/);
      const errorTypeMatch = line.match(/error TS(\d+):/);
      
      if (fileMatch && errorTypeMatch) {
        const filePath = fileMatch[1];
        const fileName = path.basename(filePath);
        const errorType = errorTypeMatch[1];
        
        if (!errorsByFile[fileName]) {
          errorsByFile[fileName] = { count: 0, types: {} };
        }
        
        errorsByFile[fileName].count++;
        
        if (!errorsByFile[fileName].types[errorType]) {
          errorsByFile[fileName].types[errorType] = 0;
        }
        
        errorsByFile[fileName].types[errorType]++;
      }
    });
    
    // Show errors by file
    console.log('\n📊 Errors by File:');
    Object.entries(errorsByFile)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
      .forEach(([fileName, data]) => {
        console.log(`${fileName}: ${data.count} errors`);
      });
    
    // Show most common error types
    const errorTypes = {};
    Object.values(errorsByFile).forEach(fileData => {
      Object.entries(fileData.types).forEach(([type, count]) => {
        if (!errorTypes[type]) {
          errorTypes[type] = 0;
        }
        errorTypes[type] += count;
      });
    });
    
    console.log('\n📊 Most Common Error Types:');
    Object.entries(errorTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([type, count]) => {
        console.log(`TS${type}: ${count} occurrences`);
      });
      
  } else {
    console.log('✅ No TypeScript errors found!');
  }
});