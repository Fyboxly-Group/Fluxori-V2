#!/usr/bin/env node

/**
 * Marketplace Adapter Template Generator
 * 
 * This script generates a TypeScript-compliant template for a new marketplace adapter.
 * It creates all necessary files with proper TypeScript typing following best practices.
 * 
 * Usage: node scripts/generate-adapter-template.js <adapter-name>
 * Example: node scripts/generate-adapter-template.js woocommerce
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Get adapter name from command line arguments
const adapterName = process.argv[2];

if (!adapterName) {
  console.error(chalk.red('❌ Error: Please provide an adapter name'));
  console.log('Usage: node scripts/generate-adapter-template.js <adapter-name>');
  console.log('Example: node scripts/generate-adapter-template.js woocommerce');
  process.exit(1);
}

// Configuration
const config = {
  rootDir: process.cwd(),
  adapterDir: path.join(process.cwd(), 'src/modules/marketplaces/adapters', adapterName),
  typesDir: path.join(process.cwd(), 'src/types/generated/marketplaces', adapterName),
};

/**
 * Ensure a directory exists
 * @param {string} dirPath - Path to the directory
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(chalk.blue(`Creating directory: ${dirPath}`));
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Convert string to PascalCase
 * @param {string} str - Input string
 * @returns {string} - PascalCase string
 */
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Generate adapter service template
 */
