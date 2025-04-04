/**
 * Amazon Vendor API Module
 * 
 * Implements the Amazon SP-API Vendor API functionality.
 * This module allows vendors (direct suppliers to Amazon) to manage
 * their product catalog, orders, shipping information, and inventory.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse, ApiRequestFunction } from '../core/api-module';
import { AmazonSPApi } from '../schemas/amazon.generated';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';

/**
 * Order status types
 */
export type VendorOrderStatus = AmazonSPApi.VendorOrders.OrderStatus;

/**
 * Order search criteria
 */
export interface VendorOrderSearchCriteria {
  /**
   * Earliest purchase date (ISO 8601 format)
   */
  purchaseDateFrom?: string;
  
  /**
   * Latest purchase date (ISO 8601 format)
   */
  purchaseDateTo?: string;
  
  /**
   * Order status to filter by
   */
  status?: VendorOrderStatus[];
  
  /**
   * Amazon order identifier
   */
  orderNumber?: string;
  
  /**
   * Next token for pagination
   */
  nextToken?: string;
  
  /**
   * Maximum number of orders to return
   */
  maxResults?: number;
}

/**
 * Item in a shipping confirmation
 */
export interface ShippingItem {
  /**
   * Amazon's product identifier
   */
  buyerProductIdentifier: string;
  
  /**
   * Vendor's product identifier
   */
  vendorProductIdentifier?: string;
  
  /**
   * Quantity shipped
   */
  shippedQuantity: number;
}

/**
 * Tracking information for a shipment
 */
export interface TrackingInfo {
  /**
   * Carrier name
   */
  carrierName: string;
  
  /**
   * Tracking number
   */
  trackingNumber: string;
}

/**
 * Shipping information for an order
 */
export interface ShippingInfo {
  /**
   * Vendor's shipment ID
   */
  shipmentId: string;
  
  /**
   * Estimated delivery date (ISO 8601 format)
   */
  estimatedDeliveryDate: string;
  
  /**
   * Shipment details
   */
  items: ShippingItem[];
  
  /**
   * Shipment method
   */
  shipMethod?: string;
  
  /**
   * Tracking information
   */
  trackingInfo?: TrackingInfo;
}

/**
 * Acknowledgement item details
 */
export interface AcknowledgementItem {
  /**
   * Amazon product identifier
   */
  buyerProductIdentifier?: string;
  
  /**
   * Vendor product identifier
   */
  vendorProductIdentifier?: string;
  
  /**
   * Acknowledged quantity
   */
  acknowledgedQuantity: number;
}

/**
 * Acknowledgement details
 */
export interface OrderAcknowledgement {
  /**
   * Vendor purchase order number
   */
  vendorOrderNumber?: string;
  
  /**
   * Acknowledgement date (ISO 8601 format)
   */
  acknowledgementDate: string;
  
  /**
   * Acknowledgement status
   */
  acknowledgementStatus: 'ACCEPTED' | 'REJECTED';
  
  /**
   * Rejection reason (required if status is REJECTED)
   */
  rejectionReason?: string;
  
  /**
   * Items to acknowledge
   */
  items?: AcknowledgementItem[];
}

/**
 * Inventory item for update
 */
export interface InventoryItem {
  /**
   * Vendor product identifier
   */
  sellerSku: string;
  
  /**
   * Available quantity
   */
  availableQuantity: number;
  
  /**
   * Restock date if not currently available (ISO 8601 format)
   */
  restockDate?: string;
}

/**
 * Acknowledgement result for bulk operations
 */
export interface AcknowledgementResult {
  /**
   * Order number
   */
  orderNumber: string;
  
  /**
   * Success indicator
   */
  success: boolean;
  
  /**
   * Error message if applicable
   */
  message?: string;
}

/**
 * Implementation of the Amazon Vendor API
 */
export class VendorsModule extends BaseApiModule {
  /**
   * Constructor
   * @param apiVersion API version
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(
    apiVersion: string,
    makeApiRequest: ApiRequestFunction,
    marketplaceId: string
  ) {
    super('vendors', apiVersion, makeApiRequest, marketplaceId);
  }
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise that resolves when initialization is complete
   */
  protected async initializeModule(config?: unknown): Promise<void> {
    // No specific initialization required for this module
    return Promise.resolve();
  }
  
