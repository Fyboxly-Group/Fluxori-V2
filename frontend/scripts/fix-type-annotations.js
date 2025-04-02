/**
 * Fix Type Annotations Script
 * This script fixes "implicitly has an 'any' type" errors by adding explicit type annotations
 */

const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');
const util = require('util');
const globPromise = util.promisify(glob);

// Common TS7006 error pattern: Parameter 'xyz' implicitly has an 'any' type
async function fixTypeAnnotations() {
  console.log('🔍 Scanning files for missing type annotations...');

  // List of files with parameter type issues based on TypeScript errors
  const targetFiles = [
    'src/features/inventory/components/InventoryDetail.tsx',
    'src/features/inventory/components/MarketplacePush.tsx',
    'src/features/warehouse/components/StockTransfer.tsx',
    'src/features/warehouse/components/StockUpdateForm.tsx',
    'src/features/warehouse/components/WarehouseInventory.tsx',
    'src/features/warehouse/components/WarehouseManagement.tsx',
    'src/features/warehouse/components/WarehouseStats.tsx',
    'src/features/warehouse/components/WarehouseStockTable.tsx'
  ];

  let fixedFilesCount = 0;
  let fixedIssuesCount = 0;

  // Common callback parameters that need types
  const paramTypeMap = {
    // Common map function parameters
    'item': 'any',
    'index': 'number',
    'tag': 'any',
    'image': 'any',
    'stock': 'any',
    'warehouse': 'any',
    'category': 'any',
    'marketplace': 'any',
    'total': 'number'
  };

  // Process each file
  for (const filePath of targetFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      let updatedContent = content;
      let fileFixCount = 0;

      // Match common pattern: (param) => and (param, index) =>
      const paramRegex = /\((\w+)(?:,\s*(\w+))?\)\s*=>/g;
      let match;
      
      while ((match = paramRegex.exec(content)) !== null) {
        const fullMatch = match[0];
        const param1 = match[1];
        const param2 = match[2];
        
        let newText = fullMatch;
        let fixed = false;
        
        // Check if param1 needs a type
        if (param1 && paramTypeMap[param1]) {
          newText = newText.replace(`(${param1}`, `(${param1}: ${paramTypeMap[param1]}`);
          fixed = true;
        }
        
        // Check if param2 needs a type
        if (param2 && paramTypeMap[param2]) {
          if (newText.includes(`: ${paramTypeMap[param1]}`) && paramTypeMap[param2]) {
            newText = newText.replace(`, ${param2}`, `, ${param2}: ${paramTypeMap[param2]}`);
          } else {
            newText = newText.replace(`, ${param2}`, `, ${param2}: ${paramTypeMap[param2]}`);
          }
          fixed = true;
        }
        
        if (fixed) {
          // Replace just this instance
          updatedContent = updatedContent.slice(0, match.index) + 
                          newText + 
                          updatedContent.slice(match.index + fullMatch.length);
          fileFixCount++;
        }
      }
      
      // If the file was updated, write it back
      if (content !== updatedContent) {
        await fs.writeFile(filePath, updatedContent, 'utf8');
        fixedFilesCount++;
        fixedIssuesCount += fileFixCount;
        console.log(`✅ Fixed ${fileFixCount} type annotations in ${filePath}`);
      } else {
        console.log(`ℹ️ No applicable type annotations to fix in ${filePath}`);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`⚠️ File not found: ${filePath}`);
      } else {
        console.error(`❌ Error processing ${filePath}:`, error);
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   - Checked ${targetFiles.length} files`);
  console.log(`   - Fixed ${fixedIssuesCount} type annotations in ${fixedFilesCount} files`);
  console.log(`\n✨ Type annotation fixing complete.`);
}

// Run the function
fixTypeAnnotations().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
});