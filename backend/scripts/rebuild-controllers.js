/**
 * Script to rebuild all problematic controllers using templates
 * This is a master script that rebuilds multiple controllers
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONTROLLERS_DIR = path.join(__dirname, '../src/controllers');
const MODELS_DIR = path.join(__dirname, '../src/models');
const BACKUP_DIR = path.join(__dirname, '../src/controllers/backups');
const CONTROLLER_TEMPLATE = path.join(__dirname, './rebuild-templates/controller.template.ts');

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// List of controllers to rebuild - prioritized by the ones with the most errors
const controllersToRebuild = [
  'inventory-stock.controller.ts',
  'inventory.controller.ts',
  'inventory-alert.controller.ts',
  'milestone.controller.ts',
  'project.controller.ts',
  'shipment.controller.ts',
  'task.controller.ts',
  'upload.controller.ts',
  'warehouse.controller.ts',
  'webhook.controller.ts'
];

// Helper function to backup a file
function backupFile(filePath, fileName) {
  const backupPath = path.join(BACKUP_DIR, fileName + '.bak');
  if (fs.existsSync(filePath)) {
    console.log(`Backing up ${fileName}...`);
    fs.copyFileSync(filePath, backupPath);
    return true;
  }
  return false;
}

// Helper function to run specialized rebuild scripts
function runSpecializedRebuildScript(controllerName) {
  const scriptName = `rebuild-${controllerName.replace('.ts', '.js')}`;
  const scriptPath = path.join(__dirname, scriptName);
  
  if (fs.existsSync(scriptPath)) {
    console.log(`Running specialized rebuild script for ${controllerName}...`);
    try {
      execSync(`node ${scriptPath}`, { stdio: 'inherit' });
      return true;
    } catch (error) {
      console.error(`Error running specialized script for ${controllerName}:`, error);
      return false;
    }
  }
  return false;
}

// Main function to rebuild controllers
function rebuildControllers() {
  console.log('Starting controller rebuild process...');
  
  let rebuilt = 0;
  let skipped = 0;
  
  controllersToRebuild.forEach(controllerName => {
    const controllerPath = path.join(CONTROLLERS_DIR, controllerName);
    
    console.log(`\nProcessing ${controllerName}...`);
    
    // Check if the file exists
    if (!fs.existsSync(controllerPath)) {
      console.log(`${controllerName} not found, skipping...`);
      skipped++;
      return;
    }
    
    // Backup the file
    backupFile(controllerPath, controllerName);
    
    // Try to run a specialized rebuild script for this controller
    const wasRebuiltByScript = runSpecializedRebuildScript(controllerName);
    
    if (wasRebuiltByScript) {
      console.log(`${controllerName} was rebuilt using a specialized script.`);
      rebuilt++;
    } else {
      console.log(`No specialized script found for ${controllerName}. Create one to handle this controller.`);
      skipped++;
    }
  });
  
  console.log('\nRebuild process completed:');
  console.log(`- ${rebuilt} controllers rebuilt`);
  console.log(`- ${skipped} controllers skipped`);
  
  if (skipped > 0) {
    console.log('\nTo rebuild the skipped controllers, create specialized rebuild scripts.');
    console.log('Example: scripts/rebuild-controller-name.js');
  }
}

// Run the main function
rebuildControllers();