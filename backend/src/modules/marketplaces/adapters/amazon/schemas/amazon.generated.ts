/**
 * Amazon Selling Partner API - Generated Schema Types
 * Generated from official Amazon SP-API models
 */

/**
 * Common namespace for all Amazon SP-API generated types
 */
export namespace AmazonSPApi {
  /**
   * Common types shared across multiple APIs
   */
  export namespace Common {
    export interface Error {
      code: string;
      message: string;
      details?: string;
    }
    
    export interface Money {
      amount?: number;
      currencyCode?: string;
    }

    export interface Address {
      name?: string;
      addressLine1?: string;
      addressLine2?: string;
      addressLine3?: string;
      city?: string;
      county?: string;
      district?: string;
      stateOrRegion?: string;
      postalCode?: string;
      countryCode?: string;
      phone?: string;
      addressType?: string;
    }
  }

  /**
   * Catalog Items API (2022-04-01) types
   */
  export namespace CatalogItems {
    export interface Item {
      asin: string;
      attributes?: Record<string, any>;
      identifiers?: {
        marketplaceAsin?: {
          marketplaceId: string;
          asin: string;
        }[];
        skuIdentifier?: {
          marketplaceId: string;
          sellerId: string;
          sellerSKU: string;
        }[];
      };
      images?: {
        [variant: string]: {
          link: string;
          height: number;
          width: number;
        }[];
      };
      productTypes?: Record<string, string>;
      salesRanks?: {
        classificationId: string;
        title: string;
        link?: string;
        rank: number;
      }[];
      summaries?: {
        marketplaceId: string;
        adult?: boolean;
        autographed?: boolean;
        brand?: string;
        browseClassification?: {
          displayName: string;
          classificationId: string;
        };
        color?: string;
        itemClassification?: string;
        itemName?: string;
        manufacturer?: string;
        memorabilia?: boolean;
        modelNumber?: string;
        packageQuantity?: number;
        partNumber?: string;
        releaseDate?: string;
        size?: string;
        style?: string;
        tradeInEligible?: boolean;
        websiteDisplayGroup?: string;
        websiteDisplayGroupName?: string;
      }[];
      variations?: {
        marketplaceId?: string;
        asins?: string[];
        variationType?: string;
        variationThemes?: string[];
      }[];
      vendorDetails?: {
        marketplaceId: string;
        brandCode?: string;
        manufacturerCode?: string;
        manufacturerCodeParent?: string;
        productCategory?: string;
        productGroup?: string;
        productSubcategory?: string;
        replenishmentCategory?: string;
      }[];
    }
    
    export interface SearchCatalogResponse {
      numberOfResults: number;
      pagination?: {
        nextToken?: string;
      };
      refinements?: {
        brands?: {
          numberOfResults: number;
          name: string;
        }[];
        classifications?: {
          numberOfResults: number;
          displayName: string;
          classificationId: string;
        }[];
      };
      items: Item[];
    }
    
    export interface GetCatalogItemResponse {
      item: Item;
    }
  }

  /**
   * Orders API (v0) types
   */
  export namespace Orders {
    export interface Order {
      amazonOrderId: string;
      sellerOrderId?: string;
      purchaseDate: string;
      lastUpdateDate: string;
      orderStatus: string;
      fulfillmentChannel?: string;
      salesChannel?: string;
      orderTotal?: Common.Money;
      numberOfItemsShipped?: number;
      numberOfItemsUnshipped?: number;
      paymentMethod?: string;
      paymentMethodDetails?: string[];
      marketplaceId: string;
      shipmentServiceLevelCategory?: string;
      orderType?: string;
      earliestShipDate?: string;
      latestShipDate?: string;
      isBusinessOrder?: boolean;
      isPrime?: boolean;
      isPremiumOrder?: boolean;
      isGlobalExpressEnabled?: boolean;
      isReplacementOrder?: boolean;
      isEstimatedShipDateSet?: boolean;
      buyerInfo?: {
        buyerEmail?: string;
        buyerName?: string;
        buyerCounty?: string;
        buyerTaxInfo?: {
          taxClassifications?: {
            name: string;
            value: string;
          }[];
        };
        purchaseOrderNumber?: string;
      };
      shippingAddress?: Common.Address;
      defaultShipFromLocationAddress?: Common.Address;
      automatedShippingSettings?: {
        hasAutomatedShippingSettings?: boolean;
        automatedCarrier?: string;
        automatedShipMethod?: string;
      };
      preferredDeliveryPreferences?: {
        preferredDeliveryType?: string;
        instructions?: string;
      };
    }
    
