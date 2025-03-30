/**
 * Factory for creating Replenishment API module
 */

import { ReplenishmentModule } from './replenishment';
import { ModuleRegistry } from '../core/module-registry';
import { getDefaultModuleVersion } from '../core/module-definitions';

/**
 * Factory for creating Replenishment API module
 */
export class ReplenishmentModuleFactory {
  /**
   * Create a Replenishment module and register it with the provided registry
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   * @param registry Module registry to register with
   * @param apiVersion Optional API version (uses default if not provided)
   * @returns The created module
   */
  public static createReplenishmentModule(
    makeApiRequest: <T>(
      method: string,
      endpoint: string,
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string,
    registry: ModuleRegistry,
    apiVersion?: string
  ): ReplenishmentModule {
    // Use provided version or get the default
    const version = apiVersion || getDefaultModuleVersion('replenishment') || '2022-11-07';
    
    // Create the module
    const module = new ReplenishmentModule(
      version,
      makeApiRequest,
      marketplaceId
    );
    
    // Register the module
    registry.registerModule(module);
    
    return module;
  }
}