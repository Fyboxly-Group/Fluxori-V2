/**
 * Factory for creating FBA inventory-related API modules
 */

import { FbaInventoryModule } from './fba-inventory';
import { ModuleRegistry } from '../../core/module-registry';
import { getDefaultModuleVersion } from '../../core/module-definitions';

/**
 * Factory for creating FBA inventory-related API modules
 */
export class FbaInventoryModuleFactory {
  /**
   * Create an FBA Inventory module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createFbaInventoryModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): FbaInventoryModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('fbaInventory') || '2022-05-01';
    
    // Create the module
    const module = new FbaInventoryModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}