/**
 * Amazon Selling Partner API Type Definitions
 * 
 * This file contains TypeScript interface and type definitions for the Amazon SP-API.
 * It provides type safety for API operations across different SP-API sections.
 */

export namespace AmazonSPApi {
  /**
   * Common types used across multiple API sections
   */
  export namespace Common {
    /**
     * Common error type returned by Amazon SP-API
     */
    export interface Error {
      /**
       * Error code
       */
      code: string;
      
      /**
       * Error message
       */
      message: string;
      
      /**
       * Additional error details
       */
      details?: string;
    }
    
    /**
     * Monetary amount with currency
     */
    export interface Money {
      /**
       * Monetary amount
       */
      amount: number;
      
      /**
       * Currency code (ISO 4217)
       */
      currencyCode: string;
    }
    
    /**
     * Address information
     */
    export interface Address {
      /**
       * Name
       */
      name: string;
      
      /**
       * Address line 1
       */
      addressLine1: string;
      
      /**
       * Address line 2
       */
      addressLine2?: string;
      
      /**
       * Address line 3
       */
      addressLine3?: string;
      
      /**
       * City
       */
      city: string;
      
      /**
       * County
       */
      county?: string;
      
      /**
       * District
       */
      district?: string;
      
      /**
       * State or region
       */
      stateOrRegion?: string;
      
      /**
       * Postal code
       */
      postalCode?: string;
      
      /**
       * Country code (ISO 3166-1 alpha-2)
       */
      countryCode: string;
      
      /**
       * Phone number
       */
      phone?: string;
    }
    
    /**
     * Weight with unit
     */
    export interface Weight {
      /**
       * Weight value
       */
      value: number;
      
      /**
       * Weight unit
       */
      unit: 'g' | 'kg' | 'oz' | 'lb';
    }
    
    /**
     * Dimensions with unit
     */
    export interface Dimensions {
      /**
       * Length
       */
      length: number;
      
      /**
       * Width
       */
      width: number;
      
      /**
       * Height
       */
      height: number;
      
      /**
       * Unit of measurement
       */
      unit: 'cm' | 'in';
    }
  }

  /**
   * Catalog API types
   */
  export namespace Catalog {
    /**
     * Catalog item
     */
    export interface Item {
      /**
       * Amazon Standard Identification Number
       */
      asin: string;
      
      /**
       * Product attributes
       */
      attributes?: Record<string, any>;
      
      /**
       * Item identifiers
       */
      identifiers?: {
        /**
         * Marketplace ASIN
         */
        marketplaceAsin?: {
          /**
           * Marketplace ID
           */
          marketplaceId: string;
          
          /**
           * ASIN
           */
          asin: string;
        };
        
        /**
         * SKU identifiers
         */
        skuIdentifiers?: Array<{
          /**
           * Marketplace ID
           */
          marketplaceId: string;
          
          /**
           * Seller ID
           */
          sellerId: string;
          
          /**
           * Seller SKU
           */
          sellerSku: string;
        }>;
      };
      
      /**
       * Product images
       */
      images?: Array<{
        /**
         * Marketplace ID
         */
        marketplaceId: string;
        
        /**
         * Image URLs
         */
        images: Array<{
          /**
           * Image URL
           */
          link: string;
          
          /**
           * Image height
           */
          height: number;
          
          /**
           * Image width
           */
          width: number;
        }>;
      }>;
      
      /**
       * Product classifications
       */
      productTypes?: Array<{
        /**
         * Marketplace ID
         */
        marketplaceId: string;
        
        /**
         * Product type
         */
        productType: string;
      }>;
      
      /**
       * Sales rank information
       */
      salesRanks?: Array<{
        /**
         * Marketplace ID
         */
        marketplaceId: string;
        
        /**
         * Classification ID
         */
        classificationId: string;
        
        /**
         * Title of the classification
         */
        title: string;
        
        /**
         * Rank
         */
        ranks: Array<{
          /**
           * Title of the rank
           */
          title: string;
          
          /**
           * Rank value
           */
          value: number;
        }>;
      }>;
      
      /**
       * Product summary information
       */
      summaries?: Array<{
        /**
         * Marketplace ID
         */
        marketplaceId: string;
        
        /**
         * Product title
         */
        title?: string;
        
        /**
         * Brand name
         */
        brand?: string;
        
        /**
         * Whether the product is browsable
         */
        browsable?: boolean;
        
        /**
         * Product description
         */
        description?: string;
        
        /**
         * Manufacturer
         */
        manufacturer?: string;
        
        /**
         * Manufacturer part number
         */
        manufacturerPartNumber?: string;
        
        /**
         * Model number
         */
        modelNumber?: string;
        
        /**
         * Color
         */
        color?: string;
        
        /**
         * Size
         */
        size?: string;
        
        /**
         * Item dimensions
         */
        itemDimensions?: Common.Dimensions;
        
        /**
         * Item weight
         */
        itemWeight?: Common.Weight;
        
        /**
         * Package dimensions
         */
        packageDimensions?: Common.Dimensions;
        
        /**
         * Package weight
         */
        packageWeight?: Common.Weight;
      }>;
      
      /**
       * Variation information
       */
      variations?: {
        /**
         * Parent ASIN
         */
        parentAsin?: string;
        
        /**
         * Variation theme
         */
        variationTheme?: string;
        
        /**
         * Variation dimensions
         */
        variationDimensions?: string[];
        
        /**
         * Variant relationships
         */
        variants?: Record<string, {
          /**
           * ASIN
           */
          asin: string;
          
          /**
           * Variation attributes
           */
          attributes?: Record<string, string>;
        }>;
      };
    }
    
    /**
     * Search result
     */
    export interface SearchResult {
      /**
       * Number of results
       */
      numberOfResults: number;
      
      /**
       * Pagination token
       */
      nextToken?: string;
      
      /**
       * Search items
       */
      items: Item[];
    }
  }

