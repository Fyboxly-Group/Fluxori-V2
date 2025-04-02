const fs = require('fs');
const path = require('path');

function fixProductTypesFiles() {
  const directory = path.join(__dirname, '../src/modules/marketplaces/adapters/amazon/product-types');
  
  // Fix product-types.ts
  const moduleFilePath = path.join(directory, 'product-types.ts');
  if (fs.existsSync(moduleFilePath)) {
    let content = fs.readFileSync(moduleFilePath, 'utf8');
    
    // Replace "Product-typesModule" with "ProductTypesModule"
    content = content.replace(/Product-typesModule/g, 'ProductTypesModule');
    
    fs.writeFileSync(moduleFilePath, content);
    console.log(`Fixed ${moduleFilePath}`);
  }
  
  // Fix product-types-factory.ts
  const factoryFilePath = path.join(directory, 'product-types-factory.ts');
  if (fs.existsSync(factoryFilePath)) {
    let content = fs.readFileSync(factoryFilePath, 'utf8');
    
    // Fix import statement
    content = content.replace(/import Product-typesModule/g, 'import ProductTypesModule');
    
    // Fix class name
    content = content.replace(/Product-typesModuleFactory/g, 'ProductTypesModuleFactory');
    
    fs.writeFileSync(factoryFilePath, content);
    console.log(`Fixed ${factoryFilePath}`);
  }
}

fixProductTypesFiles();
console.log('Fixed product-types module files.');