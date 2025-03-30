#!/usr/bin/env node

/**
 * Rebuild File Script
 * 
 * This script helps rebuild a TypeScript file from a template,
 * while referencing the original file (if it exists).
 * 
 * Usage: node scripts/rebuild-file.js <template-type> <file-path> <resource-name> [--force]
 * Example: node scripts/rebuild-file.js controller src/controllers/user.controller.ts User
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
const BACKUP_DIR = path.join(ROOT_DIR, 'backups');

// Available templates
const TEMPLATES = {
  controller: 'controller.template.ts',
  'controller-test': 'controller.test.template.ts',
  'route-test': 'route.test.template.ts',
  service: 'service.template.ts',
  adapter: 'adapter.template.ts'
};

/**
 * Get command line arguments
 */
function getArgs() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Error: Not enough arguments');
    showUsage();
    process.exit(1);
  }
  
  const templateType = args[0];
  const filePath = args[1];
  const resourceName = args[2];
  const force = args.includes('--force');
  
  if (!TEMPLATES[templateType]) {
    console.error(`Error: Unknown template type "${templateType}"`);
    showUsage();
    process.exit(1);
  }
  
  return { templateType, filePath, resourceName, force };
}

/**
 * Show usage instructions
 */
function showUsage() {
  console.log('Usage: node scripts/rebuild-file.js <template-type> <file-path> <resource-name> [--force]');
  console.log('Example: node scripts/rebuild-file.js controller src/controllers/user.controller.ts User');
  console.log('\nAvailable template types:');
  
  Object.keys(TEMPLATES).forEach(type => {
    console.log(`  - ${type}`);
  });
  
  console.log('\nOptions:');
  console.log('  --force: Overwrite the file if it already exists');
}

/**
 * Create a backup of the original file
 */
function backupOriginalFile(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Original file does not exist: ${filePath}`);
    return false;
  }
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Create subdirectories in backup dir to match original file structure
  const relativeDirname = path.dirname(filePath);
  const backupDirPath = path.join(BACKUP_DIR, relativeDirname);
  
  if (!fs.existsSync(backupDirPath)) {
    fs.mkdirSync(backupDirPath, { recursive: true });
  }
  
  // Backup the file
  const backupPath = path.join(BACKUP_DIR, filePath);
  fs.copyFileSync(fullPath, backupPath);
  
  console.log(`✅ Original file backed up to: ${backupPath}`);
  return backupPath;
}

/**
 * Show diff between original and template file
 */
function showDiff(originalPath, newPath) {
  console.log('\n📊 Diff between original and new file:');
  console.log('===============================');
  
  try {
    const result = spawnSync('diff', ['-u', originalPath, newPath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    if (result.status === 0) {
      console.log('No differences found.');
    } else if (result.status === 1) {
      // Exit code 1 means differences were found (expected)
      console.log(result.stdout);
    } else {
      // Any other exit code is an error
      console.error(`Error running diff: ${result.stderr}`);
    }
  } catch (error) {
    console.error(`Error showing diff: ${error.message}`);
  }
}

/**
 * Rebuild file from template
 */
function rebuildFile(templateType, filePath, resourceName, force) {
  const templatePath = path.join(TEMPLATES_DIR, TEMPLATES[templateType]);
  const fullOutputPath = path.join(ROOT_DIR, filePath);
  
  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    console.error(`Error: Template does not exist: ${templatePath}`);
    process.exit(1);
  }
  
  // Check if output file already exists
  if (fs.existsSync(fullOutputPath) && !force) {
    console.error(`Error: Output file already exists: ${filePath}`);
    console.error('Use --force to overwrite it');
    process.exit(1);
  }
  
  // Backup original file if it exists
  let backupPath = null;
  if (fs.existsSync(fullOutputPath)) {
    backupPath = backupOriginalFile(filePath);
  }
  
  // Create output directory if it doesn't exist
  const outputDir = path.dirname(fullOutputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }
  
  // Read template
  try {
    let templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Replace placeholders
    templateContent = templateContent
      .replace(/Resource/g, resourceName)
      .replace(/resource/g, resourceName.toLowerCase());
    
    // Write output file
    fs.writeFileSync(fullOutputPath, templateContent, 'utf8');
    
    console.log(`✅ Rebuilt file: ${filePath}`);
    
    // Show diff if original file was backed up
    if (backupPath) {
      showDiff(backupPath, fullOutputPath);
    }
    
    console.log('\nNext steps:');
    console.log('1. Edit the file to implement the actual functionality');
    console.log('2. Reference the backup file for guidance');
    console.log('3. Run TypeScript check: npx tsc --noEmit');
  } catch (error) {
    console.error(`Error rebuilding file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔧 Rebuild File from Template');
  console.log('============================');
  
  const { templateType, filePath, resourceName, force } = getArgs();
  
  rebuildFile(templateType, filePath, resourceName, force);
}

// Run the script
main();