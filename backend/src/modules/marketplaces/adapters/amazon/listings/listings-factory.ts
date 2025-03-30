/**
 * Factory for creating listings-related API modules
 */

import { ListingsModule } from './listings';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/module-definitions';

/**
 * Factory for creating listings-related API modules
 */
export class ListingsModuleFactory {
  /**
   * Create a Listings module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createListingsModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): ListingsModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('listingsItems') || '2021-08-01';
    
    // Create the module
    const module = new ListingsModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}