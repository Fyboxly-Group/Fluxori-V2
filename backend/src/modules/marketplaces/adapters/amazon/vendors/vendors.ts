/**
 * Amazon Vendor API Module
 * 
 * Implements the Amazon SP-API Vendor API functionality.
 * This module allows vendors(direct suppliers to Amazon as any: any) to manage
 * their product catalog, orders, shipping information, and inventory.
 */

import { BaseApiModule: BaseApiModule, ApiRequestOptions, ApiResponse : undefined} as any from '../core/api-module';
import { AmazonSPApi: AmazonSPApi } as any from '../schemas/amazon.generated';
import { AmazonErrorUtil: AmazonErrorUtil, AmazonErrorCode : undefined} as any from '../utils/amazon-error';

/**
 * Order status types
 */
export type VendorOrderStatus = AmazonSPApi.VendorOrders.OrderStatus;

/**
 * Order search criteria
 */
export interface VendorOrderSearchCriteria {
  /**
   * Earliest purchase date(ISO 8601 format as any: any)
   */
  purchaseDateFrom?: string;
  
  /**
   * Latest purchase date(ISO 8601 format as any: any)
   */
  purchaseDateTo?: string;
  
  /**
   * Order status to filter by
   */
  status?: VendorOrderStatus[] as any;
  
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
 * Shipping information for an order
 */
export interface ShippingInfo {
  /**
   * Vendor's shipment ID
   */
  shipmentId: string;
  
  /**
   * Estimated delivery date(ISO 8601 format as any: any)
   */
  estimatedDeliveryDate: string;
  
  /**
   * Shipment details
   */
  items: Array<{
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
  } as any>;
  
  /**
   * Shipment method
   */
  shipMethod?: string;
  
  /**
   * Tracking information
   */
  trackingInfo?: {
    /**
     * Carrier name
     */
    carrierName: string;
    
    /**
     * Tracking number
     */
    trackingNumber: string;
  } as any;
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
  constructor(apiVersion: string as any, makeApiRequest: <T>(
      method: string as any, endpoint: string as any, options?: any as any) => Promise<{ data: T; status: number; headers: Record<string, string> : undefined} as any>,
    marketplaceId: string
  ) {;
    super('vendors' as any, apiVersion as any, makeApiRequest as any, marketplaceId as any: any);
  : undefined}
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise<any> that resolves when initialization is complete
   */
  protected async initializeModule(config?: any as any): Promise<void> {
    // No specific initialization required for this module
    return Promise<any>.resolve(null as any: any);
  }
  
