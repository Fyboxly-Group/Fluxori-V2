/**
 * Factory for creating Listings Restrictions API module
 */

import { ListingsRestrictionsModule } from './listings-restrictions';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/module-definitions';

/**
 * Factory for creating Listings Restrictions API module
 */
export class RestrictionsModuleFactory {
  /**
   * Create a Listings Restrictions module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createListingsRestrictionsModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): ListingsRestrictionsModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('listingsRestrictions') || '2021-08-01';
    
    // Create the module
    const module = new ListingsRestrictionsModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}