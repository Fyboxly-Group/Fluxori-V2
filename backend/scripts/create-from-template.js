#!/usr/bin/env node

/**
 * Create File from Template
 * 
 * This script helps create new files from templates.
 * Usage: node scripts/create-from-template.js <template-type> <output-path> <resource-name>
 * Example: node scripts/create-from-template.js controller src/controllers/user.controller.ts User
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');

// Available templates
const TEMPLATES = {
  controller: 'controller.template.ts',
  'controller-test': 'controller.test.template.ts',
  'route-test': 'route.test.template.ts',
  service: 'service.template.ts',
  adapter: 'adapter.template.ts',
  model: 'model.template.ts'
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
  
  const [templateType, outputPath, resourceName] = args;
  
  if (!TEMPLATES[templateType]) {
    console.error(`Error: Unknown template type "${templateType}"`);
    showUsage();
    process.exit(1);
  }
  
  return { templateType, outputPath, resourceName };
}

/**
 * Show usage instructions
 */
function showUsage() {
  console.log('Usage: node scripts/create-from-template.js <template-type> <output-path> <resource-name>');
  console.log('Example: node scripts/create-from-template.js controller src/controllers/user.controller.ts User');
  console.log('\nAvailable template types:');
  
  Object.keys(TEMPLATES).forEach(type => {
    console.log(`  - ${type}`);
  });
}

/**
 * Create file from template
 */
function createFileFromTemplate(templateType, outputPath, resourceName) {
  const templatePath = path.join(TEMPLATES_DIR, TEMPLATES[templateType]);
  const fullOutputPath = path.join(ROOT_DIR, outputPath);
  
  // Check if output directory exists
  const outputDir = path.dirname(fullOutputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }
  
  // Check if output file already exists
  if (fs.existsSync(fullOutputPath)) {
    console.error(`Error: Output file already exists: ${outputPath}`);
    process.exit(1);
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
    
    console.log(`✅ Created file: ${outputPath}`);
    console.log(`Next steps:`);
    console.log(`1. Edit the file to implement the actual functionality`);
    console.log(`2. Run TypeScript check: npx tsc --noEmit ${outputPath}`);
  } catch (error) {
    console.error(`Error creating file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔧 Create File from Template');
  console.log('=============================');
  
  const { templateType, outputPath, resourceName } = getArgs();
  
  createFileFromTemplate(templateType, outputPath, resourceName);
}

// Run the script
main();