    export interface OrderItem {
      asin: string;
      sellerSKU?: string;
      orderItemId: string;
      title?: string;
      quantityOrdered: number;
      quantityShipped?: number;
      productInfo?: {
        numberOfItems?: number;
      };
      pointsGranted?: {
        pointsNumber: number;
        pointsMonetaryValue: Common.Money;
      };
      itemPrice?: Common.Money;
      shippingPrice?: Common.Money;
      itemTax?: Common.Money;
      shippingTax?: Common.Money;
      shippingDiscount?: Common.Money;
      shippingDiscountTax?: Common.Money;
      promotionDiscount?: Common.Money;
      promotionDiscountTax?: Common.Money;
      promotionIds?: string[];
      codFee?: Common.Money;
      codFeeDiscount?: Common.Money;
      isGift?: boolean;
      conditionNote?: string;
      conditionId?: string;
      condition?: string;
      scheduledDeliveryStartDate?: string;
      scheduledDeliveryEndDate?: string;
      giftMessageText?: string;
      giftWrapLevel?: string;
      giftWrapPrice?: Common.Money;
      giftWrapTax?: Common.Money;
    }
    
    export interface GetOrdersResponse {
      payload: {
        Orders: Order[];
        NextToken?: string;
      };
      errors?: Common.Error[];
    }
    
    export interface GetOrderResponse {
      payload: {
        Orders: Order[];
      };
      errors?: Common.Error[];
    }
    
    export interface GetOrderItemsResponse {
      payload: {
        OrderItems: OrderItem[];
        NextToken?: string;
      };
      errors?: Common.Error[];
    }
  }

  /**
   * Listings API (2021-08-01) types
   */
  export namespace Listings {
    export type ListingStatus = 'ACTIVE' | 'INACTIVE' | 'INCOMPLETE' | 'DELETED' | 'SUPPRESSED';
    
    export interface Listing {
      sku: string;
      status: ListingStatus;
      issueList?: {
        code: string;
        message: string;
        severity: 'ERROR' | 'WARNING' | 'INFO';
      }[];
      summaries?: {
        marketplaceId: string;
        asin: string;
        productType: string;
        conditionType?: string;
        status: ListingStatus;
        itemName?: string;
        createdDate: string;
        lastUpdatedDate: string;
        mainImage?: {
          link: string;
          height: number;
          width: number;
        };
      }[];
      attributes?: Record<string, object>;
    }
    
    export interface GetListingsResponse {
      pagination?: {
        nextToken?: string;
      };
      listings: Listing[];
    }
  }

  /**
   * Pricing API (2022-05-01) types
   */
  export namespace Pricing {
    export interface PriceType {
      listingPrice: Common.Money;
      shippingPrice?: Common.Money;
      points?: {
        pointsNumber: number;
        pointsMonetaryValue: Common.Money;
      };
    }
    
    export interface CompetitivePrice {
      competitivePriceId: string;
      price: PriceType;
      condition: string;
      subcondition: string;
      offerType?: string;
      sellerId?: string;
      belongsToRequester?: boolean;
    }
    
    export interface GetPricingResponse {
      payload: {
        status: string;
        sku: string;
        asin?: string;
        product?: {
          identifiers: {
            marketplaceASIN: {
              marketplaceId: string;
              asin: string;
            };
            skuIdentifier?: {
              marketplaceId: string;
              sellerId: string;
              sellerSKU: string;
            };
          };
          competitivePricing?: {
            competitivePrices: CompetitivePrice[];
            numberOfOfferListings: {
              condition: string;
              count: number;
            }[];
            tradeInValue?: Common.Money;
          };
          offers?: {
            buyingPrice: {
              listingPrice: Common.Money;
              shipping?: Common.Money;
              points?: {
                pointsNumber?: number;
                pointsMonetaryValue?: Common.Money;
              };
            };
            regularPrice: Common.Money;
            businessPrice?: Common.Money;
            quantityDiscountPrices?: {
              quantityTier: number;
              listingPrice: Common.Money;
            }[];
            fulfillmentChannel?: string;
            itemCondition?: string;
            itemSubCondition?: string;
            offerType?: string;
            sellerId?: string;
          }[];
        }
      }[];
      errors?: Common.Error[];
    }
  }

  /**
   * FBA Inventory API (2022-05-01) types
   */
  export namespace FbaInventory {
    export interface InventoryDetails {
      fulfillableQuantity?: number;
      inboundWorkingQuantity?: number;
      inboundShippedQuantity?: number;
      inboundReceivingQuantity?: number;
      reservedQuantity?: {
        total?: number;
        customerOrders?: number;
        fcProcessing?: number;
        fcTransfer?: number;
      };
      researchingQuantity?: {
        total?: number;
        withinPeriod?: {
          name?: string;
          quantity?: number;
        }[];
      };
      unfulfillableQuantity?: {
        total?: number;
        customerDamaged?: number;
        warehouseDamaged?: number;
        distributorDamaged?: number;
        carrierDamaged?: number;
        defectiveQuantity?: number;
        expiredQuantity?: number;
      };
    }
    
    export interface GetInventorySummariesResponse {
      payload: {
        granularity: {
          granularityType: string;
          granularityId: string;
        };
        inventorySummaries: {
          asin?: string;
          fnSku?: string;
          sellerSku?: string;
          condition?: string;
          inventoryDetails?: InventoryDetails;
          lastUpdatedTime?: string;
          productName?: string;
          totalQuantity?: number;
        }[];
        pagination?: {
          nextToken?: string;
        };
      };
      errors?: Common.Error[];
    }
  }
  
