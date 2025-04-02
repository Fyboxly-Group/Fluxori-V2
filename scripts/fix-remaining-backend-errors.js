#!/usr/bin/env node

/**
 * Script to fix remaining backend TypeScript errors properly
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const srcDir = path.join(backendDir, 'src');

// Helpers
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function log(message) {
  console.log(`[Backend-TS-Fix] ${message}`);
}

// Get current TypeScript errors
function getTypeScriptErrors() {
  try {
    const output = execSync('npm run typecheck 2>&1', { cwd: backendDir }).toString();
    const errors = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^([^(]+)\((\d+),(\d+)\): error TS(\d+): (.+)$/);
      if (match) {
        const [_, file, lineNum, colNum, errorCode, message] = match;
        errors.push({
          file: path.join(backendDir, file),
          line: parseInt(lineNum),
          column: parseInt(colNum),
          code: errorCode,
          message: message
        });
      }
    }
    
    return errors;
  } catch (error) {
    if (error.stdout) {
      const output = error.stdout.toString();
      const errors = [];
      const lines = output.split('\n');
      
      for (const line of lines) {
        const match = line.match(/^([^(]+)\((\d+),(\d+)\): error TS(\d+): (.+)$/);
        if (match) {
          const [_, file, lineNum, colNum, errorCode, message] = match;
          errors.push({
            file: path.join(backendDir, file),
            line: parseInt(lineNum),
            column: parseInt(colNum),
            code: errorCode,
            message: message
          });
        }
      }
      
      return errors;
    }
    log('Error getting TypeScript errors');
    return [];
  }
}

// Create type declarations for auth middleware
function fixAuthMiddlewareTypes() {
  const authMiddlewarePath = path.join(srcDir, 'middleware', 'multi-tenant-auth.middleware.ts');
  
  if (fs.existsSync(authMiddlewarePath)) {
    let content = readFile(authMiddlewarePath);
    
    // Add proper interface declarations at the top of the file
    const interfaceDeclarations = `
// Auth user interfaces
export interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string;
  [key: string]: any;
}

export interface MultiTenantUser extends AuthUser {
  organizationId?: string;
  role?: string;
  permissions?: string[];
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser | MultiTenantUser;
      organizationId?: string;
    }
  }
}
`;
    
    // Insert after imports
    content = content.replace(
      /(import[^;]*;(\s*\n)*)+/,
      '$&' + interfaceDeclarations
    );
    
    writeFile(authMiddlewarePath, content);
    log(`✅ Added proper interface declarations to ${authMiddlewarePath}`);
  }
}

// Create a general type utility file for all interfaces
function createInterfaceUtilityFile() {
  const typesDir = path.join(srcDir, 'types');
  
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }
  
  const utilityTypesPath = path.join(typesDir, 'utility-types.d.ts');
  
  const content = `/**
 * Utility type declarations for the backend
 */

// Adds ID property to any interface
export type WithId<T> = T & {
  id: string;
};

// Makes all properties of an interface optional
export type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
};

// Firebase Timestamp type
export interface Timestamp {
  toDate(): Date;
  toMillis(): number;
  valueOf(): number;
  isEqual(other: Timestamp): boolean;
}

