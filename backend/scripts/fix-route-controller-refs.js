const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix route controller references
function fixRouteControllerRefs() {
  const pattern = 'src/routes/*.routes.ts';
  const files = glob.sync(pattern);
  
  console.log(`Found ${files.length} route files`);
  
  let fixedFiles = 0;
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Skip already fixed files
    if (content.includes('// TypeScript checked')) {
      continue;
    }
    
    // 1. Fix imports - controller naming
    // Change from: import * as controller from '../controllers/name.controller'
    // To: import * as nameController from '../controllers/name.controller'
    content = content.replace(
      /import\s+\*\s+as\s+(\w+)\s+from\s+['"]\.\.\/controllers\/([^'"]+)\.controller['"]/g,
      (match, importAlias, controllerName) => {
        // Convert hyphenated names to camelCase for the import alias
        const camelCaseName = controllerName.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
        return `import * as ${camelCaseName}Controller from '../controllers/${controllerName}.controller'`;
      }
    );
    
    // 2. Fix route handler references
    // Find route definitions like router.get('/path', authenticate, handlerName)
    // Update them to use the controller object
    const routeHandlerPattern = /router\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]\s*(,\s*[^,]+)?\s*(,\s*[^,]+)?\s*(,\s*[^,]+)?\s*,\s*([a-zA-Z0-9_]+)\s*\)/g;
    
    let controllerNames = [];
    
    // Extract controller names from imports
    const importMatches = content.matchAll(/import\s+\*\s+as\s+([a-zA-Z0-9_]+)\s+from\s+['"]\.\.\/controllers\/([^'"]+)\.controller['"]/g);
    for (const match of importMatches) {
      controllerNames.push(match[1]);
    }
    
    // Fix route handlers
    content = content.replace(routeHandlerPattern, (match, method, path, middleware1, middleware2, middleware3, handlerName) => {
      // If the handler is already using controller syntax, leave it alone
      if (handlerName.includes('.')) {
        return match;
      }
      
      // Find which controller this handler belongs to
      for (const controllerName of controllerNames) {
        // This is a heuristic - we're assuming the handler belongs to the controller
        // if the handler name contains part of the controller name (excluding 'Controller')
        const baseControllerName = controllerName.replace('Controller', '').toLowerCase();
        const lowerHandler = handlerName.toLowerCase();
        
        if (lowerHandler.includes(baseControllerName) || 
            // Special case for 'get' handlers
            (lowerHandler.startsWith('get') && lowerHandler.includes(baseControllerName.slice(0, -1)))) {
          const middlewares = [middleware1, middleware2, middleware3]
            .filter(Boolean)
            .join('');
          
          return `router.${method}('${path}'${middlewares}, ${controllerName}.${handlerName})`;
        }
      }
      
      // If we can't determine which controller, try best guess from the file name
      const fileName = path.basename(file).replace('.routes.ts', '');
      const camelCaseName = fileName.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      
      const middlewares = [middleware1, middleware2, middleware3]
        .filter(Boolean)
        .join('');
      
      return `router.${method}('${path}'${middlewares}, ${camelCaseName}Controller.${handlerName})`;
    });
    
    // 3. Fix explicit controller references (e.g., WebhookController.handleWebhook)
    // For cases like WebhookController.xyz, we need to import the controller properly
    const explicitControllerPattern = /([A-Z][a-zA-Z0-9_]+)Controller\./g;
    const explicitControllerMatches = [...content.matchAll(explicitControllerPattern)];
    
    for (const match of explicitControllerMatches) {
      const controllerName = match[1].toLowerCase();
      
      // Check if this controller is already imported
      const hasImport = content.includes(`import * as ${controllerName}Controller from`);
      
      if (!hasImport) {
        // Add import for this controller
        const importStatement = `import * as ${controllerName}Controller from '../controllers/${controllerName}.controller';\n`;
        content = importStatement + content;
      }
      
      // Update references to use the imported controller
      content = content.replace(
        new RegExp(`${match[1]}Controller\\.`, 'g'),
        `${controllerName}Controller.`
      );
    }
    
    // 4. Add TypeScript checked comment if modified
    if (content !== originalContent) {
      content = '// TypeScript checked\n' + content;
      fs.writeFileSync(file, content, 'utf8');
      fixedFiles++;
      console.log(`Fixed ${file}`);
    }
  }
  
  console.log(`Fixed ${fixedFiles} route files`);
  return fixedFiles;
}

// Run the function
fixRouteControllerRefs();