  /**
   * Listings API types
   */
  export namespace Listings {
    /**
     * Listing status
     */
    export type ListingStatus = 
      | 'ACTIVE' 
      | 'INACTIVE' 
      | 'INCOMPLETE' 
      | 'REMOVED' 
      | 'SUPPRESSED' 
      | 'ERROR';
    
    /**
     * Listing issue
     */
    export interface ListingIssue {
      /**
       * Issue code
       */
      code: string;
      
      /**
       * Issue message
       */
      message: string;
      
      /**
       * Issue severity
       */
      severity: 'ERROR' | 'WARNING' | 'INFO';
    }
    
    /**
     * Listing
     */
    export interface Listing {
      /**
       * Seller SKU
       */
      sku: string;
      
      /**
       * Listing status
       */
      status: ListingStatus;
      
      /**
       * Listing issues
       */
      issues?: ListingIssue[];
      
      /**
       * Product identifiers
       */
      identifiers?: {
        /**
         * Marketplace ASIN
         */
        marketplaceASIN?: {
          /**
           * Marketplace ID
           */
          marketplaceId: string;
          
          /**
           * ASIN
           */
          asin: string;
        };
      };
      
      /**
       * Full price details
       */
      pricing?: Record<string, {
        /**
         * Marketplace ID
         */
        marketplaceId: string;
        
        /**
         * List price
         */
        listingPrice?: Common.Money;
        
        /**
         * Shipping price
         */
        shippingPrice?: Common.Money;
        
        /**
         * Business price
         */
        businessPrice?: Common.Money;
        
        /**
         * Quantity price tiers
         */
        quantityPriceTiers?: Array<{
          /**
           * Quantity tier
           */
          quantityTier: number;
          
          /**
           * Price at this tier
           */
          price: Common.Money;
        }>;
      }>;
    }
    
    /**
     * Get listings response
     */
    export interface GetListingsResponse {
      /**
       * Next token for pagination
       */
      nextToken?: string;
      
      /**
       * Listings
       */
      listings: Listing[];
    }
  }
  
  /**
   * Orders API types
   */
  export namespace Orders {
    /**
     * Order status
     */
    export type OrderStatus = 
      | 'PendingAvailability' 
      | 'Pending' 
      | 'Unshipped' 
      | 'PartiallyShipped' 
      | 'Shipped' 
      | 'Canceled' 
      | 'Unfulfillable';
    
    /**
     * Order item
     */
    export interface OrderItem {
      /**
       * ASIN
       */
      asin: string;
      
      /**
       * Seller SKU
       */
      sellerSku?: string;
      
      /**
       * Order item ID
       */
      orderItemId: string;
      
      /**
       * Title
       */
      title?: string;
      
      /**
       * Quantity ordered
       */
      quantityOrdered: number;
      
      /**
       * Quantity shipped
       */
      quantityShipped: number;
      
      /**
       * Item price
       */
      itemPrice?: Common.Money;
      
      /**
       * Shipping price
       */
      shippingPrice?: Common.Money;
      
      /**
       * Tax collection model
       */
      taxCollection?: {
        /**
         * Responsible party for tax collection
         */
        model: 'MarketplaceFacilitator' | 'Standard';
        
        /**
         * Responsible party for tax collection
         */
        responsibleParty: 'Amazon Services, Inc.' | 'Seller';
      };
    }
    
    /**
     * Order
     */
    export interface Order {
      /**
       * Amazon order ID
       */
      amazonOrderId: string;
      
      /**
       * Purchase date
       */
      purchaseDate: string;
      
      /**
       * Last update date
       */
      lastUpdateDate: string;
      
      /**
       * Order status
       */
      orderStatus: OrderStatus;
      
      /**
       * Fulfillment channel
       */
      fulfillmentChannel?: 'AFN' | 'MFN';
      
      /**
       * Sales channel
       */
      salesChannel?: string;
      
      /**
       * Order channel
       */
      orderChannel?: string;
      
      /**
       * Ship service level
       */
      shipServiceLevel?: string;
      
      /**
       * Order total
       */
      orderTotal?: Common.Money;
      
      /**
       * Number of items shipped
       */
      numberOfItemsShipped?: number;
      
      /**
       * Number of items unshipped
       */
      numberOfItemsUnshipped?: number;
      
      /**
       * Payment method
       */
      paymentMethod?: string;
      
      /**
       * Payment method details
       */
      paymentMethodDetails?: string[];
      
      /**
       * Marketplace ID
       */
      marketplaceId: string;
      
      /**
       * Shipping address
       */
      shippingAddress?: Common.Address;
      
      /**
       * Buyer info
       */
      buyerInfo?: {
        /**
         * Buyer email
         */
        buyerEmail?: string;
        
        /**
         * Buyer name
         */
        buyerName?: string;
        
        /**
         * Buyer country
         */
        buyerCountry?: string;
        
        /**
         * Tax information
         */
        taxInfo?: {
          /**
           * Tax classifications
           */
          taxClassifications?: Array<{
            /**
             * Classification name
             */
            name: string;
            
            /**
             * Classification value
             */
            value: string;
          }>;
        };
      };
      
      /**
       * Automated shipping settings
       */
      automatedShippingSettings?: {
        /**
         * Has automated shipping settings
         */
        hasAutomatedShippingSettings: boolean;
        
        /**
         * Automated carrier
         */
        automatedCarrier?: string;
        
        /**
         * Automated ship method
         */
        automatedShipMethod?: string;
      };
      
      /**
       * Order type
       */
      orderType?: 'StandardOrder' | 'LongLeadTimeOrder' | 'Preorder' | 'BackOrder' | 'SourcingOnDemandOrder';
      
      /**
       * Earliest ship date
       */
      earliestShipDate?: string;
      
      /**
       * Latest ship date
       */
      latestShipDate?: string;
      
