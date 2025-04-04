import { Injectable } from '../../../decorators/injectable.decorator';
import { Timestamp } from 'firebase-admin/firestore';
import { db, ordersCollection } from '../../../config/firestore';
import logger from '../../../utils/logger';

// Interfaces and types
import { IOrder, IOrderWithId, orderConverter } from '../models/order.model';
import { MarketplaceOrder } from '../../marketplaces/models/marketplace.models';
import { OrderMapperRegistry } from '../mappers/order-mapper.interface';
import XeroInvoiceService, { XeroInvoiceResult } from './xero-invoice.service';

/**
 * Options for order ingestion
 */
export interface OrderIngestionOptions {
  /**
   * Whether to skip existing orders
   */
  skipExisting?: boolean;
  
  /**
   * Whether to create Xero invoices for eligible orders
   */
  createXeroInvoices?: boolean;
  
  /**
   * Whether to update existing orders if found
   */
  updateExisting?: boolean;
  
  /**
   * Additional marketplace-specific options
   */
  marketplaceSpecific?: Record<string, any>;
}

/**
 * Response when ingesting orders
 */
export interface OrderIngestionResponse {
  /**
   * Whether the operation was successful overall
   */
  success: boolean;
  
  /**
   * Count of new orders created
   */
  ordersCreated: number;
  
  /**
   * Count of existing orders updated
   */
  ordersUpdated: number;
  
  /**
   * Count of orders skipped
   */
  ordersSkipped: number;
  
  /**
   * Count of Xero invoices created
   */
  xeroInvoicesCreated: number;
  
  /**
   * Any errors that occurred during processing
   */
  errors: Array<{
    orderId?: string;
    message: string;
    details?: any;
  }>;
}

/**
 * Service to handle ingestion of orders from various marketplaces
 */
@Injectable()
export class OrderIngestionService {
  private orderMapperRegistry: OrderMapperRegistry;
  private xeroInvoiceService: XeroInvoiceService;

  /**
   * Constructor
   */
  constructor() {
    this.orderMapperRegistry = OrderMapperRegistry.getInstance();
    this.xeroInvoiceService = new XeroInvoiceService();
  }
  
