import { injectable, inject } from 'inversify';
import { IMarketplaceAdapter } from '../adapters/interfaces/marketplace-adapter.interface';
import { MarketplaceCredentials, ConnectionStatus } from '../models/marketplace.models';
import { MarketplaceAdapterFactory } from '../adapters/marketplace-adapter.factory';
import { LoggerService } from '../../../services/logger.service';
import { Container } from 'inversify';

/**
 * Service for interacting with marketplace adapters
 * Provides a unified interface for working with different marketplaces
 */
@injectable()
export class MarketplaceAdapterFactoryService {
  private readonly adapterFactory: MarketplaceAdapterFactory;

  /**
   * Constructor
   * @param container DI container for resolving dependencies
   * @param logger Logger service for consistent logging
   */
  constructor(
    @inject('Container') private container: Container,
    @inject('LoggerService') private logger: LoggerService
  ) {
    this.adapterFactory = MarketplaceAdapterFactory.getInstance(container, logger);
  }

  /**
   * Get an adapter for the specified marketplace
   * @param marketplaceId Marketplace identifier (e.g., 'amazon', 'shopify')
   * @param credentials Credentials for marketplace authentication
   * @returns Initialized marketplace adapter
   */
  public async getAdapter(
    marketplaceId: string,
    credentials: MarketplaceCredentials
  ): Promise<IMarketplaceAdapter> {
    this.logger.info('Getting marketplace adapter', { 
      marketplaceId,
      sellerId: credentials.sellerId
    });
    
    try {
      return await this.adapterFactory.getAdapter(marketplaceId, credentials);
    } catch (error) {
      this.logger.error('Failed to get marketplace adapter', { 
        marketplaceId,
        error 
      });
      throw error;
    }
  }

  /**
   * Test connection to a marketplace without storing the adapter
   * @param marketplaceId Marketplace identifier
   * @param credentials Credentials for marketplace authentication
   * @returns Connection status information
   */
  public async testConnection(
    marketplaceId: string,
    credentials: MarketplaceCredentials
  ): Promise<ConnectionStatus> {
    this.logger.info('Testing marketplace connection', { marketplaceId });
    
    try {
      const adapter = await this.adapterFactory.getAdapter(marketplaceId, credentials);
      const result = await adapter.testConnection();
      
      // Clear the adapter from cache to prevent storing test connections
      this.adapterFactory.clearAdapterInstances(marketplaceId);
      
      return result;
    } catch (error) {
      this.logger.error('Failed to test marketplace connection', {
        marketplaceId,
        error
      });
      
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date()
      };
    }
  }

  /**
   * Get a list of supported marketplaces
   * @returns Array of marketplace identifiers
   */
  public getSupportedMarketplaces(): string[] {
    return ['amazon', 'shopify', 'takealot'];
  }

  /**
   * Close an adapter and remove it from the factory cache
   * @param marketplaceId Marketplace identifier
   * @param credentials Credentials used with the adapter
   */
  public async closeAdapter(
    marketplaceId: string,
    credentials: MarketplaceCredentials
  ): Promise<void> {
    try {
      // Get the adapter first, so we can call close() on it
      const adapter = await this.adapterFactory.getAdapter(marketplaceId, credentials);
      
      // Close the adapter to clean up resources
      await adapter.close();
      
      // Clear it from the cache
      this.adapterFactory.clearAdapterInstances(marketplaceId);
      
      this.logger.info('Closed marketplace adapter', { marketplaceId });
    } catch (error) {
      this.logger.error('Error closing marketplace adapter', {
        marketplaceId,
        error
      });
    }
  }
}