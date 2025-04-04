import { Injectable } from '../../../decorators/injectable.decorator';
import connectionService from '../../connections/services/connection.service';
import { MarketplaceAdapterFactory } from '../../marketplaces/adapters/marketplace-adapter.factory';
import { MarketplaceCredentials } from '../../marketplaces/models/marketplace.models';
import { IMarketplaceAdapter } from '../../marketplaces/interfaces/marketplace-adapter.interface';
import { MarketplaceProduct, MarketplaceOrder } from '../../marketplaces/models/marketplace.models';
import { OrderIngestionService } from '../../order-ingestion/services/order-ingestion.service';
import { ProductIngestionService } from '../../product-ingestion/services/product-ingestion.service';
import { IMarketplaceConnectionDocument, SyncStatus, ConnectionStatus } from '../../connections/models/connection.model';
import { ApiError } from '../../../middleware/error.middleware';
import secretsService from '../../connections/services/secrets.service';
import logger from '../../../utils/logger';
import config from '../../../config';

/**
 * Service responsible for orchestrating the data synchronization process
 * between marketplace adapters and the Fluxori system.
 */
@Injectable()
export class SyncOrchestratorService {
  private adapterFactory: MarketplaceAdapterFactory;
  private orderIngestionService: OrderIngestionService;
  private productIngestionService: ProductIngestionService;
  private syncTimer: NodeJS.Timeout | null = null;
  private syncIntervalMinutes: number = 15; // Default sync interval
  private isRunning: boolean = false;
  
  constructor() {
    this.adapterFactory = MarketplaceAdapterFactory.getInstance();
    this.orderIngestionService = new OrderIngestionService();
    this.productIngestionService = new ProductIngestionService();
  }
  
  /**
   * Start the periodic sync service using setInterval
   * Note: This is kept for backward compatibility and local development
   */
  public start(): void {
    if (this.isRunning) {
      logger.info('Sync service is already running');
      return;
    }
    
    logger.info(`Starting sync service with interval of ${this.syncIntervalMinutes} minutes`);
    this.isRunning = true;
    
    // Immediately run the first sync cycle
    this.runSync().catch(error => {
      logger.error('Error in initial sync cycle:', error);
    });
    
    // Schedule periodic syncs
    this.syncTimer = setInterval(() => {
      this.runSync().catch(error => {
        logger.error('Error in scheduled sync cycle:', error);
      });
    }, this.syncIntervalMinutes * 60 * 1000);
  }
  
  /**
   * Stop the periodic sync service
   */
  public stop(): void {
    if (!this.isRunning) {
      logger.info('Sync service is not running');
      return;
    }
    
    logger.info('Stopping sync service');
    
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    
    this.isRunning = false;
  }
  