      /**
       * Earliest delivery date
       */
      earliestDeliveryDate?: string;
      
      /**
       * Latest delivery date
       */
      latestDeliveryDate?: string;
      
      /**
       * Promise response deadline
       */
      promiseResponseDeadline?: string;
      
      /**
       * Delivery preference
       */
      deliveryPreferences?: {
        /**
         * Preferred delivery type
         */
        preferredDeliveryType?: 'SCHEDULED';
        
        /**
         * Delivery window
         */
        deliveryWindow?: {
          /**
           * Start date and time
           */
          startDate: string;
          
          /**
           * End date and time
           */
          endDate: string;
        };
      };
    }
    
    /**
     * Get orders response
     */
    export interface GetOrdersResponse {
      /**
       * Pagination token
       */
      nextToken?: string;
      
      /**
       * Last updated before
       */
      lastUpdatedBefore?: string;
      
      /**
       * Created before
       */
      createdBefore?: string;
      
      /**
       * Orders
       */
      orders: Order[];
    }
    
    /**
     * Get order items response
     */
    export interface GetOrderItemsResponse {
      /**
       * Pagination token
       */
      nextToken?: string;
      
      /**
       * Amazon order ID
       */
      amazonOrderId: string;
      
      /**
       * Order items
       */
      orderItems: OrderItem[];
    }
  }
  
  /**
   * Data Kiosk API types
   */
  export namespace DataKiosk {
    /**
     * Query status
     */
    export type QueryStatus = 
      | 'PENDING' 
      | 'PROCESSING' 
      | 'COMPLETED' 
      | 'CANCELLED' 
      | 'FAILED';
    
    /**
     * Document type
     */
    export type DocumentType = 
      | 'CSV' 
      | 'JSON' 
      | 'PDF' 
      | 'XLSX';
    
    /**
     * Query
     */
    export interface Query {
      /**
       * Query ID
       */
      queryId: string;
      
      /**
       * Query status
       */
      status: QueryStatus;
      
      /**
       * Result ID
       */
      resultId?: string;
      
      /**
       * Document type
       */
      documentType?: DocumentType;
    }
    
    /**
     * Document
     */
    export interface Document {
      /**
       * Document ID
       */
      documentId: string;
      
      /**
       * Document type
       */
      documentType: DocumentType;
      
      /**
       * Download URL
       */
      downloadUrl?: string;
      
      /**
       * Document metadata
       */
      metadata?: Record<string, any>;
    }
    
    /**
     * Create query response
     */
    export interface CreateQueryResponse {
      /**
       * Query ID
       */
      queryId: string;
      
      /**
       * Status
       */
      status: QueryStatus;
    }
    
    /**
     * Get query response
     */
    export interface GetQueryResponse {
      /**
       * Query ID
       */
      queryId: string;
      
      /**
       * Status
       */
      status: QueryStatus;
      
      /**
       * Result ID
       */
      resultId?: string;
      
      /**
       * Error code
       */
      errorCode?: string;
      
      /**
       * Error message
       */
      errorMessage?: string;
    }
    
    /**
     * Get document response
     */
    export interface GetDocumentResponse {
      /**
       * Document
       */
      document: Document;
    }
  }
  
  /**
   * Reports API types
   */
  export namespace Reports {
    /**
     * Processing status
     */
    export type ProcessingStatus = 
      | 'IN_QUEUE' 
      | 'IN_PROGRESS' 
      | 'DONE' 
      | 'FATAL' 
      | 'CANCELLED';
    
    /**
     * Compression algorithm
     */
    export type CompressionAlgorithm = 
      | 'GZIP' 
      | 'ZIP';
    
    /**
     * Report
     */
    export interface Report {
      /**
       * Report ID
       */
      reportId: string;
      
      /**
       * Report type
       */
      reportType: string;
      
      /**
       * Processing status
       */
      processingStatus: ProcessingStatus;
      
      /**
       * Creation date
       */
      createdTime: string;
      
      /**
       * Processing start date
       */
      processingStartTime?: string;
      
      /**
       * Processing end date
       */
      processingEndTime?: string;
      
      /**
       * Document ID
       */
      reportDocumentId?: string;
      
      /**
       * Data start time
       */
      dataStartTime?: string;
      
      /**
       * Data end time
       */
      dataEndTime?: string;
      
      /**
       * Marketplace IDs
       */
      marketplaceIds?: string[];
    }
    
    /**
     * Report document
     */
    export interface ReportDocument {
      /**
       * Report document ID
       */
      reportDocumentId: string;
      
      /**
       * Compression algorithm
       */
      compressionAlgorithm?: CompressionAlgorithm;
      
      /**
       * Download URL
       */
      url: string;
    }
  }
  
  /**
   * FBA Inventory API types
   */
  export namespace FBAInventory {
    /**
     * Granularity type
     */
    export type GranularityType = 
      | 'Marketplace' 
      | 'InventoryClassificationShipToCountry';
    
    /**
     * Details per inventory level
     */
    export interface InventoryDetails {
      /**
       * Fulfillable quantity
       */
      fulfillableQuantity?: number;
      
      /**
       * Inbound working quantity
       */
      inboundWorkingQuantity?: number;
      
      /**
       * Inbound shipped quantity
       */
      inboundShippedQuantity?: number;
      
      /**
       * Inbound receiving quantity
       */
      inboundReceivingQuantity?: number;
      
      /**
       * Reserved quantity
       */
      reservedQuantity?: number;
      
      /**
       * Research quantity
       */
      researchingQuantity?: number;
      
      /**
       * Unfulfillable quantity
       */
      unfulfillableQuantity?: number;
    }
    
    /**
     * Inventory summary
     */
    export interface InventorySummary {
      /**
       * ASIN
       */
      asin?: string;
      
      /**
       * Seller SKU
       */
      sellerSku?: string;
      
      /**
       * FNSKU
       */
      fnSku?: string;
      