  /**
   * Data Kiosk API types
   */
  export namespace DataKiosk {
    export type QueryStatus = 
      | 'PENDING'
      | 'RUNNING'
      | 'COMPLETED'
      | 'CANCELLED'
      | 'FAILED';
    
    export interface Document {
      documentId: string;
      name: string;
      description?: string;
      type: string;
      datasetType: string;
      availableMarketplaces: string[];
      lastUpdatedDate: string;
    }
    
    export interface CreateQueryResponse {
      executionId: string;
      status: QueryStatus;
      createdTime: string;
    }
    
    export interface GetQueryResponse {
      executionId: string;
      queryId?: string;
      query?: string;
      status: QueryStatus;
      createdTime: string;
      completedTime?: string;
      error?: {
        code: string;
        message: string;
      };
    }
    
    export interface GetResultsResponse {
      columnNames: string[];
      resultRows: any[][];
      nextToken?: string;
    }
    
    export interface ListDocumentsResponse {
      documents: Document[];
      nextToken?: string;
    }
    
    export interface GetDocumentResponse {
      documentId: string;
      name: string;
      description?: string;
      type: string;
      datasetType: string;
      schema: {
        columns: {
          name: string;
          type: string;
          description?: string;
        }[];
      };
      availableMarketplaces: string[];
      lastUpdatedDate: string;
    }
    
    export interface ListExecutionsResponse {
      executions: {
        executionId: string;
        queryId?: string;
        status: QueryStatus;
        createdTime: string;
        completedTime?: string;
      }[];
      nextToken?: string;
    }
  }
  
  /**
   * Sellers API types
   */
  export namespace Sellers {
    export interface MarketplaceDetails {
      id: string;
      name: string;
      countryCode: string;
      defaultCurrencyCode: string;
      defaultLanguageCode: string;
      domainName: string;
    }
    
    export interface MarketplaceParticipation {
      marketplace: MarketplaceDetails;
      participation: {
        isParticipating: boolean;
        hasSuspendedListings: boolean;
      };
    }
    
    export interface GetMarketplaceParticipationsResponse {
      payload: MarketplaceParticipation[];
    }
    
    export interface SellerAccountInfo {
      accountType: string;
      sellerId: string;
    }
    
    export interface GetSellerAccountInfoResponse {
      payload: SellerAccountInfo;
    }
  }
  
  /**
   * Reports API (2021-06-30) types
   */
  export namespace Reports {
    export type ProcessingStatus = 'IN_QUEUE' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' | 'FATAL';
    
    export interface CreateReportResponse {
      reportId: string;
      processingStatus: ProcessingStatus;
      createdTime: string;
    }
    
    export interface GetReportResponse {
      reportId: string;
      processingStatus: ProcessingStatus;
      createdTime: string;
      completedTime?: string;
      reportDocumentId?: string;
      reportType: string;
    }
    
    export interface GetReportDocumentResponse {
      reportDocumentId: string;
      url: string;
      compressionAlgorithm?: 'GZIP';
      contentType?: string;
    }
    
    export interface Report {
      reportId: string;
      processingStatus: ProcessingStatus;
      createdTime: string;
      completedTime?: string;
      reportDocumentId?: string;
      reportType: string;
    }
    
    export interface ListReportsResponse {
      reports: Report[];
      nextToken?: string;
    }
  }

  /**
   * Fulfillment Inbound API types
   */
  export namespace FulfillmentInbound {
    export interface Address {
      name: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      stateOrProvinceCode: string;
      countryCode: string;
      postalCode: string;
    }
    
    export interface PrepDetails {
      prepInstruction: string;
      prepOwner: 'AMAZON' | 'SELLER';
    }
    
    export interface InboundShipmentItem {
      sellerSKU: string;
      quantity: number;
      quantityInCase?: number;
      prepDetailsList?: PrepDetails[];
    }
    
    export interface InboundShipmentPlanItem {
      sellerSKU: string;
      fulfillmentNetworkSKU: string;
      quantity: number;
      prepDetailsList?: PrepDetails[];
    }
    
    export interface InboundShipmentPlan {
      shipmentId: string;
      destinationFulfillmentCenterId: string;
      shipToAddress: Address;
      labelPrepType: 'NO_LABEL' | 'SELLER_LABEL' | 'AMAZON_LABEL';
      items: InboundShipmentPlanItem[];
      estimatedBoxCount?: number;
    }
    
    export interface CreateInboundShipmentPlanRequest {
      shipFromAddress: Address;
      labelPrepPreference: 'SELLER_LABEL' | 'AMAZON_LABEL_ONLY' | 'AMAZON_LABEL_PREFERRED';
      inboundShipmentItems: InboundShipmentItem[];
      shipToCountryCode?: string;
      shipToCountrySubdivisionCode?: string;
    }
    
