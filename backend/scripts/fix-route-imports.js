/**
 * Script to fix malformed route files
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

function fixRouteFile(filePath) {
  console.log(chalk.blue(`Processing ${path.relative(ROOT_DIR, filePath)}...`));
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for malformed imports
    if (content.includes('import * as') && content.includes('from ../')) {
      // Extract controller name from the malformed import
      const controllerMatch = content.match(/import \* as (\w+) from \.\.\//);
      if (!controllerMatch) {
        console.log(chalk.yellow(`Could not determine controller name in ${filePath}`));
        return false;
      }
      
      const controllerName = controllerMatch[1];
      const importPath = filePath.includes('/modules/') 
        ? '../controllers/' + controllerName.replace('_Controller', '.controller')
        : '../controllers/' + controllerName.replace('_Controller', '.controller');
      
      // Create corrected content
      let newContent = content.replace(
        /import \* as (\w+) from \.\.\/(.*);/,
        `import * as ${controllerName} from "${importPath}";`
      );
      
      // Fix router definition
      newContent = newContent.replace(
        /const router = express\.Router(\w+)\.(\(\));/,
        'const router = express.Router();'
      );
      
      // Fix router method calls
      newContent = newContent.replace(
        /router\.(get|post|put|delete|patch)(\w+)\.(\()/g,
        'router.$1('
      );
      
      // Add namespace to controller methods
      const routeHandlers = new Set();
      const routeHandlerRegex = /router\.(get|post|put|delete|patch)\('([^']+)',\s*([a-zA-Z0-9_]+)\)/g;
      let match;
      
      while ((match = routeHandlerRegex.exec(newContent)) !== null) {
        const handlerName = match[3];
        if (handlerName !== 'authenticate') {
          routeHandlers.add(handlerName);
        }
      }
      
      // Replace route handlers with namespaced versions
      for (const handler of routeHandlers) {
        const handlerRegex = new RegExp(`([^.])${handler}\\)`, 'g');
        newContent = newContent.replace(handlerRegex, `$1${controllerName}.${handler})`);
      }
      
      fs.writeFileSync(filePath, newContent);
      console.log(chalk.green(`Fixed import and routes in ${path.relative(ROOT_DIR, filePath)}`));
      return true;
    } else {
      console.log(chalk.yellow(`No malformed imports in ${path.relative(ROOT_DIR, filePath)}`));
      return false;
    }
  } catch (error) {
    console.error(chalk.red(`Error processing ${filePath}: ${error.message}`));
    return false;
  }
}

// Main function
function main() {
  console.log(chalk.blue('🔧 Route Import Fixer'));
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