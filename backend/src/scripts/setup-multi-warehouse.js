#!/usr/bin/env node

/**
 * Setup Multi-Warehouse Environment Script
 * 
 * This script initializes the multi-warehouse environment by:
 * 1. Creating a default warehouse if none exists
 * 2. Migrating existing inventory data to the warehouse structure
 * 3. Setting up the reorder point check scheduler
 * 
 * Usage: 
 * $ node setup-multi-warehouse.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

// Display banner
console.log(`
${colors.bright}${colors.blue}┌────────────────────────────────────────────────┐
│ Fluxori Multi-Warehouse Inventory Setup Script │
└────────────────────────────────────────────────┘${colors.reset}
`);

function runTsScript(scriptPath) {
  const fullPath = path.resolve(__dirname, scriptPath);
  
  // Check if the script exists
  if (!fs.existsSync(fullPath)) {
    console.error(`${colors.red}Error: Script not found: ${fullPath}${colors.reset}`);
    process.exit(1);
  }

  try {
    console.log(`${colors.bright}${colors.yellow}Running script: ${path.basename(scriptPath)}${colors.reset}`);
    execSync(`npx ts-node ${fullPath}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`${colors.red}Error running script: ${error.message}${colors.reset}`);
    return false;
  }
}

async function setup() {
  console.log(`${colors.cyan}Step 1: Initializing default warehouse...${colors.reset}`);
  const warehouseSuccess = runTsScript('./init-default-warehouse.ts');
  
  if (!warehouseSuccess) {
    console.warn(`${colors.yellow}Warning: Default warehouse initialization failed. Continuing anyway...${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}Step 2: Migrating inventory data to warehouses...${colors.reset}`);
  const migrationSuccess = runTsScript('./migrate-inventory-to-warehouses.ts');
  
  if (!migrationSuccess) {
    console.error(`${colors.red}Error: Inventory migration failed. Please check the logs and try again.${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`\n${colors.green}${colors.bright}✓ Multi-warehouse setup completed successfully!${colors.reset}`);
  
  console.log(`\n${colors.gray}Next steps:
1. Ensure the inventory reorder check scheduler is enabled in your application
2. Start using the new warehouse-specific inventory endpoints
3. Update your frontend to support multi-warehouse inventory management
${colors.reset}`);
}

// Run the setup
setup().catch(error => {
  console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  process.exit(1);
});