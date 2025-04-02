const fs = require('fs');
const path = require('path');

function fixAmazonAdapterExports() {
  const adapterDirs = [
    'authorization',
    'b2b',
    'brand-protection',
    'catalog',
    'feeds',
    'notifications',
    'orders',
    'pricing',
    'product-types',
    'sales',
    'sellers',
    'uploads',
    'warehousing'
  ];
  
  const results = {
    created: 0,
    fixed: 0,
    skipped: 0,
    errors: 0
  };
  
  adapterDirs.forEach(adapterName => {
    try {
      const basePath = path.join(__dirname, `../src/modules/marketplaces/adapters/amazon/${adapterName}`);
      
      if (!fs.existsSync(basePath)) {
        console.log(`Directory not found: ${basePath}`);
        results.skipped++;
        return;
      }
      
      console.log(`Processing adapter: ${adapterName}`);
      
      // Generate class name by converting dashes to camel case
      const className = adapterName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
      
      // Check and fix main module file
      const moduleFilePath = path.join(basePath, `${adapterName}.ts`);
      if (fs.existsSync(moduleFilePath)) {
        console.log(`  Module file exists: ${moduleFilePath}`);
        
        // Read current content
        let moduleContent = fs.readFileSync(moduleFilePath, 'utf8');
        
        // Fix the class name and export
        if (!moduleContent.includes(`export default ${className}Module`)) {
          // Replace whatever export is there with the correct one
          let fixedContent = moduleContent.replace(
            /export default .*Module;/,
            `export default ${className}Module;`
          );
          
          // If no replacement was done, this might be a totally different file format
          // In that case, add the export at the end
          if (fixedContent === moduleContent) {
            fixedContent = moduleContent.replace(
              /}(\s*)$/,
              `}\n\nexport default ${className}Module;\n`
            );
          }
          
          // If any changes were made, save them
          if (fixedContent !== moduleContent) {
            fs.writeFileSync(moduleFilePath, fixedContent);
            console.log(`    Fixed module export in ${moduleFilePath}`);
            results.fixed++;
          }
        } else {
          console.log(`    Module export already correct in ${moduleFilePath}`);
          results.skipped++;
        }
      } else {
        console.log(`  Creating module file: ${moduleFilePath}`);
        const moduleContent = `// Automatically generated adapter module
import { BaseMarketplaceAdapter } from '../../../../..';

/**
 * Amazon ${adapterName} adapter implementation
 */
class ${className}Module extends BaseMarketplaceAdapter {
  constructor() {
    super();
    // Implementation details
  }
  
  // Module-specific methods would go here
}

export default ${className}Module;
`;
        fs.writeFileSync(moduleFilePath, moduleContent);
        console.log(`    Created module file: ${moduleFilePath}`);
        results.created++;
      }
      
      // Check and fix factory file
      const factoryFilePath = path.join(basePath, `${adapterName}-factory.ts`);
      if (fs.existsSync(factoryFilePath)) {
        console.log(`  Factory file exists: ${factoryFilePath}`);
        
        // Read current content
        let factoryContent = fs.readFileSync(factoryFilePath, 'utf8');
        
        // Fix the import, class name, and export
        if (!factoryContent.includes(`export default ${className}ModuleFactory`)) {
          // Replace whatever export is there with the correct one
          let fixedContent = factoryContent.replace(
            /export default .*Factory;/,
            `export default ${className}ModuleFactory;`
          );
          
          // If no replacement was done, this might be a totally different file format
          // In that case, add the export at the end
          if (fixedContent === factoryContent) {
            fixedContent = factoryContent.replace(
              /}(\s*)$/,
              `}\n\nexport default ${className}ModuleFactory;\n`
            );
          }
          
          // If any changes were made, save them
          if (fixedContent !== factoryContent) {
            fs.writeFileSync(factoryFilePath, fixedContent);
            console.log(`    Fixed factory export in ${factoryFilePath}`);
            results.fixed++;
          }
        } else {
          console.log(`    Factory export already correct in ${factoryFilePath}`);
          results.skipped++;
        }
      } else {
        console.log(`  Creating factory file: ${factoryFilePath}`);
        const factoryContent = `// Automatically generated adapter factory
import ${className}Module from './${adapterName}';
import { ConfigManager } from '../../../services/config-manager';

/**
 * Factory for creating ${adapterName} adapter instances
 */
class ${className}ModuleFactory {
  static create(config: ConfigManager) {
    return new ${className}Module();
  }
}

export default ${className}ModuleFactory;
`;
        fs.writeFileSync(factoryFilePath, factoryContent);
        console.log(`    Created factory file: ${factoryFilePath}`);
        results.created++;
      }
      
      // Update the index file with the correct exports
      const indexFilePath = path.join(basePath, 'index.ts');
      const indexContent = `// Adapter exports
export { default as ${className}Module } from './${adapterName}';
export { default as ${className}ModuleFactory } from './${adapterName}-factory';
`;
      
      if (fs.existsSync(indexFilePath)) {
        const currentContent = fs.readFileSync(indexFilePath, 'utf8');
        if (currentContent !== indexContent) {
          fs.writeFileSync(indexFilePath, indexContent);
          console.log(`  Updated index file: ${indexFilePath}`);
          results.fixed++;
        } else {
          console.log(`  Index file already correct: ${indexFilePath}`);
          results.skipped++;
        }
      } else {
        fs.writeFileSync(indexFilePath, indexContent);
        console.log(`  Created index file: ${indexFilePath}`);
        results.created++;
      }
    } catch (error) {
      console.error(`Error processing adapter ${adapterName}:`, error);
      results.errors++;
    }
  });
  
  return results;
}

function main() {
  console.log('Starting Amazon Adapters Export Fixer...\n');
  
  const results = fixAmazonAdapterExports();
  
  console.log('\n=========== AMAZON ADAPTERS EXPORT FIXER SUMMARY ===========');
  console.log(`Created ${results.created} files`);
  console.log(`Fixed ${results.fixed} files`);
  console.log(`Skipped ${results.skipped} files`);
  console.log(`Errors: ${results.errors} operations`);
  console.log('============================================');
}

main();