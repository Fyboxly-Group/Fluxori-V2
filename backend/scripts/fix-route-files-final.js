const fs = require('fs');
const path = require('path');

// Route files to fix
const ROUTES_TO_FIX = [
  {
    path: '/src/routes/auth.routes.ts',
    controller: 'authController'
  },
  {
    path: '/src/routes/connection.routes.ts',
    controller: 'connectionController'
  },
  {
    path: '/src/routes/customer.routes.ts',
    controller: 'customerController'
  },
  {
    path: '/src/routes/shipment.routes.ts',
    controller: 'shipmentController'
  },
  {
    path: '/src/routes/warehouse.routes.ts',
    controller: 'warehouseController',
    importPath: '../controllers/warehouse.controller'
  }
];

function fixRouteFile(routeInfo) {
  const filePath = path.join(__dirname, '..', routeInfo.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return { fixed: false };
  }
  
  console.log(`Processing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Create a backup
  const backupPath = `${filePath}.backup-${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`  Created backup at ${backupPath}`);
  
  let fixedContent = content;
  let changes = [];
  let isFixed = false;
  
  // Fix controller import issue if specified
  if (routeInfo.importPath) {
    const importRegex = new RegExp(`import.*from ['"].*${routeInfo.controller.replace('Controller', '')}.*['"]`);
    if (importRegex.test(fixedContent)) {
      fixedContent = fixedContent.replace(importRegex, `import * as e from '${routeInfo.importPath}'`);
      changes.push('Fixed controller import path');
      isFixed = true;
    }
  }
  
  // Fix controller references
  const controllerReference = routeInfo.controller;
  
  // Pattern 1: Fix references to non-existent variables like 'e', etc.
  if (fixedContent.includes('e.')) {
    // This is good, keep it
  } else if (fixedContent.includes(`${controllerReference}.`)) {
    // This is also fine, keep it
  } else {
    // Look for Pattern 2: Directly using the controller name without prefix
    const controllerNameNoSuffix = controllerReference.replace('Controller', '');
    const regex = new RegExp(`${controllerNameNoSuffix}\\.`, 'g');
    
    if (regex.test(fixedContent)) {
      fixedContent = fixedContent.replace(regex, 'e.');
      changes.push(`Replaced '${controllerNameNoSuffix}.' with 'e.'`);
      isFixed = true;
    }
  }
  
  if (!isFixed) {
    console.log('  No changes needed for this file');
    return { fixed: false };
  }
  
  // Save the fixed content
  fs.writeFileSync(filePath, fixedContent);
  console.log(`  Fixed ${filePath}: ${changes.join(', ')}`);
  
  return { fixed: true, changes };
}

function main() {
  console.log('Starting Route Files Final Fixer...');
  
  const results = {
    fixed: 0,
    skipped: 0,
    errors: 0,
    totalChanges: 0
  };
  
  ROUTES_TO_FIX.forEach(routeInfo => {
    try {
      const result = fixRouteFile(routeInfo);
      
      if (result.fixed) {
        results.fixed++;
        results.totalChanges += (result.changes?.length || 0);
      } else {
        results.skipped++;
      }
    } catch (error) {
      console.error(`Error processing ${routeInfo.path}:`, error);
      results.errors++;
    }
  });
  
  console.log('\n=========== ROUTE FILES FINAL FIXER SUMMARY ===========');
  console.log(`Fixed ${results.fixed} files (${results.totalChanges} total changes)`);
  console.log(`Skipped ${results.skipped} files`);
  console.log(`Errors in ${results.errors} files`);
  console.log('============================================');
}

main();