      /**
       * Product name
       */
      productName?: string;
      
      /**
       * Condition
       */
      condition?: string;
      
      /**
       * Inventory details
       */
      inventoryDetails?: InventoryDetails;
      
      /**
       * Last updated date
       */
      lastUpdatedTime?: string;
      
      /**
       * Product details
       */
      productDetail?: Record<string, string>;
      
      /**
       * Total quantity
       */
      totalQuantity?: number;
    }
    
    /**
     * Get inventory summaries response
     */
    export interface GetInventorySummariesResponse {
      /**
       * Granularity type
       */
      granularity: {
        /**
         * Granularity type
         */
        granularityType: GranularityType;
        
        /**
         * Granularity ID
         */
        granularityId?: string;
      };
      
      /**
       * Inventory summaries
       */
      inventorySummaries: InventorySummary[];
      
      /**
       * Next token
       */
      nextToken?: string;
    }
  }
  
  /**
   * Finances API types
   */
  export namespace Finances {
    /**
     * Financial event group status
     */
    export type FinancialEventGroupStatus = 'Open' | 'Closed';
    
    /**
     * Financial transaction type
     */
    export type FinancialTransactionType = 
      | 'Shipment' 
      | 'Refund' 
      | 'GuaranteeClaim' 
      | 'Chargeback' 
      | 'ServiceFee' 
      | 'AdjustmentItem' 
      | 'Commission';
    
    /**
     * Money type
     */
    export interface Money {
      /**
       * Currency amount
       */
      amount?: string;
      
      /**
       * Currency code
       */
      currencyCode?: string;
    }
    
    /**
     * Fee component
     */
    export interface Fee {
      /**
       * Fee type
       */
      feeType: string;
      
      /**
       * Fee amount
       */
      feeAmount: Money;
    }
    
    /**
     * Financial event group
     */
    export interface FinancialEventGroup {
      /**
       * Financial event group ID
       */
      financialEventGroupId?: string;
      
      /**
       * Processing status
       */
      processingStatus?: FinancialEventGroupStatus;
      
      /**
       * Fund transfer status
       */
      fundTransferStatus?: string;
      
      /**
       * Original total
       */
      originalTotal?: Money;
      
      /**
       * Converted total
       */
      convertedTotal?: Money;
      
      /**
       * Fund transfer date
       */
      fundTransferDate?: string;
      
      /**
       * Trace ID
       */
      traceId?: string;
      
      /**
       * Account tail
       */
      accountTail?: string;
      
      /**
       * Beginning balance
       */
      beginningBalance?: Money;
      
      /**
       * Financial event group start
       */
      financialEventGroupStart?: string;
      
      /**
       * Financial event group end
       */
      financialEventGroupEnd?: string;
    }
    
    /**
     * Fee list
     */
    export type FeeList = Fee[];
    
    /**
     * Charge component
     */
    export interface ChargeComponent {
      /**
       * Charge type
       */
      chargeType?: string;
      
      /**
       * Charge amount
       */
      chargeAmount?: Money;
    }
    
    /**
     * Charge list
     */
    export type ChargeList = ChargeComponent[];
    
    /**
     * Shipment event
     */
    export interface ShipmentEvent {
      /**
       * Amazon order ID
       */
      amazonOrderId?: string;
      
      /**
       * Seller order ID
       */
      sellerOrderId?: string;
      
      /**
       * Marketplace name
       */
      marketplaceName?: string;
      
      /**
       * Order charge list
       */
      orderChargeList?: ChargeList;
      
      /**
       * Order charge adjustment list
       */
      orderChargeAdjustmentList?: ChargeList;
      
      /**
       * Shipment fee list
       */
      shipmentFeeList?: FeeList;
      
      /**
       * Shipment fee adjustment list
       */
      shipmentFeeAdjustmentList?: FeeList;
      
      /**
       * Order fee list
       */
      orderFeeList?: FeeList;
      
      /**
       * Order fee adjustment list
       */
      orderFeeAdjustmentList?: FeeList;
      
      /**
       * Direct payment list
       */
      directPaymentList?: any[];
      
      /**
       * Posted date
       */
      postedDate?: string;
      
      /**
       * Shipment item list
       */
      shipmentItemList?: any[];
      
      /**
       * Shipment item adjustment list
       */
      shipmentItemAdjustmentList?: any[];
    }
    
    /**
     * Refund event
     */
    export interface RefundEvent {
      /**
       * Amazon order ID
       */
      amazonOrderId?: string;
      
      /**
       * Seller order ID
       */
      sellerOrderId?: string;
      
      /**
       * Marketplace name
       */
      marketplaceName?: string;
      
      /**
       * Order charge list
       */
      orderChargeList?: ChargeList;
      
      /**
       * Order charge adjustment list
       */
      orderChargeAdjustmentList?: ChargeList;
      
      /**
       * Shipment fee list
       */
      shipmentFeeList?: FeeList;
      
      /**
       * Shipment fee adjustment list
       */
      shipmentFeeAdjustmentList?: FeeList;
      
      /**
       * Order fee list
       */
      orderFeeList?: FeeList;
      
      /**
       * Order fee adjustment list
       */
      orderFeeAdjustmentList?: FeeList;
      
      /**
       * Posted date
       */
      postedDate?: string;
      
      /**
       * Shipment item list
       */
      shipmentItemList?: any[];
      
      /**
       * Shipment item adjustment list
       */
      shipmentItemAdjustmentList?: any[];
    }
    
    /**
     * Financial events
     */
    export interface FinancialEvents {
      /**
       * Shipment event list
       */
      shipmentEventList?: ShipmentEvent[];
      
      /**
       * Refund event list
       */
      refundEventList?: RefundEvent[];
      
      /**
       * Guarantee claim event list
       */
      guaranteeClaimEventList?: any[];
      
      /**
       * Chargeback event list
       */
      chargebackEventList?: any[];
      