  /**
   * Update the sync interval (used by setInterval method)
   * @param intervalMinutes The new interval in minutes
   */
  public updateSyncInterval(intervalMinutes: number): void {
    this.syncIntervalMinutes = intervalMinutes;
    logger.info(`Updated sync interval to ${intervalMinutes} minutes`);
    
    // Restart the sync service if it's already running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
  
  /**
   * Run a synchronization cycle for all active marketplace connections.
   * This can be triggered by either:
   * 1. The local setInterval for backward compatibility
   * 2. A Cloud Scheduler HTTP request trigger
   * 3. A manual admin request
   */
  public async runSync(): Promise<any[]> {
    try {
      logger.info('Starting marketplace sync cycle');
      
      // Track runtime metrics for credit/cost allocation
      const startTime = Date.now();
      
      // Run the sync cycle
      const results = await this.runSyncCycle();
      
      // Calculate execution time for metrics
      const executionTimeMs = Date.now() - startTime;
      
      // Log detailed results for monitoring
      logger.info(`Sync cycle completed in ${executionTimeMs}ms`, {
        successfulConnections: results.successfulConnections,
        failedConnections: results.failedConnections,
        totalConnections: results.totalConnections,
        executionTimeMs,
      });
      
      if (results.errors.length > 0) {
        logger.warn('Some connections failed to sync', { errors: results.errors });
      }
      
      // Return the full results for potential webhook/notification use
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error in sync cycle execution:', errorMessage);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
  
  /**
   * Force sync for specific connections (manual trigger)
   * @param connectionIds Array of connection IDs to sync
   */
  public async forceSyncConnections(connectionIds: string[]): Promise<any[]> {
    const results = [];
    
    for (const connectionId of connectionIds) {
      try {
        const result = await this.syncConnection(connectionId);
        results.push({
          connectionId,
          ...result
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to sync connection ${connectionId}:`, errorMessage);
        
        results.push({
          connectionId,
          success: false,
          message: `Error: ${errorMessage}`
        });
      }
    }
    
    return results;
  }
  
  /**
   * Run a synchronization cycle for all active marketplace connections.
   * This is the core sync logic that is used by both the scheduled and manual triggers.
   */
  public async runSyncCycle(): Promise<{
    success: boolean;
    totalConnections: number;
    successfulConnections: number;
    failedConnections: number;
    errors: Array<{ connectionId: string; marketplaceId: string; error: string }>;
  }> {
    // Get all active connections
    const activeConnections = await connectionService.getAllActiveConnections();
    
    logger.info(`Starting sync cycle for ${activeConnections.length} active connections`);
    
    // Track results
    const results = {
      success: true,
      totalConnections: activeConnections.length,
      successfulConnections: 0,
      failedConnections: 0,
      errors: [] as Array<{ connectionId: string; marketplaceId: string; error: string }>
    };
    
    // Process each connection sequentially
    for (const connection of activeConnections) {
      try {
        // Process this connection
        const success = await this.processConnection(connection);
        
        // Update counters
        if (success) {
          results.successfulConnections++;
        } else {
          results.failedConnections++;
        }
      } catch (error) {
        // Handle processing errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error processing connection ${connection._id}:`, errorMessage);
        
        // Update connection status to error
        await this.updateConnectionSyncStatus(
          connection._id.toString(),
          SyncStatus.ERROR,
          errorMessage
        );
        
        // Track the error
        results.failedConnections++;
        results.errors.push({
          connectionId: connection._id.toString(),
          marketplaceId: connection.marketplaceId,
          error: errorMessage
        });
      }
    }
    
    // If all connections failed, mark overall success as false
    if (results.failedConnections === results.totalConnections && results.totalConnections > 0) {
      results.success = false;
    }
    
    return results;
  }
  
  /**
   * Validates if an incoming scheduler request is authentic by checking headers
   * @param headers The headers from the incoming request
   * @returns Boolean indicating whether the request is valid
   */
  public validateSchedulerRequest(headers: Record<string, string>): boolean {
    // Check if running in local development mode, where auth is not required
    if (config.nodeEnv === 'development' && config.skipSchedulerAuth === true) {
      return true;
    }
    
    // In production, verify the scheduler's authentication token
    const schedulerSecret = headers['x-scheduler-secret'];
    if (!schedulerSecret) {
      logger.warn('Scheduler request missing secret header');
      return false;
    }
    
    // Compare with our configured secret
    // Note: In a real implementation, you'd use a more robust authentication scheme
    // such as validating JWT tokens or using OIDC identity as GCP Cloud Scheduler supports
    return schedulerSecret === config.schedulerSecret;
  }
  
  /**
   * Process a single marketplace connection by fetching and ingesting data.
   * @param connection The marketplace connection to process
   * @returns True if the connection was processed successfully, false otherwise
   */
  private async processConnection(connection: IMarketplaceConnectionDocument): Promise<boolean> {
    const connectionId = connection._id.toString();
    const userId = connection.userId.toString();
    const marketplaceId = connection.marketplaceId;
    
    logger.info(`Processing ${marketplaceId} connection ${connectionId} for user ${userId}`);
    
    try {
      // Update the connection status to indicate syncing is in progress
      await this.updateConnectionSyncStatus(connectionId, SyncStatus.IN_PROGRESS);
      
      // Get the credentials
      const credentials = await secretsService.getCredentials(connection.credentialReference);
      
      // Initialize the adapter
      const adapter = await this.adapterFactory.getAdapter(marketplaceId, credentials);
      
      // Get the last sync timestamp or use a default date far in the past
      const lastSyncTimestamp = connection.lastSyncedAt || new Date(0);
      
      // Track if any process failed
      let ordersFailed = false;
      let productsFailed = false;
      let ordersProcessed = 0;
      let productsProcessed = 0;
      
      // Fetch and process orders
      try {
        const fetchedOrders = await adapter.fetchOrders({ 
          lastSyncTimestamp,
          limit: 100 // Reasonable limit to avoid overwhelming the system
        });
        
        if (fetchedOrders && fetchedOrders.length > 0) {
          // Process the orders through the ingestion service
          const ingestResult = await this.orderIngestionService.ingestOrders(
            marketplaceId,
            userId,
            fetchedOrders
          );
          
          ordersProcessed = fetchedOrders.length;
          logger.info(`Ingested ${ordersProcessed} orders from ${marketplaceId} for user ${userId}`);
        } else {
          logger.info(`No new orders to fetch from ${marketplaceId} for user ${userId}`);
        }
      } catch (error) {
        ordersFailed = true;
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error fetching/ingesting orders from ${marketplaceId}:`, errorMessage);
      }
      
      // Fetch and process products/inventory regardless of order processing success
      try {
        const fetchedProducts = await adapter.fetchProducts({
          lastSyncTimestamp,
          limit: 100 // Reasonable limit
        });
        
        if (fetchedProducts && fetchedProducts.length > 0) {
          // Process the products through the ingestion service
          const ingestResult = await this.productIngestionService.ingestProducts(
            marketplaceId,
            userId,
            fetchedProducts
          );
          
          productsProcessed = fetchedProducts.length;
          logger.info(`Ingested ${productsProcessed} products from ${marketplaceId} for user ${userId}`);
        } else {
          logger.info(`No new products to fetch from ${marketplaceId} for user ${userId}`);
        }
      } catch (error) {
        productsFailed = true;
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error fetching/ingesting products from ${marketplaceId}:`, errorMessage);
      }
      
      // Determine the new sync status based on success/failure
      let newSyncStatus: SyncStatus;
      let errorMessage: string | undefined;
      
      if (ordersFailed && productsFailed) {
        newSyncStatus = SyncStatus.ERROR;
        errorMessage = `Failed to fetch both orders and products from ${marketplaceId}`;
      } else if (ordersFailed || productsFailed) {
        // If we don't have a PARTIAL status, use ERROR but with a specific message
        newSyncStatus = SyncStatus.ERROR;
        errorMessage = ordersFailed 
          ? `Failed to fetch orders from ${marketplaceId}`
          : `Failed to fetch products from ${marketplaceId}`;
      } else {
        newSyncStatus = SyncStatus.SUCCESS;
      }
      
      // Update the connection status
      await this.updateConnectionSyncStatus(
        connectionId,
        newSyncStatus,
        errorMessage,
        // Only update the lastSyncedAt if there was at least partial success
        newSyncStatus !== SyncStatus.ERROR
      );
      
      // Return true if there was complete success
      return newSyncStatus === SyncStatus.SUCCESS;
      
    } catch (error) {
      // Handle any uncaught errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error processing ${marketplaceId} connection:`, errorMessage);
      
      // Update the connection status to error
      await this.updateConnectionSyncStatus(
        connectionId,
        SyncStatus.ERROR,
        errorMessage
      );
      
      return false;
    }
  }
  
  /**
   * Update the sync status and potentially the last synced timestamp of a connection
   * @param connectionId The ID of the connection to update
   * @param syncStatus The new sync status
   * @param errorMessage Optional error message to store
   * @param updateLastSyncedAt Whether to update the lastSyncedAt timestamp
   */
  private async updateConnectionSyncStatus(
    connectionId: string,
    syncStatus: SyncStatus,
    errorMessage?: string,
    updateLastSyncedAt: boolean = false
  ): Promise<void> {
    try {
      const connection = await connectionService.getConnectionByIdDirect(connectionId);
      
      if (!connection) {
        throw new ApiError(404, `Connection ${connectionId} not found`);
      }
      
      // Update the sync status
      connection.syncStatus = syncStatus;
      
      // Update the error message if provided
      if (errorMessage) {
        connection.lastError = errorMessage;
      }
      
      // Update the lastSyncedAt timestamp if requested
      if (updateLastSyncedAt) {
        connection.lastSyncedAt = new Date();
      }
      
      // Update the lastChecked timestamp
      connection.lastChecked = new Date();
      
      // Save the changes
      await connection.save();
      
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      // Log but don't throw to avoid breaking the sync cycle;
      logger.error(`Error updating sync status for connection ${connectionId}:`, error);
    }
  }
  
  /**
   * Run a synchronization cycle for a specific connection.
   * @param connectionId The ID of the connection to synchronize
   */
  public async syncConnection(connectionId: string): Promise<{
    success: boolean;
    message: string;
    ordersProcessed?: number;
    productsProcessed?: number;
  }> {
    try {
      // Get the connection
      const connection = await connectionService.getConnectionByIdDirect(connectionId);
      
      if (!connection) {
        throw new ApiError(404, `Connection ${connectionId} not found`);
      }
      
      // Check if the connection is active
      if (connection.status !== ConnectionStatus.CONNECTED) {
        throw new ApiError(400, `Connection ${connectionId} is not active`);
      }
      
      // Process the connection
      const success = await this.processConnection(connection);
      
      return {
        success,
        message: success 
          ? `Successfully synchronized ${connection.marketplaceId} connection` 
          : `Synchronization of ${connection.marketplaceId} connection completed with errors`,
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error syncing connection ${connectionId}:`, errorMessage);
      
      return {
        success: false,
        message: `Error syncing connection: ${errorMessage}`
      };
    }
  }

  /**
   * Get the current sync status information
   * Used by the admin dashboard to display the status
   */
  public getSyncStatus(): {
    isRunning: boolean;
    isScheduled: boolean;
    intervalMinutes: number;
    lastSyncTime?: Date;
  } {
    return {
      isRunning: this.isRunning,
      isScheduled: this.syncTimer !== null,
      intervalMinutes: this.syncIntervalMinutes,
      // Include the last sync time if we have it
      // This would be enhanced to read from a database in production
    };
  }
}

// Export an instance of the service
export const syncOrchestratorService = new SyncOrchestratorService();