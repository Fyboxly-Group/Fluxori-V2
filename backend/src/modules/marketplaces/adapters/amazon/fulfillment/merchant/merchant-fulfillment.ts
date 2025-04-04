/**
 * Amazon Merchant Fulfillment API Module
 * 
 * Implements the Amazon SP-API Merchant Fulfillment API functionality.
 * This module provides operations for creating shipments using Amazon's contracted rates,
 * generating shipping labels, and selecting carriers.
 */

import { ApiRequestFunction, ApiResponse, BaseModule } from '../../core/base-module.interface';
import AmazonErrorHandler, { AmazonErrorCode } from '../../utils/amazon-error';

/**
 * Shipping address information
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
   * Address line 2 (optional)
   */
  addressLine2?: string;
  
  /**
   * Address line 3 (optional)
   */
  addressLine3?: string;
  
  /**
   * City
   */
  city: string;
  
  /**
   * State or province code
   */
  stateOrProvinceCode: string;
  
  /**
   * Postal code
   */
  postalCode: string;
  
  /**
   * Country code
   */
  countryCode: string;
  
  /**
   * Phone number
   */
  phone?: string;
  
  /**
   * Email address
   */
  email?: string;
}

/**
 * Package dimensions
 */
export interface PackageDimensions {
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
  unit: 'inches' | 'centimeters';
}

/**
 * Weight value
 */
export interface Weight {
  /**
   * Value
   */
  value: number;
  
  /**
   * Unit
   */
  unit: 'oz' | 'g' | 'kg' | 'lb';
}

/**
 * Money value
 */
export interface Money {
  /**
   * Currency code
   */
  currencyCode: string;
  
  /**
   * Amount as a string
   */
  amount: string;
}

/**
 * Status of the shipment
 */
export type ShipmentStatus = 'Created' | 'Purchased' | 'Cancelled' | 'Error';

/**
 * Delivery experience type
 */
export type DeliveryExperienceType = 'DeliveryConfirmationWithAdultSignature' | 
  'DeliveryConfirmationWithSignature' | 
  'DeliveryConfirmationWithoutSignature' | 
  'NoTracking';

/**
 * Carrier will pick up option
 */
export type CarrierWillPickUpOption = 'CarrierWillPickUp' | 'ShipperWillDropOff';

/**
 * Label format option
 */
export type LabelFormatOption = 'PDF' | 'PNG' | 'ZPL';

/**
 * Standard label size
 */
export type StandardLabelSize = '4x6' | '4x8' | '4x12';

/**
 * Shipping service offering
 */
export interface ShippingServiceOffering {
  /**
   * Shipping service ID
   */
  shippingServiceId: string;
  
  /**
   * Shipping service name
   */
  shippingServiceName: string;
  
  /**
   * Carrier name
   */
  carrierName: string;
  
  /**
   * Shipping service options
   */
  shippingServiceOptions: {
    /**
     * Delivery experience type
     */
    deliveryExperience: DeliveryExperienceType;
    
    /**
     * Carrier will pick up
     */
    carrierWillPickUp: boolean;
    
    /**
     * Declared value
     */
    declaredValue?: Money;
  };
  
  /**
   * Rate with the specified options
   */
  rate: {
    /**
     * Total amount
     */
    amount: Money;
    
    /**
     * Shipping service constraints fulfilled?
     */
    shippingServiceConstraintsFulfilled?: boolean;
  };
  
  /**
   * Delivery time information
   */
  deliveryTime?: {
    /**
     * Minimum transit time in days
     */
    minimumTransitTimeInDays?: number;
    
    /**
     * Maximum transit time in days
     */
    maximumTransitTimeInDays?: number;
  };
  
  /**
   * Available label formats
   */
  availableLabelFormats?: LabelFormatOption[];
  
  /**
   * Available format options for the shipping service
   */
  availableFormatOptionsForLabel?: LabelFormatOption[];
  
  /**
   * Available carrier packaging options
   */
  availableCarrierPackagingOptions?: {
    /**
     * Package identifier
     */
    packageIdentifier: string;
    
    /**
     * Package name
     */
    packageName: string;
  }[];
}

/**
 * Get eligible shipping services request
 */