function generateAdapterService() {
  console.log(chalk.blue(`Generating ${adapterName} adapter service...`));
  
  const pascalCaseName = toPascalCase(adapterName);
  const servicePath = path.join(config.adapterDir, `${adapterName}-adapter.service.ts`);
  
  const serviceContent = `import mongoose from 'mongoose';
import { AdapterInterfaceProduct, MarketplaceModelProduct } from '../../interfaces/product.interface';
import { PaginatedResponse } from '../../../../types/utility/pagination.types';
import { ProductFilterOptions } from '../../interfaces/filter.interface';
import { toObjectId } from '../../../../types/utility/mongodb.types';
import { Result, success, failure } from '../../../../types/utility/error-handling.types';

/**
 * ${pascalCaseName} Marketplace Adapter
 * 
 * Implements integration with ${pascalCaseName} marketplace.
 */
export class ${pascalCaseName}AdapterService {
  /**
   * Initialize the ${pascalCaseName} adapter
   * @param config - Configuration options
   */
  constructor(private config: Record<string, any>) {}

  /**
   * Get products from ${pascalCaseName}
   * First overload: Get all products as an array
   */
  async getProducts(options?: any): Promise<AdapterInterfaceProduct[]>;
  
  /**
   * Get products from ${pascalCaseName}
   * Second overload: Get paginated products with filters
   */
  async getProducts(page: number, pageSize: number, filters?: ProductFilterOptions): Promise<PaginatedResponse<MarketplaceModelProduct>>;
  
  /**
   * Get products from ${pascalCaseName}
   * @param pageOrOptions - Page number or options object
   * @param pageSize - Number of items per page
   * @param filters - Optional filters
   * @returns Products or paginated response
   */
  async getProducts(
    pageOrOptions?: number | any,
    pageSize?: number,
    filters?: ProductFilterOptions
  ): Promise<AdapterInterfaceProduct[] | PaginatedResponse<MarketplaceModelProduct>> {
    try {
      // Implementation goes here
      // This is just a placeholder that returns an empty response
      if (typeof pageOrOptions === 'number') {
        // Paginated response
        return {
          data: [],
          total: 0,
          page: pageOrOptions,
          pageSize: pageSize || 10,
          totalPages: 0
        };
      } else {
        // Array response
        return [];
      }
    } catch (error) {
      console.error(\`Error fetching ${pascalCaseName} products: \${error instanceof Error ? error.message : 'Unknown error'}\`);
      if (typeof pageOrOptions === 'number') {
        return {
          data: [],
          total: 0,
          page: pageOrOptions,
          pageSize: pageSize || 10,
          totalPages: 0
        };
      } else {
        return [];
      }
    }
  }

  /**
   * Get a single product by ID
   * @param productId - Product ID
   * @returns The product or null if not found
   */
  async getProductById(productId: string): Promise<Result<MarketplaceModelProduct | null, Error>> {
    try {
      // Implementation goes here
      // This is just a placeholder
      return success(null);
    } catch (error) {
      console.error(\`Error fetching ${pascalCaseName} product: \${error instanceof Error ? error.message : 'Unknown error'}\`);
      return failure(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  /**
   * Create a new product
   * @param product - Product data
   * @returns Created product
   */
  async createProduct(product: AdapterInterfaceProduct): Promise<Result<MarketplaceModelProduct, Error>> {
    try {
      // Implementation goes here
      // This is just a placeholder
      return success({
        id: 'placeholder-id',
        name: product.name,
        description: product.description || '',
        price: product.price || 0,
        currency: product.currency || 'USD',
        marketplace: '${adapterName}',
        externalId: 'placeholder-external-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(\`Error creating ${pascalCaseName} product: \${error instanceof Error ? error.message : 'Unknown error'}\`);
      return failure(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  /**
   * Update an existing product
   * @param productId - Product ID
   * @param updateData - Product data to update
   * @returns Updated product
   */
  async updateProduct(
    productId: string,
    updateData: Partial<AdapterInterfaceProduct>
  ): Promise<Result<MarketplaceModelProduct, Error>> {
    try {
      // Implementation goes here
      // This is just a placeholder
      return success({
        id: productId,
        name: updateData.name || 'Placeholder Name',
        description: updateData.description || 'Placeholder Description',
        price: updateData.price || 0,
        currency: updateData.currency || 'USD',
        marketplace: '${adapterName}',
        externalId: 'placeholder-external-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(\`Error updating ${pascalCaseName} product: \${error instanceof Error ? error.message : 'Unknown error'}\`);
      return failure(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  /**
   * Delete a product
   * @param productId - Product ID
   * @returns Success or failure
   */
  async deleteProduct(productId: string): Promise<Result<boolean, Error>> {
    try {
      // Implementation goes here
      // This is just a placeholder
      return success(true);
    } catch (error) {
      console.error(\`Error deleting ${pascalCaseName} product: \${error instanceof Error ? error.message : 'Unknown error'}\`);
      return failure(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  /**
   * Sync products from ${pascalCaseName} to our database
   * @returns Number of products synced
   */
  async syncProducts(): Promise<Result<number, Error>> {
    try {
      // Implementation goes here
      // This is just a placeholder
      return success(0);
    } catch (error) {
      console.error(\`Error syncing ${pascalCaseName} products: \${error instanceof Error ? error.message : 'Unknown error'}\`);
      return failure(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
`;
  
  fs.writeFileSync(servicePath, serviceContent);
  console.log(chalk.green(`✅ Generated ${adapterName} adapter service at ${servicePath}`));
}

/**
 * Generate adapter interface template
 */
function generateAdapterInterface() {
  console.log(chalk.blue(`Generating ${adapterName} adapter interface...`));
  
  const pascalCaseName = toPascalCase(adapterName);
  ensureDirectoryExists(config.typesDir);
  
  const interfacePath = path.join(config.typesDir, `${adapterName}-adapter.interface.ts`);
  
  const interfaceContent = `/**
 * ${pascalCaseName} Adapter Interface
 * Generated automatically - you can extend with additional methods
 */

import { Types } from 'mongoose';
import { PaginatedResponse } from '../../../utility/pagination.types';
import { ProductFilterOptions } from '../../../../modules/marketplaces/interfaces/filter.interface';
import { AdapterInterfaceProduct, MarketplaceModelProduct } from '../../../../modules/marketplaces/interfaces/product.interface';
import { Result } from '../../../utility/error-handling.types';

export interface I${pascalCaseName}AdapterService {
  /**
   * Get products
   */
  getProducts(options?: any): Promise<AdapterInterfaceProduct[]>;
  getProducts(page: number, pageSize: number, filters?: ProductFilterOptions): Promise<PaginatedResponse<MarketplaceModelProduct>>;

  /**
   * Get product by ID
   */
  getProductById(productId: string): Promise<Result<MarketplaceModelProduct | null, Error>>;

  /**
   * Create product
   */
  createProduct(product: AdapterInterfaceProduct): Promise<Result<MarketplaceModelProduct, Error>>;

  /**
   * Update product
   */
  updateProduct(
    productId: string,
    updateData: Partial<AdapterInterfaceProduct>
  ): Promise<Result<MarketplaceModelProduct, Error>>;

  /**
   * Delete product
   */
  deleteProduct(productId: string): Promise<Result<boolean, Error>>;

  /**
   * Sync products
   */
  syncProducts(): Promise<Result<number, Error>>;
}
`;
  
  fs.writeFileSync(interfacePath, interfaceContent);
  console.log(chalk.green(`✅ Generated ${adapterName} adapter interface at ${interfacePath}`));
}

