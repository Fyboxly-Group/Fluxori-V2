import { IInternationalShipment, ICustomsDeclaration, IAddress } from '../models/international-trade.model';

/**
 * Interface for tracking events returned by shipping providers
 */
export interface ITrackingEvent {
  timestamp: Date;
  status: string;
  location: string;
  description: string;
}

/**
 * Interface for tracking information returned by shipping providers
 */
export interface ITrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery?: Date;
  events: ITrackingEvent[];
}

/**
 * Interface for shipping rate returned by providers
 */
export interface IShippingRate {
  provider: string;
  serviceCode: string;
  serviceName: string;
  price: number;
  currency: string;
  estimatedDelivery: {
    min: number; // Delivery estimate in days (minimum)
    max: number; // Delivery estimate in days (maximum)
  };
  restrictions?: {
    weight?: {
      min: number;
      max: number;
      unit: string;
    };
    dimensions?: {
      maxLength: number;
      maxWidth: number;
      maxHeight: number;
      unit: string;
    };
  };
}

/**
 * Interface for created shipment response from providers
 */
export interface ICreatedShipment {
  success: boolean;
  shipmentId: string;
  trackingNumber: string;
  carrier: string;
  service: string;
  price: number;
  currency: string;
  estimatedDelivery?: Date;
  labels?: {
    format: string; // PDF, PNG, etc.
    size: string; // 4x6, A4, etc.
    url: string; // URL to download the label
    data?: string; // Base64 encoded label data
  }[];
  documents?: {
    type: string; // Commercial Invoice, etc.
    format: string; // PDF, etc.
    url: string; // URL to download the document
    data?: string; // Base64 encoded document data
  }[];
}

/**
 * Interface for shipping provider authentication
 */
export interface IShippingProviderAuth {
  apiKey?: string;
  username?: string;
  password?: string;
  accountId?: string;
  accountNumber?: string;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: string | undefined;
}

/**
 * Request interface for getting shipping rates
 */
export interface IRateRequest {
  origin: IAddress;
  destination: IAddress;
  packageDetails: {
    weight: number;
    weightUnit: string;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
  };
  items?: Array<{
    description: string;
    quantity: number;
    value: number;
    hsCode?: string;
    originCountry?: string;
  }>;
  options?: {
    insurance?: {
      required: boolean;
      value: number;
    };
    signature?: boolean;
    saturdayDelivery?: boolean;
    dangerousGoods?: boolean;
    dryIce?: boolean;
  };
  shipmentDate?: Date;
  currency?: string;
}

/**
 * Request interface for creating a shipment
 */
export interface IShipmentRequest {
  shipment: Omit<IInternationalShipment, '_id' | 'userId' | 'organizationId' | 'createdAt' | 'updatedAt' | 'status'>;
  customsDeclaration?: Omit<ICustomsDeclaration, '_id' | 'shipmentId' | 'userId' | 'organizationId' | 'createdAt' | 'updatedAt' | 'status'>;
  options?: {
    insurance?: {
      required: boolean;
      value: number;
    };
    signature?: boolean;
    saturdayDelivery?: boolean;
    dangerousGoods?: boolean;
    returnShippingLabel?: boolean;
    labelFormat?: string; // PDF, PNG, etc.
    labelSize?: string; // 4x6, A4, etc.
  };
  shipmentDate: Date;
  serviceCode: string; // Specific carrier service code
  returnLabel?: boolean;
}

/**
 * Request interface for tracking a shipment
 */
export interface ITrackingRequest {
  trackingNumber: string;
  carrier?: string;
}

/**
 * Interface that all shipping provider adapters must implement
 */
export interface IShippingProvider {
  name: string;
  supportedCountries: string[];
  supportedServices: {
    code: string;
    name: string;
    description?: string;
    international: boolean;
    domestic: boolean;
  }[];
  
  /**
   * Authenticates with the shipping provider's API
   */
  authenticate(): Promise<boolean>;
  
  /**
   * Validates credentials for the shipping provider
   */
  validateCredentials(): Promise<boolean>;
  
  /**
   * Gets shipping rates from the provider
   */
  getRates(request: IRateRequest): Promise<IShippingRate[]>;
  
  /**
   * Creates a new shipment with the provider
   */
  createShipment(request: IShipmentRequest): Promise<ICreatedShipment>;
  
  /**
   * Gets tracking information for a shipment
   */
  getTracking(request: ITrackingRequest): Promise<ITrackingInfo>;
  
  /**
   * Cancels a shipment
   */
  cancelShipment(shipmentId: string): Promise<boolean>;
  
  /**
   * Validates an address with the provider
   */
  validateAddress(address: IAddress): Promise<{
    valid: boolean;
    suggested?: IAddress;
    messages?: string[];
  }>;
  
  /**
   * Generates a return label for a shipment
   */
  createReturnLabel(shipmentId: string): Promise<{
    success: boolean;
    label?: {
      format: string;
      size: string;
      url: string;
      data?: string;
    };
  }>;
}