export interface GetEligibleShippingServicesRequest {
  /**
   * Amazon order ID
   */
  amazonOrderId: string;
  
  /**
   * Item list
   */
  itemList: {
    /**
     * Order item ID
     */
    orderItemId: string;
    
    /**
     * Quantity
     */
    quantity: number;
    
    /**
     * Item weight
     */
    itemWeight?: Weight;
  }[];
  
  /**
   * Ship from address
   */
  shipFromAddress: Address;
  
  /**
   * Package dimensions
   */
  packageDimensions: PackageDimensions;
  
  /**
   * Package weight
   */
  weight?: Weight;
  
  /**
   * Must arrive by date
   */
  mustArriveByDate?: string;
  
  /**
   * Ship date
   */
  shipDate?: string;
  
  /**
   * Shipping service options
   */
  shippingServiceOptions?: {
    /**
     * Delivery experience type
     */
    deliveryExperience?: DeliveryExperienceType;
    
    /**
     * Carrier will pick up option
     */
    carrierWillPickUp?: CarrierWillPickUpOption;
    
    /**
     * Declared value
     */
    declaredValue?: Money;
  };
  
  /**
   * Label customization
   */
  labelCustomization?: {
    /**
     * Custom text for label
     */
    customTextForLabel?: string;
    
    /**
     * Standard ID for label
     */
    standardIdForLabel?: string;
  };
}

/**
 * Create shipment request
 */
export interface CreateShipmentRequest {
  /**
   * Amazon order ID
   */
  amazonOrderId: string;
  
  /**
   * Item list
   */
  itemList: {
    /**
     * Order item ID
     */
    orderItemId: string;
    
    /**
     * Quantity
     */
    quantity: number;
    
    /**
     * Item weight
     */
    itemWeight?: Weight;
  }[];
  
  /**
   * Ship from address
   */
  shipFromAddress: Address;
  
  /**
   * Package dimensions
   */
  packageDimensions: PackageDimensions;
  
  /**
   * Package weight
   */
  weight?: Weight;
  
  /**
   * Must arrive by date
   */
  mustArriveByDate?: string;
  
  /**
   * Ship date
   */
  shipDate?: string;
  
  /**
   * Shipping service ID
   */
  shippingServiceId: string;
  
  /**
   * Shipping service options
   */
  shippingServiceOptions: {
    /**
     * Delivery experience type
     */
    deliveryExperience: DeliveryExperienceType;
    
    /**
     * Carrier will pick up
     */
    carrierWillPickUp: boolean;
    
    /**
     * Declared value
     */
    declaredValue?: Money;
  };
  
  /**
   * Label specification
   */
  labelSpecification: {
    /**
     * Label format
     */
    labelFormat: LabelFormatOption;
    
    /**
     * Label stock size
     */
    labelStockSize?: StandardLabelSize;
  };
}

/**
 * Shipment information
 */
export interface Shipment {
  /**
   * Shipment ID
   */
  shipmentId: string;
  
  /**
   * Amazon order ID
   */
  amazonOrderId: string;
  
  /**
   * Seller order ID
   */
  sellerOrderId?: string;
  
  /**
   * Item list
   */
  itemList: {
    /**
     * Order item ID
     */
    orderItemId: string;
    
    /**
     * Quantity
     */
    quantity: number;
    
    /**
     * Item weight
     */
    itemWeight?: Weight;
  }[];
  
  /**
   * Ship from address
   */
  shipFromAddress: Address;
  
  /**
   * Ship to address
   */
  shipToAddress: Address;
  
  /**
   * Package dimensions
   */
  packageDimensions: PackageDimensions;
  
  /**
   * Package weight
   */
  weight: Weight;
  
  /**
   * Status of the shipment
   */
  status: ShipmentStatus;
  
  /**
   * Tracking ID
   */
  trackingId?: string;
  
  /**
   * Created date
   */
  createdDate: string;
  
  /**
   * Label
   */
  label?: {
    /**
     * Label format
     */
    labelFormat: LabelFormatOption;
    
    /**
     * Label data as Base64 encoded string
     */
    labelData: string;
  };
}

/**
 * Shipment tracking information
 */
export interface TrackingInformation {
  /**
   * Tracking ID
   */
  trackingId: string;
  
  /**
   * Carrier name
   */
  carrierName: string;
  