/**
 * Generate adapter config template
 */
function generateAdapterConfig() {
  console.log(chalk.blue(`Generating ${adapterName} adapter config...`));
  
  const configPath = path.join(config.adapterDir, `${adapterName}-adapter.config.ts`);
  
  const configContent = `/**
 * ${toPascalCase(adapterName)} adapter configuration
 */

export interface ${toPascalCase(adapterName)}AdapterConfig {
  /**
   * API Key for ${toPascalCase(adapterName)}
   */
  apiKey: string;
  
  /**
   * API Secret for ${toPascalCase(adapterName)}
   */
  apiSecret: string;
  
  /**
   * API URL for ${toPascalCase(adapterName)}
   */
  apiUrl: string;
  
  /**
   * Webhook URL for ${toPascalCase(adapterName)} callbacks
   */
  webhookUrl?: string;
  
  /**
   * Connection timeout in milliseconds
   */
  timeout?: number;
}

/**
 * Default configuration for ${toPascalCase(adapterName)}
 */
export const default${toPascalCase(adapterName)}Config: ${toPascalCase(adapterName)}AdapterConfig = {
  apiKey: process.env.${adapterName.toUpperCase()}_API_KEY || '',
  apiSecret: process.env.${adapterName.toUpperCase()}_API_SECRET || '',
  apiUrl: process.env.${adapterName.toUpperCase()}_API_URL || 'https://api.${adapterName}.com/v2',
  timeout: 30000,
};
`;
  
  fs.writeFileSync(configPath, configContent);
  console.log(chalk.green(`✅ Generated ${adapterName} adapter config at ${configPath}`));
}

/**
 * Generate adapter test template
 */
