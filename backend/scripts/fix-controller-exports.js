/**
 * Script to fix missing controller exports in TypeScript files
 */
const fs = require('fs');
const path = require('path');

const CONFIG = {
  name: 'Controller Exports Fixer',
  extensions: ['.ts'],
  backupFiles: true,
  dryRun: false,
  verbose: true,
};

function findAllRouteFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.')) {
      results = results.concat(findAllRouteFiles(filePath));
    } else if (
      stat.isFile() && 
      CONFIG.extensions.includes(path.extname(file)) &&
      !file.startsWith('.') &&
      file.includes('routes.ts')
    ) {
      results.push(filePath);
    }
  }
  
  return results;
}

function findMissingControllerExports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const missingExports = [];
    
    // Extract controller name from imports
    const controllerImportMatch = content.match(/import.*from\s+['"](.+controller)['"]/);
    if (!controllerImportMatch) return { missingExports };
    
    const controllerPath = controllerImportMatch[1];
    const controllerFullPath = path.resolve(path.dirname(filePath), controllerPath + '.ts');
    
    if (!fs.existsSync(controllerFullPath)) {
      console.log(`Controller file not found: ${controllerFullPath}`);
      return { missingExports };
    }
    
    // Extract all router method calls that reference controller functions
    const routerMethodCalls = [...content.matchAll(/router\.(get|post|put|delete|patch)\(['"].*['"],\s*(?:auth\([^)]*\),\s*)?([^.]+)\.([^,\s)]+)/g)];
    
    // Read controller file
    let controllerContent = fs.readFileSync(controllerFullPath, 'utf8');
    
    for (const match of routerMethodCalls) {
      const controllerRef = match[2]; // The controller reference (e.g., 'authController')
      const methodName = match[3]; // The method name (e.g., 'login')
      
      // Check if method is exported in controller file
      const methodRegex = new RegExp(`export\\s+const\\s+${methodName}\\s*=`);
      if (!methodRegex.test(controllerContent)) {
        missingExports.push({ controller: controllerRef, method: methodName });
      }
    }
    
    return { controllerPath: controllerFullPath, missingExports };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { error: true, file: filePath, message: error.message };
  }
}

function addMissingExportsToController(controllerPath, missingExports) {
  if (missingExports.length === 0) return { fixed: false };
  
  try {
    console.log(`Processing controller: ${controllerPath}`);
    const content = fs.readFileSync(controllerPath, 'utf8');
    
    // Create a backup if configured
    if (CONFIG.backupFiles) {
      const backupPath = `${controllerPath}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, content);
      console.log(`  Created backup at ${backupPath}`);
    }
    
    let fixedContent = content;
    
    for (const { method } of missingExports) {
      console.log(`  Adding missing export for method: ${method}`);
      
      // Add placeholder method if it doesn't exist
      const placeholderMethod = `
/**
 * ${method} method placeholder
 */
export const ${method} = async (req, res) => {
  try {
    // TODO: Implement ${method} functionality
    return res.status(200).json({ message: '${method} functionality not implemented yet' });
  } catch (error) {
    console.error('Error in ${method}:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};`;
      
      if (!fixedContent.endsWith('\n')) {
        fixedContent += '\n';
      }
      fixedContent += placeholderMethod;
    }
    
    // Only write changes if content was modified and not in dry run mode
    if (fixedContent !== content && !CONFIG.dryRun) {
      fs.writeFileSync(controllerPath, fixedContent);
      console.log(`  Fixed successfully`);
      return { fixed: true };
    } else if (fixedContent !== content && CONFIG.dryRun) {
      console.log(`  [DRY RUN] Would add missing controller exports`);
      return { fixed: true };
    } else {
      console.log(`  No missing exports found to fix`);
      return { fixed: false };
    }
  } catch (error) {
    console.error(`Error fixing controller ${controllerPath}:`, error);
    return { error: true, message: error.message };
  }
}

async function run() {
  console.log(`Starting ${CONFIG.name}...`);
  
  // Find all route files
  const rootDir = path.resolve(__dirname, '..');
  const allRouteFiles = findAllRouteFiles(rootDir);
  
  console.log(`Found ${allRouteFiles.length} route files to check`);
  
  // Process each file
  const results = {
    fixed: 0,
    skipped: 0,
    errors: 0,
  };
  
  for (const file of allRouteFiles) {
    console.log(`Checking route file: ${file}`);
    const { controllerPath, missingExports, error } = findMissingControllerExports(file);
    
    if (error) {
      results.errors++;
      console.error(`Error analyzing ${file}: ${error.message}`);
      continue;
    }
    
    if (missingExports.length > 0 && controllerPath) {
      console.log(`Found ${missingExports.length} missing exports in ${file}`);
      const result = addMissingExportsToController(controllerPath, missingExports);
      
      if (result.fixed) {
        results.fixed++;
      } else if (result.error) {
        results.errors++;
      } else {
        results.skipped++;
      }
    } else {
      console.log(`No missing exports found in ${file}`);
      results.skipped++;
    }
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