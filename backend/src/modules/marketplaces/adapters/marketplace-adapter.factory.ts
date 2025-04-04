import { injectable, inject, Container } from 'inversify';
import { IMarketplaceAdapter } from './interfaces/marketplace-adapter.interface';
import { MarketplaceCredentials } from '../models/marketplace.models';
import { ApiError } from '../../../middleware/error.middleware';
import { LoggerService } from '../../../services/logger.service';

// Import the actual adapter implementations
import { TakealotAdapter } from './takealot/takealot-adapter';
import { AmazonAdapter } from './amazon/amazon.adapter';
import { ShopifyAdapter } from './shopify/shopify-adapter';

/**
 * Factory for creating marketplace adapter instances based on marketplace ID
 */
@injectable()
export class MarketplaceAdapterFactory {
  // Singleton pattern
  private static instance: MarketplaceAdapterFactory;
  
  // Map to store adapter instances by identifier with credentials hash
  private adapterInstances: Map<string, IMarketplaceAdapter> = new Map();

  // DI container for resolving dependencies
  private container: Container;

  // Logger service
  private logger: LoggerService;

  /**
   * Constructor with dependency injection
   * @param container DI container for resolving adapter dependencies
   * @param logger Logger service
   */
  constructor(
    @inject('Container') container: Container,
    @inject('LoggerService') logger: LoggerService
  ) {
    this.container = container;
    this.logger = logger;
  }

  /**
   * Get the singleton instance of the factory
   * @param container DI container for resolving dependencies
   * @param logger Logger service
   */
  public static getInstance(container?: Container, logger?: LoggerService): MarketplaceAdapterFactory {
    if (!MarketplaceAdapterFactory.instance) {
      if (!container || !logger) {
        throw new Error('Container and logger must be provided to initialize MarketplaceAdapterFactory');
      }
      MarketplaceAdapterFactory.instance = new MarketplaceAdapterFactory(container, logger);
    }
    return MarketplaceAdapterFactory.instance;
  }

  /**
   * Get the appropriate adapter for a marketplace
   * @param marketplaceId - The ID of the marketplace
   * @param credentials - The marketplace credentials to initialize the adapter with
   * @returns An initialized marketplace adapter
   * @throws ApiError if the marketplace is not supported
   */
  public async getAdapter(marketplaceId: string, credentials: MarketplaceCredentials): Promise<IMarketplaceAdapter> {
    // Generate a unique key for caching based on marketplace ID and a hash of credentials
    // This ensures each unique combination gets its own adapter instance
    const uniqueKey = this.getUniqueAdapterKey(marketplaceId, credentials);
    
    // Check if we already have an initialized instance for this marketplace and credentials combination
    if (this.adapterInstances.has(uniqueKey)) {
      return this.adapterInstances.get(uniqueKey)!;
    }

    // Create and initialize a new adapter based on marketplace ID
    const adapter = this.createAdapter(marketplaceId);
    
    // Initialize the adapter with the provided credentials
    await adapter.initialize(credentials);
    
    // Store the initialized adapter for future reuse
    this.adapterInstances.set(uniqueKey, adapter);
    
    return adapter;
  }

  /**
   * Create a new adapter instance based on the marketplace ID
   * @param marketplaceId - The ID of the marketplace
   * @returns A new adapter instance
   * @throws ApiError if the marketplace is not supported
   */
  private createAdapter(marketplaceId: string): IMarketplaceAdapter {
    const normalizedId = marketplaceId.toLowerCase();
    
    this.logger.debug('Creating marketplace adapter', { 
      marketplaceId: normalizedId 
    });
    
    // Create adapter based on marketplace ID prefix
    if (normalizedId === 'takealot') {
      // Use container to resolve Takealot adapter with proper dependency injection
      try {
        const adapter = this.container.get<TakealotAdapter>(TakealotAdapter);
        return adapter;
      } catch (error) {
        this.logger.error('Failed to create Takealot adapter', { error });
        throw new ApiError(500, 'Failed to create Takealot adapter');
      }
    } 
    
    if (normalizedId.startsWith('amazon')) {
      // Use container to resolve Amazon adapter with proper dependency injection
      try {
        const adapter = this.container.get<AmazonAdapter>(AmazonAdapter);
        return adapter;
      } catch (error) {
        this.logger.error('Failed to create Amazon adapter', { error });
        throw new ApiError(500, 'Failed to create Amazon adapter');
      }
    }
    
    if (normalizedId.startsWith('shopify')) {
      // Use container to resolve Shopify adapter with proper dependency injection
      try {
        const adapter = this.container.get<ShopifyAdapter>(ShopifyAdapter);
        return adapter;
      } catch (error) {
        this.logger.error('Failed to create Shopify adapter', { error });
        throw new ApiError(500, 'Failed to create Shopify adapter');
      }
    }
    
    // If no adapter matches, throw an error
    this.logger.error('Unsupported marketplace', { marketplaceId });
    throw new ApiError(404, `Marketplace ${marketplaceId} is not supported`);
  }

  /**
   * Generate a unique key for caching adapter instances
   * @param marketplaceId - The ID of the marketplace
   * @param credentials - The credentials used to initialize the adapter
   * @returns A unique string key
   */
  private getUniqueAdapterKey(marketplaceId: string, credentials: MarketplaceCredentials): string {
    // Create a simple hash of the credentials object to use in the cache key
    // This ensures different credential sets for the same marketplace get different adapter instances
    const credHash = this.simpleHash(JSON.stringify(credentials));
    return `${marketplaceId.toLowerCase()}_${credHash}`;
  }

  /**
   * Simple string hashing function
   * @param str - The string to hash
   * @returns A hash string
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Clear adapter instances from the cache
   * Useful for testing or when credentials need to be refreshed
   * @param marketplaceId - Optional ID to clear only instances for a specific marketplace
   */
  public clearAdapterInstances(marketplaceId?: string): void {
    if (marketplaceId) {
      // Delete all entries for the given marketplace ID
      const prefix = marketplaceId.toLowerCase();
      
      // Create a list of keys to remove
      const keysToRemove: string[] = [];
      
      // Use Array.from to convert keys iterator to array
      Array.from(this.adapterInstances.keys()).forEach((key: any) => {
        if (key.startsWith(prefix + '_')) {
          keysToRemove.push(key);
        }
      });
      
      // Remove each identified key
      keysToRemove.forEach((key: any) => {
        this.adapterInstances.delete(key);
      });
    } else {
      // Clear all instances
      this.adapterInstances.clear();
    }
  }
}