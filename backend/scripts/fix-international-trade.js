#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/modules/international-trade/services/international-trade.service.ts');

async function fixInternationalTradeService() {
  console.log('Fixing international-trade.service.ts...');
  
  try {
    let content = await fs.promises.readFile(filePath, 'utf8');
    
    // Fix syntax errors
    content = content.replace(
      /shipment\)Id: new mongoose\.Types\.ObjectId\( shipment\._id,/g, 
      'shipmentId: new mongoose.Types.ObjectId(shipment._id),'
    );
    
    // Fix nested error instances
    content = content.replace(
      /const errorMessage = error instanceof Error \? \(error instanceof Error \? \(error instanceof Error \? \(error instanceof Error \? error\.message : String\(error\)\) : String\(error\)\) : String\(error\)\) : String\(error\);/g,
      'const errorMessage = error instanceof Error ? error.message : String(error);'
    );
    
    // Write the fixed file
    await fs.promises.writeFile(filePath, content, 'utf8');
    console.log('✅ Successfully fixed international-trade.service.ts');
    
    return true;
  } catch (error) {
    console.error('❌ Error fixing international-trade.service.ts:', error);
    return false;
  }
}

// Run the fix
fixInternationalTradeService()
  .then(success => {
    if (success) {
      console.log('✅ All fixes applied successfully');
      process.exit(0);
    } else {
      console.error('❌ Some fixes failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });