/**
 * Script to fix syntax errors in route files
 * These are typically syntax errors from the previous fix that need to be corrected
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

function fixSyntaxErrors(filePath) {
  console.log(chalk.blue(`Processing ${path.relative(ROOT_DIR, filePath)}...`));
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix incorrect import * syntax
  let newContent = content.replace(/import \* as (\w+) from ["']([^"']+)["']/g, (match, importName, importPath) => {
    return `import * as ${importName} from "${importPath}"`;
  });
  
  // Fix incorrect controller function calls
  newContent = newContent.replace(/(\w+)\.(\w+)\(/g, (match, controllerName, functionName) => {
    return `${controllerName}.${functionName}(`;
  });

  // Fix routes where controller names are incorrect
  newContent = newContent.replace(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"],\s*([^.]+)\.([^(),\s]+)/g, 
    (match, method, routePath, controllerName, functionName) => {
      return `router.${method}('${routePath}', ${controllerName}.${functionName}`;
    }
  );
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(chalk.green(`Fixed syntax in ${path.relative(ROOT_DIR, filePath)}`));
    return true;
  } else {
    console.log(chalk.yellow(`No syntax issues found in ${path.relative(ROOT_DIR, filePath)}`));
    return false;
  }
}

// Main function
function main() {
  console.log(chalk.blue('🔧 Route Syntax Fixer'));
  console.log(chalk.blue('======================='));
  
  const routeFiles = findRouteFiles();
  console.log(chalk.blue(`Found ${routeFiles.length} route files`));
  
  let fixedFiles = 0;
  
  for (const filePath of routeFiles) {
    if (fixSyntaxErrors(filePath)) {
      fixedFiles++;
    }
  }
  
  console.log(chalk.blue('📊 Summary'));
  console.log(chalk.blue('============'));
  console.log(chalk.green(`Fixed ${fixedFiles} out of ${routeFiles.length} route files`));
}

main();