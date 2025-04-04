import mongoose, { Types } from 'mongoose';
import { IInternationalShipment, IAddress } from '../models/international-trade.model';
import { InternationalShipment, CustomsDeclaration } from '../models/international-trade.model';
import { 
  IShippingProvider, 
  IRateRequest,
  ITrackingRequest,
  ITrackingInfo,
  IShippingProviderAuth,
  IShippingRate,
  IShipmentRequest,
  ICreatedShipment
} from '../interfaces/shipping-provider.interface';
import { DHL_CONFIG, FEDEX_CONFIG } from '../config/trade-providers.config';
import { DHLAdapter } from '../adapters/dhl/dhl.adapter';
import { FedExAdapter } from '../adapters/fedex/fedex.adapter';

/**
 * Error class for shipping rate issues
 */
export class ShippingRateError extends Error {
  constructor(
    public readonly message: string, 
    public readonly code: string = 'SHIPPING_RATE_ERROR',
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'ShippingRateError';
    
    // This is needed for proper instanceof checks with custom Error subclasses
    Object.setPrototypeOf(this, ShippingRateError.prototype);
  }
}

// Re-export the IShippingRate interface for use in other services
export { IShippingRate };

/**
 * Interface for carrier configuration
 */
export interface ICarrierConfig {
  name: string;
  enabled: boolean;
  credentials: IShippingProviderAuth;
  options?: Record<string, unknown>;
}

/**
 * Interface for rate request parameters
 */
export interface IRateRequestParams {
  shipmentId?: string;
  carrier?: string;
  service?: string;
  urgency?: 'economy' | 'standard' | 'express';
  options?: {
    insurance?: boolean;
    signature?: boolean;
    saturdayDelivery?: boolean;
    dangerousGoods?: boolean;
    [key: string]: boolean | number | string | undefined;
  };
}

/**
 * Shipping urgency levels for filtering services
 */
export type ShippingUrgency = 'economy' | 'standard' | 'express';

/**
 * Carrier service mapping for urgency levels
 */
export interface IServiceUrgencyMap {
  [serviceCode: string]: ShippingUrgency;
}

/**
 * Shipping Rate Service for international trade
 * Fetches shipping rates from multiple carriers
 */
export class ShippingRateService {
  private carriers: ICarrierConfig[] = [
    {
      name: 'DHL',
      enabled: true,
      credentials: {
        apiKey: process.env.DHL_API_KEY || 'test_api_key',
        accountNumber: process.env.DHL_ACCOUNT_NUMBER || 'test_account'
      },
      options: {
        testMode: process.env.NODE_ENV !== 'production'
      }
    },
    {
      name: 'FedEx',
      enabled: true,
      credentials: {
        apiKey: process.env.FEDEX_API_KEY || 'test_api_key',
        apiSecret: process.env.FEDEX_API_SECRET || 'test_secret',
        accountNumber: process.env.FEDEX_ACCOUNT_NUMBER || 'test_account'
      },
      options: {
        testMode: process.env.NODE_ENV !== 'production'
      }
    }
  ];

  /**
   * Service to urgency mapping for filtering rates by speed
   */
  private serviceUrgencyMap: IServiceUrgencyMap = {
    // DHL services
    'EXPRESS_WORLDWIDE': 'express',
    'EXPRESS_12': 'express',
    'EXPRESS_9': 'express',
    'EXPRESS_DOMESTIC': 'express',
    'ECONOMY_SELECT': 'economy',
    'EXPRESS_EASY': 'standard',
    
    // FedEx services
    'PRIORITY_OVERNIGHT': 'express',
    'STANDARD_OVERNIGHT': 'express',
    'INTERNATIONAL_PRIORITY': 'express',
    'INTERNATIONAL_ECONOMY': 'economy',
    'FEDEX_GROUND': 'standard',
    'FEDEX_EXPRESS_SAVER': 'standard',
    'GROUND_HOME_DELIVERY': 'economy'
  };

  // Using the ShippingRateError class defined at the module level

