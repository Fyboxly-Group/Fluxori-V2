/**
 * Script to fix TypeScript errors in the connections module
 * Specifically addresses interface export/import issues
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const ROOT_DIR = path.resolve(__dirname, '..');

function fixConnectionIndexFile() {
  console.log(chalk.blue('Fixing connections module index exports...'));
  const filePath = path.join(ROOT_DIR, 'src/modules/connections/index.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log(chalk.yellow(`File not found: ${filePath}`));
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Remove @ts-nocheck comment
  let newContent = content.replace(/\/\/ @ts-nocheck.*\n/, '');
  
  // Fix type export issue - the problem is that we're trying to re-export types that may not exist with those names
  newContent = newContent.replace(
    /export type \{ IConnection, IConnectionDocument, IConnectionModel \} from '\.\/models\/connection\.model';/,
    `// Re-exporting connection types with proper aliases to avoid conflicts
export type IConnection = IMarketplaceConnection;
export type IConnectionDocument = IMarketplaceConnectionDocument;
export type IConnectionModel = MarketplaceConnectionModel;`
  );
  
  // Write the updated content
  fs.writeFileSync(filePath, newContent);
  console.log(chalk.green(`Fixed connections index file: ${filePath}`));
  
  return true;
}

function main() {
  console.log(chalk.blue('🔧 Connection Exports Fixer'));
  console.log(chalk.blue('============================'));
  
  const fixedConnectionIndex = fixConnectionIndexFile();
  
  console.log(chalk.blue('📊 Summary'));
  console.log(chalk.blue('============'));
  console.log(chalk.green(`Fixed files: ${fixedConnectionIndex ? 1 : 0}`));
}

main();