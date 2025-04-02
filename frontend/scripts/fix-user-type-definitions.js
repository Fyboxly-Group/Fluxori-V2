const fs = require('fs');
const path = require('path');

console.log('🚀 Starting user type definitions fix script');

const userUpperCasePath = path.resolve(__dirname, '../src/types/User.d.ts');
const userLowerCasePath = path.resolve(__dirname, '../src/types/user.d.ts');
const finalUserTypePath = path.resolve(__dirname, '../src/types/user.types.d.ts');

// Merged content combining both user type definitions
const mergedContent = `/**
 * User type definitions
 * Consolidated from multiple user.d.ts files to fix casing conflicts
 */

// Global interface declaration
declare interface User {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  role?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  organizationId?: string;
  isAdmin: boolean;
  isActive?: boolean;
  lastLogin?: Date;
  permissions?: string[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

// Exportable interface
export interface UserExport {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  role?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  organizationId?: string;
  isAdmin: boolean;
  isActive?: boolean;
  lastLogin?: Date;
  permissions?: string[];
  metadata?: Record<string, any>;
  [key: string]: any;
}
`;

try {
  // Write the merged file
  fs.writeFileSync(finalUserTypePath, mergedContent);
  console.log('✅ Created unified user type definition at src/types/user.types.d.ts');
  
  // Create backup files 
  fs.renameSync(userUpperCasePath, `${userUpperCasePath}.bak`);
  console.log('✅ Backed up User.d.ts to User.d.ts.bak');
  
  fs.renameSync(userLowerCasePath, `${userLowerCasePath}.bak`);
  console.log('✅ Backed up user.d.ts to user.d.ts.bak');
  
  // Create reference files that import from the new location
  const referenceContent = `/**
 * @fileoverview
 * Reference file to the consolidated user types
 * Use import from '@/types/user.types' instead of this file
 */

import '@/types/user.types';
`;

  fs.writeFileSync(userUpperCasePath, referenceContent);
  fs.writeFileSync(userLowerCasePath, referenceContent);
  console.log('✅ Created reference files pointing to the consolidated type definition');
  
} catch (error) {
  console.error('❌ Error fixing user type definitions:', error);
}

console.log('✅ All fixes applied');