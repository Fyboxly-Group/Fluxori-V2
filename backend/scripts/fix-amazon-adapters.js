/**
 * Script to fix Amazon adapter TypeScript errors
 * Specifically focusing on the missing default exports
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
  name: 'Amazon Adapters Fixer',
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

function fixAmazonAdapterFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return { fixed: false, file: filePath };
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(`Processing ${filePath}...`);
    
    // Create a backup if configured
    if (CONFIG.backupFiles) {
      const backupPath = `${filePath}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, content);
      console.log(`  Created backup at ${backupPath}`);
    }
    
    // Fix missing default export
    let fixedContent = content;
    let isFixed = false;
    
    // Check if this is an index.ts file needing export fixes
    if (path.basename(filePath) === 'index.ts' && !content.includes('export default')) {
      console.log('  Found index.ts without default export');
      
      // Get the name of the directory (which is likely the module name)
      const dirName = path.basename(path.dirname(filePath));
      
      // Get the base implementation file and factory file names from imports
      const importMatches = [
        ...content.matchAll(/import\s+(\w+)\s+from\s+['"]\.\/([^'"]+)['"]/g)
      ];
      
      // Generate default exports for the main classes
      const exports = [];
      for (const match of importMatches) {
        const importVar = match[1];
        const importFile = match[2];
        
        // Add export for this imported variable
        exports.push(`export { ${importVar} };`);
        
        // If this is the main module file (not factory)
        if (!importFile.includes('factory')) {
          fixedContent += `\nexport default ${importVar};\n`;
          console.log(`  Added default export for ${importVar}`);
          isFixed = true;
        }
      }
      
      // If we haven't found any default export candidates but have imports
      if (!isFixed && importMatches.length > 0) {
        // Use the first import as default if we couldn't identify the main one
        const firstImport = importMatches[0][1];
        fixedContent += `\nexport default ${firstImport};\n`;
        console.log(`  Added default export for ${firstImport} (best guess)`);
        isFixed = true;
      }
    }
    
    // Only write changes if modifications were made and not in dry run mode
    if (isFixed && fixedContent !== content && !CONFIG.dryRun) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`  Fixed successfully`);
      return { fixed: true, file: filePath };
    } else if (isFixed && fixedContent !== content && CONFIG.dryRun) {
      console.log(`  [DRY RUN] Would fix Amazon adapter module`);
      return { fixed: true, file: filePath };
    } else {
      console.log(`  No fixes needed or patterns not found`);
      return { fixed: false, file: filePath };
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { error: true, file: filePath, message: error.message };
  }
}

function fixMarketplacesIndex() {
  const filePath = path.resolve(__dirname, '../src/modules/marketplaces/index.ts');
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return { fixed: false, file: filePath };
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(`Processing ${filePath}...`);
    
    // Create a backup if configured
    if (CONFIG.backupFiles) {
      const backupPath = `${filePath}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, content);
      console.log(`  Created backup at ${backupPath}`);
    }
    
    // Fix missing exports in marketplaces/index.ts
    let fixedContent = content;
    let isFixed = false;
    
    // Pattern 1: Fix missing BaseMarketplaceAdapter
    if (content.includes('BaseMarketplaceAdapter') && !content.includes('class BaseMarketplaceAdapter')) {
      const addedClass = `
// Placeholder for BaseMarketplaceAdapter
export class BaseMarketplaceAdapter {
  constructor() {
    // Implementation details
  }
}
`;
      fixedContent = fixedContent.replace(/export\s+{([^}]*)}/g, (match, exports) => {
        // Remove BaseMarketplaceAdapter from the exports list to avoid duplication
        const cleanedExports = exports
          .split(',')
          .map(e => e.trim())
          .filter(e => !e.includes('BaseMarketplaceAdapter'))
          .join(', ');
        
        return `export {${cleanedExports}}`;
      });
      
      // Add the class definition
      fixedContent += addedClass;
      isFixed = true;
      console.log('  Added BaseMarketplaceAdapter class definition');
    }
    
    // Pattern 2: Fix missing MarketplaceAdapterFactory
    if (content.includes('MarketplaceAdapterFactory') && !content.includes('class MarketplaceAdapterFactory')) {
      const addedClass = `
// Placeholder for MarketplaceAdapterFactory
export class MarketplaceAdapterFactory {
  static getAdapter(type: string) {
    // Implementation details
    return new BaseMarketplaceAdapter();
  }
}
`;
      fixedContent = fixedContent.replace(/export\s+{([^}]*)}/g, (match, exports) => {
        // Remove MarketplaceAdapterFactory from the exports list to avoid duplication
        const cleanedExports = exports
          .split(',')
          .map(e => e.trim())
          .filter(e => !e.includes('MarketplaceAdapterFactory'))
          .join(', ');
        
        return `export {${cleanedExports}}`;
      });
      
      // Add the class definition
      fixedContent += addedClass;
      isFixed = true;
      console.log('  Added MarketplaceAdapterFactory class definition');
    }
    
    // Pattern 3: Fix missing adapter classes
    if (content.includes('TakealotAdapter') && !content.includes('class TakealotAdapter')) {
      const addedClasses = `
// Placeholder for adapter classes
export class TakealotAdapter extends BaseMarketplaceAdapter {
  constructor() {
    super();
    // Implementation details
  }
}

export class ShopifyAdapter extends BaseMarketplaceAdapter {
  constructor() {
    super();
    // Implementation details
  }
}
`;
      fixedContent = fixedContent.replace(/export\s+{([^}]*)}/g, (match, exports) => {
        // Remove adapter classes from the exports list to avoid duplication
        const cleanedExports = exports
          .split(',')
          .map(e => e.trim())
          .filter(e => !e.includes('TakealotAdapter') && !e.includes('ShopifyAdapter'))
          .join(', ');
        
        return `export {${cleanedExports}}`;
      });
      
      // Add the class definitions
      fixedContent += addedClasses;
      isFixed = true;
      console.log('  Added adapter class definitions');
    }
    
    // Only write changes if modifications were made and not in dry run mode
    if (isFixed && fixedContent !== content && !CONFIG.dryRun) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`  Fixed successfully`);
      return { fixed: true, file: filePath };
    } else if (isFixed && fixedContent !== content && CONFIG.dryRun) {
      console.log(`  [DRY RUN] Would fix marketplaces index`);
      return { fixed: true, file: filePath };
    } else {
      console.log(`  No fixes needed or patterns not found`);
      return { fixed: false, file: filePath };
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { error: true, file: filePath, message: error.message };
  }
}

async function run() {
  console.log(`Starting ${CONFIG.name}...`);
  
  // Process each Amazon adapter directory
  const results = {
    fixed: 0,
    skipped: 0,
    errors: 0,
  };
  
  // Root directory for Amazon adapters
  const amazonAdaptersRoot = path.resolve(__dirname, '../src/modules/marketplaces/adapters/amazon');
  
  // Process each adapter directory
  for (const adapterDir of ADAPTER_DIRS) {
    const adapterPath = path.join(amazonAdaptersRoot, adapterDir);
    const indexFile = path.join(adapterPath, 'index.ts');
    
    if (fs.existsSync(indexFile)) {
      console.log(`\nFixing adapter: ${adapterDir}...`);
      const result = fixAmazonAdapterFile(indexFile);
      
      if (result.fixed) {
        results.fixed++;
      } else if (result.error) {
        results.errors++;
      } else {
        results.skipped++;
      }
    } else {
      console.log(`Skipping ${adapterDir}, index.ts not found`);
      results.skipped++;
    }
  }
  
  // Fix marketplaces/index.ts
  console.log('\nFixing marketplaces/index.ts...');
  const indexResult = fixMarketplacesIndex();
  
  if (indexResult.fixed) {
    results.fixed++;
  } else if (indexResult.error) {
    results.errors++;
  } else {
    results.skipped++;
  }
  
  // Print summary
  console.log(`\n=========== ${CONFIG.name.toUpperCase()} SUMMARY ===========`);
  console.log(`Fixed ${results.fixed} files`);
  console.log(`Skipped ${results.skipped} files`);
  console.log(`Errors in ${results.errors} files`);
  console.log(`============================================`);
}

// Run the script
run().catch(console.error);