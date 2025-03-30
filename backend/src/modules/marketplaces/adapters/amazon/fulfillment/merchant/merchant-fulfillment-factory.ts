/**
 * Factory for creating Merchant Fulfillment API module
 */

import { MerchantFulfillmentModule } from './merchant-fulfillment';
import { ModuleRegistry } from '../../core/module-registry';
import { getDefaultModuleVersion } from '../../core/module-definitions';

/**
 * Factory for creating Merchant Fulfillment API module
 */
export class MerchantFulfillmentModuleFactory {
  /**
   * Create a Merchant Fulfillment module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createMerchantFulfillmentModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): MerchantFulfillmentModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('merchantFulfillment') || 'v0';
    
    // Create the module
    const module = new MerchantFulfillmentModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}