      /**
       * Service fee event list
       */
      serviceFeeEventList?: any[];
      
      /**
       * Adjustment event list
       */
      adjustmentEventList?: any[];
      
      /**
       * Performance bond refund event list
       */
      performanceBondRefundEventList?: any[];
    }
  }
  
  /**
   * VendorOrders API types
   */
  export namespace VendorOrders {
    /**
     * Order status
     */
    export type OrderStatus = 
      | 'NEW' 
      | 'SHIPPED' 
      | 'ACCEPTED' 
      | 'CANCELLED';
    
    /**
     * Party identification
     */
    export interface PartyIdentification {
      /**
       * Party ID
       */
      partyId: string;
      
      /**
       * Address
       */
      address?: Common.Address;
      
      /**
       * Tax registration details
       */
      taxInfo?: any;
    }
    
    /**
     * Order item
     */
    export interface OrderItem {
      /**
       * Item sequence number
       */
      itemSequenceNumber: string;
      
      /**
       * Amazon product identifier
       */
      amazonProductIdentifier?: string;
      
      /**
       * Vendor product identifier
       */
      vendorProductIdentifier?: string;
      
      /**
       * Ordered quantity
       */
      orderedQuantity: {
        /**
         * Quantity
         */
        amount: number;
        
        /**
         * Unit of measure
         */
        unitOfMeasure: string;
      };
      
      /**
       * Is backordered
       */
      isBackOrderAllowed?: boolean;
      
      /**
       * Net cost
       */
      netCost?: Common.Money;
      
      /**
       * List price
       */
      listPrice?: Common.Money;
    }
    
    /**
     * Order
     */
    export interface Order {
      /**
       * Purchase order number
       */
      purchaseOrderNumber: string;
      
      /**
       * Order details
       */
      orderDetails?: {
        /**
         * Purchase order date
         */
        purchaseOrderDate: string;
        
        /**
         * Purchase order state
         */
        purchaseOrderState: OrderStatus;
        
        /**
         * Order items
         */
        orderItems: OrderItem[];
      };
      
      /**
       * Selling party
       */
      sellingParty?: PartyIdentification;
      
      /**
       * Ship to party
       */
      shipToParty?: PartyIdentification;
      
      /**
       * Bill to party
       */
      billToParty?: PartyIdentification;
    }
    
    /**
     * Get orders response
     */
    export interface GetOrdersResponse {
      /**
       * Pagination token
       */
      nextToken?: string;
      
      /**
       * Orders
       */
      orders: Order[];
    }
  }
  
  /**
   * FBA Inbound API types
   */
  export namespace FBAInbound {
    /**
     * Shipment status
     */
    export type ShipmentStatus = 
      | 'WORKING' 
      | 'SHIPPED' 
      | 'RECEIVING' 
      | 'CANCELLED' 
      | 'CLOSED' 
      | 'ERROR' 
      | 'DELETED';
    
    /**
     * Label prep preference
     */
    export type LabelPrepPreference = 
      | 'SELLER_LABEL' 
      | 'AMAZON_LABEL';
    
    /**
     * Prep instruction
     */
    export type PrepInstruction = 
      | 'POLYBAGGING' 
      | 'BUBBLE_WRAPPING' 
      | 'TAPING' 
      | 'BLACKSHRINKWRAPPING' 
      | 'LABELING' 
      | 'HANGGARMENT';
    
    /**
     * Prep type
     */
    export type PrepType = 
      | 'NO_PREP' 
      | 'LABELING' 
      | 'POLYBAGGING' 
      | 'BUBBLE_WRAPPING' 
      | 'TAPING' 
      | 'BLACKSHRINKWRAPPING' 
      | 'HANGGARMENT' 
      | 'REMOVE_SHARP_EDGES';
    
    /**
     * Prep details
     */
    export interface PrepDetails {
      /**
       * Prep instruction
       */
      prepInstruction?: PrepInstruction;
      
      /**
       * Prep owner
       */
      prepOwner?: 'AMAZON' | 'SELLER';
    }
    
    /**
     * Inbound shipment plan item
     */
    export interface InboundShipmentPlanItem {
      /**
       * Seller SKU
       */
      sellerSku: string;
      
      /**
       * Fulfillment network SKU
       */
      fnSku?: string;
      
      /**
       * ASIN
       */
      asin?: string;
      
      /**
       * Quantity
       */
      quantity: number;
      
      /**
       * Prep details list
       */
      prepDetailsList?: PrepDetails[];
    }
    
    /**
     * Inbound shipment plan
     */
    export interface InboundShipmentPlan {
      /**
       * Shipment ID
       */
      shipmentId?: string;
      
      /**
       * Destination fulfillment center ID
       */
      destinationFulfillmentCenterId?: string;
      
      /**
       * Ship to address
       */
      shipToAddress?: Common.Address;
      
      /**
       * Label prep type
       */
      labelPrepType?: 'NO_LABEL' | 'SELLER_LABEL' | 'AMAZON_LABEL';
      
      /**
       * Items
       */
      items?: InboundShipmentPlanItem[];
      
      /**
       * Estimated fees
       */
      estimatedFees?: any[];
    }
    
    /**
     * Inbound shipment item
     */
    export interface InboundShipmentItem {
      /**
       * Shipment ID
       */
      shipmentId?: string;
      
      /**
       * Seller SKU
       */
      sellerSku: string;
      
      /**
       * Fulfillment network SKU
       */
      fulfillmentNetworkSku?: string;
      
      /**
       * Quantity shipped
       */
      quantityShipped: number;
      
      /**
       * Quantity received
       */
      quantityReceived?: number;
      
      /**
       * Prep details list
       */
      prepDetailsList?: PrepDetails[];
    }
    
    /**
     * Shipment
     */
    export interface Shipment {
      /**
       * Shipment ID
       */
      shipmentId: string;
      
