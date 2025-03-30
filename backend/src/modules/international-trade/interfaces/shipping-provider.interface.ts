import { 
  IInternationalShipment, 
  ICustomsDeclaration, 
  IShippingRate 
} from '../models/international-trade.model';

/**
 * Rate Request interface - common format for all shipping providers
 */
export interface RateRequest {
  origin: {
    country: string;
    postalCode: string;
    city?: string;
    state?: string;
  };
  destination: {
    country: string;
    postalCode: string;
    city?: string;
    state?: string;
  };
  packages: Array<{
    weight: number;
    weightUnit: string;
    length: number;
    width: number;
    height: number;
    dimensionUnit: string;
    packageType?: string;
  }>;
  options?: {
    insuranceRequired?: boolean;
    insuranceAmount?: number;
    signatureRequired?: boolean;
    residentialDelivery?: boolean;
    saturdayDelivery?: boolean;
  };
  shipmentType?: string;
}

/**
 * Rate Quote interface - common format for all shipping providers
 */
export interface RateQuote {
  carrierId: string;
  carrierName: string;
  serviceCode: string;
  serviceName: string;
  baseRate: number;
  taxes: number;
  fees: number;
  totalRate: number;
  currency: string;
  estimatedDelivery?: Date;
  transitDays?: number;
  guaranteedDelivery: boolean;
}

/**
 * Shipment Request interface - common format for all shipping providers
 */
export interface ShipmentRequest {
  shipment: IInternationalShipment;
  customsDeclaration?: ICustomsDeclaration;
  selectedRate?: IShippingRate;
  options?: {
    returnShippingLabel?: boolean;
    printCustomsForm?: boolean;
    emailNotifications?: boolean;
    notificationEmail?: string;
  };
}

/**
 * Shipment Response interface - common format for all shipping providers
 */
export interface ShipmentResponse {
  success: boolean;
  trackingNumber?: string;
  labelUrl?: string;
  customsFormUrl?: string;
  shipmentId?: string;
  carrierShipmentId?: string;
  estimatedDelivery?: Date;
  totalCost?: number;
  currency?: string;
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
}

/**
 * Tracking Request interface - common format for all shipping providers
 */
export interface TrackingRequest {
  trackingNumber: string;
  carrierCode: string;
}

/**
 * Tracking Event interface - common format for all shipping providers
 */
export interface TrackingEvent {
  timestamp: Date;
  status: string;
  location: string;
  description: string;
  isDelivered: boolean;
}

/**
 * Tracking Response interface - common format for all shipping providers
 */
export interface TrackingResponse {
  success: boolean;
  trackingNumber: string;
  carrierCode: string;
  carrierName: string;
  status: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  events: TrackingEvent[];
  errors?: Array<{
    code: string;
    message: string;
  }>;
}

/**
 * Shipping Provider Authentication interface - common format for all shipping providers
 */
export interface ShippingProviderAuth {
  type: 'api_key' | 'oauth2' | 'basic';
  credentials: {
    [key: string]: string;
  };
}

/**
 * Shipping Provider interface - to be implemented by all shipping provider adapters
 */
export interface IShippingProvider {
  /**
   * Provider identification
   */
  providerId: string;
  providerName: string;
  
  /**
   * Authentication with the shipping provider
   */
  authenticate(auth: ShippingProviderAuth): Promise<boolean>;
  
  /**
   * Get shipping rates from the provider
   */
  getRates(request: RateRequest): Promise<RateQuote[]>;
  
  /**
   * Create a shipment with the provider
   */
  createShipment(request: ShipmentRequest): Promise<ShipmentResponse>;
  
  /**
   * Track a shipment with the provider
   */
  trackShipment(request: TrackingRequest): Promise<TrackingResponse>;
  
  /**
   * Cancel a shipment with the provider
   */
  cancelShipment(shipmentId: string): Promise<{
    success: boolean;
    message?: string;
    refundAmount?: number;
    currency?: string;
    errors?: Array<{
      code: string;
      message: string;
    }>;
  }>;
  
  /**
   * Validate a shipping address with the provider
   */
  validateAddress(address: {
    country: string;
    postalCode: string;
    city?: string;
    state?: string;
    addressLine1?: string;
    addressLine2?: string;
  }): Promise<{
    valid: boolean;
    normalizedAddress?: {
      country: string;
      postalCode: string;
      city: string;
      state: string;
      addressLine1: string;
      addressLine2?: string;
    };
    errors?: Array<{
      code: string;
      message: string;
      field?: string;
    }>;
  }>;
}