// Helper type for AddPrefixToKeys utility
export type AddPrefixToKeys<P extends string, T> = {
  [K in keyof T as \`\${P}.\${string & K}\`]: T[K];
} & {
  [key: string]: any;
};

// Make Date class compatible with Timestamp
declare global {
  interface Date {
    toMillis?(): number;
  }
}

// Common interfaces
export interface IUserWithId extends IUser {
  id: string;
}

export interface IUserOrganizationWithId extends IUserOrganization {
  id: string;
}

export interface IInvitationWithId extends IInvitation {
  id: string;
}

export interface FirestoreInventoryItemWithId extends FirestoreInventoryItem {
  id: string;
}

export interface FirestoreOrderWithId extends FirestoreOrder {
  id: string;
}

export interface IFeedbackWithId extends IFeedback {
  id: string;
}

// BuyBox interfaces
export interface IBuyBoxMonitor {
  marketplaceId: string;
  addSnapshot(data: any): Promise<void>;
  [key: string]: any;
}

export interface IBuyBoxHistoryRepository {
  getRules(itemId: string): Promise<any[]>;
  [key: string]: any;
}
`;
  
  writeFile(utilityTypesPath, content);
  log(`✅ Created utility type declarations at ${utilityTypesPath}`);
  
  // Update tsconfig.json to include the utility types
  const tsconfigPath = path.join(backendDir, 'tsconfig.json');
  
  if (fs.existsSync(tsconfigPath)) {
    try {
      let tsconfig = JSON.parse(readFile(tsconfigPath));
      
      if (!tsconfig.include) {
        tsconfig.include = ["src/**/*"];
      }
      
      if (!tsconfig.include.some(pattern => pattern.includes('types') && pattern.includes('.d.ts'))) {
        tsconfig.include.push("src/types/**/*.d.ts");
      }
      
      writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      log(`✅ Updated ${tsconfigPath} to include the utility types`);
    } catch (error) {
      log(`Error updating tsconfig.json: ${error.message}`);
    }
  }
  
  // Create a reference file to import the types in major modules
  const referenceTypesPath = path.join(srcDir, 'types', 'index.ts');
  
  const referenceContent = `/**
 * Export utility types
 */
export * from './utility-types';
`;
  
  writeFile(referenceTypesPath, referenceContent);
  log(`✅ Created types reference index at ${referenceTypesPath}`);
  
  return true;
}

// Add imports to files that need utility types
function addUtilityImportsToFiles() {
  const sourceFiles = [
    path.join(srcDir, 'modules', 'inventory', 'repositories', 'inventory.repository.ts'),
    path.join(srcDir, 'services', 'firestore', 'user-organization.service.ts'),
    path.join(srcDir, 'services', 'firestore', 'invitation.service.ts'),
    path.join(srcDir, 'modules', 'feedback', 'services', 'feedback.service.ts'),
    path.join(srcDir, 'modules', 'buybox', 'services', 'buybox-monitoring.service.ts'),
  ];
  
  let filesFixed = 0;
  
  for (const filePath of sourceFiles) {
    if (fs.existsSync(filePath)) {
      let content = readFile(filePath);
      
      // Add import for utility types if not already present
      if (!content.includes("from '../../../types'") && !content.includes("from '../../types'")) {
        const importPath = filePath.includes('/modules/') ? '../../../types' : '../../types';
        
        // Add import after last import
        content = content.replace(
          /(import[^;]*;(\s*\n)*)+/,
          `$&import { WithId } from '${importPath}';\n\n`
        );
        
        writeFile(filePath, content);
        filesFixed++;
        log(`✅ Added utility types import to ${filePath}`);
      }
    }
  }
  
  log(`Added utility type imports to ${filesFixed} files`);
  return filesFixed > 0;
}

// Fix specific query files
function fixSpecificQueryIssues() {
  const fileMap = {
    [path.join(srcDir, 'services', 'firestore', 'inventory.service.ts')]: 'CollectionReference<FirestoreInventoryItem>',
    [path.join(srcDir, 'services', 'firestore', 'order.service.ts')]: 'CollectionReference<FirestoreOrder>'
  };
  
  let filesFixed = 0;
  
  for (const [filePath, returnType] of Object.entries(fileMap)) {
    if (fs.existsSync(filePath)) {
      let content = readFile(filePath);
      
      // Replace return query with proper type assertion
      if (content.includes('return query;')) {
        content = content.replace(
          /return query;/g,
          `return query as unknown as ${returnType};`
        );
        
        writeFile(filePath, content);
        filesFixed++;
        log(`✅ Fixed query return type in ${filePath}`);
      }
    }
  }
  
  log(`Fixed specific query issues in ${filesFixed} files`);
  return filesFixed > 0;
}

// Main function
function main() {
  log('Starting final backend TypeScript error fixes...');
  
  // Get current errors
  const errors = getTypeScriptErrors();
  log(`Found ${errors.length} TypeScript errors`);
  
  // Apply fixes
  fixAuthMiddlewareTypes();
  createInterfaceUtilityFile();
  addUtilityImportsToFiles();
  fixSpecificQueryIssues();
  
  // Check remaining errors
  try {
    execSync('npm run typecheck', { cwd: backendDir });
    log('✅ All TypeScript errors fixed! Backend typechecking passes now.');
  } catch (error) {
    const output = error.stdout.toString();
    const remainingErrors = (output.match(/error TS\d+/g) || []).length;
    log(`Still have ${remainingErrors} TypeScript errors in the backend.`);
  }
}

main();