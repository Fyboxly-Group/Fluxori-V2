/**
 * Factory for creating product fees-related API modules
 */

import { ProductFeesModule } from './product-fees';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/module-definitions';

/**
 * Factory for creating product fees-related API modules
 */
export class ProductFeesModuleFactory {
  /**
   * Create a Product Fees module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createProductFeesModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): ProductFeesModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('productFees') || 'v0';
    
    // Create the module
    const module = new ProductFeesModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}