    export interface CreateInboundShipmentRequest {
      shipmentId: string;
      shipmentName: string;
      shipFromAddress: Address;
      destinationFulfillmentCenterId: string;
      labelPrepPreference: 'SELLER_LABEL' | 'AMAZON_LABEL_ONLY' | 'AMAZON_LABEL_PREFERRED';
      inboundShipmentItems: InboundShipmentItem[];
      shipmentStatus: 'WORKING' | 'SHIPPED' | 'CANCELLED';
      intendedBoxContentsSource?: 'NONE' | 'FEED' | '2D_BARCODE';
    }
    
    export interface UpdateInboundShipmentRequest {
      shipmentName?: string;
      shipFromAddress?: Address;
      destinationFulfillmentCenterId?: string;
      labelPrepPreference?: 'SELLER_LABEL' | 'AMAZON_LABEL_ONLY' | 'AMAZON_LABEL_PREFERRED';
      inboundShipmentItems?: InboundShipmentItem[];
      shipmentStatus?: 'WORKING' | 'SHIPPED' | 'CANCELLED';
      intendedBoxContentsSource?: 'NONE' | 'FEED' | '2D_BARCODE';
    }
    
    export interface InboundShipmentInfo {
      shipmentId: string;
      shipmentName: string;
      shipFromAddress: Address;
      destinationFulfillmentCenterId: string;
      shipmentStatus: 'WORKING' | 'SHIPPED' | 'RECEIVING' | 'CANCELLED' | 'DELETED' | 'CLOSED' | 'ERROR' | 'IN_TRANSIT' | 'DELIVERED' | 'CHECKED_IN';
      labelPrepType: 'NO_LABEL' | 'SELLER_LABEL' | 'AMAZON_LABEL';
      areCasesRequired: boolean;
      confirmedNeedByDate?: string;
      boxContentsSource?: 'NONE' | 'FEED' | '2D_BARCODE' | 'INTERACTIVE';
      estimatedBoxCount?: number;
    }
    
    export interface ShipmentItem {
      sellerSKU: string;
      fulfillmentNetworkSKU: string;
      quantityShipped: number;
      quantityReceived: number;
      quantityInCase?: number;
      prepDetailsList?: PrepDetails[];
    }
    
    export interface Shipment {
      shipmentId: string;
      shipmentName: string;
      shipmentStatus: string;
      destinationFulfillmentCenterId: string;
      labelPrepType: string;
      items: ShipmentItem[];
    }
    
    export type ShipmentStatus = 'WORKING' | 'SHIPPED' | 'RECEIVING' | 'CANCELLED' | 'DELETED' | 'CLOSED' | 'ERROR' | 'IN_TRANSIT' | 'DELIVERED' | 'CHECKED_IN';
    
    export interface GetShipmentsFilter {
      shipmentStatusList?: ShipmentStatus[];
      shipmentIdList?: string[];
      lastUpdatedAfter?: Date;
      lastUpdatedBefore?: Date;
    }
    
    export interface CreateInboundShipmentPlanResponse {
      payload: {
        inboundShipmentPlans: InboundShipmentPlan[];
      };
    }
    
    export interface CreateInboundShipmentResponse {
      payload: {
        shipmentId: string;
      };
    }
    
    export interface UpdateInboundShipmentResponse {
      payload: {
        shipmentId: string;
      };
    }
    
    export interface GetShipmentsResponse {
      payload: {
        shipmentData: Shipment[];
        nextToken?: string;
      };
    }
    
    export interface GetShipmentItemsResponse {
      payload: {
        itemData: ShipmentItem[];
        nextToken?: string;
      };
    }
  }

  /**
   * Vendor API types
   */
  export namespace VendorOrders {
    export type OrderStatus = 'NEW' | 'SHIPPED' | 'ACCEPTED' | 'CANCELLED' | 'ACKNOWLEDGED';
    
    export interface Order {
      purchaseOrderNumber: string;
      purchaseOrderState: OrderStatus;
      purchaseOrderDate: string;
      lastUpdatedDate: string;
      sellingParty: {
        partyId: string;
        name?: string;
        address?: Common.Address;
      };
      shipToParty: {
        partyId: string;
        name?: string;
        address?: Common.Address;
      };
      items: OrderItem[];
    }
    
    export interface OrderItem {
      itemSequenceNumber: string;
      amazonProductIdentifier?: string;
      vendorProductIdentifier?: string;
      title?: string;
      orderedQuantity: {
        amount: number;
        unitOfMeasure: string;
      };
      isBackOrder?: boolean;
      netCost?: Common.Money;
      listPrice?: Common.Money;
    }
    
    export interface GetPurchaseOrdersResponse {
      payload: {
        orders?: Order[];
        nextToken?: string;
      };
    }
    
    export interface GetPurchaseOrderResponse {
      payload: Order;
    }
    
    export interface SubmitAcknowledgementResponse {
      payload: {
        transactionId: string;
      };
    }
  }
  