  /**
   * Current status
   */
  status: string;
  
  /**
   * Tracking events
   */
  trackingEvents: {
    /**
     * Event date
     */
    eventDate: string;
    
    /**
     * Event description
     */
    eventDescription: string;
    
    /**
     * Event location
     */
    eventLocation?: string;
  }[];
}

/**
 * Interface for merchant fulfillment module options
 */
export interface MerchantFulfillmentModuleOptions {
  // Optional configuration specific to merchant fulfillment module
}

/**
 * Implementation of the Amazon Merchant Fulfillment API
 */
export class MerchantFulfillmentModule implements BaseModule<MerchantFulfillmentModuleOptions> {
  /**
   * The unique identifier for this module
   */
  public readonly moduleId: string = 'merchantFulfillment';
  
  /**
   * The human-readable name of this module
   */
  public readonly moduleName: string = 'Merchant Fulfillment';
  
  /**
   * The base URL path for API requests
   */
  public readonly basePath: string = '/merchant-fulfillment';
  
  /**
   * API version
   */
  public readonly apiVersion: string;
  
  /**
   * Marketplace ID
   */
  public readonly marketplaceId: string;
  
  /**
   * Additional configuration options for this module
   */
  public readonly options: MerchantFulfillmentModuleOptions = {};
  
  /**
   * The API request function used by this module
   */
  public readonly apiRequest: ApiRequestFunction;
  
