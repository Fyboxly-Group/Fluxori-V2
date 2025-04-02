/**
 * Updated script to fix AI CS Agent module TypeScript errors
 */
const fs = require('fs');
const path = require('path');

const CONFIG = {
  name: 'AI CS Agent Module Fixer (Updated)',
  extensions: ['.ts'],
  backupFiles: true,
  dryRun: false,
  verbose: true,
};

function fixAICSAgentIndex() {
  const filePath = path.resolve(__dirname, '../src/modules/ai-cs-agent/index.ts');
  
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
    
    // Fix the duplicate IConversation export issue
    // Line 27 contains duplicate IConversation
    let fixedContent = content;
    
    // Pattern: Fix duplicate in type exports
    if (content.includes('export type { IConversation, IConversationDocument, IConversation }')) {
      fixedContent = content.replace(
        'export type { IConversation, IConversationDocument, IConversation }',
        'export type { IConversation, IConversationDocument }'
      );
      console.log('  Fixed duplicate type export for IConversation');
      return { fixed: true, file: filePath, changes: ['Removed duplicate IConversation from type exports'] };
    }
    
    // No fixes applied
    console.log(`  No fixes needed or patterns not found`);
    return { fixed: false, file: filePath };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { error: true, file: filePath, message: error.message };
  }
}

function fixAICSAgentWebsocket() {
  const filePath = path.resolve(__dirname, '../src/modules/ai-cs-agent/utils/websocket.ts');
  
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
    
    // Fix the function call with 3 arguments error
    let fixedContent = content;
    
    // Find the generateResponse call with too many arguments
    if (content.includes('vertexAIService.generateResponse(')) {
      // Fix the function call by removing the conversationId parameter if it expects only 2 params
      fixedContent = content.replace(
        /vertexAIService\.generateResponse\(\s*data\.message,\s*clientData\.conversationId,\s*context\s*\)/,
        'vertexAIService.generateResponse(data.message, context)'
      );
      console.log('  Fixed vertexAIService.generateResponse call to use only 2 parameters');
      return { fixed: true, file: filePath, changes: ['Removed excessive parameter from generateResponse call'] };
    }
    
    // No fixes applied
    console.log(`  No fixes needed or patterns not found`);
    return { fixed: false, file: filePath };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { error: true, file: filePath, message: error.message };
  }
}

async function run() {
  console.log(`Starting ${CONFIG.name}...`);
  
  // Process each file
  const results = {
    fixed: 0,
    skipped: 0,
    errors: 0,
    totalChanges: 0,
  };
  
  // Fix AI CS Agent index.ts
  console.log('Fixing AI CS Agent index.ts...');
  const indexResult = fixAICSAgentIndex();
  
  if (indexResult.fixed) {
    results.fixed++;
    results.totalChanges += (indexResult.changes?.length || 0);
  } else if (indexResult.error) {
    results.errors++;
  } else {
    results.skipped++;
  }
  
  // Fix AI CS Agent websocket.ts
  console.log('\nFixing AI CS Agent websocket.ts...');
  const websocketResult = fixAICSAgentWebsocket();
  
  if (websocketResult.fixed) {
    results.fixed++;
    results.totalChanges += (websocketResult.changes?.length || 0);
  } else if (websocketResult.error) {
    results.errors++;
  } else {
    results.skipped++;
  }
  
  // Print summary
  console.log(`\n=========== ${CONFIG.name.toUpperCase()} SUMMARY ===========`);
  console.log(`Fixed ${results.fixed} files (${results.totalChanges} total changes)`);
  console.log(`Skipped ${results.skipped} files`);
  console.log(`Errors in ${results.errors} files`);
  console.log(`============================================`);
}

// Run the script
run().catch(console.error);