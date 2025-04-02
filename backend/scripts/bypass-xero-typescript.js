#!/usr/bin/env node

/**
 * This script creates a type bypass for the xero-node package.
 * It creates two strategies:
 * 1. A d.ts file to define axios types needed by xero-node
 * 2. Updates the tsconfig.json to skip checking node_modules
 * 
 * Usage:
 * node scripts/bypass-xero-typescript.js
 */

const fs = require('fs');
const path = require('path');

// Terminal colors for output
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m'
};

console.log(`${COLORS.CYAN}🔧 Xero TypeScript Bypass${COLORS.RESET}`);
console.log(`${COLORS.CYAN}=========================${COLORS.RESET}`);
console.log(`This script creates a bypass for xero-node TypeScript errors.`);

// Define axios types needed by xero-node
const axiosTypesContent = `// Type definitions to satisfy xero-node requirements
declare module 'axios' {
  export interface AxiosRequestConfig {
    headers?: any;
    params?: any;
    data?: any;
    method?: string;
    url?: string;
    baseURL?: string;
    responseType?: string;
    withCredentials?: boolean;
  }
  
  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
    request?: any;
  }
}

// Type definitions to help with xero-node XeroClient
declare module 'xero-node' {
  export interface XeroClient {
    buildConsentUrl(state: string): string;
  }
}
`;

// Update tsconfig to skip node_modules checking
function updateTsConfig() {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  
  // Read current tsconfig
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
  
  // Add skipLibCheck if not present or ensure it's true
  tsConfig.compilerOptions.skipLibCheck = true;
  
  // Write back
  fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2), 'utf-8');
  console.log(`${COLORS.GREEN}✅ Updated tsconfig.json to skip library checking${COLORS.RESET}`);
}

// Create a declaration file for axios
function createAxiosTypeDeclaration() {
  const typesDirPath = path.join(process.cwd(), 'src/types');
  
  // Create types directory if it doesn't exist
  if (!fs.existsSync(typesDirPath)) {
    fs.mkdirSync(typesDirPath, { recursive: true });
  }
  
  // Create the d.ts file
  const axiosTypesPath = path.join(typesDirPath, 'axios-xero.d.ts');
  fs.writeFileSync(axiosTypesPath, axiosTypesContent, 'utf-8');
  console.log(`${COLORS.GREEN}✅ Created type declarations at ${axiosTypesPath}${COLORS.RESET}`);
}

// Main execution
try {
  updateTsConfig();
  createAxiosTypeDeclaration();
  
  console.log(`\n${COLORS.GREEN}🎉 Xero TypeScript bypass applied successfully!${COLORS.RESET}`);
  console.log(`\nNext steps:`);
  console.log(`1. Run TypeScript check to confirm errors are resolved:`);
  console.log(`   $ npx tsc --noEmit src/modules/xero-connector/**/*.ts`);
  console.log(`2. If errors persist in test files, use the fix-xero-test-files.js script`);
} catch (error) {
  console.error(`${COLORS.RED}Error: ${error.message}${COLORS.RESET}`);
}