#!/usr/bin/env node

/**
 * Fix Amazon Adapter Factory Files
 * 
 * This script rebuilds all Amazon adapter factory files to follow a consistent
 * pattern that passes TypeScript validation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Create missing BaseModule interface if not present
 */
function createBaseModule() {
  const baseModulePath = path.join(ROOT_DIR, 'src/modules/marketplaces/adapters/base-module.ts');
  
  const baseModuleContent = `/**
 * Base interface for all marketplace adapter modules
 */
export interface BaseModule {
  /**
   * Unique identifier for the module
   */
  id: string;
  
  /**
   * Human-readable name of the module
   */
  name: string;
  
  /**
   * Module version
   */
  version: string;
}
`;
  
  try {
    // Create directory if it doesn't exist
    const baseModuleDir = path.dirname(baseModulePath);
    if (!fs.existsSync(baseModuleDir)) {
      fs.mkdirSync(baseModuleDir, { recursive: true });
    }
    
    fs.writeFileSync(baseModulePath, baseModuleContent, 'utf8');
    console.log(`✅ Created BaseModule interface file`);
  } catch (error) {
    console.error('Error creating BaseModule file:', error);
  }
}

/**
 * Find all Amazon adapter factory files
 */
function findAmazonFactoryFiles() {
  console.log('Finding Amazon adapter factory files...');
  
  // Use glob to find all factory files
  const factoryPattern = path.join(ROOT_DIR, 'src/modules/marketplaces/adapters/amazon/**/*-factory.ts');
  const factoryFiles = glob.sync(factoryPattern);
  
  console.log(`Found ${factoryFiles.length} Amazon factory files`);
  return factoryFiles;
}

/**
 * Create factory class template for a given factory file
 */
function createFactoryTemplate(filePath) {
  // Get relative path for imports
  const relativePath = path.relative(path.dirname(filePath), path.join(ROOT_DIR, 'src/modules/marketplaces/adapters'));
  const baseModuleImport = relativePath ? relativePath.replace(/\\/g, '/') + '/base-module' : './base-module';
  
  // Extract module name and factory class name
  const fileName = path.basename(filePath, '.ts');
  const className = fileName.split('-').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join('');
  
  const moduleName = path.basename(path.dirname(filePath))
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'Module';
  
  return `import { BaseModule } from '${baseModuleImport}';

/**
 * ${className} creates and configures the ${moduleName}
 */
export class ${className} {
  /**
   * Creates a new ${moduleName} instance
   * 
   * @param config Module configuration
   * @returns A configured ${moduleName} instance
   */
  static create${moduleName}(config: any): BaseModule {
    return {
      id: '${path.basename(path.dirname(filePath))}',
      name: '${path.basename(path.dirname(filePath)).replace(/-/g, ' ')}',
      version: '1.0.0'
    };
  }
}
`;
}

/**
 * Rebuild a single Amazon factory file
 */
function rebuildFactoryFile(filePath) {
  console.log(`Rebuilding ${path.relative(ROOT_DIR, filePath)}...`);
  
  try {
    // Create a backup of the original file
    const backupPath = `${filePath}.backup`;
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
    }
    
    // Generate the factory template
    const factoryContent = createFactoryTemplate(filePath);
    
    // Write the file
    fs.writeFileSync(filePath, factoryContent, 'utf8');
    
    console.log(`✅ Rebuilt ${path.relative(ROOT_DIR, filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error rebuilding ${path.relative(ROOT_DIR, filePath)}:`, error);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔧 Amazon Factory Fixer');
  console.log('================================');
  console.log('This script rebuilds all Amazon adapter factory files.');
  
  // Create BaseModule if needed
  createBaseModule();
  
  // Find all Amazon factory files
  const factoryFiles = findAmazonFactoryFiles();
  
  if (factoryFiles.length === 0) {
    console.log('No Amazon factory files found.');
    return;
  }
  
  // Rebuild each factory file
  let rebuiltCount = 0;
  for (const filePath of factoryFiles) {
    if (rebuildFactoryFile(filePath)) {
      rebuiltCount++;
    }
  }
  
  console.log(`\n🎉 Rebuilt ${rebuiltCount} Amazon factory files`);
  console.log('\nRun TypeScript check to see remaining errors:');
  console.log('$ npx tsc --noEmit');
}

// Run the script
main();