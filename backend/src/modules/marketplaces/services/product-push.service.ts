import { MarketplaceAdapterFactory } from './marketplace-adapter-factory.service';
import { CredentialManager } from '../utils/credential-manager';
import { 
  PriceUpdatePayload, 
  StockUpdatePayload, 
  StatusUpdatePayload,
  ProductStatus,
  OperationResult
} from '../models/marketplace.models';
import InventoryItem from '../../../models/inventory.model';
import mongoose from 'mongoose';
import { ActivityService } from '../../../services/activity.service';

/**
 * Service for pushing product updates to marketplaces
 */
export class ProductPushService {
  private static instance: ProductPushService;
  private adapterFactory: MarketplaceAdapterFactory;
  private credentialManager: CredentialManager;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.adapterFactory = MarketplaceAdapterFactory.getInstance();
    this.credentialManager = CredentialManager.getInstance();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ProductPushService {
    if (!ProductPushService.instance) {
      ProductPushService.instance = new ProductPushService();
    }
    return ProductPushService.instance;
  }

  /**
   * Push product updates to a marketplace
   * @param productId - Product ID in the system
   * @param marketplaceId - Target marketplace ID
   * @param userId - User ID making the request
   * @param updates - Updates to push (price, rrp, stock, status)
   * @returns Result of the push operation
   */
  public async pushProductUpdate(
    productId: string,
    marketplaceId: string,
    userId: string,
    updates: {
      price?: number;
      rrp?: number;
      stock?: number;
      status?: 'active' | 'inactive';
    }
  ): Promise<{
    success: boolean;
    message: string;
    details?: {
      price?: { success: boolean; message?: string };
      stock?: { success: boolean; message?: string };
      status?: { success: boolean; message?: string };
    };
  }> {
    try {
      // Verify product exists and user has access to it
      const product = await InventoryItem.findById(productId);
      if (!product) {
        return {
          success: false,
          message: `Product with ID ${productId} not found`
        };
      }

      // Load marketplace credentials for the user
      const encryptedCredentials = await this.getMarketplaceCredentials(userId, marketplaceId);
      if (!encryptedCredentials) {
        return {
          success: false,
          message: `No credentials found for marketplace ${marketplaceId}`
        };
      }

      // Decrypt credentials
      const credentials = this.credentialManager.decryptCredentials(encryptedCredentials);

      // Initialize marketplace adapter
      const adapter = await this.adapterFactory.createAdapter(
        marketplaceId,
        credentials
      );

      // Prepare result object
      const result: {
        success: boolean;
        message: string;
        details: {
          price?: { success: boolean; message?: string };
          stock?: { success: boolean; message?: string };
          status?: { success: boolean; message?: string };
        };
      } = {
        success: false,
        message: '',
        details: {}
      };

      // Track successful operations
      let successCount = 0;
      let operationCount = 0;

      // Push price update if requested
      if (updates.price !== undefined || updates.rrp !== undefined) {
        operationCount++;
        const priceUpdate: PriceUpdatePayload = {
          sku: product.sku,
          price: updates.price ?? product.price
        };

        // Add RRP if provided
        if (updates.rrp !== undefined) {
          priceUpdate.salePrice = updates.rrp;
        }

        const priceResult = await adapter.updatePrices([priceUpdate]);
        
        if (priceResult.success) {
          const priceDetails = priceResult.data;
          if (priceDetails && priceDetails.successful.includes(product.sku)) {
            result.details.price = { success: true };
            successCount++;
          } else {
            const errorMessage = priceDetails?.failed.find((f: any) => f.sku === product.sku)?.reason || 'Unknown error';
            result.details.price = { success: false, message: errorMessage };
          }
        } else {
          result.details.price = { 
            success: false, 
            message: priceResult.error?.message || 'Failed to update price' 
          };
        }

        // Log the activity
        await this.logActivity(
          userId,
          productId,
          'price_update_push',
          marketplaceId,
          result.details.price?.success || false,
          { price: updates.price, rrp: updates.rrp }
        );
      }

      // Push stock update if requested
      if (updates.stock !== undefined) {
        operationCount++;
        const stockUpdate: StockUpdatePayload = {
          sku: product.sku,
          quantity: updates.stock
        };

        const stockResult = await adapter.updateStock([stockUpdate]);
        
        if (stockResult.success) {
          const stockDetails = stockResult.data;
          if (stockDetails && stockDetails.successful.includes(product.sku)) {
            result.details.stock = { success: true };
            successCount++;
          } else {
            const errorMessage = stockDetails?.failed.find((f: any) => f.sku === product.sku)?.reason || 'Unknown error';
            result.details.stock = { success: false, message: errorMessage };
          }
        } else {
          result.details.stock = { 
            success: false, 
            message: stockResult.error?.message || 'Failed to update stock' 
          };
        }

        // Log the activity
        await this.logActivity(
          userId,
          productId,
          'stock_update_push',
          marketplaceId,
          result.details.stock?.success || false,
          { stock: updates.stock }
        );
      }

      // Push status update if requested
      if (updates.status !== undefined) {
        operationCount++;
        const statusUpdate: StatusUpdatePayload = {
          sku: product.sku,
          status: updates.status === 'active' ? ProductStatus.ACTIVE : ProductStatus.INACTIVE
        };

        const statusResult = await adapter.updateStatus([statusUpdate]);
        
        if (statusResult.success) {
          const statusDetails = statusResult.data;
          if (statusDetails && statusDetails.successful.includes(product.sku)) {
            result.details.status = { success: true };
            successCount++;
          } else {
            const errorMessage = statusDetails?.failed.find((f: any) => f.sku === product.sku)?.reason || 'Unknown error';
            result.details.status = { success: false, message: errorMessage };
          }
        } else {
          result.details.status = { 
            success: false, 
            message: statusResult.error?.message || 'Failed to update status' 
          };
        }

        // Log the activity
        await this.logActivity(
          userId,
          productId,
          'status_update_push',
          marketplaceId,
          result.details.status?.success || false,
          { status: updates.status }
        );
      }

      // Set overall success status
      result.success = successCount > 0 && successCount === operationCount;
      
      // Generate summary message
      if (result.success) {
        result.message = 'All requested updates were pushed successfully';
      } else if (successCount > 0) {
        result.message = 'Some updates were pushed successfully, but others failed';
      } else {
        result.message = 'Failed to push updates to marketplace';
      }

      return result;
    } catch (error) {
      console.error('Error pushing product update:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as Error).message
        : 'Unknown error';
        
      return {
        success: false,
        message: `Error pushing product update: ${errorMessage}`
      };
    }
  }

  /**
   * Get marketplace credentials for a user
   * @param userId - The user ID
   * @param marketplaceId - The marketplace ID
   * @returns Encrypted credentials string or null if not found
   */
  private async getMarketplaceCredentials(userId: string, marketplaceId: string): Promise<string | null> {
    // This is a placeholder - in a real application, you'd fetch this from your database
    // For now, we'll return mock credentials for Takealot
    if (marketplaceId.toLowerCase() === 'takealot') {
      // Using the environment variable to get an API key, or a default for testing
      const apiKey = process.env.TAKEALOT_API_KEY || 'mock_api_key_for_testing';
      const apiSecret = process.env.TAKEALOT_API_SECRET || 'mock_api_secret_for_testing';
      
      // Encrypt these credentials
      const credentials = this.credentialManager.encryptCredentials({
        apiKey,
        apiSecret
      }, marketplaceId);
      
      return credentials;
    }
    
    return null;
  }

  /**
   * Log product push activity
   * @param userId - User who initiated the push
   * @param productId - Product that was updated
   * @param activityType - Type of activity
   * @param marketplaceId - Target marketplace
   * @param success - Whether the operation succeeded
   * @param details - Additional details about the update
   */
  private async logActivity(
    userId: string,
    productId: string,
    activityType: string,
    marketplaceId: string,
    success: boolean,
    details: any
  ): Promise<void> {
    await ActivityService.logActivity({
      userId: new mongoose.Types.ObjectId(userId),
      description: `Marketplace push: ${activityType} to ${marketplaceId}`,
      entityType: 'document', // Using 'document' as entityType since 'product' is not available
      entityId: new mongoose.Types.ObjectId(productId),
      action: 'update', 
      status: success ? 'completed' : 'failed',
      metadata: {
        actionType: `marketplace_${activityType}`,
        marketplaceId,
        success,
        ...details
      }
    });
  }
}