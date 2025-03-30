/**
 * Factory for creating fulfillment inbound-related API modules
 */

import { FulfillmentInboundModule } from './fulfillment-inbound';
import { ModuleRegistry } from '../../core/module-registry';
import { getDefaultModuleVersion } from '../../core/module-definitions';

/**
 * Factory for creating fulfillment inbound-related API modules
 */
export class FulfillmentInboundModuleFactory {
  /**
   * Create a Fulfillment Inbound module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createFulfillmentInboundModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): FulfillmentInboundModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('fulfillmentInbound') || '2020-09-01';
    
    // Create the module
    const module = new FulfillmentInboundModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}