  /**
   * Fetches shipping rates for a shipment from all enabled carriers
   * 
   * @param shipmentId ID of the shipment
   * @param params Additional parameters for rate request
   * @returns Array of shipping rates from various carriers
   * @throws {ShippingRateError} When shipment ID is invalid or shipment is not found
   * @throws {Error} For unexpected errors
   */
  public async getShippingRates(shipmentId: string, params?: IRateRequestParams): Promise<IShippingRate[]> {
    try {
      // Validate shipment ID
      if (!shipmentId || !mongoose.Types.ObjectId.isValid(shipmentId)) {
        throw new ShippingRateError('Invalid shipment ID', 'INVALID_SHIPMENT_ID');
      }

      // Retrieve shipment data
      const shipment = await InternationalShipment.findById(shipmentId);
      if (!shipment) {
        throw new ShippingRateError(`Shipment with ID ${shipmentId} not found`, 'SHIPMENT_NOT_FOUND');
      }

      // Create rate request from shipment data
      const rateRequest = this.createRateRequest(shipment, params);

      // Validate shipment has required data for rate request
      if (!rateRequest.origin || !rateRequest.destination || !rateRequest.packageDetails) {
        throw new ShippingRateError('Shipment is missing required information for rate request', 'MISSING_SHIPMENT_DATA');
      }

      // Get carriers to use
      const enabledCarriers = this.carriers.filter(c => c.enabled);
      
      // Check if we have any enabled carriers
      if (enabledCarriers.length === 0) {
        throw new ShippingRateError('No shipping carriers are enabled', 'NO_CARRIERS_ENABLED');
      }

      // If a specific carrier is requested, check if it's enabled
      if (params?.carrier) {
        const carrierExists = enabledCarriers.some(c => 
          c.name.toLowerCase() === params.carrier?.toLowerCase()
        );

        if (!carrierExists) {
          throw new ShippingRateError(`Requested carrier "${params.carrier}" is not available or enabled`, 'CARRIER_NOT_AVAILABLE');
        }
      }

      // Get rates from all enabled carriers (or the specific one requested)
      const carrierPromises = enabledCarriers.map(carrier => 
        this.getRatesFromCarrier(carrier, rateRequest, params?.carrier)
      );

      // Wait for all carrier rate requests to complete
      const carrierResults = await Promise.allSettled(carrierPromises);
      
      // Aggregate results from successful carrier rate requests
      const rates: IShippingRate[] = [];
      carrierResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          rates.push(...result.value);
        } else {
          const errorMessage = result.reason instanceof Error ? result.reason.message : String(result.reason);
          console.error(`Error getting rates from ${enabledCarriers[index].name}: ${errorMessage}`);
        }
      });

      // Check if we got any rates
      if (rates.length === 0) {
        // If a specific service was requested and we have no rates, it might be unavailable
        if (params?.service) {
          throw new ShippingRateError(`No rates available for requested service "${params.service}"`, 'SERVICE_NOT_AVAILABLE');
        }
        
        // If a specific urgency was requested and we have no rates, it might be unavailable
        if (params?.urgency) {
          throw new ShippingRateError(`No rates available with urgency level "${params.urgency}"`, 'URGENCY_NOT_AVAILABLE');
        }
        
        // Otherwise, we just don't have any rates
        throw new ShippingRateError('No shipping rates available for this shipment', 'NO_RATES_AVAILABLE');
      }

      // Filter by service if specified
      if (params?.service) {
        const filteredRates = rates.filter(rate => rate.serviceCode === params.service);
        if (filteredRates.length === 0) {
          throw new ShippingRateError(`No rates available for requested service "${params.service}"`, 'SERVICE_NOT_AVAILABLE');
        }
        return filteredRates;
      }

      // Filter by urgency if specified
      if (params?.urgency) {
        const filteredRates = this.filterRatesByUrgency(rates, params.urgency);
        if (filteredRates.length === 0) {
          throw new ShippingRateError(`No rates available with urgency level "${params.urgency}"`, 'URGENCY_NOT_AVAILABLE');
        }
        return filteredRates;
      }

      // Sort rates by price
      return rates.sort((a, b) => a.price - b.price);
    } catch (error) {
      // Re-throw ShippingRateError instances directly
      if (error instanceof ShippingRateError) {
        throw error;
      }
      
      // Log and wrap other errors
      console.error('Error getting shipping rates:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ShippingRateError(`Failed to get shipping rates: ${errorMessage}`, 'RATE_FETCH_ERROR');
    }
  }

  /**
   * Get rates from a specific carrier
   * 
   * @param carrierConfig Carrier configuration
   * @param rateRequest Rate request parameters
   * @param specificCarrier Optional specific carrier to get rates from
   * @returns Array of shipping rates from the carrier
   */
  private async getRatesFromCarrier(
    carrierConfig: ICarrierConfig, 
    rateRequest: IRateRequest,
    specificCarrier?: string
  ): Promise<IShippingRate[]> {
    // If specificCarrier is provided, only get rates from that carrier
    if (specificCarrier && carrierConfig.name.toLowerCase() !== specificCarrier.toLowerCase()) {
      return [];
    }

    try {
      // Get appropriate adapter for the carrier
      const adapter = this.getCarrierAdapter(carrierConfig);
      
      // Authenticate the adapter
      const authenticated = await adapter.authenticate();
      if (!authenticated) {
        throw new Error(`Failed to authenticate with ${carrierConfig.name}`);
      }
      
      // Get rates from the carrier
      const rates = await adapter.getRates(rateRequest);
      
      // Validate rates
      if (!Array.isArray(rates)) {
        throw new Error(`Invalid response from ${carrierConfig.name}: Expected an array of rates`);
      }
      
      // Ensure all rates have the required properties
      return rates.filter(rate => {
        if (!rate.serviceCode || !rate.serviceName || typeof rate.price !== 'number') {
          console.warn(`Skipping invalid rate from ${carrierConfig.name}:`, rate);
          return false;
        }
        return true;
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error getting rates from ${carrierConfig.name}: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Create a rate request object from shipment data
   * 
   * @param shipment Shipment data
   * @param params Additional parameters for rate request
   * @returns Rate request object
   */
  private createRateRequest(shipment: IInternationalShipment, params?: IRateRequestParams): IRateRequest {
    return {
      origin: shipment.origin,
      destination: shipment.destination,
      packageDetails: {
        weight: shipment.packageDetails.weight,
        weightUnit: shipment.packageDetails.weightUnit,
        dimensions: shipment.packageDetails.dimensions ? {
          length: shipment.packageDetails.dimensions.length,
          width: shipment.packageDetails.dimensions.width,
          height: shipment.packageDetails.dimensions.height,
          unit: shipment.packageDetails.dimensions.unit
        } : undefined
      },
      items: shipment.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        value: item.value,
        hsCode: item.hsCode,
        originCountry: item.originCountry
      })),
      options: {
        insurance: params?.options?.insurance ? {
          required: true,
          value: shipment.items.reduce((sum, item) => sum + (item.value * item.quantity), 0)
        } : undefined,
        signature: params?.options?.signature,
        saturdayDelivery: params?.options?.saturdayDelivery,
        dangerousGoods: params?.options?.dangerousGoods
      },
      shipmentDate: new Date(),
      currency: 'USD' // Default currency - could be configurable
    };
  }

  /**
   * Filter rates by urgency level
   * 
   * @param rates Array of shipping rates
   * @param urgency Urgency level
   * @returns Filtered array of shipping rates
   */
  private filterRatesByUrgency(rates: IShippingRate[], urgency: ShippingUrgency): IShippingRate[] {
    return rates.filter(rate => 
      this.serviceUrgencyMap[rate.serviceCode] === urgency
    );
  }

  /**
   * Get the appropriate carrier adapter
   * 
   * @param carrierConfig Carrier configuration
   * @returns Shipping provider adapter
   */
  private getCarrierAdapter(carrierConfig: ICarrierConfig): IShippingProvider {
    const carrierName = carrierConfig.name.toLowerCase();
    
    if (carrierName === 'dhl') {
      return new DHLAdapter(carrierConfig.credentials, carrierConfig.options);
    } 
    else if (carrierName === 'fedex') {
      return new FedExAdapter(carrierConfig.credentials, carrierConfig.options);
    }
    
    // Fallback to a mock adapter if the carrier is not supported
    const mockAdapter: IShippingProvider = {
      name: carrierConfig.name,
      supportedCountries: [],
      supportedServices: [],
      
      authenticate: async (): Promise<boolean> => true,
      validateCredentials: async (): Promise<boolean> => true,
      getRates: async (): Promise<IShippingRate[]> => [],
      createShipment: async (request: IShipmentRequest): Promise<ICreatedShipment> => ({
        success: false,
        shipmentId: '',
        trackingNumber: '',
        carrier: carrierConfig.name,
        service: '',
        price: 0,
        currency: 'USD'
      }),
      getTracking: async (request: ITrackingRequest): Promise<ITrackingInfo> => ({
        trackingNumber: request.trackingNumber || '',
        carrier: carrierConfig.name,
        status: 'pending',
        events: []
      }),
      cancelShipment: async (shipmentId: string): Promise<boolean> => false,
      validateAddress: async (address: IAddress): Promise<{
        valid: boolean;
        suggested?: IAddress;
        messages?: string[];
      }> => ({ 
        valid: false,
        messages: ['Mock validation not supported']
      }),
      createReturnLabel: async (shipmentId: string): Promise<{
        success: boolean;
        label?: {
          format: string;
          size: string;
          url: string;
          data?: string;
        };
      }> => ({ 
        success: false 
      })
    };
    
    return mockAdapter;
  }

  /**
   * Get a list of supported carriers
   * 
   * @returns Array of supported carriers with their enabled status
   */
  public getCarriers(): Array<{ name: string; enabled: boolean }> {
    return this.carriers.map(carrier => ({
      name: carrier.name,
      enabled: carrier.enabled
    }));
  }

  /**
   * Enable a carrier
   * 
   * @param carrierName Name of the carrier to enable
   * @returns True if successful, false if carrier not found
   */
  public enableCarrier(carrierName: string): boolean {
    const carrier = this.carriers.find(c => 
      c.name.toLowerCase() === carrierName.toLowerCase()
    );
    
    if (carrier) {
      carrier.enabled = true;
      return true;
    }
    
    return false;
  }

  /**
   * Disable a carrier
   * 
   * @param carrierName Name of the carrier to disable
   * @returns True if successful, false if carrier not found
   */
  public disableCarrier(carrierName: string): boolean {
    const carrier = this.carriers.find(c => 
      c.name.toLowerCase() === carrierName.toLowerCase()
    );
    
    if (carrier) {
      carrier.enabled = false;
      return true;
    }
    
    return false;
  }

  /**
   * Get tracking information for a shipment
   * 
   * @param trackingNumber Tracking number of the shipment
   * @param carrier Optional carrier name
   * @returns Tracking information for the shipment
   * @throws {ShippingRateError} When tracking number is invalid or not found
   */
  public async getTrackingInfo(trackingNumber: string, carrier?: string): Promise<ITrackingInfo> {
    try {
      // Validate tracking number
      if (!trackingNumber || typeof trackingNumber !== 'string' || trackingNumber.trim() === '') {
        throw new ShippingRateError('Valid tracking number is required', 'INVALID_TRACKING_NUMBER');
      }

      const trackingRequest: ITrackingRequest = {
        trackingNumber,
        carrier
      };

      // If carrier is specified, only check that carrier
      if (carrier) {
        // Find the specified carrier
        const carrierConfig = this.carriers.find(c => 
          c.name.toLowerCase() === carrier.toLowerCase() && c.enabled
        );

        // Ensure carrier exists and is enabled
        if (!carrierConfig) {
          throw new ShippingRateError(
            `Carrier "${carrier}" not found or disabled`, 
            'CARRIER_NOT_AVAILABLE'
          );
        }

        try {
          // Get and authenticate the adapter
          const adapter = this.getCarrierAdapter(carrierConfig);
          const authenticated = await adapter.authenticate();
          
          if (!authenticated) {
            throw new ShippingRateError(
              `Failed to authenticate with ${carrierConfig.name}`, 
              'AUTHENTICATION_FAILED'
            );
          }
          
          // Get tracking information
          const trackingInfo = await adapter.getTracking(trackingRequest);
          
          // Validate the response has necessary fields
          if (!trackingInfo.trackingNumber || !trackingInfo.status) {
            throw new ShippingRateError(
              `Invalid tracking response from ${carrierConfig.name}`, 
              'INVALID_TRACKING_RESPONSE'
            );
          }
          
          return trackingInfo;
        } catch (error) {
          // If it's already a ShippingRateError, rethrow it
          if (error instanceof ShippingRateError) {
            throw error;
          }
          
          // Otherwise, wrap the error
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new ShippingRateError(
            `Error getting tracking info from ${carrierConfig.name}: ${errorMessage}`,
            'TRACKING_FETCH_ERROR'
          );
        }
      }

      // Check all enabled carriers
      const enabledCarriers = this.carriers.filter(c => c.enabled);
      
      if (enabledCarriers.length === 0) {
        throw new ShippingRateError('No shipping carriers are enabled', 'NO_CARRIERS_ENABLED');
      }

      // Track errors for better feedback if all carriers fail
      const errors: string[] = [];
      
      // Try each carrier until we find tracking information
      for (const carrierConfig of enabledCarriers) {
        try {
          // Get and authenticate the adapter
          const adapter = this.getCarrierAdapter(carrierConfig);
          const authenticated = await adapter.authenticate();
          
          if (!authenticated) {
            errors.push(`Failed to authenticate with ${carrierConfig.name}`);
            continue;
          }
          
          // Get tracking information
          const trackingInfo = await adapter.getTracking(trackingRequest);
          
          // Validate the response has necessary fields
          if (!trackingInfo.trackingNumber || !trackingInfo.status) {
            errors.push(`Invalid tracking response from ${carrierConfig.name}`);
            continue;
          }
          
          return trackingInfo;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push(`${carrierConfig.name}: ${errorMessage}`);
          console.log(`No tracking info found with ${carrierConfig.name}: ${errorMessage}`);
          // Continue to next carrier
        }
      }

      // If we get here, no carrier could find the tracking information
      throw new ShippingRateError(
        `No tracking information found for ${trackingNumber}. Errors: ${errors.join('; ')}`,
        'TRACKING_NOT_FOUND'
      );
    } catch (error) {
      // Re-throw ShippingRateError instances directly
      if (error instanceof ShippingRateError) {
        throw error;
      }
      
      // Log and wrap other errors
      console.error('Error getting tracking information:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ShippingRateError(
        `Failed to get tracking information: ${errorMessage}`,
        'TRACKING_ERROR'
      );
    }
  }

  /**
   * Validate an address with a carrier
   * 
   * @param address Address to validate
   * @param carrier Optional carrier to use for validation
   * @returns Validation result with valid status, optional suggested address, and messages
   * @throws {ShippingRateError} When address is invalid or carrier is not available
   */
  public async validateAddress(address: IAddress, carrier?: string): Promise<{
    valid: boolean;
    suggested?: IAddress;
    messages?: string[];
  }> {
    try {
      // Validate address object
      if (!address) {
        throw new ShippingRateError('Address is required', 'ADDRESS_REQUIRED');
      }
      
      // Check that address has required fields
      if (!address.address || !address.city || !address.country || !address.postalCode) {
        throw new ShippingRateError(
          'Address must include street address, city, postal code, and country',
          'INCOMPLETE_ADDRESS'
        );
      }

      // If carrier is specified, only use that carrier
      if (carrier) {
        // Find the specified carrier
        const carrierConfig = this.carriers.find(c => 
          c.name.toLowerCase() === carrier.toLowerCase() && c.enabled
        );

        // Ensure carrier exists and is enabled
        if (!carrierConfig) {
          throw new ShippingRateError(
            `Carrier "${carrier}" not found or disabled`, 
            'CARRIER_NOT_AVAILABLE'
          );
        }

        try {
          // Get and authenticate the adapter
          const adapter = this.getCarrierAdapter(carrierConfig);
          const authenticated = await adapter.authenticate();
          
          if (!authenticated) {
            throw new ShippingRateError(
              `Failed to authenticate with ${carrierConfig.name}`, 
              'AUTHENTICATION_FAILED'
            );
          }
          
          // Validate the address
          const validationResult = await adapter.validateAddress(address);
          
          // Normalize the result to ensure consistent structure
          return {
            valid: !!validationResult.valid,
            suggested: validationResult.suggested,
            messages: Array.isArray(validationResult.messages) ? validationResult.messages : 
              validationResult.messages ? [validationResult.messages] : []
          };
        } catch (error) {
          // If it's already a ShippingRateError, rethrow it
          if (error instanceof ShippingRateError) {
            throw error;
          }
          
          // Otherwise, wrap the error
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new ShippingRateError(
            `Error validating address with ${carrierConfig.name}: ${errorMessage}`,
            'ADDRESS_VALIDATION_ERROR'
          );
        }
      }

      // Otherwise, use the first enabled carrier
      const enabledCarriers = this.carriers.filter(c => c.enabled);
      
      if (enabledCarriers.length === 0) {
        throw new ShippingRateError(
          'No carriers enabled for address validation',
          'NO_CARRIERS_ENABLED'
        );
      }

      try {
        // Get and authenticate the adapter
        const carrierConfig = enabledCarriers[0];
        const adapter = this.getCarrierAdapter(carrierConfig);
        const authenticated = await adapter.authenticate();
        
        if (!authenticated) {
          throw new ShippingRateError(
            `Failed to authenticate with ${carrierConfig.name}`, 
            'AUTHENTICATION_FAILED'
          );
        }
        
        // Validate the address
        const validationResult = await adapter.validateAddress(address);
        
        // Normalize the result to ensure consistent structure
        return {
          valid: !!validationResult.valid,
          suggested: validationResult.suggested,
          messages: Array.isArray(validationResult.messages) ? validationResult.messages : 
            validationResult.messages ? [validationResult.messages] : []
        };
      } catch (error) {
        // If it's already a ShippingRateError, rethrow it
        if (error instanceof ShippingRateError) {
          throw error;
        }
        
        // Otherwise, wrap the error
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new ShippingRateError(
          `Error validating address with default carrier: ${errorMessage}`,
          'ADDRESS_VALIDATION_ERROR'
        );
      }
    } catch (error) {
      // Re-throw ShippingRateError instances directly
      if (error instanceof ShippingRateError) {
        throw error;
      }
      
      // Log and wrap other errors
      console.error('Error validating address:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ShippingRateError(
        `Failed to validate address: ${errorMessage}`,
        'ADDRESS_VALIDATION_ERROR'
      );
    }
  }
}
