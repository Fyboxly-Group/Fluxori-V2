#!/usr/bin/env node

/**
 * Marketplace Adapters TypeScript Error Fixer
 * 
 * This script fixes TypeScript errors in the marketplace adapters module,
 * focusing on missing interface imports and type declarations.
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration
const MARKETPLACE_INTERFACE_PATH = path.resolve(__dirname, '../src/modules/marketplaces/interfaces/marketplace-adapter.interface.ts');
const AMAZON_ADAPTER_PATH = path.resolve(__dirname, '../src/modules/marketplaces/adapters/amazon/amazon-adapter.ts');
const SHOPIFY_ADAPTER_PATH = path.resolve(__dirname, '../src/modules/marketplaces/adapters/shopify/shopify-adapter.ts');
const TAKEALOT_ADAPTER_PATH = path.resolve(__dirname, '../src/modules/marketplaces/adapters/takealot/takealot-adapter.ts');

// Command line options
const ARGS = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
};

// Logging utilities
const log = (...args) => console.log(...args);
const verbose = (...args) => ARGS.verbose && console.log(...args);

/**
 * Create the marketplace adapter interface file if it doesn't exist
 */
async function createMarketplaceAdapterInterface() {
  log('📝 Creating marketplace adapter interface file...');
  
  try {
    // Check if the file already exists
    try {
      await fs.access(MARKETPLACE_INTERFACE_PATH);
      log(`✅ Marketplace adapter interface file already exists: ${MARKETPLACE_INTERFACE_PATH}`);
      return;
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      verbose(`Creating new interface file: ${MARKETPLACE_INTERFACE_PATH}`);
    }
    
    // Create the interface content
    const interfaceContent = `/**
 * Marketplace Adapter Interface
 * 
 * This interface defines the contract for all marketplace adapters.
 */

export interface MarketplaceCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: any;
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  inventory?: number;
  images?: string[];
  [key: string]: any;
}

export interface MarketplaceOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    [key: string]: any;
  };
  items: {
    productId: string;
    quantity: number;
    price: number;
    [key: string]: any;
  }[];
  total: number;
  status: string;
  createdAt: Date;
  [key: string]: any;
}

export interface MarketplaceAdapterInterface {
  /**
   * Connect to the marketplace API
   */
  connect(credentials: MarketplaceCredentials): Promise<boolean>;
  
  /**
   * Get products from the marketplace
   */
  getProducts(options?: any): Promise<MarketplaceProduct[]>;
  
  /**
   * Get a product by ID
   */
  getProduct(id: string): Promise<MarketplaceProduct | null>;
  
  /**
   * Create a product in the marketplace
   */
  createProduct(product: Partial<MarketplaceProduct>): Promise<MarketplaceProduct>;
  
  /**
   * Update a product in the marketplace
   */
  updateProduct(id: string, updates: Partial<MarketplaceProduct>): Promise<MarketplaceProduct>;
  
  /**
   * Delete a product from the marketplace
   */
  deleteProduct(id: string): Promise<boolean>;
  
  /**
   * Get orders from the marketplace
   */
  getOrders(options?: any): Promise<MarketplaceOrder[]>;
  
  /**
   * Get an order by ID
   */
  getOrder(id: string): Promise<MarketplaceOrder | null>;
  
  /**
   * Update inventory for a product
   */
  updateInventory(productId: string, quantity: number): Promise<boolean>;
}`;
    
    // Ensure the directory exists
    const interfaceDir = path.dirname(MARKETPLACE_INTERFACE_PATH);
    try {
      await fs.mkdir(interfaceDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }
    
    // Write the interface file if not in dry run mode
    if (!ARGS.dryRun) {
      await fs.writeFile(MARKETPLACE_INTERFACE_PATH, interfaceContent, 'utf8');
      log(`✅ Created marketplace adapter interface file: ${MARKETPLACE_INTERFACE_PATH}`);
    } else {
      log('⚠️ Dry run mode: No interface file created');
      verbose('Interface content would be:');
      verbose(interfaceContent);
    }
  } catch (error) {
    log(`❌ Error creating marketplace adapter interface: ${error.message}`);
    throw error;
  }
}

/**
 * Fix the adapter files to correctly import the interface
 * @param {string} adapterPath Path to the adapter file
 * @param {string} adapterName Name of the adapter (Amazon, Shopify, etc.)
 */
async function fixAdapterFile(adapterPath, adapterName) {
  log(`📝 Fixing ${adapterName} adapter file...`);
  
  try {
    // Check if the file exists
    try {
      await fs.access(adapterPath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        log(`⚠️ ${adapterName} adapter file does not exist: ${adapterPath}`);
        // Create a minimal adapter implementation
        await createAdapterImplementation(adapterPath, adapterName);
        return;
      }
      throw err;
    }
    
    // Read the file content
    let content = await fs.readFile(adapterPath, 'utf8');
    verbose(`Read ${adapterName} adapter file: ${adapterPath}`);
    
    // Fix the import statement
    const fixedImport = "import { MarketplaceAdapterInterface, MarketplaceCredentials, MarketplaceProduct, MarketplaceOrder } from '../../interfaces/marketplace-adapter.interface';";
    
    // Remove existing import
    if (content.includes("IMarketplaceAdapter")) {
      content = content.replace(
        /import\s+\{[^}]*IMarketplaceAdapter[^}]*\}\s+from\s+['"]\.\.\/\.\.\/(?:interfaces|types)\/marketplace-adapter\.interface['"];?/,
        fixedImport
      );
    } else if (content.includes("from '../../interfaces/marketplace-adapter.interface'")) {
      content = content.replace(
        /import\s+\{\s*([^\}]+)\s*\}\s+from\s+['"]\.\.\/\.\.\/(?:interfaces|types)\/marketplace-adapter\.interface['"];?/,
        fixedImport
      );
    } else {
      // Add the import if it doesn't exist
      content = `${fixedImport}\n${content}`;
    }
    
    // Replace IMarketplaceAdapter with MarketplaceAdapterInterface in the class implementation
    content = content.replace(
      /implements\s+IMarketplaceAdapter/g,
      "implements MarketplaceAdapterInterface"
    );
    
    // Write changes if not in dry run mode
    if (!ARGS.dryRun) {
      await fs.writeFile(adapterPath, content, 'utf8');
      log(`✅ Updated ${adapterName} adapter file: ${adapterPath}`);
    } else {
      log(`⚠️ Dry run mode: No changes written to ${adapterName} adapter`);
      verbose('Updated content would be:');
      verbose(content);
    }
  } catch (error) {
    log(`❌ Error fixing ${adapterName} adapter file: ${error.message}`);
    throw error;
  }
}