      /**
       * Amazon reference ID
       */
      amazonReferenceId?: string;
      
      /**
       * Shipment name
       */
      shipmentName?: string;
      
      /**
       * Ship from address
       */
      shipFromAddress?: Common.Address;
      
      /**
       * Destination fulfillment center ID
       */
      destinationFulfillmentCenterId?: string;
      
      /**
       * Shipment status
       */
      shipmentStatus?: ShipmentStatus;
      
      /**
       * Label prep preference
       */
      labelPrepPreference?: LabelPrepPreference;
      
      /**
       * Are cases required
       */
      areCasesRequired?: boolean;
      
      /**
       * Confirmed need by date
       */
      confirmedNeedByDate?: string;
      
      /**
       * Box contents source
       */
      boxContentsSource?: 'NONE' | 'FEED' | '2D_BARCODE';
      
      /**
       * Estimated box content fee
       */
      estimatedBoxContentsFee?: any;
      
      /**
       * Items
       */
      inboundShipmentItems?: InboundShipmentItem[];
    }
    
    /**
     * Create inbound shipment plan response
     */
    export interface CreateInboundShipmentPlanResponse {
      /**
       * Inbound shipment plans
       */
      inboundShipmentPlans: InboundShipmentPlan[];
    }
    
    /**
     * Get shipments response
     */
    export interface GetShipmentsResponse {
      /**
       * Pagination token
       */
      nextToken?: string;
      
      /**
       * Shipments
       */
      shipments: Shipment[];
    }
    
    /**
     * Get shipment items response
     */
    export interface GetShipmentItemsResponse {
      /**
       * Pagination token
       */
      nextToken?: string;
      
      /**
       * Items
       */
      itemData: InboundShipmentItem[];
    }
  }
  
  /**
   * WarehouseAndDistribution API types
   */
  export namespace WarehouseAndDistribution {
    /**
     * Location type
     */
    export type LocationType = 'VENDOR_WAREHOUSE' | 'SELLER_WAREHOUSE';
    
    /**
     * Period granularity
     */
    export type PeriodGranularity = 'MONTH' | 'WEEK' | 'DAY';
    
    /**
     * Shipment status
     */
    export type ShipmentStatus = 'WORKING' | 'READY_TO_SHIP' | 'SHIPPED' | 'RECEIVING' | 'CHECKED_IN' | 'CANCELED';
    
    /**
     * Sort field
     */
    export type SortField = 'CREATED_DATE' | 'ESTIMATED_RECEIVING_DATE';
    
    /**
     * Sort order
     */
    export type SortOrder = 'ASC' | 'DESC';
    
    /**
     * Seller location
     */
    export interface SellerLocation {
      /**
       * Location ID
       */
      locationId: string;
      
      /**
       * Location name
       */
      locationName: string;
      
      /**
       * Location type
       */
      locationType: LocationType;
      
      /**
       * Address
       */
      address: Common.Address;
    }
    
    /**
     * Facility
     */
    export interface Facility {
      /**
       * Facility ID
       */
      facilityId: string;
      
      /**
       * Facility name
       */
      facilityName: string;
      
      /**
       * Address
       */
      address: Common.Address;
      
      /**
       * Features
       */
      features: string[];
    }
    
    /**
     * Program capacity period
     */
    export interface ProgramCapacityPeriod {
      /**
       * Start time
       */
      startTime: string;
      
      /**
       * End time
       */
      endTime: string;
      
      /**
       * Total capacity
       */
      totalCapacity: number;
      
      /**
       * Available capacity
       */
      availableCapacity: number;
      
      /**
       * Utilization
       */
      utilization: number;
    }
    
    /**
     * Facility shipment item
     */
    export interface FacilityShipmentItem {
      /**
       * Shipment ID
       */
      shipmentId: string;
      
      /**
       * Seller SKU
       */
      sellerSku: string;
      
      /**
       * ASIN
       */
      asin: string;
      
      /**
       * Quantity
       */
      quantity: number;
      
      /**
       * Reconciled quantity
       */
      reconciledQuantity?: number;
      
      /**
       * Status
       */
      status: string;
    }
    
    /**
     * Facility shipment
     */
    export interface FacilityShipment {
      /**
       * Shipment ID
       */
      shipmentId: string;
      
      /**
       * Shipment name
       */
      shipmentName: string;
      
      /**
       * Created date
       */
      createdDate: string;
      
      /**
       * Status
       */
      status: ShipmentStatus;
      
      /**
       * Status updated date
       */
      statusUpdatedDate: string;
      
      /**
       * From facility ID
       */
      fromFacilityId: string;
      
      /**
       * To facility ID
       */
      toFacilityId: string;
      
      /**
       * Items
       */
      items: FacilityShipmentItem[];
    }
  }
  
  /**
   * ShipmentInvoicing API types
   */
  export namespace ShipmentInvoicing {
    /**
     * Shipment invoice status
     */
    export type ShipmentInvoiceStatus = 
      | 'WORKING' 
      | 'SUBMITTED' 
      | 'ACCEPTED' 
      | 'CLOSED' 
      | 'REJECTED' 
      | 'DELETED';
    
    /**
     * Party identification
     */
    export interface PartyIdentification {
      /**
       * Party ID
       */
      partyId: string;
      
      /**
       * Party ID type
       */
      partyIdType?: 'SHIPPER_TAX_REGISTRATION_NUMBER';
    }
    
    /**
     * Tax registration detail
     */
    export interface TaxRegistrationDetail {
      /**
       * Tax registration type
       */
      taxRegistrationType: string;
      
      /**
       * Tax registration number
       */
      taxRegistrationNumber: string;
    }
    
    /**
     * Party
     */
    export interface Party {
      /**
       * Party identification
       */
      partyId: PartyIdentification;
      
      /**
       * Address
       */
      address: Common.Address;
      
      /**
       * Tax registration details
       */
      taxRegistrationDetails?: TaxRegistrationDetail[];
    }
    
