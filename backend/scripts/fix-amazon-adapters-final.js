/**
 * Final fix script for Amazon adapter files
 */
const fs = require('fs');
const path = require('path');

const CONFIG = {
  name: 'Amazon Adapters Final Fixer',
  extensions: ['.ts'],
  backupFiles: true,
  dryRun: false,
  verbose: true,
};

// List of all adapter index files
const ADAPTER_INDEX_FILES = [
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/authorization/index.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/b2b/index.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/brand-protection/index.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/catalog/index.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/feeds/index.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/inventory/fba-inbound-eligibility/index.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/inventory/fba-small-light/index.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/notifications/index.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/orders/index.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/pricing/index.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/product-types/index.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/sales/index.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/sellers/index.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/uploads/index.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/marketplaces/adapters/amazon/warehousing/index.ts'
];

// Create placeholder adapter files if they don't exist
function ensureAdapterFiles(indexFilePath) {
  try {
    // Extract the directory and base name from the index file path
    const dirPath = path.dirname(indexFilePath);
    const baseName = path.basename(dirPath);
    
    // Get the content of the index file
    const indexContent = fs.readFileSync(indexFilePath, 'utf8');
    
    // Extract the module names being imported
    const moduleMatch = indexContent.match(/export\s*{\s*default\s+as\s+(\w+)\s*}/);
    const factoryMatch = indexContent.match(/export\s*{\s*default\s+as\s+(\w+Factory)\s*}/);
    
    const moduleName = moduleMatch ? moduleMatch[1] : `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}Module`;
    const factoryName = factoryMatch ? factoryMatch[1] : `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}ModuleFactory`;
    
    // Paths for the module and factory files
    const moduleFilePath = path.join(dirPath, `${baseName}.ts`);
    const factoryFilePath = path.join(dirPath, `${baseName}-factory.ts`);
    
    let filesCreated = 0;
    
    // Create module file if it doesn't exist
    if (!fs.existsSync(moduleFilePath)) {
      console.log(`Creating module file: ${moduleFilePath}`);
      
      const moduleContent = `// Automatically generated adapter module
import { BaseMarketplaceAdapter } from '../../../adapters/common/base-marketplace-adapter';

/**
 * Amazon ${baseName} adapter implementation
 */
class ${moduleName} extends BaseMarketplaceAdapter {
  constructor() {
    super();
    // Implementation details
  }
  
  // Module-specific methods would go here
}

export default ${moduleName};
`;
      
      if (!CONFIG.dryRun) {
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
import ${moduleName} from './${baseName}';
import { ConfigManager } from '../../../services/config-manager';

/**
 * Factory for creating ${baseName} adapter instances
 */
class ${factoryName} {
  static create(config: ConfigManager) {
    return new ${moduleName}();
  }
}

export default ${factoryName};
`;
      
      if (!CONFIG.dryRun) {
        fs.writeFileSync(factoryFilePath, factoryContent);
        console.log(`  Created factory file: ${factoryFilePath}`);
        filesCreated++;
      } else {
        console.log(`  [DRY RUN] Would create factory file: ${factoryFilePath}`);
      }
    }
    
    return { fixed: filesCreated > 0, filesCreated };
  } catch (error) {
    console.error(`Error processing ${indexFilePath}:`, error);
    return { error: true, file: indexFilePath, message: error.message };
  }
}

async function run() {
  console.log(`Starting ${CONFIG.name}...`);
  
  // Process each Amazon adapter index file
  const results = {
    fixed: 0,
    skipped: 0,
    errors: 0,
    totalFilesCreated: 0,
  };
  
  // Process each adapter index file
  for (const indexFilePath of ADAPTER_INDEX_FILES) {
    if (fs.existsSync(indexFilePath)) {
      console.log(`\nProcessing adapter index: ${path.basename(path.dirname(indexFilePath))}...`);
      const result = ensureAdapterFiles(indexFilePath);
      
      if (result.error) {
        results.errors++;
      } else if (result.fixed) {
        results.fixed++;
        results.totalFilesCreated += result.filesCreated;
      } else {
        results.skipped++;
      }
    } else {
      console.log(`Skipping ${indexFilePath}, file not found`);
      results.skipped++;
    }
  }
  
  // Print summary
  console.log(`\n=========== ${CONFIG.name.toUpperCase()} SUMMARY ===========`);
  console.log(`Fixed ${results.fixed} directories`);
  console.log(`Skipped ${results.skipped} directories`);
  console.log(`Errors in ${results.errors} directories`);
  console.log(`Created ${results.totalFilesCreated} files`);
  console.log(`============================================`);
}

// Run the script
run().catch(console.error);