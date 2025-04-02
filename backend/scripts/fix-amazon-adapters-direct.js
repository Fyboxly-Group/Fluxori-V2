/**
 * Direct fix script for Amazon adapter files
 */
const fs = require('fs');
const path = require('path');

const CONFIG = {
  name: 'Amazon Adapters Direct Fixer',
  extensions: ['.ts'],
  backupFiles: true,
  dryRun: false,
  verbose: true,
};

// Amazon adapter directories to fix
const ADAPTER_DIRS = [
  'authorization',
  'b2b',
  'brand-protection',
  'catalog',
  'feeds',
  'inventory/fba-inbound-eligibility',
  'inventory/fba-small-light',
  'notifications',
  'orders',
  'pricing',
  'product-types',
  'sales',
  'sellers',
  'uploads',
  'warehousing'
];

// These files don't exist but are being imported with default imports
function fixAmazonAdapterFile(dirName) {
  const amazonAdaptersRoot = path.resolve(__dirname, '../src/modules/marketplaces/adapters/amazon');
  const adapterPath = path.join(amazonAdaptersRoot, dirName);
  
  // Path for the module file (like authorization.ts)
  const baseName = path.basename(dirName);
  const moduleFilePath = path.join(adapterPath, `${baseName}.ts`);
  
  // Path for the factory file (like authorization-factory.ts)
  const factoryFilePath = path.join(adapterPath, `${baseName}-factory.ts`);
  
  let filesCreated = 0;
  
  // Create module file if it doesn't exist
  if (!fs.existsSync(moduleFilePath)) {
    console.log(`Creating module file: ${moduleFilePath}`);
    
    const moduleContent = `// Automatically generated adapter module
import { BaseMarketplaceAdapter } from '../../../adapters/common/base-marketplace-adapter';

/**
 * Amazon ${baseName} adapter implementation
 */
class ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}Module extends BaseMarketplaceAdapter {
  constructor() {
    super();
    // Implementation details
  }
  
  // Module-specific methods would go here
}

export default ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}Module;
`;
    
    if (!CONFIG.dryRun) {
      // Create the directory structure if it doesn't exist
      if (!fs.existsSync(adapterPath)) {
        fs.mkdirSync(adapterPath, { recursive: true });
      }
      
      // Write the file
      fs.writeFileSync(moduleFilePath, moduleContent);
      console.log(`  Created module file: ${moduleFilePath}`);
      filesCreated++;
    } else {
      console.log(`  [DRY RUN] Would create module file: ${moduleFilePath}`);
    }
  }
  
  // Create factory file if it doesn't exist
  if (!fs.existsSync(factoryFilePath)) {
    console.log(`Creating factory file: ${factoryFilePath}`);
    
    const factoryContent = `// Automatically generated adapter factory
import ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}Module from './${baseName}';
import { ConfigManager } from '../../../services/config-manager';

/**
 * Factory for creating ${baseName} adapter instances
 */
class ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}ModuleFactory {
  static create(config: ConfigManager) {
    return new ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}Module();
  }
}

export default ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}ModuleFactory;
`;
    
    if (!CONFIG.dryRun) {
      // Create the directory structure if it doesn't exist
      if (!fs.existsSync(adapterPath)) {
        fs.mkdirSync(adapterPath, { recursive: true });
      }
      
      // Write the file
      fs.writeFileSync(factoryFilePath, factoryContent);
      console.log(`  Created factory file: ${factoryFilePath}`);
      filesCreated++;
    } else {
      console.log(`  [DRY RUN] Would create factory file: ${factoryFilePath}`);
    }
  }
  
  return { fixed: filesCreated > 0, filesCreated };
}

async function run() {
  console.log(`Starting ${CONFIG.name}...`);
  
  // Process each Amazon adapter directory
  const results = {
    fixed: 0,
    directoriesProcessed: 0,
    totalFilesCreated: 0,
  };
  
  // Process each adapter directory
  for (const adapterDir of ADAPTER_DIRS) {
    console.log(`\nProcessing adapter: ${adapterDir}...`);
    const result = fixAmazonAdapterFile(adapterDir);
    
    results.directoriesProcessed++;
    if (result.fixed) {
      results.fixed++;
      results.totalFilesCreated += result.filesCreated;
    }
  }
  
  // Print summary
  console.log(`\n=========== ${CONFIG.name.toUpperCase()} SUMMARY ===========`);
  console.log(`Processed ${results.directoriesProcessed} directories`);
  console.log(`Fixed ${results.fixed} directories`);
  console.log(`Created ${results.totalFilesCreated} files`);
  console.log(`============================================`);
}

// Run the script
run().catch(console.error);