/**
 * Factory for creating Vendors API module
 */

import { VendorsModule } from './vendors';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/module-definitions';

/**
 * Factory for creating Vendors API module
 */
export class VendorsModuleFactory {
  /**
   * Create a Vendors module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createVendorsModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): VendorsModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('vendors') || 'v1';
    
    // Create the module
    const module = new VendorsModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}