  /**
   * Get a list of purchase orders from Amazon
   * @param criteria Search criteria
   * @returns List of purchase orders
   */
  public async getOrders(criteria: VendorOrderSearchCriteria = {}): Promise<ApiResponse<AmazonSPApi.VendorOrders.GetPurchaseOrdersResponse>> {
    const params: Record<string, any> = {};
    
    if (criteria.purchaseDateFrom) {
      params.createdAfter = criteria.purchaseDateFrom;
    }
    
    if (criteria.purchaseDateTo) {
      params.createdBefore = criteria.purchaseDateTo;
    }
    
    if (criteria.status && criteria.status.length > 0) {
      params.orderStatus = criteria.status.join(',');
    }
    
    if (criteria.orderNumber) {
      params.orderNumber = criteria.orderNumber;
    }
    
    if (criteria.nextToken) {
      params.nextToken = criteria.nextToken;
    }
    
    if (criteria.maxResults) {
      params.limit = criteria.maxResults;
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.VendorOrders.GetPurchaseOrdersResponse>({
        method: 'GET',
        path: '/vendorOrders/v1/purchaseOrders',
        params
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getOrders`);
    }
  }
  
  /**
   * Get details for a specific purchase order
   * @param orderNumber Amazon purchase order number
   * @returns Purchase order details
   */
  public async getOrder(orderNumber: string): Promise<ApiResponse<AmazonSPApi.VendorOrders.GetPurchaseOrderResponse>> {
    if (!orderNumber) {
      throw AmazonErrorUtil.createError('Order number is required to get order details', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.VendorOrders.GetPurchaseOrderResponse>({
        method: 'GET',
        path: `/vendorOrders/v1/purchaseOrders/${orderNumber}`
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getOrder`);
    }
  }
  
  /**
   * Acknowledge a purchase order
   * @param orderNumber Amazon purchase order number
   * @param acknowledgement Acknowledgement details
   * @returns Acknowledgement result
   */
  public async acknowledgeOrder(
    orderNumber: string,
    acknowledgement: OrderAcknowledgement
  ): Promise<ApiResponse<AmazonSPApi.VendorOrders.SubmitAcknowledgementResponse>> {
    if (!orderNumber) {
      throw AmazonErrorUtil.createError('Order number is required to acknowledge an order', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!acknowledgement.acknowledgementDate) {
      throw AmazonErrorUtil.createError('Acknowledgement date is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!acknowledgement.acknowledgementStatus) {
      throw AmazonErrorUtil.createError('Acknowledgement status is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (acknowledgement.acknowledgementStatus === 'REJECTED' && !acknowledgement.rejectionReason) {
      throw AmazonErrorUtil.createError('Rejection reason is required when status is REJECTED', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.VendorOrders.SubmitAcknowledgementResponse>({
        method: 'POST',
        path: '/vendorOrders/v1/acknowledgements',
        data: {
          acknowledgements: [
            {
              purchaseOrderNumber: orderNumber,
              ...acknowledgement
            }
          ]
        }
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.acknowledgeOrder`);
    }
  }
  
  /**
   * Submit shipment confirmations for orders
   * @param orderNumber Amazon purchase order number
   * @param shippingInfo Shipping information
   * @returns Shipment confirmation result
   */
  public async confirmShipment(
    orderNumber: string,
    shippingInfo: ShippingInfo
  ): Promise<ApiResponse<AmazonSPApi.VendorShipments.SubmitShipmentConfirmationsResponse>> {
    if (!orderNumber) {
      throw AmazonErrorUtil.createError('Order number is required to confirm shipment', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!shippingInfo.shipmentId) {
      throw AmazonErrorUtil.createError('Shipment ID is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!shippingInfo.estimatedDeliveryDate) {
      throw AmazonErrorUtil.createError('Estimated delivery date is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!shippingInfo.items || shippingInfo.items.length === 0) {
      throw AmazonErrorUtil.createError('At least one item is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.VendorShipments.SubmitShipmentConfirmationsResponse>({
        method: 'POST',
        path: '/vendor/shipping/v1/shipmentConfirmations',
        data: {
          shipmentConfirmations: [
            {
              purchaseOrderNumber: orderNumber,
              shipmentDetails: {
                shippedDate: new Date().toISOString(),
                ...shippingInfo
              }
            }
          ]
        }
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.confirmShipment`);
    }
  }
  
  /**
   * Get detailed transaction status for an order
   * @param transactionId Transaction ID
   * @returns Transaction status
   */
  public async getTransactionStatus(transactionId: string): Promise<ApiResponse<AmazonSPApi.VendorTransactionStatus.GetTransactionResponse>> {
    if (!transactionId) {
      throw AmazonErrorUtil.createError('Transaction ID is required to get transaction status', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.VendorTransactionStatus.GetTransactionResponse>({
        method: 'GET',
        path: `/vendor/transactions/v1/transactions/${transactionId}`
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getTransactionStatus`);
    }
  }
  
  /**
   * Submit inventory update information
   * @param warehouseId Warehouse ID
   * @param items Inventory items
   * @returns Inventory update result
   */
  public async updateInventory(
    warehouseId: string,
    items: InventoryItem[]
  ): Promise<ApiResponse<AmazonSPApi.VendorInventory.SubmitInventoryUpdateResponse>> {
    if (!warehouseId) {
      throw AmazonErrorUtil.createError('Warehouse ID is required to update inventory', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!items || items.length === 0) {
      throw AmazonErrorUtil.createError('At least one inventory item is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.VendorInventory.SubmitInventoryUpdateResponse>({
        method: 'POST',
        path: '/vendor/inventory/v1/inventoryUpdates',
        data: {
          inventory: {
            sellingParty: {
              partyId: warehouseId
            },
            items: items.map(item => ({
              sellerSku: item.sellerSku,
              availableQuantity: item.availableQuantity,
              restockDate: item.restockDate
            }))
          }
        }
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.updateInventory`);
    }
  }
  
  /**
   * Get the delivery window for a specific location
   * @param shipFromLocationId Ship from location ID
   * @param shipToLocationId Ship to location ID
   * @param itemCount Number of items
   * @returns Available delivery windows
   */
  public async getDeliveryWindow(
    shipFromLocationId: string,
    shipToLocationId: string,
    itemCount: number
  ): Promise<ApiResponse<AmazonSPApi.VendorDirectFulfillmentShipping.GetPackingSlipResponse>> {
    if (!shipFromLocationId) {
      throw AmazonErrorUtil.createError('Ship from location ID is required to get delivery window', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (!shipToLocationId) {
      throw AmazonErrorUtil.createError('Ship to location ID is required to get delivery window', AmazonErrorCode.INVALID_INPUT);
    }
    
    try {
      return await this.makeRequest<AmazonSPApi.VendorDirectFulfillmentShipping.GetPackingSlipResponse>({
        method: 'GET',
        path: '/vendor/directFulfillment/shipping/v1/deliveryWindows',
        params: {
          shipFromLocationId,
          shipToLocationId,
          itemCount: itemCount.toString()
        }
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getDeliveryWindow`);
    }
  }
  
  /**
   * Get a list of all vendor orders for a specific time period
   * @param startDate Start date (ISO 8601 format)
   * @param endDate End date (ISO 8601 format)
   * @param maxResults Maximum number of results
   * @returns All vendor orders
   */
  public async getAllOrders(
    startDate: string,
    endDate: string,
    maxResults = 100
  ): Promise<AmazonSPApi.VendorOrders.Order[]> {
    const allOrders: AmazonSPApi.VendorOrders.Order[] = [];
    let nextToken: string | undefined = undefined;
    
    do {
      const response = await this.getOrders({
        purchaseDateFrom: startDate,
        purchaseDateTo: endDate,
        maxResults,
        nextToken
      });
      
      // Add orders to our collection
      if (response.data.payload && response.data.payload.orders) {
        allOrders.push(...response.data.payload.orders);
      }
      
      // Get next token for pagination
      nextToken = response.data.payload?.nextToken;
      
      // Stop if there are no more pages
    } while (nextToken);
    
    return allOrders;
  }
  
  /**
   * Quickly acknowledge multiple orders
   * @param orderNumbers List of order numbers to acknowledge
   * @param status Acknowledgement status
   * @returns Acknowledgement results
   */
  public async bulkAcknowledgeOrders(
    orderNumbers: string[],
    status: 'ACCEPTED' | 'REJECTED',
    rejectionReason?: string
  ): Promise<AcknowledgementResult[]> {
    if (!orderNumbers || orderNumbers.length === 0) {
      throw AmazonErrorUtil.createError('At least one order number is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    if (status === 'REJECTED' && !rejectionReason) {
      throw AmazonErrorUtil.createError('Rejection reason is required when status is REJECTED', AmazonErrorCode.INVALID_INPUT);
    }
    
    const results: AcknowledgementResult[] = [];
    
    // Process each order individually
    for (const orderNumber of orderNumbers) {
      try {
        await this.acknowledgeOrder(orderNumber, {
          acknowledgementDate: new Date().toISOString(),
          acknowledgementStatus: status,
          rejectionReason
        });
        
        results.push({
          orderNumber,
          success: true
        });
      } catch (error) {
        results.push({
          orderNumber,
          success: false,
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return results;
  }
}