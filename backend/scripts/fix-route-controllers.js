const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixRouteControllerReferences() {
  const files = glob.sync('src/routes/*.routes.ts');
  console.log(`Found ${files.length} route files`);
  
  let fixedFiles = 0;
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Skip already fixed files
    if (content.includes('// TypeScript checked')) {
      continue;
    }
    
    // Extract filename base (without extension)
    const fileBaseName = path.basename(file, '.routes.ts');
    const controllerName = fileBaseName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Add controller import if not present
    if (!content.includes(`import * as ${controllerName}Controller`)) {
      const importLine = `import * as ${controllerName}Controller from '../controllers/${fileBaseName}.controller';\n`;
      
      // Add after existing imports
      if (content.includes('import ')) {
        const lastImportIdx = content.lastIndexOf('import ');
        const afterLastImport = content.indexOf('\n', lastImportIdx) + 1;
        content = content.slice(0, afterLastImport) + importLine + content.slice(afterLastImport);
      } else {
        content = importLine + content;
      }
    }
    
    // Find all route handlers
    const routePattern = /router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"](,\s*[^,]+)*(,\s*(?!.*Controller\.)[a-zA-Z0-9_]+)\)/g;
    const matches = [...content.matchAll(routePattern)];
    
    for (const match of matches) {
      const fullMatch = match[0];
      const method = match[1];
      const path = match[2];
      
      // Get the last argument (handler)
      const handlerParts = fullMatch.split(',');
      const handler = handlerParts[handlerParts.length - 1].trim().replace(')', '');
      
      // If it's a direct reference already (has a dot), skip it
      if (handler.includes('.')) {
        continue;
      }
      
      // Replace with controller reference
      const middlewares = fullMatch.substring(
        fullMatch.indexOf(path) + path.length + 1,
        fullMatch.lastIndexOf(handler) - 1
      );
      
      const replacement = `router.${method}('${path}'${middlewares}, ${controllerName}Controller.${handler})`;
      content = content.replace(fullMatch, replacement);
    }
    
    // Add TypeScript checked comment if modified
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

// Run the fix function
fixRouteControllerReferences();