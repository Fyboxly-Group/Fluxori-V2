#!/usr/bin/env node

/**
 * Fix TypeScript errors in the connections module
 * 
 * This script:
 * 1. Fixes connection.service.ts by adding proper interface and type declarations
 * 2. Fixes credential-provider.ts by adding proper imports and type declarations
 * 3. Fixes secrets.service.ts by adding proper type declarations for Google Cloud Secret Manager
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Command line options
const ARGS = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose')
};

// Logging utilities
const log = (...args) => console.log(...args);
const verbose = (...args) => ARGS.verbose && console.log(...args);

// Paths for the files to fix
const CONNECTION_SERVICE_PATH = path.join(process.cwd(), 'src/modules/connections/services/connection.service.ts');
const SECRETS_SERVICE_PATH = path.join(process.cwd(), 'src/modules/connections/services/secrets.service.ts');
const CREDENTIAL_PROVIDER_PATH = path.join(process.cwd(), 'src/modules/connections/utils/credential-provider.ts');

/**
 * Fix the connection.service.ts file
 */
async function fixConnectionService() {
  log('📝 Fixing connection.service.ts');
  
  try {
    // Read the file content
    const content = await fs.readFile(CONNECTION_SERVICE_PATH, 'utf8');
    
    // Check if the file already has @ts-nocheck pragma
    if (content.includes('@ts-nocheck')) {
      // Fix imports and add IMarketplaceAdapter interface import
      let updatedContent = content.replace(
        '// @ts-nocheck - Added by add-ts-nocheck-to-remaining-errors.js',
        '// Fixed by fix-connection-module.js'
      );
      
      // Add the IMarketplaceAdapter interface import if not already present
      if (!updatedContent.includes('IMarketplaceAdapter')) {
        updatedContent = updatedContent.replace(
          'import { MarketplaceAdapterFactory } from "../../marketplaces/adapters/marketplace-adapter.factory";',
          'import { MarketplaceAdapterFactory } from "../../marketplaces/adapters/marketplace-adapter.factory";\nimport { IMarketplaceAdapter } from "../../marketplaces/adapters/interfaces/marketplace-adapter.interface";'
        );
      }
      
      // Fix improper getAdapter declaration
      updatedContent = updatedContent.replace(
        /if \(!MarketplaceAdapterFactory\.getAdapter\) \{\s+MarketplaceAdapterFactory\.getAdapter = \(type: any\) => \{[\s\S]+?\};\s+\}/g,
        `// Extended with proper MarketplaceAdapterFactory interface
export interface ExtendedMarketplaceAdapterFactory {
  getAdapter(marketplaceId: string): Promise<IMarketplaceAdapter>;
  getAdapter(marketplaceId: string, credentials: MarketplaceCredentials): Promise<IMarketplaceAdapter>;
}

// Ensure the adapter factory has a getAdapter method with proper overloads
const adapterFactory = MarketplaceAdapterFactory.getInstance() as typeof MarketplaceAdapterFactory.prototype & ExtendedMarketplaceAdapterFactory;
`
      );
      
      // Add proper typing to testConnection method
      updatedContent = updatedContent.replace(
        /private async validateCredentials\(\s*marketplaceId: string,\s*credentials: MarketplaceCredentials\s*\): Promise<\{ connected: boolean; message: string \}> \{/g,
        `private async validateCredentials(
    marketplaceId: string,
    credentials: MarketplaceCredentials
  ): Promise<{ connected: boolean; message: string }> {`
      );
      
      // Fix adapter initialization
      updatedContent = updatedContent.replace(
        /const adapter = await MarketplaceAdapterFactory\.getAdapter\(marketplaceId\);/g,
        'const adapter = await adapterFactory.getAdapter(marketplaceId, credentials);'
      );
      
      // Fix initialize call
      updatedContent = updatedContent.replace(
        /await adapter\.initialize\(credentials\);/g,
        '// Credentials already passed to getAdapter'
      );
      
      // Fix the Object.assign with the proper interface
      updatedContent = updatedContent.replace(
        /Object\.assign\(connectionService, \{[\s\S]+?\}\);/g,
        `// Type for extended service with direct access methods
export interface ConnectionServiceWithDirectAccess extends ConnectionService {
  getConnectionByIdDirect(connectionId: string): Promise<IMarketplaceConnectionDocument | null>;
  getConnectionsByIds(connectionIds: string[]): Promise<IMarketplaceConnectionDocument[]>;
  getAllActiveConnections(): Promise<IMarketplaceConnectionDocument[]>;
}

// Extend the service with direct methods
Object.assign(connectionService, {
  getConnectionByIdDirect: connectionDirectService.getConnectionByIdDirect,
  getConnectionsByIds: connectionDirectService.getConnectionsByIds,
  getAllActiveConnections: connectionDirectService.getAllActiveConnections,
});

// Export the enhanced service with proper typing
export default connectionService as ConnectionServiceWithDirectAccess;`
      );
      
      // Write the changes if not in dry run mode
      if (!ARGS.dryRun) {
        await fs.writeFile(CONNECTION_SERVICE_PATH, updatedContent, 'utf8');
        log(`✅ Fixed connection.service.ts`);
      } else {
        log(`⚠️ Dry run mode: Would fix connection.service.ts`);
      }
    } else {
      log(`⚠️ File doesn't have @ts-nocheck, might already be fixed: connection.service.ts`);
    }
  } catch (error) {
    log(`❌ Error fixing connection.service.ts: ${error.message}`);
  }
}

/**
 * Fix the secrets.service.ts file
 */
async function fixSecretsService() {
  log('📝 Fixing secrets.service.ts');
  
  try {
    // Read the file content
    const content = await fs.readFile(SECRETS_SERVICE_PATH, 'utf8');
    
    // Check if the file already has @ts-nocheck pragma
    if (content.includes('@ts-nocheck')) {
      // Replace the @ts-nocheck comment and add proper type definitions
      let updatedContent = content.replace(
        '// @ts-nocheck - Added by add-ts-nocheck-to-remaining-errors.js',
        `// Fixed by fix-connection-module.js
import { AccessSecretVersionResponse } from '@google-cloud/secret-manager/build/src/v1/secret_manager_service_client';`
      );
      
      // Fix secretClient initialization
      updatedContent = updatedContent.replace(
        'private secretClient: SecretManagerServiceClient;',
        'private secretClient!: SecretManagerServiceClient;'
      );
      
      // Add proper typing for the constructor
      updatedContent = updatedContent.replace(
        'constructor() {',
        `constructor() {`
      );
      
      // Fix typing for the secret version response
      updatedContent = updatedContent.replace(
        'const [version] = await this.secretClient.accessSecretVersion({ name });',
        'const [version] = await this.secretClient.accessSecretVersion({ name }) as [AccessSecretVersionResponse];'
      );
      
      // Write the changes if not in dry run mode
      if (!ARGS.dryRun) {
        await fs.writeFile(SECRETS_SERVICE_PATH, updatedContent, 'utf8');
        log(`✅ Fixed secrets.service.ts`);
      } else {
        log(`⚠️ Dry run mode: Would fix secrets.service.ts`);
      }
    } else {
      log(`⚠️ File doesn't have @ts-nocheck, might already be fixed: secrets.service.ts`);
    }
  } catch (error) {
    log(`❌ Error fixing secrets.service.ts: ${error.message}`);
  }
}

/**
 * Fix the credential-provider.ts file
 */
async function fixCredentialProvider() {
  log('📝 Fixing credential-provider.ts');
  
  try {
    // Read the file content
    const content = await fs.readFile(CREDENTIAL_PROVIDER_PATH, 'utf8');
    
    // For credential-provider.ts, we need to add proper typing for the connectionService import
    let updatedContent = content.replace(
      'import connectionService from \'../services/connection.service\';',
      'import connectionService, { ConnectionServiceWithDirectAccess } from \'../services/connection.service\';'
    );
    
    // Write the changes if not in dry run mode
    if (!ARGS.dryRun) {
      await fs.writeFile(CREDENTIAL_PROVIDER_PATH, updatedContent, 'utf8');
      log(`✅ Fixed credential-provider.ts`);
    } else {
      log(`⚠️ Dry run mode: Would fix credential-provider.ts`);
    }
  } catch (error) {
    log(`❌ Error fixing credential-provider.ts: ${error.message}`);
  }
}

/**
 * Create the marketplace adapter interface if missing
 */
async function createMarketplaceAdapterInterface() {
  const adapterInterfacePath = path.join(process.cwd(), 'src/modules/marketplaces/adapters/interfaces/marketplace-adapter.interface.ts');
  
  // Check if the file already exists
  try {
    await fs.access(adapterInterfacePath);
    log('✅ Marketplace adapter interface already exists.');
    return;
  } catch (error) {
    // File doesn't exist, we need to create it
    log('📝 Creating marketplace-adapter.interface.ts');
    
    const interfaceContent = `// Marketplace adapter interface definition
import { 
  MarketplaceCredentials,
  ConnectionStatus,
  MarketplaceProduct,
  StockUpdatePayload,
  PriceUpdatePayload,
  StatusUpdatePayload,
  MarketplaceOrder,
  OrderAcknowledgment,
  MarketplaceCategory,
  PaginatedResponse,
  OperationResult,
  ProductFilterOptions, 
  OrderFilterOptions
} from '../../models/marketplace.models';

/**
 * Interface defining common functionality for all marketplace adapters.
 * All marketplace-specific adapters must implement this interface.
 */
export interface IMarketplaceAdapter {
  /**
   * The unique identifier for the marketplace(e.g., 'amazon', 'takealot', 'ebay')
   */
  readonly marketplaceId: string;
  
  /**
   * Human-readable name of the marketplace
   */
  readonly marketplaceName: string;

  /**
   * Initialize the adapter with marketplace credentials
   * @param credentials - Credentials required for authentication with the marketplace
   */
  initialize(credentials: MarketplaceCredentials): Promise<void>;

  /**
   * Test the connection to the marketplace API
   * @returns Connection status object with information about the connection
   */
  testConnection(): Promise<ConnectionStatus>;

  /**
   * Fetch a product by its SKU
   * @param sku - The SKU of the product
   * @returns Operation result containing the product if found
   */
  getProductBySku(sku: string): Promise<OperationResult<MarketplaceProduct>>;

  /**
   * Fetch products with pagination and filtering
   * @param page - Page number(0-based)
   * @param pageSize - Number of items per page
   * @param filters - Optional filter options to apply
   * @returns Paginated response of products with token-based pagination support
   */
  getProducts(
    page: number,
    pageSize: number,
    filters?: ProductFilterOptions
  ): Promise<PaginatedResponse<MarketplaceProduct>>;

  /**
   * Fetch orders with filtering and pagination
   * @param page - Page number(0-based)
   * @param pageSize - Number of items per page
   * @param filters - Optional filter options to apply
   * @returns Paginated response of orders with token-based pagination support
   */
  getOrders(
    page: number,
    pageSize: number,
    filters?: OrderFilterOptions
  ): Promise<PaginatedResponse<MarketplaceOrder>>;
}`;
    
    // Write the file if not in dry run mode
    if (!ARGS.dryRun) {
      // Create the directory if it doesn't exist
      const dir = path.dirname(adapterInterfacePath);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(adapterInterfacePath, interfaceContent, 'utf8');
      log(`✅ Created marketplace-adapter.interface.ts`);
    } else {
      log(`⚠️ Dry run mode: Would create marketplace-adapter.interface.ts`);
    }
  }
}

/**
 * Main function
 */
async function main() {
  log('🔧 Fix Connection Module TypeScript Errors');
  log('=========================================');
  
  try {
    // Create the marketplace adapter interface if needed
    await createMarketplaceAdapterInterface();
    
    // Fix the three main files
    await fixConnectionService();
    await fixSecretsService();
    await fixCredentialProvider();
    
    log('\n✅ Completed fixing connection module files.');
    
    // Run TypeScript checking to confirm fixes
    if (!ARGS.dryRun) {
      log('\n🔍 Running TypeScript check for the connection module...');
      try {
        execSync('npx tsc --noEmit src/modules/connections/**/*.ts', { stdio: 'pipe' });
        log('✅ No TypeScript errors in the connection module!');
      } catch (error) {
        const errorCount = (error.stdout.toString().match(/error TS\d+/g) || []).length;
        log(`⚠️ ${errorCount} TypeScript errors still remain in the connection module.`);
        if (ARGS.verbose) {
          log('Error details:');
          log(error.stdout.toString());
        }
      }
    }
  } catch (error) {
    log(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();