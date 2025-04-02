const fs = require('fs');
const path = require('path');

// List of adapters that need to be fixed
const ADAPTERS_TO_FIX = [
  'authorization',
  'b2b',
  'brand-protection',
  'catalog',
  'feeds',
  'fba-inbound-eligibility',
  'fba-small-light',
  'notifications',
  'orders',
  'pricing',
  'product-types',
  'sales',
  'sellers',
  'uploads',
  'warehousing'
];

// Fix AI CS Agent duplicate export
function fixAICSAgentIndex() {
  const filePath = path.resolve(__dirname, '../src/modules/ai-cs-agent/index.ts');
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return { fixed: false, file: filePath };
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(`Processing ${filePath}...`);
    
    // Create a backup
    const backupPath = `${filePath}.backup-${Date.now()}`;
    fs.writeFileSync(backupPath, content);
    console.log(`  Created backup at ${backupPath}`);
    
    // Fix the duplicate IConversation export issue
    let fixedContent = content;
    
    if (content.includes('export type { IConversation, IConversationDocument, IConversation }')) {
      fixedContent = content.replace(
        'export type { IConversation, IConversationDocument, IConversation }',
        'export type { IConversation, IConversationDocument }'
      );
      console.log('  Fixed duplicate type export for IConversation');
      
      fs.writeFileSync(filePath, fixedContent);
      return { fixed: true, file: filePath, changes: ['Removed duplicate IConversation from type exports'] };
    }
    
    console.log(`  No fixes needed or patterns not found in ${filePath}`);
    return { fixed: false, file: filePath };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { error: true, file: filePath, message: error.message };
  }
}

// Fix AI CS Agent websocket function call
function fixAICSAgentWebsocket() {
  const filePath = path.resolve(__dirname, '../src/modules/ai-cs-agent/utils/websocket.ts');
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return { fixed: false, file: filePath };
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(`Processing ${filePath}...`);
    
    // Create a backup
    const backupPath = `${filePath}.backup-${Date.now()}`;
    fs.writeFileSync(backupPath, content);
    console.log(`  Created backup at ${backupPath}`);
    
    // Fix the function call with 3 arguments error
    let fixedContent = content;
    
    if (content.includes('vertexAIService.generateResponse(')) {
      fixedContent = content.replace(
        /vertexAIService\.generateResponse\(\s*data\.message,\s*clientData\.conversationId,\s*context\s*\)/,
        'vertexAIService.generateResponse(data.message, context)'
      );
      console.log('  Fixed vertexAIService.generateResponse call to use only 2 parameters');
      
      fs.writeFileSync(filePath, fixedContent);
      return { fixed: true, file: filePath, changes: ['Removed excessive parameter from generateResponse call'] };
    }
    
    console.log(`  No fixes needed or patterns not found in ${filePath}`);
    return { fixed: false, file: filePath };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { error: true, file: filePath, message: error.message };
  }
}

// Fix international trade routes
function fixInternationalTradeRoutes() {
  const filePath = path.join(__dirname, '../src/modules/international-trade/routes/international-trade.routes.ts');
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return { fixed: false, file: filePath };
    }
    
    console.log(`Processing ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Create a backup
    const backupPath = `${filePath}.backup-${Date.now()}`;
    fs.writeFileSync(backupPath, content);
    console.log(`  Created backup at ${backupPath}`);
    
    let fixedContent = content;
    
    // Fix controller import and instantiation
    fixedContent = fixedContent.replace(
      /import \* as international_trade_Controller from "\.\.\/controllers\/international-trade\.controller";/,
      `import * as internationalTradeController from "../controllers/international-trade.controller";`
    );
    
    fixedContent = fixedContent.replace(
      /const controller = new international_trade_Controller\.international_tradeController\(\);/,
      `// Controller functions are imported directly, no instantiation needed`
    );
    
    // Fix route handlers
    fixedContent = fixedContent.replace(
      /international_trade_Controller\./g,
      'internationalTradeController.'
    );
    
    if (content === fixedContent) {
      console.log('  No changes needed for this file');
      return { fixed: false, file: filePath };
    }
    
    fs.writeFileSync(filePath, fixedContent);
    console.log(`  Fixed international trade routes controller references`);
    
    return { fixed: true, file: filePath, changes: ['Fixed controller imports and references'] };
  } catch (error) {
    console.error(`Error processing international trade routes:`, error);
    return { error: true, file: filePath, message: error.message };
  }
}

