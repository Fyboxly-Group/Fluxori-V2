import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { IProduct, IProductWithId, Product } from '../models/product.model';
import { MarketplaceProduct } from '../../marketplaces/models/marketplace.models';
import { IProductMapper, productMapperRegistry } from '../mappers/product-mapper.interface';
import { ApiError } from '../../../middleware/error.middleware';
import { ProductSyncConfig, IProductSyncConfig } from '../models/product-sync-config.model';
import { MarketplaceAdapterFactoryService } from '../../marketplaces/services/marketplace-adapter-factory.service';
import { IMarketplaceAdapter } from '../../marketplaces/adapters/interfaces/marketplace-adapter.interface';
import { db } from '../../../config/firestore';
import { Firestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

/**
 * Standard response interface for product operations
 */
export interface ProductOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Interface for the product ingestion service
 */
export interface IProductIngestionService {
  ingestProducts(
    marketplaceId: string,
    userId: string,
    organizationId: string,
    products: MarketplaceProduct[]
  ): Promise<ProductOperationResult<{ count: number; products: IProductWithId[] }>>;
  
  processProduct(
    product: MarketplaceProduct,
    userId: string, 
    organizationId: string
  ): Promise<ProductOperationResult<IProductWithId>>;
  
  getSyncConfig(
    userId: string,
    organizationId: string,
    marketplaceId: string
  ): Promise<IProductSyncConfig | null>;
  
  updateSyncConfig(
    config: Partial<IProductSyncConfig>
  ): Promise<ProductOperationResult<IProductSyncConfig>>;
  
  syncProductToMarketplaces(
    productId: string,
    marketplaceIds?: string[]
  ): Promise<ProductOperationResult<{
    successful: string[];
    failed: Array<{ marketplaceId: string; reason: string }>;
  }>>;
}

/**
 * Service responsible for ingesting and syncing product data between
 * marketplaces and the Fluxori database.
 */
@injectable()
export class ProductIngestionService implements IProductIngestionService {
  private defaultWarehouseId: string = 'default';
  private productsCollection: FirebaseFirestore.CollectionReference;
  private syncConfigCollection: FirebaseFirestore.CollectionReference;
  
  /**
   * Constructor
   */
  constructor(
    @inject('Logger') private logger: Logger,
    @inject('Firestore') private firestore: Firestore,
    @inject(MarketplaceAdapterFactoryService) private marketplaceAdapterFactory: MarketplaceAdapterFactoryService
  ) {
    this.productsCollection = this.firestore.collection('products');
    this.syncConfigCollection = this.firestore.collection('productSyncConfigs');
  }
  
  /**
   * Ingest products from a marketplace
   * @param marketplaceId - The ID of the marketplace
   * @param userId - The ID of the user who owns the connection
   * @param organizationId - The organization ID
   * @param products - Array of products to ingest
   */
  async ingestProducts(
    marketplaceId: string,
    userId: string,
    organizationId: string,
    products: MarketplaceProduct[]
  ): Promise<ProductOperationResult<{ count: number; products: IProductWithId[] }>> {
    try {
      if (!products || products.length === 0) {
        return { 
          success: true, 
          data: { 
            count: 0,
            products: []
          } 
        };
      }
      
      this.logger.info(`Ingesting ${products.length} products from ${marketplaceId}`, {
        userId,
        organizationId,
        marketplaceId,
        productCount: products.length
      });
      
      // Get the appropriate mapper for this marketplace
      let mapper: IProductMapper;
      
      try {
        mapper = productMapperRegistry.getMapper(marketplaceId);
      } catch (error) {
        this.logger.error(`No product mapper found for marketplace: ${marketplaceId}`, { error });
        return {
          success: false,
          error: {
            code: 'mapper_not_found',
            message: `No product mapper found for marketplace: ${marketplaceId}`
          }
        };
      }
      
      // Process each product in parallel with limited concurrency
      const batchSize = 10; // Process 10 products at a time
      const results: IProductWithId[] = [];
      const errors: any[] = [];
      
      // Process products in batches to avoid overwhelming the system
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchPromises = batch.map(product => 
          this.processProduct(product, userId, organizationId)
            .then(result => {
              if (result.success && result.data) {
                results.push(result.data);
                return { success: true };
              } else {
                errors.push({ product: product.id, error: result.error });
                return { success: false };
              }
            })
            .catch(error => {
              errors.push({ product: product.id, error });
              return { success: false };
            })
        );
        
        // Wait for the current batch to complete before processing the next batch
        await Promise.all(batchPromises);
        
        // Log progress
        this.logger.debug(`Processed batch ${i / batchSize + 1}/${Math.ceil(products.length / batchSize)}`, {
          successful: results.length,
          failed: errors.length
        });
      }
      
      // Log any errors that occurred
      if (errors.length > 0) {
        this.logger.warn(`Encountered ${errors.length} errors while ingesting products`, { 
          errors: errors.slice(0, 10), // Log first 10 errors to avoid excessive logging
          totalErrors: errors.length
        });
      }
      
      this.logger.info(`Successfully ingested ${results.length}/${products.length} products from ${marketplaceId}`, {
        marketplaceId,
        successCount: results.length,
        failureCount: errors.length
      });
      
      return {
        success: true,
        data: {
          count: results.length,
          products: results
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error ingesting products from ${marketplaceId}`, { 
        error: errorMessage,
        marketplaceId,
        userId,
        organizationId
      });
      
      return {
        success: false,
        error: {
          code: 'ingestion_failed',
          message: `Failed to ingest products: ${errorMessage}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Process a single product from a marketplace
   * @param product - The product to process
   * @param userId - The user ID
   * @param organizationId - The organization ID
   */
  async processProduct(
    product: MarketplaceProduct,
    userId: string,
    organizationId: string
  ): Promise<ProductOperationResult<IProductWithId>> {
    try {
      this.logger.debug(`Processing product: ${product.id} (${product.sku})`, { 
        productId: product.id, 
        sku: product.sku
      });
      
      // Get the mapper for this marketplace
      const mapper = productMapperRegistry.getMapper(product.marketplaceId);
      
      // First check if product with this SKU already exists for this organization
      const existingProductRef = await this.productsCollection
        .where('sku', '==', product.sku)
        .where('organizationId', '==', organizationId)
        .limit(1)
        .get();
      
      if (!existingProductRef.empty) {
        // Product exists, update it
        const existingProductDoc = existingProductRef.docs[0];
        const existingProduct = existingProductDoc.data() as IProduct;
        
        // Find differences between existing product and marketplace product
        const differences = mapper.findDifferences(existingProduct, product);
        
        if (differences.length > 0) {
          this.logger.debug(`Found ${differences.length} differences for product ${product.sku}`, { 
            differences,
            productId: existingProductDoc.id
          });
          
          // Map marketplace data to Fluxori format
          const mappedData = mapper.mapToFluxoriProduct(product, userId, organizationId);
          
          // Keep track of original warehouse ID if it exists
          const warehouseId = existingProduct.inventory && existingProduct.inventory.length > 0
            ? existingProduct.inventory[0].warehouseId
            : mapper.getWarehouseId(product, this.defaultWarehouseId);
          
          // Prepare inventory data
          let inventory = existingProduct.inventory || [];
          
          // Update inventory quantity if it exists
          if (inventory.length > 0) {
            inventory = inventory.map(item => {
              if (item.warehouseId === warehouseId) {
                return {
                  ...item,
                  quantity: product.stockLevel
                };
              }
              return item;
            });
          } else {
            // Add new inventory entry
            inventory = [{
              quantity: product.stockLevel,
              warehouseId: warehouseId,
              lowStockThreshold: 5 // Default threshold
            }];
          }
          
          // Prepare the update data
          const updateData: Partial<IProduct> = {
            ...mappedData,
            inventory,
            marketplaceData: {
              ...existingProduct.marketplaceData,
              [product.marketplaceId]: {
                id: product.id,
                lastSynced: new Date(),
                ...product.metadata
              }
            },
            updatedAt: Timestamp.now()
          };
          
          // Update the product
          await this.productsCollection.doc(existingProductDoc.id).update(updateData);
          
          // Get the updated product
          const updatedProductDoc = await this.productsCollection.doc(existingProductDoc.id).get();
          
          return {
            success: true,
            data: {
              id: updatedProductDoc.id,
              ...updatedProductDoc.data()
            } as IProductWithId
          };
        } else {
          // No differences found, just update the last synced timestamp
          await this.productsCollection.doc(existingProductDoc.id).update({
            [`marketplaceData.${product.marketplaceId}.lastSynced`]: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
          
          return {
            success: true,
            data: {
              id: existingProductDoc.id,
              ...existingProduct
            } as IProductWithId
          };
        }
      } else {
        // Product doesn't exist, create it
        this.logger.debug(`Creating new product: ${product.sku}`, { 
          sku: product.sku,
          marketplaceId: product.marketplaceId 
        });
        
        // Map marketplace data to Fluxori format
        const mappedData = mapper.mapToFluxoriProduct(product, userId, organizationId);
        
        // Get the warehouse ID for this product
        const warehouseId = mapper.getWarehouseId(product, this.defaultWarehouseId);
        
        // Create the new product
        const newProduct: IProduct = {
          ...mappedData,
          sku: product.sku,
          name: product.title,
          userId,
          organizationId,
          inventory: [{
            quantity: product.stockLevel,
            warehouseId: warehouseId,
            lowStockThreshold: 5 // Default threshold
          }],
          marketplaceData: {
            [product.marketplaceId]: {
              id: product.id,
              lastSynced: new Date(),
              ...product.metadata
            }
          },
          active: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        // Add to Firestore
        const docRef = await this.productsCollection.add(newProduct);
        
        return {
          success: true,
          data: {
            id: docRef.id,
            ...newProduct
          } as IProductWithId
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error processing product ${product.id} (${product.sku})`, { 
        error: errorMessage,
        productId: product.id,
        sku: product.sku,
        marketplaceId: product.marketplaceId
      });
      
      return {
        success: false,
        error: {
          code: 'processing_failed',
          message: `Failed to process product: ${errorMessage}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Get the sync configuration for a specific marketplace
   * @param userId - The user ID
   * @param organizationId - The organization ID  
   * @param marketplaceId - The marketplace ID
   */
  async getSyncConfig(
    userId: string,
    organizationId: string,
    marketplaceId: string
  ): Promise<IProductSyncConfig | null> {
    try {
      const configRef = await this.syncConfigCollection
        .where('userId', '==', userId)
        .where('organizationId', '==', organizationId)
        .where('marketplaceId', '==', marketplaceId)
        .limit(1)
        .get();
      
      if (configRef.empty) {
        return null;
      }
      
      const config = configRef.docs[0].data() as IProductSyncConfig;
      
      return {
        ...config,
        id: configRef.docs[0].id
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting sync config`, { 
        error: errorMessage,
        userId,
        organizationId,
        marketplaceId
      });
      
      return null;
    }
  }
  
  /**
   * Update or create a sync configuration
   * @param config - The sync configuration
   */
  async updateSyncConfig(
    config: Partial<IProductSyncConfig>
  ): Promise<ProductOperationResult<IProductSyncConfig>> {
    try {
      // Validate required fields
      if (!config.userId || !config.organizationId || !config.marketplaceId) {
        return {
          success: false,
          error: {
            code: 'invalid_config',
            message: 'Missing required fields: userId, organizationId, or marketplaceId'
          }
        };
      }
      
      // Check if config exists
      let configId: string | null = null;
      
      if (config.id) {
        // Update existing config
        configId = config.id;
        await this.syncConfigCollection.doc(configId).update({
          ...config,
          updatedAt: Timestamp.now()
        });
      } else {
        // Check if a config already exists for this combination
        const existingConfig = await this.getSyncConfig(
          config.userId,
          config.organizationId,
          config.marketplaceId
        );
        
        if (existingConfig) {
          // Update existing config
          configId = existingConfig.id;
          await this.syncConfigCollection.doc(configId).update({
            ...config,
            updatedAt: Timestamp.now()
          });
        } else {
          // Create new config
          const newConfig: IProductSyncConfig = {
            userId: config.userId,
            organizationId: config.organizationId,
            marketplaceId: config.marketplaceId,
            syncEnabled: config.syncEnabled !== undefined ? config.syncEnabled : true,
            syncDirection: config.syncDirection || 'both',
            syncFrequency: config.syncFrequency || 'daily',
            syncFields: config.syncFields || ['price', 'stock', 'status'],
            defaultWarehouseId: config.defaultWarehouseId || this.defaultWarehouseId,
            lastSyncTimestamp: config.lastSyncTimestamp || null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          };
          
          const docRef = await this.syncConfigCollection.add(newConfig);
          configId = docRef.id;
        }
      }
      
      // Get the updated config
      const updatedConfigDoc = await this.syncConfigCollection.doc(configId).get();
      
      return {
        success: true,
        data: {
          id: updatedConfigDoc.id,
          ...updatedConfigDoc.data()
        } as IProductSyncConfig
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating sync config`, { 
        error: errorMessage,
        config
      });
      
      return {
        success: false,
        error: {
          code: 'update_failed',
          message: `Failed to update sync config: ${errorMessage}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Sync a product to one or more marketplaces
   * @param productId - ID of the product to sync
   * @param marketplaceIds - Optional list of marketplace IDs to sync to (all connected marketplaces if not specified)
   * @returns Result of the sync operation
   */
  async syncProductToMarketplaces(
    productId: string,
    marketplaceIds?: string[]
  ): Promise<ProductOperationResult<{
    successful: string[];
    failed: Array<{ marketplaceId: string; reason: string }>;
  }>> {
    try {
      // Get the product
      const productDoc = await this.productsCollection.doc(productId).get();
      
      if (!productDoc.exists) {
        return {
          success: false,
          error: {
            code: 'product_not_found',
            message: `Product with ID ${productId} not found`
          }
        };
      }
      
      const product = productDoc.data() as IProductWithId;
      product.id = productDoc.id;
      
      // Determine which marketplaces to sync with
      const targetMarketplaceIds = marketplaceIds || 
        (product.marketplaceData ? Object.keys(product.marketplaceData) : []);
      
      if (targetMarketplaceIds.length === 0) {
        return {
          success: false,
          error: {
            code: 'no_marketplaces',
            message: 'No marketplaces specified or associated with this product'
          }
        };
      }
      
      const successful: string[] = [];
      const failed: Array<{ marketplaceId: string; reason: string }> = [];
      
      // Process each marketplace
      for (const marketplaceId of targetMarketplaceIds) {
        try {
          // Get the adapter for this marketplace
          const adapter = await this.marketplaceAdapterFactory.getAdapter(marketplaceId, product.userId);
          
          if (!adapter) {
            failed.push({
              marketplaceId,
              reason: 'Marketplace adapter not found or not initialized'
            });
            continue;
          }
          
          // Prepare the product data for this marketplace
          const syncResult = await this.syncProductToMarketplace(product, marketplaceId, adapter);
          
          if (syncResult.success) {
            successful.push(marketplaceId);
          } else {
            failed.push({
              marketplaceId,
              reason: syncResult.error?.message || 'Unknown error'
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.error(`Error syncing product ${productId} to ${marketplaceId}`, { 
            error: errorMessage,
            productId,
            marketplaceId
          });
          
          failed.push({
            marketplaceId,
            reason: errorMessage
          });
        }
      }
      
      // Update the last synced timestamp
      await this.productsCollection.doc(productId).update({
        updatedAt: Timestamp.now(),
        ...Object.fromEntries(
          successful.map(marketplaceId => [
            `marketplaceData.${marketplaceId}.lastSynced`, 
            Timestamp.now()
          ])
        )
      });
      
      return {
        success: true,
        data: { successful, failed }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error syncing product ${productId} to marketplaces`, { 
        error: errorMessage,
        productId,
        marketplaceIds
      });
      
      return {
        success: false,
        error: {
          code: 'sync_failed',
          message: `Failed to sync product: ${errorMessage}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Sync a product to a specific marketplace
   * @param product - The product to sync
   * @param marketplaceId - The marketplace ID
   * @param adapter - The marketplace adapter
   */
  private async syncProductToMarketplace(
    product: IProductWithId,
    marketplaceId: string,
    adapter: IMarketplaceAdapter
  ): Promise<ProductOperationResult<any>> {
    try {
      // Get the current stock level from inventory
      const inventory = product.inventory || [];
      const stockLevel = inventory.reduce((total, item) => total + item.quantity, 0);
      
      // Get the price
      const price = product.pricing?.retail || 0;
      
      // Check if the product exists on this marketplace
      const existingProduct = product.marketplaceData?.[marketplaceId];
      
      if (!existingProduct) {
        // Product doesn't exist on this marketplace, create it
        this.logger.info(`Product ${product.sku} doesn't exist on ${marketplaceId}, creating it`, {
          productId: product.id,
          sku: product.sku,
          marketplaceId
        });
        
        // TODO: Implement product creation
        return {
          success: false,
          error: {
            code: 'not_implemented',
            message: 'Product creation on marketplaces not implemented yet'
          }
        };
      }
      
      // Update existing product on the marketplace
      this.logger.debug(`Updating product ${product.sku} on ${marketplaceId}`, {
        productId: product.id,
        sku: product.sku,
        marketplaceId,
        stockLevel,
        price
      });
      
      // Update stock level
      const stockResult = await adapter.updateInventory([{
        sku: product.sku,
        quantity: stockLevel
      }]);
      
      if (!stockResult) {
        return {
          success: false,
          error: {
            code: 'stock_update_failed',
            message: 'Stock update failed'
          }
        };
      }
      
      // TODO: Update price and other properties as needed
      
      return {
        success: true,
        data: {
          sku: product.sku,
          stockLevel,
          price
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error syncing product ${product.id} to ${marketplaceId}`, { 
        error: errorMessage,
        productId: product.id,
        sku: product.sku,
        marketplaceId
      });
      
      return {
        success: false,
        error: {
          code: 'sync_failed',
          message: `Failed to sync product: ${errorMessage}`,
          details: error
        }
      };
    }
  }
}

// Create and export default instance
export default new ProductIngestionService(
  console as any, // Will be replaced with proper logger by DI container
  db,
  null as any // Will be replaced with proper adapter factory by DI container
);