    /**
     * Item quantity
     */
    export interface ItemQuantity {
      /**
       * Amount
       */
      amount: number;
      
      /**
       * Unit of measure
       */
      unitOfMeasure: string;
    }
    
    /**
     * Tax detail
     */
    export interface TaxDetail {
      /**
       * Tax type
       */
      taxType: string;
      
      /**
       * Tax rate
       */
      taxRate?: string;
      
      /**
       * Tax amount
       */
      taxAmount: Common.Money;
      
      /**
       * Taxable amount
       */
      taxableAmount?: Common.Money;
    }
    
    /**
     * Invoice item
     */
    export interface InvoiceItem {
      /**
       * Item sequence number
       */
      itemSequenceNumber: string;
      
      /**
       * Amazon product identifier
       */
      amazonProductIdentifier?: string;
      
      /**
       * Vendor product identifier
       */
      vendorProductIdentifier?: string;
      
      /**
       * Invoiced quantity
       */
      invoicedQuantity: ItemQuantity;
      
      /**
       * Net cost
       */
      netCost: Common.Money;
      
      /**
       * Purchase order number
       */
      purchaseOrderNumber?: string;
      
      /**
       * HSN code
       */
      hsnCode?: string;
      
      /**
       * Tax details
       */
      taxDetails?: TaxDetail[];
      
      /**
       * Charge details
       */
      chargeDetails?: any[];
    }
    
    /**
     * Invoice requirements
     */
    export interface InvoiceRequirements {
      /**
       * VAT invoice requirements
       */
      vatInvoiceRequirements?: any;
    }
    
    /**
     * Shipment details
     */
    export interface ShipmentDetails {
      /**
       * Shipment method of payment
       */
      shipmentMethodOfPayment: 'EXPORT';
      
      /**
       * Shipment value
       */
      shipmentValue: Common.Money;
      
      /**
       * Freight value
       */
      freightValue?: Common.Money;
      
      /**
       * Insurance value
       */
      insuranceValue?: Common.Money;
      
      /**
       * Shipment method
       */
      shipmentMethod?: string;
      
      /**
       * Dimensions
       */
      dimensions?: Common.Dimensions;
      
      /**
       * Weight
       */
      weight?: Common.Weight;
    }
    
    /**
     * Shipment invoice
     */
    export interface ShipmentInvoice {
      /**
       * Shipment invoice status
       */
      shipmentInvoiceStatus: ShipmentInvoiceStatus;
      
      /**
       * Buyer
       */
      buyer?: Party;
      
      /**
       * Seller
       */
      seller?: Party;
      
      /**
       * Ship from
       */
      shipFrom?: Party;
      
      /**
       * Ship to
       */
      shipTo?: Party;
      
      /**
       * Invoice number
       */
      invoiceNumber: string;
      
      /**
       * Invoice type
       */
      invoiceType: 'COMMERCIAL_INVOICE';
      
      /**
       * Invoice date
       */
      invoiceDate: string;
      
      /**
       * Remit to party
       */
      remitToParty?: Party;
      
      /**
       * Ship to country code
       */
      shipToCountryCode: string;
      
      /**
       * Payment terms code
       */
      paymentTermsCode?: string;
      
      /**
       * Invoice total
       */
      invoiceTotal: Common.Money;
      
      /**
       * Tax totals
       */
      taxTotals?: TaxDetail[];
      
      /**
       * Additional information
       */
      additionalInformation?: string;
      
      /**
       * Invoice items
       */
      items?: InvoiceItem[];
    }
    
    /**
     * Submit shipment invoice response
     */
    export interface SubmitShipmentInvoicesResponse {
      /**
       * Successful submissions
       */
      successful?: any[];
      
      /**
       * Failed submissions
       */
      failed?: any[];
    }
    
    /**
     * Get shipment invoice response
     */
    export interface GetShipmentInvoiceResponse {
      /**
       * Shipment invoice
       */
      shipmentInvoice?: ShipmentInvoice;
      
      /**
       * Invoice requirements
       */
      invoiceRequirements?: InvoiceRequirements;
      
      /**
       * Shipment details
       */
      shipmentDetails?: ShipmentDetails;
    }
  }
  
  /**
   * SupplySources API types
   */
  export namespace SupplySources {
    /**
     * Supply source type
     */
    export type SupplySourceType = 
      | 'WAREHOUSE' 
      | 'STORE' 
      | 'DROP_SHIPPER' 
      | 'MANUFACTURER';
    
    /**
     * Supply source address
     */
    export interface SupplySourceAddress {
      /**
       * Name
       */
      name: string;
      
      /**
       * Address line 1
       */
      addressLine1: string;
      
      /**
       * Address line 2
       */
      addressLine2?: string;
      
      /**
       * Address line 3
       */
      addressLine3?: string;
      
      /**
       * City
       */
      city: string;
      
      /**
       * County
       */
      county?: string;
      
      /**
       * State
       */
      state?: string;
      
      /**
       * Postal code
       */
      postalCode: string;
      
      /**
       * Country code
       */
      countryCode: string;
      
      /**
       * Phone
       */
      phone?: string;
    }
    
    /**
     * Supply source contact
     */
    export interface SupplySourceContact {
      /**
       * Name
       */
      name: string;
      
      /**
       * Phone
       */
      phone: string;
      
      /**
       * Email
       */
      email: string;
    }
    
    /**
     * Supply source
     */
    export interface SupplySource {
      /**
       * Supply source ID
       */
      supplySourceId: string;
      
      /**
       * Supply source code
       */
      supplySourceCode: string;
      
      /**
       * Supply source name
       */
      name: string;
      
      /**
       * Supply source type
       */
      type: SupplySourceType;
      
      /**
       * Address
       */
      address: SupplySourceAddress;
      
      /**
       * Primary contact
       */
      primaryContact: SupplySourceContact;
      
