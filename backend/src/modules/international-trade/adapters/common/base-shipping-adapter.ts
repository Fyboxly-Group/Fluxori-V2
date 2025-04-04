import { 
  IShippingProvider, 
  IShippingProviderAuth, 
  IRateRequest, 
  IShippingRate, 
  IShipmentRequest, 
  ICreatedShipment, 
  ITrackingRequest, 
  ITrackingInfo 
} from '../../interfaces/shipping-provider.interface';
import { IAddress } from '../../models/international-trade.model';

/**
 * Abstract base class for shipping provider adapters
 * All shipping provider adapters should extend this class
 */
export abstract class BaseShippingAdapter implements IShippingProvider {
  protected auth: IShippingProviderAuth;
  public name: string;
  public supportedCountries: string[];
  public supportedServices: {
    code: string;
    name: string;
    description?: string;
    international: boolean;
    domestic: boolean;
  }[];
  protected isAuthenticated = false;
  protected apiUrl: string;

  /**
   * Constructor
   * 
   * @param auth Authentication credentials for the shipping provider
   * @param options Additional options for the shipping provider
   */
  constructor(auth: IShippingProviderAuth, options?: Record<string, unknown>) {
    this.auth = auth;
    this.name = 'Base Shipping Provider';
    this.supportedCountries = [];
    this.supportedServices = [];
    this.apiUrl = '';
  }

  /**
   * Authenticates with the shipping provider's API
   * This method should be overridden by specific provider implementations
   */
  public async authenticate(): Promise<boolean> {
    // This method should be implemented by child classes
    throw new Error('Method not implemented. Each provider must implement this method.');
  }

  /**
   * Validates credentials for the shipping provider
   * This method should be overridden by specific provider implementations
   */
  public async validateCredentials(): Promise<boolean> {
    try {
      return await this.authenticate();
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets shipping rates from the provider
   * This method should be overridden by specific provider implementations
   * 
   * @param request Rate request parameters
   */
  public async getRates(request: IRateRequest): Promise<IShippingRate[]> {
    // This method should be implemented by child classes
    throw new Error('Method not implemented. Each provider must implement this method.');
  }

  /**
   * Creates a new shipment with the provider
   * This method should be overridden by specific provider implementations
   * 
   * @param request Shipment request parameters
   */
  public async createShipment(request: IShipmentRequest): Promise<ICreatedShipment> {
    // This method should be implemented by child classes
    throw new Error('Method not implemented. Each provider must implement this method.');
  }

  /**
   * Gets tracking information for a shipment
   * This method should be overridden by specific provider implementations
   * 
   * @param request Tracking request parameters
   */
  public async getTracking(request: ITrackingRequest): Promise<ITrackingInfo> {
    // This method should be implemented by child classes
    throw new Error('Method not implemented. Each provider must implement this method.');
  }

  /**
   * Cancels a shipment
   * This method should be overridden by specific provider implementations
   * 
   * @param shipmentId ID of the shipment to cancel
   */
  public async cancelShipment(shipmentId: string): Promise<boolean> {
    // This method should be implemented by child classes
    throw new Error('Method not implemented. Each provider must implement this method.');
  }

  /**
   * Validates an address with the provider
   * This method should be overridden by specific provider implementations
   * 
   * @param address Address to validate
   */
  public async validateAddress(address: IAddress): Promise<{
    valid: boolean;
    suggested?: IAddress;
    messages?: string[];
  }> {
    // This method should be implemented by child classes
    throw new Error('Method not implemented. Each provider must implement this method.');
  }

  /**
   * Generates a return label for a shipment
   * This method should be overridden by specific provider implementations
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
    // This method should be implemented by child classes
    throw new Error('Method not implemented. Each provider must implement this method.');
  }

  /**
   * Helper method to ensure the adapter is authenticated before making API calls
   */
  protected async ensureAuthenticated(): Promise<void> {
    if (!this.isAuthenticated) {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('Authentication failed');
      }
    }
  }

  /**
   * Helper method to format addresses to the provider's required format
   * This method should be overridden by specific provider implementations
   * 
   * @param address Address to format
   */
  protected formatAddress(address: IAddress): Record<string, unknown> {
    // This is a base implementation - child classes should override this
    return {
      address: address.address,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country
    };
  }

  /**
   * Helper method to handle API errors
   * 
   * @param error Error from the API
   */
  protected handleApiError(error: unknown): never {
    // Log the error
    console.error('Shipping provider API error:', error);

    if (typeof error === 'object' && error !== null && 'message' in error) {
      throw new Error(`Shipping provider error: ${(error as Error).message}`);
    }

    throw new Error('Unknown shipping provider error');
  }
}
