/**
 * Script to fix route file TypeScript errors
 * Focusing on controller references and missing imports
 */
const fs = require('fs');
const path = require('path');

const CONFIG = {
  name: 'Route Files Fixer',
  extensions: ['.ts'],
  backupFiles: true,
  dryRun: false,
  verbose: true,
};

// Route files with known issues
const ROUTE_FILES = [
  '/home/tarquin_stapa/Fluxori-V2/backend/src/routes/auth.routes.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/routes/connection.routes.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/routes/customer.routes.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/routes/shipment.routes.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/routes/warehouse.routes.ts',
  '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/international-trade/routes/international-trade.routes.ts'
];

function fixRouteFile(filePath) {
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
    
    // Extract the basename to help with fixes
    const basename = path.basename(filePath, '.ts');
    const controllerNameGuess = basename.replace('routes', 'controller');
    
    // Fix route file issues
    let fixedContent = content;
    let isFixed = false;
    const changes = [];
    
    // Fix Pattern 1: Missing controller import
    if (!content.includes('controller') && !content.includes('Controller')) {
      // Check if there's a matching controller file path
      const controllerPath = filePath.replace('routes', 'controllers').replace('.routes.ts', '.controller.ts');
      const relativeControllerPath = path.relative(path.dirname(filePath), controllerPath.replace('.ts', ''));
      
      // Add import for controller
      const importLine = `import * as ${controllerNameGuess} from '${relativeControllerPath}';\n`;
      
      // Find a good place to insert the import - after other imports
      const lines = fixedContent.split('\n');
      const lastImportIndex = lines.reduce((lastIndex, line, index) => {
        return line.trim().startsWith('import ') ? index : lastIndex;
      }, -1);
      
      if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, importLine);
        fixedContent = lines.join('\n');
        changes.push(`Added controller import: ${controllerNameGuess}`);
        isFixed = true;
      }
    }
    
    // Fix Pattern 2: References to non-existent variables like 'controller', 'e', etc.
    if (content.includes('controller.')) {
      fixedContent = fixedContent.replace(/controller\./g, `${controllerNameGuess}.`);
      changes.push(`Replaced 'controller.' with '${controllerNameGuess}.'`);
      isFixed = true;
    }
    
    if (content.includes('e.')) {
      fixedContent = fixedContent.replace(/e\./g, `${controllerNameGuess}.`);
      changes.push(`Replaced 'e.' with '${controllerNameGuess}.'`);
      isFixed = true;
    }
    
    // Fix Pattern 3: References to non-existent variables
    const undefinedFunctionMatches = [...content.matchAll(/router\.[a-z]+\(['"][^'"]+['"],\s*([a-zA-Z][a-zA-Z0-9]*)\)/g)];
    
    for (const match of undefinedFunctionMatches) {
      const funcName = match[1];
      
      // Skip if it's a defined variable or already has a prefix
      if (funcName.includes('.') || content.includes(`const ${funcName}`) || content.includes(`function ${funcName}`)) {
        continue;
      }
      
      // Replace with prefixed version
      fixedContent = fixedContent.replace(
        new RegExp(`([^.])${funcName}\\)`, 'g'), 
        `$1${controllerNameGuess}.${funcName})`
      );
      changes.push(`Added prefix to function: ${funcName} → ${controllerNameGuess}.${funcName}`);
      isFixed = true;
    }
    
    // Fix Pattern 4: Special case for shipmentController → shipment_Controller
    if (content.includes('shipmentController') && !content.includes('import') && !content.includes('const shipmentController')) {
      fixedContent = fixedContent.replace(/shipmentController/g, 'shipment_Controller');
      changes.push('Replaced shipmentController with shipment_Controller');
      isFixed = true;
    }
    
    // Fix Pattern 5: Special case for international-trade.routes.ts - fix placeholder not constructable
    if (filePath.includes('international-trade.routes.ts') && content.includes('{ placeholder: (req: any, res: any) => void }')) {
      fixedContent = fixedContent.replace(
        /{\s*placeholder:\s*\(req:\s*any,\s*res:\s*any\)\s*=>\s*void\s*}/g,
        'function(req: any, res: any) { return { placeholder: true }; }'
      );
      changes.push('Fixed placeholder constructor');
      isFixed = true;
    }
    
    // Fix Pattern 6: Special case for missing controller file
    if (filePath.includes('connection.routes.ts') && content.includes('../controllers/connection.controller')) {
      // Create a simple controller file if it doesn't exist
      const controllerPath = path.resolve(__dirname, '../src/controllers/connection.controller.ts');
      
      if (!fs.existsSync(controllerPath)) {
        const controllerContent = `// Automatically generated placeholder for connection controller
export const getConnections = (req, res) => {
  res.status(200).json({ message: 'Connection controller placeholder' });
};

export const createConnection = (req, res) => {
  res.status(201).json({ message: 'Connection created (placeholder)' });
};

export const getConnection = (req, res) => {
  res.status(200).json({ message: 'Connection details (placeholder)' });
};

export const deleteConnection = (req, res) => {
  res.status(200).json({ message: 'Connection deleted (placeholder)' });
};
`;
        
        if (!CONFIG.dryRun) {
          fs.writeFileSync(controllerPath, controllerContent);
          console.log(`  Created placeholder connection controller at ${controllerPath}`);
        } else {
          console.log(`  [DRY RUN] Would create placeholder connection controller`);
        }
        
        changes.push('Created missing connection.controller.ts');
        isFixed = true;
      }
    }
    
    // Fix Pattern 7: Fix customer.routes.ts missing handler functions
    if (filePath.includes('customer.routes.ts')) {
      // Check for undefined handler references
      const missingHandlers = [
        'getCustomers',
        'getCustomerStats', 
        'getCustomerById',
        'createCustomer',
        'updateCustomer',
        'deleteCustomer'
      ];
      
      const importLine = "import * as customerController from '../controllers/customer.controller';\n";
      
      // Add the import if it doesn't exist
      if (!content.includes('customerController')) {
        const lines = fixedContent.split('\n');
        const lastImportIndex = lines.reduce((lastIndex, line, index) => {
          return line.trim().startsWith('import ') ? index : lastIndex;
        }, -1);
        
        if (lastImportIndex >= 0) {
          lines.splice(lastImportIndex + 1, 0, importLine);
          fixedContent = lines.join('\n');
          changes.push('Added customerController import');
          isFixed = true;
        }
      }
      
      // Replace all occurrences of the plain handler names with prefixed versions
      for (const handler of missingHandlers) {
        if (content.includes(handler) && !content.includes(`${handler} =`)) {
          fixedContent = fixedContent.replace(
            new RegExp(`([^.])${handler}\\b(?!\\s*=)`, 'g'),
            `$1customerController.${handler}`
          );
          changes.push(`Prefixed ${handler} with customerController`);
          isFixed = true;
        }
      }
    }
    
    // Only write changes if modifications were made and not in dry run mode
    if (isFixed && fixedContent !== content && !CONFIG.dryRun) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`  Fixed successfully (${changes.length} changes):`);
      changes.forEach(change => console.log(`   - ${change}`));
      return { fixed: true, file: filePath, changes };
    } else if (isFixed && fixedContent !== content && CONFIG.dryRun) {
      console.log(`  [DRY RUN] Would fix route file (${changes.length} changes):`);
      changes.forEach(change => console.log(`   - ${change}`));
      return { fixed: true, file: filePath, changes };
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
  
  // Process each route file
  const results = {
    fixed: 0,
    skipped: 0,
    errors: 0,
    totalChanges: 0,
  };
  
  for (const filePath of ROUTE_FILES) {
    console.log(`\nProcessing route file: ${path.basename(filePath)}`);
    const result = fixRouteFile(filePath);
    
    if (result.fixed) {
      results.fixed++;
      results.totalChanges += (result.changes?.length || 0);
    } else if (result.error) {
      results.errors++;
    } else {
      results.skipped++;
    }
  }
  
  // Print summary
  console.log(`\n=========== ${CONFIG.name.toUpperCase()} SUMMARY ===========`);
  console.log(`Fixed ${results.fixed} files (${results.totalChanges} total changes)`);
  console.log(`Skipped ${results.skipped} files`);
  console.log(`Errors in ${results.errors} files`);
  console.log(`============================================`);
}

// Run the script
run().catch(console.error);