  /**
   * Constructor
   * @param apiVersion API version
   * @param apiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(
    apiVersion: string,
    apiRequest: ApiRequestFunction,
    marketplaceId: string
  ) {
    this.apiVersion = apiVersion;
    this.apiRequest = apiRequest;
    this.marketplaceId = marketplaceId;
  }
  
  /**
   * Get eligible shipping services for an order
   * @param request Request to get eligible shipping services
   * @returns Eligible shipping services
   */
  public async getEligibleShippingServices(
    request: GetEligibleShippingServicesRequest
  ): Promise<ShippingServiceOffering[]> {
    try {
      const response = await this.apiRequest(
        `${this.basePath}/eligibleShippingServices`,
        'POST',
        request
      );
      
      return (response.data?.payload?.shippingServiceList || []) as ShippingServiceOffering[];
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Create a shipment with label
   * @param request Request to create a shipment
   * @returns Shipment information with label
   */
  public async createShipment(request: CreateShipmentRequest): Promise<Shipment> {
    try {
      const response = await this.apiRequest(
        `${this.basePath}/shipments`,
        'POST',
        request
      );
      
      return response.data?.payload as Shipment;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get a shipment by ID
   * @param shipmentId Shipment ID
   * @returns Shipment information
   */
  public async getShipment(shipmentId: string): Promise<Shipment> {
    if (!shipmentId) {
      throw AmazonErrorHandler.createError(
        'Shipment ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.apiRequest(
        `${this.basePath}/shipments/${shipmentId}`,
        'GET'
      );
      
      return response.data?.payload as Shipment;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Cancel a shipment
   * @param shipmentId Shipment ID
   * @returns Cancelled shipment information
   */
  public async cancelShipment(shipmentId: string): Promise<Shipment> {
    if (!shipmentId) {
      throw AmazonErrorHandler.createError(
        'Shipment ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.apiRequest(
        `${this.basePath}/shipments/${shipmentId}`,
        'DELETE'
      );
      
      return response.data?.payload as Shipment;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get tracking information for a shipment
   * @param shipmentId Shipment ID
   * @returns Tracking information
   */
  public async getTrackingInformation(shipmentId: string): Promise<TrackingInformation> {
    if (!shipmentId) {
      throw AmazonErrorHandler.createError(
        'Shipment ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const response = await this.apiRequest(
        `${this.basePath}/shipments/${shipmentId}/tracking`,
        'GET'
      );
      
      return response.data?.payload as TrackingInformation;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Get shipping label by shipment ID
   * @param shipmentId Shipment ID
   * @param labelFormat Format of the label (default: PDF)
   * @returns Label data as Base64 encoded string
   */
  public async getShippingLabel(shipmentId: string, labelFormat: LabelFormatOption = 'PDF'): Promise<string> {
    if (!shipmentId) {
      throw AmazonErrorHandler.createError(
        'Shipment ID is required',
        AmazonErrorCode.INVALID_INPUT
      );
    }
    
    try {
      const shipment = await this.getShipment(shipmentId);
      
      if (!shipment.label || !shipment.label.labelData) {
        throw AmazonErrorHandler.createError(
          'No label available for this shipment',
          AmazonErrorCode.RESOURCE_NOT_FOUND
        );
      }
      
      return shipment.label.labelData;
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Find the cheapest shipping service for an order
   * @param request Request to get eligible shipping services
   * @returns The cheapest shipping service, or null if none are available
   */
  public async findCheapestShippingService(
    request: GetEligibleShippingServicesRequest
  ): Promise<ShippingServiceOffering | null> {
    try {
      const services = await this.getEligibleShippingServices(request);
      
      if (services.length === 0) {
        return null;
      }
      
      // Sort by price (lowest first)
      return services.sort((a, b) => {
        const aAmount = parseFloat(a.rate.amount.amount);
        const bAmount = parseFloat(b.rate.amount.amount);
        return aAmount - bAmount;
      })[0];
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Find the fastest shipping service for an order
   * @param request Request to get eligible shipping services
   * @returns The fastest shipping service, or null if none are available
   */
  public async findFastestShippingService(
    request: GetEligibleShippingServicesRequest
  ): Promise<ShippingServiceOffering | null> {
    try {
      const services = await this.getEligibleShippingServices(request);
      
      if (services.length === 0) {
        return null;
      }
      
      // Sort by minimum transit time (lowest first)
      return services
        .filter(service => service.deliveryTime && service.deliveryTime.minimumTransitTimeInDays !== undefined)
        .sort((a, b) => {
          const aTime = a.deliveryTime?.minimumTransitTimeInDays || Number.MAX_SAFE_INTEGER;
          const bTime = b.deliveryTime?.minimumTransitTimeInDays || Number.MAX_SAFE_INTEGER;
          return aTime - bTime;
        })[0] || services[0]; // Return first service if none have delivery time
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Create a shipment with the cheapest shipping service
   * @param orderRequest Request with order information
   * @param labelFormat Format for the label (default: PDF)
   * @returns Created shipment with label
   */
  public async createShipmentWithCheapestService(
    orderRequest: GetEligibleShippingServicesRequest,
    labelFormat: LabelFormatOption = 'PDF'
  ): Promise<Shipment | null> {
    try {
      // Find cheapest service
      const cheapestService = await this.findCheapestShippingService(orderRequest);
      
      if (!cheapestService) {
        return null;
      }
      
      // Create shipment request
      const shipmentRequest: CreateShipmentRequest = {
        ...orderRequest,
        shippingServiceId: cheapestService.shippingServiceId,
        shippingServiceOptions: cheapestService.shippingServiceOptions,
        labelSpecification: {
          labelFormat,
          labelStockSize: '4x6'
        }
      };
      
      // Create the shipment
      return await this.createShipment(shipmentRequest);
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
  
  /**
   * Create a shipment with the fastest shipping service
   * @param orderRequest Request with order information
   * @param labelFormat Format for the label (default: PDF)
   * @returns Created shipment with label
   */
  public async createShipmentWithFastestService(
    orderRequest: GetEligibleShippingServicesRequest,
    labelFormat: LabelFormatOption = 'PDF'
  ): Promise<Shipment | null> {
    try {
      // Find fastest service
      const fastestService = await this.findFastestShippingService(orderRequest);
      
      if (!fastestService) {
        return null;
      }
      
      // Create shipment request
      const shipmentRequest: CreateShipmentRequest = {
        ...orderRequest,
        shippingServiceId: fastestService.shippingServiceId,
        shippingServiceOptions: fastestService.shippingServiceOptions,
        labelSpecification: {
          labelFormat,
          labelStockSize: '4x6'
        }
      };
      
      // Create the shipment
      return await this.createShipment(shipmentRequest);
    } catch (error) {
      throw error instanceof Error 
        ? AmazonErrorHandler.createError(error.message, AmazonErrorCode.OPERATION_FAILED)
        : AmazonErrorHandler.createError('Unknown error', AmazonErrorCode.UNKNOWN_ERROR);
    }
  }
}