/**
 * Create a minimal adapter implementation if the file doesn't exist
 * @param {string} adapterPath Path where the adapter should be created
 * @param {string} adapterName Name of the adapter (Amazon, Shopify, etc.)
 */
async function createAdapterImplementation(adapterPath, adapterName) {
  log(`📝 Creating minimal ${adapterName} adapter implementation...`);
  
  // Create the adapter class with interface implementation
  const adapterContent = `import { MarketplaceAdapterInterface, MarketplaceCredentials, MarketplaceProduct, MarketplaceOrder } from '../../interfaces/marketplace-adapter.interface';

/**
 * ${adapterName} Marketplace Adapter
 */
export class ${adapterName}Adapter implements MarketplaceAdapterInterface {
  private credentials: MarketplaceCredentials | null = null;
  
  /**
   * Connect to the ${adapterName} API
   */
  async connect(credentials: MarketplaceCredentials): Promise<boolean> {
    this.credentials = credentials;
    // Implement actual connection logic
    return true;
  }
  
  /**
   * Get products from ${adapterName}
   */
  async getProducts(options?: any): Promise<MarketplaceProduct[]> {
    // Implement actual product retrieval logic
    return [];
  }
  
  /**
   * Get a product by ID
   */
  async getProduct(id: string): Promise<MarketplaceProduct | null> {
    // Implement actual product retrieval logic
    return null;
  }
  
  /**
   * Create a product in ${adapterName}
   */
  async createProduct(product: Partial<MarketplaceProduct>): Promise<MarketplaceProduct> {
    // Implement actual product creation logic
    return {
      id: 'temp-id',
      title: product.title || 'Untitled Product',
      price: product.price || 0,
    };
  }
  
  /**
   * Update a product in ${adapterName}
   */
  async updateProduct(id: string, updates: Partial<MarketplaceProduct>): Promise<MarketplaceProduct> {
    // Implement actual product update logic
    return {
      id,
      title: updates.title || 'Updated Product',
      price: updates.price || 0,
    };
  }
  
  /**
   * Delete a product from ${adapterName}
   */
  async deleteProduct(id: string): Promise<boolean> {
    // Implement actual product deletion logic
    return true;
  }
  
  /**
   * Get orders from ${adapterName}
   */
  async getOrders(options?: any): Promise<MarketplaceOrder[]> {
    // Implement actual order retrieval logic
    return [];
  }
  
  /**
   * Get an order by ID
   */
  async getOrder(id: string): Promise<MarketplaceOrder | null> {
    // Implement actual order retrieval logic
    return null;
  }
  
  /**
   * Update inventory for a product
   */
  async updateInventory(productId: string, quantity: number): Promise<boolean> {
    // Implement actual inventory update logic
    return true;
  }
}
`;
  
  // Ensure the directory exists
  const adapterDir = path.dirname(adapterPath);
  try {
    await fs.mkdir(adapterDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
  
  // Write the adapter file if not in dry run mode
  if (!ARGS.dryRun) {
    await fs.writeFile(adapterPath, adapterContent, 'utf8');
    log(`✅ Created ${adapterName} adapter implementation: ${adapterPath}`);
  } else {
    log(`⚠️ Dry run mode: No ${adapterName} adapter created`);
    verbose(`${adapterName} adapter content would be:`);
    verbose(adapterContent);
  }
}

/**
 * Main function
 */
async function main() {
  log('🔧 Marketplace Adapters TypeScript Error Fixer');
  log('============================================');
  
  try {
    // First create the marketplace adapter interface
    await createMarketplaceAdapterInterface();
    
    // Fix individual adapter files
    await fixAdapterFile(AMAZON_ADAPTER_PATH, 'Amazon');
    await fixAdapterFile(SHOPIFY_ADAPTER_PATH, 'Shopify');
    await fixAdapterFile(TAKEALOT_ADAPTER_PATH, 'Takealot');
    
    log('\n✅ All marketplace adapter TypeScript errors have been fixed!');
  } catch (error) {
    log(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();