function generateAdapterTest() {
  console.log(chalk.blue(`Generating ${adapterName} adapter test...`));
  
  const pascalCaseName = toPascalCase(adapterName);
  const testDir = path.join(config.adapterDir, 'tests');
  ensureDirectoryExists(testDir);
  
  const testPath = path.join(testDir, `${adapterName}-adapter.test.ts`);
  
  const testContent = `import { expect } from 'chai';
import sinon from 'sinon';
import { ${pascalCaseName}AdapterService } from '../${adapterName}-adapter.service';
import { default${pascalCaseName}Config } from '../${adapterName}-adapter.config';
import { isSuccess } from '../../../../../types/utility/error-handling.types';

describe('${pascalCaseName}AdapterService', () => {
  let adapter: ${pascalCaseName}AdapterService;
  
  beforeEach(() => {
    adapter = new ${pascalCaseName}AdapterService(default${pascalCaseName}Config);
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('getProducts', () => {
    it('should get products as an array when no pagination is specified', async () => {
      // Act
      const result = await adapter.getProducts();
      
      // Assert
      expect(Array.isArray(result)).to.be.true;
    });
    
    it('should get paginated products when pagination is specified', async () => {
      // Act
      const result = await adapter.getProducts(1, 10);
      
      // Assert
      expect(result).to.have.property('data');
      expect(result).to.have.property('total');
      expect(result).to.have.property('page');
      expect(result).to.have.property('pageSize');
      expect(result).to.have.property('totalPages');
    });
  });
  
  describe('getProductById', () => {
    it('should get a product by ID', async () => {
      // Act
      const result = await adapter.getProductById('test-id');
      
      // Assert
      expect(isSuccess(result)).to.be.true;
    });
  });
  
  describe('createProduct', () => {
    it('should create a product', async () => {
      // Arrange
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        currency: 'USD',
      };
      
      // Act
      const result = await adapter.createProduct(productData);
      
      // Assert
      expect(isSuccess(result)).to.be.true;
      if (isSuccess(result)) {
        expect(result.data).to.have.property('name', 'Test Product');
      }
    });
  });
  
  describe('updateProduct', () => {
    it('should update a product', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Product',
      };
      
      // Act
      const result = await adapter.updateProduct('test-id', updateData);
      
      // Assert
      expect(isSuccess(result)).to.be.true;
      if (isSuccess(result)) {
        expect(result.data).to.have.property('name', 'Updated Product');
      }
    });
  });
  
  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      // Act
      const result = await adapter.deleteProduct('test-id');
      
      // Assert
      expect(isSuccess(result)).to.be.true;
      if (isSuccess(result)) {
        expect(result.data).to.be.true;
      }
    });
  });
  
  describe('syncProducts', () => {
    it('should sync products', async () => {
      // Act
      const result = await adapter.syncProducts();
      
      // Assert
      expect(isSuccess(result)).to.be.true;
      if (isSuccess(result)) {
        expect(result.data).to.be.a('number');
      }
    });
  });
});
`;
  
  fs.writeFileSync(testPath, testContent);
  console.log(chalk.green(`✅ Generated ${adapterName} adapter test at ${testPath}`));
}

/**
 * Generate adapter factory registration
 */
function generateAdapterFactory() {
  console.log(chalk.blue(`Generating ${adapterName} adapter factory integration...`));
  
  const factoryPath = path.join(config.rootDir, 'src/modules/marketplaces/factories/adapter.factory.ts');
  
  if (!fs.existsSync(factoryPath)) {
    console.log(chalk.yellow(`⚠️ Adapter factory not found at ${factoryPath}. Skipping factory integration.`));
    return;
  }
  
  try {
    let factoryContent = fs.readFileSync(factoryPath, 'utf8');
    const pascalCaseName = toPascalCase(adapterName);
    
    // Check if this adapter is already registered
    if (factoryContent.includes(`'${adapterName}':`)) {
      console.log(chalk.yellow(`⚠️ Adapter '${adapterName}' already registered in factory. Skipping.`));
      return;
    }
    
    // Add import
    const importStatement = `import { ${pascalCaseName}AdapterService } from '../adapters/${adapterName}/${adapterName}-adapter.service';
import { default${pascalCaseName}Config } from '../adapters/${adapterName}/${adapterName}-adapter.config';`;
    
    // Find the last import and add our import after it
    const lastImportMatch = factoryContent.match(/import.*?;(?=\s*\n)/g);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      factoryContent = factoryContent.replace(lastImport, `${lastImport}\n${importStatement}`);
    }
    
    // Add adapter to factory
    const adapterCase = `      case '${adapterName}':
        return new ${pascalCaseName}AdapterService(default${pascalCaseName}Config);`;
    
    // Find the switch statement and add our case before the default case
    const defaultCaseMatch = factoryContent.match(/\s*default:\s*\n/);
    if (defaultCaseMatch) {
      factoryContent = factoryContent.replace(defaultCaseMatch[0], `${adapterCase}\n${defaultCaseMatch[0]}`);
    }
    
    // Write the updated factory
    fs.writeFileSync(factoryPath, factoryContent);
    console.log(chalk.green(`✅ Added ${adapterName} to adapter factory`));
  } catch (error) {
    console.error(chalk.red(`❌ Error updating adapter factory: ${error.message}`));
  }
}

/**
 * Generate adapter documentation
 */