// Fix Amazon adapter modules
function fixAmazonAdapters() {
  const results = {
    fixed: 0,
    skipped: 0,
    errors: 0,
    totalChanges: 0
  };
  
  for (const adapterName of ADAPTERS_TO_FIX) {
    try {
      const basePath = path.join(__dirname, `../src/modules/marketplaces/adapters/amazon/${adapterName}`);
      
      if (!fs.existsSync(basePath)) {
        console.log(`Directory not found: ${basePath}`);
        results.skipped++;
        continue;
      }
      
      console.log(`\nProcessing adapter: ${adapterName}...`);
      
      // Fix module file
      const moduleFilePath = path.join(basePath, `${adapterName}.ts`);
      if (fs.existsSync(moduleFilePath)) {
        let moduleContent = fs.readFileSync(moduleFilePath, 'utf8');
        
        // Create a backup
        const moduleBackupPath = `${moduleFilePath}.backup-${Date.now()}`;
        fs.writeFileSync(moduleBackupPath, moduleContent);
        
        // Fix import for BaseMarketplaceAdapter
        if (moduleContent.includes("import { BaseMarketplaceAdapter } from '../../../adapters/common/base-marketplace-adapter'")) {
          moduleContent = moduleContent.replace(
            "import { BaseMarketplaceAdapter } from '../../../adapters/common/base-marketplace-adapter'",
            "import { BaseMarketplaceAdapter } from '../../../../..'"
          );
          fs.writeFileSync(moduleFilePath, moduleContent);
          console.log(`  Fixed BaseMarketplaceAdapter import in ${moduleFilePath}`);
          results.fixed++;
          results.totalChanges++;
        }
      } else {
        // Create module file if it doesn't exist
        const className = adapterName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
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
        console.log(`  Created module file: ${moduleFilePath}`);
        results.fixed++;
        results.totalChanges++;
      }
      
      // Fix factory file
      const factoryFilePath = path.join(basePath, `${adapterName}-factory.ts`);
      if (fs.existsSync(factoryFilePath)) {
        let factoryContent = fs.readFileSync(factoryFilePath, 'utf8');
        
        // Create a backup
        const factoryBackupPath = `${factoryFilePath}.backup-${Date.now()}`;
        fs.writeFileSync(factoryBackupPath, factoryContent);
        
        // Fix class name if needed
        const className = adapterName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
        if (factoryContent.includes(`return new ${adapterName}-`)) {
          factoryContent = factoryContent.replace(
            `return new ${adapterName}-`,
            `return new ${className}`
          );
          fs.writeFileSync(factoryFilePath, factoryContent);
          console.log(`  Fixed class name in factory file: ${factoryFilePath}`);
          results.fixed++;
          results.totalChanges++;
        }
      } else {
        // Create factory file if it doesn't exist
        const className = adapterName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
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
        console.log(`  Created factory file: ${factoryFilePath}`);
        results.fixed++;
        results.totalChanges++;
      }
      
      // Fix index file
      const indexFilePath = path.join(basePath, 'index.ts');
      if (fs.existsSync(indexFilePath)) {
        let indexContent = fs.readFileSync(indexFilePath, 'utf8');
        
        // Create a backup
        const indexBackupPath = `${indexFilePath}.backup-${Date.now()}`;
        fs.writeFileSync(indexBackupPath, indexContent);
        
        // Check if we need to update the index file
        const className = adapterName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
        const updatedIndexContent = `// Adapter exports
export { default as ${className}Module } from './${adapterName}';
export { default as ${className}ModuleFactory } from './${adapterName}-factory';
`;
        
        if (indexContent !== updatedIndexContent) {
          fs.writeFileSync(indexFilePath, updatedIndexContent);
          console.log(`  Fixed index file: ${indexFilePath}`);
          results.fixed++;
          results.totalChanges++;
        } else {
          console.log(`  Index file already has correct content: ${indexFilePath}`);
          results.skipped++;
        }
      } else {
        // Create index file if it doesn't exist
        const className = adapterName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
        const indexContent = `// Adapter exports
export { default as ${className}Module } from './${adapterName}';
export { default as ${className}ModuleFactory } from './${adapterName}-factory';
`;
        fs.writeFileSync(indexFilePath, indexContent);
        console.log(`  Created index file: ${indexFilePath}`);
        results.fixed++;
        results.totalChanges++;
      }
    } catch (error) {
      console.error(`Error processing adapter ${adapterName}:`, error);
      results.errors++;
    }
  }
  
  return results;
}

