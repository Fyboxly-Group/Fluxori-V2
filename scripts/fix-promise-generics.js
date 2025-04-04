/**
 * This script specifically targets Promise generic static method errors (TS1477)
 * in files where these errors occur most frequently
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');

// Stats
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  errorsFix: {
    promiseRace: 0,
    promiseResolve: 0,
    promiseReject: 0,
    promiseAll: 0
  }
};

/**
 * Direct list of files known to have Promise.<T>.method issues
 */
const targetFiles = [
  'src/modules/ai-cs-agent/services/vertex-ai.service.ts',
  'src/modules/ai-cs-agent/tests/conversation.service.test.ts',
  'src/modules/ai-insights/services/deepseek-llm.service.ts',
  'src/modules/marketplaces/adapters/amazon/application/application-management.ts',
  'src/modules/marketplaces/adapters/amazon/application/integrations/application-integrations.ts',
  'src/modules/marketplaces/adapters/amazon/authorization/authorization.ts',
  'src/modules/marketplaces/adapters/amazon/b2b/b2b.ts',
  'src/modules/marketplaces/adapters/amazon/catalog/catalog-items.ts',
  'src/modules/marketplaces/adapters/amazon/easyship/easy-ship.ts',
  'src/modules/marketplaces/adapters/amazon/fees/product-fees.ts',
  'src/modules/marketplaces/adapters/amazon/finances/finances.ts',
  'src/modules/marketplaces/adapters/amazon/finances/shipment-invoicing/shipment-invoicing.ts',
  'src/modules/marketplaces/adapters/amazon/fulfillment/inbound/fulfillment-inbound.ts',
  'src/modules/marketplaces/adapters/amazon/fulfillment/outbound/fulfillment-outbound.ts',
  'src/modules/marketplaces/adapters/amazon/inventory/fba-inbound-eligibility/fba-inbound-eligibility.ts',
  'src/modules/marketplaces/adapters/amazon/inventory/fba/fba-inventory.ts',
  'src/modules/marketplaces/adapters/amazon/listings/listings.ts',
  'src/modules/marketplaces/adapters/amazon/messaging/messaging.ts',
  'src/modules/marketplaces/adapters/amazon/notifications/notifications.ts',
  'src/modules/marketplaces/adapters/amazon/orders/orders.ts',
  'src/modules/marketplaces/adapters/amazon/pricing/product-pricing.ts',
  'src/modules/marketplaces/adapters/amazon/product-types/product-type-definitions.ts',
  'src/modules/marketplaces/adapters/amazon/replenishment/replenishment.ts',
  'src/modules/marketplaces/adapters/amazon/reports/reports.ts',
  'src/modules/marketplaces/adapters/amazon/restrictions/listings-restrictions.ts',
  'src/modules/marketplaces/adapters/amazon/sales/sales.ts',
  'src/modules/marketplaces/adapters/amazon/sellers/sellers.ts',
  'src/modules/marketplaces/adapters/amazon/solicitations/solicitations.ts',
  'src/modules/marketplaces/adapters/amazon/supply-source/supply-source.ts',
  'src/modules/marketplaces/adapters/amazon/tokens/tokens.ts',
  'src/modules/marketplaces/adapters/amazon/uploads/uploads.ts',
  'src/modules/marketplaces/adapters/amazon/utils/batch-processor.ts',
  'src/modules/marketplaces/adapters/amazon/vendors/vendors.ts',
  'src/modules/marketplaces/adapters/amazon/warehousing/warehousing.ts',
  'src/modules/marketplaces/adapters/takealot/takealot-adapter.ts',
  'src/modules/marketplaces/adapters/takealot/takealot.adapter.ts',
  'src/modules/marketplaces/services/marketplace-adapter-factory.service.ts',
  'src/modules/marketplaces/services/marketplace-sync.service.ts',
  'src/modules/marketplaces/services/product-push.service.test.ts',
  'src/modules/rag-retrieval/services/document.service.ts',
  'src/modules/rag-retrieval/services/embedding.service.ts',
  'src/modules/rag-retrieval/services/vector-search.service.ts',
  'src/modules/xero-connector/tests/xero-sync.service.test.ts',
  'src/services/firestore/inventory.service.ts',
  'src/services/firestore/order.service.ts'
];

/**
 * Fixes Promise generic methods in the given content
 * @param {string} content File content
 * @returns {string} Updated content
 */
function fixPromiseGenericMethods(content) {
  let modified = content;

  // Fix Promise<T>.race() -> Promise.race<T>() pattern
  modified = modified.replace(/Promise<([^>]+)>\.race\(/g, (match, genericType) => {
    stats.errorsFix.promiseRace++;
    return `Promise.race<${genericType}>(`;
  });

  // Fix Promise<T>.resolve() -> Promise.resolve<T>() pattern
  modified = modified.replace(/Promise<([^>]+)>\.resolve\(/g, (match, genericType) => {
    stats.errorsFix.promiseResolve++;
    return `Promise.resolve<${genericType}>(`;
  });

  // Fix Promise<T>.reject() -> Promise.reject<T>() pattern  
  modified = modified.replace(/Promise<([^>]+)>\.reject\(/g, (match, genericType) => {
    stats.errorsFix.promiseReject++;
    return `Promise.reject<${genericType}>(`;
  });

  // Fix Promise<T>.all() -> Promise.all<T>() pattern
  modified = modified.replace(/Promise<([^>]+)>\.all\(/g, (match, genericType) => {
    stats.errorsFix.promiseAll++;
    return `Promise.all<${genericType}>(`;
  });

  // Also handle cases without parentheses (Promise<T>.all becomes Promise.all)
  modified = modified.replace(/Promise<([^>]+)>\.(race|resolve|reject|all)(?!\()/g, (match, genericType, method) => {
    stats.errorsFix[`promise${method.charAt(0).toUpperCase() + method.slice(1)}`]++;
    return `Promise.${method}`;
  });

  return modified;
}

/**
 * Process a single file
 * @param {string} filePath Path to file
 */
function processFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = fixPromiseGenericMethods(content);
    
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      stats.filesModified++;
      console.log(`Updated: ${filePath}`);
    }
    
    stats.filesProcessed++;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * Main function
 */
function main() {
  console.log('Starting Promise generic method fixes...');
  
  targetFiles.forEach(relPath => {
    const fullPath = path.join(BACKEND_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      processFile(fullPath);
    } else {
      console.error(`Target file not found: ${fullPath}`);
    }
  });
  
  console.log('\nSummary:');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log('Promise generic method fixes:');
  console.log(`  - Promise<T>.race: ${stats.errorsFix.promiseRace}`);
  console.log(`  - Promise<T>.resolve: ${stats.errorsFix.promiseResolve}`);
  console.log(`  - Promise<T>.reject: ${stats.errorsFix.promiseReject}`);
  console.log(`  - Promise<T>.all: ${stats.errorsFix.promiseAll}`);
  console.log(`  - Total fixes: ${stats.errorsFix.promiseRace + stats.errorsFix.promiseResolve + stats.errorsFix.promiseReject + stats.errorsFix.promiseAll}`);
  console.log('\nDone!');
}

main();