  export namespace VendorShipments {
    export interface SubmitShipmentConfirmationsResponse {
      payload: {
        transactionId: string;
      };
    }
    
    export interface GetPackingSlipResponse {
      payload: {
        packingSlip: string;
      };
    }
  }
  
  export namespace VendorInventory {
    export interface SubmitInventoryUpdateResponse {
      payload: {
        transactionId: string;
      };
    }
  }
  
  export namespace VendorTransactionStatus {
    export interface Transaction {
      transactionId: string;
      status: 'PROCESSING' | 'PROCESSED' | 'FAILED';
      errorDetails?: {
        code: string;
        message: string;
        details?: string;
      }[];
    }
    
    export interface GetTransactionResponse {
      payload: Transaction;
    }
  }
  
  export namespace VendorDirectFulfillmentShipping {
    export interface DeliveryWindow {
      startDate: string;
      endDate: string;
    }
    
    export interface GetPackingSlipResponse {
      payload: {
        deliveryWindows: DeliveryWindow[];
      };
    }
  }

  /**
   * Warehouse and Distribution API types
   */
  export namespace WarehouseAndDistribution {
    export type LocationType = 'VENDOR_WAREHOUSE' | 'SELLER_WAREHOUSE';
    export type PeriodGranularity = 'MONTH' | 'WEEK' | 'DAY';
    export type ShipmentStatus = 'WORKING' | 'READY_TO_SHIP' | 'SHIPPED' | 'RECEIVING' | 'CHECKED_IN' | 'CANCELED';
    export type SortField = 'CREATED_DATE' | 'ESTIMATED_RECEIVING_DATE';
    export type SortOrder = 'ASC' | 'DESC';

    export interface Facility {
      id: string;
      name: string;
      code: string;
      address: Common.Address;
    }

    export interface FacilityShipmentItem {
      sellerSku: string;
      quantity: number;
    }

    export interface FacilityShipment {
      shipmentId: string;
      clientReferenceId: string;
      shipFromLocationId: string;
      warehouseId: string;
      status: ShipmentStatus;
      estimatedReceivingDate: string;
      createdDate: string;
      lastUpdatedDate: string;
      items: FacilityShipmentItem[];
    }

    export interface SellerLocation {
      id: string;
      name: string;
      locationType: LocationType;
      address: Common.Address;
    }

    export interface ProgramCapacityPeriod {
      startDate: string;
      endDate: string;
      capacity: {
        totalCapacity: number;
        availableCapacity: number;
        reservedCapacity: number;
        unitOfMeasure: string;
      };
    }

    export interface GetFacilitiesResponse {
      facilities: Facility[];
    }

    export interface GetInventoryResponse {
      inventory: {
        inventoryId: string;
        sellerSku: string;
        condition: string;
        quantity: number;
        warehouseId: string;
        lastUpdatedTime: string;
      };
    }

    export interface GetFacilityShipmentsResponse {
      shipments: FacilityShipment[];
      nextToken?: string;
    }

    export interface GetFacilityShipmentResponse {
      shipment: FacilityShipment;
    }

    export interface CreateFacilityShipmentResponse {
      shipmentId: string;
    }

    export interface UpdateFacilityShipmentResponse {
      shipmentId: string;
    }

    export interface CancelFacilityShipmentResponse {
      shipmentId: string;
    }

    export interface GetProgramCapacityResponse {
      periods: ProgramCapacityPeriod[];
    }

    export interface GetSellerLocationsResponse {
      sellerLocations: SellerLocation[];
    }
  }

  /**
   * Shipment Invoicing API types
   */
  export namespace ShipmentInvoicing {
    export type ShipmentInvoiceStatus = 'WORKING' | 'SUBMITTED' | 'INVALID' | 'ACCEPTED' | 'CANCELLED' | 'CLOSED';
    
    export interface Money {
      currencyCode: string;
      amount: number;
    }
    
    export interface PartyIdentification {
      partyId: string;
      idType?: 'SHIPPER_TAX_REGISTRATION_NUMBER' | 'SHIPPER_VAT_NUMBER' | string;
    }
    
    export interface Address {
      name: string;
      addressLine1: string;
      addressLine2?: string;
      addressLine3?: string;
      city: string;
      county?: string;
      district?: string;
      stateOrRegion?: string;
      postalCode?: string;
      countryCode: string;
      phone?: string;
    }
    
    export interface Dimensions {
      length: number;
      width: number;
      height: number;
      unit: string;
    }
    
    export interface Weight {
      value: number;
      unit: string;
    }
    
    export interface ItemQuantity {
      amount: number;
      unit: string;
    }
    
    export interface TaxDetail {
      taxType: 'EXPORT' | 'IMPORT' | 'FEES' | 'GST' | 'VAT' | 'PST' | 'SALES_TAX' | string;
      taxRate?: number;
      taxAmount: Money;
      taxableAmount?: Money;
    }
    
    export interface TaxRegistrationDetail {
      taxRegistrationNumber: string;
      taxRegistrationType: string;
      taxRegistrationAddress?: Address;
      taxRegistrationMessage?: string;
    }
    