      /**
       * Secondary contact
       */
      secondaryContact?: SupplySourceContact;
      
      /**
       * Is active
       */
      isActive: boolean;
      
      /**
       * Custom fields
       */
      customFields?: Record<string, string>;
    }
    
    /**
     * Item supplier relationship
     */
    export interface ItemSupplierRelationship {
      /**
       * ASIN
       */
      asin: string;
      
      /**
       * SKU
       */
      sku: string;
      
      /**
       * Seller part number
       */
      sellerPartNumber?: string;
      
      /**
       * Supply source ID
       */
      supplySourceId: string;
      
      /**
       * Additional attributes
       */
      additionalAttributes?: Record<string, string>;
    }
  }
  
  /**
   * Tokens API types
   */
  export namespace Tokens {
    /**
     * HTTP method
     */
    export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    
    /**
     * Restricted resource
     */
    export interface RestrictedResource {
      /**
       * Method
       */
      method: HttpMethod;
      
      /**
       * Path
       */
      path: string;
      
      /**
       * Data elements
       */
      dataElements?: string[];
    }
    
    /**
     * Create restricted data token response
     */
    export interface CreateRestrictedDataTokenResponse {
      /**
       * Restricted data token
       */
      restrictedDataToken: string;
      
      /**
       * Expires in
       */
      expiresIn: number;
    }
  }
  
  /**
   * Messaging API types
   */
  export namespace Messaging {
    /**
     * Message type
     */
    export type MessageType = 
      | 'WARRANTY' 
      | 'PRODUCT_DETAILS' 
      | 'PRODUCT_ORDERED' 
      | 'ORDER_STATUS' 
      | 'SHIPPING_STATUS' 
      | 'ORDER_RETURNS';
    
    /**
     * Messaging action
     */
    export interface MessagingAction {
      /**
       * Name
       */
      name: string;
      
      /**
       * Message type
       */
      messageType: MessageType;
      
      /**
       * Allowed for seller
       */
      allowedForSeller: boolean;
    }
    
    /**
     * Get messaging actions response
     */
    export interface GetMessagingActionsResponse {
      /**
       * Links
       */
      links?: any;
      
      /**
       * Payload
       */
      payload?: {
        /**
         * Actions
         */
        actions: MessagingAction[];
      };
      
      /**
       * Errors
       */
      errors?: Common.Error[];
    }
  }
  
  /**
   * Listings Restrictions API types
   */
  export namespace ListingsRestrictions {
    /**
     * Restrictions identifier type
     */
    export type RestrictionsIdentifierType = 'ASIN' | 'SKU';
    
    /**
     * Reason code
     */
    export interface ReasonCode {
      /**
       * Message
       */
      message: string;
      
      /**
       * Reason code details
       */
      reasonCodeDetails?: Record<string, string>;
    }
    
    /**
     * Restriction
     */
    export interface Restriction {
      /**
       * Marketplace ID
       */
      marketplaceId: string;
      
      /**
       * Condition type
       */
      conditionType?: string;
      
      /**
       * Reason codes
       */
      reasonCodes: ReasonCode[];
      
      /**
       * Programs
       */
      programs?: string[];
    }
    
    /**
     * Get listings restrictions response
     */
    export interface GetListingsRestrictionsResponse {
      /**
       * ASIN
       */
      asin: string;
      
      /**
       * Seller SKU
       */
      sellerSku?: string;
      
      /**
       * Marketplace ID
       */
      marketplaceId: string;
      
      /**
       * Restrictions
       */
      restrictions: Restriction[];
    }
  }
  
  /**
   * Solicitations API types
   */
  export namespace Solicitations {
    /**
     * Solicitation type
     */
    export type SolicitationType = 
      | 'REQUEST_FEEDBACK' 
      | 'REQUEST_PRODUCT_REVIEW';
    
    /**
     * Solicitation action
     */
    export interface SolicitationAction {
      /**
       * Solicitation type
       */
      solicitationType: SolicitationType;
      
      /**
       * Is allowed
       */
      isAllowed: boolean;
      
      /**
       * Disallowed reason
       */
      disallowedReason?: string;
    }
    
    /**
     * Get solicitation actions response
     */
    export interface GetSolicitationActionsResponse {
      /**
       * Actions
       */
      actions: SolicitationAction[];
    }
  }
  
  /**
   * Sellers API types
   */
  export namespace Sellers {
    /**
     * Participation status
     */
    export type ParticipationStatus = 
      | 'ACTIVE' 
      | 'SUSPENDED' 
      | 'INACTIVE';
    
    /**
     * Marketplace details
     */
    export interface MarketplaceDetails {
      /**
       * Marketplace ID
       */
      marketplaceId: string;
      
      /**
       * Default currency code
       */
      defaultCurrencyCode: string;
      
      /**
       * Default language code
       */
      defaultLanguageCode: string;
      
      /**
       * Domain name
       */
      domainName: string;
      
      /**
       * Default country code
       */
      defaultCountryCode: string;
      
      /**
       * Default time zone
       */
      defaultTimeZone: string;
      
      /**
       * Display name
       */
      displayName: string;
    }
    
    /**
     * Marketplace participation
     */
    export interface MarketplaceParticipation {
      /**
       * Marketplace
       */
      marketplace: MarketplaceDetails;
      
      /**
       * Participation
       */
      participation: {
        /**
         * Is participating
         */
        isParticipating: boolean;
        
        /**
         * Has suspended listings
         */
        hasSuspendedListings: boolean;
        
        /**
         * Participation status
         */
        participationStatus?: ParticipationStatus;
      };
    }
    
    /**
     * Seller account info
     */
    export interface SellerAccountInfo {
      /**
       * Seller ID
       */
      sellerId: string;
      
      /**
       * Store name
       */
      storeName?: string;
      
      /**
       * Account type
       */
      accountType?: string;
    }
  }
}