function generateAdapterDocs() {
  console.log(chalk.blue(`Generating ${adapterName} adapter documentation...`));
  
  const docsPath = path.join(config.adapterDir, `${adapterName}-adapter.md`);
  
  const docsContent = `# ${toPascalCase(adapterName)} Adapter

## Overview

This adapter integrates with the ${toPascalCase(adapterName)} marketplace to allow product management operations.

## Configuration

Configure the adapter using environment variables:

- \`${adapterName.toUpperCase()}_API_KEY\`: API key for authentication
- \`${adapterName.toUpperCase()}_API_SECRET\`: API secret for authentication
- \`${adapterName.toUpperCase()}_API_URL\`: API endpoint URL (defaults to https://api.${adapterName}.com/v2)

## Usage

### Initialize the adapter

\`\`\`typescript
import { getMarketplaceAdapter } from '../../factories/adapter.factory';

// Get adapter instance
const adapter = getMarketplaceAdapter('${adapterName}');
\`\`\`

### Get Products

\`\`\`typescript
// Get all products
const products = await adapter.getProducts();

// Get paginated products
const paginatedProducts = await adapter.getProducts(1, 10, { name: 'search' });
\`\`\`

### Get Product by ID

\`\`\`typescript
const productResult = await adapter.getProductById('product-id');
if (isSuccess(productResult)) {
  const product = productResult.data;
  // Use product data
}
\`\`\`

### Create Product

\`\`\`typescript
const productData = {
  name: 'New Product',
  description: 'Product description',
  price: 100,
  currency: 'USD',
};

const createResult = await adapter.createProduct(productData);
if (isSuccess(createResult)) {
  const newProduct = createResult.data;
  // Use created product
}
\`\`\`

### Update Product

\`\`\`typescript
const updateResult = await adapter.updateProduct('product-id', {
  name: 'Updated Product Name',
  price: 150,
});

if (isSuccess(updateResult)) {
  const updatedProduct = updateResult.data;
  // Use updated product
}
\`\`\`

### Delete Product

\`\`\`typescript
const deleteResult = await adapter.deleteProduct('product-id');
if (isSuccess(deleteResult) && deleteResult.data) {
  // Product deleted successfully
}
\`\`\`

### Sync Products

\`\`\`typescript
const syncResult = await adapter.syncProducts();
if (isSuccess(syncResult)) {
  const syncedCount = syncResult.data;
  console.log(\`Synced \${syncedCount} products\`);
}
\`\`\`

## Error Handling

All methods return a \`Result<T, Error>\` type that can be checked using the \`isSuccess\` and \`isFailure\` helper functions:

\`\`\`typescript
import { isSuccess, isFailure } from '../../../../types/utility/error-handling.types';

const result = await adapter.getProductById('product-id');

if (isSuccess(result)) {
  // Success case
  const product = result.data;
} else {
  // Error case
  const error = result.error;
  console.error(\`Failed to get product: \${error.message}\`);
}
\`\`\`

## TypeScript Usage

This adapter provides full TypeScript support with proper types for all operations.
`;
  
  fs.writeFileSync(docsPath, docsContent);
  console.log(chalk.green(`✅ Generated ${adapterName} adapter documentation at ${docsPath}`));
}

/**
 * Main function to run all generator steps
 */
async function main() {
  console.log(chalk.blue(`🚀 Generating ${adapterName} marketplace adapter template`));
  
  // Create adapter directory
  ensureDirectoryExists(config.adapterDir);
  
  // Generate adapter files
  generateAdapterService();
  generateAdapterInterface();
  generateAdapterConfig();
  generateAdapterTest();
  generateAdapterFactory();
  generateAdapterDocs();
  
  console.log(chalk.green(`✅ ${adapterName} adapter template generated successfully!`));
  console.log(chalk.blue(`📊 Next steps:`));
  console.log(`  1. Implement the adapter's methods in ${adapterName}-adapter.service.ts`);
  console.log(`  2. Update the configuration in ${adapterName}-adapter.config.ts`);
  console.log(`  3. Run tests with 'npm test'`);
}

// Run the main function
main().catch(error => {
  console.error(chalk.red(`❌ Error: ${error.message}`));
  process.exit(1);
});