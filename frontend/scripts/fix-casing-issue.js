const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting casing issue fix script');

try {
  // Get the current directory
  const workingDir = execSync('pwd').toString().trim();
  console.log(`Working directory: ${workingDir}`);

  // Verify we're in the frontend directory
  if (!workingDir.endsWith('/frontend')) {
    console.error('❌ Must be run from the frontend directory');
    process.exit(1);
  }

  // Move to a temp directory to avoid case sensitivity issues
  console.log('📁 Creating temporary directory for user types');
  execSync('mkdir -p .temp_types');
  
  // Create a unified user.d.ts file in the temp directory
  console.log('✏️ Creating unified user type definitions');
  const unifiedContent = `/**
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

  fs.writeFileSync('.temp_types/user.types.d.ts', unifiedContent);
  console.log('✅ Created unified user type definition file');

  // Fix the tsconfig.json to exclude the problematic files
  console.log('🔧 Updating tsconfig.json');
  const tsconfigPath = path.resolve(workingDir, 'tsconfig.json');
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  
  // Update exclude list
  if (!tsconfig.exclude.includes('src/types/User.d.ts')) {
    tsconfig.exclude.push('src/types/User.d.ts');
  }
  if (!tsconfig.exclude.includes('src/types/user.d.ts')) {
    tsconfig.exclude.push('src/types/user.d.ts');
  }
  
  // Move temp file to the target location
  fs.copyFileSync('.temp_types/user.types.d.ts', 'src/types/user.types.d.ts');
  console.log('✅ Copied user.types.d.ts to src/types/');
  
  // Write updated tsconfig
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  console.log('✅ Updated tsconfig.json');
  
  // Clean up
  execSync('rm -rf .temp_types');
  console.log('🗑️ Cleaned up temporary files');
  
  console.log('✅ Case sensitivity issue fix completed');
} catch (error) {
  console.error('❌ Error fixing case sensitivity issue:', error);
}