    export interface Party {
      accountId?: string;
      partyIdentification?: PartyIdentification[];
      address?: Address;
      email?: string;
      taxRegistrationDetails?: TaxRegistrationDetail[];
    }
    
    export interface InvoiceItem {
      itemId?: string;
      orderItemId?: string;
      invoiceItemNumber?: number;
      quantity: ItemQuantity;
      productSku?: string;
      title?: string;
      serialNumbers?: string[];
      hsCode?: string;
      unitPrice?: Money;
      itemPrice?: Money;
      shippingPrice?: Money;
      taxDetails?: TaxDetail[];
      taxAmount?: Money;
      discountPrice?: Money;
      discountTaxDetails?: TaxDetail[];
      dimensions?: Dimensions;
      weight?: Weight;
      countryOfOrigin?: string;
    }
    
    export interface ShipmentInvoice {
      marketplaceId: string;
      shipmentId: string;
      invoiceStatus: ShipmentInvoiceStatus;
      billToParty?: Party;
      shipFromParty?: Party;
      shipToParty?: Party;
      remitToParty?: Party;
      paymentMethodCode?: string;
      invoiceClassification?: 'COMMERCIAL_INVOICE' | 'PROFORMA_INVOICE' | string;
      paymentTermsCode?: string;
      shipToCountry?: string;
      vendorOrderId?: string;
      shipDate?: string;
      invoiceNumber?: string;
      items: InvoiceItem[];
    }
    
    export interface InvoiceRequirements {
      requiresInvoice: boolean;
      additionalRequirements?: string[];
    }
    
    export interface ShipmentDetails {
      amazonOrderId: string;
      amazonShipmentId: string;
      invoiceRequirements?: InvoiceRequirements;
    }
    
    export interface GetShipmentDetailsResponse {
      shipmentDetails: ShipmentDetails;
    }
    
    export interface SubmitInvoiceRequest {
      invoiceContent: string;
      marketplaceId: string;
      contentType: 'text/xml' | 'application/json';
    }
    
    export interface GetShipmentInvoiceStatusRequest {
      marketplaceId: string;
      shipmentId: string;
    }
  }

  /**
   * Supply Sources API types
   */
  export namespace SupplySources {
    export type SupplySourceType = 'WAREHOUSE' | 'FACTORY' | 'DISTRIBUTOR' | 'OTHER';

    export interface SupplySourceAddress {
      name: string;
      addressLine1: string;
      addressLine2?: string;
      addressLine3?: string;
      city: string;
      county?: string;
      district?: string;
      stateOrRegion: string;
      postalCode: string;
      countryCode: string;
      phone?: string;
    }

    export interface SupplySourceContact {
      name: string;
      email: string;
      phone?: string;
    }

    export interface SupplySourceOptions {
      name: string;
      type: SupplySourceType;
      address: SupplySourceAddress;
      primaryContact: SupplySourceContact;
      secondaryContact?: SupplySourceContact;
      isDefault?: boolean;
      attributes?: Record<string, string>;
    }

    export interface SupplySource {
      supplySourceId: string;
      name: string;
      type: SupplySourceType;
      address: SupplySourceAddress;
      primaryContact: SupplySourceContact;
      secondaryContact?: SupplySourceContact;
      isDefault: boolean;
      attributes?: Record<string, string>;
      createdTime: string;
      lastUpdatedTime: string;
    }

    export interface GetSupplySourcesResponse {
      supplySources: SupplySource[];
      nextToken?: string;
    }

    export interface ItemSupplierRelationship {
      asin?: string;
      sellerSku?: string;
      supplySourceId: string;
      attributes?: Record<string, string>;
    }

    export interface GetItemSupplierRelationshipsResponse {
      itemSupplierRelationships: ItemSupplierRelationship[];
      nextToken?: string;
    }

    export interface CreateSupplySourceResponse {
      supplySourceId: string;
    }

    export interface CreateItemSupplierRelationshipResponse {
      itemSupplierRelationshipId: string;
    }
  }
  
  /**
   * Tokens API types
   */
  export namespace Tokens {
    export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
    
    export interface RestrictedResource {
      /**
       * The path of the restricted operation
       */
      path: string;
      
      /**
       * The HTTP method of the restricted operation
       */
      method: HttpMethod;
      
      /**
       * The restricted resource data to be associated with the token
       * For path-level resources, dataElements should not be set
       */
      dataElements?: string[];
    }
    
    export interface CreateRestrictedDataTokenRequest {
      /**
       * The restricted operations list (paths and methods) for which 
       * the restricted data token is generated
       */
      restrictedResources: RestrictedResource[];
      
      /**
       * The expiration duration in seconds for the restricted data token
       * Default: 3600 seconds (1 hour)
       * Max: 86400 seconds (24 hours)
       * Min: 60 seconds (1 minute)
       */
      expiresIn?: number;
    }
    
