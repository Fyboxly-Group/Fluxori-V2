import { 
  IShippingRate, 
  IShippingProviderAuth, 
  IRateRequest, 
  IShipmentRequest, 
  ICreatedShipment, 
  ITrackingRequest, 
  ITrackingInfo,
  ITrackingEvent
} from '../../interfaces/shipping-provider.interface';
import { BaseShippingAdapter } from '../common/base-shipping-adapter';
import { IAddress } from '../../models/international-trade.model';
import * as AxiosTypes from 'axios';

// Define types to avoid import issues
type AxiosInstance = any;
type AxiosRequestConfig = any;
type AxiosError = any;

/**
 * DHL Product Rate interface
 */
interface IDHLProductRate {
  productCode: string;
  productName: string;
  totalPrice: Array<{
    price: number;
    currencyCode?: string;
  }>;
  deliveryTime?: {
    minimumDays?: number;
    maximumDays?: number;
  };
}

/**
 * DHL shipment response interface
 */
interface IDHLShipmentResponse {
  shipmentIdentificationNumber?: string;
  shipmentTrackingNumber?: string;
  productCode?: string;
  shipmentCharges?: {
    totalAmount: number;
    currency: string;
  };
  documents?: Array<{
    type: string;
    format?: string;
    size?: string;
    url?: string;
    content?: string;
  }>;
}

/**
 * DHL tracking response shipment interface
 */
interface IDHLTrackingShipment {
  shipmentTrackingNumber?: string;
  status: string;
  estimatedDeliveryDate?: string;
  events?: Array<{
    timestamp: string;
    statusCode: string;
    description?: string;
    location?: {
      address: {
        city?: string;
        countryCode?: string;
      }
    }
  }>;
}

/**
 * DHL API Error interface
 */
interface IDHLApiError {
  detail?: string;
  message?: string;
  title?: string;
  status?: number;
  errors?: Array<{
    message: string;
    path: string;
    code?: string;
  }>;
}

/**
 * DHL Shipping Provider Adapter
 * Implements DHL Express shipping API
 */
export class DHLAdapter extends BaseShippingAdapter {
  private client: AxiosInstance;
  private accessToken: string = '';
  private tokenExpiry: Date = new Date();

