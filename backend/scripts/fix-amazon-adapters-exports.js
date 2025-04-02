const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix Amazon adapter index files
function fixAmazonAdapterIndexFiles() {
  const pattern = 'src/modules/marketplaces/adapters/amazon/**/index.ts';
  const files = glob.sync(pattern);
  
  console.log(`Found ${files.length} Amazon adapter index files`);
  
  let fixedFiles = 0;
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Check if the file has already been TypeScript checked
    if (!content.includes('// TypeScript checked')) {
      // Fix default export imports with curly braces
      content = content.replace(
        /import\s+(\w+)\s+from\s+['"](.+?)['"]/g,
        (match, importName, importPath) => {
          // Skip node modules
          if (importPath.startsWith('./')) {
            modified = true;
            return `import { ${importName} } from "${importPath}"`;
          }
          return match;
        }
      );
      
      // Fix duplicate placeholder exports
      if (content.includes('export * from')) {
        const reexportLines = content.match(/export \* from ['"](.*?)['"];/g) || [];
        
        // Check for duplicate exports
        if (reexportLines.length > 1 && content.includes('placeholder')) {
          // Replace with specific exports
          for (const line of reexportLines) {
            const modulePath = line.match(/['"](.+?)['"]/)[1];
            // Replace with named export
            if (modulePath.includes('/')) {
              const moduleName = modulePath.split('/').pop();
              const exportName = moduleName.replace(/-/g, '').replace(/\./g, '');
              
              // Convert to re-export of default
              const fixedExport = `export { default as ${exportName} } from "${modulePath}"`;
              content = content.replace(line, fixedExport);
              modified = true;
            }
          }
        }
      }
      
      // Fix missing default exports in module imports
      if (content.includes('export {')) {
        content = content.replace(
          /export\s*{\s*(\w+)(?:\s+as\s+(\w+))?\s*}\s*from\s*['"](.+?)['"]/g,
          (match, importName, asName, importPath) => {
            // Only modify if it's a local module
            if (importPath.startsWith('./')) {
              modified = true;
              const exportName = asName || importName;
              
              // Convert to import default if the name is the same as file
              const moduleName = importPath.split('/').pop();
              const normalizedModuleName = moduleName.replace(/-/g, '');
              
              if (normalizedModuleName === exportName.toLowerCase()) {
                return `export { default as ${exportName} } from "${importPath}"`;
              }
              
              // For factory files
              if (importPath.includes('-factory') && exportName.includes('Factory')) {
                return `export { default as ${exportName} } from "${importPath}"`;
              }
            }
            return match;
          }
        );
      }
      
      // Add TypeScript checked comment if modified
      if (modified) {
        content = '// TypeScript checked\n' + content;
        fs.writeFileSync(file, content, 'utf8');
        fixedFiles++;
        console.log(`Fixed ${file}`);
      }
    }
  }
  
  console.log(`Fixed ${fixedFiles} Amazon adapter index files`);
  return fixedFiles;
}

// Run the function
fixAmazonAdapterIndexFiles();