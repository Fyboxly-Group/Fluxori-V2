import { 
  IShippingRate, 
  IShippingProviderAuth, 
  IRateRequest, 
  IShipmentRequest, 
  ICreatedShipment, 
  ITrackingRequest, 
  ITrackingInfo 
} from '../../interfaces/shipping-provider.interface';
import { BaseShippingAdapter } from '../common/base-shipping-adapter';
import { IAddress } from '../../models/international-trade.model';
import * as AxiosTypes from 'axios';

// Define type to avoid import issues
type AxiosInstance = any;

/**
 * FedEx Shipping Provider Adapter
 * Implements FedEx Web Services API
 */
export class FedExAdapter extends BaseShippingAdapter {
  private client: AxiosInstance;
  private accessToken: string = '';
  private tokenExpiry: Date = new Date();

  /**
   * Constructor
   * 
   * @param auth Authentication credentials for FedEx API
   * @param options Additional options for FedEx API
   */
  constructor(auth: IShippingProviderAuth, options?: Record<string, unknown>) {
    super(auth, options);
    
    // Set FedEx specific properties
    this.name = 'FedEx';
    this.apiUrl = options?.testMode ? 
      'https://apis-sandbox.fedex.com' : 
      'https://apis.fedex.com';
      
    // Initialize supported countries and services
    this.supportedCountries = [
      'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH',
      'AU', 'NZ', 'JP', 'CN', 'HK', 'SG', 'KR', 'IN', 'ZA', 'BR', 'MX'
      // This is a subset - FedEx supports most countries worldwide
    ];
    
    this.supportedServices = [
      {
        code: 'PRIORITY_OVERNIGHT',
        name: 'FedEx Priority Overnight',
        description: 'Next business day delivery by 10:30 AM',
        international: false,
        domestic: true
      },
      {
        code: 'STANDARD_OVERNIGHT',
        name: 'FedEx Standard Overnight',
        description: 'Next business day delivery by 3:00 PM',
        international: false,
        domestic: true
      },
      {
        code: 'INTERNATIONAL_PRIORITY',
        name: 'FedEx International Priority',
        description: 'Time-definite delivery to major markets',
        international: true,
        domestic: false
      },
      {
        code: 'INTERNATIONAL_ECONOMY',
        name: 'FedEx International Economy',
        description: 'Cost-effective delivery to major markets',
        international: true,
        domestic: false
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
   * Authenticate with FedEx API
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
      if (!this.auth.apiKey || !this.auth.apiSecret || !this.auth.accountNumber) {
        throw new Error('FedEx authentication requires apiKey, apiSecret, and accountNumber');
      }

      const response = await axios.post(
        `${this.apiUrl}/oauth/token`,
        {
          grant_type: 'client_credentials',
          client_id: this.auth.apiKey,
          client_secret: this.auth.apiSecret
        },
        {
          headers: {
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
      console.error('FedEx authentication error:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  /**
   * Get shipping rates from FedEx
   * 
   * @param request Rate request parameters
   */
  public async getRates(request: IRateRequest): Promise<IShippingRate[]> {
    try {
      await this.ensureAuthenticated();
      
      // Transform request to FedEx rate request format
      const fedexRequest = this.formatRateRequest(request);
      
      const response = await this.client.post(
        '/rate/v1/rates/quotes',
        fedexRequest
      );
      
      if (!response.data || !response.data.output || !response.data.output.rateReplyDetails) {
        return [];
      }
      
      // Transform FedEx response to standard shipping rate format
      return this.formatRateResponse(response.data.output.rateReplyDetails, request.currency || 'USD');
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Create a shipment with FedEx
   * 
   * @param request Shipment request parameters
   */
  public async createShipment(request: IShipmentRequest): Promise<ICreatedShipment> {
    try {
      await this.ensureAuthenticated();
      
      // Transform request to FedEx shipment request format
      const fedexRequest = this.formatShipmentRequest(request);
      
      const response = await this.client.post(
        '/ship/v1/shipments',
        fedexRequest
      );
      
      if (!response.data || !response.data.output || !response.data.output.transactionShipments) {
        throw new Error('Failed to create shipment with FedEx');
      }
      
      // Transform FedEx response to standard created shipment format
      return this.formatShipmentResponse(response.data.output.transactionShipments[0]);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Get tracking information from FedEx
   * 
   * @param request Tracking request parameters
   */
  public async getTracking(request: ITrackingRequest): Promise<ITrackingInfo> {
    try {
      await this.ensureAuthenticated();
      
      if (!request.trackingNumber) {
        throw new Error('Tracking number is required');
      }
      
      const response = await this.client.post(
        '/track/v1/trackingnumbers',
        {
          includeDetailedScans: true,
          trackingInfo: [
            {
              trackingNumberInfo: {
                trackingNumber: request.trackingNumber
              }
            }
          ]
        }
      );
      
      if (!response.data || !response.data.output || !response.data.output.completeTrackResults || 
          !response.data.output.completeTrackResults[0] || !response.data.output.completeTrackResults[0].trackResults) {
        throw new Error(`No tracking information found for ${request.trackingNumber}`);
      }
      
      // Transform FedEx response to standard tracking info format
      return this.formatTrackingResponse(response.data.output.completeTrackResults[0].trackResults[0]);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Cancel a shipment with FedEx
   * 
   * @param shipmentId ID of the shipment to cancel
   */
  public async cancelShipment(shipmentId: string): Promise<boolean> {
    try {
      await this.ensureAuthenticated();
      
      if (!shipmentId) {
        throw new Error('Shipment ID is required');
      }
      
      const response = await this.client.put(
        '/ship/v1/shipments/cancel',
        {
          trackingNumber: shipmentId
        }
      );
      
      // FedEx returns a 200 status if the cancellation was successful
      return response.status === 200;
    } catch (error) {
      console.error('Failed to cancel shipment:', error);
      return false;
    }
  }

  /**
   * Validate an address with FedEx
   * 
   * @param address Address to validate
   */
  public async validateAddress(address: IAddress): Promise<{
    valid: boolean;
    suggested?: IAddress;
    messages?: string[];
  }> {
    try {
      await this.ensureAuthenticated();
      
      const fedexAddress = this.formatAddress(address);
      
      const response = await this.client.post(
        '/address/v1/addresses/resolve',
        {
          addressesToValidate: [
            {
              address: fedexAddress
            }
          ]
        }
      );
      
      if (!response.data || !response.data.output || !response.data.output.resolvedAddresses) {
        return { valid: false, messages: ['Address validation failed'] };
      }
      
      const validationResult = response.data.output.resolvedAddresses[0];
      
      // Define message interface to avoid 'any' type
      interface CustomerMessage {
        code: string;
        message: string;
      }
      
      // Type check and default to empty array if undefined
      const customerMessages: CustomerMessage[] = Array.isArray(validationResult.customerMessages) 
        ? validationResult.customerMessages 
        : [];
      
      const isValid = customerMessages.some(msg => 
        msg.code === 'SUCCESS' || msg.code === 'ADDRESS_VALIDATED'
      );

      const messages = customerMessages.map(msg => msg.message);
      
      const result: {
        valid: boolean;
        messages: string[];
        suggested?: IAddress;
      } = {
        valid: isValid,
        messages
      };
      
      // If FedEx provides suggestion, format it back to our address interface
      if (validationResult.proposed && !isValid) {
        // Get streetLines array and join, or default to original address
        const streetLines = Array.isArray(validationResult.proposed.streetLines) 
          ? validationResult.proposed.streetLines.join(' ') 
          : address.address;
          
        result.suggested = {
          address: streetLines,
          city: validationResult.proposed.city || address.city,
          state: validationResult.proposed.stateOrProvinceCode || address.state,
          postalCode: validationResult.proposed.postalCode || address.postalCode,
          country: validationResult.proposed.countryCode || address.country
        };
      }
      
      return result;
    } catch (error) {
      console.error('Address validation error:', error);
      return { valid: false, messages: ['Address validation service error'] };
    }
  }

  /**
   * Generate a return label for a shipment with FedEx
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
      
      // This would be an actual implementation calling the FedEx API
      // For now, returning a mockup
      
      return {
        success: true,
        label: {
          format: 'PDF',
          size: '4x6',
          url: `https://api.fedex.com/labels/return/${shipmentId}`,
          data: 'base64_encoded_label_data' // This would be actual base64 data
        }
      };
    } catch (error) {
      console.error('Failed to create return label:', error);
      return { success: false };
    }
  }

  // Helper methods for formatting requests and responses

  /**
   * Format a rate request to FedEx API format
   * 
   * @param request Standard rate request
   */
  private formatRateRequest(request: IRateRequest): Record<string, unknown> {
    // Implementation would convert our standard rate request to FedEx's specific format
    // This is a simplified example - actual implementation would be more detailed
    return {
      accountNumber: {
        value: this.auth.accountNumber
      },
      requestedShipment: {
        shipper: {
          address: this.formatAddress(request.origin)
        },
        recipient: {
          address: this.formatAddress(request.destination)
        },
        pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
        rateRequestType: ['LIST', 'ACCOUNT'],
        requestedPackageLineItems: [{
          weight: {
            units: request.packageDetails.weightUnit.toUpperCase(),
            value: request.packageDetails.weight
          },
          dimensions: request.packageDetails.dimensions ? {
            length: request.packageDetails.dimensions.length,
            width: request.packageDetails.dimensions.width,
            height: request.packageDetails.dimensions.height,
            units: request.packageDetails.dimensions.unit.toUpperCase()
          } : undefined
        }]
      }
    };
  }

  /**
   * Format FedEx rate response to standard shipping rate format
   * 
   * @param rateDetails FedEx rate details
   * @param currency Currency code
   */
  private formatRateResponse(rateDetails: any[], currency: string): IShippingRate[] {
    // Implementation would convert FedEx's response to our standard rate format
    return rateDetails.map(rate => {
      const transitDays = rate.commit?.transitDays || 1;
      
      return {
        provider: this.name,
        serviceCode: rate.serviceType,
        serviceName: this.getFedExServiceName(rate.serviceType),
        price: rate.ratedShipmentDetails[0].totalNetFedExCharge,
        currency: rate.ratedShipmentDetails[0].currency || currency,
        estimatedDelivery: {
          min: transitDays,
          max: transitDays + 1
        }
      };
    });
  }

  /**
   * Format a shipment request to FedEx API format
   * 
   * @param request Standard shipment request
   */
  private formatShipmentRequest(request: IShipmentRequest): Record<string, unknown> {
    // Implementation would convert our standard shipment request to FedEx's specific format
    // This is a simplified example - actual implementation would be more detailed
    return {
      accountNumber: {
        value: this.auth.accountNumber
      },
      requestedShipment: {
        shipper: {
          address: this.formatAddress(request.shipment.origin)
        },
        recipient: {
          address: this.formatAddress(request.shipment.destination)
        },
        pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
        serviceType: request.serviceCode,
        packagingType: 'YOUR_PACKAGING',
        shippingChargesPayment: {
          paymentType: 'SENDER',
          payor: {
            responsibleParty: {
              accountNumber: {
                value: this.auth.accountNumber
              }
            }
          }
        },
        labelSpecification: {
          labelFormatType: 'COMMON2D',
          imageType: 'PDF',
          labelStockType: 'PAPER_4X6'
        },
        requestedPackageLineItems: [{
          weight: {
            units: request.shipment.packageDetails.weightUnit.toUpperCase(),
            value: request.shipment.packageDetails.weight
          },
          dimensions: {
            length: request.shipment.packageDetails.dimensions.length,
            width: request.shipment.packageDetails.dimensions.width,
            height: request.shipment.packageDetails.dimensions.height,
            units: request.shipment.packageDetails.dimensions.unit.toUpperCase()
          }
        }],
        customerReferences: [
          {
            customerReferenceType: 'CUSTOMER_REFERENCE',
            value: request.shipment.shipmentId || `ORDER-${Date.now()}`
          }
        ],
        // Add customs declarations if provided
        ...(request.customsDeclaration ? {
          customsClearanceDetail: {
            dutiesPayment: {
              paymentType: 'SENDER',
              payor: {
                responsibleParty: {
                  accountNumber: {
                    value: this.auth.accountNumber
                  }
                }
              }
            },
            commodities: request.customsDeclaration.items.map(item => ({
              description: item.description,
              weight: {
                units: 'KG',
                value: item.netWeight
              },
              quantity: item.quantity,
              quantityUnits: 'PCS',
              customsValue: {
                amount: item.unitValue * item.quantity,
                currency: request.customsDeclaration.currency
              },
              countryOfManufacture: item.originCountry,
              harmonizedCode: item.hsCode
            }))
          }
        } : {})
      }
    };
  }

  /**
   * Format FedEx shipment response to standard created shipment format
   * 
   * @param response FedEx shipment response
   */
  private formatShipmentResponse(response: Record<string, any>): ICreatedShipment {
    // Safely get nested properties with defaults
    const trackingNumber = response.masterTrackingNumber || '';
    const serviceType = response.serviceDetails?.serviceType || '';
    
    // Get price and currency with proper nullish coalescing
    const price = response.shipmentRating?.shipmentRateDetails?.[0]?.totalNetFedExCharge ?? 0;
    const currency = response.shipmentRating?.shipmentRateDetails?.[0]?.currency ?? 'USD';
    
    // Handle estimated delivery date safely
    let estimatedDelivery: Date | undefined = undefined;
    const deliveryDateStr = response.completedShipmentDetail?.operationalDetail?.deliveryDate;
    if (deliveryDateStr && typeof deliveryDateStr === 'string') {
      estimatedDelivery = new Date(deliveryDateStr);
    }
    
    // Handle labels safely
    const labels: Array<{
      format: string;
      size: string;
      url: string;
      data?: string;
    }> = [];
    
    if (response.completedShipmentDetail?.completedPackageDetails?.[0]?.label?.parts?.[0]?.content) {
      labels.push({
        format: 'PDF',
        size: '4x6',
        url: '',
        data: response.completedShipmentDetail.completedPackageDetails[0].label.parts[0].content
      });
    }
    
    // Handle documents safely
    const documents: Array<{
      type: string;
      format: string;
      url: string;
      data?: string;
    }> = [];
    
    const shipmentDocuments = response.completedShipmentDetail?.shipmentDocuments;
    if (Array.isArray(shipmentDocuments)) {
      shipmentDocuments.forEach(doc => {
        if (doc && doc.parts && doc.parts[0] && doc.parts[0].content) {
          documents.push({
            type: doc.type || 'unknown',
            format: 'PDF',
            url: '',
            data: doc.parts[0].content
          });
        }
      });
    }
    
    // Return the properly structured response
    return {
      success: true,
      shipmentId: trackingNumber,
      trackingNumber,
      carrier: this.name,
      service: serviceType,
      price,
      currency,
      estimatedDelivery,
      labels,
      documents
    };
  }

  /**
   * Format FedEx tracking response to standard tracking info format
   * 
   * @param trackResult FedEx tracking result
   */
  private formatTrackingResponse(trackResult: any): ITrackingInfo {
    // Implementation would convert FedEx's response to our standard tracking format
    return {
      trackingNumber: trackResult.trackingNumber || '',
      carrier: this.name,
      status: this.mapFedExStatusToGeneric(trackResult.latestStatusDetail?.code),
      estimatedDelivery: trackResult.estimatedDeliveryDetail?.estimatedDeliveryTimestamp ? 
                          new Date(trackResult.estimatedDeliveryDetail.estimatedDeliveryTimestamp) : 
                          undefined,
      events: trackResult.scanEvents ? trackResult.scanEvents.map((event: any) => ({
        timestamp: new Date(event.date),
        status: this.mapFedExStatusToGeneric(event.eventType),
        location: event.scanLocation ? `${event.scanLocation.city}, ${event.scanLocation.countryCode}` : '',
        description: event.eventDescription || ''
      })) : []
    };
  }

  /**
   * Map FedEx status codes to generic status names
   * 
   * @param fedexStatus FedEx status code
   */
  private mapFedExStatusToGeneric(fedexStatus?: string): string {
    if (!fedexStatus) return 'unknown';
    
    // Map FedEx-specific status codes to our generic statuses
    const statusMap: Record<string, string> = {
      'PU': 'picked_up',
      'OC': 'in_transit',
      'AR': 'in_transit',
      'DP': 'in_transit',
      'DL': 'delivered',
      'DE': 'delivered',
      'EX': 'exception',
      // Add more mappings as needed
    };
    
    return statusMap[fedexStatus] || fedexStatus;
  }

  /**
   * Get human-readable service name from FedEx service code
   * 
   * @param serviceCode FedEx service code
   */
  private getFedExServiceName(serviceCode: string): string {
    const service = this.supportedServices.find(s => s.code === serviceCode);
    return service ? service.name : serviceCode;
  }

  /**
   * Format address for FedEx API
   * 
   * @param address Standard address
   */
  protected formatAddress(address: IAddress): Record<string, unknown> {
    return {
      streetLines: [address.address],
      city: address.city,
      stateOrProvinceCode: address.state,
      postalCode: address.postalCode,
      countryCode: address.country
    };
  }

  /**
   * Handle API errors specifically for FedEx
   * 
   * @param error Error from FedEx API
   */
  protected handleApiError(error: unknown): never {
    // Log and transform FedEx-specific errors
    console.error('FedEx API error:', error);
    
    interface FedExError {
      code?: string;
      message: string;
    }
    
    interface AxiosErrorWithResponse {
      response?: {
        data?: {
          errors?: FedExError[];
        };
      };
    }
    
    // If it's an Axios error with a response from FedEx
    if (
      typeof error === 'object' && 
      error !== null && 
      'response' in error
    ) {
      const axiosError = error as AxiosErrorWithResponse;
      const fedexErrors = axiosError.response?.data?.errors;
      
      if (Array.isArray(fedexErrors) && fedexErrors.length > 0) {
        // Safely map errors to string messages
        const errorMessages = fedexErrors
          .map(e => e.message || 'Unknown error')
          .join('; ');
        
        throw new Error(`FedEx API error: ${errorMessages}`);
      }
    }
    
    // Fallback to generic error handling
    if (typeof error === 'object' && error !== null && 'message' in error) {
      throw new Error(`FedEx error: ${(error as Error).message}`);
    }
    
    throw new Error('Unknown FedEx error');
  }
}