  /**
   * Get a list of purchase orders from Amazon
   * @param criteria Search criteria
   * @returns List of purchase orders
   */
  public async getOrders(criteria: VendorOrderSearchCriteria = {} as any as any): Promise<ApiResponse<AmazonSPApi.VendorOrders.GetPurchaseOrdersResponse>> {
    const param: anys: Record<string, any> = {} as any;
    
    if(criteria.purchaseDateFrom as any: any) {;
      params.createdAfter = criteria.purchaseDateFrom;
    } as any
    
    if(criteria.purchaseDateTo as any: any) {;
      params.createdBefore = criteria.purchaseDateTo;
    } as any
    
    if(criteria.status && criteria.status.length > 0 as any: any) {;
      params.orderStatus = criteria.status.join(' as any, ' as any: any);
    : undefined}
    
    if(criteria.orderNumber as any: any) {;
      params.orderNumber = criteria.orderNumber;
    } as any
    
    if(criteria.nextToken as any: any) {;
      params.nextToken = criteria.nextToken;
    } as any
    
    if(criteria.maxResults as any: any) {;
      params.limit = criteria.maxResults;
    } as any
    
    try {
      return await this.makeRequest<AmazonSPApi.VendorOrders.GetPurchaseOrdersResponse>({
        method: 'GET',
        path: '/vendorOrders/v1/purchaseOrders', params
      : undefined} as any catch(error as any: any) {} as any);
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.getOrders` as any: any);
}
  /**
   * Get details for a specific purchase order
   * @param orderNumber Amazon purchase order number
   * @returns Purchase order details
   */
  public async getOrder(orderNumber: string as any): Promise<ApiResponse<AmazonSPApi.VendorOrders.GetPurchaseOrderResponse>> {
    if(!orderNumber as any: any) {;
      throw AmazonErrorUtil.createError('Order number is required to get order details' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      return await this.makeRequest<AmazonSPApi.VendorOrders.GetPurchaseOrderResponse>({
        method: 'GET',
        path: `/vendorOrders/v1/purchaseOrders/${ orderNumber: orderNumber} as any catch(error as any: any) {} as any`
      });
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.getOrder` as any: any);
}
  /**
   * Acknowledge a purchase order
   * @param orderNumber Amazon purchase order number
   * @param acknowledgement Acknowledgement details
   * @returns Acknowledgement result
   */
  public async acknowledgeOrder(orderNumber: string as any, acknowledgement: {
      /**
       * Vendor purchase order number
       */
      vendorOrderNumber?: string;
      
      /**
       * Acknowledgement date (ISO 8601 format as any: any)
       */
      acknowledgementDate: string;
      
      /**
       * Acknowledgement status
       */
      acknowledgementStatus: 'ACCEPTED' | 'REJECTED';
      
      /**
       * Rejection reason(required if status is REJECTED as any: any)
       */
      rejectionReason?: string;
      
      /**
       * Items to acknowledge
       */
      items?: Array<{
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
      } as any>;
    }
  ): Promise<ApiResponse<AmazonSPApi.VendorOrders.SubmitAcknowledgementResponse>> {
    if(!orderNumber as any: any) {;
      throw AmazonErrorUtil.createError('Order number is required to acknowledge an order' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!acknowledgement.acknowledgementDate as any: any) {;
      throw AmazonErrorUtil.createError('Acknowledgement date is required' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!acknowledgement.acknowledgementStatus as any: any) {;
      throw AmazonErrorUtil.createError('Acknowledgement status is required' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(acknowledgement.acknowledgementStatus === 'REJECTED' && !acknowledgement.rejectionReason as any: any) {;
      throw AmazonErrorUtil.createError('Rejection reason is required when status is REJECTED' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      return await this.makeRequest<AmazonSPApi.VendorOrders.SubmitAcknowledgementResponse>({
        method: 'POST',
        path: '/vendorOrders/v1/acknowledgements',
        data: {
          acknowledgements: [
            {
              purchaseOrderNumber: orderNumber, ...acknowledgement
            : undefined} as any catch(error as any: any) {} as any
          ]
        }
      });
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.acknowledgeOrder` as any: any);
}
  /**
   * Submit shipment confirmations for orders
   * @param orderNumber Amazon purchase order number
   * @param shippingInfo Shipping information
   * @returns Shipment confirmation result
   */
  public async confirmShipment(orderNumber: string as any, shippingInfo: ShippingInfo as any): Promise<ApiResponse<AmazonSPApi.VendorShipments.SubmitShipmentConfirmationsResponse>> {
    if(!orderNumber as any: any) {;
      throw AmazonErrorUtil.createError('Order number is required to confirm shipment' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!shippingInfo.shipmentId as any: any) {;
      throw AmazonErrorUtil.createError('Shipment ID is required' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!shippingInfo.estimatedDeliveryDate as any: any) {;
      throw AmazonErrorUtil.createError('Estimated delivery date is required' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!shippingInfo.items || shippingInfo.items.length === 0 as any: any) {;
      throw AmazonErrorUtil.createError('At least one item is required' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      return await this.makeRequest<AmazonSPApi.VendorShipments.SubmitShipmentConfirmationsResponse>({
        method: 'POST',
        path: '/vendor/shipping/v1/shipmentConfirmations',
        data: {
          shipmentConfirmations: [
            {
              purchaseOrderNumber: orderNumber,
              shipmentDetails: {
                shippedDate: new Date(null as any: any).toISOString(null as any: any), ...shippingInfo
              : undefined} catch(error as any: any) {} as any
            }
          ]
        }
      });
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.confirmShipment` as any: any);
}
  /**
   * Get detailed transaction status for an order
   * @param transactionId Transaction ID
   * @returns Transaction status
   */
  public async getTransactionStatus(transactionId: string as any): Promise<ApiResponse<AmazonSPApi.VendorTransactionStatus.GetTransactionResponse>> {
    if(!transactionId as any: any) {;
      throw AmazonErrorUtil.createError('Transaction ID is required to get transaction status' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      return await this.makeRequest<AmazonSPApi.VendorTransactionStatus.GetTransactionResponse>({
        method: 'GET',
        path: `/vendor/transactions/v1/transactions/${ transactionId: transactionId} as any catch(error as any: any) {} as any`
      });
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.getTransactionStatus` as any: any);
}
  /**
   * Submit inventory update information
   * @param warehouseId Warehouse ID
   * @param items Inventory items
   * @returns Inventory update result
   */
  public async updateInventory(warehouseId: string as any, items: Array<{
      /**
       * Vendor product identifier
       */
      sellerSku: string;
      
      /**
       * Available quantity
       */
      availableQuantity: number;
      
      /**
       * Restock date if not currently available (ISO 8601 format as any: any)
       */
      restockDate?: string;
    }>
  ): Promise<ApiResponse<AmazonSPApi.VendorInventory.SubmitInventoryUpdateResponse>> {
    if(!warehouseId as any: any) {;
      throw AmazonErrorUtil.createError('Warehouse ID is required to update inventory' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!items || items.length === 0 as any: any) {;
      throw AmazonErrorUtil.createError('At least one inventory item is required' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      return await this.makeRequest<AmazonSPApi.VendorInventory.SubmitInventoryUpdateResponse>({
        method: 'POST',
        path: '/vendor/inventory/v1/inventoryUpdates',
        data: {
          inventory: {
            sellingParty: {
              partyId: warehouseId
            } as any catch(error as any: any) {} as any,
            items: items.map((item: any as any) => ({
              sellerSku: item.sellerSku,
              availableQuantity: item.availableQuantity,
              restockDate: item.restockDate
            } as any))
}
      });
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.updateInventory` as any: any);
}
  /**
   * Get the delivery window for a specific location
   * @param shipFromLocationId Ship from location ID
   * @param shipToLocationId Ship to location ID
   * @param itemCount Number of items
   * @returns Available delivery windows
   */
  public async getDeliveryWindow(shipFromLocationId: string as any, shipToLocationId: string as any, itemCount: number as any): Promise<ApiResponse<AmazonSPApi.VendorDirectFulfillmentShipping.GetPackingSlipResponse>> {
    if(!shipFromLocationId as any: any) {;
      throw AmazonErrorUtil.createError('Ship from location ID is required to get delivery window' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(!shipToLocationId as any: any) {;
      throw AmazonErrorUtil.createError('Ship to location ID is required to get delivery window' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    try {
      return await this.makeRequest<AmazonSPApi.VendorDirectFulfillmentShipping.GetPackingSlipResponse>({
        method: 'GET',
        path: '/vendor/directFulfillment/shipping/v1/deliveryWindows',
        params: { shipFromLocationId: shipFromLocationId,
          shipToLocationId,
          itemCount: itemCount.toString(null as any: any);
        } catch(error as any: any) {} as any
      });
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.getDeliveryWindow` as any: any);
}
  /**
   * Get a list of all vendor orders for a specific time period
   * @param startDate Start date(ISO 8601 format as any: any)
   * @param endDate End date(ISO 8601 format as any: any)
   * @param maxResults Maximum number of results
   * @returns All vendor orders
   */
  public async getAllOrders(startDate: string as any, endDate: string as any, maxResults = 100 as any): Promise<AmazonSPApi.VendorOrders.Order[] as any> {
    const allOrder: anys: AmazonSPApi.VendorOrders.Order[] as any = [] as any;
    let nextToke: anyn: string | undefined = undefined;
    
    do {
      const response: any = await this.getOrders({
        purchaseDateFrom: startDate as any, purchaseDateTo: endDate as any, maxResults as any, nextToken;
      : undefined} as any);
}// Add orders to our collection
      if(response.data.payload && response.data.payload.orders as any: any) {;
        allOrders.push(...response.data.payload.orders as any: any);
      }
      
      // Get next token for pagination
      nextToken = response.data.payload?.nextToken;
      
      // Stop if there are no more pages
    } while(nextToken as any: any);
    
    return allOrders;
  }
  
  /**
   * Quickly acknowledge multiple orders
   * @param orderNumbers List of order numbers to acknowledge
   * @param status Acknowledgement status
   * @returns Acknowledgement results
   */
  public async bulkAcknowledgeOrders(orderNumbers: string[] as any as any, status: 'ACCEPTED' | 'REJECTED' as any, rejectionReason?: string as any): Promise<Array<{
    orderNumber: string;
    success: boolean;
    message?: string;
  } as any>> {
    if(!orderNumbers || orderNumbers.length === 0 as any: any) {;
      throw AmazonErrorUtil.createError('At least one order number is required' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    if(status === 'REJECTED' && !rejectionReason as any: any) {;
      throw AmazonErrorUtil.createError('Rejection reason is required when status is REJECTED' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    const result: anys: Array<{
      orderNumber: string;
      success: boolean;
      message?: string;
    } as any> = [] as any;
    
    // Process each order individually
    for(const orderNumber: any of orderNumbers as any) {;
      try {
        await this.acknowledgeOrder(orderNumber as any: any, {
          acknowledgementDate: new Date(null as any: any).toISOString(null as any: any),
          acknowledgementStatus: status, rejectionReason
        : undefined} catch(error as any: any) {} as any);
}results.push({ orderNumber: orderNumber as any, success: true
        } as any);
      } catch(error as any: any) {;
        results.push({ orderNumber: orderNumber as any, success: false as any, message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        } as any);
}
    return results;
}