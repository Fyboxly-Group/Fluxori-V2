/**
 * Factory for creating fulfillment outbound-related API modules
 */

import { FulfillmentOutboundModule } from './fulfillment-outbound';
import { ModuleRegistry } from '../../core/module-registry';
import { getDefaultModuleVersion } from '../../core/module-definitions';

/**
 * Factory for creating fulfillment outbound-related API modules
 */
export class FulfillmentOutboundModuleFactory {
  /**
   * Create a Fulfillment Outbound module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createFulfillmentOutboundModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): FulfillmentOutboundModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('fulfillmentOutbound') || '2020-07-01';
    
    // Create the module
    const module = new FulfillmentOutboundModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}