  /**
   * Constructor
   * 
   * @param auth Authentication credentials for DHL API
   * @param options Additional options for DHL API
   */
  constructor(auth: IShippingProviderAuth, options?: Record<string, unknown>) {
    super(auth, options);
    
    // Set DHL specific properties
    this.name = 'DHL Express';
    this.apiUrl = options?.testMode ? 
      'https://api-sandbox.dhl.com/express' : 
      'https://api.dhl.com/express';
      
    // Initialize supported countries and services
    this.supportedCountries = [
      'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH',
      'AU', 'NZ', 'JP', 'CN', 'HK', 'SG', 'KR', 'IN', 'ZA', 'BR', 'MX'
      // This is a subset - DHL supports most countries worldwide
    ];
    
    this.supportedServices = [
      {
        code: 'EXPRESS_WORLDWIDE',
        name: 'DHL Express Worldwide',
        description: 'End of day delivery for international shipments',
        international: true,
        domestic: false
      },
      {
        code: 'EXPRESS_12',
        name: 'DHL Express 12:00',
        description: 'Delivery by noon for international shipments',
        international: true,
        domestic: false
      },
      {
        code: 'EXPRESS_9',
        name: 'DHL Express 9:00',
        description: 'Delivery by 9:00 AM for international shipments',
        international: true,
        domestic: false
      },
      {
        code: 'EXPRESS_DOMESTIC',
        name: 'DHL Express Domestic',
        description: 'End of day delivery for domestic shipments',
        international: false,
        domestic: true
      }
    ];
    
    // Initialize HTTP client
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Authenticate with DHL API
   * Obtains an access token for subsequent API calls
   */
  public async authenticate(): Promise<boolean> {
    try {
      // Check if we already have a valid token
      if (this.accessToken && this.tokenExpiry > new Date()) {
        this.isAuthenticated = true;
        return true;
      }

      // If not, request a new token
      if (!this.auth.apiKey || !this.auth.accountNumber) {
        throw new Error('DHL authentication requires apiKey and accountNumber');
      }

      const response = await axios.post(
        `${this.apiUrl}/authentication/v1/token`,
        {},
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.auth.apiKey}:${this.auth.accountNumber}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const responseData = response.data as any;
      if (responseData && responseData.access_token) {
        this.accessToken = responseData.access_token;
        // Set token expiry (usually 1 hour)
        const expiresIn = responseData.expires_in || 3600;
        this.tokenExpiry = new Date(Date.now() + (expiresIn * 1000));
        
        // Update HTTP client headers with the new token
        this.client = axios.create({
          baseURL: this.apiUrl,
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        this.isAuthenticated = true;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('DHL authentication error:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  /**
   * Get shipping rates from DHL
   * 
   * @param request Rate request parameters
   */
  public async getRates(request: IRateRequest): Promise<IShippingRate[]> {
    try {
      await this.ensureAuthenticated();
      
      // Transform request to DHL rate request format
      const dhlRequest = this.formatRateRequest(request);
      
      const response = await this.client.post(
        '/rates/v1/quote',
        dhlRequest
      );
      
      if (!response.data || !response.data.products) {
        return [];
      }
      
      // Transform DHL response to standard shipping rate format
      return this.formatRateResponse(response.data.products, request.currency || 'USD');
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Create a shipment with DHL
   * 
   * @param request Shipment request parameters
   */
  public async createShipment(request: IShipmentRequest): Promise<ICreatedShipment> {
    try {
      await this.ensureAuthenticated();
      
      // Transform request to DHL shipment request format
      const dhlRequest = this.formatShipmentRequest(request);
      
      const response = await this.client.post(
        '/shipments/v1/shipments',
        dhlRequest
      );
      
      if (!response.data || !response.data.shipmentTrackingNumber) {
        throw new Error('Failed to create shipment with DHL');
      }
      
      // Transform DHL response to standard created shipment format
      return this.formatShipmentResponse(response.data);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Get tracking information from DHL
   * 
   * @param request Tracking request parameters
   */
  public async getTracking(request: ITrackingRequest): Promise<ITrackingInfo> {
    try {
      await this.ensureAuthenticated();
      
      if (!request.trackingNumber) {
        throw new Error('Tracking number is required');
      }
      
      const response = await this.client.get(
        `/tracking/v2/shipments?trackingNumber=${request.trackingNumber}`
      );
      
      if (!response.data || !response.data.shipments || response.data.shipments.length === 0) {
        throw new Error(`No tracking information found for ${request.trackingNumber}`);
      }
      
      // Transform DHL response to standard tracking info format
      return this.formatTrackingResponse(response.data.shipments[0]);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Cancel a shipment with DHL
   * 
   * @param shipmentId ID of the shipment to cancel
   */
  public async cancelShipment(shipmentId: string): Promise<boolean> {
    try {
      await this.ensureAuthenticated();
      
      if (!shipmentId) {
        throw new Error('Shipment ID is required');
      }
      
      const response = await this.client.delete(
        `/shipments/v1/shipments/${shipmentId}`
      );
      
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error('Failed to cancel shipment:', error);
      return false;
    }
  }

  /**
   * Validate an address with DHL
   * 
   * @param address Address to validate
   */
  public async validateAddress(address: IAddress): Promise<{
    valid: boolean;
    suggested?: IAddress;
    messages: any[];
  }> {
    try {
      await this.ensureAuthenticated();
      
      const dhlAddress = this.formatAddress(address);
      
      const response = await this.client.post(
        '/address-validate/v1/validate',
        { address: dhlAddress }
      );
      
      if (!response.data) {
        return { valid: false, messages: ['Address validation failed'] };
      }
      
      const result: {
        valid: boolean;
        messages: any[];
        suggested?: IAddress;
      } = {
        valid: response.data.valid === true,
        messages: response.data.messages || []
      };
      
      // If DHL provides suggestion, format it back to our address interface
      if (response.data.suggestion) {
        result.suggested = {
          address: response.data.suggestion.streetAddress || address.address,
          city: response.data.suggestion.city || address.city,
          state: response.data.suggestion.state || address.state,
          postalCode: response.data.suggestion.postalCode || address.postalCode,
          country: response.data.suggestion.country || address.country
        };
      }
      
      return result;
    } catch (error) {
      console.error('Address validation error:', error);
      return { valid: false, messages: ['Address validation service error'] };
    }
  }

  /**
   * Generate a return label for a shipment with DHL
   * 
   * @param shipmentId ID of the shipment to generate a return label for
   */
  public async createReturnLabel(shipmentId: string): Promise<{
    success: boolean;
    label?: {
      format: string;
      size: string;
      url: string;
      data?: string;
    };
  }> {
    try {
      await this.ensureAuthenticated();
      
      if (!shipmentId) {
        throw new Error('Shipment ID is required');
      }
      
      const response = await this.client.post(
        `/shipments/v1/shipments/${shipmentId}/return`,
        {}
      );
      
      if (!response.data || !response.data.documents || !response.data.documents.length) {
        return { success: false };
      }
      
      // Find the label document
      const documents = response.data.documents as Array<{
        type: string;
        format?: string;
        size?: string;
        url?: string;
        content?: string;
      }>;
      
      const labelDoc = documents.find(doc => doc.type === 'label');
      if (!labelDoc) {
        return { success: false };
      }
      
      return {
        success: true,
        label: {
          format: labelDoc.format || 'PDF',
          size: labelDoc.size || 'A4',
          url: labelDoc.url || '',
          data: labelDoc.content || undefined
        }
      };
    } catch (error) {
      console.error('Failed to create return label:', error);
      return { success: false };
    }
  }

  // Helper methods for formatting requests and responses

  /**
   * Format a rate request to DHL API format
   * 
   * @param request Standard rate request
   */
  private formatRateRequest(request: IRateRequest): Record<string, unknown> {
    // Implementation would convert our standard rate request to DHL's specific format
    // This is a simplified example - actual implementation would be more detailed
    return {
      customerDetails: {
        shipperDetails: {
          postalCode: request.origin.postalCode,
          cityName: request.origin.city,
          countryCode: request.origin.country
        },
        receiverDetails: {
          postalCode: request.destination.postalCode,
          cityName: request.destination.city,
          countryCode: request.destination.country
        }
      },
      plannedShippingDate: request.shipmentDate ? request.shipmentDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      unitOfMeasurement: request.packageDetails.weightUnit === 'kg' ? 'metric' : 'imperial',
      packages: [{
        weight: request.packageDetails.weight,
        dimensions: request.packageDetails.dimensions ? {
          length: request.packageDetails.dimensions.length,
          width: request.packageDetails.dimensions.width,
          height: request.packageDetails.dimensions.height
        } : undefined
      }]
    };
  }

  // Interface has been moved to the module scope

  /**
   * Format DHL rate response to standard shipping rate format
   * 
   * @param products DHL rate products
   * @param currency Currency code
   */
  private formatRateResponse(products: IDHLProductRate[], currency: string): IShippingRate[] {
    // Implementation would convert DHL's response to our standard rate format
    return products.map(product => ({
      provider: this.name,
      serviceCode: product.productCode,
      serviceName: product.productName,
      price: product.totalPrice[0]?.price || 0,
      currency: product.totalPrice[0]?.currencyCode || currency,
      estimatedDelivery: {
        min: product.deliveryTime?.minimumDays || 1,
        max: product.deliveryTime?.maximumDays || 7
      }
    }));
  }

  /**
   * Format a shipment request to DHL API format
   * 
   * @param request Standard shipment request
   */
  private formatShipmentRequest(request: IShipmentRequest): Record<string, unknown> {
    // Implementation would convert our standard shipment request to DHL's specific format
    // This is a simplified example - actual implementation would be more detailed
    return {
      plannedShippingDate: request.shipmentDate.toISOString().split('T')[0],
      pickup: {
        isRequested: false
      },
      productCode: request.serviceCode,
      accounts: [{
        typeCode: 'shipper',
        number: this.auth.accountNumber
      }],
      customerReferences: [
        {
          value: request.shipment.shipmentId || `ORDER-${Date.now()}`
        }
      ],
      shipmentNotification: [
        {
          typeCode: 'email',
          receiverId: 'recipient',
          languageCode: 'en',
          channelType: 'email'
        }
      ],
      shipper: this.formatAddress(request.shipment.origin),
      receiver: this.formatAddress(request.shipment.destination),
      content: {
        packages: [{
          weight: request.shipment.packageDetails.weight,
          dimensions: {
            length: request.shipment.packageDetails.dimensions.length,
            width: request.shipment.packageDetails.dimensions.width,
            height: request.shipment.packageDetails.dimensions.height
          }
        }],
        isCustomsDeclarable: !!request.customsDeclaration,
        declaredValue: request.customsDeclaration ? request.customsDeclaration.totalValue : undefined,
        declaredValueCurrency: request.customsDeclaration ? request.customsDeclaration.currency : undefined
      },
      // Add customs declarations if provided
      ...(request.customsDeclaration ? {
        exportDeclaration: {
          lineItems: request.customsDeclaration.items.map((item, index) => ({
            number: index + 1,
            description: item.description,
            price: item.unitValue,
            quantity: {
              value: item.quantity,
              unitOfMeasurement: 'PCS'
            },
            commodityCodes: [{
              typeCode: 'HS',
              value: item.hsCode
            }],
            exportReasonType: request.customsDeclaration.declarationType.toUpperCase(),
            manufacturerCountry: item.originCountry
          })),
          invoice: {
            number: `INV-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            totalNetWeight: request.customsDeclaration.items.reduce((sum, item) => sum + item.netWeight, 0),
            totalGrossWeight: request.customsDeclaration.items.reduce((sum, item) => sum + item.netWeight, 0) * 1.1
          }
        }
      } : {})
    };
  }

  // Interface has been moved to the module scope

  /**
   * Format DHL shipment response to standard created shipment format
   * 
   * @param response DHL shipment response
   */
  private formatShipmentResponse(response: IDHLShipmentResponse): ICreatedShipment {
    // Default values for required fields
    const shipmentId = response.shipmentIdentificationNumber || '';
    const trackingNumber = response.shipmentTrackingNumber || '';
    const service = response.productCode || '';
    const price = response.shipmentCharges?.totalAmount || 0;
    const currency = response.shipmentCharges?.currency || 'USD';
    
    // Process documents and labels with proper typing
    const documents = response.documents || [];
    
    const labels = documents
      .filter(doc => doc.type === 'label')
      .map(doc => ({
        format: doc.format || 'PDF',
        size: doc.size || 'A4',
        url: doc.url || '',
        data: doc.content
      }));
    
    const otherDocs = documents
      .filter(doc => doc.type !== 'label')
      .map(doc => ({
        type: doc.type,
        format: doc.format || 'PDF',
        url: doc.url || '',
        data: doc.content
      }));
    
    // Return properly structured response
    return {
      success: true,
      shipmentId,
      trackingNumber,
      carrier: this.name,
      service,
      price,
      currency,
      labels,
      documents: otherDocs
    };
  }

  // Interface has been moved to the module scope

  /**
   * Format DHL tracking response to standard tracking info format
   * 
   * @param shipment DHL tracking response shipment
   */
  private formatTrackingResponse(shipment: IDHLTrackingShipment): ITrackingInfo {
    // Extract tracking number with fallback to empty string
    const trackingNumber = shipment.shipmentTrackingNumber || '';
    
    // Map DHL status to our generic status
    const status = this.mapDHLStatusToGeneric(shipment.status);
    
    // Parse estimated delivery date if present
    const estimatedDelivery = shipment.estimatedDeliveryDate 
      ? new Date(shipment.estimatedDeliveryDate) 
      : undefined;
    
    // Process tracking events with proper typing
    const events: ITrackingEvent[] = shipment.events 
      ? shipment.events.map(event => {
          // Create location string if location data exists
          const location = event.location
            ? `${event.location.address.city || ''}, ${event.location.address.countryCode || ''}`
            : '';
            
          return {
            timestamp: new Date(event.timestamp),
            status: this.mapDHLStatusToGeneric(event.statusCode),
            location,
            description: event.description || ''
          };
        }) 
      : [];
    
    // Return properly structured tracking info
    return {
      trackingNumber,
      carrier: this.name,
      status,
      estimatedDelivery,
      events
    };
  }

  /**
   * Map DHL status codes to generic status names
   * 
   * @param dhlStatus DHL status code
   */
  private mapDHLStatusToGeneric(dhlStatus: string): string {
    // Map DHL-specific status codes to our generic statuses
    const statusMap: Record<string, string> = {
      'pre-transit': 'pending',
      'transit': 'in_transit',
      'delivered': 'delivered',
      'failure': 'failed',
      // Add more mappings as needed
    };
    
    return statusMap[dhlStatus.toLowerCase()] || dhlStatus;
  }

  /**
   * Format address for DHL API
   * 
   * @param address Standard address
   */
  protected formatAddress(address: IAddress): Record<string, unknown> {
    return {
      streetAddress: address.address,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      countryCode: address.country
    };
  }

  // Interface has been moved to the module scope

  /**
   * Handle API errors specifically for DHL
   * 
   * @param error Error from DHL API
   */
  protected handleApiError(error: unknown): never {
    // Log error for debugging
    console.error('DHL API error:', error);
    
    // Handle Axios errors with DHL-specific response format
    if (error instanceof Error) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.data) {
        const dhlError = axiosError.response.data as IDHLApiError;
        
        // If DHL provides a detail message
        if (dhlError.detail) {
          throw new Error(`DHL API error: ${dhlError.detail}`);
        }
        
        // If DHL provides errors array
        if (dhlError.errors && dhlError.errors.length > 0) {
          const errorMessages = dhlError.errors
            .map(err => `${err.path}: ${err.message}`)
            .join('; ');
          throw new Error(`DHL API validation errors: ${errorMessages}`);
        }
        
        // If DHL provides a title or message
        if (dhlError.title || dhlError.message) {
          throw new Error(`DHL API error: ${dhlError.title || dhlError.message}`);
        }
      }
      
      // For standard Error objects
      throw new Error(`DHL error: ${error.message}`);
    }
    
    // For completely unknown errors
    throw new Error('Unknown DHL error');
  }
}
