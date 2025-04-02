/**
 * Script to fix remaining TypeScript errors
 */
const fs = require('fs');
const path = require('path');

const CONFIG = {
  name: 'Final TypeScript Error Fixer',
  extensions: ['.ts'],
  backupFiles: true,
  dryRun: false,
  verbose: true,
};

// Files that need fixes
const FILE_FIXES = [
  {
    path: '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/xero-connector/models/xero-account-mapping.model.ts',
    fixes: [
      {
        search: 'import mongoose, { Schema, Document } from \'mongoose\';',
        replace: 'import mongoose, { Schema, Document, Model } from \'mongoose\';',
      }
    ]
  },
  {
    path: '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/xero-connector/models/xero-config.model.ts',
    fixes: [
      {
        search: 'import mongoose, { Schema, Document } from \'mongoose\';',
        replace: 'import mongoose, { Schema, Document, Model } from \'mongoose\';',
      }
    ]
  },
  {
    path: '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/xero-connector/models/xero-connection.model.ts',
    fixes: [
      {
        search: 'import mongoose, { Schema, Document } from \'mongoose\';',
        replace: 'import mongoose, { Schema, Document, Model } from \'mongoose\';',
      }
    ]
  },
  {
    path: '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/xero-connector/models/xero-sync-status.model.ts',
    fixes: [
      {
        search: 'import mongoose, { Schema, Document } from \'mongoose\';',
        replace: 'import mongoose, { Schema, Document, Model } from \'mongoose\';',
      }
    ]
  },
  {
    path: '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/credits/index.ts',
    fixes: [
      {
        search: 'export interface ICreditDocument extends mongoose.Document {',
        replace: 'import * as mongoose from \'mongoose\';\n\nexport interface ICreditDocument extends mongoose.Document {',
      }
    ]
  },
  {
    path: '/home/tarquin_stapa/Fluxori-V2/backend/src/routes/auth.routes.ts',
    fixes: [
      {
        search: 'router.post(\'/logout\', auth(), controller.logout);',
        replace: 'router.post(\'/logout\', auth(), authController.logout);',
      },
      {
        search: 'router.get(\'/me\', auth(), controller.getCurrentUser);',
        replace: 'router.get(\'/me\', auth(), authController.getCurrentUser);',
      }
    ]
  },
  {
    path: '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/ai-cs-agent/index.ts',
    fixes: [
      {
        search: 'export interface IConversation {',
        replace: 'export interface IAICSConversation {',
      },
      {
        search: 'export interface IConversationDocument extends IConversation, Document {}',
        replace: 'export interface IAICSConversationDocument extends IAICSConversation, Document {}',
      }
    ]
  },
  {
    path: '/home/tarquin_stapa/Fluxori-V2/backend/src/routes/shipment.routes.ts',
    fixes: [
      {
        search: 'const router = express.Router();\nrouter.get(\'/shipments/:id/documents\', shipmentController.getShipmentDocuments);',
        replace: 'const router = express.Router();\n\n// Import controller\nimport * as shipmentController from \'../controllers/shipment.controller\';\n\nrouter.get(\'/shipments/:id/documents\', shipmentController.getShipmentDocuments);',
      }
    ]
  }
];

function fixFile(filePath, fixes) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return { fixed: false, file: filePath };
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(`Processing ${filePath}...`);
    
    // Create a backup if configured
    if (CONFIG.backupFiles) {
      const backupPath = `${filePath}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, content);
      console.log(`  Created backup at ${backupPath}`);
    }
    
    let fixedContent = content;
    let fixCount = 0;
    
    // Apply each fix
    for (const fix of fixes) {
      if (fixedContent.includes(fix.search)) {
        fixedContent = fixedContent.replace(fix.search, fix.replace);
        fixCount++;
        console.log(`  Applied fix: ${fix.search.substring(0, 30)}... -> ${fix.replace.substring(0, 30)}...`);
      } else {
        console.log(`  Skipped fix: ${fix.search.substring(0, 30)}... (pattern not found)`);
      }
    }
    
    // Only write changes if modifications were made and not in dry run mode
    if (fixCount > 0 && fixedContent !== content && !CONFIG.dryRun) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`  Fixed successfully (${fixCount} fixes applied)`);
      return { fixed: true, file: filePath, fixCount };
    } else if (fixCount > 0 && fixedContent !== content && CONFIG.dryRun) {
      console.log(`  [DRY RUN] Would apply ${fixCount} fixes`);
      return { fixed: true, file: filePath, fixCount };
    } else {
      console.log(`  No fixes applied`);
      return { fixed: false, file: filePath };
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { error: true, file: filePath, message: error.message };
  }
}

async function run() {
  console.log(`Starting ${CONFIG.name}...`);
  
  console.log(`Found ${FILE_FIXES.length} files to process`);
  
  // Process each file
  const results = {
    fixed: 0,
    fixCount: 0,
    skipped: 0,
    errors: 0,
  };
  
  for (const fileFix of FILE_FIXES) {
    const result = fixFile(fileFix.path, fileFix.fixes);
    
    if (result.fixed) {
      results.fixed++;
      results.fixCount += result.fixCount || 0;
    } else if (result.error) {
      results.errors++;
      console.error(`Error in ${result.file}: ${result.message}`);
    } else {
      results.skipped++;
    }
  }
  
  // Print summary
  console.log(`\n=========== ${CONFIG.name.toUpperCase()} SUMMARY ===========`);
  console.log(`Fixed ${results.fixed} files (${results.fixCount} total fixes)`);
  console.log(`Skipped ${results.skipped} files`);
  console.log(`Errors in ${results.errors} files`);
  console.log(`============================================`);
}

// Run the script
run().catch(console.error);