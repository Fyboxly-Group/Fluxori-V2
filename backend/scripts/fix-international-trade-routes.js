const fs = require('fs');
const path = require('path');

function fixInternationalTradeRoutes() {
  const filePath = path.join(__dirname, '../src/modules/international-trade/routes/international-trade.routes.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return { fixed: false };
  }
  
  console.log(`Processing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Create a backup
  const backupPath = `${filePath}.backup-${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`Created backup at ${backupPath}`);
  
  // Fix the import path
  let fixedContent = content.replace(
    /import \* as international_trade_Controller from "\.\.\/controllers\/international_tradinternational-trade\.controller\.controller";/,
    'import * as international_trade_Controller from "../controllers/international-trade.controller";'
  );
  
  // Fix route handlers
  fixedContent = fixedContent.replace(
    /international-tradinternational-trade\.controller\.controller\./g,
    'international_trade_Controller.'
  );
  
  if (content === fixedContent) {
    console.log('No changes needed for this file');
    return { fixed: false };
  }
  
  // Save the fixed content
  fs.writeFileSync(filePath, fixedContent);
  console.log(`Fixed ${filePath}`);
  
  return { fixed: true };
}

function main() {
  console.log('Starting International Trade Routes Fixer...');
  const result = fixInternationalTradeRoutes();
  
  console.log('\n=========== INTERNATIONAL TRADE ROUTES FIXER SUMMARY ===========');
  console.log(`Fixed: ${result.fixed ? 'Yes' : 'No'}`);
  console.log('============================================');
}

main();