// Fix route controller references
function fixRouteControllerReferences() {
  const routeFiles = [
    {
      path: '../src/routes/auth.routes.ts',
      controllerImport: "import * as authController from '../controllers/auth.controller'",
      middlewareImport: "import { authenticate } from '../middleware/auth.middleware'"
    },
    {
      path: '../src/routes/connection.routes.ts',
      controllerImport: "import * as connectionController from '../controllers/connection.controller'"
    },
    {
      path: '../src/routes/customer.routes.ts',
      controllerImport: "import * as customerController from '../controllers/customer.controller'"
    },
    {
      path: '../src/routes/shipment.routes.ts',
      controllerImport: "import * as shipmentController from '../controllers/shipment.controller'"
    },
    {
      path: '../src/routes/warehouse.routes.ts',
      controllerImport: "import * as warehouseController from '../controllers/warehouse.controller'"
    }
  ];
  
  const results = {
    fixed: 0,
    skipped: 0,
    errors: 0,
    totalChanges: 0
  };
  
  for (const routeFile of routeFiles) {
    try {
      const filePath = path.resolve(__dirname, routeFile.path);
      
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        results.skipped++;
        continue;
      }
      
      console.log(`\nProcessing route file: ${filePath}...`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Create a backup
      const backupPath = `${filePath}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, content);
      console.log(`  Created backup at ${backupPath}`);
      
      let fixedContent = content;
      let changes = [];
      
      // Fix controller import
      if (routeFile.controllerImport) {
        const importRegex = /import \* as e from '.*';/;
        if (importRegex.test(fixedContent)) {
          fixedContent = fixedContent.replace(importRegex, routeFile.controllerImport);
          changes.push('Fixed controller import');
        }
      }
      
      // Fix middleware import if specified
      if (routeFile.middlewareImport) {
        const middlewareImportRegex = /import { authenticate } from '.*';/;
        if (middlewareImportRegex.test(fixedContent)) {
          fixedContent = fixedContent.replace(middlewareImportRegex, routeFile.middlewareImport);
          changes.push('Fixed middleware import');
        }
      }
      
      // Extract controller name from import
      const controllerName = routeFile.controllerImport.match(/import \* as (\w+)/)[1];
      
      // Fix e. references to proper controller name
      const eReferenceRegex = /e\./g;
      if (eReferenceRegex.test(fixedContent)) {
        fixedContent = fixedContent.replace(eReferenceRegex, `${controllerName}.`);
        changes.push(`Replaced 'e.' with '${controllerName}.'`);
      }
      
      // Fix plain controller name references (without the dot)
      // This requires a more careful approach to avoid replacing parts of other words
      const controllerNameNoSuffix = controllerName.replace('Controller', '');
      const plainControllerRegex = new RegExp(`\\b${controllerNameNoSuffix}\\s*\\.`, 'g');
      if (plainControllerRegex.test(fixedContent)) {
        fixedContent = fixedContent.replace(plainControllerRegex, `${controllerName}.`);
        changes.push(`Replaced '${controllerNameNoSuffix}.' with '${controllerName}.'`);
      }
      
      // Fix warehouse controller specific case
      if (controllerName === 'warehouseController') {
        const warehouseControllerRegex = /warehouseController\./g;
        if (warehouseControllerRegex.test(fixedContent)) {
          fixedContent = fixedContent.replace(warehouseControllerRegex, `${controllerName}.`);
          changes.push(`Fixed warehouseController references`);
        }
      }
      
      if (changes.length > 0) {
        fs.writeFileSync(filePath, fixedContent);
        console.log(`  Fixed ${filePath}: ${changes.join(', ')}`);
        results.fixed++;
        results.totalChanges += changes.length;
      } else {
        console.log(`  No changes needed for ${filePath}`);
        results.skipped++;
      }
    } catch (error) {
      console.error(`Error processing route file ${routeFile.path}:`, error);
      results.errors++;
    }
  }
  
  return results;
}

// Main function to run all fixes
async function main() {
  console.log('Starting Final TypeScript Error Fixer...\n');
  
  const summaries = [];
  
  // Fix AI CS Agent issues
  console.log('Fixing AI CS Agent issues...');
  const aiCsAgentIndexResult = fixAICSAgentIndex();
  const aiCsAgentWebsocketResult = fixAICSAgentWebsocket();
  
  summaries.push({
    name: 'AI CS Agent fixes',
    fixed: (aiCsAgentIndexResult.fixed ? 1 : 0) + (aiCsAgentWebsocketResult.fixed ? 1 : 0),
    skipped: (aiCsAgentIndexResult.fixed ? 0 : 1) + (aiCsAgentWebsocketResult.fixed ? 0 : 1),
    errors: (aiCsAgentIndexResult.error ? 1 : 0) + (aiCsAgentWebsocketResult.error ? 1 : 0),
    totalChanges: 
      (aiCsAgentIndexResult.changes?.length || 0) + 
      (aiCsAgentWebsocketResult.changes?.length || 0)
  });
  
  // Fix international trade routes
  console.log('\nFixing international trade routes...');
  const internationalTradeResult = fixInternationalTradeRoutes();
  
  summaries.push({
    name: 'International Trade routes fixes',
    fixed: internationalTradeResult.fixed ? 1 : 0,
    skipped: internationalTradeResult.fixed ? 0 : 1,
    errors: internationalTradeResult.error ? 1 : 0,
    totalChanges: internationalTradeResult.changes?.length || 0
  });
  
  // Fix Amazon adapter modules
  console.log('\nFixing Amazon adapter modules...');
  const amazonAdaptersResult = fixAmazonAdapters();
  
  summaries.push({
    name: 'Amazon adapters fixes',
    fixed: amazonAdaptersResult.fixed,
    skipped: amazonAdaptersResult.skipped,
    errors: amazonAdaptersResult.errors,
    totalChanges: amazonAdaptersResult.totalChanges
  });
  
  // Fix route controller references
  console.log('\nFixing route controller references...');
  const routeControllerResult = fixRouteControllerReferences();
  
  summaries.push({
    name: 'Route controller references fixes',
    fixed: routeControllerResult.fixed,
    skipped: routeControllerResult.skipped,
    errors: routeControllerResult.errors,
    totalChanges: routeControllerResult.totalChanges
  });
  
  // Print overall summary
  console.log('\n=========== FINAL TYPESCRIPT ERROR FIXER SUMMARY ===========');
  
  let totalFixed = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  let totalChanges = 0;
  
  summaries.forEach(summary => {
    console.log(`${summary.name}:`);
    console.log(`  Fixed: ${summary.fixed} files`);
    console.log(`  Skipped: ${summary.skipped} files`);
    console.log(`  Errors: ${summary.errors} operations`);
    console.log(`  Total changes: ${summary.totalChanges}`);
    console.log('');
    
    totalFixed += summary.fixed;
    totalSkipped += summary.skipped;
    totalErrors += summary.errors;
    totalChanges += summary.totalChanges;
  });
  
  console.log('OVERALL:');
  console.log(`  Fixed: ${totalFixed} files`);
  console.log(`  Skipped: ${totalSkipped} files`);
  console.log(`  Errors: ${totalErrors} operations`);
  console.log(`  Total changes: ${totalChanges}`);
  console.log('============================================');
}

// Run the main function
main().catch(console.error);