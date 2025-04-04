import { MarketplaceAdapterFactory } from './marketplace-adapter-factory.service';
import { IMarketplaceAdapter } from '../adapters/interfaces/marketplace-adapter.interface';
import { 
  MarketplaceCredentials, 
  MarketplaceProduct, 
  PriceUpdatePayload, 
  StockUpdatePayload, 
  StatusUpdatePayload 
} from '../models/marketplace.models';
import { CredentialManager } from '../utils/credential-manager';

/**
 * Service for syncing product data with marketplaces
 */
export class MarketplaceSyncService {
  private static instance: MarketplaceSyncService;
  private adapterFactory: MarketplaceAdapterFactory;
  private credentialManager: CredentialManager;
  private activeAdapters: Map<string, IMarketplaceAdapter> = new Map();

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.adapterFactory = MarketplaceAdapterFactory.getInstance();
    this.credentialManager = CredentialManager.getInstance();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): MarketplaceSyncService {
    if (!MarketplaceSyncService.instance) {
      MarketplaceSyncService.instance = new MarketplaceSyncService();
    }
    return MarketplaceSyncService.instance;
  }

  /**
   * Initialize a marketplace adapter
   * @param marketplaceId - ID of the marketplace to initialize
   * @param credentials - Credentials for the marketplace
   */
  public async initializeMarketplace(
    marketplaceId: string,
    credentials: MarketplaceCredentials
  ): Promise<boolean> {
    try {
      // Create and initialize the adapter
      const adapter = await this.adapterFactory.createAdapter(
        marketplaceId.toLowerCase(),
        credentials
      );
      
      // Store the adapter for later use
      this.activeAdapters.set(marketplaceId.toLowerCase(), adapter);
      
      console.log(`Successfully initialized ${adapter.marketplaceName} adapter`);
      return true;
    } catch (error) {
      console.error(`Failed to initialize ${marketplaceId} adapter:`, error);
      return false;
    }
  }

  /**
   * Sync product data to one or more marketplaces
   * @param product - Product data to sync
   * @param marketplaceIds - Marketplace IDs to sync to (all active if not specified)
   */
  public async syncProduct(
    product: { 
      sku: string;
      title: string; 
      description?: string; 
      price: number;
      stockLevel: number; 
      active: boolean; 
    },
    marketplaceIds?: string[]
  ): Promise<{
    successful: string[];
    failed: Array<{ marketplaceId: string; reason: string }>;
  }> {
    const successful: string[] = [];
    const failed: Array<{ marketplaceId: string; reason: string }> = [];
    
    // Determine which marketplaces to sync with
    const targetMarketplaces = marketplaceIds 
      ? marketplaceIds.map((id: any) => id.toLowerCase())
      : Array.from(this.activeAdapters.keys());
    
    // Sync with each marketplace
    for (const marketplaceId of targetMarketplaces) {
      const adapter = this.activeAdapters.get(marketplaceId);
      
      if (!adapter) {
        failed.push({
          marketplaceId,
          reason: `Adapter not initialized. Call initializeMarketplace() first.`
        });
        continue;
      }
      
      try {
        // Create update payloads
        const stockUpdate: StockUpdatePayload = {
          sku: product.sku,
          quantity: product.stockLevel
        };
        
        const priceUpdate: PriceUpdatePayload = {
          sku: product.sku,
          price: product.price
        };
        
        const statusUpdate: StatusUpdatePayload = {
          sku: product.sku,
          status: product.active ? 'active' : 'inactive' as any
        };
        
        // Update stock level
        const stockResult = await adapter.updateStock([stockUpdate]);
        
        if (!stockResult.success) {
          throw new Error(`Stock update failed: ${stockResult.error?.message}`);
        }
        
        // Check if stock update failed for this SKU
        if (stockResult.data?.failed.some((f: any) => f.sku === product.sku)) {
          const reason = stockResult.data?.failed.find((f: any) => f.sku === product.sku)?.reason || 'Unknown error';
          throw new Error(`Stock update failed: ${reason}`);
        }
        
        // Update price
        const priceResult = await adapter.updatePrices([priceUpdate]);
        
        if (!priceResult.success) {
          throw new Error(`Price update failed: ${priceResult.error?.message}`);
        }
        
        // Check if price update failed for this SKU
        if (priceResult.data?.failed.some((f: any) => f.sku === product.sku)) {
          const reason = priceResult.data?.failed.find((f: any) => f.sku === product.sku)?.reason || 'Unknown error';
          throw new Error(`Price update failed: ${reason}`);
        }
        
        // Update status
        const statusResult = await adapter.updateStatus([statusUpdate]);
        
        if (!statusResult.success) {
          throw new Error(`Status update failed: ${statusResult.error?.message}`);
        }
        
        // Check if status update failed for this SKU
        if (statusResult.data?.failed.some((f: any) => f.sku === product.sku)) {
          const reason = statusResult.data?.failed.find((f: any) => f.sku === product.sku)?.reason || 'Unknown error';
          throw new Error(`Status update failed: ${reason}`);
        }
        
        // All updates succeeded
        successful.push(marketplaceId);
        
      } catch (error) {
        console.error(`Error syncing product ${product.sku} to ${marketplaceId}:`, error);
        
        const errorReason = error && typeof error === 'object' && 'message' in error
          ? (error as Error).message
          : 'Unknown error';
          
        failed.push({
          marketplaceId,
          reason: errorReason
        });
      }
    }
    
    return { successful, failed };
  }

  /**
   * Sync stock levels to one or more marketplaces
   * @param updates - Stock updates to apply
   * @param marketplaceIds - Marketplace IDs to sync to (all active if not specified)
   */
  public async syncStockLevels(
    updates: Array<{ sku: string; quantity: number }>,
    marketplaceIds?: string[]
  ): Promise<{
    successful: Array<{ marketplaceId: string; skus: string[] }>;
    failed: Array<{ marketplaceId: string; reason: string }>;
  }> {
    const successful: Array<{ marketplaceId: string; skus: string[] }> = [];
    const failed: Array<{ marketplaceId: string; reason: string }> = [];
    
    // Determine which marketplaces to sync with
    const targetMarketplaces = marketplaceIds 
      ? marketplaceIds.map((id: any) => id.toLowerCase())
      : Array.from(this.activeAdapters.keys());
    
    // Sync with each marketplace
    for (const marketplaceId of targetMarketplaces) {
      const adapter = this.activeAdapters.get(marketplaceId);
      
      if (!adapter) {
        failed.push({
          marketplaceId,
          reason: `Adapter not initialized. Call initializeMarketplace() first.`
        });
        continue;
      }
      
      try {
        // Convert updates to StockUpdatePayload format
        const stockUpdates: StockUpdatePayload[] = updates.map((update: any) => ({
          sku: update.sku,
          quantity: update.quantity
        }));
        
        // Update stock levels
        const result = await adapter.updateStock(stockUpdates);
        
        if (!result.success) {
          throw new Error(`Stock update failed: ${result.error?.message}`);
        }
        
        // Record successful updates
        successful.push({
          marketplaceId,
          skus: result.data?.successful || []
        });
        
        // Log any partial failures
        if (result.data?.failed.length) {
          console.warn(`Some stock updates failed for ${marketplaceId}:`, result.data.failed);
        }
        
      } catch (error) {
        console.error(`Error syncing stock levels to ${marketplaceId}:`, error);
        
        const errorReason = error && typeof error === 'object' && 'message' in error
          ? (error as Error).message
          : 'Unknown error';
          
        failed.push({
          marketplaceId,
          reason: errorReason
        });
      }
    }
    
    return { successful, failed };
  }

  /**
   * Get a product from a specific marketplace
   * @param sku - Product SKU
   * @param marketplaceId - Marketplace ID
   */
  public async getProduct(
    sku: string,
    marketplaceId: string
  ): Promise<MarketplaceProduct | null> {
    const adapter = this.activeAdapters.get(marketplaceId.toLowerCase());
    
    if (!adapter) {
      throw new Error(`Adapter for ${marketplaceId} not initialized`);
    }
    
    const result = await adapter.getProductBySku(sku);
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return null;
  }

  /**
   * Fetch recent orders from a marketplace
   * @param marketplaceId - Marketplace ID
   * @param daysSince - Fetch orders from this many days ago
   * @param page - Page number (0-based)
   * @param pageSize - Items per page
   */
  public async getRecentOrders(
    marketplaceId: string,
    daysSince: number = 7,
    page: number = 0,
    pageSize: number = 20
  ) : Promise<void> {
    const adapter = this.activeAdapters.get(marketplaceId.toLowerCase());
    
    if (!adapter) {
      throw new Error(`Adapter for ${marketplaceId} not initialized`);
    }
    
    // Calculate date from N days ago
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysSince);
    
    return adapter.getRecentOrders(sinceDate, page, pageSize);
  }

  /**
   * Check the health of all active marketplace connections
   */
  public async checkMarketplaceHealth(): Promise<Record<string, { connected: boolean; message: string }>> {
    const results: Record<string, { connected: boolean; message: string }> = {};
    
    // Check health of each active marketplace
    // @ts-ignore - downlevelIteration should be enabled in tsconfig.json but suppress error here
    for (const [marketplaceId, adapter] of this.activeAdapters.entries()) {
      try {
        const status = await adapter.getMarketplaceHealth();
        
        results[marketplaceId] = {
          connected: status.connected,
          message: status.message
        };
      } catch (error) {
        const errorMessage = error && typeof error === 'object' && 'message' in error
          ? (error as Error).message
          : 'Unknown error';
          
        results[marketplaceId] = {
          connected: false,
          message: `Error checking health: ${errorMessage}`
        };
      }
    }
    
    return results;
  }

  /**
   * Close all active marketplace adapters
   */
  public async closeAll(): Promise<void> {
    const closePromises = Array.from(this.activeAdapters.values()).map((adapter: any) => adapter.close());
    await Promise.all(closePromises);
    this.activeAdapters.clear();
  }
}