  /**
   * Ingest orders from a marketplace
   * 
   * @param marketplaceId - The marketplace ID
   * @param userId - The user ID
   * @param organizationId - The organization ID
   * @param rawOrders - The raw orders from the marketplace
   * @param options - Options for order ingestion
   * @returns Response with status and counts
   */
  public async ingestOrders(
    marketplaceId: string,
    userId: string,
    organizationId: string,
    rawOrders: MarketplaceOrder[],
    options: OrderIngestionOptions = {}
  ): Promise<OrderIngestionResponse> {
    const response: OrderIngestionResponse = {
      success: true,
      ordersCreated: 0,
      ordersUpdated: 0,
      ordersSkipped: 0,
      xeroInvoicesCreated: 0,
      errors: []
    };
    
    try {
      logger.info(`Ingesting ${rawOrders.length} orders from marketplace ${marketplaceId}`);
      
      // Check if we have a mapper for this marketplace
      if (!this.orderMapperRegistry.hasMapper(marketplaceId)) {
        const errorMessage = `No order mapper registered for marketplace: ${marketplaceId}`;
        logger.error(errorMessage);
        return {
          ...response,
          success: false,
          errors: [{ message: errorMessage }]
        };
      }
      
      // Process the orders
      await this.processOrders(
        rawOrders,
        userId,
        organizationId,
        marketplaceId,
        options,
        response
      );
      
      logger.info(`Ingestion complete for marketplace ${marketplaceId}: ` +
        `${response.ordersCreated} created, ${response.ordersUpdated} updated, ` +
        `${response.ordersSkipped} skipped, ${response.xeroInvoicesCreated} Xero invoices created`);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error ingesting orders from marketplace ${marketplaceId}:`, error);
      
      return {
        ...response,
        success: false,
        errors: [...response.errors, { message: errorMessage }]
      };
    }
  }
  
  /**
   * Process orders from a marketplace
   * 
   * @param rawOrders - The raw orders from the marketplace
   * @param userId - The user ID
   * @param organizationId - The organization ID
   * @param marketplaceId - The marketplace ID
   * @param options - Options for order ingestion
   * @param response - The response object to update
   */
  public async processOrders(
    rawOrders: MarketplaceOrder[],
    userId: string,
    organizationId: string,
    marketplaceId: string,
    options: OrderIngestionOptions = {},
    response: OrderIngestionResponse = {
      success: true,
      ordersCreated: 0,
      ordersUpdated: 0,
      ordersSkipped: 0,
      xeroInvoicesCreated: 0,
      errors: []
    }
  ): Promise<void> {
    if (!rawOrders || !rawOrders.length) {
      logger.info(`No orders to process for marketplace ${marketplaceId}`);
      return;
    }
    
    // Get the mapper
    const mapper = this.orderMapperRegistry.getMapper(marketplaceId);
    
    // Process each order
    for (const rawOrder of rawOrders) {
      try {
        // Map the order to our internal format
        const mappedOrder = mapper.mapToFluxoriOrder(rawOrder, userId, organizationId);
        
        // Check if the order already exists
        const existingOrder = await this.findExistingOrder(
          mappedOrder.marketplaceOrderId,
          mappedOrder.marketplaceName,
          userId,
          organizationId
        );
        
        if (existingOrder) {
          // Order exists, decide what to do based on options
          if (options.skipExisting) {
            logger.debug(`Skipping existing order ${mappedOrder.marketplaceOrderId}`);
            response.ordersSkipped++;
            continue;
          }
          
          if (options.updateExisting !== false) {
            // Update the existing order
            await this.updateOrder(existingOrder.id, mappedOrder);
            response.ordersUpdated++;
            logger.debug(`Updated existing order ${mappedOrder.marketplaceOrderId}`);
            
            // Check if we should create a Xero invoice
            if (options.createXeroInvoices !== false && 
                this.xeroInvoiceService.shouldCreateInvoice(existingOrder)) {
              const invoiceResult = await this.createXeroInvoice(existingOrder);
              if (invoiceResult.success) {
                response.xeroInvoicesCreated++;
              }
            }
          } else {
            // Skip the order
            logger.debug(`Skipping existing order ${mappedOrder.marketplaceOrderId} (updateExisting=false)`);
            response.ordersSkipped++;
          }
        } else {
          // Order doesn't exist, create it
          const newOrderId = await this.createOrder(mappedOrder);
          response.ordersCreated++;
          logger.debug(`Created new order ${mappedOrder.marketplaceOrderId} with ID ${newOrderId}`);
          
          // Get the newly created order
          const newOrder = await this.getOrderById(newOrderId);
          
          // Check if we should create a Xero invoice
          if (newOrder && options.createXeroInvoices !== false && 
              this.xeroInvoiceService.shouldCreateInvoice(newOrder)) {
            const invoiceResult = await this.createXeroInvoice(newOrder);
            if (invoiceResult.success) {
              response.xeroInvoicesCreated++;
            }
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        logger.error(`Error processing order ${rawOrder.marketplaceOrderId || rawOrder.id}:`, error);
        
        response.errors.push({
          orderId: rawOrder.marketplaceOrderId || rawOrder.id,
          message: `Error processing order: ${errorMessage}`
        });
      }
    }
  }
  
  /**
   * Find an existing order by marketplace order ID
   * 
   * @param marketplaceOrderId - The marketplace order ID
   * @param marketplaceName - The marketplace name
   * @param userId - The user ID
   * @param organizationId - The organization ID
   * @returns The existing order if found, null otherwise
   */
  private async findExistingOrder(
    marketplaceOrderId: string,
    marketplaceName: string,
    userId: string,
    organizationId: string
  ): Promise<IOrderWithId | null> {
    try {
      let query = ordersCollection
        .where('marketplaceOrderId', '==', marketplaceOrderId)
        .where('marketplaceName', '==', marketplaceName);
      
      // Add user or org filter
      if (userId) {
        query = query.where('userId', '==', userId);
      } else if (organizationId) {
        query = query.where('organizationId', '==', organizationId);
      }
      
      const snapshot = await query
        .withConverter(orderConverter)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      return snapshot.docs[0].data() as IOrderWithId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error finding existing order ${marketplaceOrderId}:`, error);
      throw new Error(`Error finding existing order: ${errorMessage}`);
    }
  }
  
  /**
   * Create a new order
   * 
   * @param order - The order to create
   * @returns The ID of the created order
   */
  private async createOrder(order: IOrder): Promise<string> {
    try {
      // Ensure timestamps are set
      const now = Timestamp.now();
      if (!order.createdAt) {
        order.createdAt = now;
      }
      order.updatedAt = now;
      
      // Add to Firestore
      const orderRef = await ordersCollection
        .withConverter(orderConverter)
        .add(order);
      
      return orderRef.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error creating order in Firestore:`, error);
      throw new Error(`Error creating order: ${errorMessage}`);
    }
  }
  
  /**
   * Update an existing order
   * 
   * @param orderId - The ID of the order to update
   * @param updateData - The data to update
   * @returns True if successful
   */
  private async updateOrder(
    orderId: string,
    updateData: Partial<IOrder>
  ): Promise<boolean> {
    try {
      // Ensure updatedAt is set
      updateData.updatedAt = Timestamp.now();
      
      // Update in Firestore
      await ordersCollection.doc(orderId).update(updateData);
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error updating order ${orderId} in Firestore:`, error);
      throw new Error(`Error updating order: ${errorMessage}`);
    }
  }
  
  /**
   * Get an order by ID
   * 
   * @param orderId - The ID of the order to retrieve
   * @returns The order if found, null otherwise
   */
  private async getOrderById(orderId: string): Promise<IOrderWithId | null> {
    try {
      const orderDoc = await ordersCollection
        .doc(orderId)
        .withConverter(orderConverter)
        .get();
      
      if (!orderDoc.exists) {
        return null;
      }
      
      return orderDoc.data() as IOrderWithId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error getting order ${orderId} from Firestore:`, error);
      throw new Error(`Error getting order: ${errorMessage}`);
    }
  }
  
  /**
   * Create a Xero invoice for an order
   * 
   * @param order - The order to create an invoice for
   * @returns The result of invoice creation
   */
  private async createXeroInvoice(order: IOrderWithId): Promise<XeroInvoiceResult> {
    try {
      logger.info(`Creating Xero invoice for order ${order.id}`);
      
      const result = await this.xeroInvoiceService.createInvoice(order);
      
      if (result.success) {
        // Update the order with Xero invoice info
        await this.updateOrder(order.id, {
          xeroInvoiceId: result.invoiceId,
          xeroInvoiceNumber: result.invoiceNumber,
          xeroPushAttempted: true,
          xeroPushDate: Timestamp.now(),
          xeroPushStatus: 'success'
        });
        
        logger.info(`Created Xero invoice ${result.invoiceNumber} for order ${order.id}`);
      } else {
        // Update the order with error info
        await this.updateOrder(order.id, {
          xeroPushAttempted: true,
          xeroPushDate: Timestamp.now(),
          xeroPushStatus: 'failed',
          xeroPushError: result.error
        });
        
        logger.error(`Failed to create Xero invoice for order ${order.id}: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error creating Xero invoice for order ${order.id}:`, error);
      
      // Update the order with error info
      try {
        await this.updateOrder(order.id, {
          xeroPushAttempted: true,
          xeroPushDate: Timestamp.now(),
          xeroPushStatus: 'failed',
          xeroPushError: errorMessage
        });
      } catch (updateError) {
        logger.error(`Failed to update order ${order.id} with Xero error:`, updateError);
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}

// Create a singleton instance
const orderIngestionService = new OrderIngestionService();
export default orderIngestionService;