/**
 * Script to fix controller import errors in route files
 * These errors are typically TS2305: Module has no exported member 'X' or similar
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

const ROOT_DIR = path.resolve(__dirname, '..');

function findRouteFiles() {
  console.log(chalk.blue('Finding route files...'));
  return glob.sync(path.join(ROOT_DIR, 'src/routes/*.routes.ts'))
    .concat(glob.sync(path.join(ROOT_DIR, 'src/modules/**/routes/*.routes.ts')));
}

function extractControllerImports(content) {
  // Match import statements for controllers
  const importRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+(['"])([^'"]+)(['"])/g;
  const imports = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importNames = match[1].split(',').map(name => name.trim());
    const importSource = match[3];
    
    if (importSource.includes('controller')) {
      imports.push({
        importNames,
        importSource,
        fullMatch: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }
  }

  return imports;
}

function getControllerFilePath(importSource, filePath) {
  // Resolve the controller path relative to the route file
  const fileDir = path.dirname(filePath);
  const controllerPath = path.resolve(fileDir, importSource + '.ts');
  
  if (fs.existsSync(controllerPath)) {
    return controllerPath;
  }
  
  // If path doesn't exist, try to resolve absolute path
  return path.resolve(ROOT_DIR, importSource.replace(/^['"]/, '').replace(/['"]$/, '') + '.ts');
}

function extractControllerExports(controllerPath) {
  if (!fs.existsSync(controllerPath)) {
    console.warn(chalk.yellow(`Controller file not found: ${controllerPath}`));
    return [];
  }

  const content = fs.readFileSync(controllerPath, 'utf-8');
  const exportRegex = /export\s+(?:const|let|function|class)\s+(\w+)/g;
  const exports = [];
  let match;

  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  // Also check for default export
  const defaultExportRegex = /export\s+default\s+(?:class|function)?\s*(\w+)?/g;
  const defaultMatch = defaultExportRegex.exec(content);
  if (defaultMatch && defaultMatch[1]) {
    exports.push('default');
  }

  return exports;
}

function fixRouteFile(filePath) {
  console.log(chalk.blue(`Processing ${path.relative(ROOT_DIR, filePath)}...`));
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = extractControllerImports(content);
  
  if (imports.length === 0) {
    console.log(chalk.yellow(`No controller imports found in ${path.relative(ROOT_DIR, filePath)}`));
    return false;
  }
  
  let newContent = content;
  let modified = false;
  
  for (const importInfo of imports) {
    // Get the actual controller file path
    const controllerPath = getControllerFilePath(importInfo.importSource, filePath);
    const availableExports = extractControllerExports(controllerPath);
    
    if (availableExports.length === 0) {
      console.log(chalk.yellow(`No exports found in controller: ${controllerPath}`));
      continue;
    }
    
    // If there's a default export, replace with import defaultName from "..."
    if (availableExports.includes('default')) {
      const firstImportName = importInfo.importNames[0];
      const newImport = `import ${firstImportName} from ${importInfo.importSource}`;
      
      newContent = newContent.substring(0, importInfo.start) + 
                 newImport + 
                 newContent.substring(importInfo.end);
      
      modified = true;
      continue;
    }
    
    // Check if each imported name is available
    const validImports = importInfo.importNames.filter(name => availableExports.includes(name));
    const invalidImports = importInfo.importNames.filter(name => !availableExports.includes(name));
    
    if (invalidImports.length > 0) {
      // Fix the import statement
      console.log(chalk.yellow(`Fixing imports for ${importInfo.importSource}`));
      console.log(chalk.yellow(`  - Invalid imports: ${invalidImports.join(', ')}`));
      console.log(chalk.yellow(`  - Valid exports: ${availableExports.join(', ')}`));
      
      // Create a new import statement with only valid imports
      if (validImports.length > 0) {
        const newImport = `import { ${validImports.join(', ')} } from ${importInfo.importSource}`;
        newContent = newContent.replace(importInfo.fullMatch, newImport);
      } else {
        // Replace with import * as ControllerName
        const importSource = importInfo.importSource;
        const controllerName = path.basename(importSource.replace(/['"]/g, ''))
                                  .replace(/[-.]/g, '_')
                                  .replace(/controller$/, 'Controller');
        
        const newImport = `import * as ${controllerName} from ${importSource}`;
        newContent = newContent.replace(importInfo.fullMatch, newImport);
        
        // Replace all occurrences of invalid imports with ControllerName.functionName
        for (const invalidName of invalidImports) {
          const regex = new RegExp(`\\b${invalidName}\\b(?=\\s*\\()`, 'g');
          newContent = newContent.replace(regex, `${controllerName}.${invalidName}`);
        }
      }
      
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, newContent);
    console.log(chalk.green(`Fixed imports in ${path.relative(ROOT_DIR, filePath)}`));
    return true;
  } else {
    console.log(chalk.yellow(`No changes needed in ${path.relative(ROOT_DIR, filePath)}`));
    return false;
  }
}

// Main function
function main() {
  console.log(chalk.blue('🔧 Controller Import Fixer'));
  console.log(chalk.blue('======================='));
  
  const routeFiles = findRouteFiles();
  console.log(chalk.blue(`Found ${routeFiles.length} route files`));
  
  let fixedFiles = 0;
  
  for (const filePath of routeFiles) {
    if (fixRouteFile(filePath)) {
      fixedFiles++;
    }
  }
  
  console.log(chalk.blue('📊 Summary'));
  console.log(chalk.blue('============'));
  console.log(chalk.green(`Fixed ${fixedFiles} out of ${routeFiles.length} route files`));
}

main();