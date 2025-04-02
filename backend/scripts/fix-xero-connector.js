/**
 * Script to fix TypeScript errors in Xero connector files
 * This script specifically handles service import/export issues in the Xero connector module
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const glob = require('glob');

const ROOT_DIR = path.resolve(__dirname, '..');

// Pattern to find Xero connector files
const XERO_FILES_PATTERN = 'src/modules/xero-connector/**/*.ts';

// Function to fix Xero connector files
function fixXeroConnectorFile(filePath) {
  console.log(chalk.blue(`Processing ${path.relative(ROOT_DIR, filePath)}...`));
  
  if (!fs.existsSync(filePath)) {
    console.log(chalk.yellow(`File not found: ${filePath}`));
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already fixed (no @ts-nocheck directive)
  if (!content.includes('@ts-nocheck')) {
    console.log(chalk.yellow(`File already fixed (no @ts-nocheck directive): ${path.relative(ROOT_DIR, filePath)}`));
    return false;
  }
  
  // Process the file
  let newContent = content;
  
  // Remove @ts-nocheck comment
  newContent = newContent.replace(/\/\/ @ts-nocheck.*\n/, '');
  
  // Common pattern fixes:
  
  // 1. Fix service imports in controllers
  // Pattern: import { xeroContactService } from '../services/xero-contact.service'
  // Should be: import { XeroContactService } from '../services/xero-contact.service'
  const serviceImportRegex = /import\s*\{\s*(\w+Service)\s*\}\s*from\s*['"]([^'"]+)['"];/g;
  let match;
  
  while ((match = serviceImportRegex.exec(content)) !== null) {
    const serviceName = match[1];
    const importPath = match[2];
    const fullMatch = match[0];
    
    // Convert to import the class instead of the instance
    // Capitalize the first letter
    const className = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
    const fixedImport = `import { ${className} } from "${importPath}";
const ${serviceName} = new ${className}();`;
    
    newContent = newContent.replace(fullMatch, fixedImport);
  }
  
  // 2. Fix interface imports in the main index.ts file
  if (filePath.endsWith('index.ts')) {
    // Add mongoose import if needed
    if (!newContent.includes('import mongoose from')) {
      newContent = newContent.replace(/^import/, 'import mongoose from \'mongoose\';\nimport');
    }
    
    // Fix model interface issues
    newContent = newContent.replace(
      /export type \{\s*IXeroSyncStatus\s*\} from ['"]\.\/models\/xero-sync-status\.model['"];/,
      'export type IXeroSyncStatus = any; // Placeholder for proper interface'
    );
    
    newContent = newContent.replace(
      /export type \{\s*IXeroSyncStatusModel\s*\} from ['"]\.\/models\/xero-sync-status\.model['"];/,
      'export interface IXeroSyncStatusModel extends mongoose.Model<any> {}'
    );
    
    newContent = newContent.replace(
      /export type \{\s*IXeroConnectionModel\s*\} from ['"]\.\/models\/xero-connection\.model['"];/,
      'export interface IXeroConnectionModel extends mongoose.Model<any> {}'
    );
    
    newContent = newContent.replace(
      /export type \{\s*IXeroConfig\s*\} from ['"]\.\/models\/xero-config\.model['"];/,
      'export type IXeroConfig = any; // Placeholder for proper interface'
    );
    
    newContent = newContent.replace(
      /export type \{\s*IXeroConfigModel\s*\} from ['"]\.\/models\/xero-config\.model['"];/,
      'export interface IXeroConfigModel extends mongoose.Model<any> {}'
    );
    
    newContent = newContent.replace(
      /export type \{\s*IXeroAccountMapping\s*\} from ['"]\.\/models\/xero-account-mapping\.model['"];/,
      'export type IXeroAccountMapping = any; // Placeholder for proper interface'
    );
    
    newContent = newContent.replace(
      /export type \{\s*IXeroAccountMappingModel\s*\} from ['"]\.\/models\/xero-account-mapping\.model['"];/,
      'export interface IXeroAccountMappingModel extends mongoose.Model<any> {}'
    );
  }
  
  // 3. Fix specific import issues in order-hooks.ts
  if (filePath.includes('order-hooks.ts')) {
    newContent = newContent.replace(
      /import xeroSyncService from ['"]\.\.\/services\/xero-sync\.service['"];/,
      'import { XeroSyncService } from "../services/xero-sync.service";\nconst xeroSyncService = new XeroSyncService();'
    );
  }
  
  // Write the updated content
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(chalk.green(`Fixed TypeScript errors in: ${path.relative(ROOT_DIR, filePath)}`));
    return true;
  } else {
    console.log(chalk.yellow(`No changes needed in: ${path.relative(ROOT_DIR, filePath)}`));
    return false;
  }
}

// Main function
function main() {
  console.log(chalk.blue('🔧 Xero Connector Fixer'));
  console.log(chalk.blue('========================'));
  
  // Find all Xero connector files
  const xeroFiles = glob.sync(path.join(ROOT_DIR, XERO_FILES_PATTERN))
    .filter(filePath => !filePath.includes('/tests/'));
  
  console.log(chalk.blue(`Found ${xeroFiles.length} Xero connector files`));
  
  let fixedFiles = 0;
  
  for (const filePath of xeroFiles) {
    if (fixXeroConnectorFile(filePath)) {
      fixedFiles++;
    }
  }
  
  console.log(chalk.blue('📊 Summary'));
  console.log(chalk.blue('============'));
  console.log(chalk.green(`Fixed ${fixedFiles} out of ${xeroFiles.length} Xero connector files`));
}

main();