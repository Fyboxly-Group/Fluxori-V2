const fs = require('fs');
const path = require('path');

// List of all adapter directories to check
const ADAPTER_DIRS = [
  'sales',
  'sellers',
  'uploads',
  'warehousing'
];

function fixAmazonAdapterExports() {
  const results = {
    created: 0,
    skipped: 0,
    errors: 0
  };

  ADAPTER_DIRS.forEach(adapterName => {
    try {
      const basePath = path.join(__dirname, `../src/modules/marketplaces/adapters/amazon/${adapterName}`);
      console.log(`\nProcessing adapter: ${adapterName}...`);

      // Create directory if it doesn't exist
      if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true });
        console.log(`  Created directory: ${basePath}`);
      }

      // Create the module file
      const moduleFilePath = path.join(basePath, `${adapterName}.ts`);
      if (!fs.existsSync(moduleFilePath)) {
        const moduleContent = `// Automatically generated adapter module
import { BaseMarketplaceAdapter } from '../../../../..';

/**
 * Amazon ${adapterName} adapter implementation
 */
class ${adapterName.charAt(0).toUpperCase() + adapterName.slice(1)}Module extends BaseMarketplaceAdapter {
  constructor() {
    super();
    // Implementation details
  }
  
  // Module-specific methods would go here
}

export default ${adapterName.charAt(0).toUpperCase() + adapterName.slice(1)}Module;
`;
        fs.writeFileSync(moduleFilePath, moduleContent);
        console.log(`  Created module file: ${moduleFilePath}`);
        results.created++;
      } else {
        console.log(`  Module file already exists: ${moduleFilePath}`);
        results.skipped++;
      }

      // Create the factory file
      const factoryFilePath = path.join(basePath, `${adapterName}-factory.ts`);
      if (!fs.existsSync(factoryFilePath)) {
        const factoryContent = `// Automatically generated adapter factory
import ${adapterName.charAt(0).toUpperCase() + adapterName.slice(1)}Module from './${adapterName}';
import { ConfigManager } from '../../../services/config-manager';

/**
 * Factory for creating ${adapterName} adapter instances
 */
class ${adapterName.charAt(0).toUpperCase() + adapterName.slice(1)}ModuleFactory {
  static create(config: ConfigManager) {
    return new ${adapterName.charAt(0).toUpperCase() + adapterName.slice(1)}Module();
  }
}

export default ${adapterName.charAt(0).toUpperCase() + adapterName.slice(1)}ModuleFactory;
`;
        fs.writeFileSync(factoryFilePath, factoryContent);
        console.log(`  Created factory file: ${factoryFilePath}`);
        results.created++;
      } else {
        console.log(`  Factory file already exists: ${factoryFilePath}`);
        results.skipped++;
      }

      // Update the index file if needed
      const indexFilePath = path.join(basePath, 'index.ts');
      if (!fs.existsSync(indexFilePath)) {
        const indexContent = `// Adapter exports
export { default as ${adapterName.charAt(0).toUpperCase() + adapterName.slice(1)}Module } from './${adapterName}';
export { default as ${adapterName.charAt(0).toUpperCase() + adapterName.slice(1)}ModuleFactory } from './${adapterName}-factory';
`;
        fs.writeFileSync(indexFilePath, indexContent);
        console.log(`  Created index file: ${indexFilePath}`);
        results.created++;
      } else {
        // Make sure the index file has the correct exports
        let indexContent = fs.readFileSync(indexFilePath, 'utf8');
        const expectedExportModule = `export { default as ${adapterName.charAt(0).toUpperCase() + adapterName.slice(1)}Module } from './${adapterName}';`;
        const expectedExportFactory = `export { default as ${adapterName.charAt(0).toUpperCase() + adapterName.slice(1)}ModuleFactory } from './${adapterName}-factory';`;
        
        if (!indexContent.includes(expectedExportModule) || !indexContent.includes(expectedExportFactory)) {
          indexContent = `// Adapter exports
${expectedExportModule}
${expectedExportFactory}
`;
          fs.writeFileSync(indexFilePath, indexContent);
          console.log(`  Updated index file: ${indexFilePath}`);
          results.created++;
        } else {
          console.log(`  Index file already has correct exports: ${indexFilePath}`);
          results.skipped++;
        }
      }
    } catch (error) {
      console.error(`Error processing adapter ${adapterName}:`, error);
      results.errors++;
    }
  });

  return results;
}

function main() {
  console.log('Starting Amazon Adapter Exports Fixer...');
  const results = fixAmazonAdapterExports();
  
  console.log('\n=========== AMAZON ADAPTER EXPORTS FIXER SUMMARY ===========');
  console.log(`Created ${results.created} files`);
  console.log(`Skipped ${results.skipped} files`);
  console.log(`Errors in ${results.errors} operations`);
  console.log('============================================');
}

main();