    export interface CreateRestrictedDataTokenResponse {
      /**
       * A Restricted Data Token (RDT). This is a short-lived access token that authorizes calls to restricted operations.
       */
      restrictedDataToken: string;
      
      /**
       * The lifetime of the restrictedDataToken in seconds
       */
      expiresIn: number;
    }
  }
  
  /**
   * Messaging API types
   */
  export namespace Messaging {
    export type MessageType = 
      | 'WARRANTY'
      | 'PRODUCT_DETAIL'
      | 'PRODUCT_CUSTOMIZATION'
      | 'AMAZON_PAY'
      | 'ORDER_FULFILLMENT'
      | 'ORDER_DETAIL'
      | 'ORDER_RETURN'
      | 'UNEXPECTED_PROBLEM'
      | 'OTHER';
    
    export interface Attachment {
      /**
       * Content type of the attachment
       */
      contentType: string;
      
      /**
       * Name of the attachment
       */
      fileName: string;
      
      /**
       * Content of the attachment in base64 format
       */
      attachmentData: string;
    }
    
    export interface MessagingAction {
      name: MessageType;
    }
    
    export interface GetMessagingActionsForOrderResponse {
      actions: MessagingAction[];
    }
    
    export interface CreateConfirmCustomizationDetailsResponse {
      /**
       * The ID of the message that was created
       */
      messageId: string;
      
      /**
       * Status of the message
       */
      status: string;
    }
    
    export interface CreateConfirmDeliveryDetailsResponse {
      /**
       * The ID of the message that was created
       */
      messageId: string;
      
      /**
       * Status of the message
       */
      status: string;
    }
    
    export interface CreateLegalDisclosureResponse {
      /**
       * The ID of the message that was created
       */
      messageId: string;
      
      /**
       * Status of the message
       */
      status: string;
    }
    
    export interface CreateNegativeFeedbackRemovalResponse {
      /**
       * The ID of the message that was created
       */
      messageId: string;
      
      /**
       * Status of the message
       */
      status: string;
    }
    
    export interface CreateWarrantyResponse {
      /**
       * The ID of the message that was created
       */
      messageId: string;
      
      /**
       * Status of the message
       */
      status: string;
    }
  }
  
  /**
   * Finances API types
   */
  export namespace Finances {
    export type FinancialEventGroupStatus = 'Open' | 'Closed';
    
    export type FinancialTransactionType = 
      | 'Shipment'
      | 'Refund'
      | 'Guarantee Claim'
      | 'Chargeback'
      | 'Transfer'
      | 'SAFE-T'
      | 'Solution Provider Credit'
      | 'Subscription Fee'
      | 'Adjustment'
      | 'Order';
    
    export interface Money {
      /**
       * The amount
       */
      amount: string;
      
      /**
       * The currency code
       */
      currencyCode: string;
    }
    
    export interface Fee {
      /**
       * The type of fee
       */
      feeType: string;
      
      /**
       * The amount of the fee
       */
      feeAmount: Money;
    }
    
    export interface FinancialEventGroup {
      /**
       * The unique identifier for the financial event group
       */
      financialEventGroupId: string;
      
      /**
       * The processing status of the financial event group
       */
      financialEventGroupStatus: FinancialEventGroupStatus;
      
      /**
       * The start date of the financial event group
       */
      startDate: string;
      
      /**
       * The end date of the financial event group
       */
      endDate: string;
      
      /**
       * The fund transfer date of the financial event group
       */
      fundTransferDate?: string;
      
      /**
       * The original total amount
       */
      originalTotal?: Money;
      
      /**
       * The converted total amount
       */
      convertedTotal?: Money;
      
      /**
       * The fund transfer status of the financial event group
       */
      fundTransferStatus?: string;
      
      /**
       * The type of the financial event group
       */
      financialEventGroupType?: string;
      
      /**
       * The transaction count
       */
      transactionCount?: string;
    }
    
    export interface ShipmentEvent {
      /**
       * The Amazon order ID
       */
      amazonOrderId: string;
      
      /**
       * The seller order ID
       */
      sellerOrderId?: string;
      
      /**
       * The marketplace name
       */
      marketplaceName: string;
      
      /**
       * The order charge list
       */
      orderChargeList?: Array<{
        chargeType: string;
        chargeAmount: Money;
      }>;
      
      /**
       * The order charge adjustment list
       */
      orderChargeAdjustmentList?: Array<{
        chargeType: string;
        chargeAmount: Money;
      }>;
      
      /**
       * The shipment fee list
       */
      shipmentFeeList?: Array<Fee>;
      
      /**
       * The shipment fee adjustment list
       */
      shipmentFeeAdjustmentList?: Array<Fee>;
      
      /**
       * The order fee list
       */
      orderFeeList?: Array<Fee>;
      
      /**
       * The order fee adjustment list
       */
      orderFeeAdjustmentList?: Array<Fee>;
      
      /**
       * The direct payment list
       */
      directPaymentList?: Array<{
        directPaymentType: string;
        directPaymentAmount: Money;
      }>;
      
