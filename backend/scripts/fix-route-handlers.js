/**
 * Script to add placeholders for missing controller methods
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

function getControllerPath(importPath, routeFilePath) {
  // Handle module routes differently than main routes
  if (routeFilePath.includes('/modules/')) {
    // For modules, the controller is in the same module directory
    const moduleDir = path.dirname(path.dirname(routeFilePath));
    return path.join(moduleDir, 'controllers', path.basename(importPath) + '.ts');
  } else {
    // For main routes, controllers are in src/controllers
    return path.join(ROOT_DIR, 'src/controllers', path.basename(importPath) + '.ts');
  }
}

function fixRouteHandler(filePath) {
  console.log(chalk.blue(`Processing ${path.relative(ROOT_DIR, filePath)}...`));
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    
    // First fix import statements if needed
    if (content.includes('import * as')) {
      const controllerMatch = content.match(/import \* as (\w+) from ["']([^"']+)["']/);
      if (controllerMatch) {
        const controllerName = controllerMatch[1];
        const importPath = controllerMatch[2];
        
        // Create placeholder controller file if it doesn't exist
        const controllerFilePath = getControllerPath(importPath, filePath);
        const controllerDir = path.dirname(controllerFilePath);
        
        if (!fs.existsSync(controllerFilePath)) {
          // Create directory if it doesn't exist
          if (!fs.existsSync(controllerDir)) {
            fs.mkdirSync(controllerDir, { recursive: true });
            console.log(chalk.green(`Created directory: ${controllerDir}`));
          }
          
          // Create placeholder controller file
          const controllerContent = `/**
 * Placeholder controller file
 * Auto-generated to fix TypeScript errors
 */

// Placeholder implementation for route handlers
const placeholder = (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};

export const ${controllerName.replace('_Controller', 'Controller')} = {
  placeholder
};

// Export all handler methods as the placeholder function
export default {
  placeholder
};`;
          
          fs.writeFileSync(controllerFilePath, controllerContent);
          console.log(chalk.green(`Created placeholder controller: ${controllerFilePath}`));
        }
        
        // Extract all handler method uses in the file
        const handlerRegex = /(\w+)_Controller\.(\w+)/g;
        const usedHandlers = new Set();
        let match;
        
        while ((match = handlerRegex.exec(content)) !== null) {
          usedHandlers.add(match[2]);
        }
        
        // Also check direct handler usage
        const directHandlerRegex = /router\.(get|post|put|delete|patch|use)\s*\(\s*['"]([^'"]+)['"]\s*(?:,\s*[^,]+\s*)*,\s*(\w+)\s*\)/g;
        while ((match = directHandlerRegex.exec(content)) !== null) {
          if (!content.includes(`${controllerName}.${match[3]}`)) {
            usedHandlers.add(match[3]);
          }
        }
        
        // Add these methods to the controller file
        if (usedHandlers.size > 0) {
          const controllerFileContent = fs.readFileSync(controllerFilePath, 'utf-8');
          let exportBlock = '';
          
          for (const handler of usedHandlers) {
            if (!controllerFileContent.includes(`export const ${handler}`)) {
              exportBlock += `export const ${handler} = placeholder;\n`;
            }
          }
          
          if (exportBlock) {
            // Add the export statements before the export default
            const updatedContent = controllerFileContent.replace(
              /export default/,
              `${exportBlock}\nexport default`
            );
            
            fs.writeFileSync(controllerFilePath, updatedContent);
            console.log(chalk.green(`Added handler methods to ${controllerFilePath}: ${Array.from(usedHandlers).join(', ')}`));
          }
        }
        
        // Fix any other route handlers that are called directly
        const routeHandlerRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]\s*(?:,\s*[^,]+\s*)*,\s*(\w+)\s*\)/g;
        while ((match = routeHandlerRegex.exec(content)) !== null) {
          const handlerName = match[3];
          
          // Skip if already using the controller
          if (content.includes(`${controllerName}.${handlerName}`)) {
            continue;
          }
          
          // Check if this is a middleware like authenticate
          if (['authenticate', 'authorize'].includes(handlerName)) {
            continue;
          }
          
          // Replace with controllerName.handlerName
          content = content.replace(
            new RegExp(`(router\\.${match[1]}\\s*\\(\\s*['"]${match[2]}['"]\\s*(?:,\\s*[^,]+\\s*)*),\\s*${handlerName}\\s*\\)`, 'g'),
            `$1, ${controllerName}.${handlerName})`
          );
          
          modified = true;
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(chalk.green(`Fixed route handlers in ${path.relative(ROOT_DIR, filePath)}`));
      return true;
    } else {
      console.log(chalk.yellow(`No changes needed in ${path.relative(ROOT_DIR, filePath)}`));
      return false;
    }
  } catch (error) {
    console.error(chalk.red(`Error processing ${filePath}: ${error.message}`));
    return false;
  }
}

// Main function
function main() {
  console.log(chalk.blue('🔧 Route Handler Fixer'));
  console.log(chalk.blue('======================='));
  
  const routeFiles = findRouteFiles();
  console.log(chalk.blue(`Found ${routeFiles.length} route files`));
  
  let fixedFiles = 0;
  
  for (const filePath of routeFiles) {
    if (fixRouteHandler(filePath)) {
      fixedFiles++;
    }
  }
  
  console.log(chalk.blue('📊 Summary'));
  console.log(chalk.blue('============'));
  console.log(chalk.green(`Fixed ${fixedFiles} out of ${routeFiles.length} route files`));
}

main();