      /**
       * The posted date
       */
      postedDate: string;
    }
    
    export interface RefundEvent {
      /**
       * The Amazon order ID
       */
      amazonOrderId: string;
      
      /**
       * The seller order ID
       */
      sellerOrderId?: string;
      
      /**
       * The marketplace name
       */
      marketplaceName: string;
      
      /**
       * The refund type
       */
      refundType?: string;
      
      /**
       * The refund amount
       */
      refundAmount?: Money;
      
      /**
       * The fee list
       */
      feeList?: Array<Fee>;
      
      /**
       * The posted date
       */
      postedDate: string;
    }
    
    export interface FinancialEvents {
      /**
       * The shipment event list
       */
      shipmentEventList?: ShipmentEvent[];
      
      /**
       * The refund event list
       */
      refundEventList?: RefundEvent[];
      
      /**
       * The guarantee claim event list
       */
      guaranteeClaimEventList?: any[];
      
      /**
       * The chargeback event list
       */
      chargebackEventList?: any[];
      
      /**
       * The Pay with Amazon event list
       */
      payWithAmazonEventList?: any[];
      
      /**
       * The service provider credit event list
       */
      serviceProviderCreditEventList?: any[];
      
      /**
       * The retrocharge event list
       */
      retrochargeEventList?: any[];
      
      /**
       * The rental transaction event list
       */
      rentalTransactionEventList?: any[];
      
      /**
       * The product ads payment event list
       */
      productAdsPaymentEventList?: any[];
      
      /**
       * The service fee event list
       */
      serviceFeeEventList?: Array<{
        /**
         * The fee list
         */
        feeList?: Array<Fee>;
        
        /**
         * The seller SKU
         */
        sellerSKU?: string;
        
        /**
         * The FNSKU
         */
        fnSKU?: string;
        
        /**
         * The ASIN
         */
        asin?: string;
        
        /**
         * The posted date
         */
        postedDate: string;
      }>;
      
      /**
       * The debt recovery event list
       */
      debtRecoveryEventList?: any[];
      
      /**
       * The loan servicing event list
       */
      loanServicingEventList?: any[];
      
      /**
       * The adjustment event list
       */
      adjustmentEventList?: any[];
      
      /**
       * The SAFE-T program event list
       */
      safeTProgramEventList?: any[];
    }
    
    export interface ListFinancialEventGroupsResponse {
      /**
       * The list of financial event groups
       */
      financialEventGroupList: FinancialEventGroup[];
      
      /**
       * The token to use to retrieve the next page of results
       */
      nextToken?: string;
    }
    
    export interface GetFinancialEventGroupResponse {
      /**
       * The financial event group
       */
      financialEventGroup: FinancialEventGroup;
    }
    
    export interface ListFinancialEventsResponse {
      /**
       * The financial events
       */
      financialEvents: FinancialEvents;
      
      /**
       * The token to use to retrieve the next page of results
       */
      nextToken?: string;
    }
    
    export interface GetFinancialEventsForOrderResponse {
      /**
       * The financial events
       */
      financialEvents: FinancialEvents;
    }
  }
  
  /**
   * Listings Restrictions API types
   */
  export namespace ListingsRestrictions {
    export type RestrictionsIdentifierType = 'ASIN' | 'GTIN' | 'SKU';
    
    export interface Restriction {
      /**
       * A message describing the restriction or violation
       */
      message?: string;
      
      /**
       * The reason code for the restriction
       */
      reasonCode?: string;
      
      /**
       * The name of the program that restricts the listing
       */
      programName?: string;
      
      /**
       * The condition that is restricted
       */
      condition?: string;
      
      /**
       * The date when the restriction will expire, if applicable
       */
      expirationDate?: string;
    }
    
    export interface RestrictionList {
      /**
       * A list of restrictions for the specified product
       */
      restrictions: Restriction[];
    }
  }
  
  /**
   * Solicitations API types
   */
  export namespace Solicitations {
    export type SolicitationType = 'REQUEST_FEEDBACK' | 'REQUEST_REVIEW';
    
    export interface SolicitationAction {
      /**
       * The type of solicitation
       */
      solicitationType: string;
      
      /**
       * Whether the solicitation action is allowed
       */
      isAllowed: boolean;
      
      /**
       * The reason why the solicitation action is not allowed, if applicable
       */
      disallowedReason?: string;
    }
    
    export interface GetSolicitationActionsForOrderResponse {
      /**
       * A list of solicitation actions that are available for the order
       */
      payload: SolicitationAction[];
    }
    
    export interface CreateProductReviewAndSellerFeedbackSolicitationResponse {
      /**
       * The unique identifier for the solicitation
       */
      solicitations?: {
        /**
         * The identifier for the order
         */
        amazonOrderId: string;
        
        /**
         * Whether the solicitation was accepted
         */
        isSuccessful: boolean;
        
        /**
         * The reason why the solicitation was not successful, if applicable
         */
        rejectionReason?: string;
      }[];
    }
  }
}